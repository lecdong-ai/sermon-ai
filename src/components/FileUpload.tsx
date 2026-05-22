'use client'

import { useState, useRef, type DragEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, FileText, AlertCircle, CheckCircle, ChevronDown, ChevronUp, X, Loader2, Pencil } from 'lucide-react'

interface Props {
  onSuccess?: (sermonId: string) => void
}

export default function FileUpload({ onSuccess }: Props) {
  const router = useRouter()
  const [isDragging, setIsDragging] = useState(false)
  const [phase, setPhase] = useState<'idle' | 'uploading' | 'parsing' | 'done' | 'error'>('idle')
  const [fileName, setFileName] = useState('')
  const [fileSize, setFileSize] = useState(0)
  const [preview, setPreview] = useState('')
  const [fullText, setFullText] = useState('')
  const [previewOpen, setPreviewOpen] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [warningMsg, setWarningMsg] = useState<string | null>(null)
  const [sermonId, setSermonId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileRef = useRef<File | null>(null)

  const handleFile = async (file: File) => {
    setErrorMsg(null)
    setWarningMsg(null)
    setPreview('')
    setPreviewOpen(false)
    const ext = file.name.split('.').pop()?.toLowerCase()

    if (ext === 'doc') {
      setWarningMsg('.doc 파일은 호환성 문제로 .docx로 변환 후 업로드를 권장합니다.')
      return
    }

    if (!['txt', 'pdf', 'docx'].includes(ext || '')) {
      setErrorMsg('txt, pdf, docx 파일만 업로드 가능합니다.')
      return
    }

    if (file.size > 20 * 1024 * 1024) {
      setErrorMsg(`파일 크기가 20MB를 초과합니다. (${(file.size / 1024 / 1024).toFixed(1)}MB)`)
      return
    }

    fileRef.current = file
    setFileName(file.name)
    setFileSize(file.size)
    setPhase('uploading')

    const formData = new FormData()
    formData.append('file', file)

    try {
      setPhase('parsing')
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()

      if (data.success && data.sermonId) {
        setPhase('done')
        setSermonId(data.sermonId)
        if (data.preview) setPreview(data.preview)
        if (data.fullText) setFullText(data.fullText)
      } else {
        setErrorMsg(data.error || '업로드 실패')
        if (data.warning) setWarningMsg(data.warning)
        setPhase('error')
      }
    } catch (e) {
      setErrorMsg(e instanceof Error && e.message || '네트워크 오류가 발생했습니다. 다시 시도해주세요.')
      setPhase('error')
    }
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const reset = () => {
    setPhase('idle')
    setFileName('')
    setFileSize(0)
    setPreview('')
    setPreviewOpen(false)
    setErrorMsg(null)
    setWarningMsg(null)
    setFullText('')
    setSermonId(null)
    fileRef.current = null
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
    return `${(bytes / 1024 / 1024).toFixed(1)}MB`
  }

  return (
    <div>
      {phase === 'idle' || phase === 'error' ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 overflow-hidden ${
            isDragging
              ? 'border-2 border-primary-500 bg-primary-50/80 scale-[1.02]'
              : phase === 'error'
                ? 'border-2 border-red-300 bg-red-50/50'
                : 'border-2 border-dashed border-[#d1d6db] bg-white hover:border-primary-400 hover:bg-primary-50/30 hover:shadow-lg hover:-translate-y-0.5'
          }`}
        >
          {/* 배경 그라데이션 */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary-50/0 to-primary-50/0 opacity-0 group-hover:opacity-100 transition-opacity" />

          <div className="relative">
            <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-all duration-300 ${
              isDragging ? 'bg-primary-500 scale-110 shadow-lg' : 'bg-[#f0f4ff]'
            }`}>
              <Upload className={`w-7 h-7 transition-all duration-300 ${
                isDragging ? 'text-white' : 'text-primary-500'
              }`} />
            </div>
            <p className={`font-bold text-[17px] mb-1 transition-colors ${
              isDragging ? 'text-primary-600' : 'text-[#191f28]'
            }`}>
              {isDragging ? '파일을 놓으세요' : '설교 원고를 업로드하세요'}
            </p>
            <p className="text-[15px] text-[#8b95a1]">PDF, TXT, DOCX 지원 (최대 20MB)</p>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept=".txt,.pdf,.docx"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
          />
        </div>
      ) : phase === 'uploading' || phase === 'parsing' ? (
        <div className="rounded-2xl border border-[#e5e8eb] bg-white p-8 text-center animate-scale">
          <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
          </div>
          <p className="font-bold text-[17px] mb-1">{fileName}</p>
          <p className="text-[15px] text-[#4e5968]">
            {phase === 'uploading' ? (
              <span className="flex items-center justify-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse-dot" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse-dot" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse-dot" style={{ animationDelay: '300ms' }} />
                업로드 중
              </span>
            ) : (
              <span className="flex items-center justify-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse-dot" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse-dot" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse-dot" style={{ animationDelay: '300ms' }} />
                AI 분석 중
              </span>
            )}
          </p>
        </div>
      ) : phase === 'done' ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50/50 p-5 animate-scale">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-bold text-[16px] text-[#191f28]">{fileName}</p>
                  <p className="text-[14px] text-[#4e5968]">{formatSize(fileSize)} · 텍스트 추출 완료</p>
                </div>
              </div>
              <button onClick={reset} className="w-7 h-7 rounded-lg hover:bg-green-100/50 flex items-center justify-center transition-colors">
                <X className="w-4 h-4 text-[#8b95a1]" />
              </button>
            </div>
          </div>
          <div className="rounded-2xl border border-[#e5e8eb] bg-white p-5">
            <div className="flex items-center gap-2 mb-3">
              <Pencil className="w-4 h-4 text-[#8b95a1]" />
              <span className="font-medium text-[15px] text-[#191f28]">추출된 텍스트</span>
              <span className="text-[13px] text-[#8b95a1]">({fullText.length.toLocaleString()}자)</span>
            </div>
            <textarea
              value={fullText}
              onChange={(e) => setFullText(e.target.value)}
              className="w-full h-64 p-4 border border-[#e5e8eb] rounded-xl text-[14px] text-[#4e5968] leading-relaxed resize-y focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-200"
            />
          </div>
          <button
            onClick={() => sermonId && onSuccess?.(sermonId)}
            className="w-full py-3 bg-primary-500 text-white rounded-xl font-bold text-[15px] hover:bg-primary-600 transition-colors"
          >
            분석 결과 보러가기
          </button>
        </div>
      ) : null}

      {errorMsg && (
        <div className="mt-3 flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 animate-slide-down">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-[15px] font-medium text-red-700 mb-0.5">업로드 오류</p>
            <p className="text-[15px] text-red-600/80">{errorMsg}</p>
          </div>
        </div>
      )}

      {warningMsg && (
        <div className="mt-3 flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 animate-slide-down">
          <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-[15px] text-amber-700">{warningMsg}</p>
        </div>
      )}
    </div>
  )
}
