import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, hasSupabaseConfig } from '@/lib/supabase'
import { getUser, unauthorized, badRequest, notFound, serverError, notConfigured } from '@/lib/conti/apiHelpers'

// POST /api/conti/[id]/items — 곡을 콘티에 추가
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!hasSupabaseConfig) return notConfigured()
  const { id: contiId } = await params
  const user = await getUser(request)
  if (!user) return unauthorized()

  const body = await request.json()
  const { song_id, position, key, bpm_override, transition_memo, memo } = body

  if (!song_id) return badRequest('song_id가 필요합니다.')

  // 콘티 소유권 확인
  const { data: set } = await supabaseAdmin
    .from('conti_sets')
    .select('id')
    .eq('id', contiId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!set) return notFound('콘티를 찾을 수 없습니다.')

  // 자동 position (없으면 끝에 추가)
  let targetPos = position
  if (targetPos == null) {
    const { data: lastItem } = await supabaseAdmin
      .from('conti_items')
      .select('position')
      .eq('conti_id', contiId)
      .order('position', { ascending: false })
      .limit(1)
      .maybeSingle()
    targetPos = (lastItem?.position || 0) + 1
  }

  const { data, error } = await supabaseAdmin
    .from('conti_items')
    .insert({
      conti_id: contiId,
      song_id,
      position: targetPos,
      key: key || null,
      bpm_override: bpm_override || null,
      transition_memo: transition_memo || '',
      memo: memo || '',
    })
    .select()
    .single()

  if (error) return serverError(error.message)
  return NextResponse.json({ success: true, data })
}
