'use client'

import React from 'react'
import QtQuickIndexNav from './QtQuickIndexNav'

interface QtWellnessMoodPageProps {
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

export default function QtWellnessMoodPage({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 768,
}: QtWellnessMoodPageProps) {
  const monthNum = MONTH_MAP[monthName] || 8

  return (
    <div
      data-page-key="wellness"
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
      <div className="flex items-center justify-between border-b border-slate-300 pb-2 mb-2.5">
        <div className="flex items-center space-x-3 text-[11px] font-medium tracking-wider text-slate-400 font-mono">
          <span>YEARLY</span>
          <span>{year}</span>
          <span className="px-2 py-0.5 rounded text-white font-bold" style={{ backgroundColor: themeColor }}>
            {monthName.toUpperCase().slice(0, 3)}
          </span>
        </div>

        <div className="flex items-center space-x-3 text-[11px] font-medium text-slate-400">
          <span>MIND & BODY HEALTH</span>
          <span className="px-2.5 py-0.5 rounded-full bg-teal-600 text-white font-bold text-[10px] shadow-xs whitespace-nowrap">
            🥗 WELLNESS & MOOD TRACKER
          </span>
        </div>
      </div>

      {/* 2. Title */}
      <div className="flex items-center justify-between mb-2.5">
        <div>
          <h1 className="text-2xl font-sans font-bold text-slate-800 tracking-wide flex items-center gap-2 whitespace-nowrap">
            <span>🥗 {monthName} Wellness & Mood Tracker</span>
          </h1>
          <p className="text-[11px] text-slate-500 mt-0.5">
            한 달 동안의 감정 흐름, 수면 시간, 물 섭취량과 신체 밸런스를 사랑으로 돌보세요.
          </p>
        </div>
        <div className="px-3 py-1 rounded-full text-xs font-bold text-teal-950 bg-teal-50 border border-teal-200 shadow-xs whitespace-nowrap">
          {year}년 웰니스 & 마인드 픽셀
        </div>
      </div>

      {/* 3. Main Content Grid (Left 6 cols: Mood Pixels / Right 6 cols: Sleep & Water & Self-Care) */}
      <div className="grid grid-cols-12 gap-3.5 flex-1">
        {/* Left: 31-Day Mood Pixels Grid */}
        <div className="col-span-6 border border-slate-200/90 rounded-2xl p-3 bg-slate-50/50 flex flex-col justify-between shadow-2xs space-y-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1">
            <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap shrink-0">
              <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0" />
              🎨 31일 감정 구슬 (Mood Pixels)
            </h4>
            <span className="text-[9px] text-slate-400 font-mono whitespace-nowrap">Daily Color Code</span>
          </div>

          {/* Color Legend */}
          <div className="flex flex-nowrap items-center justify-around bg-white p-1.5 rounded-xl border border-slate-200/80 text-[9px] text-slate-600">
            <span className="flex shrink-0 items-center gap-1 whitespace-nowrap"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> 😊 기쁨</span>
            <span className="flex shrink-0 items-center gap-1 whitespace-nowrap"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" /> 🌿 평온</span>
            <span className="flex shrink-0 items-center gap-1 whitespace-nowrap"><span className="w-2.5 h-2.5 rounded-full bg-purple-400 inline-block" /> ☕ 피곤</span>
            <span className="flex shrink-0 items-center gap-1 whitespace-nowrap"><span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block" /> 🌧️ 우울</span>
            <span className="flex shrink-0 items-center gap-1 whitespace-nowrap"><span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" /> 🔥 스트레스</span>
          </div>

          {/* 31 Pixels Grid */}
          <div className="grid grid-cols-7 gap-1.5 flex-1 py-1">
            {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
              <div
                key={d}
                className="aspect-square rounded-xl border border-slate-200 bg-white flex flex-col items-center justify-center text-[9px] font-extrabold text-slate-400 hover:border-teal-400 hover:text-teal-700 cursor-pointer shadow-2xs"
              >
                <span>{d}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Sleep Tracker, Water Intake & Mindful Notes */}
        <div className="col-span-6 flex flex-col justify-between space-y-2">
          {/* Top: Sleep Hours & Energy Level */}
          <div className="border border-slate-200/90 rounded-2xl p-3 bg-white space-y-1.5 shadow-2xs">
            <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between border-b border-slate-200 pb-1">
              <span className="flex items-center gap-1.5 whitespace-nowrap shrink-0">
                <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                🌙 평균 수면 시간 & 컨디션 (Sleep & Energy)
              </span>
              <span className="text-[9px] text-slate-400 font-mono whitespace-nowrap">Target: 7~8 hrs</span>
            </h4>
            <div className="space-y-1 text-[9.5px]">
              {['주간 평균 수면', '주말 수면 충전', '하루 수분 섭취 (8잔 목표)'].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between bg-slate-50/60 p-1.5 rounded-xl border border-slate-200/80">
                  <span className="text-slate-700 font-medium">{item}</span>
                  <span className="text-slate-400 font-mono">______ 시간 / 💧 💧 💧 💧</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom: Mindful Reflection & Gentle Note */}
          <div className="border border-slate-200/90 rounded-2xl p-3 bg-teal-50/40 space-y-1.5 shadow-2xs flex-1 flex flex-col justify-between">
            <h4 className="text-[11px] font-bold text-teal-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-teal-200 pb-1 whitespace-nowrap">
              <span>💖 지친 나에게 전하는 따뜻한 응원의 한마디</span>
            </h4>
            <div className="space-y-1 flex-1 flex flex-col justify-around py-1">
              <div className="border-b border-dashed border-teal-200 h-4 text-[9px] text-teal-800/60 font-sans"></div>
              <div className="border-b border-dashed border-teal-200 h-4 text-[9px] text-teal-800/60 font-sans"></div>
              <div className="border-b border-dashed border-teal-200 h-4 text-[9px] text-teal-800/60 font-sans"></div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Footer */}
      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1.5 border-t border-slate-200 mt-1.5">
        <span>PREMIUM DIARY STUDIO — WELLNESS & MOOD TRACKER</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
