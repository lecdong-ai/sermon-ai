'use client'

import { useCallback } from 'react'
import { Download, Copy, Share2, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface StickyActionBarProps {
  downloads: { pdf?: string; text?: string }
  slug: string
}

export function StickyActionBar({ downloads, slug }: StickyActionBarProps) {
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(window.location.href)
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
    <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-40 md:sticky md:top-16 border-t md:border-t-0 md:border-b border-border/60 bg-background/90 backdrop-blur-md transition-all shadow-elevated">
      <div className="max-w-wide mx-auto px-5 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between h-14 md:h-12 gap-2">
          <div className="flex items-center gap-2">
            {downloads.text && (
              <Button
                variant="subtle"
                size="sm"
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
                className="gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                텍스트
              </Button>
            )}
            {downloads.pdf && (
              <Button variant="subtle" size="sm" asChild className="gap-1.5">
                <a href={downloads.pdf} download>
                  <Download className="w-3.5 h-3.5" />
                  PDF
                </a>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={handleCopy} title="링크 복사" className="gap-1.5">
              <Copy className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-xs">링크 복사</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleShare} title="공유" className="gap-1.5">
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-xs">공유</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
