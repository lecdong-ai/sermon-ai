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
    return NextResponse.json({ error: `조회 실패: ${error.message}` }, { status: 500 })
  }

  return NextResponse.json(data || [])
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { generation, title, description, bible_passage, week_label, files } = body

    if (!generation || !title) {
      return NextResponse.json({ error: '세대와 제목은 필수 입력 항목입니다.' }, { status: 400 })
    }

    const insertPayload = {
      generation: String(generation),
      title: String(title),
      description: description ? String(description) : '',
      bible_passage: bible_passage ? String(bible_passage) : '',
      week_label: week_label ? String(week_label) : '',
      files: Array.isArray(files) ? files : [],
    }

    const { data, error } = await supabaseAdmin
      .from('generational_qt')
      .insert(insertPayload)
      .select()
      .single()

    if (error) {
      console.error('Failed to create generational QT:', error)
      return NextResponse.json(
        { error: `DB 저장 실패 [${error.code || 'ERR'}]: ${error.message || error.details || '알 수 없는 오류'}` },
        { status: 400 }
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err: any) {
    console.error('Generational QT POST error:', err)
    return NextResponse.json(
      { error: `서버 예외 발생: ${err.message || '저장 중 오류가 발생했습니다.'}` },
      { status: 500 }
    )
  }
}
