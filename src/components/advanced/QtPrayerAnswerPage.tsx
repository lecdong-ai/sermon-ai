'use client'

import React from 'react'

interface QtPrayerAnswerPageProps {
  year?: number
  monthName?: string
  themeColor?: string
  pageWidth?: number
  pageHeight?: number
}

export default function QtPrayerAnswerPage({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 768,
}: QtPrayerAnswerPageProps) {
  return (
    <div
      data-page-key="prayer-log"
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
          <span>PERSONAL PRAYER & MILESTONES</span>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-600 text-white font-bold text-[10px] shadow-xs">
            🙏 개인 기도 & 은혜 응답 마스터
          </span>
        </div>
      </div>

      {/* 2. Page Title */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-xl font-serif font-bold text-slate-800 tracking-wide flex items-center gap-2 whitespace-nowrap">
            <span>🙏 {monthName} Personal Prayer & Grace Answer Journal</span>
          </h1>
          <p className="text-[10.5px] text-slate-500 mt-0.5 whitespace-nowrap">
            개인의 핵심 기도 제목을 하나님 앞에 간구하고 응답받은 날짜와 성경 말씀의 은혜를 기념합니다.
          </p>
        </div>

        <div className="px-3 py-1 rounded-full text-xs font-bold text-amber-950 bg-amber-50 border border-amber-200 shadow-xs whitespace-nowrap">
          은혜의 기념비 & 응답 노트
        </div>
      </div>

      {/* 3. 4 Core Prayer Pillar Cards (2x2 Grid) */}
      <div className="grid grid-cols-2 gap-3 flex-1 mb-2">
        {[
          { title: '🕊️ 01. 개인 영성 & 성품 기도', category: '영성 성품', color: 'border-amber-300 bg-amber-50/20' },
          { title: '💼 02. 비전, 진로 & 사명 기도', category: '비전 사명', color: 'border-indigo-300 bg-indigo-50/20' },
          { title: '👨‍👩‍👧‍👦 03. 가정, 관계 & 치유 기도', category: '가정 관계', color: 'border-emerald-300 bg-emerald-50/20' },
          { title: '🎉 04. 이달의 은혜 응답 기념비', category: '응답 은혜', color: 'border-rose-300 bg-rose-50/20' },
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
              <span className="font-mono text-[8px] font-extrabold px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                {card.category}
              </span>
            </div>

            {/* Date & Scripture Reference */}
            <div className="grid grid-cols-12 gap-1 text-[8.5px]">
              <div className="col-span-6 bg-white p-1 rounded-xl border border-slate-200/80 flex items-center justify-between">
                <span className="text-[7.5px] font-bold text-slate-400">기도 시작일:</span>
                <span className="text-slate-600 font-mono text-[8px]">2026.08.__</span>
              </div>
              <div className="col-span-6 bg-white p-1 rounded-xl border border-slate-200/80 flex items-center justify-between">
                <span className="text-[7.5px] font-bold text-emerald-800">응답 날짜:</span>
                <span className="text-emerald-700 font-mono font-bold text-[8px]">2026.__.__</span>
              </div>
            </div>

            {/* Prayer Topic & Scripture lines */}
            <div className="space-y-1 flex-1 bg-white p-2 rounded-xl border border-slate-200/80 text-[8.5px]">
              <div>
                <span className="font-bold text-slate-700 text-[8px] block">📌 핵심 기도 제목 (Prayer Topic):</span>
                <div className="text-slate-400 font-serif text-[8.5px] min-h-[14px]">_____________________________________________</div>
              </div>
              <div>
                <span className="font-bold text-indigo-800 text-[8px] block">📖 붙잡을 말씀 & 묵상 구절 (Scripture):</span>
                <div className="text-slate-400 font-serif text-[8.5px] min-h-[14px]">_____________________________________________</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 4. Bottom Prayer Mantra Banner */}
      <div className="border border-amber-200/90 rounded-2xl p-2 bg-amber-50/70 shadow-2xs space-y-1">
        <div className="flex items-center justify-between text-[9.5px] font-bold text-amber-950">
          <span>💡 하나님의 때에 가장 선한 방법으로 응답하실 주님을 신뢰합니다</span>
          <span className="text-amber-700 font-mono">Faith & Prayer</span>
        </div>
        <div className="border-b border-dashed border-amber-200 h-3 text-[8.5px] text-amber-900/80 font-serif">"아무 것도 염려하지 말고 다만 모든 일에 기도와 간구로, 너희 구할 것을 감사함으로 하나님께 아뢰라 (빌 4:6)"</div>
      </div>

      {/* 5. Footer */}
      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1.5 border-t border-slate-200 mt-1.5">
        <span>PREMIUM DIARY STUDIO — PERSONAL PRAYER & GRACE ANSWER MASTER</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
