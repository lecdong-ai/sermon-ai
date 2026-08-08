'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { cn } from '@/lib/utils/cn'
import { ChipFilter } from '@/components/common/ChipFilter'
import { SearchInput } from '@/components/common/SearchInput'
import type { Season, QtQueryParams } from '@/types/qt-index'

const seasonOptions = [
  { label: '대림', value: '대림' },
  { label: '성탄', value: '성탄' },
  { label: '사순', value: '사순' },
  { label: '부활', value: '부활' },
  { label: '연중', value: '연중' },
]

interface QtFilterBarProps {
  currentParams: QtQueryParams
}

export function QtFilterBar({ currentParams }: QtFilterBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const buildHref = useCallback(
    (updates: Partial<QtQueryParams>) => {
      const params = new URLSearchParams(searchParams?.toString() || '')
      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === '' || value === null) {
          params.delete(key)
        } else {
          params.set(key, String(value))
        }
      })
      if (!('page' in updates)) {
        params.delete('page')
      }
      const qs = params.toString()
      return qs ? `${pathname}?${qs}` : pathname
    },
    [pathname, searchParams]
  )

  return (
    <div className="space-y-4">
      <ChipFilter
        options={seasonOptions}
        paramName="season"
        currentValue={currentParams.season}
      />

      <div className="flex items-center gap-3">
        <SearchInput
          paramName="search"
          placeholder="제목, 본문, 성경 구절 검색"
          defaultValue={currentParams.search ?? ''}
          useRouter
          basePath={pathname}
          className="flex-1"
        />

        <select
          value={currentParams.sort ?? 'latest'}
          onChange={(e) => router.push(buildHref({ sort: e.target.value as QtQueryParams['sort'] }))}
          className="h-11 px-4 rounded-lg border border-border bg-surface text-sm text-foreground-muted focus:outline-none focus:ring-1 focus:ring-ring shrink-0"
          aria-label="정렬 방식"
        >
          <option value="latest">최신순</option>
          <option value="popular">인기순</option>
        </select>
      </div>
    </div>
  )
}
