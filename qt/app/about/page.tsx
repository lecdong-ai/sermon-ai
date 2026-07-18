import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/button'
import { siteConfig } from '@/config/site'

export const metadata: Metadata = {
  title: '소개',
  description: `${siteConfig.name} — 매일의 묵상을 위한 작은 서재입니다.`,
}

export default function AboutPage() {
  return (
    <Container className="py-10 sm:py-14">
      <div className="max-w-content mx-auto space-y-10">
        <header className="text-center space-y-4">
          <h1 className="font-serif text-display text-foreground">
            {siteConfig.name}
          </h1>
          <p className="text-body-lg text-foreground-muted leading-relaxed max-w-md mx-auto">
            매일의 묵상을 위한 작은 서재.
            큐티 자료와 노션 템플릿을 무료로 모은 아카이브입니다.
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="font-serif text-h2 text-foreground">시작하며</h2>
          <p className="text-body text-foreground leading-relaxed">
            이 사이트는 큐티(quiet time)를 기록하고 나누는 사람들을 위해
            만들어졌습니다. 큐티는 정해진 형식이 중요하지 않습니다.
            매일 말씀 앞에 앉는 그 자체가 중요합니다.
          </p>
          <p className="text-body text-foreground leading-relaxed">
            우리는 그 자리를 지키고자 합니다. 모든 큐티 자료는 무료입니다.
            모든 노션 템플릿은 무료입니다. 앞으로도 그럴 것입니다.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-serif text-h2 text-foreground">쇼핑이 후원입니다</h2>
          <p className="text-body text-foreground leading-relaxed">
            이 사이트는 후원으로 운영됩니다. 후원샵의 상품을 구매하시면,
            그 수익이 큐티 자료 제작과 사이트 운영에 사용됩니다.
          </p>
          <p className="text-body text-foreground leading-relaxed">
            사지 않아도 괜찮습니다. 모든 큐티 자료와 템플릿은 무료로
            열려 있습니다. 후원은 마음이 향할 때, 자연스럽게.
          </p>
          <div className="pt-2">
            <Button variant="outline" asChild>
              <Link href="/shop">후원샵 보기</Link>
            </Button>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-serif text-h2 text-foreground">연락</h2>
          <p className="text-body text-foreground leading-relaxed">
            문의나 제안이 있으시면 아래 메일로 연락해 주세요.
          </p>
          <a
            href={`mailto:${siteConfig.contact}`}
            className="text-body text-accent hover:underline"
          >
            {siteConfig.contact}
          </a>
        </section>
      </div>
    </Container>
  )
}
