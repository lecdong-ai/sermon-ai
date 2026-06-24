'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import type { AdvancedProject, ProjectStatus } from '@/lib/advanced/types'
import { computeProjectProgress } from '@/lib/advanced/projectProgress'

interface PipelineVisualizationProps {
  projects: AdvancedProject[]
}

interface Stage {
  key: 'research' | 'prepare' | 'writing' | 'review' | 'completed'
  label: string
  color: string
  bgClass: string
  textClass: string
  borderClass: string
  glowClass: string
}

const STAGES: Stage[] = [
  { key: 'research',  label: '연구중', color: 'blue',    bgClass: 'bg-blue-500/20',    textClass: 'text-blue-300',    borderClass: 'border-blue-500/40',    glowClass: 'shadow-blue-500/20' },
  { key: 'prepare',   label: '준비중', color: 'cyan',    bgClass: 'bg-cyan-500/20',    textClass: 'text-cyan-300',    borderClass: 'border-cyan-500/40',    glowClass: 'shadow-cyan-500/20' },
  { key: 'writing',   label: '작성중', color: 'indigo',  bgClass: 'bg-indigo-500/20',  textClass: 'text-indigo-300',  borderClass: 'border-indigo-500/40',  glowClass: 'shadow-indigo-500/20' },
  { key: 'review',    label: '검토중', color: 'amber',   bgClass: 'bg-amber-500/20',   textClass: 'text-amber-300',   borderClass: 'border-amber-500/40',   glowClass: 'shadow-amber-500/20' },
  { key: 'completed', label: '완료',   color: 'emerald', bgClass: 'bg-emerald-500/20', textClass: 'text-emerald-300', borderClass: 'border-emerald-500/40', glowClass: 'shadow-emerald-500/20' },
]

export default function PipelineVisualization({ projects }: PipelineVisualizationProps) {
  const router = useRouter()

  const stats = useMemo(() => {
    const counts: Record<ProjectStatus, number> = {
      research: 0, prepare: 0, writing: 0, review: 0, completed: 0, archived: 0,
    }
    projects.forEach((p) => {
      try {
        const progress = computeProjectProgress(p.id, p.passages, p.status)
        counts[progress.overall]++
      } catch {
        counts[p.status]++
      }
    })
    const active = counts.research + counts.prepare + counts.writing + counts.review
    const total = projects.length
    return { counts, active, total }
  }, [projects])

  const maxCount = Math.max(...STAGES.map((s) => stats.counts[s.key]), 1)

  return (
    <section className="glass-dark p-6 rounded-2xl border border-white/10">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">설계 진행 현황</h2>
          <span className="text-[10px] text-slate-600 font-medium">작업 흐름</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500">
          <span>
            진행 중 <span className="text-indigo-300">{stats.active}</span>
          </span>
          <span className="text-slate-700">|</span>
          <span>
            완료 <span className="text-emerald-300">{stats.counts.completed}</span>
          </span>
          <span className="text-slate-700">|</span>
          <span>
            보관 <span className="text-slate-400">{stats.counts.archived}</span>
          </span>
        </div>
      </div>

      {/* 파이프라인 막대 그래프 */}
      <div className="space-y-3">
        {STAGES.map((stage) => {
          const count = stats.counts[stage.key]
          const widthPct = (count / maxCount) * 100
          return (
            <button
              key={stage.key}
              onClick={() => router.push(`/advanced/projects?status=${stage.key}`)}
              className="w-full group flex items-center gap-3 hover:opacity-90 transition-opacity"
              title={`${stage.label} ${count}개 프로젝트 보기`}
            >
              {/* 라벨 */}
              <div className="w-16 shrink-0 text-right">
                <span className={`text-[11px] font-extrabold ${stage.textClass}`}>
                  {stage.label}
                </span>
              </div>

              {/* 막대 */}
              <div className="flex-1 h-7 bg-white/[0.03] rounded-lg border border-white/5 overflow-hidden relative">
                {count > 0 && (
                  <div
                    className={`h-full ${stage.bgClass} ${stage.borderClass} border-r-2 flex items-center justify-end px-2.5 transition-all duration-700 ease-out shadow-lg ${stage.glowClass}`}
                    style={{ width: `${Math.max(widthPct, 8)}%` }}
                  >
                    <span className={`text-[10px] font-extrabold ${stage.textClass}`}>
                      {count}
                    </span>
                  </div>
                )}
                {count === 0 && (
                  <div className="h-full flex items-center px-3">
                    <span className="text-[10px] text-slate-600 font-medium">없음</span>
                  </div>
                )}
              </div>

              {/* 화살표 (호버) */}
              <div className="w-12 shrink-0 text-right">
                <span className={`text-[10px] font-bold text-slate-600 group-hover:${stage.textClass} transition-colors`}>
                  {count > 0 ? '→' : ''}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {/* 하단 요약 */}
      <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4 text-[10px] font-medium text-slate-500">
          <span>
            총 <span className="text-slate-300 font-extrabold">{stats.total}</span>개 설교
          </span>
          <span className="text-slate-700">·</span>
          <span>
            진행률 <span className="text-indigo-300 font-extrabold">
              {stats.total === 0 ? 0 : Math.round((stats.counts.completed / stats.total) * 100)}%
            </span>
          </span>
        </div>
        <button
          onClick={() => router.push('/advanced/projects')}
          className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
        >
          전체 프로젝트 보기 →
        </button>
      </div>
    </section>
  )
}
