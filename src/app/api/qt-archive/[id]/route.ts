import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { supabaseAdmin } from '@/lib/supabase'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()
    const { title, excerpt, content, bible_passage, bible_text, key_verse, thumbnail_url, season, tags } = body

    if (!title) {
      return NextResponse.json({ error: '제목은 필수입니다' }, { status: 400 })
    }

    // 기본 안전 업데이트 객체 생성
    const updateData: Record<string, any> = {
      title,
      excerpt: excerpt || '',
      content: content || '',
      bible_passage: bible_passage || '',
      thumbnail_url: thumbnail_url || '',
      season: season || '연중',
      tags: tags || [],
    }

    // bible_text, key_verse 컬럼 추가 시도
    if (bible_text !== undefined) updateData.bible_text = bible_text
    if (key_verse !== undefined) updateData.key_verse = key_verse

    let { data, error } = await supabaseAdmin
      .from('qt_archive')
      .update(updateData)
      .eq('id', id)
      .select()

    // 혹시 bible_text, key_verse 컬럼이 없는 스키마일 경우 fallback 안전 업데이트
    if (error && (error.message?.includes('bible_text') || error.message?.includes('key_verse') || error.code === 'PGRST204')) {
      delete updateData.bible_text
      delete updateData.key_verse
      const retry = await supabaseAdmin
        .from('qt_archive')
        .update(updateData)
        .eq('id', id)
        .select()
      data = retry.data
      error = retry.error
    }

    if (error) {
      console.error('Failed to update qt archive:', error)
      return NextResponse.json({ error: `수정 실패: ${error.message || error.details || 'DB 오류'}` }, { status: 500 })
    }

    return NextResponse.json(data?.[0] || { ok: true })
  } catch (e: any) {
    console.error('PUT /api/qt-archive/[id] exception:', e)
    return NextResponse.json({ error: e.message || '서버 오류가 발생했습니다' }, { status: 500 })
  }
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
