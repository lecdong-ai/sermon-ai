'use client'

import React from 'react'

interface QtSundaySermonDeepPortraitProps {
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

export default function QtSundaySermonDeepPortrait({
  year = 2026,
  month = 8,
  sundayNo = 1,
  dayNum,
  dateStr = '08/02',
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 768,
  pageHeight = 1024,
}: QtSundaySermonDeepPortraitProps) {
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
        padding: '28px 24px',
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
            🕊️ SUNDAY SERMON ({sundayNo}주차)
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
          <span className="text-xs text-slate-500 font-medium">⛪ 설교자: _____ 목사님</span>
        </div>

        <div className="space-y-1 text-xs">
          <div className="p-1.5 rounded-xl bg-white border border-slate-200 flex items-center">
            <span className="text-[10px] font-bold text-slate-400 mr-2">📌 설교 대제목:</span>
            <span className="text-slate-400 font-serif italic text-xs">목사님 설교 말씀 제목을 기록해 주세요...</span>
          </div>
          <div className="p-1.5 rounded-xl bg-white border border-slate-200 flex items-center">
            <span className="text-[10px] font-bold text-slate-400 mr-2">📖 본문 구절:</span>
            <span className="text-slate-400 font-mono italic text-xs">성경 구절...</span>
          </div>
        </div>
      </div>

      {/* 3. Vertical Stack Section */}
      <div className="flex-1 flex flex-col space-y-3">
        {/* 3 Key Points */}
        <div className="border border-slate-300 rounded-2xl p-3 bg-white space-y-2 flex-1 flex flex-col justify-between shadow-2xs">
          <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-1">
            💡 설교 대지별 핵심 말씀 & 필기 (SERMON OUTLINE)
          </h4>
          {[1, 2, 3].map((pt) => (
            <div key={pt} className="border border-slate-200 rounded-xl p-2 bg-slate-50/30 flex-1 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-700">제 {pt}대지: ______________________________</span>
              <div className="border-b border-dashed border-slate-200 my-1" />
            </div>
          ))}
        </div>

        {/* Rhema Scripture Box */}
        <div className="border-2 border-amber-300/80 rounded-2xl p-3 bg-gradient-to-b from-amber-50/40 via-white to-rose-50/30 shadow-2xs space-y-1">
          <span className="text-[10.5px] font-bold text-amber-900 block">📜 RHEMA SCRIPTURE (성령님의 레마 말씀)</span>
          <div className="p-2 border border-dashed border-amber-200 rounded-xl bg-white/90 space-y-1.5 min-h-[44px]">
            <div className="border-b border-dashed border-amber-200/80 h-4" />
            <div className="border-b border-dashed border-amber-200/80 h-4" />
          </div>
        </div>

        {/* Application & Prayer */}
        <div className="grid grid-cols-2 gap-2">
          <div className="border border-emerald-300 rounded-xl p-2 bg-emerald-50/40 text-[10px]">
            <span className="font-bold text-emerald-900 block mb-0.5">🌱 삶의 실천</span>
            <div className="bg-white p-1 rounded border border-emerald-200 min-h-[28px] flex flex-col justify-around">
              <div className="border-b border-dashed border-emerald-200/80 h-3" />
            </div>
          </div>
          <div className="border border-indigo-300 rounded-xl p-2 bg-indigo-50/40 text-[10px]">
            <span className="font-bold text-indigo-900 block mb-0.5">🙏 결단 기도</span>
            <div className="bg-white p-1 rounded border border-indigo-200 min-h-[28px] flex flex-col justify-around">
              <div className="border-b border-dashed border-indigo-200/80 h-3" />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Footer */}
      <div className="flex items-center justify-between border-t border-slate-300 pt-2 mt-2 text-[10px] text-slate-400">
        <span>SERMON AI QT DIARY — SUNDAY SERMON DEEP JOURNAL ({sundayNo}주차)</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
