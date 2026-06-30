'use client'

import { useState } from 'react'
import { ALL_KEYS, KEY_DISPLAY } from '@/lib/conti/keyTheory'
import { X, Check, ChevronLeft, ChevronRight } from 'lucide-react'
import type { ChordPlacement } from '@/lib/conti/visionAi'

interface Props {
  title: string
  artist: string | null
  originalKey: string | null
  lyrics: string
  chordData: ChordPlacement[][]
  alignedPreview: string
  onCancel: () => void
  onSave: (data: {
    title: string
    artist: string
    originalKey: string
    lyrics: string
    chordData: ChordPlacement[][]
    alignedPreview: string
  }) => void
}

export default function OcrReviewModal({
  title: initialTitle,
  artist: initialArtist,
  originalKey: initialKey,
  lyrics: initialLyrics,
  chordData: initialChordData,
  alignedPreview: initialAlignedPreview,
  onCancel,
  onSave,
}: Props) {
  const [title, setTitle] = useState(initialTitle)
  const [artist, setArtist] = useState(initialArtist || '')
  const [originalKey, setOriginalKey] = useState(initialKey || 'C')
  const [lyrics, setLyrics] = useState(initialLyrics)
  const [chordData, setChordData] = useState<ChordPlacement[][]>(initialChordData)
  const [alignedPreview] = useState(initialAlignedPreview)
  const [editingChord, setEditingChord] = useState<{ li: number; ci: number; val: string } | null>(null)
  const [editInputRef, setEditInputRef] = useState<HTMLInputElement | null>(null)

  const lyricsLines = lyrics.split('\n')

  function getWords(lineIdx: number): string[] {
    const line = lyricsLines[lineIdx]
    if (!line) return []
    return line.trim().split(/\s+/).filter(Boolean)
  }

  function clampWordIndex(lineIdx: number, idx: number): number {
    const words = getWords(lineIdx)
    if (!words.length) return 0
    return Math.max(0, Math.min(words.length - 1, idx))
  }

  function moveChord(lineIdx: number, chordIdx: number, direction: -1 | 1) {
    setChordData((prev) => {
      const next = prev.map((line) => line.map((c) => ({ ...c })))
      const p = next[lineIdx][chordIdx]
      p.word_index = clampWordIndex(lineIdx, p.word_index + direction)
      return next
    })
  }

  function removeChord(lineIdx: number, chordIdx: number) {
    setChordData((prev) => {
      const next = prev.map((line) => [...line])
      next[lineIdx].splice(chordIdx, 1)
      return next
    })
  }

  function addChord(lineIdx: number, wordIdx: number, name: string) {
    if (!name.trim()) return
    setChordData((prev) => {
      const next = prev.map((line) => [...line.map((c) => ({ ...c }))])
      next[lineIdx].push({ chord: name.trim().toUpperCase(), word_index: wordIdx })
      return next
    })
  }

  function confirmChordEdit() {
    if (!editingChord) return
    const trimmed = editingChord.val.trim()
    setChordData((prev) => {
      const next = prev.map((line) => line.map((c) => ({ ...c })))
      if (!trimmed) {
        next[editingChord.li].splice(editingChord.ci, 1)
      } else {
        next[editingChord.li][editingChord.ci].chord = trimmed
      }
      return next
    })
    setEditingChord(null)
  }

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
      chordData,
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
          {/* 제목 / 아티스트 */}
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

          {/* 조표 */}
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

          {/* 코드 + 가사 (word-level 정렬) */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">코드 / 가사</label>
            <div className="bg-black/30 rounded-xl p-4 border border-white/5">
              {lyricsLines.length === 0 ? (
                <p className="text-slate-500 italic">추출된 가사가 없습니다.</p>
              ) : (
                lyricsLines.map((line, li) => {
                  const words = getWords(li)
                  const placements = chordData[li] || []
                  return (
                    <div key={li} className="mb-4 last:mb-0">
                      {/* 코드 줄: 각 placement flex column */}
                      {placements.length > 0 && (
                        <div className="flex flex-wrap gap-x-5 gap-y-1 mb-1">
                          {placements.map((p, ci) => (
                            <div key={ci} className="group relative flex flex-col items-center gap-0.5">
                              {/* 코드 이름 + 좌우 이동 */}
                              <div className="flex items-center gap-0.5">
                                <button
                                  onClick={() => moveChord(li, ci, -1)}
                                  disabled={p.word_index <= 0}
                                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-white/10 text-indigo-300/70 hover:text-indigo-200 disabled:opacity-0 transition-all"
                                >
                                  <ChevronLeft className="w-2.5 h-2.5" />
                                </button>
                                {editingChord?.li === li && editingChord?.ci === ci ? (
                                  <input
                                    ref={(el) => { if (el) { setEditInputRef(el); setTimeout(() => el.focus()) } }}
                                    type="text"
                                    value={editingChord.val}
                                    onChange={(e) => setEditingChord({ ...editingChord, val: e.target.value.toUpperCase() })}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') confirmChordEdit()
                                      if (e.key === 'Escape') setEditingChord(null)
                                    }}
                                    onBlur={confirmChordEdit}
                                    className="w-12 text-center bg-indigo-600/40 border border-indigo-400/50 rounded text-white text-[11px] font-extrabold px-1 outline-none"
                                  />
                                ) : (
                                  <span
                                    className="inline-block px-2 py-0.5 rounded-md bg-indigo-500/15 border border-indigo-400/25 text-indigo-200 text-[11px] font-extrabold cursor-pointer hover:bg-indigo-500/25 transition-colors"
                                    onDoubleClick={() => setEditingChord({ li, ci, val: p.chord })}
                                  >
                                    {p.chord}
                                  </span>
                                )}
                                <button
                                  onClick={() => moveChord(li, ci, 1)}
                                  disabled={p.word_index >= words.length - 1}
                                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-white/10 text-indigo-300/70 hover:text-indigo-200 disabled:opacity-0 transition-all"
                                >
                                  <ChevronRight className="w-2.5 h-2.5" />
                                </button>
                                <button
                                  onClick={() => removeChord(li, ci)}
                                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-white/10 text-red-400/70 hover:text-red-300 transition-all"
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              </div>
                              {/* 해당 단어 */}
                              <span className="text-[12px] text-slate-200 font-medium">{words[p.word_index] || '?'}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {/* 가사 줄 전체 */}
                      <div className="text-slate-400 text-[13px] leading-relaxed">{line || '\u00A0'}</div>
                    </div>
                  )
                })
              )}
              <p className="text-[9px] text-slate-600 mt-2">코드를 더블클릭하면 수정할 수 있습니다. 좌우 화살표로 단어 위치를 조정하세요.</p>
            </div>
          </div>

          {/* aligned_preview */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">텍스트 미리보기 (복사용)</label>
            <pre className="bg-black/30 rounded-xl p-4 border border-white/5 text-[13px] text-slate-200 font-mono leading-relaxed whitespace-pre-wrap overflow-x-auto">
              {alignedPreview || '생성 중...'}
            </pre>
          </div>

          {/* 가사 편집 */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">가사 편집</label>
              <span className="text-[9px] text-slate-600">{lyricsLines.length}줄</span>
            </div>
            <textarea
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[13px] text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/40 transition-colors resize-y font-mono"
              placeholder="가사"
            />
            <p className="text-[9px] text-slate-600 mt-1">가사를 수정하면 단어 인덱스가 달라질 수 있습니다. 코드 위치를 다시 확인해주세요.</p>
          </div>
        </div>

        {/* 하단 */}
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
