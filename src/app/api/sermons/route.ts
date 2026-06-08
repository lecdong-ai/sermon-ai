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

    const url = new URL(request.url)
    const sourceFilter = url.searchParams.get('source')

    let query = supabaseAdmin
      .from('sermons')
      .select('id, title, sermon_date, book, passage, chapter_start, chapter_end, verse_start, verse_end, season, status, version, updated_at, created_at, source, file_name, result')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (sourceFilter === 'upload') {
      query = query.eq('source', 'upload')
    } else {
      query = query.neq('source', 'upload')
    }

    const { data, error } = await query

    if (error) throw error

    const sermons = (data || []).map((row: any) => {
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
        fileName: row.file_name || '',
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
        status: row.status || 'draft',
        createdAt: row.created_at || new Date().toISOString(),
        updatedAt: row.updated_at || new Date().toISOString(),
      }
    })

    return NextResponse.json({ success: true, data: sermons })
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

    const { data: usage, error: usageErr } = await supabaseAdmin
      .from('user_usage')
      .select('plan')
      .eq('user_id', user.id)
      .maybeSingle()

    const plan = (usage?.plan) || (usageErr ? 'none' : 'none')
    if (plan === 'none') {
      return NextResponse.json({ success: false, error: 'Basic 플랜 이상에서만 설교를 작성할 수 있습니다. 구독 후 이용해주세요.' }, { status: 403 })
    }

    const body = await request.json()

    if (!body.title?.trim()) {
      return NextResponse.json({ success: false, error: '설교 제목을 입력해주세요.' }, { status: 400 })
    }

    const sermonData = {
      user_id: user.id,
      title: body.title,
      passage: body.normalizedPassage || body.bibleBook || '',
      book: body.bibleBook || null,
      chapter_start: body.chapterStart || null,
      chapter_end: body.chapterEnd || null,
      verse_start: body.verseStart || null,
      verse_end: body.verseEnd || null,
      sermon_date: body.date || null,
      series: null,
      season: body.season || null,
      audience: [],
      church_context: null,
      status: body.status || 'draft',
      version: 1,
      result: {
        preacher: body.preacher || '',
        sermonType: body.sermonType || '',
        audience: body.audience || '',
        seriesId: body.seriesId || '',
        coreMessage: body.coreMessage || '',
        outlineIntro: body.outlineIntro || '',
        outlinePoint1: body.outlinePoint1 || '',
        outlinePoint2: body.outlinePoint2 || '',
        outlinePoint3: body.outlinePoint3 || '',
        outlineConclusion: body.outlineConclusion || '',
        manuscript: body.manuscript || '',
        themeIds: body.themeIds || [],
        tagIds: body.tagIds || [],
        relatedSermonIds: body.relatedSermonIds || [],
      },
    }

    const { data, error } = await supabaseAdmin
      .from('sermons')
      .insert(sermonData)
      .select()
      .single()

    if (error) throw error

    const sermon = {
      id: data.id,
      title: data.title,
      date: data.sermon_date || '',
      preacher: sermonData.result.preacher,
      sermonType: sermonData.result.sermonType,
      audience: sermonData.result.audience,
      season: data.season || '',
      seriesId: sermonData.result.seriesId,
      bibleBook: data.book || '',
      chapterStart: data.chapter_start || 0,
      verseStart: data.verse_start || 0,
      chapterEnd: data.chapter_end || 0,
      verseEnd: data.verse_end || 0,
      normalizedPassage: data.passage || '',
      coreMessage: sermonData.result.coreMessage,
      outlineIntro: sermonData.result.outlineIntro,
      outlinePoint1: sermonData.result.outlinePoint1,
      outlinePoint2: sermonData.result.outlinePoint2,
      outlinePoint3: sermonData.result.outlinePoint3,
      outlineConclusion: sermonData.result.outlineConclusion,
      manuscript: sermonData.result.manuscript,
      themeIds: sermonData.result.themeIds,
      tagIds: sermonData.result.tagIds,
      relatedSermonIds: sermonData.result.relatedSermonIds,
      status: data.status || 'completed',
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }

    return NextResponse.json({ success: true, data: sermon }, { status: 201 })
  } catch (err: any) {
    console.error('POST /api/sermons error:', err)
    return NextResponse.json({ success: false, error: err.message || '생성 실패' }, { status: 500 })
  }
}
