import { SectionHeader } from '@/components/common/SectionHeader'

interface RecommendationSectionProps {
  title: string
  href?: string
  children: React.ReactNode
  className?: string
}

/**
 * Wraps related/recommended content with a consistent section header.
 * Handles empty children by returning null.
 */
export function RecommendationSection({
  title,
  href,
  children,
  className,
}: RecommendationSectionProps) {
  const childrenArray = Array.isArray(children) ? children : [children]
  if (childrenArray.every((c) => c == null)) return null

  return (
    <section className={className}>
      <SectionHeader title={title} href={href} />
      {children}
    </section>
  )
}
