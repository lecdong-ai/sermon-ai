'use client'

import { useState, useRef, useMemo, useCallback } from 'react'
import SectionCard from './SectionCard'
import { ChevronLeft, ChevronRight, Download, FileText, Palette } from 'lucide-react'
import type { CardNews } from '@/types'

interface Props {
  data: CardNews
}

type ThemeKey = 'modern' | 'classic' | 'emotional'

const THEMES: Record<ThemeKey, {
  name: string
  headers: Record<string, string>
  badges: Record<string, string>
  bodyBg: Record<string, string>
}> = {
  modern: {
    name: '모던',
    headers: {
      '커버': 'from-indigo-500 via-purple-500 to-pink-500',
      '본문': 'from-blue-500 to-indigo-500',
      '적용': 'from-emerald-500 to-teal-500',
      '말씀요약': 'from-violet-500 to-purple-500',
      '마무리': 'from-amber-500 to-orange-500',
    },
    badges: {
      '커버': 'bg-white/20 text-white',
      '본문': 'bg-blue-100 text-blue-700',
      '적용': 'bg-emerald-100 text-emerald-700',
      '말씀요약': 'bg-violet-100 text-violet-700',
      '마무리': 'bg-amber-100 text-amber-700',
    },
    bodyBg: {
      '커버': 'from-indigo-50 to-purple-50',
      '본문': 'from-blue-50 to-indigo-50',
      '적용': 'from-emerald-50 to-teal-50',
      '말씀요약': 'from-violet-50 to-purple-50',
      '마무리': 'from-amber-50 to-orange-50',
    },
  },
  classic: {
    name: '클래식',
    headers: {
      '커버': 'from-amber-800 via-yellow-700 to-stone-700',
      '본문': 'from-stone-700 to-amber-900',
      '적용': 'from-emerald-800 to-teal-800',
      '말씀요약': 'from-amber-700 to-stone-800',
      '마무리': 'from-rose-800 to-stone-700',
    },
    badges: {
      '커버': 'bg-white/20 text-white',
      '본문': 'bg-stone-100 text-stone-700',
      '적용': 'bg-emerald-100 text-emerald-700',
      '말씀요약': 'bg-amber-100 text-amber-700',
      '마무리': 'bg-rose-100 text-rose-700',
    },
    bodyBg: {
      '커버': 'from-stone-50 to-amber-50',
      '본문': 'from-amber-50 to-stone-50',
      '적용': 'from-emerald-50 to-teal-50',
      '말씀요약': 'from-amber-50 to-yellow-50',
      '마무리': 'from-rose-50 to-stone-50',
    },
  },
  emotional: {
    name: '감성',
    headers: {
      '커버': 'from-rose-400 via-pink-500 to-purple-500',
      '본문': 'from-purple-400 to-indigo-500',
      '적용': 'from-teal-400 to-emerald-500',
      '말씀요약': 'from-pink-400 to-rose-500',
      '마무리': 'from-sky-400 to-indigo-500',
    },
    badges: {
      '커버': 'bg-white/20 text-white',
      '본문': 'bg-purple-100 text-purple-700',
      '적용': 'bg-teal-100 text-teal-700',
      '말씀요약': 'bg-pink-100 text-pink-700',
      '마무리': 'bg-sky-100 text-sky-700',
    },
    bodyBg: {
      '커버': 'from-rose-50 to-pink-50',
      '본문': 'from-purple-50 to-indigo-50',
      '적용': 'from-teal-50 to-emerald-50',
      '말씀요약': 'from-pink-50 to-rose-50',
      '마무리': 'from-sky-50 to-indigo-50',
    },
  },
}

const CARD_TYPE_LABELS = [
  '커버', '본문', '본문', '본문', '말씀요약', '적용', '적용', '마무리',
]

const THEME_KEYS: ThemeKey[] = ['modern', 'classic', 'emotional']

function getTheme(key: ThemeKey): ThemeKey {
  const idx = THEME_KEYS.indexOf(key)
  const next = (idx + 1) % THEME_KEYS.length
  return THEME_KEYS[next]
}

export default function CardNewsSection({ data }: Props) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [theme, setTheme] = useState<ThemeKey>('modern')
  const total = data.slides?.length || 0
  const cardRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef(0)

  const th = THEMES[theme]

  const cardTypes = useMemo(() => {
    return data.slides.map((_, i) => {
      const idx = Math.min(i, CARD_TYPE_LABELS.length - 1)
      return CARD_TYPE_LABELS[idx]
    })
  }, [data.slides])

  const goPrev = useCallback(() => {
    setCurrentIdx(prev => prev > 0 ? prev - 1 : prev)
  }, [])

  const goNext = useCallback(() => {
    setCurrentIdx(prev => prev < total - 1 ? prev + 1 : prev)
  }, [total])

  const goToSlide = useCallback((idx: number) => {
    setCurrentIdx(idx)
  }, [])

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

  const handleSavePdf = useCallback(async () => {
    try {
      const [html2canvas, jsPdfModule] = await Promise.all([
        import('html2canvas').then(m => m.default),
        import('jspdf'),
      ])
      const jsPDF = jsPdfModule.default
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageW = 210
      const pageH = 297
      const margin = 10
      const cardW = pageW - margin * 2
      const cardH = cardW * 1.25

      for (let i = 0; i < total; i++) {
        setCurrentIdx(i)
        await new Promise(r => setTimeout(r, 200))
        if (!cardRef.current) continue
        const canvas = await html2canvas(cardRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' })
        if (i > 0) pdf.addPage()
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', margin, margin, cardW, cardH)
      }
      pdf.save('card-news.pdf')
    } catch {}
  }, [total])

  if (!total) return (
    <SectionCard title="카드뉴스" emoji="🎴">
      <p className="text-[15px] text-[#8b95a1] text-center py-6">카드뉴스 데이터가 없습니다.</p>
    </SectionCard>
  )

  const slide = data.slides[currentIdx]
  const label = cardTypes[currentIdx]
  const headerGradient = th.headers[label] || th.headers['본문']
  const badgeClass = th.badges[label] || th.badges['본문']
  const bodyBg = th.bodyBg[label] || th.bodyBg['본문']

  return (
    <SectionCard
      title="카드뉴스"
      emoji="🎴"
      action={
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setTheme(getTheme(theme))}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[14px] text-[#8b95a1] hover:text-primary-500 hover:bg-primary-50 transition-all"
            title={`테마: ${th.name}`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span className="font-medium">{th.name}</span>
          </button>
          <button
            onClick={() => handleSaveSlide()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[14px] text-[#8b95a1] hover:text-primary-500 hover:bg-primary-50 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="font-medium">PNG</span>
          </button>
          <button
            onClick={handleSavePdf}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[14px] text-[#8b95a1] hover:text-primary-500 hover:bg-primary-50 transition-all"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="font-medium">PDF</span>
          </button>
        </div>
      }
    >
      {/* 썸네일 그리드 */}
      <div className="mb-5">
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
          {data.slides.map((s, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              className={`rounded-lg border-2 overflow-hidden transition-all duration-200 bg-white ${
                i === currentIdx
                  ? 'border-primary-500 shadow-md ring-1 ring-primary-200'
                  : 'border-[#e5e8eb] opacity-60 hover:opacity-100'
              }`}
            >
              <div className={`bg-gradient-to-r ${headerGradient} px-1 py-[3px]`}>
                <p className="text-[9px] text-white/80 font-medium truncate">{label}</p>
              </div>
              <div className="p-1">
                <p className="text-[9px] text-[#4e5968] font-bold truncate">{s.title}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 메인 카드 */}
      <div className="relative w-full max-w-sm mx-auto">
        <div
          ref={cardRef}
          className="rounded-2xl overflow-hidden bg-white shadow-lg aspect-[4/5] flex flex-col"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* 헤더 */}
          <div className={`px-6 pt-6 pb-5 bg-gradient-to-r ${headerGradient} shrink-0 relative overflow-hidden`}>
            <div className="absolute inset-0 bg-white/10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 50%)' }} />
            <div className="relative z-10 flex items-center justify-between mb-2">
              <span className={`text-[11px] font-bold px-2.5 py-[3px] rounded-full ${badgeClass}`}>
                {label}
              </span>
              <span className="text-[11px] text-white/50 font-medium">
                {currentIdx + 1} / {total}
              </span>
            </div>
            <h4
              className={`relative z-10 font-bold leading-tight text-white ${
                currentIdx === 0 ? 'text-[26px] mt-1' : 'text-[20px]'
              }`}
            >
              {slide.title}
            </h4>
          </div>

          {/* 본문 */}
          <div className={`flex-1 px-6 py-6 overflow-y-auto bg-gradient-to-b ${bodyBg}`}>
            <p className="text-[18px] sm:text-[19px] text-[#4e5968] leading-[1.9] whitespace-pre-wrap break-words font-medium">
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
