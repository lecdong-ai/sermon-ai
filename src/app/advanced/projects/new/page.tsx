'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Plus, X, BookOpen, Calendar, User, ChevronRight,
  Sparkles, MessageSquare, BrainCircuit, Check, ArrowLeft,
  HelpCircle, Zap, Clock, Hash, Layers, Loader2, Lightbulb
} from 'lucide-react'
import { BIBLE_BOOKS, getBooksByTestament, type BibleBook } from '@/lib/advanced/bibleBooks'
import { getCustomProjects, mockProjects } from '@/lib/advanced/mockData'
import { setStorageItem } from '@/lib/storage'
import type { AdvancedProject, BiblePassage } from '@/lib/advanced/types'

const SERMON_TYPES = ['주일예배', '수요예배', '금요기도회', '새벽기도회', '특별집회', '부흥회', '수련회', '장례예배', '혼인예배']
const AUDIENCE_OPTIONS = ['장년', '청년', '학생', '유년', '전체', '남선교회', '여선교회']
const SEASONS = ['일반주일', '사순절', '부활절', '성령강림절', '추수감사절', '대림절', '성탄절', '종려주일', '고난주일']

function getTodayString(): string {
  const d = new Date()
  return d.toISOString().slice(0, 10)
}

function getNextSunday(): string {
  const d = new Date()
  const daysUntilSunday = (7 - d.getDay() + 0) % 7 || 7
  d.setDate(d.getDate() + daysUntilSunday)
  return d.toISOString().slice(0, 10)
}

const StepIndicator = ({ step, current, label }: { step: number; current: number; label: string }) => {
  const isComplete = step < current
  const isActive = step === current
  return (
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300 ${
        isActive
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
          : isComplete
          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
          : 'bg-white/5 text-slate-600 border border-white/5'
      }`}>
        {isComplete ? <Check className="w-4 h-4" /> : step}
      </div>
      <span className={`text-sm font-bold transition-colors ${
        isActive ? 'text-white' : isComplete ? 'text-emerald-400' : 'text-slate-600'
      }`}>
        {label}
      </span>
    </div>
  )
}

export default function NewProjectPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [testament, setTestament] = useState<'OT' | 'NT'>('NT')
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null)
  const [chapter, setChapter] = useState(searchParams.get('chapter') || '')
  const [verseStart, setVerseStart] = useState(searchParams.get('vs') || '')
  const [verseEnd, setVerseEnd] = useState(searchParams.get('ve') || '')

  const [selectedPassages, setSelectedPassages] = useState<BiblePassage[]>([])

  const [title, setTitle] = useState('')
  const [sermonDate, setSermonDate] = useState(getNextSunday)
  const [preacher, setPreacher] = useState('김바울')
  const [sermonType, setSermonType] = useState('주일예배')
  const [audience, setAudience] = useState('장년')
  const [season, setSeason] = useState('일반주일')

  const [aiEnabled, setAiEnabled] = useState(true)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggesting, setSuggesting] = useState(false)

  const books = useMemo(() => getBooksByTestament(testament), [testament])

  useEffect(() => {
    const bookParam = searchParams.get('book')
    if (bookParam) {
      const b = BIBLE_BOOKS.find(bb => bb.name === bookParam)
      if (b) {
        setTestament(b.testament as 'OT' | 'NT')
        setSelectedBook(b)
      }
    }
  }, [searchParams])

  const passageDisplay = useMemo(() => {
    if (!selectedBook) return ''
    const abbr = selectedBook.abbr
    const ch = chapter ? `${chapter}` : ''
    const vs = verseStart ? `${verseStart}` : ''
    const ve = verseEnd ? `-${verseEnd}` : ''
    if (!ch && !vs) return abbr
    if (!vs) return `${abbr} ${ch}장`
    return `${abbr} ${ch}:${vs}${ve}`
  }, [selectedBook, chapter, verseStart, verseEnd])

  const isFormValid = (selectedPassages.length > 0 || (selectedBook && chapter && verseStart)) && title.trim()

  const recentPassages = useMemo(() => {
    const projects = [...getCustomProjects(), ...mockProjects]
    const seen = new Set<string>()
    return projects
      .filter(p => p.book && p.chapter)
      .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
      .filter(p => {
        const key = `${p.book}_${p.chapter}_${p.verseStart}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      .slice(0, 5)
      .map(p => ({
        id: p.id,
        display: p.passage,
        book: p.book,
        chapter: p.chapter,
        verseStart: p.verseStart,
        verseEnd: p.verseEnd,
      }))
  }, [])

  const handleSuggest = async () => {
    if (!selectedBook) return
    setSuggesting(true)
    setShowSuggestions(true)
    try {
      const res = await fetch('/api/advanced/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'suggest-titles',
          data: {
            book: selectedBook.name,
            passage: passageDisplay,
            chapter,
            verseStart,
            verseEnd,
          },
        }),
      })
      const json = await res.json()
      if (json.success) {
        try {
          let output = json.data.output.trim()
          // Remove markdown code blocks
          if (output.startsWith('```')) {
            output = output.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '')
          }
          // Extract array from text (find first '[' and last ']')
          const startIdx = output.indexOf('[')
          const endIdx = output.lastIndexOf(']')
          if (startIdx !== -1 && endIdx > startIdx) {
            const jsonStr = output.slice(startIdx, endIdx + 1)
            const parsed = JSON.parse(jsonStr)
            setSuggestions(Array.isArray(parsed) ? parsed : [])
          } else {
            console.error('No array found in output:', output)
            setSuggestions([])
          }
        } catch (e) {
          console.error('Suggestion parse error:', e)
          setSuggestions([])
        }
      } else {
        console.error('AI suggest API error:', json.error)
      }
    } catch (e) {
      console.error('AI suggest failed:', e)
    }
    setSuggesting(false)
  }

  const [suggestions, setSuggestions] = useState<{ title: string; reason: string }[]>([])
  const [toast, setToast] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3500)
      return () => clearTimeout(t)
    }
  }, [toast])

  const handleQuickPassage = (book: string, chapterNum: number, vs: number, ve: number | null) => {
    const found = BIBLE_BOOKS.find(b => b.name === book)
    if (found) {
      setSelectedBook(found)
      setTestament(found.testament as 'OT' | 'NT')
      setChapter(String(chapterNum))
      setVerseStart(String(vs))
      setVerseEnd(ve ? String(ve) : '')
      // Also add to selected passages
      const abbr = found.abbr
      const p = ve ? `${abbr} ${chapterNum}:${vs}-${ve}` : `${abbr} ${chapterNum}:${vs}`
      addPassageToSelection(found.name, chapterNum, vs, ve, p)
    }
  }

  const addPassageToSelection = (book: string, chapterNum: number, vs: number, ve: number | null, display: string) => {
    const newPassage: BiblePassage = { book, chapter: chapterNum, verseStart: vs, verseEnd: ve, passage: display }
    setSelectedPassages(prev => {
      const key = `${book}_${chapterNum}_${vs}`
      if (prev.some(p => `${p.book}_${p.chapter}_${p.verseStart}` === key)) return prev
      return [...prev, newPassage]
    })
  }

  const handleAddPassage = () => {
    if (!selectedBook || !chapter || !verseStart) return
    const ch = parseInt(chapter)
    const vs = parseInt(verseStart)
    const ve = verseEnd ? parseInt(verseEnd) : null
    const p = ve ? `${selectedBook.abbr} ${ch}:${vs}-${ve}` : `${selectedBook.abbr} ${ch}:${vs}`
    addPassageToSelection(selectedBook.name, ch, vs, ve, p)
    // Clear input for next addition
    setChapter('')
    setVerseStart('')
    setVerseEnd('')
  }

  const handleRemovePassage = (index: number) => {
    setSelectedPassages(prev => prev.filter((_, i) => i !== index))
  }

  const handleCreate = () => {
    if (!isFormValid) return
    const newId = `proj-${Date.now().toString(36)}`
    const now = new Date().toISOString()

    const passages = selectedPassages.length > 0 ? selectedPassages : []
    const primaryPassage = passages.length > 0 ? passages[0] : null
    const ch = primaryPassage ? String(primaryPassage.chapter) : chapter
    const vs = primaryPassage ? String(primaryPassage.verseStart) : verseStart
    const ve = primaryPassage ? (primaryPassage.verseEnd ? String(primaryPassage.verseEnd) : undefined) : verseEnd
    const primaryBook = primaryPassage ? BIBLE_BOOKS.find(b => b.name === primaryPassage.book) : selectedBook
    const passageStr = primaryPassage ? primaryPassage.passage : (ve ? `${selectedBook?.abbr} ${ch}:${vs}-${ve}` : `${selectedBook?.abbr} ${ch}:${vs}`)
    const bookName = primaryPassage ? primaryPassage.book : (selectedBook?.name || '')

    const newProject: AdvancedProject = {
      id: newId,
      title: title.trim(),
      passage: passageStr,
      book: bookName,
      chapter: parseInt(ch),
      verseStart: parseInt(vs),
      verseEnd: ve ? parseInt(ve) : null,
      passages: passages.length > 0 ? passages : undefined,
      status: 'research',
      sermonDate,
      preacher,
      sermonType,
      audience: [audience],
      season,
      coreMessage: '',
      wordCount: 0,
      version: 1,
      themeIds: [],
      themeNames: [],
      tagNames: [],
      studyCount: 0,
      createdAt: now,
      updatedAt: now,
    }

    const existing = getCustomProjects()
    existing.push(newProject)
    setStorageItem('custom_projects', existing)

    // DB에도 저장 (직조대/통찰 연결/이음 기능이 DB에서 찾을 수 있도록)
    fetch('/api/sermons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newProject.title,
        normalizedPassage: newProject.passage,
        bibleBook: bookName,
        chapterStart: ch ? parseInt(ch) : null,
        chapterEnd: null,
        verseStart: vs ? parseInt(vs) : null,
        verseEnd: ve ? parseInt(ve) : null,
        date: sermonDate,
        preacher,
        sermonType,
        audience,
        season,
        status: 'draft',
      }),
    }).then(async (res) => {
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.error || `서버 오류 (${res.status})`)
      }
    }).catch((e) => {
      console.error('DB 저장 실패:', e)
      setToast({ kind: 'error', text: `⚠ DB 저장 실패: ${e?.message || '네트워크 오류'} (로컬에는 저장됨)` })
    })

    router.push(`/advanced/projects/${newId}?tab=overview&new=true`)
  }

  return (
    <div className="min-h-full pb-20">
      <div className="max-w-[1100px] mx-auto px-6 py-8 space-y-10">

        {/* ── Page Header ── */}
        <div className="flex items-end justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">New Sermon Project</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              새 설교 프로젝트
            </h1>
            <p className="text-[13px] text-slate-500 font-medium">
              성경 본문을 선택하고 새로운 설교 프로젝트를 시작하세요
            </p>
          </div>
          <button
            onClick={() => router.push('/advanced/projects')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            목록으로
          </button>
        </div>

        {/* ── Progress Steps ── */}
        <div className="flex items-center gap-8 px-1">
          <StepIndicator step={1} current={1} label="본문 선택" />
          <div className="flex-1 h-px bg-white/5" />
          <StepIndicator step={2} current={1} label="기본 정보" />
          <div className="flex-1 h-px bg-white/5" />
          <StepIndicator step={3} current={1} label="생성" />
        </div>

        {/* ════════════════════════════════════════════ */}
        {/* STEP 1: 성경 본문 선택 */}
        {/* ════════════════════════════════════════════ */}
        <section className="relative glass-dark rounded-3xl border border-white/5 p-6 sm:p-8 space-y-7 overflow-hidden">
          <div className="absolute top-[-60px] right-[-60px] w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Section Header */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-indigo-600/20">
              1
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">성경 본문 선택</h2>
              <p className="text-[11px] text-slate-500 font-medium">설교할 말씀의 책과 장, 절을 선택하세요</p>
            </div>
          </div>

          {/* 구약/신약 Tabs */}
          <div className="flex gap-1.5 bg-[#050a18] rounded-xl p-1 border border-white/5 w-fit">
            <button
              onClick={() => { setTestament('OT'); setSelectedBook(null) }}
              className={`px-5 py-1.5 rounded-lg text-[12px] font-bold transition-all ${
                testament === 'OT'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              구약 (39권)
            </button>
            <button
              onClick={() => { setTestament('NT'); setSelectedBook(null) }}
              className={`px-5 py-1.5 rounded-lg text-[12px] font-bold transition-all ${
                testament === 'NT'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              신약 (27권)
            </button>
          </div>

          {/* Book Grid */}
          <div className="space-y-2.5">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">성경 권 선택</span>
            <div className="grid grid-cols-7 sm:grid-cols-8 md:grid-cols-10 gap-1.5">
              {books.map(book => {
                const isSelected = selectedBook?.id === book.id
                return (
                  <button
                    key={book.id}
                    onClick={() => setSelectedBook(isSelected ? null : book)}
                    className={`
                      relative group px-1 py-2 rounded-xl text-[12px] font-bold transition-all duration-200
                      ${isSelected
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 border border-indigo-500'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200 border border-transparent hover:border-white/10'
                      }
                    `}
                    title={book.name}
                  >
                    <span className="block text-[13px]">{book.abbr}</span>
                    <span className="block text-[8px] opacity-50 mt-0.5">{book.chapters}장</span>
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 rounded-lg bg-[#0c1025] border border-white/10 text-[11px] text-slate-200 font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-20">
                      {book.name}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0c1025]" />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Selected Book + Verse Inputs */}
          {selectedBook && (
            <div className="animate-fade-in space-y-5">
              {/* Selected Book Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[13px] font-bold">
                <BookOpen className="w-4 h-4" />
                {selectedBook.name}
                <span className="text-slate-500 font-medium">· {selectedBook.chapters}장</span>
                <button
                  onClick={() => setSelectedBook(null)}
                  className="ml-1 p-0.5 rounded hover:bg-white/10 text-slate-500 hover:text-white transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Chapter & Verse Inputs */}
              <div className="flex flex-wrap items-end gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 flex items-center gap-1">
                    <Hash className="w-3 h-3" />
                    장
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={selectedBook.chapters}
                    value={chapter}
                    onChange={e => setChapter(e.target.value.replace(/\D/g, '').slice(0, 3))}
                    placeholder={`1-${selectedBook.chapters}`}
                    className="w-20 text-[13px] bg-[#0c1020] border border-white/5 rounded-xl px-3 py-2 text-slate-200 placeholder:text-slate-600 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 flex items-center gap-1">
                    <span className="w-3 h-3 flex items-center justify-center text-[9px]">시</span>
                    절 (시작)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={verseStart}
                    onChange={e => setVerseStart(e.target.value.replace(/\D/g, '').slice(0, 3))}
                    placeholder="1"
                    className="w-20 text-[13px] bg-[#0c1020] border border-white/5 rounded-xl px-3 py-2 text-slate-200 placeholder:text-slate-600 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all font-medium"
                  />
                </div>
                <div className="flex items-center text-slate-600 pb-2">
                  <span className="text-lg">~</span>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 flex items-center gap-1">
                    <span className="w-3 h-3 flex items-center justify-center text-[9px]">시</span>
                    절 (끝)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={verseEnd}
                    onChange={e => setVerseEnd(e.target.value.replace(/\D/g, '').slice(0, 3))}
                    placeholder="선택"
                    className="w-20 text-[13px] bg-[#0c1020] border border-white/5 rounded-xl px-3 py-2 text-slate-200 placeholder:text-slate-600 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all font-medium"
                  />
                </div>

                {/* Passage Preview Badge */}
                {passageDisplay && (
                  <div className="ml-2 pb-1 flex items-center gap-2">
                    <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-300 text-[14px] font-extrabold shadow-lg animate-scale">
                      {passageDisplay}
                    </div>
                    <button
                      onClick={handleAddPassage}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[12px] font-bold transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      추가
                    </button>
                  </div>
                )}
              </div>

              {/* Selected Passages List */}
              {selectedPassages.length > 0 && (
                <div className="animate-fade-in mt-4 p-4 rounded-xl bg-[#050a18] border border-white/5">
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">선택된 본문 ({selectedPassages.length}개)</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedPassages.map((p, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[12px] font-bold"
                      >
                        <span className="w-4 h-4 rounded-full bg-indigo-500/20 text-[9px] flex items-center justify-center">{i + 1}</span>
                        {p.passage}
                        <button
                          onClick={() => handleRemovePassage(i)}
                          className="ml-1 p-0.5 rounded hover:bg-white/10 text-slate-500 hover:text-white transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Recent Passages Quick Select */}
          <div className="space-y-3 pt-2 border-t border-white/5">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">최근 연구한 본문</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentPassages.map(p => (
                <button
                  key={p.id}
                  onClick={() => handleQuickPassage(p.book, p.chapter, p.verseStart, p.verseEnd)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-indigo-500/15 border border-white/5 hover:border-indigo-500/30 text-[12px] font-bold text-slate-400 hover:text-indigo-300 transition-all"
                >
                  {p.display}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════ */}
        {/* STEP 2: 기본 정보 입력 */}
        {/* ════════════════════════════════════════════ */}
        <section className="relative glass-dark rounded-3xl border border-white/5 p-6 sm:p-8 space-y-7 overflow-hidden">
          <div className="absolute top-[-60px] left-[-60px] w-40 h-40 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-600/50 flex items-center justify-center text-sm font-bold text-slate-400 border border-white/5">
              2
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">기본 정보 입력</h2>
              <p className="text-[11px] text-slate-500 font-medium">설교 프로젝트의 기본 정보를 입력하세요</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Title */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                설교 제목
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="설교 제목을 입력하거나 AI 추천을 받아보세요"
                  className="flex-1 text-[13px] bg-[#0c1020] border border-white/5 rounded-xl px-4 py-2.5 text-slate-200 placeholder:text-slate-600 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all font-medium"
                />
                {selectedBook && (
                  <button
                    onClick={handleSuggest}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[11px] font-bold transition-all shrink-0"
                    title="AI 제목 추천"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    AI 추천
                  </button>
                )}
              </div>

              {/* AI 추천 패널 */}
              {showSuggestions && selectedBook && (
                <div className="animate-fade-in mt-3 rounded-2xl bg-[#060b1a] border border-indigo-500/20 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-400" />
                      <span className="text-[11px] font-extrabold text-slate-300">AI 제목 추천 5가지</span>
                    </div>
                    <button
                      onClick={() => setShowSuggestions(false)}
                      className="p-0.5 rounded hover:bg-white/10 text-slate-500 hover:text-white transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {suggesting ? (
                    <div className="flex items-center justify-center gap-2 py-6">
                      <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                      <span className="text-[12px] text-slate-500 font-medium">본문을 분석하여 제목을 추천 중...</span>
                    </div>
                  ) : suggestions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <p className="text-[12px] text-slate-400 font-medium">추천 제목을 생성하지 못했습니다.</p>
                      <button
                        onClick={handleSuggest}
                        className="mt-2 text-[11px] text-indigo-400 hover:text-indigo-300 font-bold transition-colors"
                      >
                        다시 시도
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {suggestions.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => { setTitle(s.title); setShowSuggestions(false) }}
                          className="w-full text-left p-3 rounded-xl bg-white/5 hover:bg-indigo-500/10 border border-white/5 hover:border-indigo-500/30 transition-all group"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                                  {i + 1}
                                </span>
                                <span className="text-[13px] font-bold text-slate-200 group-hover:text-indigo-300 transition-colors">
                                  {s.title}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-1.5 ml-7 leading-relaxed">
                                {s.reason}
                              </p>
                            </div>
                            <div className="shrink-0 mt-0.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                              적용
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sermon Date */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                설교 날짜
              </label>
              <input
                type="date"
                value={sermonDate}
                onChange={e => setSermonDate(e.target.value)}
                className="w-full text-[13px] bg-[#0c1020] border border-white/5 rounded-xl px-4 py-2.5 text-slate-200 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all font-medium [color-scheme:dark]"
              />
            </div>

            {/* Season */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 flex items-center gap-1">
                <Layers className="w-3 h-3" />
                교회 절기
              </label>
              <select
                value={season}
                onChange={e => setSeason(e.target.value)}
                className="w-full text-[13px] bg-[#0c1020] border border-white/5 rounded-xl px-4 py-2.5 text-slate-200 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all font-medium appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 12px center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '18px 18px',
                }}
              >
                {SEASONS.map(s => (
                  <option key={s} value={s} className="bg-[#0c1020]">{s}</option>
                ))}
              </select>
            </div>

            {/* Preacher */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 flex items-center gap-1">
                <User className="w-3 h-3" />
                설교자
              </label>
              <input
                type="text"
                value={preacher}
                onChange={e => setPreacher(e.target.value)}
                className="w-full text-[13px] bg-[#0c1020] border border-white/5 rounded-xl px-4 py-2.5 text-slate-200 placeholder:text-slate-600 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all font-medium"
              />
            </div>

            {/* Sermon Type */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 flex items-center gap-1">
                <Zap className="w-3 h-3" />
                설교 유형
              </label>
              <select
                value={sermonType}
                onChange={e => setSermonType(e.target.value)}
                className="w-full text-[13px] bg-[#0c1020] border border-white/5 rounded-xl px-4 py-2.5 text-slate-200 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all font-medium appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 12px center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '18px 18px',
                }}
              >
                {SERMON_TYPES.map(t => (
                  <option key={t} value={t} className="bg-[#0c1020]">{t}</option>
                ))}
              </select>
            </div>

            {/* Audience */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 flex items-center gap-1">
                <HelpCircle className="w-3 h-3" />
                회중
              </label>
              <select
                value={audience}
                onChange={e => setAudience(e.target.value)}
                className="w-full text-[13px] bg-[#0c1020] border border-white/5 rounded-xl px-4 py-2.5 text-slate-200 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all font-medium appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 12px center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '18px 18px',
                }}
              >
                {AUDIENCE_OPTIONS.map(a => (
                  <option key={a} value={a} className="bg-[#0c1020]">{a}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════ */}
        {/* STEP 3: AI 옵션 & 생성 */}
        {/* ════════════════════════════════════════════ */}
        <section className="relative glass-dark rounded-3xl border border-white/5 p-6 sm:p-8 space-y-7 overflow-hidden">
          <div className="absolute bottom-[-60px] right-[-60px] w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-600/50 flex items-center justify-center text-sm font-bold text-slate-400 border border-white/5">
              3
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">AI 옵션 & 생성</h2>
              <p className="text-[11px] text-slate-500 font-medium">AI의 도움을 설정하고 프로젝트를 생성하세요</p>
            </div>
          </div>

          {/* AI Toggle Card */}
          <div className="relative rounded-2xl bg-white/5 border border-white/5 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  aiEnabled ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-white/5 text-slate-500 border border-white/5'
                }`}>
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-white">AI와 함께 시작하기</p>
                  <p className="text-[11px] text-slate-500 font-medium">프로젝트 생성 후 AI가 자동으로 본문을 분석합니다</p>
                </div>
              </div>
              <button
                onClick={() => setAiEnabled(!aiEnabled)}
                className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                  aiEnabled ? 'bg-indigo-600' : 'bg-white/10'
                }`}
              >
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 ${
                  aiEnabled ? 'left-[26px]' : 'left-0.5'
                }`} />
              </button>
            </div>

            {/* AI Preview - what it will do */}
            {aiEnabled && (
              <div className="animate-fade-in grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/5">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                  <BookOpen className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[11px] font-bold text-slate-200">본문 분석</p>
                    <p className="text-[10px] text-slate-500">원어 분석, 배경 설명, 구조 개요 자동 생성</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
                  <Layers className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[11px] font-bold text-slate-200">대지 초안</p>
                    <p className="text-[10px] text-slate-500">본문 기반 3-4개 대지와 소제목 제안</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                  <Sparkles className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[11px] font-bold text-slate-200">제목 추천</p>
                    <p className="text-[10px] text-slate-500">설교 제목 5개 후보 자동 생성</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Summary & Create */}
          <div className="space-y-4">
            {/* Creation Summary */}
            <div className="flex flex-wrap items-center gap-3 text-[12px] text-slate-400 font-medium">
              <span className="text-slate-500">요약:</span>
              {selectedPassages.length > 0 ? (
                <span className="px-2.5 py-1 rounded-lg bg-white/5 text-slate-300 font-bold">
                  본문 {selectedPassages.length}개
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-lg bg-white/5 text-slate-300 font-bold">
                  {passageDisplay || '본문 미선택'}
                </span>
              )}
              {title && (
                <span className="px-2.5 py-1 rounded-lg bg-white/5 text-slate-300 font-bold">
                  {title}
                </span>
              )}
              <span className="text-slate-600">{sermonDate}</span>
              <span className="text-slate-600">{sermonType}</span>
            </div>

            {/* Create Button */}
            <button
              onClick={handleCreate}
              disabled={!isFormValid}
              className={`
                w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-[15px] font-extrabold transition-all duration-300
                ${isFormValid
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 hover:-translate-y-0.5'
                  : 'bg-white/5 text-slate-600 cursor-not-allowed border border-white/5'
                }
              `}
            >
              {isFormValid ? (
                <>
                  <Zap className="w-5 h-5" />
                  {selectedPassages.length > 0
                    ? `${selectedPassages.length}개 본문 프로젝트 생성하기`
                    : aiEnabled ? 'AI와 함께 프로젝트 생성하기' : '프로젝트 생성하기'
                  }
                  <ChevronRight className="w-5 h-5" />
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  본문과 제목을 입력해주세요
                </>
              )}
            </button>

            <p className="text-center text-[10px] text-slate-600 font-medium">
              프로젝트를 생성하면 연구 단계로 자동 설정되며, 언제든지 수정할 수 있습니다
            </p>
          </div>
        </section>
      </div>

      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl border backdrop-blur-md text-xs font-bold transition-all ${
          toast.kind === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : 'bg-red-500/10 border-red-500/30 text-red-300'
        }`}>
          {toast.text}
        </div>
      )}
    </div>
  )
}
