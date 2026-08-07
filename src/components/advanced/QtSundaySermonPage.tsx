'use client'

import React from 'react'

interface QtSundaySermonPageProps {
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

export default function QtSundaySermonPage({
  year = 2026,
  month = 8,
  sundayNo = 1,
  dateStr = '08/02',
  sundayLabel = '8월 1주차 주일예배',
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 768,
}: QtSundaySermonPageProps) {
  return (
    <div
      data-page-key={`sunday-sermon-${sundayNo}`}
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
          <span>SUNDAY WORSHIP & SERMON MASTER</span>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-600 text-white font-bold text-[10px] shadow-xs">
            🏛️ {sundayNo}주차 주일예배 설교 노트
          </span>
        </div>
      </div>

      {/* 2. Worship Header Banner */}
      <div className="border border-amber-200/90 rounded-2xl p-2.5 bg-gradient-to-r from-amber-50/70 via-indigo-50/30 to-white shadow-2xs mb-2 space-y-1.5">
        <div className="flex items-center justify-between border-b border-amber-200/60 pb-1 text-[9.5px]">
          <div className="flex items-center gap-2">
            <span className="font-extrabold px-2.5 py-0.5 rounded-full text-white bg-amber-600 shadow-2xs">
              {sundayLabel}
            </span>
            <span className="font-mono text-slate-500 font-bold text-[9px]">DATE: {year}.{dateStr}</span>
          </div>
          <div className="flex items-center gap-3 text-[9px] text-slate-500">
            <span>⛪ 설교자: <strong className="text-slate-700 font-bold">_____ 목사님</strong></span>
            <span>🎵 찬양: <strong className="text-slate-700 font-bold">_____</strong></span>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-2 text-[9px]">
          <div className="col-span-8 bg-white/90 p-1.5 rounded-xl border border-amber-200 flex items-center justify-between">
            <span className="font-bold text-amber-800 shrink-0 mr-2">📌 설교 제목 (Title):</span>
            <div className="text-slate-400 font-serif text-[9px] flex-1 min-h-[14px]">__________________________________________</div>
          </div>
          <div className="col-span-4 bg-white/90 p-1.5 rounded-xl border border-amber-200 flex items-center justify-between">
            <span className="font-bold text-amber-800 shrink-0 mr-2">📖 성경 본문:</span>
            <div className="text-slate-400 font-serif text-[9px] flex-1 min-h-[14px]">__________________</div>
          </div>
        </div>
      </div>

      {/* 3. Main Content: 3 Sermon Points + Rhema & Action (2 Cols) */}
      <div className="grid grid-cols-12 gap-3 flex-1 mb-2">
        {/* Left Column: 3 Key Sermon Outline Notes (7 cols) */}
        <div className="col-span-7 border border-slate-200 rounded-2xl p-2.5 bg-slate-50/30 flex flex-col justify-between shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1 text-[9.5px]">
            <span className="font-bold text-slate-800 font-serif">💡 설교 3대 대지 요약 & 말씀 필기 (Outline)</span>
            <span className="font-mono text-[8px] text-slate-400">3 Key Points</span>
          </div>

          <div className="space-y-1.5 flex-1 flex flex-col justify-between">
            {[
              { pt: '01. 첫 번째 대지 (Point 1)', label: 'Point 1' },
              { pt: '02. 두 번째 대지 (Point 2)', label: 'Point 2' },
              { pt: '03. 세 번째 대지 (Point 3)', label: 'Point 3' },
            ].map((p, pIdx) => (
              <div key={pIdx} className="bg-white p-2 rounded-xl border border-slate-200 flex-1 flex flex-col justify-between space-y-1">
                <div className="flex justify-between items-center text-[8.5px] border-b border-slate-100 pb-0.5">
                  <span className="font-bold text-amber-800">{p.pt}</span>
                  <span className="font-mono text-slate-300 text-[8px]">{p.label}</span>
                </div>
                <div className="text-slate-400 font-serif text-[8.5px] min-h-[22px] flex-1 flex flex-col justify-around">
                  <div>__________________________________________________</div>
                  <div>__________________________________________________</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Rhema Message & Weekly Obedience Action (5 cols) */}
        <div className="col-span-5 flex flex-col justify-between space-y-2">
          {/* Rhema Word */}
          <div className="border border-indigo-200/90 rounded-2xl p-2.5 bg-indigo-50/20 flex-1 flex flex-col justify-between shadow-2xs space-y-1">
            <div className="flex items-center justify-between border-b border-indigo-200 pb-1 text-[9.5px]">
              <span className="font-bold text-indigo-950 font-serif">🕊️ 내게 주신 레마(Rhema)의 한 문장</span>
              <span className="font-mono text-[8px] text-indigo-400">Personal Word</span>
            </div>
            <div className="bg-white p-2 rounded-xl border border-indigo-200/80 flex-1 text-[8.5px]">
              <div className="text-slate-400 font-serif italic min-h-[36px]">"하나님께서 오늘 나에게 개인적으로 선포하신 약속과 결단의 한 마디를 적습니다..."</div>
            </div>
          </div>

          {/* Weekly Obedience Action Plan */}
          <div className="border border-emerald-200/90 rounded-2xl p-2.5 bg-emerald-50/20 flex-1 flex flex-col justify-between shadow-2xs space-y-1">
            <div className="flex items-center justify-between border-b border-emerald-200 pb-1 text-[9.5px]">
              <span className="font-bold text-emerald-950 font-serif">🌱 이번 주 구체적 순종 결단 (Action Plan)</span>
              <span className="text-emerald-700 font-mono text-[8px]">Obedience Note</span>
            </div>
            <div className="space-y-1 text-[8.5px] bg-white p-2 rounded-xl border border-emerald-200/80 flex-1 flex flex-col justify-around">
              <div>
                <span className="font-bold text-emerald-800 text-[8px]">📌 실천 행동 1:</span>
                <div className="text-slate-400 font-serif min-h-[12px]">_________________________________</div>
              </div>
              <div>
                <span className="font-bold text-emerald-800 text-[8px]">📌 실천 행동 2:</span>
                <div className="text-slate-400 font-serif min-h-[12px]">_________________________________</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Footer */}
      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1.5 border-t border-slate-200 mt-1.5">
        <span>PREMIUM DIARY STUDIO — SUNDAY WORSHIP & SERMON MASTER</span>
        <span>{year} {monthName} Week {sundayNo} Edition</span>
      </div>
    </div>
  )
}
