import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { ArrowRight } from 'lucide-react'

interface SectionHeaderProps {
  title: string
  description?: string
  href?: string
  linkLabel?: string
  as?: 'h1' | 'h2' | 'h3'
  className?: string
}

export function SectionHeader({
  title,
  description,
  href,
  linkLabel = '전체 보기',
  as: Tag = 'h2',
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn('flex items-end justify-between gap-4 mb-6', className)}>
      <div className="space-y-1.5">
        <Tag className="font-serif text-h2 text-foreground tracking-tight">{title}</Tag>
        {description && (
          <p className="text-meta text-foreground-subtle max-w-md">{description}</p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="shrink-0 inline-flex items-center gap-1 text-meta text-foreground-muted hover:text-accent transition-colors duration-200 group"
        >
          <span>{linkLabel}</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  )
}
