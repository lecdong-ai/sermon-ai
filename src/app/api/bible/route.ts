import { NextRequest, NextResponse } from 'next/server'
import { mapBookName } from '@/lib/bible/bookMap'

const DATA_URL = 'https://cdn.jsdelivr.net/gh/stranger828/bibleAPI@main/bible_structured.json'

interface Verse {
  book: string
  chapter: number
  verse: number
  content: string
}

let cachedData: Verse[] | null = null

async function loadBibleData(): Promise<Verse[]> {
  if (cachedData) return cachedData
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 15000)
  try {
    const res = await fetch(DATA_URL, { next: { revalidate: 86400 }, signal: controller.signal })
    if (!res.ok) throw new Error('성경 데이터를 불러오지 못했습니다')
    const data: Verse[] = await res.json()
    cachedData = data
    return data
  } finally {
    clearTimeout(timeoutId)
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const book = searchParams.get('book') || ''
    const chapter = parseInt(searchParams.get('chapter') || '0', 10)
    const verseStart = parseInt(searchParams.get('verseStart') || '0', 10)
    const verseEnd = parseInt(searchParams.get('verseEnd') || '0', 10)

    if (!book || !chapter) {
      return NextResponse.json({ success: false, error: '책과 장을 입력해주세요' }, { status: 400 })
    }

    const shortName = mapBookName(book)
    if (!shortName) {
      return NextResponse.json({ success: false, error: `'${book}'에 해당하는 성경 책을 찾을 수 없습니다` }, { status: 400 })
    }

    const data = await loadBibleData()

    const from = verseStart || 1
    const to = verseEnd || from

    const verses = data.filter(
      v => v.book === shortName && v.chapter === chapter && v.verse >= from && v.verse <= to
    ).sort((a, b) => a.verse - b.verse)

    if (verses.length === 0) {
      return NextResponse.json({ success: false, error: '해당 구절을 찾을 수 없습니다' }, { status: 404 })
    }

    const text = verses.map(v => `v${v.verse}. ${v.content}`).join('\n')

    return NextResponse.json({ success: true, text, verses: verses.map(v => ({ verse: v.verse, content: v.content })) })
  } catch (e: any) {
    console.error('[bible] Error:', e)
    return NextResponse.json({ success: false, error: e.message || '서버 오류' }, { status: 500 })
  }
}
