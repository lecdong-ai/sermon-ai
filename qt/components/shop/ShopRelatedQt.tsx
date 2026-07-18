import Link from 'next/link'
import { SectionHeader } from '@/components/common/SectionHeader'
import { FreeBadge } from '@/components/common/FreeBadge'
import type { QtPost } from '@/types'

interface ShopRelatedQtProps {
  posts: QtPost[]
}

export function ShopRelatedQt({ posts }: ShopRelatedQtProps) {
  if (!posts || posts.length === 0) return null

  return (
    <section>
      <SectionHeader title="이 굿즈와 함께 읽으면 좋은 묵상" href="/qt" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/qt/${post.slug}`}
            className="group flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-surface-2 transition-colors"
          >
            <div className="min-w-0 flex-1">
              <p className="font-serif text-h3 text-foreground group-hover:text-accent transition-colors line-clamp-2">
                {post.title}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <FreeBadge />
                <span className="text-meta text-foreground-subtle">
                  {post.bibleRange}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
