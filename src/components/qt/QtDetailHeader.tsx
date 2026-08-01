import { SeasonBadge } from '@/components/common/SeasonBadge'
import { FreeBadge } from '@/components/common/FreeBadge'
import { formatDate } from '@/lib/utils/format'
import type { QtPost } from '@/types/qt-index'
import { BookOpen, Clock, Eye } from 'lucide-react'

interface QtDetailHeaderProps {
  post: QtPost
}

export function QtDetailHeader({ post }: QtDetailHeaderProps) {
  return (
    <div className="relative mb-16">
      {/* Decorative quotation mark */}
      <div className="absolute -top-16 -left-4 text-[140px] leading-none font-serif text-accent/[0.07] select-none pointer-events-none" aria-hidden="true">
        &ldquo;
      </div>

      <div className="relative z-10">
        {/* Series badge only */}
        {post.series && (
          <div className="mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium tracking-wide border border-accent/20">
              <BookOpen className="w-3 h-3" />
              {post.series.title}
            </span>
          </div>
        )}

        {/* Title */}
        <h1 className="font-serif text-[2rem] sm:text-[2.75rem] lg:text-[3.25rem] text-foreground leading-[1.2] tracking-tight mb-6">
          {post.title}
        </h1>

        {/* Cover Image or Fallback Header Artwork */}
        <div className="my-8 rounded-2xl overflow-hidden border border-border/60 shadow-lg bg-surface-2 aspect-[16/9] sm:aspect-[21/9] relative group">
          {post.thumbnail?.src && !post.thumbnail.src.includes('default-cover.jpg') ? (
            <img
              src={post.thumbnail.src}
              alt={post.thumbnail.alt || post.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-900/40 via-purple-900/30 to-slate-900/60 p-8 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-accent/20 rounded-full blur-3xl" />
              <div className="flex justify-between items-start relative z-10">
                <SeasonBadge season={post.season} />
                <span className="text-xs font-serif text-accent/80 tracking-widest uppercase">말씀 연구실 Archive</span>
              </div>
              <div className="relative z-10 space-y-1">
                <p className="font-serif text-2xl sm:text-3xl text-white font-bold tracking-tight">{post.title}</p>
                {post.bibleRange && <p className="text-sm font-serif text-indigo-200">{post.bibleRange}</p>}
              </div>
            </div>
          )}
        </div>

        {/* Bible range - elegant accent display */}
        {post.bibleRange && (
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-[2px] bg-gradient-to-r from-accent to-accent/30 rounded-full" />
            <p className="font-serif text-lg sm:text-xl text-accent font-medium tracking-wide">
              {post.bibleRange}
            </p>
          </div>
        )}

        {/* Excerpt */}
        <p className="text-base sm:text-lg text-foreground-muted leading-relaxed max-w-2xl mb-8">
          {post.excerpt}
        </p>

        {/* Bottom info bar */}
        <div className="flex items-center gap-4 sm:gap-6 flex-wrap text-sm text-foreground-subtle">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 opacity-60" />
            {formatDate(post.publishedAt)}
          </span>
          {post.readTime && (
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 opacity-60" />
              {post.readTime}분 읽기
            </span>
          )}
          {post.viewCount !== undefined && (
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 opacity-60" />
              {post.viewCount.toLocaleString()} 읽음
            </span>
          )}
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex gap-2 flex-wrap mt-5">
            {post.tags.map((tag) => (
              <span
                key={tag.id}
                className="text-xs px-2.5 py-1 rounded-full bg-surface-2 text-foreground-subtle hover:text-accent hover:bg-accent/10 transition-all duration-300 cursor-default"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Elegant divider */}
      <div className="mt-10 flex items-center gap-4">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="w-1.5 h-1.5 rounded-full bg-accent/40" />
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>
    </div>
  )
}
