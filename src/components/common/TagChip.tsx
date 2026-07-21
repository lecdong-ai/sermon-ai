import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

interface TagChipProps {
  slug: string
  name: string
  variant?: 'default' | 'filter'
  active?: boolean
  onClick?: () => void
}

export function TagChip({
  slug,
  name,
  variant = 'default',
  active,
  onClick,
}: TagChipProps) {
  if (variant === 'filter') {
    return (
      <button
        onClick={onClick}
        className={cn(
          'px-3 py-1.5 rounded-full text-xs border transition-colors whitespace-nowrap',
          active
            ? 'bg-foreground text-background border-foreground'
            : 'border-border text-foreground-muted hover:border-accent hover:text-accent'
        )}
      >
        #{name}
      </button>
    )
  }

  return (
    <Link
      href={`/qt/tag/${slug}`}
      className="text-meta text-foreground-subtle hover:text-accent transition-colors"
    >
      #{name}
    </Link>
  )
}
