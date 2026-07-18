import type { Metadata } from 'next'
import { Container } from '@/components/layout/Container'
import { FreeBadge } from '@/components/common/FreeBadge'
import { TemplateCategoryFilter } from '@/components/template/TemplateCategoryFilter'
import { TemplateCard } from '@/components/template/TemplateCard'
import { getTemplates } from '@/lib/data/template'
import type { TemplateCategory } from '@/types'

export const metadata: Metadata = {
  title: '무료 노션 템플릿',
  description:
    '묵상 기록, 가정 예배, 새벽 기도, 소그룹 나눔을 위한 무료 노션 템플릿.',
}

export default async function TemplatesListPage({
  searchParams,
}: {
  searchParams: { category?: string }
}) {
  const category = searchParams.category as TemplateCategory | undefined
  const templates = await getTemplates({ category })

  return (
    <Container className="py-10 sm:py-14">
      <div className="space-y-8">
        <header className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-h1 text-foreground">
              무료 노션 템플릿
            </h1>
            <FreeBadge />
          </div>
          <p className="text-body text-foreground-muted">
            큐티 묵상과 기록을 위한 노션 템플릿입니다. 모두 무료로 사용할 수 있습니다.
          </p>
        </header>

        <TemplateCategoryFilter currentCategory={searchParams.category} />

        {templates.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <p className="text-body text-foreground-muted">
              해당 카테고리의 템플릿이 없습니다.
            </p>
            <a
              href="/templates"
              className="text-meta text-accent hover:underline inline-block"
            >
              전체 템플릿 보기
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-card-gap">
            {templates.map((t) => (
              <TemplateCard key={t.id} template={t} />
            ))}
          </div>
        )}
      </div>
    </Container>
  )
}
