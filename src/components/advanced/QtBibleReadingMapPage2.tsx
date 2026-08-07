'use client'

import React from 'react'

interface QtBibleReadingMapPage2Props {
  year?: number
  monthName?: string
  themeColor?: string
  pageWidth?: number
  pageHeight?: number
}

export default function QtBibleReadingMapPage2({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 768,
}: QtBibleReadingMapPage2Props) {
  return (
    <div
      data-page-key="bible-map-2"
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
      {/* 1. Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-300 pb-2 mb-2">
        <div className="flex items-center space-x-3 text-[11px] font-medium tracking-wider text-slate-400 font-mono">
          <span>YEARLY</span>
          <span>{year}</span>
          <span className="px-2 py-0.5 rounded text-white font-bold" style={{ backgroundColor: themeColor }}>
            {monthName.toUpperCase().slice(0, 3)}
          </span>
        </div>

        <div className="flex items-center space-x-3 text-[11px] font-medium text-slate-400">
          <span>DAILY BIBLE READING PLAN & RHEMA JOURNAL (VOL. 2)</span>
          <span className="px-2.5 py-0.5 rounded-full bg-indigo-600 text-white font-bold text-[10px] shadow-xs">
            📖 통독② 31일 데일리 통독 플래너 (VOL. 2)
          </span>
        </div>
      </div>

      {/* 2. Page Title */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-xl font-serif font-bold text-slate-800 tracking-wide whitespace-nowrap">
            📖 {monthName} Daily Bible Reading Plan & Rhema Journal
          </h1>
          <p className="text-[10.5px] text-slate-500 mt-0.5 whitespace-nowrap">
            매일 읽을 성경 본문 분량과 읽은 시간, 완독 체크를 기록하고 깨달은 레마의 구절을 보석처럼 캐냅니다.
          </p>
        </div>

        <div className="px-3 py-1 rounded-full text-xs font-bold text-indigo-950 bg-indigo-50 border border-indigo-200 shadow-xs whitespace-nowrap">
          31일 데일리 실행 플래너
        </div>
      </div>

      {/* 3. Main Grid (Left 8 Cols 31-Day Execution Grid / Right 4 Cols Top 3 Rhema & Insight Note) */}
      <div className="grid grid-cols-12 gap-3 flex-1 mb-2">
        {/* Left: 31-Day Execution Table (8 cols, 2 sub-columns of 16 days each) */}
        <div className="col-span-8 border border-slate-200 rounded-2xl p-2.5 bg-slate-50/20 flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1 text-[9.5px] font-bold text-slate-800 font-serif mb-1">
            <span>📅 31일 데일리 성경 통독 실행표 (Daily Reading Schedule)</span>
            <span className="font-mono text-[8px] text-slate-400">Date · Passage · Check · Time</span>
          </div>

          <div className="grid grid-cols-2 gap-2 flex-1 text-[8.5px]">
            {/* Sub-col 1: Day 1 ~ 16 */}
            <div className="space-y-0.5 flex flex-col justify-around">
              {Array.from({ length: 16 }, (_, i) => i + 1).map((d) => (
                <div key={d} className="flex items-center gap-1.5 bg-white px-2 py-0.5 rounded border border-slate-200/80">
                  <span className="font-mono font-bold text-indigo-700 w-5">Day {String(d).padStart(2, '0')}</span>
                  <div className="flex-1 text-slate-400 font-serif text-[8px]">_______________________</div>
                  <span className="w-3.5 h-3.5 rounded border border-slate-300 bg-slate-50 flex items-center justify-center text-[7px] text-slate-300">✓</span>
                </div>
              ))}
            </div>

            {/* Sub-col 2: Day 17 ~ 31 */}
            <div className="space-y-0.5 flex flex-col justify-around">
              {Array.from({ length: 15 }, (_, i) => i + 17).map((d) => (
                <div key={d} className="flex items-center gap-1.5 bg-white px-2 py-0.5 rounded border border-slate-200/80">
                  <span className="font-mono font-bold text-indigo-700 w-5">Day {String(d).padStart(2, '0')}</span>
                  <div className="flex-1 text-slate-400 font-serif text-[8px]">_______________________</div>
                  <span className="w-3.5 h-3.5 rounded border border-slate-300 bg-slate-50 flex items-center justify-center text-[7px] text-slate-300">✓</span>
                </div>
              ))}
              {/* Extra Goal slot for Day 31+ */}
              <div className="flex items-center gap-1.5 bg-indigo-50/50 px-2 py-0.5 rounded border border-indigo-200">
                <span className="font-bold text-indigo-900 text-[8px]">이달 완주</span>
                <div className="flex-1 text-indigo-700 font-serif text-[8px] font-bold">월간 통독 목표 완료!</div>
                <span className="w-3.5 h-3.5 rounded bg-indigo-600 text-white flex items-center justify-center text-[8px] font-bold">★</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Top 3 Rhema Passages & Spiritual Insights (4 cols) */}
        <div className="col-span-4 flex flex-col justify-between space-y-2">
          {/* Top 3 Rhema */}
          <div className="border border-indigo-200/90 rounded-2xl p-2.5 bg-indigo-50/20 flex-1 flex flex-col justify-between shadow-2xs space-y-1">
            <div className="flex items-center justify-between border-b border-indigo-200 pb-1 text-[9.5px]">
              <span className="font-bold text-indigo-950 font-serif">💎 이달의 레마(Rhema) 말씀 3선</span>
              <span className="font-mono text-[8px] text-indigo-400">Top 3 Passages</span>
            </div>
            <div className="space-y-1 flex-1 flex flex-col justify-around text-[8.5px]">
              {[1, 2, 3].map((rNo) => (
                <div key={rNo} className="bg-white p-1.5 rounded-xl border border-indigo-200/80">
                  <span className="font-bold text-indigo-800 text-[8px] block">구절 {rNo}:</span>
                  <div className="text-slate-400 font-serif text-[8px] min-h-[12px]">_______________________________</div>
                </div>
              ))}
            </div>
          </div>

          {/* Insights Note */}
          <div className="border border-emerald-200/90 rounded-2xl p-2.5 bg-emerald-50/20 flex-1 flex flex-col justify-between shadow-2xs space-y-1">
            <div className="flex items-center justify-between border-b border-emerald-200 pb-1 text-[9.5px]">
              <span className="font-bold text-emerald-950 font-serif">🕊️ 말씀이 준 영적 깨달음 & 삶의 변화</span>
              <span className="text-emerald-700 font-mono text-[8px]">Insight Note</span>
            </div>
            <div className="bg-white p-2 rounded-xl border border-emerald-200/80 flex-1 text-[8.5px]">
              <div className="text-slate-400 font-serif italic min-h-[36px]">"성경을 읽으며 새로 알게 된 하나님의 성품과 나에게 준 은혜를 기록합니다..."</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Footer */}
      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1.5 border-t border-slate-200 mt-1.5">
        <span>PREMIUM DIARY STUDIO — DAILY BIBLE READING PLAN & RHEMA JOURNAL (VOL. 2)</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
