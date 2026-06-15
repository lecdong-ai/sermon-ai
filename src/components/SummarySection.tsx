'use client'

import { useRef, useState, useCallback, useMemo } from 'react'
import { FileDown } from 'lucide-react'
import SectionCard from './SectionCard'
import type { Summary } from '@/types'

interface Props {
  data: Summary
  passageRef?: string
}

const SECTIONS: { key: keyof Summary; label: string; bar: string; tag: string; bg: string }[] = [
  { key: 'central_topic', label: '중심 주제', bar: 'bg-[#8d7a5b]', tag: 'text-[#2c2a29] bg-[#eae7e0] border border-[#d4d1c9]', bg: 'bg-white' },
  { key: 'intro', label: '서론', bar: 'bg-[#d4d1c9]', tag: 'text-[#5c5854] bg-[#f5f4f0] border border-[#e4e2dd]', bg: 'bg-white' },
  { key: 'body', label: '본론', bar: 'bg-[#d4d1c9]', tag: 'text-[#5c5854] bg-[#f5f4f0] border border-[#e4e2dd]', bg: 'bg-white' },
  { key: 'conclusion', label: '결론', bar: 'bg-[#d4d1c9]', tag: 'text-[#5c5854] bg-[#f5f4f0] border border-[#e4e2dd]', bg: 'bg-white' },
  { key: 'application', label: '적용', bar: 'bg-[#d4d1c9]', tag: 'text-[#5c5854] bg-[#f5f4f0] border border-[#e4e2dd]', bg: 'bg-white' },
]

const PDF_PAGE_CSS = `*{box-sizing:border-box;margin:0;padding:0}
body{font-family:"Apple SD Gothic Neo","Noto Sans KR","Malgun Gothic","Nanum Gothic",sans-serif;color:#222;line-height:1.7}
.pdf-page{width:210mm;min-height:297mm;padding:18mm;margin:0;background:#fff;}
.pdf-page-inner{width:174mm;}`

const PAGE_CONTENT_MM = 261 // 297 - 18 - 18
const MM_PX = 96 / 25.4
const PAGE_CONTENT_PX = Math.round(PAGE_CONTENT_MM * MM_PX)

function buildPageWrapper(content: string): string {
  return `<style>${PDF_PAGE_CSS}</style><div class="pdf-page"><div class="pdf-page-inner">${content}</div></div>`
}

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function chunkHtml(label: string, text: string) {
  return '<div style="margin-bottom:16px;">' +
    '<div style="font-size:14px;font-weight:700;color:#1a56db;margin-bottom:6px;">' + esc(label) + '</div>' +
    '<p style="margin:0;font-size:14px;color:#333;line-height:1.8;white-space:pre-wrap;">' + esc(text) + '</p>' +
    '</div>'
}

function passageChunk(text: string) {
  return '<div style="background:#fefce8;border-left:4px solid #eab308;border-radius:3px;margin-bottom:14px;padding:4px 14px 16px 14px;">' +
    '<p style="margin:0 0 2px 0;font-size:12px;font-weight:700;color:#92400e;">성경 본문 (개역개정)</p>' +
    '<p style="margin:0;font-size:13px;color:#333;line-height:1.7;font-style:italic;">' + esc(text) + '</p></div>'
}

function buildSummaryChunks(data: Summary): string[] {
  const chunks: string[] = []

  chunks.push('<div style="text-align:center;padding-bottom:12px;border-bottom:3px solid #1a56db;margin-bottom:16px;">' +
    '<h1 style="font-size:24px;font-weight:800;color:#1a2a3a;margin:0;">설교 요약</h1></div>')
  chunks.push(chunkHtml('중심 주제', data.central_topic))

  if (data.passage_text) {
    chunks.push(passageChunk(data.passage_text))
  }

  chunks.push(chunkHtml('서론', data.intro))

  const bodyText = formatSummaryText(data.body || '')
  const bodyParas = bodyText.split(/\n{2,}/).filter(Boolean)
  for (let i = 0; i < bodyParas.length; i += 4) {
    chunks.push(chunkHtml('본론', bodyParas.slice(i, i + 4).join('\n\n')))
  }

  chunks.push(chunkHtml('결론', data.conclusion))
  chunks.push(chunkHtml('적용', data.application))

  return chunks
}

function formatSummaryText(text: string): string {
  let t = text
  if (!t.includes('\n')) {
    t = t.replace(/▶\s*핵심 의미/g, '\n\n▶ 핵심 의미')
    t = t.replace(/(\d+\.\s)/g, '\n\n$1')
    t = t.replace(/^(\n\s*)+/, '')
  }
  return t
}

export default function SummarySection({ data }: Props) {
  const contentRef = useRef<HTMLDivElement>(null)
  const pdfRef = useRef<HTMLDivElement>(null)
  const [pdfLoading, setPdfLoading] = useState(false)

  const sections = useMemo(() => SECTIONS.map(({ key, label, bar, tag }, i) => {
    const raw = data[key]
    if (!raw || typeof raw !== 'string') return null
    const val = key === 'body' ? formatSummaryText(raw) : raw
    return (
      <div key={key} className="flex gap-4 animate-in-fast" style={{ animationDelay: `${i * 80}ms` }}>
        <div className={`w-[3px] shrink-0 rounded-full ${bar} mt-[7px]`} />
        <div className="flex-1 min-w-0">
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${tag}`}>{label}</span>
          <p className="text-[14px] text-[#4a4744] leading-[1.8] whitespace-pre-wrap mt-2">{val}</p>
        </div>
      </div>
    )
  }), [data])

  const fullText = useMemo(() => SECTIONS.map(s => s.key === 'body' ? formatSummaryText(data[s.key] || '') : data[s.key]).filter(Boolean).join('\n\n'), [data])

  const handleDownloadPdf = useCallback(async () => {
    setPdfLoading(true)
    try {
      const { jsPDF } = await import('jspdf')
      const html2canvas = (await import('html2canvas')).default
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfW = pdf.internal.pageSize.getWidth()
      const pdfH = pdf.internal.pageSize.getHeight()
      const container = pdfRef.current
      if (!container) return

      const pdfData = { ...data, body: formatSummaryText(data.body || '') }
      const chunks = buildSummaryChunks(pdfData)

      // Distribute chunks into pages by height
      const pageHtmls: string[] = []
      let pageContent = ''
      for (const chunk of chunks) {
        const testHtml = buildPageWrapper(pageContent + chunk)
        container.innerHTML = testHtml
        await new Promise(r => setTimeout(r, 30))
        const inner = container.querySelector('.pdf-page-inner') as HTMLElement
        const h = inner ? inner.scrollHeight : 0
        if (h > PAGE_CONTENT_PX && pageContent) {
          pageHtmls.push(buildPageWrapper(pageContent))
          pageContent = chunk
        } else {
          pageContent += chunk
        }
      }
      if (pageContent) pageHtmls.push(buildPageWrapper(pageContent))

      // Capture each page
      for (let i = 0; i < pageHtmls.length; i++) {
        if (i > 0) pdf.addPage()
        container.innerHTML = pageHtmls[i]
        await new Promise(r => setTimeout(r, 300))

        const pageEl = container.querySelector('.pdf-page') as HTMLElement
        if (!pageEl) continue
        const canvas = await html2canvas(pageEl, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
        })
        const imgData = canvas.toDataURL('image/jpeg', 0.95)
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH)
      }

      pdf.save('설교-요약.pdf')
    } catch (err) {
      console.error('PDF generation failed:', err)
      alert('PDF 생성 중 오류가 발생했습니다.')
    } finally {
      setPdfLoading(false)
    }
  }, [data])

  return (
    <SectionCard
      title="설교 요약"
      emoji="📄"
      copyText={fullText}
      action={
        <button
          onClick={handleDownloadPdf}
          disabled={pdfLoading}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[13px] text-[#8a8580] hover:text-[#8d7a5b] hover:bg-[#f5f4f0] border border-[#e4e2dd] transition-all duration-200 disabled:opacity-50"
        >
          <FileDown className="w-3.5 h-3.5" />
          <span className="font-medium">{pdfLoading ? '생성 중...' : 'PDF'}</span>
        </button>
      }
    >
      <div className="space-y-6">
        {data.passage_text && (
          <div className="flex gap-4 animate-in-fast">
            <div className="w-[3px] shrink-0 rounded-full bg-[#8d7a5b] mt-[7px]" />
            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded text-[#6b5f4c] bg-[#fdfcf7] border border-[#e8e6e1]">📖 성경 본문 (개역개정)</span>
              <p className="text-[14px] text-[#4a4744] leading-[1.8] italic whitespace-pre-wrap mt-2">
                {data.passage_text}
              </p>
            </div>
          </div>
        )}

        {sections}
      </div>
      <div ref={pdfRef} style={{ position: 'absolute', left: -9999, top: 0, width: 800 }} />
    </SectionCard>
  )
}
