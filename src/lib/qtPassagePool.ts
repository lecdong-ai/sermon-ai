import { mapBookName } from './bible/bookMap'
import { countVersesInRange, getVersesInChapter, getTotalChapters, calculateRequiredVerses } from './bible/verseCounts'

export interface PoolInfo {
  available: number
  required: number
  deficit: number
  isSufficient: boolean
  shortageDays: number
  bookShort: string
}

export interface PassageRange {
  book: string
  chap: number
  verse: number
}

// passageStr(예: "에베소서 1:1-23" 또는 "1:1") → { book, chap, verse }
export function parsePassageRef(passageStr: string, defaultBook = ''): PassageRange | null {
  if (!passageStr) return null
  const cleaned = passageStr.trim()

  let m = cleaned.match(/^([^\d]+?)\s+(\d+)\s*[:장]\s*(\d+)/)
  if (m) {
    return { book: m[1].trim(), chap: parseInt(m[2], 10), verse: parseInt(m[3], 10) }
  }

  m = cleaned.match(/^(\d+)\s*[:장]\s*(\d+)/)
  if (m) {
    return { book: defaultBook.trim(), chap: parseInt(m[1], 10), verse: parseInt(m[2], 10) }
  }

  return null
}

export function parsePassageEndRef(passageStr: string, defaultBook = ''): PassageRange | null {
  if (!passageStr) return null
  const cleaned = passageStr.trim()

  let m = cleaned.match(/^([^\d]+?)\s+(\d+)\s*[:장]\s*(\d+)/)
  if (m) {
    return { book: m[1].trim(), chap: parseInt(m[2], 10), verse: parseInt(m[3], 10) }
  }

  m = cleaned.match(/^(\d+)\s*[:장]\s*(\d+)/)
  if (m) {
    return { book: defaultBook.trim(), chap: parseInt(m[1], 10), verse: parseInt(m[2], 10) }
  }

  m = cleaned.match(/(\d+)\s*[:장]\s*(\d+)(?:\s*[-~]\s*(\d+))?$/)
  if (m) {
    const chap = parseInt(m[1], 10)
    const verse = m[3] ? parseInt(m[3], 10) : parseInt(m[2], 10)
    return { book: defaultBook.trim(), chap, verse }
  }

  return null
}

// 사용된 본문들에서 마지막 절 추출
function extractLastRefFromUsedPassages(passages: string[]): PassageRange | null {
  for (let i = passages.length - 1; i >= 0; i--) {
    const m = passages[i].match(/(\d+)\s*[:：]\s*(\d+)(?:\s*[-~]\s*(\d+))?$/)
    if (m) {
      const chap = parseInt(m[1])
      const endV = m[3] ? parseInt(m[3]) : parseInt(m[2])
      return { book: '', chap, verse: endV }
    }
  }
  return null
}

// 본문 범위가 충분한지 사전 검증 (AI 호출 전 실행)
export function verifyPassagePool(
  bibleBook: string,
  startPassage: string,
  endPassage: string | null,
  daysCount: number,
  minPerDay = 8
): PoolInfo {
  const startRef = parsePassageRef(startPassage, bibleBook)
  const short = mapBookName(bibleBook) || bibleBook

  if (!startRef) {
    return {
      available: 999, required: daysCount, deficit: 0,
      isSufficient: true, shortageDays: 0, bookShort: short
    }
  }

  // 종료 본문이 있으면 그 범위로 계산
  if (endPassage && endPassage.trim()) {
    const endRef = parsePassageEndRef(endPassage, bibleBook)
    if (endRef) {
      const available = countVersesInRange(
        bibleBook, startRef.chap, startRef.verse,
        endRef.chap, endRef.verse
      )
      const effectiveMin = Math.min(minPerDay, 5)
      const required = Math.max(daysCount, calculateRequiredVerses(daysCount, effectiveMin))
      const isSufficient = available >= Math.min(daysCount, 3) || available >= required
      const deficit = isSufficient ? 0 : Math.max(0, required - available)
      return {
        available: Math.max(available, 1),
        required,
        deficit,
        isSufficient,
        shortageDays: Math.ceil(deficit / effectiveMin),
        bookShort: short,
      }
    }
  }

  // 종료 본문 없음 → 책의 마지막 장까지
  const lastChap = getTotalChapters(short) || 1
  const lastVerse = getVersesInChapter(short, lastChap) || 30
  const available = countVersesInRange(
    bibleBook, startRef.chap, startRef.verse,
    lastChap, lastVerse
  )
  const effectiveMin = Math.min(minPerDay, 8)
  const required = calculateRequiredVerses(daysCount, effectiveMin)
  const isSufficient = available >= Math.min(daysCount, required)
  const deficit = isSufficient ? 0 : Math.max(0, required - available)

  return {
    available,
    required,
    deficit,
    isSufficient,
    shortageDays: Math.ceil(deficit / effectiveMin),
    bookShort: short,
  }
}

// AI 응답에서 사용된 본문 범위들을 추출 (중복 검증용)
export function extractUsedPassages(splitDays: { passage?: string }[]): string[] {
  return splitDays
    .filter(d => d.passage && d.passage.trim())
    .map(d => d.passage!.trim())
}

// 본문 반복이 있는지 감지 (정확한 범위 비교)
export function detectDuplicatePassages(passages: string[]): { hasDuplicate: boolean; duplicates: string[] } {
  const seen = new Map<string, number>()
  const duplicates: string[] = []
  for (const p of passages) {
    const key = p.replace(/\s+/g, '')
    const count = (seen.get(key) || 0) + 1
    seen.set(key, count)
    if (count > 1) duplicates.push(p)
  }
  return { hasDuplicate: duplicates.length > 0, duplicates: [...new Set(duplicates)] }
}

// 잔여 절 목록을 AI 프롬프트용 텍스트로 포맷
export function formatRemainingVersesForPrompt(
  bibleBook: string,
  usedPassages: string[],
  poolInfo: PoolInfo
): string {
  if (poolInfo.isSufficient) return ''

  const short = poolInfo.bookShort
  const usedChaps = new Set<number>()
  for (const p of usedPassages) {
    const m = p.match(/(\d+):/)
    if (m) usedChaps.add(parseInt(m[1]))
  }

  // 사용되지 않은 장 찾기
  const totalChaps = getTotalChapters(short)
  const remaining: string[] = []
  for (let c = 1; c <= totalChaps; c++) {
    if (!usedChaps.has(c)) {
      const maxV = getVersesInChapter(short, c)
      remaining.push(`${c}:1-${maxV}`)
    }
  }

  if (remaining.length === 0) return ''
  return `아직 사용하지 않은 장: ${remaining.join(', ')}`
}
