'use client'

import React from 'react'

interface QtQuickIndexNavProps {
  currentMonth?: number
  currentWeek?: number
  activeTab?: 'yearlygrid' | 'calendar' | 'overview' | 'weekly' | 'daily' | 'tracker'
  themeColor?: string
}

// 12개월 계절별 정통 수채화 파스텔 컬러 팔레트
const SEASONAL_MONTH_COLORS: Record<number, { bg: string; text: string; label: string }> = {
  1: { bg: '#8FA3C9', text: '#FFFFFF', label: '01' },  // 1월 쿨 파인
  2: { bg: '#9DB2D4', text: '#FFFFFF', label: '02' },  // 2월 스노우 블루
  3: { bg: '#E4A5B7', text: '#FFFFFF', label: '03' },  // 3월 봄 체리블라썸
  4: { bg: '#E09FAD', text: '#FFFFFF', label: '04' },  // 4월 봄 로즈 핑크
  5: { bg: '#A3C9A8', text: '#FFFFFF', label: '05' },  // 5월 세이지 그린
  6: { bg: '#88C0A9', text: '#FFFFFF', label: '06' },  // 6월 민트 썸머
  7: { bg: '#7BB3C5', text: '#FFFFFF', label: '07' },  // 7월 아쿠아 해변
  8: { bg: '#85A8D0', text: '#FFFFFF', label: '08' },  // 8월 쿨 블루
  9: { bg: '#D4A373', text: '#FFFFFF', label: '09' },  // 9월 메이플 가을
  10: { bg: '#C08552', text: '#FFFFFF', label: '10' }, // 10월 앰버 오텀
  11: { bg: '#9E7777', text: '#FFFFFF', label: '11' }, // 11월 딥 로즈우드
  12: { bg: '#6F8AB7', text: '#FFFFFF', label: '12' }, // 12월 윈터 인디고
}

export default function QtQuickIndexNav({
  currentMonth = 8,
  currentWeek = 1,
  activeTab = 'calendar',
  themeColor = '#B8C6D9',
}: QtQuickIndexNavProps) {
  const todayMonth = 8 // 현 시즌 기준 달

  return (
    <div
      className="absolute right-0.5 top-3 bottom-3 w-11 flex flex-col justify-between items-end py-1 z-30 select-none font-mono"
      style={{ pointerEvents: 'auto' }}
    >
      {/* Upper Main Section Tabs (YEAR, CAL, OVR - Embossed Leather Tag) */}
      <div className="flex flex-col space-y-1.5 w-full items-end">
        {/* YEAR Tab */}
        <button
          type="button"
          data-nav-target="yearlygrid"
          className={`h-6.5 rounded-l-lg text-[8.5px] font-black flex items-center justify-center transition-all drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)] cursor-pointer ${
            activeTab === 'yearlygrid'
              ? 'w-11 text-white font-black shadow-lg border-l-2 border-white ring-1 ring-white/60 scale-105'
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
          className={`h-6 rounded-l-lg text-[8.5px] font-black flex items-center justify-center transition-all drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)] cursor-pointer ${
            activeTab === 'calendar'
              ? 'w-11 text-white font-black shadow-lg border-l-2 border-white ring-1 ring-white/60 scale-105'
              : 'w-9 bg-slate-100 text-slate-600 hover:bg-slate-200 hover:w-10 hover:text-slate-900'
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
          className={`h-6 rounded-l-lg text-[8.5px] font-black flex items-center justify-center transition-all drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)] cursor-pointer ${
            activeTab === 'overview'
              ? 'w-11 text-white font-black shadow-lg border-l-2 border-white ring-1 ring-white/60 scale-105'
              : 'w-9 bg-slate-100 text-slate-600 hover:bg-slate-200 hover:w-10 hover:text-slate-900'
          }`}
          style={{ backgroundColor: activeTab === 'overview' ? themeColor : undefined }}
          title="월간 개요"
        >
          OVR
        </button>
      </div>

      {/* Quick Circle Tracker Shortcuts (습관, 감사, 가계부, 문화, KPT) */}
      <div className="flex flex-col space-y-1 w-full items-end my-1 py-1 border-y border-slate-200/80">
        <button
          type="button"
          data-nav-target="habit"
          className="w-6.5 h-6.5 rounded-full bg-emerald-500/90 text-white font-bold text-[9px] flex items-center justify-center shadow-xs hover:scale-115 transition-transform cursor-pointer"
          title="습관 트래커로 바로가기"
        >
          🌱
        </button>
        <button
          type="button"
          data-nav-target="gratitude"
          className="w-6.5 h-6.5 rounded-full bg-amber-500/90 text-white font-bold text-[9px] flex items-center justify-center shadow-xs hover:scale-115 transition-transform cursor-pointer"
          title="감사 일기로 바로가기"
        >
          ☀️
        </button>
        <button
          type="button"
          data-nav-target="budget"
          className="w-6.5 h-6.5 rounded-full bg-teal-500/90 text-white font-bold text-[9px] flex items-center justify-center shadow-xs hover:scale-115 transition-transform cursor-pointer"
          title="가계부로 바로가기"
        >
          💰
        </button>
        <button
          type="button"
          data-nav-target="kpt"
          className="w-6.5 h-6.5 rounded-full bg-purple-500/90 text-white font-bold text-[9px] flex items-center justify-center shadow-xs hover:scale-115 transition-transform cursor-pointer"
          title="KPT 회고로 바로가기"
        >
          🔄
        </button>
      </div>

      {/* Middle Week Tabs (W1 ~ W5) */}
      <div className="flex flex-col space-y-0.5 w-full items-end mb-1">
        {[1, 2, 3, 4, 5].map((wNo) => {
          const isCurrentW = activeTab === 'weekly' && currentWeek === wNo
          return (
            <button
              key={`w-${wNo}`}
              type="button"
              data-nav-target={`week-${wNo}`}
              data-week={wNo}
              className={`h-4.5 rounded-l-sm text-[8px] font-bold flex items-center justify-center transition-all drop-shadow-xs cursor-pointer ${
                isCurrentW
                  ? 'w-9.5 bg-slate-900 text-white font-black shadow-md border-l-2 border-amber-400 scale-105'
                  : 'w-8 bg-slate-100/90 text-slate-500 hover:bg-slate-200 hover:text-slate-800 hover:w-9'
              }`}
              title={`${wNo}주차 계획`}
            >
              W{wNo}
            </button>
          )
        })}
      </div>

      {/* Lower Seasonal Month Ribbons (01 ~ 12) - Color-Coded & TODAY Badge */}
      <div className="flex flex-col space-y-0.5 w-full items-end">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((mNum) => {
          const isSelectedM = currentMonth === mNum
          const isTodayM = todayMonth === mNum
          const palette = SEASONAL_MONTH_COLORS[mNum]

          return (
            <button
              key={`m-${mNum}`}
              type="button"
              data-nav-target={`month-${mNum}`}
              className={`h-4.5 rounded-l-md text-[8px] font-bold flex items-center justify-center transition-all drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.12)] cursor-pointer relative ${
                isSelectedM
                  ? 'w-10 text-white font-black shadow-md ring-1 ring-white/70 border-l-2 border-white scale-110'
                  : 'w-8 bg-slate-100/85 text-slate-600 hover:w-9.5 hover:text-white'
              }`}
              style={{
                backgroundColor: isSelectedM ? palette.bg : undefined,
              }}
              title={`${mNum}월 달력으로 이동`}
            >
              {palette.label}
              {isTodayM && (
                <span className="absolute -left-1 -top-0.5 w-2 h-2 rounded-full bg-amber-400 border border-white animate-pulse" title="TODAY" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
