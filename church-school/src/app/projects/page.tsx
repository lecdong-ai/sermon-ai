'use client'

import { useState, useMemo, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useProjects } from '@/lib/project/useProjects'
import { PROJECT_STATUS_LABELS } from '@/lib/project/types'
import type { ProjectStatus, AdvancedProject } from '@/lib/project/types'
import {
  Plus, Search, Flame, CheckCircle, BookOpen, FileText,
  Clock, Pen, Eye, Archive, ChevronRight, Sparkles, Zap,
  BarChart2, Calendar, AlignLeft, ArrowRight, Trash2,
  Loader2, RefreshCw, AlertTriangle, Lock, Filter,
} from 'lucide-react'
import { getStorageItem, setStorageItem } from '@/lib/storage'
import type { JohnManuscriptData } from '@/lib/project/johnManuscriptData'
import { useAuth } from '@/components/AuthProvider'
import LoginModal from '@/components/LoginModal'

/* ── 상태별 색상 매핑 (다크 테마) ── */
const STATUS_COLORS: Record<ProjectStatus, { bg: string; text: string; border: string; dot: string }> = {
  research:  { bg: 'bg-sky-500/10',     text: 'text-sky-300',     border: 'border-sky-500/30',     dot: 'bg-sky-400' },
  prepare:   { bg: 'bg-amber-500/10',   text: 'text-amber-300',   border: 'border-amber-500/30',   dot: 'bg-amber-400' },
  writing:   { bg: 'bg-indigo-500/10',  text: 'text-indigo-300',  border: 'border-indigo-500/30',  dot: 'bg-indigo-400' },
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

/* ── 진행률 계산 (fallback) ── */
const STATUS_PROGRESS: Record<ProjectStatus, number> = {
  research: 10, prepare: 35, writing: 65, review: 85, completed: 100, archived: 100,
}

function getFallbackProgress(project: AdvancedProject): number {
  return STATUS_PROGRESS[project.status]
}

function getClientProgress(project: AdvancedProject): number {
  try {
    const ms = getStorageItem<JohnManuscriptData | null>(`manuscript_${project.id}`, null)
    if (ms?.sections && ms.sections.length > 0) {
      const total = ms.sections.length
      const filled = ms.sections.filter(s => s.content?.trim().length > 0).length
      if (total > 0) return Math.round((filled / total) * 100)
    }
  } catch { /* ignore */ }
  return STATUS_PROGRESS[project.status]
}

/* ── 상태 뱃지 (다크 테마) ── */
function StatusBadge({ status }: { status: ProjectStatus }) {
  const c = STATUS_COLORS[status]
  const Icon = STATUS_ICONS[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${c.bg} ${c.text} ${c.border}`}>
      <Icon className="w-3 h-3" strokeWidth={2.5} />
      {PROJECT_STATUS_LABELS[status]}
    </span>
  )
}

/* ── 프로젝트 카드 (다크 테마) ── */
function ProjectCard({ project, onClick, onDelete }: { project: AdvancedProject; onClick: () => void, onDelete?: () => void }) {
  // 초기값은 fallback (서버와 동일), 클라이언트 마운트 후 실제 progress 계산
  const [progress, setProgress] = useState(() => getFallbackProgress(project))
  const [daysLeft, setDaysLeft] = useState<number | null>(null)
  const c = STATUS_COLORS[project.status]

  useEffect(() => {
    setProgress(getClientProgress(project))
    setDaysLeft(Math.ceil((new Date(project.sermonDate).getTime() - Date.now()) / 86400000))
  }, [project])

  return (
    <div
      onClick={onClick}
      className="group relative rounded-2xl border border-white/5 bg-slate-950/60 hover:border-indigo-500/30 hover:bg-slate-900/70 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col"
      style={{ boxShadow: '0 8px 30px -8px rgba(0,0,0,0.5)' }}
    >
      {/* 상단 색상 스트립 */}
      <div className={`h-0.5 w-full ${c.dot}`} />

      <div className="p-5 flex flex-col gap-4 flex-1">
        {/* 헤더 */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-[15px] font-bold text-white group-hover:text-indigo-200 transition-colors leading-snug line-clamp-2">
              {project.title}
            </h3>
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              {project.passages && project.passages.length > 0 ? (
                project.passages.map((p, i) => (
                  <span key={i} className="text-[11px] font-extrabold text-indigo-200 bg-indigo-500/15 px-2 py-0.5 rounded border border-indigo-500/20">
                    {p.passage}
                  </span>
                ))
              ) : (
                <span className="text-[11px] font-extrabold text-indigo-200 bg-indigo-500/15 px-2 py-0.5 rounded border border-indigo-500/20">
                  {project.passage}
                </span>
              )}
              <span className="text-[10px] text-slate-500 font-bold">{project.sermonType}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {onDelete && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete() }}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/15 text-slate-500 hover:text-red-300 transition-all"
                title="프로젝트 삭제"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            <StatusBadge status={project.status} />
          </div>
        </div>

        {/* 핵심 메시지 */}
        {project.coreMessage ? (
          <p className="text-[12px] text-slate-400 line-clamp-2 leading-relaxed font-medium">
            {project.coreMessage}
          </p>
        ) : (
          <p className="text-[11px] text-slate-600 italic font-medium">핵심 메시지가 아직 없습니다.</p>
        )}

        {/* 테마 태그 */}
        {project.themeNames.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {project.themeNames.map(t => (
              <span key={t} className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20">
                #{t}
              </span>
            ))}
            {project.tagNames.slice(0,2).map(t => (
              <span key={t} className="text-[9px] font-bold px-2 py-0.5 rounded bg-white/5 text-slate-500 border border-white/[0.04]">
                {t}
              </span>
            ))}
          </div>
        )}

        {/* 진행률 바 */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest">작성 진행도</span>
            <span className={`text-[10px] font-extrabold ${c.text}`}>{progress}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                project.status === 'completed' ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' :
                project.status === 'writing'   ? 'bg-gradient-to-r from-indigo-500 to-purple-500' :
                'bg-gradient-to-r from-slate-500 to-slate-400'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 메타 정보 */}
        <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 pt-3 mt-auto border-t border-white/5">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {project.sermonDate}
            </span>
            {daysLeft !== null && daysLeft > 0 && daysLeft < 30 && (
              <span className={`flex items-center gap-1 ${daysLeft <= 7 ? 'text-rose-400' : 'text-amber-400'}`}>
                <Flame className="w-3 h-3" />
                D-{daysLeft}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {project.wordCount > 0 && (
              <span className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                {project.wordCount.toLocaleString()}자
              </span>
            )}
            <span className="px-1.5 py-0.5 bg-white/5 text-slate-500 rounded text-[9px] border border-white/[0.04]">v{project.version}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function ArchivedProjectCard({ project, onOpen, onUnarchive, onDelete }: {
  project: AdvancedProject; onOpen: () => void; onUnarchive: () => void; onDelete?: () => void
}) {
  return (
    <div className="group relative rounded-2xl border border-slate-700/40 bg-slate-900/40 hover:border-slate-600/60 hover:bg-slate-900/60 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col">
      <div className="h-0.5 w-full bg-gradient-to-r from-slate-600 to-slate-700" />
      <div className="p-5 flex flex-col gap-4 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0" onClick={onOpen}>
            <h3 className="text-[15px] font-bold text-slate-300 group-hover:text-white transition-colors leading-snug line-clamp-2">
              {project.title}
            </h3>
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[11px] font-extrabold text-slate-400 bg-slate-500/15 px-2 py-0.5 rounded border border-slate-500/20">
                {project.passage}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {onDelete && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete() }}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/15 text-slate-500 hover:text-red-300 transition-all"
                title="프로젝트 삭제"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border bg-slate-500/15 text-slate-400 border-slate-500/30">
              <Archive className="w-3 h-3" strokeWidth={2.5} />
              보관됨
            </span>
          </div>
        </div>
        <p className="text-[11px] text-slate-500 italic font-medium">이 프로젝트는 보관되었습니다.</p>
        <div className="flex gap-2 mt-auto pt-2">
          <button
            onClick={(e) => { e.stopPropagation(); onUnarchive() }}
            className="flex-1 text-[11px] font-bold bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-200 py-2 rounded-lg transition-colors border border-indigo-500/30"
          >
            보관 해제
          </button>
          <button
            onClick={onOpen}
            className="flex-1 text-[11px] font-bold bg-white/5 hover:bg-white/10 text-slate-300 py-2 rounded-lg transition-colors border border-white/10"
          >
            열기
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── 상단 통계 카드 (다크 테마) ── */
function StatCard({ label, value, sub, color, icon: Icon }: { label: string; value: string | number; sub?: string; color: string; icon: any }) {
  return (
    <div className="relative rounded-2xl border border-white/5 bg-slate-950/50 p-5 flex flex-col justify-between min-h-[110px] hover:border-indigo-500/30 transition-colors overflow-hidden group">
      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-500/10 transition-colors" />
      <div className="flex items-center justify-between relative z-10">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border border-white/5 ${color.replace('text-', 'bg-').replace('-700', '-500/10').replace('-600', '-500/10')}`}>
          <Icon className={`w-4 h-4 ${color}`} strokeWidth={2.5} />
        </div>
      </div>
      <div className="relative z-10">
        <span className="text-2xl font-extrabold text-white">{value}</span>
        {sub && <span className="text-[11px] text-slate-500 ml-1.5 font-bold">{sub}</span>}
      </div>
    </div>
  )
}

/* ── 메인 컨텐츠 ── */
function ProjectsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get('search') || ''
  const [statusFilter, setStatusFilter] = useState<'all' | ProjectStatus>('all')
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const { isLoggedIn, loading: authLoading } = useAuth()
  const { projects, stats, loading, error, deleteProject, refetch } = useProjects()
  const visibleProjects = projects

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      setLoginModalOpen(true)
    }
  }, [authLoading, isLoggedIn])

  useEffect(() => {
    if (error === '로그인이 필요합니다.' && !isLoggedIn) {
      setLoginModalOpen(true)
    }
  }, [error, isLoggedIn])

  const handleLoginSuccess = () => {
    setLoginModalOpen(false)
    refetch()
  }

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

  const inProgress = filtered.filter(p => !['completed','archived'].includes(p.status))
  const done = filtered.filter(p => p.status === 'completed')
  const archived = filtered.filter(p => p.status === 'archived')

  const handleUnarchive = async (id: string) => {
    try {
      const custom = getStorageItem<AdvancedProject[]>('custom_projects', [])
      const idx = custom.findIndex(p => p.id === id)
      if (idx !== -1) {
        custom[idx] = { ...custom[idx], status: 'research', updatedAt: new Date().toISOString() }
        setStorageItem('custom_projects', custom)
      }
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
      <div className="min-h-[calc(100vh-4rem)] pb-16 flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #050816 0%, #0a0e1a 50%, #0d1220 100%)' }}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          <p className="text-[12px] text-slate-500 font-bold">프로젝트 로딩 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    const isAuthError = error === '로그인이 필요합니다.'
    const detailStart = error.indexOf('(')
    const detailEnd = error.lastIndexOf(')')
    const hasDetail = !isAuthError && detailStart !== -1 && detailEnd > detailStart
    const detailMsg = hasDetail ? error.slice(detailStart + 1, detailEnd) : null
    return (
      <div className="min-h-[calc(100vh-4rem)] pb-16 flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #050816 0%, #0a0e1a 50%, #0d1220 100%)' }}>
        <div className="flex flex-col items-center gap-4 max-w-lg text-center">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border ${
            isAuthError
              ? 'bg-indigo-500/10 border-indigo-500/30'
              : 'bg-red-500/10 border-red-500/30'
          }`}>
            {isAuthError ? (
              <Lock className="w-8 h-8 text-indigo-300" strokeWidth={2} />
            ) : (
              <AlertTriangle className="w-8 h-8 text-red-300" strokeWidth={2} />
            )}
          </div>
          <p className="text-base font-bold text-white">
            {isAuthError
              ? '설교 프로젝트를 사용하려면 로그인이 필요합니다'
              : '프로젝트를 불러오지 못했습니다'}
          </p>
          <p className="text-[13px] text-slate-500 font-medium max-w-md">
            {isAuthError
              ? '로그인하시면 설교 프로젝트를 저장하고 관리할 수 있습니다.'
              : '잠시 후 다시 시도해주세요. 문제가 계속되면 아래 상세 메시지를 복사하여 문의해주세요.'}
          </p>
          {hasDetail && (
            <details className="w-full text-left mt-2">
              <summary className="text-[11px] text-slate-500 cursor-pointer hover:text-slate-300 transition-colors font-medium select-none">
                상세 에러 메시지
              </summary>
              <div className="mt-2 p-3 rounded-lg bg-slate-900/70 border border-slate-700/50 text-left">
                <code className="block text-[11px] text-rose-300 font-mono break-all leading-relaxed">
                  {detailMsg}
                </code>
                <button
                  onClick={() => navigator.clipboard?.writeText(detailMsg || '')}
                  className="mt-2 text-[10px] text-indigo-300 hover:text-indigo-200 font-bold"
                >
                  복사하기
                </button>
              </div>
            </details>
          )}
          {isAuthError ? (
            <button
              onClick={() => setLoginModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[13px] font-bold transition-all shadow-lg shadow-indigo-600/25 hover:shadow-indigo-500/30"
            >
              <Lock className="w-4 h-4" />
              로그인하기
            </button>
          ) : (
            <button
              onClick={refetch}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[13px] font-bold transition-all shadow-lg shadow-indigo-600/25 hover:shadow-indigo-500/30"
            >
              <RefreshCw className="w-4 h-4" />
              다시 시도
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] pb-16 relative" style={{ background: 'linear-gradient(180deg, #050816 0%, #0a0e1a 50%, #0d1220 100%)' }}>
      {/* 배경 글로우 효과 */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-[1200px] mx-auto px-6 py-8 space-y-8">
        {/* ── 페이지 헤더 ── */}
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
              <Sparkles className="w-3 h-3 text-indigo-300" strokeWidth={2.5} />
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-300">설교 프로젝트</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              {searchQuery ? `"${searchQuery}" 검색 결과` : '설교 프로젝트'}
            </h1>
            <p className="text-[13px] text-slate-500 font-medium">
              {searchQuery
                ? `${filtered.length}개의 프로젝트가 검색되었습니다`
                : '진행 중인 설교 원고와 완료된 사역 자료를 한 곳에서 관리하세요'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refetch}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-all"
              title="새로고침"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => router.push('/projects/new')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[13px] font-bold transition-all shadow-lg shadow-indigo-600/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              새 프로젝트
            </button>
          </div>
        </div>

        {/* ── 통계 카드 ── */}
        {!searchQuery && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <StatCard label="전체 프로젝트" value={stats.totalProjects} sub="편" color="text-indigo-300" icon={BarChart2} />
            <StatCard label="진행 중" value={stats.inProgress} sub="활성" color="text-amber-300" icon={Zap} />
            <StatCard label="완료 설교" value={stats.completed} sub="편" color="text-emerald-300" icon={CheckCircle} />
            <StatCard label="보관됨" value={stats.archived} sub="편" color="text-slate-400" icon={Archive} />
            <StatCard label="누적 원고량" value={(stats.totalWords / 10000).toFixed(1)} sub="만 자" color="text-purple-300" icon={FileText} />
          </div>
        )}

        {/* ── 상태 필터 탭 ── */}
        {!searchQuery && (
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/[0.03] border border-white/5 w-fit overflow-x-auto max-w-full">
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
                    flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold transition-all duration-200 whitespace-nowrap
                    ${isActive
                      ? f.key === 'all'
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                        : `${STATUS_COLORS[f.key].bg} ${STATUS_COLORS[f.key].text} border ${STATUS_COLORS[f.key].border}`
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }
                  `}
                >
                  {f.label}
                  <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                    isActive
                      ? 'bg-white/20 text-current'
                      : 'bg-white/5 text-slate-500'
                  }`}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {/* ── 프로젝트 목록 ── */}
        {filtered.length === 0 ? (
          <div className="relative rounded-3xl border border-white/5 bg-slate-950/40 p-16 text-center space-y-4 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto">
              <FileText className="w-8 h-8 text-indigo-300" strokeWidth={2} />
            </div>
            <p className="relative z-10 text-base font-bold text-white">
              {searchQuery
                ? `"${searchQuery}"에 대한 결과가 없습니다`
                : statusFilter !== 'all'
                ? `'${STATUS_FILTERS.find(f => f.key === statusFilter)?.label}' 상태의 프로젝트가 없습니다`
                : '아직 설교 프로젝트가 없습니다'}
            </p>
            <p className="relative z-10 text-[13px] text-slate-500 font-medium">새 프로젝트를 시작하여 AI와 함께 설교를 준비해 보세요.</p>
            <button
              onClick={() => router.push('/projects/new')}
              className="relative z-10 inline-flex items-center gap-2 mt-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[13px] font-bold transition-all shadow-lg shadow-indigo-600/25 hover:shadow-indigo-500/30 hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              첫 프로젝트 시작하기
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {inProgress.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center gap-3 px-1">
                  <div className="w-1 h-4 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                  <h2 className="text-[12px] font-extrabold uppercase tracking-widest text-slate-200">
                    진행 중인 프로젝트
                  </h2>
                  <span className="text-[11px] font-bold text-slate-500">({inProgress.length})</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {inProgress.map(p => (
                    <ProjectCard
                      key={p.id}
                      project={p}
                      onClick={() => router.push(`/projects/${p.id}`)}
                      onDelete={() => handleDelete(p.id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {done.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center gap-3 px-1">
                  <div className="w-1 h-4 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                  <h2 className="text-[12px] font-extrabold uppercase tracking-widest text-slate-200">
                    완료된 프로젝트
                  </h2>
                  <span className="text-[11px] font-bold text-slate-500">({done.length})</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {done.map(p => (
                    <ProjectCard
                      key={p.id}
                      project={p}
                      onClick={() => router.push(`/projects/${p.id}`)}
                      onDelete={() => handleDelete(p.id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {archived.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center gap-3 px-1">
                  <div className="w-1 h-4 rounded-full bg-slate-500" />
                  <h2 className="text-[12px] font-extrabold uppercase tracking-widest text-slate-200">
                    보관된 프로젝트
                  </h2>
                  <span className="text-[11px] font-bold text-slate-500">({archived.length})</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {archived.map(p => (
                    <ArchivedProjectCard
                      key={p.id}
                      project={p}
                      onOpen={() => router.push(`/projects/${p.id}`)}
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
          <div className="relative rounded-3xl border border-indigo-500/20 bg-slate-950/50 p-7 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center justify-between relative z-10 flex-wrap gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30">
                  <Sparkles className="w-3 h-3 text-indigo-300" strokeWidth={2.5} />
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-300">AI 사역 어시스턴트</span>
                </div>
                <h3 className="text-[18px] font-extrabold text-white">다음 주일 설교, AI와 함께 시작하세요</h3>
                <p className="text-[13px] text-slate-400 font-medium">본문을 입력하면 AI가 연구, 대지 초안, 원고까지 함께 준비합니다.</p>
              </div>
              <button
                onClick={() => router.push('/projects/new')}
                className="shrink-0 flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[13px] font-bold transition-all shadow-lg shadow-indigo-600/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5"
              >
                <Sparkles className="w-4 h-4" strokeWidth={2.5} />
                AI 설교 시작
              </button>
            </div>
          </div>
        )}
      </div>

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />
    </div>
  )
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-full min-h-[calc(100vh-4rem)]" style={{ background: 'linear-gradient(180deg, #050816 0%, #0a0e1a 50%, #0d1220 100%)' }}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          <p className="text-[12px] text-slate-500 font-bold">프로젝트 로딩 중...</p>
        </div>
      </div>
    }>
      <ProjectsContent />
    </Suspense>
  )
}
