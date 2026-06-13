import type { RecentChange } from '@/lib/advanced/types'

function formatTime(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000)
  if (diff < 60) return '방금 전'
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`
  return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

const TYPE_ICONS: Record<string, string> = {
  edit: '✏️',
  generate: '🤖',
  save: '💾',
  create: '✨',
  stage: '➡️',
}

const SECTION_LABELS: Record<string, string> = {
  study: '성경 연구',
  prep: '설교 준비',
  manuscript: '설교 작성',
  overview: '개요',
}

export default function RecentChangesPanel({ changes, maxItems = 5 }: { changes: RecentChange[]; maxItems?: number }) {
  const display = changes.slice(0, maxItems)

  return (
    <div className="space-y-2">
      {display.map((change, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="text-[11px] shrink-0 mt-0.5">{TYPE_ICONS[change.type] || '•'}</span>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] text-slate-100 leading-relaxed">{change.description}</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[9px] text-slate-500">{formatTime(change.timestamp)}</span>
              <span className="text-slate-600">·</span>
              <span className="text-[9px] px-1 py-0.5 rounded bg-white/5 text-slate-400">
                {SECTION_LABELS[change.section] || change.section}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
