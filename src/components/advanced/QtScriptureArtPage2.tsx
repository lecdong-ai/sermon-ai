'use client'

import React from 'react'

interface QtScriptureArtPage2Props {
  year?: number
  monthName?: string
  themeColor?: string
  pageWidth?: number
  pageHeight?: number
}

export default function QtScriptureArtPage2({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 768,
}: QtScriptureArtPage2Props) {
  return (
    <div
      data-page-key="scripture-art-2"
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
          <span>WEEKLY 4 VERSES & TRANSFORMATION JOURNAL (VOL. 2)</span>
          <span className="px-2.5 py-0.5 rounded-full bg-indigo-600 text-white font-bold text-[10px] shadow-xs">
            📜 암송② 4주차 암송 4선 & 묵상 성찰 (VOL. 2)
          </span>
        </div>
      </div>

      {/* 2. Page Title */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-xl font-serif font-bold text-slate-800 tracking-wide whitespace-nowrap">
            📜 {monthName} Weekly 4 Verses & Spiritual Transformation Journal
          </h1>
          <p className="text-[10.5px] text-slate-500 mt-0.5 whitespace-nowrap">
            매주 새로운 주제의 말씀 4선을 암송·필사하고, 말씀이 내 삶과 언어 습관을 변화시킨 스토리를 묵상합니다.
          </p>
        </div>

        <div className="px-3 py-1 rounded-full text-xs font-bold text-indigo-950 bg-indigo-50 border border-indigo-200 shadow-xs whitespace-nowrap">
          4주차 암송 4선 & 영성 성찰
        </div>
      </div>

      {/* 3. 4 Weekly Scripture Cards (2x2 Grid) */}
      <div className="grid grid-cols-2 gap-3 flex-1 mb-2">
        {[
          {
            week: '1주차 암송 (Week 1)',
            theme: '🌿 성품 & 순종',
            verse: '“하나님의 말씀은 살아 있고 활력이 있어 좌우에 날선 어떤 검보다도 예리하여...” (히 4:12)',
            color: 'border-emerald-300 bg-emerald-50/20',
          },
          {
            week: '2주차 암송 (Week 2)',
            theme: '🛡️ 평안 & 담대함',
            verse: '“평안을 너희에게 끼치노니 곧 나의 평안을 너희에게 주노라...” (요 14:27)',
            color: 'border-indigo-300 bg-indigo-50/20',
          },
          {
            week: '3주차 암송 (Week 3)',
            theme: '💖 사랑 & 용서',
            verse: '“새 계명을 너희에게 주노니 서로 사랑하라 내가 너희를 사랑한 것 같이...” (요 13:34)',
            color: 'border-rose-300 bg-rose-50/20',
          },
          {
            week: '4주차 암송 (Week 4)',
            theme: '☀️ 감사 & 찬양',
            verse: '“범사에 감사하라 이것이 그리스도 예수 안에서 너희를 향하신 하나님의 뜻이니라” (전 5:18)',
            color: 'border-amber-300 bg-amber-50/20',
          },
        ].map((w, idx) => (
          <div
            key={idx}
            className={`border rounded-2xl p-2.5 ${w.color} flex flex-col justify-between shadow-2xs space-y-1`}
          >
            {/* Card Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-1 text-[9.5px]">
              <span className="font-bold text-slate-800 font-serif">{w.week}</span>
              <span className="font-mono text-[8px] font-extrabold px-1.5 py-0.5 rounded bg-white border border-slate-200 text-indigo-800">
                {w.theme}
              </span>
            </div>

            {/* Target Verse Text */}
            <div className="bg-white/90 p-1.5 rounded-xl border border-slate-200/80 text-[8.5px] font-serif italic text-slate-700 leading-tight">
              {w.verse}
            </div>

            {/* Handwriting Practice & Reflection Line */}
            <div className="space-y-1 flex-1 flex flex-col justify-around text-[8.5px]">
              <div className="bg-white/80 p-1.5 rounded-xl border border-slate-200/80">
                <span className="font-bold text-indigo-800 text-[8px] block">✍️ 내 손글씨 필사 (Penmanship):</span>
                <div className="text-slate-400 font-serif text-[8.5px] min-h-[12px]">_____________________________________________</div>
              </div>
              <div className="bg-white/80 p-1.5 rounded-xl border border-slate-200/80">
                <span className="font-bold text-emerald-800 text-[8px] block">🌱 내 삶의 적용 한 줄 (Action):</span>
                <div className="text-slate-400 font-serif text-[8.5px] min-h-[12px]">_____________________________________________</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 4. Bottom Transformation Reflection Banner */}
      <div className="border border-indigo-200/90 rounded-2xl p-2.5 bg-gradient-to-r from-indigo-50/90 via-purple-50/90 to-rose-50/90 shadow-2xs space-y-1">
        <div className="flex items-center justify-between text-[9.5px] font-bold text-indigo-950">
          <span>💌 한 달간 암송과 필사가 내 삶과 언어 습관에 이뤄낸 거룩한 변화 성찰</span>
          <span className="text-indigo-700 font-mono">Spiritual Transformation Journal</span>
        </div>
        <div className="bg-white p-2 rounded-xl border border-indigo-200 text-[8.5px]">
          <div className="text-slate-400 font-serif min-h-[14px]">_________________________________________________________________________________________</div>
        </div>
      </div>

      {/* 5. Footer */}
      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1.5 border-t border-slate-200 mt-1.5">
        <span>PREMIUM DIARY STUDIO — SCRIPTURE MEMORIZATION & COPYING (VOL. 2)</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
