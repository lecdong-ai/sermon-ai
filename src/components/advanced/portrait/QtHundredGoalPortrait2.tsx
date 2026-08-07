'use client'

import React from 'react'

interface QtHundredGoalPortrait2Props {
  year?: number
  monthName?: string
  themeColor?: string
  pageWidth?: number
  pageHeight?: number
}

export default function QtHundredGoalPortrait2({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 1448,
}: QtHundredGoalPortrait2Props) {
  return (
    <div
      data-page-key="hundred-goal-2-portrait"
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
        <span className="px-3 py-1 rounded-full bg-rose-600 text-white font-bold text-xs shadow-xs">
          🏆 VICTORY HALL OF FAME (VOL. 2)
        </span>
      </div>

      {/* 2. Page Title */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-xl font-serif font-bold text-slate-800 tracking-wide flex items-center gap-2 whitespace-nowrap">
            <span>🏆 {monthName} 100-Day Challenge Victory (Day 51 ~ 100)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            51일부터 100일까지 최종 완주를 향해 나아가며 나만의 완주 훈장과 소감 노트를 완성하세요.
          </p>
        </div>
        <div className="px-4 py-1.5 rounded-full text-xs font-bold text-rose-950 bg-rose-50 border border-rose-200 shadow-xs">
          100일 완주 영예의 전당
        </div>
      </div>

      {/* 3. Day 51 ~ Day 100 Matrix */}
      <div className="border border-slate-200/90 rounded-2xl p-4 bg-white flex-1 flex flex-col justify-between shadow-xs mb-3">
        <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-2">
          <span className="text-xs font-bold text-slate-800 font-serif">
            📝 Day 51 ~ Day 100 후반전 매일 실행 기록 트래커
          </span>
          <span className="text-xs text-rose-600 font-bold font-mono">★ Day 75 Focus | 🎉 Day 100 Victory</span>
        </div>

        <div className="grid grid-cols-5 gap-2 flex-1 text-xs">
          {Array.from({ length: 50 }, (_, i) => i + 51).map((d) => {
            const isMilestone = d === 75 || d === 100
            return (
              <div
                key={d}
                className={`p-2 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                  isMilestone
                    ? 'bg-rose-50 border-rose-300 ring-1 ring-rose-400/40 shadow-xs'
                    : 'bg-slate-50/40 border-slate-200 hover:border-rose-300'
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-1">
                  <span className={`font-mono font-extrabold text-xs ${isMilestone ? 'text-rose-900' : 'text-slate-600'}`}>D-{d}</span>
                  <span className="text-xs text-slate-300">□</span>
                </div>
                <div className="text-slate-400 font-serif text-[10px] truncate py-1">______</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 4. Milestones & Victory Hall of Fame Banner */}
      <div className="grid grid-cols-12 gap-3 text-xs mb-2">
        <div className="col-span-5 bg-purple-50/60 border border-purple-200 p-3 rounded-xl space-y-1">
          <span className="font-bold text-purple-900 block">🚀 Day 75 고지전 점검:</span>
          <div className="text-slate-700 font-serif text-xs min-h-[18px]">"75% 달성 완료! 마지막 몰입 다짐: ____"</div>
        </div>
        <div className="col-span-7 bg-gradient-to-r from-rose-500/10 to-amber-500/10 border border-rose-200 p-3 rounded-xl space-y-1">
          <span className="font-bold text-rose-950 block">👑 Day 100 최종 완주 성공 훈장 & 편지:</span>
          <div className="text-slate-800 font-serif text-xs italic min-h-[18px]">"나와의 약속을 멋지게 지켜낸 100일간의 여정에 진심으로 박수를 보냅니다!"</div>
        </div>
      </div>

      {/* 5. Footer */}
      <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-300">
        <span>PREMIUM DIARY STUDIO — 100-DAY ROADMAP (VOL. 2: DAY 51~100 VICTORY)</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
