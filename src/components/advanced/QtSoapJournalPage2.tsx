'use client'

import React from 'react'

interface QtSoapJournalPage2Props {
  year?: number
  monthName?: string
  themeColor?: string
  pageWidth?: number
  pageHeight?: number
}

export default function QtSoapJournalPage2({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 768,
}: QtSoapJournalPage2Props) {
  return (
    <div
      data-page-key="soap-journal-2"
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
          <span>SOAP BIBLE MEDITATION (VOL. 2: A & P)</span>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[10px] shadow-xs">
            🌱 SOAP② 삶의 순종 & 결단 기도문 (VOL. 2)
          </span>
        </div>
      </div>

      {/* 2. Page Title */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-xl font-serif font-bold text-slate-800 tracking-wide whitespace-nowrap">
            🌱 {monthName} SOAP Meditation: Application & Prayer
          </h1>
          <p className="text-[10.5px] text-slate-500 mt-0.5 whitespace-nowrap">
            A(삶의 실천 적용)와 P(하나님께 적어 올리는 기도)를 통해 말씀을 삶으로 살아냅니다.
          </p>
        </div>

        <div className="px-3 py-1 rounded-full text-xs font-bold text-emerald-950 bg-emerald-50 border border-emerald-200 shadow-2xs whitespace-nowrap">
          SOAP② 순종 & 결단 기도문
        </div>
      </div>

      {/* 3. Main Grid (Left 6 Cols A: Application 3-Action Plan / Right 6 Cols P: Written Prayer & Seal) */}
      <div className="grid grid-cols-12 gap-3 flex-1 mb-2">
        {/* Left: A - Application 3-Action Plan (6 cols) */}
        <div className="col-span-6 border border-emerald-200 rounded-2xl p-3 bg-gradient-to-b from-emerald-50/40 via-white to-emerald-50/20 flex flex-col justify-between shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between border-b border-emerald-200 pb-1.5 text-[9.5px]">
            <span className="font-bold text-emerald-950 font-serif flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white font-mono text-[9px] flex items-center justify-center font-bold">A</span>
              🌱 APPLICATION (삶의 3단계 순종 플래너)
            </span>
            <span className="font-mono text-[8px] text-emerald-700">3-Step Action</span>
          </div>

          <div className="space-y-1.5 flex-1 flex flex-col justify-around text-[8.5px]">
            {/* Step 1: Today */}
            <div className="bg-white p-2 rounded-xl border border-emerald-200/80">
              <span className="font-bold text-emerald-900 text-[8px] block">☀️ 1. 오늘 바로 실천할 순종 (Today&apos;s Action):</span>
              <div className="text-slate-400 font-serif text-[8.5px] min-h-[14px]">__________________________________________________</div>
            </div>

            {/* Step 2: This Week */}
            <div className="bg-white p-2 rounded-xl border border-emerald-200/80">
              <span className="font-bold text-emerald-900 text-[8px] block">📅 2. 이번 주 바꿀 내 언어와 태도 (Weekly Behavior):</span>
              <div className="text-slate-400 font-serif text-[8.5px] min-h-[14px]">__________________________________________________</div>
            </div>

            {/* Step 3: Life Value */}
            <div className="bg-white p-2 rounded-xl border border-emerald-200/80">
              <span className="font-bold text-emerald-900 text-[8px] block">⚓ 3. 내 삶에 붙잡을 영적 가치관 (Life Value):</span>
              <div className="text-slate-400 font-serif text-[8.5px] min-h-[14px]">__________________________________________________</div>
            </div>
          </div>
        </div>

        {/* Right: P - Prayer & Meditation Seal (6 cols) */}
        <div className="col-span-6 border border-purple-200 rounded-2xl p-3 bg-gradient-to-b from-purple-50/40 via-white to-purple-50/20 flex flex-col justify-between shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between border-b border-purple-200 pb-1.5 text-[9.5px]">
            <span className="font-bold text-purple-950 font-serif flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-purple-600 text-white font-mono text-[9px] flex items-center justify-center font-bold">P</span>
              🙏 PRAYER (하나님께 드리는 결단 기도문)
            </span>
            <span className="font-mono text-[8px] text-purple-700">Written Prayer</span>
          </div>

          <div className="bg-white p-2 rounded-xl border border-purple-200/80 flex-1 flex flex-col justify-between space-y-1 text-[8.5px]">
            <div className="border-b border-purple-100 pb-1 text-[8px] font-bold text-purple-900">
              &quot;말씀대로 살지 못했던 저를 용서하시고 성령님 도와주소서...&quot;
            </div>
            <div className="space-y-1 flex-1 flex flex-col justify-around text-slate-400 font-serif text-[8.5px] py-0.5">
              {[1, 2, 3, 4].map((lNo) => (
                <div key={lNo} className="border-b border-purple-100 pb-0.5">
                  {lNo}. __________________________________________________
                </div>
              ))}
            </div>
            <div className="text-right text-[8px] text-purple-800 font-bold font-serif pt-0.5">
              예수님의 이름으로 기도합니다. 아멘 🕊️
            </div>
          </div>
        </div>
      </div>

      {/* 4. Footer */}
      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1.5 border-t border-slate-200 mt-1.5">
        <span>PREMIUM DIARY STUDIO — SOAP BIBLE MEDITATION (VOL. 2)</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
