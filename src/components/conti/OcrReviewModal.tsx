'use client'

import { useState, useMemo } from 'react'
import { ALL_KEYS, KEY_DISPLAY } from '@/lib/conti/keyTheory'
import { X, Check, Plus, Trash2 } from 'lucide-react'
import type { VisionChord } from '@/lib/conti/visionAi'

interface Props {
  title: string
  artist: string | null
  originalKey: string | null
  lyrics: string
  chords: VisionChord[]
  onCancel: () => void
  onSave: (data: {
    title: string
    artist: string
    originalKey: string
    lyrics: string
    chords: VisionChord[]
  }) => void
}

function getChordRows(lyrics: string, chords: VisionChord[]) {
  const lines = lyrics.split('\n')
  const rows: Array<{ line: string; chords: Array<{ chord: string; charIdx: number; origIdx: number }> }> = []

  let lineStartIdx = 0
  for (const line of lines) {
    const lineEndIdx = lineStartIdx + line.length
    const lineChords = chords
      .filter((c) => c.index >= lineStartIdx && c.index <= lineEndIdx)
      .map((c) => ({ chord: c.chord, charIdx: c.index - lineStartIdx, origIdx: c.index }))
    rows.push({ line, chords: lineChords })
    lineStartIdx = lineEndIdx + 1
  }

  return rows
}

export default function OcrReviewModal({
  title: initialTitle,
  artist: initialArtist,
  originalKey: initialKey,
  lyrics: initialLyrics,
  chords: initialChords,
  onCancel,
  onSave,
}: Props) {
  const [title, setTitle] = useState(initialTitle)
  const [artist, setArtist] = useState(initialArtist || '')
  const [originalKey, setOriginalKey] = useState(initialKey || 'C')
  const [lyrics, setLyrics] = useState(initialLyrics)
  const [chords, setChords] = useState<VisionChord[]>(initialChords)
  const [editingIdx, setEditingIdx] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')
  const [showAddChord, setShowAddChord] = useState(false)
  const [newChordName, setNewChordName] = useState('')
  const [newChordIdx, setNewChordIdx] = useState(0)

  const chordRows = useMemo(() => getChordRows(lyrics, chords), [lyrics, chords])

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
      chords: chords.sort((a, b) => a.index - b.index),
    })
  }

  function startEdit(idx: number, current: string) {
    setEditingIdx(idx)
    setEditValue(current)
  }

  function confirmEdit() {
    if (editingIdx === null) return
    const trimmed = editValue.trim()
    if (!trimmed) {
      setChords((prev) => prev.filter((_, i) => i !== editingIdx))
    } else {
      setChords((prev) => prev.map((c, i) => (i === editingIdx ? { ...c, chord: trimmed } : c)))
    }
    setEditingIdx(null)
  }

  function removeChord(idx: number) {
    setChords((prev) => prev.filter((_, i) => i !== idx))
  }

  function addChord() {
    if (!newChordName.trim()) return
    setChords((prev) => [...prev, { chord: newChordName.trim().toUpperCase(), index: newChordIdx }])
    setNewChordName('')
    setShowAddChord(false)
  }

  function handleKeyChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setOriginalKey(e.target.value)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0d1225] border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
          <h2 className="text-[15px] font-extrabold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            OCR 분석 결과
          </h2>
          <button onClick={onCancel} className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 본문 */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* 제목 / 아티스트 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">곡 제목</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[13px] text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/40 transition-colors"
                placeholder="곡 제목"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">아티스트</label>
              <input
                type="text"
                value={artist}
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
              onChange={handleKeyChange}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[13px] text-white focus:outline-none focus:border-indigo-500/40 transition-colors"
            >
              {ALL_KEYS.map((k) => (
                <option key={k} value={k} className="bg-[#0d1225]">{KEY_DISPLAY[k] || k}</option>
              ))}
            </select>
          </div>

          {/* 코드 + 가사 미리보기 */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">코드 / 가사 미리보기</label>
            <div className="bg-black/30 rounded-xl p-4 border border-white/5 font-mono text-[13px] leading-relaxed">
              {chordRows.length === 0 ? (
                <p className="text-slate-500 italic">추출된 가사가 없습니다.</p>
              ) : (
                chordRows.map((row, ri) => (
                  <div key={ri} className="mb-1">
                    {/* 코드 줄 */}
                    <div className="relative h-5">
                      {row.chords.map((c, ci) => (
                        <span
                          key={ci}
                          className="absolute top-0 text-indigo-300 font-extrabold text-[11px] whitespace-nowrap cursor-pointer hover:text-indigo-100 hover:bg-indigo-500/20 px-0.5 rounded transition-all"
                          style={{ left: `${c.charIdx}ch` }}
                          onClick={() => startEdit(
                            chords.findIndex((oc) => oc.index === c.origIdx && oc.chord === c.chord),
                            c.chord,
                          )}
                        >
                          {editingIdx === chords.findIndex((oc) => oc.index === c.origIdx && oc.chord === c.chord) ? (
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') confirmEdit()
                                if (e.key === 'Escape') setEditingIdx(null)
                              }}
                              onBlur={confirmEdit}
                              className="w-12 bg-indigo-600/40 border border-indigo-400/50 rounded text-white text-[11px] px-1 py-0 outline-none"
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            c.chord
                          )}
                        </span>
                      ))}
                    </div>
                    {/* 가사 줄 */}
                    <div className="text-slate-200">{row.line || '\u00A0'}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 코드 목록 (편집용) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">코드 목록</label>
              <button
                onClick={() => setShowAddChord(true)}
                className="flex items-center gap-1 px-2 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-[10px] font-bold transition-colors"
              >
                <Plus className="w-3 h-3" /> 코드 추가
              </button>
            </div>
            {showAddChord && (
              <div className="flex items-center gap-2 mb-2 p-2 rounded-lg bg-white/5 border border-white/10">
                <input
                  type="text"
                  value={newChordName}
                  onChange={(e) => setNewChordName(e.target.value.toUpperCase())}
                  placeholder="코드 (예: C, G, Am)"
                  className="flex-1 px-2 py-1 rounded bg-white/5 border border-white/10 text-[12px] text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/40"
                  onKeyDown={(e) => { if (e.key === 'Enter') addChord() }}
                />
                <input
                  type="number"
                  value={newChordIdx}
                  onChange={(e) => setNewChordIdx(Number(e.target.value))}
                  placeholder="위치"
                  className="w-16 px-2 py-1 rounded bg-white/5 border border-white/10 text-[12px] text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/40"
                />
                <button onClick={addChord} className="p-1 rounded bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300">
                  <Check className="w-3 h-3" />
                </button>
                <button onClick={() => setShowAddChord(false)} className="p-1 rounded hover:bg-white/10 text-slate-400">
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            <div className="flex flex-wrap gap-1.5">
              {chords.length === 0 ? (
                <span className="text-[11px] text-slate-600 italic">추출된 코드가 없습니다.</span>
              ) : (
                chords.map((c, i) => (
                  <div key={i} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-500/10 border border-indigo-400/20 group">
                    {editingIdx === i ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value.toUpperCase())}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') confirmEdit()
                          if (e.key === 'Escape') setEditingIdx(null)
                        }}
                        onBlur={confirmEdit}
                        className="w-12 bg-indigo-600/40 border border-indigo-400/50 rounded text-white text-[11px] px-1 py-0 outline-none"
                        autoFocus
                      />
                    ) : (
                      <span
                        className="text-[11px] font-bold text-indigo-200 cursor-pointer hover:text-white"
                        onClick={() => startEdit(i, c.chord)}
                      >
                        {c.chord}
                      </span>
                    )}
                    <span className="text-[9px] text-slate-500">@{c.index}</span>
                    <button
                      onClick={() => removeChord(i)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-white/10 text-slate-500 hover:text-red-400 transition-all"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 가사 (편집) */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">가사 편집</label>
            <textarea
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[13px] text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/40 transition-colors resize-y font-mono"
              placeholder="가사"
            />
            <p className="text-[9px] text-slate-600 mt-1">
              가사를 수정하면 코드 위치(index)가 어긋날 수 있습니다. 코드 위치를 다시 확인해주세요.
            </p>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-white/10 bg-black/20">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[12px] font-bold transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-[12px] font-extrabold transition-all shadow-lg shadow-indigo-600/30"
          >
            <Check className="w-3.5 h-3.5" />
            저장 및 콘티에 추가
          </button>
        </div>
      </div>
    </div>
  )
}
