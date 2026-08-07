'use client'

import React from 'react'

interface QtHundredGoalPageProps {
  year?: number
  monthName?: string
  themeColor?: string
  pageWidth?: number
  pageHeight?: number
}

export default function QtHundredGoalPage({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 768,
}: QtHundredGoalPageProps) {
  return (
    <div
      data-page-key="hundred-goal"
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
      <div className="flex items-center justify-between border-b border-slate-300 pb-2 mb-2.5">
        <div className="flex items-center space-x-3 text-[11px] font-medium tracking-wider text-slate-400 font-mono">
          <span>YEARLY</span>
          <span>{year}</span>
          <span className="px-2 py-0.5 rounded text-white font-bold" style={{ backgroundColor: themeColor }}>
            {monthName.toUpperCase().slice(0, 3)}
          </span>
        </div>

        <div className="flex items-center space-x-3 text-[11px] font-medium text-slate-400">
          <span>PROJECT CHALLENGE</span>
          <span className="px-2.5 py-0.5 rounded-full bg-indigo-600 text-white font-bold text-[10px] shadow-xs">
            🎯 100-DAY GOAL ROADMAP
          </span>
        </div>
      </div>

      {/* 2. Title & Goal Banner */}
      <div className="flex items-center justify-between mb-2.5">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-800 tracking-wide flex items-center gap-2">
            <span>🎯 100-Day Goal Challenge Roadmap</span>
          </h1>
          <p className="text-[11px] text-slate-500 mt-0.5">
            하나의 원대한 목표를 향해 100일간 매일 한 걸음씩 도장을 찍으며 도전해보세요.
          </p>
        </div>
        <div className="px-3 py-1 rounded-full text-xs font-bold text-indigo-950 bg-indigo-50 border border-indigo-200 shadow-xs">
          100일 완주 프로젝트 맵
        </div>
      </div>

      {/* 3. Goal Header Metadata Card */}
      <div className="border border-slate-200/90 rounded-2xl p-2.5 bg-slate-50/50 mb-2.5 shadow-2xs">
        <div className="grid grid-cols-12 gap-2 text-[10px]">
          <div className="col-span-6 bg-white p-2 rounded-xl border border-slate-200/80">
            <span className="text-[8.5px] font-bold text-indigo-800 block">📌 100일 동안 달성할 핵심 목표 (GOAL):</span>
            <div className="text-slate-700 font-serif min-h-[16px]">________________________________________________</div>
          </div>
          <div className="col-span-3 bg-white p-2 rounded-xl border border-slate-200/80">
            <span className="text-[8.5px] font-bold text-emerald-700 block">🎁 완주 시 나에게 줄 보상 (REWARD):</span>
            <div className="text-slate-700 min-h-[16px]">______________________</div>
          </div>
          <div className="col-span-3 bg-white p-2 rounded-xl border border-slate-200/80 text-right">
            <span className="text-[8.5px] font-bold text-slate-400 block">🗓️ 챌린지 기간:</span>
            <div className="text-slate-700 font-mono text-[9.5px]">2026.__.__ ~ 2026.__.__</div>
          </div>
        </div>
      </div>

      {/* 4. 100 Stamps Grid (10x10 Matrix) */}
      <div className="border border-slate-200/90 rounded-2xl p-3 bg-white flex-1 flex flex-col justify-between shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-1.5">
          <span className="text-[10.5px] font-bold text-slate-700">🏆 100일 도장 챌린지 그리드 (Stamps Matrix)</span>
          <div className="flex items-center gap-3 text-[9px] font-bold text-slate-500">
            <span className="text-amber-600">★ Day 25</span>
            <span className="text-blue-600">★ Day 50</span>
            <span className="text-purple-600">★ Day 75</span>
            <span className="text-rose-600">🎉 Day 100</span>
          </div>
        </div>

        <div className="grid grid-cols-10 gap-1.5 flex-1 py-0.5">
          {Array.from({ length: 100 }, (_, i) => i + 1).map((d) => {
            const isMilestone = d === 25 || d === 50 || d === 75 || d === 100
            return (
              <div
                key={d}
                className={`aspect-square rounded-xl border flex flex-col items-center justify-center text-[9px] font-extrabold cursor-pointer transition-all ${
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

      {/* 5. Footer */}
      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1.5 border-t border-slate-200 mt-1.5">
        <span>PREMIUM DIARY STUDIO — 100-DAY GOAL ROADMAP</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
