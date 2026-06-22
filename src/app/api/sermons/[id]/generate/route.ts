import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { generateAll } from '@/lib/openai'
import { getUserFromRequest, checkOpenAIRateLimit } from '@/lib/auth'

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
    const user = await getUserFromRequest(request)
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

    let result
    try {
      result = await generateAll(manuscript)
    } catch (err: any) {
      console.error('AI generation error:', err)
      return NextResponse.json({ success: false, error: err.message || 'AI 생성 중 오류가 발생했습니다.' })
    }

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
