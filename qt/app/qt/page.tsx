import type { Metadata } from 'next'
import { Container } from '@/components/layout/Container'
import { FreeBadge } from '@/components/common/FreeBadge'
import { QtFilterBar } from '@/components/qt/QtFilterBar'
import { QtListPageContent } from '@/components/qt/QtListPageContent'
import { getQtPosts } from '@/lib/data/qt'
import type { QtQueryParams } from '@/types'

export const metadata: Metadata = {
  title: '큐티 자료',
  description: '무료 큐티 자료 아카이브. 절기, 성경 본문, 태그별로 탐색하세요.',
}

export default async function QtListPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined }
}) {
  const params: QtQueryParams = {
    season: searchParams.season as QtQueryParams['season'],
    tag: searchParams.tag,
    sort: (searchParams.sort as QtQueryParams['sort']) ?? 'latest',
    search: searchParams.search,
    page: searchParams.page ? Number(searchParams.page) : 1,
    pageSize: 12,
  }

  const { posts, total } = await getQtPosts(params)

  return (
    <Container className="py-10 sm:py-14">
      <div className="space-y-8">
        <header className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-h1 text-foreground">큐티 자료</h1>
            <FreeBadge />
          </div>
          <p className="text-body text-foreground-muted">
            모든 큐티 자료는 무료입니다. 절기, 태그, 성경 본문으로 탐색하세요.
          </p>
        </header>

        <QtFilterBar currentParams={params} />
        <QtListPageContent
          posts={posts}
          total={total}
          currentParams={params}
          pageSize={12}
        />
      </div>
    </Container>
  )
}
