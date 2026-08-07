'use client'

import React from 'react'

interface QtIntercessoryPrayerPage2Props {
  year?: number
  monthName?: string
  themeColor?: string
  pageWidth?: number
  pageHeight?: number
}

export default function QtIntercessoryPrayerPage2({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 768,
}: QtIntercessoryPrayerPage2Props) {
  return (
    <div
      data-page-key="intercessory-prayer-2"
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
          <span>HEALING, MISSIONS & ANSWER MEMORIAL (VOL. 2)</span>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[10px] shadow-xs">
            💌 중보② 치유·열방 & 응답 기념비 (VOL. 2)
          </span>
        </div>
      </div>

      {/* 2. Page Title */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-xl font-serif font-bold text-slate-800 tracking-wide whitespace-nowrap">
            💌 {monthName} Healing, World Missions & Answered Prayer Memorial
          </h1>
          <p className="text-[10.5px] text-slate-500 mt-0.5 whitespace-nowrap">
            환우의 회복과 열방 선교를 위해 중보하고, 하나님께서 우리 공동체에 이뤄주신 기도 응답을 기념합니다.
          </p>
        </div>

        <div className="px-3 py-1 rounded-full text-xs font-bold text-emerald-950 bg-emerald-50 border border-emerald-200 shadow-2xs whitespace-nowrap">
          치유·선교 & 응답 기념비
        </div>
      </div>

      {/* 3. Main Grid (Left 6 Cols Healing & Missions / Right 6 Cols Answered Prayer Memorial) */}
      <div className="grid grid-cols-12 gap-3 flex-1 mb-2">
        {/* Left: Healing & World Missions (6 cols) */}
        <div className="col-span-6 flex flex-col justify-between space-y-2">
          {/* Healing */}
          <div className="border border-amber-200 rounded-2xl p-2.5 bg-amber-50/20 flex-1 flex flex-col justify-between shadow-2xs space-y-1">
            <div className="flex items-center justify-between border-b border-amber-200 pb-1 text-[9.5px]">
              <span className="font-bold text-amber-950 font-serif">🏥 01. 환우 / 치유 & 영육 회복 중보</span>
              <span className="font-mono text-[8px] text-amber-700">Healing & Deliverance</span>
            </div>
            <div className="space-y-1 flex-1 flex flex-col justify-around text-[8.5px]">
              <div className="bg-white p-1.5 rounded-xl border border-amber-200/80">
                <span className="font-bold text-amber-800 text-[8px] block">📌 치유 대상자 & 기도제목:</span>
                <div className="text-slate-400 font-serif text-[8.5px] min-h-[14px]">___________________________________</div>
              </div>
              <div className="bg-white p-1.5 rounded-xl border border-amber-200/80">
                <span className="font-bold text-amber-800 text-[8px] block">📖 신유의 약속 말씀:</span>
                <div className="text-slate-400 font-serif text-[8.5px] min-h-[14px]">___________________________________</div>
              </div>
            </div>
          </div>

          {/* Missions & Evangelism */}
          <div className="border border-emerald-200 rounded-2xl p-2.5 bg-emerald-50/20 flex-1 flex flex-col justify-between shadow-2xs space-y-1">
            <div className="flex items-center justify-between border-b border-emerald-200 pb-1 text-[9.5px]">
              <span className="font-bold text-emerald-950 font-serif">🌏 02. 열방 / 선교사 & 태신자(영혼구원)</span>
              <span className="font-mono text-[8px] text-emerald-700">Missions & Evangelism</span>
            </div>
            <div className="space-y-1 flex-1 flex flex-col justify-around text-[8.5px]">
              <div className="bg-white p-1.5 rounded-xl border border-emerald-200/80">
                <span className="font-bold text-emerald-800 text-[8px] block">📌 선교지 기도 & 전도 대상자 이름:</span>
                <div className="text-slate-400 font-serif text-[8.5px] min-h-[14px]">___________________________________</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Answered Prayer Memorial (6 cols) */}
        <div className="col-span-6 border border-indigo-200 rounded-2xl p-2.5 bg-indigo-50/20 flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between border-b border-indigo-200 pb-1 text-[9.5px] font-bold text-indigo-950 font-serif">
            <span>🎉 03. 이번 달 공동체 기도 응답 기념비 (Answered Prayer Memorial)</span>
            <span className="font-mono text-[8px] text-indigo-400">Answered Stories</span>
          </div>

          <div className="space-y-1.5 flex-1 flex flex-col justify-around text-[8.5px] my-1">
            {[1, 2, 3].map((aNo) => (
              <div key={aNo} className="bg-white p-2 rounded-xl border border-indigo-200/80 flex flex-col justify-between space-y-1">
                <div className="flex justify-between items-center text-[8px] border-b border-indigo-100 pb-0.5">
                  <span className="font-bold text-indigo-900">응답 사건 {aNo}:</span>
                  <span className="font-mono text-slate-300">Answered!</span>
                </div>
                <div className="text-slate-400 font-serif text-[8px] min-h-[16px]">
                  _______________________________________________________
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-indigo-200 pt-1 text-[8px] text-indigo-900 font-serif italic text-right">
            "여호와께서 우리를 위하여 큰 일을 행하셨으니 우리는 기쁘도다 (시편 126:3)"
          </div>
        </div>
      </div>

      {/* 4. Footer */}
      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1.5 border-t border-slate-200 mt-1.5">
        <span>PREMIUM DIARY STUDIO — HEALING, MISSIONS & ANSWER MEMORIAL (VOL. 2)</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
