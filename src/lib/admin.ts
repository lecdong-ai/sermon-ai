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

export async function getAllUsers() {
  const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()
  if (authError) throw authError

  const { data: profiles } = await supabaseAdmin
    .from('user_profiles')
    .select('*')

  const { data: usageList } = await supabaseAdmin
    .from('user_usage')
    .select('user_id, supporter_until')

  const usageMap = new Map(usageList?.map(u => [u.user_id, u.supporter_until]) || [])
  const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])

  return authUsers.users.map(u => ({
    id: u.id,
    email: u.email,
    name: profileMap.get(u.id)?.name || null,
    role: isAdminFromMeta(u) ? 'admin' : 'user',
    supporter_until: (u.app_metadata as any)?.supporter_until || usageMap.get(u.id) || null,
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at,
    confirmed_at: u.confirmed_at,
  }))
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
