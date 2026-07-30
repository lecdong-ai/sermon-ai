import Link from 'next/link'
import Image from 'next/image'
import type { QtPost } from '@/types/qt-index'
import { FreeBadge } from '@/components/common/FreeBadge'
import { SeasonBadge } from '@/components/common/SeasonBadge'
import { formatDate, formatNumber } from '@/lib/utils/format'

interface QtCardProps {
  post: QtPost
  variant?: 'default' | 'large'
}

export function QtCard({ post, variant = 'default' }: QtCardProps) {
  if (variant === 'large') {
    return (
      <Link
        href={`/qt/${post.slug}`}
        className="group block bg-surface rounded-lg overflow-hidden transition-all duration-300 border border-border/60 shadow-card hover:shadow-card-hover hover:-translate-y-1"
      >
        {post.thumbnail && (
          <div className="aspect-[4/5] bg-surface-2 overflow-hidden">
            <Image
              src={post.thumbnail.src}
              alt={post.thumbnail.alt}
              width={post.thumbnail.width ?? 800}
              height={post.thumbnail.height ?? 1000}
              unoptimized
              className="w-full h-full object-cover transition-all duration-500 group-hover:scale-[1.03]"
            />
          </div>
        )}
        <div className="p-5 sm:p-6 space-y-3">
          <div className="flex items-center gap-2 text-meta text-foreground-subtle">
            <SeasonBadge season={post.season} />
            <span>{formatDate(post.publishedAt)}</span>
            {post.viewCount !== undefined && <span>· 조회 {formatNumber(post.viewCount)}</span>}
          </div>
          <h3 className="font-serif text-h2 text-foreground leading-snug group-hover:text-accent transition-colors duration-200">
            {post.title}
          </h3>
          <p className="text-body text-foreground-muted line-clamp-3 leading-relaxed">
            {post.excerpt}
          </p>
          <div className="flex items-center gap-2 pt-1">
            <FreeBadge />
            {post.tags.slice(0, 2).map((tag) => (
              <span
                key={tag.id}
                className="text-meta text-foreground-subtle"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={`/qt/${post.slug}`}
      className="group block bg-surface rounded-lg overflow-hidden transition-all duration-300 border border-border/60 shadow-card hover:shadow-card-hover hover:-translate-y-1"
    >
      {post.thumbnail && (
        <div className="aspect-[4/5] bg-surface-2 overflow-hidden">
          <Image
            src={post.thumbnail.src}
            alt={post.thumbnail.alt}
            width={post.thumbnail.width ?? 800}
            height={post.thumbnail.height ?? 1000}
            unoptimized
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-[1.03]"
          />
        </div>
      )}
      <div className="p-4 space-y-2">
        <div className="flex items-center gap-2 text-meta text-foreground-subtle">
          <span>{formatDate(post.publishedAt)}</span>
          {post.readTime && <span>· {post.readTime}분</span>}
          {post.viewCount !== undefined && <span>· 조회 {formatNumber(post.viewCount)}</span>}
        </div>
        <h3 className="font-serif text-h3 text-foreground leading-snug line-clamp-2 group-hover:text-accent transition-colors duration-200">
          {post.title}
        </h3>
        <p className="text-body text-foreground-muted line-clamp-2 leading-relaxed">
          {post.excerpt}
        </p>
        <div className="flex items-center gap-2 pt-1">
          <FreeBadge />
          {post.tags.slice(0, 1).map((tag) => (
            <span key={tag.id} className="text-meta text-foreground-subtle">
              #{tag.name}
            </span>
          ))}
        </div>
      </div>
    </Link>
  )
}
