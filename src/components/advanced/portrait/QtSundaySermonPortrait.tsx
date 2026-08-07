'use client'

import React from 'react'

interface QtSundaySermonPortraitProps {
  year?: number
  month?: number
  sundayNo?: number
  dateStr?: string
  sundayLabel?: string
  monthName?: string
  themeColor?: string
  pageWidth?: number
  pageHeight?: number
}

export default function QtSundaySermonPortrait({
  year = 2026,
  month = 8,
  sundayNo = 1,
  dateStr = '08/02',
  sundayLabel = '8월 1주차 주일예배',
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 1448,
}: QtSundaySermonPortraitProps) {
  return (
    <div
      data-page-key={`sunday-sermon-portrait-${sundayNo}`}
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
        <span className="px-3 py-1 rounded-full bg-amber-600 text-white font-bold text-xs shadow-xs">
          🏛️ 설교① 주일 설교 요약 (VOL. 1)
        </span>
      </div>

      {/* 2. Page Title */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-800 tracking-wide flex items-center gap-2">
            <span>🏛️ {monthName} Sunday Worship & Sermon (Vol. 1)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {sundayLabel} 말씀의 3대 대지 요약과 하나님이 직접 주신 레마의 말씀, 삶의 순종을 기록합니다.
          </p>
        </div>
        <div className="px-4 py-1.5 rounded-full text-xs font-bold text-amber-950 bg-amber-50 border border-amber-200 shadow-xs">
          🏛️ 설교① {sundayLabel}
        </div>
      </div>

      {/* 3. Worship Header Banner */}
      <div className="border border-amber-200/90 rounded-2xl p-3.5 bg-gradient-to-r from-amber-50/70 via-indigo-50/30 to-white shadow-xs mb-3 space-y-2">
        <div className="flex items-center justify-between border-b border-amber-200/60 pb-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-extrabold px-3 py-0.5 rounded-full text-white bg-amber-600 shadow-xs">
              {sundayLabel}
            </span>
            <span className="font-mono text-slate-500 font-bold text-xs">DATE: {year}.{dateStr}</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span>⛪ 설교자: <strong className="text-slate-700 font-bold">_____ 목사님</strong></span>
            <span>🎵 찬양: <strong className="text-slate-700 font-bold">_____</strong></span>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-2 text-xs">
          <div className="col-span-8 bg-white/90 p-2 rounded-xl border border-amber-200 flex items-center justify-between">
            <span className="font-bold text-amber-800 shrink-0 mr-2">📌 설교 제목 (Title):</span>
            <div className="text-slate-400 font-serif text-xs flex-1 min-h-[16px]">____________________________________</div>
          </div>
          <div className="col-span-4 bg-white/90 p-2 rounded-xl border border-amber-200 flex items-center justify-between">
            <span className="font-bold text-amber-800 shrink-0 mr-2">📖 성경 본문:</span>
            <div className="text-slate-400 font-serif text-xs flex-1 min-h-[16px]">__________________</div>
          </div>
        </div>
      </div>

      {/* 4. Main Stack: 3 Points + Rhema & Action */}
      <div className="space-y-3.5 flex-1 flex flex-col justify-between mb-3">
        {/* 3 Key Points Outline */}
        <div className="border border-slate-200 rounded-2xl p-3.5 bg-slate-50/30 flex-1 flex flex-col justify-between shadow-xs space-y-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1 text-xs">
            <span className="font-bold text-slate-800 font-serif">💡 설교 3대 대지 요약 & 말씀 필기 (Outline)</span>
            <span className="font-mono text-xs text-slate-400">3 Key Points</span>
          </div>

          <div className="space-y-2 flex-1 flex flex-col justify-between">
            {[
              { pt: '01. 첫 번째 대지 (Point 1)', label: 'Point 1' },
              { pt: '02. 두 번째 대지 (Point 2)', label: 'Point 2' },
              { pt: '03. 세 번째 대지 (Point 3)', label: 'Point 3' },
            ].map((p, pIdx) => (
              <div key={pIdx} className="bg-white p-2.5 rounded-xl border border-slate-200 flex-1 flex flex-col justify-between space-y-1">
                <div className="flex justify-between items-center text-xs border-b border-slate-100 pb-0.5">
                  <span className="font-bold text-amber-800">{p.pt}</span>
                  <span className="font-mono text-slate-300 text-xs">{p.label}</span>
                </div>
                <div className="text-slate-400 font-serif text-xs min-h-[28px] flex-1 flex flex-col justify-around">
                  <div>________________________________________________________</div>
                  <div>________________________________________________________</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rhema & Action Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          {/* Rhema */}
          <div className="border border-indigo-200/90 rounded-2xl p-3 bg-indigo-50/20 flex flex-col justify-between shadow-xs space-y-1.5">
            <div className="flex items-center justify-between border-b border-indigo-200 pb-1">
              <span className="font-bold text-indigo-950 font-serif">🕊️ 내게 주신 레마(Rhema)의 말씀</span>
              <span className="font-mono text-[10px] text-indigo-400">Personal Word</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-indigo-200/80 text-xs">
              <div className="text-slate-400 font-serif italic min-h-[40px]">"하나님께서 오늘 나에게 선포하신 약속의 말씀..."</div>
            </div>
          </div>

          {/* Action */}
          <div className="border border-emerald-200/90 rounded-2xl p-3 bg-emerald-50/20 flex flex-col justify-between shadow-xs space-y-1.5">
            <div className="flex items-center justify-between border-b border-emerald-200 pb-1">
              <span className="font-bold text-emerald-950 font-serif">🌱 이번 주 순종 결단 (Action Plan)</span>
              <span className="text-emerald-700 font-mono text-[10px]">Obedience Note</span>
            </div>
            <div className="space-y-1.5 text-xs bg-white p-2 rounded-xl border border-emerald-200/80">
              <div>
                <span className="font-bold text-emerald-800 text-[10px]">📌 실천 1:</span>
                <div className="text-slate-400 font-serif min-h-[14px]">_____________________</div>
              </div>
              <div>
                <span className="font-bold text-emerald-800 text-[10px]">📌 실천 2:</span>
                <div className="text-slate-400 font-serif min-h-[14px]">_____________________</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Footer */}
      <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-300">
        <span>PREMIUM DIARY STUDIO — SUNDAY WORSHIP & SERMON MASTER</span>
        <span>{year} {monthName} Week {sundayNo} Edition</span>
      </div>
    </div>
  )
}
