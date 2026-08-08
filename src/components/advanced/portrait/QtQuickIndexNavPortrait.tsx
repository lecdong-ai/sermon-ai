'use client'

import React from 'react'

interface QtQuickIndexNavPortraitProps {
  currentMonth?: number
  currentWeek?: number
  activeTab?: 'yearlygrid' | 'calendar' | 'overview' | 'weekly' | 'daily' | 'tracker'
  themeColor?: string
}

const SEASONAL_MONTH_COLORS: Record<number, { bg: string; text: string; label: string }> = {
  1: { bg: '#8FA3C9', text: '#FFFFFF', label: '01' },
  2: { bg: '#9DB2D4', text: '#FFFFFF', label: '02' },
  3: { bg: '#E4A5B7', text: '#FFFFFF', label: '03' },
  4: { bg: '#E09FAD', text: '#FFFFFF', label: '04' },
  5: { bg: '#A3C9A8', text: '#FFFFFF', label: '05' },
  6: { bg: '#88C0A9', text: '#FFFFFF', label: '06' },
  7: { bg: '#7BB3C5', text: '#FFFFFF', label: '07' },
  8: { bg: '#85A8D0', text: '#FFFFFF', label: '08' },
  9: { bg: '#D4A373', text: '#FFFFFF', label: '09' },
  10: { bg: '#C08552', text: '#FFFFFF', label: '10' },
  11: { bg: '#9E7777', text: '#FFFFFF', label: '11' },
  12: { bg: '#6F8AB7', text: '#FFFFFF', label: '12' },
}

export default function QtQuickIndexNavPortrait({
  currentMonth = 8,
  currentWeek = 1,
  activeTab = 'calendar',
  themeColor = '#B8C6D9',
}: QtQuickIndexNavPortraitProps) {
  const todayMonth = 8

  return (
    <div
      className="absolute top-2 right-4 flex flex-col items-end space-y-1 z-30 select-none font-mono"
      style={{ pointerEvents: 'auto' }}
    >
      {/* 1. Upper Row: Main Section Tabs + Sub-Tracker Quick Pills + Week Jumpers */}
      <div className="flex items-center space-x-1.5 bg-white/95 p-1 rounded-xl border border-slate-200/90 shadow-md backdrop-blur-xs">
        {/* Main Section Buttons */}
        <div className="flex items-center space-x-1">
          <button
            type="button"
            data-nav-target="yearlygrid"
            className={`px-2 py-0.5 rounded-md text-[8.5px] font-black transition-all border cursor-pointer ${
              activeTab === 'yearlygrid'
                ? 'text-white border-amber-300 shadow-xs scale-105'
                : 'bg-slate-100/80 text-slate-600 border-slate-200 hover:bg-slate-200'
            }`}
            style={{ backgroundColor: activeTab === 'yearlygrid' ? themeColor : undefined }}
            title="연간 12개월 마스터 달력"
          >
            YEAR
          </button>

          <button
            type="button"
            data-nav-target="calendar"
            className={`px-2 py-0.5 rounded-md text-[8.5px] font-black transition-all border cursor-pointer ${
              activeTab === 'calendar'
                ? 'text-white border-amber-300 shadow-xs scale-105'
                : 'bg-slate-100/80 text-slate-600 border-slate-200 hover:bg-slate-200'
            }`}
            style={{ backgroundColor: activeTab === 'calendar' ? themeColor : undefined }}
            title="월간 달력"
          >
            CAL
          </button>

          <button
            type="button"
            data-nav-target="overview"
            className={`px-2 py-0.5 rounded-md text-[8.5px] font-black transition-all border cursor-pointer ${
              activeTab === 'overview'
                ? 'text-white border-amber-300 shadow-xs scale-105'
                : 'bg-slate-100/80 text-slate-600 border-slate-200 hover:bg-slate-200'
            }`}
            style={{ backgroundColor: activeTab === 'overview' ? themeColor : undefined }}
            title="월간 핵심 개요"
          >
            OVR
          </button>
        </div>

        <div className="h-3.5 w-px bg-slate-300/80" />

        {/* Smart Tracker Pills */}
        <div className="flex items-center space-x-1">
          <button
            type="button"
            data-nav-target="habit"
            className="px-1.5 py-0.5 rounded bg-emerald-600 text-white font-black text-[7.5px] hover:scale-105 transition-all shadow-2xs border border-emerald-400 cursor-pointer"
            title="습관 트래커"
          >
            🌱 HABIT
          </button>
          <button
            type="button"
            data-nav-target="gratitude"
            className="px-1.5 py-0.5 rounded bg-amber-500 text-white font-black text-[7.5px] hover:scale-105 transition-all shadow-2xs border border-amber-300 cursor-pointer"
            title="감사 일기 저널"
          >
            ☀️ GRAT
          </button>
          <button
            type="button"
            data-nav-target="budget"
            className="px-1.5 py-0.5 rounded bg-teal-600 text-white font-black text-[7.5px] hover:scale-105 transition-all shadow-2xs border border-teal-400 cursor-pointer"
            title="지출 가계부"
          >
            💰 CASH
          </button>
          <button
            type="button"
            data-nav-target="kpt"
            className="px-1.5 py-0.5 rounded bg-indigo-600 text-white font-black text-[7.5px] hover:scale-105 transition-all shadow-2xs border border-indigo-400 cursor-pointer"
            title="KPT 회고"
          >
            🔄 KPT
          </button>
        </div>

        <div className="h-3.5 w-px bg-slate-300/80" />

        {/* 5-Week Jumpers */}
        <div className="flex items-center space-x-0.5">
          {[1, 2, 3, 4, 5].map((wNo) => {
            const isCurrentW = activeTab === 'weekly' && currentWeek === wNo
            return (
              <button
                key={`w-p-${wNo}`}
                type="button"
                data-nav-target={`week-${wNo}`}
                data-week={wNo}
                className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold transition-all border cursor-pointer ${
                  isCurrentW
                    ? 'bg-slate-900 text-white font-black border-amber-400 shadow-xs scale-105'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-200 hover:text-slate-900'
                }`}
                title={`${wNo}주차 주간 플랜 직행`}
              >
                W{wNo}
              </button>
            )
          })}
        </div>
      </div>

      {/* 2. Lower Row: Seasonal 12-Month Color-Coded Palette Ribbons + TODAY Pulse */}
      <div className="flex items-center space-x-0.5 bg-white/95 p-1 rounded-lg border border-slate-200/90 shadow-xs">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((mNum) => {
          const isSelectedM = currentMonth === mNum
          const isTodayM = todayMonth === mNum
          const palette = SEASONAL_MONTH_COLORS[mNum]

          return (
            <button
              key={`m-p-${mNum}`}
              type="button"
              data-nav-target={`month-${mNum}`}
              className={`w-5 py-0.5 rounded text-[8px] font-black text-center transition-all relative cursor-pointer ${
                isSelectedM
                  ? 'text-white font-black shadow-md scale-110 ring-2 ring-amber-400 ring-offset-1 z-10 border border-white'
                  : 'text-slate-700 hover:bg-indigo-100 hover:text-indigo-800 opacity-90 hover:opacity-100'
              }`}
              style={{
                backgroundColor: isSelectedM ? palette.bg : undefined,
              }}
              title={`${mNum}월 달력으로 이동`}
            >
              {palette.label}
              {isTodayM && (
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-amber-300 border border-white animate-pulse" title="TODAY" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
