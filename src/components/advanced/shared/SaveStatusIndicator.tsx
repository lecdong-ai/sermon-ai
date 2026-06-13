'use client'

import type { SaveStatus } from '@/lib/advanced/types'

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
  let icon = '·'
  let color = 'text-slate-600'
  let label = ''

  if (status === 'saving') { icon = '⟳'; color = 'text-blue-500'; label = '저장 중...' }
  else if (status === 'saved') { icon = '✓'; color = 'text-indigo-400'; label = '자동 저장됨' }
  else if (status === 'modified') { icon = '●'; color = 'text-amber-500'; label = '수정됨' }
  else if (status === 'error') { icon = '✕'; color = 'text-red-500'; label = '저장 실패' }
  else { icon = '·'; color = 'text-slate-600'; label = '' }

  const timeAgo = status === 'saved' && lastSavedAt ? formatTime(lastSavedAt) : null

  if (minimal) {
    return (
      <span className={`text-[10px] flex items-center gap-1 ${color}`}>
        <span className={status === 'saving' ? 'animate-spin' : ''}>{icon}</span>
        {label}
        {timeAgo && <span className="text-slate-500">· {timeAgo}</span>}
      </span>
    )
  }

  return (
    <div className="flex items-center gap-1.5 text-[10px]">
      <span className={color}>
        <span className={status === 'saving' ? 'animate-spin inline-block' : ''}>{icon}</span>
      </span>
      <span className="text-slate-400">{label}</span>
      {timeAgo && (
        <span className="text-slate-600">· {timeAgo}</span>
      )}
    </div>
  )
}
