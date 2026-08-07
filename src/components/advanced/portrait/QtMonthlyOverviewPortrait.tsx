'use client'

import React from 'react'
import PerfectGridNote from '../PerfectGridNote'

interface QtMonthlyOverviewPortraitProps {
  year?: number
  monthName?: string
  themeColor?: string
  weeksInfo?: { weekLabel: string; dateRange: string }[]
  pageWidth?: number
  pageHeight?: number
  isGeneralMode?: boolean
}

export default function QtMonthlyOverviewPortrait({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  weeksInfo,
  pageWidth = 1024,
  pageHeight = 1448,
  isGeneralMode = false,
}: QtMonthlyOverviewPortraitProps) {
  const defaultWeeks = weeksInfo || [
    { weekLabel: 'W1', dateRange: '08/01 - 08/07' },
    { weekLabel: 'W2', dateRange: '08/08 - 08/14' },
    { weekLabel: 'W3', dateRange: '08/15 - 08/21' },
    { weekLabel: 'W4', dateRange: '08/22 - 08/28' },
    { weekLabel: 'W5', dateRange: '08/29 - 08/31' },
  ]

  return (
    <div
      data-page-key="overview-portrait"
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
        <span className="px-3 py-1 rounded-full bg-slate-900 text-white font-bold text-xs shadow-xs">
          📊 MONTHLY OVERVIEW MASTER
        </span>
      </div>

      {/* 2. Month Title Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-xl font-serif font-bold text-slate-900 tracking-wide whitespace-nowrap">
            📊 {monthName} 5-Week Strategy Master Overview
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            한 달의 흐름을 한눈에 조망하며, 주차별 실행과 결실을 완벽하게 이뤄내는 통합 대시보드입니다.
          </p>
        </div>
        <div className="px-4 py-1.5 rounded-full text-xs font-bold text-slate-900 bg-slate-100 border border-slate-300 shadow-xs">
          5주차 종합 대시보드
        </div>
      </div>

      {/* 3. Top Control Center (3 Boxes) */}
      <div className="grid grid-cols-3 gap-3 mb-3 text-xs">
        {/* Milestones */}
        <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 space-y-1.5">
          <div className="font-bold text-slate-800 font-serif flex items-center justify-between border-b border-slate-200 pb-1">
            <span>📅 핵심 일정 & 디데이</span>
            <span className="font-mono text-[10px] text-slate-400">Milestones</span>
          </div>
          <div className="space-y-1 text-xs text-slate-600 font-serif">
            <div>• _______________________</div>
            <div>• _______________________</div>
          </div>
        </div>

        {/* Top Priorities */}
        <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 space-y-1.5">
          <div className="font-bold text-slate-800 font-serif flex items-center justify-between border-b border-slate-200 pb-1">
            <span>✅ 이달의 3대 핵심 과제</span>
            <span className="font-mono text-[10px] text-slate-400">Top 3</span>
          </div>
          <div className="space-y-1 text-xs text-slate-600 font-serif">
            <div>1. _______________________</div>
            <div>2. _______________________</div>
          </div>
        </div>

        {/* Reflection */}
        <div className="border border-indigo-100 rounded-xl p-3 bg-indigo-50/20 space-y-1.5">
          <div className="font-bold text-indigo-950 font-serif flex items-center justify-between border-b border-indigo-200 pb-1">
            <span>🏆 성과 & 감사 피드백</span>
            <span className="font-mono text-[10px] text-indigo-600">Feedback</span>
          </div>
          <div className="space-y-1 text-xs text-slate-600 font-serif">
            <div>💡 _______________________</div>
            <div>💖 _______________________</div>
          </div>
        </div>
      </div>

      {/* 4. 5-Week Grid Stack */}
      <div className="flex-1 flex flex-col justify-between mb-3 space-y-3">
        {defaultWeeks.map((w, wIdx) => (
          <div
            key={w.weekLabel}
            className="border border-slate-300 rounded-xl p-3 bg-white flex flex-col justify-between shadow-xs flex-1"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-1.5 text-xs">
              <div className="flex items-center gap-2">
                <span
                  data-nav-target={`week-${wIdx + 1}`}
                  data-jump-btn="true"
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold font-serif cursor-pointer hover:scale-110 transition-transform shadow-xs"
                  style={{ backgroundColor: themeColor }}
                >
                  {w.weekLabel}
                </span>
                <span className="font-bold text-slate-800 font-serif">주차 핵심 비전: ____________________________________</span>
              </div>
              <span className="font-mono text-xs font-bold text-slate-400">{w.dateRange}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs flex-1">
              <div className="space-y-1 text-xs text-slate-600 font-serif">
                <div className="font-bold text-slate-800 text-xs">☑️ 주차별 실행 과제:</div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 border border-slate-400 rounded-xs bg-white inline-block"></span>
                  <span>_________________________________</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 border border-slate-400 rounded-xs bg-white inline-block"></span>
                  <span>_________________________________</span>
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg p-1 bg-white">
                <PerfectGridNote step={14} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 5. Footer */}
      <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-300">
        <span>PREMIUM DIARY STUDIO — MONTHLY OVERVIEW MASTER</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
