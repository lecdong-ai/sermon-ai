import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, hasSupabaseConfig } from '@/lib/supabase'
import { getUser, unauthorized, badRequest, notFound, serverError, notConfigured } from '@/lib/conti/apiHelpers'

// PATCH /api/conti/songs/[id] — 곡 수정
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
  const fields = ['title','artist','original_key','bpm','duration_sec','lyrics','chords','tags','category','youtube_url']
  for (const f of fields) {
    if (body[f] !== undefined) updates[f] = body[f]
  }
  if (Object.keys(updates).length === 0) return badRequest('수정할 필드가 없습니다.')

  const { data, error } = await supabaseAdmin
    .from('conti_songs')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return serverError(error.message)
  return NextResponse.json({ success: true, data })
}

// DELETE /api/conti/songs/[id] — 곡 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!hasSupabaseConfig) return notConfigured()
  const { id } = await params
  const user = await getUser(request)
  if (!user) return unauthorized()

  const { error } = await supabaseAdmin
    .from('conti_songs')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return serverError(error.message)
  return NextResponse.json({ success: true })
}
