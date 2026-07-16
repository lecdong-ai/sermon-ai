'use client'

import { useState, useMemo } from 'react'
import { 
  BookOpen, Sparkles, Loader2, Copy, Check, ChevronDown, ChevronRight, 
  Settings2, Eye, FileText, Layout, RotateCcw, AlertCircle, FileDown, ArrowRight 
} from 'lucide-react'
import QtReader from './QtReader'
import { QT_TEMPLATES } from '@/lib/qtTemplates'

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
}

export interface DaySplitData {
  day: string
  passage: string
  title: string
  focus: string
  reason: string
}

export interface DayManuscript {
  dayName: string
  passage: string
  title: string
  focus: string
  draftContent?: string
  finalContent?: string
  isGenerating?: boolean
  generatingStep?: string
}

export interface QTResult {
  fullManuscript: string
}

// 마크다운 테이블 파싱 헬퍼
function parseSplitTable(markdown: string): DaySplitData[] {
  const lines = markdown.split('\n')
  const results: DaySplitData[] = []
  
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('|') && (
      trimmed.includes('월') || trimmed.includes('화') || trimmed.includes('수') || 
      trimmed.includes('목') || trimmed.includes('금') || trimmed.includes('토')
    )) {
      const parts = trimmed.split('|').map(p => p.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
      if (parts.length >= 4) {
        results.push({
          day: parts[0],
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
  
  // 기본 설정 폼
  const [form, setForm] = useState<QTFormData>({
    bibleBook: '창세기',
    weekNumber: 1,
    audience: '일반 성도',
    level: '중',
    tone: '정중하고 따뜻한',
    seriesName: '말씀과 함께하는 큐티',
    sizeOption: 'A5',
    designTemplate: 'warm-modern',
  })

  const updateForm = (patch: Partial<QTFormData>) => setForm(prev => ({ ...prev, ...patch }))

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

  // 2단계 상태 (월~토 QT 집필)
  const [dayManuscripts, setDayManuscripts] = useState<Record<string, DayManuscript>>({
    '월': { dayName: '월', passage: '', title: '', focus: '' },
    '화': { dayName: '화', passage: '', title: '', focus: '' },
    '수': { dayName: '수', passage: '', title: '', focus: '' },
    '목': { dayName: '목', passage: '', title: '', focus: '' },
    '금': { dayName: '금', passage: '', title: '', focus: '' },
    '토': { dayName: '토', passage: '', title: '', focus: '' },
  })
  const [activeDay, setActiveDay] = useState<string>('월')
  const [showAdvanced, setShowAdvanced] = useState(false)
  
  // 3단계 상태 (소책자 조립)
  const [subtitle, setSubtitle] = useState('')
  const [assembling, setAssembling] = useState(false)
  const [assembleOutput, setAssembleOutput] = useState('')
  const [assembledMetadata, setAssembledMetadata] = useState<any>(null)
  
  // 최종 결과 (QtReader 연동용)
  const [finalManuscript, setFinalManuscript] = useState('')

  // 1단계: 주간 본문 분할 생성 API 호출
  const handleGenerateSplit = async () => {
    if (!form.bibleBook || !startPassage) {
      setError('성경권과 시작 본문은 필수 입력 사항입니다.')
      return
    }
    setError(null)
    setSplitting(true)
    setSplitMarkdown('')
    setSplitDays([])

    try {
      const res = await fetch('/api/advanced/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'qt-split',
          data: {
            bibleBook: form.bibleBook,
            weekNumber: form.weekNumber,
            startPassage,
            endPassage,
            audience: form.audience,
            level: form.level
          }
        }),
      })
      const json = await res.json()
      if (json.success) {
        const output = json.data.output
        setSplitMarkdown(output)
        const parsed = parseSplitTable(output)
        setSplitDays(parsed)
        
        // 2단계 요일별 기본 데이터 세팅
        const updatedManuscripts = { ...dayManuscripts }
        parsed.forEach(p => {
          const cleanDay = p.day.replace(/요일/g, '').trim()
          if (updatedManuscripts[cleanDay]) {
            updatedManuscripts[cleanDay] = {
              dayName: cleanDay,
              passage: p.passage,
              title: p.title,
              focus: p.focus
            }
          }
        })
        setDayManuscripts(updatedManuscripts)
      } else {
        setError(json.error || '본문 분할안 생성에 실패했습니다.')
      }
    } catch (e: any) {
      setError(e.message || '요청 중 오류가 발생했습니다.')
    } finally {
      setSplitting(false)
    }
  }

  // 2단계 & 3단계: 하루치 QT 생성 및 교열 정제 체이닝 API 호출
  const handleGenerateDay = async (dayName: string) => {
    const target = dayManuscripts[dayName]
    if (!target.passage || !target.title) {
      setError(`${dayName}요일의 본문과 제목이 작성되지 않았습니다.`)
      return
    }
    setError(null)

    // 로딩 상태 세팅
    setDayManuscripts(prev => ({
      ...prev,
      [dayName]: { 
        ...prev[dayName], 
        isGenerating: true, 
        generatingStep: '1단계: 복음 중심 초안 원고 집필 중... ✍️' 
      }
    }))

    try {
      // Step A: 2단계 초안(qt-draft) API 호출
      const draftRes = await fetch('/api/advanced/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'qt-draft',
          data: {
            bibleBook: form.bibleBook,
            weekNumber: form.weekNumber,
            dayName,
            dayPassage: target.passage,
            dayTitle: target.title,
            dayFocus: target.focus,
            audience: form.audience,
            level: form.level,
            tone: form.tone,
            bibleTextPolicy: '본문 범위와 핵심절만 제시',
            verseQuoteLimit: '최대 2구절',
            seriesName: form.seriesName
          }
        })
      })
      const draftJson = await draftRes.json()
      if (!draftJson.success) throw new Error(draftJson.error || '초안 생성 실패')
      const draftContent = draftJson.data.output

      // 진행 상태 변경
      setDayManuscripts(prev => ({
        ...prev,
        [dayName]: { 
          ...prev[dayName], 
          draftContent,
          generatingStep: '2단계: 신학 검토 및 웹/PDF 레이아웃 교열 중... 🔍' 
        }
      }))

      // Step B: 3단계 정제(qt-refine) API 호출
      const refineRes = await fetch('/api/advanced/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'qt-refine',
          data: { draftContent }
        })
      })
      const refineJson = await refineRes.json()
      if (!refineJson.success) throw new Error(refineJson.error || '정제 생성 실패')
      
      const rawFinal = refineJson.data.output
      const finalContent = extractFinalContent(rawFinal)

      setDayManuscripts(prev => ({
        ...prev,
        [dayName]: { 
          ...prev[dayName], 
          finalContent,
          isGenerating: false,
          generatingStep: ''
        }
      }))
    } catch (e: any) {
      setError(`${dayName}요일 생성 중 오류: ${e.message || '요청 실패'}`)
      setDayManuscripts(prev => ({
        ...prev,
        [dayName]: { ...prev[dayName], isGenerating: false, generatingStep: '' }
      }))
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
        Object.keys(dayManuscripts).forEach((d, idx) => {
          fullDoc += `\n\n===\n\n`
          fullDoc += `### Day ${idx + 1}\n\n`
          fullDoc += dayManuscripts[d].finalContent
        })
        setFinalManuscript(fullDoc)
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
      <QtReader
        form={form}
        accumulatedManuscript={finalManuscript}
        templateId={form.designTemplate}
        startPassage={startPassage}
        endPassage={endPassage}
        onBack={() => setFinalManuscript('')}
      />
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

      {/* STEP 1: 주간 본문 분할 */}
      {step === 1 && (
        <div className="space-y-5 animate-fadeIn">
          {/* 입력 정보 설정 */}
          <div className="glass-dark rounded-2xl border border-white/5 p-6 space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-500">1단계: 성경권 선택 및 범위 설정</h3>
            
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

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500">주차 (Week)</label>
                <input
                  type="number" min={1} max={200}
                  value={form.weekNumber}
                  onChange={e => updateForm({ weekNumber: Math.max(1, parseInt(e.target.value) || 1) })}
                  className="w-full bg-[#060a16] border border-white/5 rounded-xl px-4 py-2.5 text-[13px] text-slate-100 outline-none focus:ring-2 focus:ring-indigo-400/20 focus:border-indigo-400"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[11px] font-bold text-slate-500">본문 전체 범위 (시작 - 종료)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={startPassage}
                    onChange={e => setStartPassage(e.target.value)}
                    placeholder="예: 창세기 1:1"
                    className="w-full bg-[#060a16] border border-white/5 rounded-xl px-4 py-2.5 text-[13px] text-slate-100 outline-none focus:ring-2 focus:ring-indigo-400/20 focus:border-indigo-400"
                  />
                  <span className="text-slate-600 text-xs">~</span>
                  <input
                    type="text"
                    value={endPassage}
                    onChange={e => setEndPassage(e.target.value)}
                    placeholder="예: 창세기 2:3 (선택)"
                    className="w-full bg-[#060a16] border border-white/5 rounded-xl px-4 py-2.5 text-[13px] text-slate-100 outline-none focus:ring-2 focus:ring-indigo-400/20 focus:border-indigo-400"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500">대상 독자</label>
                <select
                  value={form.audience}
                  onChange={e => updateForm({ audience: e.target.value })}
                  className="w-full bg-[#060a16] border border-white/5 rounded-xl px-4 py-2.5 text-[13px] text-slate-100 outline-none focus:ring-2 focus:ring-indigo-400/20 focus:border-indigo-400 appearance-none"
                >
                  {['초신자', '일반 성도', '청년', '장년', '온 가족'].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleGenerateSplit}
                disabled={splitting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[12px] font-bold transition-all shadow-lg shadow-indigo-600/10 disabled:opacity-40"
              >
                {splitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    주간 의미 본문 분석/분할 중...
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

          {/* 분할안 결과 피드백 */}
          {splitMarkdown && (
            <div className="glass-dark rounded-2xl border border-white/5 p-6 space-y-5 animate-slideUp">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h4 className="text-slate-200 font-bold text-[13px] flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  본문 분할 기획이 완료되었습니다.
                </h4>
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
                        <th className="py-2.5 px-3">요일</th>
                        <th className="py-2.5 px-3">분할 본문 범위</th>
                        <th className="py-2.5 px-3">큐티 소제목</th>
                        <th className="py-2.5 px-3">핵심 묵상 초점</th>
                        <th className="py-2.5 px-3">본문 분할 신학적 이유</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300">
                      {splitDays.map((d, i) => (
                        <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 px-3 font-bold text-slate-100 text-center w-14">
                            <span className="px-2 py-1 rounded-lg bg-indigo-500/10 border border-indigo-400/20 text-indigo-300">
                              {d.day.replace(/요일/g, '')}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-semibold text-emerald-300">{d.passage}</td>
                          <td className="py-3 px-3 font-bold">{d.title}</td>
                          <td className="py-3 px-3 text-slate-400">{d.focus}</td>
                          <td className="py-3 px-3 text-slate-500 text-[11px] leading-relaxed max-w-xs">{d.reason}</td>
                        </tr>
                      ))}
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
          {/* 요일 선택 탭 */}
          <div className="flex flex-wrap gap-2 border-b border-white/5 pb-3">
            {Object.keys(dayManuscripts).map((d) => {
              const item = dayManuscripts[d]
              const hasDraft = !!item.draftContent
              const hasFinal = !!item.finalContent
              const active = activeDay === d
              
              return (
                <button
                  key={d}
                  onClick={() => {
                    setActiveDay(d)
                    setError(null)
                  }}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-[12px] font-bold transition-all ${
                    active 
                      ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_12px_rgba(99,102,241,0.2)]'
                      : hasFinal
                      ? 'bg-emerald-600/10 border-emerald-500/20 text-emerald-300 hover:bg-emerald-600/20'
                      : 'bg-[#060a16] border-white/5 text-slate-500 hover:text-slate-300 hover:border-white/10'
                  }`}
                >
                  {item.isGenerating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : hasFinal ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : null}
                  {d}요일
                  <span className="text-[9px] opacity-60">
                    {hasFinal ? '완료' : item.isGenerating ? '집필 중' : '대기'}
                  </span>
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
                    {activeDay}요일
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
                      원고 생성 및 자가 검토 교열 진행 중...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      {activeDay}요일 QT 최종 생성하기 (2단 체인)
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
          <div className="flex justify-between items-center pt-4 border-t border-white/5">
            <button
              onClick={goPrevStep}
              className="px-4 py-2.5 rounded-xl border border-white/5 hover:border-white/10 hover:bg-white/[0.02] text-slate-400 hover:text-white text-[12px] font-bold transition-all"
            >
              1단계로 돌아가기
            </button>

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
      )}

      {/* STEP 3: 주간 소책자 조립 */}
      {step === 3 && (
        <div className="space-y-6 animate-fadeIn">
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
                  {['A5', 'A6', 'B5', '엽서'].map(o => <option key={o} value={o}>{o}</option>)}
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

            <div className="flex justify-end pt-2">
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
        <div className="glass-dark rounded-2xl border border-white/5 p-12 text-center space-y-6 animate-fadeIn">
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
    </section>
  )
}
