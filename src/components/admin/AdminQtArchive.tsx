'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, Loader2, ArrowLeft, FileText, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const SEASONS = ['연중', '대림', '성탄', '사순', '부활']

interface QtArchiveItem {
  id: string
  slug: string
  title: string
  excerpt: string
  bible_passage: string
  season: string
  published_at: string
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

export default function AdminQtArchive() {
  const [mode, setMode] = useState<'list' | 'upload'>('list')
  const [items, setItems] = useState<QtArchiveItem[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  const [formTitle, setFormTitle] = useState('')
  const [formExcerpt, setFormExcerpt] = useState('')
  const [formBiblePassage, setFormBiblePassage] = useState('')
  const [formContent, setFormContent] = useState('')
  const [formSeason, setFormSeason] = useState('연중')
  const [formThumbnail, setFormThumbnail] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/qt-archive')
      const data = await res.json()
      setItems(data.items || [])
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchItems() }, [fetchItems])

  const handleUpload = async () => {
    if (!formTitle.trim()) return
    setUploading(true)
    setUploadError(null)

    try {
      const res = await fetch('/api/qt-archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle,
          excerpt: formExcerpt,
          bible_passage: formBiblePassage,
          content: formContent,
          season: formSeason,
          thumbnail_url: formThumbnail,
        }),
      })

      if (!res.ok) throw new Error('저장 실패')

      setFormTitle('')
      setFormExcerpt('')
      setFormBiblePassage('')
      setFormContent('')
      setFormSeason('연중')
      setFormThumbnail('')
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

  if (mode === 'upload') {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMode('list')}
            className="p-2 rounded-lg hover:bg-surface-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-foreground-muted" />
          </button>
          <h2 className="font-serif text-h2 text-foreground">새 큐티 등록</h2>
        </div>

        <div className="space-y-5 bg-surface rounded-2xl border border-border p-6 shadow-elevated">
          <div className="space-y-2">
            <label className="text-meta font-medium text-foreground-muted">제목 *</label>
            <input type="text" value={formTitle} onChange={e => setFormTitle(e.target.value)}
              placeholder="예: 기다림의 시간이 은혜가 될 때"
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface-2 text-foreground text-body placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all" />
          </div>

          <div className="space-y-2">
            <label className="text-meta font-medium text-foreground-muted">간단 설명</label>
            <textarea value={formExcerpt} onChange={e => setFormExcerpt(e.target.value)}
              placeholder="큐티에 대한 짧은 소개"
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface-2 text-foreground text-body placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all resize-none" />
          </div>

          <div className="space-y-2">
            <label className="text-meta font-medium text-foreground-muted">성경 본문</label>
            <input type="text" value={formBiblePassage} onChange={e => setFormBiblePassage(e.target.value)}
              placeholder="예: 이사야 40:27-31"
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface-2 text-foreground text-body placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all" />
          </div>

          <div className="space-y-2">
            <label className="text-meta font-medium text-foreground-muted">본문 내용 (선택)</label>
            <textarea value={formContent} onChange={e => setFormContent(e.target.value)}
              placeholder="큐티 전문을 입력하세요"
              rows={6}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface-2 text-foreground text-body placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all resize-none" />
          </div>

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
              <label className="text-meta font-medium text-foreground-muted">썸네일 URL (선택)</label>
              <input type="text" value={formThumbnail} onChange={e => setFormThumbnail(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface-2 text-foreground text-body placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all" />
            </div>
          </div>

          {uploadError && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-[13px] text-red-600">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {uploadError}
            </div>
          )}

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-h2 text-foreground">큐티 목록</h2>
          <p className="text-meta text-foreground-muted mt-0.5">업로드한 큐티는 메인 /qt 페이지에 표시됩니다</p>
        </div>
        <button onClick={() => setMode('upload')}
          className="px-4 py-2 rounded-xl bg-accent text-white font-medium text-meta hover:bg-accent/90 transition-colors flex items-center gap-2"
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
          <FileText className="w-10 h-10 mx-auto text-foreground-subtle mb-3" />
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
                  {item.bible_passage && (
                    <span className="text-[11px] text-foreground-subtle">{item.bible_passage}</span>
                  )}
                </div>
                <h3 className="font-serif text-h3 text-foreground truncate">{item.title}</h3>
                <p className="text-meta text-foreground-muted truncate mt-0.5">{item.excerpt}</p>
                <span className="text-[11px] text-foreground-subtle">{formatDate(item.published_at)}</span>
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
