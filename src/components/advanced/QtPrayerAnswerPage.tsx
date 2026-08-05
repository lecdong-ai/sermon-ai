'use client'

import React from 'react'

interface QtPrayerAnswerPageProps {
  year?: number
  monthName?: string
  themeColor?: string
  pageWidth?: number
  pageHeight?: number
}

export default function QtPrayerAnswerPage({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 768,
}: QtPrayerAnswerPageProps) {
  return (
    <div
      data-page-key="prayer-log"
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

      {/* 3. Main Content Grid (3 Columns) */}
      <div className="grid grid-cols-12 gap-4 flex-1">
        {/* Left Column: 31-Day QT Habit & Spiritual Thermometer (4 cols) */}
        <div className="col-span-4 flex flex-col space-y-3 border-r border-slate-200 pr-3">
          {/* 31일 큐티 출석 트래커 */}
          <div className="border border-slate-300 rounded-xl p-3 bg-slate-50/50 flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: themeColor }} />
                🌿 31일 큐티 출석 습관 트래커
              </h4>
              <span className="text-[10px] text-slate-400 font-bold">Daily Streak</span>
            </div>
            <div className="grid grid-cols-7 gap-1.5 py-1">
              {Array.from({ length: 31 }, (_, i) => i + 1).map((dayNum) => (
                <div
                  key={dayNum}
                  className="aspect-square rounded-lg border border-slate-300 bg-white flex items-center justify-center text-[10px] font-bold text-slate-400 hover:border-amber-400 hover:text-amber-600 transition-colors cursor-pointer shadow-2xs"
                >
                  {dayNum}
                </div>
              ))}
            </div>
            <div className="text-[9px] text-slate-400 text-center mt-1 border-t border-slate-200 pt-1">
              큐티를 완료한 날 동그라미/스티커로 색칠해보세요! ✨
            </div>
          </div>

          {/* 영성 체온계 & 감사 지수 */}
          <div className="border border-slate-300 rounded-xl p-3 bg-slate-50/50 flex-1 flex flex-col justify-between">
            <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: themeColor }} />
              💖 이달의 마음 영성 체온계
            </h4>
            <div className="space-y-2 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">😊 감사와 기쁨 지수</span>
                <div className="flex gap-1">
                  {['💗', '💗', '💗', '💗', '💗'].map((h, i) => (
                    <span key={i} className="text-xs cursor-pointer hover:scale-125 transition-transform">{h}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">🕊️ 마음의 평안 지수</span>
                <div className="flex gap-1">
                  {['💙', '💙', '💙', '💙', '💙'].map((h, i) => (
                    <span key={i} className="text-xs cursor-pointer hover:scale-125 transition-transform">{h}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">🔥 기도와 간절함 지수</span>
                <div className="flex gap-1">
                  {['💛', '💛', '💛', '💛', '💛'].map((h, i) => (
                    <span key={i} className="text-xs cursor-pointer hover:scale-125 transition-transform">{h}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Column: 기도 제목 & 응답 기록 카드 5개 (5 cols) */}
        <div className="col-span-5 flex flex-col space-y-2 border-r border-slate-200 pr-3">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: themeColor }} />
              🙏 이달의 기도 제목 & 응답의 날 (Prayer & Answers)
            </h4>
            <span className="text-[9px] text-slate-400">Date / Answer</span>
          </div>

          {Array.from({ length: 5 }, (_, i) => i + 1).map((no) => (
            <div key={no} className="border border-slate-300 rounded-xl p-2.5 bg-white shadow-2xs space-y-1.5 flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded text-white" style={{ backgroundColor: themeColor }}>
                  기도 {no}
                </span>
                <span className="text-[9px] text-slate-400 font-mono">응답일: ____월 ____일</span>
              </div>
              <div className="text-[11px] text-slate-400 font-serif italic min-h-[20px]">
                기도 제목: (하나님께 아뢰는 간절한 기도...)
              </div>
              <div className="text-[10px] text-amber-700 bg-amber-50/60 rounded px-2 py-0.5 border border-amber-200/50 flex items-center justify-between">
                <span>✨ 응답 및 은혜의 소감:</span>
                <span className="text-[9px] font-bold text-amber-600">Amen!</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: 이달의 약속의 말씀 & TOP 3 감사 순간 (3 cols) */}
        <div className="col-span-3 flex flex-col space-y-3">
          {/* 약속의 말씀 카드 */}
          <div className="border border-amber-300 rounded-xl p-3 bg-amber-50/40 flex-1 flex flex-col justify-between shadow-2xs">
            <h4 className="text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <span>📖 이달의 약속의 말씀</span>
            </h4>
            <div className="flex-1 flex flex-col items-center justify-center p-2 rounded-lg bg-white/80 border border-amber-200 text-center space-y-1">
              <p className="text-[11px] font-serif font-bold text-slate-800 leading-relaxed">
                &quot;아무 것도 염려하지 말고 다만 모든 일에 기도와 구구로, 너희 구핛 것을 감사함으로 하나님께 아뢰라&quot;
              </p>
              <span className="text-[9px] font-bold text-amber-700">(빌립보서 4:6)</span>
            </div>
          </div>

          {/* TOP 3 감사 순간 */}
          <div className="border border-slate-300 rounded-xl p-3 bg-slate-50/50 flex-[1.5] flex flex-col justify-between">
            <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: themeColor }} />
              🎁 이달의 가장 감사한 순간 TOP 3
            </h4>
            <div className="space-y-2">
              {[1, 2, 3].map((num) => (
                <div key={num} className="p-2 rounded-lg bg-white border border-slate-200 flex items-start gap-2 shadow-2xs">
                  <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                    {num}
                  </span>
                  <div className="text-[10px] text-slate-400 min-h-[24px]">
                    감사했던 일을 기록해보세요...
                  </div>
                </div>
              ))}
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
