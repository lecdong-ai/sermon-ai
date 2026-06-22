'use client'

import { useState, useEffect, useCallback } from 'react'
import { Youtube, RefreshCw, Library } from 'lucide-react'
import { YouTubeInput } from '@/components/advanced/youtube/YouTubeInput'
import { YouTubeLibrary } from '@/components/advanced/youtube/YouTubeLibrary'
import { YouTubeAnalysis } from '@/components/advanced/youtube/YouTubeAnalysis'

interface AnalysisItem {
  id: string
  video_id: string
  title: string | null
  channel_name: string | null
  thumbnail_url: string | null
  video_url: string
  created_at: string
  analysis: {
    overallSummary?: string
    summary?: string
  }
}

interface AnalysisRecord {
  id: string
  video_id: string
  title: string | null
  channel_name: string | null
  thumbnail_url: string | null
  video_url: string
  transcript: { text: string; offset: number; duration: number }[]
  analysis: any
  saved_insights: string[]
  note_ids: string[]
  created_at: string
  isSample?: boolean
}

type ViewState = 'library' | 'analyzing' | 'analysis'

export default function YouTubeLabPage() {
  const [view, setView] = useState<ViewState>('library')
  const [analyzing, setAnalyzing] = useState(false)
  const [loadingRecord, setLoadingRecord] = useState(false)
  const [error, setError] = useState('')
  const [libraryItems, setLibraryItems] = useState<AnalysisItem[]>([])
  const [libraryLoading, setLibraryLoading] = useState(true)
  const [libraryError, setLibraryError] = useState('')
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisRecord | null>(null)

  const fetchLibrary = useCallback(async () => {
    setLibraryLoading(true)
    setLibraryError('')
    try {
      const res = await fetch('/api/youtube/history')
      if (!res.ok) {
        setLibraryError('불러오기에 실패했습니다.')
        return
      }
      const data = await res.json()
      setLibraryItems(data.data || [])
    } catch {
      setLibraryError('네트워크 오류가 발생했습니다.')
    } finally {
      setLibraryLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLibrary()
  }, [fetchLibrary])

  const handleAnalyze = useCallback(async (url: string) => {
    setAnalyzing(true)
    setError('')
    setView('analyzing')

    try {
      const res = await fetch('/api/youtube/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || '분석에 실패했습니다.')
        setView('library')
        return
      }

      if (data.cached) {
        setCurrentAnalysis(data.data as AnalysisRecord)
      } else {
        setCurrentAnalysis(data.data as AnalysisRecord)
        await fetchLibrary()
      }
      setView('analysis')
    } catch {
      setError('네트워크 오류가 발생했습니다.')
      setView('library')
    } finally {
      setAnalyzing(false)
    }
  }, [fetchLibrary])

  const handleSelectAnalysis = useCallback(async (id: string) => {
    setLoadingRecord(true)
    setView('analyzing')
    try {
      const res = await fetch(`/api/youtube/${id}`)
      if (!res.ok) {
        setError('분석 결과를 불러올 수 없습니다.')
        setView('library')
        return
      }
      const data = await res.json()
      setCurrentAnalysis(data.data as AnalysisRecord)
      setView('analysis')
    } catch {
      setError('네트워크 오류가 발생했습니다.')
      setView('library')
    } finally {
      setLoadingRecord(false)
    }
  }, [])

  const handleDelete = useCallback(async (id: string) => {
    try {
      await fetch(`/api/youtube/${id}`, { method: 'DELETE' })
      setLibraryItems(prev => prev.filter(i => i.id !== id))
      if (currentAnalysis?.id === id) {
        setView('library')
        setCurrentAnalysis(null)
      }
    } catch {}
  }, [currentAnalysis])

  const handleDeleteCurrent = useCallback(async () => {
    if (!currentAnalysis) return
    await handleDelete(currentAnalysis.id)
  }, [currentAnalysis, handleDelete])

  const handleBackToLibrary = useCallback(() => {
    setView('library')
    setCurrentAnalysis(null)
    setError('')
  }, [])

  const handleInsightsChange = useCallback((savedInsights: string[]) => {
    if (currentAnalysis) {
      setCurrentAnalysis({ ...currentAnalysis, saved_insights: savedInsights })
    }
  }, [currentAnalysis])

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-red-500/20 to-rose-500/10 border border-red-500/20">
            <Youtube className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">유튜브 연구소</h1>
            <p className="text-xs text-slate-400">
              {view === 'library' ? '저장된 분석 라이브러리' : '영상 분석 결과'}
            </p>
          </div>
        </div>
        {view === 'library' && (
          <button
            onClick={fetchLibrary}
            disabled={libraryLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-500 bg-white/5 border border-white/10 rounded-lg hover:text-white hover:bg-white/10 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${libraryLoading ? 'animate-spin' : ''}`} />
            새로고침
          </button>
        )}
      </div>

      {/* URL Input (always visible in library view) */}
      {view === 'library' && (
        <div className="p-5 rounded-xl bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/10">
          <YouTubeInput onAnalyze={handleAnalyze} loading={analyzing} />
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center gap-2">
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto text-rose-400/50 hover:text-rose-300">&times;</button>
        </div>
      )}

      {/* Library view */}
      {view === 'library' && (
        <>
          <div className="flex items-center gap-2 mb-1">
            <Library className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-medium text-slate-400">
              내 라이브러리
              {libraryItems.length > 0 && (
                <span className="text-slate-600 ml-1">({libraryItems.length})</span>
              )}
            </span>
          </div>
          <YouTubeLibrary
            items={libraryItems}
            loading={libraryLoading}
            error={libraryError}
            onSelect={handleSelectAnalysis}
            onDelete={handleDelete}
            onRefresh={fetchLibrary}
          />
        </>
      )}

      {/* Analysis view */}
      {view === 'analyzing' && !currentAnalysis && (
        <div className="flex flex-col items-center justify-center py-32">
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500/20 via-rose-500/10 to-emerald-500/20 animate-pulse" />
            <LoaderIcon className="w-8 h-8 text-indigo-400 animate-spin absolute inset-0 m-auto" />
          </div>
          <p className="text-sm text-slate-400 mb-1">
            {analyzing ? '영상을 분석하고 있습니다...' : '분석 결과를 불러오는 중...'}
          </p>
          <p className="text-xs text-slate-600">잠시만 기다려주세요</p>
        </div>
      )}

      {/* Current analysis */}
      {view === 'analysis' && currentAnalysis && (
        <YouTubeAnalysis
          data={currentAnalysis}
          loading={loadingRecord}
          onBack={handleBackToLibrary}
          onDelete={handleDeleteCurrent}
          onInsightsChange={handleInsightsChange}
        />
      )}
    </div>
  )
}

function LoaderIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12a9 9 0 11-6.219-8.56" strokeLinecap="round" />
    </svg>
  )
}
