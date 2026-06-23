'use client'

import { useState } from 'react'
import { Calendar } from 'lucide-react'

export interface CalendarDay {
  date: string // 'YYYY-MM-DD'
  counts: {
    ai_analysis: number
    manual_sermon: number
    youtube: number
  }
  total: number
}

interface CalendarHeatmapProps {
  days: CalendarDay[]
  periodStart: string
  periodEnd: string
  loading?: boolean
}

function getIntensityClass(total: number, isToday: boolean, isFuture: boolean): string {
  if (isFuture) return 'bg-transparent'
  if (isToday) return 'bg-indigo-400 ring-2 ring-emerald-400/70'
  if (total === 0) return 'bg-white/[0.04]'
  if (total <= 2) return 'bg-indigo-500/40'
  if (total <= 5) return 'bg-indigo-500/70'
  return 'bg-indigo-500'
}

function formatKoreanDate(dateKey: string): string {
  // '2026-06-24' → '6월 24일'
  const [, m, d] = dateKey.split('-')
  return `${parseInt(m, 10)}월 ${parseInt(d, 10)}일`
}

function dayOfWeek(dateKey: string): string {
  // '2026-06-24' → '화' (예)
  const days = ['일', '월', '화', '수', '목', '금', '토']
  const [y, m, d] = dateKey.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return days[date.getDay()]
}

export default function CalendarHeatmap({ days, periodStart, periodEnd, loading }: CalendarHeatmapProps) {
  const [hovered, setHovered] = useState<{ index: number; x: number; y: number } | null>(null)

  if (loading) {
    return (
      <div className="px-1 py-2 animate-pulse">
        <div className="h-3 bg-white/5 rounded w-2/3 mb-2" />
        <div className="grid grid-cols-6 gap-1">
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} className="aspect-square bg-white/5 rounded-sm" />
          ))}
        </div>
      </div>
    )
  }

  if (!days || days.length === 0) {
    return null
  }

  // 최근 30일 (오래된 → 최신 순)
  // 가독성: 최신이 마지막, 6열 5행 = 30
  const displayDays = days.slice(-30)
  const today = days[days.length - 1]?.date

  const handleMouseEnter = (index: number, e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setHovered({
      index,
      x: rect.right + 8,
      y: rect.top,
    })
  }

  const handleMouseLeave = () => setHovered(null)

  const hoveredDay = hovered !== null ? displayDays[hovered.index] : null

  return (
    <div className="px-1 py-2">
      <div className="flex items-center justify-between mb-2 px-0.5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          30일 활동
        </p>
        <p className="text-[9px] text-slate-600 tabular-nums">
          D-{days.length - 1} ~ 오늘
        </p>
      </div>

      {/* 히트맵 그리드 — 6열 × 5행 */}
      <div className="grid grid-cols-6 gap-[3px]">
        {displayDays.map((day, i) => {
          const isToday = day.date === today
          const intensity = getIntensityClass(day.total, isToday, false)
          return (
            <div
              key={day.date}
              onMouseEnter={(e) => handleMouseEnter(i, e)}
              onMouseLeave={handleMouseLeave}
              className={`aspect-square rounded-sm transition-transform hover:scale-125 cursor-pointer ${intensity}`}
              title={`${formatKoreanDate(day.date)} (${dayOfWeek(day.date)}) · ${day.total}건`}
            />
          )
        })}
      </div>

      {/* 범례 */}
      <div className="flex items-center justify-end gap-1 mt-2 px-0.5">
        <span className="text-[9px] text-slate-600">적음</span>
        <div className="flex items-center gap-[2px]">
          <div className="w-2.5 h-2.5 rounded-sm bg-white/[0.04]" />
          <div className="w-2.5 h-2.5 rounded-sm bg-indigo-500/40" />
          <div className="w-2.5 h-2.5 rounded-sm bg-indigo-500/70" />
          <div className="w-2.5 h-2.5 rounded-sm bg-indigo-500" />
        </div>
        <span className="text-[9px] text-slate-600">많음</span>
        <div className="w-2.5 h-2.5 rounded-sm bg-indigo-400 ring-2 ring-emerald-400/70 ml-1" />
        <span className="text-[9px] text-emerald-400">오늘</span>
      </div>

      {/* 호버 툴팁 */}
      {hovered && hoveredDay && (
        <div
          className="fixed z-[100] px-2.5 py-2 rounded-lg bg-[#0a0e1a] border border-white/10 shadow-2xl pointer-events-none"
          style={{ left: hovered.x, top: hovered.y }}
        >
          <p className="text-[11px] font-bold text-white whitespace-nowrap">
            {formatKoreanDate(hoveredDay.date)}{' '}
            <span className="text-slate-500 font-normal">({dayOfWeek(hoveredDay.date)})</span>
          </p>
          {hoveredDay.total > 0 ? (
            <>
              <div className="mt-1.5 space-y-0.5 text-[10px]">
                {hoveredDay.counts.ai_analysis > 0 && (
                  <p className="flex items-center gap-1.5 text-purple-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    AI 분석 {hoveredDay.counts.ai_analysis}편
                  </p>
                )}
                {hoveredDay.counts.manual_sermon > 0 && (
                  <p className="flex items-center gap-1.5 text-cyan-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    설교 등록 {hoveredDay.counts.manual_sermon}편
                  </p>
                )}
                {hoveredDay.counts.youtube > 0 && (
                  <p className="flex items-center gap-1.5 text-rose-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    유튜브 {hoveredDay.counts.youtube}회
                  </p>
                )}
              </div>
              <p className="mt-1.5 pt-1.5 border-t border-white/5 text-[10px] text-slate-400">
                합계: <span className="font-bold text-white">{hoveredDay.total}건</span>
              </p>
            </>
          ) : (
            <p className="mt-1 text-[10px] text-slate-500">사용 없음</p>
          )}
        </div>
      )}
    </div>
  )
}
