'use client'

import { useState } from 'react'
import SectionCard from './SectionCard'
import { FileDown, Loader2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import type { PPTData } from '@/types'

interface Props {
  data: PPTData
  sermonId: string
}

const SLIDE_THEMES = [
  { accent: '#4F46E5', light: '#EEF2FF', gradient: 'from-indigo-50 via-white to-white', label: 'Indigo' },
  { accent: '#0891B2', light: '#ECFEFF', gradient: 'from-cyan-50 via-white to-white', label: 'Cyan' },
  { accent: '#7C3AED', light: '#F5F3FF', gradient: 'from-violet-50 via-white to-white', label: 'Violet' },
  { accent: '#DC2626', light: '#FEF2F2', gradient: 'from-red-50 via-white to-white', label: 'Red' },
  { accent: '#D97706', light: '#FFFBEB', gradient: 'from-amber-50 via-white to-white', label: 'Amber' },
]

export default function PPTSection({ data, sermonId }: Props) {
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentIdx, setCurrentIdx] = useState(0)

  const slides = data.slides || []
  const total = slides.length

  const goPrev = () => setCurrentIdx((prev) => Math.max(prev - 1, 0))
  const goNext = () => setCurrentIdx((prev) => Math.min(prev + 1, total - 1))

  const handleDownload = async () => {
    setDownloading(true)
    setError(null)
    try {
      const res = await fetch(`/api/ppt/${sermonId}`)
      if (!res.ok) {
        const errData = await res.json().catch(() => null)
        throw new Error(errData?.error || 'PPT 다운로드 실패')
      }
      const blob = await res.blob()
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `sermon-${sermonId}.pptx`
      link.click()
      URL.revokeObjectURL(link.href)
    } catch (err: any) {
      setError(err.message || 'PPT 생성 중 오류가 발생했습니다.')
    } finally {
      setDownloading(false)
    }
  }

  if (total === 0) {
    return (
      <SectionCard title="PPT 개요" emoji="📊">
        <p className="text-[15px] text-[#8b95a1] text-center py-6">PPT 데이터가 없습니다.</p>
      </SectionCard>
    )
  }

  const slide = slides[currentIdx]
  const theme = SLIDE_THEMES[currentIdx % SLIDE_THEMES.length]
  const isFirst = currentIdx === 0
  const isLast = currentIdx === total - 1
  const bulletPoints = (slide?.content || '')
    .split('\n')
    .map((l) => l.replace(/^[•\-*]\s*/, '').trim())
    .filter(Boolean)

  return (
    <SectionCard
      title="PPT 개요"
      emoji="📊"
      action={
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-[13px] font-bold shadow-md shadow-indigo-200 hover:shadow-lg hover:shadow-indigo-300 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {downloading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              생성 중...
            </>
          ) : (
            <>
              <FileDown className="w-3.5 h-3.5" />
              .pptx 다운로드
            </>
          )}
        </button>
      }
    >
      <div className="space-y-5">
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
            <p className="text-[14px] text-red-700">{error}</p>
          </div>
        )}

        {/* 슬라이드 미리보기 */}
        <div className="w-full max-w-xl mx-auto">
          <div className="rounded-2xl overflow-hidden bg-white shadow-lg shadow-slate-200/60 ring-1 ring-slate-200/80">
            {/* 상단 악센트 바 */}
            <div className="h-2" style={{ background: `linear-gradient(90deg, ${theme.accent}, ${theme.accent}88)` }} />

            {/* 헤더 */}
            <div className="px-6 py-3.5 border-b border-slate-100" style={{ backgroundColor: theme.light }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[12px] font-bold shadow-sm"
                    style={{ backgroundColor: theme.accent }}
                  >
                    {currentIdx + 1}
                  </div>
                  <span className="text-[13px] font-semibold text-slate-500">
                    {isFirst ? '표지' : isLast ? '마무리' : slide.title}
                  </span>
                </div>
                <span className="text-[12px] font-medium text-slate-400">
                  {currentIdx + 1} / {total}
                </span>
              </div>
            </div>

            {/* 본문 */}
            <div className={`px-6 py-8 bg-gradient-to-b ${theme.gradient} min-h-[300px] max-h-[400px] overflow-y-auto`}>
              {isFirst ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-sm" style={{ backgroundColor: theme.light }}>
                    <span className="text-[28px]">✝</span>
                  </div>
                  <h3 className="text-[28px] font-extrabold text-slate-800 mt-6 leading-tight tracking-tight">{slide.title}</h3>
                  <div className="w-16 h-1 mx-auto mt-5 rounded-full" style={{ backgroundColor: theme.accent }} />
                  <p className="text-[15px] text-slate-400 mt-5 font-medium">
                    {bulletPoints
                      .filter((b) => b.includes(':'))
                      .slice(0, 2)
                      .map((b) => b.split(':')[1]?.trim() || b)
                      .join(' · ')}
                  </p>
                </div>
              ) : (
                <div>
                  <h3 className="text-[22px] font-bold text-slate-800 mb-5 tracking-tight">{slide.title}</h3>
                  <ul className="space-y-3">
                    {bulletPoints.slice(0, 6).map((point, i) => (
                      <li key={i} className="flex items-start gap-3.5 group">
                        <div
                          className="w-2 h-2 rounded-full mt-[10px] shrink-0 ring-2 ring-offset-2 transition-all duration-200 group-hover:scale-125"
                          style={{ backgroundColor: theme.accent }}
                        />
                        <span className="text-[16px] text-slate-600 leading-relaxed">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* 하단 */}
            <div className="px-6 py-3 border-t border-slate-100 bg-white flex items-center justify-between">
              <span className="text-[12px] font-medium text-slate-400">목회자 AI 솔루션</span>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.accent }} />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
              </div>
            </div>
          </div>

          {/* 네비게이션 */}
          {total > 1 && (
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={goPrev}
                disabled={currentIdx === 0}
                className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIdx(i)}
                    className={`transition-all duration-300 rounded-full ${
                      i === currentIdx
                        ? 'w-7 h-2.5 shadow-sm'
                        : 'w-2 h-2 bg-slate-200 hover:bg-slate-300'
                    }`}
                    style={i === currentIdx ? { backgroundColor: theme.accent } : {}}
                  />
                ))}
              </div>

              <button
                onClick={goNext}
                disabled={currentIdx === total - 1}
                className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* 썸네일 스트립 */}
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-2">
          {slides.map((s, i) => {
            const t = SLIDE_THEMES[i % SLIDE_THEMES.length]
            const active = i === currentIdx
            return (
              <button
                key={i}
                onClick={() => setCurrentIdx(i)}
                className={`rounded-xl overflow-hidden transition-all duration-200 ${
                  active
                    ? 'ring-2 shadow-md scale-105'
                    : 'opacity-60 hover:opacity-100 hover:ring-1'
                }`}
                style={{
                  boxShadow: active ? `0 4px 12px ${t.accent}33` : undefined,
                }}
              >
                <div className="h-1.5" style={{ backgroundColor: t.accent }} />
                <div className="px-2 py-2 bg-white text-center">
                  <span className="text-[11px] font-bold text-slate-500">{i + 1}</span>
                  <p className="text-[8px] text-slate-400 truncate mt-0.5 leading-tight">
                    {i === 0 ? '표지' : i === total - 1 ? '마무리' : s.title}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </SectionCard>
  )
}
