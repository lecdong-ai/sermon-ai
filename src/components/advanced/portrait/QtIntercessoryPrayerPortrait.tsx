'use client'

import React from 'react'
import QtQuickIndexNavPortrait from './QtQuickIndexNavPortrait'

interface QtIntercessoryPrayerPortraitProps {
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

export default function QtIntercessoryPrayerPortrait({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 1448,
}: QtIntercessoryPrayerPortraitProps) {
  const monthNum = MONTH_MAP[monthName] || 8

  return (
    <div
      data-page-key="tracker"
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
          💖 FAMILY & CELL INTERCESSION
        </span>
      </div>

      {/* 2. Page Title */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-xl font-serif font-bold text-slate-800 tracking-wide flex items-center gap-2 whitespace-nowrap">
            <span>💖 {monthName} Family & Cell Community</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            가족, 셀/순원 공동체, 영적 지도자를 위해 사랑과 눈물로 성벽을 쌓는 중보기도 카드입니다.
          </p>
        </div>
        <div className="px-4 py-1.5 rounded-full text-xs font-bold text-rose-950 bg-rose-50 border border-rose-200 shadow-xs">
          가족 & 공동체 성벽 중보
        </div>
      </div>

      {/* 3. Main Stack: Family & Leaders + Cell 4 Members */}
      <div className="space-y-4 flex-1 flex flex-col justify-between mb-3">
        {/* Family & Leaders Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          {/* Family */}
          <div className="border border-rose-200 rounded-2xl p-3 bg-rose-50/20 flex flex-col justify-between shadow-xs space-y-1.5">
            <div className="flex items-center justify-between border-b border-rose-200 pb-1">
              <span className="font-bold text-rose-950 font-serif">👨‍👩‍👧‍👦 01. 내 사랑하는 가정 & 가문</span>
              <span className="font-mono text-[10px] text-rose-400">Family</span>
            </div>
            <div className="space-y-1.5 flex-1 flex flex-col justify-around text-xs">
              <div className="bg-white p-1.5 rounded-xl border border-rose-200/80">
                <span className="font-bold text-rose-800 text-[10px] block">📌 가정 기도제목:</span>
                <div className="text-slate-400 font-serif text-xs min-h-[14px]">_____________________</div>
              </div>
              <div className="bg-white p-1.5 rounded-xl border border-rose-200/80">
                <span className="font-bold text-rose-800 text-[10px] block">📖 붙잡을 약속 말씀:</span>
                <div className="text-slate-400 font-serif text-xs min-h-[14px]">_____________________</div>
              </div>
            </div>
          </div>

          {/* Leaders */}
          <div className="border border-indigo-200 rounded-2xl p-3 bg-indigo-50/20 flex flex-col justify-between shadow-xs space-y-1.5">
            <div className="flex items-center justify-between border-b border-indigo-200 pb-1">
              <span className="font-bold text-indigo-950 font-serif">🛡️ 02. 목회자 & 영적 지도자</span>
              <span className="font-mono text-[10px] text-indigo-400">Pastors</span>
            </div>
            <div className="bg-white p-2 rounded-xl border border-indigo-200/80 flex-1 text-xs">
              <span className="font-bold text-indigo-800 text-[10px] block">📌 담임목사님 & 셀장 강건함 기도:</span>
              <div className="text-slate-400 font-serif text-xs min-h-[30px]">_____________________</div>
            </div>
          </div>
        </div>

        {/* Cell 4 Members */}
        <div className="border border-amber-200 rounded-2xl p-3.5 bg-amber-50/20 flex-1 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between border-b border-amber-200 pb-1 text-xs font-bold text-amber-950 font-serif">
            <span>⛪ 03. 교우 / 순원 / 셀 공동체 4인 기도 카드</span>
            <span className="font-mono text-[10px] text-amber-700">Cell 4 Members</span>
          </div>

          <div className="grid grid-cols-2 gap-2 flex-1 text-xs my-2">
            {[1, 2, 3, 4].map((mNo) => (
              <div key={mNo} className="bg-white p-2 rounded-xl border border-amber-200 flex flex-col justify-between space-y-1">
                <div className="flex justify-between items-center border-b border-amber-100 pb-0.5 text-[10px]">
                  <span className="font-bold text-amber-900">순원 {mNo}: ________</span>
                  <span className="text-slate-300">□ 응답</span>
                </div>
                <div className="text-slate-400 font-serif text-xs min-h-[28px] flex-1 flex flex-col justify-around">
                  <div>__________________________</div>
                  <div>__________________________</div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-amber-200 pt-1 text-xs text-amber-900 font-serif italic text-right">
            "너희가 서로 짐을 지라 그리하여 그리스도의 법을 성취하라 (갈라디아서 6:2)"
          </div>
        </div>
      </div>

      {/* 4. Footer */}
      <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-300">
        <span>PREMIUM DIARY STUDIO — FAMILY & CELL COMMUNITY INTERCESSION (VOL. 1)</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
