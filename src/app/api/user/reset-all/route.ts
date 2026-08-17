import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getUserFromRequest } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const userId = user.id

    // 1. 내 모든 설교(sermons) 삭제
    const { error: sermonsErr } = await supabaseAdmin
      .from('sermons')
      .delete()
      .eq('user_id', userId)

    if (sermonsErr) console.error('sermons delete error:', sermonsErr)

    // 2. 내 모든 시리즈/프로젝트(series) 삭제
    const { error: seriesErr } = await supabaseAdmin
      .from('series')
      .delete()
      .eq('user_id', userId)

    if (seriesErr) console.error('series delete error:', seriesErr)

    // 3. 내 모든 연구 가이드 / 성경 한권강해(study_guides) 삭제
    const { error: studyErr } = await supabaseAdmin
      .from('study_guides')
      .delete()
      .eq('user_id', userId)

    if (studyErr) console.error('study_guides delete error:', studyErr)

    // 4. 내 모든 큐티 아카이브(qt_archive) 삭제
    const { error: qtErr } = await supabaseAdmin
      .from('qt_archive')
      .delete()
      .eq('user_id', userId)

    if (qtErr) console.error('qt_archive delete error:', qtErr)

    // 5. 내 모든 콘티(conti) 삭제
    const { error: contiErr } = await supabaseAdmin
      .from('conti')
      .delete()
      .eq('user_id', userId)

    if (contiErr) console.error('conti delete error:', contiErr)

    return NextResponse.json({
      success: true,
      message: '모든 설교, 시리즈, 연구 가이드, 큐티 자료가 성공적으로 초기화되었습니다.',
    })
  } catch (err: any) {
    console.error('POST /api/user/reset-all error:', err)
    return NextResponse.json({ success: false, error: err.message || '초기화 실패' }, { status: 500 })
  }
}
