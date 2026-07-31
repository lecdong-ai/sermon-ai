'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Loader2, ArrowLeft, FileText, ExternalLink, AlertCircle, BookOpen, FileJson, Pencil, X } from 'lucide-react'
import { FileDropzone } from '@/components/qt/FileDropzone'
import { getGenerations, getGenerationLabel, getGenerationPathKey, toAsciiSafeName, formatDate, formatFileSize, type Generation, type GenerationalQtItem, type GenerationalQtFile } from '@/lib/data/generational-qt'
import { cn } from '@/lib/utils/cn'
import AdminQtArchive from '@/components/admin/AdminQtArchive'
import AdminQtJsonArchive from '@/components/admin/AdminQtJsonArchive'
import { supabase } from '@/lib/supabase'

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

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

  // Edit state
  const [editingItem, setEditingItem] = useState<GenerationalQtItem | null>(null)
  const [removedFileUrls, setRemovedFileUrls] = useState<string[]>([])

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

  // 단일 파일 Storage 업로드 파이프라인 (생성/수정 공용)
  const uploadFileToStorage = async (file: File): Promise<GenerationalQtFile> => {
    const normalizedName = file.name.normalize('NFC')
    let fileUrl = ''

    // 1단계: Signed Upload URL 토큰 기반 직통 업로드 (최우선 — 서버/대역폭 안 탐, 대용량 가능)
    try {
      const signRes = await fetch('/api/generational-qt/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: normalizedName,
          fileType: file.type || 'application/pdf',
          generation: formGen,
        }),
      })

      if (signRes.ok) {
        const { token, path, publicUrl } = await signRes.json()
        if (token && path) {
          const { data: signedResult, error: signedError } = await supabase.storage
            .from('qt-files')
            .uploadToSignedUrl(path, token, file)

          if (!signedError && signedResult) {
            fileUrl = publicUrl
          } else {
            console.warn('Signed URL upload failed:', signedError)
          }
        }
      } else {
        const errText = await signRes.text().catch(() => 'unknown error')
        console.warn('Signed URL API returned non-ok:', signRes.status, errText)
      }
    } catch (e) {
      console.warn('Signed Upload URL pipeline failed:', e)
    }

    // 2단계: 서버사이드 API route 업로드 (supabaseAdmin, service role 우회)
    // ※ 3MB 초과 파일은 서버 메모리/DB 부하 우려로 제외 (Data URL fallback 금지)
    if (!fileUrl && file.size <= 3 * 1024 * 1024) {
      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('generation', formGen)

        const apiRes = await fetch('/api/generational-qt/upload', {
          method: 'POST',
          body: formData,
        })

        if (apiRes.ok) {
          const result = await apiRes.json()
          if (result.url) {
            fileUrl = result.url
          }
        } else {
          const errText = await apiRes.text().catch(() => '')
          console.warn('Server-side upload API failed:', apiRes.status, errText)
        }
      } catch (e) {
        console.warn('Server-side upload API exception:', e)
      }
    }

    // 3단계: Supabase Storage Direct Upload (qt-files 버킷 — RLS가 허용할 경우만)
    if (!fileUrl) {
      try {
        const safeBaseName = toAsciiSafeName(normalizedName)
        const timeStamp = Date.now()
        const filePath = `generational-qt/${getGenerationPathKey(formGen)}/${timeStamp}_${safeBaseName}`

        const { data: uploadData, error: storageError } = await supabase.storage
          .from('qt-files')
          .upload(filePath, file, {
            contentType: file.type || 'application/pdf',
            upsert: true,
          })

        if (!storageError && uploadData) {
          const { data: urlData } = supabase.storage.from('qt-files').getPublicUrl(uploadData.path)
          fileUrl = urlData.publicUrl
        } else if (storageError) {
          console.warn('Direct qt-files upload warning:', storageError)
        }
      } catch (e) {
        console.warn('Direct storage upload exception:', e)
      }
    }

    // 4단계: 기타 공개 버킷 탐색 (public, sermons, files 등)
    if (!fileUrl) {
      const fallbackBuckets = ['public', 'sermons', 'files', 'documents']
      const safeBaseName = toAsciiSafeName(normalizedName)
      const timeStamp = Date.now()
      const filePath = `generational-qt/${getGenerationPathKey(formGen)}/${timeStamp}_${safeBaseName}`

      for (const bName of fallbackBuckets) {
        if (fileUrl) break
        try {
          const { data: uploadData, error: storageError } = await supabase.storage
            .from(bName)
            .upload(filePath, file, {
              contentType: file.type || 'application/pdf',
              upsert: true,
            })

          if (!storageError && uploadData) {
            const { data: urlData } = supabase.storage.from(bName).getPublicUrl(uploadData.path)
            fileUrl = urlData.publicUrl
          }
        } catch (e) {
          // try next
        }
      }
    }

    // 5단계: 20MB 이하 파일은 Data URL로 인라인 fallback
    if (!fileUrl && file.size <= 20 * 1024 * 1024) {
      fileUrl = await fileToDataUrl(file)
    }

    // 6단계: 모든 업로드 수단 실패
    if (!fileUrl) {
      throw new Error(
        `파일("${file.name}", ${(file.size / 1024 / 1024).toFixed(1)}MB) 업로드에 실패했습니다. ` +
        `Supabase Storage(qt-files 버킷)에 접근할 수 없습니다. 관리자에게 문의하거나 잠시 후 다시 시도해 주세요.`
      )
    }

    return {
      name: normalizedName,
      url: fileUrl,
      type: file.type || 'application/pdf',
      size: file.size,
    }
  }

  // 편집 시작: 기존 값으로 폼 채우기
  const startEdit = (item: GenerationalQtItem) => {
    setEditingItem(item)
    setRemovedFileUrls([])
    setFormGen(item.generation)
    setFormTitle(item.title)
    setFormDesc(item.description || '')
    setFormPassage(item.bible_passage || '')
    setFormWeek(item.week_label || '')
    setFormFiles([])
    setUploadError(null)
    setMode('upload')
  }

  // 편집 취소
  const cancelEdit = () => {
    setEditingItem(null)
    setRemovedFileUrls([])
    setFormTitle('')
    setFormDesc('')
    setFormPassage('')
    setFormWeek('')
    setFormFiles([])
    setUploadError(null)
    setMode('list')
  }

  // 기존 파일 제거 토글
  const removeExistingFile = (url: string) => {
    setRemovedFileUrls(prev => (prev.includes(url) ? prev : [...prev, url]))
  }
  const restoreExistingFile = (url: string) => {
    setRemovedFileUrls(prev => prev.filter(u => u !== url))
  }

  const handleSubmit = async () => {
    if (!formTitle.trim()) return
    setUploading(true)
    setUploadError(null)

    try {
      // 새 파일 업로드
      const uploadedFiles: GenerationalQtFile[] = []
      for (const { file } of formFiles) {
        uploadedFiles.push(await uploadFileToStorage(file))
      }

      let finalFiles: GenerationalQtFile[]
      let removedFiles: string[] = []

      if (editingItem) {
        // 유지할 기존 파일 (제거 목록 제외) + 새 파일
        const keptExisting = editingItem.files.filter(f => !removedFileUrls.includes(f.url))
        finalFiles = [...keptExisting, ...uploadedFiles]
        removedFiles = removedFileUrls
      } else {
        finalFiles = uploadedFiles
      }

      const payload = {
        generation: formGen,
        title: formTitle,
        description: formDesc,
        bible_passage: formPassage,
        week_label: formWeek,
        files: finalFiles,
        removedFiles,
      }

      // DB 저장 (생성: POST / 수정: PATCH)
      const res = await fetch(
        editingItem ? `/api/generational-qt/${editingItem.id}` : '/api/generational-qt',
        {
          method: editingItem ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      )

      if (!res.ok) {
        let errorMsg = ''
        try {
          const errData = await res.json()
          errorMsg = typeof errData === 'string' ? errData : (errData?.error || errData?.message || JSON.stringify(errData))
        } catch {
          errorMsg = await res.text().catch(() => '')
        }
        throw new Error(errorMsg || `서버 오류 (${res.status})로 저장이 완료되지 않았습니다.`)
      }

      // Reset form
      setEditingItem(null)
      setRemovedFileUrls([])
      setFormTitle('')
      setFormDesc('')
      setFormPassage('')
      setFormWeek('')
      setFormFiles([])
      setMode('list')
      fetchItems()
    } catch (err: any) {
      setUploadError(err.message || '저장 중 오류가 발생했습니다.')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/generational-qt/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || '삭제에 실패했습니다')
      }
      await fetchItems()
    } catch (err: any) {
      alert(err.message || '삭제에 실패했습니다')
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
            /* Upload form - create + edit */
            <div className="space-y-8 max-w-2xl mx-auto">
              <div className="flex items-center gap-3">
                <button onClick={cancelEdit}
                  className="p-2 rounded-lg hover:bg-surface-2 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 text-foreground-muted" />
                </button>
                <h2 className="font-serif text-h2 text-foreground">{editingItem ? '자료 수정' : '새 자료 업로드'}</h2>
              </div>

              {editingItem && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-sky-50 border border-sky-200 text-[13px] text-sky-700">
                  <Pencil className="w-4 h-4 shrink-0" />
                  &quot;{editingItem.title}&quot; 수정 중 — 저장하면 변경사항이 반영됩니다.
                </div>
              )}

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

                {editingItem && editingItem.files.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-meta font-medium text-foreground-muted">기존 파일 ({editingItem.files.length - removedFileUrls.length} / {editingItem.files.length})</label>
                    <div className="space-y-2">
                      {editingItem.files.map((f) => {
                        const isRemoved = removedFileUrls.includes(f.url)
                        return (
                          <div key={f.url}
                            className={cn(
                              'flex items-center gap-3 p-2.5 rounded-xl border',
                              isRemoved ? 'bg-red-50 border-red-200 opacity-60' : 'bg-surface-2 border-border'
                            )}
                          >
                            <FileText className="w-4 h-4 shrink-0 text-foreground-subtle" />
                            <div className="flex-1 min-w-0">
                              <p className={cn('text-body text-foreground truncate', isRemoved && 'line-through text-foreground-muted')}>
                                {f.name}
                              </p>
                              <p className="text-[11px] text-foreground-subtle">{formatFileSize(f.size)}</p>
                            </div>
                            {isRemoved ? (
                              <button onClick={() => restoreExistingFile(f.url)}
                                className="p-1.5 rounded-lg text-meta font-medium text-emerald-600 hover:bg-emerald-50 transition-colors"
                              >복원</button>
                            ) : (
                              <button onClick={() => removeExistingFile(f.url)}
                                className="p-1.5 rounded-lg text-foreground-subtle hover:text-red-500 hover:bg-red-50 transition-colors"
                                title="파일 제거"
                              ><X className="w-4 h-4" /></button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-meta font-medium text-foreground-muted">파일 첨부{editingItem ? ' (추가)' : ''}</label>
                  <FileDropzone onFilesChange={setFormFiles} />
                </div>

                {uploadError && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-[13px] text-red-600">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {uploadError}
                  </div>
                )}

                <button onClick={handleSubmit} disabled={uploading || !formTitle.trim()}
                  className="w-full py-3 rounded-xl bg-accent text-white font-medium text-body hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> 저장 중...</>
                  ) : editingItem ? (
                    <><Pencil className="w-4 h-4" /> 변경사항 저장</>
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
                        <button onClick={() => startEdit(item)}
                          className="p-2 rounded-lg hover:bg-surface-2 text-foreground-subtle hover:text-accent transition-colors"
                          title="수정"
                        ><Pencil className="w-4 h-4" /></button>
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
