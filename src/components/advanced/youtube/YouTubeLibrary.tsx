'use client'

import { Trash2, Youtube, ExternalLink, Calendar, Clock, AlertCircle, RefreshCw } from 'lucide-react'

interface AnalysisItem {
  id: string
  video_id: string
  title: string | null
  channel_name: string | null
  thumbnail_url: string | null
  video_url: string
  created_at: string
  analysis: {
    summary: string
    topics?: { title: string; description: string }[]
    keyInsights?: { title: string; detail: string }[]
  }
}

interface YouTubeLibraryProps {
  items: AnalysisItem[]
  loading: boolean
  error: string
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  onRefresh: () => void
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) {
    const hours = Math.floor(diff / 3600000)
    if (hours === 0) {
      const mins = Math.floor(diff / 60000)
      return `${mins}분 전`
    }
    return `${hours}시간 전`
  }
  if (days < 7) return `${days}일 전`
  return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

export function YouTubeLibrary({ items, loading, error, onSelect, onDelete, onRefresh }: YouTubeLibraryProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-xl bg-white/[0.03] border border-white/10 overflow-hidden animate-pulse">
            <div className="aspect-video bg-slate-800" />
            <div className="p-4 space-y-2">
              <div className="h-3 bg-slate-700/50 rounded w-3/4" />
              <div className="h-2 bg-slate-700/50 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="p-3 rounded-full bg-rose-500/10 border border-rose-500/20 mb-4">
          <AlertCircle className="w-6 h-6 text-rose-400" />
        </div>
        <p className="text-sm text-rose-300 mb-2">{error}</p>
        <button
          onClick={onRefresh}
          className="px-4 py-2 text-xs font-medium text-slate-400 bg-white/5 border border-white/10 rounded-lg hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5"
        >
          <RefreshCw className="w-3 h-3" />
          다시 시도
        </button>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="p-4 rounded-full bg-white/[0.03] border border-white/10 mb-4">
          <Youtube className="w-8 h-8 text-slate-600" />
        </div>
        <h3 className="text-sm font-medium text-slate-400 mb-1">아직 분석한 영상이 없습니다</h3>
        <p className="text-xs text-slate-600 max-w-sm">
          위에 YouTube URL을 입력하고 분석해보세요.
          설교에 도움이 되는 인사이트를 자동으로 추출해드립니다.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {items.map((item) => (
        <div
          key={item.id}
          onClick={() => onSelect(item.id)}
          className="group relative rounded-xl bg-white/[0.03] border border-white/10 overflow-hidden cursor-pointer transition-all hover:border-indigo-500/30 hover:bg-white/[0.05] hover:shadow-lg hover:shadow-indigo-500/5"
        >
          {/* Thumbnail */}
          <div className="aspect-video bg-slate-800 relative overflow-hidden">
            {item.thumbnail_url ? (
              <img
                src={item.thumbnail_url}
                alt=""
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Youtube className="w-8 h-8 text-slate-700" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(item.id) }}
                className="p-1.5 rounded-lg bg-black/60 text-slate-400 hover:text-red-400 hover:bg-black/80 transition-all"
                title="삭제"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="p-4">
            <h4 className="text-sm font-medium text-white/90 truncate mb-1 group-hover:text-white transition-colors">
              {item.title || '제목 없음'}
            </h4>
            <p className="text-[11px] text-slate-500 mb-3">
              {item.channel_name || '알 수 없는 채널'}
            </p>

            {/* Preview */}
            {item.analysis?.summary && (
              <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2 mb-3">
                {item.analysis.summary}
              </p>
            )}

            {/* Meta */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(item.created_at)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
                <ExternalLink className="w-3 h-3" />
                <span>보기</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
