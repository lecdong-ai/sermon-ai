'use client'

import { useState, useMemo, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useApp } from '@/lib/dashboard/store'
import { Sermon } from '@/lib/dashboard/types'
import {
  SERMON_TYPES,
  AUDIENCES,
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

  const [showOptional, setShowOptional] = useState(false)

  const [form, setForm] = useState({
    title: '',
    date: new Date().toISOString().slice(0, 10),
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
    outlineIntro: '',
    outlinePoint1: '',
    outlinePoint2: '',
    outlinePoint3: '',
    outlineConclusion: '',
    themeIds: [] as string[],
    relatedSermonIds: [] as string[],
  })

  const [newThemeInput, setNewThemeInput] = useState('')
  const [themeFilter, setThemeFilter] = useState('')
  const [bibleLoading, setBibleLoading] = useState(false)
  const [bibleError, setBibleError] = useState('')

  useEffect(() => {
    const title = searchParams.get('title')
    const passage = searchParams.get('passage')
    if (title) setForm(prev => ({ ...prev, title }))
    if (passage) setForm(prev => ({ ...prev, bibleBook: passage }))
  }, [searchParams])

  useEffect(() => {
    if (!form.bibleBook || form.bibleBook.length < 3) return
    if (form.bibleText) return

    const timer = setTimeout(async () => {
      setBibleLoading(true)
      setBibleError('')
      try {
        const query = form.bibleBook.replace(/ /g, '+')
        const res = await fetch(`https://bible-api.com/${query}?translation=korean+kv`)
        if (!res.ok) throw new Error('API 오류')
        const data = await res.json()
        if (data.text) {
          setForm(prev => ({ ...prev, bibleText: data.text.trim() }))
        }
      } catch {
        setBibleError('성경 본문을 자동으로 가져오지 못했습니다. 직접 입력해주세요.')
      } finally {
        setBibleLoading(false)
      }
    }, 1500)

    return () => clearTimeout(timer)
  }, [form.bibleBook])

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

    const newSermon: Sermon = {
      id: `sermon-${Date.now()}`,
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
      outlineIntro: form.outlineIntro,
      outlinePoint1: form.outlinePoint1,
      outlinePoint2: form.outlinePoint2,
      outlinePoint3: form.outlinePoint3,
      outlineConclusion: form.outlineConclusion,
      manuscript: form.manuscript,
      themeIds: form.themeIds,
      tagIds: form.themeIds,
      relatedSermonIds: form.relatedSermonIds,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    dispatch({ type: 'ADD_SERMON', payload: newSermon })
    router.push(`/dashboard/sermons/${newSermon.id}`)
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
      <h2 className="text-xl font-bold mb-6">새 설교 등록</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-surface border border-border rounded-lg p-6 space-y-5">
          <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">
            필수 입력
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">설교 제목 *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="예: 두려움을 이기는 믿음"
                className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-light"
                required
              />
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
            <input
              type="text"
              value={form.bibleBook}
              onChange={(e) => updateField('bibleBook', e.target.value)}
              placeholder="예: 마태복음 11:28-30"
              className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-light"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">성경 본문 내용 (개역개정)</label>
            {bibleLoading && (
              <p className="text-[10px] text-primary mb-1 animate-pulse">성경 본문 가져오는 중...</p>
            )}
            {bibleError && (
              <p className="text-[10px] text-rose-500 mb-1">{bibleError}</p>
            )}
            <textarea
              value={form.bibleText}
              onChange={(e) => { updateField('bibleText', e.target.value); setBibleError('') }}
              rows={6}
              placeholder="본문 성경 구절을 여기에 붙여넣으세요...&#10;예: 수고하고 무거운 짐 진 자들아 다 내게로 오라 내가 너희를 쉬게 하리라"
              className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-light resize-none font-mono leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">설교 종류 *</label>
              <select
                value={form.sermonType}
                onChange={(e) => updateField('sermonType', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-light"
                required
              >
                <option value="">선택...</option>
                {SERMON_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">회중 *</label>
              <select
                value={form.audience}
                onChange={(e) => updateField('audience', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-light"
                required
              >
                <option value="">선택...</option>
                {AUDIENCES.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">설교자 *</label>
              <input
                type="text"
                value={form.preacher}
                onChange={(e) => updateField('preacher', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-light"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">핵심 메시지 *</label>
            <textarea
              value={form.coreMessage}
              onChange={(e) => updateField('coreMessage', e.target.value)}
              rows={3}
              placeholder="설교의 핵심 메시지를 한 문단으로 요약해주세요."
              className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-light resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">설교문 원고 *</label>
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

        <div className="bg-surface border border-border rounded-lg p-6">
          <button
            type="button"
            onClick={() => setShowOptional(!showOptional)}
            className="text-sm font-semibold text-muted hover:text-foreground transition-colors flex items-center gap-2"
          >
            {showOptional ? '▼' : '▶'} 선택 입력 (절기, 시리즈, 개요, 태그)
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

              <div className="space-y-3">
                <label className="block text-xs font-medium text-muted">설교 개요</label>
                <textarea
                  value={form.outlineIntro}
                  onChange={(e) => updateField('outlineIntro', e.target.value)}
                  rows={2}
                  placeholder="서론"
                  className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-light resize-none"
                />
                <textarea
                  value={form.outlinePoint1}
                  onChange={(e) => updateField('outlinePoint1', e.target.value)}
                  rows={2}
                  placeholder="대지 1"
                  className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-light resize-none"
                />
                <textarea
                  value={form.outlinePoint2}
                  onChange={(e) => updateField('outlinePoint2', e.target.value)}
                  rows={2}
                  placeholder="대지 2"
                  className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-light resize-none"
                />
                <textarea
                  value={form.outlinePoint3}
                  onChange={(e) => updateField('outlinePoint3', e.target.value)}
                  rows={2}
                  placeholder="대지 3"
                  className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-light resize-none"
                />
                <textarea
                  value={form.outlineConclusion}
                  onChange={(e) => updateField('outlineConclusion', e.target.value)}
                  rows={2}
                  placeholder="결론"
                  className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-light resize-none"
                />
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

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="text-sm border border-border px-5 py-2 rounded-md hover:bg-background transition-colors"
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
