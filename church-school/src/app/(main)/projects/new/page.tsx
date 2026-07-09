'use client'

import { Suspense, useState, useMemo, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Plus, X, BookOpen, Calendar, User, ChevronRight,
  Sparkles, MessageSquare, BrainCircuit, Check, ArrowLeft,
  HelpCircle, Zap, Clock, Hash, Layers, Loader2, Lightbulb,
  MessageCircle, Image, ArrowRightLeft, Megaphone, Wand2
} from 'lucide-react'
import { BIBLE_BOOKS, getBooksByTestament, type BibleBook } from '@/lib/project/bibleBooks'
import { getCustomProjects } from '@/lib/project/customProjects'
import { setStorageItem } from '@/lib/storage'
import type { AdvancedProject, BiblePassage } from '@/lib/project/types'

const SERMON_TYPES = ['주일예배', '수요예배', '금요기도회', '새벽기도회', '특별집회', '부흥회', '수련회', '장례예배', '혼인예배']
const AUDIENCE_OPTIONS = ['장년', '청년', '학생', '유년', '전체', '남선교회', '여선교회']
const SEASONS = ['일반주일', '사순절', '부활절', '성령강림절', '추수감사절', '대림절', '성탄절', '종려주일', '고난주일']

const STYLE_META: Record<string, { label: string; icon: any; color: string }> = {
  declarative: { label: '진술형', icon: MessageCircle, color: 'text-indigo-300' },
  question: { label: '질문형', icon: HelpCircle, color: 'text-cyan-300' },
  image: { label: '이미지형', icon: Image, color: 'text-amber-300' },
  contrast: { label: '대조형', icon: ArrowRightLeft, color: 'text-rose-300' },
  imperative: { label: '명령형', icon: Megaphone, color: 'text-emerald-300' },
}

function getStyleMeta(style: string) {
  return STYLE_META[style] || STYLE_META.declarative
}

/* ── 인풋 공통 스타일 (다크) ── */
const inputClass = "w-full text-[13px] bg-slate-950/60 border border-white/10 rounded-xl px-4 py-2.5 text-slate-100 placeholder:text-slate-600 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all font-medium"
const labelClass = "text-[10px] font-extrabold uppercase tracking-widest text-slate-500 flex items-center gap-1"
const selectClass = `${inputClass} appearance-none cursor-pointer`
const selectArrow = `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`

export default function NewProjectPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-full min-h-[calc(100vh-4rem)]" style={{ background: 'linear-gradient(180deg, #050816 0%, #0a0e1a 50%, #0d1220 100%)' }}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          <p className="text-[12px] text-slate-500 font-bold">로딩 중...</p>
        </div>
      </div>
    }>
      <NewProjectPageContent />
    </Suspense>
  )
}

function NewProjectPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // 초기값은 빈 상태로 시작 (hydration mismatch 방지)
  const [testament, setTestament] = useState<'OT' | 'NT'>('NT')
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null)
  const [chapter, setChapter] = useState(searchParams.get('chapter') || '')
  const [verseStart, setVerseStart] = useState(searchParams.get('vs') || '')
  const [verseEnd, setVerseEnd] = useState(searchParams.get('ve') || '')

  const [selectedPassages, setSelectedPassages] = useState<BiblePassage[]>([])

  const [title, setTitle] = useState('')
  const [sermonDate, setSermonDate] = useState('')
  const [preacher, setPreacher] = useState('김바울')
  const [sermonType, setSermonType] = useState('주일예배')
  const [audience, setAudience] = useState('장년')
  const [season, setSeason] = useState('일반주일')

  const [aiEnabled, setAiEnabled] = useState(true)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggesting, setSuggesting] = useState(false)
  const [suggestions, setSuggestions] = useState<Array<{ title: string; reason: string; style: string; passages_used: string[] }>>([])
  const [toast, setToast] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)
  const [recentPassages, setRecentPassages] = useState<Array<{ id: string; display: string; book: string; chapter: number; verseStart: number; verseEnd: number | null }>>([])

  const books = useMemo(() => getBooksByTestament(testament), [testament])

  // 클라이언트에서만 실행 (Date/LocalStorage 사용)
  useEffect(() => {
    const today = new Date()
    const daysUntilSunday = (7 - today.getDay()) % 7 || 7
    const nextSunday = new Date(today)
    nextSunday.setDate(today.getDate() + daysUntilSunday)
    setSermonDate(nextSunday.toISOString().slice(0, 10))

    // localStorage에서 최근 본문 로드
    try {
      const projects = getCustomProjects()
      const seen = new Set<string>()
      const recent = projects
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
      setRecentPassages(recent)
    } catch {}
  }, [])

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

  const handleAddPassage = () => {
    if (!selectedBook || !chapter || !verseStart) return
    const newPassage: BiblePassage = {
      book: selectedBook.name,
      chapter: parseInt(chapter),
      verseStart: parseInt(verseStart),
      verseEnd: verseEnd ? parseInt(verseEnd) : null,
      passage: passageDisplay,
      role: 'primary',
    }
    setSelectedPassages([...selectedPassages, newPassage])
    setSelectedBook(null)
    setChapter('')
    setVerseStart('')
    setVerseEnd('')
  }

  const handleRemovePassage = (idx: number) => {
    setSelectedPassages(selectedPassages.filter((_, i) => i !== idx))
  }

  const handleQuickPassage = (book: string, chapter: number, verseStart: number, verseEnd: number | null) => {
    const b = BIBLE_BOOKS.find(bb => bb.name === book)
    if (!b) return
    setTestament(b.testament as 'OT' | 'NT')
    setSelectedBook(b)
    setChapter(String(chapter))
    setVerseStart(String(verseStart))
    setVerseEnd(verseEnd ? String(verseEnd) : '')
  }

  const handleSuggest = async () => {
    if (!selectedBook && selectedPassages.length === 0) return
    setSuggesting(true)
    setShowSuggestions(true)
    try {
      const passages: Array<{ book: string; chapter: string | number; verseStart: string | number; verseEnd?: string | number | null; text?: string }> = []

      if (selectedPassages.length > 0) {
        for (const p of selectedPassages) {
          passages.push({
            book: p.book,
            chapter: p.chapter,
            verseStart: p.verseStart,
            verseEnd: p.verseEnd || null,
            text: p.passage,
          })
        }
      } else {
        passages.push({
          book: selectedBook?.name || '',
          chapter,
          verseStart,
          verseEnd: verseEnd || null,
          text: passageDisplay,
        })
      }

      const res = await fetch('/api/sermons/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'suggest-titles',
          data: {
            passages,
            book: selectedBook?.name,
            passage: passageDisplay,
            chapter,
            verseStart,
            verseEnd,
          },
        }),
      })
      const json = await res.json()
      if (json.success) {
        let output = (json.data?.output || '').trim()
        if (output.startsWith('```')) {
          output = output.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '')
        }
        const startIdx = output.indexOf('[')
        const endIdx = output.lastIndexOf(']')
        if (startIdx !== -1 && endIdx > startIdx) {
          const jsonStr = output.slice(startIdx, endIdx + 1)
          const parsed = JSON.parse(jsonStr)
          const normalized = (Array.isArray(parsed) ? parsed : []).map((s: any) => ({
            title: s.title || '',
            reason: s.reason || '',
            style: s.style || 'declarative',
            passages_used: Array.isArray(s.passages_used) ? s.passages_used : [],
          }))
          setSuggestions(normalized)
          if (normalized.length > 0) {
            const isMulti = passages.length > 1
            setToast({ kind: 'success', text: `AI 추천 제목 ${normalized.length}개${isMulti ? ' (다중 본문 통합)' : ''}` })
          } else {
            setToast({ kind: 'error', text: '추천된 제목이 없습니다. 직접 입력해주세요.' })
          }
        } else {
          setSuggestions([])
          setToast({ kind: 'error', text: 'AI 응답을 파싱할 수 없습니다. 다시 시도해주세요.' })
        }
      } else {
        setToast({ kind: 'error', text: json.error || 'AI 추천에 실패했습니다.' })
      }
    } catch (e: any) {
      console.error('[AI suggest] error:', e)
      setToast({ kind: 'error', text: `AI 추천 실패: ${e?.message || '네트워크 오류'}` })
    } finally {
      setSuggesting(false)
    }
  }

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3500)
      return () => clearTimeout(t)
    }
  }, [toast])

  const handleCreate = async () => {
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

    let apiId: string | null = null
    try {
      const res = await fetch('/api/sermons', {
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
          passages: newProject.passages || [],
        }),
      })
      if (res.ok) {
        const json = await res.json()
        apiId = json?.data?.id || null
        if (apiId && apiId !== newId) {
          const refreshed = getCustomProjects()
          const idx2 = refreshed.findIndex(p => p.id === newId)
          if (idx2 !== -1) {
            refreshed[idx2] = { ...refreshed[idx2], id: apiId }
            setStorageItem('custom_projects', refreshed)
            window.dispatchEvent(new StorageEvent('storage', { key: 'custom_projects' }))
          }
          router.push(`/projects/${apiId}?tab=overview&new=true`)
          return
        }
      } else {
        const json = await res.json().catch(() => ({}))
        console.error('DB 저장 실패:', json.error || res.status)
        setToast({ kind: 'error', text: `DB 저장 실패: ${json.error || res.status} (로컬에는 저장됨)` })
      }
    } catch (e: any) {
      console.error('DB 저장 실패:', e)
      setToast({ kind: 'error', text: `DB 저장 실패: ${e?.message || '네트워크 오류'} (로컬에는 저장됨)` })
    }

    router.push(`/projects/${newId}?tab=overview&new=true`)
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] pb-20 relative" style={{ background: 'linear-gradient(180deg, #050816 0%, #0a0e1a 50%, #0d1220 100%)' }}>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-[1100px] mx-auto px-6 py-8 space-y-8">
        {/* ── Page Header ── */}
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
              <Wand2 className="w-3 h-3 text-indigo-300" strokeWidth={2.5} />
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-300">새 설교 프로젝트</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">새 설교 프로젝트</h1>
            <p className="text-[13px] text-slate-500 font-medium">성경 본문을 선택하고 새로운 설교 프로젝트를 시작하세요</p>
          </div>
          <button
            onClick={() => router.push('/projects')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            목록으로
          </button>
        </div>

        {/* ── Progress Steps ── */}
        <div className="flex items-center gap-4 sm:gap-8 px-1 overflow-x-auto">
          <StepIndicator step={1} current={1} label="본문 선택" />
          <div className="flex-1 h-px bg-white/5 min-w-[20px]" />
          <StepIndicator step={2} current={1} label="기본 정보" />
          <div className="flex-1 h-px bg-white/5 min-w-[20px]" />
          <StepIndicator step={3} current={1} label="AI & 생성" />
        </div>

        {/* ════════════════════════════════════════════ */}
        {/* STEP 1: 성경 본문 선택 */}
        {/* ════════════════════════════════════════════ */}
        <section className="relative rounded-3xl border border-white/5 bg-slate-950/40 p-6 sm:p-8 space-y-7 overflow-hidden">
          <div className="absolute top-[-60px] right-[-60px] w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-indigo-600/30">
              1
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">성경 본문 선택</h2>
              <p className="text-[11px] text-slate-500 font-medium">설교할 말씀의 책과 장, 절을 선택하세요</p>
            </div>
          </div>

          {/* 구약/신약 Tabs */}
          <div className="flex gap-1.5 bg-slate-950/60 rounded-xl p-1 border border-white/5 w-fit">
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
            <span className={labelClass}>성경 권 선택</span>
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
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-500'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200 border border-transparent hover:border-white/10'
                      }
                    `}
                    title={book.name}
                  >
                    <span className="block text-[13px]">{book.abbr}</span>
                    <span className="block text-[8px] opacity-50 mt-0.5">{book.chapters}장</span>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 rounded-lg bg-slate-900 border border-white/10 text-[11px] text-slate-100 font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-20">
                      {book.name}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Selected Book + Verse Inputs */}
          {selectedBook && (
            <div className="animate-fade-in space-y-5">
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

              <div className="flex flex-wrap items-end gap-3">
                <div className="space-y-1.5">
                  <label className={labelClass}>
                    <Hash className="w-3 h-3" />장
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={selectedBook.chapters}
                    value={chapter}
                    onChange={e => setChapter(e.target.value.replace(/\D/g, '').slice(0, 3))}
                    placeholder={`1-${selectedBook.chapters}`}
                    className="w-20 text-[13px] bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2.5 text-slate-100 placeholder:text-slate-600 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>
                    <span className="w-3 h-3 flex items-center justify-center text-[9px]">시</span>절 (시작)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={verseStart}
                    onChange={e => setVerseStart(e.target.value.replace(/\D/g, '').slice(0, 3))}
                    placeholder="1"
                    className="w-20 text-[13px] bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2.5 text-slate-100 placeholder:text-slate-600 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all font-medium"
                  />
                </div>
                <div className="flex items-center text-slate-600 pb-2.5">
                  <span className="text-lg">~</span>
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>
                    <span className="w-3 h-3 flex items-center justify-center text-[9px]">시</span>절 (끝)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={verseEnd}
                    onChange={e => setVerseEnd(e.target.value.replace(/\D/g, '').slice(0, 3))}
                    placeholder="선택"
                    className="w-20 text-[13px] bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2.5 text-slate-100 placeholder:text-slate-600 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all font-medium"
                  />
                </div>

                {passageDisplay && (
                  <div className="ml-2 pb-1 flex items-center gap-2">
                    <div className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-200 text-[14px] font-extrabold shadow-lg">
                      {passageDisplay}
                    </div>
                    <button
                      onClick={handleAddPassage}
                      className="flex items-center gap-1 px-3 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[12px] font-bold transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      추가
                    </button>
                  </div>
                )}
              </div>

              {selectedPassages.length > 0 && (
                <div className="animate-fade-in mt-4 p-4 rounded-xl bg-slate-950/60 border border-white/5">
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
          {recentPassages.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-white/5">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span className={labelClass}>최근 연구한 본문</span>
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
          )}
        </section>

        {/* ════════════════════════════════════════════ */}
        {/* STEP 2: 기본 정보 입력 */}
        {/* ════════════════════════════════════════════ */}
        <section className="relative rounded-3xl border border-white/5 bg-slate-950/40 p-6 sm:p-8 space-y-7 overflow-hidden">
          <div className="absolute top-[-60px] left-[-60px] w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-200 border border-white/10">
              2
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">기본 정보 입력</h2>
              <p className="text-[11px] text-slate-500 font-medium">설교 프로젝트의 기본 정보를 입력하세요</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2 space-y-1.5">
              <label className={labelClass}>
                <MessageSquare className="w-3 h-3" />설교 제목
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="설교 제목을 입력하거나 AI 추천을 받아보세요"
                  className={`${inputClass} flex-1`}
                />
                {(selectedBook || selectedPassages.length > 0) && (
                  <button
                    onClick={handleSuggest}
                    disabled={suggesting}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[11px] font-bold transition-all shrink-0 disabled:opacity-50"
                    title={selectedPassages.length > 1 ? `AI 제목 추천 (다중 본문 ${selectedPassages.length}개 통합)` : 'AI 제목 추천'}
                  >
                    {suggesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    AI 추천
                    {selectedPassages.length > 1 && (
                      <span className="px-1.5 py-0.5 rounded bg-indigo-500/30 text-[9px] font-bold">×{selectedPassages.length}</span>
                    )}
                  </button>
                )}
              </div>

              {showSuggestions && selectedBook && (
                <div className="animate-fade-in mt-3 rounded-2xl bg-slate-950/70 border border-indigo-500/30 p-4 space-y-3 shadow-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-400" />
                      <span className="text-[11px] font-extrabold text-slate-200">AI 제목 추천 5가지</span>
                    </div>
                    <button
                      onClick={() => setShowSuggestions(false)}
                      className="p-1 rounded hover:bg-white/10 text-slate-500 hover:text-white transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {suggesting ? (
                    <div className="flex items-center justify-center gap-2 py-8">
                      <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                      <span className="text-[12px] text-slate-400 font-medium">본문을 분석하여 제목을 추천 중...</span>
                    </div>
                  ) : suggestions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <p className="text-[12px] text-slate-400 font-medium">추천 제목을 생성하지 못했습니다.</p>
                      <button onClick={handleSuggest} className="mt-2 text-[11px] text-indigo-400 hover:text-indigo-300 font-bold transition-colors">다시 시도</button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {suggestions.map((s, i) => {
                        const styleMeta = getStyleMeta(s.style || 'declarative')
                        const StyleIcon = styleMeta.icon
                        return (
                          <button
                            key={i}
                            onClick={() => { setTitle(s.title); setShowSuggestions(false) }}
                            className="w-full text-left p-3 rounded-xl bg-white/5 hover:bg-indigo-500/10 border border-white/5 hover:border-indigo-500/30 transition-all group"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                                  <StyleIcon className={`w-3 h-3 ${styleMeta.color} shrink-0`} />
                                  <span className="text-[13px] font-bold text-slate-200 group-hover:text-indigo-300 transition-colors">{s.title}</span>
                                </div>
                                <p className="text-[11px] text-slate-500 mt-1.5 ml-7 leading-relaxed">{s.reason}</p>
                                {s.passages_used && s.passages_used.length > 0 && (
                                  <div className="flex items-center gap-1 flex-wrap mt-1.5 ml-7">
                                    {s.passages_used.map((ref, j) => (
                                      <span key={j} className="inline-flex items-center px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[9.5px] font-semibold tabular-nums">{ref}</span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="shrink-0 mt-0.5 px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">적용</div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className={labelClass}>
                <Calendar className="w-3 h-3" />설교 날짜
              </label>
              <input
                type="date"
                value={sermonDate}
                onChange={e => setSermonDate(e.target.value)}
                className={`${inputClass} [color-scheme:dark]`}
              />
            </div>

            <div className="space-y-1.5">
              <label className={labelClass}>
                <Layers className="w-3 h-3" />교회 절기
              </label>
              <select
                value={season}
                onChange={e => setSeason(e.target.value)}
                className={selectClass}
                style={{ backgroundImage: selectArrow, backgroundPosition: 'right 12px center', backgroundRepeat: 'no-repeat', backgroundSize: '18px 18px', paddingRight: '40px' }}
              >
                {SEASONS.map(s => <option key={s} value={s} className="bg-slate-900">{s}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className={labelClass}>
                <User className="w-3 h-3" />설교자
              </label>
              <input
                type="text"
                value={preacher}
                onChange={e => setPreacher(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="space-y-1.5">
              <label className={labelClass}>
                <Zap className="w-3 h-3" />설교 유형
              </label>
              <select
                value={sermonType}
                onChange={e => setSermonType(e.target.value)}
                className={selectClass}
                style={{ backgroundImage: selectArrow, backgroundPosition: 'right 12px center', backgroundRepeat: 'no-repeat', backgroundSize: '18px 18px', paddingRight: '40px' }}
              >
                {SERMON_TYPES.map(t => <option key={t} value={t} className="bg-slate-900">{t}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className={labelClass}>
                <HelpCircle className="w-3 h-3" />회중
              </label>
              <select
                value={audience}
                onChange={e => setAudience(e.target.value)}
                className={selectClass}
                style={{ backgroundImage: selectArrow, backgroundPosition: 'right 12px center', backgroundRepeat: 'no-repeat', backgroundSize: '18px 18px', paddingRight: '40px' }}
              >
                {AUDIENCE_OPTIONS.map(a => <option key={a} value={a} className="bg-slate-900">{a}</option>)}
              </select>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════ */}
        {/* STEP 3: AI 옵션 & 생성 */}
        {/* ════════════════════════════════════════════ */}
        <section className="relative rounded-3xl border border-white/5 bg-slate-950/40 p-6 sm:p-8 space-y-7 overflow-hidden">
          <div className="absolute bottom-[-60px] right-[-60px] w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-200 border border-white/10">
              3
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">AI 옵션 & 생성</h2>
              <p className="text-[11px] text-slate-500 font-medium">AI의 도움을 설정하고 프로젝트를 생성하세요</p>
            </div>
          </div>

          <div className="relative rounded-2xl bg-white/[0.03] border border-white/5 p-5 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                  aiEnabled ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-white/5 text-slate-500 border border-white/5'
                }`}>
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[14px] font-bold text-white">AI와 함께 시작하기</p>
                  <p className="text-[11px] text-slate-500 font-medium">프로젝트 생성 후 AI가 자동으로 본문을 분석합니다</p>
                </div>
              </div>
              <button
                onClick={() => setAiEnabled(!aiEnabled)}
                className={`relative w-12 h-6 rounded-full transition-all duration-300 shrink-0 ${
                  aiEnabled ? 'bg-indigo-600' : 'bg-white/10'
                }`}
              >
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 ${
                  aiEnabled ? 'left-[26px]' : 'left-0.5'
                }`} />
              </button>
            </div>

            {aiEnabled && (
              <div className="animate-fade-in grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/5">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                  <BookOpen className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[11px] font-bold text-slate-200">본문 분석</p>
                    <p className="text-[10px] text-slate-500 leading-relaxed">원어 분석, 배경 설명, 구조 개요 자동 생성</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
                  <Layers className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[11px] font-bold text-slate-200">대지 초안</p>
                    <p className="text-[10px] text-slate-500 leading-relaxed">본문 기반 3-4개 대지와 소제목 제안</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                  <Sparkles className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[11px] font-bold text-slate-200">제목 추천</p>
                    <p className="text-[10px] text-slate-500 leading-relaxed">설교 제목 5개 후보 자동 생성</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Summary & Create */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-[12px] font-medium">
              <span className="text-slate-500">요약:</span>
              {selectedPassages.length > 0 ? (
                <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-slate-300 font-bold">본문 {selectedPassages.length}개</span>
              ) : (
                <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-slate-300 font-bold">{passageDisplay || '본문 미선택'}</span>
              )}
              {title && (
                <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-slate-300 font-bold max-w-[200px] truncate">{title}</span>
              )}
              {sermonDate && <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-slate-400 font-bold">{sermonDate}</span>}
              <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-slate-400 font-bold">{sermonType}</span>
            </div>

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
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl border backdrop-blur-md text-[13px] font-bold shadow-2xl transition-all ${
          toast.kind === 'success'
            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
            : 'bg-red-500/15 border-red-500/40 text-red-200'
        }`}>
          {toast.text}
        </div>
      )}
    </div>
  )
}

function StepIndicator({ step, current, label }: { step: number; current: number; label: string }) {
  const isComplete = step < current
  const isActive = step === current
  return (
    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300 ${
        isActive
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
          : isComplete
          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
          : 'bg-white/5 text-slate-600 border border-white/5'
      }`}>
        {isComplete ? <Check className="w-4 h-4" /> : step}
      </div>
      <span className={`text-[12px] sm:text-sm font-bold transition-colors ${
        isActive ? 'text-white' : isComplete ? 'text-emerald-300' : 'text-slate-500'
      }`}>
        {label}
      </span>
    </div>
  )
}
