'use client'

import { useMemo } from 'react'
import { SERMONS, THEMES, SERIES } from '@/data/sampleSermons'
import { FileText, Layers, Tag, TrendingUp, Calendar, ArrowRight, BookOpen, MessageSquare } from 'lucide-react'

interface HomeViewProps {
  onNavigate: (page: string, params?: Record<string, string>) => void
}

export default function HomeView({ onNavigate }: HomeViewProps) {
  const stats = useMemo(() => ({
    total: SERMONS.length,
    themes: THEMES.length,
    series: SERIES.length,
    ongoingSeries: SERIES.filter((s) => s.status === '진행중').length,
  }), [])

  const recentSermons = useMemo(() => [...SERMONS].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5), [])
  const recentSeries = useMemo(() => [...SERIES].sort((a, b) => b.startDate.localeCompare(a.startDate)).slice(0, 3), [])

  const topThemes = useMemo(() => {
    const freq: Record<string, number> = {}
    SERMONS.forEach((s) => s.themeIds.forEach((th) => { freq[th] = (freq[th] || 0) + 1 }))
    return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id, count]) => ({
      name: THEMES.find((t) => t.id === id)?.name || id,
      count,
    }))
  }, [])

  const monthData = useMemo(() => {
    const months: Record<string, number> = {}
    SERMONS.forEach((s) => {
      const m = s.date.slice(5, 7)
      months[m] = (months[m] || 0) + 1
    })
    return Object.entries(months).sort((a, b) => a[0].localeCompare(b[0]))
  }, [])

  const statCards = [
    { label: '전체 설교', value: stats.total, color: '#6366f1', icon: FileText, onClick: () => onNavigate('list') },
    { label: '시리즈', value: stats.series, color: '#f43f5e', icon: Layers, onClick: () => onNavigate('series') },
    { label: '주제', value: stats.themes, color: '#f59e0b', icon: Tag, onClick: () => onNavigate('tags') },
    { label: '진행중 시리즈', value: stats.ongoingSeries, color: '#10b981', icon: TrendingUp, onClick: () => onNavigate('series') },
  ]

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6" style={{ maxHeight: 'calc(100vh - 4rem)' }}>
      {/* page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-800">대시보드</h1>
          <p className="text-xs text-slate-400 mt-0.5">설교 데이터의 종합 현황입니다</p>
        </div>
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-4 gap-4">
        {statCards.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.label}
              onClick={item.onClick}
              className="group relative bg-white/70 backdrop-blur-xl rounded-2xl border border-white/40 p-5 text-left hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: item.color + '0d' }}>
                  <Icon className="w-5 h-5" style={{ color: item.color }} />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-400 transition-all opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 duration-200" />
              </div>
              <p className="text-2xl font-bold text-slate-800">{item.value}</p>
              <p className="text-xs text-slate-400 mt-1">{item.label}</p>
            </button>
          )
        })}
      </div>

      {/* monthly chart + top themes */}
      <div className="grid grid-cols-3 gap-5">
        {/* monthly bar chart */}
        <div className="col-span-2 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/40 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold tracking-wide uppercase text-slate-400">월별 설교 (2026)</h3>
            <button onClick={() => onNavigate('stats')} className="text-xs text-indigo-500 hover:text-indigo-700 font-medium transition-colors">
              전체 통계
              <ArrowRight className="w-3 h-3 inline ml-0.5" />
            </button>
          </div>
          <div className="flex items-end gap-3 h-32 pt-2">
            {monthData.map(([m, count]) => {
              const maxCount = Math.max(...monthData.map(([, c]) => c), 1)
              const height = (count / maxCount) * 100
              const names: Record<string, string> = { '01': '1월', '02': '2월', '03': '3월', '04': '4월', '05': '5월' }
              return (
                <div key={m} className="flex-1 flex flex-col items-center gap-1 group">
                  <span className="text-[10px] font-medium text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">{count}</span>
                  <div className="w-full bg-indigo-50/50 rounded-full overflow-hidden relative" style={{ height: '100px' }}>
                    <div
                      className="absolute bottom-0 w-full rounded-full transition-all duration-700 ease-out"
                      style={{ height: `${height}%`, backgroundColor: '#6366f1' }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400">{names[m] || m}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* top themes */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/40 p-5">
          <h3 className="text-xs font-semibold tracking-wide uppercase text-slate-400 mb-4">많이 사용된 주제</h3>
          <div className="space-y-3">
            {topThemes.map((t, i) => (
              <div key={t.name} className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold ${
                  i === 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'
                }`}>{i + 1}</span>
                <span className="flex-1 text-sm text-slate-600">{t.name}</span>
                <span className="text-xs text-slate-400 tabular-nums">{t.count}회</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* recent sermons */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/40 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold tracking-wide uppercase text-slate-400">최근 설교</h3>
          <button onClick={() => onNavigate('list')} className="text-xs text-indigo-500 hover:text-indigo-700 font-medium transition-colors">
            모두 보기
            <ArrowRight className="w-3 h-3 inline ml-0.5" />
          </button>
        </div>
        <div className="space-y-1">
          {recentSermons.map((s) => (
            <button
              key={s.id}
              onClick={() => onNavigate('detail', { id: s.id })}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-medium text-slate-400 bg-slate-100 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                  <MessageSquare className="w-3.5 h-3.5" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-700 group-hover:text-indigo-600 transition-colors truncate">{s.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{s.normalizedPassage} · {s.sermonType}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400 flex-shrink-0">
                <span className="hidden sm:inline">{s.preacher}</span>
                <span>{s.date}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* series quick view */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/40 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold tracking-wide uppercase text-slate-400">시리즈 현황</h3>
          <button onClick={() => onNavigate('series')} className="text-xs text-indigo-500 hover:text-indigo-700 font-medium transition-colors">
            모두 보기
            <ArrowRight className="w-3 h-3 inline ml-0.5" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {recentSeries.map((s) => {
            const sermonCount = SERMONS.filter((ser) => ser.seriesId === s.id).length
            const colors: Record<string, { bg: string; text: string; dot: string }> = {
              '진행중': { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: '#10b981' },
              '완료': { bg: 'bg-slate-100', text: 'text-slate-500', dot: '#94a3b8' },
              '예정': { bg: 'bg-indigo-50', text: 'text-indigo-600', dot: '#6366f1' },
            }
            const c = colors[s.status] || colors['완료']
            return (
              <div key={s.id} className="p-4 rounded-xl bg-slate-50/50 border border-slate-100 hover:border-slate-200 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.dot }} />
                    {s.status}
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-700 mb-1">{s.name}</p>
                <p className="text-xs text-slate-400 line-clamp-2 mb-2">{s.description}</p>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-300" />
                    {s.startDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="w-3 h-3 text-slate-300" />
                    {sermonCount}편
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
