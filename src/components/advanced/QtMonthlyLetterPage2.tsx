'use client'

import React from 'react'
import QtQuickIndexNav from './QtQuickIndexNav'

interface QtMonthlyLetterPage2Props {
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

export default function QtMonthlyLetterPage2({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 768,
}: QtMonthlyLetterPage2Props) {
  const monthNum = MONTH_MAP[monthName] || 8

  return (
    <div
      data-page-key="tracker"
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
      <div className="flex items-center justify-between border-b border-slate-300 pb-2 mb-2">
        <div className="flex items-center space-x-3 text-[11px] font-medium tracking-wider text-slate-400 font-mono">
          <span>YEARLY</span>
          <span>{year}</span>
          <span className="px-2 py-0.5 rounded text-white font-bold" style={{ backgroundColor: themeColor }}>
            {monthName.toUpperCase().slice(0, 3)}
          </span>
        </div>

        <div className="flex items-center space-x-3 text-[11px] font-medium text-slate-400">
          <span>BLESSING & ENCOURAGEMENT LETTER (VOL. 2)</span>
          <span className="px-2.5 py-0.5 rounded-full bg-purple-600 text-white font-bold text-[10px] shadow-xs">
            💌 편지② 나 & 이웃 축복 편지 (VOL. 2)
          </span>
        </div>
      </div>

      {/* 2. Page Title */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-xl font-serif font-bold text-slate-800 tracking-wide whitespace-nowrap">
            💌 {monthName} Self Encouragement & Beloved Blessing Letter
          </h1>
          <p className="text-[10.5px] text-slate-500 mt-0.5 whitespace-nowrap">
            한 달간 애쓴 나 자신을 따뜻하게 격려하고, 소중한 사람과 다음 달 나에게 띄우는 사랑의 손편지
          </p>
        </div>

        <div className="px-3 py-1 rounded-full text-xs font-bold text-purple-950 bg-purple-50 border border-purple-200 shadow-2xs whitespace-nowrap">
          나 & 이웃 힐링 축복 편지
        </div>
      </div>

      {/* 3. Main Content: Left Dear Myself (6 cols) / Right Dear Beloved & Next Month (6 cols) */}
      <div className="grid grid-cols-12 gap-3 flex-1 mb-2">
        {/* Left: Dear Myself (6 cols) */}
        <div className="col-span-6 border border-purple-200 rounded-2xl p-3.5 bg-gradient-to-b from-purple-50/40 via-white to-pink-50/30 flex flex-col justify-between shadow-2xs relative">
          <div className="flex items-center justify-between border-b border-purple-200 pb-1 mb-1.5 text-[10px]">
            <span className="text-xs font-serif font-bold text-purple-950 flex items-center gap-1">
              <span>💝 Dear Myself (한 달간 수고 많았던 나에게)</span>
            </span>
            <span className="text-purple-400 font-mono text-[8px]">Self Love</span>
          </div>

          <div className="space-y-1.5 flex-1 flex flex-col justify-around text-[8.5px]">
            <p className="text-slate-400 italic text-[8px]">
              &quot;치열하게 살아가느라 지쳤을 텐데 잘 견뎌줘서 고마워. 이번 한 달도 너는 충분히 잘해냈어...&quot;
            </p>
            {[1, 2, 3, 4].map((lNo) => (
              <div key={lNo} className="border-b border-purple-200/80 pb-1 flex items-center gap-1.5">
                <span className="text-purple-400 font-serif text-[8px] w-2.5">{lNo}.</span>
                <div className="text-slate-700 font-serif flex-1 min-h-[14px]">
                  __________________________________________________
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-purple-200 pt-1 text-[8.5px] text-purple-900 font-serif font-bold text-right">
            <span>수고했어, 소중한 나에게 🌸</span>
          </div>
        </div>

        {/* Right: Dear Beloved (가족/지인) & Next Month Promise (6 cols) */}
        <div className="col-span-6 flex flex-col justify-between space-y-2">
          {/* Dear Beloved */}
          <div className="border border-pink-200 rounded-2xl p-3 bg-gradient-to-b from-pink-50/30 to-white flex-1 flex flex-col justify-between shadow-2xs space-y-1">
            <div className="flex items-center justify-between border-b border-pink-200 pb-1 text-[10px]">
              <span className="font-bold text-pink-950 font-serif flex items-center gap-1">
                <span>💖 Dear Beloved (소중한 이웃/순원/가족에게)</span>
              </span>
              <span className="text-pink-400 font-mono text-[8px]">For You</span>
            </div>
            <div className="space-y-1.5 flex-1 flex flex-col justify-around text-[8.5px]">
              <div className="flex items-center gap-2">
                <span className="font-bold text-pink-800 text-[8px]">To.</span>
                <div className="text-slate-400 font-serif text-[8px] flex-1">___________________________ 님께</div>
              </div>
              <div className="text-slate-400 font-serif text-[8px] min-h-[30px] bg-white p-1.5 rounded-xl border border-pink-200/70 italic">
                &quot;함께 기도해주고 곁에 있어줘서 참 고맙습니다. 당신이 있어서 이번 한 달이 따뜻했습니다...&quot;
              </div>
            </div>
          </div>

          {/* Next Month Vision & Promise */}
          <div className="border border-indigo-200 rounded-2xl p-3 bg-indigo-50/30 flex flex-col justify-between shadow-2xs space-y-1">
            <div className="flex items-center justify-between border-b border-indigo-200 pb-1 text-[9.5px]">
              <span className="font-bold text-indigo-950 font-serif">🕊️ 다음 달 나에게 띄우는 소망과 축복</span>
              <span className="font-mono text-[8px] text-indigo-400">Next Month Vision</span>
            </div>
            <div className="bg-white p-1.5 rounded-xl border border-indigo-200/80 text-[8.5px]">
              <div className="text-slate-400 font-serif italic min-h-[22px]">
                &quot;새로 시작될 다음 달에는 더욱 기쁨과 평안이 넘치길 소망합니다!&quot;
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Footer */}
      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1.5 border-t border-slate-200 mt-1.5">
        <span>PREMIUM DIARY STUDIO — BLESSING & ENCOURAGEMENT LETTER (VOL. 2)</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
