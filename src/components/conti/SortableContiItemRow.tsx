'use client'

import type { ContiItem, ContiSong, MusicKey } from '@/types/conti'
import { getKeyCompatibility, KEY_COMPAT_COLORS, KEY_DISPLAY, ALL_KEYS } from '@/lib/conti/keyTheory'
import MoodTagBadge from './MoodTagBadge'
import YouTubeEmbed from './YouTubeEmbed'
import { Music, Trash2, MessageSquare, ArrowRight, GripVertical, X, Save, Pencil, Youtube } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useState, useRef, useEffect } from 'react'

interface Props {
  item: ContiItem
  position: number
  prevKey: MusicKey | null
  onRemove: () => void
  onUpdate: (updated: ContiItem) => void
  isOverlay?: boolean
}

export default function SortableContiItemRow({ item, position, prevKey, onRemove, onUpdate, isOverlay = false }: Props) {
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({ id: item.id })

  const song: ContiSong | undefined = item.song
  const effectiveKey = item.key || song?.original_key || null

  const [editing, setEditing] = useState(false)
  const [editKey, setEditKey] = useState<MusicKey | ''>(item.key || '')
  const [editTransition, setEditTransition] = useState(item.transition_memo)
  const [editMemo, setEditMemo] = useState(item.memo)

  useEffect(() => {
    setEditKey(item.key || '')
    setEditTransition(item.transition_memo)
    setEditMemo(item.memo)
  }, [item.key, item.transition_memo, item.memo])

  const compat = prevKey && effectiveKey
    ? getKeyCompatibility(prevKey, effectiveKey)
    : null
  const compatColor = compat ? KEY_COMPAT_COLORS[compat.label] : null

  const bpm = item.bpm_override ?? song?.bpm ?? null
  const durationSec = song?.duration_sec ?? 0
  const minutes = Math.floor(durationSec / 60)
  const seconds = durationSec % 60

  function saveEdit() {
    onUpdate({
      ...item,
      key: (editKey || null) as MusicKey | null,
      transition_memo: editTransition.trim(),
      memo: editMemo.trim(),
    })
    setEditing(false)
  }

  function cancelEdit() {
    setEditKey(item.key || '')
    setEditTransition(item.transition_memo)
    setEditMemo(item.memo)
    setEditing(false)
  }

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className={`group relative ${isOverlay ? 'shadow-2xl ring-2 ring-indigo-500/40 rounded-lg' : ''}`}>
      {/* 전이 표시 */}
      {compat && compatColor && !editing && (
        <div className={`flex items-center gap-2 mx-4 my-1 px-3 py-1.5 rounded-md border ${compatColor.bg} ${compatColor.border}`}>
          <ArrowRight className={`w-3 h-3 ${compatColor.text}`} />
          <span className={`text-[12px] font-bold ${compatColor.text}`}>
            {compat.semitones === 0 ? '같은 키' : `${compat.semitones}도`}
          </span>
          <span className="text-[12px] text-slate-500 font-medium">·</span>
          <span className={`text-[12px] ${compatColor.text} opacity-80`}>
            {compat.description}
          </span>
          {item.transition_memo && (
            <>
              <span className="text-[12px] text-slate-600">·</span>
              <span className="text-[12px] text-slate-300 font-medium truncate">
                {item.transition_memo}
              </span>
            </>
          )}
        </div>
      )}

      <div className="group flex items-stretch gap-2 px-2.5 py-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04] hover:border-white/10 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/5">
        {/* 드래그 핸들 */}
        <button
          {...attributes}
          {...listeners}
          className="flex items-center justify-center w-3.5 flex-shrink-0 cursor-grab active:cursor-grabbing text-slate-600 hover:text-slate-300 transition-colors"
          title="드래그하여 순서 변경"
        >
          <GripVertical className="w-3 h-3" />
        </button>

        {/* 순서 — 그라디언트 원 */}
        <div className="flex flex-col items-center justify-center w-7 flex-shrink-0">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[12px] font-extrabold text-white shadow-md shadow-indigo-500/30">
            {position}
          </div>
        </div>

        {/* 메타 (Key / BPM) */}
        {editing ? (
          <div className="flex flex-col gap-1 w-20 flex-shrink-0 py-0.5">
            <select
              value={editKey}
              onChange={(e) => setEditKey(e.target.value as MusicKey | '')}
              className="w-full px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[12px] text-white focus:outline-none focus:border-indigo-500/40"
            >
              <option value="">(원곡)</option>
              {ALL_KEYS.map((k) => (
                <option key={k} value={k}>{KEY_DISPLAY[k] || k}</option>
              ))}
            </select>
            <input
              type="number"
              value={bpm || ''}
              readOnly
              className="w-full px-1.5 py-0.5 rounded bg-white/[0.03] border border-white/5 text-[11px] text-slate-500 text-center cursor-not-allowed"
              title="곡 BPM (편집은 라이브러리에서)"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-12 flex-shrink-0 gap-0.5">
            {effectiveKey && (
              <div className="px-1.5 py-0.5 rounded-md bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-[12px] font-extrabold text-white shadow-sm shadow-indigo-500/20">
                {KEY_DISPLAY[effectiveKey] || effectiveKey}
              </div>
            )}
            {bpm && (
              <div className="text-[10px] text-slate-400 font-bold">
                ♩{bpm}
              </div>
            )}
          </div>
        )}

        {/* 곡 정보 / 편집 */}
        <div className="flex-1 min-w-0 py-0.5">
          <div className="flex items-center gap-1.5 mb-0">
            <Music className="w-3 h-3 text-slate-500 flex-shrink-0" />
            <h4 className="text-[14px] font-bold text-white truncate">
              {song?.title || '(삭제된 곡)'}
            </h4>
            {song?.youtube_url && !editing && (
              <YouTubeEmbed
                url={song.youtube_url}
                variant="button"
                title={song.title}
              />
            )}
          </div>
          {editing ? (
            <div className="space-y-1">
              <input
                type="text"
                value={editTransition}
                onChange={(e) => setEditTransition(e.target.value)}
                placeholder="곡간 전환 메모 (예: 1절 후 컷, BPM 다운)"
                className="w-full px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[12px] text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/40"
              />
              <input
                type="text"
                value={editMemo}
                onChange={(e) => setEditMemo(e.target.value)}
                placeholder="곡별 메모 (예: 인도자 김OO)"
                className="w-full px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[12px] text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/40"
              />
              <div className="flex items-center gap-1.5">
                <button
                  onClick={saveEdit}
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold transition-colors"
                >
                  <Save className="w-2.5 h-2.5" />
                  저장
                </button>
                <button
                  onClick={cancelEdit}
                  className="flex items-center gap-1 px-2 py-0.5 rounded text-slate-400 hover:bg-white/5 text-[11px] font-bold transition-colors"
                >
                  <X className="w-2.5 h-2.5" />
                  취소
                </button>
              </div>
            </div>
          ) : (
            <>
              {song?.artist && (
                <p className="text-[11px] text-slate-500 font-medium mt-0 truncate">
                  {song.artist}
                </p>
              )}
              <div className="flex items-center gap-1 mt-1 flex-wrap">
                {song?.tags?.slice(0, 3).map((tag) => (
                  <MoodTagBadge key={tag} tag={tag} size="xs" />
                ))}
                {durationSec > 0 && (
                  <span className="text-[10px] text-slate-600 font-bold ml-auto">
                    {minutes}:{String(seconds).padStart(2, '0')}
                  </span>
                )}
              </div>
              {item.memo && (
                <div className="mt-1 flex items-start gap-1 text-[11px] text-slate-400">
                  <MessageSquare className="w-2.5 h-2.5 mt-0.5 flex-shrink-0" />
                  <span className="font-medium">{item.memo}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* 액션 */}
        {!editing && (
          <div className="flex flex-col gap-0.5 self-start flex-shrink-0">
            <button
              onClick={() => setEditing(true)}
              className="p-1 rounded text-slate-600 hover:text-indigo-300 hover:bg-indigo-500/10 transition-all opacity-0 group-hover:opacity-100"
              title="편집"
            >
              <Pencil className="w-3 h-3" />
            </button>
            <button
              onClick={onRemove}
              className="p-1 rounded text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100"
              title="곡 제거"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
