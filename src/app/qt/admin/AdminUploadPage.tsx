'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Loader2, ArrowLeft, FileText, ExternalLink, AlertCircle, BookOpen, FileJson } from 'lucide-react'
import { FileDropzone } from '@/components/qt/FileDropzone'
import { getGenerations, getGenerationLabel, formatDate, formatFileSize, type Generation, type GenerationalQtItem, type GenerationalQtFile } from '@/lib/data/generational-qt'
import { cn } from '@/lib/utils/cn'
import AdminQtArchive from '@/components/admin/AdminQtArchive'
import AdminQtJsonArchive from '@/components/admin/AdminQtJsonArchive'

export default function AdminUploadPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'generational' | 'archive' | 'json'>('generational')
  const [mode, setMode] = useState<'list' | 'upload'>('list')
  const [items, setItems] = useState<GenerationalQtItem[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Upload form state
  const [formGen, setFormGen] = useState<Generation>('중고등')
  const [formTitle, setFormTitle] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formPassage, setFormPassage] = useState('')
  const [formWeek, setFormWeek] = useState('')
  const [formFiles, setFormFiles] = useState<{ file: File; url?: string }[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/generational-qt')
      const data = await res.json()
      setItems(Array.isArray(data) ? data : [])
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
      // Upload files first
      const uploadedFiles: GenerationalQtFile[] = []
      for (const { file } of formFiles) {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('generation', formGen)

        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        if (!res.ok) throw new Error(`"${file.name}" 업로드 실패`)
        const data = await res.json()
        uploadedFiles.push(data)
      }

      // Create generational QT record
      const res = await fetch('/api/generational-qt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          generation: formGen,
          title: formTitle,
          description: formDesc,
          bible_passage: formPassage,
          week_label: formWeek,
          files: uploadedFiles,
        }),
      })

      if (!res.ok) throw new Error('저장 실패')

      // Reset form
      setFormTitle('')
      setFormDesc('')
      setFormPassage('')
      setFormWeek('')
      setFormFiles([])
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
      await fetch(`/api/generational-qt/${id}`, { method: 'DELETE' })
      fetchItems()
    } catch {
      alert('삭제에 실패했습니다')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="font-serif text-h1 text-foreground">관리자 페이지</h1>
        <div className="flex flex-wrap gap-1 p-1 bg-surface-2 rounded-xl border border-border">
          <button onClick={() => { setTab('generational'); setMode('list') }}
            className={cn(
              'px-4 py-2 rounded-lg text-meta font-medium transition-all',
              tab === 'generational' ? 'bg-surface text-foreground shadow-sm' : 'text-foreground-muted hover:text-foreground'
            )}
          >
            <FileText className="w-3.5 h-3.5 inline mr-1.5" />
            세대별 자료
          </button>
          <button onClick={() => setTab('archive')}
            className={cn(
              'px-4 py-2 rounded-lg text-meta font-medium transition-all',
              tab === 'archive' ? 'bg-surface text-foreground shadow-sm' : 'text-foreground-muted hover:text-foreground'
            )}
          >
            <BookOpen className="w-3.5 h-3.5 inline mr-1.5" />
            큐티 목록
          </button>
          <button onClick={() => setTab('json')}
            className={cn(
              'px-4 py-2 rounded-lg text-meta font-medium transition-all',
              tab === 'json' ? 'bg-surface text-foreground shadow-sm' : 'text-foreground-muted hover:text-foreground'
            )}
          >
            <FileJson className="w-3.5 h-3.5 inline mr-1.5" />
            큐티 자료
          </button>
        </div>
      </div>

      {tab === 'json' ? (
        <AdminQtJsonArchive />
      ) : tab === 'archive' ? (
        <AdminQtArchive />
      ) : (
        <>
          {mode === 'upload' ? (
            /* Upload form - unchanged */
            <div className="space-y-8 max-w-2xl mx-auto">
              <div className="flex items-center gap-3">
                <button onClick={() => setMode('list')}
                  className="p-2 rounded-lg hover:bg-surface-2 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 text-foreground-muted" />
                </button>
                <h2 className="font-serif text-h2 text-foreground">새 자료 업로드</h2>
              </div>

              <div className="space-y-6 bg-surface rounded-2xl border border-border p-6 shadow-elevated">
                <div className="space-y-2">
                  <label className="text-meta font-medium text-foreground-muted">세대</label>
                  <div className="flex flex-wrap gap-2">
                    {getGenerations().map((gen) => (
                      <button key={gen} onClick={() => setFormGen(gen)}
                        className={cn(
                          'px-4 py-2 rounded-full text-meta font-medium border transition-all',
                          formGen === gen
                            ? 'bg-accent text-white border-accent'
                            : 'bg-surface-2 text-foreground-muted border-border hover:border-accent/40'
                        )}
                      >{getGenerationLabel(gen)}</button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-meta font-medium text-foreground-muted">제목 *</label>
                  <input type="text" value={formTitle} onChange={e => setFormTitle(e.target.value)}
                    placeholder="예: 2026년 7월 3주 큐티"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface-2 text-foreground text-body placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all" />
                </div>

                <div className="space-y-2">
                  <label className="text-meta font-medium text-foreground-muted">설명</label>
                  <textarea value={formDesc} onChange={e => setFormDesc(e.target.value)}
                    placeholder="자료에 대한 간단한 설명" rows={2}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface-2 text-foreground text-body placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all resize-none" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-meta font-medium text-foreground-muted">성경 본문</label>
                    <input type="text" value={formPassage} onChange={e => setFormPassage(e.target.value)}
                      placeholder="예: 빌립보서 4:4-9"
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface-2 text-foreground text-body placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-meta font-medium text-foreground-muted">주차</label>
                    <input type="text" value={formWeek} onChange={e => setFormWeek(e.target.value)}
                      placeholder="예: 7월 3주"
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface-2 text-foreground text-body placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-meta font-medium text-foreground-muted">파일 첨부</label>
                  <FileDropzone onFilesChange={setFormFiles} />
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
                    <><Loader2 className="w-4 h-4 animate-spin" /> 업로드 중...</>
                  ) : (
                    <><Plus className="w-4 h-4" /> 자료 업로드</>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-h2 text-foreground">세대별 자료</h2>
                  <p className="text-meta text-foreground-muted mt-1">세대별 큐티 자료를 업로드하고 관리합니다</p>
                </div>
                <button onClick={() => setMode('upload')}
                  className="px-5 py-2.5 rounded-xl bg-accent text-white font-medium text-meta hover:bg-accent/90 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> 새 자료
                </button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-5 h-5 animate-spin text-accent" />
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-20 bg-surface rounded-2xl border border-border">
                  <FileText className="w-10 h-10 mx-auto text-foreground-subtle mb-4" />
                  <p className="text-body text-foreground-muted mb-2">아직 업로드된 자료가 없습니다</p>
                  <button onClick={() => setMode('upload')}
                    className="px-4 py-2 rounded-xl bg-accent text-white text-meta font-medium hover:bg-accent/90 transition-colors"
                  >첫 자료 업로드하기</button>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id}
                      className="flex items-center gap-4 p-4 bg-surface rounded-xl border border-border hover:border-accent/20 transition-all"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn(
                            'px-2 py-0.5 rounded-full text-[10px] font-semibold border',
                            item.generation === '초등' && 'bg-emerald-100 text-emerald-700 border-emerald-200',
                            item.generation === '중고등' && 'bg-sky-100 text-sky-700 border-sky-200',
                            item.generation === '청년' && 'bg-violet-100 text-violet-700 border-violet-200',
                            item.generation === '장년' && 'bg-amber-100 text-amber-700 border-amber-200',
                          )}>
                            {getGenerationLabel(item.generation)}
                          </span>
                          {item.week_label && <span className="text-[11px] text-foreground-subtle">{item.week_label}</span>}
                        </div>
                        <h3 className="font-serif text-h3 text-foreground truncate">{item.title}</h3>
                        <div className="flex items-center gap-3 text-[11px] text-foreground-subtle mt-0.5">
                          {item.bible_passage && <span>{item.bible_passage}</span>}
                          <span>{formatDate(item.created_at)}</span>
                          <span>파일 {item.files.length}개</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <a href={`/qt/published/${item.id}`} target="_blank"
                          className="p-2 rounded-lg hover:bg-surface-2 text-foreground-subtle hover:text-accent transition-colors"
                        ><ExternalLink className="w-4 h-4" /></a>
                        <button onClick={() => handleDelete(item.id)} disabled={deleting === item.id}
                          className="p-2 rounded-lg hover:bg-red-50 text-foreground-subtle hover:text-red-500 transition-colors disabled:opacity-50"
                        >
                          {deleting === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
