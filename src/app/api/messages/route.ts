import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { notifyAdmins } from '@/lib/admin-notifications'

// POST: 사용자가 새 메시지 전송
// GET: 사용자의 메시지 목록 (인박스)

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 })
  }

  let body: { category?: string; subject?: string; message?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: '요청 본문이 올바르지 않습니다.' }, { status: 400 })
  }

  const { category, subject, message } = body
  if (!category || !['question', 'request', 'bug', 'praise'].includes(category)) {
    return NextResponse.json({ success: false, error: '올바른 카테고리를 선택해주세요.' }, { status: 400 })
  }
  if (!message || message.trim().length === 0) {
    return NextResponse.json({ success: false, error: '메시지 내용을 입력해주세요.' }, { status: 400 })
  }
  if (message.length > 500) {
    return NextResponse.json({ success: false, error: '메시지는 500자 이내로 입력해주세요.' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('user_messages')
    .insert({
      user_id: user.id,
      category,
      subject: subject?.trim() || null,
      message: message.trim(),
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  // 관리자에게 알림 (fire-and-forget)
  const CATEGORY_LABELS: Record<string, string> = {
    question: '질문',
    request: '요청',
    bug: '버그 신고',
    praise: '칭찬',
  }
  notifyAdmins({
    type: 'new_message',
    title: `새 ${CATEGORY_LABELS[category] || '메시지'}`,
    message: `${user.email || '사용자'}: ${message.substring(0, 80)}${message.length > 80 ? '...' : ''}`,
    link: `/admin/messages?focus=${data.id}`,
    relatedUserId: user.id,
    metadata: { messageId: data.id, category },
  }).catch(() => {})

  return NextResponse.json({ success: true, message: data })
}

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const { data, error } = await supabaseAdmin
    .from('user_messages')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, messages: data || [] })
}
