'use client'

import React from 'react'
import PerfectGridNote from './PerfectGridNote'

interface QtDailyDiaryPageProps {
  dateLabel: string   // 예: "01 SAT"
  dayNum: number      // 예: 1
  dayName: string     // 예: "SAT"
  monthName: string   // 예: "August"
  yearLabel?: string  // 예: "2026"
  themeColor?: string // 수채화 파스텔 테마 색상 (기본: #B8C6D9 - 8월 쿨 블루)
  activeWeek?: string // 예: "W1"
  pageWidth?: number
  pageHeight?: number
}

export default function QtDailyDiaryPage({
  dateLabel,
  dayNum,
  dayName,
  monthName = 'August',
  yearLabel = '2026',
  themeColor = '#B8C6D9',
  activeWeek = 'W1',
  pageWidth = 1024,
  pageHeight = 768,
}: QtDailyDiaryPageProps) {
  const paddedDay = String(dayNum).padStart(2, '0')

  return (
    <div
      data-page-key={`day-${dayNum}`}
      data-day={dayNum}
      className="qt-page relative bg-white text-slate-800 flex flex-col justify-between overflow-hidden shadow-md mx-auto"
      style={{
        width: `${pageWidth}px`,
        height: `${pageHeight}px`,
        padding: '24px 32px',
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
          <span data-nav-target="calendar" className="px-1 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold cursor-pointer">{monthName.toUpperCase().slice(0, 3)}</span>
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
      <div className="flex items-center space-x-4 mb-4">
        {/* Date Circle Badge */}
        <div
          className="w-12 h-12 rounded-full flex flex-col items-center justify-center text-white shadow-sm font-serif"
          style={{ backgroundColor: themeColor }}
        >
          <span className="text-base font-bold leading-tight">{paddedDay}</span>
          <span className="text-[9px] uppercase tracking-tighter opacity-90">{dayName}</span>
        </div>

        {/* Month Title & Subline */}
        <div>
          <h2 className="text-2xl font-serif font-bold text-slate-800 tracking-wide">{monthName}</h2>
          <div className="h-1 w-24 rounded-full mt-1" style={{ backgroundColor: themeColor, opacity: 0.6 }} />
        </div>
      </div>

      {/* 3. Main 3-Column Content Layout */}
      <div className="grid grid-cols-12 gap-4 flex-1">
        {/* ===== Column 1: Task & Priorities (3 cols) ===== */}
        <div className="col-span-3 flex flex-col justify-between border-r border-slate-300 pr-3">
          {/* Priorities Section */}
          <div className="mb-4">
            <h3 className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: themeColor }} />
              PRIORITIES
            </h3>
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="border-b border-slate-300 pb-1 flex items-center">
                <span className="text-[10px] font-bold text-slate-400 mr-2">1)</span>
              </div>
              <div className="border-b border-slate-300 pb-1 flex items-center">
                <span className="text-[10px] font-bold text-slate-400 mr-2">2)</span>
              </div>
              <div className="border-b border-slate-300 pb-1 flex items-center">
                <span className="text-[10px] font-bold text-slate-400 mr-2">3)</span>
              </div>
            </div>
          </div>

          {/* To Do List Section */}
          <div className="flex-1 flex flex-col justify-between">
            <h3 className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: themeColor }} />
              TO DO LIST
            </h3>
            <div className="space-y-2 flex-1">
              {Array.from({ length: 11 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between border-b border-slate-300 pb-1">
                  <div className="w-3.5 h-3.5 border border-slate-400 rounded-sm bg-slate-50/50" />
                  <div className="flex-1 border-b border-dashed border-slate-300 ml-2 h-3" />
                </div>
              ))}
            </div>
            {/* Blank Notes Space */}
            <div className="h-16 mt-3 bg-slate-50/50 rounded border border-slate-300 p-2" />
          </div>
        </div>

        {/* ===== Column 2: Life, Prayer & Health Tracker (4 cols) ===== */}
        <div className="col-span-4 flex flex-col space-y-3 border-r border-slate-300 pr-3">
          {/* Daily Affirmation Box */}
          <div className="border border-slate-400 rounded-lg p-2.5 bg-slate-50/30">
            <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              DAILY AFFIRMATION
            </h4>
            <div className="h-10" />
          </div>

          {/* ★ PRAYER TOPICS (오늘의 기도제목) Box */}
          <div
            className="border border-slate-400 rounded-lg p-2.5 bg-white shadow-2xs"
          >
            <div className="flex items-center justify-between mb-1.5">
              <h4 className="text-[11px] font-bold tracking-wider uppercase flex items-center" style={{ color: themeColor }}>
                <span className="mr-1">🙏</span> PRAYER TOPICS (오늘의 기도)
              </h4>
              <span className="text-[9px] text-slate-400 font-normal">3가지 기도제목</span>
            </div>
            <div className="space-y-1.5 text-[11px] text-slate-600">
              <div className="flex items-center border-b border-slate-300 pb-1 h-6">
                <span className="w-4 text-center font-bold text-slate-400 text-[10px]">①</span>
              </div>
              <div className="flex items-center border-b border-slate-300 pb-1 h-6">
                <span className="w-4 text-center font-bold text-slate-400 text-[10px]">②</span>
              </div>
              <div className="flex items-center border-b border-slate-300 pb-1 h-6">
                <span className="w-4 text-center font-bold text-slate-400 text-[10px]">③</span>
              </div>
            </div>
          </div>

          {/* Health Log Section */}
          <div className="border border-slate-400 rounded-lg p-2.5 bg-slate-50/20">
            <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              HEALTH LOG
            </h4>
            <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-600">
              <div className="bg-slate-100 p-1 rounded border border-slate-300 flex justify-between">
                <span className="font-semibold text-slate-500">MOOD</span>
                <span className="text-slate-400">Good / Normal / Bad</span>
              </div>
              <div className="bg-slate-100 p-1 rounded border border-slate-300 flex justify-between">
                <span className="font-semibold text-slate-500">EXERCISE</span>
                <span className="text-slate-400">____분</span>
              </div>
              <div className="bg-slate-100 p-1 rounded border border-slate-300 flex justify-between col-span-2">
                <span className="font-semibold text-slate-500">MEALS</span>
                <span className="text-slate-400">아침 / 점심 / 저녁</span>
              </div>
            </div>
          </div>

          {/* For Tomorrow Box */}
          <div className="border border-slate-400 rounded-lg p-2 bg-slate-50/20 flex-1">
            <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              FOR TOMORROW
            </h4>
          </div>

          {/* Today's Satisfaction Rating */}
          <div className="border border-slate-400 rounded-lg p-2 bg-slate-50/30">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-slate-500">TODAY&apos;S SATISFACTION</span>
              <span className="text-amber-400 text-xs">★ ★ ★ ★ ★</span>
            </div>
          </div>
        </div>

        {/* ===== Column 3: Full-Height Free Grid Note (5 cols) ===== */}
        <div className="col-span-5 flex flex-col pl-1">
          <div className="flex items-center justify-between mb-1.5">
            <h3 className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider flex items-center">
              <span className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: themeColor }} />
              JOURNAL & NOTES
            </h3>
            <span className="text-[10px] text-slate-400">Grid Note</span>
          </div>

          {/* Grid background simulation */}
          <div className="flex-1">
            <PerfectGridNote step={16} />
          </div>
        </div>
      </div>
    </div>
  )
}
