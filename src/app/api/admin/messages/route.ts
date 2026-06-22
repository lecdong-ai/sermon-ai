import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { isAdmin } from '@/lib/admin'
import { supabaseAdmin } from '@/lib/supabase'

// GET: 모든 메시지 (필터 가능: status, category)

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 })
  }
  if (!await isAdmin(user.id)) {
    return NextResponse.json({ success: false, error: '관리자 권한이 필요합니다.' }, { status: 403 })
  }

  const url = new URL(request.url)
  const status = url.searchParams.get('status')
  const category = url.searchParams.get('category')
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '100'), 200)

  let query = supabaseAdmin
    .from('user_messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }
  if (category && category !== 'all') {
    query = query.eq('category', category)
  }

  const { data, error } = await query
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  // 사용자 정보 별도 조회 (email)
  const userIds = Array.from(new Set((data || []).map(m => m.user_id)))
  let userMap: Record<string, { email: string }> = {}
  if (userIds.length > 0) {
    try {
      const { data: profiles } = await supabaseAdmin
        .from('user_profiles')
        .select('id, email')
        .in('id', userIds)
      userMap = Object.fromEntries((profiles || []).map(p => [p.id, p]))
    } catch {}
  }

  return NextResponse.json({
    success: true,
    messages: data || [],
    userMap,
  })
}
