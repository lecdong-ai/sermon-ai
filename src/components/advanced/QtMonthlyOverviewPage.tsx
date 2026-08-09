'use client'

import React from 'react'
import PerfectGridNote from './PerfectGridNote'
import QtQuickIndexNav from './QtQuickIndexNav'

interface QtMonthlyOverviewPageProps {
  year?: number
  monthName?: string
  themeColor?: string
  weeksInfo?: { weekLabel: string; dateRange: string }[]
  pageWidth?: number
  pageHeight?: number
  isGeneralMode?: boolean
}

const MONTH_MAP: Record<string, number> = {
  January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
  July: 7, August: 8, September: 9, October: 10, November: 11, December: 12,
}

export default function QtMonthlyOverviewPage({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  weeksInfo,
  pageWidth = 1024,
  pageHeight = 768,
  isGeneralMode = false,
}: QtMonthlyOverviewPageProps) {
  const monthNum = MONTH_MAP[monthName] || 8
  const defaultWeeks = weeksInfo || [
    { weekLabel: 'W1', dateRange: '08/01 - 08/07' },
    { weekLabel: 'W2', dateRange: '08/08 - 08/14' },
    { weekLabel: 'W3', dateRange: '08/15 - 08/21' },
    { weekLabel: 'W4', dateRange: '08/22 - 08/28' },
    { weekLabel: 'W5', dateRange: '08/29 - 08/31' },
  ]

  return (
    <div
      data-page-key="overview"
      data-page-type="full-bleed"
      className="qt-page relative bg-white text-slate-800 flex flex-col justify-between overflow-hidden shadow-md mx-auto"
      style={{
        width: `${pageWidth}px`,
        height: `${pageHeight}px`,
        padding: '20px 58px 20px 24px',
        boxSizing: 'border-box',
        fontFamily: "'Noto Sans KR', 'Pretendard', sans-serif",
      }}
    >
      <QtQuickIndexNav currentMonth={monthNum} activeTab="overview" themeColor={themeColor} />
      {/* 1. Clean Header Title Bar */}
      <div className="flex items-center justify-between border-b border-slate-300 pb-2 mb-2">
        <div className="flex items-center space-x-3 text-[11px] font-medium tracking-wider text-slate-500 font-mono">
          <span className="px-2.5 py-0.5 rounded text-white font-bold tracking-widest" style={{ backgroundColor: themeColor }}>
            {year} · {monthName.toUpperCase()} · OVERVIEW
          </span>
          <span className="text-slate-400 font-semibold">
            {isGeneralMode ? 'Monthly Strategy & Goal Plan' : 'Monthly Devotional Overview'}
          </span>
        </div>

        <div className="flex items-center space-x-2 text-[10.5px] font-mono text-slate-400">
          <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 font-bold">
            Interactive Monthly Overview
          </span>
        </div>
      </div>

      {/* 2. Month Title Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-xl font-sans font-bold text-slate-900 tracking-wide flex items-center gap-2 whitespace-nowrap">
            <span>📊 {monthName} 5-Week Strategy Master Overview</span>
          </h1>
          <p className="text-[10.5px] text-slate-500 mt-0.5 whitespace-nowrap">
            한 달의 흐름을 한눈에 조망하며, 주차별 실행과 결실을 완벽하게 이뤄내는 통합 대시보드입니다.
          </p>
        </div>

        <div className="px-3 py-1 rounded-full text-xs font-bold text-slate-900 bg-slate-100 border border-slate-300 shadow-2xs whitespace-nowrap">
          5주차 종합 대시보드
        </div>
      </div>

      {/* 3. Main Content: Left 4 Pillar Control Center + Right 5 Weekly Columns */}
      <div className="grid grid-cols-12 gap-3 flex-1 mb-2">
        {/* Left Control Center (3 cols) */}
        <div className="col-span-3 flex flex-col justify-between space-y-2 pr-1 border-r border-slate-200">
          {/* Key Schedules & Milestones */}
          <div className="border border-slate-200 rounded-xl p-2 bg-slate-50/50 flex-1 flex flex-col justify-between">
            <h4 className="text-[9.5px] font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-0.5 font-sans flex items-center justify-between">
              <span>📅 핵심 일정 & 디데이</span>
              <span className="font-mono text-[7.5px] text-slate-400">Milestones</span>
            </h4>
            <div className="space-y-1 text-[8.5px] text-slate-500 font-sans pt-1 flex-1 flex flex-col justify-around">
              <div>• ______________________</div>
              <div>• ______________________</div>
              <div>• ______________________</div>
            </div>
          </div>

          {/* Top 5 Priorities */}
          <div className="border border-slate-200 rounded-xl p-2 bg-slate-50/50 flex-1 flex flex-col justify-between">
            <h4 className="text-[9.5px] font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-0.5 font-sans flex items-center justify-between">
              <span>✅ 이달의 5대 핵심 과제</span>
              <span className="font-mono text-[7.5px] text-slate-400">Top 5</span>
            </h4>
            <div className="space-y-0.5 text-[8px] text-slate-600 font-sans pt-1 flex-1 flex flex-col justify-around">
              {[1, 2, 3, 4, 5].map((num) => (
                <div key={num} className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded border border-slate-400 inline-block text-[7px] text-center leading-tight">{num}</span>
                  <span>________________</span>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Reflection & Achievements */}
          <div className="border border-indigo-100 rounded-xl p-2 bg-indigo-50/20 flex-1 flex flex-col justify-between">
            <h4 className="text-[9.5px] font-bold text-indigo-950 uppercase tracking-wider border-b border-indigo-200 pb-0.5 font-sans flex items-center justify-between">
              <span>🏆 성과 & 감사 피드백</span>
              <span className="font-mono text-[7.5px] text-indigo-600">Reflection</span>
            </h4>
            <div className="space-y-1 text-[8.5px] text-slate-600 font-sans pt-1 flex-1 flex flex-col justify-around">
              <div>💡 ______________________</div>
              <div>💖 ______________________</div>
            </div>
          </div>
        </div>

        {/* Right 5 Weekly Matrix Columns (9 cols) */}
        <div className="col-span-9 grid grid-cols-5 gap-2">
          {defaultWeeks.map((w, wIdx) => (
            <div
              key={w.weekLabel}
              className="border border-slate-300 rounded-xl p-2 bg-white flex flex-col justify-between shadow-2xs hover:border-slate-400 transition-colors"
            >
              {/* Column Header */}
              <div className="border-b border-slate-200 pb-1 mb-1">
                <div className="flex items-center justify-between">
                  <span
                    data-nav-target={`week-${wIdx + 1}`}
                    data-jump-btn="true"
                    className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9.5px] font-bold font-sans cursor-pointer hover:scale-110 transition-transform shadow-2xs"
                    style={{ backgroundColor: themeColor }}
                  >
                    {w.weekLabel}
                  </span>
                  <span className="text-[9px] font-mono font-bold text-slate-400">{w.dateRange}</span>
                </div>
              </div>

              {/* Weekly Focus */}
              <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-200 mb-1.5 text-[8px]">
                <span className="font-bold text-slate-700 block font-sans">📌 주차 핵심 비전:</span>
                <div className="text-slate-400 font-sans text-[8px] min-h-[10px]">__________________</div>
              </div>

              {/* 4 Weekly Checklists */}
              <div className="space-y-1 mb-1.5 flex-1 flex flex-col justify-around text-[8px]">
                <span className="font-bold text-slate-600 font-sans text-[7.5px] border-b border-slate-100 pb-0.5">☑️ 주차별 4대 과제:</span>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center">
                    <div className="w-2.5 h-2.5 border border-slate-400 rounded-xs bg-white mr-1 flex-shrink-0" />
                    <div className="flex-1 border-b border-slate-200 h-2.5 text-slate-400 font-sans">___________</div>
                  </div>
                ))}
              </div>

              {/* Weekly Grid Note */}
              <div className="h-16 border border-slate-200 rounded-lg p-1 bg-white">
                <PerfectGridNote step={12} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Footer */}
      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1.5 border-t border-slate-200 mt-1.5">
        <span>PREMIUM DIARY STUDIO — MONTHLY OVERVIEW MASTER</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
