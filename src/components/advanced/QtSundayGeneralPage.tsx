'use client'

import React from 'react'

interface QtSundayGeneralPageProps {
  year?: number
  month?: number
  monthName?: string
  themeColor?: string
  pageWidth?: number
  pageHeight?: number
}

export default function QtSundayGeneralPage({
  year = 2026,
  month = 8,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 768,
}: QtSundayGeneralPageProps) {
  const totalDays = new Date(year, month, 0).getDate()
  const sundaysList: { no: number; day: number; dateStr: string; label: string }[] = []

  for (let d = 1; d <= totalDays; d++) {
    const dt = new Date(year, month - 1, d)
    if (dt.getDay() === 0) {
      const no = sundaysList.length + 1
      sundaysList.push({
        no,
        day: d,
        dateStr: `${String(month).padStart(2, '0')}/${String(d).padStart(2, '0')}`,
        label: `${month}월 ${d}일 (${no}주차 선데이)`,
      })
    }
  }

  const isFiveSundays = sundaysList.length >= 5

  return (
    <div
      data-page-key="sunday-general"
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
      <div className="flex items-center justify-between border-b border-slate-300 pb-2 mb-3">
        <div className="flex items-center space-x-3 text-[11px] font-medium tracking-wider text-slate-400">
          <span data-nav-target="calendar" className="cursor-pointer hover:text-slate-600 font-mono">YEARLY</span>
          <span className="font-mono">{year}</span>
          <span data-nav-target="calendar" className="px-2 py-0.5 rounded text-white font-bold cursor-pointer" style={{ backgroundColor: themeColor }}>
            {monthName.toUpperCase().slice(0, 3)}
          </span>
        </div>

        <div className="flex items-center space-x-3 text-[11px] font-medium text-slate-400">
          <span data-nav-target="calendar" className="hover:text-slate-600 cursor-pointer">MONTHLY</span>
          <span data-nav-target="overview" className="hover:text-slate-600 cursor-pointer">OVERVIEW</span>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[10px] shadow-xs">
            🌿 SUNDAY RESET ({sundaysList.length}주)
          </span>
        </div>
      </div>

      {/* 2. Page Title */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-800 tracking-wide flex items-center gap-2">
            <span>🌿 {monthName} Sunday Reset & Weekly Refresh</span>
          </h1>
          <p className="text-[11px] text-slate-500 mt-0.5">
            한 주를 온전히 마무리하고 다음 주를 충전하는 {month}월 <strong className="text-emerald-700 font-bold">{sundaysList.length}번의 일요일</strong> 성찰 노트입니다.
          </p>
        </div>
        <div className="px-3 py-1 rounded-full text-xs font-bold text-emerald-950 bg-emerald-100 border border-emerald-300 shadow-xs">
          {year}년 {month}월 ({sundaysList.length}개 일요일)
        </div>
      </div>

      {/* 3. Dynamic Grid (4 Sundays vs 5 Sundays layout) */}
      <div className={`grid ${isFiveSundays ? 'grid-cols-3' : 'grid-cols-2'} gap-2.5 flex-1`}>
        {sundaysList.map((sItem) => (
          <div
            key={sItem.no}
            className="border border-slate-200/80 rounded-2xl p-3 bg-slate-50/50 flex flex-col justify-between shadow-xs space-y-1.5 hover:border-emerald-300 transition-colors"
          >
            {/* Card Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-1">
              <span className="text-[10.5px] font-extrabold px-2.5 py-0.5 rounded-full text-white bg-emerald-600 shadow-2xs">
                {sItem.label}
              </span>
              <span className="text-[9.5px] text-slate-400 font-mono font-bold">Date: {sItem.dateStr}</span>
            </div>

            {/* Weekly Wins & Gratitude */}
            <div className="bg-white p-2 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-[9.5px] font-bold text-emerald-800 flex items-center gap-1">
                <span>☀️ 이번 주 감사 & 성과 (Weekly Wins):</span>
              </span>
              <div className="space-y-0.5">
                <div className="border-b border-dashed border-slate-200 h-3 text-[9px] text-slate-400" />
                <div className="border-b border-dashed border-slate-200 h-3 text-[9px] text-slate-400" />
              </div>
            </div>

            {/* Next Week Top Priorities */}
            <div className="space-y-1 flex-1 bg-white p-2 rounded-xl border border-slate-200/80">
              <span className="text-[9.5px] font-bold text-slate-700 flex items-center gap-1">
                <span>🎯 다음 주 핵심 목표 TOP 3:</span>
              </span>
              {[1, 2, 3].map((pt) => (
                <div key={pt} className="text-[9.5px] text-slate-400 flex items-center gap-1.5 border-b border-slate-100 pb-0.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-100 text-emerald-700 text-[8px] font-bold flex items-center justify-center shrink-0">
                    {pt}
                  </span>
                  <span className="font-sans text-[9px] flex-1"></span>
                </div>
              ))}
            </div>

            {/* Weekend Self-Care & Key Lesson */}
            <div className="text-[9.5px] text-slate-700 bg-emerald-50/60 p-1.5 rounded-xl border border-emerald-100 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <span>☕ 휴식 & 리프레시:</span>
              </span>
              <span className="text-[8.5px] text-emerald-700 font-bold">Self-Care & Mindset</span>
            </div>
          </div>
        ))}
      </div>

      {/* 4. Footer */}
      <div className="flex items-center justify-between border-t border-slate-200 pt-1.5 mt-1.5 text-[10px] text-slate-400">
        <span>PREMIUM DIARY STUDIO — SUNDAY RESET & WEEKLY REFRESH ({sundaysList.length} SUNDAYS)</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
