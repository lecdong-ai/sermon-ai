import { Container } from '@/components/layout/Container'
import { SectionHeader } from '@/components/common/SectionHeader'
import { QtCard } from '@/components/qt/QtCard'
import type { QtPost } from '@/types'

interface TodayQtProps {
  posts: QtPost[]
}

export function TodayQt({ posts }: TodayQtProps) {
  if (posts.length === 0) return null

  return (
    <section className="py-section-y">
      <Container>
        <SectionHeader title="오늘의 묵상" href="/qt" description="매일 새로운 큐티로 시작하는 아침" />
        <div className="max-w-lg mx-auto">
          <div className="ring-1 ring-accent-muted/30 rounded-lg shadow-card">
            <QtCard post={posts[0]} variant="large" />
          </div>
        </div>
      </Container>
    </section>
  )
}
