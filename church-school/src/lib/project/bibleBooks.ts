export interface BibleBook {
  id: string
  name: string
  abbr: string
  chapters: number
  testament: 'OT' | 'NT'
}

export const BIBLE_BOOKS: BibleBook[] = [
  { id: 'gen', name: '창세기', abbr: '창', chapters: 50, testament: 'OT' },
  { id: 'exo', name: '출애굽기', abbr: '출', chapters: 40, testament: 'OT' },
  { id: 'lev', name: '레위기', abbr: '레', chapters: 27, testament: 'OT' },
  { id: 'num', name: '민수기', abbr: '민', chapters: 36, testament: 'OT' },
  { id: 'deu', name: '신명기', abbr: '신', chapters: 34, testament: 'OT' },
  { id: 'jos', name: '여호수아', abbr: '수', chapters: 24, testament: 'OT' },
  { id: 'jdg', name: '사사기', abbr: '삿', chapters: 21, testament: 'OT' },
  { id: 'rut', name: '룻기', abbr: '룻', chapters: 4, testament: 'OT' },
  { id: '1sa', name: '사무엘상', abbr: '삼상', chapters: 31, testament: 'OT' },
  { id: '2sa', name: '사무엘하', abbr: '삼하', chapters: 24, testament: 'OT' },
  { id: '1ki', name: '열왕기상', abbr: '왕상', chapters: 22, testament: 'OT' },
  { id: '2ki', name: '열왕기하', abbr: '왕하', chapters: 25, testament: 'OT' },
  { id: '1ch', name: '역대상', abbr: '대상', chapters: 29, testament: 'OT' },
  { id: '2ch', name: '역대하', abbr: '대하', chapters: 36, testament: 'OT' },
  { id: 'ezr', name: '에스라', abbr: '스', chapters: 10, testament: 'OT' },
  { id: 'neh', name: '느헤미야', abbr: '느', chapters: 13, testament: 'OT' },
  { id: 'est', name: '에스더', abbr: '에', chapters: 10, testament: 'OT' },
  { id: 'job', name: '욥기', abbr: '욥', chapters: 42, testament: 'OT' },
  { id: 'psa', name: '시편', abbr: '시', chapters: 150, testament: 'OT' },
  { id: 'pro', name: '잠언', abbr: '잠', chapters: 31, testament: 'OT' },
  { id: 'ecc', name: '전도서', abbr: '전', chapters: 12, testament: 'OT' },
  { id: 'son', name: '아가', abbr: '아', chapters: 8, testament: 'OT' },
  { id: 'isa', name: '이사야', abbr: '사', chapters: 66, testament: 'OT' },
  { id: 'jer', name: '예레미야', abbr: '렘', chapters: 52, testament: 'OT' },
  { id: 'lam', name: '예레미야애가', abbr: '애', chapters: 5, testament: 'OT' },
  { id: 'eze', name: '에스겔', abbr: '겔', chapters: 48, testament: 'OT' },
  { id: 'dan', name: '다니엘', abbr: '단', chapters: 12, testament: 'OT' },
  { id: 'hos', name: '호세아', abbr: '호', chapters: 14, testament: 'OT' },
  { id: 'joe', name: '요엘', abbr: '욜', chapters: 3, testament: 'OT' },
  { id: 'amo', name: '아모스', abbr: '암', chapters: 9, testament: 'OT' },
  { id: 'oba', name: '오바댜', abbr: '옵', chapters: 1, testament: 'OT' },
  { id: 'jon', name: '요나', abbr: '욘', chapters: 4, testament: 'OT' },
  { id: 'mic', name: '미가', abbr: '미', chapters: 7, testament: 'OT' },
  { id: 'nah', name: '나훔', abbr: '나', chapters: 3, testament: 'OT' },
  { id: 'hab', name: '하박국', abbr: '합', chapters: 3, testament: 'OT' },
  { id: 'zep', name: '스바냐', abbr: '습', chapters: 3, testament: 'OT' },
  { id: 'hag', name: '학개', abbr: '학', chapters: 2, testament: 'OT' },
  { id: 'zec', name: '스가랴', abbr: '슥', chapters: 14, testament: 'OT' },
  { id: 'mal', name: '말라기', abbr: '말', chapters: 4, testament: 'OT' },
  { id: 'mat', name: '마태복음', abbr: '마', chapters: 28, testament: 'NT' },
  { id: 'mar', name: '마가복음', abbr: '막', chapters: 16, testament: 'NT' },
  { id: 'luk', name: '누가복음', abbr: '눅', chapters: 24, testament: 'NT' },
  { id: 'jhn', name: '요한복음', abbr: '요', chapters: 21, testament: 'NT' },
  { id: 'act', name: '사도행전', abbr: '행', chapters: 28, testament: 'NT' },
  { id: 'rom', name: '로마서', abbr: '롬', chapters: 16, testament: 'NT' },
  { id: '1co', name: '고린도전서', abbr: '고전', chapters: 16, testament: 'NT' },
  { id: '2co', name: '고린도후서', abbr: '고후', chapters: 13, testament: 'NT' },
  { id: 'gal', name: '갈라디아서', abbr: '갈', chapters: 6, testament: 'NT' },
  { id: 'eph', name: '에베소서', abbr: '엡', chapters: 6, testament: 'NT' },
  { id: 'phi', name: '빌립보서', abbr: '빌', chapters: 4, testament: 'NT' },
  { id: 'col', name: '골로새서', abbr: '골', chapters: 4, testament: 'NT' },
  { id: '1th', name: '데살로니가전서', abbr: '살전', chapters: 5, testament: 'NT' },
  { id: '2th', name: '데살로니가후서', abbr: '살후', chapters: 3, testament: 'NT' },
  { id: '1ti', name: '디모데전서', abbr: '딤전', chapters: 6, testament: 'NT' },
  { id: '2ti', name: '디모데후서', abbr: '딤후', chapters: 4, testament: 'NT' },
  { id: 'tit', name: '디도서', abbr: '딛', chapters: 3, testament: 'NT' },
  { id: 'phm', name: '빌레몬서', abbr: '몬', chapters: 1, testament: 'NT' },
  { id: 'heb', name: '히브리서', abbr: '히', chapters: 13, testament: 'NT' },
  { id: 'jam', name: '야고보서', abbr: '약', chapters: 5, testament: 'NT' },
  { id: '1pe', name: '베드로전서', abbr: '벧전', chapters: 5, testament: 'NT' },
  { id: '2pe', name: '베드로후서', abbr: '벧후', chapters: 3, testament: 'NT' },
  { id: '1jn', name: '요한일서', abbr: '요일', chapters: 5, testament: 'NT' },
  { id: '2jn', name: '요한이서', abbr: '요이', chapters: 1, testament: 'NT' },
  { id: '3jn', name: '요한삼서', abbr: '요삼', chapters: 1, testament: 'NT' },
  { id: 'jud', name: '유다서', abbr: '유', chapters: 1, testament: 'NT' },
  { id: 'rev', name: '요한계시록', abbr: '계', chapters: 22, testament: 'NT' },
]

export function getBookById(id: string): BibleBook | undefined {
  return BIBLE_BOOKS.find(b => b.id === id)
}

export function getBooksByTestament(testament: 'OT' | 'NT'): BibleBook[] {
  return BIBLE_BOOKS.filter(b => b.testament === testament)
}
