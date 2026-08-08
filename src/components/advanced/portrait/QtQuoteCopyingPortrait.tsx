'use client'

import React from 'react'
import QtQuickIndexNavPortrait from './QtQuickIndexNavPortrait'

interface QtQuoteCopyingPortraitProps {
  year?: number
  monthName?: string
  themeColor?: string
  pageWidth?: number
  pageHeight?: number
}

const MONTH_MAP: Record<string, number> = {
  January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
  July: 7, August: 8, September: 9, October: 10, November: 11, December: 12,
}

export default function QtQuoteCopyingPortrait({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 1448,
}: QtQuoteCopyingPortraitProps) {
  const monthNum = MONTH_MAP[monthName] || 8

  return (
    <div
      data-page-key="quote"
      data-page-type="full-bleed"
      className="qt-page relative bg-white text-slate-800 flex flex-col justify-between overflow-hidden shadow-md mx-auto"
      style={{
        width: `${pageWidth}px`,
        height: `${pageHeight}px`,
        padding: '52px 48px 20px 24px',
        boxSizing: 'border-box',
        fontFamily: "'Noto Sans KR', 'Pretendard', sans-serif",
      }}
    >
      <QtQuickIndexNavPortrait currentMonth={monthNum} activeTab="tracker" themeColor={themeColor} />
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-400 pb-2 mb-3">
        <div className="flex items-center space-x-2 text-[11px] font-medium tracking-wider text-slate-400 font-mono">
          <span>YEARLY</span>
          <span>{year}</span>
          <span className="px-1.5 py-0.5 rounded text-white font-bold" style={{ backgroundColor: themeColor }}>
            {monthName.toUpperCase().slice(0, 3)}
          </span>
        </div>
        <span className="px-2 py-0.5 rounded bg-purple-500 text-white font-bold text-[10px] whitespace-nowrap shadow-2xs">QUOTE & READING</span>
      </div>

      {/* Title */}
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-serif font-bold text-slate-800 tracking-wide whitespace-nowrap">
          📖 {monthName} Book Excerpts & Quotes
        </h1>
        <div className="px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white shadow-xs whitespace-nowrap" style={{ backgroundColor: themeColor }}>
          {year}년 {monthName} 명언 필사
        </div>
      </div>

      {/* Card 1 */}
      <div className="border border-slate-300 rounded-xl p-3.5 bg-slate-50/40 space-y-2 mb-3">
        <div className="flex items-center justify-between border-b border-slate-200 pb-1">
          <span className="text-[11px] font-bold text-slate-700 whitespace-nowrap shrink-0">📜 이달의 영감 필사 #01</span>
          <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">도서명 / 출처: ____________</span>
        </div>
        <div className="border-l-2 border-purple-400 pl-3 py-2 bg-white rounded-r-lg shadow-2xs">
          <p className="text-xs font-serif font-semibold text-slate-800 leading-relaxed italic tracking-tight">
            &quot;시작하는 방법은 말하기를 그만두고 실행하는 것이다.&quot;
          </p>
          <p className="text-[10px] font-serif text-slate-500 text-right mt-1 font-medium">— 월트 디즈니 (Walt Disney)</p>
        </div>
        <div className="space-y-2 pt-1">
          <div className="border-b border-dashed border-slate-200 h-5" />
          <div className="border-b border-dashed border-slate-200 h-5" />
        </div>
      </div>

      {/* Card 2 */}
      <div className="flex-1 border border-slate-300 rounded-xl p-3.5 bg-slate-50/40 flex flex-col justify-between mb-3">
        <div className="flex items-center justify-between border-b border-slate-200 pb-1">
          <span className="text-[11px] font-bold text-slate-700 whitespace-nowrap shrink-0">📜 이달의 영감 필사 #02</span>
          <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">도서명 / 출처: ____________</span>
        </div>
        <div className="border-l-2 border-slate-400 pl-3 py-2 bg-white rounded-r-lg my-2 shadow-2xs">
          <p className="text-xs font-serif font-semibold text-slate-800 leading-relaxed italic tracking-tight">
            &quot;우리가 반복해서 하는 행동이 바로 우리다. 그러므로 탁월함은 행동이 아니라 습관이다.&quot;
          </p>
          <p className="text-[10px] font-serif text-slate-500 text-right mt-1 font-medium">— 아리스토텔레스 (Aristotle)</p>
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
