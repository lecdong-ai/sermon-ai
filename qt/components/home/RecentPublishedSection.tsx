import Link from 'next/link'
import { Container } from '@/components/layout/Container'
import { SectionHeader } from '@/components/common/SectionHeader'
import { getLatestPublishedQts } from '@/lib/data/generated-qt'

export async function RecentPublishedSection() {
  const { items } = await getLatestPublishedQts(3)
  if (items.length === 0) return null

  return (
    <section className="py-section-y">
      <Container>
        <SectionHeader
          title="생성된 QT"
          href="/qt/published"
          description="큐티 생성기로 만든 소책자"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-card-gap">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/qt/published/${item.id}`}
              className="group block bg-surface rounded-xl border border-border hover:border-accent/30 transition-all p-5 space-y-3 hover:shadow-card-hover"
            >
              <h3 className="font-serif text-h3 text-foreground group-hover:text-accent transition-colors line-clamp-2">
                {item.title || item.series_name}
              </h3>
              <div className="flex flex-wrap gap-2 text-meta text-foreground-subtle">
                <span className="px-2 py-0.5 rounded-md bg-surface-2 text-foreground-muted">
                  {item.bible_book} {item.week_number}주차
                </span>
                {item.start_passage && (
                  <span>{item.start_passage}{item.end_passage ? ` ~ ${item.end_passage}` : ''}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  )
}
