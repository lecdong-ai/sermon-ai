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
        padding: '36px 44px',
        boxSizing: 'border-box',
        fontFamily: "'Noto Sans KR', 'Pretendard', sans-serif",
      }}
    >
      {/* 1. Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-300 pb-3 mb-4">
        <div className="flex items-center space-x-4 text-xs font-medium tracking-wider text-slate-400 font-mono">
          <span>YEARLY</span>
          <span>{year}</span>
          <span className="px-2.5 py-0.5 rounded text-white font-bold" style={{ backgroundColor: themeColor }}>
            {monthName.toUpperCase().slice(0, 3)}
          </span>
        </div>
        <span className="px-3 py-1 rounded-full bg-indigo-600 text-white font-bold text-xs shadow-xs">
          🎯 100-DAY GOAL ROADMAP
        </span>
      </div>

      {/* 2. Page Title */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-800 tracking-wide flex items-center gap-2">
            <span>🎯 100-Day Goal Challenge Roadmap</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            원대한 단일 목표를 향해 100일간 매일 도장을 찍어 완주하는 성취 챌린지 맵입니다.
          </p>
        </div>
        <div className="px-4 py-1.5 rounded-full text-xs font-bold text-indigo-950 bg-indigo-50 border border-indigo-200 shadow-xs">
          100일 완주 프로젝트 맵
        </div>
      </div>

      {/* 3. Goal & Reward Cards */}
      <div className="border border-slate-200/90 rounded-2xl p-4 bg-slate-50/50 mb-4 shadow-xs">
        <div className="grid grid-cols-12 gap-3 text-xs">
          <div className="col-span-7 bg-white p-3 rounded-xl border border-slate-200/80">
            <span className="text-[10px] font-bold text-indigo-800 block">📌 100일 동안 완주할 목표 (GOAL):</span>
            <div className="text-slate-700 font-serif min-h-[20px]">__________________________________________</div>
          </div>
          <div className="col-span-5 bg-white p-3 rounded-xl border border-slate-200/80">
            <span className="text-[10px] font-bold text-emerald-700 block">🎁 완주 축하 선물 (REWARD):</span>
            <div className="text-slate-700 min-h-[20px]">______________________</div>
          </div>
        </div>
      </div>

      {/* 4. 100 Stamps Matrix Grid (10x10) */}
      <div className="border border-slate-200/90 rounded-2xl p-4 bg-white flex-1 flex flex-col justify-between shadow-xs mb-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2">
          <span className="text-xs font-bold text-slate-700">🏆 100일 스탬프 매트릭스 (Stamps Matrix)</span>
          <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
            <span className="text-amber-600">★ Day 25</span>
            <span className="text-blue-600">★ Day 50</span>
            <span className="text-purple-600">★ Day 75</span>
            <span className="text-rose-600">🎉 Day 100</span>
          </div>
        </div>

        <div className="grid grid-cols-10 gap-2 flex-1 py-1">
          {Array.from({ length: 100 }, (_, i) => i + 1).map((d) => {
            const isMilestone = d === 25 || d === 50 || d === 75 || d === 100
            return (
              <div
                key={d}
                className={`aspect-square rounded-xl border flex flex-col items-center justify-center text-xs font-extrabold cursor-pointer transition-all ${
                  isMilestone
                    ? 'bg-amber-50 border-amber-300 text-amber-900 ring-1 ring-amber-400/40 shadow-xs'
                    : 'bg-slate-50/40 border-slate-200 text-slate-400 hover:border-indigo-400 hover:text-indigo-700'
                }`}
              >
                <span>{d}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* 5. Milestone Review Checkpoints */}
      <div className="grid grid-cols-4 gap-3 text-xs mb-4">
        <div className="bg-amber-50/60 p-2.5 rounded-xl border border-amber-200 text-center">
          <span className="font-bold text-amber-900 block">Day 25 소감</span>
          <span className="text-slate-400 text-[10px]">_______</span>
        </div>
        <div className="bg-blue-50/60 p-2.5 rounded-xl border border-blue-200 text-center">
          <span className="font-bold text-blue-900 block">Day 50 반환점</span>
          <span className="text-slate-400 text-[10px]">_______</span>
        </div>
        <div className="bg-purple-50/60 p-2.5 rounded-xl border border-purple-200 text-center">
          <span className="font-bold text-purple-900 block">Day 75 고지전</span>
          <span className="text-slate-400 text-[10px]">_______</span>
        </div>
        <div className="bg-rose-50/60 p-2.5 rounded-xl border border-rose-200 text-center">
          <span className="font-bold text-rose-900 block">Day 100 완주!</span>
          <span className="text-slate-400 text-[10px]">🎉 SUCCESS</span>
        </div>
      </div>

      {/* 6. Footer */}
      <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-300 mt-3">
        <span>PREMIUM DIARY STUDIO — 100-DAY GOAL ROADMAP</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
