'use client'

import React from 'react'

interface QtSundaySermonPageProps {
  year?: number
  monthName?: string
  themeColor?: string
  pageWidth?: number
  pageHeight?: number
}

export default function QtSundaySermonPage({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 768,
}: QtSundaySermonPageProps) {
  return (
    <div
      data-page-key="sunday-sermon"
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
          <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-bold cursor-pointer shadow-xs">SUNDAY SERMON</span>
        </div>
      </div>

      {/* 2. Page Title */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-800 tracking-wide flex items-center gap-2">
            <span>🏛️ {monthName} Sunday Sermon & Pulpit Notes</span>
          </h1>
          <p className="text-[11px] text-slate-500 mt-0.5">주일 예배 설교 말씀 요약과 한 주간 삶의 실천을 정리하는 예배 바인더</p>
        </div>
        <div className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-xs" style={{ backgroundColor: themeColor }}>
          {year}년 {monthName} 주일 설교 노치
        </div>
      </div>

      {/* 3. Main Grid (2x2 Cards = 4 Sundays) */}
      <div className="grid grid-cols-2 gap-3.5 flex-1">
        {[1, 2, 3, 4].map((sundayNo) => (
          <div key={sundayNo} className="border border-slate-300 rounded-2xl p-3.5 bg-slate-50/40 flex flex-col justify-between shadow-2xs space-y-2">
            {/* Card Top Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
              <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-lg text-white" style={{ backgroundColor: themeColor }}>
                {monthName} Week {sundayNo} 주일 예배
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Date: ____년 __월 __일</span>
            </div>

            {/* Title & Passage */}
            <div className="grid grid-cols-12 gap-2 text-[11px]">
              <div className="col-span-8 p-1.5 rounded-lg bg-white border border-slate-200">
                <span className="text-[9px] text-slate-400 font-bold block">설교 제목 (Sermon Title):</span>
                <div className="text-slate-400 font-serif italic min-h-[16px]">제목을 적어주세요...</div>
              </div>
              <div className="col-span-4 p-1.5 rounded-lg bg-white border border-slate-200">
                <span className="text-[9px] text-slate-400 font-bold block">성경 본문 (Passage):</span>
                <div className="text-slate-400 font-mono italic text-[10px] min-h-[16px]">본문...</div>
              </div>
            </div>

            {/* 3 Key Points */}
            <div className="space-y-1.5 flex-1 bg-white p-2 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-600 block mb-1">💡 핵심 메시지 3가지 (3 Key Points):</span>
              {[1, 2, 3].map((pt) => (
                <div key={pt} className="text-[10px] text-slate-400 flex items-center gap-1.5 border-b border-slate-100 pb-1">
                  <span className="w-3.5 h-3.5 rounded-full bg-slate-100 text-slate-600 text-[9px] font-bold flex items-center justify-center shrink-0">
                    {pt}
                  </span>
                  <span className="font-serif italic">핵심 대지 및 요약 {pt}...</span>
                </div>
              ))}
            </div>

            {/* Application */}
            <div className="text-[10px] text-blue-900 bg-blue-50/70 p-1.5 rounded-lg border border-blue-100 flex items-center justify-between">
              <span>🌱 이번 주 나의 삶의 실천:</span>
              <span className="text-[9px] text-blue-600 font-bold">Action Point</span>
            </div>
          </div>
        ))}
      </div>

      {/* 4. Footer */}
      <div className="flex items-center justify-between border-t border-slate-300 pt-2 mt-2 text-[10px] text-slate-400">
        <span>SERMON AI QT DIARY — SUNDAY SERMON NOTES</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
