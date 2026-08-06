import { forwardRef, useMemo } from 'react'
import React from 'react'
import { PAGE_SIZES } from '@/lib/qtPdfSizes'
import { getTemplate } from '@/lib/qtTemplates'
import { parseDays } from '@/lib/qtDayParser'
import { getFormattedDateListWeekdays, getWeekdayDateLabels, getWeekdayCountInMonth } from '@/lib/qtDates'
import { renderSmartLine, preprocessSmartText } from '@/lib/qtSmartLine'
import type { QTFormData, QTResult } from './QtGenerator'
import QtDailyDiaryPage from './QtDailyDiaryPage'
import QtMonthlyCalendarPage from './QtMonthlyCalendarPage'
import QtMonthlyOverviewPage from './QtMonthlyOverviewPage'
import QtWeeklyPlanPage from './QtWeeklyPlanPage'
import QtPrayerAnswerPage from './QtPrayerAnswerPage'
import QtScriptureArtPage from './QtScriptureArtPage'
import QtSundaySermonPage from './QtSundaySermonPage'
import QtSundaySermonDeepPage from './QtSundaySermonDeepPage'
import QtBibleReadingMapPage from './QtBibleReadingMapPage'
import QtMonthlyLetterPage from './QtMonthlyLetterPage'

import QtDailyDiaryPortrait from './portrait/QtDailyDiaryPortrait'
import QtMonthlyCalendarPortrait from './portrait/QtMonthlyCalendarPortrait'
import QtMonthlyOverviewPortrait from './portrait/QtMonthlyOverviewPortrait'
import QtWeeklyPlanPortrait from './portrait/QtWeeklyPlanPortrait'
import QtPrayerAnswerPortrait from './portrait/QtPrayerAnswerPortrait'
import QtScriptureArtPortrait from './portrait/QtScriptureArtPortrait'
import QtSundaySermonPortrait from './portrait/QtSundaySermonPortrait'
import QtSundaySermonDeepPortrait from './portrait/QtSundaySermonDeepPortrait'
import QtBibleReadingMapPortrait from './portrait/QtBibleReadingMapPortrait'
import QtMonthlyLetterPortrait from './portrait/QtMonthlyLetterPortrait'

interface QtSelectedInfo {
  book: string
  passage: string
  reason: string
  coreMessage: string
  isRecommended: boolean
}

export interface LayoutSettings {
  lineSpacing: string
  fontSize: string
  fontFamily: string
  margin: string
  hiddenSections: string[]
}

// ===== 표준 성경 66권 약자 및 한국어 정식 명칭 파싱 매핑 테이블 =====
const BIBLE_BOOK_MAP: Record<string, string> = {
  // 구약 39권
  '창': '창세기', '창세기': '창세기', 'Gen': '창세기', 'Genesis': '창세기',
  '출': '출애굽기', '출애굽기': '출애굽기', 'Exo': '출애굽기',
  '레': '레위기', '레위기': '레위기', 'Lev': '레위기',
  '민': '민수기', '민수기': '민수기', 'Num': '민수기',
  '신': '신명기', '신명기': '신명기', 'Deu': '신명기',
  '수': '여호수아', '여호수아': '여호수아', 'Jos': '여호수아',
  '삿': '사사기', '사사기': '사사기', 'Jdg': '사사기',
  '룻': '룻기', '룻기': '룻기', 'Rut': '룻기',
  '삼상': '사무엘상', '사무엘상': '사무엘상', '1Sa': '사무엘상',
  '삼하': '사무엘하', '사무엘하': '사무엘하', '2Sa': '사무엘하',
  '왕상': '열왕기상', '열왕기상': '열왕기상', '1Ki': '열왕기상',
  '왕하': '열왕기하', '열왕기하': '열왕기하', '2Ki': '열왕기하',
  '대상': '역대상', '역대상': '역대상', '1Ch': '역대상',
  '대하': '역대하', '역대하': '역대하', '2Ch': '역대하',
  '스': '에스라', '에스라': '에스라', 'Ezr': '에스라',
  '느': '느헤미야', '느헤미야': '느헤미야', 'Neh': '느헤미야',
  '에': '에스더', '에스더': '에스더', 'Est': '에스더',
  '욥': '욥기', '욥기': '욥기', 'Job': '욥기',
  '시': '시편', '시편': '시편', 'Psa': '시편', 'Psalms': '시편',
  '잠': '잠언', '잠언': '잠언', 'Pro': '잠언', 'Proverbs': '잠언',
  '전': '전도서', '전도서': '전도서', 'Ecc': '전도서',
  '아': '아가', '아가': '아가', 'Sng': '아가',
  '사': '이사야', '이사야': '이사야', 'Isa': '이사야',
  '렘': '예레미야', '예레미야': '예레미야', 'Jer': '예레미야',
  '애': '예레미야애가', '예레미야애가': '예레미야애가', 'Lam': '예레미야애가',
  '겔': '에스겔', '에스겔': '에스겔', 'Ezk': '에스겔',
  '단': '다니엘', '다니엘': '다니엘', 'Dan': '다니엘',
  '호': '호세아', '호세아': '호세아', 'Hos': '호세아',
  '욜': '요엘', '요엘': '요엘', 'Jol': '요엘',
  '암': '아모스', '아모스': '아모스', 'Amo': '아모스',
  '오': '오바디야', '오바디야': '오바디야', 'Oba': '오바디야',
  '요나': '요나', 'Jnh': '요나',
  '미': '미가', '미가': '미가', 'Mic': '미가',
  '나': '나훔', '나훔': '나훔', 'Nam': '나훔',
  '하': '하박국', '하박국': '하박국', 'Hab': '하박국',
  '습': '스바냐', '스바냐': '스바냐', 'Zep': '스바냐',
  '학': '학개', '학개': '학개', 'Hag': '학개',
  '슥': '스가랴', '스가랴': '스가랴', 'Zec': '스가랴',
  '말': '말라기', '말라기': '말라기', 'Mal': '말라기',

  // 신약 27권
  '마': '마태복음', '마태': '마태복음', '마태복음': '마태복음', 'Mat': '마태복음', 'Matthew': '마태복음',
  '막': '마가복음', '마가': '마가복음', '마가복음': '마가복음', 'Mar': '마가복음', 'Mark': '마가복음',
  '눅': '누가복음', '누가': '누가복음', '누가복음': '누가복음', 'Luk': '누가복음', 'Luke': '누가복음',
  '요': '요한복음', '요한': '요한복음', '요한복음': '요한복음', 'John': '요한복음', 'Jn': '요한복음',
  '행': '사도행전', '사도행전': '사도행전', 'Act': '사도행전', 'Acts': '사도행전',
  '롬': '로마서', '로마서': '로마서', 'Rom': '로마서', 'Romans': '로마서',
  '고전': '고린도전서', '고린도전서': '고린도전서', '1Co': '고린도전서',
  '고후': '고린도후서', '고린도후서': '고린도후서', '2Co': '고린도후서',
  '갈': '갈라디아서', '갈라디아서': '갈라디아서', 'Gal': '갈라디아서',
  '엡': '에베소서', '에베소서': '에베소서', 'Eph': '에베소서',
  '빌': '빌립보서', '빌립보서': '빌립보서', 'Php': '빌립보서',
  '골': '골로새서', '골로새서': '골로새서', 'Col': '골로새서',
  '살전': '데살로니가전서', '데살로니가전서': '데살로니가전서', '1Th': '데살로니가전서',
  '살후': '데살로니가후서', '데살로니가후서': '데살로니가후서', '2Th': '데살로니가후서',
  '딤전': '디모데전서', '디모데전서': '디모데전서', '1Ti': '디모데전서',
  '딤후': '디모데후서', '디모데후서': '디모데후서', '2Ti': '디모데후서',
  '딛': '디도서', '디도서': '디도서', 'Tit': '디도서',
  '몬': '빌레몬서', '빌레몬서': '빌레몬서', 'Phm': '빌레몬서',
  '히': '히브리서', '히브리서': '히브리서', 'Heb': '히브리서',
  '야': '야고보서', '야고보서': '야고보서', 'Jas': '야고보서',
  '벧전': '베드로전서', '베드로전서': '베드로전서', '1Pe': '베드로전서',
  '벧후': '베드로후서', '베드로후서': '베드로후서', '2Pe': '베드로후서',
  '요일': '요한일서', '요한1서': '요한일서', '요한일서': '요한일서', '1Jn': '요한일서',
  '요이': '요한이서', '요한2서': '요한이서', '요한이서': '요한이서', '2Jn': '요한이서',
  '요삼': '요한삼서', '요한3서': '요한삼서', '요한삼서': '요한삼서', '3Jn': '요한삼서',
  '유': '유다서', '유다서': '유다서', 'Jud': '유다서',
  '계': '요한계시록', '요한계시록': '요한계시록', 'Rev': '요한계시록',
}

export function parseBookName(text?: string): string | null {
  if (!text) return null
  const cleaned = text.trim()
  const match = cleaned.match(/^([가-힣1-3A-Za-z]+(?:\s*[가-힣]+)?)\s*\d+/)
  if (match) {
    const rawBook = match[1].trim()
    if (BIBLE_BOOK_MAP[rawBook]) return BIBLE_BOOK_MAP[rawBook]
  }
  for (const [key, val] of Object.entries(BIBLE_BOOK_MAP)) {
    if (cleaned.startsWith(key)) return val
  }
  return null
}

// ===== 개별 본문 구절에서 성경권, 장, 시작절, 끝절(20절 등)을 100% 정확히 파싱하는 도우미 =====
export function parseSingleVerseRange(passageText?: string): { book: string | null; chapter: number; verseStart: number; verseEnd: number; cleanText: string } | null {
  if (!passageText) return null
  const regex = /(?:([가-힣1-3A-Za-z]+(?:\s*[가-힣]+)?)\s*)?(\d+)\s*[:장]\s*(\d+)(?:\s*[~-]\s*(\d+)\s*절?)?/
  const m = passageText.match(regex)
  if (m) {
    const rawBook = m[1] ? m[1].trim() : ''
    const book = rawBook ? parseBookName(rawBook) : null
    const chapter = parseInt(m[2], 10)
    const verseStart = parseInt(m[3], 10)
    const verseEnd = m[4] ? parseInt(m[4], 10) : verseStart
    const verseOnly = verseStart === verseEnd ? `${chapter}:${verseStart}` : `${chapter}:${verseStart}-${verseEnd}`
    const cleanText = book ? `${book} ${verseOnly}` : verseOnly
    return { book, chapter, verseStart, verseEnd, cleanText }
  }
  return null
}

// ===== 원고 전체 텍스트에서 성경권 및 1일 차 시작 ~ 말일 차 끝 구절을 100% 영문 제거 및 한글 표준화하여 정밀 도출하는 스캐너 =====
export function extractAllBibleVersesFromText(text: string): { book: string | null; startPassage: string; endPassage: string; passageRangeText: string } {
  if (!text) return { book: null, startPassage: '', endPassage: '', passageRangeText: '' }

  const regex = /([가-힣1-3A-Za-z]+(?:\s*[가-힣]+)?)\s*(\d+)\s*[:장]\s*(\d+)(?:\s*[~-]\s*(\d+)\s*절?)?/g
  const matches: { book: string; chapter: number; verseStart: number; verseEnd?: number; cleanFull: string; verseOnly: string }[] = []

  let m: RegExpExecArray | null
  while ((m = regex.exec(text)) !== null) {
    const rawBook = m[1].trim()
    const parsedBook = parseBookName(rawBook)
    if (parsedBook) {
      const chapter = parseInt(m[2], 10)
      const verseStart = parseInt(m[3], 10)
      const verseEnd = m[4] ? parseInt(m[4], 10) : undefined
      
      const verseOnly = verseEnd ? `${chapter}:${verseStart}-${verseEnd}` : `${chapter}:${verseStart}`
      const cleanFull = `${parsedBook} ${verseOnly}`

      matches.push({
        book: parsedBook,
        chapter,
        verseStart,
        verseEnd,
        cleanFull,
        verseOnly,
      })
    }
  }

  if (matches.length === 0) {
    return { book: null, startPassage: '', endPassage: '', passageRangeText: '' }
  }

  // 가장 빈도수가 높은 성경권 선택
  const bookCounts: Record<string, number> = {}
  for (const item of matches) {
    bookCounts[item.book] = (bookCounts[item.book] || 0) + 1
  }
  let dominantBook = matches[0].book
  let maxCount = 0
  for (const [b, c] of Object.entries(bookCounts)) {
    if (c > maxCount) {
      maxCount = c
      dominantBook = b
    }
  }

  // 해당 성경권에 속하는 구절들만 추출하여 1일차 시작 & 말일차 끝 지정
  const bookMatches = matches.filter(item => item.book === dominantBook)
  const first = bookMatches[0]
  const last = bookMatches[bookMatches.length - 1]

  const startPassage = first.cleanFull
  const endPassage = last.cleanFull

  // 시작 구절과 끝 구절 연결 범위 텍스트 생성 (끝나는 절 20절까지 100% 명확 기록)
  let passageRangeText = ''
  const firstStartV = first.verseStart
  const lastEndV = last.verseEnd || last.verseStart

  if (first === last) {
    passageRangeText = first.cleanFull
  } else if (first.chapter === last.chapter) {
    passageRangeText = `${dominantBook} ${first.chapter}:${firstStartV}~${lastEndV}`
  } else {
    const firstPart = `${first.chapter}:${firstStartV}`
    const lastPart = `${last.chapter}:${lastEndV}`
    passageRangeText = `${dominantBook} ${firstPart} ~ ${lastPart}`
  }

  return {
    book: dominantBook,
    startPassage,
    endPassage,
    passageRangeText,
  }
}

interface QtPdfLayoutProps {
  form: QTFormData
  result: QTResult
  sizeOption: string
  templateId?: string
  onlyCover?: boolean
  startPassage?: string
  endPassage?: string
  userMemos?: Record<number, string>
  isBilingualSideBySide?: boolean
  selectedInfo?: QtSelectedInfo | null
  daySectionTitles?: Record<number, string[]>
  monthCalendarStrip?: {
    month: string
    daysInMonth: number
    activeDays: number[]
    dayHasContent: boolean[]
  }
  layoutSettings?: LayoutSettings
  editedContent?: Record<number, Record<string, string>>
  includeDiaryPage?: boolean
  includeMonthlyPlanner?: boolean
}

// 캘린더 스트립을 표시할 sizeOption 화이트리스트
const STRIP_SIZE_OPTIONS = new Set(['A4Landscape', 'A4Portrait', 'iPad Pro 12.9', 'iPad Pro 12.9 Landscape', 'Tablet (iPad 4:3)'])

const FONT_FAMILIES: Record<string, string> = {
  gothic: "'Noto Sans KR', 'Malgun Gothic', sans-serif",
  myeongjo: "'Noto Serif KR', 'Nanum Myeongjo', serif",
  english: "'Inter', 'Noto Sans KR', sans-serif",
}

function parseBibleVerses(passageText: string) {
  const lines = passageText.split('\n')
  let korVerse = ''
  let engVerse = ''
  let passageRange = ''
  let readingGuide = ''
  let currentSection: 'kor' | 'eng' | null = null
  for (const raw of lines) {
    const line = raw.trim()
    if (!line) { currentSection = null; continue }
    const headerMatch = line.match(/^[-·•*]*\s*(개역개정|한글\s*핵심|핵심절|KJV|영어|NIV|본문\s*범위|본문\s*읽기\s*안내)/i)
    if (headerMatch) {
      const h = headerMatch[1].toLowerCase()
      if ((h === '개역개정' || h.includes('핵심') || h.includes('한글')) && !line.match(/KJV|NIV/i)) {
        const rest = line.replace(/^[-·•*]*\s*개역개정\s*(전체\s*본문|핵심절)?\s*(또는\s*본문\s*범위\s*안내)?\s*[:：]?\s*/i, '').trim()
        if (rest) korVerse = rest
        else currentSection = 'kor'
      } else if (h === 'kjv' || h === 'niv' || h === '영어' || line.match(/^[-·•*]*\s*(KJV|NIV)/i)) {
        const rest = line.replace(/^[-·•*]*\s*(KJV|NIV)\s*(전체\s*본문|핵심절)?\s*(또는\s*본문\s*범위\s*안내)?\s*[:：]?\s*/i, '').trim()
        if (rest) engVerse = rest
        else currentSection = 'eng'
      } else if (h.includes('본문') && h.includes('범위')) {
        passageRange = line.replace(/^[-·•*]*\s*본문\s*범위\s*[:：]?\s*/i, '').trim()
        currentSection = null
      } else if (h.includes('읽기') || h.includes('안내')) {
        readingGuide = line.replace(/^[-·•*]*\s*본문\s*읽기\s*안내\s*[:：]?\s*/i, '').trim()
        currentSection = null
      } else {
        currentSection = null
      }
    } else if (currentSection === 'kor') {
      korVerse += (korVerse ? '\n' : '') + line
    } else if (currentSection === 'eng') {
      engVerse += (engVerse ? '\n' : '') + line
    }
  }
  return { korVerse, engVerse, passageRange, readingGuide }
}

function QtPdfLayout({ form, result, sizeOption, templateId = 'publication-2a', onlyCover = false, startPassage, endPassage, userMemos = {}, isBilingualSideBySide = false, selectedInfo, daySectionTitles, monthCalendarStrip, layoutSettings, editedContent, includeDiaryPage, includeMonthlyPlanner }: QtPdfLayoutProps, ref: React.Ref<HTMLDivElement>) {
  const ls = layoutSettings || {}
  const fontScale = ls.fontSize === 'small' ? 0.9 : ls.fontSize === 'large' ? 1.15 : 1.0
  const marginScale = ls.margin === 'narrow' ? 0.7 : ls.margin === 'wide' ? 1.15 : 1.0
  const activeLineHeight = ls.lineSpacing || '1.3'
  const activeFontFamily = FONT_FAMILIES[ls.fontFamily || 'gothic'] || FONT_FAMILIES.gothic
  const hiddenSet = new Set(ls.hiddenSections || [])

  const yearNum = useMemo(() => {
    if (form.startDate) {
      const parts = form.startDate.split('-')
      if (parts.length >= 1) return parseInt(parts[0], 10) || 2026
    }
    return 2026
  }, [form.startDate])

  const monthNum = useMemo(() => {
    if (monthCalendarStrip?.month) {
      const m = monthCalendarStrip.month.match(/(\d+)월/)
      if (m) return parseInt(m[1], 10)
    }
    if (form.startDate) {
      const parts = form.startDate.split('-')
      if (parts.length >= 2) return parseInt(parts[1], 10)
    }
    return 8
  }, [monthCalendarStrip, form.startDate])

  const size = PAGE_SIZES[sizeOption] || PAGE_SIZES['A4Landscape']
  // 스케일: 짧은 변(210mm) 기준 1.0
  const scale = Math.min(size.widthMm, size.heightMm) / 210.0
  const mmToPx = (mm: number) => Math.round(mm / 25.4 * 96 * scale)
  const cssW = `${mmToPx(size.widthMm)}px`
  const cssH = `${mmToPx(size.heightMm)}px`
  const tmpl = useMemo(() => getTemplate(templateId), [templateId])
  const t = tmpl
  const isLandscape = size.widthMm > size.heightMm
  const fullManuscript = result.fullManuscript || ''

  const parsedDays = useMemo(() => {
    try {
      const { days } = parseDays(fullManuscript)
      const hiddenFields = ['reflection', 'application', 'passageOverview', 'slowReading', 'observation', 'originalWords', 'englishWords', 'understanding', 'gospel', 'englishVerse', 'community', 'prayer', 'oneLine', 'leaderGuide']
      return days.map((day, i) => {
        let d = day
        if (editedContent?.[i]) {
          d = { ...d, ...editedContent[i] }
        }
        hiddenFields.forEach(f => {
          if (hiddenSet.has(f)) {
            (d as any)[f] = ''
          }
        })
        return d
      })
    } catch {
      return []
    }
  }, [fullManuscript, editedContent, hiddenSet])

  const weekdays = useMemo(() => {
    const dayCount = Math.max(parsedDays.length, 1)
    if (monthCalendarStrip) {
      const m = monthCalendarStrip.month.match(/(\d+)년\s*(\d+)월/)
      if (m) {
        const year = parseInt(m[1], 10), month = parseInt(m[2], 10)
        const dayNames = ['일', '월', '화', '수', '목', '금', '토']
        return monthCalendarStrip.activeDays.map(d => {
          const date = new Date(year, month - 1, d)
          const label = `${month}/${d} (${dayNames[date.getDay()]})`
          return { date, label }
        })
      }
    }
    if (!form.startDate) {
      const today = new Date()
      const dayNames = ['일', '월', '화', '수', '목', '금', '토']
      const mon = new Date(today); mon.setDate(mon.getDate() - mon.getDay() + 1)
      return Array.from({ length: Math.max(dayCount, 6) }, (_, i) => {
        const d = new Date(mon); d.setDate(mon.getDate() + i)
        return { date: d, label: `${d.getMonth() + 1}/${d.getDate()}(${dayNames[d.getDay()]})` }
      })
    }
    if (dayCount === getWeekdayCountInMonth(form.startDate)) {
      const labels = getWeekdayDateLabels(form.startDate)
      return labels.map(label => ({ date: new Date(), label }))
    }
    const list = getFormattedDateListWeekdays(form.startDate, dayCount)
    if (list.length > 0) return list.map(label => ({ date: new Date(), label }))
    return []
  }, [form.startDate, parsedDays.length, monthCalendarStrip])

  // 월간 vs 주간 구분 및 성경책 자동 감지 헬퍼
  const isMonthly = !!monthCalendarStrip || parsedDays.length > 7

  const monthName = useMemo(() => {
    if (monthCalendarStrip?.month) {
      const m = monthCalendarStrip.month.match(/(\d+)월/)
      if (m) return `${m[1]}월`
    }
    if (form.startDate) {
      const parts = form.startDate.split('-')
      if (parts.length >= 2) return `${parseInt(parts[1], 10)}월`
    }
    return `${new Date().getMonth() + 1}월`
  }, [monthCalendarStrip, form.startDate])

  // 원고 전체 텍스트 기반 멀티 스테이지 성경구절 스캔
  const textScanned = useMemo(() => {
    return extractAllBibleVersesFromText(fullManuscript)
  }, [fullManuscript])

  // 성경 권명 정밀 감지 로직 (요한복음, 마태복음 등 표준 66권 한글 정식 명칭 변환)
  const detectedBook = useMemo(() => {
    // 1. 전체 원고 스캔 결과 최우선 적용
    if (textScanned.book) return textScanned.book

    // 2. 큐티 내지 각 일차의 passage 구절에서 파싱
    for (const day of parsedDays) {
      if (day.passage) {
        const book = parseBookName(day.passage)
        if (book) return book
      }
    }
    // 3. AI 추천 성경 정보에서 파싱
    if (selectedInfo?.book) {
      const book = parseBookName(selectedInfo.book)
      if (book) return book
    }
    // 4. 시작/끝 구절 텍스트에서 파싱
    if (startPassage) {
      const book = parseBookName(startPassage)
      if (book) return book
    }
    // 5. form.bibleBook 약자/풀네임 파싱
    if (form.bibleBook && form.bibleBook !== '창세기') {
      const book = parseBookName(form.bibleBook)
      if (book) return book
    }
    return '성경'
  }, [textScanned.book, parsedDays, selectedInfo, startPassage, form.bibleBook])

  const coverMainTitle = useMemo(() => {
    if (selectedInfo?.isRecommended) return '오늘의 큐티'
    if (isMonthly) return `${monthName} Bunker 목양 월간 Q.T`
    return 'Bunker 목양 주간 Q.T'
  }, [selectedInfo, isMonthly, monthName])

  // 1일 차 본문 시작 구절
  const displayStartPassage = useMemo(() => {
    if (textScanned.startPassage) return textScanned.startPassage
    if (parsedDays[0]?.passage) return parsedDays[0].passage.trim()
    if (startPassage && !startPassage.includes('창세기')) return startPassage
    return ''
  }, [startPassage, textScanned.startPassage, parsedDays])

  // 말일 차 본문 끝 구절
  const displayEndPassage = useMemo(() => {
    if (textScanned.endPassage) return textScanned.endPassage
    const lastDay = parsedDays[parsedDays.length - 1]
    if (lastDay?.passage) return lastDay.passage.trim()
    if (endPassage && !endPassage.includes('창세기')) return endPassage
    return ''
  }, [endPassage, textScanned.endPassage, parsedDays])

  // 표지 본문 구절 범위 최종 표준화 텍스트 (1일 차 ~ 6일 차 본문 구절 20절 100% 명확 도출)
  const coverPassageText = useMemo(() => {
    // 1순위: parsedDays 의 첫 일차(0일 차) 구절과 마지막 일차(parsedDays.length - 1) 구절에서 직접 파싱!
    const firstParsed = parsedDays.length > 0 ? parseSingleVerseRange(parsedDays[0]?.passage) : null
    const lastParsed = parsedDays.length > 0 ? parseSingleVerseRange(parsedDays[parsedDays.length - 1]?.passage) : null

    const book = detectedBook || firstParsed?.book || lastParsed?.book || textScanned.book || '성경'

    if (firstParsed && lastParsed) {
      const startChapter = firstParsed.chapter
      const startVerse = firstParsed.verseStart
      const endChapter = lastParsed.chapter
      const endVerse = lastParsed.verseEnd || lastParsed.verseStart

      if (startChapter === endChapter) {
        return `${book} ${startChapter}:${startVerse}~${endVerse}`
      } else {
        return `${book} ${startChapter}:${startVerse} ~ ${endChapter}:${endVerse}`
      }
    }

    if (textScanned.passageRangeText) return textScanned.passageRangeText
    if (displayStartPassage && displayEndPassage) {
      if (displayStartPassage === displayEndPassage) return displayStartPassage
      return `${displayStartPassage} ~ ${displayEndPassage}`
    }
    return displayStartPassage || displayEndPassage || ''
  }, [parsedDays, detectedBook, textScanned.passageRangeText, displayStartPassage, displayEndPassage])

  // 캘린더 스트립 표시 여부: 월간 모드(isMonthly)이거나 monthCalendarStrip이 존재할 때 항상 표시
  const showStrip = isMonthly || !!monthCalendarStrip
  const STRIP_HEIGHT_MM = 12 // 본문 padding 확보 + 라벨 + 카드

  // 월간 캘린더 스트립 자동 생성 헬퍼
  const activeMonthStrip = useMemo(() => {
    if (monthCalendarStrip) return monthCalendarStrip
    const daysInMonth = new Date(yearNum, monthNum, 0).getDate()
    const activeDays = Array.from({ length: daysInMonth }, (_, i) => i + 1)
    const dayHasContent = Array.from({ length: daysInMonth }, () => true)
    return {
      month: `${yearNum}년 ${monthNum}월`,
      daysInMonth,
      activeDays,
      dayHasContent,
    }
  }, [monthCalendarStrip, yearNum, monthNum])

  // 페이지 스타일 — padding은 inner wrapper에서 처리
  const pageStyle: React.CSSProperties = {
    width: cssW,
    height: cssH,
    boxSizing: 'border-box',
    background: t.pageBg,
    color: t.textColor,
    fontFamily: activeFontFamily,
    position: 'relative',
    pageBreakAfter: 'always',
    marginBottom: '48px',
    borderRadius: '0px',
    boxShadow: '0 14px 45px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(0, 0, 0, 0.3)',
    overflow: 'hidden',
  }

  const pageMarginMm = 5 * marginScale
  const pageContentStyle: React.CSSProperties = {
    paddingTop: showStrip ? `${mmToPx(STRIP_HEIGHT_MM + 2)}px` : `${mmToPx(pageMarginMm)}px`,
    paddingBottom: `${mmToPx(pageMarginMm)}px`,
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
    position: 'relative',
    overflow: 'hidden',
  }

  // 캘린더 스트립 렌더 함수 (A4 가로 / iPad / Tablet / 세로 등 월간 페이지 상단 탑재)
  // activeDay: 현재 페이지의 day (1~31) — 동적 매칭
  const renderCalendarStrip = (activeDay: number) => {
    if (!showStrip || !activeMonthStrip) return null
    const { month, daysInMonth } = activeMonthStrip

    // 카드 폭 계산: 페이지 가로(mm) - 좌우 padding(16mm) - 라벨 영역(24mm) - 카드 사이 gap
    const pageW = size.widthMm
    const labelWidth = 24
    const sidePadding = 8
    const cardGap = 0.4
    const availableW = pageW - labelWidth - sidePadding * 2
    const cardW = (availableW - cardGap * (daysInMonth - 1)) / daysInMonth
    const cardH = 5.5

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

    return (
      <div
        id="qt-top-calendar-strip"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: `${mmToPx(STRIP_HEIGHT_MM)}px`,
          padding: `0 ${sidePadding}mm`,
          display: 'flex',
          alignItems: 'center',
          gap: `${4 * scale}px`,
          borderBottom: `1px solid #e2e8f0`,
          background: '#ffffff',
          zIndex: 20,
        }}
      >
        <span style={{
          fontFamily: t.fontHeading,
          fontSize: `${8 * scale}px`,
          fontWeight: 800,
          color: '#1e293b',
          letterSpacing: `${0.5 * scale}px`,
          whiteSpace: 'nowrap',
        }}>
          ◆ {month}
        </span>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: `${cardGap}mm`,
          flex: 1,
        }}>
          {days.map(d => {
            const isActive = d === activeDay
            const isSunday = new Date(yearNum, monthNum - 1, d).getDay() === 0

            let textColor = isActive ? '#ffffff' : '#334155'
            let bgColor = isActive ? '#0f172a' : '#f8fafc'
            let borderColor = isActive ? '#0f172a' : '#cbd5e1'
            let fontWeight: number | string = isActive ? 800 : 600

            // 일요일 차별화 스타일 (Rose / Grace Badge)
            if (isSunday) {
              if (isActive) {
                bgColor = '#e11d48'
                textColor = '#ffffff'
                borderColor = '#be123c'
                fontWeight = 900
              } else {
                bgColor = '#fff1f2'
                textColor = '#be123c'
                borderColor = '#fecdd3'
                fontWeight = 700
              }
            }

            return (
              <div
                key={d}
                data-nav-target={`day-${d}`}
                data-allow-jump="true"
                data-day={d}
                role="button"
                tabIndex={0}
                title={isSunday ? `${d}일 (주일 심층 설교 노트로 이동)` : `${d}일로 이동`}
                style={{
                  width: `${cardW}mm`,
                  height: `${cardH}mm`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: `${8 * scale}px`,
                  fontWeight,
                  color: textColor,
                  background: bgColor,
                  border: `0.5px solid ${borderColor}`,
                  borderRadius: `${1.5 * scale}px`,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isSunday && !isActive ? '0 1px 2px rgba(225,29,72,0.15)' : 'none',
                }}
              >
                {d}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ============= 공통 컴포넌트 =============
  const sectionLabel = (text: string) => (
    <div style={{
      display: 'flex', alignItems: 'baseline', gap: `${4 * scale * marginScale}px`,
      marginTop: `${3 * scale * marginScale}px`, marginBottom: `${1.5 * scale * marginScale}px`,
      borderBottom: `0.5px solid ${t.sectionLabelBorder || t.accent}`,
      paddingBottom: `${1.5 * scale * marginScale}px`,
    }}>
      <span style={{
        fontFamily: activeFontFamily,
        fontSize: `${9.5 * scale * fontScale}px`,
        fontWeight: 800,
        color: t.accent,
        letterSpacing: `${2.5 * scale}px`,
        textTransform: 'uppercase',
      }}>
        {text}
      </span>
    </div>
  )

  const bodyText = (text: string, fs: number) => (
    <div style={{
      fontSize: `${fs * scale * fontScale}px`,
      lineHeight: activeLineHeight,
      color: t.textColor,
      textAlign: 'justify',
      letterSpacing: '0.01em',
      fontFamily: activeFontFamily,
    }}>
      {preprocessSmartText(text).map((l, i) => (
        renderSmartLine(l, i, t.accent, `${1.5 * scale * marginScale}px`)
      ))}
    </div>
  )

  const pageNumber = (_num: number, _total: number) => null

  const parsedTitleSize = parseFloat(t.coverTitleSize || '28')

  // 글자수 기반 overflow 감지 (landscape / portrait 공유)
  const maxChars: Record<string, number> = {
    passageOverview: 250, slowReading: 350,
    observation: 700, understanding: 500, gospel: 1000,
    application: 300, reflection: 250, community: 150,
    originalWords: 800, englishWords: 800,
    englishVerse: 600, leaderGuide: 200, prayer: 350,
  }
  const trunc = (text: string, _key: string): string => {
    if (!text) return ''
    return text
  }

  // ============= A안: 가로 2페이지 (1일 2페이지, 2-A 디자인) =============
  const renderDailyLandscape = (day: any, dayIdx: number, dayNum?: number) => {
    const targetDayNum = dayNum || (dayIdx + 1)
    const verses = parseBibleVerses(day.passage || '')
    const firstSentence = (() => {
      if (day.passageOverview) {
        const line = day.passageOverview.split('\n').filter(l => l.trim())[0]?.trim() || ''
        return line.length > 120 ? line.slice(0, 120).replace(/\s+\S*$/, '') + '…' : line
      }
      if (selectedInfo?.coreMessage) return selectedInfo.coreMessage
      const first = (verses.korVerse || '').split(/[.!?。!?]/)[0]?.trim() || ''
      return first.length > 100 ? first.slice(0, 100).replace(/\s+\S*$/, '') + '…' : first
    })()
    // Page 1 = cover (1) + dayIdx*3 + 1, Page 2 = +2, Page 3 = +3 (optional)
    pageCounter = 2 + dayIdx * 3

    // Overflow detection — 글자수 기반
    const reflect = (key: string): string => trunc((day as any)[key] || '', key)
    const hasOverflow = (['observation', 'understanding', 'application', 'reflection', 'prayer']).some(k => {
      const t = (day as any)[k] || ''
      return t.length > (maxChars[k] || 500) * 0.85
    })

    // ============= 페이지 헤더 (네이비 풀폭 바) =============
    const landscapeHeader = (subtitle: string) => (
      <div style={{
        marginBottom: `${2.5 * scale}px`,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: t.accent,
          color: '#ffffff',
          padding: `${1.5 * scale * marginScale}px ${9 * scale}px`,
          marginBottom: `${1.5 * scale * marginScale}px`,
        }}>
          <div style={{
            fontFamily: t.fontHeading,
            fontSize: `${10 * scale}px`,
            fontWeight: 700,
            letterSpacing: `${2.5 * scale}px`,
          }}>
            DAY {dayIdx + 1} · {weekdays[dayIdx]?.label || ''}
          </div>
          <div style={{
            fontFamily: t.fontHeading,
            fontSize: `${9 * scale}px`,
            fontWeight: 600,
            letterSpacing: `${1.5 * scale}px`,
            opacity: 0.9,
          }}>
            {subtitle}
          </div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'baseline', gap: `${8 * scale}px`,
          borderBottom: `${0.75 * scale}px solid ${t.accent}`,
          paddingBottom: `${1.5 * scale}px`,
        }}>
          <div style={{
            fontFamily: t.fontHeading,
            fontSize: `${16 * scale}px`,
            fontWeight: 800,
            color: t.textColor,
            lineHeight: '1.2',
            letterSpacing: `${0.5 * scale}px`,
            flex: '0 0 auto',
          }}>
            {day.title || `Day ${dayIdx + 1}`}
          </div>
          {verses.passageRange && (
            <div style={{
              fontFamily: t.fontHeading,
              fontSize: `${11 * scale}px`,
              fontWeight: 500,
              color: t.textMuted,
              letterSpacing: `${0.5 * scale}px`,
              marginLeft: 'auto',
            }}>
              오늘의 본문 · {verses.passageRange}
            </div>
          )}
        </div>
        {/* 성경 소제목 (다중 결합 가능) */}
        {daySectionTitles && daySectionTitles[dayIdx] && daySectionTitles[dayIdx].length > 0 && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: `${3 * scale}px`,
            marginBottom: `${3 * scale}px`,
            padding: `${3 * scale}px ${6 * scale}px`,
            background: `${t.accent}1A`,
            border: `0.5px solid ${t.accent}40`,
            borderRadius: `${2 * scale}px`,
          }}>
            <span style={{
              fontFamily: t.fontHeading,
              fontSize: `${10 * scale}px`,
              fontWeight: 700,
              color: t.accent,
              letterSpacing: `${1.5 * scale}px`,
              textTransform: 'uppercase',
            }}>
              성경 소제목
            </span>
            {daySectionTitles[dayIdx].map((st, i) => (
              <span
                key={i}
                style={{
                  fontFamily: t.fontHeading,
                  fontSize: `${10.5 * scale}px`,
                  fontWeight: 600,
                  color: t.textColor,
                  padding: `${1 * scale}px ${4 * scale}px`,
                  background: `${t.accent}26`,
                  borderRadius: `${1.5 * scale}px`,
                }}
              >
                {i > 0 && <span style={{ color: t.accent, marginRight: `${2 * scale}px` }}>+</span>}
                {st}
              </span>
            ))}
          </div>
        )}
      </div>
    )

    // 주차 및 날짜 범위 계산 (월간 큐티 호환)
    const baseWeekNum = form.weekNumber ? parseInt(String(form.weekNumber), 10) : 1
    const weekOffset = Math.floor(dayIdx / 6)
    const currentWeekNum = isNaN(baseWeekNum) ? weekOffset + 1 : baseWeekNum + weekOffset
    const weekStartIndex = weekOffset * 6

    // 해당 주차의 6일 데이터 및 날짜 라벨 구하기
    let currentWeekDaysData = parsedDays.slice(weekStartIndex, weekStartIndex + 6)
    if (currentWeekDaysData.length < 6) {
      const needed = 6 - currentWeekDaysData.length
      const extra = Array.from({ length: needed }, (_, idx) => {
        const actualIdx = weekStartIndex + currentWeekDaysData.length + idx
        return parsedDays[actualIdx] || { title: `Day ${actualIdx + 1}`, passage: '' }
      })
      currentWeekDaysData = [...currentWeekDaysData, ...extra]
    }

    const currentWeekDatesData = weekdays.slice(weekStartIndex, weekStartIndex + 6)
    const weekStartLabel = currentWeekDatesData[0]?.label || ''
    const weekEndLabel = currentWeekDatesData[currentWeekDatesData.length - 1]?.label || ''
    const dayInWeekIdx = dayIdx % 6

    return (
      <div key={dayIdx}>
        {/* ══════ Page 1 (앞면): 말씀 중심 ══════ */}
        <div className="qt-page" id={`qt-page-day-${targetDayNum}`} data-page-key={`day-${targetDayNum}`} data-day={targetDayNum} style={pageStyle}>
          <div style={pageContentStyle}>
            {renderCalendarStrip(targetDayNum)}
            {landscapeHeader(`QT · ${form.bibleBook} · ${currentWeekNum}주`)}

            {/* ═══ 주간 펼침 (6일 그리드) — compact ═══ */}
            <div style={{
              marginBottom: `${3 * scale * marginScale}px`,
              padding: `${2 * scale}px ${4 * scale}px`,
              background: t.accentLight,
              borderLeft: `${1.5 * scale}px solid ${t.sectionLabelBorder}`,
              borderTop: `0.5px solid ${t.borderLight}`,
              borderRight: `0.5px solid ${t.borderLight}`,
              borderBottom: `0.5px solid ${t.borderLight}`,
            }}>
              <div style={{
                display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                marginBottom: `${1 * scale}px`,
                paddingBottom: `${1 * scale}px`,
                borderBottom: `0.5px solid ${t.sectionLabelBorder}`,
              }}>
                <div style={{
                  fontFamily: t.fontHeading,
                  fontSize: `${14 * scale}px`,
                  fontWeight: 800,
                  color: t.accent,
                  letterSpacing: `${2 * scale}px`,
                  textTransform: 'uppercase',
                }}>
                  ◆ 주간 펼침 · {form.bibleBook} · 제{currentWeekNum}주
                </div>
                <div style={{
                  fontFamily: t.fontHeading,
                  fontSize: `${11 * scale}px`,
                  fontWeight: 500,
                  color: t.textMuted,
                  letterSpacing: `${0.5 * scale}px`,
                  marginTop: `${1 * scale}px`,
                }}>
                  {weekStartLabel} ~ {weekEndLabel} · {currentWeekDaysData.length}일
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(6, 1fr)',
                gap: `${0.5 * scale}px`,
              }}>
                {currentWeekDaysData.map((d, i) => {
                  const actualDayNum = weekStartIndex + i + 1
                  const dv = parseBibleVerses(d?.passage || '')
                  const isCurrent = i === dayInWeekIdx
                  const passageShort = (dv.passageRange || d?.passage || '').split(' ').pop() || ''
                  const dayLabel = currentWeekDatesData[i]?.label || `Day ${actualDayNum}`
                  const displayTitle = (d?.title && d.title !== `Day ${i + 1}`) ? d.title : `Day ${actualDayNum}`

                  return (
                    <div key={i} style={{
                      display: 'flex', flexDirection: 'column',
                      padding: `${1.5 * scale}px ${1.5 * scale}px`,
                      background: isCurrent ? `${t.accent}1A` : 'transparent',
                      color: t.textColor,
                      borderTop: `0.5px solid ${t.borderLight}`,
                      minHeight: `${70 * scale}px`,
                    }}>
                      <div style={{
                        flex: 1,
                        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                        gap: `${1 * scale}px`,
                      }}>
                        <div style={{
                          fontFamily: t.fontHeading,
                          fontSize: `${12 * scale}px`,
                          fontWeight: 800,
                          color: isCurrent ? t.accent : t.accent,
                          letterSpacing: `${0.5 * scale}px`,
                          textTransform: 'uppercase',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: `${1 * scale}px`,
                        }}>
                          <span>{dayLabel}</span>
                          {isCurrent && <span style={{ fontSize: `${12 * scale}px`, color: t.accent }}>★</span>}
                        </div>
                        {passageShort && (
                          <div style={{
                            fontFamily: t.fontHeading,
                            fontSize: `${12 * scale}px`,
                            fontWeight: 700,
                            color: t.textColor,
                            textAlign: 'center',
                          }}>
                            {passageShort}
                          </div>
                        )}
                        <div style={{
                          fontFamily: t.fontHeading,
                          fontSize: `${12 * scale}px`,
                          fontWeight: 700,
                          color: t.textColor,
                          lineHeight: '1.2',
                          textAlign: 'center',
                        }}>
                          {displayTitle}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 본문 한눈에 — 2줄 풀폭 카드 */}
            {day.passageOverview && (
              <div style={{
                padding: `${6 * scale}px ${10 * scale}px`,
                marginBottom: `${10 * scale}px`,
                background: t.accentLight,
                borderRadius: `${8 * scale}px`,
                borderLeft: `${3.5 * scale}px solid ${t.accent}`,
                borderTop: `0.5px solid ${t.borderLight}`,
                borderRight: `0.5px solid ${t.borderLight}`,
                borderBottom: `0.5px solid ${t.borderLight}`,
              }}>
                <div style={{
                  fontFamily: t.fontHeading,
                  fontSize: `${10.5 * scale}px`,
                  fontWeight: 800,
                  color: t.accent,
                  letterSpacing: `${2.5 * scale}px`,
                  textTransform: 'uppercase',
                  marginBottom: `${3 * scale}px`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: `${4 * scale}px`,
                }}>
                  📖 BIBLE OVERVIEW · 본문 한눈에 보기
                </div>
                <div style={{
                  fontSize: `${12.5 * scale}px`,
                  lineHeight: activeLineHeight,
                  color: t.textColor,
                  textAlign: 'justify',
                  letterSpacing: '0.01em',
                  fontWeight: 500,
                }}>
                  {day.passageOverview.split('\n').filter(l => l.trim()).slice(0, 6).map(l =>
                    l.replace(/^[-*·•\s]*\s*(보기|단락\s*요약|문맥\s*위치|오늘의\s*핵심\s*메시지|핵심\s*메시지|요약)\s*[:：]\s*/i, '').trim()
                  ).join('\n')}
                </div>
              </div>
            )}

            {/* 한/영 성경 — 5:5 정확 분할, 절 동기화, 동일 폰트 */}
            {(() => {
              const korLines = verses.korVerse.split('\n').filter(l => l.trim())
              const nivLines = verses.engVerse.split('\n').filter(l => l.trim())
              const maxLen = Math.max(korLines.length, nivLines.length)
              return (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: `${18 * scale}px`,
                  marginBottom: `${10 * scale}px`,
                }}>
                  {/* 좌: 한글 · 개역개정 */}
                  <div>
                    <div style={{
                      fontFamily: t.fontHeading,
                      fontSize: `${10 * scale}px`,
                      fontWeight: 800,
                      color: t.accent,
                      letterSpacing: `${1.5 * scale}px`,
                      textTransform: 'uppercase',
                      marginBottom: `${4 * scale}px`,
                      paddingBottom: `${2 * scale}px`,
                      borderBottom: `1px solid ${t.sectionLabelBorder || t.border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                      <span>🇰🇷 한글 · 개역개정</span>
                      {verses.passageRange && (
                        <span style={{
                          fontFamily: t.fontHeading,
                          fontSize: `${9 * scale}px`,
                          fontWeight: 700,
                          color: t.textColor,
                          letterSpacing: `${0.3 * scale}px`,
                          textTransform: 'none',
                        }}>
                          {verses.passageRange}
                        </span>
                      )}
                    </div>
                    <div style={{
                      fontFamily: t.font,
                      fontSize: `${12.5 * scale}px`,
                      lineHeight: activeLineHeight,
                      color: t.textColor,
                      textAlign: 'justify',
                      wordBreak: 'keep-all',
                    }}>
                      {Array.from({ length: maxLen }).map((_, i) => (
                        <div key={i} style={{ marginBottom: `${3 * scale}px`, minHeight: `${16 * scale}px` }}>
                          {korLines[i] || ''}
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* 우: English · KJV */}
                  <div>
                    <div style={{
                      fontFamily: t.fontHeading,
                      fontSize: `${10 * scale}px`,
                      fontWeight: 800,
                      color: t.accent,
                      letterSpacing: `${1.5 * scale}px`,
                      textTransform: 'uppercase',
                      marginBottom: `${4 * scale}px`,
                      paddingBottom: `${2 * scale}px`,
                      borderBottom: `1px solid ${t.sectionLabelBorder || t.border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                      <span>🇺🇸 English · KJV</span>
                      {verses.passageRange && (
                        <span style={{
                          fontFamily: t.fontHeading,
                          fontSize: `${9 * scale}px`,
                          fontWeight: 700,
                          color: t.textColor,
                          letterSpacing: `${0.3 * scale}px`,
                          textTransform: 'none',
                        }}>
                          {verses.passageRange}
                        </span>
                      )}
                    </div>
                    <div style={{
                      fontFamily: t.font,
                      fontSize: `${12 * scale}px`,
                      lineHeight: activeLineHeight,
                      color: t.textColor,
                      textAlign: 'justify',
                    }}>
                      {Array.from({ length: maxLen }).map((_, i) => (
                        <div key={i} style={{ marginBottom: `${3 * scale}px`, minHeight: `${16 * scale}px` }}>
                          {nivLines[i] || ''}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* 영어로 붙드는 말씀 — (quote box card) */}
            {day.englishVerse && (
              <div style={{
                marginBottom: `${10 * scale}px`,
                padding: `${6 * scale}px ${10 * scale}px`,
                background: t.bibleQuoteBg,
                borderRadius: `${6 * scale}px`,
                borderLeft: `${3 * scale}px solid ${t.bibleQuoteBorder || t.accent}`,
                borderTop: `0.5px solid ${t.borderLight}`,
                borderRight: `0.5px solid ${t.borderLight}`,
                borderBottom: `0.5px solid ${t.borderLight}`,
              }}>
                <div style={{
                  fontFamily: t.fontHeading,
                  fontSize: `${10 * scale}px`,
                  fontWeight: 800,
                  color: t.accent,
                  letterSpacing: `${1.5 * scale}px`,
                  textTransform: 'uppercase',
                  marginBottom: `${3 * scale}px`,
                }}>
                  📜 MEMORY VERSE · 영어로 붙드는 말씀
                </div>
                <div style={{
                  fontFamily: "'Georgia', 'Noto Serif', 'Times New Roman', serif",
                  fontSize: `${12 * scale}px`,
                  lineHeight: activeLineHeight,
                  color: t.bibleQuoteText,
                  fontStyle: 'italic',
                }}>
                  {reflect('englishVerse').split('\n').filter(l => l.trim()).join('\n')}
                </div>
              </div>
            )}

            {/* 천천히 읽기 카드 */}
            {day.slowReading && (
              <div style={{
                padding: `${6 * scale}px ${10 * scale}px`,
                background: 'rgba(0,0,0,0.02)',
                borderRadius: `${6 * scale}px`,
                borderLeft: `${3 * scale}px solid ${t.accent}`,
                marginBottom: `${8 * scale}px`,
              }}>
                <div style={{
                  fontFamily: t.fontHeading,
                  fontSize: `${10 * scale}px`,
                  fontWeight: 800,
                  color: t.accent,
                  letterSpacing: `${1.5 * scale}px`,
                  textTransform: 'uppercase',
                  marginBottom: `${3 * scale}px`,
                }}>
                  🔍 SLOW READING · 천천히 읽기
                </div>
                {bodyText(
                  reflect('slowReading').split('\n').filter(l => l.trim()).slice(0, 4).join('\n'),
                  12
                )}
              </div>
            )}

            {pageNumber(pageCounter, totalPages)}
          </div>
        </div>

        {/* ══════ Page 2 (뒷면): 관찰/묵상/적용 — 2열 레이아웃 ══════ */}
        <div className="qt-page" style={pageStyle}>
          <div style={pageContentStyle}>
            {renderCalendarStrip(targetDayNum)}
            {landscapeHeader(`QT · ${form.bibleBook} · ${form.weekNumber}주 · 묵상`)}

            {/* 2열: 관찰 | 이해 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: `${10 * scale}px`,
              marginBottom: `${8 * scale}px`,
            }}>
              {day.observation && (
                <div style={{ maxHeight: `${130 * scale}px`, overflow: 'hidden' }}>
                  {sectionLabel('본문 관찰하기')}
                  {bodyText(reflect('observation'), 12)}
                </div>
              )}
              {day.understanding && (
                <div style={{ maxHeight: `${120 * scale}px`, overflow: 'hidden' }}>
                  {sectionLabel('말씀 이해하기')}
                  {bodyText(reflect('understanding'), 12)}
                </div>
              )}
            </div>

            {/* 복음으로 보기 (full, spacious banner) */}
            {day.gospel && (
              <div style={{
                marginBottom: `${10 * scale}px`,
                padding: `${6 * scale}px ${10 * scale}px`,
                background: `${t.accent}0D`,
                borderRadius: `${6 * scale}px`,
                borderLeft: `${3 * scale}px solid ${t.accent}`,
                borderTop: `0.5px solid ${t.borderLight}`,
                borderBottom: `0.5px solid ${t.borderLight}`,
                borderRight: `0.5px solid ${t.borderLight}`,
              }}>
                <div style={{
                  fontFamily: t.fontHeading,
                  fontSize: `${10 * scale}px`,
                  fontWeight: 800,
                  color: t.accent,
                  letterSpacing: `${2 * scale}px`,
                  textTransform: 'uppercase',
                  marginBottom: `${3 * scale}px`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: `${4 * scale}px`,
                }}>
                  ✦ 복음으로 보기
                </div>
                {bodyText(reflect('gospel'), 12)}
              </div>
            )}

            {/* 2열: 적용+나를 비추어 보기 | 단어 묵상 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: `${16 * scale}px`,
              marginBottom: `${10 * scale}px`,
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: `${8 * scale}px` }}>
                {day.application && (
                  <div style={{
                    padding: `${6 * scale}px ${8 * scale}px`,
                    background: t.accentLight || 'rgba(0,0,0,0.02)',
                    borderRadius: `${6 * scale}px`,
                    borderLeft: `${3 * scale}px solid ${t.accent}`,
                  }}>
                    <div style={{
                      fontFamily: t.fontHeading,
                      fontSize: `${9.5 * scale}px`,
                      fontWeight: 800,
                      color: t.accent,
                      letterSpacing: `${1.5 * scale}px`,
                      textTransform: 'uppercase',
                      marginBottom: `${3 * scale}px`,
                    }}>
                      🎯 오늘의 적용
                    </div>
                    {bodyText(reflect('application'), 12)}
                  </div>
                )}
                {day.reflection && (
                  <div style={{
                    padding: `${6 * scale}px ${8 * scale}px`,
                    background: 'rgba(0,0,0,0.02)',
                    borderRadius: `${6 * scale}px`,
                    borderLeft: `${3 * scale}px solid ${t.textMuted || t.accent}`,
                  }}>
                    <div style={{
                      fontFamily: t.fontHeading,
                      fontSize: `${9.5 * scale}px`,
                      fontWeight: 800,
                      color: t.textColor,
                      letterSpacing: `${1.5 * scale}px`,
                      textTransform: 'uppercase',
                      marginBottom: `${3 * scale}px`,
                    }}>
                      🪞 나를 비추어 보기
                    </div>
                    {bodyText(reflect('reflection'), 12)}
                  </div>
                )}
              </div>
              {(day.originalWords || day.englishWords) && (
                <div style={{
                  padding: `${8 * scale}px ${10 * scale}px`,
                  background: t.accentLight,
                  borderRadius: `${8 * scale}px`,
                  border: `1px solid ${t.borderLight || t.sectionLabelBorder}`,
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: `${6 * scale}px`,
                    paddingBottom: `${4 * scale}px`,
                    borderBottom: `1px solid ${t.sectionLabelBorder}`,
                  }}>
                    <span style={{
                      fontFamily: t.fontHeading,
                      fontSize: `${10 * scale * fontScale}px`,
                      fontWeight: 800,
                      color: t.accent,
                      letterSpacing: `${2 * scale}px`,
                      textTransform: 'uppercase',
                      display: 'flex',
                      alignItems: 'center',
                      gap: `${4 * scale}px`,
                    }}>
                      🔤 WORD MEDITATION · 단어 묵상
                    </span>
                    <span style={{
                      fontSize: `${8 * scale}px`,
                      fontWeight: 700,
                      color: t.textMuted,
                      background: 'rgba(0,0,0,0.04)',
                      padding: `${1 * scale}px ${5 * scale}px`,
                      borderRadius: `${4 * scale}px`,
                    }}>
                      원어 & 영어 단어 통찰
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: day.originalWords && day.englishWords ? '1fr 1fr' : '1fr', gap: `${10 * scale}px` }}>
                    {day.originalWords && (
                      <div style={{
                        padding: `${6 * scale}px ${8 * scale}px`,
                        background: t.prayerBoxBg || '#ffffff',
                        borderRadius: `${6 * scale}px`,
                        borderLeft: `${3 * scale}px solid ${t.accent}`,
                        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                      }}>
                        <div style={{
                          fontFamily: t.fontHeading,
                          fontSize: `${9 * scale}px`,
                          fontWeight: 700,
                          color: t.accent,
                          letterSpacing: `${1.5 * scale}px`,
                          marginBottom: `${4 * scale}px`,
                          display: 'flex',
                          alignItems: 'center',
                          gap: `${4 * scale}px`,
                        }}>
                          <span>🏛️ 원어 핵심</span>
                          <span style={{ fontSize: `${7.5 * scale}px`, opacity: 0.6, fontWeight: 500 }}>(HEBREW/GREEK)</span>
                        </div>
                        {bodyText(reflect('originalWords').split('\n').filter(l => l.trim()).slice(0, 3).join('\n'), 11.5)}
                      </div>
                    )}
                    {day.englishWords && (
                      <div style={{
                        padding: `${6 * scale}px ${8 * scale}px`,
                        background: t.prayerBoxBg || '#ffffff',
                        borderRadius: `${6 * scale}px`,
                        borderLeft: `${3 * scale}px solid ${t.accent}`,
                        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                      }}>
                        <div style={{
                          fontFamily: t.fontHeading,
                          fontSize: `${9 * scale}px`,
                          fontWeight: 700,
                          color: t.accent,
                          letterSpacing: `${1.5 * scale}px`,
                          marginBottom: `${4 * scale}px`,
                          display: 'flex',
                          alignItems: 'center',
                          gap: `${4 * scale}px`,
                        }}>
                          <span>🔤 영어 핵심</span>
                          <span style={{ fontSize: `${7.5 * scale}px`, opacity: 0.6, fontWeight: 500 }}>(KEYWORDS & MEDITATION)</span>
                        </div>
                        {bodyText(reflect('englishWords').split('\n').filter(l => l.trim()).slice(0, 3).join('\n'), 11.5)}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 공동체 연결 */}
            {day.community && (
              <div style={{
                marginBottom: `${8 * scale}px`,
                display: 'flex', alignItems: 'center', gap: `${6 * scale}px`,
                padding: `${4 * scale}px ${8 * scale}px`,
                background: t.accentLight,
                borderRadius: `${6 * scale}px`,
                borderLeft: `${2.5 * scale}px solid ${t.accent}`,
              }}>
                <span style={{
                  fontFamily: t.fontHeading,
                  fontSize: `${9.5 * scale}px`,
                  fontWeight: 800,
                  color: t.accent,
                  letterSpacing: `${1.5 * scale}px`,
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}>
                  🤝 공동체 연결
                </span>
                <span style={{
                  fontFamily: t.font,
                  fontSize: `${11.5 * scale}px`,
                  lineHeight: activeLineHeight,
                  color: t.textColor,
                }}>
                  {reflect('community').split('\n').filter(l => l.trim()).slice(0, 2).join(' · ')}
                </span>
              </div>
            )}

            {/* 오늘의 기도 — 전체폭 카드 */}
            {day.prayer && (
              <div style={{ marginBottom: `${10 * scale}px` }}>
                <div style={{
                  padding: `${8 * scale}px ${12 * scale}px`,
                  background: t.prayerBoxBg || 'rgba(0,0,0,0.03)',
                  borderRadius: `${8 * scale}px`,
                  borderLeft: `${3 * scale}px solid ${t.accent}`,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                }}>
                  <div style={{
                    fontFamily: t.fontHeading,
                    fontSize: `${9.5 * scale}px`,
                    fontWeight: 800,
                    color: t.accent,
                    letterSpacing: `${1.5 * scale}px`,
                    textTransform: 'uppercase',
                    marginBottom: `${4 * scale}px`,
                  }}>
                    🙏 오늘의 기도
                  </div>
                  <div style={{
                    fontFamily: t.font,
                    fontSize: `${11.5 * scale}px`,
                    lineHeight: activeLineHeight,
                    color: t.prayerBoxText || t.textColor,
                    fontStyle: 'italic',
                  }}>
                    {reflect('prayer').split('\n').filter(l => l.trim()).join('\n')}
                  </div>
                </div>
              </div>
            )}

            {/* 한 줄 기록 카드 */}
            <div style={{
              marginBottom: `${8 * scale}px`,
              padding: `${8 * scale}px ${12 * scale}px`,
              background: '#ffffff',
              borderRadius: `${8 * scale}px`,
              border: `1px solid ${t.border || '#e5e7eb'}`,
            }}>
              <div style={{
                fontFamily: t.fontHeading,
                fontSize: `${9.5 * scale}px`,
                fontWeight: 800,
                color: t.textMuted,
                letterSpacing: `${1.5 * scale}px`,
                textTransform: 'uppercase',
                marginBottom: `${4 * scale}px`,
                display: 'flex',
                alignItems: 'center',
                gap: `${4 * scale}px`,
              }}>
                <span>✍️ 오늘 내 마음에 남은 한 문장</span>
              </div>
              {userMemos[dayIdx] ? (
                <div style={{
                  fontFamily: t.font,
                  fontSize: `${11.5 * scale}px`,
                  lineHeight: activeLineHeight,
                  color: t.textColor,
                  fontStyle: 'italic',
                  minHeight: `${14 * scale}px`,
                  wordBreak: 'break-all',
                }}>
                  {userMemos[dayIdx]}
                </div>
              ) : (
                <div style={{
                  height: `${14 * scale}px`,
                  borderBottom: `1px dashed ${t.border || '#d1d5db'}`,
                }} />
              )}
            </div>

            {/* 인도자 해설 — 미주 */}
            {day.leaderGuide && (
              <div style={{
                position: 'absolute',
                bottom: `${mmToPx(10)}px`,
                left: 0,
                right: 0,
                padding: `${2 * scale}px ${8 * scale}px`,
                borderTop: `0.5px solid ${t.border}`,
              }}>
                <div style={{
                  fontFamily: t.fontHeading,
                  fontSize: `${11 * scale}px`,
                  fontWeight: 700,
                  color: t.textMuted,
                  letterSpacing: `${1.5 * scale}px`,
                  textTransform: 'uppercase',
                  marginBottom: `${1.5 * scale * marginScale}px`,
                }}>
                  인도자 해설
                </div>
                <div style={{
                  fontFamily: t.font,
                  fontSize: `${11 * scale}px`,
                  lineHeight: activeLineHeight,
                  color: t.textMuted,
                }}>
                  {reflect('leaderGuide').split('\n').filter(l => l.trim()).join('\n')}
                </div>
              </div>
            )}

            {pageNumber(pageCounter + 1, totalPages)}
            {hasOverflow && (
              <div style={{
                position: 'absolute',
                bottom: `${mmToPx(3)}px`,
                right: `${mmToPx(30)}px`,
                fontSize: `${7 * scale}px`,
                color: t.pageNumberColor,
                fontStyle: 'italic',
                opacity: 0.5,
              }}>
                (이어짐)
              </div>
            )}
          </div>
        </div>

        {/* ══════ Page 3 (조건부): 이어짐 ══════ */}
        {hasOverflow && (
          <div className="qt-page" style={pageStyle}>
            <div style={pageContentStyle}>
              {renderCalendarStrip(targetDayNum)}
              <div style={{
                fontFamily: t.fontHeading,
                fontSize: `${9 * scale}px`,
                fontWeight: 600,
                color: t.textMuted,
                letterSpacing: `${2 * scale}px`,
                textTransform: 'uppercase',
                marginBottom: `${3 * scale}px`,
                paddingBottom: `${2 * scale}px`,
                borderBottom: `0.5px solid ${t.borderLight}`,
              }}>
                DAY {dayIdx + 1} · 이어짐
              </div>

              {/* 본문 관찰하기 (전체) */}
              {day.observation && (day as any).observation!.length > (maxChars.observation || 700) * 0.85 && (
                <div>
                  {sectionLabel('본문 관찰하기 (이어서)')}
                  {bodyText((day as any).observation!, 11)}
                </div>
              )}

              {/* 말씀 이해하기 (전체) */}
              {day.understanding && (day as any).understanding!.length > (maxChars.understanding || 500) * 0.85 && (
                <div>
                  {sectionLabel('말씀 이해하기 (이어서)')}
                  {bodyText((day as any).understanding!, 11)}
                </div>
              )}

              {/* 나를 비추어 보기 (전체) */}
              {day.reflection && (day as any).reflection!.length > (maxChars.reflection || 250) * 0.85 && (
                <div>
                  {sectionLabel('나를 비추어 보기 (이어서)')}
                  {bodyText((day as any).reflection!, 11)}
                </div>
              )}

              {/* 오늘의 적용 (전체) */}
              {day.application && (day as any).application!.length > (maxChars.application || 300) * 0.85 && (
                <div>
                  {sectionLabel('오늘의 적용 (이어서)')}
                  {bodyText((day as any).application!, 11)}
                </div>
              )}

              {/* 오늘의 기도 (전체) */}
              {day.prayer && (day as any).prayer!.length > (maxChars.prayer || 350) * 0.85 && (
                <div>
                  {sectionLabel('오늘의 기도 (이어서)')}
                  <div style={{
                    padding: `${4 * scale}px ${7 * scale}px`,
                    background: t.prayerBoxBg,
                    borderLeft: `${1.5 * scale}px solid ${t.accent}`,
                    fontFamily: t.font,
                    fontSize: `${11 * scale}px`,
                    lineHeight: activeLineHeight,
                    color: t.prayerBoxText,
                    fontStyle: 'italic',
                  }}>
                    {(day as any).prayer!.split('\n').filter(l => l.trim()).join('\n')}
                  </div>
                </div>
              )}

              {pageNumber(pageCounter + 2, totalPages)}
            </div>
          </div>
        )}
      </div>
    )
  }

  // ============= A안: 세로 2면 (1일 2페이지, 2-A 디자인 유지) =============
  const renderDailyPortrait = (day: any, dayIdx: number, dayNum?: number) => {
    const targetDayNum = dayNum || (dayIdx + 1)
    const verses = parseBibleVerses(day.passage || '')
    pageCounter = 1 + dayIdx * 3 + 1

    // 주차 및 날짜 범위 계산 (월간 큐티 호환)
    const baseWeekNum = form.weekNumber ? parseInt(String(form.weekNumber), 10) : 1
    const weekOffset = Math.floor(dayIdx / 6)
    const currentWeekNum = isNaN(baseWeekNum) ? weekOffset + 1 : baseWeekNum + weekOffset
    const weekStartIndex = weekOffset * 6

    // 해당 주차의 6일 데이터 및 날짜 라벨 구하기
    let currentWeekDaysData = parsedDays.slice(weekStartIndex, weekStartIndex + 6)
    if (currentWeekDaysData.length < 6) {
      const needed = 6 - currentWeekDaysData.length
      const extra = Array.from({ length: needed }, (_, idx) => {
        const actualIdx = weekStartIndex + currentWeekDaysData.length + idx
        return parsedDays[actualIdx] || { title: `Day ${actualIdx + 1}`, passage: '' }
      })
      currentWeekDaysData = [...currentWeekDaysData, ...extra]
    }

    const currentWeekDatesData = weekdays.slice(weekStartIndex, weekStartIndex + 6)
    const weekStartLabel = currentWeekDatesData[0]?.label || ''
    const weekEndLabel = currentWeekDatesData[currentWeekDatesData.length - 1]?.label || ''
    const dayInWeekIdx = dayIdx % 6

    // Overflow detection (shared with landscape)
    const reflectP = (key: string): string => trunc((day as any)[key] || '', key)
    const hasOverflowP = (['observation', 'understanding', 'application', 'reflection', 'prayer']).some(k => {
      const t = (day as any)[k] || ''
      return t.length > (maxChars[k] || 500) * 0.85
    })

    return (
      <div key={dayIdx}>
        {/* Page 1: 말씀 중심 */}
        <div className="qt-page" id={`qt-page-day-${targetDayNum}`} data-page-key={`day-${targetDayNum}`} data-day={targetDayNum} style={pageStyle}>
          <div style={pageContentStyle}>
            {renderCalendarStrip(targetDayNum)}
            <div style={{
              marginBottom: `${5 * scale}px`,
              paddingBottom: `${3 * scale}px`,
              borderBottom: `${0.75 * scale}px solid ${t.accent}`,
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: t.accent,
                color: '#ffffff',
                padding: `${2 * scale * marginScale}px ${7 * scale}px`,
                marginBottom: `${4 * scale}px`,
              }}>
                <div style={{
                  fontFamily: t.fontHeading,
                  fontSize: `${10 * scale}px`,
                  fontWeight: 700,
                  letterSpacing: `${2.5 * scale}px`,
                }}>
                  DAY {dayIdx + 1} · {weekdays[dayIdx]?.label || ''}
                </div>
                <div style={{
                  fontFamily: t.fontHeading,
                  fontSize: `${9 * scale}px`,
                  fontWeight: 600,
                  letterSpacing: `${1.5 * scale}px`,
                  opacity: 0.85,
                }}>
                  {selectedInfo?.isRecommended ? `오늘의 일일 큐티 · ${form.bibleBook}` : `QT · ${form.bibleBook} · ${currentWeekNum}주`}
                </div>
              </div>
              <div style={{
                fontFamily: t.fontHeading,
                fontSize: `${17 * scale}px`,
                fontWeight: 800,
                color: t.textColor,
                lineHeight: '1.25',
                letterSpacing: `${0.5 * scale}px`,
                marginBottom: `${1.5 * scale * marginScale}px`,
              }}>
                {day.title || `Day ${dayIdx + 1}`}
              </div>
              {verses.passageRange && (
                <div style={{
                  fontFamily: t.fontHeading,
                  fontSize: `${10.5 * scale}px`,
                  fontWeight: 500,
                  color: t.textMuted,
                  letterSpacing: `${0.5 * scale}px`,
                }}>
                  오늘의 본문 · {verses.passageRange}
                </div>
              )}
            </div>

            {/* 주간 펼침 (portrait compact) */}
            <div style={{
              marginBottom: `${5 * scale}px`,
              padding: `${2 * scale}px ${3 * scale}px`,
              background: t.accentLight,
              borderLeft: `${1.5 * scale}px solid ${t.sectionLabelBorder}`,
              borderTop: `0.5px solid ${t.borderLight}`,
              borderRight: `0.5px solid ${t.borderLight}`,
              borderBottom: `0.5px solid ${t.borderLight}`,
            }}>
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                marginBottom: `${1 * scale}px`,
                paddingBottom: `${1 * scale}px`,
                borderBottom: `0.5px solid ${t.sectionLabelBorder}`,
              }}>
                <span style={{
                  fontFamily: t.fontHeading,
                  fontSize: `${14 * scale}px`,
                  fontWeight: 800,
                  color: t.accent,
                  letterSpacing: `${1.5 * scale}px`,
                  textTransform: 'uppercase',
                }}>
                  ◆ 주간 펼침 · {form.bibleBook} · 제{currentWeekNum}주
                </span>
                <span style={{
                  fontFamily: t.fontHeading,
                  fontSize: `${9 * scale}px`,
                  fontWeight: 500,
                  color: t.textMuted,
                  marginTop: `${1 * scale}px`,
                }}>
                  {weekStartLabel} ~ {weekEndLabel} · {currentWeekDaysData.length}일
                </span>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(6, 1fr)',
                gap: `${0.5 * scale}px`,
              }}>
                {currentWeekDaysData.map((d, i) => {
                  const actualDayNum = weekStartIndex + i + 1
                  const dv = parseBibleVerses(d?.passage || '')
                  const isCurrent = i === dayInWeekIdx
                  const passageShort = (dv.passageRange || d?.passage || '').split(' ').pop() || ''
                  const dayLabel = (currentWeekDatesData[i]?.label?.split('(')[0] || `Day ${actualDayNum}`)
                  const displayTitle = (d?.title && d.title !== `Day ${i + 1}`) ? d.title : `Day ${actualDayNum}`

                  return (
                    <div key={i} style={{
                      display: 'flex', flexDirection: 'column',
                      padding: `${1.5 * scale}px ${1 * scale}px`,
                      background: isCurrent ? `${t.accent}1A` : 'transparent',
                      color: t.textColor,
                      borderTop: `0.5px solid ${t.borderLight}`,
                      minHeight: `${85 * scale}px`,
                      gap: `${1 * scale}px`,
                    }}>
                      <div style={{
                        fontFamily: t.fontHeading,
                        fontSize: `${11 * scale}px`,
                        fontWeight: 800,
                        color: isCurrent ? t.accent : t.accent,
                        letterSpacing: `${0.3 * scale}px`,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      }}>
                        <span>{dayLabel}</span>
                        {isCurrent && <span style={{ fontSize: `${10 * scale}px`, color: t.accent }}>★</span>}
                      </div>
                      {passageShort && (
                        <div style={{
                          fontFamily: t.fontHeading,
                          fontSize: `${10 * scale}px`,
                          fontWeight: 700,
                          color: t.textColor,
                        }}>
                          {passageShort}
                        </div>
                      )}
                      <div style={{
                        fontFamily: t.fontHeading,
                        fontSize: `${10 * scale}px`,
                        fontWeight: 600,
                        color: t.textMuted,
                        lineHeight: '1.1',
                      }}>
                        {displayTitle}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 본문 한눈에 보기 (spacious card) */}
            {day.passageOverview && (
              <div style={{
                marginBottom: `${10 * scale}px`,
                padding: `${6 * scale}px ${10 * scale}px`,
                background: t.accentLight,
                borderRadius: `${8 * scale}px`,
                borderLeft: `${3.5 * scale}px solid ${t.accent}`,
                borderTop: `0.5px solid ${t.borderLight}`,
                borderRight: `0.5px solid ${t.borderLight}`,
                borderBottom: `0.5px solid ${t.borderLight}`,
              }}>
                <div style={{
                  fontFamily: t.fontHeading,
                  fontSize: `${10.5 * scale}px`,
                  fontWeight: 800,
                  color: t.accent,
                  letterSpacing: `${2.5 * scale}px`,
                  textTransform: 'uppercase',
                  marginBottom: `${3 * scale}px`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: `${4 * scale}px`,
                }}>
                  📖 BIBLE OVERVIEW · 본문 한눈에 보기
                </div>
                <div style={{
                  fontSize: `${12.5 * scale}px`,
                  lineHeight: activeLineHeight,
                  color: t.textColor,
                  textAlign: 'justify',
                  letterSpacing: '0.01em',
                  fontWeight: 500,
                }}>
                  {day.passageOverview.split('\n').filter(l => l.trim()).slice(0, 2).map(l =>
                    l.replace(/^[-*·•\s]*\s*(보기|단락\s*요약|문맥\s*위치|오늘의\s*핵심\s*메시지|핵심\s*메시지|요약)\s*[:：]\s*/i, '').trim()
                  ).join('\n')}
                </div>
              </div>
            )}

            {/* 한/영 병렬 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: `${18 * scale}px`,
              marginBottom: `${10 * scale}px`,
            }}>
              <div>
                <div style={{
                  fontFamily: t.fontHeading,
                  fontSize: `${10 * scale}px`,
                  fontWeight: 800,
                  color: t.accent,
                  letterSpacing: `${1.5 * scale}px`,
                  textTransform: 'uppercase',
                  marginBottom: `${4 * scale}px`,
                  paddingBottom: `${2 * scale}px`,
                  borderBottom: `1px solid ${t.sectionLabelBorder || t.border}`,
                }}>
                  🇰🇷 한글 · 개역개정
                </div>
                <div style={{
                  fontFamily: t.font,
                  fontSize: `${12.5 * scale}px`,
                  lineHeight: activeLineHeight,
                  color: t.textColor,
                  textAlign: 'justify',
                  wordBreak: 'keep-all',
                }}>
                  {verses.korVerse.split('\n').map((l, i) => (
                    <div key={i} style={{ marginBottom: `${3 * scale}px` }}>{l}</div>
                  ))}
                </div>
              </div>
              <div>
                <div style={{
                  fontFamily: t.fontHeading,
                  fontSize: `${10 * scale}px`,
                  fontWeight: 800,
                  color: t.accent,
                  letterSpacing: `${1.5 * scale}px`,
                  textTransform: 'uppercase',
                  marginBottom: `${4 * scale}px`,
                  paddingBottom: `${2 * scale}px`,
                  borderBottom: `1px solid ${t.sectionLabelBorder || t.border}`,
                }}>
                  🇺🇸 English · KJV
                </div>
                <div style={{
                  fontFamily: "'Georgia', 'Noto Serif', 'Times New Roman', serif",
                  fontSize: `${12 * scale}px`,
                  lineHeight: activeLineHeight,
                  color: t.textColor,
                  textAlign: 'justify',
                  fontStyle: 'italic',
                }}>
                  {verses.engVerse.split('\n').map((l, i) => (
                    <div key={i} style={{ marginBottom: `${3 * scale}px` }}>{l}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* 영어로 붙드는 말씀 (spacious quote box) */}
            {day.englishVerse && (
              <div style={{
                marginBottom: `${10 * scale}px`,
                padding: `${6 * scale}px ${10 * scale}px`,
                background: t.bibleQuoteBg,
                borderRadius: `${6 * scale}px`,
                borderLeft: `${3 * scale}px solid ${t.bibleQuoteBorder || t.accent}`,
                borderTop: `0.5px solid ${t.borderLight}`,
                borderRight: `0.5px solid ${t.borderLight}`,
                borderBottom: `0.5px solid ${t.borderLight}`,
              }}>
                <div style={{
                  fontFamily: t.fontHeading,
                  fontSize: `${10 * scale}px`,
                  fontWeight: 800,
                  color: t.accent,
                  letterSpacing: `${1.5 * scale}px`,
                  textTransform: 'uppercase',
                  marginBottom: `${3 * scale}px`,
                }}>
                  📜 MEMORY VERSE · 영어로 붙드는 말씀
                </div>
                <div style={{
                  fontFamily: "'Georgia', 'Noto Serif', 'Times New Roman', serif",
                  fontSize: `${12 * scale}px`,
                  lineHeight: activeLineHeight,
                  color: t.bibleQuoteText,
                  fontStyle: 'italic',
                }}>
                  {reflectP('englishVerse').split('\n').filter(l => l.trim()).join('\n')}
                </div>
              </div>
            )}

            {/* 천천히 읽기 카드 */}
            {day.slowReading && (
              <div style={{
                padding: `${6 * scale}px ${10 * scale}px`,
                background: 'rgba(0,0,0,0.02)',
                borderRadius: `${6 * scale}px`,
                borderLeft: `${3 * scale}px solid ${t.accent}`,
                marginBottom: `${8 * scale}px`,
              }}>
                <div style={{
                  fontFamily: t.fontHeading,
                  fontSize: `${10 * scale}px`,
                  fontWeight: 800,
                  color: t.accent,
                  letterSpacing: `${1.5 * scale}px`,
                  textTransform: 'uppercase',
                  marginBottom: `${3 * scale}px`,
                }}>
                  🔍 SLOW READING · 천천히 읽기
                </div>
                {bodyText(
                  reflectP('slowReading').split('\n').filter(l => l.trim()).slice(0, 4).join('\n'),
                  12
                )}
              </div>
            )}

            {pageNumber(pageCounter, totalPages)}
          </div>
        </div>

        {/* Page 2: 관찰/묵상/적용 — full width, 가독성 우선 */}
        <div className="qt-page" style={pageStyle}>
          <div style={pageContentStyle}>
            {renderCalendarStrip(monthCalendarStrip?.activeDays[dayIdx] ?? 0)}
            <div style={{
              marginBottom: `${4 * scale}px`,
              paddingBottom: `${2 * scale}px`,
              borderBottom: `${0.75 * scale}px solid ${t.accent}`,
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: t.accent,
                color: '#ffffff',
                padding: `${2 * scale * marginScale}px ${7 * scale}px`,
                marginBottom: `${3 * scale}px`,
              }}>
                <div style={{
                  fontFamily: t.fontHeading,
                  fontSize: `${10 * scale}px`,
                  fontWeight: 700,
                  letterSpacing: `${2.5 * scale}px`,
                }}>
                  {selectedInfo?.isRecommended ? `오늘의 일일 큐티 · 묵상` : `DAY ${dayIdx + 1} · 묵상`}
                </div>
                <div style={{
                  fontFamily: t.fontHeading,
                  fontSize: `${9 * scale}px`,
                  fontWeight: 600,
                  letterSpacing: `${1.5 * scale}px`,
                  opacity: 0.85,
                }}>
                  {selectedInfo?.isRecommended ? `독자적 묵상 · ${form.bibleBook}` : `QT · ${form.bibleBook} · ${form.weekNumber}주`}
                </div>
              </div>
              <div style={{
                fontFamily: t.fontHeading,
                fontSize: `${14 * scale}px`,
                fontWeight: 800,
                color: t.textColor,
                lineHeight: '1.25',
              }}>
                {day.title || `Day ${dayIdx + 1}`} · {verses.passageRange}
              </div>
            </div>

            {/* 관찰하기 (full) */}
            {day.observation && (
              <div style={{ marginBottom: `${5 * scale}px` }}>
                {sectionLabel('본문 관찰하기')}
                {bodyText(reflectP('observation'), 13)}
              </div>
            )}

            {/* 말씀 이해하기 */}
            {day.understanding && (
              <div style={{ marginBottom: `${5 * scale}px` }}>
                {sectionLabel('말씀 이해하기')}
                {bodyText(reflectP('understanding'), 12.5)}
              </div>
            )}

            {/* 복음으로 보기 (full, spacious banner) */}
            {day.gospel && (
              <div style={{
                marginBottom: `${10 * scale}px`,
                padding: `${6 * scale}px ${10 * scale}px`,
                background: `${t.accent}0D`,
                borderRadius: `${6 * scale}px`,
                borderLeft: `${3 * scale}px solid ${t.accent}`,
                borderTop: `0.5px solid ${t.borderLight}`,
                borderBottom: `0.5px solid ${t.borderLight}`,
                borderRight: `0.5px solid ${t.borderLight}`,
              }}>
                <div style={{
                  fontFamily: t.fontHeading,
                  fontSize: `${10 * scale}px`,
                  fontWeight: 800,
                  color: t.accent,
                  letterSpacing: `${2 * scale}px`,
                  textTransform: 'uppercase',
                  marginBottom: `${3 * scale}px`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: `${4 * scale}px`,
                }}>
                  ✦ 복음으로 보기
                </div>
                {bodyText(reflectP('gospel'), 12)}
              </div>
            )}

            {/* 나를 비추어 보기 (card style) */}
            {day.reflection && (
              <div style={{
                marginBottom: `${10 * scale}px`,
                padding: `${6 * scale}px ${8 * scale}px`,
                background: 'rgba(0,0,0,0.02)',
                borderRadius: `${6 * scale}px`,
                borderLeft: `${3 * scale}px solid ${t.textMuted || t.accent}`,
              }}>
                <div style={{
                  fontFamily: t.fontHeading,
                  fontSize: `${9.5 * scale}px`,
                  fontWeight: 800,
                  color: t.textColor,
                  letterSpacing: `${1.5 * scale}px`,
                  textTransform: 'uppercase',
                  marginBottom: `${3 * scale}px`,
                }}>
                  🪞 나를 비추어 보기
                </div>
                {bodyText(reflectP('reflection'), 12)}
              </div>
            )}

            {/* 적용 (card style) */}
            {day.application && (
              <div style={{
                marginBottom: `${10 * scale}px`,
                padding: `${6 * scale}px ${8 * scale}px`,
                background: t.accentLight || 'rgba(0,0,0,0.02)',
                borderRadius: `${6 * scale}px`,
                borderLeft: `${3 * scale}px solid ${t.accent}`,
              }}>
                <div style={{
                  fontFamily: t.fontHeading,
                  fontSize: `${9.5 * scale}px`,
                  fontWeight: 800,
                  color: t.accent,
                  letterSpacing: `${1.5 * scale}px`,
                  textTransform: 'uppercase',
                  marginBottom: `${3 * scale}px`,
                }}>
                  🎯 오늘의 적용
                </div>
                {bodyText(reflectP('application'), 13)}
              </div>
            )}

            {/* 공동체 연결 (compact line card) */}
            {day.community && (
              <div style={{
                marginBottom: `${10 * scale}px`,
                display: 'flex', alignItems: 'center', gap: `${6 * scale}px`,
                padding: `${4 * scale}px ${8 * scale}px`,
                background: t.accentLight,
                borderRadius: `${6 * scale}px`,
                borderLeft: `${2.5 * scale}px solid ${t.accent}`,
              }}>
                <span style={{
                  fontFamily: t.fontHeading,
                  fontSize: `${9.5 * scale}px`,
                  fontWeight: 800,
                  color: t.accent,
                  letterSpacing: `${1.5 * scale}px`,
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}>
                  🤝 공동체 연결
                </span>
                <span style={{
                  fontFamily: t.font,
                  fontSize: `${11.5 * scale}px`,
                  lineHeight: activeLineHeight,
                  color: t.textColor,
                }}>
                  {reflectP('community').split('\n').filter(l => l.trim()).slice(0, 2).join(' · ')}
                </span>
              </div>
            )}

            {/* 단어 묵상 */}
            {(day.originalWords || day.englishWords) && (
              <div style={{
                marginBottom: `${10 * scale}px`,
                padding: `${8 * scale}px ${10 * scale}px`,
                background: t.accentLight,
                borderRadius: `${8 * scale}px`,
                border: `1px solid ${t.borderLight || t.sectionLabelBorder}`,
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: `${6 * scale}px`,
                  paddingBottom: `${4 * scale}px`,
                  borderBottom: `1px solid ${t.sectionLabelBorder}`,
                }}>
                  <span style={{
                    fontFamily: t.fontHeading,
                    fontSize: `${10 * scale * fontScale}px`,
                    fontWeight: 800,
                    color: t.accent,
                    letterSpacing: `${2 * scale}px`,
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    gap: `${4 * scale}px`,
                  }}>
                    🔤 WORD MEDITATION · 단어 묵상
                  </span>
                  <span style={{
                    fontSize: `${8 * scale}px`,
                    fontWeight: 700,
                    color: t.textMuted,
                    background: 'rgba(0,0,0,0.04)',
                    padding: `${1 * scale}px ${5 * scale}px`,
                    borderRadius: `${4 * scale}px`,
                  }}>
                    원어 & 영어 단어 통찰
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: day.originalWords && day.englishWords ? '1fr 1fr' : '1fr', gap: `${10 * scale}px` }}>
                  {day.originalWords && (
                    <div style={{
                      padding: `${6 * scale}px ${8 * scale}px`,
                      background: t.prayerBoxBg || '#ffffff',
                      borderRadius: `${6 * scale}px`,
                      borderLeft: `${3 * scale}px solid ${t.accent}`,
                      boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                    }}>
                      <div style={{
                        fontFamily: t.fontHeading,
                        fontSize: `${9 * scale}px`,
                        fontWeight: 700,
                        color: t.accent,
                        letterSpacing: `${1.5 * scale}px`,
                        marginBottom: `${4 * scale}px`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: `${4 * scale}px`,
                      }}>
                        <span>🏛️ 원어 핵심</span>
                        <span style={{ fontSize: `${7.5 * scale}px`, opacity: 0.6, fontWeight: 500 }}>(HEBREW/GREEK)</span>
                      </div>
                      {bodyText(reflectP('originalWords').split('\n').filter(l => l.trim()).slice(0, 4).join('\n'), 11.5)}
                    </div>
                  )}
                  {day.englishWords && (
                    <div style={{
                      padding: `${6 * scale}px ${8 * scale}px`,
                      background: t.prayerBoxBg || '#ffffff',
                      borderRadius: `${6 * scale}px`,
                      borderLeft: `${3 * scale}px solid ${t.accent}`,
                      boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                    }}>
                      <div style={{
                        fontFamily: t.fontHeading,
                        fontSize: `${9 * scale}px`,
                        fontWeight: 700,
                        color: t.accent,
                        letterSpacing: `${1.5 * scale}px`,
                        marginBottom: `${4 * scale}px`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: `${4 * scale}px`,
                      }}>
                        <span>🔤 영어 핵심</span>
                        <span style={{ fontSize: `${7.5 * scale}px`, opacity: 0.6, fontWeight: 500 }}>(KEYWORDS & MEDITATION)</span>
                      </div>
                      {bodyText(reflectP('englishWords').split('\n').filter(l => l.trim()).slice(0, 4).join('\n'), 11.5)}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 오늘의 기도 — 전체폭 카드 */}
            {day.prayer && (
              <div style={{ marginBottom: `${10 * scale}px` }}>
                <div style={{
                  padding: `${8 * scale}px ${12 * scale}px`,
                  background: t.prayerBoxBg || 'rgba(0,0,0,0.03)',
                  borderRadius: `${8 * scale}px`,
                  borderLeft: `${3 * scale}px solid ${t.accent}`,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                }}>
                  <div style={{
                    fontFamily: t.fontHeading,
                    fontSize: `${9.5 * scale}px`,
                    fontWeight: 800,
                    color: t.accent,
                    letterSpacing: `${1.5 * scale}px`,
                    textTransform: 'uppercase',
                    marginBottom: `${4 * scale}px`,
                  }}>
                    🙏 오늘의 기도
                  </div>
                  <div style={{
                    fontFamily: t.font,
                    fontSize: `${11.5 * scale}px`,
                    lineHeight: activeLineHeight,
                    color: t.prayerBoxText || t.textColor,
                    fontStyle: 'italic',
                  }}>
                    {reflectP('prayer').split('\n').filter(l => l.trim()).join('\n')}
                  </div>
                </div>
              </div>
            )}

            {/* 오늘 내 마음에 남은 한 문장 카드 */}
            <div style={{
              marginBottom: `${8 * scale}px`,
              padding: `${8 * scale}px ${12 * scale}px`,
              background: '#ffffff',
              borderRadius: `${8 * scale}px`,
              border: `1px solid ${t.border || '#e5e7eb'}`,
            }}>
              <div style={{
                fontFamily: t.fontHeading,
                fontSize: `${9.5 * scale}px`,
                fontWeight: 800,
                color: t.textMuted,
                letterSpacing: `${1.5 * scale}px`,
                textTransform: 'uppercase',
                marginBottom: `${4 * scale}px`,
                display: 'flex',
                alignItems: 'center',
                gap: `${4 * scale}px`,
              }}>
                <span>✍️ 오늘 내 마음에 남은 한 문장</span>
              </div>
              {userMemos[dayIdx] ? (
                <div style={{
                  fontFamily: t.font,
                  fontSize: `${12 * scale}px`,
                  lineHeight: activeLineHeight,
                  color: t.textColor,
                  fontStyle: 'italic',
                  minHeight: `${14 * scale}px`,
                  paddingBottom: `${2 * scale}px`,
                  borderBottom: `0.5px solid ${t.border}`,
                  wordBreak: 'break-all',
                }}>
                  {userMemos[dayIdx]}
                </div>
              ) : (
                <div style={{
                  height: `${14 * scale}px`,
                  borderBottom: `0.5px solid ${t.border}`,
                }} />
              )}
            </div>

            {/* 인도자 해설 */}
            {day.leaderGuide && (
              <div style={{
                position: 'absolute',
                bottom: `${mmToPx(6)}px`,
                left: 0,
                right: 0,
              }}>
                <div style={{
                  fontFamily: t.fontHeading,
                  fontSize: `${11 * scale}px`,
                  fontWeight: 700,
                  color: t.textMuted,
                  letterSpacing: `${1.5 * scale}px`,
                  textTransform: 'uppercase',
                  marginBottom: `${1.5 * scale * marginScale}px`,
                }}>
                  인도자 해설
                </div>
                <div style={{
                  fontFamily: t.font,
                  fontSize: `${12 * scale}px`,
                  lineHeight: activeLineHeight,
                  color: t.textMuted,
                }}>
                  {reflectP('leaderGuide').split('\n').filter(l => l.trim()).join('\n')}
                </div>
              </div>
            )}

            {pageNumber(pageCounter + 1, totalPages)}
            {hasOverflowP && (
              <div style={{
                position: 'absolute',
                bottom: `${mmToPx(3)}px`,
                right: `${mmToPx(30)}px`,
                fontSize: `${7 * scale}px`,
                color: t.pageNumberColor,
                fontStyle: 'italic',
                opacity: 0.5,
              }}>
                (이어짐)
              </div>
            )}
          </div>
        </div>

        {/* ══════ Portrait Page 3 (조건부): 이어짐 ══════ */}
        {hasOverflowP && (
          <div className="qt-page" style={pageStyle}>
            <div style={pageContentStyle}>
              {renderCalendarStrip(monthCalendarStrip?.activeDays[dayIdx] ?? 0)}
              <div style={{
                fontFamily: t.fontHeading,
                fontSize: `${8 * scale}px`,
                fontWeight: 600,
                color: t.textMuted,
                letterSpacing: `${1.8 * scale}px`,
                textTransform: 'uppercase',
                marginBottom: `${1.5 * scale * marginScale}px`,
                paddingBottom: `${1.5 * scale}px`,
                borderBottom: `0.5px solid ${t.borderLight}`,
              }}>
                DAY {dayIdx + 1} · 이어짐
              </div>

              {day.observation && (day as any).observation!.length > (maxChars.observation || 700) * 0.85 && (
                <div>
                  {sectionLabel('본문 관찰하기 (이어서)')}
                  {bodyText((day as any).observation!, 11)}
                </div>
              )}
              {day.understanding && (day as any).understanding!.length > (maxChars.understanding || 500) * 0.85 && (
                <div>
                  {sectionLabel('말씀 이해하기 (이어서)')}
                  {bodyText((day as any).understanding!, 11)}
                </div>
              )}
              {day.reflection && (day as any).reflection!.length > (maxChars.reflection || 250) * 0.85 && (
                <div>
                  {sectionLabel('나를 비추어 보기 (이어서)')}
                  {bodyText((day as any).reflection!, 11)}
                </div>
              )}
              {day.application && (day as any).application!.length > (maxChars.application || 300) * 0.85 && (
                <div>
                  {sectionLabel('오늘의 적용 (이어서)')}
                  {bodyText((day as any).application!, 11)}
                </div>
              )}
              {day.prayer && (day as any).prayer!.length > (maxChars.prayer || 350) * 0.85 && (
                <div>
                  {sectionLabel('오늘의 기도 (이어서)')}
                  <div style={{
                    padding: `${3 * scale}px ${6 * scale}px`,
                    background: t.prayerBoxBg,
                    borderLeft: `${1.5 * scale}px solid ${t.accent}`,
                    fontFamily: t.font,
                    fontSize: `${10 * scale}px`,
                    lineHeight: activeLineHeight,
                    color: t.prayerBoxText,
                    fontStyle: 'italic',
                  }}>
                    {(day as any).prayer!.split('\n').filter(l => l.trim()).join('\n')}
                  </div>
                </div>
              )}

              {pageNumber(pageCounter + 2, totalPages)}
            </div>
          </div>
        )}
      </div>
    )
  }

  // ============= 표지 (0mm 풀배경 + 원래의 단정한 처음 크기 오버레이 패널 + 가운데 정렬) =============
  const renderCover = () => (
    <div className="qt-page" style={{
      ...pageStyle,
      backgroundImage: "url('/bg.jpg')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      padding: 0,
      margin: 0,
      overflow: 'hidden',
    }}>
      <div style={{
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        position: 'relative',
        padding: 0,
        margin: 0,
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: `${22 * scale}px ${32 * scale}px`,
          background: 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(8px)',
          borderRadius: `${14 * scale}px`,
          border: '1px solid rgba(255, 255, 255, 0.7)',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.12)',
          maxWidth: isLandscape ? '65%' : '85%',
          width: 'auto',
        }}>
          {t.coverOrnament && (
            <div style={{
              color: t.accent,
              fontSize: `${14 * scale}px`,
              letterSpacing: `${8 * scale}px`,
              marginBottom: `${14 * scale}px`,
              opacity: 0.8,
            }}>
              {t.coverOrnament}
            </div>
          )}
          {selectedInfo?.isRecommended && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: `${4 * scale}px`,
              padding: `${3 * scale}px ${9 * scale}px`, marginBottom: `${12 * scale}px`,
              background: t.accentLight,
              border: `0.5px solid ${t.sectionLabelBorder}`,
              fontFamily: t.fontHeading, fontSize: `${8 * scale}px`, fontWeight: 700,
              color: t.accent, letterSpacing: `${2 * scale}px`, textTransform: 'uppercase',
            }}>
              <span style={{ fontSize: `${9 * scale}px` }}>✦</span>
              AI 추천 본문
            </div>
          )}
          <div style={{
            fontFamily: t.fontHeading,
            fontSize: `${(parsedTitleSize > 24 ? 22 : parsedTitleSize) * scale}px`,
            fontWeight: 800,
            color: t.textColor,
            letterSpacing: `${3 * scale}px`,
            marginBottom: `${6 * scale}px`,
            lineHeight: '1.25',
          }}>
            {coverMainTitle}
          </div>
          <div style={{
            fontFamily: t.fontHeading,
            fontSize: `${10 * scale}px`,
            color: t.coverSubtitleColor,
            letterSpacing: `${2.5 * scale}px`,
            marginBottom: `${16 * scale}px`,
          }}>
            {form.seriesName || '말씀과 함께하는 큐티'}
          </div>
          <div style={{
            width: `${56 * scale}px`,
            height: `${1 * scale}px`,
            background: t.coverAccentLine,
            margin: `${10 * scale}px auto`,
          }} />
          <div style={{
            fontSize: `${12 * scale}px`,
            color: t.textMuted,
            lineHeight: '1.9',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            <div style={{
              fontFamily: t.fontHeading,
              fontSize: `${24 * scale}px`,
              fontWeight: 800,
              color: t.accent,
              marginBottom: `${6 * scale}px`,
              letterSpacing: `${1 * scale}px`,
            }}>
              {detectedBook}
            </div>
            <div style={{
              fontSize: `${12 * scale}px`,
              color: t.textColor,
              fontWeight: 600,
            }}>
              {isMonthly ? '월간 통합 큐티' : `제${form.weekNumber}주`}
            </div>
            {coverPassageText && (
              <div style={{
                fontSize: `${11 * scale}px`,
                color: t.textMuted,
                marginTop: `${6 * scale}px`,
                fontFamily: t.font,
                fontWeight: 600,
                letterSpacing: `${0.5 * scale}px`,
              }}>
                {coverPassageText}
              </div>
            )}
            <div style={{
              fontSize: `${9 * scale}px`,
              color: t.textMuted,
              marginTop: `${5 * scale}px`,
            }}>
              {weekdays[0]?.label} ~ {weekdays[weekdays.length - 1]?.label} {isMonthly ? `· 총 ${parsedDays.length}일` : ''}
            </div>
          </div>
        </div>
        <div style={{
          position: 'absolute',
          bottom: `${mmToPx(14)}px`,
          fontSize: `${8.5 * scale}px`,
          color: '#ffffff',
          textShadow: '0 1px 4px rgba(0,0,0,0.7)',
          letterSpacing: `${2 * scale}px`,
          fontWeight: 600,
        }}>
          bunker.ai.kr · 목회의 모든 순간을 잇다
        </div>
      </div>
    </div>
  )

  const totalPages = 1 + parsedDays.length * 3  // 1표지 + 1일=3페이지(overflow 대비)
  let pageCounter = 0

  function parseDayLabelHelper(label?: string, dayIdx: number = 0) {
    const dayNamesShort = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
    if (label) {
      const m = label.match(/(\d+)\/(\d+)\s*\(([^)]+)\)/)
      if (m) {
        const day = parseInt(m[2], 10)
        const rawDayName = m[3].toUpperCase()
        const nameMap: Record<string, string> = { '일': 'SUN', '월': 'MON', '화': 'TUE', '수': 'WED', '목': 'THU', '금': 'FRI', '토': 'SAT' }
        const dayName = nameMap[rawDayName] || rawDayName
        return { dayNum: day, dayName, dateLabel: `${String(day).padStart(2, '0')} ${dayName}` }
      }
    }
    const day = dayIdx + 1
    const dt = new Date(yearNum, monthNum - 1, day)
    const dayName = dayNamesShort[dt.getDay()]
    return { dayNum: day, dayName, dateLabel: `${String(day).padStart(2, '0')} ${dayName}` }
  }

  const isDiaryEnabled = includeDiaryPage ?? isMonthly
  const isPlannerEnabled = includeMonthlyPlanner ?? isMonthly

  const themeColor = t.accent || '#B8C6D9'

  if (onlyCover) {
    return (
      <div>
        <div ref={ref}>
          {renderCover()}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div ref={ref}>
        {/* 1. Cover Page */}
        {renderCover()}

        {/* 2. Monthly Calendar Page */}
        {isPlannerEnabled && (
          isLandscape ? (
            <QtMonthlyCalendarPage
              year={yearNum}
              month={monthNum}
              monthName={monthName}
              themeColor={themeColor}
              pageWidth={mmToPx(size.widthMm)}
              pageHeight={mmToPx(size.heightMm)}
            />
          ) : (
            <QtMonthlyCalendarPortrait
              year={yearNum}
              month={monthNum}
              monthName={monthName}
              themeColor={themeColor}
              pageWidth={mmToPx(size.widthMm)}
              pageHeight={mmToPx(size.heightMm)}
            />
          )
        )}

        {/* 3. Monthly Overview Page */}
        {isPlannerEnabled && (
          isLandscape ? (
            <QtMonthlyOverviewPage
              year={yearNum}
              monthName={monthName}
              themeColor={themeColor}
              pageWidth={mmToPx(size.widthMm)}
              pageHeight={mmToPx(size.heightMm)}
            />
          ) : (
            <QtMonthlyOverviewPortrait
              year={yearNum}
              monthName={monthName}
              themeColor={themeColor}
              pageWidth={mmToPx(size.widthMm)}
              pageHeight={mmToPx(size.heightMm)}
            />
          )
        )}

        {/* 3-2. Prayer & Grace Milestone Page */}
        {isPlannerEnabled && (
          isLandscape ? (
            <QtPrayerAnswerPage
              year={yearNum}
              monthName={monthName}
              themeColor={themeColor}
              pageWidth={mmToPx(size.widthMm)}
              pageHeight={mmToPx(size.heightMm)}
            />
          ) : (
            <QtPrayerAnswerPortrait
              year={yearNum}
              monthName={monthName}
              themeColor={themeColor}
              pageWidth={mmToPx(size.widthMm)}
              pageHeight={mmToPx(size.heightMm)}
            />
          )
        )}

        {/* 3-3. Scripture Art & Memory Card */}
        {isPlannerEnabled && (
          isLandscape ? (
            <QtScriptureArtPage
              year={yearNum}
              monthName={monthName}
              themeColor={themeColor}
              pageWidth={mmToPx(size.widthMm)}
              pageHeight={mmToPx(size.heightMm)}
            />
          ) : (
            <QtScriptureArtPortrait
              year={yearNum}
              monthName={monthName}
              themeColor={themeColor}
              pageWidth={mmToPx(size.widthMm)}
              pageHeight={mmToPx(size.heightMm)}
            />
          )
        )}

        {/* 3-4. Monthly Sunday Sermon Summary Table */}
        {isPlannerEnabled && (
          isLandscape ? (
            <QtSundaySermonPage
              year={yearNum}
              month={monthNum}
              monthName={monthName}
              themeColor={themeColor}
              pageWidth={mmToPx(size.widthMm)}
              pageHeight={mmToPx(size.heightMm)}
            />
          ) : (
            <QtSundaySermonPortrait
              year={yearNum}
              month={monthNum}
              monthName={monthName}
              themeColor={themeColor}
              pageWidth={mmToPx(size.widthMm)}
              pageHeight={mmToPx(size.heightMm)}
            />
          )
        )}

        {/* 3-5. Bible Reading 66 Journey Map */}
        {isPlannerEnabled && (
          isLandscape ? (
            <QtBibleReadingMapPage
              year={yearNum}
              monthName={monthName}
              themeColor={themeColor}
              pageWidth={mmToPx(size.widthMm)}
              pageHeight={mmToPx(size.heightMm)}
            />
          ) : (
            <QtBibleReadingMapPortrait
              year={yearNum}
              monthName={monthName}
              themeColor={themeColor}
              pageWidth={mmToPx(size.widthMm)}
              pageHeight={mmToPx(size.heightMm)}
            />
          )
        )}

        {/* 4. 1일부터 31일까지 월간 달력 일자별 렌더링 (평일: 큐티원고+데일리저널 / 일요일: 주일심층설교노트+주일데일리저널) */}
        {(() => {
          const totalDaysInMonth = new Date(yearNum, monthNum, 0).getDate()
          const dayNamesShort = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

          let qtIndex = 0
          let sundayCounter = 0

          const items = []
          for (let d = 1; d <= totalDaysInMonth; d++) {
            const dt = new Date(yearNum, monthNum - 1, d)
            const dayName = dayNamesShort[dt.getDay()]
            const paddedDay = String(d).padStart(2, '0')
            const dateLabel = `${paddedDay} ${dayName}`

            if (dayName === 'SUN') {
              sundayCounter++
              items.push({
                type: 'sunday' as const,
                dayNum: d,
                dayName: 'SUN',
                dateLabel,
                sundayNo: sundayCounter,
                dateStr: `${String(monthNum).padStart(2, '0')}/${paddedDay}`,
              })
            } else {
              const qtDay = parsedDays[qtIndex] || null
              if (qtDay) qtIndex++
              items.push({
                type: 'qt' as const,
                dayNum: d,
                dayName,
                dateLabel,
                qtDay,
                dayIdx: qtIndex - 1,
              })
            }
          }

          return items.map((item, idx) => {
            const isWeekStart = (item.dayNum - 1) % 7 === 0 || item.dayNum === 1
            const currentWeekNum = Math.floor((item.dayNum - 1) / 7) + 1

            return (
              <React.Fragment key={item.dayNum}>
                {/* 각 주차 시작 지점에 주간 계획(Weekly Plan) 페이지 삽입 */}
                {isPlannerEnabled && isWeekStart && (
                  isLandscape ? (
                    <QtWeeklyPlanPage
                      weekNum={currentWeekNum}
                      weekLabel={`WEEK ${currentWeekNum}`}
                      monthName={monthName}
                      themeColor={themeColor}
                      pageWidth={mmToPx(size.widthMm)}
                      pageHeight={mmToPx(size.heightMm)}
                    />
                  ) : (
                    <QtWeeklyPlanPortrait
                      weekNum={currentWeekNum}
                      weekLabel={`WEEK ${currentWeekNum}`}
                      monthName={monthName}
                      themeColor={themeColor}
                      pageWidth={mmToPx(size.widthMm)}
                      pageHeight={mmToPx(size.heightMm)}
                    />
                  )
                )}

                {/* ── 일요일(SUN): 큐티 원고 대신 수채화 다이어리 제작소의 [주일 심층 설교 노트 (Page A)] 배치 ── */}
                {item.type === 'sunday' ? (
                  <>
                    {/* Page A: 주일 심층 설교 노트 */}
                    {isLandscape ? (
                      <QtSundaySermonDeepPage
                        year={yearNum}
                        month={monthNum}
                        sundayNo={item.sundayNo}
                        dayNum={item.dayNum}
                        dateStr={item.dateStr}
                        monthName={monthName}
                        themeColor={themeColor}
                        pageWidth={mmToPx(size.widthMm)}
                        pageHeight={mmToPx(size.heightMm)}
                      />
                    ) : (
                      <QtSundaySermonDeepPortrait
                        year={yearNum}
                        month={monthNum}
                        sundayNo={item.sundayNo}
                        dayNum={item.dayNum}
                        dateStr={item.dateStr}
                        monthName={monthName}
                        themeColor={themeColor}
                        pageWidth={mmToPx(size.widthMm)}
                        pageHeight={mmToPx(size.heightMm)}
                      />
                    )}

                    {/* Page B: 주일 데일리 저널 & 기도 (골드/로즈 뱃지 적용) */}
                    {isDiaryEnabled && (
                      isLandscape ? (
                        <QtDailyDiaryPage
                          dateLabel={item.dateLabel}
                          dayNum={item.dayNum}
                          dayName={'SUN'}
                          monthName={monthName}
                          yearLabel={String(yearNum)}
                          themeColor={themeColor}
                          activeWeek={`W${currentWeekNum}`}
                          pageWidth={mmToPx(size.widthMm)}
                          pageHeight={mmToPx(size.heightMm)}
                        />
                      ) : (
                        <QtDailyDiaryPortrait
                          dateLabel={item.dateLabel}
                          dayNum={item.dayNum}
                          dayName={'SUN'}
                          monthName={monthName}
                          yearLabel={String(yearNum)}
                          themeColor={themeColor}
                          activeWeek={`W${currentWeekNum}`}
                          pageWidth={mmToPx(size.widthMm)}
                          pageHeight={mmToPx(size.heightMm)}
                        />
                      )
                    )}
                  </>
                ) : (
                  /* ── 평일(Mon~Sat): 큐티 원고 (Page A) + 데일리 저널 (Page B) ── */
                  <>
                    {/* Page A: Daily QT Page */}
                    {item.qtDay ? (
                      isLandscape
                        ? renderDailyLandscape(item.qtDay, item.dayIdx, item.dayNum)
                        : renderDailyPortrait(item.qtDay, item.dayIdx, item.dayNum)
                    ) : null}

                    {/* Page B: Daily Diary & Prayer Page */}
                    {isDiaryEnabled && (
                      isLandscape ? (
                        <QtDailyDiaryPage
                          dateLabel={item.dateLabel}
                          dayNum={item.dayNum}
                          dayName={item.dayName}
                          monthName={monthName}
                          yearLabel={String(yearNum)}
                          themeColor={themeColor}
                          activeWeek={`W${currentWeekNum}`}
                          pageWidth={mmToPx(size.widthMm)}
                          pageHeight={mmToPx(size.heightMm)}
                        />
                      ) : (
                        <QtDailyDiaryPortrait
                          dateLabel={item.dateLabel}
                          dayNum={item.dayNum}
                          dayName={item.dayName}
                          monthName={monthName}
                          yearLabel={String(yearNum)}
                          themeColor={themeColor}
                          activeWeek={`W${currentWeekNum}`}
                          pageWidth={mmToPx(size.widthMm)}
                          pageHeight={mmToPx(size.heightMm)}
                        />
                      )
                    )}
                  </>
                )}
              </React.Fragment>
            )
          })
        })()}

        {/* 5. End-of-Month Letter to God Page (P-Last) */}
        {isPlannerEnabled && (
          isLandscape ? (
            <QtMonthlyLetterPage
              year={yearNum}
              monthName={monthName}
              themeColor={themeColor}
              pageWidth={mmToPx(size.widthMm)}
              pageHeight={mmToPx(size.heightMm)}
            />
          ) : (
            <QtMonthlyLetterPortrait
              year={yearNum}
              monthName={monthName}
              themeColor={themeColor}
              pageWidth={mmToPx(size.widthMm)}
              pageHeight={mmToPx(size.heightMm)}
            />
          )
        )}
      </div>
    </div>
  )
}

export default forwardRef(QtPdfLayout)
