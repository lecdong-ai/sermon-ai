'use client'

import React from 'react'
import QtQuickIndexNav from './QtQuickIndexNav'

interface QtBudgetTrackerPageProps {
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

export default function QtBudgetTrackerPage({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 768,
}: QtBudgetTrackerPageProps) {
  const monthNum = MONTH_MAP[monthName] || 8

  return (
    <div
      data-page-key="budget"
      data-page-type="full-bleed"
      className="qt-page relative bg-white text-slate-800 flex flex-col justify-between overflow-hidden shadow-md mx-auto"
      style={{
        width: `${pageWidth}px`,
        height: `${pageHeight}px`,
        padding: '20px 56px 20px 24px',
        boxSizing: 'border-box',
        fontFamily: "'Noto Sans KR', 'Pretendard', sans-serif",
      }}
    >
      <QtQuickIndexNav currentMonth={monthNum} activeTab="tracker" themeColor={themeColor} />
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
          <span>FINANCIAL ASSET MASTER</span>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[10px] shadow-xs">
            💰 MONTHLY ASSET & BUDGET MASTER
          </span>
        </div>
      </div>

      {/* 2. Page Title & 4 Summary Executive KPI Bar */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-xl font-sans font-bold text-slate-800 tracking-wide flex items-center gap-2 whitespace-nowrap">
            <span className="whitespace-nowrap">💰 {monthName} Financial & Asset Planning (월간 자산 & 예산 통합 대시보드)</span>
          </h1>
          <p className="text-[10.5px] text-slate-500 mt-0.5">
            수입, 자산 포트폴리오, 고정 지출, 카테고리 예산 배분을 한눈에 관리하는 진짜 월간 가계부입니다.
          </p>
        </div>

        {/* Executive KPI Cards (지우기 편하게 0원 텍스트 전면 제거) */}
        <div className="flex items-center gap-1.5 text-[9.5px]">
          <div className="px-2.5 py-1 rounded-xl border border-slate-200 bg-slate-50 text-right min-w-[78px]">
            <span className="text-[8px] text-slate-400 font-bold block">월 총 수입</span>
            <span className="text-xs font-extrabold text-slate-700 font-mono">₩ </span>
          </div>
          <div className="px-2.5 py-1 rounded-xl border border-indigo-200 bg-indigo-50/40 text-right min-w-[78px]">
            <span className="text-[8px] text-indigo-500 font-bold block">총 고정지출</span>
            <span className="text-xs font-extrabold text-indigo-700 font-mono">₩ </span>
          </div>
          <div className="px-2.5 py-1 rounded-xl border border-rose-200 bg-rose-50/40 text-right min-w-[78px]">
            <span className="text-[8px] text-rose-500 font-bold block">변동 예산</span>
            <span className="text-xs font-extrabold text-rose-600 font-mono">₩ </span>
          </div>
          <div className="px-2.5 py-1 rounded-xl border border-emerald-200 bg-emerald-50/40 text-right min-w-[85px]">
            <span className="text-[8px] text-emerald-600 font-bold block">순저축/투자</span>
            <span className="text-xs font-extrabold text-emerald-700 font-mono">₩ </span>
          </div>
        </div>
      </div>

      {/* 3. Main Master Financial Grid (Left 6 cols: Income & Asset Portfolio / Right 6 cols: Fixed & Variable Budget) */}
      <div className="grid grid-cols-12 gap-3 flex-1">
        {/* Left Column (6 cols): Income Sources + Asset Portfolio & Investments */}
        <div className="col-span-6 flex flex-col justify-between space-y-2">
          {/* Module A: Monthly Income Breakdown (수입 세부 내역) */}
          <div className="border border-slate-200/90 rounded-2xl p-2.5 bg-slate-50/60 shadow-2xs space-y-1.5">
            <h4 className="text-[10.5px] font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between border-b border-slate-200 pb-1">
              <span className="flex items-center gap-1.5 font-sans">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                💵 월간 수입 상세 내역 (Income Sources)
              </span>
              <span className="text-[8.5px] text-slate-400 font-mono">Target vs Actual</span>
            </h4>
            <div className="space-y-1 text-[9px]">
              {[
                { name: '💼 주 수입 (월급/상여)', desc: '목표: ₩ ________ | 실제: ₩ ________' },
                { name: '💻 부 수입 (부업/콘텐츠)', desc: '목표: ₩ ________ | 실제: ₩ ________' },
                { name: '📈 금융 수입 (배당/이자)', desc: '목표: ₩ ________ | 실제: ₩ ________' },
                { name: '🎁 기타 수입 (환급/중고)', desc: '목표: ₩ ________ | 실제: ₩ ________' },
              ].map((inc, idx) => (
                <div key={idx} className="flex items-center justify-between bg-white p-1.5 rounded-xl border border-slate-200/80">
                  <span className="font-bold text-slate-700">{inc.name}</span>
                  <span className="text-slate-400 font-mono text-[8.5px]">{inc.desc}</span>
                </div>
              ))}
            </div>
            <div className="pt-0.5 text-[9px] font-bold text-emerald-800 text-right">
              수입 총합: ₩ ________________
            </div>
          </div>

          {/* Module B: Asset Portfolio & Wealth Building (자산 포트폴리오 & 저축/투자) */}
          <div className="border border-slate-200/90 rounded-2xl p-2.5 bg-white shadow-2xs space-y-1.5 flex-1 flex flex-col justify-between">
            <h4 className="text-[10.5px] font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between border-b border-slate-200 pb-1">
              <span className="flex items-center gap-1.5 font-sans">
                <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                🏦 자산 포트폴리오 & 저축/투자 (Asset Portfolio)
              </span>
              <span className="text-[8.5px] text-indigo-600 font-mono font-bold">Wealth Target</span>
            </h4>
            <div className="space-y-1 text-[9px] flex-1 flex flex-col justify-around">
              {[
                { name: '🏦 예금 / 적금 (Savings)', target: '목표 ₩ ________', color: 'text-indigo-900 bg-indigo-50' },
                { name: '📈 주식 / 펀드 / ETF (Investments)', target: '목표 ₩ ________', color: 'text-emerald-900 bg-emerald-50' },
                { name: '🛡️ 비상금 / 세금 펀드 (Emergency)', target: '목표 ₩ ________', color: 'text-amber-900 bg-amber-50' },
                { name: '🏠 주택청약 / 연금 (Housing & Pension)', target: '목표 ₩ ________', color: 'text-rose-900 bg-rose-50' },
              ].map((ast, idx) => (
                <div key={idx} className="flex items-center justify-between bg-slate-50/60 p-1.5 rounded-xl border border-slate-200/80">
                  <span className="font-bold text-slate-700">{ast.name}</span>
                  <div className="flex items-center gap-2 font-mono text-[8.5px]">
                    <span className={`px-1.5 py-0.5 rounded font-bold ${ast.color}`}>{ast.target}</span>
                    <span className="text-slate-500">누적: ₩ ______</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-1 border-t border-slate-200 flex justify-between text-[9px] font-bold text-slate-700">
              <span>이번 달 저축/투자 총액: ₩ ____________</span>
              <span className="text-emerald-700">순자산 순증: ₩ ____________</span>
            </div>
          </div>
        </div>

        {/* Right Column (6 cols): Fixed Expenses + Variable Budget Allocation + Financial Mindset Goal */}
        <div className="col-span-6 flex flex-col justify-between space-y-2">
          {/* Module C: Fixed Expenses & Subscriptions (고정 지출 & 정기 구독) */}
          <div className="border border-slate-200/90 rounded-2xl p-2.5 bg-slate-50/60 shadow-2xs space-y-1.5">
            <h4 className="text-[10.5px] font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between border-b border-slate-200 pb-1">
              <span className="flex items-center gap-1.5 font-sans">
                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                🔒 월간 고정 지출 & 정기 구독 (Fixed Expenses)
              </span>
              <span className="text-[8.5px] text-slate-400 font-mono">Date / Amount / Check</span>
            </h4>
            <div className="grid grid-cols-2 gap-1.5 text-[9px]">
              {[
                { name: '🏡 주거 (월세/대출)', amount: '₩ ________' },
                { name: '⚡ 관리비 / 공과금', amount: '₩ ________' },
                { name: '📱 통신비 / 인터넷', amount: '₩ ________' },
                { name: '🛡️ 보험료 (실손/자동차)', amount: '₩ ________' },
                { name: '🎬 OTT / 구독 서비스', amount: '₩ ________' },
                { name: '💳 기타 정기 결제', amount: '₩ ________' },
              ].map((fix, idx) => (
                <div key={idx} className="flex items-center justify-between bg-white p-1.5 rounded-xl border border-slate-200/80">
                  <span className="text-slate-700 font-medium truncate">{fix.name}</span>
                  <span className="font-mono text-slate-500 font-bold text-[8.5px]">{fix.amount}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Module D: Variable Budget Allocation (변동 지출 카테고리 예산 배분) */}
          <div className="border border-slate-200/90 rounded-2xl p-2.5 bg-white shadow-2xs space-y-1.5 flex-1 flex flex-col justify-between">
            <h4 className="text-[10.5px] font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between border-b border-slate-200 pb-1">
              <span className="flex items-center gap-1.5 font-sans">
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                📊 변동 지출 카테고리 예산 수립 (Budget Plan vs Actual)
              </span>
              <span className="text-[8.5px] text-slate-400 font-mono">Plan / Actual</span>
            </h4>
            <div className="space-y-1 text-[9px] flex-1 flex flex-col justify-around">
              {[
                { name: '🍳 식비 & 카페', goal: '₩ 50만', color: 'bg-amber-400' },
                { name: '🛍️ 쇼핑 & 생필품', goal: '₩ 30만', color: 'bg-rose-400' },
                { name: '🚗 교통 & 유류비', goal: '₩ 15만', color: 'bg-blue-400' },
                { name: '🎬 문화 & 자기계발', goal: '₩ 20만', color: 'bg-purple-400' },
                { name: '🏥 의료 & 경조사비', goal: '₩ 15만', color: 'bg-emerald-400' },
              ].map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between bg-slate-50/40 p-1.5 rounded-xl border border-slate-200/80">
                  <span className="flex items-center gap-1.5 text-slate-700 font-bold">
                    <span className={`w-2 h-2 rounded-full ${cat.color}`} />
                    {cat.name}
                  </span>
                  <div className="flex items-center gap-2 text-slate-400 font-mono text-[8.5px]">
                    <span>예산: {cat.goal}</span>
                    <span className="text-slate-300">|</span>
                    <span className="text-slate-700 font-bold">실제: ₩ ______</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Module E: Financial Goal & Reset Banner */}
          <div className="border border-slate-200/90 rounded-2xl p-2 bg-emerald-50/70 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-[9.5px] font-bold text-emerald-950">
              <span>🎯 이번 달 재정 목표 & 자산 형성을 위한 결단</span>
              <span className="text-emerald-700 font-mono">Target Savings: ____%</span>
            </div>
            <div className="border-b border-dashed border-emerald-200 h-3 text-[8.5px] text-emerald-800/80 font-sans">나의 수입과 지출을 지혜롭게 관리하여 풍요로운 삶을 가꿉니다.</div>
          </div>
        </div>
      </div>

      {/* 4. Footer */}
      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1.5 border-t border-slate-200 mt-1.5">
        <span>PREMIUM FINANCIAL STUDIO — MONTHLY ASSET & BUDGET MASTER (VOL. 1)</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
