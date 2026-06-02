import { supabaseAdmin } from './supabase'

const ADMIN_EMAILS = ['lecdong@gmail.com']

export async function getAdminUser(userId: string): Promise<{ id: string; email: string; name?: string; role: string } | null> {
  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (!profile) return null
  return profile
}

export async function isAdmin(userId: string): Promise<boolean> {
  const profile = await getAdminUser(userId)
  if (profile?.role === 'admin') return true

  const { data: user } = await supabaseAdmin.auth.admin.getUserById(userId)
  if (user?.user?.email && ADMIN_EMAILS.includes(user.user.email)) return true

  return false
}

export async function ensureAdminRole(userId: string) {
  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('role')
    .eq('id', userId)
    .single()

  if (!profile) {
    await supabaseAdmin.from('user_profiles').update({ role: 'admin' }).eq('id', userId)
  } else if (profile.role !== 'admin') {
    await supabaseAdmin.from('user_profiles').update({ role: 'admin' }).eq('id', userId)
  }
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
    role: profileMap.get(u.id)?.role || 'user',
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at,
    confirmed_at: u.confirmed_at,
  }))
}

export async function getUserStats() {
  const { data: allUsers } = await supabaseAdmin
    .from('user_profiles')
    .select('id, role, created_at')

  const { data: usage } = await supabaseAdmin
    .from('user_usage')
    .select('plan, user_status, monthly_used, monthly_limit')

  const { data: subscriptions } = await supabaseAdmin
    .from('subscriptions')
    .select('plan, status')

  const { data: paymentSum } = await supabaseAdmin
    .from('payment_history')
    .select('amount, status')

  const totalUsers = allUsers?.length || 0
  const totalRevenue = paymentSum?.filter(p => p.status === 'succeeded').reduce((s, p) => s + p.amount, 0) || 0
  const activeSubscriptions = subscriptions?.filter(s => s.status === 'active').length || 0
  const proUsers = usage?.filter(u => u.plan === 'pro').length || 0
  const basicUsers = usage?.filter(u => u.plan === 'basic').length || 0
  const trialUsers = usage?.filter(u => u.plan === 'none' && u.user_status === 'trial').length || 0

  const planDistribution = { pro: proUsers, basic: basicUsers, trial: trialUsers }

  return { totalUsers, totalRevenue, activeSubscriptions, planDistribution }
}

export async function getUsageLogs(limit = 50, offset = 0) {
  const { data: logs } = await supabaseAdmin
    .from('usage_logs')
    .select('*, user_profiles!inner(name, email)')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  return logs || []
}

export async function getPaymentHistory(limit = 50, offset = 0) {
  const { data: payments } = await supabaseAdmin
    .from('payment_history')
    .select('*, user_id')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  return payments || []
}
