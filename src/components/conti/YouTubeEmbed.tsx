'use client'

import { useState } from 'react'
import { extractYouTubeId } from '@/lib/conti/mockUrlImport'
import { Play, X, ExternalLink, Youtube } from 'lucide-react'

interface Props {
  url: string | null
  variant?: 'thumb' | 'button' | 'inline' | 'preview'
  title?: string
  className?: string
}

export function getYouTubeThumbnail(url: string | null | undefined): string | null {
  const id = extractYouTubeId(url || '')
  if (!id) return null
  return `https://img.youtube.com/vi/${id}/mqdefault.jpg`
}

export default function YouTubeEmbed({ url, variant = 'thumb', title, className = '' }: Props) {
  const [open, setOpen] = useState(false)
  const ytId = extractYouTubeId(url || '')

  if (!ytId) return null

  if (variant === 'button') {
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[12px] font-bold text-rose-300 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-colors ${className}`}
          title="YouTube에서 미리듣기"
        >
          <Play className="w-3 h-3" />
          미리듣기
        </button>
        {open && <YouTubeModal ytId={ytId} title={title} onClose={() => setOpen(false)} />}
      </>
    )
  }

  if (variant === 'inline') {
    return (
      <div className={`relative aspect-video rounded-lg overflow-hidden bg-black ${className}`}>
        <iframe
          src={`https://www.youtube.com/embed/${ytId}?rel=0`}
          title={title || 'YouTube video'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    )
  }

  if (variant === 'preview') {
    return (
      <div className={`relative aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-rose-500/20 to-rose-900/40 border border-rose-500/20 group cursor-pointer ${className}`}>
        <img
          src={getYouTubeThumbnail(url) || ''}
          alt={title || 'YouTube'}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
          <button
            onClick={() => setOpen(true)}
            className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-500 flex items-center justify-center shadow-2xl transition-all group-hover:scale-110"
          >
            <Play className="w-6 h-6 text-white ml-1" fill="white" />
          </button>
        </div>
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-rose-600/90 text-white text-[11px] font-extrabold flex items-center gap-1">
          <Youtube className="w-2.5 h-2.5" />
          YouTube
        </div>
      </div>
    )
  }

  // default: thumb (small thumbnail with play icon)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`relative w-12 h-9 rounded-md overflow-hidden bg-rose-500/20 group flex-shrink-0 ${className}`}
        title="YouTube에서 미리듣기"
      >
        <img
          src={getYouTubeThumbnail(url) || ''}
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 flex items-center justify-center transition-colors">
          <Play className="w-3 h-3 text-white" fill="white" />
        </div>
      </button>
      {open && <YouTubeModal ytId={ytId} title={title} onClose={() => setOpen(false)} />}
    </>
  )
}

function YouTubeModal({ ytId, title, onClose }: { ytId: string; title?: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl rounded-2xl overflow-hidden bg-black shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0 z-10">
          <div className="flex items-center gap-2 min-w-0">
            <Youtube className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <p className="text-[14px] font-bold text-white truncate">
              {title || 'YouTube 미리듣기'}
            </p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <a
              href={`https://www.youtube.com/watch?v=${ytId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
              title="YouTube에서 열기"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="aspect-video">
          <iframe
            src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`}
            title={title || 'YouTube video'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      </div>
    </div>
  )
}
