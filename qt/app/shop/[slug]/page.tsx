import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import { Container } from '@/components/layout/Container'
import { Badge } from '@/components/ui/badge'
import { ShopProductStory } from '@/components/shop/ShopProductStory'
import { ShopSpecs } from '@/components/shop/ShopSpecs'
import { ShopCtaSection } from '@/components/shop/ShopCtaSection'
import { RelatedProducts } from '@/components/shop/RelatedProducts'
import { ShopRelatedQt } from '@/components/shop/ShopRelatedQt'
import { getShopProductDetail, getShopProductSlugs } from '@/lib/data/shop'

export async function generateStaticParams() {
  const slugs = await getShopProductSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const product = await getShopProductDetail(params.slug)
  if (!product) return { title: '찾을 수 없음' }
  return {
    title: `${product.name} — 후원샵`,
    description: product.shortDescription,
  }
}

export default async function ShopDetailPage({
  params,
}: {
  params: { slug: string }
}) {
  const product = await getShopProductDetail(params.slug)
  if (!product) notFound()

  return (
    <Container className="py-10 sm:py-14">
      <Link
        href="/shop"
        className="inline-flex items-center gap-1.5 text-meta text-foreground-muted hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        후원샵 목록
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
        {/* Left: Gallery */}
        <div className="lg:col-span-3 space-y-4">
          <div className="aspect-square rounded-xl overflow-hidden bg-surface-2">
            <Image
              src={product.galleryImages[0].src}
              alt={product.galleryImages[0].alt}
              width={product.galleryImages[0].width}
              height={product.galleryImages[0].height}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          {product.galleryImages.length > 1 && (
            <div className="grid grid-cols-3 gap-3">
              {product.galleryImages.slice(1).map((img, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-lg overflow-hidden bg-surface-2"
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    width={img.width}
                    height={img.height}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info + CTA */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-3">
            <Badge variant="category">{product.category}</Badge>
            <h1 className="font-serif text-display sm:text-[2rem] text-foreground leading-tight">
              {product.name}
            </h1>
            <p className="text-body-lg text-foreground-muted leading-relaxed">
              {product.shortDescription}
            </p>
          </div>

          <ShopCtaSection
            purchaseUrl={product.purchaseUrl}
            price={product.price}
            slug={product.slug}
            supportMessage={product.supportMessage}
          />

          {product.specs.length > 0 && (
            <div className="rounded-xl border border-border p-5">
              <h3 className="text-sm font-medium text-foreground mb-3">
                상세 정보
              </h3>
              <ShopSpecs specs={product.specs} />
            </div>
          )}
        </div>
      </div>

      {/* Story section — full width, editorial tone */}
      {product.story && (
        <div className="max-w-content mx-auto mt-14 pt-10 border-t border-border">
          <h2 className="font-serif text-h2 text-foreground mb-6">
            이 상품이 만들어진 이유
          </h2>
          <ShopProductStory story={product.story} />
        </div>
      )}

      {/* Related content */}
      <div className="max-w-list mx-auto mt-16 space-y-12">
        {product.relatedQt && product.relatedQt.length > 0 && (
          <ShopRelatedQt posts={product.relatedQt} />
        )}
        {product.relatedProducts.length > 0 && (
          <RelatedProducts products={product.relatedProducts} />
        )}
      </div>
    </Container>
  )
}
