'use client'

import React from 'react'

interface QtSoapJournalPortraitProps {
  year?: number
  monthName?: string
  themeColor?: string
  pageWidth?: number
  pageHeight?: number
}

export default function QtSoapJournalPortrait({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 1448,
}: QtSoapJournalPortraitProps) {
  return (
    <div
      data-page-key="soap-journal-1-portrait"
      data-page-type="full-bleed"
      className="qt-page relative bg-white text-slate-800 flex flex-col justify-between overflow-hidden shadow-md mx-auto"
      style={{
        width: `${pageWidth}px`,
        height: `${pageHeight}px`,
        padding: '36px 44px',
        boxSizing: 'border-box',
        fontFamily: "'Noto Sans KR', 'Pretendard', sans-serif",
      }}
    >
      {/* 1. Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-300 pb-3 mb-3">
        <div className="flex items-center space-x-4 text-xs font-medium tracking-wider text-slate-400 font-mono">
          <span>YEARLY</span>
          <span>{year}</span>
          <span className="px-2.5 py-0.5 rounded text-white font-bold" style={{ backgroundColor: themeColor }}>
            {monthName.toUpperCase().slice(0, 3)}
          </span>
        </div>
        <span className="px-3 py-1 rounded-full bg-amber-600 text-white font-bold text-xs shadow-xs">
          📖 SOAP SCRIPTURE & OBSERVATION
        </span>
      </div>

      {/* 2. Page Title */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-800 tracking-wide flex items-center gap-2">
            <span>📖 {monthName} SOAP Meditation: S & O</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            S(본문 필사)와 O(본문 관찰)를 통해 마음을 울린 하나님의 말씀을 정결하게 적고 깊이 묵상합니다.
          </p>
        </div>
        <div className="px-4 py-1.5 rounded-full text-xs font-bold text-amber-950 bg-amber-50 border border-amber-200 shadow-xs">
          SOAP① 말씀 필사 & 관찰
        </div>
      </div>

      {/* 3. Main Stack: S & O */}
      <div className="space-y-4 flex-1 flex flex-col justify-between mb-3">
        {/* S: Scripture Copying */}
        <div className="border border-amber-200 rounded-2xl p-4 bg-gradient-to-b from-amber-50/40 via-white to-amber-50/20 flex-1 flex flex-col justify-between shadow-xs space-y-2">
          <div className="flex items-center justify-between border-b border-amber-200 pb-1.5 text-xs">
            <span className="font-bold text-amber-950 font-serif flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-amber-600 text-white font-mono text-xs flex items-center justify-center font-bold">S</span>
              📜 SCRIPTURE (성경 본문 구절 & 명품 필사)
            </span>
            <span className="font-mono text-xs text-amber-700">Word & Copy</span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-amber-200/80 flex-1 flex flex-col justify-between space-y-2 text-xs">
            <div className="flex justify-between items-center border-b border-amber-100 pb-1 text-xs">
              <span className="font-bold text-amber-900">📖 본문 구절 (Passage):</span>
              <span className="text-slate-400 font-serif">_________________________</span>
            </div>
            <div className="space-y-2 flex-1 flex flex-col justify-around text-slate-400 font-serif text-xs py-1">
              {[1, 2, 3, 4, 5, 6].map((lNo) => (
                <div key={lNo} className="border-b border-amber-100 pb-1">
                  {lNo}. ____________________________________________________________________
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* O: Observation */}
        <div className="border border-blue-200 rounded-2xl p-4 bg-gradient-to-b from-blue-50/40 via-white to-blue-50/20 flex-1 flex flex-col justify-between shadow-xs space-y-2">
          <div className="flex items-center justify-between border-b border-blue-200 pb-1.5 text-xs">
            <span className="font-bold text-blue-950 font-serif flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-mono text-xs flex items-center justify-center font-bold">O</span>
              🔍 OBSERVATION (본문 정밀 관찰 & 영적 진리)
            </span>
            <span className="font-mono text-xs text-blue-700">3-Key Truths</span>
          </div>

          <div className="space-y-2 flex-1 flex flex-col justify-around text-xs">
            <div className="bg-white p-2.5 rounded-xl border border-blue-200/80">
              <span className="font-bold text-blue-900 text-xs block">👑 1. 하나님은 어떤 분이신가? (Character of God)</span>
              <div className="text-slate-400 font-serif text-xs min-h-[16px]">____________________________________________________________________</div>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-blue-200/80">
              <span className="font-bold text-blue-900 text-xs block">💡 2. 나에게 주시는 교훈 & 경고 (Lessons & Commands)</span>
              <div className="text-slate-400 font-serif text-xs min-h-[16px]">____________________________________________________________________</div>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-blue-200/80">
              <span className="font-bold text-blue-900 text-xs block">🕊️ 3. 본문 속 레마(Rhema)의 발견 (Rhema Message)</span>
              <div className="text-slate-400 font-serif text-xs min-h-[16px]">____________________________________________________________________</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Footer */}
      <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-300">
        <span>PREMIUM DIARY STUDIO — SOAP BIBLE MEDITATION (VOL. 1)</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
