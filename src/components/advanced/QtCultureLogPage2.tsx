'use client'

import React from 'react'
import QtQuickIndexNav from './QtQuickIndexNav'

interface QtCultureLogPage2Props {
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

export default function QtCultureLogPage2({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 768,
}: QtCultureLogPage2Props) {
  const monthNum = MONTH_MAP[monthName] || 8

  return (
    <div
      data-page-key="culture"
      data-page-type="full-bleed"
      className="qt-page relative bg-white text-slate-800 flex flex-col justify-between overflow-hidden shadow-md mx-auto"
      style={{
        width: `${pageWidth}px`,
        height: `${pageHeight}px`,
        padding: '20px 48px 20px 24px',
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
          <span>CULTURE COLLECTION (VOL. 2)</span>
          <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-bold text-[10px] shadow-xs">
            🎞️ 8 TICKETS COLLECTION (총 12작품 지원)
          </span>
        </div>
      </div>

      {/* 2. Page Title */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-xl font-sans font-bold text-slate-800 tracking-wide whitespace-nowrap">
            🎞️ {monthName} Culture Collection (추가 8작품 컬렉션)
          </h1>
          <p className="text-[10.5px] text-slate-500 mt-0.5 whitespace-nowrap">
            한 달 동안 감상한 다양한 영화, 도서, 전시, 공연 8개 추가 수집 티켓북 서식입니다.
          </p>
        </div>

        <div className="px-3 py-1 rounded-full text-xs font-bold text-rose-950 bg-rose-50 border border-rose-200 shadow-xs whitespace-nowrap">
          월 12개 작품 수집 완성 맵
        </div>
      </div>

      {/* 3. 8 Ticket Stub Cards Grid (2 rows x 4 cols) */}
      <div className="grid grid-cols-4 gap-2.5 flex-1 mb-2">
        {[
          { id: '#05', type: '🎬 FILM', color: 'border-rose-300 bg-rose-50/20' },
          { id: '#06', type: '📚 BOOK', color: 'border-indigo-300 bg-indigo-50/20' },
          { id: '#07', type: '🏛️ EXHIBITION', color: 'border-amber-300 bg-amber-50/20' },
          { id: '#08', type: '🎭 STAGE', color: 'border-purple-300 bg-purple-50/20' },
          { id: '#09', type: '🎬 DRAMA', color: 'border-emerald-300 bg-emerald-50/20' },
          { id: '#10', type: '🎧 AUDIO', color: 'border-blue-300 bg-blue-50/20' },
          { id: '#11', type: '📚 ESSAY', color: 'border-teal-300 bg-teal-50/20' },
          { id: '#12', type: '🎨 ART', color: 'border-rose-300 bg-rose-50/20' },
        ].map((t, idx) => (
          <div
            key={idx}
            className={`border rounded-2xl p-2 ${t.color} flex flex-col justify-between shadow-2xs space-y-1`}
          >
            {/* Header Barcode */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-1 text-[8.5px]">
              <span className="font-mono font-bold text-slate-600">{t.id} {t.type}</span>
              <span className="text-amber-500 font-bold">★★★★★</span>
            </div>

            {/* Title & Details */}
            <div className="bg-white/90 p-1.5 rounded-xl border border-slate-200/70 space-y-1">
              <span className="text-[7.5px] font-bold text-slate-400 block">작품 제목 (Title):</span>
              <div className="text-slate-800 font-bold font-sans text-[9px] min-h-[12px] truncate">_________________</div>
              <div className="flex justify-between text-[8px] text-slate-400 font-mono">
                <span>____.__.__</span>
                <span>추천: 100%</span>
              </div>
            </div>

            {/* Short Impression Quote */}
            <div className="bg-white/90 p-1.5 rounded-xl border border-slate-200/70 flex-1 flex flex-col justify-between">
              <span className="text-[7.5px] font-bold text-slate-500 block">💬 한 줄 평 & 명대사:</span>
              <div className="border-b border-dashed border-slate-200 h-3 text-[8px] text-slate-400 font-sans" />
            </div>
          </div>
        ))}
      </div>

      {/* 4. Bottom Cultural Energy Index & Reflection Banner */}
      <div className="bg-rose-50/60 border border-rose-200 p-2 rounded-2xl flex items-center justify-between text-[9.5px] shadow-2xs">
        <span className="text-rose-950 font-bold flex items-center gap-1.5">
          <span>💖 한 달 문화 충전 지수: 100% 달성</span>
          <span className="text-rose-700 font-normal font-sans">| 풍요로운 예술과 명작이 삶을 깊게 채웠습니다.</span>
        </span>
        <span className="text-rose-800 font-mono font-bold">Total 12 Works Collected</span>
      </div>

      {/* 5. Footer */}
      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1.5 border-t border-slate-200 mt-1.5">
        <span>PREMIUM CULTURE STUDIO — 8 TICKETS COLLECTION (VOL. 2)</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
