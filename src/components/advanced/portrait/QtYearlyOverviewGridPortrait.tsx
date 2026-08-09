'use client'

import React from 'react'

interface QtYearlyOverviewGridPortraitProps {
  startYear?: number
  startMonth?: number
  endYear?: number
  endMonth?: number
  themeColor?: string
  pageWidth?: number
  pageHeight?: number
  isGeneralMode?: boolean
}

const MONTH_NAMES_SHORT = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
]

export default function QtYearlyOverviewGridPortrait({
  startYear = 2026,
  startMonth = 8,
  endYear = 2027,
  endMonth = 12,
  themeColor = '#B8C6D9',
  pageWidth = 768,
  pageHeight = 1024,
}: QtYearlyOverviewGridPortraitProps) {
  const monthList: { year: number; month: number }[] = []
  let currY = startYear
  let currM = startMonth
  while (currY < endYear || (currY === endYear && currM <= endMonth)) {
    monthList.push({ year: currY, month: currM })
    currM++
    if (currM > 12) {
      currM = 1
      currY++
    }
  }

  const displayMonths = monthList.slice(0, 12)

  return (
    <div
      data-page-key="yearly-grid"
      data-page-type="full-bleed"
      data-yearly-year={startYear}
      className="qt-page relative bg-white text-slate-800 flex flex-col justify-between overflow-hidden shadow-md mx-auto"
      style={{
        width: `${pageWidth}px`,
        height: `${pageHeight}px`,
        padding: '24px 56px 20px 20px',
        boxSizing: 'border-box',
        fontFamily: "'Noto Sans KR', 'Pretendard', sans-serif",
      }}
    >
      {/* 1. Header Navigation Bar */}
      <div className="flex items-center justify-between border-b border-slate-300 pb-2 mb-3">
        <div className="flex items-center space-x-2 text-xs font-medium tracking-wider text-slate-400 font-mono">
          <span className="px-2.5 py-1 rounded text-white font-bold" style={{ backgroundColor: themeColor }}>
            YEARLY OVERVIEW
          </span>
          <span>{startYear === endYear ? startYear : `${startYear} - ${endYear}`}</span>
        </div>
        <span className="text-xs font-mono text-slate-700 font-bold">12-MONTH GRID</span>
      </div>

      {/* 2. Main Title */}
      <div className="mb-3">
        <h2 className="text-xl font-sans font-bold text-slate-900 tracking-wide leading-none">
          {startYear === endYear ? `${startYear} Annual Master Calendar` : `${startYear}-${endYear} Master Calendar`}
        </h2>
        <p className="text-xs text-slate-400 font-mono font-medium mt-1">
          원하는 월 미니 카드를 터치하면 해당 월 달력으로 이동합니다.
        </p>
      </div>

      {/* 3. 3x4 Mini Calendar Grid */}
      <div className="grid grid-cols-3 gap-3 flex-1 mb-3">
        {displayMonths.map(({ year: yr, month: m }) => {
          const dateObj = new Date(yr, m - 1, 1)
          const firstDay = dateObj.getDay()
          const lastDate = new Date(yr, m, 0).getDate()

          const cells: (number | null)[] = []
          for (let i = 0; i < firstDay; i++) cells.push(null)
          for (let d = 1; d <= lastDate; d++) cells.push(d)

          return (
            <div
              key={`${yr}-${m}`}
              data-nav-target={`month-${yr}-${m}`}
              className="border border-slate-200 rounded-xl p-2.5 bg-slate-50/50 hover:bg-indigo-50/30 hover:border-indigo-300 transition-all cursor-pointer flex flex-col justify-between group shadow-2xs"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-1">
                <span className="text-xs font-sans font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {MONTH_NAMES_SHORT[m - 1]}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {yr}.{String(m).padStart(2, '0')}
                </span>
              </div>

              <div className="grid grid-cols-7 gap-0.5 text-center text-[9px] font-mono font-bold text-slate-400 mb-0.5">
                <span className="text-red-400">S</span>
                <span>M</span>
                <span>T</span>
                <span>W</span>
                <span>T</span>
                <span>F</span>
                <span className="text-blue-400">S</span>
              </div>

              <div className="grid grid-cols-7 gap-0.5 text-center text-[11px] font-mono leading-tight">
                {cells.map((dayVal, idx) => {
                  if (dayVal === null) return <span key={idx} className="block h-4" />
                  const isSun = idx % 7 === 0
                  const isSat = idx % 7 === 6
                  return (
                    <span
                      key={idx}
                      className={`block h-4 leading-4 rounded-xs ${
                        isSun
                          ? 'text-red-500 font-semibold'
                          : isSat
                          ? 'text-blue-500 font-semibold'
                          : 'text-slate-700'
                      }`}
                    >
                      {dayVal}
                    </span>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* 4. Footer Bar */}
      <div className="border-t border-slate-200 pt-2 flex items-center justify-between text-[10px] font-mono text-slate-400">
        <span>PREMIUM DIARY STUDIO</span>
        <span>TOUCH MONTH CARD TO JUMP</span>
      </div>
    </div>
  )
}
