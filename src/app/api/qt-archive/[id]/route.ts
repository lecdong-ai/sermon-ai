import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { supabaseAdmin } from '@/lib/supabase'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return request.cookies.getAll() }, setAll() {} } },
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })

  const { id } = params
  const body = await request.json()
  const { title, excerpt, content, bible_passage, bible_text, key_verse, thumbnail_url, season, tags } = body

  if (!title) {
    return NextResponse.json({ error: '제목은 필수입니다' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('qt_archive')
    .update({
      title,
      excerpt: excerpt || '',
      content: content || '',
      bible_passage: bible_passage || '',
      bible_text: bible_text || '',
      key_verse: key_verse || '',
      thumbnail_url: thumbnail_url || '',
      season: season || '연중',
      tags: tags || [],
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Failed to update qt archive:', error)
    return NextResponse.json({ error: '수정에 실패했습니다' }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return request.cookies.getAll() }, setAll() {} } },
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })

  const { id } = params

  const { error } = await supabaseAdmin
    .from('qt_archive')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Failed to delete qt archive:', error)
    return NextResponse.json({ error: '삭제에 실패했습니다' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
