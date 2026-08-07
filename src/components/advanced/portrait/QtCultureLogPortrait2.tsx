'use client'

import React from 'react'

interface QtCultureLogPortrait2Props {
  year?: number
  monthName?: string
  themeColor?: string
  pageWidth?: number
  pageHeight?: number
}

export default function QtCultureLogPortrait2({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 1448,
}: QtCultureLogPortrait2Props) {
  return (
    <div
      data-page-key="culture-log-2-portrait"
      data-page-type="full-bleed"
      className="qt-page relative bg-white text-slate-800 flex flex-col justify-between overflow-hidden shadow-md mx-auto"
      style={{
        width: `${pageWidth}px`,
        height: `${pageHeight}px`,
        padding: '36px 44px',
        boxSizing: 'border-box',
        fontFamily: "'Noto Sans KR', 'Pretendard', sans-serif",
      }}
    >
      {/* 1. Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-300 pb-3 mb-3">
        <div className="flex items-center space-x-4 text-xs font-medium tracking-wider text-slate-400 font-mono">
          <span>YEARLY</span>
          <span>{year}</span>
          <span className="px-2.5 py-0.5 rounded text-white font-bold" style={{ backgroundColor: themeColor }}>
            {monthName.toUpperCase().slice(0, 3)}
          </span>
        </div>
        <span className="px-3 py-1 rounded-full bg-rose-600 text-white font-bold text-xs shadow-xs">
          🎞️ 8 TICKETS COLLECTION (VOL. 2)
        </span>
      </div>

      {/* 2. Page Title */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-xl font-serif font-bold text-slate-800 tracking-wide flex items-center gap-2 whitespace-nowrap">
            <span>🎞️ {monthName} Culture Collection</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            한 달 동안 감상한 영화, 도서, 전시, 음악 8개 추가 수집 티켓북 서식입니다. (총 12개 수집)
          </p>
        </div>
        <div className="px-4 py-1.5 rounded-full text-xs font-bold text-rose-950 bg-rose-50 border border-rose-200 shadow-xs">
          월 12개 작품 수집 완성 맵
        </div>
      </div>

      {/* 3. 8 Ticket Stub Cards Grid (4 rows x 2 cols) */}
      <div className="grid grid-cols-2 gap-3 flex-1 mb-3">
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
            className={`border rounded-2xl p-3 ${t.color} flex flex-col justify-between shadow-2xs space-y-1.5`}
          >
            {/* Header Barcode */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 text-xs">
              <span className="font-mono font-bold text-slate-600">{t.id} {t.type}</span>
              <span className="text-amber-500 font-bold">★ ★ ★ ★ ★</span>
            </div>

            {/* Title & Details */}
            <div className="bg-white/90 p-2 rounded-xl border border-slate-200/70 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 block">작품 제목 (Title):</span>
              <div className="text-slate-800 font-bold font-serif text-xs min-h-[16px] truncate">______________________</div>
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>____.__.__</span>
                <span>추천: 100%</span>
              </div>
            </div>

            {/* Quote Line */}
            <div className="bg-white/90 p-2 rounded-xl border border-slate-200/70 flex-1 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-500 block">💬 한 줄 평 & 명대사:</span>
              <div className="border-b border-dashed border-slate-200 h-4 text-xs text-slate-400 font-serif" />
            </div>
          </div>
        ))}
      </div>

      {/* 4. Bottom Reflection Banner */}
      <div className="bg-rose-50/60 border border-rose-200 p-3 rounded-2xl flex items-center justify-between text-xs mb-3 shadow-xs">
        <span className="text-rose-950 font-bold flex items-center gap-2">
          <span>💖 한 달 문화 충전 지수: 100% 달성</span>
          <span className="text-rose-700 font-normal font-serif">| 풍요로운 예술이 내 삶을 아름답게 채웠습니다.</span>
        </span>
      </div>

      {/* 5. Footer */}
      <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-300">
        <span>PREMIUM CULTURE STUDIO — 8 TICKETS COLLECTION (VOL. 2)</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
