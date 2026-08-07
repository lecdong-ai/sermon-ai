'use client'

import React from 'react'
import PerfectGridNote from '../PerfectGridNote'

interface QtDailyDiaryPortraitProps {
  dateLabel: string
  dayNum: number
  dayName: string
  monthName: string
  yearLabel?: string
  themeColor?: string
  activeWeek?: string
  isChurchMode?: boolean
  pageWidth?: number
  pageHeight?: number
}

export default function QtDailyDiaryPortrait({
  dateLabel,
  dayNum,
  dayName,
  monthName = 'August',
  yearLabel = '2026',
  themeColor = '#B8C6D9',
  activeWeek = 'W1',
  isChurchMode = false,
  pageWidth = 724,
  pageHeight = 1024,
}: QtDailyDiaryPortraitProps) {
  const paddedDay = String(dayNum).padStart(2, '0')
  const isSunday = dayName === 'SUN'

  return (
    <div
      data-page-key={`day-${dayNum}`}
      data-day={dayNum}
      data-page-type="full-bleed"
      className={`qt-page relative bg-white text-slate-800 flex flex-col justify-between overflow-hidden shadow-md mx-auto transition-all ${
        isSunday ? 'border-2 border-emerald-400/80 bg-gradient-to-b from-emerald-50/30 via-white to-slate-50/20' : ''
      }`}
      style={{
        width: `${pageWidth}px`,
        height: `${pageHeight}px`,
        padding: '24px 28px',
        boxSizing: 'border-box',
        fontFamily: "'Noto Sans KR', 'Pretendard', sans-serif",
      }}
    >
      {/* 1. Top Navigation Bar (Header) */}
      <div className="flex items-center justify-between border-b border-slate-400 pb-2 mb-3">
        {/* Left Nav */}
        <div className="flex items-center space-x-3 text-[11px] font-medium tracking-wider text-slate-400">
          <span data-nav-target="calendar" className="cursor-pointer hover:text-slate-600">YEARLY</span>
          <span data-nav-target="calendar" className="cursor-pointer hover:text-slate-600">{yearLabel}</span>
          <span data-nav-target="calendar" className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold cursor-pointer">{monthName.toUpperCase().slice(0, 3)}</span>
        </div>

        {/* Right Nav */}
        <div className="flex items-center space-x-3 text-[11px] font-medium text-slate-400">
          <span data-nav-target="calendar" className="cursor-pointer hover:text-slate-600">MONTHLY</span>
          <span data-nav-target="overview" className="cursor-pointer hover:text-slate-600">OVERVIEW</span>
          {['W1', 'W2', 'W3', 'W4', 'W5'].map((w, idx) => (
            <span
              key={w}
              data-nav-target={`week-${idx + 1}`}
              className={`cursor-pointer px-1.5 py-0.5 rounded ${
                activeWeek === w ? 'bg-slate-200 text-slate-800 font-bold' : 'hover:text-slate-600'
              }`}
            >
              {w}
            </span>
          ))}
        </div>
      </div>

      {/* 2. Month & Day Title Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-4">
          <div
            className={`w-12 h-12 rounded-full flex flex-col items-center justify-center text-white shadow-sm font-serif ${
              isSunday ? 'bg-emerald-600 ring-2 ring-emerald-300 shadow-md' : ''
            }`}
            style={{ backgroundColor: isSunday ? undefined : themeColor }}
          >
            <span className="text-base font-bold leading-tight">{paddedDay}</span>
            <span className="text-[9px] uppercase tracking-tighter font-extrabold">{dayName}</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-serif font-bold text-slate-800 tracking-wide">{monthName}</h2>
              {isSunday && (
                <span className={`px-2.5 py-0.5 rounded-full text-[9.5px] font-bold border shadow-2xs whitespace-nowrap inline-block ${
                  isChurchMode
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-emerald-100 text-emerald-950 border-emerald-300'
                }`}>
                  {isChurchMode ? "🕊️ LORD'S DAY (주일 예배 & 안식)" : "☀️ SUNDAY RESET (주말 휴식 & 리프레시)"}
                </span>
              )}
            </div>
            <div className="h-1 w-24 rounded-full mt-1" style={{ backgroundColor: isSunday ? '#059669' : themeColor, opacity: 0.7 }} />
          </div>
        </div>

        <div className="text-right text-xs text-slate-400 font-medium whitespace-nowrap">
          {isSunday
            ? (isChurchMode ? '주일 예배 묵상 & 안식' : '주말 성찰 & 리프레시')
            : (isChurchMode ? '매일 QT 묵상 & 일기' : '데일리 플래너 & 일기')}
        </div>
      </div>

      {/* 3. Top Full-Width Section: AFFIRMATION, PRIORITIES & PRAYER TOPICS */}
      <div className="grid grid-cols-12 gap-3 mb-3">
        {/* DAILY AFFIRMATION & PRIORITIES (6 cols) */}
        <div className="col-span-6 border border-slate-400 rounded-lg p-2.5 bg-slate-50/30 flex flex-col justify-between">
          <div>
            <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: themeColor }} />
              PRIORITIES & AFFIRMATION
            </h4>
            <div className="space-y-1 text-xs text-slate-600 mt-1">
              <div className="border-b border-slate-300 pb-0.5 flex items-center">
                <span className="text-[10px] font-bold text-slate-400 mr-2">1)</span>
              </div>
              <div className="border-b border-slate-300 pb-0.5 flex items-center">
                <span className="text-[10px] font-bold text-slate-400 mr-2">2)</span>
              </div>
              <div className="border-b border-slate-300 pb-0.5 flex items-center">
                <span className="text-[10px] font-bold text-slate-400 mr-2">3)</span>
              </div>
            </div>
          </div>
        </div>

        {/* PRAYER TOPICS (오늘의 기도) (6 cols) */}
        <div className="col-span-6 border border-slate-400 rounded-lg p-2.5 bg-white shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-[11px] font-bold tracking-wider uppercase flex items-center whitespace-nowrap" style={{ color: themeColor }}>
              PRAYER TOPICS (오늘의 기도)
            </h4>
          </div>
          <div className="space-y-1 text-[11px] text-slate-600">
            <div className="flex items-center border-b border-slate-300 pb-0.5 h-5">
              <span className="w-4 text-center font-bold text-slate-400 text-[10px]">①</span>
            </div>
            <div className="flex items-center border-b border-slate-300 pb-0.5 h-5">
              <span className="w-4 text-center font-bold text-slate-400 text-[10px]">②</span>
            </div>
            <div className="flex items-center border-b border-slate-300 pb-0.5 h-5">
              <span className="w-4 text-center font-bold text-slate-400 text-[10px]">③</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom 2-Column Split Section (5:7) */}
      <div className="grid grid-cols-12 gap-3 flex-1">
        {/* Left Column (5 cols): TO DO LIST + HEALTH LOG + FOR TOMORROW */}
        <div className="col-span-5 flex flex-col justify-between space-y-3">
          {/* TO DO LIST */}
          <div className="border border-slate-400 rounded-lg p-2.5 bg-white flex-1 flex flex-col justify-between shadow-2xs">
            <h3 className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: themeColor }} />
              TO DO LIST
            </h3>
            <div className="space-y-2 flex-1">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between border-b border-slate-300 pb-1">
                  <div className="w-3.5 h-3.5 border border-slate-400 rounded-sm bg-slate-50/50" />
                  <div className="flex-1 border-b border-dashed border-slate-300 ml-2 h-3" />
                </div>
              ))}
            </div>
          </div>

          {/* HEALTH LOG */}
          <div className="border border-slate-400 rounded-lg p-2 bg-slate-50/20">
            <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 whitespace-nowrap">
              HEALTH LOG
            </h4>
            <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-600">
              <div className="bg-slate-100 p-1 rounded border border-slate-300 flex justify-between">
                <span className="font-semibold text-slate-500 whitespace-nowrap">MOOD</span>
                <span className="text-slate-400 whitespace-nowrap">Good / Normal / Bad</span>
              </div>
              <div className="bg-slate-100 p-1 rounded border border-slate-300 flex justify-between">
                <span className="font-semibold text-slate-500 whitespace-nowrap">EXERCISE</span>
                <span className="text-slate-400 whitespace-nowrap">____분</span>
              </div>
              <div className="bg-slate-100 p-1 rounded border border-slate-300 flex justify-between col-span-2">
                <span className="font-semibold text-slate-500 whitespace-nowrap">MEALS</span>
                <span className="text-slate-400 whitespace-nowrap">아침 / 점심 / 저녁</span>
              </div>
            </div>
          </div>

          {/* FOR TOMORROW */}
          <div className="border border-slate-400 rounded-lg p-2 bg-slate-50/20 h-16">
            <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 whitespace-nowrap">
              FOR TOMORROW
            </h4>
          </div>

          {/* TODAY'S SATISFACTION */}
          <div className="border border-slate-400 rounded-lg p-1.5 bg-slate-50/30">
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-semibold text-slate-500 whitespace-nowrap">TODAY&apos;S SATISFACTION</span>
              <span className="text-amber-400 text-xs whitespace-nowrap">★ ★ ★ ★ ★</span>
            </div>
          </div>
        </div>

        {/* Right Column (7 cols): JOURNAL & NOTES (Full-Height Grid Note) */}
        <div className="col-span-7 flex flex-col">
          <div className="flex items-center justify-between mb-1.5">
            <h3 className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider flex items-center whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: themeColor }} />
              JOURNAL & NOTES
            </h3>
            <span className="text-[10px] text-slate-400 whitespace-nowrap">Grid Note</span>
          </div>

          <div className="flex-1">
            <PerfectGridNote step={16} />
          </div>
        </div>
      </div>
    </div>
  )
}
