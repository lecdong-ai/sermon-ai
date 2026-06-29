import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, hasSupabaseConfig } from '@/lib/supabase'
import { getUser, unauthorized, badRequest, serverError, notConfigured } from '@/lib/conti/apiHelpers'

// GET /api/conti/songs — 곡 라이브러리 (시스템 + 본인)
export async function GET(request: NextRequest) {
  if (!hasSupabaseConfig) return notConfigured()
  const user = await getUser(request)
  if (!user) return unauthorized()

  const { data, error } = await supabaseAdmin
    .from('conti_songs')
    .select('*')
    .or(`user_id.is.null,user_id.eq.${user.id}`)
    .order('created_at', { ascending: false })

  if (error) return serverError(error.message)
  return NextResponse.json({ data: data || [] })
}

// POST /api/conti/songs — 곡 추가 (사용자 곡)
export async function POST(request: NextRequest) {
  if (!hasSupabaseConfig) return notConfigured()
  const user = await getUser(request)
  if (!user) return unauthorized()

  const body = await request.json()
  const {
    title, artist, original_key, bpm, duration_sec,
    lyrics, chords, tags, category, source, youtube_url,
  } = body

  if (!title) return badRequest('곡 제목이 필요합니다.')

  const { data, error } = await supabaseAdmin
    .from('conti_songs')
    .insert({
      user_id: user.id,
      title,
      artist: artist || null,
      original_key: original_key || null,
      bpm: bpm || null,
      duration_sec: duration_sec || null,
      lyrics: lyrics || null,
      chords: chords || null,
      tags: tags || [],
      category: category || 'CCM',
      source: source || 'manual',
      youtube_url: youtube_url || null,
    })
    .select()
    .single()

  if (error) return serverError(error.message)
  return NextResponse.json({ success: true, data })
}
