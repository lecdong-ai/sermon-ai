'use client'

import React from 'react'

interface QtYearlyWallCalendarPageProps {
  months: { year: number; month: number }[]
  themeColor?: string
  pageWidth?: number
  pageHeight?: number
  chunkIndex?: number
  chunkCount?: number
}

const MONTH_NAMES_SHORT = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
]

const MONTH_NAMES_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

// 12개월 파스텔 팔레트 (오른쪽 색인 월 칩과 동일 감성)
const SEASONAL_MONTH_COLORS: Record<number, { bg: string; text: string }> = {
  1: { bg: '#8395A7', text: '#FFFFFF' },
  2: { bg: '#95A5A6', text: '#FFFFFF' },
  3: { bg: '#D4A5B7', text: '#FFFFFF' },
  4: { bg: '#C896A6', text: '#FFFFFF' },
  5: { bg: '#96B396', text: '#FFFFFF' },
  6: { bg: '#7BA493', text: '#FFFFFF' },
  7: { bg: '#6B9DB9', text: '#FFFFFF' },
  8: { bg: '#7895B2', text: '#FFFFFF' },
  9: { bg: '#BE9B7B', text: '#FFFFFF' },
  10: { bg: '#B07D62', text: '#FFFFFF' },
  11: { bg: '#8E6E6E', text: '#FFFFFF' },
  12: { bg: '#657786', text: '#FFFFFF' },
}

function getMiniCalendarCells(year: number, month: number) {
  const firstDay = new Date(year, month - 1, 1).getDay()
  const lastDate = new Date(year, month, 0).getDate()
  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= lastDate; d++) cells.push(d)
  return cells
}

export default function QtYearlyWallCalendarPage({
  months,
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 768,
  chunkIndex = 1,
  chunkCount = 1,
}: QtYearlyWallCalendarPageProps) {
  if (!months || months.length === 0) return null

  const today = new Date()
  const first = months[0]
  const last = months[months.length - 1]
  const periodLabel = `${first.year}.${String(first.month).padStart(2, '0')} → ${last.year}.${String(last.month).padStart(2, '0')}`
  const years = Array.from(new Set(months.map((m) => m.year))).join('-')

  const rowMonths = months.slice(0, 6)
  const rowLabel = `${MONTH_NAMES_SHORT[rowMonths[0].month - 1]} - ${MONTH_NAMES_SHORT[rowMonths[rowMonths.length - 1].month - 1]}`

  const renderMonthCard = ({ year, month }: { year: number; month: number }) => {
    const cells = getMiniCalendarCells(year, month)
    const isTodayMonth = today.getFullYear() === year && today.getMonth() === month - 1
    const todayDate = today.getDate()

    return (
      <div
        key={`${year}-${month}`}
        data-nav-target={`month-${year}-${month}`}
        className="border border-slate-200 rounded-xl bg-white hover:bg-indigo-50/30 hover:border-indigo-300 transition-all cursor-pointer flex flex-col shadow-2xs group overflow-hidden"
      >
        {/* A. 월 파스텔 컬러 액센트 바 (월 칩과 동일 팔레트) */}
        <div
          className="h-1.5 w-full shrink-0"
          style={{ backgroundColor: SEASONAL_MONTH_COLORS[month].bg }}
        />

        {/* B. 미니 캘린더 (고정 높이로 컴팩트) */}
        <div className="flex-none flex flex-col p-1.5 pb-1">
          {/* Mini Header */}
          <div className="flex items-center justify-between px-1 pb-1 border-b border-slate-200">
            <span className="text-[11px] font-sans font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              {MONTH_NAMES_FULL[month - 1]}
            </span>
            <span className="text-[9px] font-mono font-semibold text-slate-400">
              {year}
            </span>
          </div>

          {/* Day Name Row */}
          <div className="grid grid-cols-7 gap-0.5 text-center text-[8px] font-mono font-bold text-slate-400 mt-1 mb-0.5 px-0.5">
            <span className="text-red-400">S</span>
            <span>M</span>
            <span>T</span>
            <span>W</span>
            <span>T</span>
            <span>F</span>
            <span className="text-blue-400">S</span>
          </div>

          {/* Mini Calendar Cells Grid (셀 고정 높이) */}
          <div className="grid grid-cols-7 gap-0.5 text-center text-[9px] font-mono">
            {cells.map((dayVal, idx) => {
              if (dayVal === null) return <span key={idx} className="h-3.5" />
              const isSun = idx % 7 === 0
              const isSat = idx % 7 === 6
              const isToday = isTodayMonth && dayVal === todayDate
              return (
                <span
                  key={idx}
                  className={`h-3.5 leading-3.5 flex items-center justify-center rounded-xs ${
                    isSun
                      ? 'text-red-500 font-semibold'
                      : isSat
                      ? 'text-blue-500 font-semibold'
                      : 'text-slate-700'
                  } ${isToday ? 'bg-amber-300/80 text-slate-900 font-black' : ''}`}
                >
                  {dayVal}
                </span>
              )
            })}
          </div>
        </div>

        {/* C. (to-do & memo) 글상자 (남은 공간 전체): 투두 체크박스 + 메모 */}
        <div className="flex-1 min-h-0 flex flex-col border-t-2 border-slate-200 bg-slate-50/40">
          {/* Notes Header */}
          <div className="px-2 pt-1 pb-0.5 bg-white/70 border-b border-slate-100">
            <span className="text-[9px] font-mono font-bold tracking-[0.15em] text-slate-400">
              (to-do &amp; memo)
            </span>
          </div>

          {/* Todo Checkbox Lines (○ 8줄) */}
          <div className="flex flex-col px-2 pt-1">
            {Array.from({ length: 8 }, (_, i) => (
              <div
                key={`todo-${i}`}
                className="flex items-center gap-1.5 py-[2.5px] border-b border-dashed border-slate-200/90"
              >
                <span className="w-2 h-2 rounded-full border-[1.5px] border-slate-400 shrink-0" />
                <span className="flex-1" />
              </div>
            ))}
          </div>

          {/* Blank Memo Ruled Lines */}
          <div className="flex-1 flex flex-col justify-center px-2 pb-1.5 min-h-0">
            {Array.from({ length: 6 }, (_, i) => (
              <div
                key={`memo-${i}`}
                className="flex-1 border-b border-slate-200/70"
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderRowLabel = (label: string) => (
    <div className="absolute left-0 top-0 bottom-0 w-5 flex items-center justify-center">
      <span
        className="text-[8.5px] font-mono font-bold tracking-[0.25em] text-slate-400 uppercase"
        style={{ writingMode: 'vertical-rl' }}
      >
        {label}
      </span>
    </div>
  )

  return (
    <div
      data-page-key="wall-calendar"
      data-page-type="full-bleed"
      className="qt-page relative bg-white text-slate-800 flex flex-col overflow-hidden shadow-md mx-auto"
      style={{
        width: `${pageWidth}px`,
        height: `${pageHeight}px`,
        padding: '16px 40px 14px 34px',
        boxSizing: 'border-box',
        fontFamily: "'Noto Sans KR', 'Pretendard', sans-serif",
      }}
    >
      {/* 1. Header Strip: YEARLY Badge + Period + Month Chips */}
      <div className="flex items-center justify-between border-b border-slate-300 pb-2 mb-2">
        <div className="flex items-center space-x-3 text-[11px] font-medium tracking-wider text-slate-400 font-mono">
          <span className="px-2 py-0.5 rounded text-white font-bold" style={{ backgroundColor: themeColor }}>
            YEARLY
          </span>
          <span className="text-slate-700 font-semibold">{periodLabel}</span>
        </div>

        <div className="flex items-center gap-1">
          {months.map(({ year, month }) => (
            <button
              key={`chip-${year}-${month}`}
              type="button"
              data-nav-target={`month-${year}-${month}`}
              className="px-1.5 py-0.5 rounded text-[8px] font-extrabold opacity-80 hover:opacity-100 hover:scale-105 transition-all cursor-pointer"
              style={{
                backgroundColor: SEASONAL_MONTH_COLORS[month].bg,
                color: SEASONAL_MONTH_COLORS[month].text,
              }}
              title={`${year}년 ${month}월 달력으로 이동`}
            >
              {MONTH_NAMES_SHORT[month - 1]}
            </button>
          ))}
        </div>
      </div>

      {/* 2. 6-Month Mini Calendar Row + 각 달 할 일 글상자 */}
      <div className="relative flex-1 min-h-0">
        {renderRowLabel(rowLabel)}
        <div className="grid grid-cols-6 gap-2 h-full ml-6">
          {rowMonths.map(renderMonthCard)}
        </div>
      </div>

      {/* 3. Footer Bar */}
      <div className="border-t border-slate-200 pt-2 mt-2 flex items-center justify-between text-[9px] font-mono text-slate-400">
        <span>PREMIUM DIARY STUDIO — {years} WALL CALENDAR</span>
        <span>{chunkIndex} / {chunkCount} · TOUCH MONTH CARD TO JUMP</span>
      </div>
    </div>
  )
}
