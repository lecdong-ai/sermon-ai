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
      className="absolute right-0.5 top-2 bottom-2 w-12 flex flex-col justify-between items-end py-1 z-30 select-none font-mono"
      style={{ pointerEvents: 'auto' }}
    >
      {/* 1. Header Brand Tag */}
      <div className="text-[7px] font-black text-slate-400/90 tracking-tighter uppercase mb-0.5 pr-1 font-mono">
        INDEX
      </div>

      {/* 2. Upper Main Section Tabs (YEAR, CAL, OVR - Gold Edge Leather Ribbon) */}
      <div className="flex flex-col space-y-1 w-full items-end">
        {/* YEAR Tab */}
        <button
          type="button"
          data-nav-target="yearlygrid"
          className={`h-6.5 rounded-l-lg text-[8.5px] font-black flex items-center justify-center transition-all drop-shadow-[0_2px_4px_rgba(0,0,0,0.18)] cursor-pointer ${
            activeTab === 'yearlygrid'
              ? 'w-11.5 text-white font-black shadow-lg border-l-2 border-amber-300 ring-1 ring-white/60 scale-105'
              : 'w-9.5 bg-slate-100/95 text-slate-600 hover:bg-slate-200 hover:w-10.5 hover:text-slate-900'
          }`}
          style={{ backgroundColor: activeTab === 'yearlygrid' ? themeColor : undefined }}
          title="연간 12개월 캘린더 마스터 그리드"
        >
          YEAR
        </button>

        {/* CAL Tab */}
        <button
          type="button"
          data-nav-target="calendar"
          className={`h-6 rounded-l-lg text-[8.5px] font-black flex items-center justify-center transition-all drop-shadow-[0_2px_4px_rgba(0,0,0,0.18)] cursor-pointer ${
            activeTab === 'calendar'
              ? 'w-11.5 text-white font-black shadow-lg border-l-2 border-amber-300 ring-1 ring-white/60 scale-105'
              : 'w-9.5 bg-slate-100/95 text-slate-600 hover:bg-slate-200 hover:w-10.5 hover:text-slate-900'
          }`}
          style={{ backgroundColor: activeTab === 'calendar' ? themeColor : undefined }}
          title="월간 캘린더 달력"
        >
          CAL
        </button>

        {/* OVR Tab */}
        <button
          type="button"
          data-nav-target="overview"
          className={`h-6 rounded-l-lg text-[8.5px] font-black flex items-center justify-center transition-all drop-shadow-[0_2px_4px_rgba(0,0,0,0.18)] cursor-pointer ${
            activeTab === 'overview'
              ? 'w-11.5 text-white font-black shadow-lg border-l-2 border-amber-300 ring-1 ring-white/60 scale-105'
              : 'w-9.5 bg-slate-100/95 text-slate-600 hover:bg-slate-200 hover:w-10.5 hover:text-slate-900'
          }`}
          style={{ backgroundColor: activeTab === 'overview' ? themeColor : undefined }}
          title="월간 핵심 목표 & 액션 플랜 개요"
        >
          OVR
        </button>
      </div>

      {/* 3. Middle 5-Week Quick Direct Jumper (W1 ~ W5) */}
      <div className="flex flex-col space-y-0.5 w-full items-end my-1 py-1 border-y border-slate-200/90 bg-slate-50/60 rounded-l-md pr-0.5">
        <div className="text-[6.5px] font-bold text-slate-400 pr-1 uppercase tracking-tighter">WEEKS</div>
        {[1, 2, 3, 4, 5].map((wNo) => {
          const isCurrentW = activeTab === 'weekly' && currentWeek === wNo
          return (
            <button
              key={`w-${wNo}`}
              type="button"
              data-nav-target={`week-${wNo}`}
              data-week={wNo}
              className={`h-4.5 rounded-l-md text-[8px] font-extrabold flex items-center justify-center transition-all drop-shadow-xs cursor-pointer ${
                isCurrentW
                  ? 'w-10.5 bg-slate-900 text-white font-black shadow-md border-l-2 border-amber-400 scale-105'
                  : 'w-8.5 bg-white text-slate-600 border border-slate-200 hover:bg-slate-200 hover:text-slate-900 hover:w-9.5'
              }`}
              title={`${wNo}주차 주간 계획 페이지 직행`}
            >
              W{wNo}
            </button>
          )
        })}
      </div>

      {/* 4. Quick Smart Tracker Pill Badges (습관, 감사, 가계부, KPT) */}
      <div className="flex flex-col space-y-1 w-full items-end my-0.5">
        <button
          type="button"
          data-nav-target="habit"
          className="h-5 px-1.5 rounded-l-md bg-emerald-600 text-white font-black text-[8px] flex items-center space-x-1 shadow-xs hover:w-11 transition-all cursor-pointer border-l-2 border-emerald-300"
          title="습관 & 스트릭 마스터 트래커"
        >
          <span>🌱</span>
          <span className="text-[7.5px]">HABIT</span>
        </button>
        <button
          type="button"
          data-nav-target="gratitude"
          className="h-5 px-1.5 rounded-l-md bg-amber-500 text-white font-black text-[8px] flex items-center space-x-1 shadow-xs hover:w-11 transition-all cursor-pointer border-l-2 border-amber-300"
          title="31일 감사 일기 저널"
        >
          <span>☀️</span>
          <span className="text-[7.5px]">GRAT</span>
        </button>
        <button
          type="button"
          data-nav-target="budget"
          className="h-5 px-1.5 rounded-l-md bg-teal-600 text-white font-black text-[8px] flex items-center space-x-1 shadow-xs hover:w-11 transition-all cursor-pointer border-l-2 border-teal-300"
          title="31일 지출 & 가계부 트래커"
        >
          <span>💰</span>
          <span className="text-[7.5px]">CASH</span>
        </button>
        <button
          type="button"
          data-nav-target="kpt"
          className="h-5 px-1.5 rounded-l-md bg-indigo-600 text-white font-black text-[8px] flex items-center space-x-1 shadow-xs hover:w-11 transition-all cursor-pointer border-l-2 border-indigo-300"
          title="4주 KPT 회고 저널"
        >
          <span>🔄</span>
          <span className="text-[7.5px]">KPT</span>
        </button>
      </div>

      {/* 5. Seasonal 12-Month Palette Vertical Tabs */}
      <div className="flex flex-col space-y-0.5 w-full items-end mt-1">
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
              className={`h-4.5 rounded-l-md text-[8.5px] font-black flex items-center justify-between px-1.5 transition-all drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.12)] relative cursor-pointer ${
                isCurrent
                  ? 'w-11.5 ring-2 ring-amber-400 ring-offset-1 z-10 scale-105 border-l-2 border-white'
                  : 'w-9 hover:w-10.5 opacity-90 hover:opacity-100'
              }`}
              style={{
                backgroundColor: colInfo.bg,
                color: colInfo.text,
              }}
              title={`${mNum}월 플래너로 이동`}
            >
              <span>{colInfo.label}</span>
              {isToday && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse shadow-xs" title="이번 달 (TODAY)" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
