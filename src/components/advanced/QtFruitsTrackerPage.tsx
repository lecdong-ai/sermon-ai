'use client'

import React from 'react'
import QtQuickIndexNav from './QtQuickIndexNav'

interface QtFruitsTrackerPageProps {
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

export default function QtFruitsTrackerPage({
  year = 2026,
  monthName = 'August',
  themeColor = '#B8C6D9',
  pageWidth = 1024,
  pageHeight = 768,
}: QtFruitsTrackerPageProps) {
  const monthNum = MONTH_MAP[monthName] || 8
  const fruitClusters = [
    {
      clusterName: '🙌 하나님과의 관계 (Godward)',
      clusterDesc: '주님을 향한 첫사랑과 마음에 샘솟는 평강',
      color: 'border-rose-200 bg-rose-50/20 text-rose-900',
      badgeColor: 'bg-rose-600',
      items: [
        { name: '❤️ 사랑 (Love)', desc: '하나님과 이웃을 조건 없이 전심으로 사랑했는가?' },
        { name: '😃 희락 (Joy)', desc: '어려운 환경에 흔들리지 않고 하늘의 기쁨을 누렸는가?' },
        { name: '🕊️ 화평 (Peace)', desc: '사람들과 화목하고 마음에 주님의 평안이 가득했는가?' },
      ],
    },
    {
      clusterName: '🤝 사람과의 관계 (Manward)',
      clusterDesc: '이웃과 이웃 사이를 이어주는 다정한 성품',
      color: 'border-amber-200 bg-amber-50/20 text-amber-900',
      badgeColor: 'bg-amber-600',
      items: [
        { name: '⏳ 오래 참음 (Patience)', desc: '분노를 참고 상대방을 기다려주는 인내가 있었는가?' },
        { name: '🤝 자비 (Kindness)', desc: '연약한 타인을 불쌍히 여기고 친절하게 대했는가?' },
        { name: '🌱 양선 (Goodness)', desc: '악을 악으로 갚지 않고 선한 행실과 의를 택했는가?' },
      ],
    },
    {
      clusterName: '⚓ 자신과의 관계 (Selfward)',
      clusterDesc: '내 영혼을 단정하게 다스리는 거룩한 절제',
      color: 'border-emerald-200 bg-emerald-50/20 text-emerald-950',
      badgeColor: 'bg-emerald-600',
      items: [
        { name: '⚓ 충성 (Faithfulness)', desc: '하나님이 맡겨주신 직분과 신앙의 조항에 정직했는가?' },
        { name: '🌾 온유 (Gentleness)', desc: '혈기를 부리지 않고 다정하고 온유한 태도를 가졌는가?' },
        { name: '🛑 절제 (Self-Control)', desc: '욕망, 언어, 감정을 성령 안에서 온전히 다스렸는가?' },
      ],
    },
  ]

  return (
    <div
      data-page-key="fruits"
      data-page-type="full-bleed"
      className="qt-page relative bg-white text-slate-800 flex flex-col justify-between overflow-hidden shadow-md mx-auto"
      style={{
        width: `${pageWidth}px`,
        height: `${pageHeight}px`,
        padding: '20px 58px 20px 24px',
        boxSizing: 'border-box',
        fontFamily: "'Noto Sans KR', 'Pretendard', sans-serif",
      }}
    >
      <QtQuickIndexNav currentMonth={monthNum} activeTab="tracker" themeColor={themeColor} isChristian={true} />
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
          <span>SPIRITUAL CHARACTER JOURNAL</span>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[10px] shadow-xs">
            🌱 성령의 9가지 열매 성품 트래커
          </span>
        </div>
      </div>

      {/* 2. Page Title & Top Focus Card */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-xl font-sans font-bold text-slate-800 tracking-wide flex items-center gap-2 whitespace-nowrap">
            <span>🌱 {monthName} Fruit of the Spirit & Character Growth</span>
          </h1>
          <p className="text-[10.5px] text-slate-500 mt-0.5 whitespace-nowrap">
            내 삶의 모든 순간, 성령의 9가지 열매를 아름답게 피워내는 거룩한 성품 가꾸기 노트입니다.
          </p>
        </div>

        {/* Focus Fruit Badge Box */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl px-3 py-1.5 flex items-center gap-3 shadow-2xs">
          <div className="text-left">
            <span className="text-[8px] font-bold text-emerald-800 uppercase block font-mono">THIS MONTH FOCUS</span>
            <span className="text-[10px] font-bold text-emerald-950 font-sans">🎯 이달의 핵심 성품 열매: ________</span>
          </div>
        </div>
      </div>

      {/* 3. 3 Clusters Grid (3 Cols: Godward / Manward / Selfward) */}
      <div className="grid grid-cols-3 gap-3 flex-1 mb-2">
        {fruitClusters.map((cluster, cIdx) => (
          <div
            key={cIdx}
            className={`border rounded-2xl p-2.5 ${cluster.color} flex flex-col justify-between shadow-2xs space-y-1.5`}
          >
            {/* Cluster Header */}
            <div className="border-b border-slate-200/80 pb-1 flex items-center justify-between">
              <div>
                <h3 className="text-[10.5px] font-extrabold font-sans">{cluster.clusterName}</h3>
                <p className="text-[7.5px] text-slate-400 font-normal">{cluster.clusterDesc}</p>
              </div>
              <span className={`w-2 h-2 rounded-full ${cluster.badgeColor}`}></span>
            </div>

            {/* 3 Fruit Items */}
            <div className="space-y-1.5 flex-1 flex flex-col justify-between">
              {cluster.items.map((item, iIdx) => (
                <div key={iIdx} className="bg-white p-2 rounded-xl border border-slate-200/80 flex flex-col justify-between space-y-1 shadow-2xs">
                  <div className="flex items-center justify-between text-[9px] font-bold">
                    <span className="text-slate-800 font-sans">{item.name}</span>
                    {/* 5 Rating Circles */}
                    <div className="flex items-center space-x-1 text-[7.5px] font-mono text-slate-300">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <span key={num} className="w-3.5 h-3.5 rounded-full border border-slate-300 flex items-center justify-center font-bold hover:bg-emerald-50 hover:text-emerald-700">
                          {num}
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="text-[8px] text-slate-500 font-sans leading-tight">{item.desc}</p>

                  <div className="border-t border-slate-100 pt-0.5 text-[7.5px] text-slate-400 font-sans">
                    성찰: _____________________________________
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 4. Bottom Verse & Blessing Seal */}
      <div className="border border-emerald-200/90 rounded-2xl p-2 bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-emerald-50/70 shadow-2xs flex items-center justify-between text-[9.5px]">
        <div className="font-sans text-emerald-950 font-bold">
          📖 &quot;오직 성령의 열매는 사랑과 희락과 화평과 오래 참음과 자비와 양선과 충성과 온유와 절제니 이같은 것을 금지할 법이 없느니라 (갈라디아서 5:22-23)&quot;
        </div>
        <div className="text-[8.5px] font-mono font-bold text-emerald-700 whitespace-nowrap bg-white px-2 py-0.5 rounded-full border border-emerald-200">
          Holy Spirit Fruit Seal 🕊️
        </div>
      </div>

      {/* 5. Footer */}
      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1.5 border-t border-slate-200 mt-1.5">
        <span>PREMIUM DIARY STUDIO — SPIRITUAL CHARACTER GROWTH JOURNAL</span>
        <span>{year} {monthName} Edition</span>
      </div>
    </div>
  )
}
