'use client'

import React from 'react'

interface QtWellnessMoodPortraitProps {
  year?: number
  monthName?: string
  themeColor?: string
  pageWidth?: number
  pageHeight?: number
}

export default function QtWellnessMoodPortrait({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 1448,
}: QtWellnessMoodPortraitProps) {
  return (
    <div
      data-page-key="wellness-mood-portrait"
      data-page-type="full-bleed"
      className="qt-page relative bg-white text-slate-800 flex flex-col justify-between overflow-hidden shadow-md mx-auto"
      style={{
        width: `${pageWidth}px`,
        height: `${pageHeight}px`,
        padding: '28px 32px',
        boxSizing: 'border-box',
        fontFamily: "'Noto Sans KR', 'Pretendard', sans-serif",
      }}
    >
      {/* 1. Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-300 pb-2 mb-2">
        <div className="flex items-center space-x-3 text-xs font-medium tracking-wider text-slate-400 font-mono">
          <span>YEARLY</span>
          <span>{year}</span>
          <span className="px-2 py-0.5 rounded text-white font-bold" style={{ backgroundColor: themeColor }}>
            {monthName.toUpperCase().slice(0, 3)}
          </span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-teal-600 text-white font-bold text-[10.5px] shadow-2xs font-mono">
          🥗 WELLNESS & MOOD TRACKER
        </span>
      </div>

      {/* 2. Page Title */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-xl font-serif font-bold text-slate-800 tracking-wide flex items-center gap-2 whitespace-nowrap">
            <span>🥗 {monthName} Wellness & Mood Tracker</span>
          </h1>
          <p className="text-[11px] text-slate-500 mt-0.5">
            한 달 감정 흐름(Mood Pixels), 수면 시간과 몸과 마음의 밸런스를 기록하는 케어 노트입니다.
          </p>
        </div>
        <div className="px-3 py-1 rounded-full text-[11px] font-bold text-teal-950 bg-teal-50 border border-teal-200 shadow-2xs whitespace-nowrap">
          {year}년 웰니스 & 마인드 픽셀
        </div>
      </div>

      {/* 3. 31-Day Mood Pixels Grid Section */}
      <div className="border border-slate-200 rounded-xl p-2.5 bg-slate-50/50 space-y-2 shadow-2xs mb-2">
        <div className="flex items-center justify-between border-b border-slate-200 pb-1">
          <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 font-serif">
            <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0" />
            🎨 31일 감정 구슬 (Mood Pixels)
          </h4>
          <span className="text-[9.5px] text-slate-400 font-mono">Daily Mood Palette</span>
        </div>

        {/* Color Legend */}
        <div className="flex items-center justify-around bg-white p-1.5 rounded-lg border border-slate-200/80 text-[10px] text-slate-600">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> 😊 기쁨</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" /> 🌿 평온</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-purple-400 inline-block" /> ☕ 피곤</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block" /> 🌧️ 우울</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" /> 🔥 스트레스</span>
        </div>

        {/* 31 Pixels */}
        <div className="grid grid-cols-11 gap-1 py-1">
          {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
            <div
              key={d}
              className="h-7 rounded-lg border border-slate-200 bg-white flex flex-col items-center justify-center text-[10px] font-extrabold text-slate-400 hover:border-teal-400 hover:text-teal-700 cursor-pointer shadow-2xs font-mono"
            >
              <span>{d}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Sleep & Hydration Section */}
      <div className="border border-slate-200 rounded-xl p-2.5 bg-white space-y-1.5 shadow-2xs mb-2">
        <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between border-b border-slate-200 pb-1 font-serif">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
            🌙 수면 패턴 & 수분 섭취 (Sleep & Hydration)
          </span>
          <span className="text-[9.5px] text-slate-400 font-mono">Target: 7~8 hrs</span>
        </h4>
        <div className="grid grid-cols-2 gap-2 text-[10.5px]">
          <div className="bg-slate-50/60 p-2 rounded-lg border border-slate-200/80 space-y-0.5">
            <span className="font-bold text-slate-700 block">🌙 주간 평균 수면:</span>
            <span className="text-slate-400 font-mono text-[10px]">_____ 시간 (목표: 8시간)</span>
          </div>
          <div className="bg-slate-50/60 p-2 rounded-lg border border-slate-200/80 space-y-0.5">
            <span className="font-bold text-slate-700 block">💧 하루 물 섭취량:</span>
            <span className="text-slate-400 font-mono text-[10px]">💧 💧 💧 💧 💧 💧 (8잔)</span>
          </div>
        </div>
      </div>

      {/* 5. Mindful Self-Care Note */}
      <div className="flex-1 border border-slate-200 rounded-xl p-2.5 bg-teal-50/40 space-y-1 shadow-2xs mb-2 flex flex-col justify-between">
        <h4 className="text-[11px] font-bold text-teal-900 uppercase tracking-wider border-b border-teal-200 pb-1 font-serif">
          💖 지친 나에게 전하는 따뜻한 응원의 한마디 (Self-Compassion Note)
        </h4>
        <div className="space-y-1 flex-1 flex flex-col justify-around my-1">
          <div className="border-b border-dashed border-teal-200 h-4 text-[10px] text-teal-800/60 font-serif"></div>
          <div className="border-b border-dashed border-teal-200 h-4 text-[10px] text-teal-800/60 font-serif"></div>
          <div className="border-b border-dashed border-teal-200 h-4 text-[10px] text-teal-800/60 font-serif"></div>
        </div>
      </div>

      {/* 6. Footer */}
      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1.5 border-t border-slate-200">
        <span>PREMIUM DIARY STUDIO — WELLNESS & MOOD TRACKER</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
