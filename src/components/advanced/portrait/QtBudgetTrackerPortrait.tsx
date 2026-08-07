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
      <div className="flex items-center justify-between border-b border-slate-300 pb-3 mb-3">
        <div className="flex items-center space-x-4 text-xs font-medium tracking-wider text-slate-400 font-mono">
          <span>YEARLY</span>
          <span>{year}</span>
          <span className="px-2.5 py-0.5 rounded text-white font-bold" style={{ backgroundColor: themeColor }}>
            {monthName.toUpperCase().slice(0, 3)}
          </span>
        </div>
        <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-bold text-xs shadow-xs">
          💰 MONTHLY ASSET & BUDGET MASTER
        </span>
      </div>

      {/* 2. Page Title */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-xl font-serif font-bold text-slate-800 tracking-wide flex items-center gap-2 whitespace-nowrap">
            <span>💰 {monthName} Financial & Asset Planning</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            월간 수입 상세, 자산 포트폴리오, 고정 지출 및 변동 예산을 한눈에 수립하는 진짜 가계부 대시보드입니다.
          </p>
        </div>
        <div className="px-4 py-1.5 rounded-full text-xs font-bold text-emerald-950 bg-emerald-50 border border-emerald-200 shadow-xs">
          월간 자산 & 예산 통합 마스터
        </div>
      </div>

      {/* 3. Executive 4 KPI Cards Bar */}
      <div className="grid grid-cols-4 gap-3 text-xs mb-4">
        <div className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-right">
          <span className="text-[10px] text-slate-400 font-bold block">월 총 수입 (Income)</span>
          <span className="text-sm font-extrabold text-slate-700 font-mono">₩ 0</span>
        </div>
        <div className="px-3 py-2 rounded-xl border border-indigo-200 bg-indigo-50/40 text-right">
          <span className="text-[10px] text-indigo-500 font-bold block">총 고정지출 (Fixed)</span>
          <span className="text-sm font-extrabold text-indigo-700 font-mono">₩ 0</span>
        </div>
        <div className="px-3 py-2 rounded-xl border border-rose-200 bg-rose-50/40 text-right">
          <span className="text-[10px] text-rose-500 font-bold block">변동 예산 (Budget)</span>
          <span className="text-sm font-extrabold text-rose-600 font-mono">₩ 0</span>
        </div>
        <div className="px-3 py-2 rounded-xl border border-emerald-200 bg-emerald-50/40 text-right">
          <span className="text-[10px] text-emerald-600 font-bold block">순저축/투자 (Savings)</span>
          <span className="text-sm font-extrabold text-emerald-700 font-mono">₩ 0 (0%)</span>
        </div>
      </div>

      {/* 4. Main Modules Stack */}
      <div className="space-y-4 flex-1 flex flex-col justify-between mb-3">
        {/* Module A: Monthly Income Sources */}
        <div className="border border-slate-200/90 rounded-2xl p-4 bg-slate-50/60 shadow-xs space-y-2">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between border-b border-slate-200 pb-1.5">
            <span className="flex items-center gap-2 font-serif">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              💵 월간 수입 상세 내역 (Income Sources)
            </span>
            <span className="text-xs text-slate-400 font-mono">Target vs Actual</span>
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { name: '💼 주 수입 (월급/상여)', desc: '목표: ₩ ______ | 실제: ₩ ______' },
              { name: '💻 부 수입 (부업/콘텐츠)', desc: '목표: ₩ ______ | 실제: ₩ ______' },
              { name: '📈 금융 수입 (배당/이자)', desc: '목표: ₩ ______ | 실제: ₩ ______' },
              { name: '🎁 기타 수입 (환급/중고)', desc: '목표: ₩ ______ | 실제: ₩ ______' },
            ].map((inc, idx) => (
              <div key={idx} className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-200/80">
                <span className="font-bold text-slate-700">{inc.name}</span>
                <span className="text-slate-400 font-mono text-[10px]">{inc.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Module B: Asset Portfolio & Investments */}
        <div className="border border-slate-200/90 rounded-2xl p-4 bg-white shadow-xs space-y-2">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between border-b border-slate-200 pb-1.5">
            <span className="flex items-center gap-2 font-serif">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
              🏦 자산 포트폴리오 & 저축/투자 현황 (Asset Portfolio)
            </span>
            <span className="text-xs text-indigo-600 font-mono font-bold">Wealth Target</span>
          </h4>
          <div className="space-y-2 text-xs">
            {[
              { name: '🏦 예금 / 적금 (Savings)', target: '목표 ₩ ________', color: 'text-indigo-900 bg-indigo-50' },
              { name: '📈 주식 / 펀드 / ETF (Investments)', target: '목표 ₩ ________', color: 'text-emerald-900 bg-emerald-50' },
              { name: '🛡️ 비상금 / 세금 펀드 (Emergency)', target: '목표 ₩ ________', color: 'text-amber-900 bg-amber-50' },
              { name: '🏠 주택청약 / 연금 (Housing & Pension)', target: '목표 ₩ ________', color: 'text-rose-900 bg-rose-50' },
            ].map((ast, idx) => (
              <div key={idx} className="flex items-center justify-between bg-slate-50/60 p-2 rounded-xl border border-slate-200/80">
                <span className="font-bold text-slate-700">{ast.name}</span>
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className={`px-2 py-0.5 rounded font-bold ${ast.color}`}>{ast.target}</span>
                  <span className="text-slate-500">누적: ₩ ________</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Module C: Fixed Expenses & Subscriptions */}
        <div className="border border-slate-200/90 rounded-2xl p-4 bg-slate-50/60 shadow-xs space-y-2">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between border-b border-slate-200 pb-1.5">
            <span className="flex items-center gap-2 font-serif">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
              🔒 월간 고정 지출 & 정기 구독 (Fixed Expenses)
            </span>
            <span className="text-xs text-slate-400 font-mono">Check</span>
          </h4>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {[
              { name: '🏡 주거 (월세/대출)', amount: '₩ ________' },
              { name: '⚡ 관리비 / 공과금', amount: '₩ ________' },
              { name: '📱 통신비 / 인터넷', amount: '₩ ________' },
              { name: '🛡️ 보험료 (실손/차)', amount: '₩ ________' },
              { name: '🎬 OTT / 구독', amount: '₩ ________' },
              { name: '💳 기타 정기결제', amount: '₩ ________' },
            ].map((fix, idx) => (
              <div key={idx} className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-200/80">
                <span className="text-slate-700 font-medium truncate">{fix.name}</span>
                <span className="font-mono text-slate-500 font-bold text-xs">{fix.amount}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Module D: Variable Budget Allocation */}
        <div className="border border-slate-200/90 rounded-2xl p-4 bg-white shadow-xs space-y-2">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between border-b border-slate-200 pb-1.5">
            <span className="flex items-center gap-2 font-serif">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
              📊 변동 지출 카테고리 예산 배분 (Budget Allocation)
            </span>
            <span className="text-xs text-slate-400 font-mono">Plan vs Actual</span>
          </h4>
          <div className="space-y-1.5 text-xs">
            {[
              { name: '🍳 식비 & 카페', goal: '₩ 50만', color: 'bg-amber-400' },
              { name: '🛍️ 쇼핑 & 생필품', goal: '₩ 30만', color: 'bg-rose-400' },
              { name: '🚗 교통 & 유류비', goal: '₩ 15만', color: 'bg-blue-400' },
              { name: '🎬 문화 & 자기계발', goal: '₩ 20만', color: 'bg-purple-400' },
              { name: '🏥 의료 & 경조사비', goal: '₩ 15만', color: 'bg-emerald-400' },
            ].map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between bg-slate-50/40 p-2 rounded-xl border border-slate-200/80">
                <span className="flex items-center gap-2 text-slate-700 font-bold">
                  <span className={`w-2.5 h-2.5 rounded-full ${cat.color}`} />
                  {cat.name}
                </span>
                <div className="flex items-center gap-3 text-slate-400 font-mono text-xs">
                  <span>예산: {cat.goal}</span>
                  <span className="text-slate-300">|</span>
                  <span className="text-slate-700 font-bold">실제: ₩ ________</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Financial Mindset Goal Banner */}
      <div className="border border-slate-200/90 rounded-2xl p-3 bg-emerald-50/70 shadow-xs mb-2 space-y-1">
        <div className="flex items-center justify-between text-xs font-bold text-emerald-950">
          <span>🎯 이번 달 재정 목표 & 자산 형성을 위한 결단 (Financial Mindset Goal)</span>
          <span className="text-emerald-700 font-mono">Target Savings Rate: ____%</span>
        </div>
        <div className="border-b border-dashed border-emerald-200 h-4 text-xs text-emerald-800/80 font-serif">나의 수입과 지출을 지혜롭게 관리하여 건강하고 풍요로운 삶을 가꿉니다.</div>
      </div>

      {/* 6. Footer */}
      <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-300">
        <span>PREMIUM FINANCIAL STUDIO — MONTHLY ASSET & BUDGET MASTER (VOL. 1)</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
