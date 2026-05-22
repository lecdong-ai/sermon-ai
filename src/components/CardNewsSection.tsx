'use client'

import { useState, useCallback, useRef, useMemo } from 'react'
import SectionCard from './SectionCard'
import { ChevronLeft, ChevronRight, Download, Image } from 'lucide-react'
import type { CardNews } from '@/types'

interface Props {
  data: CardNews
}

const CARD_TYPE_TEMPLATES = [
  { label: '커버', gradient: 'from-indigo-500 via-purple-500 to-pink-500', badge: 'bg-white/20 text-white' },
  { label: '본문', gradient: 'from-blue-500 to-indigo-500', badge: 'bg-blue-100 text-blue-700' },
  { label: '본문', gradient: 'from-blue-500 to-indigo-500', badge: 'bg-blue-100 text-blue-700' },
  { label: '본문', gradient: 'from-blue-500 to-indigo-500', badge: 'bg-blue-100 text-blue-700' },
  { label: '본문', gradient: 'from-blue-500 to-indigo-500', badge: 'bg-blue-100 text-blue-700' },
  { label: '본문', gradient: 'from-blue-500 to-indigo-500', badge: 'bg-blue-100 text-blue-700' },
  { label: '적용', gradient: 'from-emerald-500 to-teal-500', badge: 'bg-emerald-100 text-emerald-700' },
  { label: '적용', gradient: 'from-emerald-500 to-teal-500', badge: 'bg-emerald-100 text-emerald-700' },
  { label: '핵심요약', gradient: 'from-violet-500 to-purple-500', badge: 'bg-violet-100 text-violet-700' },
  { label: '마무리', gradient: 'from-amber-500 to-orange-500', badge: 'bg-amber-100 text-amber-700' },
]

const CARD_BG_LIGHT: Record<string, string> = {
  '커버': 'from-indigo-50 to-purple-50',
  '본문': 'from-blue-50 to-indigo-50',
  '적용': 'from-emerald-50 to-teal-50',
  '핵심요약': 'from-violet-50 to-purple-50',
  '마무리': 'from-amber-50 to-orange-50',
}

export default function CardNewsSection({ data }: Props) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const total = data.slides?.length || 0
  const cardRef = useRef<HTMLDivElement>(null)
  const thumbRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef(0)
  const [direction, setDirection] = useState(0)

  const cardTypes = useMemo(() => {
    return data.slides.map((_, i) => {
      const idx = Math.min(i, CARD_TYPE_TEMPLATES.length - 1)
      return CARD_TYPE_TEMPLATES[idx]
    })
  }, [data.slides])

  const goPrev = useCallback(() => {
    if (currentIdx > 0) {
      setDirection(-1)
      setCurrentIdx(prev => prev - 1)
    }
  }, [currentIdx])

  const goNext = useCallback(() => {
    if (currentIdx < total - 1) {
      setDirection(1)
      setCurrentIdx(prev => prev + 1)
    }
  }, [currentIdx, total])

  const goToSlide = useCallback((idx: number) => {
    setDirection(idx > currentIdx ? 1 : -1)
    setCurrentIdx(idx)
  }, [currentIdx])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentIdx < total - 1) goNext()
      else if (diff < 0 && currentIdx > 0) goPrev()
    }
  }, [currentIdx, total, goNext, goPrev])

  const handleSaveSlide = useCallback(async (idx?: number) => {
    const targetIdx = idx ?? currentIdx
    setCurrentIdx(targetIdx)
    await new Promise(r => setTimeout(r, 100))
    if (!cardRef.current) return
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(cardRef.current, { scale: 3, useCORS: true, backgroundColor: '#ffffff' })
      const link = document.createElement('a')
      link.download = `card-news-${String(targetIdx + 1).padStart(2, '0')}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch {}
  }, [currentIdx])

  const handleSaveAll = useCallback(async () => {
    for (let i = 0; i < total; i++) {
      await handleSaveSlide(i)
      await new Promise(r => setTimeout(r, 300))
    }
  }, [total, handleSaveSlide])

  if (!total) return (
    <SectionCard title="카드뉴스" emoji="🎴">
      <p className="text-[15px] text-[#8b95a1] text-center py-6">카드뉴스 데이터가 없습니다.</p>
    </SectionCard>
  )

  const slide = data.slides[currentIdx]
  const ct = cardTypes[currentIdx]

  return (
    <SectionCard
      title="카드뉴스"
      emoji="🎴"
      action={
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSaveSlide()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[14px] text-[#8b95a1] hover:text-primary-500 hover:bg-primary-50 transition-all duration-200"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="font-medium">저장</span>
          </button>
          {total > 1 && (
            <button
              onClick={handleSaveAll}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[14px] text-[#8b95a1] hover:text-primary-500 hover:bg-primary-50 transition-all duration-200"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="font-medium">전체 저장</span>
            </button>
          )}
        </div>
      }
    >
      {/* 썸네일 그리드 (5열 × 2행) */}
      <div className="mb-4">
        <div className="grid grid-cols-5 gap-2">
          {data.slides.map((s, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              className={`rounded-xl border-2 overflow-hidden transition-all duration-200 bg-white ${
                i === currentIdx
                  ? 'border-primary-500 shadow-md shadow-primary-200 ring-1 ring-primary-200'
                  : 'border-[#e5e8eb] opacity-65 hover:opacity-100 hover:shadow-sm'
              }`}
            >
              <div className={`bg-gradient-to-r ${cardTypes[i].gradient} px-1.5 py-[4px]`}>
                <p className="text-[10px] text-white/80 font-medium">{cardTypes[i].label}</p>
                <p className="text-[11px] font-bold text-white truncate leading-tight">{s.title}</p>
              </div>
              <div className="p-1">
                <p className="text-[10px] text-[#8b95a1] line-clamp-2 leading-snug">{s.content}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 메인 카드 */}
      <div className="relative w-full max-w-sm mx-auto">
        <div
          ref={cardRef}
          className="rounded-2xl overflow-hidden bg-white shadow-lg aspect-[4/5] flex flex-col transition-all duration-300"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* 헤더 */}
          <div className={`px-6 py-5 bg-gradient-to-r ${ct.gradient} shrink-0 relative overflow-hidden`}>
            <div className="absolute inset-0 bg-white/10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 50%)' }} />
            <div className="relative z-10 flex items-center justify-between mb-1">
              <span className={`text-[12px] font-bold px-2.5 py-[3px] rounded-full ${ct.badge}`}>
                {ct.label} {currentIdx + 1}/{total}
              </span>
            </div>
            <h4 className={`relative z-10 font-bold leading-snug text-white ${currentIdx === 0 ? 'text-[24px] mt-3' : 'text-[18px]'}`}>
              {slide.title}
            </h4>
          </div>

          {/* 본문 */}
          <div className={`flex-1 px-6 py-5 overflow-y-auto bg-gradient-to-b ${CARD_BG_LIGHT[ct.label] || 'from-white to-white'}`}>
            <p className="text-[19px] sm:text-[20px] text-[#4e5968] leading-[1.8] whitespace-pre-wrap break-words">
              {slide.content}
            </p>
          </div>


        </div>

        {/* 내비게이션 */}
        {total > 1 && (
          <>
            <button
              onClick={goPrev}
              disabled={currentIdx === 0}
              className="absolute -left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-lg border border-[#e5e8eb] flex items-center justify-center hover:bg-gray-50 hover:shadow-xl transition-all disabled:opacity-0 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-4.5 h-4.5 text-[#4e5968]" />
            </button>
            <button
              onClick={goNext}
              disabled={currentIdx === total - 1}
              className="absolute -right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-lg border border-[#e5e8eb] flex items-center justify-center hover:bg-gray-50 hover:shadow-xl transition-all disabled:opacity-0 disabled:pointer-events-none"
            >
              <ChevronRight className="w-4.5 h-4.5 text-[#4e5968]" />
            </button>
          </>
        )}
      </div>

      {/* 하단 닷 내비게이션 */}
      {total > 1 && (
        <div className="flex justify-center gap-1.5 mt-5">
          {data.slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              className={`transition-all duration-300 rounded-full ${
                i === currentIdx ? 'w-7 h-2 bg-primary-500' : 'w-2 h-2 bg-[#d1d6db] hover:bg-[#8b95a1]'
              }`}
            />
          ))}
        </div>
      )}
    </SectionCard>
  )
}
