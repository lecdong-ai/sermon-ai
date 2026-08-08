'use client'

import React from 'react'
import QtQuickIndexNavPortrait from './QtQuickIndexNavPortrait'

interface QtGratitudeJournalPortraitProps {
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

export default function QtGratitudeJournalPortrait({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 1448,
}: QtGratitudeJournalPortraitProps) {
  const monthNum = MONTH_MAP[monthName] || 8

  return (
    <div
      data-page-key="gratitude"
      data-page-type="full-bleed"
      className="qt-page relative bg-white text-slate-800 flex flex-col justify-between overflow-hidden shadow-md mx-auto"
      style={{
        width: `${pageWidth}px`,
        height: `${pageHeight}px`,
        padding: '52px 20px 20px 20px',
        boxSizing: 'border-box',
        fontFamily: "'Noto Sans KR', 'Pretendard', sans-serif",
      }}
    >
      <QtQuickIndexNavPortrait currentMonth={monthNum} activeTab="tracker" themeColor={themeColor} />
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-400 pb-2 mb-3">
        <div className="flex items-center space-x-2 text-[11px] font-medium tracking-wider text-slate-400">
          <span>YEARLY</span>
          <span>{year}</span>
          <span className="px-1.5 py-0.5 rounded text-white font-bold" style={{ backgroundColor: themeColor }}>
            {monthName.toUpperCase().slice(0, 3)}
          </span>
        </div>
        <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-bold text-[10px]">GRATITUDE JOURNAL</span>
      </div>

      {/* Title */}
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-serif font-bold text-slate-800 tracking-wide">
          ☀️ {monthName} Gratitude & Affirmation
        </h1>
        <div className="px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white shadow-xs" style={{ backgroundColor: themeColor }}>
          {year}년 {monthName} 감사일기
        </div>
      </div>

      {/* Affirmation Box */}
      <div className="border border-amber-200 bg-amber-50/40 rounded-xl p-3.5 mb-3">
        <h4 className="text-[11px] font-bold text-amber-800 flex items-center gap-1.5 mb-1">
          ✨ 이달의 긍정 확언 (Monthly Affirmation)
        </h4>
        <p className="text-[11px] text-slate-600 italic leading-relaxed">
          &quot;나는 주도적으로 하루를 이끌어가며, 매 순간 성장과 행복을 선택한다.&quot;
        </p>
      </div>

      {/* Main Gratitude List */}
      <div className="flex-1 border border-slate-300 rounded-xl p-3.5 bg-white flex flex-col justify-between mb-3">
        <h4 className="text-[11px] font-bold text-slate-700 flex items-center justify-between border-b border-slate-200 pb-2">
          <span>🌿 매일 감사 일지 (Daily Gratitude Entry)</span>
          <span className="text-[10px] text-slate-400 font-normal">31 Days</span>
        </h4>
        <div className="flex-1 divide-y divide-slate-150 flex flex-col justify-around my-1">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="py-1.5 flex items-center justify-between text-[10px] text-slate-400">
              <span className="font-semibold text-slate-500 min-w-[50px]">Day {i * 4 + 1}~</span>
              <span className="flex-1 text-slate-300 border-b border-dashed border-slate-200 ml-2">감사한 순간 기록...</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom TOP 3 */}
      <div className="border border-slate-300 rounded-xl p-3 bg-slate-50/50 space-y-1.5">
        <h4 className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
          🏆 이달의 Best 감사 TOP 3
        </h4>
        <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-500 pt-1">
          <div className="border border-slate-200 rounded-lg p-2 bg-white text-center">1st. ____________</div>
          <div className="border border-slate-200 rounded-lg p-2 bg-white text-center">2nd. ____________</div>
          <div className="border border-slate-200 rounded-lg p-2 bg-white text-center">3rd. ____________</div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2 border-t border-slate-200 mt-2">
        <span>Bunker Diary · Gratitude Journal (Portrait)</span>
        <span>Page Gratitude-01P</span>
      </div>
    </div>
  )
}
