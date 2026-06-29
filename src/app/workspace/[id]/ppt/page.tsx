'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  AlertCircle,
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  FileDown,
  GripVertical,
  Loader2,
  Maximize2,
  Minimize2,
  RotateCcw,
  Save,
  Smartphone,
} from 'lucide-react'
import { PPT_THEME_KEYS, PPT_THEME_META } from '@/lib/pptTheme'
import type { PPTThemeKey } from '@/lib/pptTheme'
import type { PPTShare, SermonRecord } from '@/types'
import PropertiesPanel from './_components/PropertiesPanel'
import AIRefineModal from './_components/AIRefineModal'
import SmartDownloadModal from './_components/SmartDownloadModal'

const STYLE_META: Record<string, { label: string; icon: string }> = {
  list: { label: '일반', icon: '📄' },
  scripture: { label: '말씀', icon: '📖' },
  highlight: { label: '강조', icon: '⭐' },
  apply: { label: '적용', icon: '✓' },
}

type SaveState = 'idle' | 'dirty' | 'saving' | 'saved' | 'error'

export default function PPTStudioPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [sermon, setSermon] = useState<SermonRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [theme, setTheme] = useState<PPTThemeKey>('modern')
  const [fullscreen, setFullscreen] = useState(false)
  const [mobilePreview, setMobilePreview] = useState(false)

  const [slides, setSlides] = useState<PPTShare[]>([])
  const [originalSlides, setOriginalSlides] = useState<PPTShare[]>([])
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isEditingRef = useRef(false)

  const total = slides.length
  const slide = slides[currentIdx]
  const slideStyle = slide?.style || 'list'
  const sm = STYLE_META[slideStyle] || STYLE_META.list
  const isFirst = currentIdx === 0
  const isLast = currentIdx === total - 1
  const th = PPT_THEME_META[theme]

  const loadSermon = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const res = await fetch(`/api/sermons/${id}`)
      if (!res.ok) throw new Error('데이터를 불러올 수 없습니다.')
      const data = await res.json()
      setSermon(data.data)
      const loadedSlides = data.data?.result?.pptData?.slides || []
      setSlides(loadedSlides)
      setOriginalSlides(loadedSlides)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { loadSermon() }, [loadSermon])

  const goPrev = () => setCurrentIdx(p => Math.max(p - 1, 0))
  const goNext = () => setCurrentIdx(p => Math.min(p + 1, total - 1))

  const [downloadModalOpen, setDownloadModalOpen] = useState(false)

  const handleDownload = () => {
    setDownloadModalOpen(true)
  }

  const handleSave = useCallback(async () => {
    if (!id || saveState === 'saving') return
    setSaveState('saving')
    try {
      const res = await fetch(`/api/sermons/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result: { pptData: { slides } } }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || '저장 실패')
      }
      setOriginalSlides(slides)
      setSaveState('saved')
      setTimeout(() => setSaveState(s => (s === 'saved' ? 'idle' : s)), 2000)
    } catch (err: any) {
      setError(err.message)
      setSaveState('error')
    }
  }, [id, slides, saveState])

  const markDirty = useCallback((newSlides: PPTShare[]) => {
    setSlides(newSlides)
    setSaveState('dirty')
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
  }, [])

  const updateSlideField = (idx: number, field: 'title' | 'content', value: string) => {
    const next = slides.map((s, i) => (i === idx ? { ...s, [field]: value } : s))
    markDirty(next)
  }

  const moveSlide = (from: number, to: number) => {
    if (from === to) return
    const next = [...slides]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    markDirty(next)
    setCurrentIdx(to)
  }

  const moveBy = (delta: number) => {
    const to = currentIdx + delta
    if (to < 0 || to >= total) return
    moveSlide(currentIdx, to)
  }

  const replaceSlide = (idx: number, newSlide: PPTShare) => {
    const next = slides.map((s, i) => (i === idx ? { ...s, ...newSlide } : s))
    markDirty(next)
  }

  const addSlide = () => {
    const newSlide: PPTShare = {
      title: '새 슬라이드',
      content: '• 첫 번째 포인트\n• 두 번째 포인트\n• 세 번째 포인트',
      style: 'list',
      icon: 'star',
    }
    const next = [...slides, newSlide]
    markDirty(next)
    setCurrentIdx(next.length - 1)
  }

  const deleteSlide = () => {
    if (total <= 1) {
      alert('최소 1개의 슬라이드가 필요합니다.')
      return
    }
    if (!confirm(`${currentIdx + 1}번 슬라이드를 삭제하시겠습니까?`)) return
    const next = slides.filter((_, i) => i !== currentIdx)
    markDirty(next)
    setCurrentIdx(Math.max(0, currentIdx - 1))
  }

  const [aiRefineOpen, setAiRefineOpen] = useState(false)

  const handleReset = () => {
    if (!confirm('모든 변경 사항을 되돌리시겠습니까?')) return
    setSlides(originalSlides)
    setSaveState('idle')
  }

  // 자동 저장 (3초 디바운스)
  useEffect(() => {
    if (saveState !== 'dirty') return
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
    autoSaveTimerRef.current = setTimeout(() => {
      handleSave()
    }, 3000)
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
    }
  }, [saveState, slides, handleSave])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && !isEditingRef.current) goPrev()
      if (e.key === 'ArrowRight' && !isEditingRef.current) goNext()
      if (e.key === 'Escape') setFullscreen(false)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [total, handleSave])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#faf9f6]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-indigo-500 animate-spin" />
          <p className="text-[14px] text-gray-400 font-medium">PPT 스튜디오 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error || !sermon) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#faf9f6]">
        <div className="text-center max-w-sm">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-4" />
          <p className="text-[15px] text-gray-500 mb-4">{error || '데이터를 찾을 수 없습니다.'}</p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 text-gray-600 text-[13px] font-bold hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            뒤로 가기
          </button>
        </div>
      </div>
    )
  }

  if (total === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#faf9f6]">
        <div className="text-center max-w-sm">
          <p className="text-[15px] text-gray-400 mb-4">PPT 데이터가 없습니다. 먼저 AI 생성을 완료해주세요.</p>
          <button
            onClick={() => router.push(`/workspace?id=${id}`)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-[13px] font-bold hover:bg-indigo-700 transition-colors"
          >
            워크스페이스로 이동
          </button>
        </div>
      </div>
    )
  }

  const containerClass = fullscreen
    ? 'fixed inset-0 z-50 bg-[#faf9f6] flex flex-col'
    : 'min-h-screen bg-[#faf9f6] flex flex-col max-w-7xl mx-auto'

  return (
    <div className={containerClass}>
      {/* 상단 바 */}
      <header className="shrink-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => fullscreen ? setFullscreen(false) : router.back()}
            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors shrink-0"
            title={fullscreen ? '전체화면 종료' : '뒤로 가기'}
          >
            {fullscreen ? <Minimize2 className="w-4 h-4 text-gray-500" /> : <ArrowLeft className="w-4 h-4 text-gray-500" />}
          </button>
          <div className="min-w-0">
            <h1 className="text-[16px] font-bold text-gray-800 truncate max-w-[260px] sm:max-w-md">
              {sermon.title || 'PPT 스튜디오'}
            </h1>
            {sermon.passage && (
              <p className="text-[12px] text-gray-400 truncate max-w-[260px] sm:max-w-md">{sermon.passage}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* 저장 상태 */}
          <SaveIndicator state={saveState} onReset={handleReset} canReset={saveState === 'dirty' || saveState === 'error'} />

          {/* 모바일 프리뷰 토글 */}
          <button
            onClick={() => setMobilePreview(p => !p)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              mobilePreview ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
            }`}
            title="모바일 프리뷰"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>

          {/* 전체화면 토글 */}
          <button
            onClick={() => setFullscreen(p => !p)}
            className="w-8 h-8 rounded-lg bg-gray-100 text-gray-400 hover:bg-gray-200 flex items-center justify-center transition-colors"
            title="전체화면"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          {/* 테마 선택기 */}
          <div className="hidden md:flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
            {PPT_THEME_KEYS.map(k => {
              const m = PPT_THEME_META[k]
              return (
                <button
                  key={k}
                  onClick={() => setTheme(k)}
                  className={`px-2.5 py-1.5 rounded-md text-[11px] font-bold transition-all ${
                    theme === k ? 'text-white shadow-sm' : 'text-gray-400 hover:text-gray-700'
                  }`}
                  style={theme === k ? { backgroundColor: m.accent } : {}}
                >
                  {m.name}
                </button>
              )
            })}
          </div>

          {/* 다운로드 */}
          <button
            onClick={handleDownload}
            disabled={downloadModalOpen}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-[13px] font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {downloadModalOpen ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <FileDown className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">.pptx 다운로드</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* 주 영역 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 왼쪽: 썸네일 스트립 (드래그 재정렬) */}
        <aside className="hidden md:flex flex-col w-[120px] shrink-0 border-r border-gray-200 bg-white overflow-y-auto">
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">슬라이드</p>
            <p className="text-[11px] text-gray-500 mt-0.5">드래그하여 순서 변경</p>
          </div>
          <div className="p-2 space-y-2">
            {slides.map((s, i) => {
              const ss = s.style || 'list'
              const active = i === currentIdx
              const accentColor = ss === 'scripture' ? '#D69E2E' :
                                  ss === 'highlight' ? '#4F46E5' :
                                  ss === 'apply' ? '#38A169' :
                                  th.accent
              const isDragging = dragIdx === i
              const isDragOver = dragOverIdx === i && dragIdx !== i
              return (
                <div
                  key={i}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = 'move'
                    setDragIdx(i)
                  }}
                  onDragOver={(e) => {
                    e.preventDefault()
                    e.dataTransfer.dropEffect = 'move'
                    if (dragOverIdx !== i) setDragOverIdx(i)
                  }}
                  onDragLeave={() => {
                    if (dragOverIdx === i) setDragOverIdx(null)
                  }}
                  onDrop={(e) => {
                    e.preventDefault()
                    if (dragIdx !== null && dragIdx !== i) {
                      moveSlide(dragIdx, i)
                    }
                    setDragIdx(null)
                    setDragOverIdx(null)
                  }}
                  onDragEnd={() => {
                    setDragIdx(null)
                    setDragOverIdx(null)
                  }}
                  onClick={() => setCurrentIdx(i)}
                  className={`group relative w-full rounded-xl overflow-hidden transition-all duration-200 cursor-pointer ${
                    active ? 'ring-2 shadow-md' : 'opacity-50 hover:opacity-100'
                  } ${isDragging ? 'opacity-30 scale-95' : ''} ${
                    isDragOver ? 'ring-2 ring-indigo-400 ring-offset-1 -translate-y-0.5' : ''
                  }`}
                  style={{ boxShadow: active ? `0 2px 8px ${accentColor}44` : undefined }}
                >
                  {/* 드래그 핸들 */}
                  <div className="absolute top-1 left-1 z-10 p-0.5 rounded bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical className="w-3 h-3 text-gray-500" />
                  </div>
                  {/* 미니 프리뷰 */}
                  <div className="aspect-[16/10] flex flex-col" style={{ backgroundColor: ss === 'scripture' ? '#1a1a2e' : ss === 'highlight' ? '#EEF2FF' : ss === 'apply' ? '#ECFDF5' : '#fff' }}>
                    <div className="h-1" style={{ backgroundColor: accentColor }} />
                    <div className="flex-1 flex items-center justify-center px-2">
                      <span className="text-[18px] font-black text-gray-300">{i + 1}</span>
                    </div>
                  </div>
                  <div className="px-2 py-1.5 bg-white text-center border-t border-gray-100">
                    <p className="text-[10px] font-medium text-gray-500 truncate leading-tight">
                      {i === 0 ? '표지' : i === total - 1 ? '마무리' : s.title}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </aside>

        {/* 메인: 슬라이드 뷰어 */}
        <main className="flex-1 flex flex-col items-center justify-start p-4 sm:p-8 overflow-y-auto">
          {/* 모바일 썸네일 스트립 (가로 스크롤, 드래그 가능) */}
          <div className="flex md:hidden w-full overflow-x-auto gap-2 pb-4 mb-4 -mx-4 px-4">
            {slides.map((s, i) => {
              const active = i === currentIdx
              return (
                <button
                  key={i}
                  onClick={() => setCurrentIdx(i)}
                  className={`shrink-0 w-14 rounded-lg overflow-hidden transition-all ${
                    active ? 'ring-2 ring-indigo-500 shadow-md' : 'opacity-50'
                  }`}
                >
                  <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center">
                    <span className="text-[14px] font-bold text-gray-300">{i + 1}</span>
                  </div>
                </button>
              )
            })}
          </div>

          <div className={`w-full ${mobilePreview ? 'max-w-[380px]' : 'max-w-3xl'} transition-all duration-300`}>
            {/* 슬라이드 카드 */}
            <div className={`rounded-2xl overflow-hidden shadow-xl shadow-gray-200/60 ring-1 ring-gray-200/80 ${
              slideStyle === 'scripture' ? 'bg-indigo-950' :
              slideStyle === 'highlight' ? 'bg-indigo-50' :
              slideStyle === 'apply' ? 'bg-emerald-50' :
              'bg-white'
            }`}>
              {/* 상단 악센트 바 */}
              <div className="h-2" style={{
                background: slideStyle === 'scripture' ? 'linear-gradient(90deg, #F6E05E, #D69E2E)' :
                            slideStyle === 'highlight' ? 'linear-gradient(90deg, #4F46E5, #7C3AED)' :
                            slideStyle === 'apply' ? 'linear-gradient(90deg, #38A169, #48BB78)' :
                            `linear-gradient(90deg, ${th.accent}, ${th.accent}88)`,
              }} />

              {/* 헤더 */}
              <div className="px-6 py-3.5 border-b border-gray-100" style={{ backgroundColor: slideStyle === 'scripture' ? '#1a1a2e' : th.light }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[12px] font-bold shadow-sm shrink-0" style={{
                      background: slideStyle === 'scripture' ? 'linear-gradient(135deg, #F6E05E, #D69E2E)' :
                                  slideStyle === 'apply' ? 'linear-gradient(135deg, #38A169, #48BB78)' :
                                  slideStyle === 'highlight' ? 'linear-gradient(135deg, #4F46E5, #7C3AED)' :
                                  `linear-gradient(135deg, ${th.accent}, ${th.accent}dd)`,
                    }}>
                      {currentIdx + 1}
                    </div>
                    <span className={`text-[13px] font-semibold truncate ${slideStyle === 'scripture' ? 'text-amber-300' : 'text-gray-500'}`}>
                      {isFirst ? '표지' : isLast ? '마무리' : slide?.title}
                    </span>
                    {!isFirst && !isLast && (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                        slideStyle === 'scripture' ? 'bg-amber-400/20 text-amber-300' :
                        slideStyle === 'highlight' ? 'bg-indigo-100 text-indigo-700' :
                        slideStyle === 'apply' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {sm.icon} {sm.label}
                      </span>
                    )}
                  </div>
                  <span className="text-[12px] font-medium text-gray-400 shrink-0 ml-3">{currentIdx + 1} / {total}</span>
                </div>
              </div>

              {/* 본문 (편집 가능) */}
              <SlideContentEditable
                slide={slide}
                slideStyle={slideStyle}
                isFirst={isFirst}
                isLast={isLast}
                themeAccent={th.accent}
                themeLight={th.light}
                onEditTitle={(v) => updateSlideField(currentIdx, 'title', v)}
                onEditContent={(v) => updateSlideField(currentIdx, 'content', v)}
                onEditingChange={(editing) => { isEditingRef.current = editing }}
              />

              {/* 하단 */}
              <div className={`px-6 py-3 border-t border-gray-100 flex items-center justify-between ${slideStyle === 'scripture' ? 'bg-[#1a1a2e]' : 'bg-white'}`}>
                <span className="text-[12px] font-medium text-gray-400">Bunker 목양</span>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: th.accent }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                </div>
              </div>
            </div>

            {/* 편집 안내 */}
            <p className="text-center text-[11px] text-gray-400 mt-3">
              💡 제목을 더블클릭하면 편집할 수 있습니다 · Ctrl/Cmd+S 저장
            </p>

            {/* 네비게이션 */}
            {total > 1 && (
              <div className="flex items-center justify-between mt-4">
                <button
                  onClick={goPrev}
                  disabled={currentIdx === 0}
                  className="w-12 h-12 rounded-xl border border-gray-200 bg-white flex items-center justify-center hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentIdx(i)}
                      className="transition-all duration-300 rounded-full"
                      style={{
                        width: i === currentIdx ? 28 : 8,
                        height: i === currentIdx ? 10 : 8,
                        backgroundColor: i === currentIdx ? th.accent : '#CBD5E1',
                      }}
                    />
                  ))}
                </div>

                <button
                  onClick={goNext}
                  disabled={currentIdx === total - 1}
                  className="w-12 h-12 rounded-xl border border-gray-200 bg-white flex items-center justify-center hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </main>

        {/* 우측: 속성 패널 (lg↑) */}
        {slide && (
          <PropertiesPanel
            slide={slide}
            index={currentIdx}
            total={total}
            isFirst={isFirst}
            isLast={isLast}
            onChange={(s) => replaceSlide(currentIdx, s)}
            onAdd={addSlide}
            onDelete={deleteSlide}
            onMove={(dir) => moveBy(dir === 'up' ? -1 : 1)}
            onRefineAI={() => setAiRefineOpen(true)}
          />
        )}
      </div>

      {/* AI 리파인 모달 */}
      {slide && (
        <AIRefineModal
          open={aiRefineOpen}
          slide={slide}
          index={currentIdx}
          sermonContext={{
            title: sermon?.title,
            passage: sermon?.passage,
            summary: (sermon?.result as any)?.summary,
          }}
          onClose={() => setAiRefineOpen(false)}
          onApply={(refined) => replaceSlide(currentIdx, refined)}
        />
      )}

      {/* 스마트 다운로드 모달 */}
      <SmartDownloadModal
        open={downloadModalOpen}
        onClose={() => setDownloadModalOpen(false)}
        slides={slides}
        sermonId={id}
        currentIdx={currentIdx}
        sermonTitle={sermon?.title || '설교'}
        initialTheme={theme}
      />
    </div>
  )
}

function SaveIndicator({ state, onReset, canReset }: { state: SaveState; onReset: () => void; canReset: boolean }) {
  if (state === 'idle') return null

  const labels: Record<SaveState, { text: string; color: string; icon: any }> = {
    idle: { text: '', color: '', icon: null },
    dirty: { text: '저장 필요', color: 'bg-amber-100 text-amber-700', icon: Save },
    saving: { text: '저장 중...', color: 'bg-blue-100 text-blue-700', icon: Loader2 },
    saved: { text: '저장됨', color: 'bg-emerald-100 text-emerald-700', icon: Check },
    error: { text: '저장 실패', color: 'bg-red-100 text-red-700', icon: AlertCircle },
  }

  const cfg = labels[state]
  const Icon = cfg.icon

  return (
    <div className="flex items-center gap-1">
      <span className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold ${cfg.color}`}>
        {Icon && <Icon className={`w-3 h-3 ${state === 'saving' ? 'animate-spin' : ''}`} />}
        <span className="hidden sm:inline">{cfg.text}</span>
      </span>
      {canReset && state !== 'saving' && (
        <button
          onClick={onReset}
          className="w-7 h-7 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center transition-colors"
          title="되돌리기"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}

function SlideContentEditable({
  slide,
  slideStyle,
  isFirst,
  isLast,
  themeAccent,
  themeLight,
  onEditTitle,
  onEditContent,
  onEditingChange,
}: {
  slide: PPTShare
  slideStyle: string
  isFirst: boolean
  isLast: boolean
  themeAccent: string
  themeLight: string
  onEditTitle: (v: string) => void
  onEditContent: (v: string) => void
  onEditingChange: (editing: boolean) => void
}) {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [editingTitle, setEditingTitle] = useState(false)
  const [editingContent, setEditingContent] = useState(false)

  useEffect(() => {
    onEditingChange(editingTitle || editingContent)
  }, [editingTitle, editingContent, onEditingChange])

  useEffect(() => {
    if (titleRef.current && titleRef.current.innerText !== (slide?.title || '')) {
      titleRef.current.innerText = slide?.title || ''
    }
  }, [slide?.title])

  useEffect(() => {
    if (contentRef.current && !editingContent) {
      contentRef.current.innerText = slide?.content || ''
    }
  }, [slide?.content, editingContent])

  if (!slide) return null

  const isDark = slideStyle === 'scripture'
  const titleClass = isFirst
    ? `text-[32px] font-extrabold mt-8 leading-tight tracking-tight outline-none ${isDark ? 'text-white' : 'text-gray-800'}`
    : isDark
    ? `text-[26px] font-bold mb-6 tracking-tight outline-none text-amber-300`
    : slideStyle === 'highlight'
    ? `text-[28px] font-bold text-indigo-900 mb-6 tracking-tight outline-none`
    : slideStyle === 'apply'
    ? `text-[26px] font-bold text-emerald-800 mb-6 tracking-tight outline-none`
    : `text-[26px] font-bold text-gray-800 mb-6 tracking-tight outline-none`

  const titleEl = (
    <h3
      ref={titleRef}
      contentEditable={true}
      suppressContentEditableWarning
      onDoubleClick={() => setEditingTitle(true)}
      onFocus={() => setEditingTitle(true)}
      onBlur={(e) => {
        setEditingTitle(false)
        const v = e.currentTarget.innerText.trim()
        if (v !== slide.title) onEditTitle(v)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') { e.preventDefault(); (e.currentTarget as HTMLElement).blur() }
        if (e.key === 'Escape') { (e.currentTarget as HTMLElement).blur() }
      }}
      className={`${titleClass} cursor-text hover:bg-black/5 focus:bg-white/60 rounded px-1 -mx-1 transition-colors empty:before:content-['제목_없음'] empty:before:text-gray-300`}
    >
      {slide.title}
    </h3>
  )

  // 표지 슬라이드: 본문은 따로 편집하지 않음
  if (isFirst) {
    return (
      <div className="px-8 py-12 min-h-[350px] max-h-[500px] overflow-y-auto">
        <div className="text-center py-8">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto shadow-sm" style={{ backgroundColor: themeLight }}>
            <span className="text-[36px]">✝</span>
          </div>
          {titleEl}
          <div className="w-20 h-1 mx-auto mt-6 rounded-full" style={{ backgroundColor: themeAccent }} />
        </div>
      </div>
    )
  }

  // content (불릿) 편집 가능
  const contentClass = isDark
    ? `text-[18px] text-indigo-100 leading-relaxed mb-4 font-medium outline-none focus:bg-white/10 rounded px-2 -mx-2`
    : slideStyle === 'highlight'
    ? `text-[20px] text-indigo-800 font-semibold leading-relaxed outline-none focus:bg-indigo-100 rounded px-2 -mx-2`
    : slideStyle === 'apply'
    ? `text-[17px] text-emerald-900 leading-relaxed outline-none focus:bg-emerald-100 rounded px-2 -mx-2`
    : `text-[17px] text-gray-700 leading-relaxed outline-none focus:bg-indigo-50 rounded px-2 -mx-2`

  // scripture 스타일은 title만 편집
  if (slideStyle === 'scripture') {
    return (
      <div className="px-8 py-10 min-h-[350px] max-h-[500px] overflow-y-auto">
        <div className="text-center py-4">
          <span className="text-5xl text-amber-400/60 block mb-6">&ldquo;</span>
          {titleEl}
          <div className="max-w-lg mx-auto">
            {(slide.content || '').split('\n').map(l => l.replace(/^[•\-*]\s*/, '').trim()).filter(Boolean).slice(0, 4).map((point, i) => (
              <p key={i} className={contentClass}>{point}</p>
            ))}
          </div>
          <span className="text-5xl text-amber-400/60 block mt-4 -scale-y-100">&ldquo;</span>
        </div>
      </div>
    )
  }

  // 일반 / highlight / apply
  const bulletPoints = (slide.content || '')
    .split('\n')
    .map(l => l.replace(/^[•\-*]\s*/, '').trim())
    .filter(Boolean)
    .slice(0, slideStyle === 'highlight' ? 5 : 6)

  return (
    <div className="px-8 py-10 min-h-[350px] max-h-[500px] overflow-y-auto">
      {titleEl}
      {slideStyle === 'highlight' ? (
        <div className="space-y-4">
          {bulletPoints.map((point, i) => (
            <div key={i} className="flex items-start gap-4">
              <span className="text-2xl text-indigo-500 font-bold shrink-0">·</span>
              <span className={contentClass}>{point}</span>
            </div>
          ))}
        </div>
      ) : slideStyle === 'apply' ? (
        <div className="space-y-3">
          {bulletPoints.map((point, i) => (
            <div key={i} className="flex items-start gap-3.5">
              <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[13px] text-emerald-600 font-bold">✓</span>
              </span>
              <span className={contentClass}>{point}</span>
            </div>
          ))}
        </div>
      ) : (
        <ul className="space-y-4">
          {bulletPoints.map((point, i) => (
            <li key={i} className="flex items-start gap-3.5 group">
              <div
                className="w-2.5 h-2.5 rounded-full mt-[10px] shrink-0 ring-2 ring-offset-2 transition-all group-hover:scale-125"
                style={{ backgroundColor: themeAccent }}
              />
              <span className={contentClass}>{point}</span>
            </li>
          ))}
        </ul>
      )}

      {/* 숨김 contentEditable (실제 본문 편집용) */}
      <div
        ref={contentRef}
        contentEditable={true}
        suppressContentEditableWarning
        onFocus={() => setEditingContent(true)}
        onBlur={(e) => {
          setEditingContent(false)
          const v = e.currentTarget.innerText
          if (v !== slide.content) onEditContent(v)
        }}
        onClick={(e) => {
          if (!editingContent) {
            e.preventDefault()
            ;(e.currentTarget as HTMLElement).focus()
          }
        }}
        className="sr-only"
        aria-hidden="true"
      >
        {slide.content}
      </div>
    </div>
  )
}
