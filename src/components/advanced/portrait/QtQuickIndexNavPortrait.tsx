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
      className="absolute top-2.5 right-4 flex flex-col items-end space-y-1 z-30 select-none font-mono"
      style={{ pointerEvents: 'auto' }}
    >
      {/* Upper Row: Main Section Tabs + Sub-Tracker Quick Circle Badges */}
      <div className="flex items-center space-x-1 bg-slate-100/95 p-1 rounded-xl border border-slate-200 shadow-md">
        <button
          type="button"
          data-nav-target="yearlygrid"
          className={`px-2 py-0.5 rounded text-[8.5px] font-black transition-all ${
            activeTab === 'yearlygrid'
              ? 'text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200'
          }`}
          style={{ backgroundColor: activeTab === 'yearlygrid' ? themeColor : undefined }}
        >
          YEAR
        </button>

        <button
          type="button"
          data-nav-target="calendar"
          className={`px-2 py-0.5 rounded text-[8.5px] font-black transition-all ${
            activeTab === 'calendar'
              ? 'text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200'
          }`}
          style={{ backgroundColor: activeTab === 'calendar' ? themeColor : undefined }}
        >
          CAL
        </button>

        <button
          type="button"
          data-nav-target="overview"
          className={`px-2 py-0.5 rounded text-[8.5px] font-black transition-all ${
            activeTab === 'overview'
              ? 'text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200'
          }`}
          style={{ backgroundColor: activeTab === 'overview' ? themeColor : undefined }}
        >
          OVR
        </button>

        <div className="h-3 w-px bg-slate-300 mx-0.5" />

        {/* Quick Tracker Badges */}
        <div className="flex items-center space-x-1 px-1">
          <button type="button" data-nav-target="habit" className="text-[9px] hover:scale-125 transition-transform" title="습관">🌱</button>
          <button type="button" data-nav-target="gratitude" className="text-[9px] hover:scale-125 transition-transform" title="감사">☀️</button>
          <button type="button" data-nav-target="budget" className="text-[9px] hover:scale-125 transition-transform" title="가계부">💰</button>
          <button type="button" data-nav-target="kpt" className="text-[9px] hover:scale-125 transition-transform" title="KPT">🔄</button>
        </div>

        <div className="h-3 w-px bg-slate-300 mx-0.5" />

        {/* Weeks */}
        <div className="flex items-center space-x-0.5">
          {[1, 2, 3, 4, 5].map((wNo) => {
            const isCurrentW = activeTab === 'weekly' && currentWeek === wNo
            return (
              <button
                key={`w-p-${wNo}`}
                type="button"
                data-nav-target={`week-${wNo}`}
                data-week={wNo}
                className={`px-1.5 py-0.5 rounded text-[8px] font-bold transition-all ${
                  isCurrentW
                    ? 'bg-slate-900 text-white font-black shadow-xs'
                    : 'text-slate-400 hover:bg-slate-200 hover:text-slate-700'
                }`}
              >
                W{wNo}
              </button>
            )
          })}
        </div>
      </div>

      {/* Lower Row: Seasonal 12-Month Color-Coded Ribbons + TODAY Pulse */}
      <div className="flex items-center space-x-0.5 bg-slate-100/95 p-0.5 rounded-lg border border-slate-200 shadow-sm">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((mNum) => {
          const isSelectedM = currentMonth === mNum
          const isTodayM = todayMonth === mNum
          const palette = SEASONAL_MONTH_COLORS[mNum]

          return (
            <button
              key={`m-p-${mNum}`}
              type="button"
              data-nav-target={`month-${mNum}`}
              className={`w-4.5 py-0.5 rounded text-[7.5px] font-bold text-center transition-all relative ${
                isSelectedM
                  ? 'text-white font-black shadow-xs scale-110 ring-1 ring-white/60'
                  : 'text-slate-600 hover:bg-indigo-100 hover:text-indigo-700'
              }`}
              style={{
                backgroundColor: isSelectedM ? palette.bg : undefined,
              }}
            >
              {palette.label}
              {isTodayM && (
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-amber-400 border border-white animate-pulse" title="TODAY" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
