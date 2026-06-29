'use client'

import { useMemo, useState } from 'react'
import {
  X,
  FileDown,
  Loader2,
  Check,
  Layers,
  Square,
  Hash,
  Sparkles,
  Palette,
} from 'lucide-react'
import { PPT_THEME_KEYS, PPT_THEME_META } from '@/lib/pptTheme'
import type { PPTThemeKey } from '@/lib/pptTheme'
import type { PPTShare } from '@/types'

interface Props {
  open: boolean
  onClose: () => void
  slides: PPTShare[]
  sermonId: string
  currentIdx: number
  sermonTitle: string
  initialTheme: PPTThemeKey
}

type RangeMode = 'all' | 'current' | 'custom'

const STYLE_META: Record<string, { label: string; color: string }> = {
  list: { label: '일반', color: 'text-slate-600' },
  scripture: { label: '말씀', color: 'text-amber-600' },
  highlight: { label: '강조', color: 'text-indigo-600' },
  apply: { label: '적용', color: 'text-emerald-600' },
}

export default function SmartDownloadModal({
  open,
  onClose,
  slides,
  sermonId,
  currentIdx,
  sermonTitle,
  initialTheme,
}: Props) {
  const [theme, setTheme] = useState<PPTThemeKey>(initialTheme)
  const [rangeMode, setRangeMode] = useState<RangeMode>('all')
  const [from, setFrom] = useState(0)
  const [to, setTo] = useState(slides.length - 1)
  const [downloading, setDownloading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const total = slides.length

  // 현재 범위에 포함된 슬라이드
  const selectedSlides = useMemo(() => {
    if (rangeMode === 'all') return slides
    if (rangeMode === 'current') return [slides[currentIdx]]
    return slides.slice(from, to + 1)
  }, [rangeMode, slides, currentIdx, from, to])

  // 예상 파일 크기 (대략: 슬라이드당 ~15KB)
  const estimatedSize = useMemo(() => {
    const sizePerSlide = 15 // KB
    const cover = 20
    const ending = 10
    const total = rangeMode === 'current' ? cover + sizePerSlide + ending : cover + (selectedSlides.length * sizePerSlide) + ending
    if (total < 1024) return `${total}KB`
    return `${(total / 1024).toFixed(1)}MB`
  }, [rangeMode, selectedSlides])

  // 예상 총 슬라이드 (표지 + 선택 + 마무리, 단 rangeMode === 'current'이면 표지/마무리 생략)
  const finalSlideCount = useMemo(() => {
    if (rangeMode === 'current') {
      // 단일 슬라이드: 1장 (표지/마무리 생략)
      return 1
    }
    // 표지(1) + 선택 슬라이드 + 마무리(1) - 단 첫 슬라이드/마지막 슬라이드 중복 시 조정
    const hasFirst = selectedSlides[0]?.title === slides[0]?.title
    const hasLast = selectedSlides[selectedSlides.length - 1]?.title === slides[slides.length - 1]?.title
    let count = 2 // 표지 + 마무리
    count += selectedSlides.length
    if (hasFirst) count -= 1
    if (hasLast) count -= 1
    return count
  }, [rangeMode, selectedSlides, slides])

  if (!open) return null

  const handleDownload = async () => {
    setDownloading(true)
    setProgress(0)
    setError(null)
    setDone(false)

    // 진행률 시뮬레이션 (서버에서 실제 진행률을 알 수 없으므로)
    const progressInterval = setInterval(() => {
      setProgress(p => {
        if (p >= 90) {
          clearInterval(progressInterval)
          return p
        }
        return p + 10
      })
    }, 200)

    try {
      const params = new URLSearchParams({ theme })
      if (rangeMode === 'current') {
        params.set('from', String(currentIdx))
        params.set('to', String(currentIdx))
      } else if (rangeMode === 'custom') {
        params.set('from', String(from))
        params.set('to', String(to))
      }

      const res = await fetch(`/api/ppt/${sermonId}?${params.toString()}`)
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || 'PPT 생성 실패')
      }
      const blob = await res.blob()
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `${sermonTitle || 'sermon'}-${sermonId.slice(0, 8)}.pptx`
      link.click()
      URL.revokeObjectURL(link.href)
      clearInterval(progressInterval)
      setProgress(100)
      setDone(true)
      setTimeout(() => {
        handleReset()
        onClose()
      }, 1500)
    } catch (err: any) {
      clearInterval(progressInterval)
      setError(err.message)
      setProgress(0)
    } finally {
      setTimeout(() => setDownloading(false), 1500)
    }
  }

  const handleReset = () => {
    setProgress(0)
    setError(null)
    setDone(false)
  }

  const th = PPT_THEME_META[theme]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={() => !downloading && onClose()}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-violet-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-md">
              <FileDown className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-gray-800">PPT 다운로드 옵션</h2>
              <p className="text-[11px] text-gray-500">{sermonTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={downloading}
            className="w-8 h-8 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white/60 flex items-center justify-center transition-colors disabled:opacity-30"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 본문 */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
              <X className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-[12px] text-red-700">{error}</p>
            </div>
          )}

          {/* 테마 선택 */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <Palette className="w-3.5 h-3.5 text-gray-500" />
              <p className="text-[12px] font-bold text-gray-700">테마 선택</p>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {PPT_THEME_KEYS.map(k => {
                const m = PPT_THEME_META[k]
                const active = theme === k
                return (
                  <button
                    key={k}
                    onClick={() => setTheme(k)}
                    disabled={downloading}
                    className={`relative rounded-lg overflow-hidden transition-all ${
                      active ? 'ring-2 ring-offset-2 shadow-md scale-105' : 'hover:scale-105 opacity-70 hover:opacity-100'
                    }`}
                    style={active ? { '--tw-ring-color': m.accent } as any : {}}
                  >
                    <div className="aspect-[4/5] flex flex-col">
                      <div className="h-1.5" style={{ backgroundColor: m.accent }} />
                      <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: m.light }}>
                        <span className="text-[10px] font-bold" style={{ color: m.accent }}>
                          {k === 'modern' ? 'A' : k === 'classic' ? 'B' : k === 'minimal' ? 'C' : k === 'vibrant' ? 'D' : k === 'dark' ? 'E' : 'F'}
                        </span>
                      </div>
                    </div>
                    <div className="py-1 text-center bg-white border-t border-gray-100">
                      <p className="text-[10px] font-bold text-gray-600">{m.name}</p>
                    </div>
                    {active && (
                      <div className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center" style={{ backgroundColor: m.accent }}>
                        <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 슬라이드 범위 */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <Layers className="w-3.5 h-3.5 text-gray-500" />
              <p className="text-[12px] font-bold text-gray-700">슬라이드 범위</p>
            </div>
            <div className="space-y-2">
              <label className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                rangeMode === 'all' ? 'border-indigo-300 bg-indigo-50/50' : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="range"
                  checked={rangeMode === 'all'}
                  onChange={() => setRangeMode('all')}
                  disabled={downloading}
                  className="mt-0.5 accent-indigo-600"
                />
                <div className="flex-1">
                  <p className="text-[13px] font-bold text-gray-800">전체 슬라이드</p>
                  <p className="text-[11px] text-gray-500">모든 {total}개 슬라이드 + 표지 + 마무리</p>
                </div>
                <span className="text-[11px] font-bold text-gray-400 shrink-0">{total}장</span>
              </label>

              <label className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                rangeMode === 'current' ? 'border-indigo-300 bg-indigo-50/50' : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="range"
                  checked={rangeMode === 'current'}
                  onChange={() => setRangeMode('current')}
                  disabled={downloading}
                  className="mt-0.5 accent-indigo-600"
                />
                <div className="flex-1">
                  <p className="text-[13px] font-bold text-gray-800">현재 슬라이드만</p>
                  <p className="text-[11px] text-gray-500">{currentIdx + 1}번 슬라이드: {slides[currentIdx]?.title || '(제목 없음)'}</p>
                </div>
                <span className="text-[11px] font-bold text-gray-400 shrink-0">1장</span>
              </label>

              <label className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                rangeMode === 'custom' ? 'border-indigo-300 bg-indigo-50/50' : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="range"
                  checked={rangeMode === 'custom'}
                  onChange={() => setRangeMode('custom')}
                  disabled={downloading}
                  className="mt-0.5 accent-indigo-600"
                />
                <div className="flex-1">
                  <p className="text-[13px] font-bold text-gray-800">구간 선택</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-gray-500">From</span>
                      <input
                        type="number"
                        min={1}
                        max={total}
                        value={from + 1}
                        onClick={() => setRangeMode('custom')}
                        onChange={(e) => {
                          const v = parseInt(e.target.value, 10)
                          if (!isNaN(v)) setFrom(Math.max(0, Math.min(total - 1, v - 1)))
                        }}
                        disabled={downloading || rangeMode !== 'custom'}
                        className="w-14 px-2 py-1 text-[12px] text-center bg-white border border-gray-200 rounded focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none disabled:opacity-40"
                      />
                    </div>
                    <span className="text-gray-400">→</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-gray-500">To</span>
                      <input
                        type="number"
                        min={1}
                        max={total}
                        value={to + 1}
                        onClick={() => setRangeMode('custom')}
                        onChange={(e) => {
                          const v = parseInt(e.target.value, 10)
                          if (!isNaN(v)) setTo(Math.max(0, Math.min(total - 1, v - 1)))
                        }}
                        disabled={downloading || rangeMode !== 'custom'}
                        className="w-14 px-2 py-1 text-[12px] text-center bg-white border border-gray-200 rounded focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none disabled:opacity-40"
                      />
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-gray-400 shrink-0">
                  {rangeMode === 'custom' ? `${to - from + 1}장` : '-'}
                </span>
              </label>
            </div>
          </div>

          {/* 정보 카드 */}
          <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">다운로드 정보</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-[10px] text-gray-500">테마</p>
                <p className="text-[13px] font-bold flex items-center gap-1.5" style={{ color: th.accent }}>
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: th.accent }} />
                  {th.name}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500">예상 슬라이드</p>
                <p className="text-[13px] font-bold text-gray-800">{finalSlideCount}장</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500">예상 크기</p>
                <p className="text-[13px] font-bold text-gray-800">~{estimatedSize}</p>
              </div>
            </div>

            {/* 선택된 슬라이드 미리보기 */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-[10px] text-gray-500 mb-1.5">포함될 슬라이드 ({selectedSlides.length}장)</p>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {selectedSlides.map((s, i) => {
                  const style = s.style || 'list'
                  const sm = STYLE_META[style]
                  const realIdx = rangeMode === 'all' ? i : (rangeMode === 'current' ? currentIdx : from + i)
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-gray-200"
                      title={s.title}
                    >
                      <Hash className="w-2.5 h-2.5 text-gray-400" />
                      <span className="text-[10px] font-bold text-gray-500">{realIdx + 1}</span>
                      <span className={`text-[10px] font-bold ${sm.color}`}>·</span>
                      <span className="text-[10px] text-gray-700 truncate max-w-[80px]">{s.title}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* 진행률 바 */}
          {(downloading || done) && (
            <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {done ? (
                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                    </div>
                  ) : (
                    <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                  )}
                  <span className="text-[12px] font-bold text-gray-700">
                    {done ? '다운로드 완료!' : 'PPT 생성 중...'}
                  </span>
                </div>
                <span className="text-[12px] font-bold text-indigo-600">{progress}%</span>
              </div>
              <div className="h-2 bg-white/60 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-200 rounded-full"
                  style={{
                    width: `${progress}%`,
                    background: done
                      ? 'linear-gradient(90deg, #10B981, #34D399)'
                      : 'linear-gradient(90deg, #4F46E5, #7C3AED)',
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* 하단 버튼 */}
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            disabled={downloading && !done}
            className="px-4 py-2 rounded-lg text-[12px] font-bold text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-30"
          >
            취소
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading || selectedSlides.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-[12px] font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {downloading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                생성 중...
              </>
            ) : (
              <>
                <FileDown className="w-3.5 h-3.5" />
                {done ? '완료' : 'PPT 생성 및 다운로드'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
