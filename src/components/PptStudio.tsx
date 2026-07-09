'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Sparkles, Download, FileDown, Loader2, ChevronLeft, ChevronRight,
  Settings, BookOpen, Trash2, Plus, Save, GripVertical, Copy, Undo2, Redo2, Presentation,

} from 'lucide-react'
import { DndContext, DragEndEvent, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import PptSlideCard from './PptSlideCard'
import TextStyleEditor from './ppt/TextStyleEditor'
import Toast from './Toast'
import type { PptSlide, PptTextStyle } from '@/types'
import { getTemplates, applyTemplate, type TemplateRecord } from '@/lib/templateRegistry'
import { recommendTemplate } from '@/lib/openai'

interface SermonItem {
  id: string
  title: string
  normalizedPassage?: string
  passage?: string
  raw_text?: string
  result?: any
}

const THEMES = [
  { id: 'modern', label: '모던', color: 'bg-blue-600' },
  { id: 'warm', label: '웜', color: 'bg-amber-700' },
  { id: 'classic', label: '클래식', color: 'bg-rose-800' },
]

const LAYOUT_OPTIONS = [
  { value: 'title', label: '표지' },
  { value: 'bullets', label: '내용' },
  { value: 'section-header', label: '구분' },
  { value: 'quote', label: '인용' },
  { value: 'two-column', label: '2단' },
  { value: 'closing', label: '마무리' },
  { value: 'vs-contrast', label: '비교' },
  { value: 'timeline-flow', label: '흐름' },
  { value: 'central-focus', label: '핵심' },
  { value: 'grid-matrix', label: '그리드' },
] as const



interface Props {
  sermon?: SermonItem | null
  sermons: SermonItem[]
  onSelectSermon: (sermon: SermonItem) => void
}

export default function PptStudio({ sermon, sermons, onSelectSermon }: Props) {
  const [slides, setSlides] = useState<PptSlide[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [generating, setGenerating] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [theme, setTheme] = useState('modern')
  const [slideCount, setSlideCount] = useState(8)
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' })
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [refining, setRefining] = useState(false)
  const [refineInput, setRefineInput] = useState('')
  const [presenting, setPresenting] = useState(false)
  const [presentationIndex, setPresentationIndex] = useState(0)
  const saveTimer = useRef<NodeJS.Timeout | null>(null)
  const lastSavedSlides = useRef<string>('')
  const historyPast = useRef<string[]>([])
  const historyFuture = useRef<string[]>([])
  const [templates, setTemplates] = useState<TemplateRecord[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')

  useEffect(() => {
    getTemplates().then(setTemplates)
  }, [])

  const pushHistory = useCallback(() => {
    historyPast.current.push(JSON.stringify(slides))
    historyFuture.current = []
  }, [slides])

  const handleUndo = useCallback(() => {
    const prev = historyPast.current.pop()
    if (!prev) return
    historyFuture.current.push(JSON.stringify(slides))
    setSlides(JSON.parse(prev))
  }, [slides])

  const handleRedo = useCallback(() => {
    const next = historyFuture.current.pop()
    if (!next) return
    historyPast.current.push(JSON.stringify(slides))
    setSlides(JSON.parse(next))
  }, [slides])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        if (e.shiftKey) {
          e.preventDefault()
          handleRedo()
        } else {
          e.preventDefault()
          handleUndo()
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleUndo, handleRedo])

  useEffect(() => {
    if (sermon?.result?.ppt?.slides) {
      setSlides(sermon.result.ppt.slides)
      setActiveIndex(0)
      historyPast.current = []
      historyFuture.current = []
      lastSavedSlides.current = JSON.stringify(sermon.result.ppt.slides)
    } else {
      setSlides([])
      historyPast.current = []
      historyFuture.current = []
      lastSavedSlides.current = ''
    }
    setSaveStatus('idle')
  }, [sermon])

  const saveSlides = useCallback(async (currentSlides: typeof slides) => {
    if (!sermon?.id || currentSlides.length === 0) return
    setSaveStatus('saving')
    try {
      const res = await fetch('/api/ppt/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sermonId: sermon.id, slides: currentSlides }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      lastSavedSlides.current = JSON.stringify(currentSlides)
      setSaveStatus('saved')
    } catch {
      setSaveStatus('error')
    }
  }, [sermon?.id])

  useEffect(() => {
    if (!sermon?.id || slides.length === 0) return
    const currentStr = JSON.stringify(slides)
    if (currentStr === lastSavedSlides.current) return

    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      saveSlides(slides)
    }, 2000)

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [slides, saveSlides, sermon?.id])

  const handleGenerate = useCallback(async () => {
    if (!sermon?.raw_text) return
    setGenerating(true)
    try {
      let templateIdToUse = selectedTemplateId
      if (!templateIdToUse && templates.length > 0) {
        const recommended = await recommendTemplate(sermon.raw_text, templates)
        if (recommended) templateIdToUse = recommended
      }
      const res = await fetch('/api/ppt/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sermonId: sermon.id,
          text: sermon.raw_text,
          theme,
          slideCount,
          templateId: templateIdToUse || undefined,
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      let newSlides = data.slides as PptSlide[]
      const appliedTemplate = templateIdToUse ? templates.find(t => t.id === templateIdToUse) : null
      if (appliedTemplate) {
        newSlides = newSlides.map((sl) => applyTemplate(sl, appliedTemplate))
        setSelectedTemplateId(templateIdToUse)
      }
      pushHistory()
      setSlides(newSlides)
      setActiveIndex(0)
      const tName = appliedTemplate ? ` (${appliedTemplate.name} 템플릿)` : ''
      setToast({ visible: true, message: `PPT 생성 완료!${tName} (${newSlides.length}장)`, type: 'success' })
    } catch (err: any) {
      setToast({ visible: true, message: err.message || '생성 실패', type: 'error' })
    } finally {
      setGenerating(false)
    }
  }, [sermon, theme, slideCount, selectedTemplateId, templates])

  const handleDownloadPptx = useCallback(async () => {
    if (slides.length === 0) return
    setDownloading(true)
    try {
      const res = await fetch('/api/ppt/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slides,
          title: sermon?.title || 'PPT',
          theme,
        }),
      })
      if (!res.ok) throw new Error('다운로드 실패')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${sermon?.title || 'ppt'}-${Date.now()}.pptx`
      a.click()
      URL.revokeObjectURL(url)
      setToast({ visible: true, message: 'PPTX 다운로드 완료!', type: 'success' })
    } catch (err: any) {
      setToast({ visible: true, message: err.message || '다운로드 실패', type: 'error' })
    } finally {
      setDownloading(false)
    }
  }, [slides, sermon, theme])

  const handleDownloadPdf = useCallback(async () => {
    if (slides.length === 0) return
    setDownloading(true)
    try {
      const { jsPDF } = await import('jspdf')
      const html2canvas = (await import('html2canvas')).default
      const pdf = new jsPDF('l', 'mm', 'a4')
      const pdfW = pdf.internal.pageSize.getWidth()
      const pdfH = pdf.internal.pageSize.getHeight()

      for (let i = 0; i < slides.length; i++) {
        if (i > 0) pdf.addPage()
        const slideEl = document.getElementById(`slide-preview-${i}`)
        if (!slideEl) continue
        const canvas = await html2canvas(slideEl, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
        })
        const imgData = canvas.toDataURL('image/jpeg', 0.95)
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH)
      }

      pdf.save(`${sermon?.title || 'ppt'}-${Date.now()}.pdf`)
      setToast({ visible: true, message: 'PDF 다운로드 완료!', type: 'success' })
    } catch (err: any) {
      setToast({ visible: true, message: err.message || 'PDF 생성 실패', type: 'error' })
    } finally {
      setDownloading(false)
    }
  }, [slides, sermon])

  const duplicateSlide = useCallback((index: number) => {
    pushHistory()
    setSlides((prev) => {
      const copy = { ...prev[index], title: prev[index].title + ' (복사)' }
      const next = [...prev]
      next.splice(index + 1, 0, copy)
      return next
    })
  }, [pushHistory])

  const deleteSlide = useCallback((index: number) => {
    pushHistory()
    setSlides((prev) => {
      const next = prev.filter((_, i) => i !== index)
      if (activeIndex >= next.length && activeIndex > 0) {
        setActiveIndex(next.length - 1)
      }
      return next
    })
  }, [activeIndex, pushHistory])

  const updateSlide = useCallback((index: number, updated: PptSlide) => {
    pushHistory()
    setSlides((prev) => prev.map((s, i) => (i === index ? updated : s)))

  }, [pushHistory])


  const handleRefine = useCallback(async (instruction: string) => {
    const slide = slides[activeIndex]
    if (!slide || !instruction.trim()) return
    setRefining(true)
    try {
      const res = await fetch('/api/ppt/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slide, instruction, theme }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      updateSlide(activeIndex, data.slide)
      setRefineInput('')
      setToast({ visible: true, message: '슬라이드 수정 완료!', type: 'success' })
    } catch (err: any) {
      setToast({ visible: true, message: err.message || '수정 실패', type: 'error' })
    } finally {
      setRefining(false)
    }
  }, [slides, activeIndex, updateSlide, theme])

  const handleReorder = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    pushHistory()
    setSlides((prev) => {
      const oldIndex = prev.findIndex((_, i) => `slide-${i}` === active.id)
      const newIndex = prev.findIndex((_, i) => `slide-${i}` === over.id)
      if (oldIndex === -1 || newIndex === -1) return prev
      const next = [...prev]
      const [moved] = next.splice(oldIndex, 1)
      next.splice(newIndex, 0, moved)
      if (activeIndex === oldIndex) {
        setActiveIndex(newIndex)
      } else if (activeIndex > oldIndex && activeIndex <= newIndex) {
        setActiveIndex((i) => i - 1)
      } else if (activeIndex < oldIndex && activeIndex >= newIndex) {
        setActiveIndex((i) => i + 1)
      }
      return next
    })
  }, [activeIndex])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )

  const currentSlide = slides[activeIndex]

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-[#fbfaf7]">
      <aside className="w-64 shrink-0 border-r border-[#e4e2dd] bg-[#f5f4f0] overflow-y-auto hidden lg:block">
        <div className="p-4">
          <h2 className="text-[13px] font-bold text-[#2c2a29] mb-3 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-[#8d7a5b]" />
            설교 원고
          </h2>
          <div className="space-y-1">
            {sermons.map((s) => (
              <button
                key={s.id}
                onClick={() => onSelectSermon(s)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-[13px] transition-all duration-200 ${
                  sermon?.id === s.id
                    ? 'bg-[#eae7e0] text-[#2c2a29] font-bold border border-[#d4d1c9]'
                    : 'text-[#6b6764] hover:bg-[#eae8e3]/50 hover:text-[#2c2a29]'
                }`}
              >
                <p className="truncate">{s.title || '제목 없음'}</p>
                <p className="text-[11px] text-[#8a8580] truncate mt-0.5">{s.normalizedPassage || s.passage}</p>
              </button>
            ))}
            {sermons.length === 0 && (
              <p className="text-[12px] text-[#8a8580] text-center py-8">업로드된 설교가 없습니다.</p>
            )}
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-center justify-between px-6 py-3 border-b border-[#e4e2dd] bg-white">
          <div className="flex items-center gap-3">
            <h1 className="text-[16px] font-bold text-[#2c2a29]">
              {sermon?.title || 'PPT 스튜디오'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setPresentationIndex(activeIndex); setPresenting(true) }}
              disabled={slides.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-medium border border-[#e4e2dd] text-[#4a4744] hover:bg-[#f5f4f0] disabled:opacity-40 transition-all duration-200"
              title="프레젠테이션"
            >
              <Presentation className="w-4 h-4" />
              발표
            </button>
            {saveStatus === 'saving' && (
              <span className="flex items-center gap-1 text-[12px] text-[#8d7a5b] font-medium">
                <Loader2 className="w-3 h-3 animate-spin" /> 저장 중...
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="flex items-center gap-1 text-[12px] text-green-600 font-medium">
                <Save className="w-3 h-3" /> 저장됨
              </span>
            )}
            <button
              onClick={handleUndo}
              disabled={historyPast.current.length === 0}
              className="p-2 rounded-lg text-[#6b6764] hover:bg-[#f5f4f0] disabled:opacity-30 transition-all"
              title="실행 취소 (Cmd+Z)"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyFuture.current.length === 0}
              className="p-2 rounded-lg text-[#6b6764] hover:bg-[#f5f4f0] disabled:opacity-30 transition-all"
              title="다시 실행 (Cmd+Shift+Z)"
            >
              <Redo2 className="w-4 h-4" />
            </button>
            {saveStatus === 'error' && (
              <span className="flex items-center gap-1 text-[12px] text-red-500 font-medium cursor-pointer" onClick={() => saveSlides(slides)}>
                저장 실패 (다시 시도)
              </span>
            )}
            <button
              onClick={handleDownloadPptx}
              disabled={slides.length === 0 || downloading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-medium bg-[#8d7a5b] text-white hover:bg-[#7a694e] disabled:opacity-40 transition-all duration-200"
            >
              {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              PPTX
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={slides.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-medium border border-[#e4e2dd] text-[#4a4744] hover:bg-[#f5f4f0] disabled:opacity-40 transition-all duration-200"
            >
              <FileDown className="w-4 h-4" />
              PDF
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto">
              {currentSlide ? (
              <div className="w-full max-w-3xl">
                <div
                  id={`slide-preview-${activeIndex}`}
                  className="w-full aspect-video rounded-xl border-2 overflow-hidden bg-white shadow-lg relative border-[#e4e2dd]"
                >
                  <PptSlidePreview slide={currentSlide} />
                </div>
                <div className="flex items-center justify-between mt-4">
                  <button
                    onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
                    disabled={activeIndex === 0}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[13px] text-[#6b6764] hover:bg-[#eae8e3] disabled:opacity-30 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" /> 이전
                  </button>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[13px] font-medium text-[#8a8580]">
                      {activeIndex + 1} / {slides.length}
                    </span>
                    {currentSlide.layout && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e8f0fe] text-[#1B3A5C] uppercase tracking-wide">
                        {LAYOUT_OPTIONS.find(o => o.value === currentSlide.layout)?.label ?? currentSlide.layout}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setActiveIndex((i) => Math.min(slides.length - 1, i + 1))}
                    disabled={activeIndex === slides.length - 1}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[13px] text-[#6b6764] hover:bg-[#eae8e3] disabled:opacity-30 transition-all"
                  >
                    다음 <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                {currentSlide.coreMessage && (
                  <div className="mt-3 px-4 py-2.5 bg-[#fffbf5] border border-[#e4d8c6] rounded-xl">
                    <p className="text-[10px] font-bold text-[#8d7a5b] mb-0.5">💡 핵심 메시지</p>
                    <p className="text-[12px] text-[#2c2a29] leading-relaxed">{currentSlide.coreMessage}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-[#eae7e0] flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-7 h-7 text-[#8d7a5b]" />
                </div>
                <p className="text-[15px] font-bold text-[#2c2a29] mb-1">AI PPT 스튜디오</p>
                <p className="text-[13px] text-[#8a8580] max-w-xs mx-auto">좌측에서 원고를 선택하고 GPT-5.4-mini로 슬라이드를 생성한 뒤, 템플릿을 적용해보세요.</p>
              </div>
            )}
          </div>

          <aside className="w-80 shrink-0 border-l border-[#e4e2dd] bg-white overflow-y-auto">
            <div className="p-4 space-y-5">
              <div>
                <h3 className="text-[13px] font-bold text-[#2c2a29] mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#8d7a5b]" />
                  AI 생성
                </h3>
                <button
                  onClick={handleGenerate}
                  disabled={generating || !sermon?.raw_text}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[14px] font-bold bg-gradient-to-r from-[#8d7a5b] to-[#7a694e] text-white hover:from-[#7a694e] hover:to-[#6b5c45] disabled:opacity-40 transition-all duration-200"
                >
                  {generating ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Sparkles className="w-5 h-5" />
                  )}
                  {generating ? '생성 중...' : '슬라이드 생성 (GPT-5.4-mini)'}
                </button>
              </div>

              {/* ── 템플릿 선택 ── */}
              {slides.length > 0 && (
                <div>
                  <h3 className="text-[13px] font-bold text-[#2c2a29] mb-3 flex items-center gap-1.5">
                    <Settings className="w-4 h-4 text-[#8d7a5b]" />
                    템플릿
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {(templates.length > 0 ? templates : [{ id: 'modern', name: '모던', primary_color: '1B3A5C', accent_color: '4A90D9', background_color: 'FFFFFF', text_color: '1A1A2E', font_title: 'Malgun Gothic', font_body: 'Malgun Gothic', gradient: 'from-[#1B3A5C] to-[#4A90D9]', ai_guide: null, file_url: null, is_active: true, category: 'general' }]).map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          setSelectedTemplateId(t.id)
                          pushHistory()
                          setSlides((prev) => prev.map((sl) => applyTemplate(sl, t)))
                          setToast({ visible: true, message: `${t.name} 템플릿이 적용되었습니다`, type: 'success' })
                        }}
                        className={`px-3 py-2.5 rounded-xl text-[12px] font-medium transition-all border ${
                          selectedTemplateId === t.id
                            ? 'border-[#8d7a5b] bg-[#eae7e0] text-[#2c2a29]'
                            : 'border-[#e4e2dd] text-[#6b6764] hover:bg-[#f5f4f0]'
                        }`}
                      >
                        <span className="block text-[11px] font-bold mb-0.5">{t.name}</span>
                        <span className="flex gap-1 mt-1">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: `#${t.primary_color}` }} />
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: `#${t.accent_color}` }} />
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: `#${t.background_color}` }} />
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-[13px] font-bold text-[#2c2a29] mb-3 flex items-center gap-1.5">
                  <Settings className="w-4 h-4 text-[#8d7a5b]" />
                  설정
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-[12px] font-medium text-[#6b6764] block mb-1.5">테마</label>
                    <div className="flex gap-2">
                      {THEMES.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setTheme(t.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
                            theme === t.id
                              ? 'bg-[#eae7e0] text-[#2c2a29] border border-[#d4d1c9]'
                              : 'text-[#6b6764] hover:bg-[#f5f4f0] border border-transparent'
                          }`}
                        >
                          <span className={`w-2.5 h-2.5 rounded-full ${t.color}`} />
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[12px] font-medium text-[#6b6764] block mb-1.5">슬라이드 수</label>
                    <input
                      type="range"
                      min={3}
                      max={15}
                      value={slideCount}
                      onChange={(e) => setSlideCount(Number(e.target.value))}
                      className="w-full accent-[#8d7a5b]"
                    />
                    <span className="text-[12px] text-[#8a8580]">{slideCount}장</span>
                  </div>
                </div>
              </div>

              {slides.length > 0 && (
                <div>
                  <h3 className="text-[13px] font-bold text-[#2c2a29] mb-3">슬라이드 목록</h3>
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleReorder}>
                    <SortableContext items={slides.map((_, i) => `slide-${i}`)} strategy={verticalListSortingStrategy}>
                      <div className="space-y-2 max-h-80 overflow-y-auto">
                        {slides.map((slide, i) => (
                          <SortableSlideItem
                            key={`slide-${i}`}
                            id={`slide-${i}`}
                            slide={slide}
                            index={i}
                            active={activeIndex === i}
                            onClick={() => setActiveIndex(i)}
                            onDelete={() => deleteSlide(i)}
                            onDuplicate={() => duplicateSlide(i)}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>
              )}

              {currentSlide && (
                <div>
                  <h3 className="text-[13px] font-bold text-[#2c2a29] mb-3 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#8d7a5b]" />
                    AI 수정
                  </h3>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {['더 간결하게', '내용 보강', '성경 구절 추가', '비유/예화 추가'].map((label) => (
                      <button
                        key={label}
                        onClick={() => handleRefine(label)}
                        disabled={refining}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#f5f4f0] text-[#6b6764] hover:bg-[#eae7e0] disabled:opacity-40 transition-all"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={refineInput}
                      onChange={(e) => setRefineInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleRefine(refineInput) }}
                      placeholder="직접 입력 (예: 2문장으로 줄여줘)"
                      className="flex-1 px-3 py-2 rounded-lg border border-[#e4e2dd] text-[12px] text-[#2c2a29] focus:outline-none focus:border-[#8d7a5b]"
                    />
                    <button
                      onClick={() => handleRefine(refineInput)}
                      disabled={refining || !refineInput.trim()}
                      className="px-3 py-2 rounded-lg text-[12px] font-medium bg-[#8d7a5b] text-white hover:bg-[#7a694e] disabled:opacity-40 transition-all"
                    >
                      {refining ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : '수정'}
                    </button>
                  </div>

                  <h3 className="text-[13px] font-bold text-[#2c2a29] mb-3">슬라이드 편집</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] font-medium text-[#6b6764] block mb-1">제목</label>
                      <input
                        type="text"
                        value={currentSlide.title}
                        onChange={(e) => updateSlide(activeIndex, { ...currentSlide, title: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-[#e4e2dd] text-[13px] text-[#2c2a29] focus:outline-none focus:border-[#8d7a5b]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-[#6b6764] block mb-1">레이아웃</label>
                      <select
                        value={currentSlide.layout}
                        onChange={(e) => updateSlide(activeIndex, { ...currentSlide, layout: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-lg border border-[#e4e2dd] text-[13px] text-[#2c2a29] focus:outline-none focus:border-[#8d7a5b]"
                      >
                        {LAYOUT_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>

                    
                    <div>
                      <label className="text-[11px] font-medium text-[#6b6764] block mb-1">내용</label>
                      <div className="space-y-1.5">
                        {currentSlide.content.map((item, ci) => (
                          <div key={ci} className="flex gap-1">
                            <input
                              type="text"
                              value={item}
                              onChange={(e) => {
                                const next = [...currentSlide.content]
                                next[ci] = e.target.value
                                updateSlide(activeIndex, { ...currentSlide, content: next })
                              }}
                              className="flex-1 px-2.5 py-1.5 rounded-lg border border-[#e4e2dd] text-[12px] text-[#2c2a29] focus:outline-none focus:border-[#8d7a5b]"
                            />
                            <button
                              onClick={() => {
                                const next = currentSlide.content.filter((_, i) => i !== ci)
                                updateSlide(activeIndex, { ...currentSlide, content: next })
                              }}
                              className="p-1.5 rounded text-[#a09b96] hover:text-red-500"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            updateSlide(activeIndex, {
                              ...currentSlide,
                              content: [...currentSlide.content, ''],
                            })
                          }}
                          className="flex items-center gap-1 text-[12px] text-[#8d7a5b] font-medium hover:text-[#7a694e]"
                        >
                          <Plus className="w-3 h-3" /> 항목 추가
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ── 텍스트 스타일 편집 ── */}
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[13px] font-bold text-[#2c2a29]">텍스트 스타일</h3>
                      <button
                        onClick={() => {
                          pushHistory()
                          const titleStyle = currentSlide.titleStyle
                          const bodyStyle = currentSlide.bodyStyle
                          setSlides((prev) => prev.map((sl) => ({
                            ...sl,
                            titleStyle: titleStyle ? { ...titleStyle } : sl.titleStyle,
                            bodyStyle: bodyStyle ? { ...bodyStyle } : sl.bodyStyle,
                          })))
                          setToast({ visible: true, message: '전체 슬라이드에 스타일이 적용되었습니다', type: 'success' })
                        }}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#8d7a5b] text-white hover:bg-[#7a694e] transition-all"
                      >
                        전체 적용
                      </button>
                    </div>
                    <TextStyleEditor
                      label="제목"
                      style={currentSlide.titleStyle}
                      defaultSize={32}
                      onChange={(titleStyle) => updateSlide(activeIndex, { ...currentSlide, titleStyle })}
                    />
                    <TextStyleEditor
                      label="본문"
                      style={currentSlide.bodyStyle}
                      defaultSize={16}
                      onChange={(bodyStyle) => updateSlide(activeIndex, { ...currentSlide, bodyStyle })}
                    />
                  </div>

                  {/* ── AI 생성 메타 정보 패널 ── */}
                  {(currentSlide.coreMessage || currentSlide.speakerNotes || currentSlide.visualRecommendation || currentSlide.designNote) && (
                    <div className="mt-5 space-y-3">
                      <h3 className="text-[13px] font-bold text-[#2c2a29] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#8d7a5b]" />
                        AI 분석 정보
                      </h3>

                      {currentSlide.coreMessage && (
                        <div className="bg-[#fffbf5] border border-[#e4d8c6] rounded-xl p-3">
                          <p className="text-[10px] font-bold text-[#8d7a5b] uppercase tracking-wide mb-1.5">💡 핵심 메시지</p>
                          <p className="text-[12px] text-[#2c2a29] leading-relaxed">{currentSlide.coreMessage}</p>
                        </div>
                      )}

                      {currentSlide.speakerNotes && (
                        <div className="bg-[#f0f7ff] border border-[#cce0ff] rounded-xl p-3">
                          <p className="text-[10px] font-bold text-[#1B3A5C] uppercase tracking-wide mb-1.5">🎤 발표자 스크립트</p>
                          <p className="text-[11px] text-[#2c2a29] leading-relaxed whitespace-pre-wrap">{currentSlide.speakerNotes}</p>
                        </div>
                      )}

                      {currentSlide.visualRecommendation && (
                        <div className="bg-[#f5f0ff] border border-[#ddd0ff] rounded-xl p-3">
                          <p className="text-[10px] font-bold text-[#5B35A0] uppercase tracking-wide mb-1.5">🎨 비주얼 추천</p>
                          <p className="text-[11px] text-[#2c2a29] leading-relaxed">{currentSlide.visualRecommendation}</p>
                        </div>
                      )}

                      {currentSlide.designNote && (
                        <div className="bg-[#f0fff5] border border-[#c6e4d0] rounded-xl p-3">
                          <p className="text-[10px] font-bold text-[#1a6b3a] uppercase tracking-wide mb-1.5">✏️ 디자이너 노트</p>
                          <p className="text-[11px] text-[#2c2a29] leading-relaxed">{currentSlide.designNote}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {presenting && slides[presentationIndex] && (
        <PresentationOverlay
          slide={slides[presentationIndex]}
          index={presentationIndex}
          total={slides.length}
          onNext={() => setPresentationIndex((i) => Math.min(slides.length - 1, i + 1))}
          onPrev={() => setPresentationIndex((i) => Math.max(0, i - 1))}
          onClose={() => setPresenting(false)}
        />
      )}

      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
      />
    </div>
  )
}

function PresentationOverlay({
  slide, index, total, onNext, onPrev, onClose,
}: {
  slide: PptSlide
  index: number
  total: number
  onNext: () => void
  onPrev: () => void
  onClose: () => void
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') { e.preventDefault(); onNext() }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); onPrev() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onNext, onPrev, onClose])

  return (
    <div
      className="fixed inset-0 z-50 bg-black flex items-center justify-center cursor-pointer"
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        if (e.clientX > rect.width / 2) onNext()
        else onPrev()
      }}
    >
      <div className="w-full max-w-5xl mx-8">
        <div className="w-full aspect-video rounded-lg overflow-hidden shadow-2xl">
          <PptSlidePreview slide={slide} />
        </div>
        <div className="flex items-center justify-between mt-4 px-2">
          <button
            onClick={(e) => { e.stopPropagation(); onPrev() }}
            disabled={index === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 text-[14px] font-medium transition-all"
          >
            <ChevronLeft className="w-5 h-5" /> 이전
          </button>
          <span className="text-white/60 text-[14px] font-medium">
            {index + 1} / {total}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onNext() }}
            disabled={index === total - 1}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 text-[14px] font-medium transition-all"
          >
            다음 <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div className="flex justify-center mt-2">
          <button
            onClick={(e) => { e.stopPropagation(); onClose() }}
            className="px-4 py-1.5 rounded-lg bg-white/5 text-white/40 hover:text-white/70 hover:bg-white/10 text-[12px] transition-all"
          >
            종료 (Esc)
          </button>
        </div>
      </div>
    </div>
  )
}

function SortableSlideItem({
  id, slide, index, active, onClick, onDelete, onDuplicate,
}: {
  id: string
  slide: PptSlide
  index: number
  active: boolean
  onClick: () => void
  onDelete: () => void
  onDuplicate: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto' as const,
  }

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div className="flex items-center">
        <button
          {...attributes}
          {...listeners}
          className="p-1 mr-1 cursor-grab active:cursor-grabbing text-[#a09b96] hover:text-[#6b6764] opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </button>
        <div className="flex-1">
          <PptSlideCard slide={slide} index={index} active={active} onClick={onClick} />
        </div>
      </div>
      <button
        onClick={onDuplicate}
        className="absolute top-1 right-7 w-5 h-5 rounded bg-blue-500/10 hover:bg-blue-500/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Copy className="w-3 h-3 text-blue-500" />
      </button>
      <button
        onClick={onDelete}
        className="absolute top-1 right-1 w-5 h-5 rounded bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Trash2 className="w-3 h-3 text-red-500" />
      </button>
    </div>
  )
}

function isDarkColor(hex: string): boolean {
  const h = hex.replace('#', '')
  if (h.length !== 6) return false
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return lum < 0.5
}

function PptSlidePreview({ slide }: { slide: PptSlide }) {
  // 스타일 → CSS 변환 유틸
  const toCss = (style: PptTextStyle | undefined, fallback: Partial<PptTextStyle>): React.CSSProperties => {
    const s = { ...fallback, ...style }
    return {
      fontFamily: s.fontFace ? `"${s.fontFace}", sans-serif` : undefined,
      fontSize: s.fontSize ? `${s.fontSize * 0.5}px` : undefined,
      fontWeight: s.bold ? 'bold' : 'normal',
      fontStyle: s.italic ? 'italic' : 'normal',
      textDecoration: s.underline ? 'underline' : 'none',
      color: s.color ? `#${s.color}` : undefined,
      textAlign: s.align as any,
      lineHeight: s.lineSpacing ?? undefined,
    }
  }

  // ── 이미지가 있으면 이미지 기반 렌더링 ──
  // ── 이미지 없음: 기존 텍스트 레이아웃 렌더링 ──
  // 색상 팔레트 적용 (slide.color 우선)
  const c = slide.color
  const primary = c?.primary ? `#${c.primary}` : '#1B3A5C'
  const accent = c?.accent ? `#${c.accent}` : '#4A90D9'
  const bg = c?.background ? `#${c.background}` : '#FFFFFF'

  const titleCss = toCss(slide.titleStyle, { color: primary.replace('#', ''), bold: true, fontSize: 32, align: 'center' })
  const bodyCss = toCss(slide.bodyStyle, { color: '333333', fontSize: 16, align: 'left' })

  switch (slide.layout) {

    case 'title':
      return (
        <div className="w-full h-full flex flex-col items-center justify-center text-white p-8 relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}>
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-12 h-1 rounded-full mb-6" style={{ backgroundColor: accent }} />
            <p className="leading-tight tracking-tight" style={{ ...titleCss, color: '#FFFFFF' }}>{slide.title}</p>
            {slide.content.map((c, i) => (
              <p key={i} className="mt-3 font-light" style={{ ...bodyCss, color: '#FFFFFF', textAlign: 'center' }}>{c}</p>
            ))}
            <div className="w-12 h-1 rounded-full mt-6" style={{ backgroundColor: accent }} />
          </div>
        </div>
      )

    case 'bullets':
      return (
        <div className="w-full h-full p-8 flex flex-col" style={{ backgroundColor: bg }}>
          <p className="mb-2" style={titleCss}>{slide.title}</p>
          <div className="h-0.5 w-12 mb-5" style={{ backgroundColor: accent }} />
          <div className="space-y-2.5 flex-1">
            {slide.content.map((c, i) => (
              <div key={i} className="flex gap-3 items-start">
                <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: `${accent}18` }}>
                  <span className="text-xs font-bold" style={{ color: accent }}>{i + 1}</span>
                </span>
                <p className="leading-relaxed" style={bodyCss}>{c}</p>
              </div>
            ))}
          </div>
        </div>
      )

    case 'section-header':
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-8 relative" style={{ background: `linear-gradient(to right, ${accent}18, ${accent}08)`, backgroundColor: bg }}>
          <div className="absolute left-0 top-0 h-full w-1.5" style={{ backgroundColor: accent }} />
          <p className="text-center leading-tight" style={{ ...titleCss, fontSize: titleCss.fontSize ? `${parseInt(titleCss.fontSize) * 2}px` : '36px' }}>{slide.title}</p>
          {slide.content.map((c, i) => (
            <p key={i} className="text-center mt-3" style={bodyCss}>{c}</p>
          ))}
        </div>
      )

    case 'quote':
      return (
        <div className="w-full h-full p-8 flex items-center relative" style={{ backgroundColor: `${primary}06` }}>
          <div className="absolute top-6 left-6 text-7xl font-serif leading-none select-none" style={{ color: `${accent}30` }}>&ldquo;</div>
          <div className="relative z-10 flex gap-5 items-start w-full">
            <div className="w-1 h-24 rounded-full shrink-0 mt-2" style={{ background: `linear-gradient(to bottom, ${primary}, ${accent})` }} />
            <div className="flex-1">
              <p className="mb-3 italic leading-relaxed" style={{ ...titleCss, fontStyle: 'italic' }}>{slide.title}</p>
              {slide.content.map((c, i) => (
                <p key={i} className="italic mb-1.5 leading-relaxed" style={{ ...bodyCss, fontStyle: 'italic' }}>{c}</p>
              ))}
            </div>
          </div>
        </div>
      )

    case 'two-column':
      return (
        <div className="w-full h-full p-6 flex flex-col" style={{ backgroundColor: bg }}>
          <p className="mb-4 shrink-0" style={titleCss}>{slide.title}</p>
          <div className="flex gap-3 flex-1 min-h-0">
            <div className="flex-1 rounded-xl p-4" style={{ backgroundColor: `${accent}18` }}>
              <div className="space-y-2">
                {slide.content.slice(0, Math.ceil(slide.content.length / 2)).map((c, i) => (
                  <p key={i} className="leading-relaxed" style={bodyCss}>• {c}</p>
                ))}
              </div>
            </div>
            <div className="flex-1 rounded-xl p-4" style={{ backgroundColor: `${primary}10` }}>
              <div className="space-y-2">
                {slide.content.slice(Math.ceil(slide.content.length / 2)).map((c, i) => (
                  <p key={i} className="leading-relaxed" style={bodyCss}>• {c}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )

    case 'closing':
      return (
        <div className="w-full h-full flex flex-col items-center justify-center text-white p-8 relative" style={{ background: `linear-gradient(135deg, ${primary}, #00000033, ${primary})` }}>
          <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 50% 50%, ${accent}30, transparent 70%)` }} />
          <div className="relative z-10 text-center">
            <div className="text-3xl mb-4">🙏</div>
            <p className="mb-5 leading-tight" style={{ ...titleCss, color: '#FFFFFF', fontSize: titleCss.fontSize ? `${parseInt(titleCss.fontSize) * 2}px` : '24px' }}>{slide.title}</p>
            {slide.content.map((c, i) => (
              <p key={i} className="mt-2 leading-relaxed max-w-xl" style={{ ...bodyCss, color: '#FFFFFF', opacity: 0.85 }}>{c}</p>
            ))}
          </div>
        </div>
      )

    case 'vs-contrast': {
      const parseSide = (raw: string) => {
        const colonIdx = raw.indexOf(':')
        if (colonIdx === -1) return { label: raw, items: [] }
        return { label: raw.slice(0, colonIdx).trim(), items: raw.slice(colonIdx + 1).split('|').map(s => s.trim()).filter(Boolean) }
      }
      const leftRaw = slide.content[0] || ''
      const rightRaw = slide.content[1] || ''
      const left = parseSide(leftRaw)
      const right = parseSide(rightRaw)
      const extra = slide.content.slice(2)
      return (
        <div className="w-full h-full p-6 flex flex-col" style={{ backgroundColor: bg }}>
          <p className="mb-4 text-center shrink-0" style={titleCss}>{slide.title}</p>
          <div className="flex gap-2 flex-1 min-h-0 items-stretch">
            <div className="flex-1 rounded-2xl p-4 flex flex-col" style={{ background: `linear-gradient(180deg, ${primary}, ${primary}dd)` }}>
              <p className="text-white font-bold text-center text-sm mb-3 pb-2 border-b border-white/20">{left.label || '항목 A'}</p>
              <div className="space-y-2 flex-1">
                {left.items.map((item, i) => (
                  <p key={i} className="text-xs text-center leading-relaxed text-white/85">{item}</p>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-center px-1 shrink-0">
              <div className="flex flex-col items-center gap-1">
                <div className="w-px h-8" style={{ backgroundColor: `${primary}40` }} />
                <span className="text-xs font-black rounded-full w-7 h-7 flex items-center justify-center" style={{ color: primary, backgroundColor: `${primary}10` }}>VS</span>
                <div className="w-px h-8" style={{ backgroundColor: `${primary}40` }} />
              </div>
            </div>
            <div className="flex-1 rounded-2xl p-4 flex flex-col" style={{ background: `linear-gradient(180deg, ${accent}, ${accent}dd)` }}>
              <p className="text-white font-bold text-center text-sm mb-3 pb-2 border-b border-white/20">{right.label || '항목 B'}</p>
              <div className="space-y-2 flex-1">
                {right.items.map((item, i) => (
                  <p key={i} className="text-xs text-center leading-relaxed text-white/85">{item}</p>
                ))}
              </div>
            </div>
          </div>
          {extra.length > 0 && (
            <div className="mt-3 text-center">
              {extra.map((e, i) => <p key={i} className="text-xs" style={{ color: bodyCss.color }}>{e}</p>)}
            </div>
          )}
        </div>
      )
    }

    case 'timeline-flow':
      return (
        <div className="w-full h-full p-6 flex flex-col" style={{ backgroundColor: bg }}>
          <p className="mb-5 shrink-0" style={titleCss}>{slide.title}</p>
          <div className="flex-1 flex flex-col justify-center">
            <div className="relative">
              <div className="absolute left-4 top-4 bottom-4 w-0.5 rounded-full" style={{ background: `linear-gradient(180deg, ${accent}, ${primary})` }} />
              <div className="space-y-3">
                {slide.content.map((step, i) => {
                  const colonIdx = step.indexOf(':')
                  const stepLabel = colonIdx !== -1 ? step.slice(0, colonIdx).trim() : `Step ${i + 1}`
                  const stepContent = colonIdx !== -1 ? step.slice(colonIdx + 1).trim() : step
                  return (
                    <div key={i} className="flex gap-4 items-start relative">
                      <div className="w-8 h-8 rounded-full text-white flex items-center justify-center text-xs font-bold shrink-0 z-10" style={{ backgroundColor: primary }}>
                        {i + 1}
                      </div>
                      <div className="flex-1 rounded-xl p-3 min-h-[2rem]" style={{ backgroundColor: `${accent}18` }}>
                        <p className="text-xs font-bold" style={{ color: primary }}>{stepLabel}</p>
                        {stepContent && stepContent !== stepLabel && (
                          <p className="text-xs mt-0.5 leading-relaxed" style={{ ...bodyCss, fontSize: bodyCss.fontSize || '10px' }}>{stepContent}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )

    case 'central-focus': {
      const keyword = slide.content[0] || slide.title
      const supporting = slide.content.slice(1)
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 relative" style={{ background: `linear-gradient(135deg, ${primary}08, ${accent}08)`, backgroundColor: bg }}>
          <p className="mb-5 text-center" style={{ ...titleCss, opacity: 0.7, fontSize: titleCss.fontSize ? `${parseInt(titleCss.fontSize) * 0.75}px` : '12px' }}>{slide.title}</p>
          <div className="relative flex items-center justify-center">
            {supporting.slice(0, 4).map((_, i) => {
              const angles = [315, 45, 225, 135]
              const angle = angles[i] || (i * 90)
              return (
                <div
                  key={i}
                  className="absolute w-16 h-0.5 origin-left"
                  style={{ transform: `rotate(${angle}deg) translateX(52px)`, backgroundColor: `${accent}40` }}
                />
              )
            })}
            <div className="w-28 h-28 rounded-full flex items-center justify-center shadow-xl z-10" style={{ background: `linear-gradient(135deg, ${primary}, ${primary}cc)` }}>
              <p className="text-white font-black text-center text-sm leading-tight px-2">{keyword}</p>
            </div>
          </div>
          {supporting.length > 0 && (
            <div className="mt-6 grid grid-cols-2 gap-2 w-full max-w-sm">
              {supporting.slice(0, 4).map((s, i) => (
                <div key={i} className="rounded-xl p-2.5 shadow-sm text-center" style={{ backgroundColor: bg, borderColor: `${accent}20`, borderWidth: 1 }}>
                  <p className="text-xs leading-relaxed" style={bodyCss}>{s}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }

    case 'grid-matrix': {
      const cols = slide.content.length <= 4 ? 2 : slide.content.length <= 6 ? 3 : 3
      const cardVariants = [
        { bg: `${accent}15`, border: `${accent}30` },
        { bg: `${primary}10`, border: `${primary}25` },
        { bg: `${accent}08`, border: `${accent}20` },
        { bg: `${primary}15`, border: `${primary}30` },
        { bg: `${accent}20`, border: `${accent}35` },
        { bg: `${primary}08`, border: `${primary}20` },
      ]
      return (
        <div className="w-full h-full p-6 flex flex-col" style={{ backgroundColor: bg }}>
          <p className="mb-4 shrink-0" style={titleCss}>{slide.title}</p>
          <div className="flex-1 grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {slide.content.map((item, i) => {
              const colonIdx = item.indexOf(':')
              const label = colonIdx !== -1 ? item.slice(0, colonIdx).trim() : item
              const desc = colonIdx !== -1 ? item.slice(colonIdx + 1).trim() : ''
              const v = cardVariants[i % cardVariants.length]
              return (
                <div key={i} className="rounded-xl p-3 flex flex-col justify-center" style={{ backgroundColor: v.bg, borderColor: v.border, borderWidth: 1 }}>
                  <p className="text-xs font-bold text-center leading-tight" style={{ color: primary }}>{label}</p>
                  {desc && <p className="text-[10px] text-center mt-1 leading-relaxed" style={{ color: bodyCss.color }}>{desc}</p>}
                </div>
              )
            })}
          </div>
        </div>
      )
    }

    default:
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-8" style={{ backgroundColor: bg }}>
          <p style={titleCss}>{slide.title}</p>
        </div>
      )
  }
}
