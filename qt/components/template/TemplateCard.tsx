import Image from 'next/image'
import Link from 'next/link'
import type { Template } from '@/types'
import { FreeBadge } from '@/components/common/FreeBadge'
import { Badge } from '@/components/ui/badge'
import { ExternalLink } from 'lucide-react'
import { formatNumber } from '@/lib/utils/format'

interface TemplateCardProps {
  template: Template
}

export function TemplateCard({ template }: TemplateCardProps) {
  return (
    <div className="group bg-surface rounded-lg overflow-hidden transition-all duration-300 border border-border/60 shadow-card hover:shadow-card-hover hover:-translate-y-1">
      <Link href={`/templates/${template.slug}`}>
        <div className="aspect-[16/10] bg-surface-2 overflow-hidden">
          <Image
            src={template.previewImage.src}
            alt={template.previewImage.alt}
            width={template.previewImage.width}
            height={template.previewImage.height}
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-[1.03]"
          />
        </div>
      </Link>
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <Badge variant="category">{template.category}</Badge>
          {template.downloadCount !== undefined && (
            <span className="text-caption text-foreground-subtle">
              다운로드 {formatNumber(template.downloadCount)}회
            </span>
          )}
        </div>
        <Link href={`/templates/${template.slug}`}>
          <h3 className="font-serif text-h3 text-foreground leading-snug group-hover:text-accent transition-colors duration-200">
            {template.title}
          </h3>
        </Link>
        <p className="text-body text-foreground-muted line-clamp-2 leading-relaxed">
          {template.description}
        </p>
        <div className="flex items-center justify-between pt-2">
          <FreeBadge />
          <a
            href={template.notionDuplicateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-meta text-accent hover:underline hover:text-accent/80 transition-colors duration-200"
          >
            Notion에서 열기
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  )
}
