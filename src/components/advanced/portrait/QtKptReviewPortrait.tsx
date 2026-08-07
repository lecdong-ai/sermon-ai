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
  pageWidth = 768,
  pageHeight = 1024,
}: QtKptReviewPortraitProps) {
  return (
    <div
      data-page-key="kpt-review-portrait"
      data-page-type="full-bleed"
      className="qt-page relative bg-white text-slate-800 flex flex-col justify-between overflow-hidden shadow-md mx-auto"
      style={{
        width: `${pageWidth}px`,
        height: `${pageHeight}px`,
        padding: '28px 24px',
        boxSizing: 'border-box',
        fontFamily: "'Noto Sans KR', 'Pretendard', sans-serif",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-400 pb-2 mb-3">
        <div className="flex items-center space-x-2 text-[11px] font-medium tracking-wider text-slate-400">
          <span>YEARLY</span>
          <span>{year}</span>
          <span className="px-1.5 py-0.5 rounded text-white font-bold" style={{ backgroundColor: themeColor }}>
            {monthName.toUpperCase().slice(0, 3)}
          </span>
        </div>
        <span className="px-2 py-0.5 rounded bg-indigo-600 text-white font-bold text-[10px]">KPT RETROSPECTIVE</span>
      </div>

      {/* Title */}
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-serif font-bold text-slate-800 tracking-wide">
          🔄 {monthName} KPT Retrospective
        </h1>
        <div className="px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white shadow-xs" style={{ backgroundColor: themeColor }}>
          {year}년 {monthName} KPT 회고
        </div>
      </div>

      {/* Main KPT 3 Sections Vertical */}
      <div className="flex-1 flex flex-col space-y-3 mb-3">
        {/* Keep */}
        <div className="border border-emerald-300 rounded-xl p-3 bg-emerald-50/20 flex-1 flex flex-col justify-between">
          <h4 className="text-[11px] font-bold text-emerald-800 flex items-center gap-1.5 border-b border-emerald-200 pb-1">
            🟢 Keep (지속하고 발전시킬 점)
          </h4>
          <div className="flex-1 space-y-1.5 pt-2 text-[10px] text-slate-400">
            <div className="border-b border-dashed border-slate-200 pb-1">1. </div>
            <div className="border-b border-dashed border-slate-200 pb-1">2. </div>
          </div>
        </div>

        {/* Problem */}
        <div className="border border-rose-300 rounded-xl p-3 bg-rose-50/20 flex-1 flex flex-col justify-between">
          <h4 className="text-[11px] font-bold text-rose-800 flex items-center gap-1.5 border-b border-rose-200 pb-1">
            🔴 Problem (개선하고 해결할 비효율)
          </h4>
          <div className="flex-1 space-y-1.5 pt-2 text-[10px] text-slate-400">
            <div className="border-b border-dashed border-slate-200 pb-1">1. </div>
            <div className="border-b border-dashed border-slate-200 pb-1">2. </div>
          </div>
        </div>

        {/* Try */}
        <div className="border border-indigo-300 rounded-xl p-3 bg-indigo-50/20 flex-1 flex flex-col justify-between">
          <h4 className="text-[11px] font-bold text-indigo-800 flex items-center gap-1.5 border-b border-indigo-200 pb-1">
            🔵 Try (다음 주/다음 달 실천할 구체적 액션)
          </h4>
          <div className="flex-1 space-y-1.5 pt-2 text-[10px] text-slate-400">
            <div className="border-b border-dashed border-slate-200 pb-1">1. </div>
            <div className="border-b border-dashed border-slate-200 pb-1">2. </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2 border-t border-slate-200 mt-2">
        <span>Bunker Diary · KPT Retrospective (Portrait)</span>
        <span>Page KPT-01P</span>
      </div>
    </div>
  )
}
