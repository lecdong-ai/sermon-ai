'use client'

import React from 'react'

interface QtKptReviewPageProps {
  year?: number
  monthName?: string
  themeColor?: string
  pageWidth?: number
  pageHeight?: number
}

export default function QtKptReviewPage({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 768,
}: QtKptReviewPageProps) {
  return (
    <div
      data-page-key="kpt-review"
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
      <div className="flex items-center justify-between border-b border-slate-400 pb-2 mb-3">
        <div className="flex items-center space-x-3 text-[11px] font-medium tracking-wider text-slate-400">
          <span>YEARLY</span>
          <span>{year}</span>
          <span className="px-1.5 py-0.5 rounded text-white font-bold" style={{ backgroundColor: themeColor }}>
            {monthName.toUpperCase().slice(0, 3)}
          </span>
        </div>

        <div className="flex items-center space-x-3 text-[11px] font-medium text-slate-400">
          <span>MONTHLY</span>
          <span>RETROSPECTIVE</span>
          <span className="px-2 py-0.5 rounded bg-indigo-600 text-white font-bold shadow-xs">WEEKLY & MONTHLY KPT REVIEW</span>
        </div>
      </div>

      {/* 2. Title */}
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-2xl font-serif font-bold text-slate-800 tracking-wide flex items-center gap-2">
          <span>🔄 {monthName} Weekly & Monthly KPT Review</span>
        </h1>
        <div className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-xs" style={{ backgroundColor: themeColor }}>
          {year}년 {monthName} 성과 & 성장 KPT 회고
        </div>
      </div>

      {/* 3. Main KPT 3 Columns */}
      <div className="grid grid-cols-3 gap-4 flex-1">
        {/* Keep Column */}
        <div className="border border-emerald-300 rounded-xl p-3.5 bg-emerald-50/20 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
            <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              🟢 Keep (잘해와서 유지할 점)
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold">Strengths</span>
          </div>

          <div className="my-2 text-[10px] text-slate-500 italic bg-white p-2 rounded-lg border border-emerald-100">
            성과가 좋았거나 계속 유지해야 할 훌륭한 습관/작업 방식을 기록합니다.
          </div>

          <div className="flex-1 border border-slate-200 bg-white rounded-lg p-3 space-y-3">
            <div className="border-b border-dashed border-slate-200 pb-2 text-[10px] text-slate-400">1. </div>
            <div className="border-b border-dashed border-slate-200 pb-2 text-[10px] text-slate-400">2. </div>
            <div className="border-b border-dashed border-slate-200 pb-2 text-[10px] text-slate-400">3. </div>
          </div>
        </div>

        {/* Problem Column */}
        <div className="border border-rose-300 rounded-xl p-3.5 bg-rose-50/20 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-rose-200 pb-2">
            <span className="text-[11px] font-bold text-rose-800 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              🔴 Problem (아쉬웠거나 원인 파악할 점)
            </span>
            <span className="text-[10px] text-rose-600 font-semibold">Bottlenecks</span>
          </div>

          <div className="my-2 text-[10px] text-slate-500 italic bg-white p-2 rounded-lg border border-rose-100">
            진행 과정에서 발생한 비효율, 방해 요소, 문제점의 원인을 솔직하게 분석합니다.
          </div>

          <div className="flex-1 border border-slate-200 bg-white rounded-lg p-3 space-y-3">
            <div className="border-b border-dashed border-slate-200 pb-2 text-[10px] text-slate-400">1. </div>
            <div className="border-b border-dashed border-slate-200 pb-2 text-[10px] text-slate-400">2. </div>
            <div className="border-b border-dashed border-slate-200 pb-2 text-[10px] text-slate-400">3. </div>
          </div>
        </div>

        {/* Try Column */}
        <div className="border border-indigo-300 rounded-xl p-3.5 bg-indigo-50/20 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-indigo-200 pb-2">
            <span className="text-[11px] font-bold text-indigo-800 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              🔵 Try (새로 시도할 구체적 구상)
            </span>
            <span className="text-[10px] text-indigo-600 font-semibold">Action Items</span>
          </div>

          <div className="my-2 text-[10px] text-slate-500 italic bg-white p-2 rounded-lg border border-indigo-100">
            Problem을 해결하고 더 발전하기 위해 다음 주/다음 달 실행할 액션을 적습니다.
          </div>

          <div className="flex-1 border border-slate-200 bg-white rounded-lg p-3 space-y-3">
            <div className="border-b border-dashed border-slate-200 pb-2 text-[10px] text-slate-400">1. </div>
            <div className="border-b border-dashed border-slate-200 pb-2 text-[10px] text-slate-400">2. </div>
            <div className="border-b border-dashed border-slate-200 pb-2 text-[10px] text-slate-400">3. </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2 border-t border-slate-200 mt-2">
        <span>Bunker Diary Collection · KPT Retrospective Review</span>
        <span>Page KPT-01</span>
      </div>
    </div>
  )
}
