'use client'

import React from 'react'
import QtQuickIndexNav from './QtQuickIndexNav'

interface QtHabitTrackerPageProps {
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

const HABIT_CATEGORIES = [
  {
    category: '🌅 MORNING RITUAL (아침 리추얼)',
    color: 'bg-amber-500/10 border-amber-300 text-amber-900',
    habits: ['💧 하루 시작 물 한 잔 & 10분 스트레칭', '☀️ 5분 확언 & 오늘 하루 감사 묵상'],
  },
  {
    category: '💻 FOCUS & OUTPUT (몰입 & 성과)',
    color: 'bg-indigo-500/10 border-indigo-300 text-indigo-900',
    habits: ['🎯 하루 2시간 최우선 몰입 작업 (Deep Work)', '📖 책 20페이지 읽기 또는 좋은 글 필사'],
  },
  {
    category: '🥗 WELLNESS & HEALTH (건강 & 웰니스)',
    color: 'bg-emerald-500/10 border-emerald-300 text-emerald-900',
    habits: ['🏃 30분 유산소/수영/만보 걷기', '🍏 영양제 챙겨먹기 & 건강식 섭취'],
  },
  {
    category: '🌙 EVENING UNPLUG (저녁 리셋)',
    color: 'bg-purple-500/10 border-purple-300 text-purple-900',
    habits: ['✍️ 하루 성찰 & 3가지 감사 일기 작성', '🕯️ 11시 전 스마트폰 OFF & 딥슬립 취침'],
  },
]

export default function QtHabitTrackerPage({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 768,
}: QtHabitTrackerPageProps) {
  const monthNum = MONTH_MAP[monthName] || 8

  return (
    <div
      data-page-key="habit"
      data-page-type="full-bleed"
      className="qt-page relative bg-white text-slate-800 flex flex-col justify-between overflow-hidden shadow-md mx-auto"
      style={{
        width: `${pageWidth}px`,
        height: `${pageHeight}px`,
        padding: '20px 48px 20px 24px',
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
          <span>30-DAY HABIT MASTER</span>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[10px] shadow-xs">
            🌱 30일 습관 & 루틴 성취 매트릭스
          </span>
        </div>
      </div>

      {/* 2. Page Title */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-xl font-serif font-bold text-slate-800 tracking-wide flex items-center gap-2 whitespace-nowrap">
            <span>🌱 {monthName} 30-Day Habit & Routine Master</span>
          </h1>
          <p className="text-[10.5px] text-slate-500 mt-0.5 whitespace-nowrap">
            아침, 몰입, 건강, 저녁 4대 영역별 습관을 31일간 체크하며 나만의 일상 시스템을 완성하세요.
          </p>
        </div>

        <div className="px-3 py-1 rounded-full text-xs font-bold text-emerald-950 bg-emerald-50 border border-emerald-200 shadow-xs whitespace-nowrap">
          습관 성취 스트릭 마스터
        </div>
      </div>

      {/* 3. Habit Grid Table (4 Categories x 2 Habits = 8 Habits Grid) */}
      <div className="border border-slate-300 rounded-2xl overflow-hidden bg-white flex-1 flex flex-col justify-between shadow-2xs mb-2">
        {/* Table Header */}
        <div className="grid grid-cols-[200px_repeat(31,1fr)_55px] bg-slate-100 border-b border-slate-300 text-[9.5px] font-bold text-slate-700 text-center py-1.5">
          <div className="text-left px-3 font-serif">🌱 카테고리 / 습관 목표</div>
          {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
            <div key={d} className="border-l border-slate-200/80 font-mono text-[8.5px]">{d}</div>
          ))}
          <div className="border-l border-slate-300 font-mono">달성률</div>
        </div>

        {/* Table Rows */}
        <div className="flex-1 divide-y divide-slate-200 flex flex-col justify-between">
          {HABIT_CATEGORIES.map((cat, cIdx) => (
            <React.Fragment key={cIdx}>
              {/* Category Header Row */}
              <div className={`px-3 py-0.5 text-[8.5px] font-bold border-b border-slate-200 font-mono flex items-center justify-between ${cat.color}`}>
                <span>{cat.category}</span>
                <span className="opacity-70">Category #{cIdx + 1}</span>
              </div>

              {/* Habit Rows */}
              {cat.habits.map((habit, hIdx) => (
                <div key={hIdx} className="grid grid-cols-[200px_repeat(31,1fr)_55px] items-center text-[9px] bg-white hover:bg-slate-50/80 transition-colors py-1">
                  <div className="px-3 font-semibold text-slate-700 truncate">{habit}</div>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                    <div key={d} className="border-l border-slate-150 h-5 flex items-center justify-center text-slate-300 hover:text-emerald-600 cursor-pointer">
                      ·
                    </div>
                  ))}
                  <div className="border-l border-slate-300 font-bold text-slate-600 text-center font-mono text-[8.5px]">
                    __/31
                  </div>
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* 4. Habit Scorecard & Reward Banner */}
      <div className="grid grid-cols-12 gap-2 text-[9px]">
        <div className="col-span-8 bg-emerald-50/60 border border-emerald-200 p-2 rounded-xl flex items-center justify-around font-mono font-bold text-[9px]">
          <div className="text-center">
            <span className="text-[7.5px] text-slate-400 block font-sans">총 달성 횟수</span>
            <span className="text-emerald-800 text-xs">___ / 248회</span>
          </div>
          <div className="text-center border-l border-emerald-200 pl-3">
            <span className="text-[7.5px] text-slate-400 block font-sans">월간 달성률</span>
            <span className="text-indigo-800 text-xs">___%</span>
          </div>
          <div className="text-center border-l border-emerald-200 pl-3">
            <span className="text-[7.5px] text-slate-400 block font-sans">최장 연속 불꽃 (Streak)</span>
            <span className="text-amber-800 text-xs">🔥 __일 연속</span>
          </div>
        </div>
        <div className="col-span-4 bg-white border border-slate-200 p-2 rounded-xl space-y-0.5">
          <span className="text-[8px] font-bold text-slate-600 block">🏆 습관 80% 달성 시 스스로에게 줄 보상:</span>
          <div className="text-slate-800 font-serif text-[8.5px] min-h-[14px]">____________________________________</div>
        </div>
      </div>

      {/* 5. Footer */}
      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1.5 border-t border-slate-200 mt-1.5">
        <span>PREMIUM DIARY STUDIO — 30-DAY HABIT & ROUTINE MASTER</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
