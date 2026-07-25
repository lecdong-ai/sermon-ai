import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Container } from '@/components/layout/Container'
import { QtDetailHeader } from '@/components/qt/QtDetailHeader'
import { BibleQuoteBlock } from '@/components/qt/BibleQuoteBlock'
import { MarkdownRenderer } from '@/components/qt/MarkdownRenderer'
import { StickyActionBar } from '@/components/qt/StickyActionBar'
import { SeriesNav } from '@/components/qt/SeriesNav'
import { RelatedContent } from '@/components/qt/RelatedContent'
import { getQtPostDetail, getRelatedQt, getAllQtSlugs } from '@/lib/data/qt'
import { ArrowLeft } from 'lucide-react'

// 빌드 시점에 없던 새 큐티도 런타임에 동적 렌더링 허용
export const dynamicParams = true

export async function generateStaticParams() {
  const slugs = await getAllQtSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const decodedSlug = decodeURIComponent(params.slug)
  const post = await getQtPostDetail(decodedSlug)
  if (!post) return { title: '찾을 수 없음' }
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
    },
  }
}

export default async function QtDetailPage({
  params,
}: {
  params: { slug: string }
}) {
  const decodedSlug = decodeURIComponent(params.slug)
  const post = await getQtPostDetail(decodedSlug)
  if (!post) notFound()

  return (
    <>
      {/* Back navigation */}
      <div className="border-b border-border/40 bg-surface/60 backdrop-blur-sm">
        <Container>
          <div className="py-3">
            <Link
              href="/qt"
              className="inline-flex items-center gap-2 text-sm text-foreground-subtle hover:text-accent transition-colors duration-300 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-300" />
              큐티 아카이브로 돌아가기
            </Link>
          </div>
        </Container>
      </div>

      {/* Main content */}
      <Container className="py-12 sm:py-16 lg:py-20">
        <article className="max-w-[680px] mx-auto">
          {/* Header */}
          <QtDetailHeader post={post} />

          {/* Key verse - elegant display */}
          {post.keyVerse && (
            <div className="flex items-center justify-center gap-3 mb-10 py-4">
              <div className="w-6 h-px bg-accent/30" />
              <p className="text-sm font-serif text-accent tracking-wider font-medium">
                오늘의 말씀 · {post.keyVerse}
              </p>
              <div className="w-6 h-px bg-accent/30" />
            </div>
          )}

          {/* Bible quote */}
          {post.bibleText && (
            <BibleQuoteBlock text={post.bibleText} reference={post.bibleRange} />
          )}

          {/* Content */}
          <MarkdownRenderer content={post.content} />

          {/* Key verse callout at end */}
          {post.keyVerse && (
            <div className="mt-16 mb-12 relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent/8 via-accent/4 to-transparent" />
              <div className="relative px-8 py-10 rounded-2xl border border-accent/15 text-center">
                <div className="w-8 h-8 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
                  <span className="text-accent text-sm">✦</span>
                </div>
                <p className="text-xs font-medium tracking-[0.2em] uppercase text-accent/70 mb-3">
                  기억할 말씀
                </p>
                <p className="font-serif text-xl sm:text-2xl text-foreground leading-relaxed">
                  {post.keyVerse}
                </p>
              </div>
            </div>
          )}

          {/* Series navigation */}
          {post.series && post.series.posts.length > 1 && (
            <SeriesNav series={post.series} currentSlug={decodedSlug} />
          )}
        </article>

        {/* Related content - wider layout */}
        <div className="max-w-[880px] mx-auto">
          <RelatedContent
            relatedQt={post.relatedQt}
            relatedCuration={post.relatedCuration}
            relatedShop={post.relatedShop}
          />
        </div>
      </Container>

      {/* Sticky action bar */}
      <StickyActionBar downloads={post.downloads} slug={decodedSlug} />
    </>
  )
}
