'use client'

import { useState, useMemo, useRef } from 'react'
import { ChevronLeft, ChevronRight, Download, Edit3, Loader2 } from 'lucide-react'
import QtDayCard from './QtDayCard'
import QtPdfLayout from './QtPdfLayout'
import { parseDays } from '@/lib/qtDayParser'
import { getTemplate, QT_TEMPLATES } from '@/lib/qtTemplates'
import { generateQtPdf } from '@/lib/qtPdfGen'
import type { QTFormData } from './QtGenerator'

interface QtReaderProps {
  form: QTFormData
  accumulatedManuscript: string
  templateId: string
  startPassage?: string
  endPassage?: string
  onBack: () => void
}

export default function QtReader({ form, accumulatedManuscript, templateId: initialTemplateId, startPassage, endPassage, onBack }: QtReaderProps) {
  const [dayIndex, setDayIndex] = useState(0)
  const [templateId, setTemplateId] = useState(initialTemplateId || 'qtland-classic')
  const [pdfLoading, setPdfLoading] = useState(false)
  const pdfLayoutRef = useRef<HTMLDivElement>(null)

  const weekdays = useMemo(() => {
    const today = new Date()
    const dayNames = ['일', '월', '화', '수', '목', '금', '토']
    const mon = new Date(today); mon.setDate(mon.getDate() - mon.getDay() + 1)
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(mon); d.setDate(mon.getDate() + i)
      return `${d.getMonth() + 1}/${d.getDate()}(${dayNames[d.getDay()]})`
    })
  }, [])

  const { days } = useMemo(() => parseDays(accumulatedManuscript), [accumulatedManuscript])
  const tmpl = useMemo(() => getTemplate(templateId), [templateId])
  const currentDay = days[dayIndex]

  const handlePdfDownload = async () => {
    setPdfLoading(true)
    // DOM이 완전히 렌더링될 시간 확보
    await new Promise(r => setTimeout(r, 500))
    try {
      if (pdfLayoutRef.current) {
        const result = { fullManuscript: accumulatedManuscript }
        await generateQtPdf(pdfLayoutRef.current, form, result, form.sizeOption || 'A4', templateId)
      } else {
        console.error('PDF layout ref is null')
      }
    } catch (e: any) {
      console.error('PDF generation error:', e)
      alert(`PDF 생성 중 오류가 발생했습니다: ${e.message || '알 수 없는 오류'}`)
    }
    setPdfLoading(false)
  }

  return (
    <div className="flex flex-col min-h-0 flex-1 h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-[#060a17] shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-[11px] font-bold transition-all"
          >
            <Edit3 className="w-3.5 h-3.5" />
            편집
          </button>
          <div className="w-px h-5 bg-white/10" />
          <div className="flex items-center gap-1.5">
            {QT_TEMPLATES.map(t => (
              <button
                key={t.id}
                onClick={() => setTemplateId(t.id)}
                className={`w-7 h-7 rounded-lg border transition-all ${
                  templateId === t.id
                    ? 'border-indigo-400/60 ring-1 ring-indigo-400/30 scale-110'
                    : 'border-white/10 hover:border-white/30'
                }`}
                style={{ background: t.pageBg }}
                title={t.name}
              >
                <span className="flex items-center justify-center text-[8px] font-bold" style={{ color: t.textColor }}>
                  {templateId === t.id ? '✓' : ''}
                </span>
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-500 font-medium">
            {form.bibleBook} · {form.weekNumber}주차
          </span>
          <button
            onClick={handlePdfDownload}
            disabled={pdfLoading || days.length === 0}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold transition-all disabled:opacity-40"
          >
            {pdfLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            {pdfLoading ? 'PDF 생성 중...' : 'PDF 다운로드'}
          </button>
        </div>
      </div>

      {/* Day content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {/* Navigation header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setDayIndex(Math.max(0, dayIndex - 1))}
              disabled={dayIndex === 0}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-center">
              <div className="text-[13px] font-bold text-slate-200">DAY {dayIndex + 1}</div>
              <div className="text-[10px] text-slate-500">{weekdays[dayIndex] || ''}</div>
              <div className="flex items-center justify-center gap-1.5 mt-3">
                {days.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setDayIndex(i)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === dayIndex
                        ? 'bg-indigo-400 ring-2 ring-indigo-400/30 scale-125'
                        : 'bg-white/10 hover:bg-white/30'
                    }`}
                  />
                ))}
              </div>
            </div>
            <button
              onClick={() => setDayIndex(Math.min(days.length - 1, dayIndex + 1))}
              disabled={dayIndex >= days.length - 1}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Day card */}
          {currentDay ? (
            <div
              className="rounded-2xl p-8 border"
              style={{
                background: tmpl.pageBg,
                color: tmpl.textColor,
                borderColor: tmpl.border,
              }}
            >
              <QtDayCard
                day={currentDay}
                dayNumber={dayIndex + 1}
                dateLabel={weekdays[dayIndex] || ''}
                variant="pdf"
                template={tmpl}
              />
            </div>
          ) : (
            <div
              className="rounded-2xl p-8 border max-h-[75vh] overflow-y-auto scrollbar-thin"
              style={{
                background: tmpl.pageBg,
                color: tmpl.textColor,
                borderColor: tmpl.border,
              }}
            >
              <div className="text-[12px] leading-relaxed whitespace-pre-wrap font-mono opacity-80">
                {accumulatedManuscript || '생성된 내용이 없습니다.'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hidden PDF layout for export — 화면 밖에 렌더링하되 실제 크기로 그려서 html2canvas가 캡처 */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: 0, height: 0, overflow: 'hidden', opacity: 1 }}>
        <QtPdfLayout
          ref={pdfLayoutRef}
          form={form}
          result={{ fullManuscript: accumulatedManuscript }}
          sizeOption={form.sizeOption || 'A4'}
          templateId={templateId}
          startPassage={startPassage}
          endPassage={endPassage}
        />
      </div>
    </div>
  )
}
