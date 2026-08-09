'use client'

import React from 'react'
import QtQuickIndexNav from './QtQuickIndexNav'

interface QtHabitTrackerPage2Props {
  year?: number
  monthName?: string
  themeColor?: string
  pageWidth?: number
  pageHeight?: number
}

const MONTH_MAP: Record<string, number> = {
  January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
  July: 7, August: 8, September: 9, October: 10, November: 11, December: 12,
}

export default function QtHabitTrackerPage2({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 768,
}: QtHabitTrackerPage2Props) {
  const monthNum = MONTH_MAP[monthName] || 8

  return (
    <div
      data-page-key="habit"
      data-page-type="full-bleed"
      className="qt-page relative bg-white text-slate-800 flex flex-col justify-between overflow-hidden shadow-md mx-auto"
      style={{
        width: `${pageWidth}px`,
        height: `${pageHeight}px`,
        padding: '20px 58px 20px 24px',
        boxSizing: 'border-box',
        fontFamily: "'Noto Sans KR', 'Pretendard', sans-serif",
      }}
    >
      <QtQuickIndexNav currentMonth={monthNum} activeTab="tracker" themeColor={themeColor} />
      {/* 1. Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-300 pb-2 mb-2">
        <div className="flex items-center space-x-3 text-[11px] font-medium tracking-wider text-slate-400 font-mono">
          <span>YEARLY</span>
          <span>{year}</span>
          <span className="px-2 py-0.5 rounded text-white font-bold" style={{ backgroundColor: themeColor }}>
            {monthName.toUpperCase().slice(0, 3)}
          </span>
        </div>

        <div className="flex items-center space-x-3 text-[11px] font-medium text-slate-400">
          <span>WEEKLY HABIT REVIEW & STREAK (VOL. 2)</span>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[10px] shadow-xs">
            🔥 4주차 습관 회고 & 스트릭 (VOL. 2)
          </span>
        </div>
      </div>

      {/* 2. Page Title */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-xl font-sans font-bold text-slate-800 tracking-wide whitespace-nowrap">
            🔥 {monthName} Weekly Habit Review & Streak Master
          </h1>
          <p className="text-[10.5px] text-slate-500 mt-0.5 whitespace-nowrap">
            주차별 습관 달성 성과를 복기하고, 방해 요소를 제거하여 습관 유지력을 100% 극대화합니다.
          </p>
        </div>

        <div className="px-3 py-1 rounded-full text-xs font-bold text-emerald-950 bg-emerald-50 border border-emerald-200 shadow-xs whitespace-nowrap">
          습관 유지력 & 주간 피드백
        </div>
      </div>

      {/* 3. 4-Week Habit Review Grid (2x2 Grid) */}
      <div className="grid grid-cols-2 gap-3 flex-1 mb-2">
        {[
          { week: '1주차 습관 피드백 (01일~07일)', label: 'Week 1 Habit', color: 'border-emerald-300 bg-emerald-50/20' },
          { week: '2주차 습관 피드백 (08일~14일)', label: 'Week 2 Habit', color: 'border-indigo-300 bg-indigo-50/20' },
          { week: '3주차 습관 피드백 (15일~21일)', label: 'Week 3 Habit', color: 'border-amber-300 bg-amber-50/20' },
          { week: '4주차 습관 피드백 (22일~31일)', label: 'Week 4 Habit', color: 'border-purple-300 bg-purple-50/20' },
        ].map((w, idx) => (
          <div
            key={idx}
            className={`border rounded-2xl p-2.5 ${w.color} flex flex-col justify-between shadow-2xs space-y-1`}
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-1 text-[9.5px]">
              <span className="font-bold text-slate-800 font-sans">📅 {w.week}</span>
              <span className="font-mono text-[8.5px] text-slate-400 font-bold">{w.label}</span>
            </div>

            <div className="space-y-1 text-[8.5px] flex-1 flex flex-col justify-around">
              <div className="bg-white/90 p-1.5 rounded-xl border border-slate-200/80">
                <span className="font-bold text-emerald-800 block text-[8px]">🎉 이번 주 가장 완벽했던 습관:</span>
                <div className="text-slate-400 font-sans text-[8.5px] min-h-[12px]">________________________________</div>
              </div>
              <div className="bg-white/90 p-1.5 rounded-xl border border-slate-200/80">
                <span className="font-bold text-rose-800 block text-[8px]">🚧 습관 방해 요소 & 해결책:</span>
                <div className="text-slate-400 font-sans text-[8.5px] min-h-[12px]">________________________________</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 4. Monthly Habit Champion & Streak Hall of Fame */}
      <div className="border border-emerald-200/90 rounded-2xl p-2.5 bg-gradient-to-r from-emerald-500/10 via-indigo-500/10 to-amber-500/10 shadow-2xs space-y-1">
        <div className="flex items-center justify-between text-[10px] font-bold text-emerald-950">
          <span>🏆 이달의 습관 챔피언 (Monthly Habit Champion) & 셀프 보상</span>
          <span className="text-emerald-700 font-mono">Streak Award</span>
        </div>
        <div className="grid grid-cols-12 gap-2 text-[9px] pt-0.5">
          <div className="col-span-7 bg-white/90 p-1.5 rounded-xl border border-emerald-200">
            <span className="text-[8px] font-bold text-emerald-800 block">👑 이달의 1등 습관 & 소감:</span>
            <div className="text-slate-700 font-sans text-[8.5px] min-h-[14px]">______________________________________________________</div>
          </div>
          <div className="col-span-5 bg-white/90 p-1.5 rounded-xl border border-indigo-200">
            <span className="text-[8px] font-bold text-indigo-800 block">🎁 습관 성취 나만의 셀프 선물:</span>
            <div className="text-slate-700 font-sans text-[8.5px] min-h-[14px]">__________________________________</div>
          </div>
        </div>
      </div>

      {/* 5. Footer */}
      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1.5 border-t border-slate-200 mt-1.5">
        <span>PREMIUM DIARY STUDIO — WEEKLY HABIT REVIEW & STREAK (VOL. 2)</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
