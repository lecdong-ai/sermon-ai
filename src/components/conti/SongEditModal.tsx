'use client'

import { useState } from 'react'
import type { ContiSong, MoodTag, MusicKey, SongCategory } from '@/types/conti'
import { ALL_KEYS, KEY_DISPLAY } from '@/lib/conti/keyTheory'
import { MOOD_META } from './MoodTagBadge'
import { X, Save, Trash2, Music, Youtube, ExternalLink, Lock } from 'lucide-react'

interface Props {
  song: ContiSong
  onClose: () => void
  onSave?: (updated: ContiSong) => void
  onDelete?: () => void
}

const ALL_TAGS: MoodTag[] = Object.keys(MOOD_META) as MoodTag[]
const CATEGORIES: SongCategory[] = ['CCM', '워십', '찬송가', '기타']

export default function SongEditModal({ song, onClose, onSave, onDelete }: Props) {
  const isSystem = song.user_id === null
  const [title, setTitle] = useState(song.title)
  const [artist, setArtist] = useState(song.artist || '')
  const [originalKey, setOriginalKey] = useState<MusicKey>(song.original_key || 'C')
  const [bpm, setBpm] = useState(song.bpm || 80)
  const [durationSec, setDurationSec] = useState(song.duration_sec || 240)
  const [lyrics, setLyrics] = useState(song.lyrics || '')
  const [chords, setChords] = useState(song.chords || '')
  const [category, setCategory] = useState<SongCategory>(song.category)
  const [tags, setTags] = useState<MoodTag[]>(song.tags)
  const [youtubeUrl, setYoutubeUrl] = useState(song.youtube_url || '')

  function toggleTag(t: MoodTag) {
    setTags((p) => p.includes(t) ? p.filter((x) => x !== t) : [...p, t])
  }

  function handleSave() {
    if (!title.trim()) {
      alert('곡 제목을 입력해 주세요.')
      return
    }
    const updated: ContiSong = {
      ...song,
      title: title.trim(),
      artist: artist.trim() || null,
      original_key: originalKey,
      bpm,
      duration_sec: durationSec,
      lyrics: lyrics.trim() || null,
      chords: chords.trim() || null,
      tags,
      category,
      youtube_url: youtubeUrl.trim() || null,
      updated_at: new Date().toISOString(),
    }
    onSave?.(updated)
    onClose()
  }

  const minutes = Math.floor(durationSec / 60)
  const seconds = durationSec % 60

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#03050c]/85 backdrop-blur-md" onClick={onClose}>
      <div
        className="relative w-full max-w-2xl rounded-3xl bg-[#0a0f1f] border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/5 flex items-center justify-center flex-shrink-0">
              <Music className="w-4 h-4 text-indigo-300" />
            </div>
            <div className="min-w-0">
              <h2 className="text-[16px] font-bold text-white truncate">
                {isSystem ? '곡 상세 (시스템)' : '곡 편집'}
              </h2>
              <p className="text-[12px] text-slate-500 font-medium truncate">
                {isSystem ? '시스템 제공 곡 — 메타 열람만 가능' : '모든 필드 수정 가능'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 본문 */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-4">
          {isSystem && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-500/10 border border-slate-500/20">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <p className="text-[13px] text-slate-300 font-medium">
                시스템 제공 곡은 편집할 수 없습니다. 새 곡을 추가하려면 "곡 추가" 를 사용하세요.
              </p>
            </div>
          )}

          {/* YouTube (있을 때) */}
          {song.youtube_url && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <Youtube className="w-3.5 h-3.5 text-rose-300" />
              <a
                href={song.youtube_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] text-rose-200 font-medium hover:underline flex items-center gap-1 truncate"
              >
                {song.youtube_url}
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
              </a>
            </div>
          )}

          <fieldset disabled={isSystem} className="space-y-4">
            {/* 제목 / 아티스트 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] font-bold text-slate-400 mb-1 block">곡 제목 *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[14px] text-white focus:outline-none focus:border-indigo-500/40 disabled:opacity-50"
                />
              </div>
              <div>
                <label className="text-[12px] font-bold text-slate-400 mb-1 block">아티스트</label>
                <input
                  type="text"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[14px] text-white focus:outline-none focus:border-indigo-500/40 disabled:opacity-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[12px] font-bold text-slate-400 mb-1 block">Key</label>
                <select
                  value={originalKey}
                  onChange={(e) => setOriginalKey(e.target.value as MusicKey)}
                  className="w-full px-2 py-2 rounded-lg bg-white/5 border border-white/10 text-[14px] text-white focus:outline-none focus:border-indigo-500/40 disabled:opacity-50"
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
                  className="w-full px-2 py-2 rounded-lg bg-white/5 border border-white/10 text-[14px] text-white focus:outline-none focus:border-indigo-500/40 disabled:opacity-50"
                />
              </div>
              <div>
                <label className="text-[12px] font-bold text-slate-400 mb-1 block">길이</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={minutes}
                    min={0}
                    max={20}
                    onChange={(e) => setDurationSec((parseInt(e.target.value) || 0) * 60 + seconds)}
                    className="w-full px-1 py-2 rounded-lg bg-white/5 border border-white/10 text-[14px] text-white text-center focus:outline-none focus:border-indigo-500/40 disabled:opacity-50"
                  />
                  <span className="text-slate-500">:</span>
                  <input
                    type="number"
                    value={seconds}
                    min={0}
                    max={59}
                    onChange={(e) => setDurationSec(minutes * 60 + (parseInt(e.target.value) || 0))}
                    className="w-full px-1 py-2 rounded-lg bg-white/5 border border-white/10 text-[14px] text-white text-center focus:outline-none focus:border-indigo-500/40 disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[12px] font-bold text-slate-400 mb-1 block">카테고리</label>
              <div className="flex gap-1.5 flex-wrap">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    disabled={isSystem}
                    className={`px-2.5 py-1 rounded-md text-[12px] font-bold transition-colors disabled:cursor-not-allowed ${
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

            <div>
              <label className="text-[12px] font-bold text-slate-400 mb-1.5 block">
                분위기 태그 ({tags.length}개)
              </label>
              <div className="flex gap-1 flex-wrap">
                {ALL_TAGS.map((t) => {
                  const selected = tags.includes(t)
                  return (
                    <button
                      key={t}
                      onClick={() => toggleTag(t)}
                      disabled={isSystem}
                      className={`px-2 py-0.5 rounded-md text-[12px] font-bold transition-colors disabled:cursor-not-allowed ${
                        selected
                          ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-500/40'
                          : 'bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10'
                      }`}
                    >
                      #{MOOD_META[t].label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="text-[12px] font-bold text-slate-400 mb-1 block">가사</label>
              <textarea
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                rows={5}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[14px] text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/40 resize-y disabled:opacity-50"
                placeholder="가사..."
              />
            </div>

            <div>
              <label className="text-[12px] font-bold text-slate-400 mb-1 block">코드 진행</label>
              <textarea
                value={chords}
                onChange={(e) => setChords(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[14px] text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/40 resize-y disabled:opacity-50"
                placeholder="C - G - Am - F"
              />
            </div>

            {!isSystem && (
              <div>
                <label className="text-[12px] font-bold text-slate-400 mb-1 block">YouTube URL</label>
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[14px] text-white focus:outline-none focus:border-indigo-500/40"
                />
              </div>
            )}
          </fieldset>
        </div>

        {/* 풋터 */}
        <div className="flex items-center gap-2 px-6 py-4 border-t border-white/5">
          {!isSystem && onDelete && (
            <button
              onClick={() => {
                if (confirm('이 곡을 라이브러리에서 삭제할까요?')) {
                  onDelete()
                  onClose()
                }
              }}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-[13px] font-bold text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              삭제
            </button>
          )}
          <button
            onClick={onClose}
            className="ml-auto px-4 py-2 rounded-lg text-[13px] font-bold text-slate-400 hover:bg-white/5 transition-colors"
          >
            {isSystem ? '닫기' : '취소'}
          </button>
          {!isSystem && onSave && (
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[13px] font-extrabold transition-colors flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              저장
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
