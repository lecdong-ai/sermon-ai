'use client'

import React from 'react'
import QtQuickIndexNavPortrait from './QtQuickIndexNavPortrait'

interface QtMonthlyLetterPortrait2Props {
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

export default function QtMonthlyLetterPortrait2({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 1448,
}: QtMonthlyLetterPortrait2Props) {
  const monthNum = MONTH_MAP[monthName] || 8

  return (
    <div
      data-page-key="tracker"
      data-page-type="full-bleed"
      className="qt-page relative bg-white text-slate-800 flex flex-col justify-between overflow-hidden shadow-md mx-auto"
      style={{
        width: `${pageWidth}px`,
        height: `${pageHeight}px`,
        padding: '24px 56px 20px 20px',
        boxSizing: 'border-box',
        fontFamily: "'Noto Sans KR', 'Pretendard', sans-serif",
      }}
    >
      <QtQuickIndexNavPortrait currentMonth={monthNum} activeTab="tracker" themeColor={themeColor} />
      {/* 1. Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-300 pb-3 mb-3">
        <div className="flex items-center space-x-4 text-xs font-medium tracking-wider text-slate-400 font-mono">
          <span>YEARLY</span>
          <span>{year}</span>
          <span className="px-2.5 py-0.5 rounded text-white font-bold" style={{ backgroundColor: themeColor }}>
            {monthName.toUpperCase().slice(0, 3)}
          </span>
        </div>
        <span className="px-3 py-1 rounded-full bg-purple-600 text-white font-bold text-xs shadow-xs">
          💌 BLESSING & ENCOURAGEMENT LETTER
        </span>
      </div>

      {/* 2. Page Title */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-xl font-sans font-bold text-slate-800 tracking-wide flex items-center gap-2 whitespace-nowrap">
            <span>💌 {monthName} Self Encouragement & Blessing</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            한 달간 애쓴 나 자신을 따뜻하게 격려하고, 소중한 사람과 다음 달 나에게 띄우는 사랑의 손편지
          </p>
        </div>
        <div className="px-4 py-1.5 rounded-full text-xs font-bold text-purple-950 bg-purple-50 border border-purple-200 shadow-xs">
          나 & 이웃 힐링 축복 편지
        </div>
      </div>

      {/* 3. Main Stack: Dear Myself + Dear Beloved & Next Month */}
      <div className="space-y-4 flex-1 flex flex-col justify-between mb-3">
        {/* Dear Myself */}
        <div className="border border-purple-200 rounded-2xl p-4 bg-gradient-to-b from-purple-50/40 via-white to-pink-50/30 flex-1 flex flex-col justify-between shadow-xs relative">
          <div className="flex items-center justify-between border-b border-purple-200 pb-1.5 mb-2 text-xs">
            <span className="text-sm font-sans font-bold text-purple-950 flex items-center gap-1">
              <span>💝 Dear Myself (한 달간 수고 많았던 나에게)</span>
            </span>
            <span className="text-purple-400 font-mono text-xs">Self Love</span>
          </div>

          <div className="space-y-2 flex-1 flex flex-col justify-around text-xs">
            <p className="text-slate-400 italic text-xs">
              &quot;치열하게 살아가느라 지쳤을 텐데 잘 견뎌줘서 고마워. 이번 한 달도 너는 충분히 잘해냈어...&quot;
            </p>
            {[1, 2, 3, 4, 5].map((lNo) => (
              <div key={lNo} className="border-b border-purple-200/80 pb-1 flex items-center gap-2">
                <span className="text-purple-400 font-sans text-xs w-3">{lNo}.</span>
                <div className="text-slate-700 font-sans flex-1 min-h-[16px]">
                  ________________________________________________________
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-purple-200 pt-1.5 text-xs text-purple-900 font-sans font-bold text-right">
            <span>수고했어, 소중한 나에게 🌸</span>
          </div>
        </div>

        {/* Dear Beloved & Next Month Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="border border-pink-200 rounded-2xl p-3.5 bg-gradient-to-b from-pink-50/30 to-white flex flex-col justify-between shadow-xs space-y-1.5">
            <div className="flex items-center justify-between border-b border-pink-200 pb-1">
              <span className="font-bold text-pink-950 font-sans flex items-center gap-1">
                <span>💖 Dear Beloved (소중한 지인에게)</span>
              </span>
              <span className="text-pink-400 font-mono text-[10px]">For You</span>
            </div>
            <div className="space-y-1.5 flex-1 flex flex-col justify-around text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-pink-800 text-[10px]">To.</span>
                <div className="text-slate-400 font-sans text-xs flex-1">_________________ 님께</div>
              </div>
              <div className="text-slate-400 font-sans text-xs min-h-[36px] bg-white p-2 rounded-xl border border-pink-200/70 italic">
                &quot;함께 기도해주고 곁에 있어줘서 참 고맙습니다...&quot;
              </div>
            </div>
          </div>

          <div className="border border-indigo-200 rounded-2xl p-3.5 bg-indigo-50/30 flex flex-col justify-between shadow-xs space-y-1.5">
            <div className="flex items-center justify-between border-b border-indigo-200 pb-1">
              <span className="font-bold text-indigo-950 font-sans">🕊️ 다음 달 나에게 띄우는 소망</span>
              <span className="font-mono text-[10px] text-indigo-400">Next Month</span>
            </div>
            <div className="bg-white p-2 rounded-xl border border-indigo-200/80 text-xs">
              <div className="text-slate-400 font-sans italic min-h-[36px]">
                &quot;새로 시작될 다음 달에는 더욱 기쁨과 평안이 넘치길 소망합니다!&quot;
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Footer */}
      <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-300">
        <span>PREMIUM DIARY STUDIO — BLESSING & ENCOURAGEMENT LETTER (VOL. 2)</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
