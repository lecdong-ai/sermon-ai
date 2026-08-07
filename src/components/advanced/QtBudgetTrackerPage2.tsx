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
          <span>31-DAY FULL EXPENSE LOG</span>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[10px] shadow-xs">
            💳 31일 전일 지출 & 무지출 챌린지
          </span>
        </div>
      </div>

      {/* 2. Page Title */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-xl font-serif font-bold text-slate-800 tracking-wide whitespace-nowrap">
            💳 {monthName} 31-Day Daily Expense Log
          </h1>
          <p className="text-[10.5px] text-slate-500 mt-0.5 whitespace-nowrap">
            한 달 31일 전일의 세부 지출 내역과 무지출 챌린지 스탬프를 빠짐없이 기록하는 서식입니다.
          </p>
        </div>

        <div className="px-3 py-1 rounded-full text-xs font-bold text-emerald-950 bg-emerald-50 border border-emerald-200 shadow-xs whitespace-nowrap">
          1일~31일 전일 기록 지원
        </div>
      </div>

      {/* 3. Dedicated Full-Width No-Spend Stamp Banner (Non-overflowing) */}
      <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-1.5 px-3 flex items-center justify-between text-[9.5px] mb-2 shadow-2xs">
        <span className="font-bold text-emerald-950 shrink-0 flex items-center gap-1">
          <span>🌱 31일 무지출 스탬프 챌린지:</span>
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
        <span className="text-[8.5px] font-bold text-emerald-800 shrink-0">목표: __일 / 달성: __일</span>
      </div>

      {/* 4. Main 31-Day Dual Column Expense Table (Left: Day 1~16 / Right: Day 17~31 + Reflection) */}
      <div className="grid grid-cols-12 gap-3 flex-1">
        {/* Left Column Table: Day 01 ~ Day 16 (6 cols) */}
        <div className="col-span-6 border border-slate-200/90 rounded-2xl p-2.5 bg-white flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-1">
            <span className="text-[10.5px] font-bold text-slate-800 font-serif flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              📅 상반월 지출 기록 (Day 01 ~ Day 16)
            </span>
            <span className="text-[8.5px] text-slate-400 font-mono">16 Days</span>
          </div>

          <div className="grid grid-cols-12 gap-1 text-[8.5px] font-bold text-slate-500 bg-slate-100 p-1 rounded-md text-center mb-1">
            <span className="col-span-2">날짜</span>
            <span className="col-span-4 text-left pl-1">지출 내역 (Item)</span>
            <span className="col-span-2">카테고리</span>
            <span className="col-span-2 text-right pr-1">금액 (₩)</span>
            <span className="col-span-2">수단/영수증</span>
          </div>

          <div className="space-y-0.5 flex-1 flex flex-col justify-between text-[8.5px]">
            {Array.from({ length: 16 }, (_, i) => (
              <div key={i} className="grid grid-cols-12 gap-1 items-center border-b border-dashed border-slate-200 py-[1.5px] text-slate-400">
                <span className="col-span-2 text-center font-mono font-bold text-slate-600">{String(i + 1).padStart(2, '0')}일</span>
                <span className="col-span-4 text-slate-300 truncate">___________________</span>
                <span className="col-span-2 text-center text-slate-300">____</span>
                <span className="col-span-2 text-right font-mono pr-1 text-slate-300">₩ 0</span>
                <span className="col-span-2 text-center text-[8px] text-slate-300">카드 □</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column Table: Day 17 ~ Day 31 + Monthly Reflection Box (6 cols) */}
        <div className="col-span-6 flex flex-col justify-between space-y-2">
          {/* Table Day 17 ~ Day 31 */}
          <div className="border border-slate-200/90 rounded-2xl p-2.5 bg-white flex-1 flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-1">
              <span className="text-[10.5px] font-bold text-slate-800 font-serif flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                📅 하반월 지출 기록 (Day 17 ~ Day 31)
              </span>
              <span className="text-[8.5px] text-slate-400 font-mono">15 Days</span>
            </div>

            <div className="grid grid-cols-12 gap-1 text-[8.5px] font-bold text-slate-500 bg-slate-100 p-1 rounded-md text-center mb-1">
              <span className="col-span-2">날짜</span>
              <span className="col-span-4 text-left pl-1">지출 내역 (Item)</span>
              <span className="col-span-2">카테고리</span>
              <span className="col-span-2 text-right pr-1">금액 (₩)</span>
              <span className="col-span-2">수단/영수증</span>
            </div>

            <div className="space-y-0.5 flex-1 flex flex-col justify-between text-[8.5px]">
              {Array.from({ length: 15 }, (_, i) => i + 17).map((d) => (
                <div key={d} className="grid grid-cols-12 gap-1 items-center border-b border-dashed border-slate-200 py-[1.5px] text-slate-400">
                  <span className="col-span-2 text-center font-mono font-bold text-slate-600">{String(d).padStart(2, '0')}일</span>
                  <span className="col-span-4 text-slate-300 truncate">___________________</span>
                  <span className="col-span-2 text-center text-slate-300">____</span>
                  <span className="col-span-2 text-right font-mono pr-1 text-slate-300">₩ 0</span>
                  <span className="col-span-2 text-center text-[8px] text-slate-300">카드 □</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Financial Reflection Banner */}
          <div className="border border-slate-200/90 rounded-2xl p-2 bg-slate-50/70 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-[9.5px] font-bold text-slate-700">
              <span>💡 월간 재정 성찰 (Financial Reset)</span>
              <span className="text-emerald-700 font-mono">총 지출 누적: ₩ ________________</span>
            </div>
            <div className="border-b border-dashed border-slate-200 h-3 text-[8.5px] text-slate-400 font-serif">가장 잘 절약한 항목 & 다음 달 다짐: ________________________________________________</div>
          </div>
        </div>
      </div>

      {/* 5. Footer */}
      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1.5 border-t border-slate-200 mt-1.5">
        <span>PREMIUM FINANCIAL STUDIO — 31-DAY FULL EXPENSE LOG (VOL. 2)</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
