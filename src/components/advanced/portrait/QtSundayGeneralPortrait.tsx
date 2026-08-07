'use client'

import React from 'react'

interface QtSundayGeneralPortraitProps {
  year?: number
  month?: number
  monthName?: string
  themeColor?: string
  pageWidth?: number
  pageHeight?: number
}

export default function QtSundayGeneralPortrait({
  year = 2026,
  month = 8,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 1448,
}: QtSundayGeneralPortraitProps) {
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

  return (
    <div
      data-page-key="sunday-general-portrait"
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
      {/* 1. Header Navigation Bar */}
      <div className="flex items-center justify-between border-b border-slate-300 pb-3 mb-5">
        <div className="flex items-center space-x-4 text-xs font-medium tracking-wider text-slate-400">
          <span data-nav-target="calendar" className="cursor-pointer hover:text-slate-600 font-mono">YEARLY</span>
          <span className="font-mono">{year}</span>
          <span data-nav-target="calendar" className="px-2.5 py-0.5 rounded text-white font-bold cursor-pointer" style={{ backgroundColor: themeColor }}>
            {monthName.toUpperCase().slice(0, 3)}
          </span>
        </div>

        <div className="flex items-center space-x-3 text-xs font-medium text-slate-400">
          <span data-nav-target="calendar" className="hover:text-slate-600 cursor-pointer">MONTHLY</span>
          <span data-nav-target="overview" className="hover:text-slate-600 cursor-pointer">OVERVIEW</span>
          <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-bold text-xs shadow-xs">
            🌿 SUNDAY RESET ({sundaysList.length}주)
          </span>
        </div>
      </div>

      {/* 2. Page Title */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-800 tracking-wide flex items-center gap-2">
            <span>🌿 {monthName} Sunday Reset & Weekly Refresh</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            한 주를 온전히 성찰하고 새로운 주를 에너지 넘치게 맞이하는 {month}월 <strong className="text-emerald-700 font-bold">{sundaysList.length}번의 일요일</strong> 리셋 노트입니다.
          </p>
        </div>
        <div className="px-4 py-1.5 rounded-full text-xs font-bold text-emerald-950 bg-emerald-100 border border-emerald-300 shadow-xs">
          {year}년 {month}월 ({sundaysList.length}개 일요일)
        </div>
      </div>

      {/* 3. Vertical Stack for Sundays */}
      <div className="space-y-4 flex-1 flex flex-col justify-between">
        {sundaysList.map((sItem) => (
          <div
            key={sItem.no}
            className="border border-slate-200/90 rounded-2xl p-4 bg-slate-50/50 flex flex-col justify-between shadow-xs space-y-2.5 hover:border-emerald-400 transition-colors flex-1"
          >
            {/* Card Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
              <span className="text-xs font-extrabold px-3 py-1 rounded-full text-white bg-emerald-600 shadow-2xs">
                {sItem.label}
              </span>
              <span className="text-xs text-slate-400 font-mono font-bold">Date: {sItem.dateStr}</span>
            </div>

            <div className="grid grid-cols-12 gap-3 flex-1">
              {/* Weekly Wins */}
              <div className="col-span-6 bg-white p-3 rounded-xl border border-slate-200/80 flex flex-col justify-between">
                <span className="text-xs font-bold text-emerald-800 flex items-center gap-1 mb-1">
                  <span>☀️ 이번 주 감사 & 성과 (Weekly Wins):</span>
                </span>
                <div className="space-y-1.5 flex-1 flex flex-col justify-around">
                  <div className="border-b border-dashed border-slate-200 h-4 text-xs text-slate-400" />
                  <div className="border-b border-dashed border-slate-200 h-4 text-xs text-slate-400" />
                  <div className="border-b border-dashed border-slate-200 h-4 text-xs text-slate-400" />
                </div>
              </div>

              {/* Next Week Priorities */}
              <div className="col-span-6 bg-white p-3 rounded-xl border border-slate-200/80 flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1 mb-1">
                  <span>🎯 다음 주 핵심 목표 TOP 3:</span>
                </span>
                <div className="space-y-1.5 flex-1 flex flex-col justify-around">
                  {[1, 2, 3].map((pt) => (
                    <div key={pt} className="text-xs text-slate-400 flex items-center gap-2 border-b border-slate-100 pb-0.5">
                      <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                        {pt}
                      </span>
                      <span className="font-sans text-xs flex-1"></span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Weekend Relaxation & Refresh */}
            <div className="text-xs text-slate-700 bg-emerald-50/70 p-2 rounded-xl border border-emerald-100 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <span>☕ 주말 휴식 & 충전 기록 (Self-Care & Mindfulness):</span>
              </span>
              <span className="text-xs text-emerald-700 font-bold">Refresh & Reset</span>
            </div>
          </div>
        ))}
      </div>

      {/* 4. Footer */}
      <div className="flex items-center justify-between border-t border-slate-300 pt-2.5 mt-3 text-xs text-slate-400">
        <span>PREMIUM DIARY STUDIO — SUNDAY RESET & WEEKLY REFRESH ({sundaysList.length} SUNDAYS)</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
