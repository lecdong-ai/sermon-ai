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
  { name: '창', chapters: 50 }, { name: '출', chapters: 40 }, { name: '레', chapters: 27 }, { name: '민', chapters: 36 }, { name: '신', chapters: 34 },
  { name: '수', chapters: 24 }, { name: '삿', chapters: 21 }, { name: '룻', chapters: 4 }, { name: '삼상', chapters: 31 }, { name: '삼하', chapters: 24 },
  { name: '왕상', chapters: 22 }, { name: '왕하', chapters: 25 }, { name: '대상', chapters: 29 }, { name: '대하', chapters: 36 }, { name: '스', chapters: 10 },
  { name: '느', chapters: 13 }, { name: '에', chapters: 10 }, { name: '욥', chapters: 42 }, { name: '시', chapters: 150 }, { name: '잠', chapters: 31 },
  { name: '전', chapters: 12 }, { name: '아', chapters: 8 }, { name: '사', chapters: 66 }, { name: '렘', chapters: 52 }, { name: '애', chapters: 5 },
  { name: '겔', chapters: 48 }, { name: '단', chapters: 12 }, { name: '호', chapters: 14 }, { name: '욜', chapters: 3 }, { name: '암', chapters: 9 },
  { name: '옵', chapters: 1 }, { name: '욘', chapters: 4 }, { name: '미', chapters: 7 }, { name: '나', chapters: 3 }, { name: '하', chapters: 3 },
  { name: '습', chapters: 3 }, { name: '학', chapters: 2 }, { name: '슥', chapters: 14 }, { name: '말', chapters: 4 },
]

const NEW_TESTAMENT_BOOKS = [
  { name: '마', chapters: 28 }, { name: '막', chapters: 16 }, { name: '눅', chapters: 24 }, { name: '요', chapters: 21 }, { name: '행', chapters: 28 },
  { name: '롬', chapters: 16 }, { name: '고전', chapters: 16 }, { name: '고후', chapters: 13 }, { name: '갈', chapters: 6 }, { name: '엡', chapters: 6 },
  { name: '빌', chapters: 4 }, { name: '골', chapters: 4 }, { name: '살전', chapters: 5 }, { name: '살후', chapters: 3 }, { name: '딤전', chapters: 6 },
  { name: '딤후', chapters: 4 }, { name: '딛', chapters: 3 }, { name: '몬', chapters: 1 }, { name: '히', chapters: 13 }, { name: '야', chapters: 5 },
  { name: '벧전', chapters: 5 }, { name: '벧후', chapters: 3 }, { name: '요1', chapters: 5 }, { name: '요2', chapters: 1 }, { name: '요3', chapters: 1 },
  { name: '유', chapters: 1 }, { name: '계', chapters: 22 },
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
        padding: '12px 18px',
        boxSizing: 'border-box',
        fontFamily: "'Noto Sans KR', 'Pretendard', sans-serif",
      }}
    >
      {/* 1. Header Navigation Bar */}
      <div className="flex items-center justify-between border-b border-slate-300 pb-1 mb-1.5 shrink-0">
        <div className="flex items-center space-x-3 text-[10.5px] font-medium tracking-wider text-slate-400">
          <span data-nav-target="calendar" className="cursor-pointer hover:text-slate-600">YEARLY</span>
          <span>{year}</span>
          <span data-nav-target="calendar" className="px-1.5 py-0.5 rounded text-white font-bold cursor-pointer" style={{ backgroundColor: themeColor }}>
            {monthName.toUpperCase().slice(0, 3)}
          </span>
        </div>

        <div className="flex items-center space-x-3 text-[10.5px] font-medium text-slate-400">
          <span data-nav-target="calendar" className="hover:text-slate-600 cursor-pointer">MONTHLY</span>
          <span data-nav-target="overview" className="hover:text-slate-600 cursor-pointer">OVERVIEW</span>
          <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold cursor-pointer shadow-xs">BIBLE 66 MAP</span>
        </div>
      </div>

      {/* 2. Page Title */}
      <div className="flex items-center justify-between mb-1.5 shrink-0">
        <div>
          <h1 className="text-lg sm:text-xl font-serif font-bold text-slate-900 tracking-wide flex items-center gap-2">
            <span>🕊️ 성경 66권 통독 여정 맵 (Bible Reading Journey)</span>
          </h1>
          <p className="text-[10px] text-slate-500 mt-0.5">권별 총 장수(숫자)와 함께 읽을 때마다 스티커나 색칠로 완독을 체크하세요!</p>
        </div>
        <div className="px-2.5 py-0.5 rounded-full text-xs font-bold text-white shadow-xs shrink-0" style={{ backgroundColor: themeColor }}>
          성경 통독 체크북
        </div>
      </div>

      {/* 3. Main Grid Layout */}
      <div className="grid grid-cols-12 gap-2 flex-1 min-h-0">
        {/* Left: 구약 39권 체크 맵 (7 cols) */}
        <div className="col-span-7 border border-slate-300 rounded-xl p-2 bg-slate-50/50 flex flex-col justify-between shadow-2xs min-h-0">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-1 shrink-0">
            <h4 className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span className="whitespace-nowrap">📜 구약 39권 통독 체크 (OLD TESTAMENT)</span>
            </h4>
            <span className="text-[9.5px] text-slate-500 font-bold whitespace-nowrap">39 Books</span>
          </div>

          <div className="grid grid-cols-8 gap-1 flex-1 min-h-0 py-0.5">
            {OLD_TESTAMENT_BOOKS.map((b, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-slate-300 bg-white flex flex-col items-center justify-center p-0.5 hover:border-emerald-500 transition-colors cursor-pointer shadow-2xs group"
              >
                <span className="text-[9px] font-bold text-emerald-600 group-hover:text-emerald-700 leading-none mb-0.5">{b.chapters}</span>
                <span className="text-[11px] font-extrabold text-slate-800 truncate max-w-full leading-none">{b.name}</span>
              </div>
            ))}
          </div>

          <div className="text-[9px] text-slate-500 font-medium text-center border-t border-slate-200 pt-0.5 mt-0.5 shrink-0">
            성경 권별 완독 시 형광펜이나 스티커로 체크해보세요! ✨
          </div>
        </div>

        {/* Right: 신약 27권 체크 맵 & 이달의 통독 목표 (5 cols) */}
        <div className="col-span-5 flex flex-col space-y-1.5 min-h-0">
          {/* 신약 27권 */}
          <div className="border border-slate-300 rounded-xl p-2 bg-slate-50/50 flex-1 flex flex-col justify-between shadow-2xs min-h-0">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-1 shrink-0">
              <h4 className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                <span className="whitespace-nowrap">✝️ 신약 27권 통독 체크 (NEW TESTAMENT)</span>
              </h4>
              <span className="text-[9.5px] text-slate-500 font-bold whitespace-nowrap">27 Books</span>
            </div>

            <div className="grid grid-cols-6 gap-1 flex-1 min-h-0 py-0.5">
              {NEW_TESTAMENT_BOOKS.map((b, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-slate-300 bg-white flex flex-col items-center justify-center p-0.5 hover:border-indigo-500 transition-colors cursor-pointer shadow-2xs group"
                >
                  <span className="text-[9px] font-bold text-indigo-600 group-hover:text-indigo-700 leading-none mb-0.5">{b.chapters}</span>
                  <span className="text-[11px] font-extrabold text-slate-800 truncate max-w-full leading-none">{b.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 이달의 읽기 목표 & 메모 */}
          <div className="border border-emerald-300 rounded-xl p-2 bg-emerald-50/50 flex-1 flex flex-col justify-between shadow-2xs min-h-0">
            <h4 className="text-[10.5px] font-bold text-emerald-950 uppercase tracking-wider mb-0.5 flex items-center gap-1.5 shrink-0">
              <span>🎯 이달의 성경 통독 목표 & 스크랩</span>
            </h4>
            <div className="text-[10.5px] text-slate-700 font-serif flex-1 p-1.5 rounded-lg bg-white/90 border border-emerald-200 min-h-[30px]">
            </div>
          </div>
        </div>
      </div>

      {/* 4. Footer */}
      <div className="flex items-center justify-between border-t border-slate-300 pt-1 mt-1 text-[9.5px] text-slate-400 font-medium shrink-0">
        <span>SERMON AI QT DIARY — BIBLE READING JOURNEY MAP</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
