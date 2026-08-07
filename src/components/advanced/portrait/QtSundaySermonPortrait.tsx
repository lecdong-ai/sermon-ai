'use client'

import React from 'react'

interface QtSundaySermonPortraitProps {
  year?: number
  month?: number
  monthName?: string
  themeColor?: string
  pageWidth?: number
  pageHeight?: number
}

export default function QtSundaySermonPortrait({
  year = 2026,
  month = 8,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 1448,
}: QtSundaySermonPortraitProps) {
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
        label: `${month}월 ${d}일 (${no}주차 주일 예배)`,
      })
    }
  }

  return (
    <div
      data-page-key="sunday-sermon-portrait"
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
          <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-600 to-indigo-600 text-white font-bold text-xs shadow-xs">
            🏛️ SUNDAY SERMON ({sundaysList.length}주)
          </span>
        </div>
      </div>

      {/* 2. Page Title */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-800 tracking-wide flex items-center gap-2">
            <span>🏛️ {monthName} Sunday Worship & Sermon Notes</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {year}년 {month}월 <strong className="text-amber-700 font-bold">{sundaysList.length}번의 주일 예배</strong> 말씀과 삶의 구체적인 순종 결단을 기록합니다.
          </p>
        </div>
        <div className="px-4 py-1.5 rounded-full text-xs font-bold text-amber-950 bg-amber-50 border border-amber-300 shadow-xs">
          {year}년 {month}월 ({sundaysList.length}개 주일 구성)
        </div>
      </div>

      {/* 3. Vertical Stack Layout for 4 or 5 Sundays */}
      <div className="flex-1 flex flex-col space-y-4 justify-between">
        {sundaysList.map((sItem) => (
          <div
            key={sItem.no}
            className="border border-slate-200/90 rounded-2xl p-4 bg-slate-50/50 space-y-2 shadow-xs flex-1 flex flex-col justify-between hover:border-amber-400 transition-colors"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
              <span className="text-xs font-extrabold px-3 py-1 rounded-full text-white bg-gradient-to-r from-amber-600 to-indigo-600 shadow-2xs">
                {sItem.label}
              </span>
              <span className="text-xs text-slate-400 font-mono font-bold">Date: {sItem.dateStr}</span>
            </div>

            <div className="grid grid-cols-12 gap-3 text-xs">
              <div className="col-span-7 p-2 rounded-xl bg-white border border-slate-200/80">
                <span className="text-[10px] text-amber-800 font-bold block">설교 제목:</span>
                <span className="text-slate-700 block font-serif min-h-[20px]"></span>
              </div>
              <div className="col-span-5 p-2 rounded-xl bg-white border border-slate-200/80">
                <span className="text-[10px] text-indigo-700 font-bold block">본문 말씀:</span>
                <span className="text-slate-700 block font-mono min-h-[20px]"></span>
              </div>
            </div>

            <div className="bg-white p-2 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-xs font-bold text-slate-700 block">💡 핵심 대지 & 묵상 요약:</span>
              <div className="border-b border-dashed border-slate-200 h-4" />
              <div className="border-b border-dashed border-slate-200 h-4" />
            </div>

            <div className="bg-indigo-50/70 p-2 rounded-xl border border-indigo-100 flex items-center justify-between text-xs text-indigo-950 font-medium">
              <span>🌱 이번 주 순종 결단:</span>
              <span className="text-indigo-600 font-bold text-[11px]">Action Plan</span>
            </div>
          </div>
        ))}
      </div>

      {/* 4. Footer */}
      <div className="flex items-center justify-between border-t border-slate-300 pt-2.5 mt-3 text-xs text-slate-400">
        <span>SUNDAY SERMON STUDIO — WORSHIP NOTES ({sundaysList.length} SUNDAYS)</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
