'use client'

import React from 'react'

interface QtScriptureArtPageProps {
  year?: number
  monthName?: string
  themeColor?: string
  pageWidth?: number
  pageHeight?: number
}

export default function QtScriptureArtPage({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 768,
}: QtScriptureArtPageProps) {
  return (
    <div
      data-page-key="scripture-art-1"
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
      <div className="flex items-center justify-between border-b border-slate-300 pb-2 mb-2">
        <div className="flex items-center space-x-3 text-[11px] font-medium tracking-wider text-slate-400 font-mono">
          <span>YEARLY</span>
          <span>{year}</span>
          <span className="px-2 py-0.5 rounded text-white font-bold" style={{ backgroundColor: themeColor }}>
            {monthName.toUpperCase().slice(0, 3)}
          </span>
        </div>

        <div className="flex items-center space-x-3 text-[11px] font-medium text-slate-400">
          <span>SCRIPTURE MEMORIZATION & COPYING (VOL. 1)</span>
          <span className="px-2.5 py-0.5 rounded-full bg-purple-600 text-white font-bold text-[10px] shadow-xs">
            📜 암송① 대표 암송 & 30일 필사 (VOL. 1)
          </span>
        </div>
      </div>

      {/* 2. Page Title */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-xl font-serif font-bold text-slate-800 tracking-wide whitespace-nowrap">
            📜 {monthName} Signature Scripture Art & 30-Day Copying
          </h1>
          <p className="text-[10.5px] text-slate-500 mt-0.5 whitespace-nowrap">
            이달의 시그니처 대표 말씀을 손글씨로 필사하고, 31일간 매일 입으로 암송하며 마음에 새깁니다.
          </p>
        </div>

        <div className="px-3 py-1 rounded-full text-xs font-bold text-purple-950 bg-purple-50 border border-purple-200 shadow-xs whitespace-nowrap">
          대표 말씀 암송 & 30일 필사
        </div>
      </div>

      {/* 3. Main Grid: Left Signature Calligraphy Art + Right Penmanship & 30-Day Stamp */}
      <div className="grid grid-cols-12 gap-3 flex-1 mb-2">
        {/* Left Column: 수채화 캘리그라피 프레임 (6 cols) */}
        <div className="col-span-6 border-2 border-dashed border-purple-300/80 rounded-2xl p-4 bg-gradient-to-b from-amber-50/40 via-white to-purple-50/40 flex flex-col justify-between shadow-2xs relative">
          <div className="flex justify-between items-center text-[9px] font-bold text-purple-800 font-serif border-b border-purple-100 pb-1">
            <span>👑 VERSE OF THE MONTH</span>
            <span>NIV / KJV PARALLEL</span>
          </div>

          <div className="text-center my-auto space-y-3 px-3">
            <span className="text-[9.5px] font-bold uppercase tracking-widest text-purple-700 bg-purple-100/80 px-3 py-0.5 rounded-full">
              이달의 핵심 암송 구절
            </span>
            <blockquote className="text-base font-serif font-extrabold text-slate-800 leading-relaxed tracking-wide italic">
              &quot;여호와는 나의 목자시니 내게 부족함이 없으리로다. 그가 나를 푸른 풀밭에 누이시며 쉬만 한 물 가로 인도하시는도다.&quot;
            </blockquote>
            <div className="text-[10px] font-bold text-purple-900 font-sans tracking-wider">
              — 시편 23편 1-2절 (Psalm 23:1-2) —
            </div>
            <div className="text-[9px] font-serif text-slate-500 italic pt-1 border-t border-purple-100">
              "The LORD is my shepherd, I lack nothing. He makes me lie down in green pastures, he leads me beside quiet waters."
            </div>
          </div>

          <div className="border-t border-purple-200/60 pt-1.5 text-center text-[9px] text-slate-400 italic">
            매일 아침 나직이 읊조리며 마음 밭에 선포하세요 🌿
          </div>
        </div>

        {/* Right Column: 손글씨 정결 필사 라인 & 30일 출석 도장 (6 cols) */}
        <div className="col-span-6 flex flex-col justify-between space-y-2">
          {/* 정결 필사 라인 */}
          <div className="border border-purple-200/90 rounded-2xl p-3 bg-purple-50/20 flex-1 flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between border-b border-purple-200 pb-1 text-[9.5px]">
              <span className="font-bold text-purple-950 font-serif">✍️ 손글씨 정결 필사 (Handwriting Practice)</span>
              <span className="font-mono text-[8px] text-slate-400">Pencil & Pen</span>
            </div>
            <div className="space-y-1.5 flex-1 flex flex-col justify-around py-1">
              {[1, 2, 3, 4, 5].map((lNo) => (
                <div key={lNo} className="border-b border-slate-300/80 pb-0.5 flex items-center gap-2">
                  <span className="text-[8px] text-purple-400 font-mono">{lNo}.</span>
                  <div className="text-[9.5px] text-slate-400 font-serif flex-1 min-h-[14px]">
                    __________________________________________________
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 30일 매일 암송 출석 트래커 (31 Days Stamp) */}
          <div className="border border-purple-200/90 rounded-2xl p-2 bg-white shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-[9px] font-bold text-purple-950">
              <span>🌱 31일 매일 암송 도장 매트릭스</span>
              <span className="text-purple-700 font-mono text-[8px]">Daily Memorization Check</span>
            </div>
            <div className="grid grid-cols-11 gap-1 text-center pt-0.5">
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                <div
                  key={day}
                  className="w-5 h-5 rounded-full border border-purple-200 flex items-center justify-center text-[7.5px] font-mono text-purple-900 bg-purple-50/50"
                >
                  {day}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Footer */}
      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1.5 border-t border-slate-200 mt-1.5">
        <span>PREMIUM DIARY STUDIO — SCRIPTURE MEMORIZATION & COPYING (VOL. 1)</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
