'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { Clock } from 'lucide-react'

interface TranscriptItem {
  text: string
  offset: number
  duration: number
}

interface TranscriptTimelineProps {
  items: TranscriptItem[]
  currentTime: number
  onSeek: (time: number) => void
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function TranscriptTimeline({ items, currentTime, onSeek }: TranscriptTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(-1)

  useEffect(() => {
    const idx = items.findIndex(
      (item) => currentTime >= item.offset && currentTime < item.offset + item.duration
    )
    setActiveIndex(idx)
  }, [currentTime, items])

  const handleItemClick = useCallback((offset: number) => {
    onSeek(offset)
  }, [onSeek])

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Clock className="w-3.5 h-3.5 text-slate-500" />
        <span className="text-xs font-medium text-slate-400">자막 타임라인</span>
        <span className="text-[10px] text-slate-600">{items.length}개</span>
      </div>
      <div ref={containerRef} className="space-y-1 max-h-80 overflow-y-auto pr-2 scrollbar-thin">
        {items.map((item, i) => {
          const isActive = i === activeIndex
          return (
            <button
              key={i}
              onClick={() => handleItemClick(item.offset)}
              className={`w-full text-left flex items-start gap-3 p-2 rounded-lg transition-all ${
                isActive
                  ? 'bg-indigo-500/10 border border-indigo-500/20'
                  : 'hover:bg-white/[0.02] border border-transparent'
              }`}
            >
              <span className={`shrink-0 text-[10px] font-mono mt-0.5 min-w-[3rem] ${
                isActive ? 'text-indigo-400' : 'text-slate-600'
              }`}>
                {formatTime(item.offset)}
              </span>
              <span className={`text-[12px] leading-relaxed ${
                isActive ? 'text-white/90' : 'text-slate-500'
              }`}>
                {item.text}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
