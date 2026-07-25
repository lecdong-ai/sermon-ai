'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { 
  BookOpen, Sparkles, Loader2, Copy, Check, ChevronDown, ChevronRight, 
  Settings2, Eye, FileText, Layout, RotateCcw, AlertCircle, FileDown, ArrowRight,
  History, Trash2, Plus, Bookmark, Edit3, Save, Download, Globe
} from 'lucide-react'
import QtReader from './QtReader'
import QtPdfLayout from './QtPdfLayout'
import { generateQtPdf } from '@/lib/qtPdfGen'
import { QT_TEMPLATES } from '@/lib/qtTemplates'
import { PAGE_SIZES } from '@/lib/qtPdfSizes'
import {
  getTodayDateString,
  getDaysInMonth,
  getFormattedDateList,
  formatDayLabel,
  getMondayOfWeek,
  formatDateRangeLabel,
  getNextStartPassage,
} from '@/lib/qtDates'
import { findAllSectionTitles as lookupSectionTitles } from '@/lib/bible/sections'
import { getNextBookInOrder, isLastBookInOrder } from '@/lib/bible/readingOrder'

const BOOK_CATEGORIES = [
  { name: '모세오경', testament: '구약', color: 'amber', books: ['창세기', '출애굽기', '레위기', '민수기', '신명기'] },
  { name: '역사서', testament: '구약', color: 'blue', books: ['여호수아', '사사기', '룻기', '사무엘상', '사무엘하', '열왕기상', '열왕기하', '역대상', '역대하', '에스라', '느헤미야', '에스더'] },
  { name: '시가서', testament: '구약', color: 'green', books: ['욥기', '시편', '잠언', '전도서', '아가'] },
  { name: '대선지서', testament: '구약', color: 'purple', books: ['이사야', '예레미야', '예레미야애가', '에스겔', '다니엘'] },
  { name: '소선지서', testament: '구약', color: 'pink', books: ['호세아', '요엘', '아모스', '오바댜', '요나', '미가', '나훔', '하박국', '스바냐', '학개', '스가랴', '말라기'] },
  { name: '복음서', testament: '신약', color: 'amber', books: ['마태복음', '마가복음', '누가복음', '요한복음'] },
  { name: '역사서', testament: '신약', color: 'blue', books: ['사도행전'] },
  { name: '바울서신', testament: '신약', color: 'teal', books: ['로마서', '고린도전서', '고린도후서', '갈라디아서', '에베소서', '빌립보서', '골로새서', '데살로니가전서', '데살로니가후서', '디모데전서', '디모데후서', '디도서', '빌레몬서'] },
  { name: '공동서신', testament: '신약', color: 'rose', books: ['히브리서', '야고보서', '베드로전서', '베드로후서', '요한1서', '요한2서', '요한3서', '유다서'] },
  { name: '묵시록', testament: '신약', color: 'red', books: ['요한계시록'] },
]

const SELECTED_CLASSES: Record<string, string> = {
  amber: 'bg-amber-500/20 border-amber-400/50 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.15)]',
  blue: 'bg-blue-500/20 border-blue-400/50 text-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.15)]',
  green: 'bg-green-500/20 border-green-400/50 text-green-300 shadow-[0_0_12px_rgba(34,197,94,0.15)]',
  purple: 'bg-purple-500/20 border-purple-400/50 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.15)]',
  pink: 'bg-pink-500/20 border-pink-400/50 text-pink-300 shadow-[0_0_12px_rgba(236,72,153,0.15)]',
  teal: 'bg-teal-500/20 border-teal-400/50 text-teal-300 shadow-[0_0_12px_rgba(20,184,166,0.15)]',
  rose: 'bg-rose-500/20 border-rose-400/50 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.15)]',
  red: 'bg-red-500/20 border-red-400/50 text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.15)]',
}

const DOT_COLORS: Record<string, string> = {
  amber: '#f59e0b',
  blue: '#3b82f6',
  green: '#22c55e',
  purple: '#a855f7',
  pink: '#ec4899',
  teal: '#14b8a6',
  rose: '#f43f5e',
  red: '#ef4444',
}

const BIBLE_CHAPTERS: Record<string, number> = {
  '창세기': 50, '출애굽기': 40, '레위기': 27, '민수기': 36, '신명기': 34,
  '여호수아': 24, '사사기': 21, '룻기': 4, '사무엘상': 31, '사무엘하': 24,
  '열왕기상': 22, '열왕기하': 25, '역대상': 29, '역대하': 36, '에스라': 10,
  '느헤미야': 13, '에스더': 10, '욥기': 42, '시편': 150, '잠언': 31,
  '전도서': 12, '아가': 8, '이사야': 66, '예레미야': 52, '예레미야애가': 5,
  '에스겔': 48, '다니엘': 12, '호세아': 14, '요엘': 3, '아모스': 9,
  '요나': 4, '미가': 7, '나훔': 3, '하박국': 3,
  '스바냐': 3, '학개': 2, '스가랴': 14, '말라기': 4,
  '마태복음': 28, '마가복음': 16, '누가복음': 24, '요한복음': 21, '사도행전': 28,
  '로마서': 16, '고린도전서': 16, '고린도후서': 13, '갈라디아서': 6, '에베소서': 6,
  '빌립보서': 4, '골로새서': 4, '데살로니가전서': 5, '데살로니가후서': 3, '디모데전서': 6,
  '디모데후서': 4, '디도서': 3, '빌레몬서': 1, '히브리서': 13, '야고보서': 5,
  '베드로전서': 5, '베드로후서': 3, '요한1서': 5, '요한2서': 1, '요한3서': 1,
  '유다서': 1, '요한계시록': 22
}

export interface QTFormData {
  bibleBook: string
  weekNumber: number
  audience: string
  level: string
  tone: string
  seriesName: string
  sizeOption: string
  designTemplate: string
  startDate: string // YYYY-MM-DD
}

export interface DaySplitData {
  day: string
  passage: string
  title: string
  focus: string
  reason: string
  sectionTitles?: string[]  // 성경 소제목 배열 (다중 결합 시 1개 이상)
}

export interface DayManuscript {
  dayName: string
  passage: string
  title: string
  focus: string
  sectionTitles?: string[]  // 성경 소제목 배열 (다중 결합 시 1개 이상)
  draftContent?: string
  finalContent?: string
  isGenerating?: boolean
  generatingStep?: string
}

export interface QTResult {
  fullManuscript: string
  daySectionTitles?: Record<number, string[]>  // PDF 표시용: day 인덱스 → 소제목 배열
}

export interface QtHistoryEntry {
  id: string
  bible_book: string
  week_number: number
  series_name: string
  audience: string
  level: string
  tone: string
  size_option: string
  design_template: string
  full_manuscript?: string
  start_passage?: string
  end_passage?: string
  subtitle?: string
  created_at: string
  updated_at: string
}

// 마크다운 테이블 파싱 헬퍼
function parseSplitTable(markdown: string): DaySplitData[] {
  const lines = markdown.split('\n')
  const results: DaySplitData[] = []

  const HEADER_KEYWORDS = ['순서', '요일', '날짜', '본문 분할표']

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      // 헤더나 구분선 행 건너뛰기
      if (
        trimmed.includes('---|') ||
        trimmed.includes('===') ||
        trimmed.includes('본문 분할표')
      ) {
        continue
      }

      const parts = trimmed.split('|').map(p => p.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
      if (parts.length >= 4) {
        const dayValue = parts[0]
        // 첫 칸이 구분선(----)이거나 비어있으면 스킵
        if (!dayValue || /^[-:\s]+$/.test(dayValue)) {
          continue
        }
        // 헤더 행 감지 (첫 칸이 헤더 키워드와 정확히 일치)
        if (HEADER_KEYWORDS.includes(dayValue)) {
          continue
        }

        results.push({
          day: dayValue,
          passage: parts[1],
          title: parts[2],
          focus: parts[3],
          reason: parts[4] || ''
        })
      }
    }
  }
  return results
}


// 최종본 마크다운 추출 헬퍼
function extractFinalContent(content: string): string {
  const marker = '## 최종본'
  const index = content.indexOf(marker)
  if (index !== -1) {
    return content.substring(index + marker.length).trim()
  }
  return content
}

// 조립 출력에서 JSON 메타데이터 추출 헬퍼
function extractMetadataJson(output: string): any {
  try {
    const jsonMatch = output.match(/```json\s*([\s\S]*?)```/)
    if (jsonMatch && jsonMatch[1]) {
      return JSON.parse(jsonMatch[1].trim())
    }
  } catch {
    // JSON 파싱 실패 시 null 반환
  }
  return null
}

export default function QtGenerator() {
  const [step, setStep] = useState<number>(1)
  
  // 서비스 모드 설정: weekly(주간), recommend(AI 추천 일일)
  const [qtMode, setQtMode] = useState<'weekly' | 'recommend'>('weekly')
  
  // AI 추천 정보 카드 상태
  const [recommendInfo, setRecommendInfo] = useState<{
    book: string
    passage: string
    reason: string
    coreMessage: string
  } | null>(null)

  // 세대 옵션
  const GENERATION_OPTIONS = ['초등부', '중고등부', '청년부', '장년부'] as const

  // 기본 설정 폼
  const [form, setForm] = useState<QTFormData>({
    bibleBook: '창세기',
    weekNumber: 1,
    audience: '장년부',
    level: '중',
    tone: '정중하고 따뜻한',
    seriesName: '말씀과 함께하는 큐티',
    sizeOption: 'A4Landscape',
    designTemplate: 'qtland-classic',
    startDate: getMondayOfWeek(getTodayDateString()),
  })

  const [selectedGenerations, setSelectedGenerations] = useState<string[]>([...GENERATION_OPTIONS])
  const [activeGeneration, setActiveGeneration] = useState<string>('장년부')
  const generationResultsRef = useRef<Record<string, {
    dayManuscripts: Record<string, DayManuscript>
    finalManuscript: string
    assembleOutput: string
    assembledMetadata: any
    subtitle: string
  }>>({})
  const [generationResults, setGenerationResults] = useState<Record<string, {
    dayManuscripts: Record<string, DayManuscript>
    finalManuscript: string
    assembleOutput: string
    assembledMetadata: any
    subtitle: string
  }>>({})
  const syncGenerationResults = (updater: (prev: typeof generationResultsRef.current) => typeof generationResultsRef.current) => {
    const next = updater(generationResultsRef.current)
    generationResultsRef.current = next
    setGenerationResults(next)
  }
  const [batchGenerating, setBatchGenerating] = useState(false)
  const [batchAssembling, setBatchAssembling] = useState(false)

  const updateForm = (patch: Partial<QTFormData>) => setForm(prev => ({ ...prev, ...patch }))

  // 모드별 정규화된 시작 날짜와 일수 (UI 미리보기 + 분할 생성에 공통 사용)
  const normalizedStartDate = useMemo(() => {
    if (qtMode === 'weekly') return getMondayOfWeek(form.startDate)
    return form.startDate
  }, [form.startDate, qtMode])

  const previewDaysCount = useMemo(() => {
    if (qtMode === 'weekly') return 6
    return 1
  }, [qtMode, normalizedStartDate])

  // PDF 캘린더 스트립 (A4 가로 / iPad Pro 12.9 / Tablet 일일 페이지에서 표시)
  const monthCalendarStrip = useMemo(() => {
    if (!normalizedStartDate) return undefined
    const allowedSizes = new Set(['A4Landscape', 'iPad Pro 12.9', 'Tablet (iPad 4:3)'])
    if (!allowedSizes.has(form.sizeOption || 'A4Landscape')) return undefined

    const parts = normalizedStartDate.split('-')
    if (parts.length !== 3) return undefined
    const year = parseInt(parts[0], 10)
    const monthNum = parseInt(parts[1], 10)
    const day = parseInt(parts[2], 10)
    if (isNaN(year) || isNaN(monthNum) || isNaN(day)) return undefined

    const daysInMonth = new Date(year, monthNum, 0).getDate()

    // ★ 주간 6일(일요일 제외)의 각 day 계산
    const startDate = new Date(year, monthNum - 1, day)
    const activeDays: number[] = []
    for (let i = 0; i < 6; i++) {
      const d = new Date(startDate)
      d.setDate(d.getDate() + i)
      if (d.getDay() !== 0) activeDays.push(d.getDate())
    }

    // 각 day에 큐티 데이터가 있는지 (현재 week 기준)
    // splitDays가 있으면 split된 day만 hasContent
    const dayHasContent: boolean[] = Array.from({ length: daysInMonth }, (_, i) => {
      const dayNum = i + 1
      return activeDays.includes(dayNum)
    })

    return {
      month: `${year}년 ${monthNum}월`,
      daysInMonth,
      activeDays,
      dayHasContent,
    }
  }, [normalizedStartDate, form.sizeOption])

  // 1단계 상태
  const [startPassage, setStartPassage] = useState('창세기 1:1')
  const [endPassage, setEndPassage] = useState('창세기 2:25')
  const [activeStartChapter, setActiveStartChapter] = useState<number | null>(1)
  const [activeEndChapter, setActiveEndChapter] = useState<number | null>(2)
  const [startVerse, setStartVerse] = useState<number | null>(1)
  const [endVerse, setEndVerse] = useState<number | null>(null)
  const [splitting, setSplitting] = useState(false)
  const [splitMarkdown, setSplitMarkdown] = useState('')
  const [splitDays, setSplitDays] = useState<DaySplitData[]>([])
  const [error, setError] = useState<string | null>(null)
  // 본문 범위 부족 다이얼로그
  const [poolError, setPoolError] = useState<any>(null)
  const extendingPoolRef = useRef(false)
  const endPassageInputRef = useRef<HTMLInputElement>(null)

  // 성경권 선택 변경 시 처리
  const handleBookChange = (book: string) => {
    updateForm({ bibleBook: book })
    setActiveStartChapter(1)
    setActiveEndChapter(null)
    setStartVerse(1)
    setEndVerse(null)
    setStartPassage(`${book} 1:1`)
    setEndPassage('')
  }

  // 장 클릭 핸들러
  const handleChapterClick = (chap: number) => {
    if (activeStartChapter === null || (activeStartChapter !== null && activeEndChapter !== null)) {
      setActiveStartChapter(chap)
      setActiveEndChapter(null)
      setStartVerse(1)
      setEndVerse(null)
      setStartPassage(`${form.bibleBook} ${chap}:1`)
      setEndPassage('')
    } else {
      if (chap < activeStartChapter) {
        setActiveStartChapter(chap)
        setStartVerse(1)
        setStartPassage(`${form.bibleBook} ${chap}:1`)
      } else {
        setActiveEndChapter(chap)
        setEndVerse(null)
        setEndPassage(`${form.bibleBook} ${chap}`)
      }
    }
  }

  // 절 변경 핸들러
  const handleStartVerseChange = (v: number | null) => {
    setStartVerse(v)
    if (activeStartChapter !== null) {
      setStartPassage(v ? `${form.bibleBook} ${activeStartChapter}:${v}` : `${form.bibleBook} ${activeStartChapter}장`)
    }
  }

  const handleEndVerseChange = (v: number | null) => {
    setEndVerse(v)
    if (activeEndChapter !== null) {
      setEndPassage(v ? `${form.bibleBook} ${activeEndChapter}:${v}` : `${form.bibleBook} ${activeEndChapter}장`)
    }
  }

  // 2단계 상태 (동적 리스트 기반으로 수용하도록 초기 빈 객체 선언)
  const [dayManuscripts, setDayManuscripts] = useState<Record<string, DayManuscript>>({})
  const [activeDay, setActiveDay] = useState<string>('월')
  const [showAdvanced, setShowAdvanced] = useState(false)
  // 인라인 편집 상태
  const [editingDay, setEditingDay] = useState<string | null>(null)
  const [editingField, setEditingField] = useState<'passage' | 'title' | null>(null)
  const [editValue, setEditValue] = useState('')
  // ⟳ AI 재분할 상태
  const [reshapingDay, setReshapingDay] = useState<string | null>(null)

  // row 편집 시작
  const startEdit = (day: string, field: 'passage' | 'title') => {
    const row = splitDays.find(d => d.day === day)
    if (!row) return
    setEditingDay(day)
    setEditingField(field)
    setEditValue(field === 'passage' ? row.passage : row.title)
  }
  // 편집 저장
  const saveEdit = () => {
    if (!editingDay || !editingField) return
    setSplitDays(prev => prev.map(d =>
      d.day === editingDay ? { ...d, [editingField === 'passage' ? 'passage' : 'title']: editValue } : d
    ))
    // dayManuscripts도 업데이트
    setDayManuscripts(prev => ({
      ...prev,
      [editingDay]: { ...prev[editingDay], [editingField === 'passage' ? 'passage' : 'title']: editValue }
    }))
    setEditingDay(null)
    setEditingField(null)
    setEditValue('')
  }

  // 3단계 상태 (소책자 조립)
  const [subtitle, setSubtitle] = useState('')
  const [assembling, setAssembling] = useState(false)
  const [assembleOutput, setAssembleOutput] = useState('')
  const [assembledMetadata, setAssembledMetadata] = useState<any>(null)
  
  // 최종 결과 (QtReader 연동용)
  const [finalManuscript, setFinalManuscript] = useState('')
  // 일자별 성경 소제목 (PDF 표시용)
  const [daySectionTitles, setDaySectionTitles] = useState<Record<number, string[]>>({})

  // 히스토리 상태
  const [historyEntries, setHistoryEntries] = useState<QtHistoryEntry[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [savingHistory, setSavingHistory] = useState(false)
  const [editingEntry, setEditingEntry] = useState<QtHistoryEntry | null>(null)
  const [editContent, setEditContent] = useState('')
  const [historyError, setHistoryError] = useState('')

  // 단일 day PDF 상태
  const [singleDayPdf, setSingleDayPdf] = useState<string | null>(null)
  const [downloadingDay, setDownloadingDay] = useState<string | null>(null)
  const singleDayRef = useRef<HTMLDivElement>(null)

  // 히스토리 로드
  const loadHistory = async () => {
    setHistoryLoading(true)
    setHistoryError('')
    try {
      const res = await fetch('/api/advanced/qt/history')
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        setHistoryError(`${res.status}: ${text || res.statusText}`)
      } else {
        const json = await res.json()
        setHistoryEntries(json.entries || [])
      }
    } catch (e) {
      setHistoryError(String(e))
    }
    setHistoryLoading(false)
  }

  useEffect(() => { loadHistory() }, [])

  // 히스토리 저장
  const saveToHistory = async (manuscript: string) => {
    if (!manuscript) return
    setSavingHistory(true)
    try {
      const dayData = Object.entries(dayManuscripts).map(([day, m]) => ({
        dayName: day,
        passage: m.passage,
        title: m.title,
        focus: m.focus,
        finalContent: m.finalContent,
      }))
      const res = await fetch('/api/advanced/qt/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bible_book: form.bibleBook,
          week_number: form.weekNumber,
          audience: form.audience,
          level: form.level,
          tone: form.tone,
          series_name: form.seriesName,
          size_option: form.sizeOption,
          design_template: form.designTemplate,
          full_manuscript: manuscript,
          day_data: dayData,
          start_passage: startPassage,
          end_passage: endPassage || null,
          subtitle: subtitle || null,
        }),
      })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        console.error('히스토리 저장 실패:', res.status, text)
      } else {
        loadHistory()
      }
    } catch (e) {
      console.error('히스토리 저장 오류:', e)
    }
    setSavingHistory(false)
  }

  // 현재 세대 결과를 ref에 저장 (synchronous)
  const saveCurrentGenerationResult = () => {
    syncGenerationResults(prev => ({
      ...prev,
      [activeGeneration]: {
        dayManuscripts: { ...dayManuscripts },
        finalManuscript,
        assembleOutput,
        assembledMetadata,
        subtitle,
      }
    }))
  }

  // 세대 전환: 현재 결과 저장 후 대상 세대 로드
  const switchGeneration = (gen: string) => {
    if (gen === activeGeneration) return
    saveCurrentGenerationResult()
    const saved = generationResultsRef.current[gen]
    if (saved) {
      setDayManuscripts(saved.dayManuscripts)
      setFinalManuscript(saved.finalManuscript)
      setAssembleOutput(saved.assembleOutput)
      setAssembledMetadata(saved.assembledMetadata)
      setSubtitle(saved.subtitle)
    }
    setActiveGeneration(gen)
    updateForm({ audience: gen })
  }

  // 세대 탭 UI 컴포넌트
  const GenerationTabs = ({ className = '' }: { className?: string }) => {
    const ref = generationResultsRef.current
    return (
    <div className={`flex items-center gap-1 p-1 bg-white/[0.02] border border-white/5 rounded-xl overflow-x-auto ${className}`}>
      {selectedGenerations.filter(g => {
        const hasResult = ref[g]?.dayManuscripts && Object.keys(ref[g].dayManuscripts).length > 0
        return hasResult || g === activeGeneration
      }).map(gen => {
        const isActive = activeGeneration === gen
        const hasResult = ref[gen]?.finalManuscript
        return (
          <button
            key={gen}
            onClick={() => switchGeneration(gen)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
              isActive
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : hasResult
                ? 'bg-emerald-600/10 border border-emerald-500/20 text-emerald-300 hover:bg-emerald-600/20'
                : 'bg-white/[0.01] border border-white/5 text-slate-500 hover:text-slate-300'
            }`}
          >
            {gen}
            {hasResult && <Check className="w-3 h-3 inline ml-1 text-emerald-400" />}
          </button>
        )
      })}
    </div>
    )
  }

  // 세대별 AI 초안 호출
  async function callQtDraftForGeneration(
    gen: string,
    dayName: string,
    dayPassage: string,
    dayTitle: string,
    dayFocus: string,
  ): Promise<string> {
    const res = await fetch('/api/advanced/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'qt-draft',
        data: {
          bibleBook: form.bibleBook,
          weekNumber: form.weekNumber,
          dayName,
          dayPassage,
          dayTitle,
          dayFocus,
          audience: gen,
          level: form.level,
          tone: form.tone,
          bibleTextPolicy: '전체 본문 제시 — 개역개정과 KJV 모두 본문 범위의 모든 절을 빠짐없이 포함',
          verseQuoteLimit: '전체 본문 — 모든 절',
          seriesName: form.seriesName,
        },
      }),
    })
    const json = await res.json()
    if (!json.success) throw new Error(json.error || 'QT 생성 실패')
    return json.data.output as string
  }

  // 단일 day 단일 세대 생성 (재시도 로직 포함)
  const draftDayForGeneration = async (
    gen: string,
    day: string,
    passage: string,
    title: string,
    focus: string,
  ): Promise<string> => {
    const MAX_ATTEMPTS = 2
    let lastMissing: string[] = []
    let output = ''
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      output = await callQtDraftForGeneration(gen, day, passage, title, focus)
      const v = validateFinalContent(output)
      if (v.valid) return output
      lastMissing = v.missing
      if (attempt < MAX_ATTEMPTS) {
        focus = `${focus}\n\n[보강 필요 섹션] ${v.missing.join(', ')}`
      }
    }
    return output
  }

  // 4세대 일괄 생성
  const handleBatchDraft = async () => {
    if (!splitDays.length) return
    setBatchGenerating(true)
    saveCurrentGenerationResult()
    try {
      const newResults = { ...generationResultsRef.current }
      for (const gen of selectedGenerations) {
        const existing = newResults[gen]
        const allDone = existing?.dayManuscripts &&
          Object.keys(existing.dayManuscripts).length >= splitDays.length &&
          Object.values(existing.dayManuscripts).every((m: any) => m.finalContent)
        if (allDone) continue

        const genManuscripts: Record<string, DayManuscript> = {}
        for (const day of splitDays.map(d => d.day)) {
          const sd = splitDays.find(s => s.day === day)
          if (!sd) continue
          const finalContent = await draftDayForGeneration(gen, day, sd.passage, sd.title, sd.focus)
          genManuscripts[day] = {
            dayName: day,
            passage: sd.passage,
            title: sd.title,
            focus: sd.focus,
            finalContent,
            sectionTitles: sd.sectionTitles,
          }
        }
        newResults[gen] = {
          dayManuscripts: genManuscripts,
          finalManuscript: '',
          assembleOutput: '',
          assembledMetadata: null,
          subtitle: '',
        }
      }
      syncGenerationResults(() => newResults)

      const firstGen = selectedGenerations[0]
      if (newResults[firstGen]) {
        setDayManuscripts(newResults[firstGen].dayManuscripts)
        setActiveGeneration(firstGen)
        updateForm({ audience: firstGen })
      }
    } catch (e: any) {
      setError(e.message || '일괄 생성 중 오류 발생')
    } finally {
      setBatchGenerating(false)
    }
  }

  // 세대용 조립 호출
  const assembleGeneration = async (gen: string): Promise<{ output: string; metadata: any } | null> => {
    const genData = generationResultsRef.current[gen]
    if (!genData) return null
    const dm = genData.dayManuscripts
    const days = Object.keys(dm).filter(d => dm[d].finalContent)
    if (days.length === 0) return null

    const payloadDays = days.map(d => ({ dayName: d, content: dm[d].finalContent! }))
    const res = await fetch('/api/advanced/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'qt-assemble',
        data: {
          bibleBook: form.bibleBook,
          weekNumber: form.weekNumber,
          seriesName: form.seriesName,
          subtitle: genData.subtitle,
          audience: gen,
          sizeOption: form.sizeOption,
          designMood: form.designTemplate,
          days: payloadDays,
        },
      }),
    })
    const json = await res.json()
    if (!json.success) return null
    const output = json.data.output
    const metadata = extractMetadataJson(output)
    return { output, metadata }
  }

  // 4세대 일괄 조립
  const handleBatchAssemble = async () => {
    setBatchAssembling(true)
    saveCurrentGenerationResult()
    try {
      const newResults = { ...generationResultsRef.current }
      for (const gen of selectedGenerations) {
        const existing = newResults[gen]
        if (!existing?.dayManuscripts || Object.keys(existing.dayManuscripts).length === 0) continue
        if (existing.finalManuscript) continue

        const result = await assembleGeneration(gen)
        if (!result) continue

        const dm = existing.dayManuscripts
        let fullDoc = `${result.output}\n\n`
        Object.keys(dm).forEach((d, idx) => {
          fullDoc += `\n\n===\n\n### Day ${idx + 1}\n\n${dm[d].finalContent || ''}`
        })

        newResults[gen] = {
          ...existing,
          assembleOutput: result.output,
          assembledMetadata: result.metadata,
          finalManuscript: fullDoc,
        }
        saveToHistoryForGeneration(gen, fullDoc)
      }
      syncGenerationResults(() => newResults)

      const firstGen = selectedGenerations[0]
      if (newResults[firstGen]) {
        setDayManuscripts(newResults[firstGen].dayManuscripts)
        setFinalManuscript(newResults[firstGen].finalManuscript)
        setAssembleOutput(newResults[firstGen].assembleOutput)
        setAssembledMetadata(newResults[firstGen].assembledMetadata)
        setSubtitle(newResults[firstGen].subtitle)
        setActiveGeneration(firstGen)
        updateForm({ audience: firstGen })
      }
    } catch (e: any) {
      setError(e.message || '일괄 조립 중 오류 발생')
    } finally {
      setBatchAssembling(false)
    }
  }

  // 특정 세대 히스토리 저장
  const saveToHistoryForGeneration = async (gen: string, manuscript: string) => {
    const genData = generationResultsRef.current[gen]
    if (!genData || !manuscript) return
    const dayData = Object.entries(genData.dayManuscripts).map(([day, m]) => ({
      dayName: day, passage: m.passage, title: m.title, focus: m.focus, finalContent: m.finalContent,
    }))
    try {
      await fetch('/api/advanced/qt/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bible_book: form.bibleBook,
          week_number: form.weekNumber,
          audience: gen,
          level: form.level, tone: form.tone,
          series_name: form.seriesName,
          size_option: form.sizeOption, design_template: form.designTemplate,
          full_manuscript: manuscript,
          day_data: dayData,
          start_passage: startPassage,
          end_passage: endPassage || null,
          subtitle: genData.subtitle || null,
        }),
      })
    } catch {}
  }

  // QT 아카이브에 공개
  const [publishing, setPublishing] = useState(false)
  const [publishedId, setPublishedId] = useState<string | null>(null)
  const publishToArchive = async (manuscript: string) => {
    if (!manuscript) return
    setPublishing(true)
    try {
      const dayData = Object.entries(dayManuscripts).map(([day, m]) => ({
        dayName: day,
        passage: m.passage,
        title: m.title,
        focus: m.focus,
        finalContent: m.finalContent,
      }))
      const res = await fetch('/api/qt/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: subtitle || form.seriesName,
          subtitle: subtitle || null,
          bible_book: form.bibleBook,
          week_number: form.weekNumber,
          audience: form.audience,
          level: form.level,
          tone: form.tone,
          series_name: form.seriesName,
          size_option: form.sizeOption,
          design_template: form.designTemplate,
          full_manuscript: manuscript,
          day_data: dayData,
          start_passage: startPassage,
          end_passage: endPassage || null,
        }),
      })
      if (res.ok) {
        const json = await res.json()
        setPublishedId(json.id)
        alert('✅ 큐티 아카이브(bunker.ai.kr/qt)에 공개되었습니다!')
      } else {
        const text = await res.text().catch(() => '')
        console.error('아카이브 공개 실패:', res.status, text)
        alert('아카이브 공개에 실패했습니다. 다시 시도해주세요.')
      }
    } catch (e) {
      console.error('아카이브 공개 오류:', e)
      alert('아카이브 공개 중 오류가 발생했습니다.')
    }
    setPublishing(false)
  }

  // 히스토리 조회 (전체 내용)
  const fetchHistoryEntry = async (id: string): Promise<QtHistoryEntry | null> => {
    try {
      const res = await fetch(`/api/advanced/qt/history/${id}`)
      if (res.ok) {
        const json = await res.json()
        return json.entry
      }
    } catch {}
    return null
  }

  // 히스토리 삭제
  const handleDeleteHistory = async (id: string) => {
    if (!window.confirm('이 QT 기록을 삭제하시겠습니까?')) return
    try {
      await fetch(`/api/advanced/qt/history/${id}`, { method: 'DELETE' })
      loadHistory()
    } catch {}
  }

  // 히스토리 보기
  const handleViewHistory = async (entry: QtHistoryEntry) => {
    const full = entry.full_manuscript ? entry : await fetchHistoryEntry(entry.id)
    if (full?.full_manuscript) {
      updateForm({
        bibleBook: full.bible_book,
        weekNumber: full.week_number,
        audience: full.audience,
        level: full.level,
        tone: full.tone,
        seriesName: full.series_name,
        sizeOption: full.size_option,
        designTemplate: full.design_template,
      })
      setFinalManuscript(full.full_manuscript)
      setShowHistory(false)
    }
  }

  // 히스토리 재생성 (동일 설정으로 step 1)
  const handleRegenerateHistory = (entry: QtHistoryEntry) => {
    updateForm({
      bibleBook: entry.bible_book,
      weekNumber: entry.week_number,
      audience: entry.audience,
      level: entry.level,
      tone: entry.tone,
      seriesName: entry.series_name,
      sizeOption: entry.size_option,
      designTemplate: entry.design_template,
    })
    if (entry.start_passage) setStartPassage(entry.start_passage)
    if (entry.end_passage) setEndPassage(entry.end_passage)
    setStep(1)
    setShowHistory(false)
  }

  // 히스토리 편집 모드
  const handleEditHistory = async (entry: QtHistoryEntry) => {
    const full = entry.full_manuscript ? entry : await fetchHistoryEntry(entry.id)
    if (full?.full_manuscript) {
      setEditingEntry(full)
      setEditContent(full.full_manuscript)
    }
  }

  // 편집 저장
  const handleSaveEdit = async () => {
    if (!editingEntry) return
    setSavingHistory(true)
    try {
      await fetch(`/api/advanced/qt/history/${editingEntry.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_manuscript: editContent }),
      })
      setEditingEntry(null)
      setEditContent('')
      loadHistory()
    } catch {}
    setSavingHistory(false)
  }

  // 본문 참조에서 시작 장 번호 추출 (출력 검증용)
  function getPassageStartVerse(passage: string): { chap: number; verse: number } | null {
    const m = passage.match(/(\d+)\s*[:：]\s*(\d+)/)
    return m ? { chap: parseInt(m[1]), verse: parseInt(m[2]) } : null
  }

  // 1단계: 단일 청크 본문 분할 API 호출 헬퍼 (주간/추천 공통 사용)
  const callSplitApi = async (params: {
    chunkStartPassage: string
    chunkEndPassage: string
    chunkDaysCount: number
    chunkDateList: string[]
    chunkInfo?: { current: number; total: number; offset: number }
    forceFullRows?: boolean
  }): Promise<{ output: string; parsed: DaySplitData[] }> => {
    const dataBody: any = {
      bibleBook: form.bibleBook,
      weekNumber: form.weekNumber,
      startPassage: params.chunkStartPassage,
      endPassage: params.chunkEndPassage,
      audience: form.audience,
      level: form.level,
      daysCount: params.chunkDaysCount,
      startDate: normalizedStartDate,
      dateList: params.chunkDateList,
      chunkInfo: params.chunkInfo,
      forceFullRows: params.forceFullRows || false,
    }
    // 풀 부족 시 무시(자동 확장) 모드
    if (params.forceFullRows || extendingPoolRef.current) {
      dataBody.ignorePoolCheck = true
    }
    const res = await fetch('/api/advanced/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'qt-split', data: dataBody }),
    })
    const json = await res.json()
    if (!json.success) {
      if (json.error === 'POOL_INSUFFICIENT') {
        throw { code: 'POOL_INSUFFICIENT', poolInfo: json.poolInfo, message: json.message }
      }
      throw new Error(json.error || '본문 분할안 생성에 실패했습니다.')
    }
    const output = json.data.output as string
    const parsed = parseSplitTable(output)
    return { output, parsed }
  }

  // passage 범위에 매칭되는 성경 소제목 모두 찾기 (다중)
  // 예: passage="에베소서 1:1-14" → ["인사", "그리스도 안의 영적 축복"]
  // 예: passage="에베소서 1:15-2:10" → ["그리스도의 우월성과 교회의 본질", "은혜로 구원받음"]
  function findAllSectionTitles(passage: string, bookName: string): string[] {
    try {
      return lookupSectionTitles(passage, bookName) || []
    } catch (e) {
      console.error('[QT] findAllSectionTitles error:', e)
      return []
    }
  }

  // 1단계: 주간 본문 분할 생성
  const handleGenerateSplit = async () => {
    if (!form.bibleBook || !startPassage) {
      setError('성경권과 시작 본문은 필수 입력 사항입니다.')
      return
    }
    setError(null)
    setSplitting(true)
    setSplitMarkdown('')
    setSplitDays([])

    const daysCount = previewDaysCount
    const dateList = getFormattedDateList(normalizedStartDate, daysCount)

    if (dateList.length === 0) {
      setError('시작 날짜가 올바르지 않습니다. 날짜를 다시 선택해주세요.')
      setSplitting(false)
      return
    }

    try {
      // 단일 청크 분할
      let parsed: DaySplitData[] = []
      let output = ''
      const MAX_RETRIES = 3
      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        const result = await callSplitApi({
          chunkStartPassage: startPassage,
          chunkEndPassage: endPassage,
          chunkDaysCount: daysCount,
          chunkDateList: dateList,
          forceFullRows: attempt > 0,
        })
        output = result.output
        parsed = result.parsed

        if (attempt < MAX_RETRIES && parsed.length < daysCount) {
          continue
        }
        break
      }

      if (parsed.length < daysCount) {
        console.error(`[QT] 최종 행 수 부족: ${parsed.length}/${daysCount}행.`)
      }

      // dateList 강제 매핑
      parsed.forEach((p, i) => {
        if (!dateList[i]) return
        const cleanDay = dateList[i]

        let passage = p.passage?.trim()
        let title = p.title?.trim()
        if (!passage && title && /[가-힣]+\s*\d+\s*[:：]/.test(title)) {
          passage = title
          title = ''
        }
        const finalPassage = passage || getNextStartPassage(
          parsed[i - 1]?.passage || startPassage,
          form.bibleBook
        )

        const sectionTitles = findAllSectionTitles(finalPassage, form.bibleBook)

        parsed[i] = {
          day: cleanDay,
          passage: finalPassage,
          title: title || '말씀 묵상',
          focus: p.focus?.trim() || '본문 중심 묵상',
          reason: p.reason?.trim() || `${p.focus?.trim() || title || '본문'}의 신학적 의미를 묵상하기 위해`,
          sectionTitles,
        }
      })

      const finalParsed = parsed

      // 서버 검증 통과 데이터 직접 사용 (자동 보강/강제 병합 제거됨)
      setSplitMarkdown(output || '')
      setSplitDays(finalParsed)

      // 2단계 날짜별 기본 데이터 세팅
      const updatedManuscripts: Record<string, DayManuscript> = {}
      finalParsed.forEach((p) => {
        updatedManuscripts[p.day] = {
          dayName: p.day,
          passage: p.passage,
          title: p.title,
          focus: p.focus,
          sectionTitles: p.sectionTitles,
        }
      })
      setDayManuscripts(updatedManuscripts)

      console.log(`[QT] 본문 분할안 생성 완료: ${finalParsed.length}/${dateList.length}일`)
      console.log(`[QT] 최종 분할:`, finalParsed.map(p => `${p.day} (${p.sectionTitles?.join(' + ') || '소제목 없음'}): ${p.passage}`))

      if (finalParsed.length > 0) {
        const firstDay = dateList[0] || finalParsed[0].day.trim()
        setActiveDay(firstDay)
      }

      // ★ 성경 66권 순서: 분할 완료 후 다음 권 자동 진행
      // 단, 사용자가 "다른 성경책으로 자동 확장"을 눌러서 강제 진행한 경우는
      // 이미 extendingPoolRef로 풀 체크 무시 + 다음 책 진행한 결과이므로
      // 추가 자동 진행은 하지 않음
      if (!extendingPoolRef.current && form.bibleBook) {
        const lastDay = finalParsed[finalParsed.length - 1]
        if (lastDay?.passage && !isLastBookInOrder(form.bibleBook)) {
          const nextBook = getNextBookInOrder(form.bibleBook)
          if (nextBook) {
            // 다음 권으로 form 업데이트
            const nextStartPassage = getNextStartPassage(lastDay.passage, nextBook)
            updateForm({
              bibleBook: nextBook,
              bible_book: nextBook,
              startPassage: nextStartPassage,
            })
            console.log(`[QT] 66권 순서: ${form.bibleBook} 완료 → ${nextBook} (${nextStartPassage}) 자동 진행`)
          }
        }
      }
    } catch (e: any) {
      if (e?.code === 'POOL_INSUFFICIENT') {
        setPoolError(e)
      } else {
        setError(e.message || '요청 중 오류가 발생했습니다.')
      }
    } finally {
      setSplitting(false)
      extendingPoolRef.current = false
    }
  }

  // 2단계: 하루치 QT 단일 호출 생성 + 섹션 검증 자동 재시도
  // (qt-draft + 본문 자동 주입, maxTokens 6000+ 동적, refine 단계 제거로 잘림 증폭 차단)
  const REQUIRED_SECTIONS = [
    '## 기본 정보',
    '## 오늘의 본문',
    '## 본문 한눈에 보기',
    '## 천천히 읽기',
    '## 본문 관찰하기',
    '## 원어 핵심단어',
    '## 영어 핵심단어',
    '## 말씀 이해하기',
    '## 복음으로 보기',
    '## 나를 비추어 보기 (장년용)',
    '## 나를 비추어 보기 (청소년 및 새신자용)',
    '## 오늘의 적용 (장년용)',
    '## 오늘의 적용 (청소년 및 새신자용)',
    '## 영어로 붙드는 말씀',
    '## 공동체 연결',
    '## 오늘의 기도',
    '## 한 줄 기록',
    '## 인도자 메모',
  ]

  function validateFinalContent(content: string): { valid: boolean; missing: string[] } {
    const missing: string[] = []
    for (const sec of REQUIRED_SECTIONS) {
      if (!content.includes(sec)) missing.push(sec)
    }
    return { valid: missing.length === 0, missing }
  }

  async function callQtDraft(
    dayName: string,
    dayPassage: string,
    dayTitle: string,
    dayFocus: string,
  ): Promise<string> {
    const res = await fetch('/api/advanced/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'qt-draft',
        data: {
          bibleBook: form.bibleBook,
          weekNumber: form.weekNumber,
          dayName,
          dayPassage,
          dayTitle,
          dayFocus,
          audience: form.audience,
          level: form.level,
          tone: form.tone,
          bibleTextPolicy: '전체 본문 제시 — 개역개정과 KJV 모두 본문 범위의 모든 절을 빠짐없이 포함',
          verseQuoteLimit: '전체 본문 — 모든 절',
          seriesName: form.seriesName,
        },
      }),
    })
    const json = await res.json()
    if (!json.success) throw new Error(json.error || 'QT 생성 실패')
    return json.data.output as string
  }

  const handleGenerateDay = async (dayName: string) => {
    const target = dayManuscripts[dayName]
    if (!target.passage || !target.title) {
      setError(`${formatDayLabel(dayName)}의 본문과 제목이 작성되지 않았습니다.`)
      return
    }
    setError(null)

    // 로딩 상태 세팅
    setDayManuscripts((prev) => ({
      ...prev,
      [dayName]: {
        ...prev[dayName],
        isGenerating: true,
        generatingStep: '복음 중심 풍성한 원고 집필 중... ✍️ (실제 성경 본문 자동 주입)',
      },
    }))

    const MAX_ATTEMPTS = 2
    try {
      let attempt = 0
      let finalContent = ''
      let lastMissing: string[] = []

      while (attempt < MAX_ATTEMPTS) {
        attempt += 1
        const stepMsg =
          attempt === 1
            ? '복음 중심 풍성한 원고 집필 중... ✍️ (실제 성경 본문 자동 주입)'
            : `누락 섹션 보강 재생성 중... 🔁 (${attempt}/${MAX_ATTEMPTS}) — ${lastMissing.length}개 섹션 보강`
        setDayManuscripts((prev) => ({
          ...prev,
          [dayName]: { ...prev[dayName], generatingStep: stepMsg },
        }))

        let output = await callQtDraft(dayName, target.passage, target.title, target.focus)

        // validate: 필수 섹션 모두 포함 확인
        const v = validateFinalContent(output)
        if (v.valid) {
          finalContent = output
          break
        }
        lastMissing = v.missing
        console.warn(`[qt] ${dayName} attempt ${attempt}: missing ${v.missing.length} sections:`, v.missing)
        // 마지막 시도여도 일단 저장 (사용자가 직접 편집할 수 있도록)
        finalContent = output
        if (attempt < MAX_ATTEMPTS) {
          // 다음 시도를 위해 보강 힌트와 함께 재생성
          target.focus = `${target.focus}\n\n[보강 필요 섹션] ${v.missing.join(', ')} — 위 섹션들을 빠짐없이 풍성하게 작성해 주세요. 각 섹션의 최소 글자 수를 반드시 채우세요.`
        }
      }

      setDayManuscripts((prev) => ({
        ...prev,
        [dayName]: {
          ...prev[dayName],
          finalContent,
          draftContent: finalContent,
          isGenerating: false,
          generatingStep: '',
        },
      }))

      if (lastMissing.length > 0) {
        console.warn(`[qt] ${dayName} 생성 완료 (${lastMissing.length}개 섹션 누락 가능):`, lastMissing)
        setError(
          `${formatDayLabel(dayName)} 원고가 생성되었으나 일부 섹션이 누락되었을 수 있습니다: ${lastMissing.join(', ')}. 우측 편집기에서 직접 보완해 주세요.`,
        )
      }
    } catch (e: any) {
      setError(`${formatDayLabel(dayName)} 생성 중 오류: ${e.message || '요청 실패'}`)
      setDayManuscripts((prev) => ({
        ...prev,
        [dayName]: { ...prev[dayName], isGenerating: false, generatingStep: '' },
      }))
    }
  }

  // AI 추천 일일 큐티 생성
  const handleGenerateRecommendDaily = async () => {
    setError(null)
    setSplitting(true)
    setRecommendInfo(null)
    
    try {
      const res = await fetch('/api/advanced/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'qt-recommend-daily',
          data: {}
        })
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || '추천 큐티 생성 실패')
      
      const rawOutput = json.data.output
      
      // 추천 정보 파싱
      let book = '추천 성경'
      let passage = '본문 범위'
      let reason = '추천 사유가 여기에 표시됩니다.'
      let coreMessage = '핵심 메시지'
      
      const bookMatch = rawOutput.match(/- 선정한 성경책:\s*(.*)/)
      const passageMatch = rawOutput.match(/- 선정한 본문 범위:\s*(.*)/)
      const reasonMatch = rawOutput.match(/- 선정 이유:\s*(.*)/)
      const messageMatch = rawOutput.match(/- 핵심 메시지:\s*(.*)/)
      
      if (bookMatch) book = bookMatch[1].trim()
      if (passageMatch) passage = passageMatch[1].trim()
      if (reasonMatch) reason = reasonMatch[1].trim()
      if (messageMatch) coreMessage = messageMatch[1].trim()
      
      setRecommendInfo({ book, passage, reason, coreMessage })
      
      // 메타데이터(AI 추천 정보 + 기본 정보 블록) 제외한 실제 큐티 본문 추출
      let finalContent = rawOutput
      const bodyIndex = rawOutput.indexOf('## 오늘의 본문')
      if (bodyIndex !== -1) {
        finalContent = rawOutput.substring(bodyIndex)
      }
      
      // form 상태를 AI 추천 결과로 동기화 (PDF 표지, 다음 단계에서 사용)
      updateForm({
        bibleBook: book,
        weekNumber: 1,
        startDate: getTodayDateString(),
      })
      setStartPassage(passage)
      setEndPassage(passage)
      
      // 뷰어 및 역사 저장 데이터 형태로 셋업
      setFinalManuscript(finalContent)
      
      // AI 추천 1일치용 단일 DayManuscripts 구성
      setDayManuscripts({
        '오늘': {
          dayName: '오늘',
          passage,
          title: coreMessage,
          focus: coreMessage,
          finalContent: finalContent
        }
      })
      setActiveDay('오늘')
    } catch (e: any) {
      setError(e.message || '요청 중 오류가 발생했습니다.')
    } finally {
      setSplitting(false)
    }
  }

  // 직전 큐티 본문 이어서 추천 계산
  const applyLastHistoryPassage = () => {
    if (historyEntries.length === 0) {
      setError('이전 저장된 히스토리 기록이 존재하지 않습니다.')
      return
    }
    setError(null)
    
    // 가장 최근 항목
    const lastEntry = historyEntries[0]
    const book = lastEntry.bible_book
    const endPass = lastEntry.end_passage || lastEntry.start_passage || ''
    
    if (!endPass) {
      setError('이전 기록의 본문 정보를 분석할 수 없습니다.')
      return
    }
    
    // 예: "창세기 2:25" 또는 "창세기 2장 25" 등 장절 파싱
    const match = endPass.match(/(\d+)[:장]\s*(\d+)?/)
    if (!match) {
      // 장만 있는 경우 (예: "창세기 2장" 또는 "창세기 2")
      const chapMatch = endPass.match(/(\d+)/)
      if (chapMatch) {
        const nextChap = parseInt(chapMatch[1]) + 1
        updateForm({ bibleBook: book })
        setActiveStartChapter(nextChap)
        setActiveEndChapter(null)
        setStartVerse(1)
        setEndVerse(null)
        setStartPassage(`${book} ${nextChap}:1`)
        setEndPassage('')
      } else {
        setError('마지막 구절의 형식을 분석할 수 없습니다.')
      }
      return
    }
    
    const chap = parseInt(match[1])
    const verse = match[2] ? parseInt(match[2]) : null
    
    updateForm({ bibleBook: book })
    
    if (verse !== null) {
      // 절 다음 절로 이어서
      const nextVerse = verse + 1
      setActiveStartChapter(chap)
      setActiveEndChapter(null)
      setStartVerse(nextVerse)
      setEndVerse(null)
      setStartPassage(`${book} ${chap}:${nextVerse}`)
      setEndPassage('')
    } else {
      // 장 다음 장으로 이어서
      const nextChap = chap + 1
      setActiveStartChapter(nextChap)
      setActiveEndChapter(null)
      setStartVerse(1)
      setEndVerse(null)
      setStartPassage(`${book} ${nextChap}:1`)
      setEndPassage('')
    }
  }

  // 4단계: 주간 소책자 조립 및 PDF 메타데이터 생성 API 호출
  const handleAssembleWeekly = async () => {
    // 6일치 원고가 다 완성되었는지 체크
    const unfinished = Object.keys(dayManuscripts).filter(d => !dayManuscripts[d].finalContent)
    if (unfinished.length > 0) {
      setError(`아직 원고가 완성되지 않은 요일이 있습니다: ${unfinished.join(', ')}`)
      return
    }

    setError(null)
    setAssembling(true)
    setAssembleOutput('')
    setAssembledMetadata(null)

    const payloadDays = Object.keys(dayManuscripts).map(d => ({
      dayName: d,
      content: dayManuscripts[d].finalContent
    }))

    try {
      const res = await fetch('/api/advanced/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'qt-assemble',
          data: {
            bibleBook: form.bibleBook,
            weekNumber: form.weekNumber,
            seriesName: form.seriesName,
            subtitle,
            audience: form.audience,
            sizeOption: form.sizeOption,
            designMood: form.designTemplate,
            days: payloadDays
          }
        })
      })
      const json = await res.json()
      if (json.success) {
        const output = json.data.output
        setAssembleOutput(output)
        
        const metadata = extractMetadataJson(output)
        setAssembledMetadata(metadata)

        // 최종 PDF/Reader용 조립 텍스트 구성 (인트로 + 일일 원고 + 아웃트로)
        // QtReader는 "===\n\n### Day X" 형태를 분할 기점으로 인식할 수 있도록 조립
        let fullDoc = `${output}\n\n`
        const daySectionTitlesMap: Record<number, string[]> = {}
        Object.keys(dayManuscripts).forEach((d, idx) => {
          fullDoc += `\n\n===\n\n`
          fullDoc += `### Day ${idx + 1}\n\n`
          fullDoc += dayManuscripts[d].finalContent
          // 일자별 소제목 저장 (PDF 표시용)
          if (dayManuscripts[d].sectionTitles && dayManuscripts[d].sectionTitles.length > 0) {
            daySectionTitlesMap[idx] = dayManuscripts[d].sectionTitles
          }
        })
        setFinalManuscript(fullDoc)
        setDaySectionTitles(daySectionTitlesMap)
        saveToHistory(fullDoc)
      } else {
        setError(json.error || '주간 소책자 조립에 실패했습니다.')
      }
    } catch (e: any) {
      setError(e.message || '요청 중 오류가 발생했습니다.')
    } finally {
      setAssembling(false)
    }
  }

  // 6일 원고 인라인 편집 처리
  const handleEditFinalContent = (dayName: string, newContent: string) => {
    setDayManuscripts(prev => ({
      ...prev,
      [dayName]: { ...prev[dayName], finalContent: newContent }
    }))
  }

  // 단일 day PDF 다운로드 (현재 step의 day finalContent 기준)
  const handleStepDayPdf = async (dayName: string) => {
    const dm = dayManuscripts[dayName]
    const content = dm.finalContent
    if (!content) return
    setDownloadingDay(dayName)

    // parseDays가 인식할 수 있는 구조화된 마크다운 생성
    // finalContent 내에 이미 섹션 헤더(## 제목, ## 오늘의 본문 등)가 포함되어 있으므로
    // Day 구분 마커만 감싸주면 됩니다
    const synthetic = `### Day 1 — ${dm.title || formatDayLabel(dayName)}\n\n${content}`
    setSingleDayPdf(synthetic)
    await new Promise(r => setTimeout(r, 600))
    try {
      if (singleDayRef.current) {
        // dayIndex=0 으로 표지를 건너뛰고 콘텐츠 페이지만 추출
        await generateQtPdf(singleDayRef.current, form, { fullManuscript: synthetic }, form.sizeOption || 'A4Landscape', form.designTemplate || 'qtland-classic', 0)
      } else {
        console.error('singleDayRef is null')
        alert('PDF 레이아웃이 준비되지 않았습니다. 다시 시도해주세요.')
      }
    } catch (e: any) {
      alert(`PDF 생성 실패: ${e.message || '알 수 없는 오류'}`)
    }
    setSingleDayPdf(null)
    setDownloadingDay(null)
  }

  // 스텝 제어 헬퍼
  const goNextStep = () => setStep(prev => Math.min(prev + 1, 4))
  const goPrevStep = () => setStep(prev => Math.max(prev - 1, 1))

  // 주간 조립으로 넘어가기 전 검증
  const isAllDaysCompleted = useMemo(() => {
    return Object.values(dayManuscripts).every(m => !!m.finalContent)
  }, [dayManuscripts])

  // 최종 뷰어 모드 실행
  if (finalManuscript) {
    return (
      <>
        {savingHistory && (
          <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-600/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-bold shadow-lg animate-slideDown">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            기록 저장 중...
          </div>
        )}
        <QtReader
          form={form}
          accumulatedManuscript={finalManuscript}
          templateId={form.designTemplate}
          startPassage={startPassage}
          endPassage={endPassage}
          selectedInfo={recommendInfo ? { ...recommendInfo, isRecommended: true } : null}
          daySectionTitles={daySectionTitles}
          onBack={() => {
            setFinalManuscript('')
            setDaySectionTitles({})
            setRecommendInfo(null)
          }}
        />
      </>
    )
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-indigo-500/20 border border-white/10">
            <BookOpen className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              순차형 QT 생성 스튜디오
              <span className="text-[10px] bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 px-2 py-0.5 rounded-full font-semibold">monorepo</span>
            </h2>
            <p className="text-[11px] text-slate-500">주간 본문 분할부터 정밀 집필, 소책자 조립까지 완벽한 순차 파이프라인</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all ${
              showHistory
                ? 'bg-indigo-500/20 border-indigo-400/40 text-indigo-300'
                : 'bg-white/[0.02] border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            {showHistory ? '새로 작성' : '기록'}
            {historyEntries.length > 0 && !showHistory && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[9px] font-bold">{historyEntries.length}</span>
            )}
          </button>
        </div>
      </div>

      {/* Stepper Progress Bar */}
      <div className="glass-dark rounded-2xl border border-white/5 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {[
            { num: 1, name: '주간 본문 분할', desc: '의미 단위 6분할 기획' },
            { num: 2, name: '요일별 QT 집필', desc: '초안 작성 & 자가 교열' },
            { num: 3, name: '주간 소책자 조립', desc: '인트로 & 인쇄 메타데이터' },
            { num: 4, name: '소책자 인쇄/다운로드', desc: 'PDF 다운로드 및 뷰어' }
          ].map((s) => {
            const isCompleted = step > s.num
            const isActive = step === s.num
            return (
              <div key={s.num} className="flex-1 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-[13px] border transition-all ${
                  isCompleted 
                    ? 'bg-emerald-600/20 border-emerald-400 text-emerald-300' 
                    : isActive 
                    ? 'bg-indigo-600/30 border-indigo-400 text-white shadow-[0_0_12px_rgba(99,102,241,0.2)]' 
                    : 'bg-white/[0.02] border-white/5 text-slate-500'
                }`}>
                  {isCompleted ? '✓' : s.num}
                </div>
                <div className="flex-1">
                  <div className={`text-[12px] font-bold ${isActive ? 'text-slate-100' : isCompleted ? 'text-emerald-400/80' : 'text-slate-500'}`}>
                    {s.name}
                  </div>
                  <div className="text-[9px] text-slate-600 font-medium">{s.desc}</div>
                </div>
                {s.num < 4 && <ChevronRight className="hidden sm:block w-4 h-4 text-slate-700" />}
              </div>
            )
          })}
        </div>
      </div>

      {/* 히스토리 패널 */}
      {showHistory && !finalManuscript && !editingEntry && (
        <div className="animate-fadeIn">
          <div className="glass-dark rounded-2xl border border-white/5 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h4 className="text-[13px] font-bold text-slate-300 flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-400" />
                큐티 생성 기록
              </h4>
              <span className="text-[10px] text-slate-500">{historyEntries.length}개</span>
            </div>

            {historyLoading ? (
              <div className="flex items-center justify-center py-12 text-slate-500">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span className="text-[12px]">기록 로딩 중...</span>
              </div>
            ) : historyError ? (
              <div className="text-center py-8 text-rose-400 space-y-2">
                <p className="text-[12px]">기록을 불러오지 못했습니다</p>
                <p className="text-[10px] text-rose-500/70 font-mono">{historyError}</p>
                <button onClick={loadHistory} className="text-[10px] underline hover:text-rose-300">다시 시도</button>
              </div>
            ) : historyEntries.length === 0 ? (
              <div className="text-center py-12 text-slate-500 space-y-2">
                <Bookmark className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-[12px]">아직 저장된 큐티 기록이 없습니다.</p>
                <p className="text-[10px] text-slate-600">QT를 생성하면 자동으로 여기에 저장됩니다.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-thin">
                {historyEntries.map(entry => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-bold text-slate-200">{entry.bible_book}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-bold">{entry.week_number}주차</span>
                        {entry.series_name && (
                          <span className="text-[10px] text-slate-500 truncate">{entry.series_name}</span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-600 mt-0.5">
                        {new Date(entry.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        {entry.audience && ` · ${entry.audience}`}
                        {entry.level && ` · Lv.${entry.level}`}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-3">
                      <button
                        onClick={() => handleViewHistory(entry)}
                        className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 transition-colors"
                        title="보기"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleRegenerateHistory(entry)}
                        className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 transition-colors"
                        title="재생성"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleEditHistory(entry)}
                        className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 transition-colors"
                        title="편집"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteHistory(entry.id)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 transition-colors"
                        title="삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 편집 모드 */}
      {showHistory && !finalManuscript && editingEntry && (
        <div className="animate-fadeIn">
          <div className="glass-dark rounded-2xl border border-white/5 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h4 className="text-[13px] font-bold text-slate-300 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-400" />
                원고 편집 — {editingEntry.bible_book} {editingEntry.week_number}주차
              </h4>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setEditingEntry(null); setEditContent('') }}
                  className="px-3 py-1.5 rounded-lg border border-white/5 hover:border-white/10 text-slate-400 hover:text-white text-[11px] font-bold transition-all"
                >
                  취소
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={savingHistory}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold transition-all disabled:opacity-40"
                >
                  {savingHistory ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  {savingHistory ? '저장 중...' : '저장'}
                </button>
                <button
                  onClick={() => { handleViewHistory(editingEntry); setEditingEntry(null); setEditContent('') }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition-all"
                >
                  <Eye className="w-3.5 h-3.5" />
                  뷰어
                </button>
              </div>
            </div>
            <textarea
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              rows={24}
              className="w-full bg-[#050914]/80 border border-white/5 rounded-xl p-4 text-[12px] leading-relaxed text-slate-200 font-mono outline-none focus:ring-2 focus:ring-indigo-400/20 focus:border-indigo-400 scrollbar-thin"
            />
          </div>
        </div>
      )}

      {/* 새로 작성 모드: showHistory가 false일 때만 스텝 표시 */}
      {!showHistory && (
      <>
      {/* STEP 1: 주간/추천 본문 분할 */}
      {step === 1 && (
        <div className="space-y-5 animate-fadeIn">
          {/* 모드 선택 탭 */}
          <div className="flex items-center gap-1.5 p-1 bg-white/[0.02] border border-white/5 rounded-2xl">
            {[
              { id: 'weekly', name: '📅 주간 큐티', desc: '6일치 쪼개기 제작' },
              { id: 'recommend', name: '✨ AI 추천 일일 큐티', desc: '스스로 선정 및 즉시 생성' },
            ].map(m => {
              const active = qtMode === m.id
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    const nextMode = m.id as 'weekly' | 'recommend'
                    setQtMode(nextMode)
                    setError(null)
                    // 모드 전환 시 startDate를 모드 규칙에 맞게 재정규화
                    if (nextMode === 'weekly') {
                      updateForm({ startDate: getMondayOfWeek(form.startDate) })
                    }
                  }}
                  className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-xl transition-all duration-300 ${
                    active
                      ? 'bg-indigo-600/10 border border-indigo-500/30 text-indigo-200 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]'
                      : 'border border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/[0.01]'
                  }`}
                >
                  <span className="text-[10px] font-bold">{m.name}</span>
                  <span className="text-[8px] opacity-60 mt-0.5">{m.desc}</span>
                </button>
              )
            })}
          </div>

          {/* AI 추천 모드인 경우 */}
          {qtMode === 'recommend' && (
            <div className="glass-dark rounded-2xl border border-white/5 p-8 flex flex-col items-center text-center space-y-5 animate-fadeIn">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-400/20 flex items-center justify-center text-indigo-400 text-xl font-bold">
                ✨
              </div>
              <div className="space-y-1.5 max-w-sm">
                <h4 className="text-[12px] font-bold text-slate-200">성경 66권 전체 대상 자동 묵상 생성</h4>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  오늘 묵상하기에 가장 은혜롭고 균형 있는 성경 본문을 AI 묵상 도우미가 직접 선별하고, 
                  [장년용/청소년·새신자용] 이중화 묵상 원고를 1분 이내에 빌드합니다.
                </p>
              </div>
              <button
                onClick={handleGenerateRecommendDaily}
                disabled={splitting}
                className="w-full max-w-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-3 text-[11px] font-bold transition-all shadow-[0_4px_12px_rgba(99,102,241,0.2)] disabled:opacity-50"
              >
                {splitting ? '⚡ 오늘의 말씀 선별 및 집필 중...' : '✨ 오늘의 추천 큐티 생성'}
              </button>
            </div>
          )}

          {/* 주간 모드 설정 */}
          {qtMode !== 'recommend' && (
            <div className="glass-dark rounded-2xl border border-white/5 p-6 space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-500">
                1단계: 주간 성경권 선택 및 범위 설정
              </h3>
            
            {/* 성경권 격자 선택 */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500">성경권 선택</label>
              <div className="bg-[#060a16] border border-white/5 rounded-xl p-4 space-y-4 max-h-[220px] overflow-y-auto scrollbar-thin">
                {(['구약', '신약'] as const).map(testament => (
                  <div key={testament}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{testament}</span>
                      <div className="h-px flex-1 bg-white/5" />
                    </div>
                    <div className="space-y-2">
                      {BOOK_CATEGORIES.filter(c => c.testament === testament).map(cat => (
                        <div key={cat.name} className="flex flex-wrap gap-1.5 items-center">
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: DOT_COLORS[cat.color] }} />
                          <span className="text-[10px] font-bold text-slate-500 mr-2">{cat.name}:</span>
                          {cat.books.map(book => {
                            const selected = form.bibleBook === book
                            return (
                              <button
                                key={book}
                                onClick={() => handleBookChange(book)}
                                className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border transition-all duration-200 ${
                                  selected ? SELECTED_CLASSES[cat.color] : 'bg-white/[0.02] border-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                                }`}
                              >
                                {book}
                              </button>
                            )
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 마우스 장 선택 그리드 */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-500">
                  {form.bibleBook} 장 선택 <span className="text-[10px] text-indigo-400/80 font-medium">(마우스 클릭으로 시작 장과 종료 장 범위를 지정하세요)</span>
                </label>
                {(activeStartChapter !== null || activeEndChapter !== null) && (
                  <button
                    onClick={() => {
                      setActiveStartChapter(null)
                      setActiveEndChapter(null)
                      setStartVerse(null)
                      setEndVerse(null)
                      setStartPassage('')
                      setEndPassage('')
                    }}
                    className="text-[9px] font-bold text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    범위 초기화
                  </button>
                )}
              </div>
              <div className="bg-[#060a16] border border-white/5 rounded-xl p-3 flex flex-wrap gap-1 max-h-[120px] overflow-y-auto scrollbar-thin">
                {Array.from({ length: BIBLE_CHAPTERS[form.bibleBook] || 1 }, (_, i) => {
                  const chap = i + 1
                  const isStart = activeStartChapter === chap
                  const isEnd = activeEndChapter === chap
                  const isInRange = activeStartChapter !== null && activeEndChapter !== null && chap > activeStartChapter && chap < activeEndChapter
                  
                  return (
                    <button
                      key={chap}
                      type="button"
                      onClick={() => handleChapterClick(chap)}
                      className={`w-7 h-7 rounded-lg text-[10px] font-bold border transition-all ${
                        isStart
                          ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_8px_rgba(99,102,241,0.3)]'
                          : isEnd
                          ? 'bg-emerald-600 border-emerald-400 text-white shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                          : isInRange
                          ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                          : 'bg-white/[0.02] border-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                      }`}
                    >
                      {chap}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center h-5">
                  <label className="text-[11px] font-bold text-slate-500">주차 (Week)</label>
                </div>
                <input
                  type="number" min={1} max={200}
                  value={form.weekNumber}
                  onChange={e => updateForm({ weekNumber: Math.max(1, parseInt(e.target.value) || 1) })}
                  className="w-full bg-[#060a16] border border-white/5 rounded-xl px-4 h-10 text-[13px] text-slate-100 outline-none focus:ring-2 focus:ring-indigo-400/20 focus:border-indigo-400"
                />
              </div>

              {/* 시작 날짜 입력 */}
              <div className="space-y-1.5">
                <div className="flex items-center h-5">
                  <label className="text-[11px] font-bold text-slate-500">
                    시작 날짜
                    <span className="text-[9px] text-indigo-400/80 font-medium ml-1">
                      (월요일 자동 정규화, 일요일 제외)
                    </span>
                  </label>
                </div>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={e => {
                      const val = e.target.value
                      if (val) updateForm({ startDate: getMondayOfWeek(val) })
                    }}
                    className="w-full bg-[#060a16] border border-white/5 rounded-xl px-4 h-10 text-[13px] text-slate-100 outline-none focus:ring-2 focus:ring-indigo-400/20 focus:border-indigo-400 [color-scheme:dark]"
                  />
                <div className="text-[9px] text-indigo-400 font-bold flex items-center gap-1">
                  📅 {`${formatDateRangeLabel(normalizedStartDate, previewDaysCount)} · 총 ${previewDaysCount}일 (일요일 제외)`}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center h-5">
                  <label className="text-[11px] font-bold text-slate-500">생성할 세대</label>
                </div>
                <div className="flex flex-wrap gap-2">
                  {GENERATION_OPTIONS.map(gen => {
                    const selected = selectedGenerations.includes(gen)
                    return (
                      <button
                        key={gen}
                        type="button"
                        onClick={() => {
                          setSelectedGenerations(prev =>
                            prev.includes(gen)
                              ? prev.filter(g => g !== gen)
                              : [...prev, gen]
                          )
                          if (!selected) setActiveGeneration(gen)
                        }}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
                          selected
                            ? 'bg-indigo-600/20 border-indigo-400/50 text-indigo-300'
                            : 'bg-white/[0.02] border-white/5 text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        {gen}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* 본문 전체 범위 - 별도 행 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between h-5">
                <label className="text-[11px] font-bold text-slate-500">본문 전체 범위 (시작 - 종료)</label>
                {historyEntries.length > 0 && (
                  <button
                    type="button"
                    onClick={applyLastHistoryPassage}
                    className="text-[9px] font-extrabold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-0.5"
                  >
                    🔗 직전 완료 본문 이어서 ({historyEntries[0].bible_book} {historyEntries[0].end_passage || historyEntries[0].start_passage})
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={startPassage}
                  onChange={e => setStartPassage(e.target.value)}
                  placeholder="예: 창세기 1:1"
                  className="w-full bg-[#060a16] border border-white/5 rounded-xl px-4 h-10 text-[13px] text-slate-100 outline-none focus:ring-2 focus:ring-indigo-400/20 focus:border-indigo-400"
                />
                <span className="text-slate-600 text-xs">~</span>
                <input
                  ref={endPassageInputRef}
                  type="text"
                  value={endPassage}
                  onChange={e => setEndPassage(e.target.value)}
                  placeholder="예: 창세기 2:3 (선택)"
                  className="w-full bg-[#060a16] border border-white/5 rounded-xl px-4 h-10 text-[13px] text-slate-100 outline-none focus:ring-2 focus:ring-indigo-400/20 focus:border-indigo-400"
                />
              </div>
              {!endPassage?.trim() && (
                <div className="text-[9px] text-indigo-400/80 font-medium flex items-center gap-1">
                  💡 종료 본문을 비워두면 시작 본문부터 자동으로 이어서 분할합니다.
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <button
                onClick={handleGenerateSplit}
                disabled={splitting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[12px] font-bold transition-all shadow-lg shadow-indigo-600/10 disabled:opacity-40"
              >
                {splitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    주간 본문 기획 분석/분할 중...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    주간 본문 분할안 생성하기
                  </>
                )}
              </button>
            </div>
          </div>
          )}

          {/* 분할안 결과 피드백 */}
          {splitMarkdown && (
            <div className="glass-dark rounded-2xl border border-white/5 p-6 space-y-5 animate-slideUp">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h4 className="text-slate-200 font-bold text-[13px] flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  본문 분할 기획이 완료되었습니다.
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 font-mono">
                    {splitDays.length > 0 ? (
                      <span>
                        {splitDays.length}/7일
                        <span className="text-slate-600 ml-1">(주간 7일)</span>
                      </span>
                    ) : (
                      <span>주간 모드</span>
                    )}
                  </span>
                </div>
                <button
                  onClick={goNextStep}
                  className="flex items-center gap-1 text-[11px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  2단계 집필실로 이동하기
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {splitDays.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[12px]">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-500 font-bold">
                        <th className="py-2.5 px-3 w-24 whitespace-nowrap">요일/일차</th>
                        <th className="py-2.5 px-3">분할 본문 범위</th>
                        <th className="py-2.5 px-3 w-32">성경 소제목</th>
                        <th className="py-2.5 px-3">큐티 소제목</th>
                        <th className="py-2.5 px-3">핵심 묵상 초점</th>
                        <th className="py-2.5 px-3">본문 분할 신학적 이유</th>
                        <th className="py-2.5 px-3 w-12"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300">
                      {splitDays.map((d, i) => {
                        const isEditing = editingDay === d.day
                        const isReshaping = reshapingDay === d.day
                        const prevPassage = i > 0 ? splitDays[i - 1].passage : null
                        const nextPassage = i < splitDays.length - 1 ? splitDays[i + 1].passage : null
                        return (
                        <tr key={i} className="group hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 px-3 font-bold text-slate-100 text-center w-24 whitespace-nowrap">
                            <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 whitespace-nowrap">
                              {d.day.replace(/요일/g, '')}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-semibold text-emerald-300">
                            {isEditing && editingField === 'passage' ? (
                              <input
                                className="w-full bg-black/40 border border-emerald-400/50 rounded px-2 py-1 text-emerald-300 text-[12px] outline-none"
                                value={editValue}
                                onChange={e => setEditValue(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') { setEditingDay(null); setEditingField(null) } }}
                                onBlur={saveEdit}
                                autoFocus
                              />
                            ) : (
                              <span
                                className="cursor-pointer hover:text-emerald-200 transition-colors"
                                onClick={() => startEdit(d.day, 'passage')}
                                title="클릭하여 본문 범위 편집"
                              >
                                {d.passage}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-[11px]">
                            {d.sectionTitles && d.sectionTitles.length > 0 ? (
                              <div className="flex flex-col gap-1 items-start">
                                {d.sectionTitles.map((st, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-400/30 text-amber-300 font-semibold whitespace-nowrap"
                                  >
                                    {idx > 0 && <span className="text-amber-500 mr-1">+</span>}
                                    {st}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-slate-600 text-[10px]">-</span>
                            )}
                          </td>
                          <td className="py-3 px-3 font-bold">
                            {isEditing && editingField === 'title' ? (
                              <input
                                className="w-full bg-black/40 border border-slate-400/50 rounded px-2 py-1 text-slate-200 text-[12px] outline-none"
                                value={editValue}
                                onChange={e => setEditValue(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') { setEditingDay(null); setEditingField(null) } }}
                                onBlur={saveEdit}
                                autoFocus
                              />
                            ) : (
                              <span
                                className="cursor-pointer hover:text-slate-100 transition-colors"
                                onClick={() => startEdit(d.day, 'title')}
                                title="클릭하여 큐티 소제목 편집"
                              >
                                {d.title}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-slate-400">{d.focus}</td>
                          <td className="py-3 px-3 text-slate-500 text-[11px] leading-relaxed max-w-xs">{d.reason}</td>
                          <td className="py-3 px-3">
                            <button
                              onClick={async () => {
                                setReshapingDay(d.day)
                                try {
                                  const res = await fetch('/api/advanced/ai', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      type: 'qt-reshape-day',
                                      data: {
                                        bibleBook: form.bibleBook,
                                        dayDate: d.day,
                                        prevPassage,
                                        currentPassage: d.passage,
                                        nextPassage,
                                        audience: form.audience,
                                        level: form.level,
                                      },
                                    }),
                                  })
                                  const json = await res.json()
                                  if (json.success && json.data?.output) {
                                    const parsed = JSON.parse(json.data.output)
                                    setSplitDays(prev => prev.map((row, ri) =>
                                      ri === i ? {
                                        ...row,
                                        passage: parsed.passage || row.passage,
                                        title: parsed.title || row.title,
                                        focus: parsed.focus || row.focus,
                                        reason: parsed.reason || row.reason,
                                        sectionTitles: parsed.passage
                                          ? findAllSectionTitles(parsed.passage, form.bibleBook)
                                          : row.sectionTitles,
                                      } : row
                                    ))
                                  }
                                } catch (e) {
                                  console.error('[QT] reshape failed:', e)
                                }
                                setReshapingDay(null)
                              }}
                              disabled={isReshaping}
                              className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-indigo-400 disabled:opacity-30"
                              title="AI 재분할"
                            >
                              <RotateCcw className={`w-3 h-3 ${isReshaping ? 'animate-spin text-indigo-400' : ''}`} />
                            </button>
                          </td>
                        </tr>
                      )})}
                    </tbody>
                  </table>
                </div>
              ) : (
                <pre className="p-4 bg-black/30 border border-white/5 rounded-xl text-slate-400 text-[11px] overflow-x-auto leading-relaxed">
                  {splitMarkdown}
                </pre>
              )}
            </div>
          )}
        </div>
      )}

      {/* STEP 2: 요일별 QT 집필 */}
      {step === 2 && (
        <div className="space-y-6 animate-fadeIn">
          {/* 세대 탭 */}
          {selectedGenerations.length > 1 && <GenerationTabs />}

          {/* 요일/날짜 선택 탭 */}
          <div className="flex flex-wrap gap-1.5 border-b border-white/5 pb-3">
            {Object.keys(dayManuscripts).map((d) => {
              const item = dayManuscripts[d]
              const hasFinal = !!item.finalContent
              const active = activeDay === d
              const label = formatDayLabel(d)
              
              return (
                <button
                  key={d}
                  onClick={() => {
                    setActiveDay(d)
                    setError(null)
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-[11px] font-bold transition-all ${
                    active 
                      ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_10px_rgba(99,102,241,0.2)]'
                      : hasFinal
                      ? 'bg-emerald-600/10 border-emerald-500/20 text-emerald-300 hover:bg-emerald-600/20'
                      : 'bg-white/[0.01] border-white/5 text-slate-500 hover:text-slate-300 hover:border-white/10'
                  }`}
                >
                  {item.isGenerating ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : hasFinal ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : null}
                  {label}
                </button>
              )
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* 왼쪽: 현재 요일의 설정 값 편집 */}
            <div className="lg:col-span-5 glass-dark rounded-2xl border border-white/5 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h4 className="text-[13px] font-bold text-slate-300 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-lg bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[10px]">
                    {formatDayLabel(activeDay)}
                  </span>
                  본문 및 기획 세부 수정
                </h4>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500">본문 범위</label>
                <input
                  type="text"
                  value={dayManuscripts[activeDay].passage}
                  onChange={e => setDayManuscripts(prev => ({
                    ...prev,
                    [activeDay]: { ...prev[activeDay], passage: e.target.value }
                  }))}
                  placeholder="예: 창세기 1:1-5"
                  className="w-full bg-[#060a16] border border-white/5 rounded-xl px-4 py-2.5 text-[13px] text-slate-100 outline-none focus:ring-2 focus:ring-indigo-400/20 focus:border-indigo-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500">하루 큐티 소제목</label>
                <input
                  type="text"
                  value={dayManuscripts[activeDay].title}
                  onChange={e => setDayManuscripts(prev => ({
                    ...prev,
                    [activeDay]: { ...prev[activeDay], title: e.target.value }
                  }))}
                  placeholder="예: 빛이 있으라 하시매"
                  className="w-full bg-[#060a16] border border-white/5 rounded-xl px-4 py-2.5 text-[13px] text-slate-100 outline-none focus:ring-2 focus:ring-indigo-400/20 focus:border-indigo-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500">핵심 묵상 초점</label>
                <textarea
                  value={dayManuscripts[activeDay].focus}
                  onChange={e => setDayManuscripts(prev => ({
                    ...prev,
                    [activeDay]: { ...prev[activeDay], focus: e.target.value }
                  }))}
                  placeholder="예: 말씀으로 창조하시고 첫날에 빛을 주시는 하나님의 주권적인 창조 사역과 은혜에 대한 묵상"
                  rows={3}
                  className="w-full bg-[#060a16] border border-white/5 rounded-xl px-4 py-2.5 text-[13px] text-slate-100 outline-none focus:ring-2 focus:ring-indigo-400/20 focus:border-indigo-400 resize-none scrollbar-thin"
                />
              </div>

              {/* 고급 설정 토글 */}
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 hover:text-slate-300 transition-colors"
              >
                <Settings2 className="w-3.5 h-3.5" />
                {showAdvanced ? '공통 설정 가리기' : '공통 집필 톤/시리즈 설정'}
              </button>

              {showAdvanced && (
                <div className="space-y-3 pt-3 border-t border-white/5 animate-slideDown">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500">시리즈명</label>
                    <input
                      type="text"
                      value={form.seriesName}
                      onChange={e => updateForm({ seriesName: e.target.value })}
                      className="w-full bg-[#060a16] border border-white/5 rounded-xl px-3 py-2 text-[12px] text-slate-100 outline-none focus:ring-2 focus:ring-indigo-400/20 focus:border-indigo-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500">작성 톤앤매너</label>
                    <select
                      value={form.tone}
                      onChange={e => updateForm({ tone: e.target.value })}
                      className="w-full bg-[#060a16] border border-white/5 rounded-xl px-3 py-2 text-[12px] text-slate-100 outline-none focus:ring-2 focus:ring-indigo-400/20 focus:border-indigo-400 appearance-none"
                    >
                      {['정중하고 따뜻한', '직설적이고 도전적인', '부드럽고 배려있는', '엄숙하고 경건한'].map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button
                  onClick={() => handleGenerateDay(activeDay)}
                  disabled={dayManuscripts[activeDay].isGenerating}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[12px] font-bold transition-all shadow-lg shadow-indigo-600/10 disabled:opacity-40"
                >
                  {dayManuscripts[activeDay].isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {dayManuscripts[activeDay].generatingStep || '원고 생성 중...'}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      {formatDayLabel(activeDay)} QT 최종 생성하기
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 오른쪽: 결과 및 수동 편집 편집기 */}
            <div className="lg:col-span-7 space-y-4">
              {/* 로딩 표시 */}
              {dayManuscripts[activeDay].isGenerating && (
                <div className="glass-dark rounded-2xl border border-white/5 p-12 text-center flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                  <div className="text-[12px] font-bold text-slate-300">{dayManuscripts[activeDay].generatingStep}</div>
                  <p className="text-[10px] text-slate-500 max-w-sm">초안을 집필한 후, 복음주의적 관점 및 웹/PDF 출판에 맞춘 자가 검토 및 정제 교열이 자동으로 꼬리 물어 연속 진행됩니다.</p>
                </div>
              )}

              {/* 최종 원고 표시 */}
              {!dayManuscripts[activeDay].isGenerating && dayManuscripts[activeDay].finalContent && (
                <div className="space-y-4 animate-slideUp">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400">최종 교열 완료된 큐티 원고</span>
                    <button
                      onClick={() => handleStepDayPdf(activeDay)}
                      disabled={downloadingDay === activeDay}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-[10px] font-bold transition-all disabled:opacity-30"
                      title="이 day만 PDF 저장"
                    >
                      {downloadingDay === activeDay ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                      PDF
                    </button>
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      웹 & PDF 가독성 최적화 완료
                    </span>
                  </div>

                  <div className="glass-dark rounded-2xl border border-white/5 p-6 space-y-4">
                    <textarea
                      value={dayManuscripts[activeDay].finalContent}
                      onChange={e => handleEditFinalContent(activeDay, e.target.value)}
                      rows={16}
                      className="w-full bg-[#050914]/80 border border-white/5 rounded-xl p-4 text-[12px] leading-relaxed text-slate-200 font-mono outline-none focus:ring-2 focus:ring-indigo-400/20 focus:border-indigo-400 scrollbar-thin"
                      placeholder="최종본 내용을 편집할 수 있습니다."
                    />
                    <div className="text-[10px] text-slate-500 italic">
                      💡 AI가 작성한 원고를 목회자님의 마음에 맞게 자유롭게 직접 타이핑해서 수정·보완할 수 있습니다.
                    </div>
                  </div>
                </div>
              )}

              {/* 아직 생성하지 않은 경우 대기 상태 */}
              {!dayManuscripts[activeDay].isGenerating && !dayManuscripts[activeDay].finalContent && (
                <div className="glass-dark rounded-2xl border border-white/5 p-16 text-center text-slate-500 space-y-4">
                  <AlertCircle className="w-8 h-8 mx-auto text-slate-600" />
                  <div>
                    <h5 className="text-[13px] font-bold text-slate-400">아직 원고가 생성되지 않았습니다.</h5>
                    <p className="text-[11px] text-slate-600 mt-1 max-w-xs mx-auto leading-relaxed">왼쪽의 큐티 기획 내용을 확인하시고 [QT 최종 생성하기] 버튼을 누르시면 교열까지 완료된 원고가 집필됩니다.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 하단 네비게이션 제어 */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-white/5">
            <button
              onClick={goPrevStep}
              className="px-4 py-2.5 rounded-xl border border-white/5 hover:border-white/10 hover:bg-white/[0.02] text-slate-400 hover:text-white text-[12px] font-bold transition-all"
            >
              1단계로 돌아가기
            </button>

            <div className="flex items-center gap-2">
              {selectedGenerations.length > 1 && (
                <button
                  onClick={handleBatchDraft}
                  disabled={batchGenerating || !splitDays.length}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold transition-all shadow-lg disabled:opacity-40"
                >
                  {batchGenerating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  {batchGenerating ? '일괄 생성 중...' : `${selectedGenerations.length}세대 일괄 생성`}
                </button>
              )}
              <button
                onClick={goNextStep}
                disabled={!isAllDaysCompleted}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[12px] font-bold transition-all shadow-lg shadow-indigo-600/10 disabled:opacity-40 disabled:cursor-not-allowed"
                title={!isAllDaysCompleted ? '월~토 6일치 원고가 모두 생성되어야 합니다.' : ''}
              >
                3단계 조립실로 이동하기
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: 주간 소책자 조립 */}
      {step === 3 && (
        <div className="space-y-6 animate-fadeIn">
          {selectedGenerations.length > 1 && <GenerationTabs />}
          <div className="glass-dark rounded-2xl border border-white/5 p-6 space-y-5">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-500">3단계: 주간 큐티책 최종 조립</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500">주간 큐티책 부제 (Subtitle)</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={e => setSubtitle(e.target.value)}
                  placeholder="예: 여호와께서 자기 백성을 권고하시사"
                  className="w-full bg-[#060a16] border border-white/5 rounded-xl px-4 py-2.5 text-[13px] text-slate-100 outline-none focus:ring-2 focus:ring-indigo-400/20 focus:border-indigo-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500">교재 소책자 인쇄 판형</label>
                <select
                  value={form.sizeOption}
                  onChange={e => updateForm({ sizeOption: e.target.value })}
                  className="w-full bg-[#060a16] border border-white/5 rounded-xl px-4 py-2.5 text-[13px] text-slate-100 outline-none focus:ring-2 focus:ring-indigo-400/20 focus:border-indigo-400 appearance-none"
                >
                  {Object.keys(PAGE_SIZES).map(o => <option key={o} value={o}>{PAGE_SIZES[o].label}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500">디자인 분위기 테마</label>
                <select
                  value={form.designTemplate}
                  onChange={e => updateForm({ designTemplate: e.target.value })}
                  className="w-full bg-[#060a16] border border-white/5 rounded-xl px-4 py-2.5 text-[13px] text-slate-100 outline-none focus:ring-2 focus:ring-indigo-400/20 focus:border-indigo-400 appearance-none"
                >
                  {QT_TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
            </div>

            {/* 디자인 템플릿 색상 미리보기 */}
            <div className="grid grid-cols-5 gap-2 pt-2">
              {QT_TEMPLATES.map(t => {
                const selected = form.designTemplate === t.id
                return (
                  <button
                    key={t.id}
                    onClick={() => updateForm({ designTemplate: t.id })}
                    className={`relative rounded-xl p-2.5 text-center transition-all border ${
                      selected
                        ? 'bg-indigo-500/15 border-indigo-400/50 ring-1 ring-indigo-400/30'
                        : 'bg-white/[0.02] border-white/5 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <div
                      className="w-full h-6 rounded-lg mb-1 flex items-center justify-center text-[8px] font-bold"
                      style={{ background: t.pageBg, color: t.textColor, border: `1px solid ${t.border}` }}
                    >
                      <span style={{ color: t.accent }}>●</span>
                    </div>
                    <div className={`text-[9px] font-bold ${selected ? 'text-indigo-300' : 'text-slate-400'}`}>
                      {t.name}
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              {selectedGenerations.length > 1 && (
                <button
                  onClick={handleBatchAssemble}
                  disabled={batchAssembling}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold transition-all shadow-lg disabled:opacity-40"
                >
                  {batchAssembling ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  {batchAssembling ? '일괄 조립 중...' : `${selectedGenerations.length}세대 일괄 조립`}
                </button>
              )}
              <button
                onClick={handleAssembleWeekly}
                disabled={assembling}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[12px] font-bold transition-all shadow-lg shadow-indigo-600/10 disabled:opacity-40"
              >
                {assembling ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    주간 총괄 소책자 조립 및 Wrap-up 생성 중...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    주간 소책자 조립하기
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 조립된 데이터 결과 */}
          {assembleOutput && (
            <div className="glass-dark rounded-2xl border border-white/5 p-6 space-y-4 animate-slideUp">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h4 className="text-[13px] font-bold text-emerald-400 flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  주간 소책자 조립이 무사히 완료되었습니다!
                </h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => publishToArchive(finalManuscript)}
                    disabled={publishing || !finalManuscript}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-[11px] font-bold transition-all shadow-md"
                  >
                    {publishing ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Globe className="w-3.5 h-3.5" />
                    )}
                    {publishing ? '공개 중...' : publishedId ? '✅ 공개됨' : 'QT 아카이브에 공개'}
                  </button>
                  <button
                    onClick={goNextStep}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold transition-all shadow-md"
                  >
                    소책자 출판 & 인쇄하러 가기
                    <FileDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500">조립 메타데이터 메모</label>
                <textarea
                  value={assembleOutput}
                  readOnly
                  rows={14}
                  className="w-full bg-[#050914]/80 border border-white/5 rounded-xl p-4 text-[11.5px] leading-relaxed text-slate-300 font-mono outline-none scrollbar-thin"
                />
              </div>
            </div>
          )}

          {/* 하단 네비게이션 제어 */}
          <div className="flex justify-between items-center pt-4 border-t border-white/5">
            <button
              onClick={goPrevStep}
              className="px-4 py-2.5 rounded-xl border border-white/5 hover:border-white/10 hover:bg-white/[0.02] text-slate-400 hover:text-white text-[12px] font-bold transition-all"
            >
              2단계로 돌아가기
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: 완료 및 미리보기 */}
      {step === 4 && (
        <div className="space-y-6 animate-fadeIn">
          {selectedGenerations.length > 1 && <GenerationTabs />}
          <div className="glass-dark rounded-2xl border border-white/5 p-12 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-400/20 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/5">
            <Check className="w-8 h-8 text-emerald-400" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-bold text-slate-100">축하합니다! 주간 큐티책 데이터가 완성되었습니다.</h3>
            <p className="text-[11px] text-slate-500 max-w-md mx-auto leading-relaxed">
              분할된 6일치의 큐티 원고와 주간 개요, 그리고 PDF 소책자 인쇄를 위한 조립 메타데이터가 완벽히 결합되었습니다. 
              이제 최종 뷰어로 들어가 템플릿 디자인을 직접 변경하고, PDF로 소장 또는 인쇄할 수 있습니다.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              onClick={goPrevStep}
              className="px-5 py-2.5 rounded-xl border border-white/5 hover:border-white/10 hover:bg-white/[0.02] text-slate-400 hover:text-white text-[12px] font-bold transition-all"
            >
              3단계로 돌아가기
            </button>
            <button
              onClick={() => {
                // finalManuscript에 값이 들어가면 컴포넌트 최상단 분기에 의해 QtReader가 실행됨
                if (finalManuscript) {
                  // 이미 조립이 완료된 경우
                  return;
                }
                // 비상용 fallback
                let fallbackDoc = `## 주간 큐티\n\n`
                Object.keys(dayManuscripts).forEach((d, idx) => {
                  fallbackDoc += `\n\n===\n\n`
                  fallbackDoc += `### Day ${idx + 1}\n\n`
                  fallbackDoc += dayManuscripts[d].finalContent || ''
                })
                setFinalManuscript(fallbackDoc)
              }}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[12px] font-bold transition-all shadow-lg shadow-indigo-600/10"
            >
              <Eye className="w-4 h-4" />
              최종 큐티 뷰어 & PDF 인쇄 페이지 열기
            </button>
          </div>
          </div>
        </div>
      )}

      </>
      )}

      {/* 에러 발생 시 토스트 또는 박스 메시지 */}
      {error && (
        <div className="flex items-start gap-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-3 text-[12px] text-rose-300 font-medium animate-slideUp">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">{error}</div>
          <button 
            onClick={() => setError(null)} 
            className="text-[10px] uppercase font-bold text-rose-400 hover:text-rose-300 ml-2"
          >
            닫기
          </button>
        </div>
      )}

      {/* 본문 범위 부족 다이얼로그 */}
      {poolError && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setPoolError(null)}>
          <div className="w-full max-w-lg mx-4 bg-[#0d1121] border border-[#1e2a45] rounded-2xl shadow-2xl p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 text-lg">⚠️</div>
              <div>
                <h3 className="text-[15px] font-bold text-slate-100">본문 범위가 부족합니다</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">선택한 본문으로는 {previewDaysCount}일을 채울 수 없습니다</p>
              </div>
            </div>

            <div className="bg-[#070b18] rounded-xl p-3.5 mb-5 flex items-center justify-around text-center text-[11px]">
              <div>
                <div className="text-[20px] font-bold text-slate-100">{poolError.poolInfo?.available || 0}</div>
                <div className="text-slate-400 font-medium mt-0.5">가능 절</div>
              </div>
              <div className="text-slate-600 text-[20px] font-bold">&lt;</div>
              <div>
                <div className="text-[20px] font-bold text-rose-400">{poolError.poolInfo?.required || 0}</div>
                <div className="text-slate-400 font-medium mt-0.5">필요 절</div>
              </div>
              <div className="text-slate-600 text-[20px] font-bold">→</div>
              <div>
                <div className="text-[20px] font-bold text-amber-400">-{poolError.poolInfo?.deficit || 0}</div>
                <div className="text-slate-400 font-medium mt-0.5">부족</div>
              </div>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={() => {
                  setPoolError(null)
                  setError(null)
                  extendingPoolRef.current = true
                  handleGenerateSplit()
                }}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-indigo-600/20 border border-indigo-500/30 hover:bg-indigo-600/30 text-left transition-colors group"
              >
                <div>
                  <div className="text-[13px] font-bold text-indigo-300 group-hover:text-indigo-200">다른 성경책으로 자동 확장</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">현재 범위 이후 다음 성경책으로 이어서 분할합니다</div>
                </div>
                <span className="text-indigo-400 text-lg shrink-0">→</span>
              </button>

              <button
                onClick={() => {
                  const reduced = Math.max(1, Math.floor(poolError.poolInfo?.available / 10) || 1)
                  updateForm({ ...form })
                  setPoolError(null)
                  setError(`분할 일수를 ${previewDaysCount}일에서 ${reduced}일(으)로 줄여주세요.`)
                }}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-emerald-600/20 border border-emerald-500/30 hover:bg-emerald-600/30 text-left transition-colors group"
              >
                <div>
                  <div className="text-[13px] font-bold text-emerald-300 group-hover:text-emerald-200">분할 일수 줄이기</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">가능한 절 수에 맞게 일수를 조정합니다</div>
                </div>
                <span className="text-emerald-400 text-lg shrink-0">→</span>
              </button>

              <button
                onClick={() => {
                  setPoolError(null)
                  setError(null)
                  setTimeout(() => {
                    endPassageInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                    endPassageInputRef.current?.focus()
                    endPassageInputRef.current?.classList.add('ring-2', 'ring-indigo-400', 'ring-offset-2', 'ring-offset-[#0d1121]')
                    setTimeout(() => {
                      endPassageInputRef.current?.classList.remove('ring-2', 'ring-indigo-400', 'ring-offset-2', 'ring-offset-[#0d1121]')
                    }, 3000)
                  }, 300)
                }}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-slate-600/20 border border-slate-500/30 hover:bg-slate-600/30 text-left transition-colors group"
              >
                <div>
                  <div className="text-[13px] font-bold text-slate-300 group-hover:text-slate-200">종료 본문 직접 입력</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">상단 설정에서 종료 본문을 직접 지정합니다</div>
                </div>
                <span className="text-slate-400 text-lg shrink-0">→</span>
              </button>
            </div>

            <button
              onClick={() => setPoolError(null)}
              className="mt-4 w-full text-[11px] font-bold text-slate-400 hover:text-slate-300 py-2 transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* 단일 day PDF용 숨김 레이아웃 */}
      {singleDayPdf && (
        <div style={{ position: 'absolute', left: '-9999px', top: 0, zIndex: -1, opacity: 1 }}>
          <QtPdfLayout
            ref={singleDayRef}
            form={form}
            result={{ fullManuscript: singleDayPdf }}
            sizeOption={form.sizeOption || 'A4Landscape'}
            templateId={form.designTemplate || 'qtland-classic'}
            daySectionTitles={(() => {
              const day = dayManuscripts[activeDay]
              return day?.sectionTitles && day.sectionTitles.length > 0
                ? { 0: day.sectionTitles }
                : undefined
            })()}
            monthCalendarStrip={monthCalendarStrip}
          />
        </div>
      )}
    </section>
  )
}
