import { Container } from '@/components/layout/Container'
import { SectionHeader } from '@/components/common/SectionHeader'
import { CurationCard } from '@/components/curation/CurationCard'
import type { Curation } from '@/types'

interface CurationSectionProps {
  curations: Curation[]
}

export function CurationSection({ curations }: CurationSectionProps) {
  if (curations.length === 0) return null

  return (
    <section className="py-section-y bg-surface-2/60">
      <Container>
        <SectionHeader title="큐레이션" href="/curation" description="주제와 절기별로 엄선한 묵상 모음" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-card-gap">
          {curations.map((curation) => (
            <CurationCard key={curation.id} curation={curation} />
          ))}
        </div>
      </Container>
    </section>
  )
}
