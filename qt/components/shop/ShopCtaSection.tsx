import Link from 'next/link'
import { Heart, ExternalLink, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils/format'
import type { SupportMessage } from '@/types'

interface ShopCtaSectionProps {
  purchaseUrl: string
  price: number
  slug: string
  supportMessage: SupportMessage
}

export function ShopCtaSection({
  purchaseUrl,
  price,
  slug,
  supportMessage,
}: ShopCtaSectionProps) {
  return (
    <div className="p-6 sm:p-8 rounded-2xl bg-surface-2 border border-border/50 space-y-5">
      <div className="flex items-baseline gap-2">
        <span className="font-serif text-h2 text-foreground">
          {formatPrice(price)}
        </span>
        <span className="text-meta text-foreground-subtle">· 후원 가격</span>
      </div>

      <Button
        variant="outline"
        size="lg"
        className="w-full"
        asChild
      >
        <a href={purchaseUrl} target="_blank" rel="noopener noreferrer">
          후원하고 받기
          <ExternalLink className="w-4 h-4 ml-2" />
        </a>
      </Button>

      <div className="space-y-3 pt-2">
        <div className="flex items-start gap-3">
          <Heart className="w-4 h-4 text-shop shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-foreground font-medium">
              {supportMessage.slogan}
            </p>
            <p className="text-meta text-foreground-subtle leading-relaxed mt-0.5">
              {supportMessage.description}
            </p>
          </div>
        </div>

        {supportMessage.detailLink && (
          <Link
            href={supportMessage.detailLink}
            className="inline-flex items-center gap-1 text-meta text-accent hover:underline"
          >
            후원이 어떻게 쓰이나요?
            <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>
    </div>
  )
}
