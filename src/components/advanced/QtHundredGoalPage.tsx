'use client'

import React from 'react'
import QtQuickIndexNav from './QtQuickIndexNav'

interface QtHundredGoalPageProps {
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

export default function QtHundredGoalPage({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 768,
}: QtHundredGoalPageProps) {
  const monthNum = MONTH_MAP[monthName] || 8

  return (
    <div
      data-page-key="hundred"
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
          <span>100-DAY ROADMAP (VOL. 1)</span>
          <span className="px-2.5 py-0.5 rounded-full bg-indigo-600 text-white font-bold text-[10px] shadow-xs">
            🎯 Day 01 ~ Day 50 전반전 로드맵
          </span>
        </div>
      </div>

      {/* 2. Page Title */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-xl font-sans font-bold text-slate-800 tracking-wide whitespace-nowrap">
            🎯 {monthName} 100-Day Challenge Roadmap (Day 01 ~ 50)
          </h1>
          <p className="text-[10.5px] text-slate-500 mt-0.5 whitespace-nowrap">
            원대한 목표를 향해 100일간 매일 한 걸음씩 실행 내용을 필기하며 50일 반환점을 돌파하세요.
          </p>
        </div>

        <div className="px-3 py-1 rounded-full text-xs font-bold text-indigo-950 bg-indigo-50 border border-indigo-200 shadow-xs whitespace-nowrap">
          100일 서약 & 50일 전반전
        </div>
      </div>

      {/* 3. Goal & Reward Pledge Card */}
      <div className="border border-slate-200/90 rounded-2xl p-2 bg-slate-50/60 mb-2 shadow-2xs">
        <div className="grid grid-cols-12 gap-2 text-[9.5px]">
          <div className="col-span-6 bg-white p-1.5 rounded-xl border border-slate-200/80">
            <span className="text-[8.5px] font-bold text-indigo-800 block">📌 100일 동안 달성할 핵심 목표 (GOAL):</span>
            <div className="text-slate-800 font-bold font-sans text-[9px] min-h-[14px]">________________________________________</div>
          </div>
          <div className="col-span-3 bg-white p-1.5 rounded-xl border border-slate-200/80">
            <span className="text-[8.5px] font-bold text-emerald-800 block">🎁 완주 시 나에게 줄 보상 (REWARD):</span>
            <div className="text-slate-700 min-h-[14px]">__________________</div>
          </div>
          <div className="col-span-3 bg-white p-1.5 rounded-xl border border-slate-200/80 text-right">
            <span className="text-[8.5px] font-bold text-slate-400 block">🗓️ 챌린지 기간:</span>
            <div className="text-slate-700 font-mono text-[9px]">2026.__.__ ~ 2026.__.__</div>
          </div>
        </div>
      </div>

      {/* 4. Day 01 ~ Day 50 Matrix (5 rows x 10 cols) */}
      <div className="border border-slate-200/90 rounded-2xl p-2.5 bg-white flex-1 flex flex-col justify-between shadow-2xs mb-2">
        <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-1">
          <span className="text-[10px] font-bold text-slate-800 font-sans">
            📝 Day 01 ~ Day 50 매일 실행 기록 트래커 (Daily Micro Action)
          </span>
          <span className="text-[8.5px] text-amber-600 font-bold font-mono">★ Day 25 Milestone | ★ Day 50 Halfway</span>
        </div>

        <div className="grid grid-cols-10 gap-1 flex-1 py-0.5 text-[8px]">
          {Array.from({ length: 50 }, (_, i) => i + 1).map((d) => {
            const isMilestone = d === 25 || d === 50
            return (
              <div
                key={d}
                className={`p-1 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                  isMilestone
                    ? 'bg-amber-50 border-amber-300 ring-1 ring-amber-400/40 shadow-2xs'
                    : 'bg-slate-50/40 border-slate-200 hover:border-indigo-300'
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-0.5">
                  <span className={`font-mono font-extrabold ${isMilestone ? 'text-amber-900' : 'text-slate-600'}`}>D-{d}</span>
                  <span className="text-[7.5px] text-slate-300">□</span>
                </div>
                <div className="text-slate-400 font-sans text-[7.5px] truncate py-0.5">____</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 5. Milestones Day 25 & Day 50 Reflection Banner */}
      <div className="grid grid-cols-2 gap-2 text-[9px]">
        <div className="bg-amber-50/60 border border-amber-200 p-1.5 rounded-xl space-y-0.5">
          <span className="font-bold text-amber-900 block">🎉 Day 25 첫 번째 고지 성찰:</span>
          <div className="text-slate-700 font-sans text-[8.5px] min-h-[12px]">"초반 25일 달성! 내 삶에 일어난 가장 큰 습관 변화: ____________"</div>
        </div>
        <div className="bg-indigo-50/60 border border-indigo-200 p-1.5 rounded-xl space-y-0.5">
          <span className="font-bold text-indigo-950 block">🏆 Day 50 반환점 돌파 성찰:</span>
          <div className="text-slate-700 font-sans text-[8.5px] min-h-[12px]">"50% 완주 성공! 포기하지 않은 나 자신에게 한 줄 칭찬: ____________"</div>
        </div>
      </div>

      {/* 6. Footer */}
      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1.5 border-t border-slate-200 mt-1.5">
        <span>PREMIUM DIARY STUDIO — 100-DAY ROADMAP (VOL. 1: DAY 01~50)</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
