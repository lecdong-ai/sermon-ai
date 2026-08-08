'use client'

import React from 'react'

interface QtQuickIndexNavProps {
  currentMonth?: number
  currentWeek?: number
  activeTab?: 'yearlygrid' | 'calendar' | 'overview' | 'weekly' | 'daily' | 'tracker'
  themeColor?: string
}

const MONTH_SHORT_LABELS = [
  '01', '02', '03', '04', '05', '06',
  '07', '08', '09', '10', '11', '12'
]

export default function QtQuickIndexNav({
  currentMonth = 8,
  currentWeek = 1,
  activeTab = 'calendar',
  themeColor = '#B8C6D9',
}: QtQuickIndexNavProps) {
  return (
    <div
      className="absolute right-2 top-4 bottom-4 w-11 flex flex-col justify-between items-end py-1 z-30 select-none font-mono"
      style={{ pointerEvents: 'auto' }}
    >
      {/* Upper Main Section Tabs (YR, CAL, OVR - Shifted slightly left for easy tapping) */}
      <div className="flex flex-col space-y-1.5 w-full items-end">
        {/* YEAR Tab */}
        <button
          type="button"
          data-nav-target="yearlygrid"
          className={`h-6.5 rounded-l-lg text-[8.5px] font-black flex items-center justify-center transition-all shadow-md cursor-pointer ${
            activeTab === 'yearlygrid'
              ? 'w-11 text-white font-black shadow-lg border-l-2 border-white ring-1 ring-white/60'
              : 'w-9 bg-slate-100 text-slate-600 hover:bg-slate-200 hover:w-10 hover:text-slate-900'
          }`}
          style={{ backgroundColor: activeTab === 'yearlygrid' ? themeColor : undefined }}
          title="연간 12개월 캘린더"
        >
          YEAR
        </button>

        {/* CAL Tab */}
        <button
          type="button"
          data-nav-target="calendar"
          className={`h-6 rounded-l-lg text-[9px] font-black flex items-center justify-center transition-all shadow-md cursor-pointer ${
            activeTab === 'calendar'
              ? 'w-10 text-white font-black shadow-lg border-l-2 border-white ring-1 ring-white/60'
              : 'w-8.5 bg-slate-100 text-slate-600 hover:bg-slate-200 hover:w-9.5 hover:text-slate-900'
          }`}
          style={{ backgroundColor: activeTab === 'calendar' ? themeColor : undefined }}
          title="월간 달력"
        >
          CAL
        </button>

        {/* OVR Tab */}
        <button
          type="button"
          data-nav-target="overview"
          className={`h-6 rounded-l-lg text-[9px] font-black flex items-center justify-center transition-all shadow-md cursor-pointer ${
            activeTab === 'overview'
              ? 'w-10 text-white font-black shadow-lg border-l-2 border-white ring-1 ring-white/60'
              : 'w-8.5 bg-slate-100 text-slate-600 hover:bg-slate-200 hover:w-9.5 hover:text-slate-900'
          }`}
          style={{ backgroundColor: activeTab === 'overview' ? themeColor : undefined }}
          title="월간 개요"
        >
          OVR
        </button>
      </div>

      {/* Middle Week Tabs (W1 ~ W5) */}
      <div className="flex flex-col space-y-1 w-full items-end my-1 border-y border-slate-200/80 py-1.5">
        {[1, 2, 3, 4, 5].map((wNo) => {
          const isCurrentW = activeTab === 'weekly' && currentWeek === wNo
          return (
            <button
              key={`w-${wNo}`}
              type="button"
              data-nav-target={`week-${wNo}`}
              data-week={wNo}
              className={`h-4.5 rounded-l-sm text-[8px] font-bold flex items-center justify-center transition-all shadow-2xs cursor-pointer ${
                isCurrentW
                  ? 'w-9.5 bg-slate-900 text-white font-black shadow-md border-l-2 border-amber-400'
                  : 'w-8 bg-slate-100/90 text-slate-500 hover:bg-slate-200 hover:text-slate-800 hover:w-9'
              }`}
              title={`${wNo}주차 계획`}
            >
              W{wNo}
            </button>
          )
        })}
      </div>

      {/* Lower Month Ribbons (01 ~ 12) - Active Month Highlight */}
      <div className="flex flex-col space-y-0.5 w-full items-end">
        {MONTH_SHORT_LABELS.map((mStr, idx) => {
          const mNum = idx + 1
          const isSelectedM = currentMonth === mNum
          return (
            <button
              key={`m-${mNum}`}
              type="button"
              data-nav-target={`month-${mNum}`}
              className={`h-4.5 rounded-l-md text-[8px] font-bold flex items-center justify-center transition-all shadow-2xs cursor-pointer ${
                isSelectedM
                  ? 'w-10 text-white font-black shadow-md ring-1 ring-white/60 border-l-2 border-white'
                  : 'w-8 bg-slate-100/80 text-slate-500 hover:bg-indigo-100 hover:text-indigo-700 hover:w-9.5'
              }`}
              style={{ backgroundColor: isSelectedM ? themeColor : undefined }}
              title={`${mNum}월 달력으로 이동`}
            >
              {mStr}
            </button>
          )
        })}
      </div>
    </div>
  )
}
