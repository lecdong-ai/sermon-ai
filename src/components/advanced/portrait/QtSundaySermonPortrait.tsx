'use client'

import React from 'react'

interface QtSundaySermonPortraitProps {
  year?: number
  monthName?: string
  themeColor?: string
  pageWidth?: number
  pageHeight?: number
}

export default function QtSundaySermonPortrait({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 768,
  pageHeight = 1024,
}: QtSundaySermonPortraitProps) {
  return (
    <div
      data-page-key="sunday-sermon-portrait"
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
          {year}년 {monthName} 주일 설교 노트
        </div>
      </div>

      {/* 3. Vertical Stack (4 Sunday Cards) */}
      <div className="flex-1 flex flex-col space-y-3">
        {[1, 2, 3, 4].map((no) => (
          <div key={no} className="border border-slate-300 rounded-2xl p-3 bg-slate-50/40 space-y-2 shadow-2xs flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded text-white" style={{ backgroundColor: themeColor }}>
                {monthName} Week {no} 주일 예배
              </span>
              <span className="text-[9px] text-slate-400 font-mono">Date: ____년 __월 __일</span>
            </div>

            <div className="grid grid-cols-12 gap-2 text-[10px]">
              <div className="col-span-8 p-1 rounded bg-white border border-slate-200">
                <span className="text-[8px] text-slate-400 font-bold block">설교 제목:</span>
                <span className="text-slate-400 italic">제목 작성...</span>
              </div>
              <div className="col-span-4 p-1 rounded bg-white border border-slate-200">
                <span className="text-[8px] text-slate-400 font-bold block">본문:</span>
                <span className="text-slate-400 italic">성경 구절...</span>
              </div>
            </div>

            <div className="bg-white p-1.5 rounded-lg border border-slate-200 space-y-1">
              <span className="text-[9px] font-bold text-slate-600 block">💡 핵심 요약:</span>
              <div className="text-[9px] text-slate-400 italic">1. 핵심 메시지 내용...</div>
              <div className="text-[9px] text-slate-400 italic">2. 삶의 묵상 및 깨달음...</div>
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
