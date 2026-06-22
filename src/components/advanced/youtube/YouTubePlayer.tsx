'use client'

import { useEffect, useRef, useCallback } from 'react'

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: (() => void) | null
  }
}

interface YouTubePlayerProps {
  videoId: string
  onTimeUpdate?: (time: number) => void
  onSeekReady?: (seek: (seconds: number) => void) => void
}

export function YouTubePlayer({ videoId, onTimeUpdate, onSeekReady }: YouTubePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<any>(null)
  const seekQueueRef = useRef<number | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval>>()
  const timeUpdateRef = useRef(onTimeUpdate)
  timeUpdateRef.current = onTimeUpdate

  const seekTo = useCallback((seconds: number) => {
    if (playerRef.current?.seekTo) {
      playerRef.current.seekTo(seconds, true)
    } else {
      seekQueueRef.current = seconds
    }
  }, [])

  useEffect(() => {
    if (onSeekReady) onSeekReady(seekTo)
  }, [onSeekReady, seekTo])

  useEffect(() => {
    let playerInstance: any = null

    const createPlayer = () => {
      if (!containerRef.current || !window.YT?.Player) return

      playerInstance = new window.YT.Player(containerRef.current, {
        videoId,
        playerVars: {
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onReady: () => {
            playerRef.current = playerInstance
            if (seekQueueRef.current !== null) {
              playerInstance.seekTo(seekQueueRef.current, true)
              seekQueueRef.current = null
            }
            intervalRef.current = setInterval(() => {
              if (playerInstance?.getCurrentTime) {
                const time = playerInstance.getCurrentTime()
                timeUpdateRef.current?.(time)
              }
            }, 300)
          },
          onStateChange: (e: any) => {
            if (e.data === window.YT.PlayerState.PLAYING && seekQueueRef.current !== null) {
              playerInstance.seekTo(seekQueueRef.current, true)
              seekQueueRef.current = null
            }
          },
        },
      })
    }

    if (!window.YT) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      const original = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => {
        original?.()
        createPlayer()
      }
      document.head.appendChild(tag)
    } else {
      createPlayer()
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (playerInstance?.destroy) {
        try { playerInstance.destroy() } catch {}
      }
      playerRef.current = null
    }
  }, [videoId])

  return (
    <div className="w-full h-full relative bg-black">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  )
}
