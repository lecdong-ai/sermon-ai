import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { isAdmin, getAllUsers, type UserSortField } from '@/lib/admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

const ALLOWED_SORT_FIELDS: UserSortField[] = [
  'name', 'email', 'role', 'supporter_until', 'created_at', 'last_sign_in_at',
]

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  if (!await isAdmin(user.id)) return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(200, Math.max(1, parseInt(searchParams.get('limit') || '50')))
  const search = (searchParams.get('search') || '').trim().slice(0, 100)

  const filterRaw = (searchParams.get('filter') || 'all') as 'all' | 'supporter' | 'general'
  const filter: 'all' | 'supporter' | 'general' =
    ['all', 'supporter', 'general'].includes(filterRaw) ? filterRaw : 'all'

  const sortRaw = (searchParams.get('sort') || 'created_at') as UserSortField
  const sortField: UserSortField = ALLOWED_SORT_FIELDS.includes(sortRaw) ? sortRaw : 'created_at'

  const orderRaw = (searchParams.get('order') || 'desc') as 'asc' | 'desc'
  const sortOrder: 'asc' | 'desc' = orderRaw === 'asc' ? 'asc' : 'desc'

  const result = await getAllUsers({ page, limit, search, filter, sortField, sortOrder })

  return NextResponse.json(
    {
      ...result,
      filter,
      search,
      sortField,
      sortOrder,
    },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'CDN-Cache-Control': 'no-store',
      },
    }
  )
}
