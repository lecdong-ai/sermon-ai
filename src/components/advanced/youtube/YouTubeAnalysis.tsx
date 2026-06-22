'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import {
  FileText, ArrowLeft, ExternalLink, Loader2, Bookmark, Trash2
} from 'lucide-react'
import { TranscriptTimeline } from './TranscriptTimeline'
import { YouTubePlayer } from './YouTubePlayer'
import { AnalysisOutlineView } from './AnalysisOutline'
import { adaptLegacyAnalysis } from './types'
import type { AnalysisOutline } from './types'

interface TranscriptItem {
  text: string
  offset: number
  duration: number
}

interface AnalysisRecord {
  id: string
  video_id: string
  title: string | null
  channel_name: string | null
  thumbnail_url: string | null
  video_url: string
  transcript: TranscriptItem[]
  analysis: any
  saved_insights: number[] | string[]
  note_ids: string[]
  created_at: string
}

interface YouTubeAnalysisProps {
  data: AnalysisRecord
  loading?: boolean
  onBack: () => void
  onDelete: () => void
  onInsightsChange: (savedInsights: string[]) => void
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function YouTubeAnalysis({ data, loading, onBack, onDelete, onInsightsChange }: YouTubeAnalysisProps) {
  const [currentTime, setCurrentTime] = useState(0)
  const [visible, setVisible] = useState(false)
  const [savingInsight, setSavingInsight] = useState<string | null>(null)
  const seekRef = useRef<(seconds: number) => void>()

  // Adapt legacy format
  const outline: AnalysisOutline = adaptLegacyAnalysis(data.analysis)

  // Ensure saved_insights is string[]
  const savedInsights: string[] = (data.saved_insights || []).map(s => String(s))

  // Step reveal
  useEffect(() => {
    if (loading) return
    const t = setTimeout(() => setVisible(true), 200)
    return () => clearTimeout(t)
  }, [loading])

  const handleSeek = useCallback((time: number) => {
    seekRef.current?.(time)
  }, [])

  const handleToggleInsight = useCallback(async (key: string) => {
    const next = savedInsights.includes(key)
      ? savedInsights.filter(k => k !== key)
      : [...savedInsights, key]

    setSavingInsight(key)
    try {
      await fetch(`/api/youtube/${data.id}/insights`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ saved_insights: next }),
      })
      onInsightsChange(next)
    } finally {
      setSavingInsight(null)
    }
  }, [data.id, savedInsights, onInsightsChange])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500/20 via-rose-500/10 to-emerald-500/20 animate-pulse" />
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin absolute inset-0 m-auto" />
        </div>
        <p className="text-sm text-slate-400 mb-1">분석 결과를 불러오는 중...</p>
        <p className="text-xs text-slate-600">잠시만 기다려주세요</p>
      </div>
    )
  }

  return (
    <div className={`space-y-6 transition-all duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs text-slate-500 hover:text-white transition-all group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          라이브러리
        </button>
        <div className="flex items-center gap-2">
          <a
            href={data.video_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-500 bg-white/5 rounded-lg hover:text-white hover:bg-white/10 transition-all"
          >
            <ExternalLink className="w-3 h-3" />
            YouTube
          </a>
          <button
            onClick={onDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-400/70 bg-white/5 rounded-lg hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <Trash2 className="w-3 h-3" />
            삭제
          </button>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Player + info + Transcript */}
        <div className="lg:col-span-2 space-y-3">
          <div className="aspect-video rounded-xl overflow-hidden border border-white/10">
            <YouTubePlayer
              videoId={data.video_id}
              onTimeUpdate={setCurrentTime}
              onSeekReady={(seek) => { seekRef.current = seek }}
            />
          </div>

      {/* Video info below player */}
      <div>
            <h2 className="text-sm font-bold text-white mb-0.5">{data.title || '제목 없음'}</h2>
            <p className="text-xs text-slate-500 mb-1.5">{data.channel_name}</p>
            <div className="flex items-center gap-3 text-[10px] text-slate-600">
              <span className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                {formatDate(data.created_at)}
              </span>
              <span className="flex items-center gap-1">
                <Bookmark className="w-3 h-3" />
                {savedInsights.length}개 저장됨
              </span>
            </div>
          </div>

          {data.transcript?.length > 0 && (
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
              <TranscriptTimeline
                items={data.transcript}
                currentTime={currentTime}
                onSeek={handleSeek}
              />
            </div>
          )}
        </div>

        {/* Right: Analysis outline */}
        <div className="lg:col-span-3 space-y-4">
          <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <AnalysisOutlineView
              outline={outline}
              onSeek={handleSeek}
              savedInsights={savedInsights}
              onToggleInsight={handleToggleInsight}
              savingInsight={savingInsight}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
