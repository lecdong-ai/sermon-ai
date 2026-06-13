'use client'

import { useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { mockProjects, mockQuickStats } from '@/lib/advanced/mockData'
import { PROJECT_STATUS_LABELS } from '@/lib/advanced/types'
import type { ProjectStatus, AdvancedProject } from '@/lib/advanced/types'
import {
  Plus, Search, Flame, CheckCircle, BookOpen, FileText,
  Clock, Pen, Eye, Archive, ChevronRight, Sparkles, Zap,
  BarChart2, Calendar, AlignLeft, ArrowRight
} from 'lucide-react'

/* ── 상태별 색상 매핑 ── */
const STATUS_COLORS: Record<ProjectStatus, { bg: string; text: string; border: string; dot: string }> = {
  research:  { bg: 'bg-sky-500/10',     text: 'text-sky-300',     border: 'border-sky-500/30',     dot: 'bg-sky-400' },
  prepare:   { bg: 'bg-amber-500/10',   text: 'text-amber-300',   border: 'border-amber-500/30',   dot: 'bg-amber-400' },
  writing:   { bg: 'bg-indigo-500/10',  text: 'text-indigo-300',  border: 'border-indigo-500/30',  dot: 'bg-indigo-400 animate-pulse' },
  review:    { bg: 'bg-purple-500/10',  text: 'text-purple-300',  border: 'border-purple-500/30',  dot: 'bg-purple-400' },
  completed: { bg: 'bg-emerald-500/10', text: 'text-emerald-300', border: 'border-emerald-500/30', dot: 'bg-emerald-400' },
  archived:  { bg: 'bg-slate-500/10',   text: 'text-slate-400',   border: 'border-slate-500/30',   dot: 'bg-slate-500' },
}

const STATUS_ICONS: Record<ProjectStatus, any> = {
  research: BookOpen,
  prepare: AlignLeft,
  writing: Pen,
  review: Eye,
  completed: CheckCircle,
  archived: Archive,
}

/* ── 진행률 계산 ── */
function getProgress(status: ProjectStatus): number {
  const map: Record<ProjectStatus, number> = {
    research: 15, prepare: 35, writing: 65, review: 85, completed: 100, archived: 100,
  }
  return map[status]
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
function ProjectCard({ project, onClick }: { project: AdvancedProject; onClick: () => void }) {
  const progress = getProgress(project.status)
  const c = STATUS_COLORS[project.status]
  const daysLeft = Math.ceil((new Date(project.sermonDate).getTime() - Date.now()) / 86400000)

  return (
    <div
      onClick={onClick}
      className="group relative rounded-2xl border border-white/5 bg-[#04060f]/70 hover:border-indigo-500/25 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col"
      style={{ boxShadow: '0 20px 40px -15px rgba(0,0,0,0.5)' }}
    >
      {/* 상단 색상 스트립 */}
      <div className={`h-0.5 w-full ${c.dot.replace('animate-pulse','').trim()}`} style={{
        background: project.status === 'writing'
          ? 'linear-gradient(90deg, #6366f1, #a855f7)'
          : project.status === 'completed'
          ? 'linear-gradient(90deg, #10b981, #34d399)'
          : undefined
      }} />

      <div className="p-5 flex flex-col gap-4 flex-1">
        {/* 헤더 */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-[15px] font-bold text-white group-hover:text-indigo-300 transition-colors leading-snug line-clamp-2">
              {project.title}
            </h3>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[11px] font-extrabold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded">
                {project.passage}
              </span>
              <span className="text-[10px] text-slate-500 font-bold">{project.sermonType}</span>
            </div>
          </div>
          <DarkStatusBadge status={project.status} />
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
              <span key={t} className="text-[9px] font-bold px-2 py-0.5 rounded bg-white/5 text-slate-500 border border-white/[0.03]">
                {t}
              </span>
            ))}
          </div>
        )}

        {/* 진행률 바 */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-extrabold text-slate-600 uppercase tracking-widest">작성 진행도</span>
            <span className={`text-[10px] font-extrabold ${c.text}`}>{progress}%</span>
          </div>
          <div className="h-1 rounded-full bg-white/5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                project.status === 'completed' ? 'bg-gradient-to-r from-emerald-500 to-green-400' :
                project.status === 'writing'   ? 'bg-gradient-to-r from-indigo-500 to-purple-500' :
                'bg-gradient-to-r from-slate-500 to-slate-400'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 메타 정보 */}
        <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 pt-2 border-t border-white/5">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {project.sermonDate}
            </span>
            {daysLeft > 0 && daysLeft < 30 && (
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
            <span>v{project.version}</span>
          </div>
        </div>
      </div>

      {/* 열기 버튼 (hover 시) */}
      <div className="px-5 pb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 text-[11px] font-bold">
          <span>프로젝트 열기</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  )
}

/* ── 상단 통계 카드 ── */
function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className="glass-dark glass-dark-hover p-5 rounded-2xl flex flex-col justify-between min-h-[100px]">
      <span className={`text-[10px] font-extrabold uppercase tracking-widest ${color}`}>{label}</span>
      <div>
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

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return mockProjects
    const q = searchQuery.toLowerCase()
    return mockProjects.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.passage.toLowerCase().includes(q) ||
      p.coreMessage.toLowerCase().includes(q) ||
      p.sermonType.toLowerCase().includes(q)
    )
  }, [searchQuery])

  const stats = mockQuickStats
  const inProgress = filtered.filter(p => !['completed','archived'].includes(p.status))
  const done = filtered.filter(p => p.status === 'completed')

  return (
    <div className="min-h-full pb-16">
      <div className="max-w-[1200px] mx-auto px-6 py-8 space-y-10">

        {/* ── 페이지 헤더 ── */}
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Sermon Projects</span>
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
          <button
            onClick={() => router.push('/advanced/projects/new')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-bold transition-all shadow-lg shadow-indigo-600/20 hover:-translate-y-0.5 hover:shadow-indigo-600/30"
          >
            <Plus className="w-4 h-4" />
            새 프로젝트
          </button>
        </div>

        {/* ── 통계 카드 ── */}
        {!searchQuery && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="전체 프로젝트" value={stats.totalProjects} sub="편" color="text-indigo-400" />
            <StatCard label="진행 중" value={stats.inProgress} sub="활성" color="text-amber-400" />
            <StatCard label="완료 설교" value={stats.completed} sub="편" color="text-emerald-400" />
            <StatCard label="누적 원고량" value={(stats.totalWords / 10000).toFixed(1)} sub="만 자" color="text-purple-400" />
          </div>
        )}

        {/* ── 진행 중인 프로젝트 ── */}
        {filtered.length === 0 ? (
          <div className="glass-dark rounded-3xl p-16 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center mx-auto">
              <FileText className="w-7 h-7 text-slate-500" />
            </div>
            <p className="text-sm font-bold text-white">
              {searchQuery ? `"${searchQuery}"에 대한 결과가 없습니다` : '아직 설교 프로젝트가 없습니다'}
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
            {/* 진행 중 */}
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
                    />
                  ))}
                </div>
              </section>
            )}

            {/* 완료된 */}
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
