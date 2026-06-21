'use client'

import { useMemo } from 'react'
import { AppSectionHeader } from '@/components/advanced/shared'
import { NOTE_TYPE_LABELS, NOTE_TYPE_DOTS, type NoteType, type NoteEntry } from '@/lib/advanced/notesData'

interface NotesSummaryProps {
  notes: NoteEntry[]
  onSelectNote?: (id: string) => void
}

const TYPE_COLORS_BG: Record<NoteType, string> = {
  insight: 'bg-emerald-500',
  research: 'bg-blue-500',
  application: 'bg-violet-500',
  question: 'bg-amber-500',
  pastoral: 'bg-rose-500',
  illustration: 'bg-cyan-500',
  warning: 'bg-red-500',
}

export default function NotesSummary({ notes, onSelectNote }: NotesSummaryProps) {
  const stats = useMemo(() => {
    const total = notes.length
    const starred = notes.filter((n) => n.starred).length
    const pinned = notes.filter((n) => n.pinned).length
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const recentWeek = notes.filter((n) => new Date(n.updatedAt) > weekAgo).length
    const byType: Record<NoteType, number> = { insight: 0, research: 0, application: 0, question: 0, pastoral: 0, illustration: 0, warning: 0 }
    notes.forEach((n) => { byType[n.type] = (byType[n.type] || 0) + 1 })
    const topicCount: Record<string, number> = {}
    notes.forEach((n) => {
      n.connections.filter((c) => c.type === 'theme' || c.type === 'passage').forEach((c) => {
        topicCount[c.label] = (topicCount[c.label] || 0) + 1
      })
    })
    const topTopics = Object.entries(topicCount).sort((a, b) => b[1] - a[1]).slice(0, 6)
    const mostReferenced = [...notes].sort((a, b) => b.referenceCount - a.referenceCount).slice(0, 4)
    return { total, starred, pinned, recentWeek, byType, topTopics, mostReferenced }
  }, [notes])

  const heatmap = useMemo(() => buildHeatmap(notes), [notes])

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin">
      <div className="p-6 max-w-4xl mx-auto space-y-5">
        <div className="text-center pb-4 border-b border-white/5">
          <h2 className="text-xl font-bold text-white">통찰의 풍경</h2>
          <p className="text-xs text-slate-500 font-bold mt-1.5">
            {stats.total}개의 통찰이 사역의 별이 되어 빛나고 있습니다
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="전체 통찰" value={stats.total} accent="from-indigo-500/20 to-indigo-500/5" />
          <StatCard label="중요 표시" value={stats.starred} accent="from-amber-500/20 to-amber-500/5" icon="★" />
          <StatCard label="고정됨" value={stats.pinned} accent="from-emerald-500/20 to-emerald-500/5" icon="📌" />
          <StatCard label="이번 주" value={stats.recentWeek} accent="from-rose-500/20 to-rose-500/5" pulse />
        </div>

        <div className="bg-[#0c1020]/60 rounded-2xl border border-white/5 p-5">
          <AppSectionHeader title="유형별 분포" />
          <div className="space-y-2.5 mt-2">
            {(Object.keys(stats.byType) as NoteType[]).filter((t) => stats.byType[t] > 0).map((t) => {
              const pct = stats.total > 0 ? Math.round((stats.byType[t] / stats.total) * 100) : 0
              return (
                <div key={t}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${TYPE_COLORS_BG[t]}`} />
                      <span className="text-slate-300 font-bold">{NOTE_TYPE_LABELS[t]}</span>
                    </div>
                    <span className="text-slate-500 font-bold">{stats.byType[t]}개 · {pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${TYPE_COLORS_BG[t]}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
            {stats.total === 0 && (
              <p className="text-xs text-slate-500 text-center py-4">아직 기록된 통찰이 없습니다</p>
            )}
          </div>
        </div>

        <div className="bg-[#0c1020]/60 rounded-2xl border border-white/5 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">최근 12주 기록 지도</h3>
            <span className="text-[10px] text-slate-500 font-medium">GitHub 잔디 스타일 · 어두울수록 기록 없음</span>
          </div>
          <div className="mt-3 overflow-x-auto scrollbar-thin">
            <div className="flex gap-0.5 min-w-fit">
              {heatmap.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-0.5">
                  {week.map((day, di) => (
                    <div
                      key={di}
                      className="w-2.5 h-2.5 rounded-sm"
                      style={{ backgroundColor: day > 0 ? `rgba(99, 102, 241, ${Math.min(0.9, 0.2 + day * 0.18)})` : 'rgba(255, 255, 255, 0.04)' }}
                      title={`${day}개`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {stats.topTopics.length > 0 && (
          <div className="bg-[#0c1020]/60 rounded-2xl border border-white/5 p-5">
            <AppSectionHeader title="자주 다룬 주제" />
            <div className="flex flex-wrap gap-2 mt-2">
              {stats.topTopics.map(([topic, count]) => (
                <div key={topic} className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs text-indigo-300 font-bold">
                  {topic}
                  <span className="text-indigo-400 ml-1.5">· {count}회</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {stats.mostReferenced.length > 0 && (
          <div className="bg-[#0c1020]/60 rounded-2xl border border-white/5 p-5">
            <AppSectionHeader title="가장 자주 꺼내본 통찰" />
            <div className="space-y-2 mt-2">
              {stats.mostReferenced.map((n) => {
                const clickable = !!onSelectNote
                const Wrapper: any = clickable ? 'button' : 'div'
                return (
                  <Wrapper
                    key={n.id}
                    onClick={clickable ? () => onSelectNote!(n.id) : undefined}
                    className={`w-full text-left flex items-start gap-3 p-3 rounded-xl border transition-colors ${
                      clickable
                        ? 'bg-[#0c1020] border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/5 cursor-pointer group'
                        : 'bg-[#0c1020] border-white/5'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full shrink-0 mt-1 ${NOTE_TYPE_DOTS[n.type]}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold truncate ${clickable ? 'text-slate-200 group-hover:text-indigo-300' : 'text-slate-200'}`}>{n.title}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
                        참조 {n.referenceCount}회 · {NOTE_TYPE_LABELS[n.type]}
                      </p>
                    </div>
                    {clickable && (
                      <svg className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-400 shrink-0 mt-0.5 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </Wrapper>
                )
              })}
            </div>
          </div>
        )}

        <div className="text-center py-6">
          <p className="text-[11px] text-slate-500 italic leading-relaxed font-medium">
            {'\u201C'}작은 통찰 하나가 쌓여 사역의 깊이가 됩니다.<br />
            오늘 기록한 한 줄이 내일의 별이 됩니다.{'\u201D'}
          </p>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, accent, icon, pulse }: { label: string; value: number; accent: string; icon?: string; pulse?: boolean }) {
  return (
    <div className={`relative rounded-2xl border border-white/5 bg-gradient-to-br ${accent} p-4 overflow-hidden`}>
      {pulse && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
      )}
      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{label}</p>
      <p className="text-2xl font-bold text-white mt-1.5 flex items-center gap-1.5">
        {icon && <span className="text-base opacity-70">{icon}</span>}
        <span className="tabular-nums">{value}</span>
      </p>
    </div>
  )
}

function buildHeatmap(notes: NoteEntry[]): number[][] {
  const days = 7
  const weeks = 12
  const grid: number[][] = Array.from({ length: weeks }, () => Array(days).fill(0))
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - (weeks * 7 - 1))
  notes.forEach((n) => {
    const d = new Date(n.updatedAt)
    d.setHours(0, 0, 0, 0)
    const diff = Math.floor((d.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    if (diff >= 0 && diff < weeks * 7) {
      const w = Math.floor(diff / 7)
      const day = diff % 7
      grid[w][day] = (grid[w][day] || 0) + 1
    }
  })
  return grid
}
