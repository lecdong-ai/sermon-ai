'use client'

import React from 'react'
import QtQuickIndexNav from './QtQuickIndexNav'

interface QtSoapJournalPageProps {
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

export default function QtSoapJournalPage({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 768,
}: QtSoapJournalPageProps) {
  const monthNum = MONTH_MAP[monthName] || 8

  return (
    <div
      data-page-key="soap"
      data-page-type="full-bleed"
      className="qt-page relative bg-white text-slate-800 flex flex-col justify-between overflow-hidden shadow-md mx-auto"
      style={{
        width: `${pageWidth}px`,
        height: `${pageHeight}px`,
        padding: '20px 58px 20px 24px',
        boxSizing: 'border-box',
        fontFamily: "'Noto Sans KR', 'Pretendard', sans-serif",
      }}
    >
      <QtQuickIndexNav currentMonth={monthNum} activeTab="tracker" themeColor={themeColor} isChristian={true} />
      {/* 1. Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-300 pb-2 mb-2">
        <div className="flex items-center space-x-3 text-[11px] font-medium tracking-wider text-slate-400 font-mono">
          <span>YEARLY</span>
          <span>{year}</span>
          <span className="px-2 py-0.5 rounded text-white font-bold" style={{ backgroundColor: themeColor }}>
            {monthName.toUpperCase().slice(0, 3)}
          </span>
        </div>

        <div className="flex items-center space-x-3 text-[11px] font-medium text-slate-400">
          <span>SOAP BIBLE MEDITATION (VOL. 1: S & O)</span>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-600 text-white font-bold text-[10px] shadow-xs">
            📖 SOAP① 말씀 필사 & 본문 관찰 (VOL. 1)
          </span>
        </div>
      </div>

      {/* 2. Page Title */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-xl font-sans font-bold text-slate-800 tracking-wide whitespace-nowrap">
            📖 {monthName} SOAP Meditation: Scripture & Observation
          </h1>
          <p className="text-[10.5px] text-slate-500 mt-0.5 whitespace-nowrap">
            S(본문 필사)와 O(본문 관찰)를 통해 마음을 울린 하나님의 말씀을 정결하게 적고 깊이 묵상합니다.
          </p>
        </div>

        <div className="px-3 py-1 rounded-full text-xs font-bold text-amber-950 bg-amber-50 border border-amber-200 shadow-2xs whitespace-nowrap">
          SOAP① 말씀 필사 & 관찰
        </div>
      </div>

      {/* 3. Main Grid (Left 6 Cols S: Scripture Copy / Right 6 Cols O: Observation 3-Key) */}
      <div className="grid grid-cols-12 gap-3 flex-1 mb-2">
        {/* Left: S - Scripture Copying (6 cols) */}
        <div className="col-span-6 border border-amber-200 rounded-2xl p-3 bg-gradient-to-b from-amber-50/40 via-white to-amber-50/20 flex flex-col justify-between shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between border-b border-amber-200 pb-1.5 text-[9.5px]">
            <span className="font-bold text-amber-950 font-sans flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-amber-600 text-white font-mono text-[9px] flex items-center justify-center font-bold">S</span>
              📜 SCRIPTURE (성경 본문 구절 & 명품 필사)
            </span>
            <span className="font-mono text-[8px] text-amber-700">Word & Copy</span>
          </div>

          <div className="bg-white p-2 rounded-xl border border-amber-200/80 flex-1 flex flex-col justify-between space-y-1 text-[8.5px]">
            <div className="flex justify-between items-center border-b border-amber-100 pb-1 text-[8px]">
              <span className="font-bold text-amber-900">📖 본문 구절 (Passage):</span>
              <span className="text-slate-400 font-sans">____________________</span>
            </div>
            <div className="space-y-1 flex-1 flex flex-col justify-around text-slate-400 font-sans text-[8.5px] py-1">
              {[1, 2, 3, 4, 5].map((lNo) => (
                <div key={lNo} className="border-b border-amber-100 pb-0.5">
                  {lNo}. __________________________________________________
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: O - Observation 3-Key Truths (6 cols) */}
        <div className="col-span-6 border border-blue-200 rounded-2xl p-3 bg-gradient-to-b from-blue-50/40 via-white to-blue-50/20 flex flex-col justify-between shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between border-b border-blue-200 pb-1.5 text-[9.5px]">
            <span className="font-bold text-blue-950 font-sans flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-blue-600 text-white font-mono text-[9px] flex items-center justify-center font-bold">O</span>
              🔍 OBSERVATION (본문 정밀 관찰 & 영적 진리)
            </span>
            <span className="font-mono text-[8px] text-blue-700">3-Key Truths</span>
          </div>

          <div className="space-y-1.5 flex-1 flex flex-col justify-around text-[8.5px]">
            {/* Truth 1: God's Character */}
            <div className="bg-white p-2 rounded-xl border border-blue-200/80">
              <span className="font-bold text-blue-900 text-[8px] block">👑 1. 하나님은 어떤 분이신가? (Character of God)</span>
              <div className="text-slate-400 font-sans text-[8.5px] min-h-[14px]">__________________________________________________</div>
            </div>

            {/* Truth 2: Lessons & Commands */}
            <div className="bg-white p-2 rounded-xl border border-blue-200/80">
              <span className="font-bold text-blue-900 text-[8px] block">💡 2. 나에게 주시는 교훈 & 경고 (Lessons & Commands)</span>
              <div className="text-slate-400 font-sans text-[8.5px] min-h-[14px]">__________________________________________________</div>
            </div>

            {/* Truth 3: Rhema Message */}
            <div className="bg-white p-2 rounded-xl border border-blue-200/80">
              <span className="font-bold text-blue-900 text-[8px] block">🕊️ 3. 본문 속 레마(Rhema)의 발견 (Rhema Message)</span>
              <div className="text-slate-400 font-sans text-[8.5px] min-h-[14px]">__________________________________________________</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Footer */}
      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1.5 border-t border-slate-200 mt-1.5">
        <span>PREMIUM DIARY STUDIO — SOAP BIBLE MEDITATION (VOL. 1)</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
