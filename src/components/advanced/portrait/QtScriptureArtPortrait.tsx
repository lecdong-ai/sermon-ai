'use client'

import React from 'react'

interface QtScriptureArtPortraitProps {
  year?: number
  monthName?: string
  themeColor?: string
  pageWidth?: number
  pageHeight?: number
}

export default function QtScriptureArtPortrait({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 1448,
}: QtScriptureArtPortraitProps) {
  return (
    <div
      data-page-key="scripture-art-1-portrait"
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
        <span className="px-3 py-1 rounded-full bg-purple-600 text-white font-bold text-xs shadow-xs">
          📜 SCRIPTURE MEMORIZATION & COPYING
        </span>
      </div>

      {/* 2. Page Title */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-800 tracking-wide flex items-center gap-2">
            <span>📜 {monthName} Signature Scripture Art</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            이달의 대표 말씀을 손글씨로 필사하고 31일간 매일 입으로 선포하며 마음에 새깁니다.
          </p>
        </div>
        <div className="px-4 py-1.5 rounded-full text-xs font-bold text-purple-950 bg-purple-50 border border-purple-200 shadow-xs">
          대표 말씀 암송 & 30일 필사
        </div>
      </div>

      {/* 3. Main Stack: Verse Frame + Handwriting + 31-Day Matrix */}
      <div className="space-y-4 flex-1 flex flex-col justify-between mb-3">
        {/* Verse Frame */}
        <div className="border-2 border-dashed border-purple-300/80 rounded-2xl p-6 bg-gradient-to-b from-amber-50/40 via-white to-purple-50/40 flex flex-col justify-between shadow-xs relative flex-1">
          <div className="flex justify-between items-center text-xs font-bold text-purple-800 font-serif border-b border-purple-100 pb-2">
            <span>👑 VERSE OF THE MONTH</span>
            <span>NIV / KJV PARALLEL</span>
          </div>

          <div className="text-center my-auto space-y-4 px-4">
            <span className="text-xs font-bold uppercase tracking-widest text-purple-700 bg-purple-100/80 px-4 py-1 rounded-full">
              이달의 핵심 대표 암송 구절
            </span>
            <blockquote className="text-2xl font-serif font-extrabold text-slate-800 leading-relaxed tracking-wide italic">
              &quot;여호와는 나의 목자시니 내게 부족함이 없으리로다. 그가 나를 푸른 풀밭에 누이시며 쉬만 한 물 가로 인도하시는도다.&quot;
            </blockquote>
            <div className="text-sm font-bold text-purple-900 font-sans tracking-wider">
              — 시편 23편 1-2절 (Psalm 23:1-2) —
            </div>
            <div className="text-xs font-serif text-slate-500 italic pt-2 border-t border-purple-100">
              "The LORD is my shepherd, I lack nothing. He makes me lie down in green pastures, he leads me beside quiet waters."
            </div>
          </div>

          <div className="border-t border-purple-200/60 pt-2 text-center text-xs text-slate-400 italic">
            매일 아침 나직이 읊조리며 마음 밭에 선포하세요 🌿
          </div>
        </div>

        {/* Handwriting practice */}
        <div className="border border-purple-200/90 rounded-2xl p-4 bg-purple-50/20 flex flex-col justify-between shadow-xs flex-1">
          <div className="flex items-center justify-between border-b border-purple-200 pb-1 text-xs">
            <span className="font-bold text-purple-950 font-serif">✍️ 손글씨 정결 필사 (Handwriting Practice)</span>
            <span className="font-mono text-xs text-slate-400">Pencil & Pen</span>
          </div>
          <div className="space-y-3 flex-1 flex flex-col justify-around py-2">
            {[1, 2, 3, 4, 5, 6].map((lNo) => (
              <div key={lNo} className="border-b border-slate-300/80 pb-1 flex items-center gap-3">
                <span className="text-xs text-purple-400 font-mono">{lNo}.</span>
                <div className="text-xs text-slate-400 font-serif flex-1 min-h-[18px]">
                  ________________________________________________________
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 31-Day Stamp Matrix */}
        <div className="border border-purple-200/90 rounded-2xl p-3 bg-white shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-purple-950">
            <span>🌱 31일 매일 암송 도장 매트릭스</span>
            <span className="text-purple-700 font-mono text-xs">Daily Memorization Check</span>
          </div>
          <div className="grid grid-cols-11 gap-1.5 text-center pt-1">
            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
              <div
                key={day}
                className="w-7 h-7 rounded-full border border-purple-200 flex items-center justify-center text-xs font-mono text-purple-900 bg-purple-50/50"
              >
                {day}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Footer */}
      <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-300">
        <span>PREMIUM DIARY STUDIO — SCRIPTURE MEMORIZATION & COPYING (VOL. 1)</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
