'use client'

import React from 'react'

interface QtSundaySermonPortraitProps {
  year?: number
  month?: number
  monthName?: string
  themeColor?: string
  pageWidth?: number
  pageHeight?: number
}

export default function QtSundaySermonPortrait({
  year = 2026,
  month = 8,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 768,
  pageHeight = 1024,
}: QtSundaySermonPortraitProps) {
  // 해당 연도 & 월의 실제 모든 주일(일요일) 날짜 및 주차 동적 계산 (4주 또는 5주 자동 감지)
  const totalDays = new Date(year, month, 0).getDate()
  const sundaysList: { no: number; day: number; dateStr: string; label: string }[] = []

  for (let d = 1; d <= totalDays; d++) {
    const dt = new Date(year, month - 1, d)
    if (dt.getDay() === 0) {
      const no = sundaysList.length + 1
      sundaysList.push({
        no,
        day: d,
        dateStr: `${String(month).padStart(2, '0')}/${String(d).padStart(2, '0')}`,
        label: `${month}월 ${d}일 주일 예배 (${no}주차)`,
      })
    }
  }

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
          <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-bold cursor-pointer shadow-xs">
            SUNDAY SERMON ({sundaysList.length}주)
          </span>
        </div>
      </div>

      {/* 2. Page Title */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-800 tracking-wide flex items-center gap-2">
            <span>🏛️ {monthName} Sunday Sermon & Pulpit Notes</span>
          </h1>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {year}년 {month}월은 총 <strong className="text-blue-700 font-bold">{sundaysList.length}번의 주일</strong>이 있습니다. 주일 설교 말씀을 기록하세요.
          </p>
        </div>
        <div className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-xs" style={{ backgroundColor: themeColor }}>
          {year}년 {month}월 ({sundaysList.length}주일 구성)
        </div>
      </div>

      {/* 3. Vertical Stack Layout for 4 or 5 Sundays */}
      <div className="flex-1 flex flex-col space-y-2">
        {sundaysList.map((sItem) => (
          <div
            key={sItem.no}
            className="border border-slate-300 rounded-2xl p-2 bg-slate-50/40 space-y-1 shadow-2xs flex-1 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-0.5">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded text-white" style={{ backgroundColor: themeColor }}>
                {sItem.label}
              </span>
              <span className="text-[9px] text-slate-500 font-mono font-bold">Date: {sItem.dateStr}</span>
            </div>

            <div className="grid grid-cols-12 gap-1.5 text-[9.5px]">
              <div className="col-span-8 p-1 rounded bg-white border border-slate-200">
                <span className="text-[8px] text-slate-400 font-bold block">설교 제목:</span>
                <span className="text-slate-400 italic">제목 작성...</span>
              </div>
              <div className="col-span-4 p-1 rounded bg-white border border-slate-200">
                <span className="text-[8px] text-slate-400 font-bold block">본문:</span>
                <span className="text-slate-400 italic">성경 구절...</span>
              </div>
            </div>

            <div className="bg-white p-1 rounded-lg border border-slate-200 flex items-center justify-between text-[9px]">
              <span className="font-bold text-slate-600">💡 핵심 대지:</span>
              <span className="text-slate-400 italic">1. 핵심 요약 내용...</span>
              <span className="text-blue-900 bg-blue-50 px-1 py-0.5 rounded text-[8px] font-bold">Action Point</span>
            </div>
          </div>
        ))}
      </div>

      {/* 4. Footer */}
      <div className="flex items-center justify-between border-t border-slate-300 pt-1.5 mt-1 text-[10px] text-slate-400">
        <span>SERMON AI QT DIARY — SUNDAY SERMON NOTES ({sundaysList.length} SUNDAYS)</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
