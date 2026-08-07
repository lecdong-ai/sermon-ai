'use client'

import React from 'react'

interface QtBibleReadingMapPortrait2Props {
  year?: number
  monthName?: string
  themeColor?: string
  pageWidth?: number
  pageHeight?: number
}

export default function QtBibleReadingMapPortrait2({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 1448,
}: QtBibleReadingMapPortrait2Props) {
  return (
    <div
      data-page-key="bible-map-2-portrait"
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
        <span className="px-3 py-1 rounded-full bg-indigo-600 text-white font-bold text-xs shadow-xs">
          📖 DAILY BIBLE READING PLAN
        </span>
      </div>

      {/* 2. Page Title */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-800 tracking-wide flex items-center gap-2">
            <span>📖 {monthName} Daily Bible Reading Plan</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            매일 읽을 성경 본문 분량과 읽은 시간, 완독 체크를 기록하고 깨달은 레마의 구절을 보석처럼 캐냅니다.
          </p>
        </div>
        <div className="px-4 py-1.5 rounded-full text-xs font-bold text-indigo-950 bg-indigo-50 border border-indigo-200 shadow-xs">
          31일 데일리 실행 플래너
        </div>
      </div>

      {/* 3. Main Stack: 31-Day Execution Table + Rhema & Insights */}
      <div className="space-y-3.5 flex-1 flex flex-col justify-between mb-3">
        {/* 31-Day Execution Table */}
        <div className="border border-slate-200 rounded-2xl p-3.5 bg-slate-50/20 flex-1 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 text-xs font-bold text-slate-800 font-serif mb-1">
            <span>📅 31일 데일리 성경 통독 실행표 (Daily Reading Schedule)</span>
            <span className="font-mono text-xs text-slate-400">Date · Passage · Check · Time</span>
          </div>

          <div className="grid grid-cols-2 gap-3 flex-1 text-xs">
            {/* Sub-col 1: Day 1 ~ 16 */}
            <div className="space-y-1 flex flex-col justify-around">
              {Array.from({ length: 16 }, (_, i) => i + 1).map((d) => (
                <div key={d} className="flex items-center gap-2 bg-white px-2.5 py-1 rounded border border-slate-200/80">
                  <span className="font-mono font-bold text-indigo-700 w-6">Day {String(d).padStart(2, '0')}</span>
                  <div className="flex-1 text-slate-400 font-serif text-xs">_______________________</div>
                  <span className="w-4 h-4 rounded border border-slate-300 bg-slate-50 flex items-center justify-center text-[10px] text-slate-300">✓</span>
                </div>
              ))}
            </div>

            {/* Sub-col 2: Day 17 ~ 31 */}
            <div className="space-y-1 flex flex-col justify-around">
              {Array.from({ length: 15 }, (_, i) => i + 17).map((d) => (
                <div key={d} className="flex items-center gap-2 bg-white px-2.5 py-1 rounded border border-slate-200/80">
                  <span className="font-mono font-bold text-indigo-700 w-6">Day {String(d).padStart(2, '0')}</span>
                  <div className="flex-1 text-slate-400 font-serif text-xs">_______________________</div>
                  <span className="w-4 h-4 rounded border border-slate-300 bg-slate-50 flex items-center justify-center text-[10px] text-slate-300">✓</span>
                </div>
              ))}
              <div className="flex items-center gap-2 bg-indigo-50/50 px-2.5 py-1 rounded border border-indigo-200">
                <span className="font-bold text-indigo-900 text-xs">이달 완주</span>
                <div className="flex-1 text-indigo-700 font-serif text-xs font-bold">월간 통독 목표 완료!</div>
                <span className="w-4 h-4 rounded bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">★</span>
              </div>
            </div>
          </div>
        </div>

        {/* Rhema & Insights Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="border border-indigo-200/90 rounded-2xl p-3 bg-indigo-50/20 flex flex-col justify-between shadow-xs space-y-1.5">
            <div className="flex items-center justify-between border-b border-indigo-200 pb-1">
              <span className="font-bold text-indigo-950 font-serif">💎 이달의 레마 말씀 3선</span>
              <span className="font-mono text-[10px] text-indigo-400">Top 3 Passages</span>
            </div>
            <div className="space-y-1 flex-1 flex flex-col justify-around text-xs">
              {[1, 2, 3].map((rNo) => (
                <div key={rNo} className="bg-white p-1.5 rounded-xl border border-indigo-200/80">
                  <span className="font-bold text-indigo-800 text-[10px] block">구절 {rNo}:</span>
                  <div className="text-slate-400 font-serif text-xs min-h-[14px]">______________________</div>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-emerald-200/90 rounded-2xl p-3 bg-emerald-50/20 flex flex-col justify-between shadow-xs space-y-1.5">
            <div className="flex items-center justify-between border-b border-emerald-200 pb-1">
              <span className="font-bold text-emerald-950 font-serif">🕊️ 영적 깨달음 & 삶의 변화</span>
              <span className="text-emerald-700 font-mono text-[10px]">Insight Note</span>
            </div>
            <div className="bg-white p-2 rounded-xl border border-emerald-200/80 flex-1 text-xs">
              <div className="text-slate-400 font-serif italic min-h-[40px]">"성경을 읽으며 새로 알게 된 하나님의 성품과 내 삶의 순종 결단을 적습니다..."</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Footer */}
      <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-300">
        <span>PREMIUM DIARY STUDIO — DAILY BIBLE READING PLAN & RHEMA JOURNAL (VOL. 2)</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
