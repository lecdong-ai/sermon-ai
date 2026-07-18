import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/button'
import { Heart, BookOpen, ShoppingBag, Handshake } from 'lucide-react'

export const metadata: Metadata = {
  title: '후원 안내',
  description: '쇼핑이 후원입니다. 이곳의 후원이 어떻게 사용되는지 알려드립니다.',
}

const supportSteps = [
  {
    icon: ShoppingBag,
    title: '굿즈를 구매합니다',
    description:
      '후원샵에서 마음에 드는 상품을 선택합니다. 사지 않아도 모든 자료는 무료입니다.',
  },
  {
    icon: Handshake,
    title: '수익이 후원이 됩니다',
    description:
      '상품 가격에서 제작비를 제외한 수익이 사이트 운영비와 무료 콘텐츠 제작비로 사용됩니다.',
  },
  {
    icon: BookOpen,
    title: '무료 자료가 지속됩니다',
    description:
      '여러분의 후원 덕분에 큐티 자료와 템플릿이 계속 무료로 제공됩니다.',
  },
]

export default function ShopAboutPage() {
  return (
    <Container className="py-10 sm:py-14">
      <div className="max-w-content mx-auto space-y-12">
        {/* Hero */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Heart className="w-10 h-10 text-shop" />
          </div>
          <h1 className="font-serif text-display text-foreground">
            쇼핑이 후원입니다
          </h1>
          <p className="text-body-lg text-foreground-muted leading-relaxed max-w-md mx-auto">
            이곳의 모든 큐티 자료와 노션 템플릿은 무료로 제공됩니다.
            상품 판매 수익으로 이 모든 것이 가능합니다.
          </p>
        </div>

        {/* How it works */}
        <div className="space-y-8">
          <h2 className="font-serif text-h2 text-foreground text-center">
            후원이 어떻게 이루어지나요
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {supportSteps.map((step, i) => {
              const Icon = step.icon
              return (
                <div
                  key={i}
                  className="text-center space-y-3 p-6 rounded-xl bg-surface-2 border border-border/50"
                >
                  <div className="flex justify-center">
                    <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center">
                      <Icon className="w-6 h-6 text-foreground" />
                    </div>
                  </div>
                  <p className="font-serif text-h3 text-foreground">
                    {step.title}
                  </p>
                  <p className="text-meta text-foreground-muted leading-relaxed">
                    {step.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Principles */}
        <div className="rounded-2xl bg-foreground text-background p-8 sm:p-10 space-y-5">
          <h2 className="font-serif text-h2">세 가지 약속</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <span className="text-accent font-bold shrink-0">01</span>
              <p className="text-body leading-relaxed">
                모든 큐티 자료는 무료입니다. 앞으로도 무료로 유지됩니다.
              </p>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-accent font-bold shrink-0">02</span>
              <p className="text-body leading-relaxed">
                모든 노션 템플릿은 무료입니다. 유료 전환 계획이 없습니다.
              </p>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-accent font-bold shrink-0">03</span>
              <p className="text-body leading-relaxed">
                후원은 강요하지 않습니다. 상품을 사지 않아도 모든 혜택은 동일합니다.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="space-y-5">
          <h2 className="font-serif text-h2 text-foreground text-center">
            자주 묻는 질문
          </h2>
          <div className="space-y-4">
            <details className="group rounded-lg border border-border p-4">
              <summary className="cursor-pointer text-sm font-medium text-foreground list-none flex items-center justify-between">
                큐티 자료가 유료로 전환될 가능성이 있나요?
                <span className="text-xs text-foreground-subtle group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-sm text-foreground-muted mt-3 leading-relaxed">
                없습니다. 큐티 자료와 노션 템플릿은 영원히 무료입니다.
                이것은 이 사이트의 핵심 정책이며, 변경되지 않습니다.
              </p>
            </details>
            <details className="group rounded-lg border border-border p-4">
              <summary className="cursor-pointer text-sm font-medium text-foreground list-none flex items-center justify-between">
                후원금은 정확히 어떻게 사용되나요?
                <span className="text-xs text-foreground-subtle group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-sm text-foreground-muted mt-3 leading-relaxed">
                서버 호스팅 비용, 큐티 자료 제작, 노션 템플릿 디자인,
                사이트 유지보수에 사용됩니다. 상세 내역은 필요시 공개할 예정입니다.
              </p>
            </details>
            <details className="group rounded-lg border border-border p-4">
              <summary className="cursor-pointer text-sm font-medium text-foreground list-none flex items-center justify-between">
                꼭 사야 하나요?
                <span className="text-xs text-foreground-subtle group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-sm text-foreground-muted mt-3 leading-relaxed">
                아닙니다. 모든 자료는 무료이며, 구매는 전적으로 자유입니다.
                사지 않아도 콘텐츠 이용에 전혀 제한이 없습니다.
              </p>
            </details>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center space-y-4 pt-4">
          <p className="font-serif text-h3 text-foreground">
            마음이 향할 때, 후원샵을 둘러보세요
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button variant="outline" size="lg" asChild>
              <Link href="/shop">후원샵 가기</Link>
            </Button>
            <Button variant="ghost" size="lg" asChild>
              <Link href="/qt">무료 묵상 보기</Link>
            </Button>
          </div>
        </div>
      </div>
    </Container>
  )
}
