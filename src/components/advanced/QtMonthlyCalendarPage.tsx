'use client'

import React from 'react'
import PerfectGridNote from './PerfectGridNote'
import { getHolidaysAndFestivals } from '@/lib/holidays'

interface QtMonthlyCalendarPageProps {
  year?: number        // 예: 2026
  month?: number       // 예: 8 (1-based)
  monthName?: string  // 예: "August"
  themeColor?: string // 수채화 파스텔 테마 색상 (기본: #B8C6D9)
  daysInMonth?: number
  startDayOfWeek?: number // 0 = Sunday, 6 = Saturday
  pageWidth?: number  // px 단위 (기본: 1024)
  pageHeight?: number // px 단위 (기본: 768)
  isGeneralMode?: boolean // 일반인 갓생 모드 여부 (true일 경우 기독교 색채 배제)
}

export default function QtMonthlyCalendarPage({
  year = 2026,
  month = 8,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 768,
  isGeneralMode = false,
}: QtMonthlyCalendarPageProps) {
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

  const totalWeeks = Math.ceil(calendarCells.length / 7)

  return (
    <div
      data-page-key="calendar"
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
          <span data-nav-target="calendar" className="px-2 py-0.5 rounded bg-slate-800 text-white font-bold cursor-pointer shadow-2xs">
            {isGeneralMode ? '🌿 LIFE PLANNER' : '📅 MONTHLY PLANNER'}
          </span>
          <span data-nav-target="overview" className="hover:text-slate-600 cursor-pointer">OVERVIEW</span>
          {Array.from({ length: totalWeeks }).map((_, wIdx) => (
            <span key={wIdx} data-nav-target={`week-${wIdx + 1}`} className="hover:text-slate-600 cursor-pointer px-1 py-0.5">
              W{wIdx + 1}
            </span>
          ))}
        </div>
      </div>

      {/* 2. Month Header & Monthly Banner (General vs Church) */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-serif font-bold text-slate-900 tracking-wide">{monthName}</h1>
          <span className="text-xs font-mono font-bold text-slate-400 border-l border-slate-300 pl-3">
            {year}년 {month}월
          </span>
        </div>

        {/* Monthly Inspiration Banner */}
        <div className={`border rounded-xl px-3 py-1 text-right shadow-2xs ${
          isGeneralMode
            ? 'bg-gradient-to-r from-emerald-50/80 via-teal-50/40 to-emerald-50/80 border-emerald-200'
            : 'bg-gradient-to-r from-amber-50/80 via-rose-50/40 to-amber-50/80 border-amber-200'
        }`}>
          <span className={`text-[8px] font-bold uppercase block font-mono ${isGeneralMode ? 'text-emerald-800' : 'text-amber-800'}`}>
            {isGeneralMode ? 'MONTHLY MOTIVATION' : 'MONTHLY SCRIPTURE & THEME'}
          </span>
          <span className="text-[10px] font-serif font-semibold text-slate-800">
            {isGeneralMode
              ? '"작은 습관의 변화가 위대한 운명을 만든다 (아리스토텔레스)"'
              : '"여호와는 나의 목자시니 내게 부족함이 없으리로다 (시편 23:1)"'
            }
          </span>
        </div>
      </div>

      {/* 3. Main Content: Left 3-in-1 Focus Zone + Right Calendar Grid */}
      <div className="grid grid-cols-12 gap-3 flex-1 mb-2">
        {/* Left Focus Zone (3 cols) */}
        <div className="col-span-3 flex flex-col justify-between space-y-2 pr-1 border-r border-slate-200">
          {/* Priority 3 Goals */}
          <div className="border border-slate-200 rounded-xl p-2 bg-slate-50/50 space-y-1">
            <div className="text-[9.5px] font-bold text-slate-800 font-serif flex items-center justify-between border-b border-slate-200 pb-0.5">
              <span>🎯 이달의 3대 핵심 목표</span>
              <span className="text-[8px] font-mono text-slate-400">Goals</span>
            </div>
            <div className="space-y-1 text-[8.5px] text-slate-600 font-serif pt-0.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded border border-slate-400 inline-block"></span>
                <span>1. ___________________</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded border border-slate-400 inline-block"></span>
                <span>2. ___________________</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded border border-slate-400 inline-block"></span>
                <span>3. ___________________</span>
              </div>
            </div>
          </div>

          {/* Habit / Spiritual Disciplines Tracker */}
          <div className={`border rounded-xl p-2 space-y-1 ${
            isGeneralMode ? 'border-emerald-100 bg-emerald-50/20' : 'border-indigo-100 bg-indigo-50/20'
          }`}>
            <div className={`text-[9.5px] font-bold font-serif flex items-center justify-between border-b pb-0.5 ${
              isGeneralMode ? 'text-emerald-950 border-emerald-200' : 'text-indigo-950 border-indigo-200'
            }`}>
              <span>{isGeneralMode ? '✨ 갓생 습관 트래커' : '✨ 영적 수련 & 습관 체크'}</span>
              <span className={`text-[8px] font-mono ${isGeneralMode ? 'text-emerald-700' : 'text-indigo-600'}`}>Habits</span>
            </div>
            <div className="space-y-1 text-[8px] text-slate-600 font-serif pt-0.5">
              <div className="flex justify-between items-center">
                <span>{isGeneralMode ? '📖 매일 독서 30분' : '📖 매일 말씀 QT'}</span>
                <span className={`font-mono ${isGeneralMode ? 'text-emerald-700' : 'text-indigo-700'}`}>□ □ □ □ □</span>
              </div>
              <div className="flex justify-between items-center">
                <span>{isGeneralMode ? '🏃 건강 운동 / 스트레칭' : '🙏 정시 기도 30분'}</span>
                <span className={`font-mono ${isGeneralMode ? 'text-emerald-700' : 'text-indigo-700'}`}>□ □ □ □ □</span>
              </div>
              <div className="flex justify-between items-center">
                <span>💖 하루 3감사 노트</span>
                <span className={`font-mono ${isGeneralMode ? 'text-emerald-700' : 'text-indigo-700'}`}>□ □ □ □ □</span>
              </div>
            </div>
          </div>

          {/* Notes & Reflection */}
          <div className="flex-1 border border-slate-200 rounded-xl p-2 bg-white flex flex-col justify-between shadow-2xs">
            <div className="text-[9.5px] font-bold text-slate-800 font-serif border-b border-slate-200 pb-0.5 flex items-center justify-between">
              <span>📝 월간 아이디어 & 메모 노트</span>
              <span className="text-[8px] font-mono text-slate-400">Notes</span>
            </div>
            <div className="flex-1 pt-1">
              <PerfectGridNote step={15} />
            </div>
          </div>
        </div>

        {/* Right 7-Column Calendar Grid (9 cols) */}
        <div className="col-span-9 flex flex-col justify-between">
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1 text-[10px] font-bold text-slate-600 bg-slate-100/80 py-1 rounded-lg border border-slate-300 font-serif">
            {daysOfWeek.map((d, i) => (
              <span key={d} className={i === 0 ? 'text-rose-600' : i === 6 ? 'text-blue-600' : ''}>
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
              const holidays = dayNum ? getHolidaysAndFestivals(year, month, dayNum) : []
              const hasRedDay = isSun || holidays.some((h) => h.isRedDay)

              return (
                <div
                  key={idx}
                  className={`border rounded-xl p-1 flex flex-col justify-between transition-all relative overflow-hidden ${
                    dayNum
                      ? 'border-slate-300 bg-white hover:border-slate-400 hover:shadow-xs'
                      : 'border-slate-200/50 bg-slate-50/40 opacity-30'
                  }`}
                >
                  {dayNum ? (
                    <>
                      {/* Top Date Header */}
                      <div className="flex items-center justify-between border-b border-slate-100 pb-0.5">
                        <span
                          data-nav-target={`day-${dayNum}`}
                          data-jump-btn="true"
                          className={`text-[11px] font-bold font-serif px-1 py-0.2 rounded hover:bg-slate-100 cursor-pointer transition-colors ${
                            hasRedDay ? 'text-rose-600' : isSat ? 'text-blue-600' : 'text-slate-800'
                          }`}
                        >
                          {dayNum}
                        </span>

                        {/* Mini Daily Checklist Dots (General vs Church) */}
                        <div className="flex items-center gap-0.5 text-[7px] font-mono text-slate-300">
                          <span title={isGeneralMode ? 'Habit' : 'QT'} className={isGeneralMode ? 'hover:text-emerald-600' : 'hover:text-amber-600'}>
                            {isGeneralMode ? 'H' : 'Q'}
                          </span>
                          <span title={isGeneralMode ? 'Goal' : 'Prayer'} className={isGeneralMode ? 'hover:text-blue-600' : 'hover:text-indigo-600'}>
                            {isGeneralMode ? 'G' : 'P'}
                          </span>
                        </div>
                      </div>

                      {/* Holidays & Festivals */}
                      {holidays.length > 0 && (
                        <div className="flex flex-col gap-0.5 mt-0.5">
                          {holidays.map((h, hIdx) => {
                            // 일반인 모드에서는 christian 타입도 깔끔한 파스텔 라벨로 표시
                            const isChristianTag = !isGeneralMode && h.type === 'christian'
                            return (
                              <div
                                key={hIdx}
                                className={`text-[8px] font-extrabold px-1 py-0.2 rounded truncate leading-tight tracking-tight ${
                                  h.isRedDay
                                    ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                    : isChristianTag
                                    ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                }`}
                                title={h.name}
                              >
                                {h.name}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </>
                  ) : null}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 4. Bottom Footer */}
      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1.5 border-t border-slate-200">
        <span>PREMIUM DIARY STUDIO — {isGeneralMode ? 'GENERAL LIFE MONTHLY PLANNER' : 'MONTHLY CALENDAR MASTER'}</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
