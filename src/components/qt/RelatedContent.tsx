import Link from 'next/link'
import Image from 'next/image'
import { SectionHeader } from '@/components/common/SectionHeader'
import { QtCard } from '@/components/qt/QtCard'
import { formatPrice } from '@/lib/utils/format'
import type { QtPost } from '@/types/qt-index'

interface RelatedContentProps {
  relatedQt: QtPost[]
  relatedCuration: Array<{
    slug: string
    title: string
    coverImage: string
    summary: string
  }>
  relatedShop?: {
    slug: string
    name: string
    thumbnail: string
    price: number
  } | null
}

export function RelatedContent({
  relatedQt,
  relatedCuration,
  relatedShop,
}: RelatedContentProps) {
  if (relatedQt.length === 0 && relatedCuration.length === 0 && !relatedShop) {
    return null
  }

  return (
    <div className="mt-16 space-y-12">
      {/* Related QT */}
      {relatedQt.length > 0 && (
        <section>
          <SectionHeader title="함께 읽으면 좋은 묵상" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-card-gap">
            {relatedQt.map((post) => (
              <QtCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* Related Curation */}
      {relatedCuration.length > 0 && (
        <section>
          <SectionHeader title="관련 큐레이션" href="/curation" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-card-gap">
            {relatedCuration.map((cur) => (
              <Link
                key={cur.slug}
                href={`/curation/${cur.slug}`}
                className="group flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-surface-2 transition-colors"
              >
                <div className="w-20 h-28 rounded-lg bg-surface-2 overflow-hidden shrink-0">
                  <Image
                    src={cur.coverImage}
                    alt={cur.title}
                    width={80}
                    height={112}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-serif text-h3 text-foreground group-hover:text-accent transition-colors">
                    {cur.title}
                  </p>
                  <p className="text-meta text-foreground-muted mt-1 line-clamp-2">
                    {cur.summary}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Related Shop — subtle, collapsible on mobile */}
      {relatedShop && (
        <section>
          <details className="group">
            <summary className="cursor-pointer text-meta text-foreground-subtle hover:text-foreground transition-colors list-none flex items-center gap-2">
              <span className="text-xs font-medium tracking-wider uppercase">
                이 묵상과 어울리는 굿즈
              </span>
              <span className="text-xs opacity-50 group-open:rotate-180 transition-transform">
                ▼
              </span>
            </summary>
            <div className="mt-3">
              <Link
                href={`/shop/${relatedShop.slug}`}
                className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-shop-soft transition-colors max-w-sm"
              >
                <div className="w-16 h-16 rounded-lg bg-surface-2 overflow-hidden shrink-0">
                  <Image
                    src={relatedShop.thumbnail}
                    alt={relatedShop.name}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm text-foreground">{relatedShop.name}</p>
                  <p className="text-meta text-foreground-subtle mt-0.5">
                    {formatPrice(relatedShop.price)}
                  </p>
                </div>
              </Link>
            </div>
          </details>
        </section>
      )}
    </div>
  )
}
