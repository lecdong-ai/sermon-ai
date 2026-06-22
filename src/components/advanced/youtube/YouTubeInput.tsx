'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Youtube, Loader2, AlertCircle, ExternalLink, CheckCircle2 } from 'lucide-react'

interface YouTubeInputProps {
  onAnalyze: (url: string) => Promise<void>
  loading: boolean
}

interface OEmbedData {
  title: string
  author_name: string
  thumbnail_url: string
}

export function YouTubeInput({ onAnalyze, loading }: YouTubeInputProps) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const [preview, setPreview] = useState<OEmbedData | null>(null)
  const [fetchingPreview, setFetchingPreview] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  const fetchPreview = useCallback(async (videoUrl: string) => {
    setFetchingPreview(true)
    try {
      const res = await fetch(`/api/youtube/oembed?url=${encodeURIComponent(videoUrl)}`)
      if (res.ok) {
        const data = await res.json()
        setPreview({
          title: data.title,
          author_name: data.author_name,
          thumbnail_url: `https://img.youtube.com/vi/${getVideoId(videoUrl)}/mqdefault.jpg`,
        })
      } else {
        setPreview(null)
      }
    } catch {
      setPreview(null)
    } finally {
      setFetchingPreview(false)
    }
  }, [])

  function getVideoId(videoUrl: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
      /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    ]
    for (const p of patterns) {
      const m = videoUrl.match(p)
      if (m) return m[1]
    }
    return null
  }

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setError('')

    const videoId = getVideoId(url.trim())
    if (videoId) {
      setPreview(null)
      debounceRef.current = setTimeout(() => fetchPreview(url.trim()), 400)
    } else {
      setPreview(null)
    }
  }, [url, fetchPreview])

  const clearUrl = useCallback(() => {
    setUrl('')
    setPreview(null)
    setError('')
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!url.trim()) {
      setError('YouTube URL을 입력해주세요.')
      return
    }
    if (!getVideoId(url.trim())) {
      setError('올바른 YouTube URL이 아닙니다.')
      return
    }
    await onAnalyze(url.trim())
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Youtube className="w-4 h-4 text-red-400" />
          </div>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="YouTube URL을 입력하세요"
            className="w-full pl-11 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
            disabled={loading}
          />
          {url && !loading && (
            <button
              type="button"
              onClick={clearUrl}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-600 hover:text-slate-400"
            >
              <span className="text-lg leading-none">&times;</span>
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={loading || !getVideoId(url.trim())}
          className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 text-white text-sm font-medium rounded-xl transition-all flex items-center gap-2 shrink-0"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Youtube className="w-4 h-4" />
          )}
          {loading ? '분석 중...' : '분석하기'}
        </button>
      </div>
      {error && (
        <div className="flex items-center gap-2 mt-3 text-red-400 text-xs">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {preview && (
        <div className="mt-4 p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-4 animate-fade-in">
          <div className="shrink-0 w-20 h-14 rounded-lg overflow-hidden bg-slate-800">
            <img src={preview.thumbnail_url} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{preview.title}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{preview.author_name}</p>
          </div>
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        </div>
      )}
      {fetchingPreview && url && !preview && (
        <div className="mt-4 flex items-center gap-2 text-slate-500 text-xs">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>영상 정보를 불러오는 중...</span>
        </div>
      )}
    </form>
  )
}
