import { TemplateCard } from '@/components/template/TemplateCard'
import { SectionHeader } from '@/components/common/SectionHeader'
import type { Template } from '@/types'

interface RelatedTemplatesProps {
  templates: Template[]
}

export function RelatedTemplates({ templates }: RelatedTemplatesProps) {
  if (templates.length === 0) return null

  return (
    <section>
      <SectionHeader title="추천 템플릿" href="/templates" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-card-gap">
        {templates.map((t) => (
          <TemplateCard key={t.id} template={t} />
        ))}
      </div>
    </section>
  )
}
