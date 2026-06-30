import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, hasSupabaseConfig } from '@/lib/supabase'
import { getUser, unauthorized, serverError, notFound, notConfigured } from '@/lib/conti/apiHelpers'
import { mockAICoach } from '@/lib/conti/mockAi'
import type { ContiItem } from '@/types/conti'
import { getSampleSongById, SAMPLE_CONTI_ITEMS } from '@/lib/conti/samples'

// POST /api/conti/[id]/coach — AI 코치 분석
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!hasSupabaseConfig) return notConfigured()
  const { id } = await params
  const user = await getUser(request)
  if (!user) return unauthorized()

  // conti set 소유권 확인
  const { data: contiSet } = await supabaseAdmin
    .from('conti_sets')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()
  if (!contiSet) return notFound()

  // items 조회
  const { data: items, error } = await supabaseAdmin
    .from('conti_items')
    .select('*, song:conti_songs(*)')
    .eq('conti_id', id)
    .order('position', { ascending: true })

  if (error) return serverError(error.message)
  if (!items || items.length === 0) {
    return NextResponse.json({ data: {
      summary: '콘티가 비어 있습니다.',
      overall_score: 0,
      key_analysis: { issues: [], good: [] },
      bpm_analysis: { flow_pattern: 'flat', flow_label: '없음', tempo_range: null, issues: [], good: [] },
      mood_analysis: { distribution: {}, top_moods: [], issues: [], good: [] },
      flow_suggestion: '',
    } })
  }

  // song join
  const itemsWithSong: ContiItem[] = items.map((it: any) => ({
    id: it.id,
    conti_id: it.conti_id,
    song_id: it.song_id,
    position: it.position,
    key: it.key,
    bpm_override: it.bpm_override,
    transition_memo: it.transition_memo || '',
    memo: it.memo || '',
    song: it.song,
  }))

  const report = await mockAICoach(itemsWithSong)
  return NextResponse.json({ data: report })
}
