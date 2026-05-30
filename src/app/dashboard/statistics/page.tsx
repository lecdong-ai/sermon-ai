'use client'

import { useMemo } from 'react'
import dynamic from 'next/dynamic'
import { useApp } from '@/lib/dashboard/store'

const BarChart = dynamic(() => import('recharts').then(m => m.BarChart), { ssr: false })
const Bar = dynamic(() => import('recharts').then(m => m.Bar), { ssr: false })
const XAxis = dynamic(() => import('recharts').then(m => m.XAxis), { ssr: false })
const YAxis = dynamic(() => import('recharts').then(m => m.YAxis), { ssr: false })
const CartesianGrid = dynamic(() => import('recharts').then(m => m.CartesianGrid), { ssr: false })
const Tooltip = dynamic(() => import('recharts').then(m => m.Tooltip), { ssr: false })
const LineChart = dynamic(() => import('recharts').then(m => m.LineChart), { ssr: false })
const Line = dynamic(() => import('recharts').then(m => m.Line), { ssr: false })
const Area = dynamic(() => import('recharts').then(m => m.Area), { ssr: false })
const AreaChart = dynamic(() => import('recharts').then(m => m.AreaChart), { ssr: false })
const PieChart = dynamic(() => import('recharts').then(m => m.PieChart), { ssr: false })
const Pie = dynamic(() => import('recharts').then(m => m.Pie), { ssr: false })
const ResponsiveContainer = dynamic(() => import('recharts').then(m => m.ResponsiveContainer), { ssr: false })
import { Cell } from 'recharts'

const GRADIENTS: Array<[string, string]> = [
  ['#6366f1', '#8b5cf6'],
  ['#3b82f6', '#06b6d4'],
  ['#f59e0b', '#ef4444'],
  ['#10b981', '#3b82f6'],
]

const PALETTE = [
  '#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd',
  '#3b82f6', '#06b6d4', '#10b981', '#f59e0b',
  '#ef4444', '#ec4899',
]

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'rgba(15,23,42,0.95)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '12px',
      padding: '10px 14px',
      fontSize: '13px',
      color: '#f1f5f9',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    }}>
      <p style={{ margin: 0, fontWeight: 600, opacity: 0.7, fontSize: '11px' }}>{label}</p>
      <p style={{ margin: '4px 0 0', fontWeight: 700, fontSize: '18px' }}>
        {payload[0].value}<span style={{ fontSize: '12px', fontWeight: 400, opacity: 0.6, marginLeft: 4 }}>편</span>
      </p>
    </div>
  )
}

function StatCard({ icon, label, value, gradient, delay }: { icon: string; label: string; value: number; gradient: [string, string]; delay: number }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 group hover:-translate-y-0.5 transition-all duration-300"
      style={{
        background: `linear-gradient(135deg, ${gradient[0]}12, ${gradient[1]}08)`,
        border: `1px solid ${gradient[0]}20`,
        animationDelay: `${delay}ms`,
      }}
    >
      <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-10 -translate-y-6 translate-x-6" style={{ background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})` }} />
      <div className="relative">
        <span className="text-2xl">{icon}</span>
        <p className="text-xs font-medium mt-3" style={{ color: `${gradient[0]}99` }}>{label}</p>
        <p className="text-3xl font-extrabold mt-1 tracking-tight" style={{ color: gradient[0] }}>{value}</p>
      </div>
    </div>
  )
}

function ChartCard({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl p-5 transition-all duration-300 hover:shadow-lg ${className || ''}`}
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      <h3 className="text-sm font-semibold text-slate-500 mb-4 tracking-wide uppercase">{title}</h3>
      {children}
    </div>
  )
}

export default function StatisticsPage() {
  const { state } = useApp()
  const { sermons, themes, series } = state

  const totalSermons = sermons.length

  const yearData = useMemo(() => {
    const map = new Map<string, number>()
    for (const s of sermons) map.set(s.date.slice(0, 4), (map.get(s.date.slice(0, 4)) || 0) + 1)
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0])).map(([year, count]) => ({ name: `${year}년`, count }))
  }, [sermons])

  const monthData = useMemo(() => {
    const map = new Map<string, number>()
    for (const s of sermons) map.set(s.date.slice(0, 7), (map.get(s.date.slice(0, 7)) || 0) + 1)
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0])).map(([month, count]) => ({ name: month.slice(5), count }))
  }, [sermons])

  const bookData = useMemo(() => {
    const map = new Map<string, number>()
    for (const s of sermons) map.set(s.bibleBook, (map.get(s.bibleBook) || 0) + 1)
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([book, count]) => ({ name: book, count }))
  }, [sermons])

  const themeData = useMemo(() => {
    const map = new Map<string, number>()
    for (const s of sermons) {
      for (const tid of s.themeIds) {
        const theme = themes.find((t) => t.id === tid)
        if (theme) map.set(theme.name, (map.get(theme.name) || 0) + 1)
      }
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }))
  }, [sermons, themes])

  const seasonData = useMemo(() => {
    const map = new Map<string, number>()
    for (const s of sermons) if (s.season) map.set(s.season, (map.get(s.season) || 0) + 1)
    return Array.from(map.entries()).map(([season, count], i) => ({ name: season, count, fill: PALETTE[i % PALETTE.length] }))
  }, [sermons])

  const audienceData = useMemo(() => {
    const map = new Map<string, number>()
    for (const s of sermons) map.set(s.audience, (map.get(s.audience) || 0) + 1)
    return Array.from(map.entries()).map(([a, count]) => ({ name: a, count }))
  }, [sermons])

  const seriesData = useMemo(() => {
    return series.map((srs) => ({ name: srs.name, count: sermons.filter((s) => s.seriesId === srs.id).length })).filter(s => s.count > 0)
  }, [series, sermons])

  const summaryCards = [
    { icon: '📖', label: '전체 설교', value: totalSermons },
    { icon: '🏷️', label: '사용 태그', value: themes.length },
    { icon: '📚', label: '시리즈', value: series.length },
    { icon: '👤', label: '설교자', value: new Set(sermons.map((s) => s.preacher)).size },
  ]

  const axisStyle = { fontSize: 11, fill: '#94a3b8', fontFamily: 'var(--font-noto-sans-kr), sans-serif' }
  const gridStyle = { stroke: '#f1f5f9', strokeDasharray: '4 4' }

  return (
    <div className="animate-fade-in space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">통계 / 분석</h2>
          <p className="text-sm text-muted mt-1">설교 사역의 흐름을 한눈에 파악하세요</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {summaryCards.map((card, i) => (
          <StatCard key={card.label} {...card} gradient={GRADIENTS[i]} delay={i * 60} />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <ChartCard title="연도별 설교 수">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={yearData} barSize={36}>
              <CartesianGrid {...gridStyle} vertical={false} />
              <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} dy={8} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} dx={-8} />
              <Tooltip content={<CustomTooltip />} />
              <defs>
                <linearGradient id="yearGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <Bar dataKey="count" fill="url(#yearGrad)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="월별 설교 추이">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthData}>
              <CartesianGrid {...gridStyle} vertical={false} />
              <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} dy={8} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} dx={-8} />
              <Tooltip content={<CustomTooltip />} />
              <defs>
                <linearGradient id="monthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2.5} fill="url(#monthGrad)" dot={{ fill: '#3b82f6', r: 3, strokeWidth: 0 }} activeDot={{ r: 5, stroke: '#3b82f6', strokeWidth: 2, fill: '#fff' }} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="성경책별 TOP 10">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={bookData} layout="vertical" barSize={18}>
              <CartesianGrid {...gridStyle} horizontal={true} vertical={false} />
              <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" width={65} tick={{ ...axisStyle, fontWeight: 500 }} axisLine={false} tickLine={false} dx={-4} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                {bookData.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="주제별 TOP 10">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={themeData.slice(0, 10)} layout="vertical" barSize={18}>
              <CartesianGrid {...gridStyle} horizontal={true} vertical={false} />
              <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" width={55} tick={{ ...axisStyle, fontWeight: 500 }} axisLine={false} tickLine={false} dx={-4} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                {themeData.slice(0, 10).map((_, i) => (
                  <Cell key={i} fill={PALETTE[(i + 3) % PALETTE.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="절기별 설교 분포">
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={seasonData}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  cornerRadius={4}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {seasonData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            {seasonData.map((item, i) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.fill }} />
                <span className="text-xs text-slate-600">{item.name}</span>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="회중별 설교 수">
          <div className="space-y-3">
            {audienceData.sort((a, b) => b.count - a.count).map((item, i) => {
              const max = Math.max(...audienceData.map(d => d.count))
              const pct = (item.count / max) * 100
              return (
                <div key={item.name} className="flex items-center gap-3">
                  <span className="text-sm w-20 shrink-0 font-medium text-slate-700">{item.name}</span>
                  <div className="flex-1 h-6 rounded-full overflow-hidden" style={{ background: '#f1f5f9' }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        background: `linear-gradient(90deg, ${PALETTE[i % PALETTE.length]}, ${PALETTE[(i + 1) % PALETTE.length]})`,
                      }}
                    />
                  </div>
                  <span className="text-xs font-bold w-8 text-right text-slate-600">{item.count}</span>
                </div>
              )
            })}
          </div>
        </ChartCard>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <ChartCard title="시리즈별 설교 수">
          {seriesData.length > 0 ? (
            <div className="space-y-3">
              {seriesData.sort((a, b) => b.count - a.count).map((item, i) => {
                const max = Math.max(...seriesData.map(d => d.count))
                const pct = (item.count / max) * 100
                return (
                  <div key={item.name} className="flex items-center gap-3">
                    <span className="text-sm flex-1 truncate font-medium text-slate-700">{item.name}</span>
                    <div className="flex-1 h-6 rounded-full overflow-hidden max-w-[180px]" style={{ background: '#f1f5f9' }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                        }}
                      />
                    </div>
                    <span className="text-xs font-bold w-8 text-right text-slate-600">{item.count}</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-muted py-8 text-center">등록된 시리즈가 없습니다</p>
          )}
        </ChartCard>

        <ChartCard title="태그 워드클라우드">
          <div className="flex flex-wrap gap-2 items-center justify-center py-2">
            {themeData.slice(0, 20).map((item) => {
              const maxCount = themeData[0]?.count || 1
              const size = 12 + (item.count / maxCount) * 14
              const opacity = 0.4 + (item.count / maxCount) * 0.6
              return (
                <span
                  key={item.name}
                  className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 font-medium transition-all hover:scale-105 cursor-default"
                  style={{
                    fontSize: `${size}px`,
                    opacity,
                    color: PALETTE[themeData.indexOf(item) % PALETTE.length],
                    background: `${PALETTE[themeData.indexOf(item) % PALETTE.length]}10`,
                  }}
                >
                  {item.name}
                  <span style={{ fontSize: `${size - 4}px`, opacity: 0.6 }}>{item.count}</span>
                </span>
              )
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">적게 다룬 성경책</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                {bookData.length < 3 ? '데이터가 충분하지 않습니다' : bookData.slice(-5).map(b => b.name).join(', ')}
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">적게 다룬 주제</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                {themeData.length < 3 ? '데이터가 충분하지 않습니다' : themeData.slice(-5).map(t => t.name).join(', ')}
              </p>
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  )
}
