'use client'

import { useCallback, useState } from 'react'
import { Upload, FileText, Image as ImageIcon, FileArchive, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface FileEntry {
  file: File
  preview: string
  uploading?: boolean
  uploaded?: boolean
  url?: string
  error?: string
}

interface FileDropzoneProps {
  maxFiles?: number
  maxSizeMB?: number
  accept?: string
  onFilesChange: (files: { file: File; url?: string }[]) => void
}

export function FileDropzone({ maxFiles = 10, maxSizeMB = 20, accept = '.pdf,.png,.jpg,.jpeg,.gif,.webp', onFilesChange }: FileDropzoneProps) {
  const [entries, setEntries] = useState<FileEntry[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)

  const updateEntries = useCallback((newEntries: FileEntry[]) => {
    setEntries(newEntries)
    onFilesChange(newEntries.filter(e => !e.error).map(e => ({ file: e.file, url: e.url })))
  }, [onFilesChange])

  const handleFiles = useCallback((files: FileList) => {
    setGlobalError(null)
    const newEntries: FileEntry[] = []
    const remaining = maxFiles - entries.length

    for (let i = 0; i < Math.min(files.length, remaining); i++) {
      const file = files[i]
      if (file.size > maxSizeMB * 1024 * 1024) {
        setGlobalError(`"${file.name}" 파일이 너무 큽니다 (최대 ${maxSizeMB}MB)`)
        continue
      }
      newEntries.push({
        file,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
      })
    }

    if (files.length > remaining) {
      setGlobalError(`최대 ${maxFiles}개까지 업로드 가능합니다`)
    }

    updateEntries([...entries, ...newEntries])
  }, [entries, maxFiles, maxSizeMB, updateEntries])

  const removeEntry = useCallback((idx: number) => {
    const entry = entries[idx]
    if (entry.preview) URL.revokeObjectURL(entry.preview)
    const newEntries = entries.filter((_, i) => i !== idx)
    updateEntries(newEntries)
  }, [entries, updateEntries])

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files) }}
        onClick={() => document.getElementById('file-input')?.click()}
        className={cn(
          'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200',
          dragOver
            ? 'border-accent bg-accent-soft scale-[1.01]'
            : 'border-border hover:border-accent/40 hover:bg-surface-2/50'
        )}
      >
        <input
          id="file-input"
          type="file"
          multiple
          accept={accept}
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        <Upload className={cn(
          'w-8 h-8 mx-auto mb-3 transition-colors',
          dragOver ? 'text-accent' : 'text-foreground-subtle'
        )} />
        <p className="text-body text-foreground-muted mb-1">
          <span className="text-accent font-medium">파일을 드래그</span>하거나 클릭하여 선택
        </p>
        <p className="text-caption text-foreground-subtle">
          PDF, PNG, JPG · 최대 {maxFiles}개 · 파일당 {maxSizeMB}MB
        </p>
      </div>

      {/* Global error */}
      {globalError && (
        <p className="text-[12px] text-red-500 flex items-center gap-1">
          <X className="w-3 h-3" /> {globalError}
        </p>
      )}

      {/* File list */}
      {entries.length > 0 && (
        <div className="space-y-2">
          <p className="text-meta font-medium text-foreground-muted">선택된 파일 ({entries.length})</p>
          <div className="grid gap-2">
            {entries.map((entry, idx) => (
              <div
                key={idx}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border bg-surface transition-all',
                  entry.error ? 'border-red-200 bg-red-50' : 'border-border',
                  entry.uploaded ? 'border-emerald-200 bg-emerald-50' : ''
                )}
              >
                {/* Preview thumb */}
                {entry.preview ? (
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-2 shrink-0">
                    <img src={entry.preview} alt="" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-surface-2 flex items-center justify-center shrink-0">
                    {entry.file.type === 'application/pdf' ? (
                      <FileText className="w-5 h-5 text-rose-400" />
                    ) : (
                      <FileArchive className="w-5 h-5 text-amber-400" />
                    )}
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-meta font-medium text-foreground truncate">{entry.file.name}</p>
                  <p className="text-caption text-foreground-subtle">
                    {(entry.file.size / 1024 / 1024).toFixed(1)}MB
                    {entry.uploaded && ' · 업로드 완료'}
                    {entry.error && ` · ${entry.error}`}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  {entry.uploading && <Loader2 className="w-4 h-4 animate-spin text-accent" />}
                  {entry.uploaded && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                  <button
                    onClick={() => removeEntry(idx)}
                    className="p-1.5 rounded-lg hover:bg-surface-2 text-foreground-subtle hover:text-red-500 transition-colors"
                    type="button"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
