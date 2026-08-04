'use client'

import React from 'react'
import PerfectGridNote from '../PerfectGridNote'

interface QtMonthlyCalendarPortraitProps {
  year?: number
  month?: number
  monthName?: string
  themeColor?: string
  pageWidth?: number
  pageHeight?: number
}

export default function QtMonthlyCalendarPortrait({
  year = 2026,
  month = 8,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 724,
  pageHeight = 1024,
}: QtMonthlyCalendarPortraitProps) {
  const dateObj = new Date(year, month - 1, 1)
  const firstDay = dateObj.getDay()
  const lastDate = new Date(year, month, 0).getDate()

  const daysOfWeek = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']

  const calendarCells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) {
    calendarCells.push(null)
  }
  for (let d = 1; d <= lastDate; d++) {
    calendarCells.push(d)
  }

  return (
    <div
      data-page-key="calendar"
      data-page-type="full-bleed"
      className="qt-page relative bg-white text-slate-800 flex flex-col justify-between overflow-hidden shadow-md mx-auto"
      style={{
        width: `${pageWidth}px`,
        height: `${pageHeight}px`,
        padding: '24px 28px',
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
          <span data-nav-target="calendar" className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-bold cursor-pointer">MONTHLY</span>
          <span data-nav-target="overview" className="hover:text-slate-600 cursor-pointer">OVERVIEW</span>
          {['W1', 'W2', 'W3', 'W4', 'W5'].map((w, idx) => (
            <span key={w} data-nav-target={`week-${idx + 1}`} className="hover:text-slate-600 cursor-pointer px-1 py-0.5">
              {w}
            </span>
          ))}
        </div>
      </div>

      {/* 2. Month Title Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-800 tracking-wide">{monthName} {year}</h1>
          <div className="h-1.5 w-36 rounded-full mt-1" style={{ backgroundColor: themeColor, opacity: 0.7 }} />
        </div>
        <div className="text-right text-xs text-slate-500 font-semibold">
          월간 QT 달력
        </div>
      </div>

      {/* 3. Top Banner: MEMO & GOALS (Full-width in Portrait) */}
      <div className="border border-slate-400 rounded-lg p-2.5 bg-slate-50/40 mb-3 shadow-2xs">
        <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center">
          <span className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: themeColor }} />
          MEMO & MONTHLY GOALS
        </div>
        <div className="h-12">
          <PerfectGridNote step={16} />
        </div>
      </div>

      {/* 4. Main 7-Column Calendar Grid (Taller Vertical Cells) */}
      <div className="flex-1 flex flex-col">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 text-center mb-1 text-[11px] font-bold text-slate-500 bg-slate-50 py-1.5 rounded border border-slate-400">
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
  )
}
