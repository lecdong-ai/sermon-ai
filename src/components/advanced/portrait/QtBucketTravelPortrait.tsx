'use client'

import React from 'react'

interface QtBucketTravelPortraitProps {
  year?: number
  monthName?: string
  themeColor?: string
  pageWidth?: number
  pageHeight?: number
}

export default function QtBucketTravelPortrait({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 1448,
}: QtBucketTravelPortraitProps) {
  return (
    <div
      data-page-key="bucket-travel-portrait"
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
        <span className="px-3 py-1 rounded-full bg-rose-600 text-white font-bold text-xs shadow-xs">
          ✈️ BUCKET & TRAVEL LOG
        </span>
      </div>

      {/* 2. Page Title */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-serif font-bold text-slate-800 tracking-wide flex items-center gap-2 whitespace-nowrap">
            <span>✈️ {monthName} Bucket List & Travel Vision</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            소중한 인생의 버킷리스트 10가지와 가슴 떨리는 꿈의 여행지를 기록하는 서식입니다.
          </p>
        </div>
        <div className="px-4 py-1.5 rounded-full text-xs font-bold text-rose-950 bg-rose-50 border border-rose-200 shadow-xs">
          {year}년 버킷리스트 & 비전 맵
        </div>
      </div>

      {/* 3. Bucket List Top Section (10 Items) */}
      <div className="border border-slate-200/90 rounded-2xl p-4 bg-slate-50/50 space-y-2.5 shadow-xs mb-4">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between border-b border-slate-200 pb-1.5">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
            🌟 내 삶의 버킷리스트 TOP 10 (Bucket List)
          </span>
          <span className="text-xs text-slate-400 font-mono">Check</span>
        </h4>

        <div className="space-y-1.5 text-xs">
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-200/80">
              <div className="flex items-center gap-2 flex-1">
                <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <span className="text-slate-300 font-serif flex-1">소망 또는 달성 목표를 기록하세요...</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 font-mono text-xs">
                <span>달성일: ____/__/__</span>
                <span className="w-3.5 h-3.5 rounded border border-slate-300 inline-block" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Travel Destinations Cards (4 Grid Cards) */}
      <div className="flex-1 border border-slate-200/90 rounded-2xl p-4 bg-white space-y-3 shadow-xs mb-4 flex flex-col justify-between">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between border-b border-slate-200 pb-1.5">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
            🗺️ 꿈꾸는 여행지 & 힐링 플레이스 (Travel & Healing Vision)
          </span>
          <span className="text-xs text-slate-400 font-mono">4 Vision Spots</span>
        </h4>

        <div className="grid grid-cols-2 gap-3 flex-1">
          {['국내 힐링 여행지', '해외 꿈의 여행지', '문화 / 전시 플레이스', '맛집 / 카페 투어'].map((spot, idx) => (
            <div key={idx} className="border border-slate-200/80 rounded-xl p-3 bg-slate-50/40 flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                <span className="text-xs font-bold text-indigo-900">{spot}</span>
                <span className="text-[10px] text-slate-400 font-mono">D-Day: ____</span>
              </div>
              <div className="space-y-1.5 my-2">
                <div className="border-b border-dashed border-slate-200 h-4 text-xs text-slate-300">위치 & 주요 목적:</div>
                <div className="border-b border-dashed border-slate-200 h-4 text-xs text-slate-300">함께 갈 사람 & 소망:</div>
              </div>
              <div className="text-xs text-slate-400 text-right">★ ★ ★ ★ ★</div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Footer */}
      <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-300 mt-3">
        <span>PREMIUM DIARY STUDIO — BUCKET LIST & TRAVEL VISION</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
