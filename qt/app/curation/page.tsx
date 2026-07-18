import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/layout/Container'
import { CurationCard } from '@/components/curation/CurationCard'
import { getCurations } from '@/lib/data/curation'

export const metadata: Metadata = {
  title: '큐레이션',
  description: '주제별로 엄선된 큐티 자료와 노션 템플릿 모음.',
}

export default async function CurationListPage() {
  const curations = await getCurations()

  return (
    <Container className="py-10 sm:py-14">
      <div className="space-y-8">
        <header className="space-y-2">
          <h1 className="font-serif text-h1 text-foreground">큐레이션</h1>
          <p className="text-body text-foreground-muted">
            주제와 절기별로 엄선된 큐티 자료와 템플릿을 모았습니다.
          </p>
        </header>

        {curations.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <p className="text-body text-foreground-muted">
              아직 큐레이션이 없습니다.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-card-gap">
            {curations.map((c) => (
              <CurationCard key={c.id} curation={c} />
            ))}
          </div>
        )}
      </div>
    </Container>
  )
}
