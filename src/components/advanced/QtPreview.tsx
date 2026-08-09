'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { X, FileDown, Loader2, ChevronLeft, ChevronRight, Grid3X3, Sparkles, BookOpen, Layers, Maximize2, ZoomIn, ZoomOut, Check, Eye, LayoutGrid, FileText } from 'lucide-react'
import { generateQtPdf } from '@/lib/qtPdfGen'
import { PAGE_SIZES } from '@/lib/qtPdfSizes'
import { QT_TEMPLATES } from '@/lib/qtTemplates'
import QtPdfLayout from '@/components/advanced/QtPdfLayout'
import { parseDays } from '@/lib/qtDayParser'
import { getFormattedDateList, getWeekdayDateLabels, getWeekdayCountInMonth, computeStartDateForWeek } from '@/lib/qtDates'
import type { QTFormData, QTResult } from './QtGenerator'

interface QtPreviewProps {
  form: QTFormData
  result: QTResult
  templateId: string
  onClose: () => void
}

export default function QtPreview({ form, result, templateId: initialTemplateId, onClose }: QtPreviewProps) {
  const [previewSizeOption, setPreviewSizeOption] = useState(form.sizeOption || 'A4Landscape')
  const [templateId, setTemplateId] = useState(initialTemplateId || 'publication-2a')
  const [mode, setMode] = useState<'gallery' | 'reader'>('gallery')
  const [activePage, setActivePage] = useState(0)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [zoomScale, setZoomScale] = useState(1.0)
  const pdfLayoutRef = useRef<HTMLDivElement>(null)

  const activeTmpl = useMemo(() => {
    return QT_TEMPLATES.find(t => t.id === templateId) || QT_TEMPLATES[0]
  }, [templateId])

  const parsedDays = useMemo(() => {
    try {
      const { days } = parseDays(result.fullManuscript || '')
      return days
    } catch {
      return []
    }
  }, [result.fullManuscript])

  const effectiveStartDate = useMemo(() => {
    const y = form.targetYear || (form.startDate ? parseInt(form.startDate.split('-')[0], 10) : 2026) || 2026
    const m = form.targetMonth || (form.startDate ? parseInt(form.startDate.split('-')[1], 10) : 9) || 9
    const w = form.weekNumber ? parseInt(String(form.weekNumber), 10) : 1

    if (form.startDate) {
      const parts = form.startDate.split('-')
      if (parts.length === 3 && parseInt(parts[2], 10) > 1) return form.startDate
    }

    if (w > 1) {
      return computeStartDateForWeek(y, m, w)
    }
    return form.startDate || `${y}-${String(m).padStart(2, '0')}-01`
  }, [form.targetYear, form.targetMonth, form.weekNumber, form.startDate])

  const weekdays = useMemo(() => {
    const dayCount = Math.max(parsedDays.length, 1)
    const sp = effectiveStartDate.split('-')
    const start = sp.length === 3 ? new Date(parseInt(sp[0], 10), parseInt(sp[1], 10) - 1, parseInt(sp[2], 10)) : new Date()
    const dayNames = ['일', '월', '화', '수', '목', '금', '토']
    const resultList: { date: Date; label: string }[] = []

    let cur = new Date(start)
    while (resultList.length < Math.max(dayCount, 6)) {
      if (cur.getDay() !== 0) {
        const m = cur.getMonth() + 1
        const d = cur.getDate()
        const label = `${m}/${d} (${dayNames[cur.getDay()]})`
        resultList.push({ date: new Date(cur), label })
      }
      cur.setDate(cur.getDate() + 1)
    }
    return resultList
  }, [effectiveStartDate, parsedDays.length])

  const pages = [
    { type: 'cover', label: 'COVER', subtitle: `${form.bibleBook} · 제${form.weekNumber || 1}주 표지`, passage: '북커버 / 월간 타이틀' },
    ...weekdays.map((day, i) => ({
      type: 'day',
      label: `DAY ${i + 1}`,
      subtitle: day.label,
      passage: parsedDays[i]?.title || `${form.bibleBook} ${i + 1}일차 원고`,
    })),
  ]

  const handleDownloadPdf = async () => {
    setPdfLoading(true)
    await new Promise(r => setTimeout(r, 100))
    try {
      if (pdfLayoutRef.current) {
        await generateQtPdf(pdfLayoutRef.current, form, result, previewSizeOption, templateId)
      }
    } catch (e: any) {
      console.error('PDF 생성 실패:', e)
    }
    setPdfLoading(false)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (mode === 'reader') {
        if (e.key === 'ArrowLeft') setActivePage(p => Math.max(0, p - 1))
        if (e.key === 'ArrowRight') setActivePage(p => Math.min(pages.length - 1, p + 1))
      }
      if (e.key === 'Escape') {
        if (mode === 'reader') setMode('gallery')
        else onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mode, pages.length, onClose])

  return (
    <div className="fixed inset-0 z-[100] bg-[#020512]/98 backdrop-blur-2xl flex flex-col font-sans text-slate-100 select-none animate-in fade-in duration-200">
      {/* ===== Header Controls Bar ===== */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-[#070b1e]/90 backdrop-blur-xl shrink-0 shadow-[0_8px_32px_rgba(0,0,0,0.5)] z-30 gap-4">
        {/* Left Title & Status Badge */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-amber-500 p-0.5 shadow-lg shadow-indigo-500/30">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4.5 h-4.5 text-amber-300 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold text-white tracking-wide">QT 실물 인쇄 스튜디오</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                HD PDF Inspector
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              {form.bibleBook} · 제{form.weekNumber || 1}주차 인쇄 미리보기 ({pages.length}페이지)
            </p>
          </div>
        </div>

        {/* Center: Controls (Size Selector, Template Swatches, Mode Toggle) */}
        <div className="flex items-center gap-3 justify-center flex-1">
          {/* View Mode Switcher */}
          <div className="flex items-center p-1 bg-slate-950/80 rounded-2xl border border-white/10 shadow-inner">
            <button
              onClick={() => setMode('gallery')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                mode === 'gallery'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/40 ring-1 ring-white/30 font-extrabold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              <span>전체 조감도 (갤러리)</span>
            </button>
            <button
              onClick={() => setMode('reader')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                mode === 'reader'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/40 ring-1 ring-white/30 font-extrabold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>페이지 상세 보기</span>
            </button>
          </div>

          <div className="w-px h-5 bg-white/10 mx-1" />

          {/* Size Select Dropdown */}
          <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1 rounded-2xl border border-white/10">
            <Layers className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <select
              value={previewSizeOption}
              onChange={e => setPreviewSizeOption(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-200 outline-none cursor-pointer pr-1"
            >
              {Object.keys(PAGE_SIZES).map(s => (
                <option key={s} value={s} className="bg-slate-900 text-slate-200 font-sans">
                  {PAGE_SIZES[s].label}
                </option>
              ))}
            </select>
          </div>

          <div className="w-px h-5 bg-white/10 mx-1" />

          {/* Template Color Swatch Bar */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-2xl border border-white/10">
            {QT_TEMPLATES.map(t => {
              const active = templateId === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => setTemplateId(t.id)}
                  className={`relative w-7 h-7 rounded-xl border transition-all flex items-center justify-center ${
                    active
                      ? 'border-indigo-400 ring-2 ring-indigo-500/50 scale-110 shadow-md shadow-indigo-500/30'
                      : 'border-white/10 hover:border-white/30 hover:scale-105 opacity-70 hover:opacity-100'
                  }`}
                  style={{ background: t.pageBg }}
                  title={`${t.name} (${t.nameEn}): ${t.description}`}
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full border border-black/40 shadow-xs"
                    style={{ background: t.accent }}
                  />
                  {active && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[8px] font-extrabold shadow-sm">
                      ✓
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Right Download & Close Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleDownloadPdf}
            disabled={pdfLoading}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white text-xs font-extrabold transition-all shadow-lg shadow-indigo-600/30 border border-amber-300/40 disabled:opacity-40 whitespace-nowrap active:scale-95"
          >
            {pdfLoading ? <Loader2 className="w-4 h-4 animate-spin text-amber-300" /> : <FileDown className="w-4 h-4 text-amber-300 animate-bounce" />}
            <span>{pdfLoading ? 'PDF 생성 중...' : '📖 HD PDF 저장'}</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white border border-white/10 transition-colors active:scale-95"
            title="닫기 (Esc)"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>
      </header>

      {/* ===== Main Stage Content Area ===== */}
      <div className="flex-1 overflow-hidden relative">
        {mode === 'gallery' ? (
          /* ===== GALLERY MODE: 3D Sheet Grid Overview ===== */
          <div className="h-full overflow-y-auto p-8 scrollbar-thin">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-200 flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4 text-indigo-400" />
                    <span>전체 페이지 실물 조감도</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">각 카드를 클릭하시면 고해상도 페이지 인스펙터로 즉시 이동합니다.</p>
                </div>
                <span className="text-xs font-mono text-indigo-300 bg-indigo-500/10 border border-indigo-400/20 px-3 py-1 rounded-full font-bold">
                  총 {pages.length}개 페이지 수록
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {pages.map((page, idx) => {
                  const isCover = page.type === 'cover'
                  return (
                    <button
                      key={idx}
                      onClick={() => { setActivePage(idx); setMode('reader') }}
                      className="group relative bg-[#070b1e]/80 border border-white/10 hover:border-indigo-400/60 rounded-2xl p-4 text-left transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(79,70,229,0.3)] flex flex-col justify-between h-[230px] overflow-hidden backdrop-blur-md ring-1 ring-white/5"
                    >
                      {/* Top Badges */}
                      <div className="flex items-center justify-between w-full mb-2">
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border shadow-sm ${
                          isCover
                            ? 'bg-gradient-to-r from-amber-500/20 to-indigo-500/20 text-amber-300 border-amber-400/40'
                            : 'bg-indigo-500/20 text-indigo-200 border-indigo-400/30'
                        }`}>
                          {page.label}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 font-bold">
                          {idx + 1} / {pages.length}
                        </span>
                      </div>

                      {/* Middle Mini Paper Mockup Frame */}
                      <div className="my-2 flex-1 rounded-xl bg-slate-950/70 border border-white/10 p-2.5 flex flex-col justify-center items-center group-hover:border-indigo-400/40 transition-colors relative overflow-hidden">
                        <div 
                          className="w-full h-full rounded-lg flex flex-col p-2 justify-center items-center transition-transform group-hover:scale-105"
                          style={{ background: activeTmpl.pageBg, color: activeTmpl.textColor }}
                        >
                          <div className="text-[11px] font-extrabold text-center leading-tight truncate w-full">
                            {page.subtitle}
                          </div>
                          <div className="text-[9px] opacity-70 text-center truncate w-full mt-1 font-medium">
                            {page.passage}
                          </div>
                        </div>

                        {/* Hover Overlay Icon */}
                        <div className="absolute inset-0 bg-indigo-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                          <span className="flex items-center gap-1.5 text-xs font-bold text-white bg-indigo-600 px-3 py-1.5 rounded-xl shadow-lg border border-indigo-400/50">
                            <Eye className="w-3.5 h-3.5" />
                            상세 보기
                          </span>
                        </div>
                      </div>

                      {/* Bottom Label */}
                      <div className="pt-1 flex items-center justify-between text-[11px] font-bold text-slate-300">
                        <span className="truncate">{page.subtitle}</span>
                        <span className="text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        ) : (
          /* ===== READER MODE: Page Inspector Stage with Floating Controls ===== */
          <div className="h-full flex flex-col justify-between items-center p-6 relative bg-gradient-to-b from-[#020512] via-[#080d24] to-[#020512]">
            {/* Ambient Backlight Aura */}
            <div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full blur-[150px] opacity-20 pointer-events-none transition-all duration-700"
              style={{ background: activeTmpl.accent || '#6366f1' }}
            />

            {/* Main Single Page Stage */}
            <div className="w-full flex-1 flex justify-center items-center overflow-auto scrollbar-thin">
              <div 
                className="transition-all duration-300 flex justify-center items-center my-auto"
                style={{
                  transform: `scale(${zoomScale})`,
                  transformOrigin: 'center center',
                }}
              >
                <div className="preview-reader-single rounded-2xl border border-white/20 shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden bg-slate-950/80 p-1 flex items-center justify-center backdrop-blur-md ring-1 ring-white/10 max-h-[76vh]">
                  <style>{`
                    .preview-reader-single .qt-page {
                      display: none !important;
                    }
                    .preview-reader-single .qt-page:nth-child(${activePage + 2}) {
                      display: block !important;
                    }
                  `}</style>
                  <QtPdfLayout
                    form={form}
                    result={result}
                    sizeOption={previewSizeOption}
                    templateId={templateId}
                  />
                </div>
              </div>
            </div>

            {/* Bottom Floating Control Dock */}
            <div className="sticky bottom-2 z-30 flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-[#090e26]/95 border border-white/15 shadow-[0_15px_50px_rgba(0,0,0,0.7)] backdrop-blur-2xl ring-1 ring-white/10">
              {/* Prev Page */}
              <button
                onClick={() => setActivePage(Math.max(0, activePage - 1))}
                disabled={activePage === 0}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-all disabled:opacity-20 active:scale-95"
                title="이전 페이지 (좌측 화살표)"
              >
                <ChevronLeft className="w-4.5 h-4.5" />
              </button>

              {/* Page Status */}
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-200">
                <span className="text-indigo-400 font-extrabold">{pages[activePage]?.label}</span>
                <span className="text-slate-500">·</span>
                <span>{activePage + 1} / {pages.length}</span>
              </div>

              {/* Next Page */}
              <button
                onClick={() => setActivePage(Math.min(pages.length - 1, activePage + 1))}
                disabled={activePage >= pages.length - 1}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-all disabled:opacity-20 active:scale-95"
                title="다음 페이지 (우측 화살표)"
              >
                <ChevronRight className="w-4 h-4.5" />
              </button>

              <div className="w-px h-4 bg-white/15 mx-1" />

              {/* Zoom Controls */}
              <button
                onClick={() => setZoomScale(prev => Math.max(0.7, prev - 0.1))}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-all active:scale-95"
                title="축소"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setZoomScale(1.0)}
                className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/15 text-[11px] font-mono font-bold text-slate-300 hover:text-white transition-all"
                title="100% 확대율"
              >
                {Math.round(zoomScale * 100)}%
              </button>

              <button
                onClick={() => setZoomScale(prev => Math.min(1.4, prev + 0.1))}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-all active:scale-95"
                title="확대"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>

              <div className="w-px h-4 bg-white/15 mx-1" />

              {/* Gallery View Switcher Button */}
              <button
                onClick={() => setMode('gallery')}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-400/40 text-indigo-200 text-xs font-bold transition-all shadow-sm active:scale-95"
                title="조감도 목록으로 돌아가기"
              >
                <Grid3X3 className="w-3.5 h-3.5 text-indigo-300" />
                <span>조감도 목록</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Hidden PDF Generation Off-Screen Layout */}
      <div className="absolute opacity-0 pointer-events-none" style={{ left: -9999 }}>
        <QtPdfLayout
          ref={pdfLayoutRef}
          form={form}
          result={result}
          sizeOption={previewSizeOption}
          templateId={templateId}
        />
      </div>
    </div>
  )
}