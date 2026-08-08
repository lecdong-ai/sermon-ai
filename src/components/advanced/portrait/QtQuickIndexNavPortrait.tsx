'use client'

import React from 'react'

interface QtQuickIndexNavPortraitProps {
  currentMonth?: number
  currentWeek?: number
  activeTab?: 'yearlygrid' | 'calendar' | 'overview' | 'weekly' | 'daily' | 'tracker'
  themeColor?: string
}

const MONTH_SHORT_LABELS = [
  '01', '02', '03', '04', '05', '06',
  '07', '08', '09', '10', '11', '12'
]

export default function QtQuickIndexNavPortrait({
  currentMonth = 8,
  currentWeek = 1,
  activeTab = 'calendar',
  themeColor = '#B8C6D9',
}: QtQuickIndexNavPortraitProps) {
  return (
    <div
      className="absolute top-2.5 left-5 right-5 flex flex-col space-y-1 z-30 select-none font-mono"
      style={{ pointerEvents: 'auto' }}
    >
      {/* 1단 Tier: Global Sections + Weeks */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-1">
        <div className="flex items-center space-x-1">
          <button
            type="button"
            data-nav-target="yearlygrid"
            className={`px-2 py-0.5 rounded text-[9px] font-extrabold transition-all ${
              activeTab === 'yearlygrid'
                ? 'text-white shadow-xs'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
            style={{ backgroundColor: activeTab === 'yearlygrid' ? themeColor : undefined }}
          >
            YEAR
          </button>

          <button
            type="button"
            data-nav-target="calendar"
            className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all ${
              activeTab === 'calendar'
                ? 'text-white shadow-xs'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
            style={{ backgroundColor: activeTab === 'calendar' ? themeColor : undefined }}
          >
            CALENDAR
          </button>

          <button
            type="button"
            data-nav-target="overview"
            className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all ${
              activeTab === 'overview'
                ? 'text-white shadow-xs'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
            style={{ backgroundColor: activeTab === 'overview' ? themeColor : undefined }}
          >
            OVERVIEW
          </button>
        </div>

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
                    ? 'bg-slate-800 text-white shadow-xs font-black'
                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-700'
                }`}
              >
                W{wNo}
              </button>
            )
          })}
        </div>
      </div>

      {/* 2단 Tier: 12-Month Fast Jump Pill Ribbons */}
      <div className="flex items-center justify-between space-x-1">
        {MONTH_SHORT_LABELS.map((mStr, idx) => {
          const mNum = idx + 1
          const isSelectedM = currentMonth === mNum
          return (
            <button
              key={`m-p-${mNum}`}
              type="button"
              data-nav-target={`month-${mNum}`}
              className={`flex-1 py-0.5 rounded text-[8px] font-bold text-center transition-all ${
                isSelectedM
                  ? 'text-white font-extrabold shadow-xs scale-105 ring-1 ring-white/50'
                  : 'bg-slate-100/70 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600'
              }`}
              style={{ backgroundColor: isSelectedM ? themeColor : undefined }}
            >
              {mStr}
            </button>
          )
        })}
      </div>
    </div>
  )
}
