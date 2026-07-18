import Link from 'next/link'
import { SectionHeader } from '@/components/common/SectionHeader'

interface TemplateRelatedQtProps {
  qtPosts: Array<{
    slug: string
    title: string
    excerpt: string
  }>
}

export function TemplateRelatedQt({ qtPosts }: TemplateRelatedQtProps) {
  if (!qtPosts || qtPosts.length === 0) return null

  return (
    <section>
      <SectionHeader title="이 템플릿과 함께 읽으면 좋은 묵상" href="/qt" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {qtPosts.map((qt) => (
          <Link
            key={qt.slug}
            href={`/qt/${qt.slug}`}
            className="group p-4 rounded-lg border border-border hover:bg-surface-2 transition-colors space-y-1"
          >
            <p className="font-serif text-h3 text-foreground group-hover:text-accent transition-colors">
              {qt.title}
            </p>
            {qt.excerpt && (
              <p className="text-meta text-foreground-subtle">{qt.excerpt}</p>
            )}
          </Link>
        ))}
      </div>
    </section>
  )
}
