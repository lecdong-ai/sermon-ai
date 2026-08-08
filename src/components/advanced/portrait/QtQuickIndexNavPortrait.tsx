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
      {/* Upper Ribbon: Main Section Buttons + Clean English Tracker Tags + Week Jumpers */}
      <div className="flex items-center space-x-1.5 bg-white/95 px-2 py-1 rounded-xl border border-slate-200/90 shadow-sm backdrop-blur-xs">
        {/* Main Section Buttons */}
        <div className="flex items-center space-x-1">
          <button
            type="button"
            data-nav-target="yearlygrid"
            className={`px-2 py-0.5 rounded text-[8.5px] font-black transition-all cursor-pointer ${
              activeTab === 'yearlygrid'
                ? 'text-white shadow-xs border-b-2 border-amber-300 font-black'
                : 'text-slate-400 hover:bg-slate-100 hover:text-slate-800'
            }`}
            style={{ backgroundColor: activeTab === 'yearlygrid' ? themeColor : undefined }}
            title="연간 캘린더"
          >
            YEAR
          </button>

          <button
            type="button"
            data-nav-target="calendar"
            className={`px-2 py-0.5 rounded text-[8.5px] font-black transition-all cursor-pointer ${
              activeTab === 'calendar'
                ? 'text-white shadow-xs border-b-2 border-amber-300 font-black'
                : 'text-slate-400 hover:bg-slate-100 hover:text-slate-800'
            }`}
            style={{ backgroundColor: activeTab === 'calendar' ? themeColor : undefined }}
            title="월간 달력"
          >
            CAL
          </button>

          <button
            type="button"
            data-nav-target="overview"
            className={`px-2 py-0.5 rounded text-[8.5px] font-black transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'text-white shadow-xs border-b-2 border-amber-300 font-black'
                : 'text-slate-400 hover:bg-slate-100 hover:text-slate-800'
            }`}
            style={{ backgroundColor: activeTab === 'overview' ? themeColor : undefined }}
            title="월간 개요"
          >
            OVR
          </button>
        </div>

        <div className="h-3.5 w-px bg-slate-200" />

        {/* Clean English Tracker Tags: HABIT | THANKS | BUDGET | KPT */}
        <div className="flex items-center space-x-1">
          <button
            type="button"
            data-nav-target="habit"
            className="px-1.5 py-0.5 rounded bg-slate-800 text-emerald-300 font-black text-[7px] tracking-wider hover:text-white transition-colors cursor-pointer"
            title="Habit Tracker"
          >
            HABIT
          </button>
          <button
            type="button"
            data-nav-target="gratitude"
            className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-black text-[7px] tracking-wider hover:text-white transition-colors cursor-pointer"
            title="Gratitude Journal"
          >
            THANKS
          </button>
          <button
            type="button"
            data-nav-target="budget"
            className="px-1.5 py-0.5 rounded bg-slate-800 text-teal-300 font-black text-[7px] tracking-wider hover:text-white transition-colors cursor-pointer"
            title="Budget Tracker"
          >
            BUDGET
          </button>
          <button
            type="button"
            data-nav-target="kpt"
            className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 font-black text-[7px] tracking-wider hover:text-white transition-colors cursor-pointer"
            title="KPT Review"
          >
            KPT
          </button>
        </div>

        <div className="h-3.5 w-px bg-slate-200" />

        {/* Week Direct Jumpers */}
        <div className="flex items-center space-x-0.5">
          {[1, 2, 3, 4, 5].map((wNo) => {
            const isCurrentW = activeTab === 'weekly' && currentWeek === wNo
            return (
              <button
                key={`w-p-${wNo}`}
                type="button"
                data-nav-target={`week-${wNo}`}
                data-week={wNo}
                className={`px-1.5 py-0.5 rounded text-[7.5px] font-extrabold transition-all cursor-pointer ${
                  isCurrentW
                    ? 'bg-slate-900 text-white font-black shadow-xs border-b-2 border-amber-400'
                    : 'text-slate-400 hover:bg-slate-100 hover:text-slate-800'
                }`}
              >
                W{wNo}
              </button>
            )
          })}
        </div>
      </div>

      {/* Lower Ribbon: Muted 12-Month Palette */}
      <div className="flex items-center space-x-0.5 bg-white/95 p-0.5 rounded-lg border border-slate-200/90 shadow-2xs">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((mNum) => {
          const isSelectedM = currentMonth === mNum
          const isTodayM = todayMonth === mNum
          const palette = SEASONAL_MONTH_COLORS[mNum]

          return (
            <button
              key={`m-p-${mNum}`}
              type="button"
              data-nav-target={`month-${mNum}`}
              className={`py-0.5 text-center transition-all relative cursor-pointer ${
                isSelectedM
                  ? 'w-5 text-[8px] text-white font-black shadow-xs border-b-2 border-amber-300 rounded'
                  : 'w-4 text-[7px] text-slate-500 opacity-60 hover:opacity-100 hover:w-4.5'
              }`}
              style={{
                backgroundColor: isSelectedM ? palette.bg : undefined,
              }}
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
