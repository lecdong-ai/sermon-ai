'use client'

import React from 'react'

interface QtKptReviewPortraitProps {
  year?: number
  monthName?: string
  themeColor?: string
  pageWidth?: number
  pageHeight?: number
}

export default function QtKptReviewPortrait({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 1448,
}: QtKptReviewPortraitProps) {
  return (
    <div
      data-page-key="kpt-review-portrait"
      data-page-type="full-bleed"
      className="qt-page relative bg-white text-slate-800 flex flex-col justify-between overflow-hidden shadow-md mx-auto"
      style={{
        width: `${pageWidth}px`,
        height: `${pageHeight}px`,
        padding: '28px 32px',
        boxSizing: 'border-box',
        fontFamily: "'Noto Sans KR', 'Pretendard', sans-serif",
      }}
    >
      {/* 1. Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-300 pb-2 mb-2">
        <div className="flex items-center space-x-3 text-xs font-medium tracking-wider text-slate-400 font-mono">
          <span>YEARLY</span>
          <span>{year}</span>
          <span className="px-2 py-0.5 rounded text-white font-bold" style={{ backgroundColor: themeColor }}>
            {monthName.toUpperCase().slice(0, 3)}
          </span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-indigo-600 text-white font-bold text-[10.5px] shadow-2xs font-mono">
          🔄 RETROSPECTIVE MASTER
        </span>
      </div>

      {/* 2. Page Title */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-xl font-serif font-bold text-slate-800 tracking-wide flex items-center gap-2 whitespace-nowrap">
            <span>🔄 {monthName} Monthly KPT Master</span>
          </h1>
          <p className="text-[11px] text-slate-500 mt-0.5">
            한 달의 성과(Keep), 아쉬운 점(Problem), 개선 시도(Try)를 총괄 회고하는 마스터 서식입니다.
          </p>
        </div>
        <div className="px-3 py-1 rounded-full text-[11px] font-bold text-indigo-950 bg-indigo-50 border border-indigo-200 shadow-2xs whitespace-nowrap">
          월간 통합 성찰 마스터
        </div>
      </div>

      {/* 3. Top Banner: Monthly Big Win & Scorecard */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-indigo-500/10 to-amber-500/10 border border-indigo-200 rounded-xl p-2 mb-2 shadow-2xs space-y-1">
        <div className="flex items-center justify-between border-b border-indigo-200/60 pb-0.5">
          <span className="text-[11px] font-bold text-indigo-950 font-serif flex items-center gap-1.5">
            <span>🏆 MONTHLY BIG WIN & SCORECARD (빛났던 순간 & 점수판)</span>
          </span>
          <span className="text-[10px] font-bold text-indigo-700 font-mono">SCORE</span>
        </div>

        <div className="grid grid-cols-12 gap-2 text-[10.5px]">
          <div className="col-span-7 bg-white/80 p-1.5 rounded-lg border border-indigo-200/60">
            <span className="text-[9.5px] font-bold text-emerald-800 block">🏆 이달의 최고 성과 & 빛난 순간:</span>
            <div className="text-slate-800 font-bold font-serif min-h-[16px]">__________________________________________</div>
          </div>
          <div className="col-span-5 bg-white/80 p-1.5 rounded-lg border border-indigo-200/60 flex items-center justify-around font-mono text-[10px] font-bold">
            <div className="text-center">
              <span className="text-[8.5px] text-slate-400 block">목표달성</span>
              <span className="text-emerald-700 font-extrabold text-xs">___%</span>
            </div>
            <div className="text-center">
              <span className="text-[8.5px] text-slate-400 block">시간효율</span>
              <span className="text-indigo-700 font-extrabold text-xs">___%</span>
            </div>
            <div className="text-center">
              <span className="text-[8.5px] text-slate-400 block">에너지</span>
              <span className="text-amber-700 font-extrabold text-xs">___%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Core 3 KPT Columns Stack */}
      <div className="space-y-2 flex-1 flex flex-col justify-between mb-2">
        {/* Keep Box */}
        <div className="border border-emerald-200 rounded-xl p-2.5 bg-emerald-50/30 flex flex-col justify-between shadow-2xs flex-1">
          <div className="flex items-center justify-between border-b border-emerald-200 pb-1 mb-1">
            <span className="text-[11px] font-bold text-emerald-900 font-serif flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              🟢 Keep (지속할 성과 & 성공 습관)
            </span>
            <span className="text-[9.5px] text-emerald-700 font-mono font-bold">Strengths</span>
          </div>
          <div className="space-y-1 flex-1 flex flex-col justify-around text-[10px]">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white p-1.5 rounded-lg border border-emerald-100/80">
                <span className="text-[9px] font-bold text-emerald-700 block">Keep #{n}:</span>
                <div className="text-slate-400 font-serif text-[10px] min-h-[14px]">__________________________________________</div>
              </div>
            ))}
          </div>
        </div>

        {/* Problem Box */}
        <div className="border border-rose-200 rounded-xl p-2.5 bg-rose-50/30 flex flex-col justify-between shadow-2xs flex-1">
          <div className="flex items-center justify-between border-b border-rose-200 pb-1 mb-1">
            <span className="text-[11px] font-bold text-rose-900 font-serif flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              🔴 Problem (개선할 병목 원인)
            </span>
            <span className="text-[9.5px] text-rose-700 font-mono font-bold">Bottlenecks</span>
          </div>
          <div className="space-y-1 flex-1 flex flex-col justify-around text-[10px]">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white p-1.5 rounded-lg border border-rose-100/80">
                <span className="text-[9px] font-bold text-rose-700 block">Problem #{n}:</span>
                <div className="text-slate-400 font-serif text-[10px] min-h-[14px]">__________________________________________</div>
              </div>
            ))}
          </div>
        </div>

        {/* Try Box */}
        <div className="border border-indigo-200 rounded-xl p-2.5 bg-indigo-50/30 flex flex-col justify-between shadow-2xs flex-1">
          <div className="flex items-center justify-between border-b border-indigo-200 pb-1 mb-1">
            <span className="text-[11px] font-bold text-indigo-900 font-serif flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
              🔵 Try (새롭게 시도할 실행 전략)
            </span>
            <span className="text-[9.5px] text-indigo-700 font-mono font-bold">Innovations</span>
          </div>
          <div className="space-y-1 flex-1 flex flex-col justify-around text-[10px]">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white p-1.5 rounded-lg border border-indigo-100/80">
                <span className="text-[9px] font-bold text-indigo-700 block">Try #{n}:</span>
                <div className="text-slate-400 font-serif text-[10px] min-h-[14px]">__________________________________________</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Bottom Banner */}
      <div className="border border-indigo-200 rounded-xl p-2 bg-indigo-50/60 shadow-2xs mb-1.5 space-y-0.5">
        <div className="flex items-center justify-between text-[10.5px] font-bold text-indigo-950 font-serif">
          <span>💡 이번 달 KPT 회고를 통해 깨달은 핵심 레슨</span>
          <span className="text-indigo-700 font-mono text-[9px]">Growth Insight</span>
        </div>
        <div className="border-b border-dashed border-indigo-200 h-3.5 text-[10px] text-indigo-900/80 font-serif">깨달은 점: ____________________________________________________________________</div>
      </div>

      {/* 6. Footer */}
      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1.5 border-t border-slate-200">
        <span>PREMIUM RETROSPECTIVE STUDIO — KPT RETROSPECTIVE MASTER</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
