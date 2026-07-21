import { NextRequest, NextResponse } from 'next/server'
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
  const body = await request.json()
  const { title, excerpt, content, bible_passage, thumbnail_url, season, tags } = body

  if (!title) {
    return NextResponse.json({ error: '제목은 필수입니다' }, { status: 400 })
  }

  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    + '-' + Date.now().toString(36)

  const { data, error } = await supabaseAdmin
    .from('qt_archive')
    .insert({
      slug,
      title,
      excerpt: excerpt || '',
      content: content || '',
      bible_passage: bible_passage || '',
      thumbnail_url: thumbnail_url || '',
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
