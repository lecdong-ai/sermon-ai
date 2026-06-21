'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, FileText, Network, Archive, Edit3, Sparkles } from 'lucide-react'
import type { AdvancedProject } from '@/lib/advanced/types'
import type { NoteEntry } from '@/lib/advanced/notesData'

interface ActivityFeedProps {
  projects: AdvancedProject[]
}

interface ActivityItem {
  id: string
  kind: 'project_created' | 'project_updated' | 'project_archived' | 'project_completed' | 'note_added' | 'note_updated'
  title: string
  subtitle: string
  timestamp: number
  href: string
  icon: 'file' | 'edit' | 'archive' | 'note' | 'sparkle'
}

const ICON_MAP = {
  file: FileText,
  edit: Edit3,
  archive: Archive,
  note: Sparkles,
  sparkle: Sparkles,
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return '방금 전'
  if (minutes < 60) return `${minutes}분 전`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}시간 전`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}일 전`
  return new Date(ts).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

export default function ActivityFeed({ projects }: ActivityFeedProps) {
  const router = useRouter()
  const [notes, setNotes] = useState<NoteEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let ac: AbortController | null = null
    ac = new AbortController()
    fetch('/api/insights?limit=20', { signal: ac.signal })
      .then((r) => r.json())
      .then((json) => {
        if (json?.success) setNotes(json.data || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
    return () => ac?.abort()
  }, [])

  const items: ActivityItem[] = useMemo(() => {
    const result: ActivityItem[] = []

    // 프로젝트 활동
    projects.forEach((p) => {
      const updated = new Date(p.updatedAt).getTime()
      if (p.status === 'completed') {
        result.push({
          id: `p-c-${p.id}`,
          kind: 'project_completed',
          title: p.title,
          subtitle: `설교 완료 · ${p.passage || ''}`,
          timestamp: updated,
          href: `/advanced/projects/${p.id}`,
          icon: 'sparkle',
        })
      } else if (p.status === 'archived') {
        result.push({
          id: `p-a-${p.id}`,
          kind: 'project_archived',
          title: p.title,
          subtitle: `보관됨 · ${p.passage || ''}`,
          timestamp: updated,
          href: `/advanced/archive`,
          icon: 'archive',
        })
      } else {
        result.push({
          id: `p-u-${p.id}`,
          kind: 'project_updated',
          title: p.title,
          subtitle: `${stageLabel(p.status)} · ${p.passage || ''}`,
          timestamp: updated,
          href: `/advanced/projects/${p.id}`,
          icon: 'edit',
        })
      }
    })

    // 노트 활동
    notes.slice(0, 10).forEach((n) => {
      const ts = new Date(n.updatedAt).getTime()
      const created = new Date(n.createdAt).getTime()
      const isNew = Math.abs(ts - created) < 5000
      result.push({
        id: `n-${n.id}`,
        kind: isNew ? 'note_added' : 'note_updated',
        title: n.title,
        subtitle: `통찰 ${isNew ? '저장' : '수정'}됨`,
        timestamp: ts,
        href: `/advanced/notes`,
        icon: 'note',
      })
    })

    return result.sort((a, b) => b.timestamp - a.timestamp).slice(0, 6)
  }, [projects, notes])

  if (loading && items.length === 0) {
    return (
      <section className="glass-dark p-6 rounded-2xl border border-white/10">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-emerald-400" />
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">최근 활동</h2>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 rounded-lg bg-white/[0.02] border border-white/5 animate-pulse" />
          ))}
        </div>
      </section>
    )
  }

  if (items.length === 0) {
    return (
      <section className="glass-dark p-6 rounded-2xl border border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-emerald-400" />
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">최근 활동</h2>
        </div>
        <p className="text-xs text-slate-500 font-medium py-6 text-center">
          활동을 시작하면 여기에 표시됩니다
        </p>
      </section>
    )
  }

  return (
    <section className="glass-dark p-6 rounded-2xl border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-400" />
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">최근 활동</h2>
          <span className="text-[10px] text-slate-600 font-medium">Activity Feed</span>
        </div>
        <span className="text-[10px] text-slate-500 font-bold">{items.length}개</span>
      </div>

      <div className="space-y-1.5">
        {items.map((item) => {
          const Icon = ICON_MAP[item.icon]
          const dotColor =
            item.kind === 'project_completed' ? 'bg-emerald-400' :
            item.kind === 'project_archived' ? 'bg-slate-400' :
            item.kind === 'note_added' ? 'bg-pink-400' :
            item.kind === 'note_updated' ? 'bg-cyan-400' :
            'bg-indigo-400'
          return (
            <button
              key={item.id}
              onClick={() => router.push(item.href)}
              className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/[0.03] transition-colors group text-left"
            >
              <div className="relative shrink-0">
                <div className={`w-1.5 h-1.5 rounded-full ${dotColor} absolute -left-0.5 top-1.5`} />
                <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/5 flex items-center justify-center group-hover:border-white/10">
                  <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-bold text-slate-200 group-hover:text-white line-clamp-1 leading-tight">
                  {item.title}
                </p>
                <p className="text-[10px] text-slate-500 font-medium line-clamp-1 mt-0.5">
                  {item.subtitle}
                </p>
              </div>
              <span className="text-[10px] text-slate-500 font-bold shrink-0 tabular-nums">
                {timeAgo(item.timestamp)}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

function stageLabel(status: string): string {
  switch (status) {
    case 'research': return '연구중'
    case 'prepare': return '준비중'
    case 'writing': return '작성중'
    case 'review': return '검토중'
    case 'completed': return '완료'
    case 'archived': return '보관됨'
    default: return status
  }
}
