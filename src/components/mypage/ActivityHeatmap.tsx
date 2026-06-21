'use client'

import { useMemo } from 'react'

interface ActivityHeatmapProps {
  activities: string[]
  weeks?: number
  title?: string
}

export default function ActivityHeatmap({ activities, weeks = 52, title = '사역 활동' }: ActivityHeatmapProps) {
  const { grid, monthLabels, totalCount, maxCount, startDate, endDate } = useMemo(() => {
    const counts = new Map<string, number>()
    for (const iso of activities) {
      if (!iso) continue
      const d = new Date(iso)
      if (isNaN(d.getTime())) continue
      const key = d.toISOString().slice(0, 10)
      counts.set(key, (counts.get(key) || 0) + 1)
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dayOfWeek = today.getDay()
    const endOfWeek = new Date(today)
    endOfWeek.setDate(today.getDate() + (6 - dayOfWeek))

    const startOfPeriod = new Date(endOfWeek)
    startOfPeriod.setDate(endOfWeek.getDate() - (weeks * 7) + 1)

    let max = 0
    for (const v of Array.from(counts.values())) max = Math.max(max, v)

    const grid: { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }[][] = []
    const monthLabels: { week: number; label: string }[] = []
    let lastMonth = -1

    for (let w = 0; w < weeks; w++) {
      const column: { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }[] = []
      for (let d = 0; d < 7; d++) {
        const date = new Date(startOfPeriod)
        date.setDate(startOfPeriod.getDate() + w * 7 + d)
        const key = date.toISOString().slice(0, 10)
        const count = counts.get(key) || 0
        const level: 0 | 1 | 2 | 3 | 4 =
          count === 0 ? 0 : count >= max * 0.75 ? 4 : count >= max * 0.5 ? 3 : count >= max * 0.25 ? 2 : 1

        column.push({ date: key, count, level })
        if (d === 0 && date.getMonth() !== lastMonth) {
          lastMonth = date.getMonth()
          monthLabels.push({ week: w, label: `${date.getMonth() + 1}월` })
        }
      }
      grid.push(column)
    }

    return {
      grid,
      monthLabels,
      totalCount: activities.length,
      maxCount: max,
      startDate: startOfPeriod.toISOString().slice(0, 10),
      endDate: endOfWeek.toISOString().slice(0, 10),
    }
  }, [activities, weeks])

  const dayLabels = ['일', '월', '화', '수', '목', '금', '토']
  const levelColor = [
    'bg-white/[0.04] border border-white/[0.06]',
    'bg-emerald-900/40 border border-emerald-700/30',
    'bg-emerald-700/60 border border-emerald-600/40',
    'bg-emerald-500/80 border border-emerald-400/50',
    'bg-emerald-400 border border-emerald-300/60',
  ]

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] backdrop-blur-sm p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h3 className="text-[11px] uppercase tracking-[0.2em] text-slate-500 font-semibold">{title}</h3>
          <p className="text-[12px] text-slate-400 mt-1.5">
            최근 1년간 <span className="text-white font-bold">{totalCount}회</span>의 사역 활동
            {maxCount > 0 && <span className="text-slate-600"> · 하루 최대 {maxCount}회</span>}
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
          <span>적음</span>
          {[0, 1, 2, 3, 4].map((l) => (
            <div key={l} className={`w-2.5 h-2.5 rounded-sm ${levelColor[l].split(' ')[0]}`} />
          ))}
          <span>많음</span>
        </div>
      </div>

      <div className="overflow-x-auto pb-2 -mx-1 px-1">
        <div className="inline-block">
          <div className="flex gap-[3px] mb-1.5 pl-7">
            {monthLabels.map((m, i) => {
              const prevWeek = i > 0 ? monthLabels[i - 1].week : 0
              const offset = m.week - prevWeek
              return (
                <div
                  key={i}
                  className="text-[10px] text-slate-500 font-medium"
                  style={{ width: `${offset * 13}px`, minWidth: '20px' }}
                >
                  {m.label}
                </div>
              )
            })}
          </div>

          <div className="flex">
            <div className="flex flex-col gap-[3px] mr-1.5 pt-0">
              {dayLabels.map((d, i) => (
                <div key={i} className="h-[10px] text-[9px] text-slate-500 font-medium w-5 leading-[10px] text-right pr-1">
                  {i % 2 === 1 ? d : ''}
                </div>
              ))}
            </div>

            <div className="flex gap-[3px]">
              {grid.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[3px]">
                  {week.map((day, di) => {
                    const isToday = day.date === new Date().toISOString().slice(0, 10)
                    return (
                      <div
                        key={di}
                        className={`w-[10px] h-[10px] rounded-sm ${levelColor[day.level]} ${
                          isToday ? 'ring-1 ring-white/40' : ''
                        } hover:ring-1 hover:ring-white/30 transition-all cursor-pointer`}
                        title={`${day.date}: ${day.count}회`}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 text-[10px] text-slate-600">
        {startDate} ~ {endDate}
      </div>
    </div>
  )
}
