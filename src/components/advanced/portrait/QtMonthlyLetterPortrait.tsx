'use client'

import React from 'react'

interface QtMonthlyLetterPortraitProps {
  year?: number
  monthName?: string
  themeColor?: string
  pageWidth?: number
  pageHeight?: number
}

export default function QtMonthlyLetterPortrait({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 768,
  pageHeight = 1024,
}: QtMonthlyLetterPortraitProps) {
  return (
    <div
      data-page-key="monthly-letter-portrait"
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
      {/* 1. Header Navigation Bar */}
      <div className="flex items-center justify-between border-b border-slate-400 pb-2 mb-3">
        <div className="flex items-center space-x-3 text-[11px] font-medium tracking-wider text-slate-400">
          <span data-nav-target="calendar" className="cursor-pointer hover:text-slate-600">YEARLY</span>
          <span>{year}</span>
          <span data-nav-target="calendar" className="px-1.5 py-0.5 rounded text-white font-bold cursor-pointer" style={{ backgroundColor: themeColor }}>
            {monthName.toUpperCase().slice(0, 3)}
          </span>
        </div>

        <div className="flex items-center space-x-3 text-[11px] font-medium text-slate-400">
          <span data-nav-target="calendar" className="hover:text-slate-600 cursor-pointer">MONTHLY</span>
          <span data-nav-target="overview" className="hover:text-slate-600 cursor-pointer">OVERVIEW</span>
          <span className="px-2 py-0.5 rounded bg-rose-500 text-white font-bold cursor-pointer shadow-xs">LETTER TO GOD</span>
        </div>
      </div>

      {/* 2. Page Title */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-800 tracking-wide flex items-center gap-2">
            <span>💌 {monthName} Letter to God & Reflection</span>
          </h1>
          <p className="text-[11px] text-slate-500 mt-0.5">한 달을 마감하며 하나님께 감사와 마음을 담아 써 내리는 편지</p>
        </div>
        <div className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-xs" style={{ backgroundColor: themeColor }}>
          {year}년 {monthName} 월말 편지
        </div>
      </div>

      {/* 3. Letter Box */}
      <div className="border-2 border-dashed border-rose-300 rounded-2xl p-5 bg-gradient-to-b from-rose-50/30 via-white to-amber-50/30 flex-1 flex flex-col justify-between shadow-2xs">
        <div className="flex items-center justify-between border-b border-rose-200 pb-2 mb-3">
          <span className="text-base font-serif font-extrabold text-rose-900 tracking-wider">
            Dear My Heavenly Father,
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            Date: {year}년 {monthName} 마지막 날
          </span>
        </div>

        <div className="space-y-4 flex-1 flex flex-col justify-around py-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((l) => (
            <div key={l} className="border-b border-rose-200/70 pb-1.5 flex items-center gap-3">
              <span className="text-[10px] text-rose-300 font-serif font-bold">{l}.</span>
              <div className="text-[11px] text-slate-400 font-serif italic">
                (하나님, 지난 한 달 동안 저의 삶을 동행해 주셔서 감사합니다...)
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-rose-200 pt-2 flex items-center justify-between text-xs text-rose-900 font-serif font-bold">
          <span>&quot;은혜 위에 은혜가 더했던 한 달이었습니다.&quot;</span>
          <span className="italic">Yours faithfully 🕊️</span>
        </div>
      </div>

      {/* 4. Footer */}
      <div className="flex items-center justify-between border-t border-slate-300 pt-2 mt-2 text-[10px] text-slate-400">
        <span>SERMON AI QT DIARY — END-OF-MONTH LETTER TO GOD</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
