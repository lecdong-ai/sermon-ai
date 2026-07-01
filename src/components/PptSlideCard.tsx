'use client'

import { Check } from 'lucide-react'
import type { PptSlide } from '@/types'

const LAYOUT_LABELS: Record<string, { label: string; color: string }> = {
  'title': { label: '표지', color: 'bg-blue-600' },
  'bullets': { label: '내용', color: 'bg-gray-700' },
  'section-header': { label: '구분', color: 'bg-amber-600' },
  'quote': { label: '인용', color: 'bg-emerald-600' },
  'two-column': { label: '2단', color: 'bg-purple-600' },
  'closing': { label: '마무리', color: 'bg-rose-600' },
}

interface Props {
  slide: PptSlide
  index: number
  active: boolean
  onClick: () => void
}

export default function PptSlideCard({ slide, index, active, onClick }: Props) {
  const layoutInfo = LAYOUT_LABELS[slide.layout] || LAYOUT_LABELS.bullets

  return (
    <button
      onClick={onClick}
      className={`group relative w-full text-left rounded-xl border-2 transition-all duration-200 overflow-hidden ${
        active
          ? 'border-[#8d7a5b] shadow-[0_0_0_1px_rgba(141,122,91,0.15),0_4px_12px_rgba(141,122,91,0.1)]'
          : 'border-[#e4e2dd] hover:border-[#c9c5be] hover:shadow-sm'
      }`}
    >
      <div className="bg-white p-3.5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-[#8a8580]">슬라이드 {index + 1}</span>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded text-white ${layoutInfo.color}`}>
            {layoutInfo.label}
          </span>
        </div>
        <p className="text-[13px] font-bold text-[#2c2a29] truncate mb-1">{slide.title}</p>
        <div className="space-y-0.5">
          {slide.content.slice(0, 3).map((item, i) => (
            <p key={i} className="text-[11px] text-[#8a8580] truncate">
              {item.length > 30 ? item.substring(0, 30) + '...' : item}
            </p>
          ))}
          {slide.content.length > 3 && (
            <p className="text-[10px] text-[#a09b96]">+{slide.content.length - 3}개 더보기</p>
          )}
        </div>
      </div>
      {active && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#8d7a5b] flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </div>
      )}
    </button>
  )
}
