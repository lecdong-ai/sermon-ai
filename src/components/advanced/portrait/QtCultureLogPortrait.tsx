'use client'

import React from 'react'

interface QtCultureLogPortraitProps {
  year?: number
  monthName?: string
  themeColor?: string
  pageWidth?: number
  pageHeight?: number
}

export default function QtCultureLogPortrait({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 768,
  pageHeight = 1024,
}: QtCultureLogPortraitProps) {
  return (
    <div
      data-page-key="culture-log-portrait"
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
        <span className="px-2 py-0.5 rounded bg-rose-500 text-white font-bold text-[10px]">CULTURE & MEDIA</span>
      </div>

      {/* Title */}
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-serif font-bold text-slate-800 tracking-wide">
          🎬 {monthName} Culture & Movie Review
        </h1>
        <div className="px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white shadow-xs" style={{ backgroundColor: themeColor }}>
          {year}년 {monthName} 문화 리뷰
        </div>
      </div>

      {/* 4 Cards Grid */}
      <div className="flex-1 grid grid-cols-2 gap-3 mb-3">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="border border-slate-300 rounded-xl p-3 bg-slate-50/30 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1 text-[10px]">
              <span className="font-bold text-slate-700">#0{i + 1} 콘텐츠 제목</span>
              <span className="text-amber-500 font-bold">★★★★☆</span>
            </div>

            <div className="my-2 border border-slate-200 bg-white rounded-lg p-2 flex-1 flex flex-col justify-between text-[9px] text-slate-400">
              <div className="border-b border-dashed border-slate-150 pb-1">· 감상평 & 핵심 문장:</div>
              <div className="border-b border-dashed border-slate-150 pb-1">· </div>
              <div className="border-b border-dashed border-slate-150 pb-1">· </div>
            </div>

            <div className="text-[9px] text-slate-400 text-right">
              장르: 영화/도서/전시
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2 border-t border-slate-200 mt-2">
        <span>Bunker Diary · Culture & Media (Portrait)</span>
        <span>Page Culture-01P</span>
      </div>
    </div>
  )
}
