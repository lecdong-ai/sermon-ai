import Link from 'next/link'
import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'

export function ShopBanner() {
  return (
    <section className="py-section-y">
      <Container maxWidth="content">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface-2 to-surface border border-border/70 p-8 sm:p-12 text-center space-y-5 shadow-card">
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-full bg-shop-soft flex items-center justify-center">
              <Heart className="w-6 h-6 text-shop" />
            </div>
          </div>
          <h2 className="font-serif text-h1 sm:text-display text-foreground tracking-tight">
            쇼핑이 후원입니다
          </h2>
          <p className="text-body text-foreground-muted leading-relaxed max-w-sm mx-auto">
            모든 큐티 자료와 템플릿은 무료로 제공됩니다.
            이곳의 상품은 무료 묵상을 지키는 작은 후원입니다.
          </p>
          <div className="pt-2">
            <Button variant="outline" size="lg" asChild>
              <Link href="/shop">후원샵 둘러보기</Link>
            </Button>
          </div>
          <p className="text-meta text-foreground-subtle/60">
            사지 않아도 괜찮습니다. 모든 자료는 무료입니다.
          </p>
        </div>
      </Container>
    </section>
  )
}
