'use client'

import React from 'react'
import QtQuickIndexNav from './QtQuickIndexNav'

interface QtQuoteCopyingPageProps {
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

export default function QtQuoteCopyingPage({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 768,
}: QtQuoteCopyingPageProps) {
  const monthNum = MONTH_MAP[monthName] || 8

  return (
    <div
      data-page-key="quote"
      data-page-type="full-bleed"
      className="qt-page relative bg-white text-slate-800 flex flex-col justify-between overflow-hidden shadow-md mx-auto"
      style={{
        width: `${pageWidth}px`,
        height: `${pageHeight}px`,
        padding: '20px 48px 20px 24px',
        boxSizing: 'border-box',
        fontFamily: "'Noto Sans KR', 'Pretendard', sans-serif",
      }}
    >
      <QtQuickIndexNav currentMonth={monthNum} activeTab="tracker" themeColor={themeColor} />
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
          <span>READING & QUOTE</span>
          <span className="px-2 py-0.5 rounded bg-purple-500 text-white font-bold shadow-xs">BOOK QUOTE & INSPIRATION</span>
        </div>
      </div>

      {/* 2. Title */}
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-2xl font-serif font-bold text-slate-800 tracking-wide flex items-center gap-2">
          <span>📖 {monthName} Inspired Quotes & Book Excerpts</span>
        </h1>
        <div className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-xs" style={{ backgroundColor: themeColor }}>
          {year}년 {monthName} 명언 & 독서 필사 노트
        </div>
      </div>

      {/* 3. Main Content: 2 Cards Side-by-Side */}
      <div className="grid grid-cols-2 gap-4 flex-1">
        {/* Quote Card 1 */}
        <div className="border border-slate-300 rounded-xl p-4 bg-slate-50/40 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              📜 이달의 영감 필사 #01
            </span>
            <span className="text-[10px] text-slate-400">Book / Article / Speech</span>
          </div>

          <div className="my-3 border-l-2 border-purple-400 pl-3 py-1 bg-white rounded-r-lg p-3 shadow-2xs">
            <p className="text-xs font-serif text-slate-700 leading-relaxed italic">
              &quot;시작하는 방법은 말하기를 그만두고 실행하는 것이다.&quot;
            </p>
            <p className="text-[10px] text-slate-400 text-right mt-1.5 font-sans">— 월트 디즈니 (Walt Disney)</p>
          </div>

          <div className="flex-1 border border-slate-200 bg-white rounded-lg p-3 flex flex-col justify-between">
            <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              ✍️ 손글씨 필사 & 나의 생각 기록 (My Reflections)
            </h5>
            <div className="space-y-2 flex-1 pt-1">
              <div className="border-b border-dashed border-slate-200 h-6" />
              <div className="border-b border-dashed border-slate-200 h-6" />
              <div className="border-b border-dashed border-slate-200 h-6" />
            </div>
          </div>
        </div>

        {/* Quote Card 2 */}
        <div className="border border-slate-300 rounded-xl p-4 bg-slate-50/40 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: themeColor }} />
              📜 이달의 영감 필사 #02
            </span>
            <span className="text-[10px] text-slate-400">Book / Article / Speech</span>
          </div>

          <div className="my-3 border-l-2 border-slate-400 pl-3 py-1 bg-white rounded-r-lg p-3 shadow-2xs">
            <p className="text-xs font-serif text-slate-700 leading-relaxed italic">
              &quot;우리가 반복해서 하는 행동이 바로 우리다. 그러므로 탁월함은 행동이 아니라 습관이다.&quot;
            </p>
            <p className="text-[10px] text-slate-400 text-right mt-1.5 font-sans">— 아리스토텔레스 (Aristotle)</p>
          </div>

          <div className="flex-1 border border-slate-200 bg-white rounded-lg p-3 flex flex-col justify-between">
            <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              ✍️ 손글씨 필사 & 나의 생각 기록 (My Reflections)
            </h5>
            <div className="space-y-2 flex-1 pt-1">
              <div className="border-b border-dashed border-slate-200 h-6" />
              <div className="border-b border-dashed border-slate-200 h-6" />
              <div className="border-b border-dashed border-slate-200 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2 border-t border-slate-200 mt-2">
        <span>Bunker Diary Collection · Quote & Reading Copying</span>
        <span>Page Quote-01</span>
      </div>
    </div>
  )
}
