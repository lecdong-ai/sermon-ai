import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { supabase, supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const generation = searchParams.get('generation')

  let query = supabase
    .from('generational_qt')
    .select('*')
    .order('created_at', { ascending: false })

  if (generation) {
    query = query.eq('generation', generation)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: '조회에 실패했습니다' }, { status: 500 })
  }

  return NextResponse.json(data || [])
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
  const { generation, title, description, bible_passage, week_label, files } = body

  if (!generation || !title) {
    return NextResponse.json({ error: '세대와 제목은 필수입니다' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('generational_qt')
    .insert({
      generation,
      title,
      description: description || '',
      bible_passage: bible_passage || '',
      week_label: week_label || '',
      files: files || [],
    })
    .select()
    .single()

  if (error) {
    console.error('Failed to create generational QT:', error)
    return NextResponse.json({ error: '저장에 실패했습니다' }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
