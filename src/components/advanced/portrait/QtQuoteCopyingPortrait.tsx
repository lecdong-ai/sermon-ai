'use client'

import React from 'react'

interface QtQuoteCopyingPortraitProps {
  year?: number
  monthName?: string
  themeColor?: string
  pageWidth?: number
  pageHeight?: number
}

export default function QtQuoteCopyingPortrait({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 768,
  pageHeight = 1024,
}: QtQuoteCopyingPortraitProps) {
  return (
    <div
      data-page-key="quote-copying-portrait"
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
        <span className="px-2 py-0.5 rounded bg-purple-500 text-white font-bold text-[10px]">QUOTE & READING</span>
      </div>

      {/* Title */}
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-serif font-bold text-slate-800 tracking-wide">
          📖 {monthName} Book Excerpts & Quotes
        </h1>
        <div className="px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white shadow-xs" style={{ backgroundColor: themeColor }}>
          {year}년 {monthName} 명언 필사
        </div>
      </div>

      {/* Card 1 */}
      <div className="border border-slate-300 rounded-xl p-3.5 bg-slate-50/40 space-y-2 mb-3">
        <div className="flex items-center justify-between border-b border-slate-200 pb-1">
          <span className="text-[11px] font-bold text-slate-700">📜 이달의 문장 #01</span>
          <span className="text-[10px] text-slate-400">도서명 / 출처: ____________</span>
        </div>
        <div className="border-l-2 border-purple-400 pl-3 py-1.5 bg-white rounded-r-lg">
          <p className="text-xs font-serif text-slate-700 italic">
            &quot;삶이 있는 한 희망은 있다.&quot; — 키케로
          </p>
        </div>
        <div className="space-y-2 pt-1">
          <div className="border-b border-dashed border-slate-200 h-5" />
          <div className="border-b border-dashed border-slate-200 h-5" />
        </div>
      </div>

      {/* Card 2 */}
      <div className="flex-1 border border-slate-300 rounded-xl p-3.5 bg-slate-50/40 flex flex-col justify-between mb-3">
        <div className="flex items-center justify-between border-b border-slate-200 pb-1">
          <span className="text-[11px] font-bold text-slate-700">📜 이달의 문장 #02</span>
          <span className="text-[10px] text-slate-400">도서명 / 출처: ____________</span>
        </div>
        <div className="border-l-2 border-slate-400 pl-3 py-1.5 bg-white rounded-r-lg my-2">
          <p className="text-xs font-serif text-slate-700 italic">
            &quot;가장 어두운 밤도 결국 지나가고 해는 떠오를 것이다.&quot; — 빅토르 위고
          </p>
        </div>
        <div className="flex-1 space-y-2 pt-1">
          <div className="border-b border-dashed border-slate-200 h-6" />
          <div className="border-b border-dashed border-slate-200 h-6" />
          <div className="border-b border-dashed border-slate-200 h-6" />
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2 border-t border-slate-200 mt-2">
        <span>Bunker Diary · Quote & Reading (Portrait)</span>
        <span>Page Quote-01P</span>
      </div>
    </div>
  )
}
