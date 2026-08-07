'use client'

import React from 'react'
import PerfectGridNote from '../PerfectGridNote'
import { getHolidaysAndFestivals } from '@/lib/holidays'

interface QtMonthlyCalendarPortraitProps {
  year: number
  month: number
  monthName?: string
  themeColor?: string
  daysInMonth?: number
  startDayOfWeek?: number
  pageWidth?: number
  pageHeight?: number
}

export default function QtMonthlyCalendarPortrait({
  year = 2026,
  month = 8,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 1448,
}: QtMonthlyCalendarPortraitProps) {
  const dateObj = new Date(year, month - 1, 1)
  const firstDay = dateObj.getDay()
  const lastDate = new Date(year, month, 0).getDate()

  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

  const calendarCells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) {
    calendarCells.push(null)
  }
  for (let d = 1; d <= lastDate; d++) {
    calendarCells.push(d)
  }

  return (
    <div
      data-page-key="calendar-portrait"
      data-page-type="full-bleed"
      className="qt-page relative bg-white text-slate-800 flex flex-col justify-between overflow-hidden shadow-md mx-auto"
      style={{
        width: `${pageWidth}px`,
        height: `${pageHeight}px`,
        padding: '36px 44px',
        boxSizing: 'border-box',
        fontFamily: "'Noto Sans KR', 'Pretendard', sans-serif",
      }}
    >
      {/* 1. Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-300 pb-3 mb-3">
        <div className="flex items-center space-x-4 text-xs font-medium tracking-wider text-slate-400 font-mono">
          <span>YEARLY</span>
          <span>{year}</span>
          <span className="px-2.5 py-0.5 rounded text-white font-bold" style={{ backgroundColor: themeColor }}>
            {monthName.toUpperCase().slice(0, 3)}
          </span>
        </div>
        <span className="px-3 py-1 rounded-full bg-slate-900 text-white font-bold text-xs shadow-xs">
          📅 MONTHLY PLANNER
        </span>
      </div>

      {/* 2. Month Header & Monthly Verse */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-4xl font-serif font-bold text-slate-900 tracking-wide">{monthName}</h1>
          <p className="text-xs text-slate-500 mt-1">{year}년 {month}월 비전 & 은혜 플래너</p>
        </div>

        <div className="bg-gradient-to-r from-amber-50/80 via-rose-50/40 to-amber-50/80 border border-amber-200/90 rounded-xl px-4 py-2 text-right shadow-xs">
          <span className="text-[9px] font-bold text-amber-800 uppercase block font-mono">MONTHLY SCRIPTURE</span>
          <span className="text-xs font-serif font-semibold text-slate-800">
            &quot;여호와는 나의 목자시니 내게 부족함이 없으리로다 (시편 23:1)&quot;
          </span>
        </div>
      </div>

      {/* 3. Top Focus & Habits Bar */}
      <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
        {/* Priority Goals */}
        <div className="border border-slate-200 rounded-xl p-2.5 bg-slate-50/50 space-y-1">
          <div className="font-bold text-slate-800 font-serif flex items-center justify-between border-b border-slate-200 pb-0.5">
            <span>🎯 이달의 3대 핵심 목표</span>
            <span className="font-mono text-[10px] text-slate-400">Goals</span>
          </div>
          <div className="space-y-1 text-xs text-slate-600 font-serif pt-0.5">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded border border-slate-400 inline-block"></span>
              <span>1. _________________________________</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded border border-slate-400 inline-block"></span>
              <span>2. _________________________________</span>
            </div>
          </div>
        </div>

        {/* Spiritual Habits */}
        <div className="border border-indigo-100 rounded-xl p-2.5 bg-indigo-50/20 space-y-1">
          <div className="font-bold text-indigo-950 font-serif flex items-center justify-between border-b border-indigo-200 pb-0.5">
            <span>✨ 영적 수련 & 습관 체크</span>
            <span className="font-mono text-[10px] text-indigo-600">Disciplines</span>
          </div>
          <div className="space-y-1 text-xs text-slate-600 font-serif pt-0.5">
            <div className="flex justify-between items-center">
              <span>📖 매일 말씀 QT & 기도</span>
              <span className="font-mono text-indigo-700">□ □ □ □ □</span>
            </div>
            <div className="flex justify-between items-center">
              <span>💖 하루 3감사 노트</span>
              <span className="font-mono text-indigo-700">□ □ □ □ □</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Calendar Grid */}
      <div className="flex-1 flex flex-col justify-between mb-3">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1.5 text-center mb-1 text-xs font-bold text-slate-600 bg-slate-100/80 py-1.5 rounded-lg border border-slate-300 font-serif">
          {daysOfWeek.map((d, i) => (
            <span key={d} className={i === 0 ? 'text-rose-600' : i === 6 ? 'text-blue-600' : ''}>
              {d}
            </span>
          ))}
        </div>

        {/* Cells */}
        <div className="grid grid-cols-7 gap-1.5 flex-1">
          {calendarCells.map((dayNum, idx) => {
            const colIdx = idx % 7
            const isSun = colIdx === 0
            const isSat = colIdx === 6
            const holidays = dayNum ? getHolidaysAndFestivals(year, month, dayNum) : []
            const hasRedDay = isSun || holidays.some((h) => h.isRedDay)

            return (
              <div
                key={idx}
                className={`border rounded-xl p-1.5 flex flex-col justify-between transition-all relative overflow-hidden ${
                  dayNum
                    ? 'border-slate-300 bg-white hover:border-slate-400 hover:shadow-xs'
                    : 'border-slate-200/50 bg-slate-50/40 opacity-30'
                }`}
              >
                {dayNum ? (
                  <>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-0.5">
                      <span
                        data-nav-target={`day-${dayNum}`}
                        data-jump-btn="true"
                        className={`text-xs font-bold font-serif px-1 py-0.2 rounded hover:bg-slate-100 cursor-pointer transition-colors ${
                          hasRedDay ? 'text-rose-600' : isSat ? 'text-blue-600' : 'text-slate-800'
                        }`}
                      >
                        {dayNum}
                      </span>
                      <span className="text-[9px] font-mono text-slate-300">Q/P</span>
                    </div>

                    {holidays.length > 0 && (
                      <div className="flex flex-col gap-0.5 mt-1">
                        {holidays.map((h, hIdx) => (
                          <div
                            key={hIdx}
                            className={`text-[9px] font-extrabold px-1 py-0.2 rounded truncate leading-tight tracking-tight ${
                              h.isRedDay
                                ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                : h.type === 'christian'
                                ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}
                            title={h.name}
                          >
                            {h.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : null}
              </div>
            )
          })}
        </div>
      </div>

      {/* 5. Footer */}
      <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-300">
        <span>PREMIUM DIARY STUDIO — MONTHLY CALENDAR MASTER</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
