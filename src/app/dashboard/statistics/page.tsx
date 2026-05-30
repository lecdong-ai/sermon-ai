'use client'

import { useMemo } from 'react'
import { useApp } from '@/lib/dashboard/store'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts'

export default function StatisticsPage() {
  const { state, getSermonsByTheme, getTheme } = useApp()
  const { sermons, themes, series } = state

  const totalSermons = sermons.length

  const yearData = useMemo(() => {
    const map = new Map<string, number>()
    for (const s of sermons) {
      const year = s.date.slice(0, 4)
      map.set(year, (map.get(year) || 0) + 1)
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([year, count]) => ({ name: `${year}년`, count }))
  }, [sermons])

  const monthData = useMemo(() => {
    const map = new Map<string, number>()
    for (const s of sermons) {
      const month = s.date.slice(0, 7)
      map.set(month, (map.get(month) || 0) + 1)
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, count]) => ({ name: month.slice(5), count }))
  }, [sermons])

  const bookData = useMemo(() => {
    const map = new Map<string, number>()
    for (const s of sermons) {
      map.set(s.bibleBook, (map.get(s.bibleBook) || 0) + 1)
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([book, count]) => ({ name: book, count }))
  }, [sermons])

  const themeData = useMemo(() => {
    const map = new Map<string, number>()
    for (const s of sermons) {
      for (const tid of s.themeIds) {
        const theme = themes.find((t) => t.id === tid)
        if (theme) map.set(theme.name, (map.get(theme.name) || 0) + 1)
      }
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }))
  }, [sermons, themes])

  const seasonData = useMemo(() => {
    const map = new Map<string, number>()
    for (const s of sermons) {
      if (s.season) map.set(s.season, (map.get(s.season) || 0) + 1)
    }
    return Array.from(map.entries()).map(([season, count]) => ({ name: season, count }))
  }, [sermons])

  const audienceData = useMemo(() => {
    const map = new Map<string, number>()
    for (const s of sermons) {
      map.set(s.audience, (map.get(s.audience) || 0) + 1)
    }
    return Array.from(map.entries()).map(([a, count]) => ({ name: a, count }))
  }, [sermons])

  const seriesData = useMemo(() => {
    return series.map((srs) => {
      const count = sermons.filter((s) => s.seriesId === srs.id).length
      return { name: srs.name, count }
    })
  }, [series, sermons])

  const COLORS = ['#2c5282', '#3182ce', '#63b3ed', '#c05621', '#dd6b20', '#ecc94b', '#38a169', '#805ad5', '#e53e3e', '#718096']

  const summaryCards = [
    { label: '전체 설교', value: totalSermons },
    { label: '사용 태그', value: themes.length },
    { label: '시리즈', value: series.length },
    { label: '설교자', value: new Set(sermons.map((s) => s.preacher)).size },
  ]

  return (
    <div className="animate-fade-in space-y-6 max-w-6xl">
      <h2 className="text-xl font-bold">통계 / 분석</h2>

      <div className="grid grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <div key={card.label} className="bg-surface border border-border rounded-lg p-5">
            <p className="text-xs text-muted">{card.label}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface border border-border rounded-lg p-5">
          <h3 className="text-sm font-semibold text-muted mb-4">연도별 설교 수</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={yearData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#718096' }} />
              <YAxis tick={{ fontSize: 11, fill: '#718096' }} />
              <Tooltip
                contentStyle={{
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="count" fill="#2c5282" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-surface border border-border rounded-lg p-5">
          <h3 className="text-sm font-semibold text-muted mb-4">월별 설교 수</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#718096' }} />
              <YAxis tick={{ fontSize: 11, fill: '#718096' }} />
              <Tooltip
                contentStyle={{
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Line type="monotone" dataKey="count" stroke="#2c5282" strokeWidth={2} dot={{ fill: '#2c5282' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-surface border border-border rounded-lg p-5">
          <h3 className="text-sm font-semibold text-muted mb-4">성경책별 설교 수</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={bookData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#718096' }} />
              <YAxis dataKey="name" type="category" width={60} tick={{ fontSize: 11, fill: '#718096' }} />
              <Tooltip
                contentStyle={{
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="count" fill="#3182ce" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-surface border border-border rounded-lg p-5">
          <h3 className="text-sm font-semibold text-muted mb-4">주제별 설교 수</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={themeData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#718096' }} />
              <YAxis dataKey="name" type="category" width={50} tick={{ fontSize: 11, fill: '#718096' }} />
              <Tooltip
                contentStyle={{
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="count" fill="#c05621" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-surface border border-border rounded-lg p-5">
          <h3 className="text-sm font-semibold text-muted mb-4">절기별 설교 수</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={seasonData}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={70}
                label={({ name, value }) => `${name} ${value}편`}
                labelLine={false}
              >
                {seasonData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-surface border border-border rounded-lg p-5">
          <h3 className="text-sm font-semibold text-muted mb-4">회중별 설교 수</h3>
          <div className="space-y-3">
            {audienceData.map((item, i) => (
              <div key={item.name} className="flex items-center gap-3">
                <span className="text-sm w-20 shrink-0">{item.name}</span>
                <div className="flex-1 h-5 bg-background rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(item.count / Math.max(...audienceData.map((d) => d.count))) * 100}%`,
                      backgroundColor: COLORS[i % COLORS.length],
                    }}
                  />
                </div>
                <span className="text-xs text-muted w-8 text-right">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface border border-border rounded-lg p-5">
          <h3 className="text-sm font-semibold text-muted mb-4">시리즈별 설교 수</h3>
          {seriesData.length > 0 ? (
            <div className="space-y-3">
              {seriesData.map((item, i) => (
                <div key={item.name} className="flex items-center gap-3">
                  <span className="text-sm flex-1 truncate">{item.name}</span>
                  <div className="flex-1 h-5 bg-background rounded-full overflow-hidden max-w-[200px]">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{
                        width: `${(item.count / Math.max(...seriesData.map((d) => d.count))) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted w-8 text-right">{item.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">등록된 시리즈가 없습니다</p>
          )}
        </div>

        <div className="bg-surface border border-border rounded-lg p-5">
          <h3 className="text-sm font-semibold text-muted mb-4">최근 많이 다룬 태그</h3>
          <div className="flex flex-wrap gap-2">
            {themeData.slice(0, 15).map((item) => (
              <span
                key={item.name}
                className="text-xs bg-primary/5 text-primary px-3 py-1.5 rounded-full"
                style={{
                  fontSize: `${Math.min(12 + item.count * 2, 16)}px`,
                  opacity: Math.min(0.5 + item.count * 0.15, 1),
                }}
              >
                {item.name} {item.count}
              </span>
            ))}
          </div>
          <h3 className="text-sm font-semibold text-muted mt-6 mb-2">상대적으로 적게 다룬 성경책</h3>
          <p className="text-xs text-muted leading-relaxed">
            {bookData.length < 3
              ? '데이터가 충분하지 않습니다'
              : bookData
                  .slice(-5)
                  .map((b) => b.name)
                  .join(', ')}
          </p>
          <h3 className="text-sm font-semibold text-muted mt-4 mb-2">상대적으로 적게 다룬 주제</h3>
          <p className="text-xs text-muted leading-relaxed">
            {themeData.length < 3
              ? '데이터가 충분하지 않습니다'
              : themeData
                  .slice(-5)
                  .map((t) => t.name)
                  .join(', ')}
          </p>
        </div>
      </div>
    </div>
  )
}
