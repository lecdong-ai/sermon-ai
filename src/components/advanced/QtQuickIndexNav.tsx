'use client'

import React from 'react'
import { useDiaryPeriod } from './diary/DiaryPeriodContext'

interface QtQuickIndexNavProps {
  currentMonth?: number
  currentWeek?: number
  activeTab?: 'yearlygrid' | 'calendar' | 'overview' | 'weekly' | 'daily' | 'tracker'
  themeColor?: string
  isChristian?: boolean
}

// 12개월 영문 3글자 약자 (Jan ~ Dec)
const SEASONAL_MONTH_COLORS: Record<number, { bg: string; text: string; label: string }> = {
  1: { bg: '#8395A7', text: '#FFFFFF', label: 'Jan' },
  2: { bg: '#95A5A6', text: '#FFFFFF', label: 'Feb' },
  3: { bg: '#D4A5B7', text: '#FFFFFF', label: 'Mar' },
  4: { bg: '#C896A6', text: '#FFFFFF', label: 'Apr' },
  5: { bg: '#96B396', text: '#FFFFFF', label: 'May' },
  6: { bg: '#7BA493', text: '#FFFFFF', label: 'Jun' },
  7: { bg: '#6B9DB9', text: '#FFFFFF', label: 'Jul' },
  8: { bg: '#7895B2', text: '#FFFFFF', label: 'Aug' },
  9: { bg: '#BE9B7B', text: '#FFFFFF', label: 'Sep' },
  10: { bg: '#B07D62', text: '#FFFFFF', label: 'Oct' },
  11: { bg: '#8E6E6E', text: '#FFFFFF', label: 'Nov' },
  12: { bg: '#657786', text: '#FFFFFF', label: 'Dec' },
}

// 1주차~5주차 정교한 파스텔 톤 팔레트
const WEEK_PASTEL_COLORS: Record<number, { bg: string; activeBg: string; text: string; activeText: string }> = {
  1: { bg: '#F7E9DD', activeBg: '#D89664', text: '#7A4A28', activeText: '#FFFFFF' }, // Week1 Warm Amber
  2: { bg: '#E4ECF4', activeBg: '#7A97B6', text: '#344E6B', activeText: '#FFFFFF' }, // Week2 Slate Blue
  3: { bg: '#E4F1E9', activeBg: '#76A68D', text: '#2C5440', activeText: '#FFFFFF' }, // Week3 Sage Mint
  4: { bg: '#F7E7EC', activeBg: '#C77F92', text: '#6D3444', activeText: '#FFFFFF' }, // Week4 Dusty Rose
  5: { bg: '#EBE9F5', activeBg: '#8A83AB', text: '#3E375C', activeText: '#FFFFFF' }, // Week5 Soft Lavender
}

// YEAR / CAL / OVR 코어 탭 파스텔 톤 팔레트 (12개월 & 주차 색인과 통일된 감성)
const CORE_TAB_PASTEL_COLORS: Record<'yearlygrid' | 'calendar' | 'overview', { bg: string; activeBg: string; text: string; activeText: string }> = {
  yearlygrid: { bg: '#FFF3D6', activeBg: '#E0A94F', text: '#8A6420', activeText: '#FFFFFF' }, // YEAR Soft Gold
  calendar: { bg: '#E4ECF4', activeBg: '#7A97B6', text: '#344E6B', activeText: '#FFFFFF' }, // CAL Slate Blue
  overview: { bg: '#E4F1E9', activeBg: '#76A68D', text: '#2C5440', activeText: '#FFFFFF' }, // OVR Sage Mint
}

export default function QtQuickIndexNav({
  currentMonth = 8,
  currentWeek = 1,
  activeTab = 'calendar',
  themeColor = '#7895B2',
  isChristian = false,
}: QtQuickIndexNavProps) {
  const todayMonth = 8
  const period = useDiaryPeriod()

  // ★ 연간 일괄 기간 컨텍스트가 있으면 실제 17개월(Aug'26~Dec'27) 전체 표시, 없으면 기존 12개월 폴백
  const periodStartYear = period?.periodMonths[0]?.year ?? 2026
  const monthItems: { year: number | null; month: number; isCurrent: boolean; isToday: boolean }[] = []
  if (period) {
    for (const m of period.periodMonths) {
      monthItems.push({
        year: m.year,
        month: m.month,
        isCurrent: period.currentYear === m.year && period.currentMonth === m.month,
        isToday: todayMonth === m.month && m.year === periodStartYear,
      })
    }
  } else {
    for (let i = 1; i <= 12; i++) {
      monthItems.push({ year: null, month: i, isCurrent: currentMonth === i, isToday: todayMonth === i })
    }
  }

  return (
    <div
      className="absolute -right-5 top-5 bottom-5 w-11 flex flex-col justify-between items-start py-1 z-30 select-none font-mono"
      style={{ pointerEvents: 'auto' }}
    >
      {/* 1. Core Pages & Sub-Trackers Top Stack */}
      <div className="flex flex-col space-y-1.5 w-full items-start">
        {/* Core Tabs: YEAR, CAL, OVR */}
        {(['yearlygrid', 'calendar', 'overview'] as const).map((coreKey) => {
          const isActive = activeTab === coreKey
          const cColor = CORE_TAB_PASTEL_COLORS[coreKey]
          const label = coreKey === 'yearlygrid' ? 'YEAR' : coreKey === 'calendar' ? 'CAL' : 'OVR'
          const title = coreKey === 'yearlygrid' ? '연간 캘린더' : coreKey === 'calendar' ? '월간 달력' : '월간 개요'
          return (
            <button
              key={coreKey}
              type="button"
              data-nav-target={coreKey}
              className={`h-6 rounded-r-lg text-[9.5px] font-black flex items-center justify-center transition-all duration-200 cursor-pointer border-y border-r border-slate-400/80 shadow-md ${
                isActive
                  ? 'w-13 text-white shadow-xl border-amber-300 z-20 translate-x-2.5 font-black scale-105 ring-1 ring-amber-300/70'
                  : 'w-10.5 opacity-90 hover:opacity-100 hover:w-12 hover:translate-x-1.5'
              }`}
              style={{
                backgroundColor: isActive ? cColor.activeBg : cColor.bg,
                color: isActive ? cColor.activeText : cColor.text,
              }}
              title={title}
            >
              {label}
            </button>
          )
        })}

        {/* Sub-Trackers */}
        <div className="flex flex-col space-y-1 pt-0.5 items-start">
          {isChristian ? (
            <>
              <button type="button" data-nav-target="soap" className="h-5 w-9.5 rounded-r-md bg-slate-800 text-white hover:bg-emerald-600 border-y border-r border-slate-300 shadow-xs text-[8px] font-extrabold transition-all hover:w-11.5 hover:translate-x-1.5 cursor-pointer flex items-center justify-center" title="SOAP 묵상 저널">SOAP</button>
              <button type="button" data-nav-target="prayer" className="h-5 w-9.5 rounded-r-md bg-slate-800 text-white hover:bg-emerald-600 border-y border-r border-slate-300 shadow-xs text-[8px] font-extrabold transition-all hover:w-11.5 hover:translate-x-1.5 cursor-pointer flex items-center justify-center" title="중보기도 노트">PRAY</button>
              <button type="button" data-nav-target="bible" className="h-5 w-9.5 rounded-r-md bg-slate-800 text-white hover:bg-emerald-600 border-y border-r border-slate-300 shadow-xs text-[8px] font-extrabold transition-all hover:w-11.5 hover:translate-x-1.5 cursor-pointer flex items-center justify-center" title="성경 66권 읽기표">BIBLE</button>
              <button type="button" data-nav-target="sermon" className="h-5 w-9.5 rounded-r-md bg-slate-800 text-white hover:bg-emerald-600 border-y border-r border-slate-300 shadow-xs text-[8px] font-extrabold transition-all hover:w-11.5 hover:translate-x-1.5 cursor-pointer flex items-center justify-center" title="주일 설교 노트">SRMN</button>
            </>
          ) : (
            <>
              <button type="button" data-nav-target="habit" className="h-5 w-9.5 rounded-r-md bg-slate-800 text-white hover:bg-indigo-600 border-y border-r border-slate-300 shadow-xs text-[8px] font-extrabold transition-all hover:w-11.5 hover:translate-x-1.5 cursor-pointer flex items-center justify-center" title="Habit Tracker">HABIT</button>
              <button type="button" data-nav-target="gratitude" className="h-5 w-9.5 rounded-r-md bg-slate-800 text-white hover:bg-indigo-600 border-y border-r border-slate-300 shadow-xs text-[8px] font-extrabold transition-all hover:w-11.5 hover:translate-x-1.5 cursor-pointer flex items-center justify-center" title="Gratitude Journal">GRAT</button>
              <button type="button" data-nav-target="budget" className="h-5 w-9.5 rounded-r-md bg-slate-800 text-white hover:bg-indigo-600 border-y border-r border-slate-300 shadow-xs text-[8px] font-extrabold transition-all hover:w-11.5 hover:translate-x-1.5 cursor-pointer flex items-center justify-center" title="Budget Tracker">CASH</button>
              <button type="button" data-nav-target="kpt" className="h-5 w-9.5 rounded-r-md bg-slate-800 text-white hover:bg-indigo-600 border-y border-r border-slate-300 shadow-xs text-[8px] font-extrabold transition-all hover:w-11.5 hover:translate-x-1.5 cursor-pointer flex items-center justify-center" title="KPT Review">KPT</button>
            </>
          )}
        </div>
      </div>

      {/* 2. Middle Group: Week Jumpers (W1 ~ W5) */}
      <div className="flex flex-col space-y-1 w-full items-start my-auto">
        {[1, 2, 3, 4, 5].map((wNo) => {
          const isCurrentW = activeTab === 'weekly' && currentWeek === wNo
          const wColor = WEEK_PASTEL_COLORS[wNo]
          return (
            <button
              key={`w-p-${wNo}`}
              type="button"
              data-nav-target={`week-${wNo}`}
              data-week={wNo}
              className={`h-5 rounded-r-lg text-[8.5px] font-black flex items-center justify-center transition-all duration-200 cursor-pointer border-y border-r border-slate-400/80 shadow-md ${
                isCurrentW
                  ? 'w-12.5 text-white shadow-xl border-amber-300 z-20 translate-x-2.5 scale-105 ring-1 ring-amber-300/70'
                  : 'w-9.5 opacity-90 hover:opacity-100 hover:w-11 hover:translate-x-1.5 font-extrabold'
              }`}
              style={{
                backgroundColor: isCurrentW ? wColor.activeBg : wColor.bg,
                color: isCurrentW ? wColor.activeText : wColor.text,
              }}
              title={`${wNo}주차 주간 계획`}
            >
              W{wNo}
            </button>
          )
        })}
      </div>

      {/* 3. Bottom Group: Month Tabs (Jan ~ Dec) */}
      <div className="flex flex-col space-y-0.8 w-full items-start">
        {monthItems.map((item, idx) => {
          const palette = SEASONAL_MONTH_COLORS[item.month]
          const showYearDivider = item.year !== null && idx > 0 && monthItems[idx - 1].year !== item.year
          const navTarget = item.year !== null ? `month-${item.year}-${item.month}` : `month-${item.month}`

          return (
            <React.Fragment key={`m-p-${item.year ?? 'y'}-${item.month}`}>
              {showYearDivider && <div className="h-px w-6 bg-slate-300/80 my-0.5" />}
              <button
                type="button"
                data-nav-target={navTarget}
                className={`h-4.2 rounded-r-md text-[7.5px] font-extrabold flex items-center justify-between px-1.5 transition-all duration-200 relative cursor-pointer border-y border-r border-slate-400/70 shadow-xs ${
                  item.isCurrent
                    ? 'w-12.5 text-white font-black shadow-xl border-amber-300 z-20 translate-x-2.5 scale-105 ring-1 ring-amber-300/70'
                    : 'w-9.5 text-slate-800 opacity-90 hover:opacity-100 hover:w-11 hover:translate-x-1.5'
                }`}
                style={{
                  backgroundColor: palette.bg,
                  color: palette.text,
                }}
                title={`${item.year !== null ? `${item.year}년 ` : ''}${item.month}월 (${palette.label}) 플래너`}
              >
                <span>{palette.label}</span>
                {item.isToday && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-300 border border-white animate-pulse" title="TODAY" />
                )}
              </button>
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}
