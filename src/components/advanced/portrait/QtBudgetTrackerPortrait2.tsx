'use client'

import React from 'react'

interface QtBudgetTrackerPortrait2Props {
  year?: number
  monthName?: string
  themeColor?: string
  pageWidth?: number
  pageHeight?: number
}

export default function QtBudgetTrackerPortrait2({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 1448,
}: QtBudgetTrackerPortrait2Props) {
  return (
    <div
      data-page-key="budget-tracker-2-portrait"
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
        <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-bold text-xs shadow-xs">
          💳 31-DAY FULL EXPENSE LOG
        </span>
      </div>

      {/* 2. Page Title */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-800 tracking-wide flex items-center gap-2">
            <span>💳 {monthName} 31-Day Daily Expense Log</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            한 달 31일 전일의 세부 지출 내역과 무지출 챌린지 스탬프를 기록하는 정밀 서식입니다.
          </p>
        </div>
        <div className="px-4 py-1.5 rounded-full text-xs font-bold text-emerald-950 bg-emerald-50 border border-emerald-200 shadow-xs">
          1일~31일 전일 기록 지원
        </div>
      </div>

      {/* 3. 31-Day No-Spend Stamp Section */}
      <div className="border border-slate-200/90 rounded-2xl p-3 bg-emerald-50/40 space-y-2 shadow-xs mb-3">
        <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center justify-between border-b border-emerald-200 pb-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
            🌱 31일 무지출 스탬프 챌린지 (No-Spend Day Stamps)
          </span>
          <span className="text-xs text-emerald-700 font-mono">31 Days</span>
        </h4>
        <div className="grid grid-cols-10 gap-1.5 py-0.5">
          {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
            <div
              key={d}
              className="aspect-square rounded-lg border border-emerald-200/80 bg-white flex items-center justify-center text-xs font-bold text-emerald-700/70 hover:bg-emerald-100 hover:text-emerald-900 cursor-pointer shadow-2xs"
            >
              {d}
            </div>
          ))}
        </div>
      </div>

      {/* 4. Full 31-Day Expense Table Section */}
      <div className="border border-slate-200/90 rounded-2xl p-4 bg-white flex-1 flex flex-col justify-between shadow-xs mb-3">
        <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-1.5">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
            📝 31일 전일 세부 지출 기록란 (1일 ~ 31일)
          </span>
          <span className="text-xs text-slate-400 font-mono">Date / Item / Category / Amount</span>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-12 gap-2 text-xs font-bold text-slate-500 bg-slate-100 p-2 rounded-xl text-center mb-1">
          <span className="col-span-1">날짜</span>
          <span className="col-span-4 text-left pl-2">지출 세부 내역</span>
          <span className="col-span-2">카테고리</span>
          <span className="col-span-2">결제수단</span>
          <span className="col-span-2 text-right pr-2">금액 (₩)</span>
          <span className="col-span-1">영수증</span>
        </div>

        {/* 31 Rows for Day 1 to Day 31 */}
        <div className="space-y-1 flex-1 flex flex-col justify-between text-xs">
          {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
            <div key={d} className="grid grid-cols-12 gap-2 items-center border-b border-dashed border-slate-200 py-[2px] text-slate-400">
              <span className="col-span-1 text-center font-mono font-bold text-slate-600 text-xs">{String(d).padStart(2, '0')}일</span>
              <span className="col-span-4 text-slate-300">________________________</span>
              <span className="col-span-2 text-center text-slate-300">____</span>
              <span className="col-span-2 text-center text-slate-300">카드/현금</span>
              <span className="col-span-2 text-right font-mono pr-2 text-slate-300">₩ 0</span>
              <span className="col-span-1 text-center"><span className="w-3.5 h-3.5 rounded border border-slate-300 inline-block" /></span>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Financial Reflection Box */}
      <div className="border border-slate-200/90 rounded-2xl p-3 bg-slate-50/60 shadow-xs mb-2 space-y-1.5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-800 border-b border-slate-200 pb-1">
          <span>💡 월간 재정 피드백 & 다음 달 리셋 (Reflection & Reset)</span>
          <span className="text-emerald-700 font-mono">총 지출 누적: ₩ ________________</span>
        </div>
        <div className="border-b border-dashed border-slate-200 h-4 text-xs text-slate-400 font-serif">가장 잘 절약한 항목 & 다음 달 목표: ________________________________________________</div>
      </div>

      {/* 6. Footer */}
      <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-300">
        <span>PREMIUM FINANCIAL STUDIO — 31-DAY FULL EXPENSE LOG (VOL. 2)</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
