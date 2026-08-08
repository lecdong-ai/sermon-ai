'use client'

import React from 'react'
import QtQuickIndexNavPortrait from './QtQuickIndexNavPortrait'

interface QtCultureLogPortrait2Props {
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

export default function QtCultureLogPortrait2({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 1448,
}: QtCultureLogPortrait2Props) {
  const monthNum = MONTH_MAP[monthName] || 8

  return (
    <div
      data-page-key="culture"
      data-page-type="full-bleed"
      className="qt-page relative bg-white text-slate-800 flex flex-col justify-between overflow-hidden shadow-md mx-auto"
      style={{
        width: `${pageWidth}px`,
        height: `${pageHeight}px`,
        padding: '52px 20px 20px 20px',
        boxSizing: 'border-box',
        fontFamily: "'Noto Sans KR', 'Pretendard', sans-serif",
      }}
    >
      <QtQuickIndexNavPortrait currentMonth={monthNum} activeTab="tracker" themeColor={themeColor} />
      {/* 1. Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-300 pb-2 mb-2">
        <div className="flex items-center space-x-3 text-xs font-medium tracking-wider text-slate-400 font-mono">
          <span>YEARLY</span>
          <span>{year}</span>
          <span className="px-2 py-0.5 rounded text-white font-bold" style={{ backgroundColor: themeColor }}>
            {monthName.toUpperCase().slice(0, 3)}
          </span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-bold text-[10.5px] shadow-2xs font-mono">
          🎞️ 8 TICKETS COLLECTION
        </span>
      </div>

      {/* 2. Page Title */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-xl font-serif font-bold text-slate-800 tracking-wide flex items-center gap-2 whitespace-nowrap">
            <span>🎞️ {monthName} Culture Collection</span>
          </h1>
          <p className="text-[11px] text-slate-500 mt-0.5">
            한 달 동안 감상한 영화, 도서, 전시 8개 추가 수집 티켓북 서식입니다. (총 12개 수집 완수)
          </p>
        </div>
        <div className="px-3 py-1 rounded-full text-[11px] font-bold text-rose-950 bg-rose-50 border border-rose-200 shadow-2xs whitespace-nowrap">
          12개 작품 완수 맵
        </div>
      </div>

      {/* 3. 8 Ticket Stub Cards Grid (4 rows x 2 cols) */}
      <div className="grid grid-cols-2 gap-2 flex-1 mb-2">
        {[
          { id: '#05', type: '🎬 FILM', color: 'border-rose-200 bg-rose-50/20' },
          { id: '#06', type: '📚 BOOK', color: 'border-indigo-200 bg-indigo-50/20' },
          { id: '#07', type: '🏛️ EXHIBITION', color: 'border-amber-200 bg-amber-50/20' },
          { id: '#08', type: '🎭 STAGE', color: 'border-purple-200 bg-purple-50/20' },
          { id: '#09', type: '🎬 DRAMA', color: 'border-emerald-200 bg-emerald-50/20' },
          { id: '#10', type: '🎧 AUDIO', color: 'border-blue-200 bg-blue-50/20' },
          { id: '#11', type: '📚 ESSAY', color: 'border-teal-200 bg-teal-50/20' },
          { id: '#12', type: '🎨 ART', color: 'border-rose-200 bg-rose-50/20' },
        ].map((t, idx) => (
          <div
            key={idx}
            className={`border rounded-xl p-2.5 ${t.color} flex flex-col justify-between shadow-2xs space-y-1`}
          >
            {/* Header Barcode */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-1 text-[10px]">
              <span className="font-mono font-bold text-slate-600">{t.id} {t.type}</span>
              <span className="text-amber-500 font-bold text-[9px]">★ ★ ★ ★ ★</span>
            </div>

            {/* Title & Details */}
            <div className="bg-white/90 p-1.5 rounded-lg border border-slate-200/70 space-y-0.5">
              <span className="text-[9px] font-bold text-slate-400 block">작품 제목 (Title):</span>
              <div className="text-slate-800 font-bold font-serif text-[10.5px] min-h-[14px] truncate">______________________</div>
              <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                <span>____.__.__</span>
                <span>추천: 100%</span>
              </div>
            </div>

            {/* Quote Line */}
            <div className="bg-white/90 p-1.5 rounded-lg border border-slate-200/70 flex-1 flex flex-col justify-between">
              <span className="text-[9.5px] font-bold text-slate-500 block">💬 한 줄 평 & 명대사:</span>
              <div className="border-b border-dashed border-slate-200 h-3.5 text-[9.5px] text-slate-400 font-serif" />
            </div>
          </div>
        ))}
      </div>

      {/* 4. Bottom Reflection Banner */}
      <div className="bg-rose-50/60 border border-rose-200 p-2 rounded-xl flex items-center justify-between text-[11px] mb-2 shadow-2xs">
        <span className="text-rose-950 font-bold flex items-center gap-2">
          <span>💖 한 달 문화 충전 지수: 100% 달성</span>
          <span className="text-rose-700 font-normal font-serif">| 풍요로운 예술이 내 삶을 아름답게 채웠습니다.</span>
        </span>
      </div>

      {/* 5. Footer */}
      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1.5 border-t border-slate-200">
        <span>PREMIUM CULTURE STUDIO — 8 TICKETS COLLECTION (VOL. 2)</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
