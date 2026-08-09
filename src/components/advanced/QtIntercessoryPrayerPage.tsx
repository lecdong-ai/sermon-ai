'use client'

import React from 'react'
import QtQuickIndexNav from './QtQuickIndexNav'

interface QtIntercessoryPrayerPageProps {
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

export default function QtIntercessoryPrayerPage({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 768,
}: QtIntercessoryPrayerPageProps) {
  const monthNum = MONTH_MAP[monthName] || 8

  return (
    <div
      data-page-key="intercessory"
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
      <QtQuickIndexNav currentMonth={monthNum} activeTab="tracker" themeColor={themeColor} isChristian={true} />
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
          <span>FAMILY & CELL COMMUNITY INTERCESSION (VOL. 1)</span>
          <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-bold text-[10px] shadow-xs">
            💖 중보① 가족 & 공동체 성벽 기도 (VOL. 1)
          </span>
        </div>
      </div>

      {/* 2. Page Title */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-xl font-sans font-bold text-slate-800 tracking-wide whitespace-nowrap">
            💖 {monthName} Family & Cell Community Intercession
          </h1>
          <p className="text-[10.5px] text-slate-500 mt-0.5 whitespace-nowrap">
            가족, 셀/순원 공동체, 영적 지도자를 위해 사랑과 눈물로 성벽을 쌓는 중보기도 카드입니다.
          </p>
        </div>

        <div className="px-3 py-1 rounded-full text-xs font-bold text-rose-950 bg-rose-50 border border-rose-200 shadow-2xs whitespace-nowrap">
          가족 & 공동체 성벽 중보
        </div>
      </div>

      {/* 3. Main Grid (Left 6 Cols Family & Leader / Right 6 Cols Cell 4 Members) */}
      <div className="grid grid-cols-12 gap-3 flex-1 mb-2">
        {/* Left: Family & Pastoral Leaders (6 cols) */}
        <div className="col-span-6 flex flex-col justify-between space-y-2">
          {/* Family Box */}
          <div className="border border-rose-200 rounded-2xl p-2.5 bg-rose-50/20 flex-1 flex flex-col justify-between shadow-2xs space-y-1">
            <div className="flex items-center justify-between border-b border-rose-200 pb-1 text-[9.5px]">
              <span className="font-bold text-rose-950 font-sans">👨‍👩‍👧‍👦 01. 내 사랑하는 가정 & 가문 중보</span>
              <span className="font-mono text-[8px] text-rose-400">Family Card</span>
            </div>
            <div className="space-y-1 flex-1 flex flex-col justify-around text-[8.5px]">
              <div className="bg-white p-1.5 rounded-xl border border-rose-200/80">
                <span className="font-bold text-rose-800 text-[8px] block">📌 가정 기도제목:</span>
                <div className="text-slate-400 font-sans text-[8.5px] min-h-[14px]">___________________________________</div>
              </div>
              <div className="bg-white p-1.5 rounded-xl border border-rose-200/80">
                <span className="font-bold text-rose-800 text-[8px] block">📖 붙잡을 약속 말씀:</span>
                <div className="text-slate-400 font-sans text-[8.5px] min-h-[14px]">___________________________________</div>
              </div>
            </div>
          </div>

          {/* Leaders Box */}
          <div className="border border-indigo-200 rounded-2xl p-2.5 bg-indigo-50/20 flex flex-col justify-between shadow-2xs space-y-1">
            <div className="flex items-center justify-between border-b border-indigo-200 pb-1 text-[9.5px]">
              <span className="font-bold text-indigo-950 font-sans">🛡️ 02. 목회자 & 소그룹 지도자 중보</span>
              <span className="font-mono text-[8px] text-indigo-400">Pastoral Leaders</span>
            </div>
            <div className="bg-white p-2 rounded-xl border border-indigo-200/80 text-[8.5px]">
              <span className="font-bold text-indigo-800 text-[8px] block">📌 담임목사님 & 순장/셀장 강건함 기도:</span>
              <div className="text-slate-400 font-sans text-[8.5px] min-h-[20px]">___________________________________</div>
            </div>
          </div>
        </div>

        {/* Right: Cell / Small Group 4 Members (6 cols) */}
        <div className="col-span-6 border border-amber-200 rounded-2xl p-2.5 bg-amber-50/20 flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between border-b border-amber-200 pb-1 text-[9.5px] font-bold text-amber-950 font-sans">
            <span>⛪ 03. 교우 / 순원 / 셀 공동체 4인 기도 카드</span>
            <span className="font-mono text-[8px] text-amber-700">Cell 4 Members</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 flex-1 text-[8.5px] my-1">
            {[1, 2, 3, 4].map((mNo) => (
              <div key={mNo} className="bg-white p-1.5 rounded-xl border border-amber-200 flex flex-col justify-between space-y-1">
                <div className="flex justify-between items-center border-b border-amber-100 pb-0.5 text-[8px]">
                  <span className="font-bold text-amber-900">순원 {mNo}: ________</span>
                  <span className="text-slate-300">□ 응답</span>
                </div>
                <div className="text-slate-400 font-sans text-[8px] min-h-[22px] flex-1 flex flex-col justify-around">
                  <div>_______________________</div>
                  <div>_______________________</div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-amber-200 pt-1 text-[8px] text-amber-900 font-sans italic text-right">
            "너희가 서로 짐을 지라 그리하여 그리스도의 법을 성취하라 (갈라디아서 6:2)"
          </div>
        </div>
      </div>

      {/* 4. Footer */}
      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1.5 border-t border-slate-200 mt-1.5">
        <span>PREMIUM DIARY STUDIO — FAMILY & CELL COMMUNITY INTERCESSION (VOL. 1)</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
