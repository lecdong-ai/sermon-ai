'use client'

import { useMemo } from 'react'
import { SERMONS, THEMES, TAGS, SERIES } from '@/data/sampleSermons'
import { FileText, Tag, Layers, BookOpen, BarChart3, Hash } from 'lucide-react'

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

  const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#f43f5e', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

  const Bar = ({ label, value, max, color, index }: { label: string; value: number; max: number; color: string; index: number }) => (
    <div className="flex items-center gap-3 group">
      <span className="w-20 text-xs text-slate-500 text-right flex-shrink-0 truncate" title={label}>
        {label}
      </span>
      <div className="flex-1 h-6 bg-slate-100/70 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out group-hover:opacity-80"
          style={{ width: `${(value / max) * 100}%`, backgroundColor: color }}
        />
      </div>
      <span className="w-6 text-xs text-slate-400 text-right flex-shrink-0 tabular-nums">{value}</span>
    </div>
  )

  const SummaryCard = ({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ElementType; color: string }) => (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/40 p-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: color + '0d' }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <div>
          <p className="text-xs text-slate-400 font-medium">{label}</p>
          <p className="text-2xl font-bold text-slate-800">{value}</p>
        </div>
      </div>
    </div>
  )

  const ChartCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/40 p-5">
      <h3 className="text-xs font-semibold tracking-wide uppercase text-slate-400 mb-4">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  )

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6" style={{ maxHeight: 'calc(100vh - 4rem)' }}>
      {/* page header */}
      <div>
        <h1 className="text-lg font-bold text-slate-800">통계</h1>
        <p className="text-xs text-slate-400 mt-0.5">설교 데이터를 다양한 기준으로 분석합니다</p>
      </div>

      {/* summary cards */}
      <div className="grid grid-cols-4 gap-4">
        <SummaryCard label="전체 설교" value={totalSermons} icon={FileText} color="#6366f1" />
        <SummaryCard label="주제" value={totalThemes} icon={Tag} color="#f59e0b" />
        <SummaryCard label="태그" value={totalTags} icon={Hash} color="#10b981" />
        <SummaryCard label="시리즈" value={totalSeries} icon={Layers} color="#f43f5e" />
      </div>

      <div className="grid grid-cols-2 gap-5">
        <ChartCard title="예배 유형별 설교 수">
          {Object.entries(stats.byType).sort((a, b) => b[1] - a[1]).map(([k, v], i) => (
            <Bar key={k} label={k} value={v} max={maxType} color={COLORS[i % COLORS.length]} index={i} />
          ))}
        </ChartCard>

        <ChartCard title="대상별 설교 수">
          {Object.entries(stats.byAudience).sort((a, b) => b[1] - a[1]).map(([k, v], i) => (
            <Bar key={k} label={k} value={v} max={maxAudience} color={COLORS[(i + 2) % COLORS.length]} index={i} />
          ))}
        </ChartCard>

        <ChartCard title="교회 절기별 설교 수">
          {Object.entries(stats.bySeason).sort((a, b) => b[1] - a[1]).map(([k, v], i) => (
            <Bar key={k} label={k} value={v} max={maxSeason} color={COLORS[(i + 4) % COLORS.length]} index={i} />
          ))}
        </ChartCard>

        <ChartCard title="월별 설교 수 (2026)">
          {Object.entries(stats.byMonth).sort((a, b) => a[0].localeCompare(b[0])).map(([k, v], i) => (
            <Bar key={k} label={k} value={v} max={maxMonth} color={COLORS[(i + 1) % COLORS.length]} index={i} />
          ))}
        </ChartCard>

        <ChartCard title="성경 본문 책별 분포">
          {Object.entries(stats.byBook).sort((a, b) => b[1] - a[1]).map(([k, v], i) => (
            <Bar key={k} label={k} value={v} max={maxBook} color={COLORS[(i + 3) % COLORS.length]} index={i} />
          ))}
        </ChartCard>

        <ChartCard title="가장 많이 사용된 주제">
          {Object.entries(stats.themeFreq).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k, v], i) => {
            const theme = THEMES.find((t) => t.id === k)
            return <Bar key={k} label={theme?.name || k} value={v} max={maxTheme} color={COLORS[(i + 5) % COLORS.length]} index={i} />
          })}
        </ChartCard>
      </div>

      {/* tags word cloud */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/40 p-5">
        <h3 className="text-xs font-semibold tracking-wide uppercase text-slate-400 mb-4">상황 및 감정 태그 사용 빈도</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(stats.tagFreq)
            .sort((a, b) => b[1] - a[1])
            .map(([k, v]) => {
              const tag = TAGS.find((t) => t.id === k)
              if (!tag) return null
              const size = Math.max(0.8, Math.min(1.4, 0.8 + (v / maxTag) * 0.6))
              const color = tag.type === 'major' ? '#6366f1' : tag.type === 'situation' ? '#10b981' : '#f59e0b'
              return (
                <span
                  key={k}
                  className="inline-block px-3 py-1.5 rounded-full text-white font-medium transition-all hover:scale-110 hover:shadow-md cursor-default"
                  style={{
                    backgroundColor: color,
                    fontSize: `${size * 0.875}rem`,
                    opacity: 0.6 + (v / maxTag) * 0.4,
                  }}
                >
                  {tag.name}
                  <span className="ml-1 font-normal opacity-70">{v}</span>
                </span>
              )
            })}
        </div>
      </div>
    </div>
  )
}
