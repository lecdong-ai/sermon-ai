'use client'

import React from 'react'

interface QtSundaySermonDeepPageProps {
  year?: number
  month?: number
  sundayNo?: number
  dayNum?: number
  dateStr?: string
  monthName?: string
  themeColor?: string
  pageWidth?: number
  pageHeight?: number
}

export default function QtSundaySermonDeepPage({
  year = 2026,
  month = 8,
  sundayNo = 1,
  dayNum,
  dateStr = '08/02',
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 768,
}: QtSundaySermonDeepPageProps) {
  return (
    <div
      id={dayNum ? `qt-page-day-${dayNum}` : `qt-page-sunday-deep-${sundayNo}`}
      data-page-key={dayNum ? `day-${dayNum}` : `sunday-sermon-deep-${sundayNo}`}
      data-day={dayNum || sundayNo}
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
      {/* 1. Header Navigation Bar */}
      <div className="flex items-center justify-between border-b border-slate-400 pb-2 mb-3">
        <div className="flex items-center space-x-3 text-[11px] font-medium tracking-wider text-slate-400">
          <span data-nav-target="calendar" className="cursor-pointer hover:text-slate-600">YEARLY</span>
          <span>{year}</span>
          <span data-nav-target="calendar" className="px-1.5 py-0.5 rounded text-white font-bold cursor-pointer" style={{ backgroundColor: themeColor }}>
            {monthName.toUpperCase().slice(0, 3)}
          </span>
        </div>

        <div className="flex items-center space-x-3 text-[11px] font-medium text-slate-400">
          <span data-nav-target="calendar" className="hover:text-slate-600 cursor-pointer">MONTHLY</span>
          <span data-nav-target="overview" className="hover:text-slate-600 cursor-pointer">OVERVIEW</span>
          <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white font-bold text-[10px] shadow-xs">
            🕊️ SUNDAY SERMON BINDER ({sundayNo}주차)
          </span>
        </div>
      </div>

      {/* 2. Worship Header Metadata */}
      <div className="border border-slate-300 rounded-2xl p-3 bg-slate-50/50 mb-3 space-y-2 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold text-white bg-gradient-to-r from-amber-500 to-rose-500 shadow-xs">
              {month}월 {sundayNo}주차 주일 예배
            </span>
            <span className="text-xs font-mono font-bold text-slate-600">Date: {year}.{dateStr}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
            <span>⛪ 설교자: <strong className="text-slate-700 font-bold">_____ 목사님</strong></span>
            <span>🎵 예배 찬양: <strong className="text-slate-700 font-bold">_____</strong></span>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-2 text-xs">
          <div className="col-span-8 p-2 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 block shrink-0 mr-2">📌 설교 대제목 (SERMON TITLE):</span>
            <span className="text-slate-400 font-serif italic flex-1 text-sm">목사님 설교 말씀 제목을 기록해 주세요...</span>
          </div>
          <div className="col-span-4 p-2 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 block shrink-0 mr-2">📖 본문 (PASSAGE):</span>
            <span className="text-slate-400 font-mono italic text-xs">성경 구절...</span>
          </div>
        </div>
      </div>

      {/* 3. Main 2-Column Section (Left 60% Outline / Right 40% Rhema Card) */}
      <div className="grid grid-cols-12 gap-3.5 flex-1">
        {/* Left: 3-Key Message Outline Notes (7 cols) */}
        <div className="col-span-7 border border-slate-300 rounded-2xl p-3.5 bg-white flex flex-col justify-between shadow-2xs space-y-2">
          <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between border-b border-slate-200 pb-1.5">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              💡 설교 대지별 핵심 말씀 & 필기 (SERMON OUTLINE)
            </span>
            <span className="text-[9px] text-slate-400 font-mono">3 Key Points</span>
          </h4>

          <div className="space-y-2 flex-1 flex flex-col justify-between py-1">
            {[1, 2, 3].map((pt) => (
              <div key={pt} className="border border-slate-200 rounded-xl p-2 bg-slate-50/30 flex-1 flex flex-col justify-between">
                <div className="flex items-center gap-2 border-b border-slate-200/80 pb-1">
                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                    {pt}
                  </span>
                  <span className="text-[11px] font-bold text-slate-700 font-serif">제 {pt}대지: ______________________________</span>
                </div>
                {/* Dot Grid Lines */}
                <div className="space-y-1 py-1 flex-1 flex flex-col justify-around">
                  <div className="border-b border-dashed border-slate-200 h-3" />
                  <div className="border-b border-dashed border-slate-200 h-3" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Rhema Scripture Card & Reflection Box (5 cols) */}
        <div className="col-span-5 flex flex-col space-y-3">
          {/* Rhema Verse Box */}
          <div className="border-2 border-amber-300/80 rounded-2xl p-4 bg-gradient-to-b from-amber-50/40 via-white to-rose-50/30 flex-1 flex flex-col justify-between shadow-2xs relative">
            <div className="flex items-center justify-between border-b border-amber-200 pb-1.5 mb-2">
              <span className="text-[11px] font-extrabold text-amber-900 tracking-wider flex items-center gap-1">
                📜 RHEMA SCRIPTURE (성령님의 레마 말씀)
              </span>
              <span className="text-[9px] text-rose-500 font-bold">Rhema Verse</span>
            </div>

            <div className="flex-1 flex flex-col justify-around p-3 border border-dashed border-amber-200 rounded-xl bg-white/90 my-1">
              <div className="border-b border-dashed border-amber-200/80 h-5" />
              <div className="border-b border-dashed border-amber-200/80 h-5" />
              <div className="border-b border-dashed border-amber-200/80 h-5" />
              <div className="border-b border-dashed border-amber-200/80 h-5" />
            </div>

            <div className="text-[10px] text-slate-500 font-serif italic text-right border-t border-amber-200 pt-1 mt-1">
              &quot;주의 말씀은 내 발에 등이요 내 길에 빛이니이다&quot;
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom 2-Column Application & Response Prayer */}
      <div className="grid grid-cols-12 gap-3 mt-3">
        {/* Personal Application */}
        <div className="col-span-6 border border-emerald-300 rounded-2xl p-2.5 bg-emerald-50/40 flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1">
              🌱 🎯 이번 주 삶의 실천 (PERSONAL APPLICATION)
            </span>
            <span className="text-[9px] text-emerald-600 font-bold">Action Point</span>
          </div>
          <div className="border border-emerald-200 rounded-xl p-2 bg-white/90 space-y-1.5 min-h-[36px]">
            <div className="border-b border-dashed border-emerald-200/80 h-3.5" />
            <div className="border-b border-dashed border-emerald-200/80 h-3.5" />
          </div>
        </div>

        {/* Response Prayer */}
        <div className="col-span-6 border border-indigo-300 rounded-2xl p-2.5 bg-indigo-50/40 flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-indigo-900 flex items-center gap-1">
              🙏 설교 후 결단 기도 (RESPONSE PRAYER)
            </span>
            <span className="text-[9px] text-indigo-600 font-bold">My Prayer</span>
          </div>
          <div className="border border-indigo-200 rounded-xl p-2 bg-white/90 space-y-1.5 min-h-[36px]">
            <div className="border-b border-dashed border-indigo-200/80 h-3.5" />
            <div className="border-b border-dashed border-indigo-200/80 h-3.5" />
          </div>
        </div>
      </div>

      {/* 5. Footer */}
      <div className="flex items-center justify-between border-t border-slate-300 pt-2 mt-2 text-[10px] text-slate-400">
        <span>SERMON AI QT DIARY — SUNDAY SERMON DEEP JOURNAL ({sundayNo}주차)</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
