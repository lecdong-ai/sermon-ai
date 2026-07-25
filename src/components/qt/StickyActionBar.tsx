'use client'

import { useCallback, useState } from 'react'
import { Download, Copy, Share2, Check } from 'lucide-react'

interface StickyActionBarProps {
  downloads: { pdf?: string; text?: string }
  slug: string
}

export function StickyActionBar({ downloads, slug }: StickyActionBarProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [])

  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: document.title,
        url: window.location.href,
      })
    } else {
      handleCopy()
    }
  }, [handleCopy])

  return (
    <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-40 md:sticky md:top-16 border-t border-border/40 bg-surface/80 backdrop-blur-xl transition-all">
      <div className="max-w-wide mx-auto px-5 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between h-14 md:h-12 gap-2">
          <div className="flex items-center gap-1.5">
            {downloads.text && (
              <button
                onClick={() => {
                  const blob = new Blob(['텍스트 다운로드는 실제 서버 연동 시 제공됩니다.'], {
                    type: 'text/plain',
                  })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `${slug}.txt`
                  a.click()
                  URL.revokeObjectURL(url)
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-foreground-muted hover:text-accent hover:bg-accent/8 transition-all duration-300"
              >
                <Download className="w-3.5 h-3.5" />
                텍스트
              </button>
            )}
            {downloads.pdf && (
              <a
                href={downloads.pdf}
                download
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-foreground-muted hover:text-accent hover:bg-accent/8 transition-all duration-300"
              >
                <Download className="w-3.5 h-3.5" />
                PDF
              </a>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleCopy}
              title="링크 복사"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-foreground-muted hover:text-accent hover:bg-accent/8 transition-all duration-300"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-600" />
                  <span className="hidden sm:inline text-green-600">복사됨!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">링크 복사</span>
                </>
              )}
            </button>
            <button
              onClick={handleShare}
              title="공유"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-foreground-muted hover:text-accent hover:bg-accent/8 transition-all duration-300"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">공유</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
