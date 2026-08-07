'use client'

import React from 'react'
import PerfectGridNote from '../PerfectGridNote'
import { getHolidaysAndFestivals } from '@/lib/holidays'

interface QtWeeklyPlanPortraitProps {
  year?: number
  weekNum?: number
  weekLabel?: string
  monthName?: string
  dateRangeText?: string
  themeColor?: string
  daysInWeek?: { dayNum: number; dayName: string; dateStr: string }[]
  pageWidth?: number
  pageHeight?: number
  isGeneralMode?: boolean
}

const MONTH_MAP: Record<string, number> = {
  January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
  July: 7, August: 8, September: 9, October: 10, November: 11, December: 12,
}

export default function QtWeeklyPlanPortrait({
  year = 2026,
  weekNum = 32,
  weekLabel = 'WEEK 32',
  monthName = 'August',
  dateRangeText = '08/03 - 08/09',
  themeColor = '#B8C6D9',
  daysInWeek,
  pageWidth = 1024,
  pageHeight = 1448,
  isGeneralMode = false,
}: QtWeeklyPlanPortraitProps) {
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
      data-page-key={`week-${weekNum}-portrait`}
      data-week={weekNum}
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
          📅 WEEK {weekNum} PLANNER
        </span>
      </div>

      {/* 2. Page Title Header & Weekly Inspiration Banner */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="px-3.5 py-1.5 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-xs shrink-0 font-mono"
            style={{ backgroundColor: themeColor }}
          >
            W{weekNum}
          </div>
          <div>
            <h2 className="text-3xl font-serif font-bold text-slate-900 tracking-wide">{monthName} Weekly Plan</h2>
            <div className="text-xs text-slate-400 font-mono font-medium">{dateRangeText}</div>
          </div>
        </div>

        <div className={`border rounded-xl px-4 py-2 text-right shadow-xs ${
          isGeneralMode
            ? 'bg-gradient-to-r from-emerald-50/80 via-teal-50/40 to-emerald-50/80 border-emerald-200'
            : 'bg-gradient-to-r from-indigo-50/80 via-purple-50/40 to-indigo-50/80 border-indigo-200'
        }`}>
          <span className={`text-[9px] font-bold uppercase block font-mono ${isGeneralMode ? 'text-emerald-800' : 'text-indigo-800'}`}>
            {isGeneralMode ? 'WEEKLY FOCUS' : 'WEEKLY SCRIPTURE'}
          </span>
          <span className="text-xs font-serif font-semibold text-slate-800">
            {isGeneralMode
              ? '🎯 "이번 주 핵심 목표: 우선순위에 집중하고 흔들림 없이 성취하라"'
              : '📖 "내 발의 등등이요 내 길에 빛이니이다 (시편 119:105)"'
            }
          </span>
        </div>
      </div>

      {/* 3. Top Master Control Box */}
      <div className="border border-slate-300 rounded-xl p-3 bg-slate-50/60 mb-3 grid grid-cols-3 gap-3 text-xs shadow-xs">
        <div className="space-y-1">
          <span className="font-bold text-slate-800 font-serif block text-xs">📌 이주의 3대 핵심 우선순위:</span>
          <div className="bg-white p-2 rounded-lg border border-slate-200 space-y-1 text-xs font-serif">
            <div>1. ___________________</div>
            <div>2. ___________________</div>
          </div>
        </div>

        <div className="bg-white p-2 rounded-lg border border-slate-200 text-xs font-serif space-y-1">
          <span className="font-bold text-slate-700 block text-xs">{isGeneralMode ? '✨ 갓생 습관 7일 체크:' : '✨ 영적 수련 7일 체크:'}</span>
          <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
            <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono text-slate-600">
            <span>○</span><span>○</span><span>○</span><span>○</span><span>○</span><span>○</span><span>○</span>
          </div>
        </div>

        <div className="bg-white p-2 rounded-lg border border-slate-200 text-xs font-serif text-slate-500">
          <span className="font-bold text-slate-700 block text-xs">💖 이주의 감사 & 성찰:</span>
          <div className="min-h-[20px]">_________________________</div>
        </div>
      </div>

      {/* 4. 7 Days Vertical Stack */}
      <div className="flex-1 flex flex-col justify-between mb-3 space-y-2">
        {defaultDays.map((d) => {
          const isSun = d.dayName === 'SUN'
          const isSat = d.dayName === 'SAT'
          const { m, d: parsedDay } = parseMonthDay(d.dateStr, monthNum, d.dayNum)
          const holidays = getHolidaysAndFestivals(year, m, parsedDay)
          const hasRedDay = isSun || holidays.some((h) => h.isRedDay)

          return (
            <div
              key={d.dayNum}
              className="border border-slate-300 rounded-xl p-2.5 bg-white flex flex-col justify-between shadow-xs hover:border-slate-400 transition-colors flex-1"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className={`font-extrabold font-mono uppercase ${
                    isSun ? 'text-rose-600' : isSat ? 'text-blue-600' : 'text-slate-700'
                  }`}>
                    {d.dayName}
                  </span>
                  <span
                    data-nav-target={`day-${d.dayNum}`}
                    data-jump-btn="true"
                    className={`font-serif font-bold px-1.5 py-0.2 rounded hover:bg-slate-100 cursor-pointer transition-colors ${
                      hasRedDay ? 'text-rose-600' : isSat ? 'text-blue-600' : 'text-slate-800'
                    }`}
                  >
                    {String(d.dayNum).padStart(2, '0')}일
                  </span>
                  {holidays.length > 0 && (
                    <div className="flex items-center gap-1">
                      {holidays.map((h, hIdx) => {
                        const isChristianTag = !isGeneralMode && h.type === 'christian'
                        return (
                          <span
                            key={hIdx}
                            className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded leading-tight ${
                              h.isRedDay
                                ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                : isChristianTag
                                ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {h.name}
                          </span>
                        )
                      })}
                    </div>
                  )}
                </div>

                <div className="text-slate-400 text-xs font-serif">
                  {isGeneralMode ? '📌 일정/목표: ___________________________' : '📖 묵상 본문: ___________________________'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 flex-1 pt-1">
                <div className="space-y-1 text-xs font-serif text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 border border-slate-300 rounded-xs bg-white inline-block"></span>
                    <span>___________________________</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 border border-slate-300 rounded-xs bg-white inline-block"></span>
                    <span>___________________________</span>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-lg p-1 bg-white">
                  <PerfectGridNote step={13} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 5. Footer */}
      <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-300">
        <span>PREMIUM DIARY STUDIO — WEEKLY PLAN MASTER</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
