'use client'

import { useState } from 'react'
import { BookOpen, Sparkles, Loader2, Copy, Check, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react'

const BIBLE_BOOKS = [
  '창세기', '출애굽기', '레위기', '민수기', '신명기',
  '여호수아', '사사기', '룻기', '사무엘상', '사무엘하',
  '열왕기상', '열왕기하', '역대상', '역대하', '에스라',
  '느헤미야', '에스더', '욥기', '시편', '잠언',
  '전도서', '아가', '이사야', '예레미야', '예레미야애가',
  '에스겔', '다니엘', '호세아', '요엘', '아모스',
  '오바댜', '요나', '미가', '나훔', '하박국',
  '스바냐', '학개', '스가랴', '말라기',
  '마태복음', '마가복음', '누가복음', '요한복음',
  '사도행전', '로마서', '고린도전서', '고린도후서',
  '갈라디아서', '에베소서', '빌립보서', '골로새서',
  '데살로니가전서', '데살로니가후서', '디모데전서', '디모데후서',
  '디도서', '빌레몬서', '히브리서', '야고보서',
  '베드로전서', '베드로후서', '요한1서', '요한2서', '요한3서',
  '유다서', '요한계시록',
]

interface QTResult {
  projectOverview: string
  weeklySchedule: string
  fullManuscript: string
  pdfGuide: string
  metadata: string
}

export default function QtGenerator() {
  const [bibleBook, setBibleBook] = useState('')
  const [weekNumber, setWeekNumber] = useState(1)
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState<QTResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!bibleBook) return
    setGenerating(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/advanced/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'qt',
          data: { bibleBook, weekNumber },
        }),
      })
      const json = await res.json()
      if (json.success) {
        const output = json.data.output
        setResult({
          projectOverview: extractSection(output, 'A.', 'B.'),
          weeklySchedule: extractSection(output, 'B.', 'C.'),
          fullManuscript: extractSection(output, 'C.', 'D.'),
          pdfGuide: extractSection(output, 'D.', 'E.'),
          metadata: extractSection(output, 'E.', null),
        })
        setExpandedSection('fullManuscript')
      } else {
        setError(json.error || '생성 실패')
      }
    } catch (e: any) {
      setError(e.message || '요청 실패')
    }
    setGenerating(false)
  }

  const handleCopyAll = async () => {
    if (!result) return
    const text = [
      result.projectOverview,
      result.weeklySchedule,
      result.fullManuscript,
      result.pdfGuide,
      result.metadata,
    ].filter(Boolean).join('\n\n')
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="space-y-5">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-400" />
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-500">큐티 자료 생성</h2>
          <span className="text-[10px] text-slate-600 font-medium">· QT Booklet Generator</span>
        </div>
      </div>

      {/* 입력 폼 */}
      <div className="glass-dark rounded-2xl border border-white/5 p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500">성경권</label>
            <select
              value={bibleBook}
              onChange={e => setBibleBook(e.target.value)}
              className="w-full bg-[#070b18] border border-white/5 rounded-xl px-4 py-3 text-[13px] text-slate-100 outline-none focus:ring-2 focus:ring-emerald-400/20 focus:border-emerald-400 appearance-none"
            >
              <option value="">선택하세요</option>
              {BIBLE_BOOKS.map(book => (
                <option key={book} value={book}>{book}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500">주차</label>
            <input
              type="number"
              min={1}
              max={200}
              value={weekNumber}
              onChange={e => setWeekNumber(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full bg-[#070b18] border border-white/5 rounded-xl px-4 py-3 text-[13px] text-slate-100 outline-none focus:ring-2 focus:ring-emerald-400/20 focus:border-emerald-400"
            />
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!bibleBook || generating}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold text-[13px] hover:from-emerald-500 hover:to-green-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-emerald-600/20"
        >
          {generating ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> 생성 중...</>
          ) : (
            <><Sparkles className="w-4 h-4" /> 큐티 소책자 생성</>
          )}
        </button>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-3 text-[12px] text-rose-300 font-medium">
            {error}
          </div>
        )}
      </div>

      {/* 결과 */}
      {result && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-slate-500 font-medium">
              <span className="text-emerald-400 font-bold">{bibleBook}</span> {weekNumber}주차 큐티 소책자
            </p>
            <button
              onClick={handleCopyAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-[11px] font-bold transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? '복사됨' : '전체 복사'}
            </button>
          </div>

          {/* 접이식 섹션들 */}
          {[
            { key: 'projectOverview', label: '프로젝트 개요', content: result.projectOverview },
            { key: 'weeklySchedule', label: '주간 편성표', content: result.weeklySchedule },
            { key: 'fullManuscript', label: '전체 원고', content: result.fullManuscript },
            { key: 'pdfGuide', label: 'PDF 편집 가이드', content: result.pdfGuide },
            { key: 'metadata', label: '완간본 메타데이터', content: result.metadata },
          ].map(section => section.content ? (
            <div key={section.key} className="glass-dark rounded-2xl border border-white/5 overflow-hidden">
              <button
                onClick={() => setExpandedSection(expandedSection === section.key ? null : section.key)}
                className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.03] transition-colors"
              >
                <span className="text-[12px] font-bold text-slate-300">{section.label}</span>
                {expandedSection === section.key
                  ? <ChevronUp className="w-4 h-4 text-slate-500" />
                  : <ChevronDown className="w-4 h-4 text-slate-500" />
                }
              </button>
              {expandedSection === section.key && (
                <div className="px-5 pb-5">
                  <pre className="text-[12px] text-slate-300 font-sans leading-relaxed whitespace-pre-wrap bg-[#060a17] rounded-xl p-4 border border-white/5 max-h-[60vh] overflow-y-auto scrollbar-thin">
                    {section.content}
                  </pre>
                </div>
              )}
            </div>
          ) : null)}
        </div>
      )}
    </section>
  )
}

function extractSection(text: string, startMarker: string, endMarker: string | null): string {
  const startIdx = text.indexOf(startMarker)
  if (startIdx === -1) return ''
  const fromStart = text.slice(startIdx)
  if (!endMarker) return fromStart.trim()
  const endIdx = fromStart.indexOf(endMarker)
  if (endIdx === -1) return fromStart.trim()
  return fromStart.slice(0, endIdx).trim()
}
