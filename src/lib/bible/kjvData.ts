export interface BibleVerse {
  book: string
  chapter: number
  verse: number
  content: string
}

const KJV_CDN_URL = '/data/bible_kjv.json'

let _kjvData: BibleVerse[] | null = null

/**
 * KJV (King James Version) 성경 데이터를 lazy-load + 메모리 캐시.
 * - public/data/bible_kjv.json 에서 1회 fetch
 * - 변환된 한국어 약어 키 사용 (예: '창', '요', '롬') — bible/bookMap.ts 와 동일
 */
export async function loadKjvData(): Promise<BibleVerse[]> {
  if (_kjvData) return _kjvData
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 20000)
  try {
    const res = await fetch(KJV_CDN_URL, { signal: controller.signal })
    if (!res.ok) throw new Error(`Failed to load KJV bible data: ${res.status}`)
    _kjvData = (await res.json()) as BibleVerse[]
    return _kjvData!
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * 특정 범위의 KJV 절들을 문자열로 반환.
 * - verseStart ~ verseEnd 범위 (단일 장 내)
 * - bookShort: 한국어 약어 ('창', '요' 등)
 */
export async function getKjvVersesText(
  bookShort: string,
  chapter: number,
  verseStart: number,
  verseEnd: number,
): Promise<{ text: string; foundCount: number; expectedCount: number }> {
  try {
    const data = await loadKjvData()
    const matches = data
      .filter(
        (v) =>
          v.book === bookShort &&
          v.chapter === chapter &&
          v.verse >= verseStart &&
          v.verse <= verseEnd,
      )
      .sort((a, b) => a.verse - b.verse)
    const text = matches.map((v) => `[${v.verse}] ${v.content}`).join(' ')
    const expected = verseEnd - verseStart + 1
    return { text, foundCount: matches.length, expectedCount: expected }
  } catch (e) {
    return { text: '', foundCount: 0, expectedCount: verseEnd - verseStart + 1 }
  }
}
