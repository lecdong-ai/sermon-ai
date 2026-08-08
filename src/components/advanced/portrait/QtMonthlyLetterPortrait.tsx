'use client'

import React from 'react'
import QtQuickIndexNavPortrait from './QtQuickIndexNavPortrait'

interface QtMonthlyLetterPortraitProps {
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

export default function QtMonthlyLetterPortrait({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 1448,
}: QtMonthlyLetterPortraitProps) {
  const monthNum = MONTH_MAP[monthName] || 8

  return (
    <div
      data-page-key="tracker"
      data-page-type="full-bleed"
      className="qt-page relative bg-white text-slate-800 flex flex-col justify-between overflow-hidden shadow-md mx-auto"
      style={{
        width: `${pageWidth}px`,
        height: `${pageHeight}px`,
        padding: '52px 20px 20px 20px',
        boxSizing: 'border-box',
        fontFamily: "'Noto Sans KR', 'Pretendard', sans-serif",
      }}
    >
      <QtQuickIndexNavPortrait currentMonth={monthNum} activeTab="tracker" themeColor={themeColor} />
      {/* 1. Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-300 pb-3 mb-3">
        <div className="flex items-center space-x-4 text-xs font-medium tracking-wider text-slate-400 font-mono">
          <span>YEARLY</span>
          <span>{year}</span>
          <span className="px-2.5 py-0.5 rounded text-white font-bold" style={{ backgroundColor: themeColor }}>
            {monthName.toUpperCase().slice(0, 3)}
          </span>
        </div>
        <span className="px-3 py-1 rounded-full bg-rose-600 text-white font-bold text-xs shadow-xs">
          💌 MONTHLY LETTER TO GOD
        </span>
      </div>

      {/* 2. Page Title */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-xl font-serif font-bold text-slate-800 tracking-wide flex items-center gap-2 whitespace-nowrap">
            <span>💌 {monthName} Letter to God</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            한 달을 마감하며 31일간 나의 삶을 지키시고 인도해 주신 하나님 아버지께 고백하는 마음의 손편지
          </p>
        </div>
        <div className="px-4 py-1.5 rounded-full text-xs font-bold text-rose-950 bg-rose-50 border border-rose-200 shadow-xs">
          {year}년 {monthName} 하나님 감사 편지
        </div>
      </div>

      {/* 3. Main Stack: Vintage Letter + Song & Stamp */}
      <div className="space-y-4 flex-1 flex flex-col justify-between mb-3">
        {/* Letter Box */}
        <div className="border-2 border-dashed border-rose-300 rounded-2xl p-5 bg-gradient-to-b from-rose-50/40 via-white to-amber-50/30 flex-1 flex flex-col justify-between shadow-xs relative">
          <div className="flex items-center justify-between border-b border-rose-200 pb-2 mb-3 text-xs">
            <span className="text-lg font-serif font-extrabold text-rose-900 tracking-wider">
              Dear My Heavenly Father,
            </span>
            <span className="text-slate-400 font-mono">
              Date: {year}년 {monthName} 마지막 날 🕊️
            </span>
          </div>

          {/* Letter Lines */}
          <div className="space-y-3 flex-1 flex flex-col justify-around py-2 text-xs">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((lineNo) => (
              <div key={lineNo} className="border-b border-rose-200/80 pb-1.5 flex items-center gap-3">
                <span className="text-rose-300 font-serif font-bold w-4">{lineNo}.</span>
                <div className="text-slate-700 font-serif flex-1 min-h-[18px]">
                  _______________________________________________________
                </div>
              </div>
            ))}
          </div>

          {/* Signature */}
          <div className="border-t border-rose-200 pt-2 flex items-center justify-between text-xs text-rose-900 font-serif font-bold">
            <span>&quot;은혜 위에 은혜가 더했던 복된 한 달이었습니다.&quot;</span>
            <span className="italic">Yours faithfully, 주님의 자녀 드림 🕊️</span>
          </div>
        </div>

        {/* Hymn & Stamp Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="border border-rose-200 rounded-2xl p-3 bg-rose-50/20 flex flex-col justify-between shadow-xs space-y-1.5">
            <div className="flex items-center justify-between border-b border-rose-200 pb-1">
              <span className="font-bold text-rose-950 font-serif">🎵 이달의 찬양 & 핵심 말씀</span>
              <span className="font-mono text-[10px] text-rose-400">Song & Verse</span>
            </div>
            <div className="space-y-1.5 flex-1 flex flex-col justify-around text-xs">
              <div className="bg-white p-1.5 rounded-xl border border-rose-200/80">
                <span className="font-bold text-rose-800 text-[10px] block">🎶 깊은 위로를 준 찬양:</span>
                <div className="text-slate-400 font-serif text-xs min-h-[14px]">_____________________</div>
              </div>
              <div className="bg-white p-1.5 rounded-xl border border-rose-200/80">
                <span className="font-bold text-rose-800 text-[10px] block">📖 한 달간 붙잡은 말씀:</span>
                <div className="text-slate-400 font-serif text-xs min-h-[14px]">_____________________</div>
              </div>
            </div>
          </div>

          <div className="border border-amber-200 rounded-2xl p-3 bg-gradient-to-r from-amber-50/50 to-rose-50/50 flex flex-col items-center justify-center text-center shadow-xs space-y-1.5">
            <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center font-serif text-base font-bold shadow-xs">
              SEAL
            </div>
            <span className="font-serif font-bold text-xs text-amber-950">
              31일간의 여정을 주님께 드리며 👑
            </span>
            <span className="text-[10px] text-slate-400">
              Blessed & Dedicated to God
            </span>
          </div>
        </div>
      </div>

      {/* 4. Footer */}
      <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-300">
        <span>PREMIUM DIARY STUDIO — MONTHLY LETTER TO GOD (VOL. 1)</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
