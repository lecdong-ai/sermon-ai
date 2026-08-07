'use client'

import React from 'react'

interface QtIntercessoryPrayerPortraitProps {
  year?: number
  monthName?: string
  themeColor?: string
  pageWidth?: number
  pageHeight?: number
}

export default function QtIntercessoryPrayerPortrait({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 1448,
}: QtIntercessoryPrayerPortraitProps) {
  return (
    <div
      data-page-key="intercessory-prayer-portrait"
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
        <span className="px-3 py-1 rounded-full bg-rose-600 text-white font-bold text-xs shadow-xs">
          💖 INTERCESSORY PRAYER MASTER
        </span>
      </div>

      {/* 2. Page Title */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-800 tracking-wide flex items-center gap-2">
            <span>💖 {monthName} Intercessory Prayer Journal</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            가족, 교우, 환우, 열방을 위해 눈물과 사랑으로 기도하고 응답의 기쁨을 나누는 마스터 서식입니다.
          </p>
        </div>
        <div className="px-4 py-1.5 rounded-full text-xs font-bold text-rose-950 bg-rose-50 border border-rose-200 shadow-xs">
          사랑의 중보기도 카드
        </div>
      </div>

      {/* 3. 4 Core Intercessory Cards Stack */}
      <div className="space-y-3.5 flex-1 flex flex-col justify-between mb-3">
        {[
          { title: '👨‍👩‍👧‍👦 01. 가족 & 사랑하는 사람', category: '가족 중보', color: 'border-rose-300 bg-rose-50/20' },
          { title: '⛪ 02. 교우 / 순원 / 소그룹', category: '공동체 중보', color: 'border-indigo-300 bg-indigo-50/20' },
          { title: '🏥 03. 환우 / 치유 & 회복', category: '치유 중보', color: 'border-amber-300 bg-amber-50/20' },
          { title: '🌏 04. 열방 / 선교사 & 이웃', category: '열방 중보', color: 'border-emerald-300 bg-emerald-50/20' },
        ].map((card, idx) => (
          <div
            key={idx}
            className={`border rounded-2xl p-3.5 ${card.color} flex flex-col justify-between shadow-xs space-y-2 flex-1`}
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-1 text-xs">
              <span className="font-bold text-slate-800 font-serif flex items-center gap-1">
                {card.title}
              </span>
              <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                {card.category}
              </span>
            </div>

            <div className="grid grid-cols-12 gap-2 text-xs">
              <div className="col-span-7 bg-white p-1.5 rounded-xl border border-slate-200/80 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400">기도 대상자:</span>
                <span className="text-slate-700 font-bold font-serif text-xs">____________</span>
              </div>
              <div className="col-span-5 bg-white p-1.5 rounded-xl border border-slate-200/80 flex items-center justify-between">
                <span className="text-[10px] font-bold text-rose-800">응답 확인:</span>
                <span className="text-rose-700 font-bold text-xs">응답 완료 □</span>
              </div>
            </div>

            <div className="space-y-1.5 flex-1 bg-white p-2.5 rounded-xl border border-slate-200/80 text-xs">
              <div>
                <span className="font-bold text-slate-700 text-[10px] block">📌 간절한 기도 제목 (Intercession Topic):</span>
                <div className="text-slate-400 font-serif text-xs min-h-[16px]">________________________________________________</div>
              </div>
              <div>
                <span className="font-bold text-rose-800 text-[10px] block">💌 응답 소식 & 축복 묵상 메모 (Answer Note):</span>
                <div className="text-slate-400 font-serif text-xs min-h-[16px]">________________________________________________</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 4. Bottom Blessing Banner */}
      <div className="border border-rose-200/90 rounded-2xl p-3 bg-rose-50/70 shadow-xs mb-2 space-y-1">
        <div className="flex items-center justify-between text-xs font-bold text-rose-950">
          <span>💖 서로를 위해 기도할 때 하늘의 평강과 공동체의 은혜가 넘쳐납니다</span>
          <span className="text-rose-700 font-mono">Love & Intercession</span>
        </div>
        <div className="border-b border-dashed border-rose-200 h-4 text-xs text-rose-900/80 font-serif">"너희는 서로 죄를 고백하며 병이 낫기를 위하여 서로 기도하라 의인의 간구는 역사하는 힘이 큼이니라 (야고보서 5:16)"</div>
      </div>

      {/* 5. Footer */}
      <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-300">
        <span>PREMIUM DIARY STUDIO — INTERCESSORY PRAYER & COMMUNITY MASTER</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
