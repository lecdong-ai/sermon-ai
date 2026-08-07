'use client'

import React from 'react'

interface QtSoapJournalPortraitProps {
  year?: number
  monthName?: string
  themeColor?: string
  pageWidth?: number
  pageHeight?: number
}

export default function QtSoapJournalPortrait({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 1448,
}: QtSoapJournalPortraitProps) {
  return (
    <div
      data-page-key="soap-journal-portrait"
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
      <div className="flex items-center justify-between border-b border-slate-300 pb-3 mb-4">
        <div className="flex items-center space-x-4 text-xs font-medium tracking-wider text-slate-400 font-mono">
          <span>YEARLY</span>
          <span>{year}</span>
          <span className="px-2.5 py-0.5 rounded text-white font-bold" style={{ backgroundColor: themeColor }}>
            {monthName.toUpperCase().slice(0, 3)}
          </span>
        </div>
        <span className="px-3 py-1 rounded-full bg-indigo-600 text-white font-bold text-xs shadow-xs">
          📖 SOAP BIBLE JOURNAL
        </span>
      </div>

      {/* 2. Page Title */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-800 tracking-wide flex items-center gap-2">
            <span>📖 {monthName} SOAP 4-Step Bible Meditation</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            S(본문), O(관찰), A(적용), P(기도) 4단계를 통해 말씀을 깊이 읽고 일상에 적용합니다.
          </p>
        </div>
        <div className="px-4 py-1.5 rounded-full text-xs font-bold text-indigo-950 bg-indigo-50 border border-indigo-200 shadow-xs">
          SOAP 명품 묵상 노트
        </div>
      </div>

      {/* 3. SOAP 4-Step Vertical Stack Cards */}
      <div className="space-y-4 flex-1 flex flex-col justify-between">
        {/* S: Scripture */}
        <div className="border border-slate-200/90 rounded-2xl p-4 bg-amber-50/30 flex flex-col justify-between shadow-xs flex-1">
          <h4 className="text-xs font-extrabold text-amber-900 uppercase tracking-wider flex items-center justify-between border-b border-amber-200 pb-1.5">
            <span className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-600 text-white font-mono text-xs flex items-center justify-center font-bold">S</span>
              SCRIPTURE (본문 말씀 구절 & 필사)
            </span>
            <span className="text-xs text-amber-700 font-mono">Word & Passage</span>
          </h4>
          <div className="bg-white p-3 rounded-xl border border-amber-200/80 flex-1 flex flex-col justify-around my-1">
            <div className="border-b border-dashed border-amber-200/60 h-5 text-xs text-slate-400 font-serif">오늘 묵상할 성경 본문 구절:</div>
            <div className="border-b border-dashed border-amber-200/60 h-5 text-xs text-slate-400 font-serif">성령님이 마음에 주신 말씀 구절...</div>
          </div>
        </div>

        {/* O: Observation */}
        <div className="border border-slate-200/90 rounded-2xl p-4 bg-blue-50/30 flex flex-col justify-between shadow-xs flex-1">
          <h4 className="text-xs font-extrabold text-blue-900 uppercase tracking-wider flex items-center justify-between border-b border-blue-200 pb-1.5">
            <span className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-mono text-xs flex items-center justify-center font-bold">O</span>
              OBSERVATION (관찰 & 하나님 성품)
            </span>
            <span className="text-xs text-blue-700 font-mono">Truth & Character</span>
          </h4>
          <div className="bg-white p-3 rounded-xl border border-blue-200/80 flex-1 flex flex-col justify-around my-1">
            <div className="border-b border-dashed border-blue-200/60 h-5 text-xs text-slate-400 font-serif">본문 속에 드러난 하나님의 성품과 핵심 진리:</div>
            <div className="border-b border-dashed border-blue-200/60 h-5 text-xs text-slate-400 font-serif">구속사적 메시지...</div>
          </div>
        </div>

        {/* A: Application */}
        <div className="border border-slate-200/90 rounded-2xl p-4 bg-emerald-50/30 flex flex-col justify-between shadow-xs flex-1">
          <h4 className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider flex items-center justify-between border-b border-emerald-200 pb-1.5">
            <span className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-mono text-xs flex items-center justify-center font-bold">A</span>
              APPLICATION (삶의 실천 & 순종)
            </span>
            <span className="text-xs text-emerald-700 font-mono">Action Plan</span>
          </h4>
          <div className="bg-white p-3 rounded-xl border border-emerald-200/80 flex-1 flex flex-col justify-around my-1">
            <div className="border-b border-dashed border-emerald-200/60 h-5 text-xs text-slate-400 font-serif">오늘 나의 삶에서 실천할 구체적인 행동:</div>
            <div className="border-b border-dashed border-emerald-200/60 h-5 text-xs text-slate-400 font-serif">순종 결단...</div>
          </div>
        </div>

        {/* P: Prayer */}
        <div className="border border-slate-200/90 rounded-2xl p-4 bg-purple-50/30 flex flex-col justify-between shadow-xs flex-1">
          <h4 className="text-xs font-extrabold text-purple-900 uppercase tracking-wider flex items-center justify-between border-b border-purple-200 pb-1.5">
            <span className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-mono text-xs flex items-center justify-center font-bold">P</span>
              PRAYER (결단 기도 & 간구)
            </span>
            <span className="text-xs text-purple-700 font-mono">My Prayer</span>
          </h4>
          <div className="bg-white p-3 rounded-xl border border-purple-200/80 flex-1 flex flex-col justify-around my-1">
            <div className="border-b border-dashed border-purple-200/60 h-5 text-xs text-slate-400 font-serif">주신 말씀대로 순종하며 살기 위한 기도:</div>
            <div className="border-b border-dashed border-purple-200/60 h-5 text-xs text-slate-400 font-serif">예수님의 이름으로 기도합니다. 아멘.</div>
          </div>
        </div>
      </div>

      {/* 4. Footer */}
      <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-300 mt-3">
        <span>SUNDAY SERMON STUDIO — SOAP BIBLE MEDITATION</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
