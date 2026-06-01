'use client'

import { useState, useMemo, useEffect, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Lightbulb, Loader2, Sparkles, Settings2 } from 'lucide-react'
import { useApp } from '@/lib/dashboard/store'
import { Sermon } from '@/lib/dashboard/types'
import ManageOptionsModal from '@/components/dashboard/ManageOptionsModal'
import {
  SEASONS,
  BIBLE_BOOKS,
  MAJOR_THEMES,
  SITUATION_TAGS,
  EMOTION_TAGS,
} from '@/lib/dashboard/constants'

function NewSermonForm() {
  const { state, dispatch } = useApp()
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')

  const [showOptional, setShowOptional] = useState(false)
  const [manageOpen, setManageOpen] = useState(false)

  const [form, setForm] = useState({
    title: '',
    date: '',
    preacher: '김은혜 목사',
    sermonType: '',
    audience: '',
    season: '',
    seriesId: '',
    bibleBook: '',
    chapterStart: '',
    verseStart: '',
    chapterEnd: '',
    verseEnd: '',
    coreMessage: '',
    bibleText: '',
    manuscript: '',
    introduction: '',
    outlinePoints: ['', '', ''],
    outlineDetails: ['', '', ''],
    christApplication: '',
    conclusion: '',
    illustration: '',
    themeIds: [] as string[],
    relatedSermonIds: [] as string[],
  })

  const [newThemeInput, setNewThemeInput] = useState('')
  const [themeFilter, setThemeFilter] = useState('')
  const [bibleLoading, setBibleLoading] = useState(false)
  const [bibleError, setBibleError] = useState('')

  const [passageSuggestions, setPassageSuggestions] = useState<{ value: string; reason: string }[]>([])
  const [titleSuggestions, setTitleSuggestions] = useState<{ value: string; reason: string }[]>([])
  const [coreSuggestions, setCoreSuggestions] = useState<{ value: string; reason: string }[]>([])
  const [pointSuggestions, setPointSuggestions] = useState<{ title: string; description: string; reason: string }[][]>([])
  const [pointLoading, setPointLoading] = useState<number | null>(null)
  const [suggestLoading, setSuggestLoading] = useState(false)
  const [introSuggestions, setIntroSuggestions] = useState<{ value: string; reason: string }[]>([])
  const [conclusionSuggestions, setConclusionSuggestions] = useState<{ value: string; reason: string }[]>([])
  const [illustrationSuggestions, setIllustrationSuggestions] = useState<{ value: string; reason: string }[]>([])
  const [introConclusionLoading, setIntroConclusionLoading] = useState(false)
  const [illustrationLoading, setIllustrationLoading] = useState(false)
  const [manuscriptModal, setManuscriptModal] = useState(false)
  const [manuscriptLength, setManuscriptLength] = useState<string>('30분')
  const [manuscriptGenerating, setManuscriptGenerating] = useState(false)
  const [manuscriptPreview, setManuscriptPreview] = useState('')

  const fetchSuggestions = async (params: { title?: string; passage?: string }) => {
    setSuggestLoading(true)
    try {
      const res = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })
      const data = await res.json()
      if (data.success) {
        if (params.title && !params.passage) {
          setPassageSuggestions(data.suggestions)
        } else if (params.passage && !params.title) {
          setTitleSuggestions(data.suggestions)
        }
      } else {
        alert('AI 추천 중 오류가 발생했습니다: ' + (data.error || '알 수 없는 오류'))
      }
    } catch (err: any) {
      console.error('Suggest error:', err)
      alert('AI 추천 중 오류가 발생했습니다: ' + (err.message || '알 수 없는 오류'))
    } finally {
      setSuggestLoading(false)
    }
  }

  useEffect(() => {
    if (editId) {
      const sermon = state.sermons.find((s) => s.id === editId)
      if (sermon) {
        setForm({
          title: sermon.title,
          date: sermon.date,
          preacher: sermon.preacher,
          sermonType: sermon.sermonType,
          audience: sermon.audience,
          season: sermon.season || '',
          seriesId: sermon.seriesId || '',
          bibleBook: sermon.bibleBook,
          chapterStart: String(sermon.chapterStart),
          verseStart: String(sermon.verseStart),
          chapterEnd: String(sermon.chapterEnd),
          verseEnd: String(sermon.verseEnd),
          coreMessage: sermon.coreMessage,
          bibleText: '',
          manuscript: sermon.manuscript,
          introduction: sermon.outlineIntro || '',
          outlinePoints: [
            (sermon.outlinePoint1 || '').split(' — ')[0] || '',
            (sermon.outlinePoint2 || '').split(' — ')[0] || '',
            (sermon.outlinePoint3 || '').split(' — ')[0] || '',
          ],
          outlineDetails: [
            (sermon.outlinePoint1 || '').split(' — ').slice(1).join(' — ') || '',
            (sermon.outlinePoint2 || '').split(' — ').slice(1).join(' — ') || '',
            (sermon.outlinePoint3 || '').split(' — ').slice(1).join(' — ') || '',
          ],
          christApplication: '',
          conclusion: sermon.outlineConclusion || '',
          illustration: '',
          themeIds: sermon.themeIds || [],
          relatedSermonIds: sermon.relatedSermonIds || [],
        })
        return
      }
    }
    try {
      const saved = localStorage.getItem('sermon-draft')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.outlinePoint1 !== undefined) {
          parsed.outlinePoints = [
            parsed.outlinePoint1 || '',
            parsed.outlinePoint2 || '',
            parsed.outlinePoint3 || '',
          ]
          parsed.outlineDetails = ['', '', '']
          delete parsed.outlinePoint1
          delete parsed.outlinePoint2
          delete parsed.outlinePoint3
        }
        if (parsed.outlineIntro !== undefined) {
          parsed.introduction = parsed.outlineIntro
          delete parsed.outlineIntro
        }
        if (parsed.outlineConclusion !== undefined) {
          parsed.conclusion = parsed.outlineConclusion
          delete parsed.outlineConclusion
        }
        setForm(prev => ({ ...prev, ...parsed }))
      } else {
        setForm(prev => prev.date ? prev : { ...prev, date: new Date().toISOString().slice(0, 10) })
      }
    } catch {}
  }, [editId])

  useEffect(() => {
    const title = searchParams.get('title')
    const passage = searchParams.get('passage')
    if (title) setForm(prev => ({ ...prev, title }))
    if (passage) setForm(prev => ({ ...prev, bibleBook: passage }))
  }, [searchParams])

  const autoGenerated = useRef({ application: false, introduction: false, conclusion: false })

  useEffect(() => {
    if (autoGenerated.current.introduction) return
    if (!form.title.trim() || !form.bibleBook.trim() || !form.coreMessage.trim()) return
    if (form.outlinePoints.filter(p => p.trim()).length === 0) return
    if (form.introduction) return
    const timer = setTimeout(async () => {
      autoGenerated.current.introduction = true
      try {
        const res = await fetch('/api/suggest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: form.title.trim(), passage: form.bibleBook.trim(),
            coreMessage: form.coreMessage.trim(),
            outlinePoints: form.outlinePoints, outlineDetails: form.outlineDetails,
            generateIntroduction: true,
          }),
        })
        const data = await res.json()
        if (data.success && data.text) updateField('introduction', data.text)
      } catch (err) { console.error(err) }
    }, 1500)
    return () => clearTimeout(timer)
  }, [form.title, form.bibleBook, form.coreMessage, form.outlinePoints, form.outlineDetails])

  useEffect(() => {
    if (autoGenerated.current.conclusion) return
    if (!form.title.trim() || !form.bibleBook.trim() || !form.coreMessage.trim()) return
    if (form.outlinePoints.filter(p => p.trim()).length === 0) return
    if (form.conclusion) return
    const timer = setTimeout(async () => {
      autoGenerated.current.conclusion = true
      try {
        const res = await fetch('/api/suggest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: form.title.trim(), passage: form.bibleBook.trim(),
            coreMessage: form.coreMessage.trim(),
            outlinePoints: form.outlinePoints, outlineDetails: form.outlineDetails,
            generateConclusion: true,
          }),
        })
        const data = await res.json()
        if (data.success && data.text) updateField('conclusion', data.text)
      } catch (err) { console.error(err) }
    }, 2000)
    return () => clearTimeout(timer)
  }, [form.title, form.bibleBook, form.coreMessage, form.outlinePoints, form.outlineDetails])

  useEffect(() => {
    if (autoGenerated.current.application) return
    if (!form.title.trim() || !form.bibleBook.trim() || !form.coreMessage.trim()) return
    if (form.outlinePoints.filter(p => p.trim()).length === 0) return
    if (form.christApplication) return
    const timer = setTimeout(async () => {
      autoGenerated.current.application = true
      try {
        const res = await fetch('/api/suggest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: form.title.trim(), passage: form.bibleBook.trim(),
            coreMessage: form.coreMessage.trim(),
            outlinePoints: form.outlinePoints, outlineDetails: form.outlineDetails,
            generateApplication: true,
          }),
        })
        const data = await res.json()
        if (data.success && data.text) updateField('christApplication', data.text)
      } catch (err) { console.error(err) }
    }, 2500)
    return () => clearTimeout(timer)
  }, [form.title, form.bibleBook, form.coreMessage, form.outlinePoints, form.outlineDetails])

  const autoGenIllustration = useRef(false)

  useEffect(() => {
    if (autoGenIllustration.current) return
    if (!form.title.trim() || !form.bibleBook.trim() || !form.coreMessage.trim()) return
    if (form.outlinePoints.filter(p => p.trim()).length === 0) return
    if (form.illustration) return
    const timer = setTimeout(async () => {
      autoGenIllustration.current = true
      try {
        const res = await fetch('/api/suggest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: form.title.trim(), passage: form.bibleBook.trim(),
            coreMessage: form.coreMessage.trim(),
            outlinePoints: form.outlinePoints, outlineDetails: form.outlineDetails,
            introduction: form.introduction, conclusion: form.conclusion,
            application: form.christApplication,
            generateIllustration: true,
          }),
        })
        const data = await res.json()
        if (data.success && data.text) updateField('illustration', data.text)
      } catch (err) { console.error(err) }
    }, 3000)
    return () => clearTimeout(timer)
  }, [form.title, form.bibleBook, form.coreMessage, form.outlinePoints, form.outlineDetails, form.introduction, form.conclusion, form.christApplication])

  const filteredMajorThemes = useMemo(
    () =>
      MAJOR_THEMES.filter(
        (t) =>
          !form.themeIds.includes(t.id) &&
          t.name.includes(themeFilter)
      ),
    [form.themeIds, themeFilter]
  )

  const filteredSituationTags = useMemo(
    () =>
      SITUATION_TAGS.filter(
        (t) =>
          !form.themeIds.includes(t.id) &&
          t.name.includes(themeFilter)
      ),
    [form.themeIds, themeFilter]
  )

  const filteredEmotionTags = useMemo(
    () =>
      EMOTION_TAGS.filter(
        (t) =>
          !form.themeIds.includes(t.id) &&
          t.name.includes(themeFilter)
      ),
    [form.themeIds, themeFilter]
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.date || !form.sermonType || !form.audience || !form.bibleBook || !form.coreMessage || !form.manuscript) {
      alert('필수 항목을 모두 입력해주세요.')
      return
    }

    const normalizedPassage = form.bibleBook

    const sermonData: Sermon = {
      id: editId || `sermon-${Date.now()}`,
      title: form.title,
      date: form.date,
      preacher: form.preacher || '김은혜 목사',
      sermonType: form.sermonType,
      audience: form.audience,
      season: form.season,
      seriesId: form.seriesId,
      bibleBook: form.bibleBook,
      chapterStart: Number(form.chapterStart) || 0,
      verseStart: Number(form.verseStart) || 0,
      chapterEnd: Number(form.chapterEnd) || Number(form.chapterStart) || 0,
      verseEnd: Number(form.verseEnd) || 0,
      normalizedPassage,
      coreMessage: form.coreMessage,
      outlineIntro: form.introduction,
      outlinePoint1: form.outlineDetails[0]
        ? `${form.outlinePoints[0] || ''} — ${form.outlineDetails[0]}`
        : (form.outlinePoints[0] || ''),
      outlinePoint2: form.outlineDetails[1]
        ? `${form.outlinePoints[1] || ''} — ${form.outlineDetails[1]}`
        : (form.outlinePoints[1] || ''),
      outlinePoint3: form.outlineDetails[2]
        ? `${form.outlinePoints[2] || ''} — ${form.outlineDetails[2]}`
        : (form.outlinePoints[2] || ''),
      outlineConclusion: form.conclusion,
      manuscript: form.manuscript,
      themeIds: form.themeIds,
      tagIds: form.themeIds,
      relatedSermonIds: form.relatedSermonIds,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    if (editId) {
      const existing = state.sermons.find((s) => s.id === editId)
      if (existing) {
        sermonData.createdAt = existing.createdAt
      }
      dispatch({ type: 'UPDATE_SERMON', payload: sermonData })
    } else {
      dispatch({ type: 'ADD_SERMON', payload: sermonData })
    }
    router.push(`/dashboard/sermons/${sermonData.id}`)
  }

  const handleSaveDraft = () => {
    localStorage.setItem('sermon-draft', JSON.stringify(form))
    alert('임시저장되었습니다.')
  }

  const updateField = (field: string, value: string | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const toggleTheme = (id: string) => {
    setForm((prev) => ({
      ...prev,
      themeIds: prev.themeIds.includes(id)
        ? prev.themeIds.filter((tid) => tid !== id)
        : [...prev.themeIds, id],
    }))
  }

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          메인
        </Link>
        <h2 className="text-xl font-bold">{editId ? '설교 수정' : '새 설교 등록'}</h2>
      </div>

      <form id="sermon-form" onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-surface border border-border rounded-lg p-6 space-y-5">
          <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">
            필수 입력
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <label className="block text-xs font-medium text-muted mb-1.5">설교 제목 *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => {
                    updateField('title', e.target.value)
                    setPassageSuggestions([])
                  }}
                  placeholder="예: 두려움을 이기는 믿음"
                  className="flex-1 px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-light"
                  required
                />
                <button
                  type="button"
                  onClick={() => {
                    const val = form.title.trim()
                    if (val.length < 2) return
                    setPassageSuggestions([])
                    fetchSuggestions({ title: val })
                  }}
                  disabled={suggestLoading || form.title.trim().length < 2}
                  className="px-3 py-2 text-xs font-medium border border-border rounded-md hover:bg-accent disabled:opacity-50 whitespace-nowrap flex items-center gap-1"
                >
                  {suggestLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  AI추천
                </button>
              </div>
              {passageSuggestions.length > 0 && (
                <div className="mt-1.5 border border-border rounded-md bg-surface divide-y divide-border">
                  <div className="px-2.5 py-1.5 text-[11px] font-medium text-primary flex items-center gap-1">
                    <Lightbulb className="w-3 h-3" />
                    추천 성경 본문
                  </div>
                  {passageSuggestions.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        updateField('bibleBook', s.value)
                        setPassageSuggestions([])
                      }}
                      className="w-full text-left px-2.5 py-2 text-xs hover:bg-slate-50 transition-colors"
                    >
                      <span className="font-medium text-foreground">{s.value}</span>
                      <span className="ml-1.5 text-muted">{s.reason}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">설교 날짜 *</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => updateField('date', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-light"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">성경 본문 *</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={form.bibleBook}
                onChange={(e) => {
                  updateField('bibleBook', e.target.value)
                  setTitleSuggestions([])
                }}
                placeholder="예: 마태복음 11:28-30"
                className="flex-1 px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-light"
                required
              />
              <button
                type="button"
                onClick={async () => {
                  if (!form.bibleBook || form.bibleBook.length < 3) return
                  setBibleLoading(true)
                  setBibleError('')
                  try {
                    const res = await fetch('/api/bible', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ passage: form.bibleBook }),
                    })
                    if (!res.ok) throw new Error('API 오류')
                    const data = await res.json()
                    if (data.success && data.text) {
                      setForm(prev => ({ ...prev, bibleText: data.text.trim() }))
                    } else {
                      throw new Error(data.error)
                    }
                  } catch {
                    setBibleError('성경 본문을 자동으로 가져오지 못했습니다.')
                  } finally {
                    setBibleLoading(false)
                  }
                }}
                disabled={bibleLoading}
                className="px-3 py-2 text-xs font-medium border border-border rounded-md hover:bg-accent disabled:opacity-50 whitespace-nowrap"
              >
                {bibleLoading ? '가져오는 중...' : '가져오기'}
              </button>
              <button
                type="button"
                onClick={() => {
                  const val = form.bibleBook.trim()
                  if (val.length < 2) return
                  setTitleSuggestions([])
                  fetchSuggestions({ passage: val })
                }}
                disabled={suggestLoading || form.bibleBook.trim().length < 2}
                className="px-3 py-2 text-xs font-medium border border-border rounded-md hover:bg-accent disabled:opacity-50 whitespace-nowrap flex items-center gap-1"
              >
                {suggestLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                AI추천
              </button>
            </div>

            {titleSuggestions.length > 0 && (
              <div className="mt-1.5 border border-border rounded-md bg-surface divide-y divide-border">
                <div className="px-2.5 py-1.5 text-[11px] font-medium text-primary flex items-center gap-1">
                  <Lightbulb className="w-3 h-3" />
                  추천 설교 제목
                </div>
                {titleSuggestions.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      updateField('title', s.value)
                      setTitleSuggestions([])
                    }}
                    className="w-full text-left px-2.5 py-2 text-xs hover:bg-slate-50 transition-colors"
                  >
                    <span className="font-medium text-foreground">{s.value}</span>
                    <span className="ml-1.5 text-muted">{s.reason}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-muted">성경 본문 내용 (개역개정)</label>
              {bibleLoading && (
                <p className="text-[10px] text-primary animate-pulse">가져오는 중...</p>
              )}
            </div>
            {bibleError && (
              <p className="text-[10px] text-rose-500 mb-1">{bibleError}</p>
            )}
            <textarea
              value={form.bibleText}
              onChange={(e) => { updateField('bibleText', e.target.value); setBibleError('') }}
              rows={4}
              placeholder="본문 성경 구절을 여기에 붙여넣으세요..."
              className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-light resize-none font-mono leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">설교 종류 *</label>
              <div className="flex gap-1.5 items-start">
                <select
                  value={form.sermonType}
                  onChange={(e) => updateField('sermonType', e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-light"
                  required
                >
                  <option value="">선택...</option>
                  {state.sermonTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setManageOpen(true)}
                  className="p-2 text-muted hover:text-foreground transition-colors"
                  title="설교 종류 관리"
                >
                  <Settings2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">회중 *</label>
              <div className="flex gap-1.5 items-start">
                <select
                  value={form.audience}
                  onChange={(e) => updateField('audience', e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-light"
                  required
                >
                  <option value="">선택...</option>
                  {state.audiences.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setManageOpen(true)}
                  className="p-2 text-muted hover:text-foreground transition-colors"
                  title="회중 관리"
                >
                  <Settings2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">설교자 *</label>
              <div className="flex gap-1.5 items-start">
                <select
                  value={form.preacher}
                  onChange={(e) => updateField('preacher', e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-light"
                  required
                >
                  <option value="">선택...</option>
                  {state.preachers.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setManageOpen(true)}
                  className="p-2 text-muted hover:text-foreground transition-colors"
                  title="설교자 관리"
                >
                  <Settings2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-muted">핵심 메시지 *</label>
              <button
                type="button"
                onClick={() => {
                  const title = form.title.trim()
                  const passage = form.bibleBook.trim()
                  if (!title || !passage) return
                  setCoreSuggestions([])
                  setSuggestLoading(true)
                  fetch('/api/suggest', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title, passage }),
                  })
                    .then((r) => r.json())
                    .then((data) => {
                      if (data.success) setCoreSuggestions(data.suggestions)
                    })
                    .catch(console.error)
                    .finally(() => setSuggestLoading(false))
                }}
                disabled={suggestLoading || !form.title.trim() || !form.bibleBook.trim()}
                className="text-xs font-medium text-primary hover:text-primary-dark transition-colors flex items-center gap-1 disabled:opacity-50"
              >
                {suggestLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                AI추천
              </button>
            </div>
            <textarea
              value={form.coreMessage}
              onChange={(e) => updateField('coreMessage', e.target.value)}
              rows={3}
              placeholder="설교의 핵심 메시지를 한 문단으로 요약해주세요."
              className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-light resize-none"
              required
            />
            {coreSuggestions.length > 0 && (
              <div className="mt-2 border border-border rounded-md bg-surface divide-y divide-border">
                <div className="px-2.5 py-1.5 text-[11px] font-medium text-primary flex items-center gap-1">
                  <Lightbulb className="w-3 h-3" />
                  추천 핵심 메시지
                </div>
                {coreSuggestions.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      updateField('coreMessage', s.value)
                      setCoreSuggestions([])
                    }}
                    className="w-full text-left px-2.5 py-2 text-xs hover:bg-slate-50 transition-colors"
                  >
                    <span className="text-foreground">{s.value}</span>
                    <span className="ml-1.5 text-muted">{s.reason}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-muted">대지 정하기</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    const title = form.title.trim()
                    const passage = `${form.bibleBook.trim()} ${form.chapterStart.trim()}:${form.verseStart.trim()}`
                    const coreMessage = form.coreMessage.trim()
                    if (!title || !passage || !coreMessage) return
                    setPointLoading(-1)
                    try {
                      const res = await fetch('/api/suggest', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ title, passage, coreMessage, generateAllPoints: true }),
                      })
                      const data = await res.json()
                      if (data.success && data.suggestions.length >= 3) {
                        setForm((prev) => ({
                          ...prev,
                          outlinePoints: data.suggestions.map((s: any) => s.title),
                          outlineDetails: data.suggestions.map((s: any) => s.description || ''),
                        }))
                        setPointSuggestions([])
                      } else {
                        alert('3대지 추천 중 오류가 발생했습니다: ' + (data.error || '결과를 받지 못했습니다'))
                      }
                    } catch (err: any) {
                      console.error(err)
                      alert('3대지 추천 중 오류가 발생했습니다: ' + (err.message || '알 수 없는 오류'))
                    } finally {
                      setPointLoading(null)
                    }
                  }}
                  disabled={pointLoading === -1 || !form.title.trim() || !form.bibleBook.trim() || !form.coreMessage.trim()}
                  className="text-xs font-medium text-primary hover:text-primary-dark transition-colors flex items-center gap-1 disabled:opacity-50"
                >
                  {pointLoading === -1 ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  3대지 추천
                </button>
                <button
                type="button"
                onClick={() => {
                  setForm((prev) => ({
                    ...prev,
                    outlinePoints: [...prev.outlinePoints, ''],
                    outlineDetails: [...prev.outlineDetails, ''],
                  }))
                }}
                className="text-xs font-medium text-primary hover:text-primary-dark transition-colors flex items-center gap-1"
              >
                + 대지 추가
              </button>
            </div>
          </div>
            {form.outlinePoints.map((point, idx) => {
              const loading = pointLoading === idx
              const suggestions = pointSuggestions[idx] || []
              return (
                <div key={idx} className="border border-border rounded-md p-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={point}
                        onChange={(e) => {
                          setForm((prev) => {
                            const next = [...prev.outlinePoints]
                            next[idx] = e.target.value
                            return { ...prev, outlinePoints: next }
                          })
                          setPointSuggestions((prev) => {
                            const next = [...prev]
                            next[idx] = []
                            return next
                          })
                        }}
                        placeholder={`대지 ${idx + 1} 제목`}
                        className="w-full px-3 py-2 text-sm font-medium border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-light"
                      />
                      <textarea
                        value={form.outlineDetails[idx] || ''}
                        onChange={(e) => {
                          setForm((prev) => {
                            const next = [...prev.outlineDetails]
                            next[idx] = e.target.value
                            return { ...prev, outlineDetails: next }
                          })
                        }}
                        placeholder="대지에 대한 상세 설명"
                        rows={3}
                        className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-light resize-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <button
                        type="button"
                        onClick={async () => {
                          const title = form.title.trim()
                          const passage = form.bibleBook.trim()
                          const coreMessage = form.coreMessage.trim()
                          if (!title || !passage || !coreMessage) return
                          setPointLoading(idx)
                          setPointSuggestions((prev) => {
                            const next = [...prev]
                            next[idx] = []
                            return next
                          })
                          try {
                            const res = await fetch('/api/suggest', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ title, passage, coreMessage, pointIndex: idx }),
                            })
                            const data = await res.json()
                            if (data.success && data.suggestions.length > 0) {
                              setForm((prev) => {
                                const pts = [...prev.outlinePoints]
                                const dets = [...prev.outlineDetails]
                                pts[idx] = data.suggestions[0].title
                                dets[idx] = data.suggestions[0].description || ''
                                return { ...prev, outlinePoints: pts, outlineDetails: dets }
                              })
                              setPointSuggestions((prev) => {
                                const next = [...prev]
                                next[idx] = data.suggestions.slice(1)
                                return next
                              })
                            }
                          } catch (err) {
                            console.error(err)
                          } finally {
                            setPointLoading(null)
                          }
                        }}
                        disabled={loading || pointLoading === -1 || !form.title.trim() || !form.bibleBook.trim() || !form.coreMessage.trim()}
                        className="px-2.5 py-2 text-xs font-medium border border-border rounded-md hover:bg-accent disabled:opacity-50 whitespace-nowrap flex items-center gap-1"
                      >
                        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                        AI추천
                      </button>
                      {form.outlinePoints.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            setForm((prev) => ({
                              ...prev,
                              outlinePoints: prev.outlinePoints.filter((_, i) => i !== idx),
                              outlineDetails: prev.outlineDetails.filter((_, i) => i !== idx),
                            }))
                            setPointSuggestions((prev) => prev.filter((_, i) => i !== idx))
                          }}
                          className="p-2 text-muted hover:text-red-500 transition-colors self-end"
                          title="삭제"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        </button>
                      )}
                    </div>
                  </div>
                  {suggestions.length > 0 && (
                    <div className="mt-1.5 border border-border rounded-md bg-surface divide-y divide-border">
                      <div className="px-2.5 py-1.5 text-[11px] font-medium text-primary flex items-center gap-1">
                        <Lightbulb className="w-3 h-3" />
                        다른 추천 대지
                      </div>
                      {suggestions.map((s, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setForm((prev) => {
                              const pts = [...prev.outlinePoints]
                              const dets = [...prev.outlineDetails]
                              pts[idx] = s.title
                              dets[idx] = s.description || ''
                              return { ...prev, outlinePoints: pts, outlineDetails: dets }
                            })
                            setPointSuggestions((prev) => {
                              const next = [...prev]
                              next[idx] = []
                              return next
                            })
                          }}
                          className="w-full text-left px-2.5 py-2 text-xs hover:bg-slate-50 transition-colors"
                        >
                          <span className="font-medium text-foreground">{s.title}</span>
                          {s.reason && <span className="ml-1.5 text-muted">{s.reason}</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-muted">적용 (그리스도 중심으로 연결하기)</label>
              <button
                type="button"
                onClick={async () => {
                  const title = form.title.trim()
                  const passage = form.bibleBook.trim()
                  const coreMessage = form.coreMessage.trim()
                  const points = form.outlinePoints.filter(p => p.trim())
                  if (!title || !passage || !coreMessage || points.length === 0) return
                  setSuggestLoading(true)
                  try {
                    const res = await fetch('/api/suggest', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        title, passage, coreMessage,
                        outlinePoints: form.outlinePoints,
                        outlineDetails: form.outlineDetails,
                        generateApplication: true,
                      }),
                    })
                    const data = await res.json()
                    if (data.success && data.text) {
                      updateField('christApplication', data.text)
                    }
                  } catch (err) {
                    console.error(err)
                  } finally {
                    setSuggestLoading(false)
                  }
                }}
                disabled={suggestLoading || !form.title.trim() || !form.bibleBook.trim() || !form.coreMessage.trim() || form.outlinePoints.every(p => !p.trim())}
                className="text-xs font-medium text-primary hover:text-primary-dark transition-colors flex items-center gap-1 disabled:opacity-50"
              >
                {suggestLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                자동완성
              </button>
            </div>
            <textarea
              value={form.christApplication}
              onChange={(e) => updateField('christApplication', e.target.value)}
              rows={5}
              placeholder="설교 제목, 성경 본문, 핵심 메시지, 3대지를 바탕으로 그리스도 중심의 적용이 자동완성됩니다."
              className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-light resize-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-muted">서론 작성</label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={async () => {
                    if (!form.title.trim() || !form.bibleBook.trim() || !form.coreMessage.trim()) return
                    setIntroConclusionLoading(true)
                    setIntroSuggestions([])
                    try {
                      const res = await fetch('/api/suggest', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          title: form.title.trim(), passage: form.bibleBook.trim(),
                          coreMessage: form.coreMessage.trim(),
                          outlinePoints: form.outlinePoints, outlineDetails: form.outlineDetails,
                          generateIntroduction: true, suggestOnly: true,
                        }),
                      })
                      const data = await res.json()
                      if (data.success && data.suggestions) setIntroSuggestions(data.suggestions)
                    } catch (err) { console.error(err) }
                    finally { setIntroConclusionLoading(false) }
                  }}
                  disabled={introConclusionLoading || !form.title.trim() || !form.bibleBook.trim() || !form.coreMessage.trim()}
                  className="text-xs font-medium border border-border rounded-md px-2.5 py-1.5 hover:bg-accent disabled:opacity-50 flex items-center gap-1"
                >
                  {introConclusionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  AI추천
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!form.title.trim() || !form.bibleBook.trim() || !form.coreMessage.trim()) return
                    setSuggestLoading(true)
                    try {
                      const res = await fetch('/api/suggest', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          title: form.title.trim(), passage: form.bibleBook.trim(),
                          coreMessage: form.coreMessage.trim(),
                          outlinePoints: form.outlinePoints, outlineDetails: form.outlineDetails,
                          generateIntroduction: true,
                        }),
                      })
                      const data = await res.json()
                      if (data.success && data.text) updateField('introduction', data.text)
                    } catch (err) { console.error(err) }
                    finally { setSuggestLoading(false) }
                  }}
                  disabled={suggestLoading || !form.title.trim() || !form.bibleBook.trim() || !form.coreMessage.trim()}
                  className="text-xs font-medium text-primary hover:text-primary-dark transition-colors flex items-center gap-1 disabled:opacity-50"
                >
                  {suggestLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  자동완성
                </button>
              </div>
            </div>
            <textarea
              value={form.introduction}
              onChange={(e) => updateField('introduction', e.target.value)}
              rows={4}
              placeholder="설교 서론이 자동완성됩니다."
              className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-light resize-none"
            />
            {introSuggestions.length > 0 && (
              <div className="mt-1.5 border border-border rounded-md bg-surface divide-y divide-border">
                <div className="px-2.5 py-1.5 text-[11px] font-medium text-primary flex items-center gap-1">
                  <Lightbulb className="w-3 h-3" />
                  추천 서론
                </div>
                {introSuggestions.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      updateField('introduction', s.value)
                      setIntroSuggestions([])
                    }}
                    className="w-full text-left px-2.5 py-2 text-xs hover:bg-slate-50 transition-colors"
                  >
                    <span className="text-foreground">{s.value}</span>
                    {s.reason && <span className="ml-1.5 text-muted">{s.reason}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-muted">결론 작성</label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={async () => {
                    if (!form.title.trim() || !form.bibleBook.trim() || !form.coreMessage.trim()) return
                    setIntroConclusionLoading(true)
                    setConclusionSuggestions([])
                    try {
                      const res = await fetch('/api/suggest', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          title: form.title.trim(), passage: form.bibleBook.trim(),
                          coreMessage: form.coreMessage.trim(),
                          outlinePoints: form.outlinePoints, outlineDetails: form.outlineDetails,
                          generateConclusion: true, suggestOnly: true,
                        }),
                      })
                      const data = await res.json()
                      if (data.success && data.suggestions) setConclusionSuggestions(data.suggestions)
                    } catch (err) { console.error(err) }
                    finally { setIntroConclusionLoading(false) }
                  }}
                  disabled={introConclusionLoading || !form.title.trim() || !form.bibleBook.trim() || !form.coreMessage.trim()}
                  className="text-xs font-medium border border-border rounded-md px-2.5 py-1.5 hover:bg-accent disabled:opacity-50 flex items-center gap-1"
                >
                  {introConclusionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  AI추천
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!form.title.trim() || !form.bibleBook.trim() || !form.coreMessage.trim()) return
                    setSuggestLoading(true)
                    try {
                      const res = await fetch('/api/suggest', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          title: form.title.trim(), passage: form.bibleBook.trim(),
                          coreMessage: form.coreMessage.trim(),
                          outlinePoints: form.outlinePoints, outlineDetails: form.outlineDetails,
                          generateConclusion: true,
                        }),
                      })
                      const data = await res.json()
                      if (data.success && data.text) updateField('conclusion', data.text)
                    } catch (err) { console.error(err) }
                    finally { setSuggestLoading(false) }
                  }}
                  disabled={suggestLoading || !form.title.trim() || !form.bibleBook.trim() || !form.coreMessage.trim()}
                  className="text-xs font-medium text-primary hover:text-primary-dark transition-colors flex items-center gap-1 disabled:opacity-50"
                >
                  {suggestLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  자동완성
                </button>
              </div>
            </div>
            <textarea
              value={form.conclusion}
              onChange={(e) => updateField('conclusion', e.target.value)}
              rows={4}
              placeholder="설교 결론이 자동완성됩니다."
              className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-light resize-none"
            />
            {conclusionSuggestions.length > 0 && (
              <div className="mt-1.5 border border-border rounded-md bg-surface divide-y divide-border">
                <div className="px-2.5 py-1.5 text-[11px] font-medium text-primary flex items-center gap-1">
                  <Lightbulb className="w-3 h-3" />
                  추천 결론
                </div>
                {conclusionSuggestions.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      updateField('conclusion', s.value)
                      setConclusionSuggestions([])
                    }}
                    className="w-full text-left px-2.5 py-2 text-xs hover:bg-slate-50 transition-colors"
                  >
                    <span className="text-foreground">{s.value}</span>
                    {s.reason && <span className="ml-1.5 text-muted">{s.reason}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-muted">예화</label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={async () => {
                    if (!form.title.trim() || !form.bibleBook.trim() || !form.coreMessage.trim()) return
                    setIllustrationLoading(true)
                    setIllustrationSuggestions([])
                    try {
                      const res = await fetch('/api/suggest', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          title: form.title.trim(), passage: form.bibleBook.trim(),
                          coreMessage: form.coreMessage.trim(),
                          outlinePoints: form.outlinePoints, outlineDetails: form.outlineDetails,
                          introduction: form.introduction, conclusion: form.conclusion,
                          application: form.christApplication,
                          generateIllustration: true, suggestOnly: true,
                        }),
                      })
                      const data = await res.json()
                      if (data.success && data.suggestions) setIllustrationSuggestions(data.suggestions)
                    } catch (err) { console.error(err) }
                    finally { setIllustrationLoading(false) }
                  }}
                  disabled={illustrationLoading || !form.title.trim() || !form.bibleBook.trim() || !form.coreMessage.trim()}
                  className="text-xs font-medium border border-border rounded-md px-2.5 py-1.5 hover:bg-accent disabled:opacity-50 flex items-center gap-1"
                >
                  {illustrationLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  AI추천
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!form.title.trim() || !form.bibleBook.trim() || !form.coreMessage.trim()) return
                    setIllustrationLoading(true)
                    try {
                      const res = await fetch('/api/suggest', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          title: form.title.trim(), passage: form.bibleBook.trim(),
                          coreMessage: form.coreMessage.trim(),
                          outlinePoints: form.outlinePoints, outlineDetails: form.outlineDetails,
                          introduction: form.introduction, conclusion: form.conclusion,
                          application: form.christApplication,
                          generateIllustration: true,
                        }),
                      })
                      const data = await res.json()
                      if (data.success && data.text) updateField('illustration', data.text)
                    } catch (err) { console.error(err) }
                    finally { setIllustrationLoading(false) }
                  }}
                  disabled={illustrationLoading || !form.title.trim() || !form.bibleBook.trim() || !form.coreMessage.trim()}
                  className="text-xs font-medium text-primary hover:text-primary-dark transition-colors flex items-center gap-1 disabled:opacity-50"
                >
                  {illustrationLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  자동완성
                </button>
              </div>
            </div>
            <textarea
              value={form.illustration}
              onChange={(e) => updateField('illustration', e.target.value)}
              rows={4}
              placeholder="설교에 사용할 예화가 자동완성됩니다."
              className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-light resize-none"
            />
            {illustrationSuggestions.length > 0 && (
              <div className="mt-1.5 border border-border rounded-md bg-surface divide-y divide-border">
                <div className="px-2.5 py-1.5 text-[11px] font-medium text-primary flex items-center gap-1">
                  <Lightbulb className="w-3 h-3" />
                  추천 예화
                </div>
                {illustrationSuggestions.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      updateField('illustration', s.value)
                      setIllustrationSuggestions([])
                    }}
                    className="w-full text-left px-2.5 py-2 text-xs hover:bg-slate-50 transition-colors"
                  >
                    <span className="text-foreground">{s.value}</span>
                    {s.reason && <span className="ml-1.5 text-muted">{s.reason}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">설교문 원고 *</label>
            <button
              type="button"
              onClick={() => {
                setManuscriptPreview('')
                setManuscriptLength('30분')
                setManuscriptModal(true)
              }}
              className="mb-2 text-xs font-medium text-primary hover:text-primary-dark transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              원고 작성
            </button>
            <textarea
              value={form.manuscript}
              onChange={(e) => updateField('manuscript', e.target.value)}
              rows={10}
              placeholder="설교 원고를 입력해주세요."
              className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-light resize-none font-mono leading-relaxed"
              required
            />
          </div>
        </div>

        {manuscriptModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setManuscriptModal(false)}>
            <div className="bg-white rounded-lg shadow-xl w-[640px] max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <h3 className="text-sm font-semibold">원고 작성</h3>
                <button type="button" onClick={() => setManuscriptModal(false)} className="text-muted hover:text-foreground text-lg leading-none">&times;</button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-muted mb-2">설교 시간</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: '10분', label: '10분', desc: '1,400~1,700자' },
                      { value: '20분', label: '20분', desc: '2,800~3,400자' },
                      { value: '30분', label: '30분', desc: '4,200~5,100자' },
                      { value: '40분', label: '40분', desc: '5,600~6,800자' },
                      { value: '50분', label: '50분', desc: '7,000~8,500자' },
                      { value: '60분', label: '60분', desc: '8,400~10,200자' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setManuscriptLength(opt.value)}
                        className={`px-3 py-2 text-xs rounded-md border text-left transition-colors ${manuscriptLength === opt.value ? 'border-primary bg-primary/5 text-primary font-medium' : 'border-border text-muted hover:border-primary-light'}`}
                      >
                        <div className="font-medium">{opt.label}</div>
                        <div className="text-[10px] opacity-70">{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    setManuscriptGenerating(true)
                    setManuscriptPreview('')
                    try {
                      const res = await fetch('/api/suggest', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          title: form.title,
                          passage: `${form.bibleBook} ${form.chapterStart}:${form.verseStart}`,
                          coreMessage: form.coreMessage,
                          outlinePoints: form.outlinePoints,
                          outlineDetails: form.outlineDetails,
                          introduction: form.introduction,
                          conclusion: form.conclusion,
                          application: form.christApplication,
                          illustration: form.illustration,
                          generateManuscript: true,
                          length: manuscriptLength,
                        }),
                      })
                      const data = await res.json()
                      if (data.success) setManuscriptPreview(data.text || data.value || '')
                    } catch { setManuscriptPreview('생성 중 오류가 발생했습니다.') }
                    finally { setManuscriptGenerating(false) }
                  }}
                  disabled={manuscriptGenerating || !form.title.trim() || !form.bibleBook.trim() || !form.coreMessage.trim()}
                  className="w-full py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {manuscriptGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {manuscriptGenerating ? '생성 중...' : '생성'}
                </button>
                {manuscriptPreview && (
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1.5">미리보기</label>
                    <div className="border border-border rounded-md p-3 text-sm whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">{manuscriptPreview}</div>
                    <button
                      type="button"
                      onClick={() => {
                        updateField('manuscript', manuscriptPreview)
                        setManuscriptModal(false)
                      }}
                      className="mt-2 w-full py-1.5 bg-primary text-white text-xs font-medium rounded-md hover:bg-primary-dark transition-colors"
                    >
                      적용하기
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="bg-surface border border-border rounded-lg p-6">
          <button
            type="button"
            onClick={() => setShowOptional(!showOptional)}
            className="text-sm font-semibold text-muted hover:text-foreground transition-colors flex items-center gap-2"
          >
            {showOptional ? '▼' : '▶'} 선택 입력 (절기, 시리즈, 태그)
          </button>

          {showOptional && (
            <div className="mt-5 space-y-5 animate-fade-in">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted mb-1.5">절기</label>
                  <select
                    value={form.season}
                    onChange={(e) => updateField('season', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-light"
                  >
                    <option value="">선택...</option>
                    {SEASONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1.5">시리즈</label>
                  <select
                    value={form.seriesId}
                    onChange={(e) => updateField('seriesId', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-light"
                  >
                    <option value="">선택...</option>
                    {state.series.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted mb-2">태그</label>
                <input
                  type="text"
                  value={themeFilter}
                  onChange={(e) => setThemeFilter(e.target.value)}
                  placeholder="태그 검색..."
                  className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-light mb-3"
                />

                {form.themeIds.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-muted mb-1">선택된 태그:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {form.themeIds.map((id) => {
                        const theme = [...MAJOR_THEMES, ...SITUATION_TAGS, ...EMOTION_TAGS].find(
                          (t) => t.id === id
                        )
                        return theme ? (
                          <span
                            key={id}
                            onClick={() => toggleTheme(id)}
                            className="text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded-full cursor-pointer hover:bg-primary/20"
                          >
                            {theme.name} ×
                          </span>
                        ) : null
                      })}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted mb-1.5">대주제</p>
                    <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                      {filteredMajorThemes.map((t) => (
                        <span
                          key={t.id}
                          onClick={() => toggleTheme(t.id)}
                          className="text-[11px] bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full cursor-pointer hover:bg-orange-100"
                        >
                          {t.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted mb-1.5">상황</p>
                    <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                      {filteredSituationTags.map((t) => (
                        <span
                          key={t.id}
                          onClick={() => toggleTheme(t.id)}
                          className="text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full cursor-pointer hover:bg-blue-100"
                        >
                          {t.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted mb-1.5">정서</p>
                    <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                      {filteredEmotionTags.map((t) => (
                        <span
                          key={t.id}
                          onClick={() => toggleTheme(t.id)}
                          className="text-[11px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full cursor-pointer hover:bg-purple-100"
                        >
                          {t.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">수동 관련 설교</label>
                <select
                  multiple
                  value={form.relatedSermonIds}
                  onChange={(e) =>
                    updateField(
                      'relatedSermonIds',
                      Array.from(e.target.selectedOptions, (option) => option.value)
                    )
                  }
                  className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-light h-24"
                >
                  {state.sermons.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title} ({s.normalizedPassage})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="text-sm border border-border px-5 py-2 rounded-md hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300 transition-colors"
          >
            임시저장
          </button>
          <button
            type="submit"
            className="text-sm bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-md transition-colors"
          >
            저장
          </button>
        </div>
      </form>
      <ManageOptionsModal open={manageOpen} onClose={() => setManageOpen(false)} />
    </div>
  )
}

export default function NewSermonPage() {
  return (
    <Suspense fallback={<div className="animate-fade-in py-12 text-center"><p className="text-muted text-sm">로딩 중...</p></div>}>
      <NewSermonForm />
    </Suspense>
  )
}
