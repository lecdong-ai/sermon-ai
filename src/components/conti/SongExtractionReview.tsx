'use client'

import { useState } from 'react'
import { ALL_KEYS, KEY_DISPLAY } from '@/lib/conti/keyTheory'
import { MOOD_META } from './MoodTagBadge'
import type { ContiSong, MoodTag, MusicKey, SongCategory } from '@/types/conti'
import { makeMockSongFromExtraction, type VisionExtractionResult } from '@/lib/conti/mockVision'
import { makeMockSongFromUrl, type UrlExtractionResult } from '@/lib/conti/mockUrlImport'
import { Check, Edit3, Sparkles, Tag, X, Plus } from 'lucide-react'

type Extracted = (VisionExtractionResult & { kind: 'image' }) | (UrlExtractionResult & { kind: 'url' })

interface Props {
  extraction: Extracted
  onCancel: () => void
  onSave: (song: ContiSong) => void
}

const ALL_TAGS: MoodTag[] = Object.keys(MOOD_META) as MoodTag[]
const CATEGORIES: SongCategory[] = ['CCM', '워십', '찬송가', '기타']

export default function SongExtractionReview({ extraction, onCancel, onSave }: Props) {
  const isImage = extraction.kind === 'image'
  const initial = isImage
    ? makeMockSongFromExtraction(extraction)
    : makeMockSongFromUrl(extraction)

  const [title, setTitle] = useState(initial.title)
  const [artist, setArtist] = useState(initial.artist || '')
  const [originalKey, setOriginalKey] = useState<MusicKey>(initial.original_key || 'C')
  const [bpm, setBpm] = useState(initial.bpm || 80)
  const [durationSec, setDurationSec] = useState(initial.duration_sec || 240)
  const [lyrics, setLyrics] = useState(initial.lyrics || '')
  const [chords, setChords] = useState(initial.chords || '')
  const [category, setCategory] = useState<SongCategory>(initial.category)
  const [tags, setTags] = useState<MoodTag[]>(initial.tags)
  const [youtubeUrl, setYoutubeUrl] = useState(initial.youtube_url || '')

  function toggleTag(tag: MoodTag) {
    setTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag])
  }

  function handleSave() {
    if (!title.trim()) {
      alert('곡 제목을 입력해 주세요.')
      return
    }
    const song: ContiSong = {
      id: initial.id,
      user_id: initial.user_id,
      title: title.trim(),
      artist: artist.trim() || null,
      original_key: originalKey,
      bpm,
      duration_sec: durationSec,
      lyrics: lyrics.trim() || null,
      chords: chords.trim() || null,
      tags,
      category,
      source: initial.source,
      youtube_url: youtubeUrl.trim() || null,
      created_at: initial.created_at,
      updated_at: new Date().toISOString(),
    }
    onSave(song)
  }

  const minutes = Math.floor(durationSec / 60)
  const seconds = durationSec % 60

  return (
    <div className="space-y-4">
      {/* 신뢰도 / 출처 표시 */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-500/[0.08] border border-indigo-500/20">
        <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
        <p className="text-[13px] text-indigo-200 font-medium">
          {isImage
            ? `AI Vision 추출${'confidence' in extraction ? ` · 신뢰도 ${Math.round((extraction.confidence || 0) * 100)}%` : ''}`
            : 'URL 메타 추출'}
          {' · '} 아래 필드를 자유롭게 수정하세요
        </p>
      </div>

      {/* 제목 / 아티스트 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[12px] font-bold text-slate-400 mb-1 block">곡 제목 *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[14px] text-white focus:outline-none focus:border-indigo-500/40"
          />
        </div>
        <div>
          <label className="text-[12px] font-bold text-slate-400 mb-1 block">아티스트</label>
          <input
            type="text"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            placeholder="아티스트 미상"
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[14px] text-white focus:outline-none focus:border-indigo-500/40"
          />
        </div>
      </div>

      {/* Key / BPM / 길이 */}
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-[12px] font-bold text-slate-400 mb-1 block">Key</label>
          <select
            value={originalKey}
            onChange={(e) => setOriginalKey(e.target.value as MusicKey)}
            className="w-full px-2 py-2 rounded-lg bg-white/5 border border-white/10 text-[14px] text-white focus:outline-none focus:border-indigo-500/40"
          >
            {ALL_KEYS.map((k) => (
              <option key={k} value={k}>{KEY_DISPLAY[k] || k}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[12px] font-bold text-slate-400 mb-1 block">BPM</label>
          <input
            type="number"
            value={bpm}
            min={40}
            max={220}
            onChange={(e) => setBpm(parseInt(e.target.value) || 80)}
            className="w-full px-2 py-2 rounded-lg bg-white/5 border border-white/10 text-[14px] text-white focus:outline-none focus:border-indigo-500/40"
          />
        </div>
        <div>
          <label className="text-[12px] font-bold text-slate-400 mb-1 block">길이 (분:초)</label>
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={minutes}
              min={0}
              max={20}
              onChange={(e) => setDurationSec((parseInt(e.target.value) || 0) * 60 + seconds)}
              className="w-full px-1 py-2 rounded-lg bg-white/5 border border-white/10 text-[14px] text-white text-center focus:outline-none focus:border-indigo-500/40"
            />
            <span className="text-slate-500">:</span>
            <input
              type="number"
              value={seconds}
              min={0}
              max={59}
              onChange={(e) => setDurationSec(minutes * 60 + (parseInt(e.target.value) || 0))}
              className="w-full px-1 py-2 rounded-lg bg-white/5 border border-white/10 text-[14px] text-white text-center focus:outline-none focus:border-indigo-500/40"
            />
          </div>
        </div>
      </div>

      {/* 카테고리 */}
      <div>
        <label className="text-[12px] font-bold text-slate-400 mb-1 block">카테고리</label>
        <div className="flex gap-1.5 flex-wrap">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-2.5 py-1 rounded-md text-[12px] font-bold transition-colors ${
                category === c
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* 태그 */}
      <div>
        <label className="text-[12px] font-bold text-slate-400 mb-1.5 flex items-center gap-1">
          <Tag className="w-2.5 h-2.5" />
          분위기 태그 ({tags.length}개 선택)
        </label>
        <div className="flex gap-1 flex-wrap">
          {ALL_TAGS.map((t) => {
            const selected = tags.includes(t)
            return (
              <button
                key={t}
                onClick={() => toggleTag(t)}
                className={`px-2 py-0.5 rounded-md text-[12px] font-bold transition-colors ${
                  selected
                    ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-500/40'
                    : 'bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10'
                }`}
              >
                #{MOOD_META[t].label}
                {selected && <X className="w-2.5 h-2.5 ml-1 inline" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* 가사 */}
      <div>
        <label className="text-[12px] font-bold text-slate-400 mb-1 block">가사</label>
        <textarea
          value={lyrics}
          onChange={(e) => setLyrics(e.target.value)}
          rows={5}
          placeholder="가사 입력..."
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[14px] text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/40 resize-y"
        />
      </div>

      {/* 코드 */}
      <div>
        <label className="text-[12px] font-bold text-slate-400 mb-1 block">코드 진행</label>
        <textarea
          value={chords}
          onChange={(e) => setChords(e.target.value)}
          rows={3}
          placeholder="C - G - Am - F"
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[14px] text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/40 resize-y"
        />
      </div>

      {/* YouTube (URL 일 때만) */}
      {extraction.kind === 'url' && (
        <div>
          <label className="text-[12px] font-bold text-slate-400 mb-1 block">YouTube URL</label>
          <input
            type="url"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[14px] text-white focus:outline-none focus:border-indigo-500/40"
          />
        </div>
      )}

      {/* 액션 */}
      <div className="flex items-center gap-2 pt-3 border-t border-white/5">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-lg text-[13px] font-bold text-slate-400 hover:bg-white/5 transition-colors"
        >
          취소
        </button>
        <button
          onClick={handleSave}
          className="ml-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-[14px] font-extrabold transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
        >
          <Check className="w-3.5 h-3.5" />
          라이브러리에 저장
        </button>
      </div>
    </div>
  )
}
