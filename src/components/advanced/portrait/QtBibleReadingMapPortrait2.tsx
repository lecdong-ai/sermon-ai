'use client'

import React from 'react'
import QtQuickIndexNavPortrait from './QtQuickIndexNavPortrait'

interface QtBibleReadingMapPortrait2Props {
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

export default function QtBibleReadingMapPortrait2({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 1448,
}: QtBibleReadingMapPortrait2Props) {
  const monthNum = MONTH_MAP[monthName] || 8

  return (
    <div
      data-page-key="tracker"
      data-page-type="full-bleed"
      className="qt-page relative bg-white text-slate-800 flex flex-col justify-between overflow-hidden shadow-md mx-auto"
      style={{
        width: `${pageWidth}px`,
        height: `${pageHeight}px`,
        padding: '24px 56px 20px 20px',
        boxSizing: 'border-box',
        fontFamily: "'Noto Sans KR', 'Pretendard', sans-serif",
      }}
    >
      <QtQuickIndexNavPortrait currentMonth={monthNum} activeTab="tracker" themeColor={themeColor} />
      {/* 1. Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-300 pb-2.5 mb-2.5">
        <div className="flex items-center space-x-4 text-xs font-medium tracking-wider text-slate-400 font-mono">
          <span>YEARLY</span>
          <span>{year}</span>
          <span className="px-2.5 py-0.5 rounded text-white font-bold" style={{ backgroundColor: themeColor }}>
            {monthName.toUpperCase().slice(0, 3)}
          </span>
        </div>
        <span className="px-3 py-1 rounded-full bg-indigo-600 text-white font-bold text-xs shadow-xs">
          📖 DAILY BIBLE READING PLAN
        </span>
      </div>

      {/* 2. Page Title */}
      <div className="flex items-center justify-between mb-2.5">
        <div>
          <h1 className="text-2xl font-sans font-bold text-slate-800 tracking-wide flex items-center gap-2">
            <span>📖 {monthName} Daily Bible Reading Plan</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            매일 읽을 성경 본문 분량과 읽은 시간, 완독 체크를 기록하고 깨달은 레마의 구절을 보석처럼 캐냅니다.
          </p>
        </div>
        <div className="px-3.5 py-1 rounded-full text-xs font-bold text-indigo-950 bg-indigo-50 border border-indigo-200 shadow-2xs">
          31일 데일리 실행 플래너
        </div>
      </div>

      {/* 3. Main Stack: 31-Day Execution Table + Rhema & Insights */}
      <div className="space-y-3 flex-1 flex flex-col justify-between mb-2.5 min-h-0">
        {/* 31-Day Execution Table */}
        <div className="border border-slate-200 rounded-2xl p-3 bg-slate-50/20 flex-1 flex flex-col justify-between shadow-xs min-h-0">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1 text-xs font-bold text-slate-800 font-sans mb-1">
            <span>📅 31일 데일리 성경 통독 실행표 (Daily Reading Schedule)</span>
            <span className="font-mono text-xs text-slate-400">Date · Passage · Check · Time</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 flex-1 text-xs min-h-0">
            {/* Sub-col 1: Day 1 ~ 16 */}
            <div className="space-y-0.5 flex flex-col justify-between">
              {Array.from({ length: 16 }, (_, i) => i + 1).map((d) => (
                <div key={d} className="flex items-center gap-2 bg-white px-2 py-0.5 rounded border border-slate-200/80 leading-none">
                  <span className="font-mono font-bold text-indigo-700 w-6 text-xs">Day {String(d).padStart(2, '0')}</span>
                  <div className="flex-1 text-slate-300 font-sans text-xs truncate">_______________________</div>
                  <span className="w-3.5 h-3.5 rounded border border-slate-300 bg-slate-50 flex items-center justify-center text-[8px] text-slate-300">✓</span>
                </div>
              ))}
            </div>

            {/* Sub-col 2: Day 17 ~ 31 */}
            <div className="space-y-0.5 flex flex-col justify-between">
              {Array.from({ length: 15 }, (_, i) => i + 17).map((d) => (
                <div key={d} className="flex items-center gap-2 bg-white px-2 py-0.5 rounded border border-slate-200/80 leading-none">
                  <span className="font-mono font-bold text-indigo-700 w-6 text-xs">Day {String(d).padStart(2, '0')}</span>
                  <div className="flex-1 text-slate-300 font-sans text-xs truncate">_______________________</div>
                  <span className="w-3.5 h-3.5 rounded border border-slate-300 bg-slate-50 flex items-center justify-center text-[8px] text-slate-300">✓</span>
                </div>
              ))}
              <div className="flex items-center gap-2 bg-indigo-50/70 px-2 py-0.5 rounded border border-indigo-200 leading-none">
                <span className="font-bold text-indigo-900 text-xs">월간완주</span>
                <div className="flex-1 text-indigo-700 font-sans text-xs font-bold truncate">성경 통독 목표 완료!</div>
                <span className="w-3.5 h-3.5 rounded bg-indigo-600 text-white flex items-center justify-center text-[9px] font-bold">★</span>
              </div>
            </div>
          </div>
        </div>

        {/* Rhema & Insights Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs min-h-0">
          <div className="border border-indigo-200/90 rounded-2xl p-2.5 bg-indigo-50/20 flex flex-col justify-between shadow-xs space-y-1 min-h-0">
            <div className="flex items-center justify-between border-b border-indigo-200 pb-0.5">
              <span className="font-bold text-indigo-950 font-sans">💎 이달의 레마 말씀 3선</span>
              <span className="font-mono text-[10px] text-indigo-400">Top 3 Passages</span>
            </div>
            <div className="space-y-1 flex-1 flex flex-col justify-around text-xs">
              {[1, 2, 3].map((rNo) => (
                <div key={rNo} className="bg-white p-1 rounded-xl border border-indigo-200/80">
                  <span className="font-bold text-indigo-800 text-[10px] block">구절 {rNo}:</span>
                  <div className="text-slate-300 font-sans text-xs min-h-[12px]">______________________</div>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-emerald-200/90 rounded-2xl p-2.5 bg-emerald-50/20 flex flex-col justify-between shadow-xs space-y-1 min-h-0">
            <div className="flex items-center justify-between border-b border-emerald-200 pb-0.5">
              <span className="font-bold text-emerald-950 font-sans">🕊️ 영적 깨달음 & 삶의 변화</span>
              <span className="text-emerald-700 font-mono text-[10px]">Insight Note</span>
            </div>
            <div className="bg-white p-1.5 rounded-xl border border-emerald-200/80 flex-1 text-xs">
              <div className="text-slate-400 font-sans italic min-h-[32px]">"성경을 읽으며 새로 알게 된 하나님의 성품과 내 삶의 순종 결단을 적습니다..."</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Footer */}
      <div className="flex justify-between items-center text-xs text-slate-400 pt-1.5 border-t border-slate-300">
        <span>PREMIUM DIARY STUDIO — DAILY BIBLE READING PLAN & RHEMA JOURNAL (VOL. 2)</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
