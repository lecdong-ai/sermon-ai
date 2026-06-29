import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, hasSupabaseConfig } from '@/lib/supabase'
import { getUser, unauthorized, badRequest, notFound, serverError, notConfigured } from '@/lib/conti/apiHelpers'

// PATCH /api/conti/[id]/items/[itemId] — 아이템 수정 (key, bpm, 메모, position)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> },
) {
  if (!hasSupabaseConfig) return notConfigured()
  const { id: contiId, itemId } = await params
  const user = await getUser(request)
  if (!user) return unauthorized()

  const body = await request.json()
  const updates: Record<string, any> = {}
  if (body.key !== undefined) updates.key = body.key
  if (body.bpm_override !== undefined) updates.bpm_override = body.bpm_override
  if (body.transition_memo !== undefined) updates.transition_memo = body.transition_memo
  if (body.memo !== undefined) updates.memo = body.memo
  if (body.position !== undefined) updates.position = body.position

  if (Object.keys(updates).length === 0) return badRequest('수정할 필드가 없습니다.')

  // 소유권 확인 (item 의 conti_id → user_id 체크)
  const { data: set } = await supabaseAdmin
    .from('conti_sets')
    .select('id')
    .eq('id', contiId)
    .eq('user_id', user.id)
    .maybeSingle()
  if (!set) return notFound('콘티를 찾을 수 없습니다.')

  const { data, error } = await supabaseAdmin
    .from('conti_items')
    .update(updates)
    .eq('id', itemId)
    .eq('conti_id', contiId)
    .select()
    .single()

  if (error) return serverError(error.message)
  return NextResponse.json({ success: true, data })
}

// DELETE /api/conti/[id]/items/[itemId] — 아이템 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> },
) {
  if (!hasSupabaseConfig) return notConfigured()
  const { id: contiId, itemId } = await params
  const user = await getUser(request)
  if (!user) return unauthorized()

  // 소유권 확인
  const { data: set } = await supabaseAdmin
    .from('conti_sets')
    .select('id')
    .eq('id', contiId)
    .eq('user_id', user.id)
    .maybeSingle()
  if (!set) return notFound('콘티를 찾을 수 없습니다.')

  const { error } = await supabaseAdmin
    .from('conti_items')
    .delete()
    .eq('id', itemId)
    .eq('conti_id', contiId)

  if (error) return serverError(error.message)

  // position 재정렬
  const { data: remaining } = await supabaseAdmin
    .from('conti_items')
    .select('id, position')
    .eq('conti_id', contiId)
    .order('position', { ascending: true })

  if (remaining) {
    for (let i = 0; i < remaining.length; i++) {
      if (remaining[i].position !== i + 1) {
        await supabaseAdmin
          .from('conti_items')
          .update({ position: i + 1 })
          .eq('id', remaining[i].id)
      }
    }
  }

  return NextResponse.json({ success: true })
}
