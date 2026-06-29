import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, hasSupabaseConfig } from '@/lib/supabase'
import { getUser, unauthorized, badRequest, notFound, serverError, notConfigured } from '@/lib/conti/apiHelpers'

// GET /api/conti/[id] — 콘티 상세 (콘티 + items + 곡 join)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!hasSupabaseConfig) return notConfigured()
  const { id } = await params
  const user = await getUser(request)
  if (!user) return unauthorized()

  const { data: set, error } = await supabaseAdmin
    .from('conti_sets')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) return serverError(error.message)
  if (!set) return notFound('콘티를 찾을 수 없습니다.')

  const { data: items, error: itemsError } = await supabaseAdmin
    .from('conti_items')
    .select('*, song:conti_songs(*)')
    .eq('conti_id', id)
    .order('position', { ascending: true })

  if (itemsError) return serverError(itemsError.message)

  return NextResponse.json({
    data: {
      conti: set,
      items: items || [],
    },
  })
}

// PATCH /api/conti/[id] — 콘티 메타 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!hasSupabaseConfig) return notConfigured()
  const { id } = await params
  const user = await getUser(request)
  if (!user) return unauthorized()

  const body = await request.json()
  const updates: Record<string, any> = {}
  if (body.title !== undefined) updates.title = body.title
  if (body.date !== undefined) updates.date = body.date
  if (body.worship_type !== undefined) updates.worship_type = body.worship_type
  if (body.memo !== undefined) updates.memo = body.memo
  if (body.is_public !== undefined) updates.is_public = body.is_public
  if (body.share_token !== undefined) updates.share_token = body.share_token

  if (Object.keys(updates).length === 0) return badRequest('수정할 필드가 없습니다.')

  const { data, error } = await supabaseAdmin
    .from('conti_sets')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return serverError(error.message)
  return NextResponse.json({ success: true, data })
}

// DELETE /api/conti/[id] — 콘티 삭제 (CASCADE)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!hasSupabaseConfig) return notConfigured()
  const { id } = await params
  const user = await getUser(request)
  if (!user) return unauthorized()

  const { error } = await supabaseAdmin
    .from('conti_sets')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return serverError(error.message)
  return NextResponse.json({ success: true })
}
