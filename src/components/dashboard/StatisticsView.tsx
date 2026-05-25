'use client'

import { useMemo } from 'react'
import { SERMONS, THEMES, TAGS, SERIES } from '@/data/sampleSermons'

export default function StatisticsView() {
  const stats = useMemo(() => {
    const byType: Record<string, number> = {}
    const byAudience: Record<string, number> = {}
    const bySeason: Record<string, number> = {}
    const byMonth: Record<string, number> = {}
    const byBook: Record<string, number> = {}
    const themeFreq: Record<string, number> = {}
    const tagFreq: Record<string, number> = {}

    SERMONS.forEach((s) => {
      byType[s.sermonType] = (byType[s.sermonType] || 0) + 1
      byAudience[s.audience] = (byAudience[s.audience] || 0) + 1
      bySeason[s.season] = (bySeason[s.season] || 0) + 1
      byBook[s.bibleBook] = (byBook[s.bibleBook] || 0) + 1
      const month = s.date.slice(5, 7) + '월'
      byMonth[month] = (byMonth[month] || 0) + 1
      s.themeIds.forEach((th) => { themeFreq[th] = (themeFreq[th] || 0) + 1 })
      s.tagIds.forEach((tg) => { tagFreq[tg] = (tagFreq[tg] || 0) + 1 })
    })

    return { byType, byAudience, bySeason, byMonth, byBook, themeFreq, tagFreq }
  }, [])

  const maxType = Math.max(...Object.values(stats.byType), 1)
  const maxAudience = Math.max(...Object.values(stats.byAudience), 1)
  const maxSeason = Math.max(...Object.values(stats.bySeason), 1)
  const maxMonth = Math.max(...Object.values(stats.byMonth), 1)
  const maxBook = Math.max(...Object.values(stats.byBook), 1)
  const maxTheme = Math.max(...Object.values(stats.themeFreq), 1)
  const maxTag = Math.max(...Object.values(stats.tagFreq), 1)

  const totalSermons = SERMONS.length
  const totalThemes = THEMES.length
  const totalTags = TAGS.length
  const totalSeries = SERIES.length

  const Bar = ({ label, value, max, color }: { label: string; value: number; max: number; color: string }) => (
    <div className="flex items-center gap-3 group">
      <span className="w-20 text-xs text-slate-500 text-right flex-shrink-0 truncate" title={label}>{label}</span>
      <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 group-hover:opacity-80"
          style={{ width: `${(value / max) * 100}%`, backgroundColor: color }}
        />
      </div>
      <span className="w-6 text-xs text-slate-400 text-right flex-shrink-0">{value}</span>
    </div>
  )

  return (
    <div className="p-6 space-y-8 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 8rem)' }}>
      {/* summary cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: '전체 설교', value: totalSermons, color: '#6366f1', icon: '📖' },
          { label: '주제', value: totalThemes, color: '#f59e0b', icon: '🏷️' },
          { label: '태그', value: totalTags, color: '#10b981', icon: '🔖' },
          { label: '시리즈', value: totalSeries, color: '#ef4444', icon: '📚' },
        ].map((item) => (
          <div key={item.label} className="glass-panel rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                style={{ backgroundColor: item.color + '15' }}
              >
                {item.icon}
              </div>
              <div>
                <p className="text-xs text-slate-400">{item.label}</p>
                <p className="text-2xl font-bold text-slate-700" style={{ color: item.color }}>{item.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* by type */}
        <div className="glass-panel rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">예배 유형별 설교 수</h3>
          <div className="space-y-2">
            {Object.entries(stats.byType).sort((a, b) => b[1] - a[1]).map(([k, v]) => (
              <Bar key={k} label={k} value={v} max={maxType} color="#6366f1" />
            ))}
          </div>
        </div>

        {/* by audience */}
        <div className="glass-panel rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">대상별 설교 수</h3>
          <div className="space-y-2">
            {Object.entries(stats.byAudience).sort((a, b) => b[1] - a[1]).map(([k, v]) => (
              <Bar key={k} label={k} value={v} max={maxAudience} color="#f59e0b" />
            ))}
          </div>
        </div>

        {/* by season */}
        <div className="glass-panel rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">교회 절기별 설교 수</h3>
          <div className="space-y-2">
            {Object.entries(stats.bySeason).sort((a, b) => b[1] - a[1]).map(([k, v]) => (
              <Bar key={k} label={k} value={v} max={maxSeason} color="#10b981" />
            ))}
          </div>
        </div>

        {/* by month */}
        <div className="glass-panel rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">월별 설교 수 (2026)</h3>
          <div className="space-y-2">
            {Object.entries(stats.byMonth).sort((a, b) => a[0].localeCompare(b[0])).map(([k, v]) => (
              <Bar key={k} label={k} value={v} max={maxMonth} color="#ef4444" />
            ))}
          </div>
        </div>

        {/* by bible book */}
        <div className="glass-panel rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">성경 본문 책별 분포</h3>
          <div className="space-y-2">
            {Object.entries(stats.byBook).sort((a, b) => b[1] - a[1]).map(([k, v]) => (
              <Bar key={k} label={k} value={v} max={maxBook} color="#8b5cf6" />
            ))}
          </div>
        </div>

        {/* by theme */}
        <div className="glass-panel rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">가장 많이 사용된 주제</h3>
          <div className="space-y-2">
            {Object.entries(stats.themeFreq).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k, v]) => {
              const theme = THEMES.find((t) => t.id === k)
              return <Bar key={k} label={theme?.name || k} value={v} max={maxTheme} color="#eab308" />
            })}
          </div>
        </div>
      </div>

      {/* tags word cloud style */}
      <div className="glass-panel rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">상황/감정 태그 사용 빈도</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(stats.tagFreq).sort((a, b) => b[1] - a[1]).map(([k, v]) => {
            const tag = TAGS.find((t) => t.id === k)
            if (!tag) return null
            const size = Math.max(0.7, Math.min(1.5, 0.7 + (v / maxTag) * 0.8))
            const color = tag.type === 'major' ? '#6366f1' : tag.type === 'situation' ? '#10b981' : '#f59e0b'
            return (
              <span
                key={k}
                className="inline-block px-3 py-1 rounded-full text-white font-medium transition-transform hover:scale-110"
                style={{ backgroundColor: color + 'dd', fontSize: `${size * 0.875}rem`, opacity: 0.6 + (v / maxTag) * 0.4 }}
              >
                {tag.name} {v}
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}
