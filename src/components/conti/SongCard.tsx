'use client'

import type { ContiSong, ContiSongListItem } from '@/types/conti'
import { KEY_DISPLAY } from '@/lib/conti/keyTheory'
import MoodTagBadge from './MoodTagBadge'
import YouTubeEmbed from './YouTubeEmbed'
import { Music, Lock, User, Camera, Link2, Pencil, Play, Image as ImageIcon, Youtube, FileText, FilePlus, Tag, Clock } from 'lucide-react'

interface Props {
  song: ContiSong | ContiSongListItem
  onClick?: () => void
  showActions?: boolean
  compact?: boolean
}

const SOURCE_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  system: { label: '시스템',  icon: <Lock className="w-2.5 h-2.5" />,   color: 'text-slate-500' },
  manual: { label: '직접 입력', icon: <Pencil className="w-2.5 h-2.5" />, color: 'text-slate-400' },
  image:  { label: '사진',     icon: <Camera className="w-2.5 h-2.5" />,  color: 'text-purple-400' },
  url:    { label: 'URL',      icon: <Link2 className="w-2.5 h-2.5" />,   color: 'text-sky-400' },
  pdf:    { label: 'PDF',      icon: <FileText className="w-2.5 h-2.5" />, color: 'text-rose-400' },
  voice:  { label: '음성',     icon: <Play className="w-2.5 h-2.5" />,    color: 'text-emerald-400' },
}

const CATEGORY_COLOR: Record<string, string> = {
  CCM: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  '워십': 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
  '찬송가': 'bg-slate-500/10 text-slate-300 border-slate-500/30',
  '기타': 'bg-slate-500/10 text-slate-400 border-slate-500/30',
}

function formatDuration(sec: number | null): string {
  if (!sec) return '-'
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function SongCard({ song, onClick, showActions = false, compact = false }: Props) {
  const sourceMeta = SOURCE_META[song.source] || SOURCE_META.manual
  const hasYoutube = 'youtube_url' in song && song.youtube_url
  const isSystem = 'user_id' in song ? song.user_id === null : song.is_system

  if (compact) {
    return (
      <button
        onClick={onClick}
        className="w-full text-left p-3 rounded-lg bg-white/[0.03] border border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all group"
      >
        <div className="flex items-center gap-2.5">
          {hasYoutube ? (
            <YouTubeEmbed
              url={'youtube_url' in song ? song.youtube_url : null}
              variant="thumb"
            />
          ) : (
            <div className="w-12 h-9 rounded-md bg-white/5 flex items-center justify-center flex-shrink-0">
              <Music className="w-4 h-4 text-slate-400" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold text-white truncate">{song.title}</p>
            <p className="text-[12px] text-slate-500 truncate">{song.artist || '아티스트 미상'}</p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {song.original_key && (
              <span className="text-[12px] font-extrabold text-slate-300 px-1.5 py-0.5 rounded bg-white/5">
                {KEY_DISPLAY[song.original_key] || song.original_key}
              </span>
            )}
            {song.bpm && (
              <span className="text-[11px] text-slate-500 font-bold">♩{song.bpm}</span>
            )}
          </div>
        </div>
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/[0.04] transition-all group relative"
    >
      {/* 출처 뱃지 (우상단) */}
      <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
        {hasYoutube && <Youtube className={`w-3 h-3 ${sourceMeta.color}`} />}
        <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${sourceMeta.color}`}>
          {sourceMeta.icon}
          {sourceMeta.label}
        </span>
      </div>

      <div className="flex items-start gap-3">
        {/* 아이콘 */}
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/5 flex items-center justify-center flex-shrink-0">
          <Music className="w-5 h-5 text-indigo-300" />
        </div>

        {/* 메타 */}
        <div className="flex-1 min-w-0 pr-16">
          <h3 className="text-[16px] font-bold text-white truncate group-hover:text-indigo-300 transition-colors">
            {song.title}
          </h3>
          {song.artist && (
            <p className="text-[13px] text-slate-400 font-medium truncate mt-0.5">{song.artist}</p>
          )}

          {/* Key + BPM + 길이 */}
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            {song.original_key && (
              <span className="text-[12px] font-extrabold text-white px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
                {KEY_DISPLAY[song.original_key] || song.original_key}
              </span>
            )}
            {song.bpm && (
              <span className="text-[12px] text-slate-300 font-bold">♩ {song.bpm}</span>
            )}
            {'duration_sec' in song && song.duration_sec && (
              <span className="text-[12px] text-slate-500 font-medium flex items-center gap-0.5">
                <Clock className="w-2.5 h-2.5" />
                {formatDuration(song.duration_sec)}
              </span>
            )}
            <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded border ${CATEGORY_COLOR[song.category] || CATEGORY_COLOR['기타']}`}>
              {song.category}
            </span>
          </div>

          {/* 태그 */}
          {song.tags.length > 0 && (
            <div className="flex items-center gap-1 mt-2 flex-wrap">
              {song.tags.slice(0, 4).map((tag) => (
                <MoodTagBadge key={tag} tag={tag} size="xs" />
              ))}
              {song.tags.length > 4 && (
                <span className="text-[11px] text-slate-500 font-bold">+{song.tags.length - 4}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 시스템 곡 표시 */}
      {isSystem && (
        <div className="mt-2.5 pt-2.5 border-t border-white/5 flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
          <Lock className="w-2.5 h-2.5" />
          시스템 제공 — 읽기 전용
        </div>
      )}
    </button>
  )
}
