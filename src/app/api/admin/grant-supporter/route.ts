import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getUserFromRequest } from '@/lib/auth'
import { grantSupporter } from '@/lib/donations'
import { notifyAdmins } from '@/lib/admin-notifications'

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const { data: adminCheck } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (adminCheck?.role !== 'admin') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 })
    }

    const body = await request.json()
    const { userId, days, amountKrw, note } = body

    if (!userId || !days || days < 1) {
      return NextResponse.json({ error: 'userId와 days가 필요합니다.' }, { status: 400 })
    }

    const ok = await grantSupporter(userId, days, amountKrw, note)
    if (!ok) {
      return NextResponse.json({ error: '후원자 부여에 실패했습니다.' }, { status: 500 })
    }

    // 대상 회원 정보 조회 (이메일)
    let userEmail = userId
    try {
      const { data: target } = await supabaseAdmin.auth.admin.getUserById(userId)
      userEmail = target?.user?.email || userId
    } catch {}

    // 관리자 알림
    notifyAdmins({
      type: 'new_donation',
      title: `${userEmail} 후원 ${days}일 부여`,
      message: amountKrw
        ? `₩${amountKrw.toLocaleString('ko-KR')} 후원 — ${note || '메모 없음'}`
        : `${days}일 후원 부여 (금액 미입력)`,
      link: `/admin/users?focus=${userId}`,
      relatedUserId: userId,
      metadata: { days, amountKrw, note },
    }).catch(() => {})

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('POST /api/admin/grant-supporter error:', err)
    return NextResponse.json({ error: err.message || '처리 실패' }, { status: 500 })
  }
}
