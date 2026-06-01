import { supabaseAdmin as supabase } from './supabase'
import type { PlanType, UserUsage, UsageInfo, FeatureAccess } from '@/types'
import { PLAN_LIMITS } from '@/types'

const UNLIMITED_EMAILS = ['lecdong@gmail.com']

async function isUnlimitedUser(userId: string): Promise<boolean> {
  const { data, error } = await supabase.auth.admin.getUserById(userId)
  if (error || !data?.user?.email) return false
  return UNLIMITED_EMAILS.includes(data.user.email.toLowerCase())
}

function currentMonth(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function monthDate(offset: number): string {
  const d = new Date()
  d.setDate(1)
  d.setMonth(d.getMonth() + offset)
  return d.toISOString().split('T')[0]
}

export async function getUserUsage(userId: string): Promise<UserUsage | null> {
  const { data } = await supabase
    .from('user_usage')
    .select('*')
    .eq('user_id', userId)
    .single()
  return data
}

export async function ensureUsage(userId: string): Promise<UserUsage> {
  const existing = await getUserUsage(userId)
  if (existing) return existing

  const { data: userData } = await supabase.auth.admin.getUserById(userId)
  const userEmail = userData?.user?.email?.toLowerCase() || ''
  const { data: deletedCheck } = await supabase
    .from('deleted_users')
    .select('id')
    .eq('email', userEmail)
    .maybeSingle()

  const now = new Date().toISOString()
  const end = new Date(Date.now() + 15 * 86400000).toISOString()
  const defaultRecord = {
    user_id: userId,
    plan: 'none' as PlanType,
    user_status: deletedCheck ? 'expired' as const : 'trial' as const,
    trial_used: deletedCheck ? 999 : 0,
    trial_limit: 3,
    trial_start_at: now,
    trial_end_at: deletedCheck ? now : end,
    monthly_used: 0,
    monthly_limit: 0,
    workspace_used: 0,
    workspace_limit: 0,
    last_reset_month: currentMonth(),
    created_at: now,
    updated_at: now,
  }

  const { data } = await supabase
    .from('user_usage')
    .upsert(defaultRecord, { onConflict: 'user_id' })
    .select()
    .single()

  return data || defaultRecord
}

async function updateUsage(userId: string, updates: Record<string, any>): Promise<void> {
  await supabase
    .from('user_usage')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
}

function computeUsage(usage: UserUsage): UsageInfo {
  const now = new Date()
  const month = currentMonth()
  const needsReset = usage.last_reset_month !== month
  const planLimits = PLAN_LIMITS[usage.plan] || PLAN_LIMITS.none

  // Trial check
  const trialEnd = usage.trial_end_at ? new Date(usage.trial_end_at) : null
  const trialExpired = trialEnd ? now > trialEnd : false
  const trialRemaining = Math.max(0, usage.trial_limit - usage.trial_used)
  const trialAvailable = !trialExpired && trialRemaining > 0

  // Monthly check
  const monthlyUsed = needsReset ? 0 : usage.monthly_used
  const monthlyRemaining = Math.max(0, planLimits.monthly - monthlyUsed)
  const monthlyAvailable = planLimits.monthly === 0 || monthlyUsed < planLimits.monthly

  // Workspace check
  const workspaceUsed = needsReset ? 0 : usage.workspace_used
  const workspaceRemaining = Math.max(0, planLimits.workspace_limit - workspaceUsed)

  // Can generate?
  let canGenerate = false
  let blockReason: UsageInfo['block_reason'] = undefined

  if (usage.user_status === 'past_due') {
    blockReason = 'past_due'
  } else if (usage.user_status === 'canceled') {
    blockReason = 'canceled'
  } else if (usage.plan === 'none') {
    // Free trial user
    if (trialExpired) {
      blockReason = 'trial_expired'
    } else if (!trialAvailable) {
      blockReason = 'trial_exhausted'
    } else {
      canGenerate = true
    }
  } else {
    // Paid user
    if (!monthlyAvailable) {
      blockReason = 'monthly_exhausted'
    } else {
      canGenerate = true
    }
  }

  return {
    plan: usage.plan,
    user_status: usage.user_status,
    trial: {
      used: usage.trial_used,
      limit: usage.trial_limit,
      remaining: trialRemaining,
      ends_at: usage.trial_end_at,
      expired: trialExpired,
    },
    monthly: {
      used: monthlyUsed,
      limit: planLimits.monthly,
      remaining: monthlyRemaining,
      period_start: monthDate(0),
      period_end: monthDate(1),
    },
    workspace: {
      used: workspaceUsed,
      limit: planLimits.workspace_limit,
      remaining: workspaceRemaining,
    },
    can_generate: canGenerate,
    block_reason: blockReason,
  }
}

export async function checkUsage(userId: string): Promise<UsageInfo> {
  if (await isUnlimitedUser(userId)) {
    return {
      plan: 'pro',
      user_status: 'active',
      trial: { used: 0, limit: 999999, remaining: 999999, ends_at: null, expired: false },
      monthly: { used: 0, limit: 0, remaining: 0, period_start: monthDate(0), period_end: monthDate(1) },
      workspace: { used: 0, limit: 0, remaining: 0 },
      can_generate: true,
    }
  }
  const usage = await ensureUsage(userId)
  return computeUsage(usage)
}

export async function checkFeatureAccess(userId: string, feature: string): Promise<FeatureAccess> {
  if (await isUnlimitedUser(userId)) {
    return { key: feature, name: feature, available: true, remaining: 999999 } as FeatureAccess
  }
  const usage = await ensureUsage(userId)
  const planLimits = PLAN_LIMITS[usage.plan] || PLAN_LIMITS.none
  const info = computeUsage(usage)

  if (feature === 'generate') {
    return {
      key: 'generate',
      name: 'AI 분석',
      available: info.can_generate,
      remaining: info.trial.remaining > 0 ? info.trial.remaining : info.monthly.remaining,
    }
  }

  if (feature === 'workspace') {
    return {
      key: 'workspace',
      name: '설교원고제작',
      available: info.workspace.remaining > 0,
      remaining: info.workspace.remaining,
      required_plan: planLimits.workspace_limit > 0 ? 'basic' : 'pro',
    }
  }

  return { key: feature, name: feature, available: false }
}

export async function consumeUsage(userId: string): Promise<{ success: boolean; error?: string; usage?: UsageInfo }> {
  if (await isUnlimitedUser(userId)) {
    return { success: true, usage: {
      plan: 'pro',
      user_status: 'active',
      trial: { used: 0, limit: 999999, remaining: 999999, ends_at: null, expired: false },
      monthly: { used: 0, limit: 0, remaining: 0, period_start: monthDate(0), period_end: monthDate(1) },
      workspace: { used: 0, limit: 0, remaining: 0 },
      can_generate: true,
    }}
  }

  const usage = await ensureUsage(userId)
  const month = currentMonth()
  const needsReset = usage.last_reset_month !== month
  const planLimits = PLAN_LIMITS[usage.plan] || PLAN_LIMITS.none

  const info = computeUsage(usage)
  if (!info.can_generate) {
    return { success: false, error: '사용 한도를 초과했습니다.', usage: info }
  }

  if (usage.plan === 'none' && info.trial.remaining > 0) {
    await updateUsage(userId, { trial_used: usage.trial_used + 1 })
  } else {
    await updateUsage(userId, {
      monthly_used: needsReset ? 1 : usage.monthly_used + 1,
      last_reset_month: month,
    })
  }

  const updated = await getUserUsage(userId)
  return { success: true, usage: updated ? computeUsage(updated) : undefined }
}

export async function consumeWorkspaceUsage(userId: string): Promise<{ success: boolean; error?: string; usage?: UsageInfo }> {
  if (await isUnlimitedUser(userId)) {
    return { success: true, usage: {
      plan: 'pro',
      user_status: 'active',
      trial: { used: 0, limit: 999999, remaining: 999999, ends_at: null, expired: false },
      monthly: { used: 0, limit: 0, remaining: 0, period_start: monthDate(0), period_end: monthDate(1) },
      workspace: { used: 0, limit: 0, remaining: 0 },
      can_generate: true,
    }}
  }

  const usage = await ensureUsage(userId)
  const month = currentMonth()
  const needsReset = usage.last_reset_month !== month
  const planLimits = PLAN_LIMITS[usage.plan] || PLAN_LIMITS.none

  const info = computeUsage(usage)
  if (info.workspace.remaining <= 0) {
    return { success: false, error: '설교원고제작 사용 한도를 초과했습니다.', usage: info }
  }

  await updateUsage(userId, {
    workspace_used: needsReset ? 1 : usage.workspace_used + 1,
    last_reset_month: month,
  })

  const updated = await getUserUsage(userId)
  return { success: true, usage: updated ? computeUsage(updated) : undefined }
}

export async function getUsageInfo(userId: string): Promise<UsageInfo> {
  return checkUsage(userId)
}
