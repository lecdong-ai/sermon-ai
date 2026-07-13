'use client'

import { useState } from 'react'
import { BookOpen, Sparkles, Loader2, Copy, Check, ChevronDown, ChevronUp, Settings2 } from 'lucide-react'

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

interface QTFormData {
  bibleBook: string
  weekNumber: number
  weekPosition: string
  startPassage: string
  endPassage: string
  audience: string
  level: string
  useCase: string
  tone: string
  questionIntensity: string
  applicationIntensity: string
  bibleTextPolicy: string
  verseQuoteLimit: string
  readingGuideMode: string
  pdfPurpose: string
  sizeOption: string
  designMood: string
  colorMood: string
  seriesName: string
  subtitle: string
  churchNameOption: string
  churchName: string
  outputGoal: string
  requiredElements: string
  avoidDirections: string
}

const defaultForm: QTFormData = {
  bibleBook: '',
  weekNumber: 1,
  weekPosition: '',
  startPassage: '',
  endPassage: '',
  audience: '일반 성도',
  level: '중',
  useCase: '개인 큐티',
  tone: '정중하고 따뜻한',
  questionIntensity: '중',
  applicationIntensity: '중',
  bibleTextPolicy: '본문 범위 명시, 핵심 구절 발췌',
  verseQuoteLimit: '2-3절',
  readingGuideMode: '관찰 포인트 제시',
  pdfPurpose: '개인 경건 훈련',
  sizeOption: 'A5',
  designMood: '정갈하고 고급스러운',
  colorMood: '차분한 따뜻함',
  seriesName: '말씀과 함께하는 큐티',
  subtitle: '',
  churchNameOption: '표기 안 함',
  churchName: '',
  outputGoal: '7일분 큐티 소책자 완성',
  requiredElements: '전체 구조 준수',
  avoidDirections: '도덕주의, 감상주의',
}

interface QTResult {
  projectOverview: string
  weeklySchedule: string
  fullManuscript: string
  pdfGuide: string
  metadata: string
}

export default function QtGenerator() {
  const [form, setForm] = useState<QTFormData>(defaultForm)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState<QTResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  const update = (patch: Partial<QTFormData>) => setForm(prev => ({ ...prev, ...patch }))

  const fields = [
    { key: 'audience', label: '대상 독자', options: ['초신자', '일반 성도', '청년', '장년', '온 가족'] },
    { key: 'level', label: '난이도', options: ['초급', '중', '중상', '심화'] },
    { key: 'useCase', label: '사용 환경', options: ['개인 큐티', '가족 나눔', '소그룹', '교회 공용'] },
  ] as const

  const advancedFields = [
    { key: 'tone', label: '전체 톤', options: ['정중하고 따뜻한', '직설적이고 도전적인', '부드럽고 배려있는', '엄숙하고 경건한'] },
    { key: 'questionIntensity', label: '질문 강도', options: ['약', '중', '강', '매우 강'] },
    { key: 'applicationIntensity', label: '적용 강도', options: ['약', '중', '강', '매우 강'] },
    { key: 'bibleTextPolicy', label: '본문 정책', options: ['본문 범위 명시, 핵심 구절 발췌', '가능한 한 본문 전체 인용', '핵심 구절만 인용'] },
    { key: 'sizeOption', label: '판형', options: ['A5', 'B5', 'A4', '모바일 최적화'] },
    { key: 'designMood', label: '디자인 분위기', options: ['정갈하고 고급스러운', '미니멀하고 모던한', '따뜻하고 아날로그한', '클래식한'] },
    { key: 'colorMood', label: '컬러 분위기', options: ['차분한 따뜻함', '청량하고 맑은', '어두운 우아함', '자연 친화적'] },
    { key: 'pdfPurpose', label: 'PDF 목적', options: ['개인 경건 훈련', '교회 배포', '소그룹 교재', '판매용'] },
    { key: 'seriesName', label: '시리즈명', custom: true },
    { key: 'subtitle', label: '부제', custom: true },
    { key: 'churchName', label: '교회명', custom: true, depends: 'churchNameOption' },
  ] as const

  const handleGenerate = async () => {
    if (!form.bibleBook) return
    setGenerating(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/advanced/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'qt',
          data: form,
        }),
      })
      const json = await res.json()
      if (json.success) {
        const output = json.data.output
        setResult({
          projectOverview: extractSection(output, '1.', '2.'),
          weeklySchedule: extractSection(output, '2.', '3.'),
          fullManuscript: extractSection(output, '3.', '4.'),
          pdfGuide: extractSection(output, '4.', '5.'),
          metadata: extractSection(output, '5.', null),
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
    ].filter(Boolean).join('\n\n---\n\n')
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-400" />
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-500">큐티 자료 생성</h2>
          <span className="text-[10px] text-slate-600 font-medium">· QT Booklet Generator</span>
        </div>
      </div>

      <div className="glass-dark rounded-2xl border border-white/5 p-6 space-y-4">
        {/* 기본 정보 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500">성경권</label>
            <select
              value={form.bibleBook}
              onChange={e => update({ bibleBook: e.target.value })}
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
              type="number" min={1} max={200}
              value={form.weekNumber}
              onChange={e => update({ weekNumber: Math.max(1, parseInt(e.target.value) || 1) })}
              className="w-full bg-[#070b18] border border-white/5 rounded-xl px-4 py-3 text-[13px] text-slate-100 outline-none focus:ring-2 focus:ring-emerald-400/20 focus:border-emerald-400"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500">전체 주차 중 위치 (예: 3/52)</label>
            <input
              type="text"
              value={form.weekPosition}
              onChange={e => update({ weekPosition: e.target.value })}
              placeholder="예: 3/52"
              className="w-full bg-[#070b18] border border-white/5 rounded-xl px-4 py-3 text-[13px] text-slate-100 outline-none focus:ring-2 focus:ring-emerald-400/20 focus:border-emerald-400"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500">시작 본문</label>
            <input
              type="text"
              value={form.startPassage}
              onChange={e => update({ startPassage: e.target.value })}
              placeholder="예: 창 1:1"
              className="w-full bg-[#070b18] border border-white/5 rounded-xl px-4 py-3 text-[13px] text-slate-100 outline-none focus:ring-2 focus:ring-emerald-400/20 focus:border-emerald-400"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500">종료 본문</label>
            <input
              type="text"
              value={form.endPassage}
              onChange={e => update({ endPassage: e.target.value })}
              placeholder="예: 창 1:31"
              className="w-full bg-[#070b18] border border-white/5 rounded-xl px-4 py-3 text-[13px] text-slate-100 outline-none focus:ring-2 focus:ring-emerald-400/20 focus:border-emerald-400"
            />
          </div>
        </div>

        {/* 독자 정보 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {fields.map(f => (
            <div key={f.key} className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500">{f.label}</label>
              <select
                value={String((form as any)[f.key])}
                onChange={e => update({ [f.key]: e.target.value } as any)}
                className="w-full bg-[#070b18] border border-white/5 rounded-xl px-4 py-3 text-[13px] text-slate-100 outline-none focus:ring-2 focus:ring-emerald-400/20 focus:border-emerald-400 appearance-none"
              >
                {f.options.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          ))}
        </div>

        {/* 고급 설정 토글 */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 hover:text-slate-300 transition-colors"
        >
          <Settings2 className="w-3.5 h-3.5" />
          {showAdvanced ? '고급 설정 숨기기' : '고급 설정'}
        </button>

        {showAdvanced && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 border-t border-white/5">
            {advancedFields.map(f => {
              if ('depends' in f && f.depends && form.churchNameOption !== '표기') return null
              if ('custom' in f && f.custom) {
                return (
                  <div key={f.key} className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500">{f.label}</label>
                    <input
                      type="text"
                      value={String((form as any)[f.key] || '')}
                      onChange={e => update({ [f.key]: e.target.value } as any)}
                      placeholder={f.label}
                      className="w-full bg-[#070b18] border border-white/5 rounded-xl px-4 py-3 text-[13px] text-slate-100 outline-none focus:ring-2 focus:ring-emerald-400/20 focus:border-emerald-400"
                    />
                  </div>
                )
              }
              return (
                <div key={f.key} className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500">{f.label}</label>
                  <select
                    value={String((form as any)[f.key])}
                    onChange={e => update({ [f.key]: e.target.value } as any)}
                    className="w-full bg-[#070b18] border border-white/5 rounded-xl px-4 py-3 text-[13px] text-slate-100 outline-none focus:ring-2 focus:ring-emerald-400/20 focus:border-emerald-400 appearance-none"
                  >
                    {(f as any).options.map((o: string) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              )
            })}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500">교회명 표기</label>
              <select
                value={form.churchNameOption}
                onChange={e => update({ churchNameOption: e.target.value })}
                className="w-full bg-[#070b18] border border-white/5 rounded-xl px-4 py-3 text-[13px] text-slate-100 outline-none focus:ring-2 focus:ring-emerald-400/20 focus:border-emerald-400 appearance-none"
              >
                <option value="표기 안 함">표기 안 함</option>
                <option value="표기">표기</option>
              </select>
            </div>
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={!form.bibleBook || generating}
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
              <span className="text-emerald-400 font-bold">{form.bibleBook}</span> {form.weekNumber}주차 큐티 소책자
            </p>
            <button
              onClick={handleCopyAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-[11px] font-bold transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? '복사됨' : '전체 복사'}
            </button>
          </div>

          {[
            { key: 'projectOverview', label: '성경권 전체 설계 개요', content: result.projectOverview },
            { key: 'weeklySchedule', label: '이번 주 7일 편성표', content: result.weeklySchedule },
            { key: 'fullManuscript', label: '주간 소책자 완성 원고', content: result.fullManuscript },
            { key: 'pdfGuide', label: 'PDF 편집 가이드', content: result.pdfGuide },
            { key: 'metadata', label: '완간본 누적용 메타데이터', content: result.metadata },
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
