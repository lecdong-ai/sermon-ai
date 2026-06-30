'use client'

import { useState } from 'react'
import { ALL_KEYS, KEY_DISPLAY } from '@/lib/conti/keyTheory'
import { X, Check } from 'lucide-react'

interface Props {
  title: string
  artist: string | null
  originalKey: string | null
  lyrics: string
  alignedPreview: string
  onCancel: () => void
  onSave: (data: {
    title: string
    artist: string
    originalKey: string
    lyrics: string
    alignedPreview: string
  }) => void
}

export default function OcrReviewModal({
  title: initialTitle,
  artist: initialArtist,
  originalKey: initialKey,
  lyrics: initialLyrics,
  alignedPreview: initialAlignedPreview,
  onCancel,
  onSave,
}: Props) {
  const [title, setTitle] = useState(initialTitle)
  const [artist, setArtist] = useState(initialArtist || '')
  const [originalKey, setOriginalKey] = useState(initialKey || 'C')
  const [lyrics, setLyrics] = useState(initialLyrics)
  const [alignedPreview, setAlignedPreview] = useState(initialAlignedPreview)

  function handleSave() {
    if (!title.trim()) {
      alert('곡 제목을 입력해 주세요.')
      return
    }
    onSave({
      title: title.trim(),
      artist: artist.trim(),
      originalKey,
      lyrics,
      alignedPreview,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0d1225] border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
          <h2 className="text-[15px] font-extrabold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            OCR 분석 결과
          </h2>
          <button onClick={onCancel} className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">곡 제목</label>
              <input
                type="text" value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[13px] text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/40 transition-colors"
                placeholder="곡 제목"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">아티스트</label>
              <input
                type="text" value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[13px] text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/40 transition-colors"
                placeholder="아티스트"
              />
            </div>
          </div>

          <div className="w-40">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">조표 (Key)</label>
            <select
              value={originalKey}
              onChange={(e) => setOriginalKey(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[13px] text-white focus:outline-none focus:border-indigo-500/40 transition-colors"
            >
              {ALL_KEYS.map((k) => (
                <option key={k} value={k} className="bg-[#0d1225]">{KEY_DISPLAY[k] || k}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              정렬된 코드/가사
              <span className="font-normal text-slate-600 ml-2">(직접 수정 가능)</span>
            </label>
            <textarea
              value={alignedPreview}
              onChange={(e) => setAlignedPreview(e.target.value)}
              rows={10}
              className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-[13px] text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/40 transition-colors resize-y font-mono leading-relaxed"
              placeholder="코드와 가사가 정렬된 텍스트"
              spellCheck={false}
            />
            <p className="text-[9px] text-slate-600 mt-1">코드 줄과 가사 줄이 번갈아 나타납니다. 공백으로 정렬되어 있습니다. 필요시 직접 수정하세요.</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">가사 편집</label>
              <span className="text-[9px] text-slate-600">{lyrics.split('\n').length}줄</span>
            </div>
            <textarea
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              rows={5}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[13px] text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/40 transition-colors resize-y font-mono"
              placeholder="가사"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-white/10 bg-black/20">
          <button onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[12px] font-bold transition-colors">
            취소
          </button>
          <button onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-[12px] font-extrabold transition-all shadow-lg shadow-indigo-600/30">
            <Check className="w-3.5 h-3.5" />
            저장 및 콘티에 추가
          </button>
        </div>
      </div>
    </div>
  )
}
