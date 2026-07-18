import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils/cn'
import type { ImageData } from '@/types'

type AspectRatio = '1:1' | '4:5' | '16:10' | 'auto'

interface ContentCardProps {
  href: string
  image?: ImageData
  aspectRatio?: AspectRatio
  badge?: React.ReactNode
  metadata?: React.ReactNode
  title: string
  description?: string
  footer?: React.ReactNode
  className?: string
  children?: React.ReactNode
}

const aspectClass: Record<AspectRatio, string> = {
  '1:1': 'aspect-square',
  '4:5': 'aspect-[4/5]',
  '16:10': 'aspect-[16/10]',
  auto: '',
}

export function ContentCard({
  href,
  image,
  aspectRatio = '4:5',
  badge,
  metadata,
  title,
  description,
  footer,
  className,
  children,
}: ContentCardProps) {
  return (
    <div
      className={cn(
        'group bg-surface rounded-lg overflow-hidden transition-all duration-300',
        'border border-border/60 shadow-card hover:shadow-card-hover hover:-translate-y-1',
        className
      )}
    >
      {image && (
        <Link href={href} className={cn('block bg-surface-2 overflow-hidden', aspectClass[aspectRatio])} tabIndex={-1}>
          <Image
            src={image.src}
            alt={image.alt}
            width={image.width ?? 600}
            height={image.height ?? 600}
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-[1.03]"
          />
        </Link>
      )}
      <div className="p-4 sm:p-5 space-y-2">
        {badge && <div>{badge}</div>}
        {metadata && (
          <div className="flex items-center gap-2 text-meta text-foreground-subtle">
            {metadata}
          </div>
        )}
        <Link href={href}>
          <h3 className="font-serif text-h3 leading-snug line-clamp-2 text-foreground group-hover:text-accent transition-colors duration-200">
            {title}
          </h3>
        </Link>
        {description && (
          <p className="text-body text-foreground-muted line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}
        {children}
        {footer && <div className="pt-2">{footer}</div>}
      </div>
    </div>
  )
}
