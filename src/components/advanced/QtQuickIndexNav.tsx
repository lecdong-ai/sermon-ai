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
      className="absolute right-1.5 top-5 bottom-5 w-8 flex flex-col justify-between items-center py-1 z-30 select-none font-mono"
      style={{ pointerEvents: 'auto' }}
    >
      {/* Upper Main Nav Group */}
      <div className="flex flex-col space-y-1 w-full items-center">
        <button
          type="button"
          data-nav-target="yearlygrid"
          className={`w-7 h-6 rounded-r-md text-[8.5px] font-extrabold flex items-center justify-center transition-all shadow-2xs ${
            activeTab === 'yearlygrid'
              ? 'text-white shadow-xs scale-105'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
          style={{ backgroundColor: activeTab === 'yearlygrid' ? themeColor : undefined }}
          title="연간 12개월 달력"
        >
          YR
        </button>

        <button
          type="button"
          data-nav-target="calendar"
          className={`w-7 h-5.5 rounded-r-md text-[8.5px] font-bold flex items-center justify-center transition-all shadow-2xs ${
            activeTab === 'calendar'
              ? 'text-white shadow-xs scale-105'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
          style={{ backgroundColor: activeTab === 'calendar' ? themeColor : undefined }}
          title="월간 달력"
        >
          CAL
        </button>

        <button
          type="button"
          data-nav-target="overview"
          className={`w-7 h-5.5 rounded-r-md text-[8.5px] font-bold flex items-center justify-center transition-all shadow-2xs ${
            activeTab === 'overview'
              ? 'text-white shadow-xs scale-105'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
          style={{ backgroundColor: activeTab === 'overview' ? themeColor : undefined }}
          title="월간 개요"
        >
          OVR
        </button>
      </div>

      {/* Middle Week Nav Group */}
      <div className="flex flex-col space-y-0.5 w-full items-center my-1 border-y border-slate-200/60 py-1">
        {[1, 2, 3, 4, 5].map((wNo) => {
          const isCurrentW = activeTab === 'weekly' && currentWeek === wNo
          return (
            <button
              key={`w-${wNo}`}
              type="button"
              data-nav-target={`week-${wNo}`}
              data-week={wNo}
              className={`w-6.5 h-4.5 rounded-r-sm text-[7.5px] font-bold flex items-center justify-center transition-all ${
                isCurrentW
                  ? 'bg-slate-800 text-white shadow-xs font-black'
                  : 'bg-slate-100/90 text-slate-400 hover:bg-slate-200 hover:text-slate-700'
              }`}
              title={`${wNo}주차 계획`}
            >
              W{wNo}
            </button>
          )
        })}
      </div>

      {/* Lower Month Jump Ribbons (01 ~ 12) */}
      <div className="flex flex-col space-y-0.5 w-full items-center">
        {MONTH_SHORT_LABELS.map((mStr, idx) => {
          const mNum = idx + 1
          const isSelectedM = currentMonth === mNum
          return (
            <button
              key={`m-${mNum}`}
              type="button"
              data-nav-target={`month-${mNum}`}
              className={`w-7 h-4.5 rounded-r-md text-[8px] font-bold flex items-center justify-center transition-all shadow-2xs ${
                isSelectedM
                  ? 'text-white font-extrabold shadow-xs scale-105 ring-1 ring-white/50'
                  : 'bg-slate-100/80 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600'
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
