import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getUserFromRequest } from '@/lib/auth'
import type { ArchivedSermon } from '@/lib/advanced/archiveData'

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const { data, error } = await supabaseAdmin
      .from('sermons')
      .select('id, title, sermon_date, book, passage, chapter_start, chapter_end, verse_start, verse_end, season, status, result, created_at, updated_at, series')
      .eq('user_id', user.id)
      .order('sermon_date', { ascending: false })

    if (error) throw error

    const sermons: ArchivedSermon[] = (data || []).map((row: any) => {
      const r = row.result || {}
      const audienceStr = r.audience || ''
      const audience = audienceStr ? audienceStr.split(',').map((s: string) => s.trim()).filter(Boolean) : []
      const vs = row.verse_start || 1
      const ve = row.verse_end
      const passageStr = row.passage ||
        (row.book ? `${row.book} ${row.chapter_start}:${vs}${ve && ve !== vs ? `-${ve}` : ''}` : '')
      const manuscript = r.manuscript || ''
      const wordCount = manuscript ? manuscript.length : 0
      const outlineTitles = [r.outlinePoint1, r.outlinePoint2, r.outlinePoint3].filter(Boolean)

      return {
        id: row.id,
        title: row.title || '',
        passage: passageStr,
        book: row.book || '',
        chapter: row.chapter_start || 1,
        verseStart: row.verse_start || 1,
        verseEnd: row.verse_end || null,
        sermonDate: row.sermon_date || row.created_at?.split('T')[0] || '',
        preacher: r.preacher || '',
        sermonType: r.sermonType || '',
        audience,
        season: row.season || '',
        coreMessage: r.coreMessage || '',
        wordCount,
        seriesName: row.series || '',
        themeNames: r.themeNames || [],
        tagNames: r.tagNames || [],
        introduction: r.outlineIntro || '',
        conclusion: r.outlineConclusion || '',
        outlineTitles,
        relatedIds: r.relatedSermonIds || [],
        createdAt: row.created_at || '',
        updatedAt: row.updated_at || '',
      }
    })

    return NextResponse.json({ success: true, data: sermons })
  } catch (err: any) {
    console.error('GET /api/archive error:', err)
    return NextResponse.json({ success: false, error: err.message || '조회 실패' }, { status: 500 })
  }
}
