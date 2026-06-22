import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { isAdmin } from '@/lib/admin'
import { supabaseAdmin } from '@/lib/supabase'

// GET: list notifications (newest first, optional unread-only filter)
// PATCH: mark all as read

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 })
  }
  if (!await isAdmin(user.id)) {
    return NextResponse.json({ success: false, error: '관리자 권한이 필요합니다.' }, { status: 403 })
  }

  const url = new URL(request.url)
  const unreadOnly = url.searchParams.get('unread') === 'true'
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100)

  let query = supabaseAdmin
    .from('admin_notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (unreadOnly) {
    query = query.eq('read', false)
  }

  const { data, error } = await query
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  // Unread count (separate query, always)
  const { count: unreadCount } = await supabaseAdmin
    .from('admin_notifications')
    .select('*', { count: 'exact', head: true })
    .eq('read', false)

  return NextResponse.json({
    success: true,
    notifications: data || [],
    unreadCount: unreadCount || 0,
  })
}

export async function PATCH(request: NextRequest) {
  const user = await getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 })
  }
  if (!await isAdmin(user.id)) {
    return NextResponse.json({ success: false, error: '관리자 권한이 필요합니다.' }, { status: 403 })
  }

  // Mark all unread as read
  const { error, count } = await supabaseAdmin
    .from('admin_notifications')
    .update({ read: true, read_at: new Date().toISOString() })
    .eq('read', false)

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, markedCount: count })
}
