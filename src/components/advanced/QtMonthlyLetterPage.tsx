'use client'

import React from 'react'
import QtQuickIndexNav from './QtQuickIndexNav'

interface QtMonthlyLetterPageProps {
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

export default function QtMonthlyLetterPage({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 768,
}: QtMonthlyLetterPageProps) {
  const monthNum = MONTH_MAP[monthName] || 8

  return (
    <div
      data-page-key="letter"
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
      {/* 1. Header Navigation Bar */}
      <div className="flex items-center justify-between border-b border-slate-300 pb-2 mb-2">
        <div className="flex items-center space-x-3 text-[11px] font-medium tracking-wider text-slate-400 font-mono">
          <span>YEARLY</span>
          <span>{year}</span>
          <span className="px-2 py-0.5 rounded text-white font-bold" style={{ backgroundColor: themeColor }}>
            {monthName.toUpperCase().slice(0, 3)}
          </span>
        </div>

        <div className="flex items-center space-x-3 text-[11px] font-medium text-slate-400">
          <span>MONTHLY LETTER TO GOD (VOL. 1)</span>
          <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-bold text-[10px] shadow-xs">
            💌 편지① 하나님 감사 편지 (VOL. 1)
          </span>
        </div>
      </div>

      {/* 2. Page Title */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-xl font-sans font-bold text-slate-800 tracking-wide whitespace-nowrap">
            💌 {monthName} Letter to God & Gratitude Reflection
          </h1>
          <p className="text-[10.5px] text-slate-500 mt-0.5 whitespace-nowrap">
            한 달을 마감하며 31일간 나의 삶을 지키시고 인도해 주신 하나님 아버지께 고백하는 마음의 손편지
          </p>
        </div>

        <div className="px-3 py-1 rounded-full text-xs font-bold text-rose-950 bg-rose-50 border border-rose-200 shadow-2xs whitespace-nowrap">
          {year}년 {monthName} 하나님 감사 편지
        </div>
      </div>

      {/* 3. Main Content: Left Letter Paper (8 cols) / Right Hymn & Stamp (4 cols) */}
      <div className="grid grid-cols-12 gap-3 flex-1 mb-2">
        {/* Left: Vintage Letter Paper (8 cols) */}
        <div className="col-span-8 border-2 border-dashed border-rose-300 rounded-2xl p-4 bg-gradient-to-b from-rose-50/40 via-white to-amber-50/30 flex flex-col justify-between shadow-2xs relative">
          <div className="flex items-center justify-between border-b border-rose-200 pb-1.5 mb-2 text-[10px]">
            <span className="text-sm font-sans font-extrabold text-rose-900 tracking-wider">
              Dear My Heavenly Father,
            </span>
            <span className="text-slate-400 font-mono">
              Date: {year}년 {monthName} 마지막 날 🕊️
            </span>
          </div>

          {/* Letter Lines */}
          <div className="space-y-2 flex-1 flex flex-col justify-around py-1 text-[8.5px]">
            {[1, 2, 3, 4, 5, 6].map((lineNo) => (
              <div key={lineNo} className="border-b border-rose-200/80 pb-1 flex items-center gap-2">
                <span className="text-rose-300 font-sans font-bold w-3">{lineNo}.</span>
                <div className="text-slate-700 font-sans flex-1 min-h-[14px]">
                  _______________________________________________________
                </div>
              </div>
            ))}
          </div>

          {/* Signature */}
          <div className="border-t border-rose-200 pt-1.5 flex items-center justify-between text-[9.5px] text-rose-900 font-sans font-bold">
            <span>&quot;은혜 위에 은혜가 더했던 복된 한 달이었습니다.&quot;</span>
            <span className="italic">Yours faithfully, 주님의 자녀 드림 🕊️</span>
          </div>
        </div>

        {/* Right: Hymn & Sealed Stamp (4 cols) */}
        <div className="col-span-4 flex flex-col justify-between space-y-2">
          {/* Monthly Hymn & Passage Box */}
          <div className="border border-rose-200 rounded-2xl p-2.5 bg-rose-50/20 flex-1 flex flex-col justify-between shadow-2xs space-y-1">
            <div className="flex items-center justify-between border-b border-rose-200 pb-1 text-[9.5px] font-bold text-rose-950 font-sans">
              <span>🎵 이달의 찬양 & 핵심 말씀</span>
              <span className="font-mono text-[8px] text-rose-400">Song & Verse</span>
            </div>
            <div className="space-y-1.5 flex-1 flex flex-col justify-around text-[8.5px]">
              <div className="bg-white p-1.5 rounded-xl border border-rose-200/80">
                <span className="font-bold text-rose-800 text-[8px] block">🎶 깊은 위로를 준 찬양:</span>
                <div className="text-slate-400 font-sans text-[8px] min-h-[12px]">___________________________</div>
              </div>
              <div className="bg-white p-1.5 rounded-xl border border-rose-200/80">
                <span className="font-bold text-rose-800 text-[8px] block">📖 한 달간 붙잡은 말씀:</span>
                <div className="text-slate-400 font-sans text-[8px] min-h-[12px]">___________________________</div>
              </div>
            </div>
          </div>

          {/* Sealed Blessing Stamp Emblem */}
          <div className="border border-amber-200 rounded-2xl p-2.5 bg-gradient-to-r from-amber-50/50 to-rose-50/50 flex flex-col items-center justify-center text-center shadow-2xs space-y-1">
            <div className="w-9 h-9 rounded-full bg-rose-600 text-white flex items-center justify-center font-sans text-sm font-bold shadow-xs">
              SEAL
            </div>
            <span className="font-sans font-bold text-[9px] text-amber-950">
              31일간의 여정을 주님께 드리며 👑
            </span>
            <span className="text-[7.5px] text-slate-400">
              Blessed & Dedicated to God
            </span>
          </div>
        </div>
      </div>

      {/* 4. Footer */}
      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1.5 border-t border-slate-200 mt-1.5">
        <span>PREMIUM DIARY STUDIO — MONTHLY LETTER TO GOD (VOL. 1)</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
