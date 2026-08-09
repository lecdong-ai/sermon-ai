'use client'

import React from 'react'
import QtQuickIndexNav from './QtQuickIndexNav'

interface QtHundredGoalPage2Props {
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

export default function QtHundredGoalPage2({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 768,
}: QtHundredGoalPage2Props) {
  const monthNum = MONTH_MAP[monthName] || 8

  return (
    <div
      data-page-key="tracker"
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
          <span>VICTORY HALL OF FAME (VOL. 2)</span>
          <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-bold text-[10px] shadow-xs">
            🏆 Day 51 ~ Day 100 완주전 & 영예의 전당
          </span>
        </div>
      </div>

      {/* 2. Page Title */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-xl font-sans font-bold text-slate-800 tracking-wide whitespace-nowrap">
            🏆 {monthName} 100-Day Challenge Victory (Day 51 ~ 100)
          </h1>
          <p className="text-[10.5px] text-slate-500 mt-0.5 whitespace-nowrap">
            51일부터 100일까지 최종 완주를 향해 나아가며 나만의 완주 훈장과 소감 노트를 완성하세요.
          </p>
        </div>

        <div className="px-3 py-1 rounded-full text-xs font-bold text-rose-950 bg-rose-50 border border-rose-200 shadow-xs whitespace-nowrap">
          100일 완주 영예의 전당
        </div>
      </div>

      {/* 3. Day 51 ~ Day 100 Matrix (5 rows x 10 cols) */}
      <div className="border border-slate-200/90 rounded-2xl p-2.5 bg-white flex-1 flex flex-col justify-between shadow-2xs mb-2">
        <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-1">
          <span className="text-[10px] font-bold text-slate-800 font-sans">
            📝 Day 51 ~ Day 100 후반전 매일 실행 기록 트래커
          </span>
          <span className="text-[8.5px] text-rose-600 font-bold font-mono">★ Day 75 Focus | 🎉 Day 100 Victory</span>
        </div>

        <div className="grid grid-cols-10 gap-1 flex-1 py-0.5 text-[8px]">
          {Array.from({ length: 50 }, (_, i) => i + 51).map((d) => {
            const isMilestone = d === 75 || d === 100
            return (
              <div
                key={d}
                className={`p-1 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                  isMilestone
                    ? 'bg-rose-50 border-rose-300 ring-1 ring-rose-400/40 shadow-2xs'
                    : 'bg-slate-50/40 border-slate-200 hover:border-rose-300'
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-0.5">
                  <span className={`font-mono font-extrabold ${isMilestone ? 'text-rose-900' : 'text-slate-600'}`}>D-{d}</span>
                  <span className="text-[7.5px] text-slate-300">□</span>
                </div>
                <div className="text-slate-400 font-sans text-[7.5px] truncate py-0.5">____</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 4. Milestones Day 75 & Day 100 Victory Hall of Fame Banner */}
      <div className="grid grid-cols-12 gap-2 text-[9px]">
        <div className="col-span-5 bg-purple-50/60 border border-purple-200 p-2 rounded-xl space-y-0.5">
          <span className="font-bold text-purple-900 block">🚀 Day 75 고지전 점검:</span>
          <div className="text-slate-700 font-sans text-[8.5px] min-h-[14px]">"75% 달성 완료! 흔들리지 않는 마지막 몰입 다짐: ________"</div>
        </div>
        <div className="col-span-7 bg-gradient-to-r from-rose-500/10 to-amber-500/10 border border-rose-200 p-2 rounded-xl space-y-0.5">
          <span className="font-bold text-rose-950 block">👑 Day 100 최종 완주 성공 훈장 & 나에게 띄우는 편지:</span>
          <div className="text-slate-800 font-sans text-[8.5px] italic min-h-[14px]">"나와의 약속을 멋지게 지켜낸 100일간의 여정에 진심으로 감사와 박수를 보냅니다!"</div>
        </div>
      </div>

      {/* 5. Footer */}
      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1.5 border-t border-slate-200 mt-1.5">
        <span>PREMIUM DIARY STUDIO — 100-DAY ROADMAP (VOL. 2: DAY 51~100 VICTORY)</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
