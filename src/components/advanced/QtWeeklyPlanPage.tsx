import React from 'react'
import PerfectGridNote from './PerfectGridNote'
import { getHolidaysAndFestivals } from '@/lib/holidays'

interface QtWeeklyPlanPageProps {
  year?: number
  weekNum: number         // 예: 32
  weekLabel?: string      // 예: "01 WEEK" 또는 "WEEK 32"
  monthName?: string      // 예: "August"
  dateRangeText?: string  // 예: "08/03 - 08/09"
  themeColor?: string     // 기본: #B8C6D9
  daysInWeek?: { dayNum: number; dayName: string; dateStr: string }[]
  pageWidth?: number
  pageHeight?: number
}

const MONTH_MAP: Record<string, number> = {
  January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
  July: 7, August: 8, September: 9, October: 10, November: 11, December: 12
}

export default function QtWeeklyPlanPage({
  year = 2026,
  weekNum = 32,
  weekLabel = 'WEEK 32',
  monthName = 'August',
  dateRangeText = '08/03 - 08/09',
  themeColor = '#B8C6D9',
  daysInWeek,
  pageWidth = 1024,
  pageHeight = 768,
}: QtWeeklyPlanPageProps) {
  const monthNum = MONTH_MAP[monthName] || 8

  // 기본 7일 생성 (전달받지 않은 경우)
  const defaultDays = daysInWeek || [
    { dayNum: 3, dayName: 'SUN', dateStr: '08/03' },
    { dayNum: 4, dayName: 'MON', dateStr: '08/04' },
    { dayNum: 5, dayName: 'TUE', dateStr: '08/05' },
    { dayNum: 6, dayName: 'WED', dateStr: '08/06' },
    { dayNum: 7, dayName: 'THU', dateStr: '08/07' },
    { dayNum: 8, dayName: 'FRI', dateStr: '08/08' },
    { dayNum: 9, dayName: 'SAT', dateStr: '08/09' },
  ]

  const parseMonthDay = (dateStr?: string, defaultMonth: number = 8, dayNum: number = 1) => {
    if (dateStr) {
      const parts = dateStr.split('/')
      if (parts.length === 2) {
        const m = parseInt(parts[0], 10)
        const d = parseInt(parts[1], 10)
        if (!isNaN(m) && !isNaN(d)) return { m, d }
      }
    }
    return { m: defaultMonth, d: dayNum }
  }

  return (
    <div
      data-page-key={`week-${weekNum}`}
      data-week={weekNum}
      data-page-type="full-bleed"
      className="qt-page relative bg-white text-slate-800 flex flex-col justify-between overflow-hidden shadow-md mx-auto"
      style={{
        width: `${pageWidth}px`,
        height: `${pageHeight}px`,
        padding: '24px 32px',
        boxSizing: 'border-box',
        fontFamily: "'Noto Sans KR', 'Pretendard', sans-serif",
      }}
    >
      {/* 1. Header Navigation Bar */}
      <div className="flex items-center justify-between border-b border-slate-400 pb-2 mb-3">
        <div className="flex items-center space-x-3 text-[11px] font-medium tracking-wider text-slate-400">
          <span data-nav-target="calendar" className="cursor-pointer hover:text-slate-600">YEARLY</span>
          <span>{year}</span>
          <span data-nav-target="calendar" className="px-1.5 py-0.5 rounded text-white font-bold cursor-pointer" style={{ backgroundColor: themeColor }}>
            {monthName.toUpperCase().slice(0, 3)}
          </span>
        </div>

        <div className="flex items-center space-x-3 text-[11px] font-medium text-slate-400">
          <span data-nav-target="calendar" className="hover:text-slate-600 cursor-pointer">MONTHLY</span>
          <span data-nav-target="overview" className="hover:text-slate-600 cursor-pointer">OVERVIEW</span>
          {['W1', 'W2', 'W3', 'W4', 'W5'].map((w, idx) => (
            <span
              key={w}
              data-nav-target={`week-${idx + 1}`}
              className={`cursor-pointer px-1.5 py-0.5 rounded ${
                idx + 1 === weekNum
                  ? 'bg-slate-200 text-slate-800 font-bold'
                  : 'hover:text-slate-600'
              }`}
            >
              {w}
            </span>
          ))}
        </div>
      </div>

      {/* 2. Page Title Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-start space-x-3">
          <div
            className="px-3.5 py-1 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-2xs shrink-0 mt-0.5"
            style={{ backgroundColor: themeColor }}
          >
            {weekNum}주차
          </div>
          <div>
            <h2 className="text-2xl font-serif font-bold text-slate-800 tracking-wide leading-snug">{monthName} Weekly Plan</h2>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">{dateRangeText}</div>
          </div>
        </div>
        <div className="text-right text-xs text-slate-500 font-semibold">
          주간 성경 읽기 & 목표 수립
        </div>
      </div>

      {/* 3. Main Grid Layout (diary.pdf 20쪽 2x4 박스 구조) */}
      <div className="grid grid-cols-4 gap-3 flex-1">
        {/* Box 1: WEEKLY PLAN (주간 종합 계획) */}
        <div className="border border-slate-400 rounded-lg p-3 bg-slate-50/40 flex flex-col justify-between shadow-2xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center">
            <span className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: themeColor }} />
            WEEKLY PLAN
          </h3>
          <div className="space-y-2 text-[11px] text-slate-500 flex-1">
            <div className="border-b border-slate-300 pb-1">
              <span className="font-semibold text-slate-400">주간 큐티 주제:</span>
            </div>
            <div className="border-b border-slate-300 pb-1">
              <span className="font-semibold text-slate-400">주간 목표 (Goals):</span>
            </div>
          </div>
        </div>

        {/* Boxes 2~8: 7 Days (SUN ~ SAT) */}
        {defaultDays.map((d, i) => {
          const isSun = d.dayName === 'SUN'
          const isSat = d.dayName === 'SAT'
          const { m, d: parsedDay } = parseMonthDay(d.dateStr, monthNum, d.dayNum)
          const holidays = getHolidaysAndFestivals(year, m, parsedDay)
          const hasRedDay = isSun || holidays.some(h => h.isRedDay)

          return (
            <div
              key={d.dayNum}
              className="border border-slate-400 rounded-lg p-2.5 bg-white flex flex-col justify-between shadow-2xs relative"
            >
              {/* Day Header */}
              <div className="border-b border-slate-300 pb-1 mb-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-600 uppercase">{d.dayName}</span>
                  <span
                    data-nav-target={`day-${d.dayNum}`}
                    data-jump-btn="true"
                    className={`text-xs font-serif font-bold px-1 py-0.5 rounded hover:bg-slate-200 cursor-pointer transition-colors ${
                      hasRedDay ? 'text-rose-500' : isSat ? 'text-blue-600' : 'text-slate-800'
                    }`}
                  >
                    {String(d.dayNum).padStart(2, '0')}
                  </span>
                </div>
                {/* 공휴일 및 기독교 절기 라벨 */}
                {holidays.length > 0 && (
                  <div className="flex flex-wrap gap-0.5 mt-0.5">
                    {holidays.map((h, hIdx) => (
                      <span
                        key={hIdx}
                        className={`text-[8px] font-extrabold px-1 py-0.2 rounded truncate leading-tight tracking-tight ${
                          h.isRedDay
                            ? 'bg-rose-100 text-rose-700 border border-rose-300/60'
                            : h.type === 'christian'
                            ? 'bg-indigo-100 text-indigo-800 border border-indigo-300/60'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-300/60'
                        }`}
                        title={h.name}
                      >
                        {h.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Upper Blank Note Area */}
              <div className="h-10 mb-1.5" />

              {/* Lower Grid Note Area */}
              <div className="flex-1">
                <PerfectGridNote step={12} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
