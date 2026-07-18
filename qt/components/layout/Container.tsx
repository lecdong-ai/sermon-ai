import { cn } from '@/lib/utils/cn'

interface ContainerProps {
  children: React.ReactNode
  className?: string
  as?: 'div' | 'section' | 'article'
  maxWidth?: 'content' | 'list' | 'wide'
}

export function Container({
  children,
  className,
  as: Tag = 'div',
  maxWidth = 'wide',
}: ContainerProps) {
  return (
    <Tag
      className={cn(
        'mx-auto w-full px-5 sm:px-6 lg:px-10',
        {
          'max-w-content': maxWidth === 'content',
          'max-w-list': maxWidth === 'list',
          'max-w-wide': maxWidth === 'wide',
        },
        className
      )}
    >
      {children}
    </Tag>
  )
}
