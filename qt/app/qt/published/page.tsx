import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/layout/Container'
import { getPublishedQts } from '@/lib/data/generated-qt'

export const metadata: Metadata = {
  title: '생성된 QT 모음',
  description: '큐티 생성기로 만들어진 QT 소책자들을 모아보세요.',
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

export default async function PublishedQtListPage({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
  const page = searchParams.page ? Number(searchParams.page) : 1
  const { items, total } = await getPublishedQts({ limit: 20, page })

  return (
    <Container className="py-10 sm:py-14">
      <div className="space-y-8">
        <header className="space-y-2">
          <h1 className="font-serif text-h1 text-foreground">생성된 QT</h1>
          <p className="text-body text-foreground-muted">
            큐티 생성기로 제작된 소책자들을 아카이브에서 만나보세요.
          </p>
        </header>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-foreground-subtle text-body">
              아직 공개된 QT가 없습니다.
            </p>
            <p className="text-foreground-subtle text-meta mt-2">
              메인 페이지의 큐티 생성기에서 QT를 만들고 아카이브에 공개해보세요.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-card-gap">
            {items.map((item) => (
              <Link
                key={item.id}
                href={`/qt/published/${item.id}`}
                className="group block bg-surface rounded-xl border border-border hover:border-accent/30 transition-all p-5 space-y-3 hover:shadow-card-hover"
              >
                <div className="space-y-1">
                  <h3 className="font-serif text-h3 text-foreground group-hover:text-accent transition-colors line-clamp-2">
                    {item.title || item.series_name}
                  </h3>
                  {item.subtitle && (
                    <p className="text-meta text-foreground-subtle line-clamp-1">
                      {item.subtitle}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 text-meta text-foreground-subtle">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-2 text-foreground-muted">
                    {item.bible_book} {item.week_number}주차
                  </span>
                  {item.start_passage && (
                    <span className="text-foreground-subtle">
                      {item.start_passage}{item.end_passage ? ` ~ ${item.end_passage}` : ''}
                    </span>
                  )}
                </div>

                <p className="text-meta text-foreground-subtle">
                  {formatDate(item.created_at)}
                </p>
              </Link>
            ))}
          </div>
        )}

        {total > 20 && (
          <div className="flex justify-center gap-2 pt-4">
            {page > 1 && (
              <Link
                href={`/qt/published?page=${page - 1}`}
                className="px-4 py-2 rounded-lg border border-border text-foreground-muted hover:text-foreground hover:border-border-strong transition-all text-meta"
              >
                이전
              </Link>
            )}
            {page * 20 < total && (
              <Link
                href={`/qt/published?page=${page + 1}`}
                className="px-4 py-2 rounded-lg border border-border text-foreground-muted hover:text-foreground hover:border-border-strong transition-all text-meta"
              >
                다음
              </Link>
            )}
          </div>
        )}
      </div>
    </Container>
  )
}
