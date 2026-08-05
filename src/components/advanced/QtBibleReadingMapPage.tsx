'use client'

import React from 'react'

interface QtBibleReadingMapPageProps {
  year?: number
  monthName?: string
  themeColor?: string
  pageWidth?: number
  pageHeight?: number
}

const OLD_TESTAMENT_BOOKS = [
  '창', '출', '레', '민', '신', '수', '삿', '룻', '삼상', '삼하', '왕상', '왕하', '대상', '대하', '스', '느', '에', '욥', '시', '언', '전', '아', '이사야', '예레미야', '애', '겔', '단', '호', '요엘', '암', '오', '요나', '미', '나', '하', '습', '학', '슥', '말'
]

const NEW_TESTAMENT_BOOKS = [
  '마', '막', '눅', '요', '행', '롬', '고전', '고후', '갈', '엡', '빌', '골', '살전', '살후', '딤전', '딤후', '딛', '몬', '히', '야', '벧전', '벧후', '요한1', '요한2', '요한3', '유', '계'
]

export default function QtBibleReadingMapPage({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 768,
}: QtBibleReadingMapPageProps) {
  return (
    <div
      data-page-key="bible-map"
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
          <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold cursor-pointer shadow-xs">BIBLE 66 MAP</span>
        </div>
      </div>

      {/* 2. Page Title */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-800 tracking-wide flex items-center gap-2">
            <span>🕊️ 성경 66권 통독 여정 맵 (Bible Reading Journey)</span>
          </h1>
          <p className="text-[11px] text-slate-500 mt-0.5">성경을 읽을 때마다 권별 스티커나 색칠로 완독을 기록하는 감성 여정표</p>
        </div>
        <div className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-xs" style={{ backgroundColor: themeColor }}>
          성경 통독 미니 체크북
        </div>
      </div>

      {/* 3. Main Grid Layout */}
      <div className="grid grid-cols-12 gap-3.5 flex-1">
        {/* Left: 구약 39권 체크 맵 (7 cols) */}
        <div className="col-span-7 border border-slate-300 rounded-2xl p-3.5 bg-slate-50/40 flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-2">
            <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              📜 구약 39권 통독 체크 (Old Testament)
            </h4>
            <span className="text-[9px] text-slate-400 font-bold">39 Books</span>
          </div>

          <div className="grid grid-cols-8 gap-1.5 flex-1 py-1">
            {OLD_TESTAMENT_BOOKS.map((bName, idx) => (
              <div
                key={idx}
                className="aspect-square rounded-xl border border-slate-300 bg-white flex flex-col items-center justify-center p-1 hover:border-emerald-500 transition-colors cursor-pointer shadow-2xs group"
              >
                <span className="text-[8px] font-mono text-slate-300 font-bold group-hover:text-emerald-500">{idx + 1}</span>
                <span className="text-[10px] font-bold text-slate-700 truncate max-w-full">{bName}</span>
              </div>
            ))}
          </div>

          <div className="text-[9px] text-slate-400 text-center border-t border-slate-200 pt-1 mt-1">
            성경 권별 완독 시 형광펜이나 스티커로 체크해보세요! ✨
          </div>
        </div>

        {/* Right: 신약 27권 체크 맵 & 이달의 통독 목표 (5 cols) */}
        <div className="col-span-5 flex flex-col space-y-3">
          {/* 신약 27권 */}
          <div className="border border-slate-300 rounded-2xl p-3 bg-slate-50/40 flex-1 flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-1.5">
              <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                ✝️ 신약 27권 통독 체크 (New Testament)
              </h4>
              <span className="text-[9px] text-slate-400 font-bold">27 Books</span>
            </div>

            <div className="grid grid-cols-6 gap-1.5 flex-1 py-1">
              {NEW_TESTAMENT_BOOKS.map((bName, idx) => (
                <div
                  key={idx}
                  className="aspect-square rounded-xl border border-slate-300 bg-white flex flex-col items-center justify-center p-1 hover:border-indigo-500 transition-colors cursor-pointer shadow-2xs group"
                >
                  <span className="text-[8px] font-mono text-slate-300 font-bold group-hover:text-indigo-500">{idx + 1}</span>
                  <span className="text-[9.5px] font-bold text-slate-700 truncate max-w-full">{bName}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 이달의 읽기 목표 & 메모 */}
          <div className="border border-emerald-300 rounded-2xl p-3 bg-emerald-50/40 flex-1 flex flex-col justify-between shadow-2xs">
            <h4 className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <span>🎯 이달의 성경 통독 목표 & 스크랩</span>
            </h4>
            <div className="text-[11px] text-slate-700 font-serif flex-1 p-2 rounded-lg bg-white/80 border border-emerald-200 min-h-[40px]">
            </div>
          </div>
        </div>
      </div>

      {/* 4. Footer */}
      <div className="flex items-center justify-between border-t border-slate-300 pt-2 mt-2 text-[10px] text-slate-400">
        <span>SERMON AI QT DIARY — BIBLE READING JOURNEY MAP</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
