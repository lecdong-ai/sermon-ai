import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Mail } from 'lucide-react'

export function NewsletterSection() {
  return (
    <section className="py-section-y bg-gradient-to-br from-foreground to-[#2A221C] text-background">
      <Container maxWidth="content" className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
            <Mail className="w-6 h-6" />
          </div>
        </div>
        <h2 className="font-serif text-h1 sm:text-display text-balance tracking-tight">
          업데이트 소식을 받아보세요
        </h2>
        <p className="text-body leading-relaxed text-white/70 max-w-sm mx-auto">
          새 큐티 자료, 템플릿, 큐레이션 소식을
          가장 먼저 알려드립니다.
        </p>
        <div className="space-y-3 pt-2">
          <p className="text-meta text-white/50">
            알림 서비스는 준비 중입니다
          </p>
          <Button
            variant="outline"
            size="lg"
            className="border-white/20 text-white hover:bg-white/10 hover:text-white"
            asChild
          >
            <Link href="/qt">지금 새 큐티 보기</Link>
          </Button>
        </div>
      </Container>
    </section>
  )
}
