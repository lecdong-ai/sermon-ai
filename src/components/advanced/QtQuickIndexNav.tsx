'use client'

import React from 'react'

interface QtQuickIndexNavProps {
  currentMonth?: number
  currentWeek?: number
  activeTab?: 'yearlygrid' | 'calendar' | 'overview' | 'weekly' | 'daily' | 'tracker'
  themeColor?: string
}

// 12개월 계절별 차분하고 정갈한 파스텔 톤온톤 팔레트 (Restrained Muted Palette)
const SEASONAL_MONTH_COLORS: Record<number, { bg: string; text: string; label: string }> = {
  1: { bg: '#8FA3C9', text: '#FFFFFF', label: '01' },  // 1월 쿨 파인
  2: { bg: '#9DB2D4', text: '#FFFFFF', label: '02' },  // 2월 스노우 블루
  3: { bg: '#E4A5B7', text: '#FFFFFF', label: '03' },  // 3월 체리블라썸
  4: { bg: '#E09FAD', text: '#FFFFFF', label: '04' },  // 4월 봄 로즈
  5: { bg: '#A3C9A8', text: '#FFFFFF', label: '05' },  // 5월 세이지 그린
  6: { bg: '#88C0A9', text: '#FFFFFF', label: '06' },  // 6월 민트 썸머
  7: { bg: '#7BB3C5', text: '#FFFFFF', label: '07' },  // 7월 아쿠아 해변
  8: { bg: '#85A8D0', text: '#FFFFFF', label: '08' },  // 8월 쿨 블루
  9: { bg: '#D4A373', text: '#FFFFFF', label: '09' },  // 9월 메이플 가을
  10: { bg: '#C08552', text: '#FFFFFF', label: '10' }, // 10월 앰버 오텀
  11: { bg: '#9E7777', text: '#FFFFFF', label: '11' }, // 11월 로즈우드
  12: { bg: '#6F8AB7', text: '#FFFFFF', label: '12' }, // 12월 윈터 인디고
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
      className="absolute right-0.5 top-3 bottom-3 w-10 flex flex-col justify-between items-end py-1 z-30 select-none font-mono"
      style={{ pointerEvents: 'auto' }}
    >
      {/* 1. Core Section Tabs (YEAR, CAL, OVR - Refined Leather Tabs) */}
      <div className="flex flex-col space-y-1.5 w-full items-end">
        <button
          type="button"
          data-nav-target="yearlygrid"
          className={`h-6 rounded-l-md text-[8px] font-black flex items-center justify-center transition-all cursor-pointer ${
            activeTab === 'yearlygrid'
              ? 'w-10.5 text-white font-black shadow-md border-l-2 border-amber-300 scale-105'
              : 'w-8 bg-slate-100/90 text-slate-500 hover:bg-slate-200 hover:text-slate-900 hover:w-9.5'
          }`}
          style={{ backgroundColor: activeTab === 'yearlygrid' ? themeColor : undefined }}
          title="연간 마스터 캘린더"
        >
          YEAR
        </button>

        <button
          type="button"
          data-nav-target="calendar"
          className={`h-6 rounded-l-md text-[8px] font-black flex items-center justify-center transition-all cursor-pointer ${
            activeTab === 'calendar'
              ? 'w-10.5 text-white font-black shadow-md border-l-2 border-amber-300 scale-105'
              : 'w-8 bg-slate-100/90 text-slate-500 hover:bg-slate-200 hover:text-slate-900 hover:w-9.5'
          }`}
          style={{ backgroundColor: activeTab === 'calendar' ? themeColor : undefined }}
          title="월간 달력"
        >
          CAL
        </button>

        <button
          type="button"
          data-nav-target="overview"
          className={`h-6 rounded-l-md text-[8px] font-black flex items-center justify-center transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'w-10.5 text-white font-black shadow-md border-l-2 border-amber-300 scale-105'
              : 'w-8 bg-slate-100/90 text-slate-500 hover:bg-slate-200 hover:text-slate-900 hover:w-9.5'
          }`}
          style={{ backgroundColor: activeTab === 'overview' ? themeColor : undefined }}
          title="월간 개요"
        >
          OVR
        </button>
      </div>

      {/* Divider */}
      <div className="w-5 h-px bg-slate-200 my-0.5 self-center opacity-60" />

      {/* 2. Seasonal 12-Month Palette Tabs (01 ~ 12 Muted Tabs) */}
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
              className={`h-4 rounded-l-md text-[8px] font-bold flex items-center justify-between px-1.5 transition-all relative cursor-pointer ${
                isCurrent
                  ? 'w-10.5 shadow-md scale-105 border-l-2 border-amber-300 z-10'
                  : 'w-7.5 hover:w-9.5 opacity-80 hover:opacity-100'
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
      <div className="w-5 h-px bg-slate-200 my-0.5 self-center opacity-60" />

      {/* 3. Week Direct Jumpers (W1 ~ W5 Minimal Pills) */}
      <div className="flex flex-col space-y-0.5 w-full items-end">
        {[1, 2, 3, 4, 5].map((wNo) => {
          const isCurrentW = activeTab === 'weekly' && currentWeek === wNo
          return (
            <button
              key={`w-${wNo}`}
              type="button"
              data-nav-target={`week-${wNo}`}
              data-week={wNo}
              className={`h-4 rounded-l-sm text-[7.5px] font-bold flex items-center justify-center transition-all cursor-pointer ${
                isCurrentW
                  ? 'w-9 bg-slate-800 text-white font-black border-l-2 border-amber-400 scale-105 shadow-xs'
                  : 'w-7 bg-slate-100/90 text-slate-400 hover:bg-slate-200 hover:text-slate-800 hover:w-8.5'
              }`}
              title={`${wNo}주차 주간 계획`}
            >
              W{wNo}
            </button>
          )
        })}
      </div>

      {/* Divider */}
      <div className="w-5 h-px bg-slate-200 my-0.5 self-center opacity-60" />

      {/* 4. Smart Tracker Icon Circles (Habit, Gratitude, Cash, KPT) */}
      <div className="flex flex-col space-y-1 w-full items-end">
        <button
          type="button"
          data-nav-target="habit"
          className="w-6 h-6 rounded-full bg-emerald-500/90 text-white font-bold text-[9px] flex items-center justify-center shadow-2xs hover:scale-115 transition-transform cursor-pointer"
          title="습관 트래커"
        >
          🌱
        </button>
        <button
          type="button"
          data-nav-target="gratitude"
          className="w-6 h-6 rounded-full bg-amber-500/90 text-white font-bold text-[9px] flex items-center justify-center shadow-2xs hover:scale-115 transition-transform cursor-pointer"
          title="감사 일기"
        >
          ☀️
        </button>
        <button
          type="button"
          data-nav-target="budget"
          className="w-6 h-6 rounded-full bg-teal-500/90 text-white font-bold text-[9px] flex items-center justify-center shadow-2xs hover:scale-115 transition-transform cursor-pointer"
          title="가계부"
        >
          💰
        </button>
        <button
          type="button"
          data-nav-target="kpt"
          className="w-6 h-6 rounded-full bg-indigo-500/90 text-white font-bold text-[9px] flex items-center justify-center shadow-2xs hover:scale-115 transition-transform cursor-pointer"
          title="KPT 회고"
        >
          🔄
        </button>
      </div>
    </div>
  )
}
