'use client'

import React from 'react'
import QtQuickIndexNavPortrait from './QtQuickIndexNavPortrait'

interface QtPrayerAnswerPortraitProps {
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

export default function QtPrayerAnswerPortrait({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 1448,
}: QtPrayerAnswerPortraitProps) {
  const monthNum = MONTH_MAP[monthName] || 8

  return (
    <div
      data-page-key="tracker"
      data-page-type="full-bleed"
      className="qt-page relative bg-white text-slate-800 flex flex-col justify-between overflow-hidden shadow-md mx-auto"
      style={{
        width: `${pageWidth}px`,
        height: `${pageHeight}px`,
        padding: '52px 20px 20px 20px',
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
        <span className="px-3 py-1 rounded-full bg-amber-600 text-white font-bold text-xs shadow-xs">
          🙏 PERSONAL PRAYER MASTER
        </span>
      </div>

      {/* 2. Page Title */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-xl font-serif font-bold text-slate-800 tracking-wide flex items-center gap-2 whitespace-nowrap">
            <span>🙏 {monthName} Prayer & Grace Answer Journal</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            개인의 핵심 기도 제목을 간구하고 응답받은 날짜와 성경 말씀의 은혜를 기념하는 마스터 노틀입니다.
          </p>
        </div>
        <div className="px-4 py-1.5 rounded-full text-xs font-bold text-amber-950 bg-amber-50 border border-amber-200 shadow-xs">
          은혜의 기념비 & 응답 노트
        </div>
      </div>

      {/* 3. 4 Core Prayer Cards Stack */}
      <div className="space-y-3.5 flex-1 flex flex-col justify-between mb-3">
        {[
          { title: '🕊️ 01. 개인 영성 & 성품 기도', category: '영성 성품', color: 'border-amber-300 bg-amber-50/20' },
          { title: '💼 02. 비전, 진로 & 사명 기도', category: '비전 사명', color: 'border-indigo-300 bg-indigo-50/20' },
          { title: '👨‍👩‍👧‍👦 03. 가정, 관계 & 치유 기도', category: '가정 관계', color: 'border-emerald-300 bg-emerald-50/20' },
          { title: '🎉 04. 이달의 은혜 응답 기념비', category: '응답 은혜', color: 'border-rose-300 bg-rose-50/20' },
        ].map((card, idx) => (
          <div
            key={idx}
            className={`border rounded-2xl p-3.5 ${card.color} flex flex-col justify-between shadow-xs space-y-2 flex-1`}
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-1 text-xs">
              <span className="font-bold text-slate-800 font-serif flex items-center gap-1">
                {card.title}
              </span>
              <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                {card.category}
              </span>
            </div>

            <div className="grid grid-cols-12 gap-2 text-xs">
              <div className="col-span-6 bg-white p-1.5 rounded-xl border border-slate-200/80 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400">기도 시작일:</span>
                <span className="text-slate-600 font-mono text-xs">2026.08.__</span>
              </div>
              <div className="col-span-6 bg-white p-1.5 rounded-xl border border-slate-200/80 flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-800">응답 날짜:</span>
                <span className="text-emerald-700 font-mono font-bold text-xs">2026.__.__</span>
              </div>
            </div>

            <div className="space-y-1.5 flex-1 bg-white p-2.5 rounded-xl border border-slate-200/80 text-xs">
              <div>
                <span className="font-bold text-slate-700 text-[10px] block">📌 핵심 기도 제목 (Prayer Topic):</span>
                <div className="text-slate-400 font-serif text-xs min-h-[16px]">________________________________________________</div>
              </div>
              <div>
                <span className="font-bold text-indigo-800 text-[10px] block">📖 붙잡을 말씀 & 묵상 구절 (Scripture):</span>
                <div className="text-slate-400 font-serif text-xs min-h-[16px]">________________________________________________</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 4. Bottom Prayer Mantra Banner */}
      <div className="border border-amber-200/90 rounded-2xl p-3 bg-amber-50/70 shadow-xs mb-2 space-y-1">
        <div className="flex items-center justify-between text-xs font-bold text-amber-950">
          <span>💡 하나님의 때에 가장 선한 방법으로 응답하실 주님을 신뢰합니다</span>
          <span className="text-amber-700 font-mono">Faith & Prayer</span>
        </div>
        <div className="border-b border-dashed border-amber-200 h-4 text-xs text-amber-900/80 font-serif">"아무 것도 염려하지 말고 다만 모든 일에 기도와 간구로, 너희 구할 것을 감사함으로 하나님께 아뢰라 (빌 4:6)"</div>
      </div>

      {/* 5. Footer */}
      <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-300">
        <span>PREMIUM DIARY STUDIO — PERSONAL PRAYER & GRACE ANSWER MASTER</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
