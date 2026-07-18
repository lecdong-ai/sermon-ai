import { Button } from '@/components/ui/button'
import { Container } from '@/components/layout/Container'
import Link from 'next/link'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-accent-soft/30 via-transparent to-transparent pointer-events-none" />
      <Container maxWidth="content" className="relative py-24 sm:py-32 lg:py-40 text-center space-y-6 animate-fade-in-up">
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-accent-soft/60 text-accent text-meta font-medium">
          무료 큐티 자료 · 무료 노션 템플릿
        </div>
        <h1 className="font-serif text-display sm:text-[2.75rem] lg:text-[3rem] text-foreground text-balance leading-[1.15] tracking-tight">
          매일의 묵상을 위한
          <br />
          <span className="text-accent">작은 서재</span>
        </h1>
        <p className="text-body-lg sm:text-xl text-foreground-muted text-balance max-w-lg mx-auto leading-relaxed">
          큐티 자료와 노션 템플릿을 무료로 모았습니다.
          후원은 마음이 향할 때, 자연스럽게.
        </p>
        <div className="flex items-center justify-center gap-3 pt-6">
          <Button size="xl" asChild>
            <Link href="/qt">오늘의 묵상 보기</Link>
          </Button>
          <Button variant="outline" size="xl" asChild>
            <Link href="/templates">템플릿 보기</Link>
          </Button>
        </div>
      </Container>
    </section>
  )
}
