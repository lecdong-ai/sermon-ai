import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getUserFromRequest } from '@/lib/auth'
import { isAdmin } from '@/lib/admin'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!(await isAdmin(user.id))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
  const offset = (page - 1) * limit

  const { data, error, count } = await supabaseAdmin
    .from('qt_history')
    .select('id, bible_book, week_number, series_name, audience, generation, level, tone, size_option, design_template, created_at, updated_at, start_passage, end_passage, subtitle', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ entries: data || [], total: count || 0, page, limit })
}

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!(await isAdmin(user.id))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { bible_book, week_number, audience, generation, level, tone, series_name, size_option, design_template, full_manuscript, day_data, start_passage, end_passage, subtitle } = body

  if (!bible_book || !week_number || !full_manuscript) {
    return NextResponse.json({ error: 'bible_book, week_number, full_manuscript are required' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('qt_history')
    .insert({
      user_id: user.id,
      bible_book,
      week_number,
      audience: audience || '일반 성도',
      generation: generation || null,
      level: level || '중',
      tone: tone || '정중하고 따뜻한',
      series_name: series_name || '말씀과 함께하는 큐티',
      size_option: size_option || 'A5',
      design_template: design_template || 'warm-modern',
      full_manuscript,
      day_data: day_data || null,
      start_passage: start_passage || null,
      end_passage: end_passage || null,
      subtitle: subtitle || null,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ entry: data })
}
