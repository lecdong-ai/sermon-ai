'use client'

import React from 'react'

interface QtQuickIndexNavProps {
  currentMonth?: number
  currentWeek?: number
  activeTab?: 'yearlygrid' | 'calendar' | 'overview' | 'weekly' | 'daily' | 'tracker'
  themeColor?: string
}

// 12개월 계절별 정통 파스텔 톤온톤 팔레트
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

export default function QtQuickIndexNav({
  currentMonth = 8,
  currentWeek = 1,
  activeTab = 'calendar',
  themeColor = '#B8C6D9',
}: QtQuickIndexNavProps) {
  const todayMonth = 8

  return (
    <div
      className="absolute right-0 top-3 bottom-3 w-10 flex flex-col justify-between items-end py-1 z-30 select-none font-mono"
      style={{ pointerEvents: 'auto' }}
    >
      {/* 1. Core Section Tabs (YEAR, CAL, OVR - Zero Overlap with main page) */}
      <div className="flex flex-col space-y-1.5 w-full items-end">
        {/* YEAR Tab */}
        <button
          type="button"
          data-nav-target="yearlygrid"
          className={`h-6 rounded-l-md text-[8.5px] font-black flex items-center justify-center transition-all cursor-pointer ${
            activeTab === 'yearlygrid'
              ? 'w-10 text-white shadow-md border-r-3 border-amber-300 ring-1 ring-amber-300/40 z-10'
              : 'w-7.5 bg-slate-100/90 text-slate-400 hover:bg-slate-200 hover:text-slate-800 hover:w-9'
          }`}
          style={{ backgroundColor: activeTab === 'yearlygrid' ? themeColor : undefined }}
          title="연간 마스터 캘린더"
        >
          YEAR
        </button>

        {/* CAL Tab */}
        <button
          type="button"
          data-nav-target="calendar"
          className={`h-6 rounded-l-md text-[8.5px] font-black flex items-center justify-center transition-all cursor-pointer ${
            activeTab === 'calendar'
              ? 'w-10 text-white shadow-md border-r-3 border-amber-300 ring-1 ring-amber-300/40 z-10'
              : 'w-7.5 bg-slate-100/90 text-slate-400 hover:bg-slate-200 hover:text-slate-800 hover:w-9'
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
          className={`h-6 rounded-l-md text-[8.5px] font-black flex items-center justify-center transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'w-10 text-white shadow-md border-r-3 border-amber-300 ring-1 ring-amber-300/40 z-10'
              : 'w-7.5 bg-slate-100/90 text-slate-400 hover:bg-slate-200 hover:text-slate-800 hover:w-9'
          }`}
          style={{ backgroundColor: activeTab === 'overview' ? themeColor : undefined }}
          title="월간 개요"
        >
          OVR
        </button>
      </div>

      {/* Divider */}
      <div className="w-4 h-px bg-slate-200 my-0.5 self-center opacity-60" />

      {/* 2. Seasonal 12-Month Palette Tabs (01 ~ 12) */}
      <div className="flex flex-col space-y-0.5 w-full items-end my-auto">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((mNum) => {
          const isCurrent = currentMonth === mNum
          const isToday = todayMonth === mNum
          const colInfo = SEASONAL_MONTH_COLORS[mNum]

          return (
            <button
              key={`m-${mNum}`}
              type="button"
              data-nav-target={`month-${mNum}`}
              data-month={mNum}
              className={`h-4 rounded-l-sm text-[8px] font-extrabold flex items-center justify-between px-1.5 transition-all relative cursor-pointer ${
                isCurrent
                  ? 'w-10 shadow-md border-r-3 border-amber-300 ring-1 ring-amber-300/30 z-10'
                  : 'w-7.5 opacity-65 hover:opacity-100 hover:w-9'
              }`}
              style={{
                backgroundColor: colInfo.bg,
                color: colInfo.text,
              }}
              title={`${mNum}월 플래너로 이동`}
            >
              <span>{colInfo.label}</span>
              {isToday && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-300 border border-white animate-pulse" title="TODAY" />
              )}
            </button>
          )
        })}
      </div>

      {/* Divider */}
      <div className="w-4 h-px bg-slate-200 my-0.5 self-center opacity-60" />

      {/* 3. Week Direct Jumpers (W1 ~ W5) */}
      <div className="flex flex-col space-y-0.5 w-full items-end">
        {[1, 2, 3, 4, 5].map((wNo) => {
          const isCurrentW = activeTab === 'weekly' && currentWeek === wNo
          return (
            <button
              key={`w-${wNo}`}
              type="button"
              data-nav-target={`week-${wNo}`}
              data-week={wNo}
              className={`h-4 rounded-l-xs text-[7.5px] font-bold flex items-center justify-center transition-all cursor-pointer ${
                isCurrentW
                  ? 'w-9.5 bg-slate-900 text-white font-black border-r-3 border-amber-400 shadow-sm z-10'
                  : 'w-7 bg-slate-100/90 text-slate-400 opacity-65 hover:opacity-100 hover:bg-slate-200 hover:text-slate-800 hover:w-8.5'
              }`}
              title={`${wNo}주차 주간 계획`}
            >
              W{wNo}
            </button>
          )
        })}
      </div>

      {/* Divider */}
      <div className="w-4 h-px bg-slate-200 my-0.5 self-center opacity-60" />

      {/* 4. Refined Tracker Korean Labels: 🌱 습관 | ☀️ 감사 | 💰 가계 | 🔄 KPT */}
      <div className="flex flex-col space-y-1 w-full items-end pr-0.5 font-sans">
        <button
          type="button"
          data-nav-target="habit"
          className="h-4.5 px-1.5 rounded-l-md bg-emerald-700 text-white border-r-2 border-emerald-300 text-[7.5px] font-bold tracking-tight shadow-2xs hover:w-9.5 transition-all cursor-pointer flex items-center space-x-1"
          title="습관 트래커"
        >
          <span>🌱</span>
          <span>습관</span>
        </button>
        <button
          type="button"
          data-nav-target="gratitude"
          className="h-4.5 px-1.5 rounded-l-md bg-amber-600 text-white border-r-2 border-amber-300 text-[7.5px] font-bold tracking-tight shadow-2xs hover:w-9.5 transition-all cursor-pointer flex items-center space-x-1"
          title="감사 일기"
        >
          <span>☀️</span>
          <span>감사</span>
        </button>
        <button
          type="button"
          data-nav-target="budget"
          className="h-4.5 px-1.5 rounded-l-md bg-teal-700 text-white border-r-2 border-teal-300 text-[7.5px] font-bold tracking-tight shadow-2xs hover:w-9.5 transition-all cursor-pointer flex items-center space-x-1"
          title="지출 가계부"
        >
          <span>💰</span>
          <span>가계</span>
        </button>
        <button
          type="button"
          data-nav-target="kpt"
          className="h-4.5 px-1.5 rounded-l-md bg-indigo-700 text-white border-r-2 border-indigo-300 text-[7.5px] font-bold tracking-tight shadow-2xs hover:w-9.5 transition-all cursor-pointer flex items-center space-x-1"
          title="KPT 회고"
        >
          <span>🔄</span>
          <span>KPT</span>
        </button>
      </div>
    </div>
  )
}
