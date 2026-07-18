import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Container } from '@/components/layout/Container'
import { getPublishedQt } from '@/lib/data/generated-qt'

interface Props {
  params: { id: string }
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

export default async function PublishedQtDetailPage({ params }: Props) {
  const qt = await getPublishedQt(params.id)

  if (!qt) {
    notFound()
  }

  const days = Array.isArray(qt.day_data) ? qt.day_data : []

  return (
    <Container className="py-10 sm:py-14">
      <div className="space-y-8 max-w-list mx-auto">
        <Link
          href="/qt/published"
          className="inline-flex items-center gap-1 text-meta text-foreground-subtle hover:text-accent transition-colors"
        >
          ← 생성된 QT 목록으로
        </Link>

        <header className="space-y-4 pb-6 border-b border-border">
          <h1 className="font-serif text-display text-foreground">
            {qt.title || qt.series_name}
          </h1>
          {qt.subtitle && (
            <p className="text-h3 text-foreground-muted">{qt.subtitle}</p>
          )}

          <div className="flex flex-wrap gap-3 text-meta">
            <span className="px-3 py-1 rounded-full bg-surface-2 text-foreground-muted">
              {qt.bible_book} {qt.week_number}주차
            </span>
            {qt.start_passage && (
              <span className="px-3 py-1 rounded-full bg-surface-2 text-foreground-muted">
                {qt.start_passage}{qt.end_passage ? ` ~ ${qt.end_passage}` : ''}
              </span>
            )}
            <span className="text-foreground-subtle px-3 py-1">
              {formatDate(qt.created_at)}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 text-meta text-foreground-subtle">
            <span>대상: {qt.audience}</span>
            <span>수준: {qt.level}</span>
            <span>톤: {qt.tone}</span>
          </div>
        </header>

        {days.length > 0 && (
          <div className="space-y-10">
            {days.map((day, idx) => (
              <article key={day.dayName || idx} className="space-y-4 pb-8 border-b border-border last:border-b-0">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center text-[13px] font-bold">
                    {idx + 1}
                  </span>
                  <div>
                    <h2 className="font-serif text-h2 text-foreground">
                      {day.title || `Day ${idx + 1}`}
                    </h2>
                    <p className="text-meta text-foreground-subtle">{day.passage}</p>
                  </div>
                </div>

                {day.focus && (
                  <div className="bg-accent-soft border-l-4 border-accent rounded-r-lg px-4 py-3">
                    <p className="text-meta font-bold text-accent mb-1">✨ 집중 포인트</p>
                    <p className="text-body text-foreground">{day.focus}</p>
                  </div>
                )}

                <div className="prose prose-sm max-w-none text-foreground leading-relaxed whitespace-pre-wrap font-serif">
                  {day.finalContent}
                </div>
              </article>
            ))}
          </div>
        )}

        {!days.length && qt.full_manuscript && (
          <div className="prose prose-sm max-w-none text-foreground leading-relaxed whitespace-pre-wrap font-serif">
            {qt.full_manuscript}
          </div>
        )}
      </div>
    </Container>
  )
}
