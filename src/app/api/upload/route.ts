import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { supabaseAdmin } from '@/lib/supabase'
import { validateFile, parseFile } from '@/lib/parsers'
import { generateAll } from '@/lib/openai'
import { getMockResult } from '@/lib/mock'
import { checkUsage, consumeUsage } from '@/lib/usage'
import { generateWithDeduction } from '@/lib/generation'

function getSupabaseAdmin(request: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value),
          )
        },
      },
    },
  )
}

function getUserFromRequest(request: NextRequest) {
  const sb = getSupabaseAdmin(request)
  return sb.auth.getUser().then((r) => r.data.user)
}

async function retryableUpdate(table: string, updates: any, eqField: string, eqValue: string, retries = 3): Promise<{ error: any }> {
  for (let i = 0; i < retries; i++) {
    const { error } = await supabaseAdmin.from(table).update(updates).eq(eqField, eqValue)
    if (!error) return { error: null }
    console.warn(`[retry ${i + 1}/${retries}] Update failed:`, error?.message)
    if (i < retries - 1) await new Promise((r) => setTimeout(r, 1000 * (i + 1)))
  }
  return { error: '모든 재시도 실패' }
}

function titleFromFileName(fileName: string): string {
  const name = fileName.replace(/\.[^.]+$/, '')
  return name
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim() || '제목 없음'
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

    // 3. 사용량 체크
    const usageInfo = await checkUsage(userId)
    if (!usageInfo.can_generate) {
      const errorMsg = usageInfo.block_reason === 'trial_expired' ? '무료체험 기간이 만료되었습니다.' :
        usageInfo.block_reason === 'trial_exhausted' ? '무료 분석 횟수를 모두 사용했습니다.' :
        '사용 한도를 초과했습니다.'
      return NextResponse.json({
        success: false,
        error: errorMsg,
        usage_limit: true,
        block_reason: usageInfo.block_reason,
      }, { status: 403 })
    }

    // 4. Supabase에 저장
    const { data: sermon, error: insertError } = await supabaseAdmin
      .from('sermons')
      .insert({
        file_name: parsed.fileName,
        raw_text: parsed.text,
        title: titleFromFileName(parsed.fileName), // fallback title
        user_id: userId,
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

    // 5. OpenAI 분석 (병렬)
    let result
    try {
      const useMockCookie = request.cookies.get('use_mock')?.value
      const useMock = useMockCookie !== undefined
        ? useMockCookie === 'true'
        : process.env.NEXT_PUBLIC_USE_MOCK === 'true'
      if (useMock) {
        result = getMockResult()
      } else {
        result = await generateAll(parsed.text)
      }
    } catch (err: any) {
      console.error('AI generation error:', err)
      return NextResponse.json({
        success: true,
        sermonId,
        preview: parsed.text.substring(0, 2000),
      fullText: parsed.text,
        generationError: err.message || 'AI 생성 중 오류가 발생했습니다.',
      })
    }

    // 6. 사용량 차감
    await consumeUsage(userId).catch(() => {})

    // 7. 결과 업데이트 (재시도 포함)
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

// 단일 항목 재생성 API (idempotent + on-success deduction)
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
    const { data: ownerCheck } = await supabaseAdmin
      .from('sermons')
      .select('user_id')
      .eq('id', sermonId)
      .single()
    if (!ownerCheck || ownerCheck.user_id !== user.id) {
      return NextResponse.json({ success: false, error: '접근 권한이 없습니다.' }, { status: 403 })
    }

    const useMockCookie = request.cookies.get('use_mock')?.value
    const useMock = useMockCookie !== undefined
      ? useMockCookie === 'true'
      : process.env.NEXT_PUBLIC_USE_MOCK === 'true'

    // Generate with idempotency + deduction
    const genResult = await generateWithDeduction({
      userId: user.id,
      sermonId,
      item,
      idempotencyKey: idempotency_key,
      text,
      useMock,
    })

    if (!genResult.success) {
      const status = genResult.block_reason ? 403 : 500
      return NextResponse.json({
        success: false,
        error: genResult.error,
        block_reason: genResult.block_reason,
        deduction: genResult.deduction,
      }, { status })
    }

    // 기존 결과와 병합
    const { data: existing } = await supabaseAdmin
      .from('sermons')
      .select('result')
      .eq('id', sermonId)
      .single()

    const merged = { ...(existing?.result || {}), ...genResult.data }
    await retryableUpdate('sermons', { result: merged }, 'id', sermonId)

    return NextResponse.json({
      success: true,
      ...genResult.data,
      deduction: genResult.deduction,
      remaining: genResult.remaining,
    })
  } catch (err: any) {
    console.error('Regenerate error:', err)
    return NextResponse.json(
      { success: false, error: err.message || '재생성 중 오류가 발생했습니다.' },
      { status: 500 },
    )
  }
}
