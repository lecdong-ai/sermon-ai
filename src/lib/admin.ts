import { supabaseAdmin } from './supabase'
import type { User } from '@supabase/supabase-js'

const ADMIN_EMAILS = ['lecdong@gmail.com']

function isAdminFromMeta(user: User): boolean {
  return !!(user.app_metadata as any)?.is_admin || ADMIN_EMAILS.includes(user.email || '')
}

export async function isAdmin(userId: string): Promise<boolean> {
  const { data: user } = await supabaseAdmin.auth.admin.getUserById(userId)
  if (!user?.user) return false
  return isAdminFromMeta(user.user)
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

  const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])

  return authUsers.users.map(u => ({
    id: u.id,
    email: u.email,
    name: profileMap.get(u.id)?.name || null,
    role: isAdminFromMeta(u) ? 'admin' : 'user',
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at,
    confirmed_at: u.confirmed_at,
  }))
}

export async function getUserStats() {
  const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers()
  const totalUsers = authUsers?.users.length || 0

  const adminCount = authUsers?.users.filter(u => isAdminFromMeta(u)).length || 0

  const { data: subscriptions } = await supabaseAdmin
    .from('subscriptions')
    .select('plan, status')

  const { data: paymentSum } = await supabaseAdmin
    .from('payment_history')
    .select('amount, status')

  const activeSubs = subscriptions?.filter(s => s.status === 'active') || []
  const totalRevenue = paymentSum?.filter(p => p.status === 'succeeded').reduce((s, p) => s + p.amount, 0) || 0
  const activeSubscriptions = activeSubs.length
  const proUsers = activeSubs.filter(s => s.plan === 'pro').length
  const basicUsers = activeSubs.filter(s => s.plan === 'basic').length
  const trialUsers = Math.max(0, totalUsers - adminCount - proUsers - basicUsers)

  return { totalUsers, totalRevenue, activeSubscriptions, adminCount, planDistribution: { pro: proUsers, basic: basicUsers, trial: trialUsers } }
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
