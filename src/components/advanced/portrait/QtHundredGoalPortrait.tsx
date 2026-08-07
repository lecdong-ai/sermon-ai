'use client'

import React from 'react'

interface QtHundredGoalPortraitProps {
  year?: number
  monthName?: string
  themeColor?: string
  pageWidth?: number
  pageHeight?: number
}

export default function QtHundredGoalPortrait({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 1448,
}: QtHundredGoalPortraitProps) {
  return (
    <div
      data-page-key="hundred-goal-portrait"
      data-page-type="full-bleed"
      className="qt-page relative bg-white text-slate-800 flex flex-col justify-between overflow-hidden shadow-md mx-auto"
      style={{
        width: `${pageWidth}px`,
        height: `${pageHeight}px`,
        padding: '28px 32px',
        boxSizing: 'border-box',
        fontFamily: "'Noto Sans KR', 'Pretendard', sans-serif",
      }}
    >
      {/* 1. Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-300 pb-2 mb-2">
        <div className="flex items-center space-x-3 text-xs font-medium tracking-wider text-slate-400 font-mono">
          <span>YEARLY</span>
          <span>{year}</span>
          <span className="px-2 py-0.5 rounded text-white font-bold" style={{ backgroundColor: themeColor }}>
            {monthName.toUpperCase().slice(0, 3)}
          </span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-indigo-600 text-white font-bold text-[10.5px] shadow-2xs font-mono">
          🎯 100-DAY ROADMAP (VOL. 1)
        </span>
      </div>

      {/* 2. Page Title */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-xl font-serif font-bold text-slate-800 tracking-wide flex items-center gap-2 whitespace-nowrap">
            <span>🎯 {monthName} 100-Day Goal Challenge (Day 01 ~ 50)</span>
          </h1>
          <p className="text-[11px] text-slate-500 mt-0.5">
            하나의 목표를 향해 100일간 매일 한 걸음씩 실행하며 50일 반환점에 도달하세요.
          </p>
        </div>
        <div className="px-3 py-1 rounded-full text-[11px] font-bold text-indigo-950 bg-indigo-50 border border-indigo-200 shadow-2xs whitespace-nowrap">
          100일 서약 & 50일 전반전
        </div>
      </div>

      {/* 3. Goal Pledge Card */}
      <div className="border border-slate-200 rounded-xl p-2.5 bg-slate-50/60 shadow-2xs mb-2 space-y-1">
        <div className="grid grid-cols-12 gap-2 text-[10.5px]">
          <div className="col-span-6 bg-white p-2 rounded-lg border border-slate-200/80">
            <span className="text-[9.5px] font-bold text-indigo-800 block">📌 100일 목표 (GOAL):</span>
            <div className="text-slate-800 font-bold font-serif text-[11px] min-h-[14px]">____________________________</div>
          </div>
          <div className="col-span-3 bg-white p-2 rounded-lg border border-slate-200/80">
            <span className="text-[9.5px] font-bold text-emerald-800 block">🎁 완주 시 보상:</span>
            <div className="text-slate-700 min-h-[14px] text-[10px]">________________</div>
          </div>
          <div className="col-span-3 bg-white p-2 rounded-lg border border-slate-200/80 text-right">
            <span className="text-[9.5px] font-bold text-slate-400 block">🗓️ 챌린지 기간:</span>
            <div className="text-slate-700 font-mono text-[10px]">2026.__.__ ~ __.__</div>
          </div>
        </div>
      </div>

      {/* 4. Day 01 ~ Day 50 Matrix (10 Cols x 5 Rows) */}
      <div className="border border-slate-200 rounded-xl p-2.5 bg-white flex-1 flex flex-col justify-between shadow-2xs mb-2">
        <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-1.5">
          <span className="text-[11px] font-bold text-slate-800 font-serif">
            📝 Day 01 ~ Day 50 매일 실행 기록 트래커 (Daily Micro Action)
          </span>
          <span className="text-[9.5px] text-amber-600 font-bold font-mono">★ Day 25 Milestone | ★ Day 50 Halfway</span>
        </div>

        <div className="grid grid-cols-10 gap-1.5 flex-1 text-[10px]">
          {Array.from({ length: 50 }, (_, i) => i + 1).map((d) => {
            const isMilestone = d === 25 || d === 50
            return (
              <div
                key={d}
                className={`p-1.5 rounded-lg border flex flex-col justify-between cursor-pointer transition-all ${
                  isMilestone
                    ? 'bg-amber-50 border-amber-300 ring-1 ring-amber-400/40 shadow-2xs'
                    : 'bg-slate-50/40 border-slate-200 hover:border-indigo-300'
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-0.5">
                  <span className={`font-mono font-extrabold text-[9.5px] ${isMilestone ? 'text-amber-900' : 'text-slate-600'}`}>D-{d}</span>
                  <span className="text-[9px] text-slate-300">□</span>
                </div>
                <div className="text-slate-400 font-serif text-[9px] truncate py-0.5 text-center">______</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 5. Milestones Banner */}
      <div className="grid grid-cols-2 gap-2 text-[10.5px] mb-1.5">
        <div className="bg-amber-50/60 border border-amber-200 p-2 rounded-lg space-y-0.5">
          <span className="font-bold text-amber-900 block text-[10px]">🎉 Day 25 첫 번째 고지 성찰:</span>
          <div className="text-slate-700 font-serif text-[10px] min-h-[14px]">"첫 25일 달성! 내 삶에 일어난 변화: ________"</div>
        </div>
        <div className="bg-indigo-50/60 border border-indigo-200 p-2 rounded-lg space-y-0.5">
          <span className="font-bold text-indigo-950 block text-[10px]">🏆 Day 50 반환점 돌파 성찰:</span>
          <div className="text-slate-700 font-serif text-[10px] min-h-[14px]">"50% 완주 성공! 포기하지 않은 나에게 한 줄 칭찬: ________"</div>
        </div>
      </div>

      {/* 6. Footer */}
      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1.5 border-t border-slate-200">
        <span>PREMIUM DIARY STUDIO — 100-DAY ROADMAP (DAY 01~50)</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
