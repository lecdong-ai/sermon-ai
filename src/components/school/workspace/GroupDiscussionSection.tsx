'use client'

import { useState, useRef, useCallback } from 'react'
import SectionCard from './SectionCard'
import {
  ChevronDown, Users, BookMarked, Heart, Sparkles, School,
  Target, MessageCircle, Lightbulb, HeartHandshake, BookOpen, Star, Cross,
  FileDown
} from 'lucide-react'
import type { GroupDiscussion, AgeGroupMaterial } from '@/types/school/workspace'

const AGE_GROUPS: {
  key: keyof Pick<GroupDiscussion, 'teens' | 'twentiesThirties' | 'forties' | 'fiftiesSixties' | 'seventiesPlus'>
  icon: typeof Users
  label: string
  color: string
  desc: string
}[] = [
    { key: 'teens', icon: School, label: '청소년', color: 'bg-[#eae7e2] text-[#8d7a5b]', desc: '10대 청소년' },
    { key: 'twentiesThirties', icon: Users, label: '20~30대', color: 'bg-[#eae7e2] text-[#8d7a5b]', desc: '청년 세대' },
    { key: 'forties', icon: Sparkles, label: '40대', color: 'bg-[#eae7e2] text-[#8d7a5b]', desc: '중년 세대' },
    { key: 'fiftiesSixties', icon: BookMarked, label: '50~60대', color: 'bg-[#eae7e2] text-[#8d7a5b]', desc: '장년 세대' },
    { key: 'seventiesPlus', icon: Heart, label: '70대 이상', color: 'bg-[#eae7e2] text-[#8d7a5b]', desc: '시니어 세대' },
  ]

const GD_PAGE_CSS = `*{box-sizing:border-box;margin:0;padding:0}
body{font-family:"Apple SD Gothic Neo","Noto Sans KR","Malgun Gothic","Nanum Gothic",sans-serif;color:#222;line-height:1.7}
.pdf-page{width:210mm;min-height:297mm;padding:18mm;margin:0;background:#fff;}
.pdf-page-inner{width:174mm;}
.prayer-box{background:linear-gradient(135deg,#eff6ff,#faf5ff);border:1px solid #dbeafe;border-radius:5px;margin-bottom:4px;padding:4px 16px 16px 16px}
.prayer-box .lbl{font-size:12px;font-weight:700;color:#1a56db;margin-bottom:3px}
.prayer-box .txt{font-size:13px;color:#374151;line-height:1.65;margin:0;font-style:italic}
.section-h2{font-size:16px;font-weight:700;color:#1a56db;margin:0 0 8px 0;padding-bottom:4px;border-bottom:2px solid #dbeafe}
.section-h3{font-size:14px;font-weight:700;color:#374151;margin:12px 0 4px 0}
.hl-box{background:#f0f5ff;border-left:4px solid #1a56db;border-radius:3px;margin-bottom:10px;padding:4px 14px 16px 14px}
.hl-box p{margin:0;font-size:13px;color:#333;line-height:1.65}
.passage-box{background:#fefce8;border-left:4px solid #eab308;border-radius:3px;margin-bottom:14px;padding:4px 14px 16px 14px}
.passage-box .lbl{font-size:12px;font-weight:700;color:#92400e;margin:0 0 3px 0}
.passage-box p{margin:0;font-size:13px;color:#333;line-height:1.65}`

const GD_CONTENT_MM = 261
const GD_MM_PX = 96 / 25.4
const GD_CONTENT_PX = Math.round(GD_CONTENT_MM * GD_MM_PX)

function esc(s: string) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") }

function stripPassage(title: string) {
  const idx = title.indexOf(' - ')
  return idx > 0 ? title.slice(idx + 3) : title
}

function gdPageWrapper(content: string): string {
  return `<style>${GD_PAGE_CSS}</style><div class="pdf-page"><div class="pdf-page-inner">${content}</div></div>`
}

function olHtml(items: string[]): string {
  let h = '<ol style="margin:0 0 10px 0;padding-left:18px;">'
  for (let i = 0; i < items.length; i++) {
    h += '<li style="margin-bottom:4px;font-size:13px;color:#333;line-height:1.7;">' + esc(items[i]) + '</li>'
  }
  return h + '</ol>'
}

function buildGdChunks(data: GroupDiscussion, ageKey: string, passageText?: string): string[] {
  const ageLabels: Record<string, string> = { teens: '청소년', twentiesThirties: '20~30대', forties: '40대', fiftiesSixties: '50~60대', seventiesPlus: '70대 이상' }
  const g = data[ageKey as keyof GroupDiscussion] as AgeGroupMaterial
  const chunks: string[] = []

  chunks.push('<div style="text-align:center;padding-bottom:12px;border-bottom:3px solid #1a56db;margin-bottom:16px;">' +
    '<h1 style="font-size:24px;font-weight:800;color:#1a2a3a;margin:0 0 2px 0;">소그룹 나눔 교안</h1>' +
    '<p style="font-size:13px;color:#1a56db;font-weight:600;margin:3px 0 0 0;">' + ageLabels[ageKey] + '</p></div>')

  chunks.push('<table style="width:100%;border-collapse:collapse;margin-bottom:16px;">' +
    '<tr><td style="width:60px;padding:4px 10px 8px 10px;background:#f3f4f6;border:1px solid #d1d5db;font-size:13px;font-weight:700;color:#1a56db;text-align:center;vertical-align:middle;">제목</td>' +
    '<td style="padding:4px 12px 8px 12px;border:1px solid #d1d5db;font-size:15px;font-weight:600;color:#1f2937;vertical-align:middle;">' + esc(stripPassage(data.title)) + '</td></tr>' +
    '<tr><td style="padding:4px 10px 8px 10px;background:#f3f4f6;border:1px solid #d1d5db;font-size:13px;font-weight:700;color:#1a56db;text-align:center;vertical-align:middle;">본문</td>' +
    '<td style="padding:4px 12px 8px 12px;border:1px solid #d1d5db;font-size:15px;color:#1f2937;vertical-align:middle;">' + esc(data.passage) + '</td></tr>' +
    '<tr><td style="padding:4px 10px 8px 10px;background:#f3f4f6;border:1px solid #d1d5db;font-size:13px;font-weight:700;color:#1a56db;text-align:center;vertical-align:middle;">주제</td>' +
    '<td style="padding:4px 12px 8px 12px;border:1px solid #d1d5db;font-size:15px;color:#1f2937;vertical-align:middle;">' + esc(data.topic) + '</td></tr></table>')

  if (passageText) {
    chunks.push('<div class="passage-box"><p class="lbl">개역개정 성경본문</p><p>' + esc(passageText) + '</p></div>')
  }

  chunks.push('<div class="section-h2">본문 핵심 요약</div>' +
    '<div class="hl-box"><p>' + esc(data.summary) + '</p></div>')

  let pointsHtml = ''
  for (let pi = 0; pi < data.directionPoints.length; pi++) {
    pointsHtml += '<li style="margin-bottom:4px;font-size:13px;color:#333;line-height:1.7;">' + esc(data.directionPoints[pi]) + '</li>'
  }
  chunks.push('<div class="section-h2">전체 나눔 방향</div>' +
    '<ul style="margin:0 0 10px 0;padding-left:16px;">' + pointsHtml + '</ul>')

  chunks.push('<div class="section-h2">' + ageLabels[ageKey] + ' 나눔 자료</div>')

  chunks.push('<div class="section-h3">나눔 목표</div>' +
    '<div class="hl-box"><p>' + esc(g.goal) + '</p></div>')

  chunks.push('<div class="section-h3">핵심 메시지</div>' +
    '<div class="hl-box"><p>' + esc(g.coreMessage) + '</p></div>')

  chunks.push('<div class="section-h3">아이스브레이크</div>' + olHtml(g.icebreakers))

  chunks.push('<div class="section-h3">본문 관찰 질문</div>' + olHtml(g.observationQuestions))

  chunks.push('<div class="section-h3">해석/이해 질문</div>' + olHtml(g.interpretationQuestions))

  chunks.push('<div class="section-h3">삶 적용 질문</div>' + olHtml(g.applicationQuestions))

  chunks.push('<div class="section-h3">기도제목</div>' + olHtml(g.prayerTopics))

  let closingHtml = ''
  for (let ci = 0; ci < data.closingQuestions.length; ci++) {
    closingHtml += '<li style="margin-bottom:4px;font-size:13px;color:#333;line-height:1.7;">' + esc(data.closingQuestions[ci]) + '</li>'
  }
  chunks.push('<hr style="border:none;border-top:1px dashed #d1d5db;margin:16px 0;">' +
    '<div class="section-h2">공통 마무리</div>' +
    '<div class="section-h3">마무리 질문</div>' +
    '<ol style="margin:0 0 10px 0;padding-left:18px;">' + closingHtml + '</ol>' +
    '<div class="section-h3">대표기도문</div>' +
    '<div class="prayer-box"><p class="lbl">대표기도</p><p class="txt">' + esc(data.representativePrayer) + '</p></div>')

  return chunks
}

interface Props {
  data: GroupDiscussion
  passageText?: string
}

function AgeGroupCard({
  group,
  material,
  index,
  showPdfButton,
  onDownloadPdf,
  pdfLoading,
}: {
  group: typeof AGE_GROUPS[number]
  material: AgeGroupMaterial
  index: number
  showPdfButton?: boolean
  onDownloadPdf?: () => void
  pdfLoading?: boolean
}) {
  const [open, setOpen] = useState(false)

  const sections: { label: string; icon: typeof Target; items: string[] }[] = [
    { label: '아이스브레이크', icon: Star, items: material.icebreakers },
    { label: '본문 관찰 질문', icon: BookOpen, items: material.observationQuestions },
    { label: '해석/이해 질문', icon: Lightbulb, items: material.interpretationQuestions },
    { label: '삶 적용 질문', icon: HeartHandshake, items: material.applicationQuestions },
    { label: '기도제목', icon: Cross, items: material.prayerTopics },
  ]

  return (
    <div className="animate-in-fast" style={{ animationDelay: `${index * 80}ms` }}>
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${open
          ? 'border-[#8d7a5b] bg-[#fdfcf9]'
          : 'border-[#e4e2dd] bg-white hover:border-[#d4d1c9]'
          }`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg ${group.color} flex items-center justify-center`}>
            <group.icon className="w-4 h-4" />
          </div>
          <div className="text-left">
            <p className="text-[14px] font-bold text-[#2c2a29]">{group.label}</p>
            <p className="text-[12px] text-[#8a8580]">{group.desc}</p>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-[#8a8580] transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-[2000px] opacity-100 mt-2' : 'max-h-0 opacity-0'
        }`}>
        <div className="p-4 rounded-xl border border-[#e4e2dd] bg-white space-y-4">
          <div className="p-3 rounded-lg bg-[#fbfaf7] border border-[#e4e2dd]">
            <p className="font-bold text-[13px] text-[#2c2a29] mb-1">나눔 목표</p>
            <p className="text-[13px] text-[#4a4744] leading-relaxed">{material.goal}</p>
          </div>
          <div className="p-3 rounded-lg bg-[#fdfcf7] border border-[#e8e6e1]">
            <p className="font-bold text-[13px] text-[#6b5f4c] mb-1">핵심 메시지</p>
            <p className="text-[13px] text-[#4a4744] leading-relaxed">{material.coreMessage}</p>
          </div>
          {sections.map((section) => (
            <div key={section.label}>
              <p className="font-bold text-[13px] text-[#2c2a29] mb-2 flex items-center gap-1.5">
                <section.icon className="w-3.5 h-3.5 text-[#8d7a5b]" />
                {section.label}
              </p>
              <ul className="space-y-2">
                {section.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-[13px] text-[#4a4744] leading-relaxed">
                    <span className="shrink-0 w-4 h-4 rounded-full bg-[#f2efe9] text-[#6b6255] text-[10px] font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {showPdfButton && (
            <div className="pt-2 flex justify-end">
              <button
                onClick={onDownloadPdf}
                disabled={pdfLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-[#8d7a5b] bg-[#fdfcf7] border border-[#d4d1c9] hover:bg-[#f5f4f0] transition-colors disabled:opacity-50"
              >
                <FileDown className="w-3.5 h-3.5" />
                {pdfLoading ? '생성 중...' : 'PDF 다운로드'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function GroupDiscussionSection({ data, passageText }: Props) {
  const pdfContentRef = useRef<HTMLDivElement>(null)
  const [pdfLoading, setPdfLoading] = useState<Record<string, boolean>>({})

  const handleDownloadPdf = useCallback(async (ageKey: string) => {
    const loadingKey = 'pdf_' + ageKey
    setPdfLoading(prev => ({ ...prev, [loadingKey]: true }))
    try {
      const { jsPDF } = await import('jspdf')
      const html2canvas = (await import('html2canvas')).default
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfW = pdf.internal.pageSize.getWidth()
      const pdfH = pdf.internal.pageSize.getHeight()
      const container = pdfContentRef.current
      if (!container) return

      const chunks = buildGdChunks(data, ageKey, passageText)

      // Distribute chunks into pages by height
      const pageHtmls: string[] = []
      let pageContent = ''
      for (const chunk of chunks) {
        const testHtml = gdPageWrapper(pageContent + chunk)
        container.innerHTML = testHtml
        await new Promise(r => setTimeout(r, 30))
        const inner = container.querySelector('.pdf-page-inner') as HTMLElement
        const h = inner ? inner.scrollHeight : 0
        if (h > GD_CONTENT_PX && pageContent) {
          pageHtmls.push(gdPageWrapper(pageContent))
          pageContent = chunk
        } else {
          pageContent += chunk
        }
      }
      if (pageContent) pageHtmls.push(gdPageWrapper(pageContent))

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

      const label = AGE_GROUPS.find(g => g.key === ageKey)?.label || ageKey
      pdf.save(label + '-소그룹-나눔-교안.pdf')
    } catch (err) {
      console.error('PDF generation failed:', err)
      alert('PDF 생성 중 오류가 발생했습니다.')
    } finally {
      setPdfLoading(prev => ({ ...prev, ['pdf_' + ageKey]: false }))
    }
  }, [data, passageText])

  return (
    <SectionCard
      title="소그룹 나눔 자료"
      emoji="💬"
    >
      {/* 기본 정보 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <div className="p-4 rounded-xl bg-[#fbfaf7] border border-[#e4e2dd] text-center">
          <p className="text-[13px] font-bold text-[#8a8580] mb-1">제목</p>
          <p className="text-[16px] font-bold text-[#2c2a29]">{stripPassage(data.title)}</p>
        </div>
        <div className="p-4 rounded-xl bg-[#fbfaf7] border border-[#e4e2dd] text-center">
          <p className="text-[13px] font-bold text-[#8a8580] mb-1">본문</p>
          <p className="text-[16px] font-bold text-[#2c2a29]">{data.passage}</p>
        </div>
        <div className="p-4 rounded-xl bg-[#fbfaf7] border border-[#e4e2dd] text-center">
          <p className="text-[13px] font-bold text-[#8a8580] mb-1">주제</p>
          <p className="text-[16px] font-bold text-[#2c2a29]">{data.topic}</p>
        </div>
      </div>

      {/* 본문 핵심 요약 */}
      <div className="mb-5 p-4 rounded-xl bg-white border border-[#e4e2dd]">
        <p className="font-bold text-[14px] text-[#2c2a29] mb-2 flex items-center gap-1.5">
          <MessageCircle className="w-4 h-4 text-[#8d7a5b]" />
          본문 핵심 요약
        </p>
        <p className="text-[13px] text-[#4a4744] leading-relaxed">{data.summary}</p>
      </div>

      {/* 전체 나눔 방향 */}
      <div className="mb-5 p-4 rounded-xl bg-white border border-[#e4e2dd]">
        <p className="font-bold text-[14px] text-[#2c2a29] mb-2 flex items-center gap-1.5">
          <Target className="w-4 h-4 text-[#8d7a5b]" />
          전체 나눔 방향
        </p>
        <ul className="space-y-1.5">
          {data.directionPoints.map((point, i) => (
            <li key={i} className="flex items-start gap-2 text-[13px] text-[#4a4744] leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8d7a5b] mt-2 shrink-0" />
              {point}
            </li>
          ))}
        </ul>
      </div>

      {/* 연령별 나눔 자료 */}
      <div className="space-y-3 mb-5">
        <p className="font-bold text-[14px] text-[#2c2a29] flex items-center gap-1.5">
          <Users className="w-4 h-4 text-[#8d7a5b]" />
          연령별 소그룹 나눔 자료
        </p>
        {AGE_GROUPS.map((group, i) => (
          <AgeGroupCard
            key={group.key}
            group={group}
            material={data[group.key]}
            index={i}
            showPdfButton={true}
            onDownloadPdf={() => handleDownloadPdf(group.key)}
            pdfLoading={!!pdfLoading['pdf_' + group.key]}
          />
        ))}
      </div>

      {/* 공통 마무리 */}
      <div className="p-4 rounded-xl bg-white border border-[#e4e2dd]">
        <p className="font-bold text-[14px] text-[#2c2a29] mb-3 flex items-center gap-1.5">
          <HeartHandshake className="w-4 h-4 text-[#8d7a5b]" />
          공통 마무리
        </p>
        <div className="mb-4">
          <p className="font-medium text-[13px] text-[#6b6764] mb-2">마무리 질문</p>
          <ul className="space-y-2">
            {data.closingQuestions.map((q, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] text-[#4a4744] leading-relaxed">
                <span className="shrink-0 w-4 h-4 rounded-full bg-[#f2efe9] text-[#6b6255] text-[10px] font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                {q}
              </li>
            ))}
          </ul>
        </div>
        <div className="p-3 rounded-lg bg-[#fdfcf7] border border-[#e8e6e1]">
          <p className="font-bold text-[13px] text-[#6b5f4c] mb-1 flex items-center gap-1.5">
            <Cross className="w-3.5 h-3.5" />
            대표기도문
          </p>
          <p className="text-[13px] text-[#4a4744] leading-relaxed whitespace-pre-wrap">{data.representativePrayer}</p>
        </div>
      </div>
      <div ref={pdfContentRef} style={{ position: 'absolute', left: -9999, top: 0, width: 800 }} />
    </SectionCard>
  )
}
