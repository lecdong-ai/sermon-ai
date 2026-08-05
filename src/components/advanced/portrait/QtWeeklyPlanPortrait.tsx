'use client'

import React from 'react'
import PerfectGridNote from '../PerfectGridNote'

interface QtWeeklyPlanPortraitProps {
  weekNum: number
  weekLabel?: string
  monthName?: string
  dateRangeText?: string
  themeColor?: string
  daysInWeek?: { dayNum: number; dayName: string; dateStr: string }[]
  pageWidth?: number
  pageHeight?: number
}

export default function QtWeeklyPlanPortrait({
  weekNum = 32,
  weekLabel = 'WEEK 32',
  monthName = 'August',
  dateRangeText = '08/03 - 08/09',
  themeColor = '#B8C6D9',
  daysInWeek,
  pageWidth = 724,
  pageHeight = 1024,
}: QtWeeklyPlanPortraitProps) {
  const defaultDays = daysInWeek || [
    { dayNum: 3, dayName: 'SUN', dateStr: '08/03' },
    { dayNum: 4, dayName: 'MON', dateStr: '08/04' },
    { dayNum: 5, dayName: 'TUE', dateStr: '08/05' },
    { dayNum: 6, dayName: 'WED', dateStr: '08/06' },
    { dayNum: 7, dayName: 'THU', dateStr: '08/07' },
    { dayNum: 8, dayName: 'FRI', dateStr: '08/08' },
    { dayNum: 9, dayName: 'SAT', dateStr: '08/09' },
  ]

  const leftDays = defaultDays.slice(0, 4) // SUN, MON, TUE, WED
  const rightDays = defaultDays.slice(4)  // THU, FRI, SAT

  return (
    <div
      data-page-key={`week-${weekNum}`}
      data-week={weekNum}
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
          <span>2026</span>
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
                idx + 1 === weekNum ? 'bg-slate-200 text-slate-800 font-bold' : 'hover:text-slate-600'
              }`}
            >
              {w}
            </span>
          ))}
        </div>
      </div>

      {/* 2. Page Title Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div
            className="px-3 py-1 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-2xs shrink-0"
            style={{ backgroundColor: themeColor }}
          >
            {weekNum}주차
          </div>
          <div>
            <h2 className="text-2xl font-serif font-bold text-slate-800 tracking-wide">{monthName} Weekly Plan ({weekNum}주차)</h2>
            <div className="text-[11px] text-slate-400 font-medium">{dateRangeText}</div>
          </div>
        </div>
        <div className="text-right text-xs text-slate-500 font-semibold">
          주간 성경 읽기 & 목표 수립
        </div>
      </div>

      {/* 3. Upper Full-Width Box: WEEKLY PLAN */}
      <div className="border border-slate-400 rounded-lg p-3 bg-slate-50/40 mb-3 shadow-2xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center">
          <span className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: themeColor }} />
          WEEKLY PLAN & GOALS
        </h3>
        <div className="grid grid-cols-2 gap-3 text-[11px]">
          <div className="border-b border-slate-300 pb-1">
            <span className="font-semibold text-slate-500">주간 큐티 주제:</span>
            <div className="h-6" />
          </div>
          <div className="border-b border-slate-300 pb-1">
            <span className="font-semibold text-slate-500">주간 핵심 목표 (Goals):</span>
            <div className="h-6" />
          </div>
        </div>
      </div>

      {/* 4. Main 2-Column Vertical Grid Layout (Left: 4 Days / Right: 3 Days + Notes) */}
      <div className="grid grid-cols-2 gap-3 flex-1">
        {/* Left Column (SUN ~ WED) */}
        <div className="flex flex-col space-y-2.5 flex-1">
          {leftDays.map((d) => {
            const isSun = d.dayName === 'SUN'
            return (
              <div
                key={d.dayNum}
                data-day={d.dayNum}
                data-nav-target={`day-${d.dayNum}`}
                className="border border-slate-400 rounded-lg p-2.5 bg-white flex-1 flex flex-col justify-between shadow-2xs hover:border-slate-500 cursor-pointer"
              >
                <div className="flex items-center justify-between border-b border-slate-300 pb-1 mb-1">
                  <span className="text-[11px] font-bold text-slate-600 uppercase">{d.dayName}</span>
                  <span className={`text-xs font-serif font-bold ${isSun ? 'text-rose-500' : 'text-slate-800'}`}>
                    {String(d.dayNum).padStart(2, '0')}
                  </span>
                </div>
                <div className="flex-1">
                  <PerfectGridNote step={12} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Right Column (THU ~ SAT + WEEKLY NOTES) */}
        <div className="flex flex-col space-y-2.5 flex-1">
          {rightDays.map((d) => {
            const isSat = d.dayName === 'SAT'
            return (
              <div
                key={d.dayNum}
                data-day={d.dayNum}
                data-nav-target={`day-${d.dayNum}`}
                className="border border-slate-400 rounded-lg p-2.5 bg-white flex-1 flex flex-col justify-between shadow-2xs hover:border-slate-500 cursor-pointer"
              >
                <div className="flex items-center justify-between border-b border-slate-300 pb-1 mb-1">
                  <span className="text-[11px] font-bold text-slate-600 uppercase">{d.dayName}</span>
                  <span className={`text-xs font-serif font-bold ${isSat ? 'text-blue-600' : 'text-slate-800'}`}>
                    {String(d.dayNum).padStart(2, '0')}
                  </span>
                </div>
                <div className="flex-1">
                  <PerfectGridNote step={12} />
                </div>
              </div>
            )
          })}

          {/* Box 8: WEEKLY NOTES */}
          <div className="border border-slate-400 rounded-lg p-2.5 bg-slate-50/30 flex-1 flex flex-col justify-between shadow-2xs">
            <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: themeColor }} />
              WEEKLY NOTES
            </div>
            <div className="flex-1">
              <PerfectGridNote step={12} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
