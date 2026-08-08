'use client'

import React from 'react'
import QtQuickIndexNav from './QtQuickIndexNav'

interface QtPrayerAnswerPage2Props {
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

export default function QtPrayerAnswerPage2({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 768,
}: QtPrayerAnswerPage2Props) {
  const monthNum = MONTH_MAP[monthName] || 8

  return (
    <div
      data-page-key="tracker"
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
          <span>ANSWERED PRAYER & GRACE JOURNAL (VOL. 2)</span>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-600 text-white font-bold text-[10px] shadow-xs">
            🎉 하나님 은혜 응답 일기 & 은혜 기념비 (VOL. 2)
          </span>
        </div>
      </div>

      {/* 2. Page Title */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-xl font-serif font-bold text-slate-800 tracking-wide whitespace-nowrap">
            🎉 {monthName} Answered Prayer Journal & Grace Milestones
          </h1>
          <p className="text-[10.5px] text-slate-500 mt-0.5 whitespace-nowrap">
            하나님께서 기도를 들으시고 응답하신 생생한 순간과 놀라운 은혜의 스토리를 증언하고 기록합니다.
          </p>
        </div>

        <div className="px-3 py-1 rounded-full text-xs font-bold text-amber-950 bg-amber-50 border border-amber-200 shadow-xs whitespace-nowrap">
          응답 증언 & 은혜 기록
        </div>
      </div>

      {/* 3. 4 Answered Prayer Milestone Cards (2x2 Grid) */}
      <div className="grid grid-cols-2 gap-3 flex-1 mb-2">
        {[
          { title: '✨ 01. 첫 번째 응답의 선물', category: '은혜 응답 #1', color: 'border-amber-300 bg-amber-50/20' },
          { title: '🕊️ 02. 두 번째 응답의 평안', category: '은혜 응답 #2', color: 'border-indigo-300 bg-indigo-50/20' },
          { title: '💖 03. 세 번째 응답의 치유', category: '은혜 응답 #3', color: 'border-emerald-300 bg-emerald-50/20' },
          { title: '👑 04. 네 번째 응답의 성취', category: '은혜 응답 #4', color: 'border-rose-300 bg-rose-50/20' },
        ].map((card, idx) => (
          <div
            key={idx}
            className={`border rounded-2xl p-2.5 ${card.color} flex flex-col justify-between shadow-2xs space-y-1`}
          >
            {/* Card Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-1 text-[9.5px]">
              <span className="font-bold text-slate-800 font-serif flex items-center gap-1">
                {card.title}
              </span>
              <span className="font-mono text-[8px] font-extrabold px-1.5 py-0.5 rounded bg-white border border-slate-200 text-amber-800">
                {card.category}
              </span>
            </div>

            {/* Date & Location */}
            <div className="grid grid-cols-12 gap-1 text-[8.5px]">
              <div className="col-span-6 bg-white p-1 rounded-xl border border-slate-200/80 flex items-center justify-between">
                <span className="text-[7.5px] font-bold text-slate-400">기도 시작:</span>
                <span className="text-slate-600 font-mono text-[8px]">2026.08.__</span>
              </div>
              <div className="col-span-6 bg-white p-1 rounded-xl border border-slate-200/80 flex items-center justify-between">
                <span className="text-[7.5px] font-bold text-amber-800">🎉 응답 성취:</span>
                <span className="text-amber-800 font-mono font-bold text-[8px]">2026.__.__</span>
              </div>
            </div>

            {/* Answered Story Lines */}
            <div className="space-y-1 flex-1 bg-white p-2 rounded-xl border border-slate-200/80 text-[8.5px]">
              <div>
                <span className="font-bold text-slate-700 text-[8px] block">📌 응답받은 기도제목 (Answered Prayer):</span>
                <div className="text-slate-400 font-serif text-[8.5px] min-h-[14px]">_____________________________________________</div>
              </div>
              <div>
                <span className="font-bold text-amber-800 text-[8px] block">🕊️ 하나님이 일하신 은혜의 스토리 (Grace Story):</span>
                <div className="text-slate-400 font-serif text-[8.5px] min-h-[14px]">_____________________________________________</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 4. Bottom Milestone Reflection Banner */}
      <div className="border border-amber-200/90 rounded-2xl p-2 bg-amber-50/70 shadow-2xs space-y-1">
        <div className="flex items-center justify-between text-[9.5px] font-bold text-amber-950">
          <span>👑 이 달에 체험한 하나님의 놀라운 은혜에 감사 찬양을 드립니다</span>
          <span className="text-amber-700 font-mono">Grace Memorial</span>
        </div>
        <div className="border-b border-dashed border-amber-200 h-3 text-[8.5px] text-amber-900/80 font-serif">"여호와께서 내 음성과 내 간구를 들으시므로 내가 그를 사랑하는도다 그의 귀를 내게 기울이셨으므로 내가 평생에 기도하리로다 (시 116:1-2)"</div>
      </div>

      {/* 5. Footer */}
      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1.5 border-t border-slate-200 mt-1.5">
        <span>PREMIUM DIARY STUDIO — ANSWERED PRAYER & GRACE JOURNAL (VOL. 2)</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
