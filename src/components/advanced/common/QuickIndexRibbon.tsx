'use client'

import React from 'react'

interface QuickIndexRibbonProps {
  activeTarget?: string
  isChurchMode?: boolean
  className?: string
}

export default function QuickIndexRibbon({
  activeTarget = '',
  isChurchMode = false,
  className = '',
}: QuickIndexRibbonProps) {
  const generalTabs = [
    { key: 'calendar', label: '📅 달력', bg: 'hover:bg-indigo-100 hover:text-indigo-900' },
    { key: 'overview', label: '📊 개요', bg: 'hover:bg-blue-100 hover:text-blue-900' },
    { key: 'habit', label: '🌱 습관', bg: 'hover:bg-emerald-100 hover:text-emerald-900' },
    { key: 'gratitude', label: '☀️ 감사', bg: 'hover:bg-amber-100 hover:text-amber-900' },
    { key: 'budget', label: '💰 가계부', bg: 'hover:bg-teal-100 hover:text-teal-900' },
    { key: 'culture', label: '🎬 문화', bg: 'hover:bg-rose-100 hover:text-rose-900' },
    { key: 'kpt', label: '🔄 KPT', bg: 'hover:bg-purple-100 hover:text-purple-900' },
    { key: 'buckettravel', label: '✈️ 버킷', bg: 'hover:bg-sky-100 hover:text-sky-900' },
    { key: 'wellnessmood', label: '🥗 웰니스', bg: 'hover:bg-emerald-100 hover:text-emerald-900' },
    { key: 'hundredgoal', label: '🎯 100일', bg: 'hover:bg-rose-100 hover:text-rose-900' },
  ]

  const churchTabs = [
    { key: 'calendar', label: '📅 달력', bg: 'hover:bg-indigo-100 hover:text-indigo-900' },
    { key: 'overview', label: '📊 개요', bg: 'hover:bg-blue-100 hover:text-blue-900' },
    { key: 'prayer', label: '🙏 기도', bg: 'hover:bg-amber-100 hover:text-amber-900' },
    { key: 'scripture', label: '📜 암송', bg: 'hover:bg-purple-100 hover:text-purple-900' },
    { key: 'sermon', label: '🏛️ 설교', bg: 'hover:bg-blue-100 hover:text-blue-900' },
    { key: 'biblemap', label: '🕊️ 통독', bg: 'hover:bg-emerald-100 hover:text-emerald-900' },
    { key: 'letter', label: '💌 편지', bg: 'hover:bg-rose-100 hover:text-rose-900' },
    { key: 'soapjournal', label: '🌱 SOAP', bg: 'hover:bg-teal-100 hover:text-teal-900' },
    { key: 'intercessory', label: '👨‍👩‍👧 중보', bg: 'hover:bg-indigo-100 hover:text-indigo-900' },
    { key: 'fruitstracker', label: '🍇 열매', bg: 'hover:bg-amber-100 hover:text-amber-900' },
  ]

  const tabs = isChurchMode ? churchTabs : generalTabs

  return (
    <nav
      data-quick-ribbon="true"
      className={`flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 px-1 bg-slate-100/90 rounded-full border border-slate-200/80 shadow-2xs ${className}`}
    >
      {tabs.map((t) => {
        const isActive = activeTarget === t.key
        return (
          <button
            key={t.key}
            type="button"
            data-nav-target={t.key}
            data-jump-btn="true"
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-sans transition-all whitespace-nowrap cursor-pointer select-none ${
              isActive
                ? 'bg-slate-900 text-white shadow-2xs scale-105 ring-1 ring-slate-900/40'
                : `text-slate-600 ${t.bg} hover:scale-102`
            }`}
          >
            {t.label}
          </button>
        )
      })}
    </nav>
  )
}
