'use client'

import React from 'react'

interface QtBudgetTrackerPage2Props {
  year?: number
  monthName?: string
  themeColor?: string
  pageWidth?: number
  pageHeight?: number
}

export default function QtBudgetTrackerPage2({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 768,
}: QtBudgetTrackerPage2Props) {
  return (
    <div
      data-page-key="budget-tracker-2"
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
      {/* 1. Top Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-300 pb-2 mb-2">
        <div className="flex items-center space-x-3 text-[11px] font-medium tracking-wider text-slate-400 font-mono">
          <span>YEARLY</span>
          <span>{year}</span>
          <span className="px-2 py-0.5 rounded text-white font-bold" style={{ backgroundColor: themeColor }}>
            {monthName.toUpperCase().slice(0, 3)}
          </span>
        </div>

        <div className="flex items-center space-x-3 text-[11px] font-medium text-slate-400">
          <span>31-DAY EXPENSE LOG & MINDSET</span>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[10px] shadow-xs">
            💳 31일 데일리 지출 & N/W 성격 분석
          </span>
        </div>
      </div>

      {/* 2. Page Title */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-xl font-serif font-bold text-slate-800 tracking-wide whitespace-nowrap">
            💳 {monthName} 31-Day Daily Expense & Money Mindset
          </h1>
          <p className="text-[10.5px] text-slate-500 mt-0.5 whitespace-nowrap">
            31일 전일 지출 기록과 N(필요) vs W(욕망) 성격 분류, 주차별 소계로 현명한 소비 습관을 다집니다.
          </p>
        </div>

        <div className="px-3 py-1 rounded-full text-xs font-bold text-emerald-950 bg-emerald-50 border border-emerald-200 shadow-xs whitespace-nowrap">
          N(Need) vs W(Want) 지출 분석 지원
        </div>
      </div>

      {/* 3. Full-Width No-Spend Stamp Banner + Saved Money Tracker */}
      <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-1.5 px-3 flex items-center justify-between text-[9.5px] mb-2 shadow-2xs">
        <span className="font-bold text-emerald-950 shrink-0 flex items-center gap-1">
          <span>🌱 31일 무지출 스탬프:</span>
        </span>
        <div className="flex items-center gap-1 overflow-hidden px-1">
          {Array.from({ length: 31 }, (_, i) => (
            <span
              key={i}
              className="w-4 h-4 rounded border border-emerald-300 bg-white text-[8px] font-bold text-emerald-700 flex items-center justify-center cursor-pointer hover:bg-emerald-200 shrink-0"
            >
              {i + 1}
            </span>
          ))}
        </div>
        <span className="text-[8.5px] font-bold text-emerald-900 shrink-0">무지출: __일 | 아낀 예상액: ₩ ____________</span>
      </div>

      {/* 4. Main 31-Day Dual Column Expense Table (Left: Day 1~16 / Right: Day 17~31 + Subtotals & Reflection) */}
      <div className="grid grid-cols-12 gap-3 flex-1">
        {/* Left Column Table: Day 01 ~ Day 16 (6 cols) */}
        <div className="col-span-6 border border-slate-200/90 rounded-2xl p-2.5 bg-white flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-1">
            <span className="text-[10.5px] font-bold text-slate-800 font-serif flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              📅 상반월 지출 기록 (Day 01 ~ Day 16)
            </span>
            <span className="text-[8.5px] text-slate-400 font-mono">1주(01~07) | 2주(08~14)</span>
          </div>

          {/* Table Header with N vs W Column */}
          <div className="grid grid-cols-12 gap-1 text-[8.5px] font-bold text-slate-500 bg-slate-100 p-1 rounded-md text-center mb-1">
            <span className="col-span-2">날짜</span>
            <span className="col-span-4 text-left pl-1">지출 내역 (Item)</span>
            <span className="col-span-2">성격 (N/W)</span>
            <span className="col-span-2 text-right pr-1">금액 (₩)</span>
            <span className="col-span-2">수단/영수증</span>
          </div>

          <div className="space-y-0.5 flex-1 flex flex-col justify-between text-[8.5px]">
            {Array.from({ length: 16 }, (_, i) => (
              <div key={i} className="grid grid-cols-12 gap-1 items-center border-b border-dashed border-slate-200 py-[1.5px] text-slate-400">
                <span className="col-span-2 text-center font-mono font-bold text-slate-600">{String(i + 1).padStart(2, '0')}일</span>
                <span className="col-span-4 text-slate-300 truncate">___________________</span>
                <span className="col-span-2 text-center font-mono text-[8px] text-slate-500">N □ / W □</span>
                <span className="col-span-2 text-right font-mono pr-1 text-slate-300">₩ 0</span>
                <span className="col-span-2 text-center text-[8px] text-slate-300">카드 □</span>
              </div>
            ))}
          </div>

          {/* Weekly Subtotal Bar (Weeks 1 & 2) */}
          <div className="pt-1 mt-1 border-t border-slate-200 flex justify-between items-center text-[8.5px] font-bold text-slate-600">
            <span>1주 소계: ₩ ________</span>
            <span>2주 소계: ₩ ________</span>
            <span className="text-emerald-700">상반월 합계: ₩ ____________</span>
          </div>
        </div>

        {/* Right Column Table: Day 17 ~ Day 31 + Weekly Subtotals & Mindset Reflection (6 cols) */}
        <div className="col-span-6 flex flex-col justify-between space-y-2">
          {/* Table Day 17 ~ Day 31 */}
          <div className="border border-slate-200/90 rounded-2xl p-2.5 bg-white flex-1 flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-1">
              <span className="text-[10.5px] font-bold text-slate-800 font-serif flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                📅 하반월 지출 기록 (Day 17 ~ Day 31)
              </span>
              <span className="text-[8.5px] text-slate-400 font-mono">3주(15~21) | 4주(22~31)</span>
            </div>

            <div className="grid grid-cols-12 gap-1 text-[8.5px] font-bold text-slate-500 bg-slate-100 p-1 rounded-md text-center mb-1">
              <span className="col-span-2">날짜</span>
              <span className="col-span-4 text-left pl-1">지출 내역 (Item)</span>
              <span className="col-span-2">성격 (N/W)</span>
              <span className="col-span-2 text-right pr-1">금액 (₩)</span>
              <span className="col-span-2">수단/영수증</span>
            </div>

            <div className="space-y-0.5 flex-1 flex flex-col justify-between text-[8.5px]">
              {Array.from({ length: 15 }, (_, i) => i + 17).map((d) => (
                <div key={d} className="grid grid-cols-12 gap-1 items-center border-b border-dashed border-slate-200 py-[1.5px] text-slate-400">
                  <span className="col-span-2 text-center font-mono font-bold text-slate-600">{String(d).padStart(2, '0')}일</span>
                  <span className="col-span-4 text-slate-300 truncate">___________________</span>
                  <span className="col-span-2 text-center font-mono text-[8px] text-slate-500">N □ / W □</span>
                  <span className="col-span-2 text-right font-mono pr-1 text-slate-300">₩ 0</span>
                  <span className="col-span-2 text-center text-[8px] text-slate-300">카드 □</span>
                </div>
              ))}
            </div>

            {/* Weekly Subtotal Bar (Weeks 3 & 4) */}
            <div className="pt-1 mt-1 border-t border-slate-200 flex justify-between items-center text-[8.5px] font-bold text-slate-600">
              <span>3주 소계: ₩ ________</span>
              <span>4주 소계: ₩ ________</span>
              <span className="text-indigo-700">하반월 합계: ₩ ____________</span>
            </div>
          </div>

          {/* Bottom Financial Reflection Banner with Best vs Regret Expense */}
          <div className="border border-slate-200/90 rounded-2xl p-2 bg-slate-50/70 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-[9px] font-bold text-slate-700 border-b border-slate-200 pb-0.5">
              <span>💡 머니 마인드셋 & 소비 회고 노트</span>
              <span className="text-emerald-700 font-mono">월 지출 총액: ₩ ________________</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[8.5px] text-slate-600">
              <div>
                <span className="font-bold text-emerald-800">🎉 최고의 지출 (Best):</span>
                <span className="text-slate-400 block font-serif">___________________________</span>
              </div>
              <div>
                <span className="font-bold text-rose-800">😅 아쉬운 지출 (Regret W):</span>
                <span className="text-slate-400 block font-serif">___________________________</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Footer */}
      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1.5 border-t border-slate-200 mt-1.5">
        <span>PREMIUM FINANCIAL STUDIO — 31-DAY EXPENSE LOG & MINDSET (VOL. 2)</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
