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
          🔄 MONTHLY RETROSPECTIVE MASTER
        </span>
      </div>

      {/* 2. Page Title */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-800 tracking-wide flex items-center gap-2">
            <span>🔄 {monthName} Monthly KPT Master</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            한 달의 성공 요인(Keep), 아쉬운 점(Problem), 개선 시도(Try)를 정밀 총괄 회고하는 마스터 서식입니다.
          </p>
        </div>
        <div className="px-4 py-1.5 rounded-full text-xs font-bold text-indigo-950 bg-indigo-50 border border-indigo-200 shadow-xs">
          월간 통합 성찰 마스터
        </div>
      </div>

      {/* 3. Top Banner: Monthly Big Win & Scorecard */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-indigo-500/10 to-amber-500/10 border border-indigo-200/80 rounded-2xl p-3 mb-3 shadow-xs space-y-2">
        <div className="flex items-center justify-between border-b border-indigo-200/60 pb-1">
          <span className="text-xs font-bold text-indigo-950 font-serif flex items-center gap-1.5">
            <span>🏆 MONTHLY BIG WIN & SCORECARD (이번 달 가장 빛났던 순간 & 점수판)</span>
          </span>
          <span className="text-xs font-bold text-indigo-700 font-mono">RETROSPECTIVE SCORE</span>
        </div>

        <div className="grid grid-cols-12 gap-2 text-xs">
          <div className="col-span-7 bg-white/80 p-2 rounded-xl border border-indigo-200/60">
            <span className="text-[10px] font-bold text-emerald-800 block">🏆 이번 달 최고 성과 & 빛난 순간:</span>
            <div className="text-slate-800 font-bold font-serif min-h-[18px]">__________________________________________</div>
          </div>
          <div className="col-span-5 bg-white/80 p-2 rounded-xl border border-indigo-200/60 flex items-center justify-around font-mono text-xs font-bold">
            <div className="text-center">
              <span className="text-[9px] text-slate-400 block">목표 달성도</span>
              <span className="text-emerald-700 font-extrabold text-sm">___%</span>
            </div>
            <div className="text-center">
              <span className="text-[9px] text-slate-400 block">시간 효율성</span>
              <span className="text-indigo-700 font-extrabold text-sm">___%</span>
            </div>
            <div className="text-center">
              <span className="text-[9px] text-slate-400 block">에너지/지수</span>
              <span className="text-amber-700 font-extrabold text-sm">___%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Core 3 KPT Columns Stack */}
      <div className="space-y-3 flex-1 flex flex-col justify-between mb-3">
        {/* Keep Box */}
        <div className="border border-emerald-300/80 rounded-2xl p-3 bg-emerald-50/30 flex flex-col justify-between shadow-xs flex-1">
          <div className="flex items-center justify-between border-b border-emerald-200 pb-1.5 mb-1.5">
            <span className="text-xs font-bold text-emerald-900 font-serif flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              🟢 Keep (잘해와서 지속할 성과 & 습관)
            </span>
            <span className="text-xs text-emerald-700 font-mono font-bold">Strengths</span>
          </div>
          <div className="space-y-1.5 flex-1 flex flex-col justify-around text-xs">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white p-2 rounded-xl border border-emerald-100/80">
                <span className="text-[10px] font-bold text-emerald-700 block">Keep #{n}:</span>
                <div className="text-slate-400 font-serif text-xs min-h-[16px]">__________________________________________</div>
              </div>
            ))}
          </div>
        </div>

        {/* Problem Box */}
        <div className="border border-rose-300/80 rounded-2xl p-3 bg-rose-50/30 flex flex-col justify-between shadow-xs flex-1">
          <div className="flex items-center justify-between border-b border-rose-200 pb-1.5 mb-1.5">
            <span className="text-xs font-bold text-rose-900 font-serif flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
              🔴 Problem (아쉬웠거나 해결할 병목 원인)
            </span>
            <span className="text-xs text-rose-700 font-mono font-bold">Bottlenecks</span>
          </div>
          <div className="space-y-1.5 flex-1 flex flex-col justify-around text-xs">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white p-2 rounded-xl border border-rose-100/80">
                <span className="text-[10px] font-bold text-rose-700 block">Problem #{n}:</span>
                <div className="text-slate-400 font-serif text-xs min-h-[16px]">__________________________________________</div>
              </div>
            ))}
          </div>
        </div>

        {/* Try Box */}
        <div className="border border-indigo-300/80 rounded-2xl p-3 bg-indigo-50/30 flex flex-col justify-between shadow-xs flex-1">
          <div className="flex items-center justify-between border-b border-indigo-200 pb-1.5 mb-1.5">
            <span className="text-xs font-bold text-indigo-900 font-serif flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
              🔵 Try (새롭게 시도할 혁신 아이디어)
            </span>
            <span className="text-xs text-indigo-700 font-mono font-bold">Innovations</span>
          </div>
          <div className="space-y-1.5 flex-1 flex flex-col justify-around text-xs">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white p-2 rounded-xl border border-indigo-100/80">
                <span className="text-[10px] font-bold text-indigo-700 block">Try #{n}:</span>
                <div className="text-slate-400 font-serif text-xs min-h-[16px]">__________________________________________</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Bottom Banner */}
      <div className="border border-indigo-200/90 rounded-2xl p-3 bg-indigo-50/60 shadow-xs mb-2 space-y-1">
        <div className="flex items-center justify-between text-xs font-bold text-indigo-950">
          <span>💡 이번 달 KPT 회고를 통해 깨달은 핵심 레슨 & 셀프 칭찬</span>
          <span className="text-indigo-700 font-mono">Key Growth Insight</span>
        </div>
        <div className="border-b border-dashed border-indigo-200 h-4 text-xs text-indigo-900/80 font-serif">깨달은 점: ____________________________________________________________________</div>
      </div>

      {/* 6. Footer */}
      <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-300">
        <span>PREMIUM RETROSPECTIVE STUDIO — MONTHLY KPT RETROSPECTIVE MASTER (VOL. 1)</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
