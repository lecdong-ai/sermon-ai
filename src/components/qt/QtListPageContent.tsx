'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { QtCard } from '@/components/qt/QtCard'
import type { QtPost, QtQueryParams } from '@/types/qt-index'

interface QtListPageContentProps {
  posts: QtPost[]
  total: number
  currentParams: QtQueryParams
  pageSize: number
}

export function QtListPageContent({
  posts,
  total,
  currentParams,
  pageSize,
}: QtListPageContentProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentPage = currentParams.page ?? 1
  const totalPages = Math.ceil(total / pageSize)

  const buildHref = useCallback(
    (updates: Partial<QtQueryParams>) => {
      const params = new URLSearchParams(searchParams.toString())
      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === '' || value === null) {
          params.delete(key)
        } else {
          params.set(key, String(value))
        }
      })
      const qs = params.toString()
      return qs ? `${pathname}?${qs}` : pathname
    },
    [pathname, searchParams]
  )

  return (
    <div className="space-y-8">
      {posts.length === 0 ? (
        <div className="text-center py-20 space-y-3">
          <p className="text-body text-foreground-muted">검색 결과가 없습니다.</p>
          <a
            href="/qt"
            className="text-meta text-accent hover:underline inline-block"
          >
            모든 큐티 자료 보기
          </a>
        </div>
      ) : (
        <>
          <p className="text-meta text-foreground-subtle">
            총 {total}개의 자료
            {currentParams.season && ` · ${currentParams.season}`}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-card-gap">
            {posts.map((post) => (
              <QtCard key={post.id} post={post} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              {currentPage > 1 && (
                <a
                  href={buildHref({ page: currentPage - 1 })}
                  className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm text-foreground-muted hover:text-foreground hover:bg-surface-2 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  이전
                </a>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => {
                  const page = currentPage
                  return (
                    p === 1 ||
                    p === totalPages ||
                    Math.abs(p - page) <= 1
                  )
                })
                .map((p, idx, arr) => (
                  <span key={p} className="flex items-center gap-2">
                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                      <span className="text-foreground-subtle px-1">...</span>
                    )}
                    <a
                      href={buildHref({ page: p })}
                      className={cn(
                        'w-10 h-10 flex items-center justify-center rounded-lg text-sm transition-colors',
                        p === currentPage
                          ? 'bg-foreground text-background'
                          : 'text-foreground-muted hover:text-foreground hover:bg-surface-2'
                      )}
                      {...(p === currentPage ? { 'aria-current': 'page' } : {})}
                    >
                      {p}
                    </a>
                  </span>
                ))}
              {currentPage < totalPages && (
                <a
                  href={buildHref({ page: currentPage + 1 })}
                  className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm text-foreground-muted hover:text-foreground hover:bg-surface-2 transition-colors"
                >
                  다음
                  <ChevronRight className="w-4 h-4" />
                </a>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
