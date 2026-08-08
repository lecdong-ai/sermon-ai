'use client'

import React from 'react'
import PerfectGridNote from './PerfectGridNote'
import { getHolidaysAndFestivals } from '@/lib/holidays'

interface QtWeeklyPlanPageProps {
  year?: number
  weekNum?: number         // 예: 32
  weekLabel?: string      // 예: "01 WEEK" 또는 "WEEK 32"
  monthName?: string      // 예: "August"
  dateRangeText?: string  // 예: "08/03 - 08/09"
  themeColor?: string     // 기본: #B8C6D9
  daysInWeek?: { dayNum: number; dayName: string; dateStr: string }[]
  pageWidth?: number
  pageHeight?: number
  isGeneralMode?: boolean
}

const MONTH_MAP: Record<string, number> = {
  January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
  July: 7, August: 8, September: 9, October: 10, November: 11, December: 12,
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
  isGeneralMode = false,
}: QtWeeklyPlanPageProps) {
  const monthNum = MONTH_MAP[monthName] || 8

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
      <div className="flex items-center justify-between border-b border-slate-300 pb-2 mb-2">
        <div className="flex items-center space-x-3 text-[11px] font-medium tracking-wider text-slate-400 font-mono">
          <span data-nav-target="calendar" className="cursor-pointer hover:text-slate-600">YEARLY</span>
          <span>{year}</span>
          <span data-nav-target="calendar" className="px-2 py-0.5 rounded text-white font-bold cursor-pointer" style={{ backgroundColor: themeColor }}>
            {monthName.toUpperCase().slice(0, 3)}
          </span>
        </div>

        <div className="flex items-center space-x-3 text-[11px] font-medium text-slate-400 font-mono">
          <span data-nav-target="calendar" className="hover:text-slate-600 cursor-pointer">MONTHLY</span>
          <span data-nav-target="overview" className="hover:text-slate-600 cursor-pointer">OVERVIEW</span>
          {['W1', 'W2', 'W3', 'W4', 'W5'].map((w, idx) => (
            <span
              key={w}
              data-nav-target={`week-${idx + 1}`}
              className={`cursor-pointer px-1.5 py-0.5 rounded ${
                idx + 1 === weekNum
                  ? 'bg-slate-800 text-white font-bold shadow-2xs'
                  : 'hover:text-slate-600'
              }`}
            >
              {w}
            </span>
          ))}
        </div>
      </div>

      {/* 2. Page Title Header & Weekly Inspiration Banner */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="flex items-center gap-2.5">
            <div
              className="px-2.5 py-0.5 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-2xs shrink-0 font-mono"
              style={{ backgroundColor: themeColor }}
            >
              WEEK {weekNum}
            </div>
            <h2 className="text-xl font-serif font-bold text-slate-900 tracking-wide leading-none">{monthName} Weekly Plan</h2>
          </div>
          <div className="text-[10.5px] text-slate-400 font-mono font-medium mt-1">{dateRangeText}</div>
        </div>

        {/* Weekly Focus Banner (General vs Church) */}
        <div className={`border rounded-xl px-3 py-1 text-right shadow-2xs ${
          isGeneralMode
            ? 'bg-gradient-to-r from-emerald-50/80 via-teal-50/40 to-emerald-50/80 border-emerald-200'
            : 'bg-gradient-to-r from-indigo-50/80 via-purple-50/40 to-indigo-50/80 border-indigo-200'
        }`}>
          <span className={`text-[8px] font-bold uppercase block font-mono ${isGeneralMode ? 'text-emerald-800' : 'text-indigo-800'}`}>
            {isGeneralMode ? 'WEEKLY FOCUS & COMPASS' : 'WEEKLY SCRIPTURE & PRAYER'}
          </span>
          <span className="text-[10px] font-serif font-semibold text-slate-800">
            {isGeneralMode
              ? '🎯 "이번 주 핵심 목표: 우선순위에 집중하고 흔들림 없이 성취하라"'
              : '📖 "내 발의 등등이요 내 길에 빛이니이다 (시편 119:105)"'
            }
          </span>
        </div>
      </div>

      {/* 3. Main Grid Layout (2x4 Master Grid: 1 Control Box + 7 Days) */}
      <div className="grid grid-cols-4 gap-3 flex-1 mb-2">
        {/* Box 1: WEEKLY MASTER CONTROL */}
        <div className="border border-slate-300 rounded-xl p-2.5 bg-slate-50/60 flex flex-col justify-between shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between border-b border-slate-300 pb-1 text-[9.5px]">
            <span className="font-bold text-slate-800 font-serif">🎯 WEEKLY CONTROL</span>
            <span className="font-mono text-[8px] text-slate-400">Master</span>
          </div>

          {/* Top 3 Weekly Priorities */}
          <div className="space-y-1 text-[8.5px] font-serif text-slate-600">
            <span className="font-bold text-slate-800 text-[8px] block">📌 이주의 3대 핵심 우선순위:</span>
            <div className="bg-white p-1 rounded-lg border border-slate-200 space-y-0.5">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 border border-slate-400 rounded-xs inline-block"></span>
                <span>1. __________________</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 border border-slate-400 rounded-xs inline-block"></span>
                <span>2. __________________</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 border border-slate-400 rounded-xs inline-block"></span>
                <span>3. __________________</span>
              </div>
            </div>
          </div>

          {/* Habit Dots Bar */}
          <div className="bg-white p-1.5 rounded-lg border border-slate-200 text-[8px] font-serif space-y-1">
            <span className="font-bold text-slate-700 text-[7.5px] block">{isGeneralMode ? '✨ 갓생 습관 7일 체크:' : '✨ 영적 수련 7일 체크:'}</span>
            <div className="flex justify-between items-center text-[7.5px] font-mono text-slate-400 px-1">
              <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
            </div>
            <div className="flex justify-between items-center text-[7.5px] font-mono text-slate-600 px-1">
              <span>○</span><span>○</span><span>○</span><span>○</span><span>○</span><span>○</span><span>○</span>
            </div>
          </div>

          {/* Weekly Reflection Line */}
          <div className="bg-white p-1.5 rounded-lg border border-slate-200 text-[8px] font-serif text-slate-500">
            <span className="font-bold text-slate-700 text-[7.5px] block">💖 이주의 감사 & 성찰:</span>
            <div className="min-h-[14px]">______________________</div>
          </div>
        </div>

        {/* Boxes 2~8: 7 Days (SUN ~ SAT) */}
        {defaultDays.map((d) => {
          const isSun = d.dayName === 'SUN'
          const isSat = d.dayName === 'SAT'
          const { m, d: parsedDay } = parseMonthDay(d.dateStr, monthNum, d.dayNum)
          const holidays = getHolidaysAndFestivals(year, m, parsedDay)
          const hasRedDay = isSun || holidays.some((h) => h.isRedDay)

          return (
            <div
              key={d.dayNum}
              className="border border-slate-300 rounded-xl p-2 bg-white flex flex-col justify-between shadow-2xs hover:border-slate-400 transition-colors relative"
            >
              {/* Day Header */}
              <div className="border-b border-slate-200 pb-1 mb-1">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-extrabold uppercase font-mono ${
                    isSun ? 'text-rose-600' : isSat ? 'text-blue-600' : 'text-slate-700'
                  }`}>
                    {d.dayName}
                  </span>
                  <span
                    data-nav-target={`day-${d.dayNum}`}
                    data-jump-btn="true"
                    className={`text-[11px] font-serif font-bold px-1.5 py-0.2 rounded hover:bg-slate-100 cursor-pointer transition-colors ${
                      hasRedDay ? 'text-rose-600' : isSat ? 'text-blue-600' : 'text-slate-800'
                    }`}
                  >
                    {String(d.dayNum).padStart(2, '0')}
                  </span>
                </div>

                {/* Holidays & Festivals */}
                {holidays.length > 0 && (
                  <div className="flex flex-wrap gap-0.5 mt-0.5">
                    {holidays.map((h, hIdx) => {
                      const isChristianTag = !isGeneralMode && h.type === 'christian'
                      return (
                        <span
                          key={hIdx}
                          className={`text-[7.5px] font-extrabold px-1 py-0.2 rounded truncate leading-tight tracking-tight ${
                            h.isRedDay
                              ? 'bg-rose-100 text-rose-700 border border-rose-200'
                              : isChristianTag
                              ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                          title={h.name}
                        >
                          {h.name}
                        </span>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Day Key Schedule / Scripture */}
              <div className="bg-slate-50 p-1 rounded-lg border border-slate-200 mb-1 text-[8px] font-serif">
                <span className="font-bold text-slate-600 text-[7.5px] block">
                  {isGeneralMode ? '📌 주요 일정:' : '📖 묵상 본문:'}
                </span>
                <div className="text-slate-400 min-h-[10px]">__________________</div>
              </div>

              {/* 3 Day Tasks */}
              <div className="space-y-0.5 mb-1 text-[8px] font-serif">
                {[1, 2, 3].map((tNo) => (
                  <div key={tNo} className="flex items-center">
                    <div className="w-2.5 h-2.5 border border-slate-300 rounded-xs bg-white mr-1 flex-shrink-0" />
                    <div className="flex-1 border-b border-slate-200 h-2.5 text-slate-400">________</div>
                  </div>
                ))}
              </div>

              {/* Lower Perfect Grid Note */}
              <div className="flex-1 border border-slate-200 rounded-lg p-0.5 bg-white min-h-[50px]">
                <PerfectGridNote step={11} />
              </div>
            </div>
          )
        })}
      </div>

      {/* 4. Footer */}
      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1.5 border-t border-slate-200">
        <span>PREMIUM DIARY STUDIO — WEEKLY PLAN MASTER</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
