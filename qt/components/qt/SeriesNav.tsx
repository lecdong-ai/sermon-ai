import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface SeriesNavProps {
  series: {
    id: string
    slug: string
    title: string
    posts: Array<{
      slug: string
      title: string
      order: number
    }>
  }
  currentSlug: string
}

export function SeriesNav({ series, currentSlug }: SeriesNavProps) {
  const currentIndex = series.posts.findIndex((p) => p.slug === currentSlug)
  const prev = currentIndex > 0 ? series.posts[currentIndex - 1] : null
  const next =
    currentIndex < series.posts.length - 1
      ? series.posts[currentIndex + 1]
      : null

  return (
    <div className="my-12 py-6 border-t border-b border-border space-y-4">
      <p className="text-meta text-foreground-subtle font-medium">
        시리즈 · {series.title} ({currentIndex + 1}/{series.posts.length})
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {prev ? (
          <Link
            href={`/qt/${prev.slug}`}
            className="group flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-surface-2 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-foreground-subtle shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-foreground-subtle">이전</p>
              <p className="text-sm text-foreground truncate group-hover:text-accent transition-colors">
                {prev.title}
              </p>
            </div>
          </Link>
        ) : (
          <div />
        )}
        {next ? (
          <Link
            href={`/qt/${next.slug}`}
            className="group flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-surface-2 transition-colors sm:text-right"
          >
            <div className="min-w-0 flex-1">
              <p className="text-xs text-foreground-subtle">다음</p>
              <p className="text-sm text-foreground truncate group-hover:text-accent transition-colors">
                {next.title}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-foreground-subtle shrink-0" />
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  )
}
