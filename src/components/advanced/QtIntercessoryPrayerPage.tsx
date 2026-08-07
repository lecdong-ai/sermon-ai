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
}: QtIntercessoryPrayerPageProps) {
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
      <div className="flex items-center justify-between border-b border-slate-300 pb-2 mb-2">
        <div className="flex items-center space-x-3 text-[11px] font-medium tracking-wider text-slate-400 font-mono">
          <span>YEARLY</span>
          <span>{year}</span>
          <span className="px-2 py-0.5 rounded text-white font-bold" style={{ backgroundColor: themeColor }}>
            {monthName.toUpperCase().slice(0, 3)}
          </span>
        </div>

        <div className="flex items-center space-x-3 text-[11px] font-medium text-slate-400">
          <span>INTERCESSORY PRAYER MASTER</span>
          <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-bold text-[10px] shadow-xs">
            💖 중보기도 & 공동체 은혜 노트
          </span>
        </div>
      </div>

      {/* 2. Page Title */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-xl font-serif font-bold text-slate-800 tracking-wide flex items-center gap-2 whitespace-nowrap">
            <span>💖 {monthName} Intercessory Prayer & Community Journal</span>
          </h1>
          <p className="text-[10.5px] text-slate-500 mt-0.5 whitespace-nowrap">
            가족, 교우, 환우, 열방을 위해 눈물과 사랑으로 성벽을 쌓는 중보기도 카드입니다.
          </p>
        </div>

        <div className="px-3 py-1 rounded-full text-xs font-bold text-rose-950 bg-rose-50 border border-rose-200 shadow-xs whitespace-nowrap">
          사랑의 중보기도 카드
        </div>
      </div>

      {/* 3. 4 Intercessory Pillar Cards (2x2 Grid) */}
      <div className="grid grid-cols-2 gap-3 flex-1 mb-2">
        {[
          { title: '👨‍👩‍👧‍👦 01. 가족 & 사랑하는 사람', category: '가족 중보', color: 'border-rose-300 bg-rose-50/20' },
          { title: '⛪ 02. 교우 / 순원 / 소그룹', category: '공동체 중보', color: 'border-indigo-300 bg-indigo-50/20' },
          { title: '🏥 03. 환우 / 치유 & 회복', category: '치유 중보', color: 'border-amber-300 bg-amber-50/20' },
          { title: '🌏 04. 열방 / 선교사 & 이웃', category: '열방 중보', color: 'border-emerald-300 bg-emerald-50/20' },
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

            {/* Target & Date Info */}
            <div className="grid grid-cols-12 gap-1 text-[8.5px]">
              <div className="col-span-7 bg-white p-1 rounded-xl border border-slate-200/80 flex items-center justify-between">
                <span className="text-[7.5px] font-bold text-slate-400">기도 대상자:</span>
                <span className="text-slate-700 font-bold font-serif text-[8.5px]">____________</span>
              </div>
              <div className="col-span-5 bg-white p-1 rounded-xl border border-slate-200/80 flex items-center justify-between">
                <span className="text-[7.5px] font-bold text-rose-800">응답 확인:</span>
                <span className="text-rose-700 font-bold text-[8px]">응답 완료 □</span>
              </div>
            </div>

            {/* Prayer Topic & Blessing note */}
            <div className="space-y-1 flex-1 bg-white p-2 rounded-xl border border-slate-200/80 text-[8.5px]">
              <div>
                <span className="font-bold text-slate-700 text-[8px] block">📌 간절한 기도 제목 (Intercession Topic):</span>
                <div className="text-slate-400 font-serif text-[8.5px] min-h-[14px]">_____________________________________________</div>
              </div>
              <div>
                <span className="font-bold text-rose-800 text-[8px] block">💌 응답 소식 & 축복 묵상 메모 (Answer Note):</span>
                <div className="text-slate-400 font-serif text-[8.5px] min-h-[14px]">_____________________________________________</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 4. Bottom Blessing Banner */}
      <div className="border border-rose-200/90 rounded-2xl p-2 bg-rose-50/70 shadow-2xs space-y-1">
        <div className="flex items-center justify-between text-[9.5px] font-bold text-rose-950">
          <span>💖 서로를 위해 기도할 때 하늘의 평강과 공동체의 은혜가 넘쳐납니다</span>
          <span className="text-rose-700 font-mono">Love & Intercession</span>
        </div>
        <div className="border-b border-dashed border-rose-200 h-3 text-[8.5px] text-rose-900/80 font-serif">"너희는 서로 죄를 고백하며 병이 낫기를 위하여 서로 기도하라 의인의 간구는 역사하는 힘이 큼이니라 (야고보서 5:16)"</div>
      </div>

      {/* 5. Footer */}
      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1.5 border-t border-slate-200 mt-1.5">
        <span>PREMIUM DIARY STUDIO — INTERCESSORY PRAYER & COMMUNITY MASTER</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
