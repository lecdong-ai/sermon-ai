'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import { getGenerations, getGenerationLabel, type Generation } from '@/lib/data/generational-qt'

const GEN_COLORS: Record<Generation, { active: string; hover: string; dot: string }> = {
  '중고등': { active: 'bg-sky-50 text-sky-700 border-sky-200', hover: 'hover:text-sky-600', dot: 'bg-sky-500' },
  '청년': { active: 'bg-violet-50 text-violet-700 border-violet-200', hover: 'hover:text-violet-600', dot: 'bg-violet-500' },
  '장년': { active: 'bg-amber-50 text-amber-700 border-amber-200', hover: 'hover:text-amber-600', dot: 'bg-amber-500' },
}

export function GenerationTabs() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeGen = searchParams?.get('generation') as Generation | null

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => router.push('/qt/published')}
        className={cn(
          'px-4 py-2 rounded-full text-meta font-medium transition-all border',
          !activeGen
            ? 'bg-accent text-white border-accent shadow-sm shadow-accent/20'
            : 'bg-surface text-foreground-muted border-border hover:border-border-strong hover:text-foreground'
        )}
      >
        전체
      </button>
      {getGenerations().map((gen) => {
        const colors = GEN_COLORS[gen]
        const isActive = activeGen === gen
        return (
          <button
            key={gen}
            onClick={() => router.push(`/qt/published?generation=${gen}`)}
            className={cn(
              'px-4 py-2 rounded-full text-meta font-medium transition-all border flex items-center gap-1.5',
              isActive
                ? `${colors.active} border-current shadow-sm`
                : `bg-surface text-foreground-subtle border-border ${colors.hover} hover:border-current`
            )}
          >
            {isActive && <span className={cn('w-1.5 h-1.5 rounded-full', colors.dot)} />}
            {getGenerationLabel(gen)}
          </button>
        )
      })}
    </div>
  )
}
