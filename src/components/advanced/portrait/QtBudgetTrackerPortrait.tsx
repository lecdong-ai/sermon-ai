'use client'

import React from 'react'

interface QtBudgetTrackerPortraitProps {
  year?: number
  monthName?: string
  themeColor?: string
  pageWidth?: number
  pageHeight?: number
}

export default function QtBudgetTrackerPortrait({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 1448,
}: QtBudgetTrackerPortraitProps) {
  return (
    <div
      data-page-key="budget-tracker-portrait"
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
      <div className="flex items-center justify-between border-b border-slate-300 pb-3 mb-4">
        <div className="flex items-center space-x-4 text-xs font-medium tracking-wider text-slate-400">
          <span className="font-mono">YEARLY</span>
          <span className="font-mono">{year}</span>
          <span className="px-2.5 py-0.5 rounded text-white font-bold" style={{ backgroundColor: themeColor }}>
            {monthName.toUpperCase().slice(0, 3)}
          </span>
        </div>
        <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-bold text-xs shadow-xs">
          💰 MONTHLY BUDGET & ASSETS
        </span>
      </div>

      {/* 2. Page Title */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-800 tracking-wide flex items-center gap-2">
            <span>💰 {monthName} Monthly Financial Log</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            수입과 고정 지출, 카테고리별 예산 및 무지출 데이를 한눈에 관리하는 월간 종합 자산 노트입니다.
          </p>
        </div>
        <div className="px-4 py-1.5 rounded-full text-xs font-bold text-emerald-950 bg-emerald-100 border border-emerald-300 shadow-xs">
          {year}년 {monthName} 가계부 & 자산 리포트
        </div>
      </div>

      {/* 3. 4 KPI Financial Overview Cards */}
      <div className="grid grid-cols-4 gap-3 mb-4 text-center">
        <div className="border border-slate-200 rounded-2xl p-2.5 bg-slate-50">
          <span className="text-xs text-slate-400 font-bold block uppercase">총 수입 (Income)</span>
          <span className="text-sm font-extrabold text-slate-700 font-mono">₩ 0</span>
        </div>
        <div className="border border-rose-200 rounded-2xl p-2.5 bg-rose-50/40">
          <span className="text-xs text-rose-500 font-bold block uppercase">총 지출 (Spend)</span>
          <span className="text-sm font-extrabold text-rose-600 font-mono">₩ 0</span>
        </div>
        <div className="border border-emerald-200 rounded-2xl p-2.5 bg-emerald-50/40">
          <span className="text-xs text-emerald-600 font-bold block uppercase">저축/투자 (Savings)</span>
          <span className="text-sm font-extrabold text-emerald-700 font-mono">₩ 0</span>
        </div>
        <div className="border border-amber-200 rounded-2xl p-2.5 bg-amber-50/40">
          <span className="text-xs text-amber-700 font-bold block uppercase">저축률 (Goal)</span>
          <span className="text-sm font-extrabold text-amber-800 font-mono">0 %</span>
        </div>
      </div>

      {/* 4. Two-Column Middle Grid: Fixed Expenses & Category Budget */}
      <div className="grid grid-cols-12 gap-4 mb-4">
        {/* Left: Fixed Expenses & Subscriptions (6 cols) */}
        <div className="col-span-6 border border-slate-200/90 rounded-2xl p-3.5 bg-slate-50/50 space-y-2 shadow-xs">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between border-b border-slate-200 pb-1.5">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
              🔒 고정 지출 & 정기 구독 (Fixed & Subscriptions)
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Check</span>
          </h4>
          <div className="space-y-1.5 text-xs text-slate-600">
            {['월세 / 주택 대출', '통신비 / 인터넷', '보험료 / 공과금', 'OTT / 정기 구독'].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between bg-white p-1.5 rounded-xl border border-slate-200/80">
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded border border-slate-300 inline-block" />
                  <span>{item}</span>
                </span>
                <span className="text-slate-300 font-mono">₩ _______</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Category Budgets (6 cols) */}
        <div className="col-span-6 border border-slate-200/90 rounded-2xl p-3.5 bg-white space-y-2 shadow-xs">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between border-b border-slate-200 pb-1.5">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              📊 카테고리별 예산 배분 (Category Budget)
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Plan vs Real</span>
          </h4>
          <div className="space-y-1.5 text-xs">
            {[
              { name: '🍳 식비 / 카페', goal: '₩ 50만', color: 'bg-amber-400' },
              { name: '🛍️ 쇼핑 / 패션', goal: '₩ 30만', color: 'bg-rose-400' },
              { name: '🎬 문화 / 취미', goal: '₩ 20만', color: 'bg-purple-400' },
              { name: '🚗 교통 / 유류', goal: '₩ 15만', color: 'bg-blue-400' },
            ].map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between border-b border-dashed border-slate-100 pb-1">
                <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                  <span className={`w-2 h-2 rounded-full ${cat.color}`} />
                  {cat.name}
                </span>
                <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
                  <span>목표: {cat.goal}</span>
                  <span className="text-slate-300">|</span>
                  <span className="text-slate-600 font-bold">실제: ₩ ______</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Detailed Daily Expense Log (Vertical Table - 14 rows) */}
      <div className="flex-1 border border-slate-200/90 rounded-2xl p-4 bg-white flex flex-col justify-between shadow-xs mb-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: themeColor }} />
            📝 세부 지출 내역 (Daily Expense History)
          </h4>
          <span className="text-xs text-slate-400 font-mono">Date / Item / Category / Payment / Amount</span>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden flex-1 flex flex-col justify-between text-xs">
          <div className="grid grid-cols-[55px_1fr_90px_80px_90px] bg-slate-100 font-bold text-slate-700 p-2 text-center border-b border-slate-200">
            <div>날짜</div>
            <div className="text-left px-2">지출 내용 & 상세 항목</div>
            <div>카테고리</div>
            <div>결제수단</div>
            <div>금액</div>
          </div>

          <div className="flex-1 divide-y divide-slate-150 flex flex-col justify-around">
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} className="grid grid-cols-[55px_1fr_90px_80px_90px] items-center p-1.5 text-center text-slate-400">
                <div className="font-mono text-slate-500 font-bold text-xs">__/__</div>
                <div className="text-left px-2 text-slate-300 font-serif">___________________________________</div>
                <div className="text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded text-[10px]">식비/생활</div>
                <div className="text-slate-400 text-[10px]">카드/현금</div>
                <div className="font-mono font-bold text-slate-600">₩ ________</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6. No-Spend Day Challenge */}
      <div className="border border-slate-200/90 rounded-2xl p-3 bg-slate-50/50 space-y-1.5 shadow-xs">
        <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span>🌱 무지출 데이 스탬프 챌린지 (No-Spend Days)</span>
          </span>
          <span className="text-xs text-emerald-700 font-bold">Target: 10 Days</span>
        </h4>
        <div className="grid grid-cols-16 gap-1 pt-1">
          {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
            <div
              key={d}
              className="aspect-square rounded-md border border-slate-200 bg-white flex items-center justify-center text-[10px] font-extrabold text-slate-400 hover:border-emerald-500 hover:text-emerald-700 cursor-pointer"
            >
              {d}
            </div>
          ))}
        </div>
      </div>

      {/* 7. Footer */}
      <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-300 mt-3">
        <span>PREMIUM DIARY STUDIO — MONTHLY BUDGET & ASSET REPORT</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
