'use client'

import { useState, useRef } from 'react'
import { Camera, Link2, Pencil, X, Upload, Loader2, Image as ImageIcon, ArrowRight, Check } from 'lucide-react'
import { mockExtractFromImage, type VisionExtractionResult } from '@/lib/conti/mockVision'
import { mockExtractFromUrl, extractYouTubeId, type UrlExtractionResult } from '@/lib/conti/mockUrlImport'
import SongExtractionReview from './SongExtractionReview'
import SongManualForm from './SongManualForm'
import type { ContiSong } from '@/types/conti'

type Path = 'select' | 'manual' | 'image' | 'url' | 'review'
type Extracted = (VisionExtractionResult & { kind: 'image' }) | (UrlExtractionResult & { kind: 'url' })

interface Props {
  onClose: () => void
  onSaved: (song: ContiSong) => void
}

export default function SongUploadHub({ onClose, onSaved }: Props) {
  const [path, setPath] = useState<Path>('select')
  const [extracted, setExtracted] = useState<Extracted | null>(null)
  const [extracting, setExtracting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [urlInput, setUrlInput] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  function reset() {
    setPath('select')
    setExtracted(null)
    setErrorMsg('')
    setPreviewImage(null)
    setUrlInput('')
  }

  async function handleImageFile(file: File) {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
    if (!allowed.includes(file.type)) {
      setErrorMsg('JPG/PNG/WebP 이미지 파일만 가능합니다.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('10MB 이하 파일만 가능합니다.')
      return
    }
    setErrorMsg('')
    setExtracting(true)
    setPreviewImage(URL.createObjectURL(file))
    try {
      const result = await mockExtractFromImage({ file, fileName: file.name })
      setExtracted({ ...result, kind: 'image' })
      setPath('review')
    } catch {
      setErrorMsg('이미지 분석에 실패했습니다.')
    } finally {
      setExtracting(false)
    }
  }

  async function handleUrlExtract() {
    if (!urlInput.trim()) {
      setErrorMsg('URL을 입력해 주세요.')
      return
    }
    setErrorMsg('')
    setExtracting(true)
    try {
      const result = await mockExtractFromUrl({ url: urlInput.trim() })
      setExtracted({ ...result, kind: 'url' })
      setPath('review')
    } catch {
      setErrorMsg('URL 추출에 실패했습니다.')
    } finally {
      setExtracting(false)
    }
  }

  function handleReviewSave(song: ContiSong) {
    onSaved(song)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#03050c]/85 backdrop-blur-md" onClick={onClose}>
      <div
        className="relative w-full max-w-2xl rounded-3xl bg-[#0a0f1f] border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div>
            <h2 className="text-[17px] font-bold text-white">
              {path === 'select' && '곡 추가'}
              {path === 'image' && '📸 사진에서 곡 추출'}
              {path === 'url' && '🔗 URL에서 곡 가져오기'}
              {path === 'manual' && '✏️ 직접 입력'}
              {path === 'review' && '✨ 추출 결과 검토'}
            </h2>
            <p className="text-[13px] text-slate-500 font-medium mt-0.5">
              {path === 'select' && '곡을 추가할 방법을 선택하세요'}
              {path === 'review' && 'AI가 추출한 내용을 검토하고 수정할 수 있어요'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 본문 */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
          {path === 'select' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => setPath('manual')}
                className="group p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-indigo-500/40 hover:bg-indigo-500/[0.05] transition-all text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Pencil className="w-5 h-5 text-indigo-300" />
                </div>
                <h3 className="text-[15px] font-bold text-white mb-1">직접 입력</h3>
                <p className="text-[12px] text-slate-400 font-medium leading-relaxed">
                  제목/아티스트/Key/BPM/<br />가사/코드를 폼에 입력
                </p>
              </button>

              <button
                onClick={() => setPath('image')}
                className="group p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-purple-500/40 hover:bg-purple-500/[0.05] transition-all text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Camera className="w-5 h-5 text-purple-300" />
                </div>
                <h3 className="text-[15px] font-bold text-white mb-1 flex items-center gap-1.5">
                  사진 한 장
                  <span className="text-[11px] px-1.5 py-0 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
                    ⭐
                  </span>
                </h3>
                <p className="text-[12px] text-slate-400 font-medium leading-relaxed">
                  악보/PPT/가사 캡처 → AI가<br />메타/가사/코드 자동 추출
                </p>
              </button>

              <button
                onClick={() => setPath('url')}
                className="group p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-sky-500/40 hover:bg-sky-500/[0.05] transition-all text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Link2 className="w-5 h-5 text-sky-300" />
                </div>
                <h3 className="text-[15px] font-bold text-white mb-1">URL 한 번</h3>
                <p className="text-[12px] text-slate-400 font-medium leading-relaxed">
                  YouTube/멜론 URL →<br />제목/아티스트/길이 자동
                </p>
              </button>
            </div>
          )}

          {path === 'image' && (
            <div className="space-y-4">
              <div
                onDragOver={(e) => { e.preventDefault() }}
                onDrop={(e) => {
                  e.preventDefault()
                  const f = e.dataTransfer.files[0]
                  if (f) handleImageFile(f)
                }}
                onClick={() => fileInputRef.current?.click()}
                className="rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.02] p-8 text-center cursor-pointer hover:border-purple-500/40 hover:bg-purple-500/[0.03] transition-all"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) handleImageFile(f)
                  }}
                />
                {previewImage ? (
                  <div className="space-y-3">
                    <img src={previewImage} alt="미리보기" className="max-h-48 mx-auto rounded-xl object-contain" />
                    <p className="text-[13px] text-slate-400">다른 이미지로 변경하려면 클릭</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <ImageIcon className="w-10 h-10 mx-auto text-slate-500" />
                    <p className="text-[15px] font-bold text-slate-200">이미지 드래그 또는 클릭</p>
                    <p className="text-[12px] text-slate-500 font-medium">JPG · PNG · WebP (최대 10MB)</p>
                  </div>
                )}
              </div>

              {extracting && (
                <div className="flex items-center justify-center gap-2 py-3 text-[14px] text-slate-300">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-300" />
                  AI가 악보에서 정보를 추출하고 있어요...
                </div>
              )}

              {errorMsg && (
                <div className="px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-[13px] text-rose-300 font-medium">
                  {errorMsg}
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={reset}
                  className="px-4 py-2 rounded-lg text-[13px] font-bold text-slate-400 hover:bg-white/5 transition-colors"
                >
                  ← 다른 방법
                </button>
              </div>
            </div>
          )}

          {path === 'url' && (
            <div className="space-y-4">
              <div>
                <label className="text-[13px] font-bold text-slate-300 mb-1.5 block">곡 URL</label>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-[14px] text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-500/40 transition-colors"
                />
                <p className="text-[12px] text-slate-500 mt-1.5 font-medium">
                  YouTube / Shorts / 멜론 / 벅스 등 지원
                </p>
                {urlInput && (
                  <div className="mt-2 text-[12px] flex items-center gap-1.5">
                    {extractYouTubeId(urlInput) ? (
                      <span className="inline-flex items-center gap-1 text-emerald-300 font-bold">
                        <Check className="w-3 h-3" />
                        YouTube 영상 감지됨
                      </span>
                    ) : (
                      <span className="text-slate-500 font-medium">일반 URL로 추출 시도</span>
                    )}
                  </div>
                )}
              </div>

              {extracting && (
                <div className="flex items-center justify-center gap-2 py-3 text-[14px] text-slate-300">
                  <Loader2 className="w-4 h-4 animate-spin text-sky-300" />
                  URL에서 메타데이터를 추출하고 있어요...
                </div>
              )}

              {errorMsg && (
                <div className="px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-[13px] text-rose-300 font-medium">
                  {errorMsg}
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={reset}
                  className="px-4 py-2 rounded-lg text-[13px] font-bold text-slate-400 hover:bg-white/5 transition-colors"
                >
                  ← 다른 방법
                </button>
                <button
                  onClick={handleUrlExtract}
                  disabled={!urlInput.trim() || extracting}
                  className="ml-auto px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[13px] font-bold transition-colors flex items-center gap-1.5"
                >
                  추출
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {path === 'manual' && (
            <SongManualForm
              onSave={(song) => handleReviewSave(song)}
              onCancel={reset}
            />
          )}

          {path === 'review' && extracted && (
            <SongExtractionReview
              extraction={extracted}
              onCancel={reset}
              onSave={handleReviewSave}
            />
          )}
        </div>
      </div>
    </div>
  )
}
