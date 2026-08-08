'use client'

import React from 'react'

interface QtQuickIndexNavProps {
  currentMonth?: number
  currentWeek?: number
  activeTab?: 'yearlygrid' | 'calendar' | 'overview' | 'weekly' | 'daily' | 'tracker'
  themeColor?: string
  isChristian?: boolean // 일반인 / 크리스천 스마트 인덱스 구분
}

// 12개월 절제된 고급 파스텔 슬레이트/어스 톤 (Luxury Muted Earth & Pastel Palette)
const SEASONAL_MONTH_COLORS: Record<number, { bg: string; text: string; label: string }> = {
  1: { bg: '#8395A7', text: '#FFFFFF', label: '01' },
  2: { bg: '#95A5A6', text: '#FFFFFF', label: '02' },
  3: { bg: '#D4A5B7', text: '#FFFFFF', label: '03' },
  4: { bg: '#C896A6', text: '#FFFFFF', label: '04' },
  5: { bg: '#96B396', text: '#FFFFFF', label: '05' },
  6: { bg: '#7BA493', text: '#FFFFFF', label: '06' },
  7: { bg: '#6B9DB9', text: '#FFFFFF', label: '07' },
  8: { bg: '#7895B2', text: '#FFFFFF', label: '08' },
  9: { bg: '#BE9B7B', text: '#FFFFFF', label: '09' },
  10: { bg: '#B07D62', text: '#FFFFFF', label: '10' },
  11: { bg: '#8E6E6E', text: '#FFFFFF', label: '11' },
  12: { bg: '#657786', text: '#FFFFFF', label: '12' },
}

export default function QtQuickIndexNav({
  currentMonth = 8,
  currentWeek = 1,
  activeTab = 'calendar',
  themeColor = '#7895B2',
  isChristian = false,
}: QtQuickIndexNavProps) {
  const todayMonth = 8

  return (
    <div
      className="absolute right-0 top-3 bottom-3 w-9 flex flex-col justify-between items-end py-1 z-30 select-none font-mono"
      style={{ pointerEvents: 'auto' }}
    >
      {/* 1. Main Core Tabs (YEAR, CAL, OVR) */}
      <div className="flex flex-col space-y-1.5 w-full items-end">
        <button
          type="button"
          data-nav-target="yearlygrid"
          className={`h-5.5 rounded-l-sm text-[8px] font-bold flex items-center justify-center transition-all cursor-pointer ${
            activeTab === 'yearlygrid'
              ? 'w-9 text-white font-black bg-slate-800 border-l-2 border-amber-300/90 shadow-xs z-10'
              : 'w-7 bg-slate-100/80 text-slate-400 hover:bg-slate-200 hover:text-slate-700 hover:w-8.5'
          }`}
          title="연간 캘린더"
        >
          YEAR
        </button>

        <button
          type="button"
          data-nav-target="calendar"
          className={`h-5.5 rounded-l-sm text-[8px] font-bold flex items-center justify-center transition-all cursor-pointer ${
            activeTab === 'calendar'
              ? 'w-9 text-white font-black bg-slate-800 border-l-2 border-amber-300/90 shadow-xs z-10'
              : 'w-7 bg-slate-100/80 text-slate-400 hover:bg-slate-200 hover:text-slate-700 hover:w-8.5'
          }`}
          title="월간 달력"
        >
          CAL
        </button>

        <button
          type="button"
          data-nav-target="overview"
          className={`h-5.5 rounded-l-sm text-[8px] font-bold flex items-center justify-center transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'w-9 text-white font-black bg-slate-800 border-l-2 border-amber-300/90 shadow-xs z-10'
              : 'w-7 bg-slate-100/80 text-slate-400 hover:bg-slate-200 hover:text-slate-700 hover:w-8.5'
          }`}
          title="월간 개요"
        >
          OVR
        </button>
      </div>

      {/* Divider */}
      <div className="w-3.5 h-px bg-slate-200/80 my-0.5 self-center opacity-50" />

      {/* 2. Muted 12-Month Palette Tabs (01 ~ 12) */}
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
              className={`h-4 rounded-l-2xs text-[7.5px] font-bold flex items-center justify-between px-1.5 transition-all relative cursor-pointer ${
                isCurrent
                  ? 'w-9 text-white font-black border-l-2 border-amber-300 shadow-2xs z-10'
                  : 'w-6.5 opacity-55 hover:opacity-100 hover:w-8.5'
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
      <div className="w-3.5 h-px bg-slate-200/80 my-0.5 self-center opacity-50" />

      {/* 3. Ultra-Slim Week Direct Jumpers (W1 ~ W5) */}
      <div className="flex flex-col space-y-0.5 w-full items-end">
        {[1, 2, 3, 4, 5].map((wNo) => {
          const isCurrentW = activeTab === 'weekly' && currentWeek === wNo
          return (
            <button
              key={`w-${wNo}`}
              type="button"
              data-nav-target={`week-${wNo}`}
              data-week={wNo}
              className={`h-3.5 rounded-l-2xs text-[7px] font-bold flex items-center justify-center transition-all cursor-pointer ${
                isCurrentW
                  ? 'w-8.5 bg-slate-900 text-white font-black border-l-2 border-amber-400 shadow-2xs z-10'
                  : 'w-6 bg-slate-100/70 text-slate-400 hover:bg-slate-200 hover:text-slate-800 hover:w-7.5'
              }`}
              title={`${wNo}주차 주간 계획`}
            >
              W{wNo}
            </button>
          )
        })}
      </div>

      {/* Divider */}
      <div className="w-3.5 h-px bg-slate-200/80 my-0.5 self-center opacity-50" />

      {/* 4. Sub-Tracker Index Tabs (Separated for General Users vs Christian Users) */}
      <div className="flex flex-col space-y-0.5 w-full items-end pr-0.5">
        {isChristian ? (
          <>
            {/* Christian Spiritual Trackers */}
            <button
              type="button"
              data-nav-target="soap"
              className="h-3.5 px-1 rounded-l-2xs bg-slate-100 text-slate-600 hover:bg-slate-800 hover:text-white text-[6px] font-bold tracking-wider transition-all cursor-pointer border-r border-slate-300"
              title="SOAP 성경묵상 저널"
            >
              SOAP
            </button>
            <button
              type="button"
              data-nav-target="prayer"
              className="h-3.5 px-1 rounded-l-2xs bg-slate-100 text-slate-600 hover:bg-slate-800 hover:text-white text-[6px] font-bold tracking-wider transition-all cursor-pointer border-r border-slate-300"
              title="중보기도 & 응답 기념관"
            >
              PRAY
            </button>
            <button
              type="button"
              data-nav-target="bible"
              className="h-3.5 px-1 rounded-l-2xs bg-slate-100 text-slate-600 hover:bg-slate-800 hover:text-white text-[6px] font-bold tracking-wider transition-all cursor-pointer border-r border-slate-300"
              title="성경 66권 로드맵"
            >
              BIBLE
            </button>
            <button
              type="button"
              data-nav-target="sermon"
              className="h-3.5 px-1 rounded-l-2xs bg-slate-100 text-slate-600 hover:bg-slate-800 hover:text-white text-[6px] font-bold tracking-wider transition-all cursor-pointer border-r border-slate-300"
              title="주일 설교 노트"
            >
              SRMN
            </button>
            <button
              type="button"
              data-nav-target="hundred"
              className="h-3.5 px-1 rounded-l-2xs bg-slate-100 text-slate-600 hover:bg-slate-800 hover:text-white text-[6px] font-bold tracking-wider transition-all cursor-pointer border-r border-slate-300"
              title="100일 챌린지"
            >
              100D
            </button>
          </>
        ) : (
          <>
            {/* General Life Trackers */}
            <button
              type="button"
              data-nav-target="habit"
              className="h-3.5 px-1 rounded-l-2xs bg-slate-100 text-slate-600 hover:bg-slate-800 hover:text-white text-[6.5px] font-bold tracking-wider transition-all cursor-pointer border-r border-slate-300"
              title="습관 트래커"
            >
              HABIT
            </button>
            <button
              type="button"
              data-nav-target="gratitude"
              className="h-3.5 px-1 rounded-l-2xs bg-slate-100 text-slate-600 hover:bg-slate-800 hover:text-white text-[6.5px] font-bold tracking-wider transition-all cursor-pointer border-r border-slate-300"
              title="감사 일기"
            >
              GRAT
            </button>
            <button
              type="button"
              data-nav-target="budget"
              className="h-3.5 px-1 rounded-l-2xs bg-slate-100 text-slate-600 hover:bg-slate-800 hover:text-white text-[6.5px] font-bold tracking-wider transition-all cursor-pointer border-r border-slate-300"
              title="지출 가계부"
            >
              CASH
            </button>
            <button
              type="button"
              data-nav-target="kpt"
              className="h-3.5 px-1 rounded-l-2xs bg-slate-100 text-slate-600 hover:bg-slate-800 hover:text-white text-[6.5px] font-bold tracking-wider transition-all cursor-pointer border-r border-slate-300"
              title="KPT 회고"
            >
              KPT
            </button>
            <button
              type="button"
              data-nav-target="culture"
              className="h-3.5 px-1 rounded-l-2xs bg-slate-100 text-slate-600 hover:bg-slate-800 hover:text-white text-[6.5px] font-bold tracking-wider transition-all cursor-pointer border-r border-slate-300"
              title="문화 컬렉션"
            >
              CULT
            </button>
          </>
        )}
      </div>
    </div>
  )
}
