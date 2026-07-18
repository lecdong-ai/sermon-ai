import { Container } from '@/components/layout/Container'
import { SectionHeader } from '@/components/common/SectionHeader'
import { TemplateCard } from '@/components/template/TemplateCard'
import type { Template } from '@/types'

interface PopularTemplatesProps {
  templates: Template[]
}

export function PopularTemplates({ templates }: PopularTemplatesProps) {
  if (templates.length === 0) return null

  return (
    <section className="py-section-y">
      <Container>
        <SectionHeader
          title="인기 노션 템플릿"
          href="/templates"
          description="가장 많은 분들이 사용하는 템플릿입니다"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-card-gap">
          {templates.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      </Container>
    </section>
  )
}
