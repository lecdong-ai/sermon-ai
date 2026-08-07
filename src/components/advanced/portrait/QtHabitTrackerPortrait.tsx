'use client'

import React from 'react'

interface QtHabitTrackerPortraitProps {
  year?: number
  monthName?: string
  themeColor?: string
  pageWidth?: number
  pageHeight?: number
}

const DEFAULT_HABITS = [
  '💧 하루 물 2L 마시기',
  '🏃 30분 운동하기',
  '📖 독서 20페이지',
  '🧘 10분 명상하기',
  '🍏 영양제 챙겨먹기',
  '💻 포모도로 몰입',
  '😴 11시 취침 준비',
  '✍️ 감사일기 작성',
]

export default function QtHabitTrackerPortrait({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 768,
  pageHeight = 1024,
}: QtHabitTrackerPortraitProps) {
  return (
    <div
      data-page-key="habit-tracker-portrait"
      data-page-type="full-bleed"
      className="qt-page relative bg-white text-slate-800 flex flex-col justify-between overflow-hidden shadow-md mx-auto"
      style={{
        width: `${pageWidth}px`,
        height: `${pageHeight}px`,
        padding: '28px 24px',
        boxSizing: 'border-box',
        fontFamily: "'Noto Sans KR', 'Pretendard', sans-serif",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-400 pb-2 mb-3">
        <div className="flex items-center space-x-2 text-[11px] font-medium tracking-wider text-slate-400">
          <span>YEARLY</span>
          <span>{year}</span>
          <span className="px-1.5 py-0.5 rounded text-white font-bold" style={{ backgroundColor: themeColor }}>
            {monthName.toUpperCase().slice(0, 3)}
          </span>
        </div>
        <span className="px-2 py-0.5 rounded bg-emerald-500 text-white font-bold text-[10px]">30-DAY HABIT TRACKER</span>
      </div>

      {/* Title */}
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-serif font-bold text-slate-800 tracking-wide flex items-center gap-2">
          <span>🌱 {monthName} Habit & Routine</span>
        </h1>
        <div className="px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white shadow-xs" style={{ backgroundColor: themeColor }}>
          {year}년 {monthName} 습관 트래커
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-1 border border-slate-300 rounded-xl overflow-hidden bg-slate-50/30 flex flex-col mb-3">
        <div className="grid grid-cols-[140px_repeat(31,1fr)] bg-slate-100 border-b border-slate-300 text-[9px] font-bold text-slate-700 text-center py-1.5">
          <div className="text-left px-2">습관 목록</div>
          {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
            <div key={d} className="border-l border-slate-200">{d}</div>
          ))}
        </div>

        <div className="flex-1 divide-y divide-slate-200 flex flex-col justify-between">
          {DEFAULT_HABITS.map((habit, idx) => (
            <div key={idx} className="grid grid-cols-[140px_repeat(31,1fr)] items-center text-[9px] bg-white py-1.5">
              <div className="px-2 font-semibold text-slate-700 truncate">{habit}</div>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                <div key={d} className="border-l border-slate-150 h-5 flex items-center justify-center text-slate-300">
                  ·
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Notes */}
      <div className="border border-slate-300 rounded-xl p-3 bg-slate-50/50 space-y-2">
        <h4 className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: themeColor }} />
          📝 습관 총평 & 피드백 (Habit Feedback)
        </h4>
        <div className="space-y-1.5 text-[10px] text-slate-400">
          <div className="border-b border-dashed border-slate-200 pb-1">· 이달의 가장 달성률이 높았던 습관:</div>
          <div className="border-b border-dashed border-slate-200 pb-1">· 다음 달 보완 및 새로 시도해볼 루틴:</div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2 border-t border-slate-200 mt-2">
        <span>Bunker Diary · Habit Tracker (Portrait)</span>
        <span>Page Habit-01P</span>
      </div>
    </div>
  )
}
