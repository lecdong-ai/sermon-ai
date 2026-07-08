import { NextRequest, NextResponse } from 'next/server'
import { projectSupabaseAdmin } from '@/lib/project/supabase'
import { getUserFromRequest } from '@/lib/project/auth'

export async function POST(request: NextRequest) {
  try {
    const { sermonId, slides } = await request.json()

    if (!sermonId || !slides) {
      return NextResponse.json({ success: false, error: '필수 파라미터가 없습니다.' }, { status: 400 })
    }

    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const { data: ownerCheck } = await projectSupabaseAdmin
      .from('sermons')
      .select('user_id')
      .eq('id', sermonId)
      .single()

    if (!ownerCheck || ownerCheck.user_id !== user.id) {
      return NextResponse.json({ success: false, error: '접근 권한이 없습니다.' }, { status: 403 })
    }

    // imageBase64는 세션 전용이므로 DB 저장 전 제거 (용량 보호)
    // imagePrompt 텍스트만 영구 저장하여 재생성 가능
    const slidesCleaned = (slides as any[]).map((s) => {
      const { imageBase64, imageMode, ...rest } = s
      return rest
    })

    const { data: existing } = await projectSupabaseAdmin
      .from('sermons')
      .select('result')
      .eq('id', sermonId)
      .single()

    const merged = {
      ...(existing?.result || {}),
      ppt: { slides: slidesCleaned },
    }

    const { error } = await projectSupabaseAdmin
      .from('sermons')
      .update({ result: merged })
      .eq('id', sermonId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('PPT save error:', err)
    return NextResponse.json(
      { success: false, error: err.message || '저장 실패' },
      { status: 500 },
    )
  }
}
