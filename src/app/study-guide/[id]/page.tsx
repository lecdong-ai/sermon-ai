'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  BookOpen, Sparkles, RotateCcw, Pencil, Check, X, Copy, CheckCheck,
  FileDown, ArrowLeft, AlertCircle, ChevronDown, ChevronUp,
} from 'lucide-react'
import type {
  StudyGuideOutput, StudyGuideRecord,
  OpeningQuestion, SermonDiscussionQuestion, LifeApplicationQuestion,
} from '@/types'

export default function StudyGuideDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [record, setRecord] = useState<StudyGuideRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [regenerating, setRegenerating] = useState(false)
  const [editing, setEditing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [editOutput, setEditOutput] = useState<StudyGuideOutput | null>(null)
  const [pdfLoading, setPdfLoading] = useState(false)
  const pdfRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch(`/api/study-guide/${id}`)
      .then(r => r.json())
      .then(json => {
        if (!json.success) {
          setError(json.error || '불러오기 실패')
          return
        }
        setRecord(json.data)
        setEditOutput(json.data.output_data)
      })
      .catch(() => setError('네트워크 오류'))
      .finally(() => setLoading(false))
  }, [id])

  const handleSave = useCallback(async () => {
    if (!editOutput || !record) return
    const res = await fetch(`/api/study-guide/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ output_data: editOutput }),
    })
    const json = await res.json()
    if (json.success) {
      setRecord(json.data)
      setEditing(false)
    } else {
      alert(json.error || '저장 실패')
    }
  }, [editOutput, record, id])

  const handleRegenerate = useCallback(async () => {
    setRegenerating(true)
    try {
      const res = await fetch(`/api/study-guide/${id}/regenerate`, { method: 'POST' })
      const json = await res.json()
      if (!json.success) {
        alert(json.error || '재생성 실패')
        return
      }
      setRecord(json.data)
      setEditOutput(json.data.output_data)
    } catch {
      alert('재생성 중 오류가 발생했습니다.')
    } finally {
      setRegenerating(false)
    }
  }, [id])

  const handleCopyAll = useCallback(async () => {
    if (!editOutput) return
    const text = [
      `# ${editOutput.title}`,
      `본문: ${editOutput.passage}`,
      '',
      `## 이번 나눔의 포커스`,
      editOutput.focus,
      '',
      `## 본문 읽기 안내`,
      editOutput.readingGuide,
      '',
      `## 1. 여는 질문`,
      ...editOutput.openingQuestions.map((q, i) =>
        `${i + 1}. ${q.text}\n   · 질문 의도: ${q.intention}\n   · 침묵 시: ${q.silenceGuide}\n   · 진행 팁: ${q.tip}`
      ),
      '',
      `## 2. 말씀 나눔`,
      ...editOutput.sermonDiscussion.map((q, i) => {
        let s = `${i + 1}. [${q.type}] ${q.text}`
        s += `\n   · 질문 의도: ${q.intention}`
        s += `\n   · 예상 응답 방향: ${q.expectedAnswer}`
        if (q.silenceGuide) s += `\n   · 침묵 시: ${q.silenceGuide}`
        if (q.tip) s += `\n   · 진행 팁: ${q.tip}`
        s += `\n   · 참고: ${q.reference}`
        return s
      }),
      '',
      `## 3. 삶의 적용`,
      ...editOutput.lifeApplication.map((q, i) => {
        let s = `${i + 1}. ${q.text}`
        s += `\n   · 질문 의도: ${q.intention}`
        if (q.silenceGuide) s += `\n   · 침묵 시: ${q.silenceGuide}`
        s += `\n   · 진행 팁: ${q.tip}`
        return s
      }),
      '',
      `## 함께 기도`,
      ...editOutput.prayerTopics.map((q, i) => `${i + 1}. ${q}`),
    ].join('\n')
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [editOutput])

  const handleDownloadPdf = useCallback(async () => {
    if (!editOutput) return
    setPdfLoading(true)
    try {
      const { jsPDF } = await import('jspdf')
      const html2canvas = (await import('html2canvas')).default
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfW = pdf.internal.pageSize.getWidth()
      const pdfH = pdf.internal.pageSize.getHeight()
      const container = pdfRef.current
      if (!container) return

      const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      const p = (text: string) => `<p style="margin:0;font-size:13px;color:#333;line-height:1.7;">${esc(text)}</p>`
      const subLabel = (text: string) => `<div style="font-size:11px;font-weight:700;color:#6b7280;margin-top:5px;padding-left:8px;">${esc(text)}</div>`
      const subVal = (text: string) => `<p style="margin:0 0 1px 20px;font-size:11px;color:#555;line-height:1.6;">${esc(text)}</p>`

      const qItem = (num: number, text: string, details: string) =>
        '<div style="margin-bottom:8px;padding:6px 10px;background:#fafbfc;border:1px solid #e5e7eb;border-radius:4px;">' +
        `<p style="margin:0;font-size:13px;color:#333;line-height:1.7;"><strong>${num}.</strong> ${esc(text)}</p>${details}</div>`

      const openingDetails = (q: OpeningQuestion) =>
        subLabel('질문 의도') + subVal(q.intention) +
        subLabel('침묵 시') + subVal(q.silenceGuide) +
        subLabel('진행 팁') + subVal(q.tip)

      const sermonDetails = (q: SermonDiscussionQuestion) =>
        subLabel('질문 의도') + subVal(q.intention) +
        subLabel('예상 응답 방향') + subVal(q.expectedAnswer) +
        (q.silenceGuide ? subLabel('침묵 시') + subVal(q.silenceGuide) : '') +
        (q.tip ? subLabel('진행 팁') + subVal(q.tip) : '') +
        subLabel('참고') + subVal(q.reference)

      const lifeDetails = (q: LifeApplicationQuestion) =>
        subLabel('질문 의도') + subVal(q.intention) +
        (q.silenceGuide ? subLabel('침묵 시') + subVal(q.silenceGuide) : '') +
        subLabel('진행 팁') + subVal(q.tip)

      const chunks: string[] = [
        // 1. Title header
        '<div style="text-align:center;padding-bottom:12px;border-bottom:3px solid #1a56db;margin-bottom:16px;">' +
        '<h1 style="font-size:24px;font-weight:800;color:#1a2a3a;margin:0 0 2px 0;">소그룹 리더가이드</h1>' +
        '<p style="font-size:13px;color:#1a56db;font-weight:600;margin:3px 0 0 0;">' + esc(editOutput.title) + '</p></div>',

        // 2. Metadata table
        '<table style="width:100%;border-collapse:collapse;margin-bottom:16px;">' +
        '<tr><td style="width:50px;padding:5px 8px;background:#f3f4f6;border:1px solid #d1d5db;font-size:12px;font-weight:700;color:#1a56db;text-align:center;">제목</td>' +
        '<td style="padding:5px 10px;border:1px solid #d1d5db;font-size:14px;font-weight:600;color:#1f2937;">' + esc(editOutput.title) + '</td></tr>' +
        '<tr><td style="padding:5px 8px;background:#f3f4f6;border:1px solid #d1d5db;font-size:12px;font-weight:700;color:#1a56db;text-align:center;">본문</td>' +
        '<td style="padding:5px 10px;border:1px solid #d1d5db;font-size:14px;color:#1f2937;">' + esc(editOutput.passage) + '</td></tr></table>',

        // 3. Focus
        '<div style="font-size:15px;font-weight:700;color:#1a56db;margin:0 0 8px 0;padding-bottom:4px;border-bottom:2px solid #dbeafe;">🎯 이번 나눔의 포커스</div>' +
        '<div style="background:#f0f5ff;border-left:4px solid #1a56db;padding:10px 14px;border-radius:3px;margin-bottom:14px;">' +
        editOutput.focus.split('\n').map(l => '<p style="margin:0;font-size:13px;color:#333;line-height:1.7;">' + esc(l) + '</p>').join('') +
        '</div>',

        // 4. Reading guide
        '<div style="font-size:15px;font-weight:700;color:#1a56db;margin:0 0 8px 0;padding-bottom:4px;border-bottom:2px solid #dbeafe;">📖 본문 읽기 안내</div>' +
        '<div style="background:#fefce8;border-left:4px solid #eab308;padding:8px 14px;border-radius:3px;margin-bottom:14px;">' +
        '<p style="margin:0;font-size:13px;color:#333;line-height:1.7;font-style:italic;">' + esc(editOutput.readingGuide) + '</p></div>',

        // 5. Opening questions
        '<div style="font-size:15px;font-weight:700;color:#1a56db;margin:0 0 8px 0;padding-bottom:4px;border-bottom:2px solid #dbeafe;">💬 1. 여는 질문</div>' +
        editOutput.openingQuestions.map((q, i) => qItem(i + 1, q.text, openingDetails(q))).join(''),

        // 6. Sermon discussion
        '<div style="font-size:15px;font-weight:700;color:#1a56db;margin:0 0 8px 0;padding-bottom:4px;border-bottom:2px solid #dbeafe;">💬 2. 말씀 나눔</div>' +
        editOutput.sermonDiscussion.map((q, i) =>
          qItem(i + 1, `[${q.type}] ${q.text}`, sermonDetails(q))
        ).join(''),

        // 7. Life application
        '<div style="font-size:15px;font-weight:700;color:#1a56db;margin:0 0 8px 0;padding-bottom:4px;border-bottom:2px solid #dbeafe;">💬 3. 삶의 적용</div>' +
        editOutput.lifeApplication.map((q, i) => qItem(i + 1, q.text, lifeDetails(q))).join(''),

        // 8. Prayer topics
        '<div style="font-size:15px;font-weight:700;color:#1a56db;margin:0 0 8px 0;padding-bottom:4px;border-bottom:2px solid #dbeafe;">🙏 함께 기도</div>' +
        '<div style="background:linear-gradient(135deg,#eff6ff,#faf5ff);border:1px solid #dbeafe;border-radius:5px;padding:12px 16px;">' +
        '<ol style="margin:0;padding-left:18px;">' +
        editOutput.prayerTopics.map(item => '<li style="margin-bottom:4px;font-size:13px;color:#374151;line-height:1.7;">' + esc(item) + '</li>').join('') +
        '</ol></div>',
      ]

      const css = `*{box-sizing:border-box;margin:0;padding:0}
body{font-family:"Apple SD Gothic Neo","Noto Sans KR","Malgun Gothic","Nanum Gothic",sans-serif;color:#222;line-height:1.7}
.pdf-page{width:210mm;min-height:297mm;padding:18mm;margin:0;background:#fff;}
.pdf-page-inner{width:174mm;}`
      const pageWrap = (content: string) => `<style>${css}</style><div class="pdf-page"><div class="pdf-page-inner">${content}</div></div>`
      const CONTENT_PX = Math.round(261 * 96 / 25.4)

      const pageHtmls: string[] = []
      let pageContent = ''
      for (const chunk of chunks) {
        container.innerHTML = pageWrap(pageContent + chunk)
        await new Promise(r => setTimeout(r, 30))
        const inner = container.querySelector('.pdf-page-inner') as HTMLElement
        const h = inner ? inner.scrollHeight : 0
        if (h > CONTENT_PX && pageContent) {
          pageHtmls.push(pageWrap(pageContent))
          pageContent = chunk
        } else {
          pageContent += chunk
        }
      }
      if (pageContent) pageHtmls.push(pageWrap(pageContent))

      for (let i = 0; i < pageHtmls.length; i++) {
        if (i > 0) pdf.addPage()
        container.innerHTML = pageHtmls[i]
        await new Promise(r => setTimeout(r, 300))
        const pageEl = container.querySelector('.pdf-page') as HTMLElement
        if (!pageEl) continue
        const canvas = await html2canvas(pageEl, { scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false })
        pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, pdfW, pdfH)
      }

      pdf.save('소그룹-리더가이드-' + editOutput.title.replace(/\s+/g, '-') + '.pdf')
    } catch (err) {
      console.error('PDF generation failed:', err)
      alert('PDF 생성 중 오류가 발생했습니다.')
    } finally {
      setPdfLoading(false)
    }
  }, [editOutput])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f8f9fc] to-white flex items-center justify-center">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-[#e5e8eb]" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary-500 animate-spin" />
        </div>
      </div>
    )
  }

  if (error || !record || !editOutput) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f8f9fc] to-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-[16px] font-bold text-[#191f28] mb-2">불러올 수 없습니다</p>
          <p className="text-[14px] text-[#8b95a1] mb-4">{error || '교재를 찾을 수 없습니다.'}</p>
          <button
            onClick={() => router.push('/study-guide')}
            className="px-5 py-2.5 rounded-xl bg-primary-500 text-white text-[14px] font-bold hover:bg-primary-600 transition-colors"
          >
            목록으로
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f9fc] to-white">
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* 상단 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/study-guide')}
              className="p-2 rounded-lg hover:bg-[#f3f4f6] transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#8b95a1]" />
            </button>
            <div>
              <h1 className="text-[20px] font-extrabold text-[#191f28]">{record.input_data.title}</h1>
              <p className="text-[13px] text-[#8b95a1] mt-0.5">
                {record.input_data.passage}
                {record.is_edited && <span className="ml-2 text-amber-600">· 수정됨</span>}
                <span className="ml-2">· v{record.version}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {editing ? (
              <>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary-500 text-white text-[13px] font-bold hover:bg-primary-600 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  저장
                </button>
                <button
                  onClick={() => {
                    setEditing(false)
                    setEditOutput(record.output_data)
                  }}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#e5e8eb] text-[#8b95a1] text-[13px] font-medium hover:bg-[#f3f4f6] transition-colors"
                >
                  <X className="w-4 h-4" />
                  취소
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#e5e8eb] text-[#4e5968] text-[13px] font-medium hover:bg-[#f3f4f6] transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                  수정
                </button>
                <button
                  onClick={handleRegenerate}
                  disabled={regenerating}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-blue-600 text-white text-[13px] font-bold shadow-sm hover:shadow-md transition-all disabled:opacity-50"
                >
                  {regenerating ? (
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : (
                    <RotateCcw className="w-4 h-4" />
                  )}
                  재생성
                </button>
              </>
            )}
          </div>
        </div>

        {/* 섹션 카드들 */}
        <div className="space-y-4">
          {/* 제목 + 본문 */}
          <SectionCard title="교재 정보">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-primary-50 border border-primary-100">
                <p className="text-[12px] font-bold text-primary-600 mb-1">제목</p>
                {editing ? (
                  <input
                    value={editOutput.title}
                    onChange={e => setEditOutput({ ...editOutput, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#e5e8eb] text-[15px] font-bold text-[#191f28] bg-white outline-none focus:border-primary-400"
                  />
                ) : (
                  <p className="text-[15px] font-bold text-[#191f28]">{editOutput.title}</p>
                )}
              </div>
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                <p className="text-[12px] font-bold text-blue-600 mb-1">본문</p>
                {editing ? (
                  <input
                    value={editOutput.passage}
                    onChange={e => setEditOutput({ ...editOutput, passage: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#e5e8eb] text-[15px] font-bold text-[#191f28] bg-white outline-none focus:border-primary-400"
                  />
                ) : (
                  <p className="text-[15px] font-bold text-[#191f28]">{editOutput.passage}</p>
                )}
              </div>
            </div>
          </SectionCard>

          {/* 포커스 */}
          <SectionCard title="🎯 이번 나눔의 포커스">
            {editing ? (
              <textarea
                value={editOutput.focus}
                onChange={e => setEditOutput({ ...editOutput, focus: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-[#e5e8eb] text-[14px] text-[#4e5968] bg-white outline-none focus:border-primary-400 resize-y"
              />
            ) : (
              <div className="text-[14px] text-[#4e5968] leading-relaxed whitespace-pre-line">{editOutput.focus}</div>
            )}
          </SectionCard>

          {/* 본문 읽기 안내 */}
          <SectionCard title="📖 본문 읽기 안내">
            {editing ? (
              <textarea
                value={editOutput.readingGuide}
                onChange={e => setEditOutput({ ...editOutput, readingGuide: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-[#e5e8eb] text-[14px] text-[#4e5968] bg-white outline-none focus:border-primary-400 resize-y"
              />
            ) : (
              <p className="text-[14px] text-[#4e5968] leading-relaxed">{editOutput.readingGuide}</p>
            )}
          </SectionCard>

          {/* 1. 여는 질문 */}
          <SectionCard title="💬 1. 여는 질문">
            {editing ? (
              <div className="space-y-3">
                {editOutput.openingQuestions.map((q, i) => (
                  <div key={i} className="space-y-1.5">
                    <textarea
                      value={q.text}
                      onChange={e => {
                        const next = [...editOutput.openingQuestions]
                        next[i] = { ...next[i], text: e.target.value }
                        setEditOutput({ ...editOutput, openingQuestions: next })
                      }}
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg border border-[#e5e8eb] text-[14px] text-[#4e5968] bg-white outline-none focus:border-primary-400 resize-y"
                    />
                    <textarea
                      value={q.intention}
                      onChange={e => {
                        const next = [...editOutput.openingQuestions]
                        next[i] = { ...next[i], intention: e.target.value }
                        setEditOutput({ ...editOutput, openingQuestions: next })
                      }}
                      rows={1}
                      placeholder="질문 의도"
                      className="w-full px-3 py-1.5 rounded-lg border border-[#e5e8eb] text-[12px] text-[#8b95a1] bg-white outline-none focus:border-primary-400 resize-y"
                    />
                    <textarea
                      value={q.silenceGuide}
                      onChange={e => {
                        const next = [...editOutput.openingQuestions]
                        next[i] = { ...next[i], silenceGuide: e.target.value }
                        setEditOutput({ ...editOutput, openingQuestions: next })
                      }}
                      rows={1}
                      placeholder="침묵 시"
                      className="w-full px-3 py-1.5 rounded-lg border border-[#e5e8eb] text-[12px] text-[#8b95a1] bg-white outline-none focus:border-primary-400 resize-y"
                    />
                    <textarea
                      value={q.tip}
                      onChange={e => {
                        const next = [...editOutput.openingQuestions]
                        next[i] = { ...next[i], tip: e.target.value }
                        setEditOutput({ ...editOutput, openingQuestions: next })
                      }}
                      rows={1}
                      placeholder="진행 팁"
                      className="w-full px-3 py-1.5 rounded-lg border border-[#e5e8eb] text-[12px] text-[#8b95a1] bg-white outline-none focus:border-primary-400 resize-y"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {editOutput.openingQuestions.map((q, i) => (
                  <OpeningQuestionCard key={i} index={i} question={q} />
                ))}
              </div>
            )}
          </SectionCard>

          {/* 2. 말씀 나눔 */}
          <SectionCard title="💬 2. 말씀 나눔">
            {editing ? (
              <div className="space-y-3">
                {editOutput.sermonDiscussion.map((q, i) => (
                  <div key={i} className="space-y-1.5 p-3 rounded-lg bg-gray-50 border border-[#e5e8eb]">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary-100 text-primary-600">{q.type}</span>
                      <span className="text-[11px] text-[#8b95a1]">질문 {i + 1}</span>
                    </div>
                    <textarea
                      value={q.text}
                      onChange={e => {
                        const next = [...editOutput.sermonDiscussion]
                        next[i] = { ...next[i], text: e.target.value }
                        setEditOutput({ ...editOutput, sermonDiscussion: next })
                      }}
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg border border-[#e5e8eb] text-[14px] text-[#4e5968] bg-white outline-none focus:border-primary-400 resize-y"
                    />
                    <textarea
                      value={q.intention}
                      onChange={e => {
                        const next = [...editOutput.sermonDiscussion]
                        next[i] = { ...next[i], intention: e.target.value }
                        setEditOutput({ ...editOutput, sermonDiscussion: next })
                      }}
                      rows={1}
                      placeholder="질문 의도"
                      className="w-full px-3 py-1.5 rounded-lg border border-[#e5e8eb] text-[12px] text-[#8b95a1] bg-white outline-none focus:border-primary-400 resize-y"
                    />
                    <textarea
                      value={q.expectedAnswer}
                      onChange={e => {
                        const next = [...editOutput.sermonDiscussion]
                        next[i] = { ...next[i], expectedAnswer: e.target.value }
                        setEditOutput({ ...editOutput, sermonDiscussion: next })
                      }}
                      rows={1}
                      placeholder="예상 응답 방향"
                      className="w-full px-3 py-1.5 rounded-lg border border-[#e5e8eb] text-[12px] text-[#8b95a1] bg-white outline-none focus:border-primary-400 resize-y"
                    />
                    {q.silenceGuide !== undefined && (
                      <textarea
                        value={q.silenceGuide ?? ''}
                        onChange={e => {
                          const next = [...editOutput.sermonDiscussion]
                          next[i] = { ...next[i], silenceGuide: e.target.value }
                          setEditOutput({ ...editOutput, sermonDiscussion: next })
                        }}
                        rows={1}
                        placeholder="침묵 시 (선택)"
                        className="w-full px-3 py-1.5 rounded-lg border border-[#e5e8eb] text-[12px] text-[#8b95a1] bg-white outline-none focus:border-primary-400 resize-y"
                      />
                    )}
                    {q.tip !== undefined && (
                      <textarea
                        value={q.tip ?? ''}
                        onChange={e => {
                          const next = [...editOutput.sermonDiscussion]
                          next[i] = { ...next[i], tip: e.target.value }
                          setEditOutput({ ...editOutput, sermonDiscussion: next })
                        }}
                        rows={1}
                        placeholder="진행 팁 (선택)"
                        className="w-full px-3 py-1.5 rounded-lg border border-[#e5e8eb] text-[12px] text-[#8b95a1] bg-white outline-none focus:border-primary-400 resize-y"
                      />
                    )}
                    <textarea
                      value={q.reference}
                      onChange={e => {
                        const next = [...editOutput.sermonDiscussion]
                        next[i] = { ...next[i], reference: e.target.value }
                        setEditOutput({ ...editOutput, sermonDiscussion: next })
                      }}
                      rows={1}
                      placeholder="참고 성경구절"
                      className="w-full px-3 py-1.5 rounded-lg border border-[#e5e8eb] text-[12px] text-[#8b95a1] bg-white outline-none focus:border-primary-400 resize-y"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {editOutput.sermonDiscussion.map((q, i) => (
                  <SermonDiscussionCard key={i} index={i} question={q} />
                ))}
              </div>
            )}
          </SectionCard>

          {/* 3. 삶의 적용 */}
          <SectionCard title="💬 3. 삶의 적용">
            {editing ? (
              <div className="space-y-3">
                {editOutput.lifeApplication.map((q, i) => (
                  <div key={i} className="space-y-1.5">
                    <textarea
                      value={q.text}
                      onChange={e => {
                        const next = [...editOutput.lifeApplication]
                        next[i] = { ...next[i], text: e.target.value }
                        setEditOutput({ ...editOutput, lifeApplication: next })
                      }}
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg border border-[#e5e8eb] text-[14px] text-[#4e5968] bg-white outline-none focus:border-primary-400 resize-y"
                    />
                    <textarea
                      value={q.intention}
                      onChange={e => {
                        const next = [...editOutput.lifeApplication]
                        next[i] = { ...next[i], intention: e.target.value }
                        setEditOutput({ ...editOutput, lifeApplication: next })
                      }}
                      rows={1}
                      placeholder="질문 의도"
                      className="w-full px-3 py-1.5 rounded-lg border border-[#e5e8eb] text-[12px] text-[#8b95a1] bg-white outline-none focus:border-primary-400 resize-y"
                    />
                    {q.silenceGuide !== undefined && (
                      <textarea
                        value={q.silenceGuide ?? ''}
                        onChange={e => {
                          const next = [...editOutput.lifeApplication]
                          next[i] = { ...next[i], silenceGuide: e.target.value }
                          setEditOutput({ ...editOutput, lifeApplication: next })
                        }}
                        rows={1}
                        placeholder="침묵 시 (선택)"
                        className="w-full px-3 py-1.5 rounded-lg border border-[#e5e8eb] text-[12px] text-[#8b95a1] bg-white outline-none focus:border-primary-400 resize-y"
                      />
                    )}
                    <textarea
                      value={q.tip}
                      onChange={e => {
                        const next = [...editOutput.lifeApplication]
                        next[i] = { ...next[i], tip: e.target.value }
                        setEditOutput({ ...editOutput, lifeApplication: next })
                      }}
                      rows={1}
                      placeholder="진행 팁"
                      className="w-full px-3 py-1.5 rounded-lg border border-[#e5e8eb] text-[12px] text-[#8b95a1] bg-white outline-none focus:border-primary-400 resize-y"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {editOutput.lifeApplication.map((q, i) => (
                  <LifeApplicationCard key={i} index={i} question={q} />
                ))}
              </div>
            )}
          </SectionCard>

          {/* 함께 기도 */}
          <SectionCard title="🙏 함께 기도">
            {editing ? (
              <div className="space-y-2">
                {editOutput.prayerTopics.map((item, i) => (
                  <textarea
                    key={i}
                    value={item}
                    onChange={e => {
                      const next = [...editOutput.prayerTopics]
                      next[i] = e.target.value
                      setEditOutput({ ...editOutput, prayerTopics: next })
                    }}
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-[#e5e8eb] text-[14px] text-[#4e5968] bg-white outline-none focus:border-primary-400 resize-y"
                  />
                ))}
              </div>
            ) : (
              <ul className="space-y-2">
                {editOutput.prayerTopics.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[14px] text-[#4e5968] leading-relaxed">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-primary-100 text-primary-600 text-[11px] font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>

        {/* 하단 액션 */}
        <div className="flex items-center justify-center gap-3 mt-8 pb-10">
          <button
            onClick={handleCopyAll}
            className="flex items-center gap-1.5 px-6 py-3 rounded-xl border border-[#e5e8eb] text-[#4e5968] text-[14px] font-medium hover:bg-[#f3f4f6] transition-colors"
          >
            {copied ? <CheckCheck className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            {copied ? '복사됨' : '전체 복사'}
          </button>
          <button
            onClick={handleDownloadPdf}
            disabled={pdfLoading}
            className="flex items-center gap-1.5 px-6 py-3 rounded-xl bg-primary-500 text-white text-[14px] font-bold hover:bg-primary-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pdfLoading ? (
              <><div className="relative w-4 h-4"><div className="absolute inset-0 rounded-full border-2 border-white/30" /><div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white animate-spin" /></div>생성 중...</>
            ) : (
              <><FileDown className="w-4 h-4" />PDF 다운로드</>
            )}
          </button>
        </div>
      </div>

      <div ref={pdfRef} className="fixed -left-[9999px] top-0" />
    </div>
  )
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-5 rounded-xl bg-white border border-[#e5e8eb]">
      <p className="text-[14px] font-bold text-[#191f28] mb-3">{title}</p>
      {children}
    </div>
  )
}

function OpeningQuestionCard({ index, question }: { index: number; question: OpeningQuestion }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-xl border border-[#e5e8eb] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start gap-2.5 p-3 hover:bg-[#f8f9fc] transition-colors text-left"
      >
        <span className="shrink-0 w-5 h-5 rounded-full bg-primary-100 text-primary-600 text-[11px] font-bold flex items-center justify-center mt-0.5">
          {index + 1}
        </span>
        <span className="flex-1 text-[14px] text-[#4e5968] leading-relaxed">{question.text}</span>
        {open ? <ChevronUp className="w-4 h-4 text-[#8b95a1] mt-1 shrink-0" /> : <ChevronDown className="w-4 h-4 text-[#8b95a1] mt-1 shrink-0" />}
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-1.5 border-t border-[#e5e8eb]">
          <SubField label="질문 의도" value={question.intention} />
          <SubField label="침묵 시" value={question.silenceGuide} />
          <SubField label="진행 팁" value={question.tip} />
        </div>
      )}
    </div>
  )
}

function SermonDiscussionCard({ index, question }: { index: number; question: SermonDiscussionQuestion }) {
  const [open, setOpen] = useState(false)
  const typeColor = question.type === '관찰' ? 'bg-blue-100 text-blue-600' : question.type === '해석' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
  return (
    <div className="rounded-xl border border-[#e5e8eb] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start gap-2.5 p-3 hover:bg-[#f8f9fc] transition-colors text-left"
      >
        <span className="shrink-0 w-5 h-5 rounded-full bg-primary-100 text-primary-600 text-[11px] font-bold flex items-center justify-center mt-0.5">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <span className="inline-block text-[11px] font-bold px-1.5 py-0.5 rounded-full {typeColor} mb-1">{question.type}</span>
          <p className="text-[14px] text-[#4e5968] leading-relaxed">{question.text}</p>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-[#8b95a1] mt-1 shrink-0" /> : <ChevronDown className="w-4 h-4 text-[#8b95a1] mt-1 shrink-0" />}
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-1.5 border-t border-[#e5e8eb]">
          <SubField label="질문 의도" value={question.intention} />
          <SubField label="예상 응답 방향" value={question.expectedAnswer} />
          {question.silenceGuide && <SubField label="침묵 시" value={question.silenceGuide} />}
          {question.tip && <SubField label="진행 팁" value={question.tip} />}
          <SubField label="참고" value={question.reference} />
        </div>
      )}
    </div>
  )
}

function LifeApplicationCard({ index, question }: { index: number; question: LifeApplicationQuestion }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-xl border border-[#e5e8eb] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start gap-2.5 p-3 hover:bg-[#f8f9fc] transition-colors text-left"
      >
        <span className="shrink-0 w-5 h-5 rounded-full bg-primary-100 text-primary-600 text-[11px] font-bold flex items-center justify-center mt-0.5">
          {index + 1}
        </span>
        <span className="flex-1 text-[14px] text-[#4e5968] leading-relaxed">{question.text}</span>
        {open ? <ChevronUp className="w-4 h-4 text-[#8b95a1] mt-1 shrink-0" /> : <ChevronDown className="w-4 h-4 text-[#8b95a1] mt-1 shrink-0" />}
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-1.5 border-t border-[#e5e8eb]">
          <SubField label="질문 의도" value={question.intention} />
          {question.silenceGuide && <SubField label="침묵 시" value={question.silenceGuide} />}
          <SubField label="진행 팁" value={question.tip} />
        </div>
      )}
    </div>
  )
}

function SubField({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-[12px] leading-relaxed pl-3">
      <span className="font-bold text-[#8b95a1]">· {label}: </span>
      <span className="text-[#6b7280]">{value}</span>
    </div>
  )
}
