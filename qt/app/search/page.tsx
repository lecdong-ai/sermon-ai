import type { Metadata } from 'next'
import Link from 'next/link'
import { Search, BookOpen, Filter } from 'lucide-react'
import { Container } from '@/components/layout/Container'

export const metadata: Metadata = {
  title: '검색',
  description: '큐티 자료와 템플릿을 검색합니다.',
}

export default function SearchPage() {
  return (
    <Container className="py-10 sm:py-14">
      <div className="max-w-content mx-auto space-y-8">
        <header className="text-center space-y-3">
          <Search className="w-8 h-8 text-foreground-subtle mx-auto" />
          <h1 className="font-serif text-h1 text-foreground">검색</h1>
          <p className="text-body text-foreground-muted">
            각 섹션에서 검색하거나, 원하는 자료를 찾아보세요.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/qt"
            className="flex items-center gap-4 p-5 rounded-xl bg-surface border border-border hover:border-accent/30 transition-colors group"
          >
            <BookOpen className="w-6 h-6 text-foreground-subtle shrink-0" />
            <div>
              <p className="text-sm text-foreground font-medium group-hover:text-accent transition-colors">
                큐티 자료 검색
              </p>
              <p className="text-meta text-foreground-subtle">
                절기, 태그, 제목으로 검색
              </p>
            </div>
          </Link>
          <Link
            href="/templates"
            className="flex items-center gap-4 p-5 rounded-xl bg-surface border border-border hover:border-accent/30 transition-colors group"
          >
            <Filter className="w-6 h-6 text-foreground-subtle shrink-0" />
            <div>
              <p className="text-sm text-foreground font-medium group-hover:text-accent transition-colors">
                템플릿 찾기
              </p>
              <p className="text-meta text-foreground-subtle">
                카테고리별 탐색
              </p>
            </div>
          </Link>
        </div>

        <p className="text-center text-meta text-foreground-subtle">
          통합 검색 기능은 준비 중입니다.
        </p>
      </div>
    </Container>
  )
}
