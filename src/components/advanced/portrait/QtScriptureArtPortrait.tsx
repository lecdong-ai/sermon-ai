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
  pageWidth = 768,
  pageHeight = 1024,
}: QtScriptureArtPortraitProps) {
  return (
    <div
      data-page-key="scripture-art-portrait"
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
          <span className="px-2 py-0.5 rounded bg-purple-500 text-white font-bold cursor-pointer shadow-xs">SCRIPTURE ART</span>
        </div>
      </div>

      {/* 2. Page Title */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-800 tracking-wide flex items-center gap-2">
            <span>📜 {monthName} Scripture Art & Handwriting</span>
          </h1>
          <p className="text-[11px] text-slate-500 mt-0.5">이달의 대표 암송 구절을 마음에 품고 손글씨로 써보는 감성 필사 카드</p>
        </div>
        <div className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-xs" style={{ backgroundColor: themeColor }}>
          {year}년 {monthName} 암송 필사
        </div>
      </div>

      {/* 3. Vertical Layout */}
      <div className="flex-1 flex flex-col space-y-4">
        {/* Top: 수채화 필사 카드 프레임 */}
        <div className="border-2 border-dashed border-amber-300/80 rounded-2xl p-5 bg-gradient-to-b from-amber-50/40 via-white to-purple-50/40 text-center space-y-3 shadow-2xs relative">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-700 bg-amber-100/80 px-3 py-1 rounded-full inline-block">
            Verse of the Month
          </span>
          <blockquote className="text-base font-serif font-extrabold text-slate-800 leading-relaxed italic">
            &quot;여호와는 나의 목자시니 내게 부족함이 없으리로다. 그가 나를 푸른 풀밭에 누이시며 쉬만 한 물 가로 인도하시는도다.&quot;
          </blockquote>
          <div className="text-xs font-bold text-amber-800">
            — 시편 23편 1-2절 (Psalm 23:1-2) —
          </div>
        </div>

        {/* Middle: 손글씨 정결 필사 라인 */}
        <div className="border border-slate-300 rounded-2xl p-4 bg-slate-50/50 flex-1 flex flex-col justify-between">
          <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: themeColor }} />
            ✍️ 손글씨 정결 필사 라인
          </h4>
          <div className="space-y-4 flex-1 flex flex-col justify-around py-2">
            {[1, 2, 3, 4, 5, 6].map((l) => (
              <div key={l} className="border-b border-slate-300/80 pb-1 flex items-center gap-2">
                <span className="text-[9px] text-slate-300 font-mono">{l}.</span>
                <div className="text-[11px] text-slate-700 font-serif flex-1 min-h-[18px]">
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: 묵상 노트 & 나눔 결단 */}
        <div className="border border-purple-200 rounded-2xl p-3 bg-purple-50/30 flex flex-col justify-between shadow-2xs">
          <h4 className="text-[11px] font-bold text-purple-900 uppercase tracking-wider mb-1 flex items-center gap-1">
            🌱 말씀과 나의 삶 (Reflection & Commitment)
          </h4>
          <div className="text-[11px] text-slate-700 font-serif p-2.5 rounded-lg bg-white/80 border border-purple-100 min-h-[45px]">
          </div>
        </div>
      </div>

      {/* 4. Footer */}
      <div className="flex items-center justify-between border-t border-slate-300 pt-2 mt-2 text-[10px] text-slate-400">
        <span>SERMON AI QT DIARY — SCRIPTURE ART & MEMORY VERSE</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
