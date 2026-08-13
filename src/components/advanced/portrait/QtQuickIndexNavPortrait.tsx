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

// 12개월 파스텔 계절 팔레트 (진한 글자로 가독성 확보)
const SEASONAL_MONTH_COLORS: Record<number, { bg: string; text: string; label: string }> = {
  1: { bg: '#DBEAFE', text: '#1E40AF', label: 'Jan' }, // 1월: 파스텔 아이스 블루
  2: { bg: '#FCE7F3', text: '#BE185D', label: 'Feb' }, // 2월: 파스텔 핑크
  3: { bg: '#D1FAE5', text: '#047857', label: 'Mar' }, // 3월: 파스텔 민트 그린
  4: { bg: '#FFE4E6', text: '#BE123C', label: 'Apr' }, // 4월: 파스텔 로즈
  5: { bg: '#FEF3C7', text: '#B45309', label: 'May' }, // 5월: 크림 엠버
  6: { bg: '#CFFAFE', text: '#0E7490', label: 'Jun' }, // 6월: 파스텔 아쿠아
  7: { bg: '#E0E7FF', text: '#4338CA', label: 'Jul' }, // 7월: 파스텔 페리윙클 블루
  8: { bg: '#FFEDD5', text: '#C2410C', label: 'Aug' }, // 8월: 파스텔 피치 오렌지
  9: { bg: '#FEF9C3', text: '#A16207', label: 'Sep' }, // 9월: 연옐로우
  10: { bg: '#FAE8FF', text: '#A21CAF', label: 'Oct' }, // 10월: 파스텔 오키드
  11: { bg: '#EDE9FE', text: '#6D28D9', label: 'Nov' }, // 11월: 라벤더
  12: { bg: '#FEE2E2', text: '#B91C1C', label: 'Dec' }, // 12월: 파스텔 레드
}

// 1주차~5주차 정교한 파스텔 톤 팔레트
const WEEK_PASTEL_COLORS: Record<number, { bg: string; activeBg: string; text: string; activeText: string }> = {
  1: { bg: '#F7E9DD', activeBg: '#D89664', text: '#7A4A28', activeText: '#FFFFFF' }, // Week1 Warm Amber
  2: { bg: '#E4ECF4', activeBg: '#7A97B6', text: '#344E6B', activeText: '#FFFFFF' }, // Week2 Slate Blue
  3: { bg: '#E4F1E9', activeBg: '#76A68D', text: '#2C5440', activeText: '#FFFFFF' }, // Week3 Sage Mint
  4: { bg: '#F7E7EC', activeBg: '#C77F92', text: '#6D3444', activeText: '#FFFFFF' }, // Week4 Dusty Rose
  5: { bg: '#EBE9F5', activeBg: '#8A83AB', text: '#3E375C', activeText: '#FFFFFF' }, // Week5 Soft Lavender
}

// YEAR / CAL / OVR 코어 탭 파스텔 톤 팔레트
const CORE_TAB_PASTEL_COLORS: Record<'yearlygrid' | 'calendar' | 'overview', { bg: string; activeBg: string; text: string; activeText: string }> = {
  yearlygrid: { bg: '#FFF3D6', activeBg: '#E0A94F', text: '#8A6420', activeText: '#FFFFFF' }, // YEAR Soft Gold
  calendar: { bg: '#E4ECF4', activeBg: '#7A97B6', text: '#344E6B', activeText: '#FFFFFF' }, // CAL Slate Blue
  overview: { bg: '#E4F1E9', activeBg: '#76A68D', text: '#2C5440', activeText: '#FFFFFF' }, // OVR Sage Mint
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
      className="absolute -right-[2mm] top-12 bottom-6 w-14 flex flex-col justify-between items-start gap-1.5 pt-1 pr-2 pb-1 pl-0 z-30 select-none font-mono rounded-l-2xl bg-[#F1F5F9] border-y border-l border-slate-300 shadow-sm"
      style={{ pointerEvents: 'auto' }}
    >
      <div className="w-full px-1 text-[7.5px] font-black tracking-[0.25em] text-slate-500 text-center uppercase">INDEX</div>

      {/* 1. Core Pages & Sub-Trackers Top Stack */}
      <div className="flex flex-col space-y-1 w-full items-start">
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
              className={`relative h-6 w-full rounded-r-lg text-[9.5px] font-black flex items-center justify-center transition-all duration-200 cursor-pointer border shadow-md ${
                isActive
                  ? 'text-white shadow-xl border-2 border-white ring-2 ring-amber-400 z-20 scale-[1.08] font-black'
                  : 'opacity-90 hover:opacity-100 hover:scale-105 border-slate-300'
              }`}
              style={{
                backgroundColor: isActive ? cColor.activeBg : cColor.bg,
                color: isActive ? cColor.activeText : cColor.text,
              }}
              title={title}
            >
              {isActive && <span className="absolute left-1 w-1.5 h-1.5 rounded-full bg-amber-300 shadow-[0_0_8px_rgba(252,211,77,0.9)]" />}
              {label}
            </button>
          )
        })}

        <div className="w-full h-px bg-slate-300 my-0.5" />

        {/* Sub-Trackers */}
        <div className="flex flex-col space-y-1 pt-0.5 items-start w-full">
          {isChristian ? (
            <>
              <button type="button" data-nav-target="soap" className="h-6 w-full rounded-r-lg bg-[#D1FAE5] text-[#047857] hover:bg-emerald-100 border border-emerald-200 shadow-md text-[9.5px] font-black tracking-wide transition-all hover:scale-105 cursor-pointer flex items-center justify-center" title="SOAP 묵상 저널">SOAP</button>
              <button type="button" data-nav-target="prayer" className="h-6 w-full rounded-r-lg bg-[#CCFBF1] text-[#0F766E] hover:bg-teal-100 border border-teal-200 shadow-md text-[9.5px] font-black tracking-wide transition-all hover:scale-105 cursor-pointer flex items-center justify-center" title="중보기도 노트">PRAY</button>
              <button type="button" data-nav-target="bible" className="h-6 w-full rounded-r-lg bg-[#E0E7FF] text-[#4338CA] hover:bg-indigo-100 border border-indigo-200 shadow-md text-[9.5px] font-black tracking-wide transition-all hover:scale-105 cursor-pointer flex items-center justify-center" title="성경 66권 읽기표">BIBLE</button>
              <button type="button" data-nav-target="sermon" className="h-6 w-full rounded-r-lg bg-[#EDE9FE] text-[#6D28D9] hover:bg-purple-100 border border-purple-200 shadow-md text-[9.5px] font-black tracking-wide transition-all hover:scale-105 cursor-pointer flex items-center justify-center" title="주일 설교 노트">SRMN</button>
            </>
          ) : (
            <>
              <button type="button" data-nav-target="habit" className="h-6 w-full rounded-r-lg bg-[#DBEAFE] text-[#1D4ED8] hover:bg-blue-100 border border-blue-200 shadow-md text-[9.5px] font-black tracking-wide transition-all hover:scale-105 cursor-pointer flex items-center justify-center" title="Habit Tracker">HABIT</button>
              <button type="button" data-nav-target="gratitude" className="h-6 w-full rounded-r-lg bg-[#FCE7F3] text-[#BE185D] hover:bg-pink-100 border border-pink-200 shadow-md text-[9.5px] font-black tracking-wide transition-all hover:scale-105 cursor-pointer flex items-center justify-center" title="Gratitude Journal">GRAT</button>
              <button type="button" data-nav-target="budget" className="h-6 w-full rounded-r-lg bg-[#FEF3C7] text-[#B45309] hover:bg-amber-100 border border-amber-200 shadow-md text-[9.5px] font-black tracking-wide transition-all hover:scale-105 cursor-pointer flex items-center justify-center" title="Budget Tracker">CASH</button>
              <button type="button" data-nav-target="kpt" className="h-6 w-full rounded-r-lg bg-[#CFFAFE] text-[#0E7490] hover:bg-cyan-100 border border-cyan-200 shadow-md text-[9.5px] font-black tracking-wide transition-all hover:scale-105 cursor-pointer flex items-center justify-center" title="KPT Review">KPT</button>
            </>
          )}
        </div>
      </div>

      {/* 2. Middle Group: Week Jumpers (W1 ~ W5) */}
      <div className="flex flex-col space-y-0.8 w-full items-start my-auto">
        <div className="w-full h-px bg-slate-300 my-0.5" />
        {[1, 2, 3, 4, 5].map((wNo) => {
          const isCurrentW = activeTab === 'weekly' && currentWeek === wNo
          const wColor = WEEK_PASTEL_COLORS[wNo]
          return (
            <button
              key={`w-p-${wNo}`}
              type="button"
              data-nav-target={`week-${wNo}`}
              data-week={wNo}
              className={`relative h-6 w-full rounded-r-lg text-[9px] font-black flex items-center justify-center transition-all duration-200 cursor-pointer border shadow-sm ${
                isCurrentW
                  ? 'text-white shadow-xl border-2 border-white ring-2 ring-amber-400 z-20 scale-[1.08]'
                  : 'opacity-90 hover:opacity-100 hover:scale-105 border-slate-300 font-extrabold'
              }`}
              style={{
                backgroundColor: isCurrentW ? wColor.activeBg : wColor.bg,
                color: isCurrentW ? wColor.activeText : wColor.text,
              }}
              title={`${wNo}주차 주간 계획`}
            >
              {isCurrentW && <span className="absolute left-1 w-1.5 h-1.5 rounded-full bg-amber-300 shadow-[0_0_8px_rgba(252,211,77,0.9)]" />}
              Week{wNo}
            </button>
          )
        })}
      </div>

      {/* 3. Bottom Group: Month Tabs (Jan ~ Dec) */}
      <div className="flex flex-col space-y-1 w-full items-start mb-1.5">
        <div className="w-full h-px bg-slate-300 my-0.5" />
        {monthItems.map((item, idx) => {
          const palette = SEASONAL_MONTH_COLORS[item.month]
          const showYearDivider = item.year !== null && idx > 0 && monthItems[idx - 1].year !== item.year
          const navTarget = item.year !== null ? `month-${item.year}-${item.month}` : `month-${item.month}`

          return (
            <React.Fragment key={`m-p-${item.year ?? 'y'}-${item.month}`}>
              {showYearDivider && <div className="h-px w-full bg-slate-300 my-0.5" />}
              <button
                type="button"
                data-nav-target={navTarget}
                className={`w-full rounded-r-lg flex items-center justify-between px-1 text-white font-black transition-all duration-200 relative cursor-pointer border shadow-sm ${
                  item.isCurrent
                    ? 'h-7 bg-[#0F172A] text-[11px] shadow-[0_4px_16px_rgba(0,0,0,0.25)] border-2 border-white ring-2 ring-amber-400 z-20'
                    : 'h-5.5 text-[9.5px] opacity-95 hover:opacity-100 hover:h-6 border-slate-300/80'
                }`}
                style={{
                  backgroundColor: item.isCurrent ? '#0F172A' : palette.bg,
                  color: item.isCurrent ? '#FFFFFF' : palette.text,
                }}
                title={`${item.year !== null ? `${item.year}년 ` : ''}${item.month}월 (${palette.label}) 플래너`}
              >
                {/* 수직 골드 리본 인디케이터 (노란 동그라미 대신 적용) */}
                {item.isCurrent && (
                  <span className="absolute left-0 top-0.5 bottom-0.5 w-1.2 rounded-r-full bg-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.9)]" />
                )}
                <span className="flex items-center gap-0.5 font-mono tracking-widest pl-0">
                  {palette.label}
                </span>
                {item.isToday ? (
                  <span className="text-[7.5px] px-0.5 py-0.2 rounded bg-amber-400 text-slate-900 font-black animate-pulse" title="TODAY">NOW</span>
                ) : item.isCurrent ? (
                  <span className="text-[10px] text-amber-300 font-black">▶</span>
                ) : null}
              </button>
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}
