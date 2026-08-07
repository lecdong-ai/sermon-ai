'use client'

import React from 'react'

interface QtFruitsTrackerPageProps {
  year?: number
  monthName?: string
  themeColor?: string
  pageWidth?: number
  pageHeight?: number
}

export default function QtFruitsTrackerPage({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 768,
}: QtFruitsTrackerPageProps) {
  const fruits = [
    { title: '❤️ 사랑 (Love)', desc: '하나님과 이웃을 온 마음으로 사랑함', color: 'bg-rose-50 border-rose-200 text-rose-900' },
    { title: '😃 희락 (Joy)', desc: '환경에 흔들리지 않는 하늘의 기쁨', color: 'bg-amber-50 border-amber-200 text-amber-900' },
    { title: '🕊️ 화평 (Peace)', desc: '사람들과 화목하고 마음에 평강을 누림', color: 'bg-blue-50 border-blue-200 text-blue-900' },
    { title: '⏳ 오래 참음 (Patience)', desc: '인내하고 분노를 다스리며 기다림', color: 'bg-purple-50 border-purple-200 text-purple-900' },
    { title: '🤝 자비 (Kindness)', desc: '타인에게 친절하고 너그러운 친절함', color: 'bg-emerald-50 border-emerald-200 text-emerald-950' },
    { title: '🌱 양선 (Goodness)', desc: '선한 마음으로 선행과 의를 이룸', color: 'bg-teal-50 border-teal-200 text-teal-950' },
    { title: '⚓ 충성 (Faithfulness)', desc: '맡겨진 직분과 신앙의 지조를 지킴', color: 'bg-indigo-50 border-indigo-200 text-indigo-950' },
    { title: '🌾 온유 (Gentleness)', desc: '겸손하고 다정하게 사람을 대함', color: 'bg-orange-50 border-orange-200 text-orange-950' },
    { title: '🛑 절제 (Self-Control)', desc: '욕망과 감정을 말씀 안에서 조절함', color: 'bg-slate-50 border-slate-200 text-slate-900' },
  ]

  return (
    <div
      data-page-key="fruits-tracker"
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
          <span>SPIRITUAL GROWTH</span>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[10px] shadow-xs">
            🌱 FRUITS OF THE SPIRIT
          </span>
        </div>
      </div>

      {/* 2. Title */}
      <div className="flex items-center justify-between mb-2.5">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-800 tracking-wide flex items-center gap-2">
            <span>🌱 {monthName} Fruits of the Spirit Tracker</span>
          </h1>
          <p className="text-[11px] text-slate-500 mt-0.5">
            갈라디아서 5장 성령의 9가지 열매 성품을 한 달 동안 자가 진단하며 영적 성장을 도모합니다.
          </p>
        </div>
        <div className="px-3 py-1 rounded-full text-xs font-bold text-emerald-950 bg-emerald-50 border border-emerald-200 shadow-xs">
          성령의 9가지 열매 성품 트래커
        </div>
      </div>

      {/* 3. 9 Fruits 3x3 Grid Cards */}
      <div className="grid grid-cols-3 gap-2.5 flex-1 mb-2">
        {fruits.map((f, idx) => (
          <div
            key={idx}
            className={`border rounded-2xl p-2.5 ${f.color} flex flex-col justify-between shadow-2xs`}
          >
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-1">
              <span className="text-[10.5px] font-extrabold font-serif">{f.title}</span>
              <span className="text-[8.5px] font-mono font-bold text-slate-400">★ ★ ★ ★ ★</span>
            </div>

            <p className="text-[9px] text-slate-500 my-1 font-serif">{f.desc}</p>

            <div className="bg-white/90 p-1.5 rounded-xl border border-slate-200/60 text-[8.5px] text-slate-400">
              <span>한 달 실천 & 성찰: _________________</span>
            </div>
          </div>
        ))}
      </div>

      {/* 4. Footer Banner */}
      <div className="bg-emerald-50 border border-emerald-100 p-2 rounded-xl flex items-center justify-between text-[9.5px]">
        <span className="text-emerald-950 font-bold">📖 &quot;오직 성령의 열매는 사랑과 희락과 화평과 오래 참음과 자비와 양선과 충성과 온유와 절제니&quot; (갈 5:22-23)</span>
        <span className="text-emerald-700 font-semibold">{year} {monthName}</span>
      </div>
    </div>
  )
}
