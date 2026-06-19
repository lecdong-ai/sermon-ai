'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/lib/dashboard/store'
import { Sermon } from '@/lib/dashboard/types'
import { buildWizardContext, PROMPTS } from '@/lib/dashboard/sermonWizardPrompts'
import { ALL_THEMES, MAJOR_THEMES, SITUATION_TAGS, EMOTION_TAGS } from '@/lib/dashboard/constants'
import {
  ArrowLeft, Sparkles, Loader2, Check, ChevronDown, ChevronRight,
  BookOpen, MessageSquare, Layers, FileText, Pen, Compass, Zap, Tags, Network, X, Eye, Users, Lightbulb,
} from 'lucide-react'

/* ─── Types ─── */
interface WizardState {
  bibleBook: string
  chapterStart: string
  verseStart: string
  chapterEnd: string
  verseEnd: string
  bibleText: string
  title: string
  coreMessage: string
  observationNotes: string
  audienceProfile: string
  audienceNeeds: string
  applicationDirection: string
  outlinePoints: string[]
  outlineDetails: string[]
  gospelConnections: string[]
  bodySections: { exegesis: string; illustration: string; application: string }[]
  introduction: string
  conclusion: string
  manuscript: string
}

const EMPTY: WizardState = {
  bibleBook: '', chapterStart: '', verseStart: '', chapterEnd: '', verseEnd: '',
  bibleText: '', title: '', coreMessage: '',
  observationNotes: '',
  audienceProfile: '', audienceNeeds: '', applicationDirection: '',
  outlinePoints: ['', '', ''], outlineDetails: ['', '', ''], gospelConnections: ['', '', ''],
  bodySections: [{ exegesis: '', illustration: '', application: '' }, { exegesis: '', illustration: '', application: '' }, { exegesis: '', illustration: '', application: '' }],
  introduction: '', conclusion: '', manuscript: '',
}

/* ─── Step completion checks ─── */
function stepDone(s: WizardState, step: number): boolean {
  switch (step) {
    case 1: return !!s.bibleBook
    case 2: return stepDone(s, 1) && !!s.coreMessage
    case 3: return stepDone(s, 2) && !!s.audienceProfile
    case 4: return stepDone(s, 3) && s.outlinePoints.every(p => !!p.trim())
    case 5: return stepDone(s, 4) && s.bodySections.every(b => !!b.exegesis)
    case 6: return stepDone(s, 5) && !!s.introduction && !!s.conclusion
    case 7: return stepDone(s, 6) && !!s.manuscript
    case 8: return stepDone(s, 7)
    default: return false
  }
}

/* ─── Step components ─── */
function StepContainer({ num, title, icon: Icon, isActive, isDone, onSelect, children }: {
  num: number; title: string; icon: any; isActive: boolean; isDone: boolean; onSelect: () => void; children: React.ReactNode
}) {
  return (
    <div className={`border rounded-lg transition-all duration-300 ${isActive ? 'border-primary shadow-sm' : isDone ? 'border-green-200 bg-green-50/30' : 'border-border bg-white/50'}`}>
      <div className="flex items-center gap-3 px-5 py-3.5 cursor-pointer hover:bg-black/[0.02] transition-colors" onClick={onSelect}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${isDone ? 'bg-green-500 text-white' : isActive ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
          {isDone ? <Check className="w-4 h-4" /> : num}
        </div>
        <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : isDone ? 'text-green-600' : 'text-gray-400'}`} />
        <span className={`text-sm font-semibold ${isActive ? 'text-foreground' : isDone ? 'text-green-700' : 'text-gray-400'}`}>{title}</span>
        {isDone && <span className="text-[11px] text-green-600 font-medium ml-auto">완료</span>}
        {isActive && <span className="text-[11px] text-primary font-medium ml-auto">현재 단계</span>}
        {!isActive && !isDone && (
          <span className="text-[11px] text-gray-400 font-medium ml-auto flex items-center gap-0.5">
            <ChevronDown className="w-3 h-3" /> 펼치기
          </span>
        )}
      </div>
      {isActive && <div className="px-5 pb-5 pt-1 border-t border-border">{children}</div>}
    </div>
  )
}

function parsePassageString(passage: string): Partial<WizardState> {
  const match = passage.match(/^(.+?)\s*(\d+)\s*:\s*(\d+)\s*(-\s*(\d+))?$/)
  if (match) {
    return {
      bibleBook: match[1].trim(),
      chapterStart: match[2],
      verseStart: match[3],
      verseEnd: match[5] || '',
      chapterEnd: '',
    }
  }
  const chapterOnly = passage.match(/^(.+?)\s*(\d+)$/)
  if (chapterOnly) {
    return {
      bibleBook: chapterOnly[1].trim(),
      chapterStart: chapterOnly[2],
      verseStart: '1',
      verseEnd: '',
      chapterEnd: '',
    }
  }
  return {}
}

function sermonToWizardState(sermon: Sermon, snapshot?: any): WizardState {
  if (snapshot) {
    return { ...EMPTY, ...snapshot }
  }
  const pts: string[] = []
  const dets: string[] = []
  ;[sermon.outlinePoint1 || '', sermon.outlinePoint2 || '', sermon.outlinePoint3 || ''].forEach(p => {
    const sep = p.indexOf(' — ')
    if (sep > 0) {
      pts.push(p.slice(0, sep))
      dets.push(p.slice(sep + 3))
    } else {
      pts.push(p)
      dets.push('')
    }
  })
  return {
    bibleBook: sermon.bibleBook || '',
    chapterStart: String(sermon.chapterStart || ''),
    verseStart: String(sermon.verseStart || ''),
    chapterEnd: String(sermon.chapterEnd || ''),
    verseEnd: String(sermon.verseEnd || ''),
    bibleText: '',
    title: sermon.title || '',
    coreMessage: sermon.coreMessage || '',
    observationNotes: '',
    audienceProfile: '', audienceNeeds: '', applicationDirection: '',
    outlinePoints: pts as [string, string, string],
    outlineDetails: dets as [string, string, string],
    gospelConnections: ['', '', ''],
    bodySections: [
      { exegesis: '', illustration: '', application: '' },
      { exegesis: '', illustration: '', application: '' },
      { exegesis: '', illustration: '', application: '' },
    ],
    introduction: sermon.outlineIntro || '',
    conclusion: sermon.outlineConclusion || '',
    manuscript: sermon.manuscript || '',
  }
}

/* ─── Main Component ─── */
export default function SermonWizard({ initialTitle, initialPassage, initialDate, editId }: {
  initialTitle?: string
  initialPassage?: string
  initialDate?: string
  editId?: string
}) {
  const router = useRouter()
  const { state, createSermon, updateSermon, getSermon } = useApp()
  const [editLoaded, setEditLoaded] = useState(false)
  const [editError, setEditError] = useState('')
  const [s, setS] = useState<WizardState>(() => {
    const parsed = initialPassage ? parsePassageString(initialPassage) : {}
    return { ...EMPTY, ...parsed, title: initialTitle || '' }
  })
  const [activeStep, setActiveStep] = useState(1)
  const [loading, setLoading] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [suggestionsOpen, setSuggestionsOpen] = useState<string | null>(null)
  const [suggestionsCache, setSuggestionsCache] = useState<Record<string, { value: string; reason: string }[]>>({})
  const [suggestionsLoading, setSuggestionsLoading] = useState<string | null>(null)
  const [reviewResult, setReviewResult] = useState<any>(null)
  const [reviewLoading, setReviewLoading] = useState(false)
  const [bibleLoading, setBibleLoading] = useState(false)

  // ── Tag selection state ──
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [aiAnalyzing, setAiAnalyzing] = useState(false)

  const toggleTag = useCallback((id: string) => {
    setSelectedTagIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }, [])

  const handleAnalyzeTags = async () => {
    setAiAnalyzing(true)
    try {
      const res = await fetch('/api/analyze-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          manuscript: s.manuscript,
          coreMessage: s.coreMessage,
          outlinePoints: s.outlinePoints.filter(Boolean),
          title: s.title,
          passage: `${s.bibleBook} ${s.chapterStart}:${s.verseStart}${s.verseEnd ? '-' + s.verseEnd : ''}`,
          allThemes: ALL_THEMES.map(t => ({ id: t.id, name: t.name, category: t.category })),
        }),
      })
      const json = await res.json()
      if (json.success && json.tags?.length) {
        setSelectedTagIds(prev => Array.from(new Set([...prev, ...json.tags])))
      } else {
        alert(json.error || '태그 분석 실패')
      }
    } catch { alert('태그 분석 중 오류 발생') }
    finally { setAiAnalyzing(false) }
  }

  // ── Load existing sermon for editing ──
  useEffect(() => {
    if (!editId) {
      setEditLoaded(true)
      return
    }
    ;(async () => {
      try {
        const found = getSermon(editId)
        if (found && found.result?.wizardSnapshot) {
          const snap = typeof found.result.wizardSnapshot === 'string'
            ? JSON.parse(found.result.wizardSnapshot)
            : found.result.wizardSnapshot
          setS({ ...EMPTY, ...snap })
          setEditLoaded(true)
          return
        }
        const res = await fetch(`/api/sermons/${editId}`)
        const json = await res.json()
        if (json.success && json.data) {
          const snap2 = json.data.result?.wizardSnapshot
          if (snap2) {
            const parsed = typeof snap2 === 'string' ? JSON.parse(snap2) : snap2
            setS({ ...EMPTY, ...parsed })
          } else {
            setS(sermonToWizardState(json.data))
          }
          setEditLoaded(true)
        } else {
          setEditError('설교를 찾을 수 없습니다.')
          setEditLoaded(true)
        }
      } catch {
        setEditError('설교 데이터를 불러오지 못했습니다.')
        setEditLoaded(true)
      }
    })()
  }, [editId, getSermon])

  const update = useCallback((patch: Partial<WizardState>) => setS(prev => ({ ...prev, ...patch })), [])

  const goTo = (step: number) => setActiveStep(step)

  const buildContext = () => buildWizardContext(s)

  /* ── AI calls ── */
  const aiSuggest = useCallback(async (body: Record<string, any>) => {
    const res = await fetch('/api/suggest', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const json = await res.json()
    if (!json.success) throw new Error(json.error || 'AI 요청 실패')
    return json
  }, [])

  const handleGenerateTitles = async () => {
    setLoading(2)
    try {
      const json = await aiSuggest({
        mode: 'wizard-titles',
        passage: `${s.bibleBook} ${s.chapterStart}:${s.verseStart}${s.verseEnd ? '-' + s.verseEnd : ''}`,
        bibleText: s.bibleText,
        coreMessage: s.coreMessage,
      })
      if (json.suggestions?.length) {
        const titles = json.suggestions.map((s: any) => s.value).filter(Boolean)
        const msgs = json.suggestions.map((s: any) => `[${s.style || '일반'}] ${s.reason || ''}`)
        return { titles, reasons: msgs }
      }
    } catch (e: any) { alert(e.message) }
    finally { setLoading(null) }
    return null
  }

  const handleGenerateCoreMessage = async () => {
    setLoading(2)
    try {
      const json = await aiSuggest({
        mode: 'wizard-core-message',
        context: buildContext(),
      })
      if (json.suggestions?.length) {
        return json.suggestions.map((s: any) => ({ value: s.value, reason: s.reason }))
      }
    } catch (e: any) { alert(e.message) }
    finally { setLoading(null) }
    return null
  }

  const handleGenerateOutline = async () => {
    setLoading(4)
    try {
      const json = await aiSuggest({
        mode: 'wizard-outline',
        context: buildContext(),
      })
      const data = json.data || json.suggestions
      if (data?.length) {
        const pts = data.map((s: any) => s.title || '')
        const dets = data.map((s: any) => s.key_sentence || s.description || '')
        const gospels = data.map((s: any) => s.gospel_connection || '')
        return { points: pts, details: dets, gospels }
      }
    } catch (e: any) { alert(e.message) }
    finally { setLoading(null) }
    return null
  }

  const handleGenerateBodySection = async (idx: number, title: string) => {
    setLoading(5)
    try {
      const json = await aiSuggest({
        mode: 'wizard-body-section',
        context: buildContext(),
        pointIndex: idx,
        pointTitle: title,
      })
      const section = json.data || json.section
      if (section) {
        return section as { exegesis: string; illustration: string; application: string }
      }
    } catch (e: any) { alert(e.message) }
    finally { setLoading(null) }
    return null
  }

  const handleGenerateAllBodySections = async () => {
    setLoading(5)
    const ctx = buildContext()
    const results: WizardState['bodySections'] = []
    for (let i = 0; i < s.outlinePoints.length; i++) {
      try {
        const json = await aiSuggest({
          mode: 'wizard-body-section',
          context: ctx,
          pointIndex: i,
          pointTitle: s.outlinePoints[i] || `대지 ${i + 1}`,
        })
        results.push(json.data || json.section || { exegesis: '', illustration: '', application: '' })
      } catch {
        results.push({ exegesis: '', illustration: '', application: '' })
      }
    }
    update({ bodySections: results })
    setLoading(null)
  }

  const handleGenerateIntroConclusion = async () => {
    setLoading(6)
    try {
      const json = await aiSuggest({
        mode: 'wizard-intro-conclusion',
        context: buildContext(),
      })
      const data = json.data || json.intro_conclusion
      if (data) {
        update({
          introduction: data.introduction || '',
          conclusion: data.conclusion || '',
        })
      }
    } catch (e: any) { alert(e.message) }
    finally { setLoading(null) }
  }

  const handleGenerateManuscript = async () => {
    setLoading(7)
    try {
      const ctx = buildContext()
      console.log('[Manuscript] Context length:', ctx.length)
      const json = await aiSuggest({
        mode: 'wizard-manuscript',
        context: ctx,
        length: '30분',
      })
      const text = json.text || json.data?.value || json.value || ''
      if (text) {
        update({ manuscript: text })
      } else {
        alert('AI가 원고를 생성하지 못했습니다. 이전 단계 내용을 확인해주세요.')
      }
    } catch (e: any) {
      console.error('[Manuscript] Error:', e)
      alert(e.message || '원고 생성 중 오류가 발생했습니다.')
    }
    finally { setLoading(null) }
  }

  const handleFetchBible = async () => {
    setBibleLoading(true)
    try {
      const book = s.bibleBook
      const ch = s.chapterStart
      const vs = s.verseStart
      const ve = s.verseEnd || vs
      if (!book || !ch) { alert('성경 책과 장을 입력해주세요'); return }
      const res = await fetch(`/api/bible?book=${encodeURIComponent(book)}&chapter=${ch}&verseStart=${vs || 1}&verseEnd=${ve}`)
      const json = await res.json()
      if (!json.success) throw new Error(json.error || '불러오기 실패')
      update({ bibleText: json.text })
    } catch (e: any) {
      console.error('[Bible fetch] Error:', e)
      alert(e.message || '본문을 불러오지 못했습니다')
    }
    finally { setBibleLoading(false) }
  }

  const handleSuggestCoreMessages = async () => {
    const key = 'coreMessage'
    setSuggestionsLoading(key)
    setSuggestionsOpen(key)
    try {
      const json = await aiSuggest({ mode: 'wizard-core-message', context: buildContext() })
      const items = json.suggestions || []
      setSuggestionsCache(prev => ({ ...prev, [key]: items }))
    } catch (e: any) {
      console.error('[CoreMsg] Error:', e)
      alert(e.message || '추천 로딩 중 오류가 발생했습니다.')
    }
    finally { setSuggestionsLoading(null) }
  }

  const handleSuggestTitles = async () => {
    const key = 'title'
    setSuggestionsLoading(key)
    setSuggestionsOpen(key)
    try {
      const json = await aiSuggest({
        mode: 'wizard-titles',
        passage: `${s.bibleBook} ${s.chapterStart}:${s.verseStart}${s.verseEnd ? '-' + s.verseEnd : ''}`,
        bibleText: s.bibleText,
        coreMessage: s.coreMessage,
      })
      const items = json.suggestions || []
      setSuggestionsCache(prev => ({ ...prev, [key]: items }))
    } catch (e: any) {
      console.error('[Titles] Error:', e)
      alert(e.message || '추천 로딩 중 오류가 발생했습니다.')
    }
    finally { setSuggestionsLoading(null) }
  }

  const handleAudienceSuggest = async (field: 'profile' | 'needs' | 'application') => {
    const modeMap = { profile: 'wizard-audience-profile', needs: 'wizard-audience-needs', application: 'wizard-application-direction' } as const
    setSuggestionsLoading(field)
    setSuggestionsOpen(field)
    try {
      const json = await aiSuggest({ mode: modeMap[field], context: buildContext() })
      const items = json.suggestions || []
      setSuggestionsCache(prev => ({ ...prev, [field]: items }))
    } catch (e: any) {
      console.error(`[Audience ${field}] Error:`, e)
      alert(e.message || '추천 로딩 중 오류가 발생했습니다.')
    }
    finally { setSuggestionsLoading(null) }
  }

  const pickAudienceSuggestion = (field: 'profile' | 'needs' | 'application', value: string) => {
    const keyMap = { profile: 'audienceProfile', needs: 'audienceNeeds', application: 'applicationDirection' } as const
    update({ [keyMap[field]]: value })
    setSuggestionsOpen(null)
  }

  const pickSuggestion = (key: 'coreMessage' | 'title', value: string) => {
    const keyMap = { coreMessage: 'coreMessage' as const, title: 'title' as const }
    update({ [keyMap[key]]: value })
    setSuggestionsOpen(null)
  }

  const handleReviewManuscript = async () => {
    setReviewLoading(true)
    setReviewResult(null)
    try {
      const ctx = buildContext()
      const res = await fetch('/api/review-manuscript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ manuscript: s.manuscript, context: ctx }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || '검증 실패')
      setReviewResult(json.review)
    } catch (e: any) {
      console.error('[Review] Error:', e)
      alert(e.message || '원고 검증 중 오류가 발생했습니다.')
    }
    finally { setReviewLoading(false) }
  }

  const handleReSuggestPoint = async (idx: number) => {
    const key = `point-${idx}`
    setSuggestionsLoading(key)
    setSuggestionsOpen(key)
    try {
      const json = await aiSuggest({
        mode: 'wizard-outline-point',
        context: buildContext(),
        pointIndex: idx,
        pointTitle: s.outlinePoints[idx] || '',
      })
      const data = json.data || {}
      if (data.title || data.key_sentence || data.gospel_connection) {
        const suggestions: { value: string; reason: string }[] = []
        if (data.title) suggestions.push({ value: data.title, reason: data.reason || '' })
        if (data.key_sentence) suggestions.push({ value: `📌 ${data.key_sentence}`, reason: '핵심 문장' })
        if (data.gospel_connection) suggestions.push({ value: `✝️ ${data.gospel_connection}`, reason: '복음 연결' })
        setSuggestionsCache(prev => ({ ...prev, [key]: suggestions }))
      }
    } catch (e: any) {
      console.error('[ReSuggest] Error:', e)
      alert(e.message || '재추천 중 오류가 발생했습니다.')
    }
    finally { setSuggestionsLoading(null) }
  }

  const handleSuggestPointTitle = async (idx: number) => {
    const sentence = s.outlineDetails[idx] || ''
    if (!sentence.trim()) { alert('먼저 핵심 문장을 입력해주세요'); return }
    const key = `title-${idx}`
    setSuggestionsLoading(key)
    setSuggestionsOpen(key)
    try {
      const json = await aiSuggest({ mode: 'wizard-point-title', context: buildContext(), sentence })
      const items = json.suggestions || []
      setSuggestionsCache(prev => ({ ...prev, [key]: items }))
    } catch (e: any) {
      console.error('[PointTitle] Error:', e)
      alert(e.message || '제목 추천 중 오류가 발생했습니다.')
    }
    finally { setSuggestionsLoading(null) }
  }

  const handleVariationPoint = async (idx: number) => {
    const key = `var-${idx}`
    setSuggestionsLoading(key)
    setSuggestionsOpen(key)
    try {
      const json = await aiSuggest({
        mode: 'wizard-point-variation',
        context: buildContext(),
        pointTitle: s.outlinePoints[idx] || '',
        pointDetail: s.outlineDetails[idx] || '',
      })
      const items = json.suggestions || []
      setSuggestionsCache(prev => ({ ...prev, [key]: items }))
    } catch (e: any) {
      console.error('[Variation] Error:', e)
      alert(e.message || '변형 생성 중 오류가 발생했습니다.')
    }
    finally { setSuggestionsLoading(null) }
  }

  const handlePickPointResult = (key: string, value: string, idx: number) => {
    setSuggestionsOpen(null)
    if (value.startsWith('📌 ')) {
      const dets = [...s.outlineDetails]
      dets[idx] = value.slice(2).trim()
      update({ outlineDetails: dets })
    } else if (value.startsWith('✝️ ')) {
      const gospels = [...s.gospelConnections]
      gospels[idx] = value.slice(2).trim()
      update({ gospelConnections: gospels })
    } else {
      const pts = [...s.outlinePoints]
      pts[idx] = value
      update({ outlinePoints: pts })
    }
  }

  const addPoint = () => {
    setS(prev => ({
      ...prev,
      outlinePoints: [...prev.outlinePoints, ''],
      outlineDetails: [...prev.outlineDetails, ''],
      gospelConnections: [...prev.gospelConnections, ''],
      bodySections: [...prev.bodySections, { exegesis: '', illustration: '', application: '' }],
    }))
  }

  const removePoint = (idx: number) => {
    if (s.outlinePoints.length <= 1) return
    setS(prev => ({
      ...prev,
      outlinePoints: prev.outlinePoints.filter((_, i) => i !== idx),
      outlineDetails: prev.outlineDetails.filter((_, i) => i !== idx),
      gospelConnections: prev.gospelConnections.filter((_, i) => i !== idx),
      bodySections: prev.bodySections.filter((_, i) => i !== idx),
    }))
  }

  /* ── Save ── */
  const handleSave = async () => {
    if (!stepDone(s, 7)) {
      alert('모든 단계를 완료한 후 저장할 수 있습니다.')
      return
    }
    setSaving(true)
    try {
      const flat: any = {
        title: s.title,
        date: initialDate || new Date().toISOString().slice(0, 10),
        preacher: '김은혜 목사',
        sermonType: '주일예배',
        audience: '장년',
        bibleBook: s.bibleBook,
        chapterStart: Number(s.chapterStart) || 0,
        verseStart: Number(s.verseStart) || 0,
        chapterEnd: Number(s.chapterEnd) || Number(s.chapterStart) || 0,
        verseEnd: Number(s.verseEnd) || 0,
        normalizedPassage: `${s.bibleBook} ${s.chapterStart}:${s.verseStart}${s.verseEnd ? '-' + s.verseEnd : ''}`,
        coreMessage: s.coreMessage,
        outlineIntro: s.introduction,
        outlinePoint1: `${s.outlinePoints[0] || ''} — ${s.outlineDetails[0] || ''}`,
        outlinePoint2: `${s.outlinePoints[1] || ''} — ${s.outlineDetails[1] || ''}`,
        outlinePoint3: `${s.outlinePoints[2] || ''} — ${s.outlineDetails[2] || ''}`,
        outlineConclusion: s.conclusion,
        manuscript: s.manuscript,
        themeIds: selectedTagIds,
        tagIds: selectedTagIds,
        status: 'completed' as const,
      }

      const wizardSnapshot = { ...s }

      if (editId) {
        const existing = getSermon(editId)
        if (!existing) { alert('수정할 설교를 찾을 수 없습니다.'); setSaving(false); return }
        const patched: Sermon = {
          ...existing,
          ...flat,
          result: {
            ...(existing.result || {}),
            wizardSnapshot,
          },
        }
        const result = await updateSermon(patched)
        if (result) {
          router.push(`/dashboard/sermons/${editId}`)
        } else {
          alert('수정에 실패했습니다.')
        }
      } else {
        const result = await createSermon({
          ...flat,
          result: { wizardSnapshot },
        })
        if (result) {
          router.push(`/dashboard/sermons/${result.id}`)
        } else {
          alert('저장에 실패했습니다.')
        }
      }
    } catch { alert('저장 중 오류가 발생했습니다.') }
    finally { setSaving(false) }
  }

  /* ─── Render Steps ─── */
  if (!editLoaded) {
    return (
      <div className="animate-fade-in py-24 text-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
        <p className="text-sm text-muted">설교 데이터 불러오는 중...</p>
      </div>
    )
  }
  if (editError) {
    return (
      <div className="animate-fade-in py-24 text-center">
        <p className="text-sm text-rose-500">{editError}</p>
        <button onClick={() => router.push('/dashboard')} className="mt-4 text-sm text-primary underline">대시보드로 돌아가기</button>
      </div>
    )
  }

  return (
    <div className="animate-fade-in max-w-3xl mx-auto space-y-4 pb-16">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push('/dashboard')} className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> 대시보드
        </button>
        <h2 className="text-xl font-bold">{editId ? '설교 수정' : '설교 작업실'}</h2>
        <div className="flex items-center gap-1 ml-auto text-[11px] text-muted">
          {[1,2,3,4,5,6,7,8].map(st => (
            <div key={st} className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold cursor-pointer hover:opacity-80 transition-opacity ${stepDone(s, st) ? 'bg-green-500 text-white' : activeStep === st ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}
              onClick={() => goTo(st)}>
              {stepDone(s, st) ? <Check className="w-3 h-3" /> : st}
            </div>
          ))}
        </div>
      </div>

      {/* ═══ Step 1: 본문 & 관찰 ═══ */}
      <StepContainer num={1} title="본문 & 관찰" icon={BookOpen}
        isActive={activeStep === 1} isDone={stepDone(s, 1)} onSelect={() => goTo(1)}>
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-2">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-muted mb-1">성경 책</label>
              <input type="text" value={s.bibleBook} onChange={e => update({ bibleBook: e.target.value })}
                placeholder="예: 로마서" className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-light" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">장</label>
              <input type="number" value={s.chapterStart} onChange={e => update({ chapterStart: e.target.value })}
                placeholder="8" className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-light" />
            </div>
            <div className="grid grid-cols-2 gap-1">
              <div>
                <label className="block text-xs font-medium text-muted mb-1">시작 절</label>
                <input type="number" value={s.verseStart} onChange={e => update({ verseStart: e.target.value })}
                  placeholder="1" className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-light" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1">끝 절</label>
                <input type="number" value={s.verseEnd} onChange={e => update({ verseEnd: e.target.value })}
                  placeholder="11" className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-light" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="block text-xs font-medium text-muted mb-1.5">성경 본문</label>
            <button type="button" onClick={handleFetchBible} disabled={bibleLoading || !s.bibleBook || !s.chapterStart}
              className="text-xs font-medium text-primary hover:text-primary-dark transition-colors flex items-center gap-1 disabled:opacity-50">
              {bibleLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <BookOpen className="w-3 h-3" />}
              본문 불러오기
            </button>
          </div>
          <textarea value={s.bibleText} onChange={e => update({ bibleText: e.target.value })}
              rows={4} placeholder="성경 본문을 직접 입력하세요."
              className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-light resize-none font-mono leading-relaxed" />

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">📖 본문 관찰</label>
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-md p-3 mb-2 space-y-1.5 text-[12px] text-indigo-700">
              <p className="font-medium text-indigo-800">본문을 천천히 읽으며 관찰해보세요:</p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>반복되는 단어나 표현이 있나요?</li>
                <li>이 본문이 하나님에 대해 무엇을 말하나요?</li>
                <li>이 본문이 인간(청중)에 대해 무엇을 말하나요?</li>
                <li>명령 / 약속 / 경고 / 위로 중 어떤 요소가 있나요?</li>
              </ul>
            </div>
            <textarea value={s.observationNotes} onChange={e => update({ observationNotes: e.target.value })}
              rows={4} placeholder="관찰한 내용을 자유롭게 기록하세요..."
              className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-light resize-none" />
          </div>

          <div className="flex justify-end pt-2">
            <button type="button" onClick={() => goTo(2)}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-dark transition-colors">
              다음 단계 <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </StepContainer>

      {/* ═══ Step 2: 핵심 메시지 & 제목 ═══ */}
      <StepContainer num={2} title="핵심 메시지 & 제목" icon={MessageSquare}
        isActive={activeStep === 2} isDone={stepDone(s, 2)} onSelect={() => goTo(2)}>
        <div className="space-y-4">
          <p className="text-[12px] text-muted leading-relaxed">
            회중이 오늘 기억해야 할 한마디는 무엇인가요? 본문의 중심 진리를 간결하게 선포하세요.
            핵심 메시지가 정해지면 그에 맞는 제목을 추천받을 수 있습니다.
          </p>
          <div className="relative">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-muted">핵심 메시지</label>
              <button type="button" onClick={handleSuggestCoreMessages} disabled={suggestionsLoading === 'coreMessage'}
                className="text-xs font-medium text-primary hover:text-primary-dark transition-colors flex items-center gap-1 disabled:opacity-50">
                {suggestionsLoading === 'coreMessage' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                AI 추천
              </button>
            </div>
            <textarea value={s.coreMessage} onChange={e => update({ coreMessage: e.target.value })}
              rows={3} placeholder="설교의 핵심 메시지를 한 문단으로 요약하세요."
              className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-light resize-none" />
            {suggestionsOpen === 'coreMessage' && suggestionsCache.coreMessage?.length > 0 && (
              <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-lg p-2 space-y-1 max-h-56 overflow-y-auto">
                {suggestionsCache.coreMessage.map((item, i) => (
                  <button key={i} type="button" onClick={() => pickSuggestion('coreMessage', item.value)}
                    className="w-full text-left p-2 rounded-md hover:bg-indigo-50 transition-colors text-xs">
                    <span className="font-medium text-slate-800">{item.value}</span>
                    {item.reason && <span className="block text-[11px] text-slate-500 mt-0.5">{item.reason}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="relative">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-muted">설교 제목</label>
              <button type="button" onClick={handleSuggestTitles} disabled={suggestionsLoading === 'title' || !s.coreMessage}
                className="text-xs font-medium text-primary hover:text-primary-dark transition-colors flex items-center gap-1 disabled:opacity-50">
                {suggestionsLoading === 'title' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                AI 제목 추천
              </button>
            </div>
            <input type="text" value={s.title} onChange={e => update({ title: e.target.value })}
              placeholder="핵심 메시지에 기반한 설교 제목"
              className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-light" />
            {suggestionsOpen === 'title' && suggestionsCache.title?.length > 0 && (
              <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-lg p-2 space-y-1 max-h-56 overflow-y-auto">
                {suggestionsCache.title.map((item, i) => (
                  <button key={i} type="button" onClick={() => pickSuggestion('title', item.value)}
                    className="w-full text-left p-2 rounded-md hover:bg-indigo-50 transition-colors text-xs">
                    <span className="font-medium text-slate-800">{item.value}</span>
                    {item.reason && <span className="block text-[11px] text-slate-500 mt-0.5">{item.reason}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-end pt-1">
            <button type="button" onClick={() => goTo(3)}
              disabled={!stepDone(s, 2)}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50">
              다음 단계 <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </StepContainer>

      {/* ═══ Step 3: 청중 분석 & 적용 방향 ═══ */}
      <StepContainer num={3} title="청중 분석 & 적용 방향" icon={Users}
        isActive={activeStep === 3} isDone={stepDone(s, 3)} onSelect={() => goTo(3)}>
        <div className="space-y-4">
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-md p-3 space-y-1.5 text-[12px] text-emerald-700">
            <p className="font-medium text-emerald-800">🎯 청중을 고려할수록 설교가 살아납니다:</p>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>내일 주일, 내 교회 성도들은 어떤 마음으로 예배드리러 올까요?</li>
              <li>그들이 현재 가장 고민하는 것은 무엇일까요?</li>
              <li>이 본문이 그들의 삶에 어떤 질문을 던질까요?</li>
              <li>이 설교를 듣고 그들이 어떻게 변하길 바라나요?</li>
            </ul>
          </div>
          {([['profile', '누구에게 설교하는가? (청중 프로필)', '예: 30-40대 직장인 위주, 신앙생활 5년 미만 초신자, 주중 바쁜 생활...', 2, s.audienceProfile],
             ['needs', '청중의 현재 상황 · 질문 · 아픔', '예: 직장에서의 신앙 정체성 고민, 육아와 신앙의 균형, 불안과 염려...', 3, s.audienceNeeds],
             ['application', '이 설교를 통해 청중이 얻길 바라는 적용 방향', '예: 삶의 현장에서 구체적인 순종, 두려움을 믿음으로 전환...', 2, s.applicationDirection],
          ] as const).map(([field, label, placeholder, rows, value]) => {
            const keyMap = { profile: 'audienceProfile' as const, needs: 'audienceNeeds' as const, application: 'applicationDirection' as const }
            return (
              <div key={field} className="relative">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-muted">{label}</label>
                  <button type="button" onClick={() => handleAudienceSuggest(field)}
                    disabled={suggestionsLoading === field}
                    className="text-xs font-medium text-primary hover:text-primary-dark transition-colors flex items-center gap-1 disabled:opacity-50">
                    {suggestionsLoading === field ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    AI 추천
                  </button>
                </div>
                <textarea value={value} onChange={e => update({ [keyMap[field]]: e.target.value })}
                  rows={rows} placeholder={placeholder}
                  className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-light resize-none" />
                {suggestionsOpen === field && suggestionsCache[field]?.length > 0 && (
                  <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-lg p-2 space-y-1 max-h-56 overflow-y-auto">
                    {suggestionsCache[field].map((item, i) => (
                      <button key={i} type="button" onClick={() => pickAudienceSuggestion(field, item.value)}
                        className="w-full text-left p-2 rounded-md hover:bg-indigo-50 transition-colors text-xs">
                        <span className="font-medium text-slate-800">{item.value}</span>
                        {item.reason && <span className="block text-[11px] text-slate-500 mt-0.5">{item.reason}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
          <div className="flex justify-end pt-1">
            <button type="button" onClick={() => goTo(4)}
              disabled={!stepDone(s, 3)}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50">
              다음 단계 <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </StepContainer>

      {/* ═══ Step 4: 3대지 구조 ═══ */}
      <StepContainer num={4} title="3대지 구조" icon={Layers}
        isActive={activeStep === 4} isDone={stepDone(s, 4)} onSelect={() => goTo(4)}>
        <div className="space-y-4">
          <p className="text-[12px] text-muted leading-relaxed">본문의 흐름을 따라 3대지를 세웁니다. 각 대지는 문장형으로, 서로 중복되지 않고 논리적으로 연결되어야 합니다.</p>
          <div className="flex justify-end">
            <button type="button" onClick={async () => {
              const result = await handleGenerateOutline()
              if (result) {
                const len = result.points.length
                const sections = [...s.bodySections]
                while (sections.length < len) sections.push({ exegesis: '', illustration: '', application: '' })
                update({
                  outlinePoints: result.points,
                  outlineDetails: result.details,
                  gospelConnections: result.gospels,
                  bodySections: sections.slice(0, len),
                })
              }
            }} disabled={loading === 4}
              className="text-xs font-medium text-primary hover:text-primary-dark transition-colors flex items-center gap-1 disabled:opacity-50">
              {loading === 4 ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              3대지 AI 추천
            </button>
          </div>
          {s.outlinePoints.map((_, idx) => (
            <div key={idx} className="relative border border-border rounded-md p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">대지 {idx + 1}</span>
                <div className="flex items-center gap-1">
                  {(['point', 'title', 'var'] as const).map(action => {
                    const key = `${action}-${idx}`
                    const isLoading = suggestionsLoading === key
                    const disabled = action === 'title' && !(s.outlineDetails[idx] || '').trim()
                    const labels = { point: '재추천', title: '제목 추천', var: '변형' }
                    const icons = { point: Sparkles, title: Lightbulb, var: Zap }
                    const Icon = icons[action]
                    return (
                      <button key={action} type="button" onClick={() => {
                        if (action === 'point') handleReSuggestPoint(idx)
                        else if (action === 'title') handleSuggestPointTitle(idx)
                        else handleVariationPoint(idx)
                      }} disabled={isLoading || (action === 'title' && disabled)}
                        className="text-[11px] text-primary hover:text-primary-dark transition-colors disabled:opacity-30 flex items-center gap-0.5"
                        title={labels[action]}>
                        {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Icon className="w-3 h-3" />}
                      </button>
                    )
                  })}
                  {s.outlinePoints.length > 1 && (
                    <button type="button" onClick={() => removePoint(idx)}
                      className="text-[11px] text-rose-500 hover:text-rose-700 transition-colors ml-1">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <input type="text" value={s.outlinePoints[idx] || ''} onChange={e => {
                const pts = [...s.outlinePoints]; pts[idx] = e.target.value; update({ outlinePoints: pts })
              }} placeholder={`대지 ${idx + 1} 제목 (문장형)`}
                className="w-full px-3 py-2 text-sm font-medium border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-light" />
              <textarea value={s.outlineDetails[idx] || ''} onChange={e => {
                const dets = [...s.outlineDetails]; dets[idx] = e.target.value; update({ outlineDetails: dets })
              }} placeholder="이 대지의 핵심 문장" rows={2}
                className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-light resize-none" />
              {(['point', 'title', 'var'] as const).map(action => {
                const key = `${action}-${idx}`
                if (suggestionsOpen !== key || !suggestionsCache[key]?.length) return null
                return (
                  <div key={key} className="absolute z-20 top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-lg p-2 space-y-1 max-h-56 overflow-y-auto">
                    {suggestionsCache[key].map((item, i) => (
                      <button key={i} type="button" onClick={() => handlePickPointResult(key, item.value, idx)}
                        className="w-full text-left p-2 rounded-md hover:bg-indigo-50 transition-colors text-xs">
                        <span className="font-medium text-slate-800">{item.value}</span>
                        {item.reason && <span className="block text-[11px] text-slate-500 mt-0.5">{item.reason}</span>}
                      </button>
                    ))}
                  </div>
                )
              })}
            </div>
          ))}
          <button type="button" onClick={addPoint}
            className="w-full py-2.5 border-2 border-dashed border-border rounded-md text-sm font-medium text-muted hover:text-primary hover:border-primary transition-colors flex items-center justify-center gap-1.5">
            + 대지 추가
          </button>
          <div className="flex justify-end pt-1">
            <button type="button" onClick={() => goTo(5)}
              disabled={!stepDone(s, 4)}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50">
              다음 단계 <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </StepContainer>

      {/* ═══ Step 5: 대지별 전개 ═══ */}
      <StepContainer num={5} title="대지별 전개 (본문해설 · 예화 · 적용)" icon={Pen}
        isActive={activeStep === 5} isDone={stepDone(s, 5)} onSelect={() => goTo(5)}>
        <div className="space-y-4">
          <p className="text-[12px] text-muted leading-relaxed">각 대지를 본문해설, 예화, 적용으로 발전시킵니다. AI가 모든 대지를 한 번에 생성할 수 있습니다.</p>
          <div className="flex justify-end">
            <button type="button" onClick={handleGenerateAllBodySections} disabled={loading === 5}
              className="text-xs font-medium text-primary hover:text-primary-dark transition-colors flex items-center gap-1 disabled:opacity-50">
              {loading === 5 ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
              모든 대지 AI 생성
            </button>
          </div>
          {s.outlinePoints.map((pt, idx) => (
            <div key={idx} className="border border-border rounded-md p-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                  대지 {idx + 1}: {pt || '(제목 없음)'}
                </span>
                <button type="button" onClick={async () => {
                  const result = await handleGenerateBodySection(idx, pt || '')
                  if (result) {
                    const sections = [...s.bodySections]
                    sections[idx] = result
                    update({ bodySections: sections })
                  }
                }} disabled={loading === 5}
                  className="text-[11px] text-primary hover:text-primary-dark transition-colors flex items-center gap-1 disabled:opacity-50">
                  {loading === 5 ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  AI 생성
                </button>
              </div>
              <div>
                <label className="block text-[10px] font-medium text-muted mb-0.5">본문해설</label>
                <textarea value={s.bodySections[idx]?.exegesis || ''} onChange={e => {
                  const sections = [...s.bodySections]; sections[idx] = { ...sections[idx], exegesis: e.target.value }; update({ bodySections: sections })
                }} rows={3} placeholder="본문해설 (200~300자)"
                  className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-light resize-none" />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-muted mb-0.5">예화</label>
                <textarea value={s.bodySections[idx]?.illustration || ''} onChange={e => {
                  const sections = [...s.bodySections]; sections[idx] = { ...sections[idx], illustration: e.target.value }; update({ bodySections: sections })
                }} rows={2} placeholder="예화 (150~250자)"
                  className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-light resize-none" />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-muted mb-0.5">적용</label>
                <textarea value={s.bodySections[idx]?.application || ''} onChange={e => {
                  const sections = [...s.bodySections]; sections[idx] = { ...sections[idx], application: e.target.value }; update({ bodySections: sections })
                }} rows={2} placeholder="구체적 적용 (150~250자)"
                  className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-light resize-none" />
              </div>
            </div>
          ))}
          <div className="flex justify-end pt-1">
            <button type="button" onClick={() => goTo(6)}
              disabled={!stepDone(s, 5)}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50">
              다음 단계 <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </StepContainer>

      {/* ═══ Step 6: 서론 & 결론 ═══ */}
      <StepContainer num={6} title="서론 & 결론" icon={FileText}
        isActive={activeStep === 6} isDone={stepDone(s, 6)} onSelect={() => goTo(6)}>
        <div className="space-y-4">
          <p className="text-[12px] text-muted leading-relaxed">모든 내용을 바탕으로 서론과 결론을 작성합니다.</p>
          <div className="flex justify-end">
            <button type="button" onClick={handleGenerateIntroConclusion} disabled={loading === 6}
              className="text-xs font-medium text-primary hover:text-primary-dark transition-colors flex items-center gap-1 disabled:opacity-50">
              {loading === 6 ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              AI 생성
            </button>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1">서론</label>
            <textarea value={s.introduction} onChange={e => update({ introduction: e.target.value })}
              rows={3} placeholder="회중을 본문으로 인도하는 서론 (3~5문장)"
              className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-light resize-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1">결론</label>
            <textarea value={s.conclusion} onChange={e => update({ conclusion: e.target.value })}
              rows={4} placeholder="대지를 요약하고 복음으로 마무리하는 결론 (4~6문장)"
              className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-light resize-none" />
          </div>
          <div className="flex justify-end pt-1">
            <button type="button" onClick={() => goTo(7)}
              disabled={!stepDone(s, 6)}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50">
              다음 단계 <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </StepContainer>

      {/* ═══ Step 7: 완성 원고 ═══ */}
      <StepContainer num={7} title="완성 원고" icon={FileText}
        isActive={activeStep === 7} isDone={stepDone(s, 7)} onSelect={() => goTo(7)}>
        <div className="space-y-4">
          <p className="text-[12px] text-muted leading-relaxed">지금까지 준비한 모든 내용을 하나의 완성된 설교 원고로 조립합니다. AI가 통합 원고를 생성하거나 직접 작성하세요.</p>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={handleGenerateManuscript} disabled={loading === 7}
              className="text-xs font-medium text-primary hover:text-primary-dark transition-colors flex items-center gap-1 disabled:opacity-50">
              {loading === 7 ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              AI 원고 생성
            </button>
          </div>
          <textarea value={s.manuscript} onChange={e => update({ manuscript: e.target.value })}
            rows={16} placeholder="완성된 설교 원고가 여기에 표시됩니다."
            className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-light resize-none font-mono leading-relaxed" />
          {s.manuscript && (
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200">
                <span className="text-xs font-medium text-slate-600">📋 설교 원고 검증</span>
                <button type="button" onClick={handleReviewManuscript} disabled={reviewLoading}
                  className="text-xs font-medium text-primary hover:text-primary-dark transition-colors flex items-center gap-1 disabled:opacity-50">
                  {reviewLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  AI 검증
                </button>
              </div>
              {reviewResult && (
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'gospel_centered', label: '복음 중심성', icon: '✝️', border: 'border-rose-100', bg: 'bg-rose-50/30' },
                      { key: 'biblical_faithfulness', label: '본문 충실성', icon: '📖', border: 'border-indigo-100', bg: 'bg-indigo-50/30' },
                      { key: 'application_specificity', label: '적용 구체성', icon: '🎯', border: 'border-emerald-100', bg: 'bg-emerald-50/30' },
                      { key: 'logical_flow', label: '흐름의 논리성', icon: '🔗', border: 'border-amber-100', bg: 'bg-amber-50/30' },
                    ].map(({ key, label, icon, border, bg }) => {
                      const item = reviewResult[key] || {}
                      const score = item.score || 0
                      return (
                        <div key={key} className={`p-3 rounded-lg border ${border} ${bg}`}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-semibold text-slate-700">{icon} {label}</span>
                            <span className="text-sm font-bold">{'★'.repeat(score)}{'☆'.repeat(5 - score)}</span>
                          </div>
                          {item.feedback && <p className="text-[11px] text-slate-600 mb-1">{item.feedback}</p>}
                          {item.suggestion && (
                            <p className="text-[11px] text-slate-500 italic border-t border-slate-200 pt-1 mt-1">
                              💡 {item.suggestion}
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  {reviewResult.overall && (
                    <div className="p-3 bg-slate-100 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-slate-700">📊 종합 평가</span>
                        <span className="text-sm font-bold">{'★'.repeat(reviewResult.overall.score || 0)}{'☆'.repeat(5 - (reviewResult.overall.score || 0))}</span>
                      </div>
                      <p className="text-[11px] text-slate-600">{reviewResult.overall.summary}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end pt-2">
            <button type="button" onClick={() => goTo(8)}
              disabled={!stepDone(s, 7)}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50">
              태그 설정하기 <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </StepContainer>

      {/* ═══ Step 8: 태그 & 저장 ═══ */}
      <StepContainer num={8} title="태그 & 저장" icon={Tags}
        isActive={activeStep === 8} isDone={stepDone(s, 8)} onSelect={() => goTo(8)}>
        <div className="space-y-5">
          <p className="text-[12px] text-muted leading-relaxed">
            설교 내용을 분석하여 관련 태그를 선택하면 지식 그래프에 자동 연결됩니다.
            태그가 많을수록 설교 간 연결이 풍부해집니다.
          </p>

          {/* AI 분석 버튼 */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">AI가 원고를 분석하여 태그 추천</span>
            <button type="button" onClick={handleAnalyzeTags} disabled={aiAnalyzing || !s.manuscript}
              className="text-xs font-medium text-primary hover:text-primary-dark transition-colors flex items-center gap-1 disabled:opacity-50">
              {aiAnalyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              AI 분석
            </button>
          </div>

          {/* 선택된 태그 요약바 */}
          {selectedTagIds.length > 0 && (
            <div className="flex flex-wrap gap-1.5 p-3 bg-indigo-50/50 border border-indigo-100 rounded-md">
              {selectedTagIds.map(id => {
                const t = ALL_THEMES.find(th => th.id === id)
                if (!t) return null
                return (
                  <span key={id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-white border border-indigo-200 text-indigo-700">
                    {t.name}
                    <button type="button" onClick={() => toggleTag(id)} className="hover:text-rose-500 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )
              })}
            </div>
          )}

          {/* 대주제 */}
          <div>
            <h4 className="text-xs font-bold text-orange-600 mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-orange-400" /> 대주제
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {MAJOR_THEMES.map(t => (
                <button key={t.id} type="button" onClick={() => toggleTag(t.id)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${
                    selectedTagIds.includes(t.id)
                      ? 'bg-orange-100 border-orange-300 text-orange-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-orange-200 hover:text-orange-600'
                  }`}>
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* 상황 */}
          <div>
            <h4 className="text-xs font-bold text-blue-600 mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400" /> 상황
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {SITUATION_TAGS.map(t => (
                <button key={t.id} type="button" onClick={() => toggleTag(t.id)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${
                    selectedTagIds.includes(t.id)
                      ? 'bg-blue-100 border-blue-300 text-blue-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-blue-200 hover:text-blue-600'
                  }`}>
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* 정서 */}
          <div>
            <h4 className="text-xs font-bold text-purple-600 mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400" /> 정서
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {EMOTION_TAGS.map(t => (
                <button key={t.id} type="button" onClick={() => toggleTag(t.id)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${
                    selectedTagIds.includes(t.id)
                      ? 'bg-purple-100 border-purple-300 text-purple-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-purple-200 hover:text-purple-600'
                  }`}>
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* 그래프 링크 */}
          <div className="flex items-center gap-2 p-3 bg-blue-50/50 border border-blue-100 rounded-md">
            <Network className="w-4 h-4 text-blue-500 shrink-0" />
            <p className="text-[11px] text-blue-700 leading-relaxed">
              선택한 태그는 지식 그래프에 반영되어 다른 설교와 연결됩니다.
              {selectedTagIds.length > 0
                ? ` 현재 ${selectedTagIds.length}개 태그가 선택되었습니다.`
                : ' 태그를 선택하지 않아도 저장할 수 있습니다.'}
            </p>
          </div>

          {/* 저장 버튼 */}
          <div className="flex justify-end pt-2 border-t border-border">
            <button type="button" onClick={handleSave} disabled={saving || !stepDone(s, 7)}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {saving ? '저장 중...' : (editId ? '수정 완료' : '설교 원고 저장하기')}
            </button>
          </div>
        </div>
      </StepContainer>
    </div>
  )
}
