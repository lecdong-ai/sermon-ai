'use client'

import React from 'react'

interface QtCultureLogPageProps {
  year?: number
  monthName?: string
  themeColor?: string
  pageWidth?: number
  pageHeight?: number
}

export default function QtCultureLogPage({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 768,
}: QtCultureLogPageProps) {
  return (
    <div
      data-page-key="culture-log"
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
          <span>CULTURE & MEDIA</span>
          <span className="px-2 py-0.5 rounded bg-rose-500 text-white font-bold shadow-xs">CULTURE & MEDIA REVIEW</span>
        </div>
      </div>

      {/* 2. Title */}
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-2xl font-serif font-bold text-slate-800 tracking-wide flex items-center gap-2">
          <span>🎬 {monthName} Culture, Movie & Book Review</span>
        </h1>
        <div className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-xs" style={{ backgroundColor: themeColor }}>
          {year}년 {monthName} 문화생활 & 리뷰 기록
        </div>
      </div>

      {/* 3. 6 Cards Grid (2 rows x 3 cols) */}
      <div className="grid grid-cols-3 gap-3.5 flex-1">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="border border-slate-300 rounded-xl p-3 bg-slate-50/30 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
              <span className="text-[10px] font-bold text-slate-700">#0{i + 1} 제목 (Title)</span>
              <span className="text-[9px] text-amber-500 font-bold">★★★★★</span>
            </div>

            <div className="my-2 border border-dashed border-slate-200 bg-white rounded-lg p-2 text-[10px] text-slate-400 flex-1 flex flex-col justify-between">
              <div className="flex justify-between text-[9px] text-slate-400 mb-1">
                <span>장르: 영화/책/전시</span>
                <span>날짜: 2026.08.__</span>
              </div>
              <div className="space-y-1.5 pt-1">
                <div className="border-b border-dashed border-slate-150 pb-0.5">· 인상 깊었던 한 줄 평:</div>
                <div className="border-b border-dashed border-slate-150 pb-0.5">· </div>
              </div>
            </div>

            <div className="text-[9px] text-slate-400 flex justify-between">
              <span>추천도: 85%</span>
              <span>다시 볼 의향: YES</span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2 border-t border-slate-200 mt-2">
        <span>Bunker Diary Collection · Culture & Media Log</span>
        <span>Page Culture-01</span>
      </div>
    </div>
  )
}
