import Link from 'next/link'
import { Container } from '@/components/layout/Container'
import { siteConfig } from '@/config/site'

export function Footer() {
  return (
    <footer className="border-t border-border/60 mt-section-y bg-surface/80">
      <Container className="py-16 space-y-12">
        <div className="text-center space-y-4">
          <p className="font-serif text-h2 text-foreground leading-tight">
            {siteConfig.slogan}
          </p>
          <p className="text-meta text-foreground-subtle max-w-sm mx-auto leading-relaxed">
            사지 않아도 괜찮습니다. 모든 자료는 무료입니다.
            마음이 향할 때만, 후원이 함께합니다.
          </p>
        </div>

        <nav className="grid grid-cols-2 md:grid-cols-3 gap-8 justify-items-center max-w-list mx-auto" aria-label="하단 네비게이션">
          <div className="space-y-3 text-center md:text-left">
            <p className="text-caption text-foreground-subtle font-medium tracking-wider uppercase">
              탐색
            </p>
            <div className="space-y-2">
              <Link href="/qt" className="block text-sm text-foreground-muted hover:text-foreground transition-colors duration-200">
                큐티 자료
              </Link>
              <Link href="/qt/templates" className="block text-sm text-foreground-muted hover:text-foreground transition-colors duration-200">
                노션 템플릿
              </Link>
              <Link href="/qt/published" className="block text-sm text-foreground-muted hover:text-foreground transition-colors duration-200">
                QT 모음집
              </Link>
            </div>
          </div>

          <div className="space-y-3 text-center md:text-left">
            <p className="text-caption text-foreground-subtle font-medium tracking-wider uppercase">
              후원
            </p>
            <div className="space-y-2">
              <Link href="/qt/shop" className="block text-sm text-foreground-muted hover:text-foreground transition-colors duration-200">
                후원 스토어
              </Link>
              <Link href="/qt/shop#donate" className="block text-sm text-foreground-muted hover:text-foreground transition-colors duration-200">
                자발적 후원
              </Link>
            </div>
          </div>

          <div className="space-y-3 text-center md:text-left">
            <p className="text-caption text-foreground-subtle font-medium tracking-wider uppercase">
              소개 & 관리
            </p>
            <div className="space-y-2">
              <Link href="/qt/about" className="block text-sm text-foreground-muted hover:text-foreground transition-colors duration-200">
                큐티 아카이브 소개
              </Link>
              <Link href="/qt/admin" className="block text-sm text-foreground-muted hover:text-foreground transition-colors duration-200">
                큐티 관리자
              </Link>
            </div>
          </div>
        </nav>

        <div className="text-center text-caption text-foreground-subtle/50">
          &copy; {new Date().getFullYear()} {siteConfig.name}. 모든 큐티 자료와 템플릿은 무료입니다.
        </div>
      </Container>
    </footer>
  )
}
