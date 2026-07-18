import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ExternalLink, ArrowLeft } from 'lucide-react'
import { Container } from '@/components/layout/Container'
import { FreeBadge } from '@/components/common/FreeBadge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TemplateGallery } from '@/components/template/TemplateGallery'
import { TemplateUsageSteps } from '@/components/template/TemplateUsageSteps'
import { TemplateIncludedSections } from '@/components/template/TemplateIncludedSections'
import { RelatedTemplates } from '@/components/template/RelatedTemplates'
import { TemplateRelatedQt } from '@/components/template/TemplateRelatedQt'
import {
  getTemplateDetail,
  getAllTemplateSlugs,
} from '@/lib/data/template'
import { formatDate } from '@/lib/utils/format'

export async function generateStaticParams() {
  const slugs = await getAllTemplateSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const template = await getTemplateDetail(params.slug)
  if (!template) return { title: '찾을 수 없음' }
  return {
    title: `${template.title} — 무료 노션 템플릿`,
    description: template.description,
  }
}

export default async function TemplateDetailPage({
  params,
}: {
  params: { slug: string }
}) {
  const template = await getTemplateDetail(params.slug)
  if (!template) notFound()

  return (
    <Container className="py-10 sm:py-14">
      <article className="max-w-content mx-auto space-y-10">
        {/* Back link */}
        <Link
          href="/templates"
          className="inline-flex items-center gap-1.5 text-meta text-foreground-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          템플릿 목록
        </Link>

        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant="category">{template.category}</Badge>
            <FreeBadge />
            <span className="text-meta text-foreground-subtle">
              업데이트 {formatDate(template.updatedAt)}
            </span>
          </div>
          <h1 className="font-serif text-display sm:text-[2.25rem] text-foreground leading-tight">
            {template.title}
          </h1>
          <p className="text-body-lg text-foreground-muted leading-relaxed">
            {template.description}
          </p>
        </div>

        {/* Gallery */}
        <TemplateGallery images={template.galleryImages} />

        {/* Usage Steps */}
        {template.usageSteps.length > 0 && (
          <section className="space-y-5">
            <h2 className="font-serif text-h2 text-foreground">사용 방법</h2>
            <TemplateUsageSteps steps={template.usageSteps} />
          </section>
        )}

        {/* Included Sections */}
        {template.includedSections.length > 0 && (
          <section className="space-y-5">
            <h2 className="font-serif text-h2 text-foreground">포함 항목</h2>
            <TemplateIncludedSections sections={template.includedSections} />
          </section>
        )}

        {/* CTA Section */}
        <section className="p-8 rounded-2xl bg-surface-2 border border-border/50 text-center space-y-5">
          <div className="space-y-2">
            <p className="font-serif text-h1 text-foreground">무료로 시작하기</p>
            <p className="text-body text-foreground-muted leading-relaxed max-w-sm mx-auto">
              Notion 계정만 있으면 누구나 무료로 사용할 수 있습니다.
              복제 버튼 한 번으로 지금 바로 시작하세요.
            </p>
          </div>
          <div className="pt-2">
            <Button size="lg" asChild>
              <a
                href={template.notionDuplicateUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Notion에서 무료로 복제하기
                <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </Button>
          </div>
          <p className="text-meta text-foreground-subtle/70">
            모든 템플릿은 무료이며, 앞으로도 무료로 제공됩니다.
          </p>
        </section>
      </article>

      {/* Related Content */}
      <div className="max-w-list mx-auto mt-16 space-y-12">
        {template.relatedQt && template.relatedQt.length > 0 && (
          <TemplateRelatedQt qtPosts={template.relatedQt} />
        )}
        {template.recommendedTemplates.length > 0 && (
          <RelatedTemplates templates={template.recommendedTemplates} />
        )}
      </div>
    </Container>
  )
}
