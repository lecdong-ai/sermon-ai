import { supabase, supabaseAdmin } from './supabase'

const BOOK_MAP: Record<string, string> = {
  창세기: '창세기', 출애굽기: '출애굽기', 레위기: '레위기', 민수기: '민수기', 신명기: '신명기',
  여호수아: '여호수아', 사사기: '사사기', 룻기: '룻기', 사무엘상: '사무엘상', 사무엘하: '사무엘하',
  열왕기상: '열왕기상', 열왕기하: '열왕기하', 역대상: '역대상', 역대하: '역대하', 에스라: '에스라',
  느헤미야: '느헤미야', 에스더: '에스더', 욥기: '욥기', 시편: '시편', 잠언: '잠언',
  전도서: '전도서', 아가: '아가', 이사야: '이사야', 예레미야: '예레미야', 예레미야애가: '예레미야애가',
  에스겔: '에스겔', 다니엘: '다니엘', 호세아: '호세아', 요엘: '요엘', 아모스: '아모스',
  오바댜: '오바댜', 요나: '요나', 미가: '미가', 나훔: '나훔', 하박국: '하박국',
  스바냐: '스바냐', 학개: '학개', 스가랴: '스가랴', 말라기: '말라기',
  마태복음: '마태복음', 마가복음: '마가복음', 누가복음: '누가복음', 요한복음: '요한복음', 사도행전: '사도행전',
  로마서: '로마서', 고린도전서: '고린도전서', 고린도후서: '고린도후서', 갈라디아서: '갈라디아서', 에베소서: '에베소서',
  빌립보서: '빌립보서', 골로새서: '골로새서', 데살로니가전서: '데살로니가전서', 데살로니가후서: '데살로니가후서',
  디모데전서: '디모데전서', 디모데후서: '디모데후서', 디도서: '디도서', 빌레몬서: '빌레몬서', 히브리서: '히브리서',
  야고보서: '야고보서', 베드로전서: '베드로전서', 베드로후서: '베드로후서', 요한일서: '요한일서', 요한이서: '요한이서',
  요한삼서: '요한삼서', 유다서: '유다서', 요한계시록: '요한계시록',
}

function parsePassage(passage: string): { book: string; chapterStart?: number; verseStart?: number; chapterEnd?: number; verseEnd?: number } | null {
  const trimmed = passage.trim()
  const match = trimmed.match(/^(.+?)(?:\s+(\d+)(?::(\d+))?(?:\s*[-~]\s*(\d+)(?::(\d+))?)?)?$/)
  if (!match) return null

  const bookName = match[1].trim()
  const book = BOOK_MAP[bookName]
  if (!book) return null

  return {
    book,
    chapterStart: match[2] ? parseInt(match[2]) : undefined,
    verseStart: match[3] ? parseInt(match[3]) : undefined,
    chapterEnd: match[4] ? parseInt(match[4]) : undefined,
    verseEnd: match[5] ? parseInt(match[5]) : undefined,
  }
}

export async function fetchBibleText(passage: string): Promise<string | null> {
  const parsed = parsePassage(passage)
  if (!parsed) return null

  const { book, chapterStart, verseStart, chapterEnd, verseEnd } = parsed

  try {
    let query = supabase
      .from('bible_texts')
      .select('chapter, verse, text')
      .eq('book_name', book)
      .order('chapter', { ascending: true })
      .order('verse', { ascending: true })

    if (chapterStart && chapterEnd) {
      query = query.gte('chapter', chapterStart).lte('chapter', chapterEnd)
    } else if (chapterStart) {
      query = query.eq('chapter', chapterStart)
    }

    if (verseStart && chapterStart && !chapterEnd) {
      query = query.gte('verse', verseStart)
    }
    if (verseEnd && chapterEnd && chapterStart === chapterEnd) {
      query = query.lte('verse', verseEnd)
    }

    const { data, error } = await query.limit(200)

    if (error || !data || data.length === 0) return null

    return data
      .map(v => `${v.chapter}:${v.verse} ${v.text.trim()}`)
      .join('\n')
  } catch {
    return null
  }
}
