import { supabaseAdmin } from './supabase'
import type { User } from '@supabase/supabase-js'
import { grantSupporter } from './donations'

const ADMIN_EMAILS = ['lecdong@gmail.com']

function isAdminFromMeta(user: User): boolean {
  return !!(user.app_metadata as any)?.is_admin || ADMIN_EMAILS.includes(user.email || '')
}

export async function ensureAdminSupporter(userId: string): Promise<void> {
  try {
    const { data: user } = await supabaseAdmin.auth.admin.getUserById(userId)
    const meta = (user?.user?.app_metadata as any) || {}
    if (meta.supporter_until && new Date(meta.supporter_until) > new Date()) return
  } catch {
    // fallback
  }

  try {
    const { data: usage } = await supabaseAdmin
      .from('user_usage')
      .select('supporter_until')
      .eq('user_id', userId)
      .single()
    if (usage?.supporter_until && new Date(usage.supporter_until) > new Date()) return
  } catch {
    // column may not exist
  }

  await grantSupporter(userId, 3650)
}

export async function isAdmin(userId: string): Promise<boolean> {
  if (process.env.NODE_ENV === 'development' && userId === '00000000-0000-0000-0000-000000000000') {
    return true
  }

  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('role, email')
    .eq('id', userId)
    .single()

  let admin = false

  if (profile?.role === 'admin') admin = true
  else if (profile?.email && ADMIN_EMAILS.includes(profile.email)) admin = true
  else {
    const { data: user } = await supabaseAdmin.auth.admin.getUserById(userId).catch(() => ({ data: null }))
    if (user?.user && isAdminFromMeta(user.user)) admin = true
  }

  if (admin) {
    await ensureAdminSupporter(userId).catch(() => {})
  }

  return admin
}

export async function setAdminRole(userId: string): Promise<boolean> {
  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    app_metadata: { is_admin: true } as any,
  })
  return !error
}

export type UserSortField = 'name' | 'email' | 'role' | 'supporter_until' | 'created_at' | 'last_sign_in_at'

export interface GetUsersParams {
  page?: number
  limit?: number
  search?: string
  filter?: 'all' | 'supporter' | 'general'
  sortField?: UserSortField
  sortOrder?: 'asc' | 'desc'
}

export interface GetUsersResult {
  users: Array<{
    id: string
    email: string
    name: string | null
    role: string
    supporter_until: string | null
    created_at: string
    last_sign_in_at: string | null
    confirmed_at: string | null
  }>
  total: number
  page: number
  limit: number
  totalPages: number
}

export async function getAllUsers(params: GetUsersParams = {}): Promise<GetUsersResult> {
  const page = Math.max(1, params.page ?? 1)
  const limit = Math.min(200, Math.max(1, params.limit ?? 50))
  const search = (params.search || '').trim().slice(0, 100)
  const filter = params.filter || 'all'
  const sortField: UserSortField = params.sortField || 'created_at'
  const sortOrder: 'asc' | 'desc' = params.sortOrder || 'desc'

  // 1) Auth 유저 전체 조회
  const { data: authData } = await supabaseAdmin.auth.admin.listUsers()
  const authUsers = authData?.users || []

  // 2) user_profiles 조회 (옵셔널)
  const { data: profileMatches } = await supabaseAdmin
    .from('user_profiles')
    .select('id, name, email')
    .range(0, 9999)
  const profileMap = new Map((profileMatches || []).map(p => [p.id, p]))

  // 3) user_usage에서 supporter_until 일괄 조회
  const profileIds = (profileMatches || []).map(p => p.id)
  let usageMap = new Map<string, string | null>()
  if (profileIds.length > 0) {
    const { data: usageList } = await supabaseAdmin
      .from('user_usage')
      .select('user_id, supporter_until')
      .in('user_id', profileIds)
    usageMap = new Map((usageList || []).map(u => [u.user_id, u.supporter_until]))
  }

  // 4) Auth 유저 기준으로 결합 (user_profiles는 옵셔널)
  const now = new Date()
  const combined = authUsers.map(u => {
    const p = profileMap.get(u.id)
    const usageUntil = usageMap.get(u.id) || null
    const appMetaUntil = (u.app_metadata as any)?.supporter_until
    let finalUntil: string | null = null
    if (appMetaUntil && usageUntil) {
      finalUntil = new Date(appMetaUntil) > new Date(usageUntil) ? appMetaUntil : usageUntil
    } else {
      finalUntil = usageUntil || appMetaUntil || null
    }
    return {
      id: u.id,
      email: u.email || p?.email || '',
      name: p?.name || null,
      role: isAdminFromMeta(u) ? 'admin' : 'user',
      supporter_until: finalUntil,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at ?? null,
      confirmed_at: u.confirmed_at ?? null,
    }
  })

  // 5) search 필터 (email + name)
  let filtered = combined
  if (search) {
    const q = search.toLowerCase()
    filtered = combined.filter(u =>
      u.email.toLowerCase().includes(q) ||
      (u.name && u.name.toLowerCase().includes(q))
    )
  }

  // 6) supporter/general 필터
  filtered = filtered.filter(u => {
    if (filter === 'supporter') return u.supporter_until && new Date(u.supporter_until) > now
    if (filter === 'general') return !u.supporter_until || new Date(u.supporter_until) <= now
    return true
  })

  // 7) 정렬
  const dir = sortOrder === 'asc' ? 1 : -1
  filtered.sort((a, b) => {
    const av = (a as any)[sortField]
    const bv = (b as any)[sortField]
    if (av == null && bv == null) return 0
    if (av == null) return 1
    if (bv == null) return -1
    if (av < bv) return -1 * dir
    if (av > bv) return 1 * dir
    return 0
  })

  // 8) 페이지 슬라이스
  const offset = (page - 1) * limit
  const paged = filtered.slice(offset, offset + limit)
  const totalPages = Math.ceil(filtered.length / limit)

  return { users: paged, total: filtered.length, page, limit, totalPages }
}

export async function getUserStats() {
  const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers()
  const totalUsers = authUsers?.users.length || 0

  const adminCount = authUsers?.users.filter(u => isAdminFromMeta(u)).length || 0

  const now = new Date().toISOString()
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)
  const monthStartStr = monthStart.toISOString()

  const activeSupporters = Math.max(
    authUsers?.users.filter(u => {
      const until = (u.app_metadata as any)?.supporter_until
      return until && new Date(until) > new Date()
    }).length || 0,
    // user_usage 테이블에서 추가 supporter 확인
    (await supabaseAdmin
      .from('user_usage')
      .select('supporter_until')
      .gt('supporter_until', new Date().toISOString())
    ).data?.length || 0,
  )

  const newUsersThisMonth = authUsers?.users.filter(u => u.created_at >= monthStartStr).length || 0

  const { count: totalSermons } = await supabaseAdmin
    .from('sermons')
    .select('*', { count: 'exact', head: true })

  const { count: sermonsThisMonth } = await supabaseAdmin
    .from('sermons')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', monthStartStr)

  const supporterRate = totalUsers > 0 ? Math.round((activeSupporters / totalUsers) * 100) : 0

  return {
    totalUsers,
    adminCount,
    activeSupporters,
    newUsersThisMonth,
    totalSermons: totalSermons || 0,
    sermonsThisMonth: sermonsThisMonth || 0,
    supporterRate,
  }
}

export async function getUsageLogs(limit = 50, offset = 0) {
  const { data: logs } = await supabaseAdmin
    .from('usage_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  return logs || []
}

export async function getPaymentHistory(limit = 50, offset = 0) {
  const { data: payments } = await supabaseAdmin
    .from('payment_history')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  return payments || []
}
