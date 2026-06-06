import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { supabaseAdmin } from '@/lib/supabase'

async function getUser(request: NextRequest) {
  if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    return { id: '25721757-65b2-474c-8668-e762ae319b4e', email: 'mock@example.com' } as any
  }
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

async function getSermon(id: string, userId: string) {
  const { data, error } = await supabaseAdmin
    .from('sermons')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (error || !data) return null
  return data
}

function toSermon(row: any) {
  const result = row.result || {}
  return {
    id: row.id,
    title: row.title || '',
    date: row.sermon_date || '',
    preacher: result.preacher || '',
    sermonType: result.sermonType || '',
    audience: result.audience || '',
    season: row.season || '',
    seriesId: result.seriesId || '',
    bibleBook: row.book || '',
    chapterStart: row.chapter_start || 0,
    verseStart: row.verse_start || 0,
    chapterEnd: row.chapter_end || 0,
    verseEnd: row.verse_end || 0,
    normalizedPassage: row.passage || '',
    coreMessage: result.coreMessage || '',
    outlineIntro: result.outlineIntro || '',
    outlinePoint1: result.outlinePoint1 || '',
    outlinePoint2: result.outlinePoint2 || '',
    outlinePoint3: result.outlinePoint3 || '',
    outlineConclusion: result.outlineConclusion || '',
    manuscript: result.manuscript || '',
    themeIds: result.themeIds || [],
    tagIds: result.tagIds || [],
    relatedSermonIds: result.relatedSermonIds || [],
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
    result: {
      summary: result.summary || null,
      groupDiscussion: result.groupDiscussion || null,
      cardNews: result.cardNews || null,
      sermonScript: result.sermonScript || null,
      shortsScript: result.shortsScript || null,
      pptData: result.pptData || null,
    },
    raw_text: row.raw_text || '',
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const sermon = await getSermon(params.id, user.id)
    if (!sermon) {
      return NextResponse.json({ success: false, error: '설교를 찾을 수 없습니다.' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: toSermon(sermon) })
  } catch (err: any) {
    console.error('GET /api/sermons/[id] error:', err)
    return NextResponse.json({ success: false, error: err.message || '조회 실패' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const sermon = await getSermon(params.id, user.id)
    if (!sermon) {
      return NextResponse.json({ success: false, error: '설교를 찾을 수 없습니다.' }, { status: 404 })
    }

    const body = await request.json()
    const now = new Date().toISOString()

    const updates: any = {
      updated_at: now,
    }

    if (body.title !== undefined) updates.title = body.title
    if (body.normalizedPassage !== undefined) updates.passage = body.normalizedPassage
    if (body.bibleBook !== undefined) updates.book = body.bibleBook
    if (body.chapterStart !== undefined) updates.chapter_start = body.chapterStart
    if (body.chapterEnd !== undefined) updates.chapter_end = body.chapterEnd
    if (body.verseStart !== undefined) updates.verse_start = body.verseStart
    if (body.verseEnd !== undefined) updates.verse_end = body.verseEnd
    if (body.date !== undefined) updates.sermon_date = body.date
    if (body.season !== undefined) updates.season = body.season

    const existingResult = sermon.result || {}
    const resultUpdate = {
      ...existingResult,
      ...(body.preacher !== undefined && { preacher: body.preacher }),
      ...(body.sermonType !== undefined && { sermonType: body.sermonType }),
      ...(body.audience !== undefined && { audience: body.audience }),
      ...(body.seriesId !== undefined && { seriesId: body.seriesId }),
      ...(body.coreMessage !== undefined && { coreMessage: body.coreMessage }),
      ...(body.outlineIntro !== undefined && { outlineIntro: body.outlineIntro }),
      ...(body.outlinePoint1 !== undefined && { outlinePoint1: body.outlinePoint1 }),
      ...(body.outlinePoint2 !== undefined && { outlinePoint2: body.outlinePoint2 }),
      ...(body.outlinePoint3 !== undefined && { outlinePoint3: body.outlinePoint3 }),
      ...(body.outlineConclusion !== undefined && { outlineConclusion: body.outlineConclusion }),
      ...(body.manuscript !== undefined && { manuscript: body.manuscript }),
      ...(body.themeIds !== undefined && { themeIds: body.themeIds }),
      ...(body.tagIds !== undefined && { tagIds: body.tagIds }),
      ...(body.relatedSermonIds !== undefined && { relatedSermonIds: body.relatedSermonIds }),
    }
    updates.result = resultUpdate

    const { error: sermonError } = await supabaseAdmin
      .from('sermons')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single()

    if (sermonError) throw sermonError

    const { data: updatedSermon } = await supabaseAdmin
      .from('sermons')
      .select('*')
      .eq('id', params.id)
      .single()

    return NextResponse.json({ success: true, data: toSermon(updatedSermon || sermon) })
  } catch (err: any) {
    console.error('PUT /api/sermons/[id] error:', err)
    return NextResponse.json({ success: false, error: err.message || '수정 실패' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const sermon = await getSermon(params.id, user.id)
    if (!sermon) {
      return NextResponse.json({ success: false, error: '설교를 찾을 수 없습니다.' }, { status: 404 })
    }

    const { error } = await supabaseAdmin
      .from('sermons')
      .delete()
      .eq('id', params.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('DELETE /api/sermons/[id] error:', err)
    return NextResponse.json({ success: false, error: err.message || '삭제 실패' }, { status: 500 })
  }
}
