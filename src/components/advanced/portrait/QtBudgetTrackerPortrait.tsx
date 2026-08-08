'use client'

import React from 'react'
import QtQuickIndexNavPortrait from './QtQuickIndexNavPortrait'

interface QtBudgetTrackerPortraitProps {
  year?: number
  monthName?: string
  themeColor?: string
  pageWidth?: number
  pageHeight?: number
}

const MONTH_MAP: Record<string, number> = {
  January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
  July: 7, August: 8, September: 9, October: 10, November: 11, December: 12,
}

export default function QtBudgetTrackerPortrait({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 1448,
}: QtBudgetTrackerPortraitProps) {
  const monthNum = MONTH_MAP[monthName] || 8

  return (
    <div
      data-page-key="budget"
      data-page-type="full-bleed"
      className="qt-page relative bg-white text-slate-800 flex flex-col justify-between overflow-hidden shadow-md mx-auto"
      style={{
        width: `${pageWidth}px`,
        height: `${pageHeight}px`,
        padding: '52px 20px 20px 20px',
        boxSizing: 'border-box',
        fontFamily: "'Noto Sans KR', 'Pretendard', sans-serif",
      }}
    >
      <QtQuickIndexNavPortrait currentMonth={monthNum} activeTab="tracker" themeColor={themeColor} />
      {/* 1. Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-300 pb-2 mb-2">
        <div className="flex items-center space-x-3 text-xs font-medium tracking-wider text-slate-400 font-mono">
          <span>YEARLY</span>
          <span>{year}</span>
          <span className="px-2 py-0.5 rounded text-white font-bold" style={{ backgroundColor: themeColor }}>
            {monthName.toUpperCase().slice(0, 3)}
          </span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[10.5px] shadow-2xs font-mono">
          💰 ASSET & BUDGET MASTER
        </span>
      </div>

      {/* 2. Page Title Header */}
      <div className="flex items-center justify-between mb-2.5">
        <div>
          <h1 className="text-xl font-serif font-bold text-slate-900 tracking-wide whitespace-nowrap">
            💰 {monthName} Financial & Asset Planning
          </h1>
          <p className="text-[11px] text-slate-500 mt-0.5">
            월간 수입 상세, 자산 포트폴리오, 고정 지출 및 변동 예산을 한눈에 수립하는 가계부 대시보드입니다.
          </p>
        </div>
        <div className="px-3 py-1 rounded-full text-[11px] font-bold text-emerald-950 bg-emerald-50 border border-emerald-200 shadow-2xs whitespace-nowrap">
          월간 자산 & 예산 마스터
        </div>
      </div>

      {/* 3. Executive 4 KPI Cards Bar */}
      <div className="grid grid-cols-4 gap-2 text-xs mb-2.5">
        <div className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-right">
          <span className="text-[9px] text-slate-400 font-bold block">월 총 수입 (Income)</span>
          <span className="text-xs font-extrabold text-slate-800 font-mono">₩ 0</span>
        </div>
        <div className="px-2.5 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/40 text-right">
          <span className="text-[9px] text-indigo-500 font-bold block">총 고정지출 (Fixed)</span>
          <span className="text-xs font-extrabold text-indigo-700 font-mono">₩ 0</span>
        </div>
        <div className="px-2.5 py-1.5 rounded-xl border border-rose-200 bg-rose-50/40 text-right">
          <span className="text-[9px] text-rose-500 font-bold block">변동 예산 (Budget)</span>
          <span className="text-xs font-extrabold text-rose-600 font-mono">₩ 0</span>
        </div>
        <div className="px-2.5 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50/40 text-right">
          <span className="text-[9px] text-emerald-600 font-bold block">순저축/투자 (Savings)</span>
          <span className="text-xs font-extrabold text-emerald-700 font-mono">₩ 0 (0%)</span>
        </div>
      </div>

      {/* 4. Main Modules Stack */}
      <div className="space-y-2.5 flex-1 flex flex-col justify-between mb-2">
        {/* Module A: Monthly Income Sources */}
        <div className="border border-slate-200 rounded-xl p-2.5 bg-slate-50/60 shadow-2xs space-y-1.5">
          <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between border-b border-slate-200 pb-1 font-serif">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              💵 월간 수입 상세 내역 (Income Sources)
            </span>
            <span className="text-[9px] text-slate-400 font-mono">Target vs Actual</span>
          </h4>
          <div className="grid grid-cols-2 gap-1.5 text-[10.5px]">
            {[
              { name: '💼 주 수입 (월급/상여)', desc: '목표: ₩ ____ | 실제: ₩ ____' },
              { name: '💻 부 수입 (부업/콘텐츠)', desc: '목표: ₩ ____ | 실제: ₩ ____' },
              { name: '📈 금융 수입 (배당/이자)', desc: '목표: ₩ ____ | 실제: ₩ ____' },
              { name: '🎁 기타 수입 (환급/중고)', desc: '목표: ₩ ____ | 실제: ₩ ____' },
            ].map((inc, idx) => (
              <div key={idx} className="flex items-center justify-between bg-white p-1.5 rounded-lg border border-slate-200/80">
                <span className="font-bold text-slate-700 truncate">{inc.name}</span>
                <span className="text-slate-400 font-mono text-[9px] whitespace-nowrap ml-1">{inc.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Module B: Asset Portfolio & Investments */}
        <div className="border border-slate-200 rounded-xl p-2.5 bg-white shadow-2xs space-y-1.5">
          <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between border-b border-slate-200 pb-1 font-serif">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
              🏦 자산 포트폴리오 & 저축/투자 현황 (Portfolio)
            </span>
            <span className="text-[9px] text-indigo-600 font-mono font-bold">Wealth Target</span>
          </h4>
          <div className="space-y-1 text-[10.5px]">
            {[
              { name: '🏦 예금 / 적금 (Savings)', target: '목표 ₩ ________', color: 'text-indigo-900 bg-indigo-50' },
              { name: '📈 주식 / 펀드 / ETF (Investments)', target: '목표 ₩ ________', color: 'text-emerald-900 bg-emerald-50' },
              { name: '🛡️ 비상금 / 세금 펀드 (Emergency)', target: '목표 ₩ ________', color: 'text-amber-900 bg-amber-50' },
              { name: '🏠 주택청약 / 연금 (Housing & Pension)', target: '목표 ₩ ________', color: 'text-rose-900 bg-rose-50' },
            ].map((ast, idx) => (
              <div key={idx} className="flex items-center justify-between bg-slate-50/60 p-1.5 rounded-lg border border-slate-200/80">
                <span className="font-bold text-slate-700 truncate">{ast.name}</span>
                <div className="flex items-center gap-1.5 font-mono text-[9.5px]">
                  <span className={`px-1.5 py-0.2 rounded font-bold ${ast.color}`}>{ast.target}</span>
                  <span className="text-slate-500">누적: ₩ ________</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Module C: Fixed Expenses & Subscriptions */}
        <div className="border border-slate-200 rounded-xl p-2.5 bg-slate-50/60 shadow-2xs space-y-1.5">
          <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between border-b border-slate-200 pb-1 font-serif">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              🔒 월간 고정 지출 & 정기 구독 (Fixed Expenses)
            </span>
            <span className="text-[9px] text-slate-400 font-mono">Check</span>
          </h4>
          <div className="grid grid-cols-3 gap-1.5 text-[10px]">
            {[
              { name: '🏡 주거 (월세/대출)', amount: '₩ ________' },
              { name: '⚡ 관리비/공과금', amount: '₩ ________' },
              { name: '📱 통신비/인터넷', amount: '₩ ________' },
              { name: '🛡️ 보험료 (실손/차)', amount: '₩ ________' },
              { name: '🎬 OTT / 구독', amount: '₩ ________' },
              { name: '💳 기타 정기결제', amount: '₩ ________' },
            ].map((fix, idx) => (
              <div key={idx} className="flex items-center justify-between bg-white p-1.5 rounded-lg border border-slate-200/80">
                <span className="text-slate-700 font-medium truncate mr-1">{fix.name}</span>
                <span className="font-mono text-slate-500 font-bold text-[9.5px] whitespace-nowrap">{fix.amount}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Module D: Variable Budget Allocation */}
        <div className="border border-slate-200 rounded-xl p-2.5 bg-white shadow-2xs space-y-1.5">
          <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between border-b border-slate-200 pb-1 font-serif">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
              📊 변동 지출 예산 배분 (Budget Allocation)
            </span>
            <span className="text-[9px] text-slate-400 font-mono">Plan vs Actual</span>
          </h4>
          <div className="space-y-1 text-[10px]">
            {[
              { name: '🍳 식비 & 카페', goal: '₩ 50만', color: 'bg-amber-400' },
              { name: '🛍️ 쇼핑 & 생필품', goal: '₩ 30만', color: 'bg-rose-400' },
              { name: '🚗 교통 & 유류비', goal: '₩ 15만', color: 'bg-blue-400' },
              { name: '🎬 문화 & 자기계발', goal: '₩ 20만', color: 'bg-purple-400' },
              { name: '🏥 의료 & 경조사비', goal: '₩ 15만', color: 'bg-emerald-400' },
            ].map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between bg-slate-50/40 p-1.5 rounded-lg border border-slate-200/80">
                <span className="flex items-center gap-1.5 text-slate-700 font-bold">
                  <span className={`w-2 h-2 rounded-full ${cat.color}`} />
                  {cat.name}
                </span>
                <div className="flex items-center gap-2 text-slate-400 font-mono text-[9.5px]">
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
      <div className="border border-slate-200 rounded-xl p-2 bg-emerald-50/60 shadow-2xs mb-1.5 space-y-0.5">
        <div className="flex items-center justify-between text-[10.5px] font-bold text-emerald-950 font-serif">
          <span>🎯 이달의 재정 목표 & 결단</span>
          <span className="text-emerald-700 font-mono text-[9.5px]">Target Savings: ____%</span>
        </div>
        <div className="border-b border-dashed border-emerald-200 h-3.5 text-[10px] text-emerald-800/80 font-serif">나의 수입과 지출을 지혜롭게 관리하여 건강하고 풍요로운 삶을 가꿉니다.</div>
      </div>

      {/* 6. Footer */}
      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1.5 border-t border-slate-200">
        <span>PREMIUM FINANCIAL STUDIO — ASSET & BUDGET MASTER</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
