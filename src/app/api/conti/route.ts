import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, hasSupabaseConfig } from '@/lib/supabase'
import { getUser, unauthorized, badRequest, serverError, notConfigured } from '@/lib/conti/apiHelpers'

// GET /api/conti — 콘티 목록
export async function GET(request: NextRequest) {
  if (!hasSupabaseConfig) return notConfigured()
  const user = await getUser(request)
  if (!user) return unauthorized()

  const { data: sets, error } = await supabaseAdmin
    .from('conti_sets')
    .select('id, title, date, worship_type, is_public, created_at, updated_at, conti_items(id, song_id, position)')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  if (error) return serverError(error.message)

  // 각 set 의 item count 계산
  const items = (sets || []).map((s: any) => ({
    id: s.id,
    title: s.title,
    date: s.date,
    worship_type: s.worship_type,
    is_public: s.is_public,
    item_count: (s.conti_items || []).length,
    created_at: s.created_at,
    updated_at: s.updated_at,
  }))

  return NextResponse.json({ data: items })
}

// POST /api/conti — 새 콘티 생성
export async function POST(request: NextRequest) {
  if (!hasSupabaseConfig) return notConfigured()
  const user = await getUser(request)
  if (!user) return unauthorized()

  const body = await request.json()
  const { title, date, worship_type, memo } = body

  if (!title || typeof title !== 'string') {
    return badRequest('제목이 필요합니다.')
  }

  const { data, error } = await supabaseAdmin
    .from('conti_sets')
    .insert({
      user_id: user.id,
      title,
      date: date || null,
      worship_type: worship_type || 'sunday_am',
      memo: memo || '',
      is_public: false,
    })
    .select()
    .single()

  if (error) return serverError(error.message)
  return NextResponse.json({ success: true, data })
}
