'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { X, FileDown, Loader2, ChevronLeft, ChevronRight, Grid3X3 } from 'lucide-react'
import { generateQtPdf } from '@/lib/qtPdfGen'
import { PAGE_SIZES } from '@/lib/qtPdfSizes'
import { QT_TEMPLATES } from '@/lib/qtTemplates'
import QtPdfLayout from '@/components/advanced/QtPdfLayout'
import { parseDays } from '@/lib/qtDayParser'
import { getFormattedDateList, getWeekdayDateLabels, getWeekdayCountInMonth } from '@/lib/qtDates'
import type { QTFormData, QTResult } from './QtGenerator'

interface QtPreviewProps {
  form: QTFormData
  result: QTResult
  templateId: string
  onClose: () => void
}

export default function QtPreview({ form, result, templateId: initialTemplateId, onClose }: QtPreviewProps) {
  const [previewSizeOption, setPreviewSizeOption] = useState(form.sizeOption)
  const [templateId, setTemplateId] = useState(initialTemplateId)
  const [mode, setMode] = useState<'gallery' | 'reader'>('gallery')
  const [activePage, setActivePage] = useState(0)
  const [pdfLoading, setPdfLoading] = useState(false)
  const pdfLayoutRef = useRef<HTMLDivElement>(null)

  const parsedDays = useMemo(() => {
    try {
      const { days } = parseDays(result.fullManuscript || '')
      return days
    } catch {
      return []
    }
  }, [result.fullManuscript])

  const weekdays = useMemo(() => {
    const dayCount = Math.max(parsedDays.length, 1)
    if (!form.startDate) {
      const today = new Date()
      const dayNames = ['일', '월', '화', '수', '목', '금', '토']
      return Array.from({ length: Math.max(dayCount, 7) }, (_, i) => {
        const mon = new Date(today)
        mon.setDate(mon.getDate() - mon.getDay() + 1)
        const day = new Date(mon)
        day.setDate(mon.getDate() + i)
        return { date: day, label: `${day.getMonth() + 1}/${day.getDate()}(${dayNames[day.getDay()]})` }
      })
    }
    // 월~토(일요일 제외) 일수와 일치하면 주말 제외 모드
    if (dayCount === getWeekdayCountInMonth(form.startDate)) {
      const labels = getWeekdayDateLabels(form.startDate)
      return labels.map(label => ({ date: new Date(), label }))
    }
    const list = getFormattedDateList(form.startDate, dayCount)
    if (list.length > 0) return list.map(label => ({ date: new Date(), label }))
    return []
  }, [form.startDate, parsedDays.length])

  const pages = [
    { type: 'cover', label: 'COVER', subtitle: `${form.bibleBook} · 제${form.weekNumber}주`, passage: '' },
    ...weekdays.map((day, i) => ({
      type: 'day',
      label: `DAY ${i + 1}`,
      subtitle: day.label,
      passage: form.bibleBook,
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
    if (mode !== 'reader') return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setActivePage(p => Math.max(0, p - 1))
      if (e.key === 'ArrowRight') setActivePage(p => Math.min(pages.length - 1, p + 1))
      if (e.key === 'Escape') setMode('gallery')
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mode, pages.length])

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <select
            value={previewSizeOption}
            onChange={e => setPreviewSizeOption(e.target.value)}
            className="bg-[#0a0f1e] border border-white/10 rounded-xl px-4 py-2 text-[13px] text-slate-100 outline-none focus:ring-2 focus:ring-indigo-400/20 appearance-none cursor-pointer"
          >
            {Object.keys(PAGE_SIZES).map(s => (
              <option key={s} value={s}>{PAGE_SIZES[s].label}</option>
            ))}
          </select>
          <div className="w-px h-6 bg-white/10" />
          <div className="flex items-center gap-1.5">
            {QT_TEMPLATES.map(t => {
              const active = templateId === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => setTemplateId(t.id)}
                  className={`relative w-8 h-8 rounded-lg border transition-all ${
                    active
                      ? 'border-indigo-400/60 ring-1 ring-indigo-400/30 scale-110'
                      : 'border-white/10 hover:border-white/30 hover:scale-105'
                  }`}
                  style={{ background: t.pageBg }}
                  title={`${t.name} (${t.nameEn})`}
                >
                  <span
                    className="absolute inset-0 flex items-center justify-center text-[10px] font-bold"
                    style={{ color: t.textColor }}
                  >
                    {active ? '✓' : '●'}
                  </span>
                </button>
              )
            })}
          </div>
          <button
            onClick={handleDownloadPdf}
            disabled={pdfLoading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {pdfLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
            {pdfLoading ? '생성 중...' : 'PDF 다운로드'}
          </button>
        </div>
        <button onClick={onClose} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {mode === 'gallery' ? (
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {pages.map((page, idx) => (
              <button
                key={idx}
                onClick={() => { setActivePage(idx); setMode('reader') }}
                className="group bg-white/[0.03] border border-white/5 rounded-xl p-4 hover:bg-white/10 hover:border-white/20 transition-all text-left"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  <span className="text-[10px] font-bold text-slate-500">{page.type === 'cover' ? 'COVER' : `DAY ${idx}`}</span>
                </div>
                <div className="text-[12px] font-bold text-slate-200 mb-1">
                  {page.subtitle}
                </div>
                <div className="text-[9px] text-slate-500">
                  {page.passage}
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => setActivePage(Math.max(0, activePage - 1))}
              disabled={activePage === 0}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[12px] font-bold text-slate-300 min-w-[120px] text-center">
              {activePage === 0 ? 'COVER' : `DAY ${activePage}`} · {activePage + 1} / 8
            </span>
            <button
              onClick={() => setActivePage(Math.min(7, activePage + 1))}
              disabled={activePage === 7}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMode('gallery')}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
          </div>
          <div className="flex justify-center">
            <div className="preview-reader overflow-auto max-h-[75vh] border border-white/5 rounded-xl">
              <style>{`
                .preview-reader .qt-page {
                  display: none !important;
                }
                .preview-reader .qt-page:nth-child(${activePage + 2}) {
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
      )}

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