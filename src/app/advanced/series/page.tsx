'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { SERIES_DATA } from '@/lib/advanced/seriesData'
import type { SeriesData } from '@/lib/advanced/seriesData'

export default function SeriesPage() {
  const router = useRouter()
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all')

  const filtered = useMemo(() => {
    if (filterStatus === 'active') return SERIES_DATA.filter(s => s.completedSermons < s.totalSermons)
    if (filterStatus === 'completed') return SERIES_DATA.filter(s => s.completedSermons >= s.totalSermons)
    return SERIES_DATA
  }, [filterStatus])

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold text-white">설교 시리즈</h1>
          <p className="text-xs text-slate-500 font-bold mt-1">연속 설교를 계획하고 관리합니다 · 총 {SERIES_DATA.length}개 시리즈</p>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-1.5 mb-6 bg-white/5 border border-white/5 rounded-xl p-0.5 w-fit">
        <FilterBtn label="전체" active={filterStatus === 'all'} onClick={() => setFilterStatus('all')} />
        <FilterBtn label={`진행중 (${SERIES_DATA.filter(s => s.completedSermons < s.totalSermons).length})`}
          active={filterStatus === 'active'} onClick={() => setFilterStatus('active')} />
        <FilterBtn label={`완료 (${SERIES_DATA.filter(s => s.completedSermons >= s.totalSermons).length})`}
          active={filterStatus === 'completed'} onClick={() => setFilterStatus('completed')} />
      </div>

      {/* Series Grid */}
      {filtered.length === 0 ? (
        <div className="bg-[#04060f]/60 rounded-2xl border border-white/5">
          <div className="py-12 text-center">
            <p className="text-sm text-slate-500 font-bold">조건에 맞는 시리즈가 없습니다</p>
            <button onClick={() => setFilterStatus('all')}
              className="text-xs text-indigo-400 font-bold hover:underline mt-2 inline-block">
              전체 시리즈 보기
            </button>
          </div>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(series => (
          <SeriesCard key={series.id} series={series} onClick={() => router.push(`/advanced/series/${series.id}`)} />
        ))}
      </div>
      )}
    </div>
  )
}

function FilterBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`px-4 py-1.5 text-[11px] rounded-lg font-bold transition-colors ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15' : 'text-slate-500 hover:text-slate-300'}`}>
      {label}
    </button>
  )
}

function SeriesCard({ series, onClick }: { series: SeriesData; onClick: () => void }) {
  const progress = series.totalSermons > 0 ? Math.round((series.completedSermons / series.totalSermons) * 100) : 0
  const isCompleted = series.completedSermons >= series.totalSermons

  return (
    <div onClick={onClick}
      className="bg-[#04060f]/60 rounded-2xl border border-white/5 overflow-hidden hover:border-indigo-500/30 transition-all cursor-pointer group">
      {/* Top color bar */}
      <div className={`h-1 ${isCompleted ? 'bg-emerald-500' : 'bg-amber-500'}`} />

      <div className="p-5">
        {/* Title + Season */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{series.title}</h3>
          {series.season && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 bg-white/5 border border-white/5 text-slate-500">{series.season}</span>
          )}
        </div>

        {/* Progress */}
        <div className="mt-3 flex items-center gap-3">
          <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${isCompleted ? 'bg-emerald-500' : 'bg-amber-500'}`}
              style={{ width: `${progress}%` }} />
          </div>
          <span className="text-[11px] text-slate-500 font-bold shrink-0">{series.completedSermons}/{series.totalSermons}</span>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 border ${isCompleted ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' : 'bg-amber-500/10 text-amber-300 border-amber-500/20'}`}>
            {isCompleted ? '완료' : '진행중'}
          </span>
        </div>

        {/* Description */}
        <p className="text-[11px] text-slate-400 leading-relaxed mt-3 line-clamp-2 font-medium">{series.description}</p>

        {/* Themes */}
        <div className="flex flex-wrap gap-1 mt-3">
          {series.themeNames.slice(0, 4).map(t => (
            <span key={t} className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">{t}</span>
          ))}
        </div>

        {/* Latest */}
        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500 font-bold">
          <span>최근: {series.sermons.filter(s => s.status !== 'planned').reverse()[0]?.sermonDate || series.sermons[0]?.sermonDate}</span>
          <span className="text-indigo-400 group-hover:underline">상세보기 →</span>
        </div>
      </div>
    </div>
  )
}
