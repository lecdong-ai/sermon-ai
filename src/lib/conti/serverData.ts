import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabaseAdmin, hasSupabaseConfig } from '@/lib/supabase'
import type { ContiSet, ContiItem, ContiSong, AIRecommendResult } from '@/types/conti'
import { SAMPLE_CONTIS, SAMPLE_CONTI_ITEMS, ALL_SAMPLE_SONGS, ALL_SAMPLE_SONGS_BY_ID, getSampleSongById } from '@/lib/conti/samples'

// 서버 사이드에서 현재 로그인한 사용자의 콘티 데이터 가져오기
export async function getServerContiData(searchParams: { id?: string | null }) {
  const cookieStore = cookies()
  const userId = await getUserIdFromCookies(cookieStore)
  const selectedId = searchParams.id || null

  if (!hasSupabaseConfig || !userId) {
    return {
      contis: [] as ContiSet[],
      selectedConti: null as ContiSet | null,
      items: [] as ContiItem[],
      isAuthenticated: !!userId,
    }
  }

  // 콘티 목록
  const { data: contisData, error: contisError } = await supabaseAdmin
    .from('conti_sets')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (contisError) {
    console.error('[getServerContiData] contis error:', contisError)
    return { contis: [], selectedConti: null, items: [], isAuthenticated: true }
  }

  const contis: ContiSet[] = (contisData || []).map((c: any) => ({
    id: c.id,
    user_id: c.user_id,
    title: c.title,
    date: c.date,
    worship_type: c.worship_type || 'sunday_am',
    memo: c.memo || '',
    is_public: c.is_public || false,
    share_token: c.share_token,
    created_at: c.created_at,
    updated_at: c.updated_at,
  }))

  // 선택된 콘티 + items
  let selectedConti: ContiSet | null = null
  let items: ContiItem[] = []

  if (selectedId) {
    const conti = contis.find((c) => c.id === selectedId)
    if (conti) {
      selectedConti = conti
      const { data: itemsData } = await supabaseAdmin
        .from('conti_items')
        .select('*')
        .eq('conti_id', conti.id)
        .order('position', { ascending: true })

      const itemIds = (itemsData || []).map((it: any) => it.song_id)
      let songsMap: Record<string, ContiSong> = {}
      if (itemIds.length > 0) {
        const { data: songsData } = await supabaseAdmin
          .from('conti_songs')
          .select('*')
          .in('id', itemIds)
        songsMap = (songsData || []).reduce((acc: any, s: any) => {
          acc[s.id] = s as ContiSong
          return acc
        }, {})
      }

      items = (itemsData || []).map((it: any): ContiItem => ({
        id: it.id,
        conti_id: it.conti_id,
        song_id: it.song_id,
        position: it.position,
        key: it.key,
        bpm_override: it.bpm_override,
        transition_memo: it.transition_memo || '',
        memo: it.memo || '',
        song: songsMap[it.song_id] || getSampleSongById(it.song_id) || undefined,
      }))
    }
  }

  return {
    contis,
    selectedConti,
    items,
    isAuthenticated: true,
  }
}

async function getUserIdFromCookies(cookieStore: any): Promise<string | null> {
  if (!hasSupabaseConfig) return null
  try {
    const allCookies = cookieStore.getAll()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return allCookies },
          setAll() { /* read-only */ },
        },
      },
    )
    await supabase.auth.getSession()
    const { data } = await supabase.auth.getUser()
    return data.user?.id || null
  } catch (e) {
    console.error('[getUserIdFromCookies] error:', e)
    return null
  }
}
