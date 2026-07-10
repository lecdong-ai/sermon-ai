import { NextRequest, NextResponse } from 'next/server'
import { projectSupabaseAdmin } from '@/lib/school/project/supabase'
import { getUserFromRequest } from '@/lib/school/project/auth'
import { validateFile, parseFile } from '@/lib/school/parsers'
import { generateAll, generateSingleItem } from '@/lib/school/workspace/openai'
import { checkOpenAIRateLimit } from '@/lib/school/project/auth'
import type { GenerationItem } from '@/types/school/workspace'

function titleFromFileName(fileName: string): string {
  const name = fileName.replace(/\.[^.]+$/, '')
  return name
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim() || '제목 없음'
}

async function retryableUpdate(table: string, updates: any, eqField: string, eqValue: string, retries = 3): Promise<{ error: any }> {
  for (let i = 0; i < retries; i++) {
    const { error } = await projectSupabaseAdmin.from(table).update(updates).eq(eqField, eqValue)
    if (!error) return { error: null }
    console.warn(`[retry ${i + 1}/${retries}] Update failed:`, error?.message)
    if (i < retries - 1) await new Promise((r) => setTimeout(r, 1000 * (i + 1)))
  }
  return { error: '모든 재시도 실패' }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ success: false, error: '파일이 없습니다.' }, { status: 400 })
    }

    const validation = validateFile(file)
    if (validation) {
      return NextResponse.json(
        { success: false, error: validation.error, warning: validation.warning },
        { status: 400 },
      )
    }

    // 1. 텍스트 추출
    const parsed = await parseFile(file)

    // 2. 현재 사용자 확인 (로그인 필수)
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 },
      )
    }
    const userId = user.id

    // Rate limit: OpenAI 호출 비용 폭탄 방지
    const rateLimitResponse = checkOpenAIRateLimit(request, userId)
    if (rateLimitResponse) return rateLimitResponse

    // 3. Supabase에 저장 (raw_text + file_name + source='upload')
    const { data: sermon, error: insertError } = await projectSupabaseAdmin
      .from('sermons')
      .insert({
        file_name: parsed.fileName,
        raw_text: parsed.text,
        title: titleFromFileName(parsed.fileName),
        user_id: userId,
        source: 'upload',
      })
      .select()
      .single()

    if (insertError || !sermon) {
      console.error('Supabase insert error:', insertError)
      return NextResponse.json(
        { success: false, error: `저장 오류: ${insertError?.message || '알 수 없는 오류'}` },
        { status: 500 },
      )
    }

    const sermonId = sermon.id

    // 4. OpenAI 분석 (4개 탭 병렬 생성)
    let result
    try {
      result = await generateAll(parsed.text)
    } catch (err: any) {
      console.error('AI generation error:', err)
      await projectSupabaseAdmin.from('sermons').delete().eq('id', sermonId)
      return NextResponse.json({
        success: false,
        error: err.message || 'AI 생성 중 오류가 발생했습니다.',
      })
    }

    // 5. 결과 업데이트 (재시도 포함)
    const updates: Record<string, any> = { result }

    if (result.sermon_title) {
      updates.title = result.sermon_title
    }
    if (result.sermon_passage) {
      updates.passage = result.sermon_passage
    }

    const { error: updateError } = await retryableUpdate('sermons', updates, 'id', sermonId)
    if (updateError) {
      console.error('Supabase update error after retries:', updateError)
    }

    return NextResponse.json({
      success: true,
      sermonId,
      preview: parsed.text.substring(0, 2000),
      fullText: parsed.text,
    })
  } catch (err: any) {
    console.error('Upload error:', err)
    return NextResponse.json(
      { success: false, error: err.message || '파일 처리 중 오류가 발생했습니다.' },
      { status: 500 },
    )
  }
}

// 단일 항목 재생성 API (progressive generation)
export async function PUT(request: NextRequest) {
  try {
    const { sermonId, text, item, idempotency_key } = await request.json()

    if (!sermonId || !text || !item) {
      return NextResponse.json({ success: false, error: '필수 파라미터가 누락되었습니다.' }, { status: 400 })
    }

    if (!idempotency_key) {
      return NextResponse.json({ success: false, error: 'idempotency_key가 필요합니다.' }, { status: 400 })
    }

    // 인증
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 })
    }

    // 소유권 확인
    const { data: ownerCheck } = await projectSupabaseAdmin
      .from('sermons')
      .select('user_id')
      .eq('id', sermonId)
      .single()
    if (!ownerCheck || ownerCheck.user_id !== user.id) {
      return NextResponse.json({ success: false, error: '접근 권한이 없습니다.' }, { status: 403 })
    }

    // 단일 항목 생성
    const genResult = await generateSingleItem(text, item as GenerationItem)

    // 기존 결과와 병합
    const { data: existing } = await projectSupabaseAdmin
      .from('sermons')
      .select('result')
      .eq('id', sermonId)
      .single()

    const existingResult = (existing?.result as any) || {}
    const merged = { ...existingResult, ...genResult }

    // title/passage이 summary에서 추출된 경우 함께 업데이트
    const updates: Record<string, any> = { result: merged }
    if (genResult.sermon_title) {
      updates.title = genResult.sermon_title
    }
    if (genResult.sermon_passage) {
      updates.passage = genResult.sermon_passage
    }

    await retryableUpdate('sermons', updates, 'id', sermonId)

    return NextResponse.json({
      success: true,
      ...genResult,
    })
  } catch (err: any) {
    console.error('Regenerate error:', err)
    return NextResponse.json(
      { success: false, error: err.message || '재생성 중 오류가 발생했습니다.' },
      { status: 500 },
    )
  }
}
