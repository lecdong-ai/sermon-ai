'use client'

import React from 'react'

interface QtPrayerAnswerPortraitProps {
  year?: number
  monthName?: string
  themeColor?: string
  pageWidth?: number
  pageHeight?: number
}

export default function QtPrayerAnswerPortrait({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 768,
  pageHeight = 1024,
}: QtPrayerAnswerPortraitProps) {
  return (
    <div
      data-page-key="prayer-log-portrait"
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
          <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-bold cursor-pointer shadow-xs">PRAYER & GRACE</span>
        </div>
      </div>

      {/* 2. Page Title */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-800 tracking-wide flex items-center gap-2">
            <span>🙏 {monthName} Prayer & Grace Milestone</span>
          </h1>
          <p className="text-[11px] text-slate-500 mt-0.5">이달의 간절한 기도 제목과 하나님께서 응답해주신 은혜의 순간을 기록하는 영성 기록장</p>
        </div>
        <div className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-xs" style={{ backgroundColor: themeColor }}>
          {year}년 {monthName} 은혜의 기념비
        </div>
      </div>

      {/* 3. Vertical Layout */}
      <div className="flex-1 flex flex-col space-y-4">
        {/* Top: 31일 큐티 출석 습관 트래커 & 영성 체온계 */}
        <div className="grid grid-cols-2 gap-3 border-b border-slate-200 pb-3">
          {/* 31일 큐티 트래커 */}
          <div className="border border-slate-300 rounded-xl p-3 bg-slate-50/50">
            <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: themeColor }} />
              🌿 31일 큐티 습관 트래커
            </h4>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                <div key={d} className="aspect-square rounded border border-slate-300 bg-white text-[9px] font-bold text-slate-400 flex items-center justify-center">
                  {d}
                </div>
              ))}
            </div>
          </div>

          {/* 영성 체온계 */}
          <div className="border border-slate-300 rounded-xl p-3 bg-slate-50/50 flex flex-col justify-between">
            <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: themeColor }} />
              💖 이달의 마음 영성 체온계
            </h4>
            <div className="space-y-1.5 text-[10px]">
              <div className="flex items-center justify-between">
                <span>😊 감사 지수</span>
                <span>💗💗💗💗💗</span>
              </div>
              <div className="flex items-center justify-between">
                <span>🕊️ 평안 지수</span>
                <span>💙💙💙💙💙</span>
              </div>
              <div className="flex items-center justify-between">
                <span>🔥 기도 지수</span>
                <span>💛💛💛💛💛</span>
              </div>
            </div>
          </div>
        </div>

        {/* Middle: 4개의 기도 & 응답 카드 */}
        <div className="flex-1 space-y-2">
          <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: themeColor }} />
            🙏 이달의 기도 제목 & 응답의 날 (Prayer & Answers)
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map((no) => (
              <div key={no} className="border border-slate-300 rounded-xl p-2.5 bg-white space-y-1.5 shadow-2xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded text-white" style={{ backgroundColor: themeColor }}>
                    기도 {no}
                  </span>
                  <span className="text-[9px] text-slate-400">응답일: __월 __일</span>
                </div>
                <div className="text-[10px] text-slate-700 min-h-[30px]">
                </div>
                <div className="text-[9px] text-amber-700 bg-amber-50 rounded px-1.5 py-0.5 border border-amber-200">
                  ✨ 응답 소감:
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: 약속의 말씀 & TOP 3 감사 */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="border border-amber-300 rounded-xl p-3 bg-amber-50/40 text-center">
            <h5 className="text-[10px] font-bold text-amber-800 mb-1">📖 이달의 약속의 말씀</h5>
            <p className="text-[10px] font-serif font-bold text-slate-800">
              &quot;너희 구핛 것을 감사함으로 하나님께 아뢰라&quot;
            </p>
            <span className="text-[9px] text-amber-700 font-bold">(빌립보서 4:6)</span>
          </div>

          <div className="border border-slate-300 rounded-xl p-3 bg-slate-50/50 space-y-1">
            <h5 className="text-[10px] font-bold text-slate-700">🎁 TOP 3 감사 순간</h5>
            <div className="text-[9px] text-slate-400 space-y-0.5">
              <div>1. __________________</div>
              <div>2. __________________</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Footer */}
      <div className="flex items-center justify-between border-t border-slate-300 pt-2 mt-2 text-[10px] text-slate-400">
        <span>SERMON AI QT DIARY — PRAYER & GRACE MILESTONE</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
