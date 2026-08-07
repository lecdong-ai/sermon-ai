'use client'

import React from 'react'

interface QtIntercessoryPrayerPageProps {
  year?: number
  monthName?: string
  themeColor?: string
  pageWidth?: number
  pageHeight?: number
}

export default function QtIntercessoryPrayerPage({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 768,
}: QtBudgetTrackerPageProps | any) {
  return (
    <div
      data-page-key="intercessory-prayer"
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
      <div className="flex items-center justify-between border-b border-slate-300 pb-2 mb-2.5">
        <div className="flex items-center space-x-3 text-[11px] font-medium tracking-wider text-slate-400 font-mono">
          <span>YEARLY</span>
          <span>{year}</span>
          <span className="px-2 py-0.5 rounded text-white font-bold" style={{ backgroundColor: themeColor }}>
            {monthName.toUpperCase().slice(0, 3)}
          </span>
        </div>

        <div className="flex items-center space-x-3 text-[11px] font-medium text-slate-400">
          <span>INTERCESSORY PRAYER</span>
          <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-600 to-rose-600 text-white font-bold text-[10px] shadow-xs">
            💖 중보기도 & 공동체 카드
          </span>
        </div>
      </div>

      {/* 2. Title */}
      <div className="flex items-center justify-between mb-2.5">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-800 tracking-wide flex items-center gap-2">
            <span>💖 {monthName} Intercessory Prayer Journal</span>
          </h1>
          <p className="text-[11px] text-slate-500 mt-0.5">
            가족, 순원, 환우 및 도움이 필요한 이웃을 위해 사랑과 눈물로 간구하는 중보기도 카드입니다.
          </p>
        </div>
        <div className="px-3 py-1 rounded-full text-xs font-bold text-rose-950 bg-rose-50 border border-rose-200 shadow-xs">
          {year}년 {monthName} 중보기도 카드
        </div>
      </div>

      {/* 3. Main 4 Prayer Cards Grid (2x2 Grid) */}
      <div className="grid grid-cols-2 gap-3.5 flex-1">
        {[
          { title: '👨‍👩‍👧‍👦 가족 & 사랑하는 사람', category: '가족 중보' },
          { title: '⛪ 교우 / 순원 / 소그룹', category: '공동체 중보' },
          { title: '🏥 환우 / 치유 & 회복', category: '치유 중보' },
          { title: '🌏 열방 / 선교 & 이웃', category: '열방 중보' },
        ].map((card, idx) => (
          <div
            key={idx}
            className="border border-slate-200/90 rounded-2xl p-3 bg-slate-50/50 flex flex-col justify-between shadow-2xs space-y-1.5 hover:border-amber-300 transition-colors"
          >
            {/* Card Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-1">
              <span className="text-[11px] font-bold text-slate-800 font-serif flex items-center gap-1.5">
                <span>{card.title}</span>
              </span>
              <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full text-white bg-amber-600 shadow-2xs">
                {card.category}
              </span>
            </div>

            {/* Target Person Name & Start Date */}
            <div className="grid grid-cols-12 gap-1.5 text-[9.5px]">
              <div className="col-span-7 p-1 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between">
                <span className="text-[8.5px] font-bold text-slate-400 shrink-0 mr-1">기도 대상자:</span>
                <span className="text-slate-700 font-bold font-serif flex-1 truncate">_____________</span>
              </div>
              <div className="col-span-5 p-1 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between">
                <span className="text-[8.5px] font-bold text-slate-400 shrink-0 mr-1">시작일:</span>
                <span className="text-slate-600 font-mono text-[9px]">____.__.__</span>
              </div>
            </div>

            {/* Prayer Lines */}
            <div className="bg-white p-2 rounded-xl border border-slate-200/80 flex-1 flex flex-col justify-around space-y-1">
              <span className="text-[9px] font-bold text-amber-900 block">🙏 구체적인 기도 제목 & 성령님의 마음:</span>
              <div className="border-b border-dashed border-slate-200 h-3 text-[9px] text-slate-300" />
              <div className="border-b border-dashed border-slate-200 h-3 text-[9px] text-slate-300" />
              <div className="border-b border-dashed border-slate-200 h-3 text-[9px] text-slate-300" />
            </div>

            {/* Answered Date & Praise */}
            <div className="text-[9.5px] text-indigo-950 bg-indigo-50/70 p-1.5 rounded-xl border border-indigo-100 flex items-center justify-between">
              <span>🙌 응답 및 감사 기쁨 기록 (Answered):</span>
              <span className="text-[8.5px] text-indigo-600 font-bold font-mono">Date: ____.__.__</span>
            </div>
          </div>
        ))}
      </div>

      {/* 4. Footer */}
      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1.5 border-t border-slate-200 mt-1.5">
        <span>SUNDAY SERMON STUDIO — INTERCESSORY PRAYER CARD</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
