'use client'

import React from 'react'

interface QtSoapJournalPageProps {
  year?: number
  monthName?: string
  themeColor?: string
  pageWidth?: number
  pageHeight?: number
}

export default function QtSoapJournalPage({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 768,
}: QtSoapJournalPageProps) {
  return (
    <div
      data-page-key="soap-journal"
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
      <div className="flex items-center justify-between border-b border-slate-300 pb-2 mb-2.5">
        <div className="flex items-center space-x-3 text-[11px] font-medium tracking-wider text-slate-400 font-mono">
          <span>YEARLY</span>
          <span>{year}</span>
          <span className="px-2 py-0.5 rounded text-white font-bold" style={{ backgroundColor: themeColor }}>
            {monthName.toUpperCase().slice(0, 3)}
          </span>
        </div>

        <div className="flex items-center space-x-3 text-[11px] font-medium text-slate-400">
          <span>BIBLE MEDITATION</span>
          <span className="px-2.5 py-0.5 rounded-full bg-indigo-600 text-white font-bold text-[10px] shadow-xs">
            📖 SOAP BIBLE JOURNAL
          </span>
        </div>
      </div>

      {/* 2. Title */}
      <div className="flex items-center justify-between mb-2.5">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-800 tracking-wide flex items-center gap-2">
            <span>📖 {monthName} SOAP 4-Step Bible Meditation</span>
          </h1>
          <p className="text-[11px] text-slate-500 mt-0.5">
            S(본문), O(관찰), A(적용), P(기도) 4단계를 통해 말씀을 깊이 묵상하고 삶으로 순종합니다.
          </p>
        </div>
        <div className="px-3 py-1 rounded-full text-xs font-bold text-indigo-950 bg-indigo-50 border border-indigo-200 shadow-xs">
          SOAP 명품 묵상 노트
        </div>
      </div>

      {/* 3. SOAP 4-Grid Cards Container */}
      <div className="grid grid-cols-2 gap-3 flex-1">
        {/* S: Scripture */}
        <div className="border border-slate-200/90 rounded-2xl p-3 bg-amber-50/30 flex flex-col justify-between shadow-2xs space-y-1.5">
          <h4 className="text-[11px] font-extrabold text-amber-900 uppercase tracking-wider flex items-center justify-between border-b border-amber-200 pb-1">
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-amber-600 text-white font-mono text-[10px] flex items-center justify-center font-bold">S</span>
              SCRIPTURE (본문 말씀)
            </span>
            <span className="text-[9px] text-amber-700 font-mono">Word & Verse</span>
          </h4>
          <div className="bg-white p-2 rounded-xl border border-amber-200/80 flex-1 flex flex-col justify-around">
            <div className="border-b border-dashed border-amber-200/60 h-4 text-[9px] text-slate-400 font-serif">본문 구절:</div>
            <div className="border-b border-dashed border-amber-200/60 h-4 text-[9px] text-slate-400 font-serif">마음에 와닿은 말씀 필사...</div>
          </div>
        </div>

        {/* O: Observation */}
        <div className="border border-slate-200/90 rounded-2xl p-3 bg-blue-50/30 flex flex-col justify-between shadow-2xs space-y-1.5">
          <h4 className="text-[11px] font-extrabold text-blue-900 uppercase tracking-wider flex items-center justify-between border-b border-blue-200 pb-1">
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-blue-600 text-white font-mono text-[10px] flex items-center justify-center font-bold">O</span>
              OBSERVATION (관찰 & 영적 진리)
            </span>
            <span className="text-[9px] text-blue-700 font-mono">Truth & God</span>
          </h4>
          <div className="bg-white p-2 rounded-xl border border-blue-200/80 flex-1 flex flex-col justify-around">
            <div className="border-b border-dashed border-blue-200/60 h-4 text-[9px] text-slate-400 font-serif">하나님은 어떤 분이신가?</div>
            <div className="border-b border-dashed border-blue-200/60 h-4 text-[9px] text-slate-400 font-serif">본문 속 영적 진리와 메시지...</div>
          </div>
        </div>

        {/* A: Application */}
        <div className="border border-slate-200/90 rounded-2xl p-3 bg-emerald-50/30 flex flex-col justify-between shadow-2xs space-y-1.5">
          <h4 className="text-[11px] font-extrabold text-emerald-900 uppercase tracking-wider flex items-center justify-between border-b border-emerald-200 pb-1">
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white font-mono text-[10px] flex items-center justify-center font-bold">A</span>
              APPLICATION (삶의 실천 & 적용)
            </span>
            <span className="text-[9px] text-emerald-700 font-mono">Action Today</span>
          </h4>
          <div className="bg-white p-2 rounded-xl border border-emerald-200/80 flex-1 flex flex-col justify-around">
            <div className="border-b border-dashed border-emerald-200/60 h-4 text-[9px] text-slate-400 font-serif">오늘 일상에서 구체적으로 실천할 순종:</div>
            <div className="border-b border-dashed border-emerald-200/60 h-4 text-[9px] text-slate-400 font-serif">액션 플랜...</div>
          </div>
        </div>

        {/* P: Prayer */}
        <div className="border border-slate-200/90 rounded-2xl p-3 bg-purple-50/30 flex flex-col justify-between shadow-2xs space-y-1.5">
          <h4 className="text-[11px] font-extrabold text-purple-900 uppercase tracking-wider flex items-center justify-between border-b border-purple-200 pb-1">
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-purple-600 text-white font-mono text-[10px] flex items-center justify-center font-bold">P</span>
              PRAYER (결단 기도)
            </span>
            <span className="text-[9px] text-purple-700 font-mono">My Prayer</span>
          </h4>
          <div className="bg-white p-2 rounded-xl border border-purple-200/80 flex-1 flex flex-col justify-around">
            <div className="border-b border-dashed border-purple-200/60 h-4 text-[9px] text-slate-400 font-serif">말씀대로 살기 위해 드리는 기도:</div>
            <div className="border-b border-dashed border-purple-200/60 h-4 text-[9px] text-slate-400 font-serif">아멘...</div>
          </div>
        </div>
      </div>

      {/* 4. Footer */}
      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1.5 border-t border-slate-200 mt-1.5">
        <span>SUNDAY SERMON STUDIO — SOAP BIBLE MEDITATION</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
