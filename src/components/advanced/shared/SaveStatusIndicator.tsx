'use client'

import type { SaveStatus } from '@/lib/advanced/types'
import { SAVE_STATUS_LABELS, SAVE_STATUS_COLORS } from '@/lib/advanced/types'

function formatTime(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  const now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000)
  if (diff < 60) return '방금 전'
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`
  return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const STATUS_ICONS: Record<SaveStatus, string> = {
  saving: '⟳',
  saved: '✓',
  modified: '●',
  error: '✕',
  idle: '',
}

export default function SaveStatusIndicator({
  status,
  lastSavedAt,
  message,
  minimal,
}: {
  status: SaveStatus
  lastSavedAt: string | null
  message?: string
  minimal?: boolean
}) {
  const icon = STATUS_ICONS[status]
  const color = SAVE_STATUS_COLORS[status]
  const label = message || SAVE_STATUS_LABELS[status]
  const timeAgo = status === 'saved' && lastSavedAt ? formatTime(lastSavedAt) : null

  if (minimal) {
    return (
      <span className={`text-[10px] flex items-center gap-1 ${color}`}>
        <span className={status === 'saving' ? 'animate-spin' : ''}>{icon}</span>
        {label}
        {timeAgo && <span className="text-paper-400">· {timeAgo}</span>}
      </span>
    )
  }

  return (
    <div className="flex items-center gap-1.5 text-[10px]">
      <span className={color}>
        <span className={status === 'saving' ? 'animate-spin inline-block' : ''}>{icon}</span>
      </span>
      <span className="text-paper-500">{label}</span>
      {timeAgo && (
        <span className="text-paper-300">· {timeAgo}</span>
      )}
    </div>
  )
}
