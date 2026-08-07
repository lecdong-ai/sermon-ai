'use client'

import React from 'react'

interface QtBudgetTrackerPageProps {
  year?: number
  monthName?: string
  themeColor?: string
  pageWidth?: number
  pageHeight?: number
}

export default function QtBudgetTrackerPage({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 768,
}: QtBudgetTrackerPageProps) {
  return (
    <div
      data-page-key="budget-tracker"
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
      <div className="flex items-center justify-between border-b border-slate-300 pb-2 mb-2.5">
        <div className="flex items-center space-x-3 text-[11px] font-medium tracking-wider text-slate-400">
          <span className="font-mono">YEARLY</span>
          <span className="font-mono">{year}</span>
          <span className="px-2 py-0.5 rounded text-white font-bold" style={{ backgroundColor: themeColor }}>
            {monthName.toUpperCase().slice(0, 3)}
          </span>
        </div>

        <div className="flex items-center space-x-3 text-[11px] font-medium text-slate-400">
          <span>FINANCIAL DASHBOARD</span>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[10px] shadow-xs">
            💰 MONTHLY BUDGET & ASSETS
          </span>
        </div>
      </div>

      {/* 2. Page Title & Financial Summary KPI Bar */}
      <div className="flex items-center justify-between mb-2.5">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-800 tracking-wide flex items-center gap-2">
            <span>💰 {monthName} Monthly Financial & Asset Log</span>
          </h1>
          <p className="text-[11px] text-slate-500 mt-0.5">
            이번 달 총 수입, 고정 지출, 무지출 데이 챌린지와 꼼꼼한 소비 내역을 한눈에 관리하세요.
          </p>
        </div>

        {/* 4 Summary KPI Cards */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-right min-w-[90px]">
            <span className="text-[9px] text-slate-400 font-bold block uppercase">총 수입 (Income)</span>
            <span className="text-xs font-extrabold text-slate-700 font-mono">₩ 0</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50/40 text-right min-w-[90px]">
            <span className="text-[9px] text-rose-500 font-bold block uppercase">총 지출 (Spend)</span>
            <span className="text-xs font-extrabold text-rose-600 font-mono">₩ 0</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50/40 text-right min-w-[90px]">
            <span className="text-[9px] text-emerald-600 font-bold block uppercase">저축/투자 (Savings)</span>
            <span className="text-xs font-extrabold text-emerald-700 font-mono">₩ 0</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl border border-amber-200 bg-amber-50/40 text-right min-w-[80px]">
            <span className="text-[9px] text-amber-700 font-bold block uppercase">저축률 (Goal)</span>
            <span className="text-xs font-extrabold text-amber-800 font-mono">0 %</span>
          </div>
        </div>
      </div>

      {/* 3. Main Content Grid (Left 4.5 cols / Right 7.5 cols) */}
      <div className="grid grid-cols-12 gap-3 flex-1">
        {/* Left Column: Fixed Expenses + Category Budgets + No-Spend Day (5 cols) */}
        <div className="col-span-5 flex flex-col justify-between space-y-2">
          {/* Section A: Fixed Expenses & Subscriptions */}
          <div className="border border-slate-200/90 rounded-2xl p-2.5 bg-slate-50/50 space-y-1.5 shadow-2xs">
            <h4 className="text-[10.5px] font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between border-b border-slate-200 pb-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                🔒 고정 지출 & 월간 구독 (Fixed & Subscriptions)
              </span>
              <span className="text-[9px] text-slate-400 font-mono">Check</span>
            </h4>
            <div className="grid grid-cols-2 gap-1.5 text-[9.5px] text-slate-600">
              {['월세 / 주택 대출', '통신비 / 인터넷', '보험료 / 공과금', 'OTT / 정기 구독'].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between bg-white p-1 rounded-lg border border-slate-200/80">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded border border-slate-300 inline-block" />
                    <span>{item}</span>
                  </span>
                  <span className="text-slate-300 font-mono">₩ ____</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section B: Category Budgets (카테고리 예산 배분) */}
          <div className="border border-slate-200/90 rounded-2xl p-2.5 bg-white space-y-1.5 shadow-2xs flex-1 flex flex-col justify-between">
            <h4 className="text-[10.5px] font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between border-b border-slate-200 pb-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                📊 카테고리별 예산 배분 (Category Budget)
              </span>
              <span className="text-[9px] text-slate-400 font-mono">Plan vs Real</span>
            </h4>
            <div className="space-y-1 text-[9.5px] flex-1 flex flex-col justify-around">
              {[
                { name: '🍳 식비 / 카페', goal: '₩ 50만', color: 'bg-amber-400' },
                { name: '🛍️ 쇼핑 / 패션', goal: '₩ 30만', color: 'bg-rose-400' },
                { name: '🎬 문화 / 취미', goal: '₩ 20만', color: 'bg-purple-400' },
                { name: '🚗 교통 / 유류', goal: '₩ 15만', color: 'bg-blue-400' },
              ].map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between border-b border-dashed border-slate-100 pb-0.5">
                  <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                    <span className={`w-2 h-2 rounded-full ${cat.color}`} />
                    {cat.name}
                  </span>
                  <div className="flex items-center gap-2 text-slate-400 font-mono">
                    <span>목표: {cat.goal}</span>
                    <span className="text-slate-300">|</span>
                    <span className="text-slate-600 font-bold">실제: ₩ _____</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section C: No-Spend Day Challenge */}
          <div className="border border-slate-200/90 rounded-2xl p-2.5 bg-slate-50/50 space-y-1 shadow-2xs">
            <h4 className="text-[10.5px] font-bold text-emerald-900 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span>🌱 무지출 데이 스탬프 (No-Spend Days)</span>
              </span>
              <span className="text-[9px] text-emerald-700 font-bold">Goal: 10 Days</span>
            </h4>
            <div className="grid grid-cols-10 gap-1 pt-0.5">
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                <div
                  key={d}
                  className="aspect-square rounded-md border border-slate-200 bg-white flex items-center justify-center text-[8.5px] font-extrabold text-slate-400 hover:border-emerald-500 hover:text-emerald-700 cursor-pointer"
                >
                  {d}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Daily Expense Log (7.5 cols) */}
        <div className="col-span-7 border border-slate-200/90 rounded-2xl p-3 bg-white flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-1.5">
            <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: themeColor }} />
              📝 세부 지출 내역 (Daily Expense Log)
            </h4>
            <span className="text-[9.5px] text-slate-400 font-mono">Date / Item / Category / Payment / Amount</span>
          </div>

          {/* Detailed Expense Table (12 rows) */}
          <div className="border border-slate-200 rounded-xl overflow-hidden flex-1 flex flex-col justify-between text-[9.5px]">
            <div className="grid grid-cols-[45px_1fr_75px_65px_75px] bg-slate-100 font-bold text-slate-700 p-1.5 text-center border-b border-slate-200">
              <div>날짜</div>
              <div className="text-left px-2">지출 내용 & 상세 항목</div>
              <div>카테고리</div>
              <div>결제수단</div>
              <div>금액</div>
            </div>

            <div className="flex-1 divide-y divide-slate-150 flex flex-col justify-around">
              {Array.from({ length: 11 }, (_, i) => (
                <div key={i} className="grid grid-cols-[45px_1fr_75px_65px_75px] items-center p-1 text-center text-slate-400">
                  <div className="font-mono text-slate-500 font-bold text-[9px]">__/__</div>
                  <div className="text-left px-2 text-slate-300 font-serif">_______________________________</div>
                  <div className="text-slate-500 bg-slate-50 px-1 py-0.5 rounded text-[8.5px]">식비/생활</div>
                  <div className="text-slate-400 text-[8.5px]">카드/현금</div>
                  <div className="font-mono font-bold text-slate-600">₩ ________</div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Review Note */}
          <div className="mt-2 bg-emerald-50/50 p-2 rounded-xl border border-emerald-100 flex items-center justify-between text-[9.5px]">
            <span className="text-emerald-950 font-bold">💡 이번 달 소비 성찰 & 다음 달 결단:</span>
            <span className="text-emerald-700 font-semibold">Self-Feedback & Goal</span>
          </div>
        </div>
      </div>

      {/* 4. Footer */}
      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1.5 border-t border-slate-200 mt-1.5">
        <span>PREMIUM DIARY STUDIO — MONTHLY BUDGET & ASSET REPORT</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
