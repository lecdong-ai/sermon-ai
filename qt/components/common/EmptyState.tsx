import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    href: string
  }
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-20 text-center space-y-3',
        className
      )}
      role="status"
    >
      {icon && (
        <div className="text-foreground-subtle/50 mb-2">{icon}</div>
      )}
      <p className="text-body text-foreground-muted">{title}</p>
      {description && (
        <p className="text-meta text-foreground-subtle max-w-xs">
          {description}
        </p>
      )}
      {action && (
        <Link
          href={action.href}
          className="text-meta text-accent hover:underline inline-block pt-2"
        >
          {action.label}
        </Link>
      )}
    </div>
  )
}
