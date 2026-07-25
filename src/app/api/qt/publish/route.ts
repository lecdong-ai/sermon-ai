import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      subtitle,
      excerpt,
      bible_book,
      week_number,
      audience,
      generation,
      level,
      tone,
      series_name,
      size_option,
      design_template,
      full_manuscript,
      day_data,
      start_passage,
      end_passage,
    } = body

    if (!bible_book || !week_number || !full_manuscript) {
      return NextResponse.json(
        { error: 'bible_book, week_number, full_manuscript are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('qt_history')
      .insert({
        user_id: null,
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
        title: title || series_name || null,
        excerpt: excerpt || null,
        is_published: true,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ id: data.id, success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Internal error' }, { status: 500 })
  }
}
