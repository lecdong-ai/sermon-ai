'use client'

import { useState, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useProjects } from '@/lib/advanced/useProjects'
import { useAuth } from '@/components/AuthProvider'
import { PROJECT_STATUS_LABELS } from '@/lib/advanced/types'
import type { ProjectStatus, AdvancedProject } from '@/lib/advanced/types'
import {
  Plus, Search, Flame, CheckCircle, BookOpen, FileText,
  Clock, Pen, Eye, Archive, ChevronRight, Sparkles, Zap,
  BarChart2, Calendar, AlignLeft, ArrowRight, Trash2,
  Loader2, RefreshCw, AlertTriangle, ChevronDown, X,
} from 'lucide-react'
import { getStorageItem, setStorageItem } from '@/lib/storage'
import type { JohnManuscriptData } from '@/lib/advanced/johnManuscriptData'
import { BIBLE_BOOKS } from '@/lib/advanced/bibleBooks'
import type { BibleBook } from '@/lib/advanced/bibleBooks'

/* ── 상태별 색상 매핑 ── */
const STATUS_COLORS: Record<ProjectStatus, { bg: string; text: string; border: string; dot: string }> = {
  research:  { bg: 'bg-sky-500/10',     text: 'text-sky-300',     border: 'border-sky-500/30',     dot: 'bg-sky-400' },
  prepare:   { bg: 'bg-amber-500/10',   text: 'text-amber-300',   border: 'border-amber-500/30',   dot: 'bg-amber-400' },
  writing:   { bg: 'bg-indigo-500/10',  text: 'text-indigo-300',  border: 'border-indigo-500/30',  dot: 'bg-indigo-400 animate-pulse' },
  review:    { bg: 'bg-purple-500/10',  text: 'text-purple-300',  border: 'border-purple-500/30',  dot: 'bg-purple-400' },
  completed: { bg: 'bg-emerald-500/10', text: 'text-emerald-300', border: 'border-emerald-500/30', dot: 'bg-emerald-400' },
  archived:  { bg: 'bg-slate-500/10',   text: 'text-slate-400',   border: 'border-slate-500/30',   dot: 'bg-slate-500' },
}

const STATUS_FILTERS: { key: 'all' | ProjectStatus; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'research', label: '연구 중' },
  { key: 'prepare', label: '준비 중' },
  { key: 'writing', label: '작성 중' },
  { key: 'review', label: '검토 중' },
  { key: 'completed', label: '완료' },
]

const STATUS_ICONS: Record<ProjectStatus, any> = {
  research: BookOpen,
  prepare: AlignLeft,
  writing: Pen,
  review: Eye,
  completed: CheckCircle,
  archived: Archive,
}

/* ── 진행률 계산 ── */
function getProgress(project: AdvancedProject): number {
  // 1. localStorage에서 실제 manuscript 데이터 확인
  try {
    const ms = getStorageItem<JohnManuscriptData | null>(`manuscript_${project.id}`, null)
    if (ms?.sections && ms.sections.length > 0) {
      const total = ms.sections.length
      const filled = ms.sections.filter(s => s.content?.trim().length > 0).length
      if (total > 0) return Math.round((filled / total) * 100)
    }
  } catch { /* ignore */ }

  // 2. fallback: 상태 기반 추정
  const map: Record<ProjectStatus, number> = {
    research: 10, prepare: 35, writing: 65, review: 85, completed: 100, archived: 100,
  }
  return map[project.status]
}

/* ── 상태 뱃지 ── */
function DarkStatusBadge({ status }: { status: ProjectStatus }) {
  const c = STATUS_COLORS[status]
  const Icon = STATUS_ICONS[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${c.bg} ${c.text} ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {PROJECT_STATUS_LABELS[status]}
    </span>
  )
}

/* ── 프로젝트 카드 ── */
function ProjectCard({ project, onClick, onDelete }: { project: AdvancedProject; onClick: () => void; onDelete?: () => void }) {
  const progress = getProgress(project)
  const c = STATUS_COLORS[project.status]
  
  // 예배일 D-Day 계산
  const daysLeft = Math.ceil((new Date(project.sermonDate).getTime() - new Date().setHours(0,0,0,0)) / 86400000)

  return (
    <div
      className="group relative rounded-2xl border border-white/5 bg-[#050816]/75 hover:border-indigo-500/35 hover:shadow-[0_0_30px_rgba(99,102,241,0.08)] hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col"
      style={{ boxShadow: '0 20px 40px -15px rgba(0,0,0,0.6)' }}
    >
      {/* 상단 색상 스트립 (상태별 그라데이션) */}
      <div className={`h-[3px] w-full ${c.dot.replace('animate-pulse','').trim()}`} style={{
        background: project.status === 'writing'
          ? 'linear-gradient(90deg, #6366f1, #a855f7)'
          : project.status === 'completed'
          ? 'linear-gradient(90deg, #10b981, #34d399)'
          : project.status === 'prepare'
          ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
          : project.status === 'research'
          ? 'linear-gradient(90deg, #0ea5e9, #38bdf8)'
          : undefined
      }} />

      <div className="p-5 flex flex-col gap-4 flex-1">
        {/* 헤더 */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0" onClick={onClick}>
            <h3 className="text-[15px] font-black text-white group-hover:text-indigo-300 transition-colors leading-snug line-clamp-2">
              {project.title}
            </h3>
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              {project.passages && project.passages.length > 0 ? (
                project.passages.map((p, i) => (
                  <span key={i} className="text-[10px] font-extrabold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md">
                    {p.passage}
                  </span>
                ))
              ) : (
                <span className="text-[10px] font-extrabold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md">
                  {project.passage}
                </span>
              )}
              {project.sermonType && (
                <span className="text-[9px] text-slate-400 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                  {project.sermonType}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <div className="flex items-center gap-1">
              {onDelete && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete() }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-all duration-200"
                  title="프로젝트 삭제"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <DarkStatusBadge status={project.status} />
            </div>
            
            {/* D-Day 특화 배지 */}
            {daysLeft > 0 ? (
              <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                daysLeft <= 3 
                  ? 'bg-rose-500/15 text-rose-400 border-rose-500/30 animate-pulse' 
                  : daysLeft <= 7 
                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' 
                  : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
              }`}>
                <Flame className="w-3 h-3" />
                D-{daysLeft}
              </span>
            ) : daysLeft === 0 ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <Flame className="w-3 h-3 animate-bounce" />
                오늘 설교
              </span>
            ) : null}
          </div>
        </div>

        {/* 핵심 메시지 */}
        {project.coreMessage ? (
          <p className="text-[12px] text-slate-400 line-clamp-2 leading-relaxed font-medium" onClick={onClick}>
            {project.coreMessage}
          </p>
        ) : (
          <p className="text-[11px] text-slate-500 italic font-medium">작성된 핵심 메시지가 없습니다.</p>
        )}

        {/* 테마 태그 */}
        {project.themeNames.length > 0 && (
          <div className="flex flex-wrap gap-1" onClick={onClick}>
            {project.themeNames.map(t => (
              <span key={t} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                #{t}
              </span>
            ))}
            {project.tagNames.slice(0, 2).map(t => (
              <span key={t} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/5 text-slate-400 border border-white/[0.05]">
                {t}
              </span>
            ))}
          </div>
        )}

        {/* 진행률 바 */}
        <div className="space-y-1.5 mt-auto pt-1" onClick={onClick}>
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">진행율</span>
            <span className={`text-[10px] font-black ${c.text}`}>{progress}%</span>
          </div>
          <div className="h-[3px] rounded-full bg-white/5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                project.status === 'completed' ? 'bg-gradient-to-r from-emerald-500 to-green-400' :
                project.status === 'writing'   ? 'bg-gradient-to-r from-indigo-500 to-purple-500' :
                project.status === 'prepare'   ? 'bg-gradient-to-r from-amber-500 to-yellow-400' :
                'bg-gradient-to-r from-slate-500 to-slate-400'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 메타 정보 */}
        <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 pt-2.5 border-t border-white/5" onClick={onClick}>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3 h-3 text-slate-500" />
            <span>{project.sermonDate}</span>
          </div>
          <div className="flex items-center gap-3">
            {project.wordCount > 0 && (
              <span className="flex items-center gap-1">
                <FileText className="w-3 h-3 text-slate-500" />
                {project.wordCount.toLocaleString()}자
              </span>
            )}
            <span className="bg-white/5 px-1 py-0.2 rounded text-[9px] border border-white/10">v{project.version}</span>
          </div>
        </div>
      </div>

      {/* 열기 버튼 (hover 시) */}
      <div className="px-5 pb-4 opacity-0 group-hover:opacity-100 transition-all duration-200">
        <div
          onClick={onClick}
          className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 text-[11px] font-bold cursor-pointer hover:bg-indigo-600 hover:text-white transition-all duration-200"
        >
          <span>원고 집필실 입장</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  )
}

function ArchivedProjectCard({ project, onOpen, onUnarchive, onDelete }: {
  project: AdvancedProject; onOpen: () => void; onUnarchive: () => void; onDelete?: () => void
}) {
  return (
    <div
      className="group relative rounded-2xl border border-white/5 bg-[#050816]/40 hover:border-slate-500/35 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col opacity-75 hover:opacity-100"
      style={{ boxShadow: '0 20px 40px -15px rgba(0,0,0,0.5)' }}
    >
      <div className="h-[3px] w-full bg-gradient-to-r from-slate-600 to-slate-500" />
      <div className="p-5 flex flex-col gap-4 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0" onClick={onOpen}>
            <h3 className="text-[15px] font-black text-slate-400 group-hover:text-white transition-colors leading-snug line-clamp-2">
              {project.title}
            </h3>
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              {project.passages && project.passages.length > 0 ? (
                project.passages.map((p, i) => (
                  <span key={i} className="text-[10px] font-extrabold text-slate-500 bg-slate-500/10 border border-slate-500/20 px-2 py-0.5 rounded-md">
                    {p.passage}
                  </span>
                ))
              ) : (
                <span className="text-[10px] font-extrabold text-slate-500 bg-slate-500/10 border border-slate-500/20 px-2 py-0.5 rounded-md">
                  {project.passage}
                </span>
              )}
              {project.sermonType && (
                <span className="text-[9px] text-slate-500 bg-white/5 border border-white/5 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                  {project.sermonType}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1 shrink-0">
            {onDelete && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete() }}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/20 text-slate-600 hover:text-red-400 transition-all duration-200"
                title="프로젝트 삭제"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20">
              보관됨
            </span>
          </div>
        </div>
        
        <p className="text-[11px] text-slate-500 italic font-medium">이 프로젝트는 아카이브 보관실로 이동되었습니다.</p>
        
        <div className="flex gap-2 mt-auto pt-2">
          <button
            onClick={(e) => { e.stopPropagation(); onUnarchive() }}
            className="flex-1 text-[11px] font-bold bg-indigo-600/10 hover:bg-indigo-600/30 text-indigo-300 hover:text-indigo-200 py-2 rounded-xl transition-all duration-200 border border-indigo-500/20"
          >
            보관 해제
          </button>
          <button
            onClick={onOpen}
            className="flex-1 text-[11px] font-bold bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white py-2 rounded-xl transition-all duration-200 border border-white/5"
          >
            열기
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── 상단 통계 카드 ── */
function StatCard({ label, value, sub, color, icon: Icon, bgGradient }: { 
  label: string; 
  value: string | number; 
  sub?: string; 
  color: string;
  icon?: any;
  bgGradient?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#060a17]/60 backdrop-blur-md p-5 flex flex-col justify-between min-h-[110px] group transition-all duration-300 hover:border-white/10 hover:-translate-y-0.5"
         style={{ boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)' }}>
      {/* 마우스 호버 시 살아나는 미세 백라이트 광원 */}
      <div className={`absolute -right-6 -bottom-6 w-20 h-20 rounded-full blur-2xl opacity-10 transition-opacity duration-500 group-hover:opacity-25 ${bgGradient || 'bg-indigo-500'}`} />
      
      <div className="flex justify-between items-start z-10">
        <span className={`text-[10px] font-extrabold uppercase tracking-widest ${color}`}>{label}</span>
        {Icon && <Icon className={`w-4 h-4 ${color} opacity-60 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110`} />}
      </div>
      <div className="mt-4 z-10">
        <span className="text-2xl font-black text-white tracking-tight">{value}</span>
        {sub && <span className="text-[11px] text-slate-400 ml-1 font-bold">{sub}</span>}
      </div>
    </div>
  )
}

/* ── 다음 주일 날짜 헬퍼 ── */
function getNextSunday(): string {
  const d = new Date()
  const daysUntilSunday = (7 - d.getDay() + 0) % 7 || 7
  d.setDate(d.getDate() + daysUntilSunday)
  return d.toISOString().slice(0, 10)
}

/* ── 메인 컨텐츠 ── */
function ProjectsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get('search') || ''
  const { user } = useAuth()
  const preacherName = user?.user_metadata?.name || user?.email?.split('@')[0] || ''

  // ⚡ 1초 설교 퀵 빌더 상태값
  const [quickBookId, setQuickBookId] = useState<string>('')
  const [quickChapter, setQuickChapter] = useState<string>('')
  const [quickVerseStart, setQuickVerseStart] = useState<string>('')
  const [quickVerseEnd, setQuickVerseEnd] = useState<string>('')
  const [quickTitle, setQuickTitle] = useState<string>('')
  const [quickSermonType, setQuickSermonType] = useState<string>('주일예배')
  const [quickDate, setQuickDate] = useState<string>(getNextSunday())
  const [creatingQuick, setCreatingQuick] = useState<boolean>(false)
  const [showQuickBuilder, setShowQuickBuilder] = useState<boolean>(true)
  const [quickError, setQuickError] = useState<string | null>(null)
  const [quickSuggesting, setQuickSuggesting] = useState(false)
  const [quickSuggestions, setQuickSuggestions] = useState<Array<{title:string; reason:string}>>([])
  const [showQuickSuggestions, setShowQuickSuggestions] = useState(false)

  const handleQuickSuggest = async () => {
    const book = BIBLE_BOOKS.find(b => b.id === quickBookId)
    if (!book || !quickChapter) return
    setQuickSuggesting(true)
    setShowQuickSuggestions(true)
    try {
      const abbr = book.abbr
      const vs = quickVerseStart || '1'
      const ve = quickVerseEnd || null
      const passageText = ve ? `${abbr} ${quickChapter}:${vs}-${ve}` : `${abbr} ${quickChapter}:${vs}`
      const res = await fetch('/api/advanced/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'suggest-titles',
          data: { passages: [{ book: book.name, chapter: quickChapter, verseStart: vs, verseEnd: ve, text: passageText }], book: book.name, passage: passageText, chapter: quickChapter, verseStart: vs, verseEnd: ve },
        }),
      })
      const json = await res.json()
      if (json.success) {
        let output = (json.data?.output || '').trim()
        if (output.startsWith('```')) output = output.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '')
        const si = output.indexOf('['), ei = output.lastIndexOf(']')
        if (si !== -1 && ei > si) {
          const parsed = JSON.parse(output.slice(si, ei + 1))
          setQuickSuggestions((Array.isArray(parsed) ? parsed : []).map((s: any) => ({ title: s.title || '', reason: s.reason || '' })))
        } else { setQuickSuggestions([]) }
      } else { setQuickSuggestions([]) }
    } catch { setQuickSuggestions([]) }
    setQuickSuggesting(false)
  }

  const handleQuickCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setQuickError(null)
    const selectedBook = BIBLE_BOOKS.find(b => b.id === quickBookId)
    if (!selectedBook) {
      setQuickError('성경 권을 선택해주세요.')
      return
    }
    if (!quickChapter.trim() || !quickVerseStart.trim()) {
      setQuickError('장과 시작 절을 입력해주세요.')
      return
    }
    if (!quickTitle.trim()) {
      setQuickError('설교 제목을 입력해주세요.')
      return
    }

    setCreatingQuick(true)
    const newId = `proj-${Date.now().toString(36)}`
    const now = new Date().toISOString()

    const ch = quickChapter.trim()
    const vs = quickVerseStart.trim()
    const ve = quickVerseEnd.trim() || null
    const abbr = selectedBook.abbr
    const passageStr = ve ? `${abbr} ${ch}:${vs}-${ve}` : `${abbr} ${ch}:${vs}`

    const newProject: AdvancedProject = {
      id: newId,
      title: quickTitle.trim(),
      passage: passageStr,
      book: selectedBook.name,
      chapter: parseInt(ch),
      verseStart: parseInt(vs),
      verseEnd: ve ? parseInt(ve) : null,
      status: 'research',
      sermonDate: quickDate,
      preacher: preacherName,
      sermonType: quickSermonType,
      audience: ['장년'],
      season: '일반주일',
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

    // localStorage 저장
    const existing = getStorageItem<AdvancedProject[]>('custom_projects', [])
    existing.push(newProject)
    setStorageItem('custom_projects', existing)

    try {
      const res = await fetch('/api/sermons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newProject.title,
          normalizedPassage: newProject.passage,
          bibleBook: selectedBook.name,
          chapterStart: parseInt(ch),
          chapterEnd: null,
          verseStart: parseInt(vs),
          verseEnd: ve ? parseInt(ve) : null,
          date: quickDate,
          preacher: preacherName,
          sermonType: quickSermonType,
          audience: '장년',
          season: '일반주일',
          status: 'draft',
          passages: [],
        }),
      })

      if (res.ok) {
        const json = await res.json()
        const apiId = json?.data?.id
        if (apiId && apiId !== newId) {
          const refreshed = getStorageItem<AdvancedProject[]>('custom_projects', [])
          const idx = refreshed.findIndex(p => p.id === newId)
          if (idx !== -1) {
            refreshed[idx] = { ...refreshed[idx], id: apiId }
            setStorageItem('custom_projects', refreshed)
          }
          router.push(`/advanced/projects/${apiId}?tab=overview&new=true`)
          return
        }
      }
    } catch (err) {
      console.error('Quick DB save error:', err)
    }

    router.push(`/advanced/projects/${newId}?tab=overview&new=true`)
  }
  const [statusFilter, setStatusFilter] = useState<'all' | ProjectStatus>('all')
  const [sortBy, setSortBy] = useState<'updatedAt' | 'sermonDate' | 'title'>('updatedAt')
  const { projects, stats, loading, error, deleteProject, refetch } = useProjects()
  const visibleProjects = projects

  const handleDelete = async (id: string) => {
    if (!confirm('정말 이 프로젝트를 삭제하시겠습니까?')) return
    await deleteProject(id)
  }

  const filtered = useMemo(() => {
    let list = visibleProjects
    if (statusFilter !== 'all') {
      list = list.filter(p => p.status === statusFilter)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.passage.toLowerCase().includes(q) ||
        p.passages?.some(pg => pg.passage.toLowerCase().includes(q)) ||
        p.coreMessage.toLowerCase().includes(q) ||
        p.sermonType.toLowerCase().includes(q)
      )
    }
    return list
  }, [visibleProjects, searchQuery, statusFilter])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortBy === 'updatedAt') {
        const tA = new Date(a.updatedAt || a.createdAt).getTime()
        const tB = new Date(b.updatedAt || b.createdAt).getTime()
        return tB - tA // 최신 수정순
      } else if (sortBy === 'sermonDate') {
        const tA = new Date(a.sermonDate).getTime()
        const tB = new Date(b.sermonDate).getTime()
        return tA - tB // 예배일이 빠른 순 (D-day 순)
      } else {
        return a.title.localeCompare(b.title, 'ko') // 제목 가나다순
      }
    })
  }, [filtered, sortBy])

  const inProgress = sorted.filter(p => !['completed','archived'].includes(p.status))
  const done = sorted.filter(p => p.status === 'completed')
  const archived = sorted.filter(p => p.status === 'archived')

  const handleUnarchive = async (id: string) => {
    try {
      // localStorage 업데이트
      const custom = getStorageItem<AdvancedProject[]>('custom_projects', [])
      const idx = custom.findIndex(p => p.id === id)
      if (idx !== -1) {
        custom[idx] = { ...custom[idx], status: 'research', updatedAt: new Date().toISOString() }
        setStorageItem('custom_projects', custom)
      }
      // API도 업데이트 (영구 보관 해제)
      try {
        const res = await fetch(`/api/sermons/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'research' }),
        })
        if (!res.ok) {
          console.warn('API 보관 해제 실패:', res.status)
        }
      } catch (e) {
        console.warn('API 보관 해제 네트워크 오류:', e)
      }
      refetch()
    } catch (e) {
      console.error('보관 해제 실패:', e)
    }
  }

  if (loading) {
    return (
      <div className="min-h-full pb-16 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          <p className="text-[12px] text-slate-500 font-bold">프로젝트 로딩 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-full pb-16 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 max-w-sm text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-red-400" />
          </div>
          <p className="text-sm font-bold text-white">프로젝트를 불러오지 못했습니다</p>
          <p className="text-[12px] text-slate-500 font-medium">{error}</p>
          <button
            onClick={refetch}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-bold transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full pb-16">
      <div className="max-w-[1200px] mx-auto px-6 py-8 space-y-10">

        {/* ── 페이지 헤더 ── */}
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">설교 프로젝트</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              {searchQuery ? `"${searchQuery}" 검색 결과` : '설교 프로젝트'}
            </h1>
            <p className="text-[13px] text-slate-500 font-medium">
              {searchQuery
                ? `${filtered.length}개의 프로젝트가 검색되었습니다`
                : '진행 중인 설교 원고와 완료된 사역 자료를 관리합니다'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* 정렬 드롭다운 */}
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/5 text-[11px] font-bold text-slate-400 transition-all hover:bg-white/10">
              <span className="opacity-80">정렬</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-white font-extrabold outline-none cursor-pointer pr-1"
              >
                <option value="updatedAt" className="bg-[#0b0f19] text-slate-300">최근 수정일순</option>
                <option value="sermonDate" className="bg-[#0b0f19] text-slate-300">예배일순 (D-day)</option>
                <option value="title" className="bg-[#0b0f19] text-slate-300">제목 가나다순</option>
              </select>
            </div>

            <button
              onClick={refetch}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-400 hover:text-white transition-all"
              title="새로고침"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            {/* ⚡ 퀵 빌더 토글 */}
            <button
              onClick={() => setShowQuickBuilder(!showQuickBuilder)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[12px] font-bold transition-all border ${
                showQuickBuilder
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-300 shadow-lg shadow-amber-500/10'
                  : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              퀵 생성
            </button>
            <button
              onClick={() => router.push('/advanced/projects/new')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-bold transition-all shadow-lg shadow-indigo-600/20 hover:-translate-y-0.5 hover:shadow-indigo-600/30"
            >
              <Plus className="w-4 h-4" />
              새 프로젝트
            </button>
          </div>
        </div>

        {/* ── 통계 카드 ── */}
        {!searchQuery && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatCard label="전체 프로젝트" value={stats.totalProjects} sub="편" color="text-indigo-400" icon={BookOpen} bgGradient="bg-indigo-500" />
            <StatCard label="진행 중" value={stats.inProgress} sub="활성" color="text-amber-400" icon={Zap} bgGradient="bg-amber-500" />
            <StatCard label="완료 설교" value={stats.completed} sub="편" color="text-emerald-400" icon={CheckCircle} bgGradient="bg-emerald-500" />
            <StatCard label="보관됨" value={stats.archived} sub="편" color="text-slate-400" icon={Archive} bgGradient="bg-slate-500" />
            <StatCard label="누적 원고량" value={(stats.totalWords / 10000).toFixed(1)} sub="만 자" color="text-purple-400" icon={FileText} bgGradient="bg-purple-500" />
          </div>
        )}

        {/* ── ⚡ AI 설교 퀵 빌더 ── */}
        {!searchQuery && showQuickBuilder && (
          <form onSubmit={handleQuickCreate} className="relative rounded-2xl border border-amber-500/15 bg-[#060a17]/80 backdrop-blur-md p-6 overflow-hidden">
            {/* 배경 광원 */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-5">
              {/* 헤더 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-black text-white">AI 설교 퀵 빌더</h3>
                    <p className="text-[10px] text-slate-500 font-medium">본문과 제목만 입력하면 즉시 집필실로 입장합니다</p>
                  </div>
                </div>
                <button type="button" onClick={() => setShowQuickBuilder(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 폼 그리드 */}
              <div className="grid grid-cols-12 gap-3">
                {/* 성경 권 */}
                <div className="col-span-3 space-y-1">
                  <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500">성경 권</label>
                  <select
                    value={quickBookId}
                    onChange={e => setQuickBookId(e.target.value)}
                    className="w-full text-[12px] bg-[#0c1020] border border-white/10 rounded-xl px-3 py-2.5 text-slate-200 outline-none focus:border-indigo-500/50 transition-all font-bold appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-[#0c1020]">선택</option>
                    <optgroup label="── 신약 ──" className="bg-[#0c1020]">
                      {BIBLE_BOOKS.filter(b => b.testament === 'NT').map(b => (
                        <option key={b.id} value={b.id} className="bg-[#0c1020]">{b.abbr} ({b.name})</option>
                      ))}
                    </optgroup>
                    <optgroup label="── 구약 ──" className="bg-[#0c1020]">
                      {BIBLE_BOOKS.filter(b => b.testament === 'OT').map(b => (
                        <option key={b.id} value={b.id} className="bg-[#0c1020]">{b.abbr} ({b.name})</option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {/* 장 */}
                <div className="col-span-1 space-y-1">
                  <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500">장</label>
                  <input type="number" min={1} value={quickChapter} onChange={e => setQuickChapter(e.target.value.replace(/\D/g,'').slice(0,3))}
                    placeholder="1" className="w-full text-[12px] bg-[#0c1020] border border-white/10 rounded-xl px-3 py-2.5 text-slate-200 placeholder:text-slate-600 outline-none focus:border-indigo-500/50 transition-all font-bold" />
                </div>

                {/* 시작 절 */}
                <div className="col-span-1 space-y-1">
                  <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500">시작절</label>
                  <input type="number" min={1} value={quickVerseStart} onChange={e => setQuickVerseStart(e.target.value.replace(/\D/g,'').slice(0,3))}
                    placeholder="1" className="w-full text-[12px] bg-[#0c1020] border border-white/10 rounded-xl px-3 py-2.5 text-slate-200 placeholder:text-slate-600 outline-none focus:border-indigo-500/50 transition-all font-bold" />
                </div>

                {/* 끝 절 */}
                <div className="col-span-1 space-y-1">
                  <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500">끝절</label>
                  <input type="number" min={1} value={quickVerseEnd} onChange={e => setQuickVerseEnd(e.target.value.replace(/\D/g,'').slice(0,3))}
                    placeholder="—" className="w-full text-[12px] bg-[#0c1020] border border-white/10 rounded-xl px-3 py-2.5 text-slate-200 placeholder:text-slate-600 outline-none focus:border-indigo-500/50 transition-all font-bold" />
                </div>

                {/* 설교 제목 + AI 추천 */}
                <div className="col-span-3 space-y-1">
                  <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500">설교 제목</label>
                  <div className="flex gap-1.5">
                    <input type="text" value={quickTitle} onChange={e => setQuickTitle(e.target.value)}
                      placeholder="예: 하나님의 사랑" className="flex-1 text-[12px] bg-[#0c1020] border border-white/10 rounded-xl px-3 py-2.5 text-slate-200 placeholder:text-slate-600 outline-none focus:border-indigo-500/50 transition-all font-bold" />
                    {quickBookId && quickChapter && (
                      <button type="button" onClick={handleQuickSuggest} disabled={quickSuggesting}
                        className="shrink-0 flex items-center gap-1 px-2.5 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold transition-all disabled:opacity-50">
                        {quickSuggesting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                        AI
                      </button>
                    )}
                  </div>
                </div>

                {/* 설교 분류 */}
                <div className="col-span-1 space-y-1">
                  <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500">분류</label>
                  <select value={quickSermonType} onChange={e => setQuickSermonType(e.target.value)}
                    className="w-full text-[12px] bg-[#0c1020] border border-white/10 rounded-xl px-2 py-2.5 text-slate-200 outline-none focus:border-indigo-500/50 transition-all font-bold appearance-none cursor-pointer">
                    {['주일예배','수요예배','금요기도회','새벽기도회','특별집회','부흥회','수련회'].map(t => (
                      <option key={t} value={t} className="bg-[#0c1020]">{t}</option>
                    ))}
                  </select>
                </div>

                {/* 예배일 */}
                <div className="space-y-1" style={{gridColumn: 'span 1'}}>
                  <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500">예배일</label>
                  <input type="date" value={quickDate} onChange={e => setQuickDate(e.target.value)}
                    className="w-full text-[12px] bg-[#0c1020] border border-white/10 rounded-xl px-2 py-2.5 text-slate-200 outline-none focus:border-indigo-500/50 transition-all font-bold [color-scheme:dark]" />
                </div>

                {/* 생성 버튼 */}
                <div className="col-span-1 flex items-end">
                  <button
                    type="submit"
                    disabled={creatingQuick}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-[11px] font-bold transition-all shadow-lg shadow-indigo-600/20 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creatingQuick ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <><Zap className="w-3.5 h-3.5" />시작</>
                    )}
                  </button>
                </div>
              </div>

              {/* AI 추천 결과 패널 */}
              {showQuickSuggestions && (
                <div className="rounded-xl bg-[#050a18] border border-indigo-500/20 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-slate-400 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-indigo-400" /> AI 제목 추천
                    </span>
                    <button type="button" onClick={() => setShowQuickSuggestions(false)} className="p-0.5 rounded hover:bg-white/10 text-slate-500 hover:text-white transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  {quickSuggesting ? (
                    <div className="flex items-center justify-center gap-2 py-4">
                      <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                      <span className="text-[11px] text-slate-500 font-medium">본문 분석 중...</span>
                    </div>
                  ) : quickSuggestions.length === 0 ? (
                    <p className="text-[11px] text-slate-500 py-3 text-center">추천 결과가 없습니다. 다시 시도해주세요.</p>
                  ) : (
                    <div className="space-y-1">
                      {quickSuggestions.map((s, i) => (
                        <button key={i} type="button"
                          onClick={() => { setQuickTitle(s.title); setShowQuickSuggestions(false) }}
                          className="w-full text-left px-3 py-2 rounded-lg bg-white/5 hover:bg-indigo-500/10 border border-transparent hover:border-indigo-500/30 transition-all group">
                          <span className="text-[12px] font-bold text-slate-200 group-hover:text-indigo-300">{s.title}</span>
                          <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{s.reason}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 에러 메시지 */}
              {quickError && (
                <p className="text-[11px] text-rose-400 font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {quickError}
                </p>
              )}
            </div>
          </form>
        )}

        {/* ── 상태 필터 탭 ── */}
        {!searchQuery && (
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/5 border border-white/5 w-fit">
            {STATUS_FILTERS.map(f => {
              const isActive = statusFilter === f.key
              const count = f.key === 'all'
                ? visibleProjects.length
                : visibleProjects.filter(p => p.status === f.key).length
              return (
                <button
                  key={f.key}
                  onClick={() => setStatusFilter(f.key)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200
                    ${isActive
                      ? f.key === 'all'
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                        : `${STATUS_COLORS[f.key].bg} ${STATUS_COLORS[f.key].text} border ${STATUS_COLORS[f.key].border}`
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }
                  `}
                >
                  {f.label}
                  <span className={`text-[10px] font-bold ${isActive ? 'opacity-70' : 'text-slate-600'}`}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {/* ── 프로젝트 목록 ── */}
        {filtered.length === 0 ? (
          <div className="glass-dark rounded-3xl p-16 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center mx-auto">
              <FileText className="w-7 h-7 text-slate-500" />
            </div>
            <p className="text-sm font-bold text-white">
              {searchQuery
                ? `"${searchQuery}"에 대한 결과가 없습니다`
                : statusFilter !== 'all'
                ? `'${STATUS_FILTERS.find(f => f.key === statusFilter)?.label}' 상태의 프로젝트가 없습니다`
                : '아직 설교 프로젝트가 없습니다'}
            </p>
            <p className="text-xs text-slate-500 font-medium">새 프로젝트를 시작하여 AI와 함께 설교를 준비해 보세요.</p>
            <button
              onClick={() => router.push('/advanced/projects/new')}
              className="inline-flex items-center gap-2 mt-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-bold transition-all"
            >
              <Plus className="w-4 h-4" />
              첫 프로젝트 시작하기
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {inProgress.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <h2 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
                    진행 중인 프로젝트 ({inProgress.length})
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {inProgress.map(p => (
                    <ProjectCard
                      key={p.id}
                      project={p}
                      onClick={() => router.push(`/advanced/projects/${p.id}`)}
                      onDelete={() => handleDelete(p.id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {done.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <h2 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
                    완료된 프로젝트 ({done.length})
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {done.map(p => (
                    <ProjectCard
                      key={p.id}
                      project={p}
                      onClick={() => router.push(`/advanced/projects/${p.id}`)}
                      onDelete={() => handleDelete(p.id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {archived.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <Archive className="w-4 h-4 text-slate-400" />
                  <h2 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
                    보관된 프로젝트 ({archived.length})
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {archived.map(p => (
                    <ArchivedProjectCard
                      key={p.id}
                      project={p}
                      onOpen={() => router.push(`/advanced/projects/${p.id}`)}
                      onUnarchive={() => handleUnarchive(p.id)}
                      onDelete={() => handleDelete(p.id)}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* ── 빠른 액션 배너 ── */}
        {!searchQuery && (
          <div className="relative glass-dark rounded-3xl p-7 overflow-hidden border border-indigo-500/10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center justify-between relative z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-400">AI 사역 어시스턴트</span>
                </div>
                <h3 className="text-[16px] font-extrabold text-white">다음 주일 설교, AI와 함께 시작하세요</h3>
                <p className="text-[12px] text-slate-500 font-medium">본문을 입력하면 AI가 연구, 대지 초안, 원고까지 함께 준비합니다.</p>
              </div>
              <button
                onClick={() => router.push('/advanced/projects/new')}
                className="shrink-0 flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-bold transition-all shadow-lg shadow-indigo-600/20 hover:-translate-y-0.5"
              >
                <Plus className="w-4 h-4" />
                AI 설교 시작
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-[12px] text-slate-500 font-bold">프로젝트 로딩 중...</p>
        </div>
      </div>
    }>
      <ProjectsContent />
    </Suspense>
  )
}
