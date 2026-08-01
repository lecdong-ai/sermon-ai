import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { supabase, supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const season = searchParams.get('season')
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
  const page = Math.max(parseInt(searchParams.get('page') || '1'), 1)
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('qt_archive')
    .select('*', { count: 'exact' })
    .order('published_at', { ascending: false })
    .range(from, to)

  if (season) {
    query = query.eq('season', season)
  }

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json({ error: '조회에 실패했습니다' }, { status: 500 })
  }

  return NextResponse.json({ items: data || [], total: count || 0 })
}

export async function POST(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return request.cookies.getAll() }, setAll() {} } },
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })

  const body = await request.json()
  const { title, excerpt, content, bible_passage, bible_text, key_verse, thumbnail_url, season, tags } = body

  if (!title) {
    return NextResponse.json({ error: '제목은 필수입니다' }, { status: 400 })
  }

  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    + '-' + Date.now().toString(36)

  // 썸네일 이미지 자동 생성 알고리즘 (비어있는 경우 성경/묵상 고화질 이미지 100% 자동 매칭)
  const autoThumbnails = [
    'https://images.unsplash.com/photo-1499209974431-9dac3cea004b?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1509021436468-d510074251a3?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519817650390-64a93db51149?w=800&auto=format&fit=crop&q=80',
  ]
  const titleHash = title.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0)
  const finalThumbnail = thumbnail_url?.trim()
    ? thumbnail_url
    : autoThumbnails[Math.abs(titleHash) % autoThumbnails.length]

  const { data, error } = await supabaseAdmin
    .from('qt_archive')
    .insert({
      slug,
      title,
      excerpt: excerpt || '',
      content: content || '',
      bible_passage: bible_passage || '',
      bible_text: bible_text || '',
      key_verse: key_verse || '',
      thumbnail_url: finalThumbnail,
      season: season || '연중',
      tags: tags || [],
    })
    .select()
    .single()

  if (error) {
    console.error('Failed to create qt archive:', error)
    return NextResponse.json({ error: '저장에 실패했습니다' }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
