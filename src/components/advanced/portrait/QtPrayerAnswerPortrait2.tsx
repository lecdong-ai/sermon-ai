'use client'

import React from 'react'

interface QtPrayerAnswerPortrait2Props {
  year?: number
  monthName?: string
  themeColor?: string
  pageWidth?: number
  pageHeight?: number
}

export default function QtPrayerAnswerPortrait2({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 1448,
}: QtPrayerAnswerPortrait2Props) {
  return (
    <div
      data-page-key="prayer-log-2-portrait"
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
          🎉 ANSWERED PRAYER & GRACE JOURNAL
        </span>
      </div>

      {/* 2. Page Title */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-800 tracking-wide flex items-center gap-2">
            <span>🎉 {monthName} Answered Prayer & Grace Journal</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            하나님께서 기도를 들으시고 응답하신 생생한 순간과 은혜의 스토리를 기록하고 증언합니다.
          </p>
        </div>
        <div className="px-4 py-1.5 rounded-full text-xs font-bold text-amber-950 bg-amber-50 border border-amber-200 shadow-xs">
          응답 증언 & 은혜 기록
        </div>
      </div>

      {/* 3. 4 Answered Prayer Cards Stack */}
      <div className="space-y-3.5 flex-1 flex flex-col justify-between mb-3">
        {[
          { title: '✨ 01. 첫 번째 응답의 선물', category: '은혜 응답 #1', color: 'border-amber-300 bg-amber-50/20' },
          { title: '🕊️ 02. 두 번째 응답의 평안', category: '은혜 응답 #2', color: 'border-indigo-300 bg-indigo-50/20' },
          { title: '💖 03. 세 번째 응답의 치유', category: '은혜 응답 #3', color: 'border-emerald-300 bg-emerald-50/20' },
          { title: '👑 04. 네 번째 응답의 성취', category: '은혜 응답 #4', color: 'border-rose-300 bg-rose-50/20' },
        ].map((card, idx) => (
          <div
            key={idx}
            className={`border rounded-2xl p-3.5 ${card.color} flex flex-col justify-between shadow-xs space-y-2 flex-1`}
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-1 text-xs">
              <span className="font-bold text-slate-800 font-serif flex items-center gap-1">
                {card.title}
              </span>
              <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded bg-white border border-slate-200 text-amber-800">
                {card.category}
              </span>
            </div>

            <div className="grid grid-cols-12 gap-2 text-xs">
              <div className="col-span-6 bg-white p-1.5 rounded-xl border border-slate-200/80 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400">기도 시작:</span>
                <span className="text-slate-600 font-mono text-xs">2026.08.__</span>
              </div>
              <div className="col-span-6 bg-white p-1.5 rounded-xl border border-slate-200/80 flex items-center justify-between">
                <span className="text-[10px] font-bold text-amber-800">🎉 응답 성취:</span>
                <span className="text-amber-800 font-mono font-bold text-xs">2026.__.__</span>
              </div>
            </div>

            <div className="space-y-1.5 flex-1 bg-white p-2.5 rounded-xl border border-slate-200/80 text-xs">
              <div>
                <span className="font-bold text-slate-700 text-[10px] block">📌 응답받은 기도제목 (Answered Prayer):</span>
                <div className="text-slate-400 font-serif text-xs min-h-[16px]">________________________________________________</div>
              </div>
              <div>
                <span className="font-bold text-amber-800 text-[10px] block">🕊️ 하나님이 일하신 은혜의 스토리 (Grace Story):</span>
                <div className="text-slate-400 font-serif text-xs min-h-[16px]">________________________________________________</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 4. Bottom Milestone Reflection Banner */}
      <div className="border border-amber-200/90 rounded-2xl p-3 bg-amber-50/70 shadow-xs mb-2 space-y-1">
        <div className="flex items-center justify-between text-xs font-bold text-amber-950">
          <span>👑 이 달에 체험한 하나님의 놀라운 은혜에 감사 찬양을 드립니다</span>
          <span className="text-amber-700 font-mono">Grace Memorial</span>
        </div>
        <div className="border-b border-dashed border-amber-200 h-4 text-xs text-amber-900/80 font-serif">"여호와께서 내 음성과 내 간구를 들으시므로 내가 그를 사랑하는도다 그의 귀를 내게 기울이셨으므로 내가 평생에 기도하리로다 (시 116:1-2)"</div>
      </div>

      {/* 5. Footer */}
      <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-300">
        <span>PREMIUM DIARY STUDIO — ANSWERED PRAYER & GRACE JOURNAL (VOL. 2)</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
