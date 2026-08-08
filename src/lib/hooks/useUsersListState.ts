'use client'

import { useCallback, useMemo } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

export type UserFilter = 'all' | 'supporter' | 'general'
export type UserSort = 'name' | 'email' | 'role' | 'supporter_until' | 'created_at' | 'last_sign_in_at'
export type UserOrder = 'asc' | 'desc'

export interface UsersListState {
  page: number
  limit: number
  search: string
  filter: UserFilter
  sort: UserSort
  order: UserOrder
}

const DEFAULTS: UsersListState = {
  page: 1,
  limit: 50,
  search: '',
  filter: 'all',
  sort: 'created_at',
  order: 'desc',
}

function isDefault(key: keyof UsersListState, value: any): boolean {
  if (key === 'limit' && value === 50) return true
  return DEFAULTS[key] === value
}

export function useUsersListState() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const state = useMemo<UsersListState>(() => ({
    page: Math.max(1, parseInt(searchParams?.get('page') || '1')),
    limit: Math.min(200, Math.max(1, parseInt(searchParams?.get('limit') || '50'))),
    search: searchParams?.get('search') || '',
    filter: (['all', 'supporter', 'general'].includes(searchParams?.get('filter') || '')
      ? (searchParams?.get('filter') as UserFilter)
      : 'all'),
    sort: (['name', 'email', 'role', 'supporter_until', 'created_at', 'last_sign_in_at'].includes(searchParams?.get('sort') || '')
      ? (searchParams?.get('sort') as UserSort)
      : 'created_at'),
    order: (searchParams?.get('order') === 'asc' ? 'asc' : 'desc') as UserOrder,
  }), [searchParams])

  const update = useCallback((patch: Partial<UsersListState>) => {
    const next = new URLSearchParams(searchParams.toString())
    for (const [k, v] of Object.entries(patch)) {
      const key = k as keyof UsersListState
      if (isDefault(key, v)) {
        next.delete(key)
      } else {
        next.set(key, String(v))
      }
    }
    // 검색/필터/정렬 변경 시 1페이지로 리셋
    if (('search' in patch || 'filter' in patch || 'sort' in patch || 'order' in patch) && !('page' in patch)) {
      next.delete('page')
    }
    const qs = next.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }, [searchParams, router, pathname])

  const reset = useCallback(() => {
    router.replace(pathname, { scroll: false })
  }, [router, pathname])

  return { state, update, reset }
}
