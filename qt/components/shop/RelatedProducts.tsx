import { ShopCard } from '@/components/shop/ShopCard'
import { SectionHeader } from '@/components/common/SectionHeader'
import type { ShopProduct } from '@/types'

interface RelatedProductsProps {
  products: ShopProduct[]
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  if (products.length === 0) return null

  return (
    <section>
      <SectionHeader title="같이 보면 좋은 굿즈" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-card-gap">
        {products.map((p) => (
          <ShopCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  )
}
