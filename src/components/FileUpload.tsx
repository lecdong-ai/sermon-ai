'use client'

import { useState, useRef, memo, useEffect, type DragEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, FileText, AlertCircle, CheckCircle, X, Loader2, Sparkles, ArrowRight, BookOpen, Users, Image, Film, Presentation } from 'lucide-react'

interface Props {
  onSuccess?: (sermonId: string) => void
  dark?: boolean
}

const VALUE_PROPS = [
  { icon: BookOpen, label: '요약' },
  { icon: Users, label: '소그룹 자료' },
  { icon: Image, label: '카드뉴스' },
  { icon: Film, label: '설교 대본' },
  { icon: Presentation, label: 'PPT' },
]

export default memo(function FileUpload({ onSuccess, dark }: Props) {
  const router = useRouter()
  const [isDragging, setIsDragging] = useState(false)
  const [phase, setPhase] = useState<'idle' | 'uploading' | 'parsing' | 'done' | 'error'>('idle')
  const [progress, setProgress] = useState(0)
  const [fileName, setFileName] = useState('')
  const [fileSize, setFileSize] = useState(0)
  const [preview, setPreview] = useState('')
  const [fullText, setFullText] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [warningMsg, setWarningMsg] = useState<string | null>(null)
  const [sermonId, setSermonId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileRef = useRef<File | null>(null)
  const progressRef = useRef<number>(0)

  useEffect(() => {
    if (phase === 'uploading' && progress < 90) {
      const timer = setInterval(() => {
        progressRef.current += Math.random() * 15 + 5
        if (progressRef.current > 90) progressRef.current = 90
        setProgress(Math.round(progressRef.current))
      }, 400)
      return () => clearInterval(timer)
    }
  }, [phase, progress])

  useEffect(() => {
    if (phase === 'done' || phase === 'error') {
      setProgress(100)
      progressRef.current = 0
    }
  }, [phase])

  const handleFile = async (file: File) => {
    setErrorMsg(null)
    setWarningMsg(null)
    setPreview('')
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
    progressRef.current = 0
    setProgress(0)
    setPhase('uploading')

    const formData = new FormData()
    formData.append('file', file)

    try {
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
    setErrorMsg(null)
    setWarningMsg(null)
    setFullText('')
    setSermonId(null)
    fileRef.current = null
    progressRef.current = 0
    setProgress(0)
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
    return `${(bytes / 1024 / 1024).toFixed(1)}MB`
  }

  const accent = dark ? 'indigo' : 'primary'
  const theme = dark ? 'dark' : 'light'

  return (
    <div>
      {phase === 'idle' || phase === 'error' ? (
        <div>
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={`relative rounded-2xl p-10 sm:p-14 text-center cursor-pointer transition-all duration-500 overflow-hidden ${
              theme === 'dark'
                ? isDragging
                  ? 'border-2 border-indigo-400 bg-indigo-500/10 scale-[1.02]'
                  : phase === 'error'
                    ? 'border border-red-400/30 bg-red-500/5'
                    : 'border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20 hover:shadow-2xl hover:shadow-indigo-500/5'
                : isDragging
                  ? 'border-2 border-primary-500 bg-primary-50/80 scale-[1.02]'
                  : phase === 'error'
                    ? 'border-2 border-red-300 bg-red-50/50'
                    : 'border-2 border-dashed border-[#d1d6db] bg-white hover:border-primary-400 hover:bg-primary-50/30 hover:shadow-lg hover:-translate-y-0.5'
            }`}
          >
            {theme === 'dark' && !isDragging && phase !== 'error' && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-50%] left-[-50%] w-full h-full rounded-full bg-indigo-500/3 blur-[100px]" />
                <div className="absolute bottom-[-50%] right-[-50%] w-full h-full rounded-full bg-purple-500/3 blur-[100px]" />
              </div>
            )}

            <div className="relative">
              <div className={`w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center transition-all duration-500 ${
                isDragging
                  ? theme === 'dark' ? 'bg-indigo-500/20 scale-110' : 'bg-primary-500 scale-110 shadow-lg'
                  : theme === 'dark' ? 'bg-white/[0.06]' : 'bg-[#f0f4ff]'
              }`}>
                <Upload className={`w-7 h-7 transition-all duration-300 ${
                  isDragging
                    ? theme === 'dark' ? 'text-indigo-300' : 'text-white'
                    : theme === 'dark' ? 'text-white/50' : 'text-primary-500'
                }`} />
              </div>

              <p className={`font-bold text-[18px] sm:text-[20px] mb-1.5 transition-colors ${
                isDragging
                  ? theme === 'dark' ? 'text-indigo-300' : 'text-primary-600'
                  : theme === 'dark' ? 'text-white/90' : 'text-[#191f28]'
              }`}>
                {isDragging ? '파일을 놓으세요' : '설교 원고를 업로드하세요'}
              </p>
              <p className={`text-[14px] sm:text-[15px] ${theme === 'dark' ? 'text-white/40' : 'text-[#8b95a1]'}`}>
                PDF · TXT · DOCX 지원 (최대 20MB)
              </p>
            </div>

            <input
              ref={inputRef}
              type="file"
              accept=".txt,.pdf,.docx"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
            />
          </div>

          {theme === 'dark' && phase === 'idle' && (
            <div className="mt-6 text-center">
              <p className="text-[13px] text-white/30 mb-3">업로드하면 AI가 6종 콘텐츠를 자동 생성합니다</p>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {VALUE_PROPS.map((v, i) => {
                  const Icon = v.icon
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-white/50 text-[12px] font-medium"
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {v.label}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {errorMsg && (
            <div className={`mt-3 flex items-start gap-3 p-4 rounded-xl ${
              theme === 'dark' ? 'bg-red-500/10 border border-red-400/20' : 'bg-red-50 border border-red-200'
            }`}>
              <AlertCircle className={`w-4 h-4 mt-0.5 shrink-0 ${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`} />
              <div>
                <p className={`text-[14px] font-medium ${theme === 'dark' ? 'text-red-300' : 'text-red-700'} mb-0.5`}>업로드 오류</p>
                <p className={`text-[14px] ${theme === 'dark' ? 'text-red-400/80' : 'text-red-600/80'}`}>{errorMsg}</p>
              </div>
            </div>
          )}

          {warningMsg && (
            <div className={`mt-3 flex items-start gap-3 p-4 rounded-xl ${
              theme === 'dark' ? 'bg-amber-500/10 border border-amber-400/20' : 'bg-amber-50 border border-amber-200'
            }`}>
              <AlertCircle className={`w-4 h-4 mt-0.5 shrink-0 ${theme === 'dark' ? 'text-amber-400' : 'text-amber-500'}`} />
              <p className={`text-[14px] ${theme === 'dark' ? 'text-amber-300' : 'text-amber-700'}`}>{warningMsg}</p>
            </div>
          )}
        </div>
      ) : phase === 'uploading' || phase === 'parsing' ? (
        <div className={`rounded-2xl p-8 text-center ${
          theme === 'dark'
            ? 'bg-white/[0.03] border border-white/10'
            : 'border border-[#e5e8eb] bg-white'
        }`}>
          <div className={`w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center ${
            theme === 'dark' ? 'bg-white/[0.06]' : 'bg-primary-50'
          }`}>
            {phase === 'parsing' ? (
              <Sparkles className={`w-6 h-6 ${theme === 'dark' ? 'text-indigo-400' : 'text-primary-500'} animate-pulse`} />
            ) : (
              <Loader2 className={`w-6 h-6 ${theme === 'dark' ? 'text-white/60' : 'text-primary-500'} animate-spin`} />
            )}
          </div>
          <p className={`font-bold text-[17px] mb-1 ${theme === 'dark' ? 'text-white/90' : 'text-[#191f28]'}`}>{fileName}</p>
          <p className={`text-[14px] mb-4 ${theme === 'dark' ? 'text-white/50' : 'text-[#4e5968]'}`}>
            {phase === 'uploading' ? '업로드 중...' : 'AI가 설교를 분석하고 있습니다'}
          </p>
          <div className={`h-1.5 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-white/[0.06]' : 'bg-slate-100'}`}>
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500'
                  : 'bg-gradient-to-r from-primary-400 to-primary-600'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className={`text-[11px] mt-2 ${theme === 'dark' ? 'text-white/20' : 'text-slate-400'}`}>{progress}%</p>
        </div>
      ) : phase === 'done' ? (
        <div className="space-y-4">
          <div className={`rounded-2xl p-5 ${
            theme === 'dark'
              ? 'bg-emerald-500/10 border border-emerald-400/20'
              : 'border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50/50'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  theme === 'dark' ? 'bg-emerald-500/20' : 'bg-green-100'
                }`}>
                  <CheckCircle className={`w-5 h-5 ${theme === 'dark' ? 'text-emerald-400' : 'text-green-600'}`} />
                </div>
                <div>
                  <p className={`font-bold text-[16px] ${theme === 'dark' ? 'text-white/90' : 'text-[#191f28]'}`}>{fileName}</p>
                  <p className={`text-[13px] ${theme === 'dark' ? 'text-white/40' : 'text-[#4e5968]'}`}>{formatSize(fileSize)} · 텍스트 추출 완료</p>
                </div>
              </div>
              <button onClick={reset} className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                theme === 'dark' ? 'hover:bg-white/[0.06]' : 'hover:bg-green-100/50'
              }`}>
                <X className={`w-4 h-4 ${theme === 'dark' ? 'text-white/30' : 'text-[#8b95a1]'}`} />
              </button>
            </div>
          </div>

          {preview && (
            <div className={`rounded-2xl p-5 ${
              theme === 'dark' ? 'bg-white/[0.03] border border-white/10' : 'border border-[#e5e8eb] bg-white'
            }`}>
              <div className="flex items-center gap-2 mb-3">
                <FileText className={`w-4 h-4 ${theme === 'dark' ? 'text-white/30' : 'text-[#8b95a1]'}`} />
                <span className={`font-medium text-[15px] ${theme === 'dark' ? 'text-white/70' : 'text-[#191f28]'}`}>추출된 텍스트 미리보기</span>
                <span className={`text-[12px] ${theme === 'dark' ? 'text-white/20' : 'text-[#8b95a1]'}`}>({fullText.length.toLocaleString()}자)</span>
              </div>
              <div className={`max-h-48 overflow-y-auto rounded-xl p-4 text-[13px] leading-relaxed ${
                theme === 'dark' ? 'bg-black/20 text-white/50' : 'bg-slate-50 text-[#4e5968]'
              }`}>
                {preview}
              </div>
            </div>
          )}

          <button
            onClick={() => {
              if (sermonId) {
                if (onSuccess) { onSuccess(sermonId); return }
                router.push(`/dashboard/sermons/uploaded/${sermonId}`)
              }
            }}
            className={`w-full py-3.5 rounded-xl font-bold text-[15px] transition-all flex items-center justify-center gap-2 ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/20 hover:-translate-y-0.5 active:translate-y-0'
                : 'bg-primary-500 text-white hover:bg-primary-600'
            }`}
          >
            분석 결과 보러가기
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : null}
    </div>
  )
})
