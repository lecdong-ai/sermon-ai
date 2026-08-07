'use client'

import React from 'react'

interface QtHabitTrackerPortrait2Props {
  year?: number
  monthName?: string
  themeColor?: string
  pageWidth?: number
  pageHeight?: number
}

export default function QtHabitTrackerPortrait2({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 1448,
}: QtHabitTrackerPortrait2Props) {
  return (
    <div
      data-page-key="habit-tracker-2-portrait"
      data-page-type="full-bleed"
      className="qt-page relative bg-white text-slate-800 flex flex-col justify-between overflow-hidden shadow-md mx-auto"
      style={{
        width: `${pageWidth}px`,
        height: `${pageHeight}px`,
        padding: '36px 44px',
        boxSizing: 'border-box',
        fontFamily: "'Noto Sans KR', 'Pretendard', sans-serif",
      }}
    >
      {/* 1. Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-300 pb-3 mb-3">
        <div className="flex items-center space-x-4 text-xs font-medium tracking-wider text-slate-400 font-mono">
          <span>YEARLY</span>
          <span>{year}</span>
          <span className="px-2.5 py-0.5 rounded text-white font-bold" style={{ backgroundColor: themeColor }}>
            {monthName.toUpperCase().slice(0, 3)}
          </span>
        </div>
        <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-bold text-xs shadow-xs">
          🔥 WEEKLY HABIT REVIEW & STREAK
        </span>
      </div>

      {/* 2. Page Title */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-800 tracking-wide flex items-center gap-2">
            <span>🔥 {monthName} Weekly Habit Review & Streak</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            주차별 습관 달성 성과를 복기하고, 방해 요소를 제거하여 습관 유지력을 100% 극대화합니다.
          </p>
        </div>
        <div className="px-4 py-1.5 rounded-full text-xs font-bold text-emerald-950 bg-emerald-50 border border-emerald-200 shadow-xs">
          습관 유지력 & 주간 피드백
        </div>
      </div>

      {/* 3. 4-Week Habit Review Stack */}
      <div className="space-y-3.5 flex-1 flex flex-col justify-between mb-3">
        {[
          { week: '1주차 습관 피드백 (01일~07일)', label: 'Week 1 Habit', color: 'border-emerald-300 bg-emerald-50/20' },
          { week: '2주차 습관 피드백 (08일~14일)', label: 'Week 2 Habit', color: 'border-indigo-300 bg-indigo-50/20' },
          { week: '3주차 습관 피드백 (15일~21일)', label: 'Week 3 Habit', color: 'border-amber-300 bg-amber-50/20' },
          { week: '4주차 습관 피드백 (22일~31일)', label: 'Week 4 Habit', color: 'border-purple-300 bg-purple-50/20' },
        ].map((w, idx) => (
          <div
            key={idx}
            className={`border rounded-2xl p-3.5 ${w.color} flex flex-col justify-between shadow-xs space-y-2 flex-1`}
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-1 text-xs">
              <span className="font-bold text-slate-800 font-serif">📅 {w.week}</span>
              <span className="font-mono text-xs text-slate-400 font-bold">{w.label}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs flex-1">
              <div className="bg-white/90 p-2 rounded-xl border border-slate-200/80 flex flex-col justify-between">
                <span className="font-bold text-emerald-800 block text-[10px]">🎉 이번 주 가장 성공적인 습관:</span>
                <div className="text-slate-400 font-serif text-xs min-h-[16px]">____________________</div>
              </div>
              <div className="bg-white/90 p-2 rounded-xl border border-slate-200/80 flex flex-col justify-between">
                <span className="font-bold text-rose-800 block text-[10px]">🚧 방해 요소 & 해결책:</span>
                <div className="text-slate-400 font-serif text-xs min-h-[16px]">____________________</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 4. Monthly Champion Banner */}
      <div className="border border-emerald-200/90 rounded-2xl p-3 bg-gradient-to-r from-emerald-500/10 via-indigo-500/10 to-amber-500/10 shadow-xs mb-2 space-y-1.5">
        <div className="flex items-center justify-between text-xs font-bold text-emerald-950">
          <span>🏆 이달의 습관 챔피언 & 셀프 보상</span>
          <span className="text-emerald-700 font-mono">Streak Award</span>
        </div>
        <div className="grid grid-cols-12 gap-2 text-xs">
          <div className="col-span-7 bg-white/90 p-2 rounded-xl border border-emerald-200">
            <span className="text-[10px] font-bold text-emerald-800 block">👑 이달의 1등 습관 & 소감:</span>
            <div className="text-slate-700 font-serif text-xs min-h-[16px]">________________________________</div>
          </div>
          <div className="col-span-5 bg-white/90 p-2 rounded-xl border border-indigo-200">
            <span className="text-[10px] font-bold text-indigo-800 block">🎁 셀프 선물:</span>
            <div className="text-slate-700 font-serif text-xs min-h-[16px]">__________________</div>
          </div>
        </div>
      </div>

      {/* 5. Footer */}
      <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-300">
        <span>PREMIUM DIARY STUDIO — WEEKLY HABIT REVIEW & STREAK (VOL. 2)</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
