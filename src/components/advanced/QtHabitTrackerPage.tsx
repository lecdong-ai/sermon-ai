'use client'

import React from 'react'

interface QtHabitTrackerPageProps {
  year?: number
  monthName?: string
  themeColor?: string
  pageWidth?: number
  pageHeight?: number
}

const DEFAULT_HABITS = [
  '💧 하루 물 2L 마시기',
  '🏃 30분 수영 / 유산소 운동',
  '📖 책 20페이지 읽기',
  '🧘 10분 명상 & 스케줄 정리',
  '🍏 영양제 & 과일 챙겨먹기',
  '💻 몰입 포모도로 4세트',
  '😴 11시 이전 취침 준비',
  '✍️ 하루 감사 일기 작성',
]

export default function QtHabitTrackerPage({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 768,
}: QtHabitTrackerPageProps) {
  return (
    <div
      data-page-key="habit-tracker"
      data-page-type="full-bleed"
      className="qt-page relative bg-white text-slate-800 flex flex-col justify-between overflow-hidden shadow-md mx-auto"
      style={{
        width: `${pageWidth}px`,
        height: `${pageHeight}px`,
        padding: '24px 32px',
        boxSizing: 'border-box',
        fontFamily: "'Noto Sans KR', 'Pretendard', sans-serif",
      }}
    >
      {/* 1. Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-400 pb-2 mb-3">
        <div className="flex items-center space-x-3 text-[11px] font-medium tracking-wider text-slate-400">
          <span className="cursor-pointer hover:text-slate-600">YEARLY</span>
          <span>{year}</span>
          <span className="px-1.5 py-0.5 rounded text-white font-bold cursor-pointer" style={{ backgroundColor: themeColor }}>
            {monthName.toUpperCase().slice(0, 3)}
          </span>
        </div>

        <div className="flex items-center space-x-3 text-[11px] font-medium text-slate-400">
          <span className="hover:text-slate-600 cursor-pointer">MONTHLY</span>
          <span className="hover:text-slate-600 cursor-pointer">HABIT</span>
          <span className="px-2 py-0.5 rounded bg-emerald-500 text-white font-bold shadow-xs">30-DAY HABIT TRACKER</span>
        </div>
      </div>

      {/* 2. Page Title */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-800 tracking-wide flex items-center gap-2 whitespace-nowrap">
            <span>🌱 {monthName} Habit & Routine Tracker</span>
          </h1>
        </div>
        <div className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-xs whitespace-nowrap" style={{ backgroundColor: themeColor }}>
          {year}년 {monthName} 30일 습관 성취 매트릭스
        </div>
      </div>

      {/* 3. Habit Grid Table */}
      <div className="flex-1 flex flex-col justify-between space-y-3">
        <div className="border border-slate-300 rounded-xl overflow-hidden bg-slate-50/30 flex-1 flex flex-col">
          <div className="grid grid-cols-[180px_repeat(31,1fr)_50px] bg-slate-100 border-b border-slate-300 text-[10px] font-bold text-slate-700 text-center py-1.5">
            <div className="text-left px-3">습관 / 루틴 목표</div>
            {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
              <div key={d} className="border-l border-slate-200">{d}</div>
            ))}
            <div className="border-l border-slate-300">달성</div>
          </div>

          <div className="flex-1 divide-y divide-slate-200 overflow-hidden flex flex-col justify-around">
            {DEFAULT_HABITS.map((habit, idx) => (
              <div key={idx} className="grid grid-cols-[180px_repeat(31,1fr)_50px] items-center text-[10px] bg-white hover:bg-slate-50/80 transition-colors py-1">
                <div className="px-3 font-semibold text-slate-700 truncate">{habit}</div>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <div key={d} className="border-l border-slate-150 h-5 flex items-center justify-center text-slate-300 hover:text-emerald-500 cursor-pointer">
                    ·
                  </div>
                ))}
                <div className="border-l border-slate-300 font-bold text-slate-600 text-center">
                  /31
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Bottom Reflection & Mood Meter */}
        <div className="grid grid-cols-12 gap-3 h-24">
          <div className="col-span-8 border border-slate-300 rounded-xl p-2.5 bg-slate-50/50 flex flex-col justify-between">
            <h4 className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: themeColor }} />
              📝 이달의 습관 성찰 & 피드백 (Habit Review)
            </h4>
            <div className="space-y-1 text-[11px] text-slate-400 flex-1 mt-1">
              <div className="border-b border-dashed border-slate-200 pb-1">· 가장 꾸준히 지킨 최고의 습관:</div>
              <div className="border-b border-dashed border-slate-200 pb-1">· 다음 달 보완이 필요한 개선점:</div>
            </div>
          </div>

          <div className="col-span-4 border border-slate-300 rounded-xl p-2.5 bg-slate-50/50 flex flex-col justify-between">
            <h4 className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: themeColor }} />
              🔥 성취 만족도 스코어
            </h4>
            <div className="flex items-center justify-around flex-1 my-1">
              {['⭐ 20%', '⭐ 40%', '⭐ 60%', '⭐ 80%', '🏆 100%'].map((score, sIdx) => (
                <div key={sIdx} className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-1.5 py-1 rounded-md">
                  {score}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2 border-t border-slate-200 mt-2">
        <span>Bunker Diary Collection · Habit Tracker</span>
        <span>Page Habit-01</span>
      </div>
    </div>
  )
}
