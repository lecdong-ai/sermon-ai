import { Container } from '@/components/layout/Container'
import { SectionHeader } from '@/components/common/SectionHeader'
import { QtCard } from '@/components/qt/QtCard'
import type { QtPost } from '@/types'

interface LatestContentProps {
  posts: QtPost[]
}

export function LatestContent({ posts }: LatestContentProps) {
  if (posts.length === 0) return null

  return (
    <section className="py-section-y bg-surface-2/60">
      <Container>
        <SectionHeader title="최신 묵상" href="/qt" description="가장 최근에 올라온 큐티 자료" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-card-gap">
          {posts.map((post) => (
            <QtCard key={post.id} post={post} />
          ))}
        </div>
      </Container>
    </section>
  )
}
