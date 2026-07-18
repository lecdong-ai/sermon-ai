import Link from 'next/link'
import Image from 'next/image'
import type { Curation } from '@/types'
import { SeasonBadge } from '@/components/common/SeasonBadge'

interface CurationCardProps {
  curation: Curation
}

export function CurationCard({ curation }: CurationCardProps) {
  return (
    <Link
      href={`/curation/${curation.slug}`}
      className="group block bg-surface rounded-lg overflow-hidden transition-all duration-300 border border-border/60 shadow-card hover:shadow-card-hover hover:-translate-y-1"
    >
      <div className="aspect-[3/4] bg-surface-2 overflow-hidden">
        <Image
          src={curation.coverImage.src}
          alt={curation.coverImage.alt}
          width={curation.coverImage.width}
          height={curation.coverImage.height}
          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="p-5 space-y-2.5">
        {curation.season && <SeasonBadge season={curation.season} />}
        <h3 className="font-serif text-h3 text-foreground leading-snug group-hover:text-accent transition-colors duration-200">
          {curation.title}
        </h3>
        <p className="text-body text-foreground-muted line-clamp-2 leading-relaxed">
          {curation.summary}
        </p>
        <p className="text-meta text-foreground-subtle pt-1">
          큐티 {curation.counts.qt}
          {curation.counts.templates > 0 && ` · 템플릿 ${curation.counts.templates}`}
          {curation.counts.shop > 0 && ` · 굿즈 ${curation.counts.shop}`}
        </p>
      </div>
    </Link>
  )
}
