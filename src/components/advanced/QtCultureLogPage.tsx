'use client'

import React from 'react'
import QtQuickIndexNav from './QtQuickIndexNav'

interface QtCultureLogPageProps {
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

export default function QtCultureLogPage({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 768,
}: QtCultureLogPageProps) {
  const monthNum = MONTH_MAP[monthName] || 8

  return (
    <div
      data-page-key="culture"
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
      <div className="flex items-center justify-between border-b border-slate-300 pb-2 mb-2">
        <div className="flex items-center space-x-3 text-[11px] font-medium tracking-wider text-slate-400 font-mono">
          <span>YEARLY</span>
          <span>{year}</span>
          <span className="px-2 py-0.5 rounded text-white font-bold" style={{ backgroundColor: themeColor }}>
            {monthName.toUpperCase().slice(0, 3)}
          </span>
        </div>

        <div className="flex items-center space-x-3 text-[11px] font-medium text-slate-400">
          <span>CULTURE & INSIGHT</span>
          <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-bold text-[10px] shadow-xs">
            🎬 TICKET STUB & CULTURE LOG
          </span>
        </div>
      </div>

      {/* 2. Page Title & Genre Pills */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-xl font-sans font-bold text-slate-800 tracking-wide flex items-center gap-2">
            <span>🎬 {monthName} Ticket Stub & Cultural Vision Pass</span>
          </h1>
          <p className="text-[10.5px] text-slate-500 mt-0.5">
            영화, 책, 전시, 뮤지컬에서 만난 감동의 순간과 가슴을 울린 인생 명대사를 기록하세요.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-[9.5px]">
          <span className="px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-800 font-bold">🎬 영화</span>
          <span className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 font-bold">📚 도서</span>
          <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-bold">🏛️ 전시</span>
          <span className="px-2 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-purple-800 font-bold">🎭 공연</span>
        </div>
      </div>

      {/* 3. Top Pick of the Month Banner (👑 이번 달 최고의 인생 작품) */}
      <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-indigo-500/10 border border-amber-200/80 rounded-2xl p-2.5 mb-2.5 shadow-2xs">
        <div className="flex items-center justify-between border-b border-amber-200/60 pb-1 mb-1">
          <span className="text-[10.5px] font-bold text-amber-950 font-sans flex items-center gap-1.5">
            <span>👑 MONTHLY BEST PICK (이번 달 최고의 인생 작품)</span>
          </span>
          <span className="text-[9px] font-bold text-amber-700 font-mono">★★★★★ MUST SEE</span>
        </div>

        <div className="grid grid-cols-12 gap-2 text-[9px]">
          <div className="col-span-5 bg-white/80 p-1.5 rounded-xl border border-amber-200/60">
            <span className="text-[8px] font-bold text-slate-400 block">작품명 & 카테고리:</span>
            <div className="text-slate-800 font-bold font-sans min-h-[14px]">________________________________</div>
          </div>
          <div className="col-span-7 bg-white/80 p-1.5 rounded-xl border border-amber-200/60">
            <span className="text-[8px] font-bold text-amber-800 block">💬 내 삶에 준 영감 & 인생 명대사:</span>
            <div className="text-slate-700 font-sans italic min-h-[14px]">__________________________________________________</div>
          </div>
        </div>
      </div>

      {/* 4. 4 Vintage Ticket Stub Cards Grid (2x2 Grid) */}
      <div className="grid grid-cols-2 gap-3 flex-1">
        {[
          { id: 'TICKET #01', type: '🎬 영화 / FILM', color: 'border-rose-300 bg-rose-50/30' },
          { id: 'TICKET #02', type: '📚 도서 / BOOK', color: 'border-indigo-300 bg-indigo-50/30' },
          { id: 'TICKET #03', type: '🏛️ 전시 / EXHIBITION', color: 'border-amber-300 bg-amber-50/30' },
          { id: 'TICKET #04', type: '🎭 공연 / STAGE', color: 'border-purple-300 bg-purple-50/30' },
        ].map((t, idx) => (
          <div
            key={idx}
            className={`border rounded-2xl p-2.5 ${t.color} flex flex-col justify-between shadow-2xs relative overflow-hidden`}
          >
            {/* Ticket Stub Header with Barcode */}
            <div className="flex items-center justify-between border-b border-slate-300/80 pb-1">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono font-bold text-slate-600">{t.id}</span>
                <span className="text-[9px] font-bold text-slate-800 font-sans">{t.type}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[8px] tracking-widest text-slate-400">||||| ||| ||||</span>
                <span className="text-[8.5px] text-amber-500 font-bold">★★★★★</span>
              </div>
            </div>

            {/* Ticket Body Details */}
            <div className="grid grid-cols-12 gap-1.5 text-[9px] my-1">
              <div className="col-span-7 bg-white/90 p-1.5 rounded-xl border border-slate-200/70">
                <span className="text-[8px] font-bold text-slate-400 block">작품 제목 (Title):</span>
                <div className="text-slate-800 font-bold font-sans min-h-[14px]">________________________</div>
              </div>
              <div className="col-span-5 bg-white/90 p-1.5 rounded-xl border border-slate-200/70">
                <span className="text-[8px] font-bold text-slate-400 block">관람일 / 함께한 사람:</span>
                <div className="text-slate-600 font-mono text-[8.5px] min-h-[14px]">____.__.__ / ______</div>
              </div>
            </div>

            {/* Ticket Quote & Review Line */}
            <div className="bg-white/90 p-1.5 rounded-xl border border-slate-200/70 flex-1 flex flex-col justify-between">
              <span className="text-[8.5px] font-bold text-slate-700 block">💬 마음에 새긴 명대사 / 한 줄 평:</span>
              <div className="border-b border-dashed border-slate-200 h-3 text-[8.5px] text-slate-400 font-sans" />
              <div className="border-b border-dashed border-slate-200 h-3 text-[8.5px] text-slate-400 font-sans" />
            </div>

            {/* Ticket Footer Badges */}
            <div className="flex justify-between items-center text-[8.5px] text-slate-500 pt-1">
              <span>추천도: 🌟 🌟 🌟 🌟 🌟</span>
              <span>다시 볼 의향: YES □ / NO □</span>
            </div>
          </div>
        ))}
      </div>

      {/* 5. Footer */}
      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1.5 border-t border-slate-200 mt-1.5">
        <span>PREMIUM CULTURE STUDIO — TICKET STUB & VISION PASS</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
