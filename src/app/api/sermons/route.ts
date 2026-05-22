import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { supabaseAdmin } from '@/lib/supabase'

async function getUser(request: NextRequest) {
  const sb = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll() {},
      },
    },
  )
  const { data } = await sb.auth.getUser()
  return data?.user ?? null
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const { data, error } = await supabaseAdmin
      .from('sermons')
      .select('id, title, passage, sermon_date, status, version, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    console.error('GET /api/sermons error:', err)
    return NextResponse.json({ success: false, error: err.message || '조회 실패' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const body = await request.json()

    if (!body.title?.trim()) {
      return NextResponse.json({ success: false, error: '설교 제목을 입력해주세요.' }, { status: 400 })
    }
    if (!body.passage?.trim()) {
      return NextResponse.json({ success: false, error: '성경본문을 입력해주세요.' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('sermons')
      .insert({
        user_id: user.id,
        title: body.title,
        passage: body.passage,
        book: body.book || null,
        chapter_start: body.chapter_start || null,
        chapter_end: body.chapter_end || null,
        verse_start: body.verse_start || null,
        verse_end: body.verse_end || null,
        sermon_date: body.sermon_date || null,
        series: body.series || null,
        season: body.season || null,
        audience: body.audience || [],
        church_context: body.church_context || null,
        status: 'draft',
        version: 1,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (err: any) {
    console.error('POST /api/sermons error:', err)
    return NextResponse.json({ success: false, error: err.message || '생성 실패' }, { status: 500 })
  }
}
