'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export interface ChipOption {
  label: string
  value: string
}

interface ChipFilterProps {
  options: readonly ChipOption[]
  paramName?: string
  currentValue?: string
  showClear?: boolean
  className?: string
}

export function ChipFilter({
  options,
  paramName = 'category',
  currentValue,
  showClear = true,
  className,
}: ChipFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const buildHref = useCallback(
    (value?: string) => {
      const params = new URLSearchParams(searchParams?.toString() || '')
      if (value) {
        params.set(paramName, value)
      } else {
        params.delete(paramName)
      }
      params.delete('page')
      const qs = params.toString()
      return qs ? `${pathname}?${qs}` : pathname
    },
    [paramName, pathname, searchParams]
  )

  return (
    <div className={cn('flex gap-2 overflow-x-auto scrollbar-hide -mx-5 px-5 pb-1', className)}>
      <a
        href={buildHref(undefined)}
        className={cn(
          'px-4 py-2 rounded-full text-sm border transition-colors whitespace-nowrap shrink-0',
          !currentValue
            ? 'bg-foreground text-background border-foreground'
            : 'border-border text-foreground-muted hover:border-accent hover:text-accent'
        )}
      >
        전체
      </a>
      {options.map((opt) => {
        const isActive = currentValue === opt.value
        return (
          <a
            key={opt.value}
            href={buildHref(isActive ? undefined : opt.value)}
            className={cn(
              'px-4 py-2 rounded-full text-sm border transition-colors whitespace-nowrap shrink-0',
              isActive
                ? 'bg-foreground text-background border-foreground'
                : 'border-border text-foreground-muted hover:border-accent hover:text-accent'
            )}
          >
            {opt.label}
          </a>
        )
      })}
      {showClear && currentValue && (
        <a
          href={buildHref(undefined)}
          className="flex items-center gap-1 px-4 py-2 rounded-full text-sm text-foreground-subtle hover:text-foreground transition-colors whitespace-nowrap shrink-0"
        >
          <X className="w-3.5 h-3.5" />
          초기화
        </a>
      )}
    </div>
  )
}
