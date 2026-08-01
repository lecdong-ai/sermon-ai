'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, Loader2, ArrowLeft, BookOpen, AlertCircle, X, Sparkles, Check, Pencil } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const SEASONS = ['연중', '대림', '성탄', '사순', '부활'] as const

interface QtJsonItem {
  id: string
  slug: string
  title: string
  excerpt: string
  season: string
  bibleRange?: string
  tags: { id: string; slug: string; name: string }[]
  publishedAt: string
}

interface SuggestionItem {
  value: string
  reason: string
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

export default function AdminQtJsonArchive() {
  const [mode, setMode] = useState<'list' | 'upload'>('list')
  const [items, setItems] = useState<QtJsonItem[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<QtJsonItem | null>(null)

  const [formTitle, setFormTitle] = useState('')
  const [formExcerpt, setFormExcerpt] = useState('')
  const [formBiblePassage, setFormBiblePassage] = useState('')
  const [formBibleText, setFormBibleText] = useState('')
  const [formKeyVerse, setFormKeyVerse] = useState('')
  const [formContent, setFormContent] = useState('')
  const [formSeason, setFormSeason] = useState<string>('연중')
  const [formThumbnailSrc, setFormThumbnailSrc] = useState('')
  const [formThumbnailAlt, setFormThumbnailAlt] = useState('')
  const [formTags, setFormTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const [suggesting, setSuggesting] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<{ field: string; items: SuggestionItem[] } | null>(null)
  const [suggestError, setSuggestError] = useState<string | null>(null)

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/qt-archive')
      const data = await res.json()
      const mapped: QtJsonItem[] = (data.items || []).map((item: any) => ({
        id: item.id,
        slug: item.slug,
        title: item.title,
        excerpt: item.excerpt,
        season: item.season,
        bibleRange: item.bible_passage || '',
        tags: (item.tags || []).map((t: any, i: number) => ({
          id: `tag-${i}`,
          slug: typeof t === 'string' ? t.toLowerCase().replace(/\s+/g, '-') : '',
          name: typeof t === 'string' ? t : String(t?.name || t),
        })),
        publishedAt: item.published_at || item.created_at,
      }))
      setItems(mapped)
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchItems() }, [fetchItems])

  const resetForm = () => {
    setFormTitle('')
    setFormExcerpt('')
    setFormBiblePassage('')
    setFormBibleText('')
    setFormKeyVerse('')
    setFormContent('')
    setFormSeason('연중')
    setFormThumbnailSrc('')
    setFormThumbnailAlt('')
    setFormTags([])
    setTagInput('')
    setEditingItem(null)
    setUploadError(null)
  }

  const cancelEdit = () => {
    resetForm()
    setMode('list')
  }

  const startEdit = async (item: QtJsonItem) => {
    setEditingItem(item)
    setMode('upload')
    setUploading(true)
    setUploadError(null)

    try {
      const res = await fetch(`/api/qt-archive`)
      const json = await res.json()
      const found = (json.items || []).find((x: any) => x.id === item.id)

      setFormTitle(found?.title || item.title || '')
      setFormExcerpt(found?.excerpt || item.excerpt || '')
      setFormBiblePassage(found?.bible_passage || item.bibleRange || '')
      setFormBibleText(found?.bible_text || '')
      setFormKeyVerse(found?.key_verse || '')
      setFormContent(found?.content || '')
      setFormSeason(found?.season || item.season || '연중')
      setFormThumbnailSrc(found?.thumbnail_url || '')
      setFormTags((found?.tags || []).map((t: any) => (typeof t === 'string' ? t : t?.name || String(t))))
    } catch {
      setFormTitle(item.title)
      setFormExcerpt(item.excerpt)
      setFormBiblePassage(item.bibleRange || '')
      setFormSeason(item.season)
    } finally {
      setUploading(false)
    }
  }

  const addTag = () => {
    const t = tagInput.trim()
    if (t && !formTags.includes(t)) {
      setFormTags([...formTags, t])
      setTagInput('')
    }
  }

  const removeTag = (t: string) => {
    setFormTags(formTags.filter((x) => x !== t))
  }

  const handleSuggest = async (field: string) => {
    setSuggesting(field)
    setSuggestError(null)
    setSuggestions(null)

    try {
      const res = await fetch('/api/qt-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          field,
          title: formTitle,
          passage: formBiblePassage,
          bibleText: formBibleText,
          keyVerse: formKeyVerse,
          excerpt: formExcerpt,
        }),
      })
      const json = await res.json()

      if (json.success && json.suggestions?.length) {
        setSuggestions({ field, items: json.suggestions })
      } else {
        setSuggestError(json.error || '추천 실패')
      }
    } catch (e) {
      console.error('[AdminQtJsonArchive] suggest error:', e)
      setSuggestError('네트워크 오류')
    } finally {
      setSuggesting(null)
    }
  }

  const pickSuggestion = (field: string, value: string) => {
    switch (field) {
      case 'title': setFormTitle(value); break
      case 'excerpt': setFormExcerpt(value); break
      case 'passage': setFormBiblePassage(value); break
      case 'bibleText': setFormBibleText(value); break
      case 'keyVerse': setFormKeyVerse(value); break
      case 'content': setFormContent(value); break
    }
    setSuggestions(null)
  }

  const handleUpload = async () => {
    if (!formTitle.trim()) return
    setUploading(true)
    setUploadError(null)

    const payload = {
      title: formTitle,
      excerpt: formExcerpt,
      content: formContent,
      bible_passage: formBiblePassage,
      bible_text: formBibleText,
      key_verse: formKeyVerse,
      season: formSeason,
      thumbnail_url: formThumbnailSrc,
      tags: formTags,
    }

    try {
      const isEdit = !!editingItem
      const endpoint = isEdit ? `/api/qt-archive/${editingItem.id}` : '/api/qt-archive'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || '저장 실패')
      }

      resetForm()
      setMode('list')
      fetchItems()
    } catch (err: any) {
      setUploadError(err.message || '업로드 중 오류가 발생했습니다')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    setDeleting(id)
    try {
      await fetch(`/api/qt-archive/${id}`, { method: 'DELETE' })
      fetchItems()
    } catch {
      alert('삭제에 실패했습니다')
    } finally {
      setDeleting(null)
    }
  }

  const AiButton = ({ field, label, disabled }: { field: string; label: string; disabled?: boolean }) => (
    <button
      type="button"
      onClick={() => handleSuggest(field)}
      disabled={disabled || suggesting !== null}
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-accent-soft text-accent border border-accent/20 hover:bg-accent hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {suggesting === field ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
      {suggesting === field ? '추천 중...' : label}
    </button>
  )

  const SuggestionList = ({ field }: { field: string }) => {
    if (!suggestions || suggestions.field !== field) return null
    return (
      <div className="mt-2 space-y-1.5">
        {suggestions.items.map((item, i) => (
          <button
            key={i}
            type="button"
            onClick={() => pickSuggestion(field, item.value)}
            className="group w-full text-left p-2.5 rounded-lg border border-border bg-surface-2 hover:border-accent/40 hover:bg-accent-soft/30 transition-all"
          >
            <div className="flex items-start gap-2">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent border border-accent/20 group-hover:bg-accent group-hover:text-white transition-colors">
                <Check className="w-3 h-3" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-bold text-foreground whitespace-pre-wrap">{item.value}</p>
                {item.reason && <p className="mt-0.5 text-[11px] text-foreground-subtle leading-relaxed">{item.reason}</p>}
              </div>
            </div>
          </button>
        ))}
      </div>
    )
  }

  if (mode === 'upload') {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-3">
          <button onClick={() => setMode('list')}
            className="p-2 rounded-lg hover:bg-surface-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-foreground-muted" />
          </button>
          <h2 className="font-serif text-h2 text-foreground">새 큐티 등록</h2>
        </div>

        <div className="space-y-5 bg-surface rounded-2xl border border-border p-6 shadow-elevated">
          {/* 상단 에러 */}
          {(uploadError || suggestError) && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-[13px] text-red-600">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {uploadError || suggestError}
            </div>
          )}

          {/* 제목 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-meta font-medium text-foreground-muted">제목 *</label>
              <AiButton field="title" label="AI 제목 추천" disabled={!formBiblePassage.trim()} />
            </div>
            <input type="text" value={formTitle} onChange={e => setFormTitle(e.target.value)}
              placeholder="예: 기다림의 시간이 은혜가 될 때"
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface-2 text-foreground text-body placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all" />
            <SuggestionList field="title" />
          </div>

          {/* 간단 설명 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-meta font-medium text-foreground-muted">간단 설명</label>
              <AiButton field="excerpt" label="AI 설명 추천" disabled={!formTitle.trim() && !formBiblePassage.trim()} />
            </div>
            <textarea value={formExcerpt} onChange={e => setFormExcerpt(e.target.value)}
              placeholder="큐티에 대한 짧은 소개"
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface-2 text-foreground text-body placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all resize-none" />
            <SuggestionList field="excerpt" />
          </div>

          {/* 성경 본문 + 핵심 구절 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-meta font-medium text-foreground-muted">성경 본문</label>
                <AiButton field="passage" label="AI 본문 추천" disabled={!formTitle.trim()} />
              </div>
              <input type="text" value={formBiblePassage} onChange={e => setFormBiblePassage(e.target.value)}
                placeholder="예: 이사야 40:27-31"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface-2 text-foreground text-body placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all" />
              <SuggestionList field="passage" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-meta font-medium text-foreground-muted">핵심 구절</label>
                <AiButton field="keyVerse" label="AI 구절 추천" disabled={!formBiblePassage.trim()} />
              </div>
              <input type="text" value={formKeyVerse} onChange={e => setFormKeyVerse(e.target.value)}
                placeholder="예: 이사야 40:31"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface-2 text-foreground text-body placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all" />
              <SuggestionList field="keyVerse" />
            </div>
          </div>

          {/* 성경 본문 텍스트 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-meta font-medium text-foreground-muted">성경 본문 텍스트</label>
              <AiButton field="bibleText" label="AI 본문 텍스트" disabled={!formBiblePassage.trim()} />
            </div>
            <textarea value={formBibleText} onChange={e => setFormBibleText(e.target.value)}
              placeholder="성경 본문 전체 텍스트 — AI 버튼을 누르면 자동으로 채워집니다"
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface-2 text-foreground text-body placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all resize-none" />
            <SuggestionList field="bibleText" />
          </div>

          {/* 큐티 본문 내용 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-meta font-medium text-foreground-muted">큐티 본문 내용</label>
              <AiButton field="content" label="AI 큐티 작성" disabled={!formTitle.trim() || !formBiblePassage.trim()} />
            </div>
            <textarea value={formContent} onChange={e => setFormContent(e.target.value)}
              placeholder="큐티 전문을 입력하세요. 마크다운 형식을 사용할 수 있습니다. AI 버튼을 누르면 자동으로 작성됩니다."
              rows={10}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface-2 text-foreground text-body placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all resize-none" />
            <SuggestionList field="content" />
          </div>

          {/* 시즌 + 태그 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-meta font-medium text-foreground-muted">시즌</label>
              <div className="flex flex-wrap gap-1.5">
                {SEASONS.map(s => (
                  <button key={s} onClick={() => setFormSeason(s)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-meta font-medium border transition-all',
                      formSeason === s
                        ? 'bg-accent text-white border-accent'
                        : 'bg-surface-2 text-foreground-muted border-border hover:border-accent/40'
                    )}
                  >{s}</button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-meta font-medium text-foreground-muted">태그</label>
              <div className="flex gap-1.5">
                <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                  placeholder="태그 입력 후 Enter"
                  className="flex-1 px-3 py-1.5 rounded-xl border border-border bg-surface-2 text-foreground text-meta placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all" />
                <button onClick={addTag} type="button"
                  className="px-3 py-1.5 rounded-xl bg-surface-2 border border-border text-foreground-muted hover:border-accent/40 hover:text-accent transition-all"
                ><Plus className="w-3.5 h-3.5" /></button>
              </div>
              {formTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {formTags.map(t => (
                    <span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent-soft text-accent text-[11px] font-medium border border-accent/20">
                      {t}
                      <button onClick={() => removeTag(t)} className="hover:text-accent/70"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 썸네일 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-meta font-medium text-foreground-muted">썸네일 이미지 URL (선택)</label>
              <input type="text" value={formThumbnailSrc} onChange={e => setFormThumbnailSrc(e.target.value)}
                placeholder="https://... (비워두면 자동 생성)"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface-2 text-foreground text-body placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-meta font-medium text-foreground-muted">썸네일 설명 (선택)</label>
              <input type="text" value={formThumbnailAlt} onChange={e => setFormThumbnailAlt(e.target.value)}
                placeholder="이미지 설명"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface-2 text-foreground text-body placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all" />
            </div>
          </div>

          {/* 에러 */}
          {(uploadError || suggestError) && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-[13px] text-red-600">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {uploadError || suggestError}
            </div>
          )}

          {/* 등록 버튼 */}
          <button onClick={handleUpload} disabled={uploading || !formTitle.trim()}
            className="w-full py-3 rounded-xl bg-accent text-white font-medium text-body hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {uploading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> 등록 중...</>
            ) : (
              <><Plus className="w-4 h-4" /> 큐티 등록</>
            )}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="font-serif text-h2 text-foreground">큐티 자료</h2>
          <p className="text-meta text-foreground-muted mt-0.5">Supabase 기반 저장 — 메인 /qt 페이지에 자동 반영됩니다</p>
        </div>
        <button onClick={() => setMode('upload')}
          className="px-5 py-2.5 rounded-xl bg-accent text-white font-medium text-body hover:bg-accent/90 transition-colors flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" /> 새 큐티
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-5 h-5 animate-spin text-accent" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded-2xl border border-border">
          <BookOpen className="w-10 h-10 mx-auto text-foreground-subtle mb-3" />
          <p className="text-body text-foreground-muted mb-1">등록된 큐티가 없습니다</p>
          <p className="text-meta text-foreground-subtle mb-4">새 큐티를 등록하면 메인 페이지에 자동 반영됩니다</p>
          <button onClick={() => setMode('upload')}
            className="px-4 py-2 rounded-xl bg-accent text-white text-meta font-medium hover:bg-accent/90 transition-colors"
          >첫 큐티 등록하기</button>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id}
              className="flex items-center gap-4 p-4 bg-surface rounded-xl border border-border hover:border-accent/20 transition-all"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-accent-soft text-accent border border-accent/20">
                    {item.season}
                  </span>
                  {item.bibleRange && (
                    <span className="text-[11px] text-foreground-subtle">{item.bibleRange}</span>
                  )}
                  {item.tags.length > 0 && (
                    <div className="flex gap-1">
                      {item.tags.slice(0, 3).map(t => (
                        <span key={t.id} className="text-[10px] text-foreground-subtle">#{t.name}</span>
                      ))}
                    </div>
                  )}
                </div>
                <h3 className="font-serif text-h3 text-foreground truncate">{item.title}</h3>
                <p className="text-meta text-foreground-muted truncate mt-0.5">{item.excerpt}</p>
                <span className="text-[11px] text-foreground-subtle">{formatDate(item.publishedAt)}</span>
              </div>

              <button onClick={() => handleDelete(item.id)} disabled={deleting === item.id}
                className="p-2 rounded-lg hover:bg-red-50 text-foreground-subtle hover:text-red-500 transition-colors disabled:opacity-50"
              >
                {deleting === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
