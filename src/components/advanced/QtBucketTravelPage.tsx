'use client'

import React from 'react'
import QtQuickIndexNav from './QtQuickIndexNav'

interface QtBucketTravelPageProps {
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

export default function QtBucketTravelPage({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 768,
}: QtBucketTravelPageProps) {
  const monthNum = MONTH_MAP[monthName] || 8

  return (
    <div
      data-page-key="bucket"
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
      <div className="flex items-center justify-between border-b border-slate-300 pb-2 mb-2.5">
        <div className="flex items-center space-x-3 text-[11px] font-medium tracking-wider text-slate-400 font-mono">
          <span>YEARLY</span>
          <span>{year}</span>
          <span className="px-2 py-0.5 rounded text-white font-bold" style={{ backgroundColor: themeColor }}>
            {monthName.toUpperCase().slice(0, 3)}
          </span>
        </div>

        <div className="flex items-center space-x-3 text-[11px] font-medium text-slate-400">
          <span>VISION & EXPERIENCE</span>
          <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-bold text-[10px] shadow-xs">
            ✈️ BUCKET & TRAVEL LOG
          </span>
        </div>
      </div>

      {/* 2. Title */}
      <div className="flex items-center justify-between mb-2.5">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-800 tracking-wide flex items-center gap-2">
            <span>✈️ {monthName} Bucket List & Travel Vision</span>
          </h1>
          <p className="text-[11px] text-slate-500 mt-0.5">
            인생에서 꼭 이루고 싶은 10가지 소망과 떠나고 싶은 꿈의 여행지를 자유롭게 그려보세요.
          </p>
        </div>
        <div className="px-3 py-1 rounded-full text-xs font-bold text-rose-950 bg-rose-50 border border-rose-200 shadow-xs">
          {year}년 버킷리스트 & 비전 맵
        </div>
      </div>

      {/* 3. Main Grid (Left 6 cols: Bucket 10 / Right 6 cols: Travel Cards) */}
      <div className="grid grid-cols-12 gap-3.5 flex-1">
        {/* Left: 10 Bucket List Cards */}
        <div className="col-span-6 border border-slate-200/90 rounded-2xl p-3 bg-slate-50/50 flex flex-col justify-between shadow-2xs space-y-1.5">
          <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between border-b border-slate-200 pb-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              🌟 내 삶의 버킷리스트 TOP 10 (Bucket List)
            </span>
            <span className="text-[9px] text-slate-400 font-mono">Check</span>
          </h4>

          <div className="space-y-1 flex-1 flex flex-col justify-around text-[9.5px]">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="flex items-center justify-between bg-white p-1.5 rounded-xl border border-slate-200/80">
                <div className="flex items-center gap-2 flex-1">
                  <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-700 font-mono font-bold text-[9px] flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-slate-300 font-serif flex-1">소망 또는 목표를 작성하세요...</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[8.5px]">
                  <span>달성일: ____/__/__</span>
                  <span className="w-3 h-3 rounded border border-slate-300 inline-block" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Travel & Healing Destination Cards (6 cols) */}
        <div className="col-span-6 flex flex-col justify-between space-y-2">
          {/* Top Destination Cards */}
          <div className="border border-slate-200/90 rounded-2xl p-3 bg-white space-y-2 shadow-2xs flex-1 flex flex-col justify-between">
            <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between border-b border-slate-200 pb-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                🗺️ 꿈꾸는 여행지 & 힐링 플레이스 (Travel Destination)
              </span>
              <span className="text-[9px] text-slate-400 font-mono">4 Spots</span>
            </h4>

            <div className="grid grid-cols-2 gap-2 flex-1">
              {['국내 힐링 여행지', '해외 꿈의 여행지', '문화 / 전시 플레이스', '맛집 / 카페 투어'].map((spot, idx) => (
                <div key={idx} className="border border-slate-200/80 rounded-xl p-2 bg-slate-50/40 flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                    <span className="text-[9.5px] font-bold text-indigo-900">{spot}</span>
                    <span className="text-[8.5px] text-slate-400 font-mono">D-Day: ____</span>
                  </div>
                  <div className="space-y-1 my-1">
                    <div className="border-b border-dashed border-slate-200 h-3 text-[8.5px] text-slate-300">위치 & 목적:</div>
                    <div className="border-b border-dashed border-slate-200 h-3 text-[8.5px] text-slate-300">함께 갈 사람:</div>
                  </div>
                  <div className="text-[8px] text-slate-400 text-right">★ ★ ★ ★ ★</div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Vision Affirmation Banner */}
          <div className="bg-rose-50/60 border border-rose-100 rounded-2xl p-2.5 flex items-center justify-between text-[9.5px]">
            <span className="text-rose-950 font-bold">✨ &quot;꿈을 기록하는 사람은 그 꿈을 닮아간다.&quot;</span>
            <span className="text-rose-700 font-semibold">My Life Vision</span>
          </div>
        </div>
      </div>

      {/* 4. Footer */}
      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1.5 border-t border-slate-200 mt-1.5">
        <span>PREMIUM DIARY STUDIO — BUCKET LIST & TRAVEL VISION</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
