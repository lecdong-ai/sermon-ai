import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { isAdmin } from '@/lib/admin'
import { supabaseAdmin } from '@/lib/supabase'
import { notifyAdmins } from '@/lib/admin-notifications'

// PATCH: 메시지 답변 / 상태 변경

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const user = await getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 })
  }
  if (!await isAdmin(user.id)) {
    return NextResponse.json({ success: false, error: '관리자 권한이 필요합니다.' }, { status: 403 })
  }

  let body: { status?: string; adminReply?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: '요청 본문이 올바르지 않습니다.' }, { status: 400 })
  }

  const { status, adminReply } = body
  const updates: Record<string, any> = {}
  if (status && ['open', 'in_progress', 'resolved', 'wontfix'].includes(status)) {
    updates.status = status
  }
  if (adminReply !== undefined) {
    if (adminReply.trim().length === 0) {
      // 빈 답변 = 답변 삭제
      updates.admin_reply = null
      updates.admin_replied_at = null
      updates.replied_by = null
    } else {
      updates.admin_reply = adminReply.trim()
      updates.admin_replied_at = new Date().toISOString()
      updates.replied_by = user.id
      // 답변 시 자동으로 in_progress로 변경
      if (!status) updates.status = 'in_progress'
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ success: false, error: '변경할 내용이 없습니다.' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('user_messages')
    .update(updates)
    .eq('id', params.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  // 답변 등록 시 사용자에게 알림
  if (adminReply && adminReply.trim().length > 0 && data) {
    let userEmail = data.user_id
    try {
      const { data: profile } = await supabaseAdmin
        .from('user_profiles')
        .select('email')
        .eq('id', data.user_id)
        .single()
      userEmail = profile?.email || data.user_id
    } catch {}
    notifyAdmins({
      type: 'system',
      title: `${userEmail}님 메시지 답변 완료`,
      message: adminReply.substring(0, 80),
      link: `/messages?focus=${data.id}`,
      relatedUserId: data.user_id,
      metadata: { messageId: data.id, repliedBy: user.id },
    }).catch(() => {})
  }

  return NextResponse.json({ success: true, message: data })
}
