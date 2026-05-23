'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, FileText, Sparkles, Download, Loader2 } from 'lucide-react'
import type { SermonWorkspace } from '@/types'

export default function SermonPreviewPage() {
  const params = useParams()
  const router = useRouter()
  const [sermon, setSermon] = useState<SermonWorkspace | null>(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzeError, setAnalyzeError] = useState('')
  const [pdfLoading, setPdfLoading] = useState(false)
  const [bibleText, setBibleText] = useState('')
  const [bibleLoading, setBibleLoading] = useState(false)

  useEffect(() => {
    fetch(`/api/sermons/${params.id}`)
      .then(r => r.json())
      .then(json => {
        if (json.success) setSermon(json.data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [params.id])

  useEffect(() => {
    if (!sermon?.passage) return
    setBibleLoading(true)
    fetch('/api/bible', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passage: sermon.passage }),
    }).then(r => r.json()).then(json => { if (json.success) setBibleText(json.text) })
      .catch(() => {}).finally(() => setBibleLoading(false))
  }, [sermon?.passage])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-[#e5e8eb]" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary-500 animate-spin" />
        </div>
      </div>
    )
  }

  const handleAnalyze = async () => {
    if (!sermon) return
    setAnalyzing(true)
    setAnalyzeError('')
    try {
      const res = await fetch('/api/sermons/' + sermon.id + '/analyze', { method: 'POST' })
      const json = await res.json()
      if (json.success) {
        window.open('/workspace?id=' + json.data.sermonId, '_blank')
      } else {
        setAnalyzeError(json.error || '분석 실패')
      }
    } catch {
      setAnalyzeError('네트워크 오류')
    } finally {
      setAnalyzing(false)
    }
  }

  const downloadPdf = () => {
    if (!sermon) return
    window.print()
  }

  if (!sermon) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-[#8b95a1]">설교를 찾을 수 없습니다</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="no-print sticky top-0 bg-white border-b border-[#e5e8eb] px-4 py-3 z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button onClick={() => router.push(`/sermon/${sermon.id}`)} className="flex items-center gap-1.5 text-[13px] text-[#8b95a1] hover:text-[#191f28] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            편집으로 돌아가기
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={downloadPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#e5e8eb] text-[#191f28] text-[12px] font-bold hover:bg-[#f8f9fc] transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              PDF 다운로드
            </button>
            <button
              onClick={handleAnalyze}
              disabled={analyzing || !sermon?.manuscript}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-primary-500 to-blue-600 text-white text-[12px] font-bold hover:shadow-md transition-all disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {analyzing ? '분석 중...' : 'AI 분석 실행하기'}
            </button>
            {analyzeError && <span className="text-[11px] text-red-500">{analyzeError}</span>}
          </div>
        </div>
      </header>

      <style>{`@media print { @page { margin: 15mm; } body { margin: 0; padding: 0; } .no-print, header { display: none !important; } #pdf-content { padding: 0 !important; max-width: 100% !important; } #pdf-content h1 { font-size: 20pt; margin-top: 0; } .break-avoid { page-break-inside: avoid; } }`}</style>

      <main id="pdf-content" className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8 text-center">
          <h1 className="text-[28px] font-extrabold text-[#191f28] mb-2">{sermon.title || '제목 없음'}</h1>
          <div className="flex items-center justify-center gap-3 text-[14px] text-[#8b95a1]">
            <span>{sermon.passage}</span>
            {sermon.sermon_date && (
              <>
                <span>|</span>
                <span>{new Date(sermon.sermon_date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </>
            )}
          </div>
        </div>

        {sermon.outline && sermon.outline.main_points.length > 0 && (
          <div className="mb-8 p-5 break-avoid rounded-xl bg-[#f8f9fc] border border-[#e5e8eb]">
            <h2 className="text-[16px] font-bold text-[#191f28] mb-3">설교 개요</h2>
            {sermon.outline.introduction && (
              <p className="text-[14px] text-[#4e5968] mb-3"><strong>서론:</strong> {sermon.outline.introduction}</p>
            )}
            <ol className="space-y-2 mb-3">
              {sermon.outline.main_points.map((p, i) => (
                <li key={i} className="text-[14px] text-[#4e5968]">
                  <strong>{i + 1}. {p.title}</strong>
                  {p.content && <p className="text-[13px] text-[#8b95a1] ml-4">{p.content}</p>}
                </li>
              ))}
            </ol>
            {sermon.outline.conclusion && (
              <p className="text-[14px] text-[#4e5968]"><strong>결론:</strong> {sermon.outline.conclusion}</p>
            )}
          </div>
        )}

        {sermon.manuscript ? (
          <div className="text-[16px] text-[#191f28] leading-[1.9] whitespace-pre-wrap">
            {sermon.manuscript}
          </div>
        ) : (
          <div className="text-center py-16 text-[#8b95a1]">
            <FileText className="w-12 h-12 mx-auto mb-3 text-[#e5e8eb]" />
            <p>아직 작성된 원고가 없습니다</p>
          </div>
        )}
      </main>
    </div>
  )
}
