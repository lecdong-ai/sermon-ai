import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Container } from '@/components/layout/Container'
import { SectionHeader } from '@/components/common/SectionHeader'
import { SeasonBadge } from '@/components/common/SeasonBadge'
import { FreeBadge } from '@/components/common/FreeBadge'
import { Badge } from '@/components/ui/badge'
import { QtCard } from '@/components/qt/QtCard'
import { TemplateCard } from '@/components/template/TemplateCard'
import { ShopCard } from '@/components/shop/ShopCard'
import { CurationCard } from '@/components/curation/CurationCard'
import {
  getCurationDetail,
  getAllCurationSlugs,
} from '@/lib/data/curation'
import { formatDate } from '@/lib/utils/format'

export async function generateStaticParams() {
  const slugs = await getAllCurationSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const detail = await getCurationDetail(params.slug)
  if (!detail) return { title: '찾을 수 없음' }
  return {
    title: `${detail.title} — 큐레이션`,
    description: detail.summary,
  }
}

export default async function CurationDetailPage({
  params,
}: {
  params: { slug: string }
}) {
  const detail = await getCurationDetail(params.slug)
  if (!detail) notFound()

  return (
    <Container className="py-10 sm:py-14">
      <Link
        href="/curation"
        className="inline-flex items-center gap-1.5 text-meta text-foreground-muted hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        큐레이션 목록
      </Link>

      <article className="max-w-content mx-auto space-y-8">
        <header className="space-y-3">
          {detail.season && <SeasonBadge season={detail.season} />}
          <h1 className="font-serif text-display text-foreground leading-tight">
            {detail.title}
          </h1>
          <p className="text-body-lg text-foreground-muted leading-relaxed">
            {detail.summary}
          </p>
          <div className="flex items-center gap-3 text-meta text-foreground-subtle">
            <span>{detail.editorName}</span>
            <span>·</span>
            <span>{formatDate(detail.publishedAt)}</span>
          </div>
        </header>

        <div className="p-6 rounded-xl bg-surface-2 border border-border/50">
          <p className="text-body text-foreground leading-relaxed">
            {detail.editorialIntro}
          </p>
          {detail.editorNote && (
            <p className="text-meta text-foreground-muted mt-3">
              — {detail.editorNote}
            </p>
          )}
        </div>
      </article>

      <div className="max-w-list mx-auto mt-14 space-y-14">
        {detail.qtPosts.length > 0 && (
          <section>
            <SectionHeader title="함께 읽으면 좋은 묵상" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-card-gap">
              {detail.qtPosts.map((post) => (
                <QtCard key={post.id} post={post} />
              ))}
            </div>
          </section>
        )}

        {detail.templates.length > 0 && (
          <section>
            <SectionHeader title="추천 템플릿" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-card-gap">
              {detail.templates.map((t) => (
                <TemplateCard key={t.id} template={t} />
              ))}
            </div>
          </section>
        )}

        {detail.shopProducts.length > 0 && (
          <section>
            <SectionHeader title="어울리는 굿즈" />
            <div className="space-y-4">
              {detail.shopProducts.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-4 rounded-lg border border-border/50"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground-muted mb-2">
                      {item.reason}
                    </p>
                    <ShopCard product={item.product} variant="mini" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {detail.relatedCurations.length > 0 && (
          <section>
            <SectionHeader title="다른 큐레이션" href="/curation" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-card-gap">
              {detail.relatedCurations.map((c) => (
                <CurationCard key={c.id} curation={c} />
              ))}
            </div>
          </section>
        )}
      </div>
    </Container>
  )
}
