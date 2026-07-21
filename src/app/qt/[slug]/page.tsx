import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Container } from '@/components/layout/Container'
import { QtDetailHeader } from '@/components/qt/QtDetailHeader'
import { BibleQuoteBlock } from '@/components/qt/BibleQuoteBlock'
import { MarkdownRenderer } from '@/components/qt/MarkdownRenderer'
import { StickyActionBar } from '@/components/qt/StickyActionBar'
import { SeriesNav } from '@/components/qt/SeriesNav'
import { RelatedContent } from '@/components/qt/RelatedContent'
import { getQtPostDetail, getRelatedQt, getAllQtSlugs } from '@/lib/data/qt'

export async function generateStaticParams() {
  const slugs = await getAllQtSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const post = await getQtPostDetail(params.slug)
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
  const post = await getQtPostDetail(params.slug)
  if (!post) notFound()

  return (
    <>
      <Container className="py-10 sm:py-14">
        <article className="max-w-content mx-auto">
          <QtDetailHeader post={post} />

          {/* Key verse */}
          {post.keyVerse && (
            <p className="text-meta text-accent mb-6 text-center">
              오늘의 말씀 · {post.keyVerse}
            </p>
          )}

          {/* Bible quote */}
          {post.bibleText && (
            <BibleQuoteBlock text={post.bibleText} reference={post.bibleRange} />
          )}

          {/* Content */}
          <MarkdownRenderer content={post.content} />

          {/* Key verse callout at end */}
          {post.keyVerse && (
            <div className="mt-10 p-4 rounded-lg bg-surface-2 text-center">
              <p className="text-meta text-foreground-subtle">기억할 말씀</p>
              <p className="font-serif text-h3 text-foreground mt-1">
                {post.keyVerse}
              </p>
            </div>
          )}

          {/* Series navigation */}
          {post.series && post.series.posts.length > 1 && (
            <SeriesNav series={post.series} currentSlug={params.slug} />
          )}
        </article>

        {/* Related content */}
        <div className="max-w-list mx-auto">
          <RelatedContent
            relatedQt={post.relatedQt}
            relatedCuration={post.relatedCuration}
            relatedShop={post.relatedShop}
          />
        </div>
      </Container>

      {/* Sticky action bar */}
      <StickyActionBar downloads={post.downloads} slug={params.slug} />
    </>
  )
}
