import Link from 'next/link'
import { Heart } from 'lucide-react'
import { Container } from '@/components/layout/Container'

interface SupportBannerProps {
  variant?: 'default' | 'inline'
}

export function SupportBanner({ variant = 'default' }: SupportBannerProps) {
  if (variant === 'inline') {
    return (
      <Link
        href="/shop/about"
        className="flex items-center gap-3 p-4 rounded-lg bg-surface-2 border border-border hover:bg-surface-muted transition-colors group"
      >
        <Heart className="w-5 h-5 text-shop shrink-0" />
        <div className="min-w-0">
          <p className="text-sm text-foreground font-medium">쇼핑이 후원입니다</p>
          <p className="text-meta text-foreground-subtle">
            후원이 어떻게 쓰이나요?
          </p>
        </div>
      </Link>
    )
  }

  return (
    <div className="rounded-xl bg-shop-soft border border-shop/20 p-6 sm:p-8 space-y-3">
      <h3 className="font-serif text-h3 text-foreground">
        쇼핑이 후원입니다
      </h3>
      <p className="text-body text-foreground-muted leading-relaxed max-w-lg">
        이곳의 모든 수익은 무료 큐티 자료와 노션 템플릿을
        지속하는 데 쓰입니다. 사지 않아도 모든 자료는 무료로 열려 있습니다.
      </p>
      <Link
        href="/shop/about"
        className="inline-flex items-center gap-1 text-meta text-accent hover:underline"
      >
        후원에 대해 더 알아보기
      </Link>
    </div>
  )
}
