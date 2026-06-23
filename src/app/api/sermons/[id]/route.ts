import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getUserFromRequest } from '@/lib/auth'

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
    status: row.status || 'research',
    result: result,
    raw_text: row.raw_text || '',
    // B5: 다중 본문 (fallback to single)
    passages: row.passages && row.passages.length > 0
      ? row.passages
      : (row.passage
          ? [{
              id: 'legacy',
              book: row.book || '',
              chapterStart: row.chapter_start || 1,
              chapterEnd: row.chapter_end || row.chapter_start || 1,
              verseStart: row.verse_start || 1,
              verseEnd: row.verse_end || row.verse_start || 1,
              label: row.passage,
              role: 'primary',
            }]
          : []),
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromRequest(request)
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
    const user = await getUserFromRequest(request)
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
    if (body.status !== undefined && typeof body.status === 'string') updates.status = body.status
    // B5: 다중 본문 업데이트
    if (body.passages !== undefined && Array.isArray(body.passages)) updates.passages = body.passages

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
      ...(body.result?.wizardSnapshot !== undefined && { wizardSnapshot: body.result.wizardSnapshot }),
    }
    updates.result = resultUpdate

    const { error: sermonError } = await supabaseAdmin
      .from('sermons')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single()

    if (sermonError) {
      console.error('[PUT] Supabase update error:', sermonError)
      throw new Error(`DB 업데이트 실패: ${sermonError.message} (${sermonError.code || 'unknown'})`)
    }

    const { data: updatedSermon, error: selectError } = await supabaseAdmin
      .from('sermons')
      .select('*')
      .eq('id', params.id)
      .single()

    if (selectError) {
      console.error('[PUT] Supabase select error:', selectError)
      throw new Error(`DB 조회 실패: ${selectError.message} (${selectError.code || 'unknown'})`)
    }

    return NextResponse.json({ success: true, data: toSermon(updatedSermon || sermon) })
  } catch (err: any) {
    console.error('[PUT] /api/sermons/[id] error:', err)
    return NextResponse.json({ success: false, error: err.message || '수정 실패' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromRequest(request)
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
