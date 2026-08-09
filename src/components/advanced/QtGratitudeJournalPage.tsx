'use client'

import React from 'react'
import QtQuickIndexNav from './QtQuickIndexNav'

interface QtGratitudeJournalPageProps {
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

export default function QtGratitudeJournalPage({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 768,
}: QtGratitudeJournalPageProps) {
  const monthNum = MONTH_MAP[monthName] || 8

  return (
    <div
      data-page-key="gratitude"
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
      <div className="flex items-center justify-between border-b border-slate-400 pb-2 mb-3">
        <div className="flex items-center space-x-3 text-[11px] font-medium tracking-wider text-slate-400">
          <span>YEARLY</span>
          <span>{year}</span>
          <span className="px-1.5 py-0.5 rounded text-white font-bold" style={{ backgroundColor: themeColor }}>
            {monthName.toUpperCase().slice(0, 3)}
          </span>
        </div>

        <div className="flex items-center space-x-3 text-[11px] font-medium text-slate-400">
          <span>MONTHLY</span>
          <span>GRATITUDE</span>
          <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-bold shadow-xs">DAILY GRATITUDE & AFFIRMATION</span>
        </div>
      </div>

      {/* 2. Title */}
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-2xl font-sans font-bold text-slate-800 tracking-wide flex items-center gap-2">
          <span>☀️ {monthName} Daily Gratitude & Affirmation</span>
        </h1>
        <div className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-xs" style={{ backgroundColor: themeColor }}>
          {year}년 {monthName} 감사일기 & 긍정 확언
        </div>
      </div>

      {/* 3. Main Grid */}
      <div className="grid grid-cols-12 gap-4 flex-1">
        {/* Left: Affirmation & Today's Highlight (4 cols) */}
        <div className="col-span-4 flex flex-col space-y-3">
          {/* Affirmation Card */}
          <div className="border border-slate-300 rounded-xl p-3.5 bg-amber-50/30 flex-1 flex flex-col justify-between">
            <h4 className="text-[11px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              ✨ 나에게 전하는 긍정 확언 (Affirmation)
            </h4>
            <div className="border border-amber-200 bg-white rounded-lg p-3 my-2 text-xs italic text-slate-600 leading-relaxed shadow-2xs">
              &quot;나는 날마다 모든 면에서 더욱 성장하고 발전하고 있으며, 오늘 하루도 긍정적인 에너지와 기쁨으로 가득 찬다.&quot;
            </div>
            <div className="space-y-1.5 text-[10px] text-slate-400">
              <div className="border-b border-dashed border-slate-200 pb-1">· 이번 달 나의 키워드:</div>
              <div className="border-b border-dashed border-slate-200 pb-1">· 나와 한 다짐:</div>
            </div>
          </div>

          {/* Monthly Gratitude Ranking */}
          <div className="border border-slate-300 rounded-xl p-3 bg-slate-50/50 flex-1 flex flex-col justify-between">
            <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: themeColor }} />
              🏆 이달의 Best 감사 순간 TOP 3
            </h4>
            <div className="space-y-2 text-[11px] text-slate-500 my-1">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
                <span className="font-bold text-amber-600">1st</span>
                <span className="text-slate-400 text-[10px]">____________________________</span>
              </div>
              <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
                <span className="font-bold text-amber-600">2nd</span>
                <span className="text-slate-400 text-[10px]">____________________________</span>
              </div>
              <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
                <span className="font-bold text-amber-600">3rd</span>
                <span className="text-slate-400 text-[10px]">____________________________</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Daily Gratitude Grid (8 cols) */}
        <div className="col-span-8 border border-slate-300 rounded-xl p-3.5 bg-white flex flex-col justify-between">
          <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: themeColor }} />
              🌿 매일의 소소한 감사 기록 (Daily Gratitude Log)
            </span>
            <span className="text-[10px] text-slate-400 font-normal">Day 1 ~ Day 31</span>
          </h4>

          <div className="grid grid-cols-2 gap-2 flex-1 overflow-hidden">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((boxNum) => (
              <div key={boxNum} className="border border-slate-200 rounded-lg p-2 bg-slate-50/30 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-200 pb-0.5">
                  <span className="font-bold text-slate-600">Day {boxNum * 3 - 2} ~ {boxNum * 3}</span>
                  <span>😊 💖 🌟</span>
                </div>
                <div className="space-y-1 text-[10px] text-slate-400 mt-1">
                  <div className="border-b border-dashed border-slate-150">· </div>
                  <div className="border-b border-dashed border-slate-150">· </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2 border-t border-slate-200 mt-2">
        <span>Bunker Diary Collection · Daily Gratitude & Affirmation</span>
        <span>Page Gratitude-01</span>
      </div>
    </div>
  )
}
