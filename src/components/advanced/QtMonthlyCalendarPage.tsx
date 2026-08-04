'use client'

import React from 'react'
import PerfectGridNote from './PerfectGridNote'

interface QtMonthlyCalendarPageProps {
  year: number         // 예: 2026
  month: number        // 예: 8 (1-based)
  monthName?: string   // 예: "August"
  themeColor?: string // 수채화 파스텔 테마 색상 (기본: #B8C6D9)
  daysInMonth?: number
  startDayOfWeek?: number // 0 = Sunday, 6 = Saturday
  pageWidth?: number   // px 단위 (기본: 1024)
  pageHeight?: number  // px 단위 (기본: 768)
}

export default function QtMonthlyCalendarPage({
  year = 2026,
  month = 8,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 768,
}: QtMonthlyCalendarPageProps) {
  // 2026년 8월 기준 계산 (기본값)
  const dateObj = new Date(year, month - 1, 1)
  const firstDay = dateObj.getDay() // 0 = Sunday
  const lastDate = new Date(year, month, 0).getDate() // 31일

  const daysOfWeek = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']

  // 5~6주 달력 그리드 일자 배열 구성
  const calendarCells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) {
    calendarCells.push(null)
  }
  for (let d = 1; d <= lastDate; d++) {
    calendarCells.push(d)
  }

  const totalWeeks = Math.ceil(calendarCells.length / 7)

  return (
    <div
      data-page-key="calendar"
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
      <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
        <div className="flex items-center space-x-3 text-[11px] font-medium tracking-wider text-slate-400">
          <span data-nav-target="calendar" className="cursor-pointer hover:text-slate-600">YEARLY</span>
          <span>{year}</span>
          <span data-nav-target="calendar" className="px-1.5 py-0.5 rounded text-white font-bold cursor-pointer" style={{ backgroundColor: themeColor }}>
            {monthName.toUpperCase().slice(0, 3)}
          </span>
        </div>

        <div className="flex items-center space-x-3 text-[11px] font-medium text-slate-400">
          <span data-nav-target="calendar" className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-bold cursor-pointer">MONTHLY</span>
          <span data-nav-target="overview" className="hover:text-slate-600 cursor-pointer">OVERVIEW</span>
          {Array.from({ length: totalWeeks }).map((_, wIdx) => (
            <span key={wIdx} data-nav-target={`week-${wIdx + 1}`} className="hover:text-slate-600 cursor-pointer px-1 py-0.5">
              W{wIdx + 1}
            </span>
          ))}
        </div>
      </div>

      {/* 2. Month Header Title */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-800 tracking-wide">{monthName}</h1>
          <div className="h-1.5 w-32 rounded-full mt-1" style={{ backgroundColor: themeColor, opacity: 0.7 }} />
        </div>
        <div className="text-right text-xs text-slate-400">
          <span className="font-semibold text-slate-600">{year}년 {month}월</span> 월간 달력
        </div>
      </div>

      {/* 3. Main Content: Left Memo + Main Calendar Grid */}
      <div className="grid grid-cols-12 gap-4 flex-1">
        {/* Left Side Memo Zone (3 cols) */}
        <div className="col-span-3 flex flex-col pr-2 border-r border-slate-300">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center">
            <span className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: themeColor }} />
            MEMO & GOALS
          </div>
          <div className="flex-1">
            <PerfectGridNote step={16} />
          </div>
        </div>

        {/* Right Side 7-Column Calendar Grid (9 cols) */}
        <div className="col-span-9 flex flex-col">
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1 text-[11px] font-bold text-slate-500 bg-slate-50 py-1 rounded border border-slate-400">
            {daysOfWeek.map((d, i) => (
              <span key={d} className={i === 0 ? 'text-rose-500' : i === 6 ? 'text-blue-500' : ''}>
                {d}
              </span>
            ))}
          </div>

          {/* Calendar Cell Grid */}
          <div className="grid grid-cols-7 gap-1 flex-1">
            {calendarCells.map((dayNum, idx) => {
              const colIdx = idx % 7
              const isSun = colIdx === 0
              const isSat = colIdx === 6

              return (
                <div
                  key={idx}
                  data-day={dayNum || undefined}
                  data-nav-target={dayNum ? `day-${dayNum}` : undefined}
                  className={`border rounded-md p-1.5 flex flex-col justify-between transition-colors relative ${
                    dayNum
                      ? 'border-slate-400 bg-white hover:bg-slate-50 cursor-pointer shadow-2xs'
                      : 'border-slate-300 bg-slate-50/30 opacity-40'
                  }`}
                >
                  {dayNum && (
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold font-serif ${
                          isSun ? 'text-rose-500' : isSat ? 'text-blue-600' : 'text-slate-700'
                        }`}
                      >
                        {dayNum}
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
