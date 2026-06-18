'use client'

import { useState } from 'react'
import SectionCard from './SectionCard'
import { FileDown, Loader2, AlertCircle, ChevronLeft, ChevronRight, Palette } from 'lucide-react'
import type { PPTData, PPTShare } from '@/types'

interface Props {
  data: PPTData
  sermonId: string
}

type ThemeKey = 'modern' | 'classic' | 'minimal'

const STYLE_META: Record<string, { label: string; icon: string }> = {
  list: { label: '일반', icon: '📄' },
  scripture: { label: '말씀', icon: '📖' },
  highlight: { label: '강조', icon: '⭐' },
  apply: { label: '적용', icon: '✓' },
}

const THEMES: Record<ThemeKey, {
  name: string
  accent: string
  light: string
  gradient: string
}> = {
  modern: { name: '모던', accent: '#4F46E5', light: '#EEF2FF', gradient: 'from-indigo-50 via-white to-white' },
  classic: { name: '클래식', accent: '#92400E', light: '#FFFBEB', gradient: 'from-amber-50 via-white to-white' },
  minimal: { name: '미니멀', accent: '#1E293B', light: '#F8FAFC', gradient: 'from-slate-50 via-white to-white' },
}

const THEME_KEYS: ThemeKey[] = ['modern', 'classic', 'minimal']

function getNextTheme(key: ThemeKey): ThemeKey {
  const idx = THEME_KEYS.indexOf(key)
  return THEME_KEYS[(idx + 1) % THEME_KEYS.length]
}

function getBulletItems(content: string): string[] {
  return content
    .split('\n')
    .map(l => l.replace(/^[•\-*]\s*/, '').trim())
    .filter(Boolean)
}

export default function PPTSection({ data, sermonId }: Props) {
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [theme, setTheme] = useState<ThemeKey>('modern')

  const slides = data.slides || []
  const total = slides.length

  const goPrev = () => setCurrentIdx(prev => Math.max(prev - 1, 0))
  const goNext = () => setCurrentIdx(prev => Math.min(prev + 1, total - 1))

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

  const th = THEMES[theme]
  const slide = slides[currentIdx] as PPTShare
  const slideStyle = slide.style || 'list'
  const sm = STYLE_META[slideStyle] || STYLE_META.list
  const isFirst = currentIdx === 0
  const isLast = currentIdx === total - 1
  const bulletPoints = getBulletItems(slide.content || '')

  const styleBgColors: Record<string, string> = {
    list: 'bg-white',
    scripture: 'bg-indigo-950',
    highlight: 'bg-indigo-50',
    apply: 'bg-emerald-50',
  }
  const styleTextColors: Record<string, string> = {
    list: 'text-slate-800',
    scripture: 'text-indigo-100',
    highlight: 'text-indigo-900',
    apply: 'text-emerald-900',
  }
  const styleTitleColors: Record<string, string> = {
    list: 'text-slate-800',
    scripture: 'text-amber-300',
    highlight: 'text-indigo-800',
    apply: 'text-emerald-800',
  }

  return (
    <SectionCard
      title="PPT 개요"
      emoji="📊"
      action={
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme(getNextTheme(theme))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[14px] text-[#8b95a1] hover:text-indigo-600 hover:bg-indigo-50 transition-all"
            title={th.name}
          >
            <Palette className="w-3.5 h-3.5" />
            <span className="font-medium">{th.name}</span>
          </button>
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
        </div>
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
          <div className={`rounded-2xl overflow-hidden shadow-lg shadow-slate-200/60 ring-1 ring-slate-200/80 ${styleBgColors[slideStyle]}`}>
            {/* 상단 악센트 바 (스타일별 색상) */}
            <div className="h-2" style={{
              background: slideStyle === 'scripture' ? 'linear-gradient(90deg, #F6E05E, #D69E2E)' :
                          slideStyle === 'highlight' ? 'linear-gradient(90deg, #4F46E5, #7C3AED)' :
                          slideStyle === 'apply' ? 'linear-gradient(90deg, #38A169, #48BB78)' :
                          `linear-gradient(90deg, ${th.accent}, ${th.accent}88)`,
            }} />

            {/* 헤더 */}
            <div className="px-6 py-3.5 border-b border-slate-100" style={{ backgroundColor: slideStyle === 'scripture' ? '#1a1a2e' : th.light }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[12px] font-bold shadow-sm"
                    style={{
                      background: slideStyle === 'scripture' ? 'linear-gradient(135deg, #F6E05E, #D69E2E)' :
                                  slideStyle === 'apply' ? 'linear-gradient(135deg, #38A169, #48BB78)' :
                                  slideStyle === 'highlight' ? 'linear-gradient(135deg, #4F46E5, #7C3AED)' :
                                  `linear-gradient(135deg, ${th.accent}, ${th.accent}dd)`,
                    }}
                  >
                    {currentIdx + 1}
                  </div>
                  <span className={`text-[13px] font-semibold ${slideStyle === 'scripture' ? 'text-amber-300' : 'text-slate-500'}`}>
                    {isFirst ? '표지' : isLast ? '마무리' : slide.title}
                  </span>
                  {!isFirst && !isLast && (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                      slideStyle === 'scripture' ? 'bg-amber-400/20 text-amber-300' :
                      slideStyle === 'highlight' ? 'bg-indigo-100 text-indigo-700' :
                      slideStyle === 'apply' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {sm.icon} {sm.label}
                    </span>
                  )}
                </div>
                <span className={`text-[12px] font-medium ${slideStyle === 'scripture' ? 'text-slate-400' : 'text-slate-400'}`}>
                  {currentIdx + 1} / {total}
                </span>
              </div>
            </div>

            {/* 본문 (스타일별 디자인) */}
            <div className={`px-6 py-8 min-h-[300px] max-h-[400px] overflow-y-auto ${styleBgColors[slideStyle]}`}>
              {isFirst ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-sm" style={{ backgroundColor: th.light }}>
                    <span className="text-[28px]">✝</span>
                  </div>
                  <h3 className={`text-[28px] font-extrabold mt-6 leading-tight tracking-tight ${styleTitleColors[slideStyle]}`}>
                    {slide.title}
                  </h3>
                  <div className="w-16 h-1 mx-auto mt-5 rounded-full" style={{ backgroundColor: th.accent }} />
                  <p className={`text-[15px] mt-5 font-medium ${styleTextColors[slideStyle]}`}>
                    {slide.title}
                  </p>
                </div>
              ) : slideStyle === 'scripture' ? (
                <div className="text-center py-4">
                  <span className="text-5xl text-amber-400/60 block mb-4">&ldquo;</span>
                  <h3 className="text-[24px] font-bold text-amber-300 mb-6 tracking-tight">{slide.title}</h3>
                  <div className="max-w-lg mx-auto">
                    {bulletPoints.slice(0, 4).map((point, i) => (
                      <p key={i} className="text-[18px] text-indigo-100 leading-relaxed mb-4 font-medium">{point}</p>
                    ))}
                  </div>
                  <span className="text-5xl text-amber-400/60 block mt-2 -scale-y-100">&ldquo;</span>
                </div>
              ) : slideStyle === 'highlight' ? (
                <div>
                  <h3 className="text-[26px] font-bold text-indigo-900 mb-6 tracking-tight">{slide.title}</h3>
                  <div className="space-y-4">
                    {bulletPoints.slice(0, 5).map((point, i) => (
                      <div key={i} className="flex items-start gap-4">
                        <span className="text-2xl text-indigo-500 font-bold shrink-0">·</span>
                        <span className="text-[20px] text-indigo-800 font-semibold leading-relaxed">{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : slideStyle === 'apply' ? (
                <div>
                  <h3 className="text-[24px] font-bold text-emerald-800 mb-6 tracking-tight">{slide.title}</h3>
                  <div className="space-y-3">
                    {bulletPoints.slice(0, 6).map((point, i) => (
                      <div key={i} className="flex items-start gap-3.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-[12px] text-emerald-600 font-bold">✓</span>
                        </span>
                        <span className="text-[16px] text-emerald-900 leading-relaxed">{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className={`text-[24px] font-bold mb-6 tracking-tight ${styleTitleColors[slideStyle]}`}>{slide.title}</h3>
                  <ul className="space-y-3.5">
                    {bulletPoints.slice(0, 6).map((point, i) => (
                      <li key={i} className="flex items-start gap-3.5 group">
                        <div
                          className="w-2 h-2 rounded-full mt-[10px] shrink-0 ring-2 ring-offset-2 transition-all duration-200 group-hover:scale-125"
                          style={{ backgroundColor: th.accent }}
                        />
                        <span className={`text-[16px] leading-relaxed ${styleTextColors[slideStyle]}`}>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* 하단 */}
            <div className={`px-6 py-3 border-t border-slate-100 flex items-center justify-between ${slideStyle === 'scripture' ? 'bg-[#1a1a2e]' : 'bg-white'}`}>
              <span className={`text-[12px] font-medium ${slideStyle === 'scripture' ? 'text-slate-400' : 'text-slate-400'}`}>
                Bunker 목양
              </span>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: th.accent }} />
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
                      i === currentIdx ? 'w-7 h-2.5 shadow-sm' : 'w-2 h-2 bg-slate-200 hover:bg-slate-300'
                    }`}
                    style={i === currentIdx ? { backgroundColor: th.accent } : {}}
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

        {/* 썸네일 스트립 (스타일 배지 포함) */}
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-2">
          {slides.map((s, i) => {
            const ss = (s as PPTShare).style || 'list'
            const active = i === currentIdx
            const thumbnailAccent = ss === 'scripture' ? '#F6E05E' :
                                    ss === 'highlight' ? '#4F46E5' :
                                    ss === 'apply' ? '#38A169' :
                                    th.accent
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
                  boxShadow: active ? `0 4px 12px ${thumbnailAccent}33` : undefined,
                }}
              >
                <div className="h-1.5" style={{ backgroundColor: thumbnailAccent }} />
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
