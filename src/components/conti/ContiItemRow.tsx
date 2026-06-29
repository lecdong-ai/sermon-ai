'use client'

import type { ContiItem, ContiSong } from '@/types/conti'
import { getKeyCompatibility, KEY_COMPAT_COLORS, KEY_DISPLAY } from '@/lib/conti/keyTheory'
import MoodTagBadge from './MoodTagBadge'
import { Music, ChevronUp, ChevronDown, Trash2, MessageSquare, ArrowRight } from 'lucide-react'

interface Props {
  item: ContiItem
  position: number
  prevKey: string | null       // 직전 곡의 key (없으면 null)
  onMoveUp: () => void
  onMoveDown: () => void
  onRemove: () => void
  isFirst: boolean
  isLast: boolean
}

export default function ContiItemRow({
  item, position, prevKey, onMoveUp, onMoveDown, onRemove, isFirst, isLast,
}: Props) {
  const song: ContiSong | undefined = item.song
  const effectiveKey = item.key || song?.original_key || null

  const compat = prevKey && effectiveKey
    ? getKeyCompatibility(prevKey as any, effectiveKey as any)
    : null
  const compatColor = compat ? KEY_COMPAT_COLORS[compat.label] : null

  const bpm = item.bpm_override ?? song?.bpm ?? null
  const durationSec = song?.duration_sec ?? 0
  const minutes = Math.floor(durationSec / 60)
  const seconds = durationSec % 60

  return (
    <div className="group relative">
      {/* 전이 표시 (이전 곡 → 이 곡) */}
      {compat && compatColor && (
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

      <div className="flex items-stretch gap-2 px-3 py-2.5 rounded-lg hover:bg-white/[0.02] transition-colors">
        {/* 순서 */}
        <div className="flex flex-col items-center justify-center w-7 flex-shrink-0">
          <div className="w-6 h-6 rounded-full bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-[13px] font-extrabold text-indigo-300">
            {position}
          </div>
        </div>

        {/* 순서 변경 버튼 */}
        <div className="flex flex-col justify-center gap-0.5 flex-shrink-0">
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            className="p-0.5 rounded text-slate-600 hover:text-slate-300 disabled:opacity-30 disabled:hover:text-slate-600 transition-colors"
            title="위로"
          >
            <ChevronUp className="w-3 h-3" />
          </button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className="p-0.5 rounded text-slate-600 hover:text-slate-300 disabled:opacity-30 disabled:hover:text-slate-600 transition-colors"
          >
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>

        {/* 메타 (Key / BPM / 길이) */}
        <div className="flex flex-col items-center justify-center w-12 flex-shrink-0 gap-1">
          {effectiveKey && (
            <div className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[13px] font-extrabold text-white">
              {KEY_DISPLAY[effectiveKey] || effectiveKey}
            </div>
          )}
          {bpm && (
            <div className="text-[11px] text-slate-400 font-bold">
              ♩{bpm}
            </div>
          )}
        </div>

        {/* 곡 정보 */}
        <div className="flex-1 min-w-0 py-0.5">
          <div className="flex items-center gap-1.5">
            <Music className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
            <h4 className="text-[15px] font-bold text-white truncate">
              {song?.title || '(삭제된 곡)'}
            </h4>
          </div>
          {song?.artist && (
            <p className="text-[12px] text-slate-500 font-medium mt-0.5 truncate">
              {song.artist}
            </p>
          )}
          {/* 태그 + 길이 */}
          <div className="flex items-center gap-1 mt-1.5 flex-wrap">
            {song?.tags?.slice(0, 3).map((tag) => (
              <MoodTagBadge key={tag} tag={tag} size="xs" />
            ))}
            {durationSec > 0 && (
              <span className="text-[11px] text-slate-600 font-bold ml-auto">
                {minutes}:{String(seconds).padStart(2, '0')}
              </span>
            )}
          </div>
          {/* 곡별 메모 */}
          {item.memo && (
            <div className="mt-1.5 flex items-start gap-1 text-[12px] text-slate-400">
              <MessageSquare className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span className="font-medium">{item.memo}</span>
            </div>
          )}
        </div>

        {/* 삭제 */}
        <button
          onClick={onRemove}
          className="p-1.5 rounded-md text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 self-start flex-shrink-0 transition-colors opacity-0 group-hover:opacity-100"
          title="곡 제거"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
