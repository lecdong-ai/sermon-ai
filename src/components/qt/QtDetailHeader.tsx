import { SeasonBadge } from '@/components/common/SeasonBadge'
import { FreeBadge } from '@/components/common/FreeBadge'
import { formatDate } from '@/lib/utils/format'
import type { QtPost } from '@/types/qt-index'

interface QtDetailHeaderProps {
  post: QtPost
}

export function QtDetailHeader({ post }: QtDetailHeaderProps) {
  return (
    <div className="space-y-5 mb-10">
      <div className="flex items-center gap-3 flex-wrap">
        <SeasonBadge season={post.season} />
        <FreeBadge />
        <span className="text-meta text-foreground-subtle">
          {formatDate(post.publishedAt)}
        </span>
        {post.readTime && (
          <span className="text-meta text-foreground-subtle">
            · {post.readTime}분 읽기
          </span>
        )}
        {post.viewCount !== undefined && (
          <span className="text-meta text-foreground-subtle">
            · 조회 {post.viewCount.toLocaleString()}
          </span>
        )}
      </div>

      <h1 className="font-serif text-display sm:text-[2.25rem] text-foreground leading-tight tracking-tight">
        {post.title}
      </h1>

      {post.bibleRange && (
        <p className="font-serif text-body-lg text-accent">
          {post.bibleRange}
        </p>
      )}

      <p className="text-body-lg text-foreground-muted leading-relaxed max-w-lg">
        {post.excerpt}
      </p>

      {post.series && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-accent-soft/40 text-accent text-meta">
          <span>시리즈</span>
          <span className="font-medium">{post.series.title}</span>
        </div>
      )}

      {post.tags.length > 0 && (
        <div className="flex gap-2 flex-wrap pt-1">
          {post.tags.map((tag) => (
            <span
              key={tag.id}
              className="text-meta text-foreground-subtle hover:text-accent transition-colors duration-200 cursor-default"
            >
              #{tag.name}
            </span>
          ))}
        </div>
      )}

      <hr className="border-border/60" />
    </div>
  )
}
