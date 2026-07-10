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
import TextStyleEditor from './TextStyleEditor'
import Toast from '@/components/school/workspace/Toast'
import type { PptSlide, PptTextStyle } from '@/types/school/workspace'
import { getTemplates, applyTemplate, type TemplateRecord } from '@/lib/school/templateRegistry'
import { recommendTemplate } from '@/lib/school/workspace/openai'

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
  const [templateCategory, setTemplateCategory] = useState<'all' | 'general' | 'sermon'>('all')
  const [sidebarTab, setSidebarTab] = useState<'content' | 'ai' | 'style' | 'report'>('content')

  const titleInputRef = useRef<HTMLInputElement>(null)

  const handleElementClick = useCallback((target: 'title' | 'content' | 'background') => {
    if (target === 'title') {
      setSidebarTab('content')
      setTimeout(() => {
        if (titleInputRef.current) {
          titleInputRef.current.focus()
          titleInputRef.current.select()
        }
      }, 60)
    } else if (target === 'content') {
      setSidebarTab('content')
    } else if (target === 'background') {
      setSidebarTab('style')
    }
  }, [])

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
      const res = await fetch('/school/api/ppt/save', {
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
      const res = await fetch('/school/api/ppt/generate', {
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
      const sanitizeColor = (col: string | undefined) => {
        if (!col) return undefined
        return col.startsWith('#') ? col.slice(1) : col
      }

      const enrichedSlides = slides.map(slide => {
        let finalColor = slide.color
        if (slide.templateId) {
          const tpl = templates.find(t => t.id === slide.templateId)
          if (tpl && tpl.colors) {
            finalColor = {
              primary: sanitizeColor(tpl.colors.primary) || '',
              accent: sanitizeColor(tpl.colors.accent) || '',
              background: sanitizeColor(tpl.colors.background) || '',
            }
          }
        }
        if (finalColor) {
          finalColor = {
            primary: sanitizeColor(finalColor.primary) || '',
            accent: sanitizeColor(finalColor.accent) || '',
            background: sanitizeColor(finalColor.background) || '',
          }
        }
        return {
          ...slide,
          color: finalColor,
        }
      })

      const res = await fetch('/school/api/ppt/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slides: enrichedSlides,
          title: sermon?.title || 'PPT',
          theme,
        }),
      })
      if (!res.ok) {
        let errMsg = `다운로드 실패 (${res.status})`
        try {
          const errData = await res.json()
          errMsg = errData.error || errMsg
        } catch {}
        throw new Error(errMsg)
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${sermon?.title || 'ppt'}-${Date.now()}.pptx`
      a.click()
      URL.revokeObjectURL(url)
      setToast({ visible: true, message: 'PPTX 다운로드 완료!', type: 'success' })
    } catch (err: any) {
      console.error('[PPT Download Error]', err)
      setToast({ visible: true, message: err.message || '다운로드 실패', type: 'error' })
    } finally {
      setDownloading(false)
    }
  }, [slides, sermon, theme, templates])

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
      const res = await fetch('/school/api/ppt/refine', {
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
    <div className="flex h-[calc(100vh-4rem)] bg-[#F0F4FA]">
      <aside className="w-64 shrink-0 border-r border-[#D0D8E5] bg-[#E8EDF5] overflow-y-auto hidden lg:block">
        <div className="p-4">
          <h2 className="text-[13px] font-bold text-[#1A2A3A] mb-3 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-[#1B3A5C]" />
            설교 원고
          </h2>
          <div className="space-y-1">
            {sermons.map((s) => (
              <button
                key={s.id}
                onClick={() => onSelectSermon(s)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-[13px] transition-all duration-200 ${
                  sermon?.id === s.id
                    ? 'bg-[#DCE4F0] text-[#1A2A3A] font-bold border border-[#B0C0D5]'
                    : 'text-[#4A5A6A] hover:bg-[#DCE4F0]/50 hover:text-[#1A2A3A]'
                }`}
              >
                <p className="truncate">{s.title || '제목 없음'}</p>
                <p className="text-[11px] text-[#6A7A8A] truncate mt-0.5">{s.normalizedPassage || s.passage}</p>
              </button>
            ))}
            {sermons.length === 0 && (
              <p className="text-[12px] text-[#6A7A8A] text-center py-8">업로드된 설교가 없습니다.</p>
            )}
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-center justify-between px-6 py-3 border-b border-[#D0D8E5] bg-white">
          <div className="flex items-center gap-3">
            <h1 className="text-[16px] font-bold text-[#1A2A3A]">
              {sermon?.title || 'PPT 스튜디오'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setPresentationIndex(activeIndex); setPresenting(true) }}
              disabled={slides.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-medium border border-[#D0D8E5] text-[#2A3A4A] hover:bg-[#E8EDF5] disabled:opacity-40 transition-all duration-200"
              title="프레젠테이션"
            >
              <Presentation className="w-4 h-4" />
              발표
            </button>
            {saveStatus === 'saving' && (
              <span className="flex items-center gap-1 text-[12px] text-[#1B3A5C] font-medium">
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
              className="p-2 rounded-lg text-[#4A5A6A] hover:bg-[#E8EDF5] disabled:opacity-30 transition-all"
              title="실행 취소 (Cmd+Z)"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyFuture.current.length === 0}
              className="p-2 rounded-lg text-[#4A5A6A] hover:bg-[#E8EDF5] disabled:opacity-30 transition-all"
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
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-medium bg-[#1B3A5C] text-white hover:bg-[#0F2B4F] disabled:opacity-40 transition-all duration-200"
            >
              {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              PPTX
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={slides.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-medium border border-[#D0D8E5] text-[#2A3A4A] hover:bg-[#E8EDF5] disabled:opacity-40 transition-all duration-200"
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
                  className="w-full aspect-video rounded-xl border-2 overflow-hidden bg-white shadow-lg relative border-[#D0D8E5]"
                >
                  <PptSlidePreview slide={currentSlide} templates={templates} onElementClick={handleElementClick} />
                </div>
                <div className="flex items-center justify-between mt-4">
                  <button
                    onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
                    disabled={activeIndex === 0}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[13px] text-[#4A5A6A] hover:bg-[#DCE4F0] disabled:opacity-30 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" /> 이전
                  </button>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[13px] font-medium text-[#6A7A8A]">
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
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[13px] text-[#4A5A6A] hover:bg-[#DCE4F0] disabled:opacity-30 transition-all"
                  >
                    다음 <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                {currentSlide.coreMessage && (
                  <div className="mt-3 px-4 py-2.5 bg-[#F0F6FF] border border-[#D0D8E5] rounded-xl">
                    <p className="text-[10px] font-bold text-[#1B3A5C] mb-0.5">💡 핵심 메시지</p>
                    <p className="text-[12px] text-[#1A2A3A] leading-relaxed">{currentSlide.coreMessage}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-[#DCE4F0] flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-7 h-7 text-[#1B3A5C]" />
                </div>
                <p className="text-[15px] font-bold text-[#1A2A3A] mb-1">AI PPT 스튜디오</p>
                <p className="text-[13px] text-[#6A7A8A] max-w-xs mx-auto">좌측에서 원고를 선택하고 GPT-5.4-mini로 슬라이드를 생성한 뒤, 템플릿을 적용해보세요.</p>
              </div>
            )}
          </div>

          <aside className="w-80 shrink-0 border-l border-[#e4e2dd] bg-gradient-to-b from-[#fcfbfa] to-[#f5f4f0] overflow-y-auto shadow-inner">
            <div className="p-5 space-y-6">
              {/* ── AI 생성 패널 ── */}
              <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 border border-[#e4e2dd] shadow-sm">
                <h3 className="text-[13px] font-bold text-[#2c2a29] mb-3.5 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#8d7a5b] animate-pulse" />
                  AI 스마트 생성
                </h3>
                <button
                  onClick={handleGenerate}
                  disabled={generating || !sermon?.raw_text}
                  className="w-full flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl text-[13.5px] font-extrabold text-white transition-all duration-300 shadow-md bg-gradient-to-r from-[#8d7a5b] via-[#9e8b6d] to-[#7a694e] hover:from-[#7a694e] hover:to-[#6b5c45] hover:shadow-[#8d7a5b]/20 hover:scale-[1.01] disabled:opacity-40 disabled:scale-100 disabled:shadow-none"
                >
                  {generating ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Sparkles className="w-4.5 h-4.5" />
                  )}
                  {generating ? '슬라이드 생성 중...' : '슬라이드 자동 생성 (AI)'}
                </button>
              </div>

              {/* ── 템플릿 선택 ── */}
              {slides.length > 0 && (
                <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 border border-[#e4e2dd] shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[13px] font-bold text-[#2c2a29] flex items-center gap-2">
                      <Settings className="w-4 h-4 text-[#8d7a5b]" />
                      디자인 템플릿
                    </h3>
                  </div>

                  {/* 카테고리 필터 탭 */}
                  <div className="flex gap-1 p-1 bg-[#eae7e0]/60 rounded-xl mb-4 border border-[#e4e2dd]/40">
                    {(['all', 'general', 'sermon'] as const).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setTemplateCategory(cat)}
                        className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-all duration-200 ${
                          templateCategory === cat
                            ? 'bg-white text-[#2c2a29] shadow-sm'
                            : 'text-[#6b6764] hover:text-[#2c2a29]'
                        }`}
                      >
                        {cat === 'all' ? '전체' : cat === 'general' ? '일반' : '설교'}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 max-h-96 overflow-y-auto pr-1">
                    {(templates.length > 0 ? templates : []).filter(t => templateCategory === 'all' || t.category === templateCategory).map((t) => {
                      const isSelected = selectedTemplateId === t.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => {
                            setSelectedTemplateId(t.id)
                            pushHistory()
                            setSlides((prev) => prev.map((sl) => applyTemplate(sl, t)))
                            setToast({ visible: true, message: `"${t.name}" 테마가 아름답게 적용되었습니다.`, type: 'success' })
                          }}
                          className={`group text-left p-2.5 rounded-xl transition-all duration-300 border relative overflow-hidden flex flex-col justify-between h-[86px] ${
                            isSelected
                              ? 'border-[#8d7a5b] bg-white shadow-md ring-2 ring-[#8d7a5b]/20 scale-[1.02]'
                              : 'border-[#e4e2dd] bg-[#fbfaf7]/40 hover:bg-white hover:border-[#8d7a5b]/50 hover:shadow-sm'
                          }`}
                        >
                          <div>
                            <span className="block text-[11px] font-bold text-[#2c2a29] truncate group-hover:text-[#8d7a5b] transition-colors">{t.name}</span>
                            <span className="inline-block px-1.5 py-0.5 rounded text-[8.5px] font-bold mt-1 bg-[#eae7e0] text-[#6b6764]">
                              {t.category === 'sermon' ? '설교 명품' : '클래식'}
                            </span>
                          </div>
                          
                          {/* 하단 미니멀 색상 스와치 바 */}
                          <div className="flex w-full h-1.5 rounded-full overflow-hidden mt-2 border border-black/5">
                            <span className="flex-1" style={{ backgroundColor: `#${t.primary_color}` }} title="주조색" />
                            <span className="flex-1" style={{ backgroundColor: `#${t.accent_color}` }} title="강조색" />
                            <span className="flex-1" style={{ backgroundColor: `#${t.background_color}` }} title="배경색" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── 설정 패널 ── */}
              <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 border border-[#e4e2dd] shadow-sm">
                <h3 className="text-[13px] font-bold text-[#2c2a29] mb-3.5 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-[#8d7a5b]" />
                  생성 옵션 설정
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-[11.5px] font-bold text-[#6b6764] block mb-2">기본 분위기 테마</label>
                    <div className="flex gap-1.5">
                      {THEMES.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setTheme(t.id)}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-bold border transition-all duration-200 ${
                            theme === t.id
                              ? 'bg-white text-[#2c2a29] border-[#8d7a5b] shadow-sm'
                              : 'text-[#6b6764] hover:bg-white hover:text-[#2c2a29] border-transparent'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${t.color}`} />
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-[11.5px] font-bold text-[#6b6764]">목표 슬라이드 장수</label>
                      <span className="text-[12px] font-bold text-[#8d7a5b]">{slideCount}장</span>
                    </div>
                    <input
                      type="range"
                      min={3}
                      max={15}
                      value={slideCount}
                      onChange={(e) => setSlideCount(Number(e.target.value))}
                      className="w-full accent-[#8d7a5b] bg-[#eae7e0] h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* ── 슬라이드 목록 ── */}
              {slides.length > 0 && (
                <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 border border-[#e4e2dd] shadow-sm">
                  <h3 className="text-[13px] font-bold text-[#2c2a29] mb-3">슬라이드 배열 순서</h3>
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleReorder}>
                    <SortableContext items={slides.map((_, i) => `slide-${i}`)} strategy={verticalListSortingStrategy}>
                      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
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

              {/* ── 슬라이드 편집 탭 패널 ── */}
              {currentSlide && (
                <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 border border-[#e4e2dd] shadow-sm space-y-4">
                  {/* 탭 헤더 */}
                  <div className="grid grid-cols-4 gap-1 p-1 bg-[#f5f4f0] rounded-xl border border-[#e4e2dd]/60">
                    {(['content', 'ai', 'style', 'report'] as const).map((tab) => {
                      const labels = {
                        content: '✏️ 내용',
                        ai: '✨ AI수정',
                        style: '🎨 서체',
                        report: '🎤 리포트',
                      }
                      return (
                        <button
                          key={tab}
                          onClick={() => setSidebarTab(tab)}
                          className={`py-1.5 rounded-lg text-[11px] font-bold transition-all duration-200 ${
                            sidebarTab === tab
                              ? 'bg-white text-[#2c2a29] shadow-sm border border-[#e4e2dd]'
                              : 'text-[#8a8580] hover:text-[#2c2a29] hover:bg-[#eae8e3]/40'
                          }`}
                        >
                          {labels[tab]}
                        </button>
                      )
                    })}
                  </div>

                  {/* 탭 1: 내용 편집 */}
                  {sidebarTab === 'content' && (
                    <div className="space-y-4">
                      <div className="text-left">
                        <label className="text-[10.5px] font-bold text-[#6b6764] block mb-1">슬라이드 제목</label>
                        <input
                          ref={titleInputRef}
                          type="text"
                          value={currentSlide.title}
                          onChange={(e) => updateSlide(activeIndex, { ...currentSlide, title: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-[#e4e2dd] text-[12.5px] text-[#2c2a29] bg-white/80 focus:outline-none focus:border-[#8d7a5b] focus:bg-white transition-all"
                        />
                      </div>
                      <div className="text-left">
                        <label className="text-[10.5px] font-bold text-[#6b6764] block mb-1">레이아웃 종류</label>
                        <select
                          value={currentSlide.layout}
                          onChange={(e) => updateSlide(activeIndex, { ...currentSlide, layout: e.target.value as any })}
                          className="w-full px-3 py-2 rounded-xl border border-[#e4e2dd] text-[12.5px] text-[#2c2a29] bg-white/80 focus:outline-none focus:border-[#8d7a5b] focus:bg-white transition-all"
                        >
                          {LAYOUT_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                      <hr className="border-[#e4e2dd]" />
                      <div className="space-y-1">
                        <label className="text-[10.5px] font-bold text-[#6b6764] block mb-1.5 text-left">세부 내용 편집</label>
                        <SmartContentEditor
                          slide={currentSlide}
                          onChange={(updated) => updateSlide(activeIndex, updated)}
                        />
                      </div>
                    </div>
                  )}

                  {/* 탭 2: AI 정밀 수정 */}
                  {sidebarTab === 'ai' && (
                    <div className="space-y-4 text-left">
                      <div>
                        <h3 className="text-[12.5px] font-bold text-[#2c2a29] mb-2 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#8d7a5b]" />
                          AI 원클릭 추천 수정
                        </h3>
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {['더 간결하게 요약', '성경적 묵상 보강', '구체적 예화 추가', '핵심 메시지 강조'].map((label) => (
                            <button
                              key={label}
                              onClick={() => handleRefine(label)}
                              disabled={refining}
                              className="px-2.5 py-1.5 rounded-lg text-[10.5px] font-bold bg-[#f5f4f0] text-[#6b6764] border border-[#e4e2dd]/60 hover:bg-[#eae7e0] hover:text-[#2c2a29] disabled:opacity-40 transition-all duration-200"
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={refineInput}
                            onChange={(e) => setRefineInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleRefine(refineInput) }}
                            placeholder="예: 성경 구절 중심으로 요약"
                            className="flex-1 px-3 py-2 rounded-xl border border-[#e4e2dd] text-[11.5px] text-[#2c2a29] bg-white/80 focus:outline-none focus:border-[#8d7a5b] focus:bg-white transition-all"
                          />
                          <button
                            onClick={() => handleRefine(refineInput)}
                            disabled={refining || !refineInput.trim()}
                            className="px-3.5 py-2 rounded-xl text-[12px] font-bold bg-[#8d7a5b] text-white hover:bg-[#7a694e] disabled:opacity-40 transition-all shadow-sm"
                          >
                            {refining ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : '수정'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 탭 3: 서체 & 스타일 */}
                  {sidebarTab === 'style' && (
                    <div className="space-y-4 text-left">
                      <div className="flex items-center justify-between">
                        <h3 className="text-[12.5px] font-bold text-[#2c2a29]">서체 & 스타일 설정</h3>
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
                            setToast({ visible: true, message: '모든 슬라이드에 디자인 서체가 적용되었습니다.', type: 'success' })
                          }}
                          className="px-2.5 py-1.5 rounded-lg text-[10.5px] font-bold bg-[#8d7a5b] text-white hover:bg-[#7a694e] transition-all shadow-sm"
                        >
                          전체 슬라이드 적용
                        </button>
                      </div>

                      {/* 이 슬라이드 개별 테마 설정 */}
                      <div className="p-3.5 bg-[#f5f4f0] rounded-xl border border-[#e4e2dd] space-y-3.5 shadow-inner">
                        <div className="flex items-center justify-between border-b border-[#e4e2dd] pb-2">
                          <h4 className="text-[11px] font-bold text-[#8d7a5b] uppercase tracking-wider flex items-center gap-1.5">
                            🎨 이 슬라이드 전용 커스텀
                          </h4>
                          <span className="text-[9.5px] bg-[#8d7a5b]/10 text-[#8d7a5b] px-1.5 py-0.5 rounded-md font-extrabold">개별 적용</span>
                        </div>
                        
                        {/* 다크 모드 토글 */}
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[11.5px] font-bold text-[#2c2a29] block">다크 모드</span>
                            <span className="text-[9.5px] text-[#8a8580]">이 슬라이드만 어두운 배경 적용</span>
                          </div>
                          <button
                            onClick={() => {
                              pushHistory()
                              updateSlide(activeIndex, { ...currentSlide, darkMode: !currentSlide.darkMode })
                            }}
                            className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${
                              currentSlide.darkMode ? 'bg-[#8d7a5b]' : 'bg-[#e4e2dd]'
                            }`}
                          >
                            <span
                              className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                                currentSlide.darkMode ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>

                        {/* 개별 템플릿 테마 지정 */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <label className="text-[10.5px] font-bold text-[#6b6764]">개별 디자인 테마</label>
                            {currentSlide.templateId && (
                              <button 
                                onClick={() => {
                                  pushHistory()
                                  updateSlide(activeIndex, { ...currentSlide, templateId: '' })
                                }}
                                className="text-[9.5px] text-red-500 hover:underline font-bold"
                              >
                                지정 해제
                              </button>
                            )}
                          </div>
                          <select
                            value={currentSlide.templateId || ''}
                            onChange={(e) => {
                              pushHistory()
                              updateSlide(activeIndex, { ...currentSlide, templateId: e.target.value })
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-[#e4e2dd] text-[11.5px] text-[#2c2a29] bg-white focus:outline-none focus:border-[#8d7a5b] transition-all"
                          >
                            <option value="">(전체 기본 테마 설정 따름)</option>
                            {templates.map((tpl) => (
                              <option key={tpl.id} value={tpl.id}>
                                {tpl.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* 그리드 매트릭스 레이아웃일 때 열 개수 조절 */}
                        {currentSlide.layout === 'grid-matrix' && (
                          <div className="space-y-1.5">
                            <label className="text-[10.5px] font-bold text-[#6b6764] block">그리드 열 개수</label>
                            <div className="flex gap-2">
                              {[2, 3].map((cols) => (
                                <button
                                  key={cols}
                                  onClick={() => {
                                    pushHistory()
                                    updateSlide(activeIndex, { ...currentSlide, columnCount: cols })
                                  }}
                                  className={`flex-1 py-1.5 rounded-lg border text-[11px] font-extrabold transition-all ${
                                    (currentSlide.columnCount || (currentSlide.content.length <= 4 ? 2 : 3)) === cols
                                      ? 'bg-[#8d7a5b] text-white border-[#8d7a5b] shadow-sm'
                                      : 'bg-white text-[#6b6764] border-[#e4e2dd] hover:bg-[#f5f4f0]'
                                  }`}
                                >
                                  {cols}열 레이아웃
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
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
                  )}

                  {/* 탭 4: 설교 리포트 */}
                  {sidebarTab === 'report' && (
                    <div className="space-y-3.5 text-left">
                      <h3 className="text-[12.5px] font-bold text-[#2c2a29] flex items-center gap-1.5 mb-2">
                        <Sparkles className="w-3.5 h-3.5 text-[#8d7a5b]" />
                        이 슬라이드 설교 가이드
                      </h3>

                      {currentSlide.coreMessage && (
                        <div className="bg-[#fffbf5] border border-[#e4d8c6] rounded-xl p-3 shadow-sm">
                          <p className="text-[10px] font-bold text-[#8d7a5b] uppercase tracking-wide mb-1.5">💡 핵심 한줄 메시지</p>
                          <p className="text-[11.5px] text-[#2c2a29] leading-relaxed">{currentSlide.coreMessage}</p>
                        </div>
                      )}

                      {currentSlide.speakerNotes && (
                        <div className="bg-[#f0f7ff] border border-[#cce0ff] rounded-xl p-3 shadow-sm">
                          <p className="text-[10px] font-bold text-[#1B3A5C] uppercase tracking-wide mb-1.5">🎤 강단 스크립트 (가이드)</p>
                          <p className="text-[11px] text-[#2c2a29] leading-relaxed whitespace-pre-wrap">{currentSlide.speakerNotes}</p>
                        </div>
                      )}

                      {currentSlide.visualRecommendation && (
                        <div className="bg-[#f5f0ff] border border-[#ddd0ff] rounded-xl p-3 shadow-sm">
                          <p className="text-[10px] font-bold text-[#5B35A0] uppercase tracking-wide mb-1.5">🎨 시각 연출 제안</p>
                          <p className="text-[11px] text-[#2c2a29] leading-relaxed">{currentSlide.visualRecommendation}</p>
                        </div>
                      )}

                      {currentSlide.designNote && (
                        <div className="bg-[#f0fff5] border border-[#c6e4d0] rounded-xl p-3 shadow-sm">
                          <p className="text-[10px] font-bold text-[#1a6b3a] uppercase tracking-wide mb-1.5">✏️ 디자이너 노트</p>
                          <p className="text-[11px] text-[#1a2a3a] leading-relaxed">{currentSlide.designNote}</p>
                        </div>
                      )}

                      {!currentSlide.coreMessage && !currentSlide.speakerNotes && !currentSlide.visualRecommendation && !currentSlide.designNote && (
                        <p className="text-[12px] text-[#8a8580] text-center py-8">제공되는 분석 리포트가 없습니다.</p>
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
          <PptSlidePreview slide={slide} templates={templates} />
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
          className="p-1 mr-1 cursor-grab active:cursor-grabbing text-[#8090A0] hover:text-[#4A5A6A] opacity-0 group-hover:opacity-100 transition-opacity"
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

function PptSlidePreview({ 
  slide, 
  templates = [],
  onElementClick,
}: { 
  slide: PptSlide; 
  templates?: any[];
  onElementClick?: (target: 'title' | 'content' | 'background') => void;
}) {
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

  // 1. 슬라이드 개별 템플릿(templateId) 또는 글로벌 템플릿 색상 바인딩
  let primaryColor = '#1B3A5C'
  let accentColor = '#4A90D9'
  let bgColor = '#FFFFFF'

  const customTemplate = slide.templateId ? templates.find(t => t.id === slide.templateId) : null
  if (customTemplate) {
    primaryColor = customTemplate.primary_color ? (customTemplate.primary_color.startsWith('#') ? customTemplate.primary_color : `#${customTemplate.primary_color}`) : '#1B3A5C'
    accentColor = customTemplate.accent_color ? (customTemplate.accent_color.startsWith('#') ? customTemplate.accent_color : `#${customTemplate.accent_color}`) : '#4A90D9'
    bgColor = customTemplate.background_color ? (customTemplate.background_color.startsWith('#') ? customTemplate.background_color : `#${customTemplate.background_color}`) : '#FFFFFF'
  } else {
    // 슬라이드 자체의 inline color 속성 우선 적용
    const c = slide.color
    primaryColor = c?.primary ? (c.primary.startsWith('#') ? c.primary : `#${c.primary}`) : '#1B3A5C'
    accentColor = c?.accent ? (c.accent.startsWith('#') ? c.accent : `#${c.accent}`) : '#4A90D9'
    bgColor = c?.background ? (c.background.startsWith('#') ? c.background : `#${c.background}`) : '#FFFFFF'
  }

  // 2. 다크 모드 활성화 시 배경색과 텍스트색 강제 반전
  const isDark = slide.darkMode || false
  const primary = primaryColor
  const accent = accentColor
  const bg = isDark ? primary : bgColor

  const titleCss = toCss(slide.titleStyle, {
    color: (isDark ? 'FFFFFF' : primary.replace('#', '')),
    bold: true,
    fontSize: 32,
    align: 'center'
  })
  const bodyCss = toCss(slide.bodyStyle, {
    color: (isDark ? 'F1F5F9' : '333333'),
    fontSize: 16,
    align: 'left'
  })

  // 클릭 시각 피드백 클래스
  const clickTargetClass = (type: 'title' | 'content') => {
    return `cursor-pointer transition-all duration-200 hover:outline hover:outline-dashed hover:outline-1 ${
      isDark 
        ? 'hover:outline-white/40 hover:bg-white/5' 
        : 'hover:outline-[#8d7a5b]/50 hover:bg-[#8d7a5b]/5'
    } rounded-lg px-2 py-1`
  }

  const handleBgClick = () => {
    onElementClick?.('background')
  }

  switch (slide.layout) {

    case 'title':
      return (
        <div 
          onClick={handleBgClick}
          className="w-full h-full flex flex-col items-center justify-center text-white p-8 relative overflow-hidden select-none"
          style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}>
          {/* 프리미엄 백그라운드 광채(Glow) 효과 */}
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
          <div className="relative z-10 flex flex-col items-center max-w-2xl px-4">
            <div className="w-10 h-1 rounded-full mb-6" style={{ backgroundColor: '#FFFFFF', opacity: 0.8 }} />
            <p 
              onClick={(e) => { e.stopPropagation(); onElementClick?.('title') }}
              className={`leading-tight tracking-tight drop-shadow-md select-none ${clickTargetClass('title')}`}
              style={{ 
                ...titleCss, 
                color: slide.titleStyle?.color ? titleCss.color : '#FFFFFF', 
                fontSize: slide.titleStyle?.fontSize ? titleCss.fontSize : '28px' 
              }}
            >
              {slide.title}
            </p>
            <div 
              onClick={(e) => { e.stopPropagation(); onElementClick?.('content') }}
              className={`mt-2 flex flex-col items-center w-full ${clickTargetClass('content')}`}
            >
              {slide.content.map((c, i) => (
                <p 
                  key={i} 
                  className="font-light opacity-90 leading-relaxed text-center" 
                  style={{ 
                    ...bodyCss, 
                    color: slide.bodyStyle?.color ? bodyCss.color : '#FFFFFF', 
                    fontSize: slide.bodyStyle?.fontSize ? bodyCss.fontSize : '13px' 
                  }}
                >{c}</p>
              ))}
            </div>
            <div className="w-10 h-1 rounded-full mt-6" style={{ backgroundColor: '#FFFFFF', opacity: 0.3 }} />
          </div>
        </div>
      )

    case 'bullets':
      return (
        <div 
          onClick={handleBgClick}
          className="w-full h-full p-8 flex flex-col justify-between select-none" 
          style={{ backgroundColor: bg }}
        >
          <div className="relative">
            <p 
              onClick={(e) => { e.stopPropagation(); onElementClick?.('title') }}
              className={clickTargetClass('title')}
              style={titleCss}
            >
              {slide.title}
            </p>
            <div className="h-1 w-10 rounded-full mt-2" style={{ backgroundColor: accent }} />
          </div>
          <div 
            onClick={(e) => { e.stopPropagation(); onElementClick?.('content') }}
            className={`space-y-3 flex-1 flex flex-col justify-center ${clickTargetClass('content')}`}
          >
            {slide.content.map((c, i) => (
              <div key={i} className="flex gap-3.5 items-start">
                <span className="w-5 h-5 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-sm border border-black/5" style={{ backgroundColor: `${accent}15` }}>
                  <span className="text-[10px] font-black" style={{ color: accent }}>{i + 1}</span>
                </span>
                <p className="leading-relaxed text-[12.5px] flex-1" style={bodyCss}>{c}</p>
              </div>
            ))}
          </div>
        </div>
      )

    case 'section-header':
      return (
        <div 
          onClick={handleBgClick}
          className="w-full h-full flex flex-col items-center justify-center p-8 relative overflow-hidden select-none" 
          style={{ background: `linear-gradient(135deg, ${accent}12, ${accent}04)`, backgroundColor: bg }}>
          <div className="absolute left-0 top-0 h-full w-2" style={{ backgroundColor: accent }} />
          <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full blur-3xl opacity-30" style={{ backgroundColor: accent }} />
          <div className="relative z-10 max-w-xl text-center">
            <p 
              onClick={(e) => { e.stopPropagation(); onElementClick?.('title') }}
              className={`leading-tight tracking-tight drop-shadow-sm mb-2 ${clickTargetClass('title')}`}
              style={{ 
                ...titleCss, 
                fontSize: slide.titleStyle?.fontSize ? titleCss.fontSize : (titleCss.fontSize ? `${parseInt(titleCss.fontSize as string) * 1.3}px` : '36px') 
              }}
            >
              {slide.title}
            </p>
            <div 
              onClick={(e) => { e.stopPropagation(); onElementClick?.('content') }}
              className={clickTargetClass('content')}
            >
              {slide.content.map((c, i) => (
                <p 
                  key={i} 
                  className="opacity-80 leading-relaxed text-[14px]" 
                  style={{ 
                    ...bodyCss, 
                    fontSize: slide.bodyStyle?.fontSize ? bodyCss.fontSize : '14px' 
                  }}
                >{c}</p>
              ))}
            </div>
          </div>
        </div>
      )

    case 'quote':
      return (
        <div 
          onClick={handleBgClick}
          className="w-full h-full p-8 flex items-center relative overflow-hidden select-none" 
          style={{ backgroundColor: `${primary}08` }}
        >
          <div className="absolute top-4 left-6 text-[100px] font-serif leading-none select-none opacity-25" style={{ color: accent }}>“</div>
          <div className="absolute bottom-[-40px] right-8 text-[100px] font-serif leading-none select-none opacity-10" style={{ color: primary }}>”</div>
          <div className="relative z-10 flex gap-6 items-stretch w-full">
            <div className="w-1.5 rounded-full shrink-0" style={{ background: `linear-gradient(to bottom, ${primary}, ${accent})` }} />
            <div className="flex-1 flex flex-col justify-center py-2">
              <p 
                onClick={(e) => { e.stopPropagation(); onElementClick?.('title') }}
                className={`mb-2 italic leading-relaxed font-extrabold tracking-tight ${clickTargetClass('title')}`}
                style={{ 
                  ...titleCss, 
                  textAlign: slide.titleStyle?.align ? titleCss.textAlign : 'left', 
                  fontSize: slide.titleStyle?.fontSize ? titleCss.fontSize : '20px' 
                }}
              >
                {slide.title}
              </p>
              <div 
                onClick={(e) => { e.stopPropagation(); onElementClick?.('content') }}
                className={clickTargetClass('content')}
              >
                {slide.content.map((c, i) => (
                  <p 
                    key={i} 
                    className="italic mb-1 leading-relaxed opacity-90 text-[13.5px]" 
                    style={{ 
                      ...bodyCss, 
                      fontStyle: slide.bodyStyle?.italic ? bodyCss.fontStyle : 'italic', 
                      fontSize: slide.bodyStyle?.fontSize ? bodyCss.fontSize : '13.5px' 
                    }}
                  >{c}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )

    case 'two-column':
      return (
        <div 
          onClick={handleBgClick}
          className="w-full h-full p-7 flex flex-col select-none" 
          style={{ backgroundColor: bg }}
        >
          <div className="shrink-0 mb-2">
            <p 
              onClick={(e) => { e.stopPropagation(); onElementClick?.('title') }}
              className={clickTargetClass('title')}
              style={titleCss}
            >
              {slide.title}
            </p>
            <div className="h-0.5 w-8 mt-2" style={{ backgroundColor: accent }} />
          </div>
          <div 
            onClick={(e) => { e.stopPropagation(); onElementClick?.('content') }}
            className={`flex gap-4 flex-1 min-h-0 items-stretch ${clickTargetClass('content')}`}
          >
            <div className="flex-1 rounded-2xl p-4.5 border border-[#e4e2dd]/40 shadow-sm flex flex-col justify-center bg-white/40" style={{ backgroundColor: `${accent}09` }}>
              <div className="space-y-3">
                {slide.content.slice(0, Math.ceil(slide.content.length / 2)).map((c, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <span className="text-[10px] mt-1" style={{ color: accent }}>✦</span>
                    <p 
                      className="leading-relaxed text-[12px]" 
                      style={{ 
                        ...bodyCss, 
                        fontSize: slide.bodyStyle?.fontSize ? bodyCss.fontSize : '12px' 
                      }}
                    >{c}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 rounded-2xl p-4.5 border border-[#e4e2dd]/40 shadow-sm flex flex-col justify-center bg-white/40" style={{ backgroundColor: `${primary}06` }}>
              <div className="space-y-3">
                {slide.content.slice(Math.ceil(slide.content.length / 2)).map((c, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <span className="text-[10px] mt-1" style={{ color: primary }}>✦</span>
                    <p 
                      className="leading-relaxed text-[12px]" 
                      style={{ 
                        ...bodyCss, 
                        fontSize: slide.bodyStyle?.fontSize ? bodyCss.fontSize : '12px' 
                      }}
                    >{c}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )

    case 'closing':
      return (
        <div 
          onClick={handleBgClick}
          className="w-full h-full flex flex-col items-center justify-center text-white p-8 relative overflow-hidden select-none" 
          style={{ background: `linear-gradient(135deg, ${primary}, #111e2e, ${primary})` }}
        >
          <div className="absolute inset-0 blur-3xl opacity-35" style={{ background: `radial-gradient(circle at 50% 50%, ${accent}, transparent 65%)` }} />
          <div className="relative z-10 text-center flex flex-col items-center max-w-xl">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-[22px] mb-4.5 border border-white/10 backdrop-blur-md shadow-inner animate-bounce">🙏</div>
            <p 
              onClick={(e) => { e.stopPropagation(); onElementClick?.('title') }}
              className={`mb-2 leading-tight tracking-tight drop-shadow-md ${clickTargetClass('title')}`}
              style={{ 
                ...titleCss, 
                color: slide.titleStyle?.color ? titleCss.color : '#FFFFFF', 
                fontSize: slide.titleStyle?.fontSize ? titleCss.fontSize : '24px' 
              }}
            >
              {slide.title}
            </p>
            <div 
              onClick={(e) => { e.stopPropagation(); onElementClick?.('content') }}
              className={clickTargetClass('content')}
            >
              {slide.content.map((c, i) => (
                <p 
                  key={i} 
                  className="mt-2 text-[13px] leading-relaxed opacity-80" 
                  style={{ 
                    ...bodyCss, 
                    color: slide.bodyStyle?.color ? bodyCss.color : '#FFFFFF', 
                    textAlign: 'center',
                    fontSize: slide.bodyStyle?.fontSize ? bodyCss.fontSize : '13px'
                  }}
                >{c}</p>
              ))}
            </div>
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
        <div 
          onClick={handleBgClick}
          className="w-full h-full p-6 flex flex-col select-none" 
          style={{ backgroundColor: bg }}
        >
          <p 
            onClick={(e) => { e.stopPropagation(); onElementClick?.('title') }}
            className={`mb-2 text-center shrink-0 tracking-tight ${clickTargetClass('title')}`}
            style={titleCss}
          >
            {slide.title}
          </p>
          <div 
            onClick={(e) => { e.stopPropagation(); onElementClick?.('content') }}
            className={`flex gap-2 flex-1 min-h-0 items-stretch ${clickTargetClass('content')}`}
          >
            <div className="flex-1 rounded-2xl p-4.5 flex flex-col justify-center shadow-md border border-white/10" style={{ background: `linear-gradient(180deg, ${primary}, ${primary}ee)` }}>
              <p className="text-white font-black text-center text-[12.5px] mb-3 pb-2 border-b border-white/15 tracking-wider"
                style={{
                  fontFamily: titleCss.fontFamily,
                  fontStyle: titleCss.fontStyle,
                  textDecoration: titleCss.textDecoration,
                  fontSize: slide.titleStyle?.fontSize ? titleCss.fontSize : '12.5px',
                  lineHeight: titleCss.lineHeight,
                  color: titleCss.color || undefined
                }}>{left.label || '항목 A'}</p>
              <div className="space-y-2 flex-1 flex flex-col justify-center">
                {left.items.map((item, i) => (
                  <p key={i} className="text-[11px] text-center leading-relaxed text-white/90"
                    style={{
                      fontFamily: bodyCss.fontFamily,
                      fontStyle: bodyCss.fontStyle,
                      textDecoration: bodyCss.textDecoration,
                      fontSize: slide.bodyStyle?.fontSize ? bodyCss.fontSize : '11px',
                      lineHeight: bodyCss.lineHeight,
                      color: bodyCss.color || undefined
                    }}>{item}</p>
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-center px-1 shrink-0 z-10">
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-0.5 h-8 bg-gradient-to-b from-transparent to-[#e4e2dd]" />
                <span className="text-[10px] font-black rounded-full w-8 h-8 flex items-center justify-center bg-white border border-[#e4e2dd] shadow-md text-[#2c2a29]">VS</span>
                <div className="w-0.5 h-8 bg-gradient-to-t from-transparent to-[#e4e2dd]" />
              </div>
            </div>
            
            <div className="flex-1 rounded-2xl p-4.5 flex flex-col justify-center shadow-md border border-white/10" style={{ background: `linear-gradient(180deg, ${accent}, ${accent}ee)` }}>
              <p className="text-white font-black text-center text-[12.5px] mb-3 pb-2 border-b border-white/15 tracking-wider"
                style={{
                  fontFamily: titleCss.fontFamily,
                  fontStyle: titleCss.fontStyle,
                  textDecoration: titleCss.textDecoration,
                  fontSize: slide.titleStyle?.fontSize ? titleCss.fontSize : '12.5px',
                  lineHeight: titleCss.lineHeight,
                  color: titleCss.color || undefined
                }}>{right.label || '항목 B'}</p>
              <div className="space-y-2 flex-1 flex flex-col justify-center">
                {right.items.map((item, i) => (
                  <p key={i} className="text-[11px] text-center leading-relaxed text-white/90"
                    style={{
                      fontFamily: bodyCss.fontFamily,
                      fontStyle: bodyCss.fontStyle,
                      textDecoration: bodyCss.textDecoration,
                      fontSize: slide.bodyStyle?.fontSize ? bodyCss.fontSize : '11px',
                      lineHeight: bodyCss.lineHeight,
                      color: bodyCss.color || undefined
                    }}>{item}</p>
                ))}
              </div>
            </div>
          </div>
          {extra.length > 0 && (
            <div className="mt-3 text-center">
              {extra.map((e, i) => (
                <p key={i} className="text-[11px] opacity-75" 
                  style={{
                    ...bodyCss,
                    fontSize: slide.bodyStyle?.fontSize ? bodyCss.fontSize : '11px'
                  }}>{e}</p>
              ))}
            </div>
          )}
        </div>
      )
    }

    case 'timeline-flow':
      return (
        <div 
          onClick={handleBgClick}
          className="w-full h-full p-6 flex flex-col justify-between select-none" 
          style={{ backgroundColor: bg }}
        >
          <p 
            onClick={(e) => { e.stopPropagation(); onElementClick?.('title') }}
            className={clickTargetClass('title')}
            style={titleCss}
          >
            {slide.title}
          </p>
          <div 
            onClick={(e) => { e.stopPropagation(); onElementClick?.('content') }}
            className={`flex-1 flex flex-col justify-center ${clickTargetClass('content')}`}
          >
            <div className="relative pl-6">
              <div className="absolute left-2.5 top-2 bottom-2 w-1 rounded-full" 
                style={{ background: `linear-gradient(180deg, ${accent}, ${primary})` }} />
              <div className="space-y-3.5">
                {slide.content.map((step, i) => {
                  const colonIdx = step.indexOf(':')
                  const stepLabel = colonIdx !== -1 ? step.slice(0, colonIdx).trim() : `Step ${i + 1}`
                  const stepContent = colonIdx !== -1 ? step.slice(colonIdx + 1).trim() : step
                  return (
                    <div key={i} className="flex gap-4 items-center relative">
                      <div className="absolute left-[-26px] w-4.5 h-4.5 rounded-full text-white flex items-center justify-center text-[9px] font-extrabold shadow-sm border-2 border-white" style={{ backgroundColor: primary }}>
                        {i + 1}
                      </div>
                      <div className="flex-1 rounded-xl px-4 py-2 border border-[#e4e2dd]/40 shadow-sm transition-all hover:translate-x-1 duration-200 bg-white/40" style={{ backgroundColor: `${accent}09` }}>
                        <p className="text-[11.5px] font-extrabold" 
                          style={{
                            color: titleCss.color || primary,
                            fontFamily: titleCss.fontFamily,
                            fontStyle: titleCss.fontStyle,
                            textDecoration: titleCss.textDecoration,
                            fontSize: slide.titleStyle?.fontSize ? titleCss.fontSize : '11.5px',
                            lineHeight: titleCss.lineHeight
                          }}>{stepLabel}</p>
                        {stepContent && stepContent !== stepLabel && (
                          <p 
                            className="text-[11px] mt-0.5 leading-relaxed opacity-85" 
                            style={{
                              ...bodyCss,
                              fontSize: slide.bodyStyle?.fontSize ? bodyCss.fontSize : '11px'
                            }}
                          >{stepContent}</p>
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
        <div 
          onClick={handleBgClick}
          className="w-full h-full flex flex-col items-center justify-center p-6 relative overflow-hidden select-none" 
          style={{ background: `linear-gradient(135deg, ${primary}05, ${accent}05)`, backgroundColor: bg }}>
          <p 
            onClick={(e) => { e.stopPropagation(); onElementClick?.('title') }}
            className={`mb-2 text-center opacity-85 text-[11px] font-bold uppercase tracking-wider ${clickTargetClass('title')}`}
            style={{
              ...titleCss,
              fontSize: slide.titleStyle?.fontSize ? titleCss.fontSize : '11px'
            }}
          >
            {slide.title}
          </p>
          <div 
            onClick={(e) => { e.stopPropagation(); onElementClick?.('content') }}
            className={`w-full flex flex-col items-center ${clickTargetClass('content')}`}
          >
            <div className="relative flex items-center justify-center my-1.5">
              {supporting.slice(0, 4).map((_, i) => {
                const angles = [315, 45, 225, 135]
                const angle = angles[i] || (i * 90)
                return (
                  <div
                    key={i}
                    className="absolute w-20 h-0.5 origin-left"
                    style={{ transform: `rotate(${angle}deg) translateX(46px)`, backgroundColor: `${accent}35` }}
                  />
                )
              })}
              <div className="w-24 h-24 rounded-full flex items-center justify-center shadow-lg z-10 border border-white/20 p-2.5 relative overflow-hidden" 
                style={{ background: `linear-gradient(135deg, ${primary}, ${primary}dd)` }}>
                {/* 내부 미적 광원 */}
                <div className="absolute -top-6 -left-6 w-12 h-12 bg-white/15 rounded-full blur-md" />
                <p className="text-white font-extrabold text-center text-[12px] leading-tight select-none z-10 drop-shadow-sm"
                  style={{
                    fontFamily: titleCss.fontFamily,
                    fontStyle: titleCss.fontStyle,
                    textDecoration: titleCss.textDecoration,
                    fontSize: slide.titleStyle?.fontSize ? titleCss.fontSize : '12px',
                    lineHeight: titleCss.lineHeight,
                    color: titleCss.color || undefined
                  }}>{keyword}</p>
              </div>
            </div>
            {supporting.length > 0 && (
              <div className="mt-5 grid grid-cols-2 gap-2 w-full max-w-sm">
                {supporting.slice(0, 4).map((s, i) => (
                  <div key={i} className="rounded-xl p-2.5 shadow-sm text-center border bg-white/90 backdrop-blur-sm" style={{ borderColor: `${accent}20` }}>
                    <p 
                      className="text-[10.5px] leading-relaxed font-medium" 
                      style={{
                        ...bodyCss,
                        fontSize: slide.bodyStyle?.fontSize ? bodyCss.fontSize : '10.5px'
                      }}
                    >{s}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )
    }

    case 'grid-matrix': {
      const cols = slide.columnCount || (slide.content.length <= 4 ? 2 : 3)
      const isDark = slide.darkMode || false
      const cardVariants = isDark
        ? [
            { bg: `${accent}25`, border: `${accent}40` },
            { bg: `rgba(255, 255, 255, 0.1)`, border: `rgba(255, 255, 255, 0.2)` },
            { bg: `${accent}15`, border: `${accent}30` },
            { bg: `rgba(255, 255, 255, 0.15)`, border: `rgba(255, 255, 255, 0.25)` },
            { bg: `${accent}30`, border: `${accent}45` },
            { bg: `rgba(255, 255, 255, 0.08)`, border: `rgba(255, 255, 255, 0.18)` },
          ]
        : [
            { bg: `${accent}09`, border: `${accent}20` },
            { bg: `${primary}06`, border: `${primary}18` },
            { bg: `${accent}06`, border: `${accent}15` },
            { bg: `${primary}09`, border: `${primary}20` },
            { bg: `${accent}12`, border: `${accent}25` },
            { bg: `${primary}04`, border: `${primary}12` },
          ]
      return (
        <div 
          onClick={handleBgClick}
          className="w-full h-full p-6 flex flex-col justify-between animate-fadeIn select-none" 
          style={{ backgroundColor: bg }}
        >
          <p 
            onClick={(e) => { e.stopPropagation(); onElementClick?.('title') }}
            className={clickTargetClass('title')}
            style={titleCss}
          >
            {slide.title}
          </p>
          <div 
            onClick={(e) => { e.stopPropagation(); onElementClick?.('content') }}
            className={`flex-1 grid gap-2.5 ${clickTargetClass('content')}`}
            style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
          >
            {slide.content.map((item, i) => {
              const colonIdx = item.indexOf(':')
              const label = colonIdx !== -1 ? item.slice(0, colonIdx).trim() : item
              const desc = colonIdx !== -1 ? item.slice(colonIdx + 1).trim() : ''
              const v = cardVariants[i % cardVariants.length]
              return (
                <div key={i} className="rounded-xl p-3 flex flex-col justify-center border shadow-sm transition-all duration-200 hover:-translate-y-0.5" 
                  style={{ backgroundColor: v.bg, borderColor: v.border }}>
                  <p className="text-[11.5px] font-extrabold text-center leading-tight" 
                    style={{
                      color: isDark ? '#FFFFFF' : (titleCss.color || primary),
                      fontFamily: titleCss.fontFamily,
                      fontStyle: titleCss.fontStyle,
                      textDecoration: titleCss.textDecoration,
                      fontSize: slide.titleStyle?.fontSize ? titleCss.fontSize : '11.5px',
                      lineHeight: titleCss.lineHeight
                    }}>{label}</p>
                  {desc && (
                    <p className="text-[9.5px] text-center mt-1.5 leading-relaxed" 
                      style={{ 
                        ...bodyCss, 
                        color: isDark ? '#E2E8F0' : (bodyCss.color || '#666666'),
                        fontSize: slide.bodyStyle?.fontSize ? bodyCss.fontSize : '9.5px'
                      }}>{desc}</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )
    }

    default:
      return (
        <div 
          onClick={handleBgClick}
          className="w-full h-full flex flex-col items-center justify-center p-8 select-none" 
          style={{ backgroundColor: bg }}
        >
          <p style={titleCss}>{slide.title}</p>
        </div>
      )
  }
}

// ── 스마트 레이아웃 에디터 (Smart Content Editor Helper) ──
function SmartContentEditor({
  slide,
  onChange,
}: {
  slide: PptSlide
  onChange: (updated: PptSlide) => void
}) {
  const layout = slide.layout || 'bullets'

  // 대조/비교 (vs-contrast) 파서 & 핸들러
  const handleVsContrastChange = (side: 'left' | 'right', field: 'label' | 'items', val: string) => {
    const content = [...slide.content]
    const leftRaw = content[0] || ''
    const rightRaw = content[1] || ''
    const extra = content.slice(2)

    const parseSide = (raw: string) => {
      const colonIdx = raw.indexOf(':')
      if (colonIdx === -1) return { label: raw, items: [] }
      return {
        label: raw.slice(0, colonIdx).trim(),
        items: raw.slice(colonIdx + 1).split('|').map(x => x.trim()).filter(Boolean)
      }
    }

    const left = parseSide(leftRaw)
    const right = parseSide(rightRaw)

    if (side === 'left') {
      if (field === 'label') left.label = val
      else left.items = val.split('\n').filter(Boolean)
    } else {
      if (field === 'label') right.label = val
      else right.items = val.split('\n').filter(Boolean)
    }

    content[0] = `${left.label} : ${left.items.join(' | ')}`
    content[1] = `${right.label} : ${right.items.join(' | ')}`
    onChange({ ...slide, content })
  }

  // 타임라인 (timeline-flow) 파서 & 핸들러
  const handleTimelineChange = (idx: number, field: 'label' | 'desc', val: string) => {
    const content = [...slide.content]
    const step = content[idx] || ''
    const colonIdx = step.indexOf(':')
    let label = colonIdx !== -1 ? step.slice(0, colonIdx).trim() : step
    let desc = colonIdx !== -1 ? step.slice(colonIdx + 1).trim() : ''

    if (field === 'label') label = val
    else desc = val

    content[idx] = `${label} : ${desc}`
    onChange({ ...slide, content })
  }

  // 그리드 매트릭스 (grid-matrix) 파서 & 핸들러
  const handleGridChange = (idx: number, field: 'label' | 'desc', val: string) => {
    const content = [...slide.content]
    const item = content[idx] || ''
    const colonIdx = item.indexOf(':')
    let label = colonIdx !== -1 ? item.slice(0, colonIdx).trim() : item
    let desc = colonIdx !== -1 ? item.slice(colonIdx + 1).trim() : ''

    if (field === 'label') label = val
    else desc = val

    content[idx] = `${label} : ${desc}`
    onChange({ ...slide, content })
  }

  switch (layout) {
    case 'vs-contrast': {
      const leftRaw = slide.content[0] || ''
      const rightRaw = slide.content[1] || ''
      
      const parseSide = (raw: string) => {
        const colonIdx = raw.indexOf(':')
        if (colonIdx === -1) return { label: raw, items: [] }
        return {
          label: raw.slice(0, colonIdx).trim(),
          items: raw.slice(colonIdx + 1).split('|').map(x => x.trim()).filter(Boolean)
        }
      }
      
      const left = parseSide(leftRaw)
      const right = parseSide(rightRaw)
      const extra = slide.content.slice(2)

      return (
        <div className="space-y-4 text-left">
          <div className="p-3 bg-[#f5f0ff]/60 rounded-xl border border-[#e4d8ff] space-y-3 shadow-sm">
            <h4 className="text-[11.5px] font-bold text-[#5B35A0] flex items-center gap-1">◀ 왼쪽 비교군</h4>
            <div>
              <label className="text-[10px] text-[#8a8580] block mb-1">영역 제목 (예: 육신의 생각)</label>
              <input
                type="text"
                value={left.label}
                onChange={(e) => handleVsContrastChange('left', 'label', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#e4e2dd] text-[12px] bg-white focus:outline-none focus:border-[#8d7a5b]"
              />
            </div>
            <div>
              <label className="text-[10px] text-[#8a8580] block mb-1">상세 항목들 (한 줄에 하나씩 입력)</label>
              <textarea
                rows={3}
                value={left.items.join('\n')}
                onChange={(e) => handleVsContrastChange('left', 'items', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#e4e2dd] text-[12px] bg-white resize-none leading-relaxed focus:outline-none focus:border-[#8d7a5b]"
                placeholder="항목1&#10;항목2"
              />
            </div>
          </div>

          <div className="p-3 bg-[#fffbf5]/60 rounded-xl border border-[#e4d8c6] space-y-3 shadow-sm">
            <h4 className="text-[11.5px] font-bold text-[#8d7a5b] flex items-center gap-1">▶ 오른쪽 비교군</h4>
            <div>
              <label className="text-[10px] text-[#8a8580] block mb-1">영역 제목 (예: 영의 생각)</label>
              <input
                type="text"
                value={right.label}
                onChange={(e) => handleVsContrastChange('right', 'label', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#e4e2dd] text-[12px] bg-white focus:outline-none focus:border-[#8d7a5b]"
              />
            </div>
            <div>
              <label className="text-[10px] text-[#8a8580] block mb-1">상세 항목들 (한 줄에 하나씩 입력)</label>
              <textarea
                rows={3}
                value={right.items.join('\n')}
                onChange={(e) => handleVsContrastChange('right', 'items', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#e4e2dd] text-[12px] bg-white resize-none leading-relaxed focus:outline-none focus:border-[#8d7a5b]"
                placeholder="항목1&#10;항목2"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-[#8a8580] block mb-1">하단 보조 메시지 (선택 사항)</label>
            <input
              type="text"
              value={extra[0] || ''}
              onChange={(e) => {
                const content = [...slide.content]
                content[2] = e.target.value
                onChange({ ...slide, content })
              }}
              className="w-full px-3 py-2 rounded-lg border border-[#e4e2dd] text-[12px] bg-white focus:outline-none focus:border-[#8d7a5b]"
              placeholder="예: 하나님과의 관계성 비교"
            />
          </div>
        </div>
      )
    }
    case 'timeline-flow': {
      return (
        <div className="space-y-3.5 text-left">
          <p className="text-[10.5px] text-[#8a8580] leading-relaxed">흐름에 맞게 단계별 제목과 상세 설명을 채워주세요.</p>
          {slide.content.map((step, idx) => {
            const colonIdx = step.indexOf(':')
            const stepLabel = colonIdx !== -1 ? step.slice(0, colonIdx).trim() : step
            const stepContent = colonIdx !== -1 ? step.slice(colonIdx + 1).trim() : ''

            return (
              <div key={idx} className="p-3 bg-[#f5f4f0] rounded-xl border border-[#e4e2dd] space-y-2 relative shadow-sm">
                <span className="absolute right-2 top-2 text-[9.5px] font-black bg-[#8d7a5b]/10 text-[#8d7a5b] px-2 py-0.5 rounded-full">단계 {idx + 1}</span>
                <div>
                  <label className="text-[10px] text-[#8a8580] block mb-0.5">단계 이름</label>
                  <input
                    type="text"
                    value={stepLabel}
                    onChange={(e) => handleTimelineChange(idx, 'label', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#e4e2dd] text-[12px] bg-white focus:outline-none focus:border-[#8d7a5b]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#8a8580] block mb-0.5">설명글</label>
                  <input
                    type="text"
                    value={stepContent}
                    onChange={(e) => handleTimelineChange(idx, 'desc', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#e4e2dd] text-[12px] bg-white focus:outline-none focus:border-[#8d7a5b]"
                  />
                </div>
                <div className="text-right">
                  <button
                    onClick={() => {
                      const next = slide.content.filter((_, i) => i !== idx)
                      onChange({ ...slide, content: next })
                    }}
                    className="text-[10.5px] text-red-500 hover:text-red-700 hover:underline font-bold transition-all"
                  >
                    이 단계 삭제
                  </button>
                </div>
              </div>
            )
          })}
          <button
            onClick={() => {
              onChange({
                ...slide,
                content: [...slide.content, '새 단계 : 새로운 흐름 설명'],
              })
            }}
            className="flex items-center gap-1.5 text-[11.5px] text-[#8d7a5b] font-bold hover:text-[#7a694e] mt-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> 새 단계 추가
          </button>
        </div>
      )
    }
    case 'grid-matrix': {
      return (
        <div className="space-y-3.5 text-left">
          <p className="text-[10.5px] text-[#8a8580] leading-relaxed">각 카드에 표시할 제목과 보조 설명을 입력하세요 (최대 6개).</p>
          {slide.content.map((item, idx) => {
            const colonIdx = item.indexOf(':')
            const label = colonIdx !== -1 ? item.slice(0, colonIdx).trim() : item
            const desc = colonIdx !== -1 ? item.slice(colonIdx + 1).trim() : ''

            return (
              <div key={idx} className="p-3 bg-[#f5f4f0] rounded-xl border border-[#e4e2dd] space-y-2 relative shadow-sm">
                <span className="absolute right-2 top-2 text-[9.5px] font-black bg-[#8d7a5b]/10 text-[#8d7a5b] px-2 py-0.5 rounded-full">그리드 {idx + 1}</span>
                <div>
                  <label className="text-[10px] text-[#8a8580] block mb-0.5">카드 제목</label>
                  <input
                    type="text"
                    value={label}
                    onChange={(e) => handleGridChange(idx, 'label', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#e4e2dd] text-[12px] bg-white focus:outline-none focus:border-[#8d7a5b]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#8a8580] block mb-0.5">상세 설명</label>
                  <input
                    type="text"
                    value={desc}
                    onChange={(e) => handleGridChange(idx, 'desc', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#e4e2dd] text-[12px] bg-white focus:outline-none focus:border-[#8d7a5b]"
                  />
                </div>
                <div className="text-right">
                  <button
                    onClick={() => {
                      const next = slide.content.filter((_, i) => i !== idx)
                      onChange({ ...slide, content: next })
                    }}
                    className="text-[10.5px] text-red-500 hover:text-red-700 hover:underline font-bold transition-all"
                  >
                    그리드 카드 삭제
                  </button>
                </div>
              </div>
            )
          })}
          {slide.content.length < 6 && (
            <button
              onClick={() => {
                onChange({
                  ...slide,
                  content: [...slide.content, '그리드 제목 : 설명 추가'],
                })
              }}
              className="flex items-center gap-1.5 text-[11.5px] text-[#8d7a5b] font-bold hover:text-[#7a694e] mt-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> 그리드 카드 추가
            </button>
          )}
        </div>
      )
    }
    case 'central-focus': {
      const keyword = slide.content[0] || ''
      const supporting = slide.content.slice(1)
      return (
        <div className="space-y-4 text-left">
          <div className="p-3 bg-[#e8f0fe] rounded-xl border border-[#cce0ff] space-y-2 shadow-sm">
            <h4 className="text-[11.5px] font-bold text-[#1B3A5C] flex items-center gap-1">🌟 중앙 핵심 키워드</h4>
            <input
              type="text"
              value={keyword}
              onChange={(e) => {
                const content = [...slide.content]
                content[0] = e.target.value
                onChange({ ...slide, content })
              }}
              className="w-full px-3 py-2 rounded-lg border border-[#cbd5e1] text-[12.5px] bg-white font-bold focus:outline-none focus:border-[#1B3A5C]"
            />
          </div>

          <div className="space-y-3.5">
            <h4 className="text-[11.5px] font-bold text-[#6b6764]">✦ 주변 지지 설명 (최대 4개)</h4>
            {supporting.map((text, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <span className="text-[12px] font-bold text-[#8d7a5b] w-4 text-right">{idx + 1}.</span>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => {
                    const content = [...slide.content]
                    content[idx + 1] = e.target.value
                    onChange({ ...slide, content })
                  }}
                  className="flex-1 px-3 py-2 rounded-lg border border-[#e4e2dd] text-[12px] bg-white focus:outline-none focus:border-[#8d7a5b]"
                />
                <button
                  onClick={() => {
                    const content = slide.content.filter((_, i) => i !== idx + 1)
                    onChange({ ...slide, content })
                  }}
                  className="p-2 text-[#a09b96] hover:text-red-500 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {supporting.length < 4 && (
              <button
                onClick={() => {
                  onChange({
                    ...slide,
                    content: [...slide.content, '지지하는 상세 메시지'],
                  })
                }}
                className="flex items-center gap-1.5 text-[11.5px] text-[#8d7a5b] font-bold hover:text-[#7a694e] pl-6 mt-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> 설명 항목 추가
              </button>
            )}
          </div>
        </div>
      )
    }
    case 'quote': {
      const source = slide.title
      const text = slide.content.join('\n\n')
      return (
        <div className="space-y-3.5 text-left">
          <div>
            <label className="text-[10.5px] font-bold text-[#6b6764] block mb-1">인용구 출처 / 저자 (예: 창세기 1:1)</label>
            <input
              type="text"
              value={source}
              onChange={(e) => {
                onChange({ ...slide, title: e.target.value })
              }}
              className="w-full px-3 py-2 rounded-xl border border-[#e4e2dd] text-[12px] text-[#2c2a29] bg-white focus:outline-none focus:border-[#8d7a5b] transition-all"
            />
          </div>
          <div>
            <label className="text-[10.5px] font-bold text-[#6b6764] block mb-1">본문 내용 (줄바꿈 두 번으로 문단 구분)</label>
            <textarea
              rows={5}
              value={text}
              onChange={(e) => {
                onChange({ ...slide, content: e.target.value.split('\n\n') })
              }}
              className="w-full px-3 py-2 rounded-xl border border-[#e4e2dd] text-[12px] text-[#2c2a29] bg-white focus:outline-none focus:border-[#8d7a5b] transition-all resize-none leading-relaxed"
              placeholder="인용할 텍스트를 적어보세요."
            />
          </div>
        </div>
      )
    }
    default: {
      return (
        <div className="space-y-2.5 text-left">
          {slide.content.map((item, idx) => (
            <div key={idx} className="flex gap-1.5 items-center">
              <input
                type="text"
                value={item}
                onChange={(e) => {
                  const next = [...slide.content]
                  next[idx] = e.target.value
                  onChange({ ...slide, content: next })
                }}
                className="flex-1 px-3 py-2 rounded-xl border border-[#e4e2dd] text-[12px] text-[#2c2a29] bg-white focus:outline-none focus:border-[#8d7a5b] transition-all"
              />
              <button
                onClick={() => {
                  const next = slide.content.filter((_, i) => i !== idx)
                  onChange({ ...slide, content: next })
                }}
                className="p-2 rounded-xl text-[#a09b96] hover:text-red-500 hover:bg-red-50 transition-all shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          <button
            onClick={() => {
              onChange({
                ...slide,
                content: [...slide.content, ''],
              })
            }}
            className="flex items-center gap-1.5 text-[11.5px] text-[#8d7a5b] font-bold hover:text-[#7a694e] mt-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> 항목 추가
          </button>
        </div>
      )
    }
  }
}
