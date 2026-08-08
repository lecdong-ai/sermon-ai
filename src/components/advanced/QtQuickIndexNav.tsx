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
      className="absolute right-0 top-3 bottom-3 w-10 flex flex-col justify-between items-end py-1 z-30 select-none font-mono"
      style={{ pointerEvents: 'auto' }}
    >
      {/* 1. Top Group: Main Core Tabs + 12-Month Palette + Week Jumpers (compact, weeks right under Dec) */}
      <div className="flex flex-col space-y-1.5 w-full items-end">
        {/* 1a. Main Core Tabs (YEAR, CAL, OVR) */}
        <div className="flex flex-col space-y-1.5 w-full items-end">
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
                className={`h-5.5 rounded-l-sm text-[8px] font-bold flex items-center justify-center transition-all cursor-pointer ${
                  isActive
                    ? 'w-10 text-white font-black border-l-2 border-amber-300 shadow-xs z-10 scale-105'
                    : 'w-7 opacity-70 hover:opacity-100 hover:w-8.5'
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
        </div>

        {/* Divider */}
        <div className="w-3.5 h-px bg-slate-200/80 my-0.5 self-center opacity-50" />

        {/* 2. Period Month Palette Tabs (17개월 전체: Aug'26 ~ Dec'27 / 연도 경계 구분선 포함) */}
        <div className="flex flex-col space-y-0.5 w-full items-end">
        {monthItems.map((item, idx) => {
          const colInfo = SEASONAL_MONTH_COLORS[item.month]
          const showYearDivider = item.year !== null && idx > 0 && monthItems[idx - 1].year !== item.year
          const navTarget = item.year !== null ? `month-${item.year}-${item.month}` : `month-${item.month}`

          return (
            <React.Fragment key={`m-${item.year ?? 'y'}-${item.month}`}>
              {showYearDivider && (
                <div className="w-3.5 h-px bg-slate-300/80 my-1 self-center opacity-60" />
              )}
              <button
                type="button"
                data-nav-target={navTarget}
                data-month={item.month}
                className={`h-3.5 rounded-l-xs text-[7.5px] font-extrabold flex items-center justify-between px-1.5 transition-all relative cursor-pointer ${
                  item.isCurrent
                    ? 'w-10 text-white font-black border-l-2 border-amber-300 shadow-xs z-10 scale-105'
                    : 'w-7.5 opacity-60 hover:opacity-100 hover:w-9'
                }`}
                style={{
                  backgroundColor: colInfo.bg,
                  color: colInfo.text,
                }}
                title={`${item.year !== null ? `${item.year}년 ` : ''}${item.month}월 (${colInfo.label}) 플래너로 이동`}
              >
                <span>{colInfo.label}</span>
                {item.isToday && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-300 border border-white animate-pulse" title="TODAY" />
                )}
              </button>
            </React.Fragment>
          )
        })}
      </div>

      {/* Divider */}
      <div className="w-3.5 h-px bg-slate-200/80 my-0.5 self-center opacity-50" />

      {/* 3. Week Direct Jumpers with Individual Pastel Palette (Week1 ~ Week5) */}
      <div className="flex flex-col space-y-0.5 w-full items-end">
        {[1, 2, 3, 4, 5].map((wNo) => {
          const isCurrentW = activeTab === 'weekly' && currentWeek === wNo
          const wColor = WEEK_PASTEL_COLORS[wNo]
          return (
            <button
              key={`w-${wNo}`}
              type="button"
              data-nav-target={`week-${wNo}`}
              data-week={wNo}
              className={`h-4 rounded-l-xs text-[7.5px] font-black flex items-center justify-center transition-all cursor-pointer ${
                isCurrentW
                  ? 'w-10 font-black border-l-2 border-amber-300 shadow-xs z-10 scale-105'
                  : 'w-7.5 opacity-80 hover:opacity-100 hover:w-9 font-bold'
              }`}
              style={{
                backgroundColor: isCurrentW ? wColor.activeBg : wColor.bg,
                color: isCurrentW ? wColor.activeText : wColor.text,
              }}
              title={`${wNo}주차 (Week${wNo}) 주간 계획`}
            >
              Week{wNo}
            </button>
          )
        })}
      </div>
      </div>

      {/* 4. Bottom Group: Divider + Sub-Tracker Index Tabs */}
      <div className="flex flex-col space-y-1 w-full items-end">
        <div className="w-3.5 h-px bg-slate-200/80 my-0.5 self-center opacity-50" />

        <div className="flex flex-col space-y-0.5 w-full items-end pr-0.5">
        {isChristian ? (
          <>
            <button
              type="button"
              data-nav-target="soap"
              className="h-3.5 px-1 rounded-l-2xs bg-slate-100 text-slate-600 hover:bg-slate-800 hover:text-white text-[6.5px] font-bold tracking-wider transition-all cursor-pointer border-r border-slate-300"
              title="SOAP 성경묵상 저널"
            >
              SOAP
            </button>
            <button
              type="button"
              data-nav-target="prayer"
              className="h-3.5 px-1 rounded-l-2xs bg-slate-100 text-slate-600 hover:bg-slate-800 hover:text-white text-[6.5px] font-bold tracking-wider transition-all cursor-pointer border-r border-slate-300"
              title="중보기도 노트"
            >
              PRAY
            </button>
            <button
              type="button"
              data-nav-target="bible"
              className="h-3.5 px-1 rounded-l-2xs bg-slate-100 text-slate-600 hover:bg-slate-800 hover:text-white text-[6.5px] font-bold tracking-wider transition-all cursor-pointer border-r border-slate-300"
              title="성경 66권 로드맵"
            >
              BIBLE
            </button>
            <button
              type="button"
              data-nav-target="sermon"
              className="h-3.5 px-1 rounded-l-2xs bg-slate-100 text-slate-600 hover:bg-slate-800 hover:text-white text-[6.5px] font-bold tracking-wider transition-all cursor-pointer border-r border-slate-300"
              title="주일 설교 노트"
            >
              SRMN
            </button>
            <button
              type="button"
              data-nav-target="hundred"
              className="h-3.5 px-1 rounded-l-2xs bg-slate-100 text-slate-600 hover:bg-slate-800 hover:text-white text-[6.5px] font-bold tracking-wider transition-all cursor-pointer border-r border-slate-300"
              title="100일 챌린지"
            >
              100D
            </button>
          </>
        ) : (
          <>
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
    </div>
  )
}
