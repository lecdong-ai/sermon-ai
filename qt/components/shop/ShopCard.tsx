import Image from 'next/image'
import Link from 'next/link'
import type { ShopProduct } from '@/types'
import { formatPrice } from '@/lib/utils/format'
import { Button } from '@/components/ui/button'

interface ShopCardProps {
  product: ShopProduct
  variant?: 'default' | 'mini'
}

export function ShopCard({ product, variant = 'default' }: ShopCardProps) {
  if (variant === 'mini') {
    return (
      <Link
        href={`/shop/${product.slug}`}
        className="group flex gap-3 items-center p-3 rounded-lg border border-border/60 hover:bg-surface-2 transition-all duration-200 shadow-sm hover:shadow-card"
      >
        <div className="w-16 h-16 rounded-md bg-surface-2 overflow-hidden shrink-0 shadow-sm">
          <Image
            src={product.thumbnail.src}
            alt={product.thumbnail.alt}
            width={64}
            height={64}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-foreground truncate group-hover:text-accent transition-colors duration-200">
            {product.name}
          </p>
          <p className="text-xs text-foreground-subtle mt-0.5">
            {formatPrice(product.price)}
          </p>
        </div>
      </Link>
    )
  }

  return (
    <div className="group bg-surface rounded-lg overflow-hidden border border-border/60 transition-all duration-300 shadow-card hover:shadow-card-hover hover:-translate-y-1">
      <Link href={`/shop/${product.slug}`}>
        <div className="aspect-square bg-surface-2 overflow-hidden">
          <Image
            src={product.thumbnail.src}
            alt={product.thumbnail.alt}
            width={product.thumbnail.width}
            height={product.thumbnail.height}
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-[1.03]"
          />
        </div>
      </Link>
      <div className="p-4 space-y-2.5">
        <Link href={`/shop/${product.slug}`}>
          <h3 className="font-serif text-h3 text-foreground leading-snug group-hover:text-accent transition-colors duration-200">
            {product.name}
          </h3>
        </Link>
        <p className="text-meta text-foreground-subtle leading-relaxed">
          {product.shortDescription}
        </p>
        <p className="text-body font-medium text-foreground">{formatPrice(product.price)}</p>
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-1"
          asChild
        >
          <Link href={`/shop/${product.slug}`}>후원하고 받기</Link>
        </Button>
      </div>
    </div>
  )
}
