import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { supabaseAdmin } from '@/lib/supabase'
import { generateAll } from '@/lib/openai'
import { getMockResult } from '@/lib/mock'
import { checkUsage, consumeUsage } from '@/lib/usage'

async function getUser(request: NextRequest) {
  const sb = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll() {},
      },
    },
  )
  const { data } = await sb.auth.getUser()
  return data?.user ?? null
}

async function getSermon(id: string, userId: string) {
  const { data, error } = await supabaseAdmin
    .from('sermons')
    .select('*')
    .eq('id', id)
    .single()
  if (error || !data) return null
  if (data.user_id !== userId) return null
  return data
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const sermon = await getSermon(params.id, user.id)
    if (!sermon) {
      return NextResponse.json({ success: false, error: '설교를 찾을 수 없습니다.' }, { status: 404 })
    }

    const manuscript = sermon.result?.manuscript || sermon.raw_text || ''
    if (!manuscript.trim()) {
      return NextResponse.json({ success: false, error: '원고 텍스트가 없습니다.' }, { status: 400 })
    }

    const usageInfo = await checkUsage(user.id)
    if (!usageInfo.can_generate) {
      const errorMsg =
        usageInfo.block_reason === 'trial_expired' ? '무료체험 기간이 만료되었습니다.' :
        usageInfo.block_reason === 'trial_exhausted' ? '무료 분석 횟수를 모두 사용했습니다.' :
        '사용 한도를 초과했습니다.'
      return NextResponse.json({ success: false, error: errorMsg, usage_limit: true }, { status: 403 })
    }

    let result
    try {
      const useMock = request.cookies.get('use_mock')?.value === 'true'
      if (useMock) {
        result = getMockResult()
      } else {
        result = await generateAll(manuscript)
      }
    } catch (err: any) {
      console.error('AI generation error:', err)
      return NextResponse.json({ success: false, error: err.message || 'AI 생성 중 오류가 발생했습니다.' })
    }

    await consumeUsage(user.id).catch(() => {})

    const existingResult = sermon.result || {}
    const mergedResult = { ...existingResult, ...result }

    await supabaseAdmin
      .from('sermons')
      .update({ result: mergedResult, updated_at: new Date().toISOString() })
      .eq('id', params.id)

    return NextResponse.json({ success: true, sermonId: params.id })
  } catch (err: any) {
    console.error('POST /api/sermons/[id]/generate error:', err)
    return NextResponse.json({ success: false, error: err.message || '생성 실패' }, { status: 500 })
  }
}
