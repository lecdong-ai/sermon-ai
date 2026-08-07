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
          💳 31-DAY EXPENSE LOG & MINDSET
        </span>
      </div>

      {/* 2. Page Title */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-xl font-serif font-bold text-slate-800 tracking-wide flex items-center gap-2 whitespace-nowrap">
            <span>💳 {monthName} 31-Day Daily Expense Log</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            한 달 31일 전일 지출 기록, N(필요) vs W(욕망) 지출 분석 및 무지출 스탬프 서식입니다.
          </p>
        </div>
        <div className="px-4 py-1.5 rounded-full text-xs font-bold text-emerald-950 bg-emerald-50 border border-emerald-200 shadow-xs">
          N(Need) vs W(Want) 분석 지원
        </div>
      </div>

      {/* 3. 31-Day No-Spend Stamp Section */}
      <div className="border border-slate-200/90 rounded-2xl p-3 bg-emerald-50/40 space-y-2 shadow-xs mb-3">
        <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center justify-between border-b border-emerald-200 pb-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
            🌱 31일 무지출 스탬프 챌린지 (No-Spend Day Stamps)
          </span>
          <span className="text-xs text-emerald-800 font-mono font-bold">아낀 예상액: ₩ ____________</span>
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

      {/* 4. Full 31-Day Expense Table Section with N vs W */}
      <div className="border border-slate-200/90 rounded-2xl p-4 bg-white flex-1 flex flex-col justify-between shadow-xs mb-3">
        <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-1.5">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
            📝 31일 전일 세부 지출 기록란 (1일 ~ 31일)
          </span>
          <span className="text-xs text-slate-400 font-mono">Date / Item / Need or Want / Amount</span>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-12 gap-2 text-xs font-bold text-slate-500 bg-slate-100 p-2 rounded-xl text-center mb-1">
          <span className="col-span-1">날짜</span>
          <span className="col-span-4 text-left pl-2">지출 세부 내역</span>
          <span className="col-span-2">성격 (N/W)</span>
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
              <span className="col-span-2 text-center text-slate-500 font-mono text-[10px]">N □ / W □</span>
              <span className="col-span-2 text-center text-slate-300">카드/현금</span>
              <span className="col-span-2 text-right font-mono pr-2 text-slate-300">₩ 0</span>
              <span className="col-span-1 text-center"><span className="w-3.5 h-3.5 rounded border border-slate-300 inline-block" /></span>
            </div>
          ))}
        </div>

        {/* Weekly Subtotals Summary Bar */}
        <div className="pt-2 border-t border-slate-200 flex justify-between text-xs font-bold text-slate-600">
          <span>1주(₩ ____) | 2주(₩ ____) | 3주(₩ ____) | 4주(₩ ____)</span>
          <span className="text-emerald-700 font-mono">총 누적: ₩ ____________</span>
        </div>
      </div>

      {/* 5. Financial Mindset Reflection Box */}
      <div className="border border-slate-200/90 rounded-2xl p-3 bg-slate-50/60 shadow-xs mb-2 space-y-1.5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-800 border-b border-slate-200 pb-1">
          <span>💡 머니 마인드셋 & 소비 회고 노트</span>
          <span className="text-emerald-700 font-mono">Must Savings Target</span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
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

      {/* 6. Footer */}
      <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-300">
        <span>PREMIUM FINANCIAL STUDIO — 31-DAY EXPENSE LOG & MINDSET (VOL. 2)</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
