'use client'

import React from 'react'
import { useDiaryPeriod } from '../diary/DiaryPeriodContext'

interface QtQuickIndexNavPortraitProps {
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

export default function QtQuickIndexNavPortrait({
  currentMonth = 8,
  currentWeek = 1,
  activeTab = 'calendar',
  themeColor = '#7895B2',
  isChristian = false,
}: QtQuickIndexNavPortraitProps) {
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
      className="absolute top-2.5 right-4 flex flex-col items-end space-y-1 z-30 select-none font-mono"
      style={{ pointerEvents: 'auto' }}
    >
      {/* Upper Ribbon: Main Section Buttons + Separated Trackers + Pastel Week Jumpers (Week1 ~ Week5) */}
      <div className="flex items-center space-x-1 bg-white/95 px-1.5 py-0.5 rounded-lg border border-slate-200/80 shadow-2xs backdrop-blur-xs">
        {/* Main Section Buttons */}
        <div className="flex items-center space-x-0.5">
          <button
            type="button"
            data-nav-target="yearlygrid"
            className={`px-1.5 py-0.5 rounded text-[8px] font-bold transition-all cursor-pointer ${
              activeTab === 'yearlygrid'
                ? 'bg-slate-800 text-white font-black shadow-2xs border-b border-amber-300 scale-105'
                : 'text-slate-500 opacity-70 hover:bg-slate-100 hover:text-slate-800'
            }`}
            title="연간 캘린더"
          >
            YEAR
          </button>

          <button
            type="button"
            data-nav-target="calendar"
            className={`px-1.5 py-0.5 rounded text-[8px] font-bold transition-all cursor-pointer ${
              activeTab === 'calendar'
                ? 'bg-slate-800 text-white font-black shadow-2xs border-b border-amber-300 scale-105'
                : 'text-slate-500 opacity-70 hover:bg-slate-100 hover:text-slate-800'
            }`}
            title="월간 달력"
          >
            CAL
          </button>

          <button
            type="button"
            data-nav-target="overview"
            className={`px-1.5 py-0.5 rounded text-[8px] font-bold transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-slate-800 text-white font-black shadow-2xs border-b border-amber-300 scale-105'
                : 'text-slate-500 opacity-70 hover:bg-slate-100 hover:text-slate-800'
            }`}
            title="월간 개요"
          >
            OVR
          </button>
        </div>

        <div className="h-3 w-px bg-slate-200" />

        {/* Separated Sub-Tracker Tags */}
        <div className="flex items-center space-x-0.5">
          {isChristian ? (
            <>
              <button
                type="button"
                data-nav-target="soap"
                className="px-1 py-0.5 rounded bg-slate-100 text-slate-600 hover:bg-slate-800 hover:text-white font-bold text-[6.5px] transition-colors cursor-pointer"
                title="SOAP 묵상 저널"
              >
                SOAP
              </button>
              <button
                type="button"
                data-nav-target="prayer"
                className="px-1 py-0.5 rounded bg-slate-100 text-slate-600 hover:bg-slate-800 hover:text-white font-bold text-[6.5px] transition-colors cursor-pointer"
                title="중보기도 노트"
              >
                PRAY
              </button>
              <button
                type="button"
                data-nav-target="bible"
                className="px-1 py-0.5 rounded bg-slate-100 text-slate-600 hover:bg-slate-800 hover:text-white font-bold text-[6.5px] transition-colors cursor-pointer"
                title="성경 66권 읽기표"
              >
                BIBLE
              </button>
              <button
                type="button"
                data-nav-target="sermon"
                className="px-1 py-0.5 rounded bg-slate-100 text-slate-600 hover:bg-slate-800 hover:text-white font-bold text-[6.5px] transition-colors cursor-pointer"
                title="주일 설교 노트"
              >
                SRMN
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                data-nav-target="habit"
                className="px-1 py-0.5 rounded bg-slate-100 text-slate-600 hover:bg-slate-800 hover:text-white font-bold text-[6.5px] transition-colors cursor-pointer"
                title="Habit Tracker"
              >
                HABIT
              </button>
              <button
                type="button"
                data-nav-target="gratitude"
                className="px-1 py-0.5 rounded bg-slate-100 text-slate-600 hover:bg-slate-800 hover:text-white font-bold text-[6.5px] transition-colors cursor-pointer"
                title="Gratitude Journal"
              >
                GRAT
              </button>
              <button
                type="button"
                data-nav-target="budget"
                className="px-1 py-0.5 rounded bg-slate-100 text-slate-600 hover:bg-slate-800 hover:text-white font-bold text-[6.5px] transition-colors cursor-pointer"
                title="Budget Tracker"
              >
                CASH
              </button>
              <button
                type="button"
                data-nav-target="kpt"
                className="px-1 py-0.5 rounded bg-slate-100 text-slate-600 hover:bg-slate-800 hover:text-white font-bold text-[6.5px] transition-colors cursor-pointer"
                title="KPT Review"
              >
                KPT
              </button>
            </>
          )}
        </div>

        <div className="h-3 w-px bg-slate-200" />

        {/* Week Direct Jumpers with Pastel Colors (Week1 ~ Week5) */}
        <div className="flex items-center space-x-0.5">
          {[1, 2, 3, 4, 5].map((wNo) => {
            const isCurrentW = activeTab === 'weekly' && currentWeek === wNo
            const wColor = WEEK_PASTEL_COLORS[wNo]
            return (
              <button
                key={`w-p-${wNo}`}
                type="button"
                data-nav-target={`week-${wNo}`}
                data-week={wNo}
                className={`px-1.5 py-0.5 rounded text-[7.5px] font-black transition-all cursor-pointer ${
                  isCurrentW
                    ? 'shadow-md border-b-2 border-amber-300 scale-110 z-10'
                    : 'opacity-80 hover:opacity-100 font-bold'
                }`}
                style={{
                  backgroundColor: isCurrentW ? wColor.activeBg : wColor.bg,
                  color: isCurrentW ? wColor.activeText : wColor.text,
                }}
              >
                Week{wNo}
              </button>
            )
          })}
        </div>
      </div>

      {/* Lower Ribbon: Period Month Palette (17개월 전체: Aug'26 ~ Dec'27 / 연도 경계 구분선 포함) */}
      <div className="flex items-center space-x-0.5 bg-white/95 p-0.5 rounded-lg border border-slate-200/80 shadow-2xs">
        {monthItems.map((item, idx) => {
          const palette = SEASONAL_MONTH_COLORS[item.month]
          const showYearDivider = item.year !== null && idx > 0 && monthItems[idx - 1].year !== item.year
          const navTarget = item.year !== null ? `month-${item.year}-${item.month}` : `month-${item.month}`

          return (
            <React.Fragment key={`m-p-${item.year ?? 'y'}-${item.month}`}>
              {showYearDivider && <div className="w-px h-3 bg-slate-300/80 mx-0.5" />}
              <button
                type="button"
                data-nav-target={navTarget}
                className={`py-0.5 text-center transition-all relative cursor-pointer ${
                  item.isCurrent
                    ? 'w-4.5 text-[8px] text-white font-black shadow-2xs border-b border-amber-300 rounded scale-105 z-10'
                    : 'w-3.5 text-[7px] text-slate-500 opacity-60 hover:opacity-100 hover:w-4'
                }`}
                style={{
                  backgroundColor: item.isCurrent ? palette.bg : undefined,
                }}
                title={`${item.year !== null ? `${item.year}년 ` : ''}${item.month}월 (${palette.label}) 플래너로 이동`}
              >
                {palette.label}
                {item.isToday && (
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-amber-300 border border-white animate-pulse" title="TODAY" />
                )}
              </button>
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}
