import type { Metadata } from 'next'
import { Container } from '@/components/layout/Container'
import { SupportBanner } from '@/components/shop/SupportBanner'
import { ShopCategoryFilter } from '@/components/shop/ShopCategoryFilter'
import { ShopCard } from '@/components/shop/ShopCard'
import { getShopProducts } from '@/lib/data/shop'
import type { ShopCategory } from '@/types'

export const metadata: Metadata = {
  title: '후원샵',
  description:
    '쇼핑이 후원입니다. 이곳의 모든 상품은 무료 묵상 자료를 지키는 후원입니다.',
}

export default async function ShopListPage({
  searchParams,
}: {
  searchParams: { category?: string }
}) {
  const category = searchParams.category as ShopCategory | undefined
  const products = await getShopProducts({ category })

  return (
    <Container className="py-10 sm:py-14">
      <div className="space-y-8">
        <header className="space-y-2">
          <h1 className="font-serif text-h1 text-foreground">후원샵</h1>
          <p className="text-body text-foreground-muted">
            쇼핑이 후원입니다. 모든 수익은 무료 큐티 자료를 지키는 데 쓰입니다.
          </p>
        </header>

        <SupportBanner variant="inline" />
        <ShopCategoryFilter currentCategory={searchParams.category} />

        {products.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <p className="text-body text-foreground-muted">
              해당 카테고리의 상품이 없습니다.
            </p>
            <a
              href="/shop"
              className="text-meta text-accent hover:underline inline-block"
            >
              전체 상품 보기
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-card-gap">
            {products.map((p) => (
              <ShopCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </Container>
  )
}
