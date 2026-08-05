'use client'

import React from 'react'
import PerfectGridNote from './PerfectGridNote'

interface QtMonthlyOverviewPageProps {
  year?: number
  monthName?: string
  themeColor?: string
  weeksInfo?: { weekLabel: string; dateRange: string }[]
  pageWidth?: number
  pageHeight?: number
}

export default function QtMonthlyOverviewPage({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  weeksInfo,
  pageWidth = 1024,
  pageHeight = 768,
}: QtMonthlyOverviewPageProps) {
  const defaultWeeks = weeksInfo || [
    { weekLabel: 'W1', dateRange: '08/01 - 08/02' },
    { weekLabel: 'W2', dateRange: '08/03 - 08/09' },
    { weekLabel: 'W3', dateRange: '08/10 - 08/16' },
    { weekLabel: 'W4', dateRange: '08/17 - 08/23' },
    { weekLabel: 'W5', dateRange: '08/24 - 08/31' },
  ]

  return (
    <div
      data-page-key="overview"
      data-page-type="full-bleed"
      className="qt-page relative bg-white text-slate-800 flex flex-col justify-between overflow-hidden shadow-[0_12px_36px_rgba(0,0,0,0.5)] rounded-none mb-12 mx-auto"
      style={{
        width: `${pageWidth}px`,
        height: `${pageHeight}px`,
        padding: '24px 32px',
        boxSizing: 'border-box',
        fontFamily: "'Noto Sans KR', 'Pretendard', sans-serif",
      }}
    >
      {/* 1. Header Navigation Bar */}
      <div className="flex items-center justify-between border-b border-slate-400 pb-2 mb-3">
        <div className="flex items-center space-x-3 text-[11px] font-medium tracking-wider text-slate-400">
          <span data-nav-target="calendar" className="cursor-pointer hover:text-slate-600">YEARLY</span>
          <span>{year}</span>
          <span data-nav-target="calendar" className="px-1.5 py-0.5 rounded text-white font-bold cursor-pointer" style={{ backgroundColor: themeColor }}>
            {monthName.toUpperCase().slice(0, 3)}
          </span>
        </div>

        <div className="flex items-center space-x-3 text-[11px] font-medium text-slate-400">
          <span data-nav-target="calendar" className="hover:text-slate-600 cursor-pointer">MONTHLY</span>
          <span data-nav-target="overview" className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-bold cursor-pointer">OVERVIEW</span>
          {defaultWeeks.map((w, idx) => (
            <span key={w.weekLabel} data-nav-target={`week-${idx + 1}`} className="hover:text-slate-600 cursor-pointer px-1 py-0.5">
              {w.weekLabel}
            </span>
          ))}
        </div>
      </div>

      {/* 2. Month Title Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-800 tracking-wide">{monthName} Overview</h1>
          <div className="h-1.5 w-36 rounded-full mt-1" style={{ backgroundColor: themeColor, opacity: 0.7 }} />
        </div>
        <div className="text-right text-xs text-slate-400">
          <span className="font-semibold text-slate-600">{year}년 {monthName}</span> 월간 개요 및 주별 요약
        </div>
      </div>

      {/* 3. Main Content: Left 4 Summary Cards + Right 5 Weekly Columns */}
      <div className="grid grid-cols-12 gap-3 flex-1">
        {/* Left Side 4 Cards (3 cols) */}
        <div className="col-span-3 flex flex-col space-y-2 border-r border-slate-300 pr-2">
          {/* DATE / SCHEDULE */}
          <div className="border border-slate-400 rounded-lg p-2 bg-slate-50/40 flex-1 flex flex-col">
            <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: themeColor }} />
              DATE / SCHEDULE
            </h4>
          </div>

          {/* TO DO LIST */}
          <div className="border border-slate-400 rounded-lg p-2 bg-slate-50/40 flex-1 flex flex-col">
            <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: themeColor }} />
              TO DO LIST
            </h4>
          </div>

          {/* MEMO */}
          <div className="border border-slate-400 rounded-lg p-2 bg-slate-50/40 flex-1 flex flex-col">
            <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: themeColor }} />
              MEMO
            </h4>
          </div>

          {/* SUMMARY */}
          <div className="border border-slate-400 rounded-lg p-2 bg-slate-50/40 flex-1 flex flex-col">
            <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: themeColor }} />
              SUMMARY
            </h4>
          </div>
        </div>

        {/* Right Side 5 Weekly Columns (9 cols) */}
        <div className="col-span-9 grid grid-cols-5 gap-2">
          {defaultWeeks.map((w, wIdx) => (
            <div
              key={w.weekLabel}
              className="border border-slate-400 rounded-lg p-2 bg-white flex flex-col justify-between shadow-2xs"
            >
              {/* Column Header */}
              <div className="border-b border-slate-300 pb-1.5 mb-1.5">
                <div className="flex items-center justify-between">
                  <span
                    data-nav-target={`week-${wIdx + 1}`}
                    data-jump-btn="true"
                    className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold font-serif cursor-pointer hover:scale-110 transition-transform"
                    style={{ backgroundColor: themeColor }}
                  >
                    {w.weekLabel}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">{w.dateRange}</span>
                </div>
              </div>

              {/* Weekly Schedule Area */}
              <div className="h-20 border-b border-dashed border-slate-300 mb-2 p-1">
              </div>

              {/* Weekly To Do List Area */}
              <div className="space-y-1.5 mb-2 flex-1">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex items-center">
                    <div className="w-3 h-3 border border-slate-400 rounded-xs bg-slate-50/50 mr-1.5" />
                    <div className="flex-1 border-b border-slate-300 h-2.5" />
                  </div>
                ))}
              </div>

              {/* Weekly Grid Note Area */}
              <div className="h-24">
                <PerfectGridNote step={12} />
              </div>

              {/* Weekly Summary Area */}
              <div className="mt-2 pt-1 border-t border-slate-300">
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
