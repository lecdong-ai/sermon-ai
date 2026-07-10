'use client'

import { useRouter } from 'next/navigation'
import { CheckCircle, Loader2, Circle, ArrowRight, FileText, Upload, PenLine } from 'lucide-react'

export interface WorkspaceSermon {
  id: string
  title: string
  passage: string
  file_name: string
  source: string
  created_at: string
  updated_at: string
  progress: { current: number; total: number; percent: number }
  preview: string
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    const diffHour = Math.floor(diffMin / 60)
    const diffDay = Math.floor(diffHour / 24)

    if (diffMin < 1) return '방금 전'
    if (diffMin < 60) return `${diffMin}분 전`
    if (diffHour < 24) return `${diffHour}시간 전`
    if (diffDay < 7) return `${diffDay}일 전`
    return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
  } catch {
    return ''
  }
}

function ProgressBadge({ progress }: { progress: WorkspaceSermon['progress'] }) {
  const { current, total } = progress
  const isComplete = current === total
  const isStarted = current > 0

  if (isComplete) {
    return (
      <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-100 text-emerald-700 text-[11px] font-bold">
        <CheckCircle className="w-3 h-3" />
        {current}/{total} 완료
      </div>
    )
  }

  if (isStarted) {
    return (
      <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-100 text-amber-700 text-[11px] font-bold">
        <Loader2 className="w-3 h-3" />
        {current}/{total} 진행 중
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 text-slate-500 text-[11px] font-bold">
      <Circle className="w-3 h-3" />
      시작 전
    </div>
  )
}

function SourceBadge({ source }: { source: string }) {
  if (source === 'manuscript') {
    return (
      <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 text-[10px] font-medium">
        <PenLine className="w-3 h-3" />
        원고에서
      </div>
    )
  }
  return (
    <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#f5f4f0] text-[#8d7a5b] text-[10px] font-medium">
      <Upload className="w-3 h-3" />
      업로드
    </div>
  )
}

export default function WorkspaceListCard({ sermon, index }: { sermon: WorkspaceSermon; index: number }) {
  const router = useRouter()

  return (
    <button
      onClick={() => router.push(`/workspace?id=${sermon.id}`)}
      className="group w-full text-left bg-white rounded-2xl border border-[#e4e2dd] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-lg hover:-translate-y-0.5 hover:border-[#d4d1c9] transition-all duration-300 animate-in"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      {/* 상단: 제목 + 진행률 */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="text-[15px] font-bold text-[#2c2a29] truncate flex-1 min-w-0 group-hover:text-[#8d7a5b] transition-colors">
          {sermon.title}
        </h3>
        <ProgressBadge progress={sermon.progress} />
      </div>

      {/* 메타 정보 */}
      <div className="flex items-center gap-2 flex-wrap mb-3">
        {sermon.passage && (
          <span className="text-[12px] font-medium text-[#8d7a5b] bg-[#fdfcf7] border border-[#e8e6e1] px-2 py-0.5 rounded">
            {sermon.passage}
          </span>
        )}
        <SourceBadge source={sermon.source} />
        <span className="text-[11px] text-[#8a8580] ml-auto">{formatDate(sermon.updated_at)}</span>
      </div>

      {/* 미리보기 */}
      {sermon.preview && (
        <div className="flex items-start gap-2 mb-3">
          <FileText className="w-3.5 h-3.5 text-[#8a8580] shrink-0 mt-0.5" />
          <p className="text-[13px] text-[#6b6764] leading-relaxed line-clamp-2">
            {sermon.preview}
          </p>
        </div>
      )}

      {/* 하단: 진행률 바 + 열기 버튼 */}
      <div className="flex items-center gap-3 pt-3 border-t border-[#f0eee9]">
        <div className="flex-1 h-1.5 rounded-full bg-[#f0eee9] overflow-hidden">
          <div
            className="h-full rounded-full bg-[#8d7a5b] transition-all duration-500"
            style={{ width: `${sermon.progress.percent}%` }}
          />
        </div>
        <div className="flex items-center gap-1 text-[12px] font-medium text-[#8a8580] group-hover:text-[#8d7a5b] transition-colors">
          열기
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </button>
  )
}
