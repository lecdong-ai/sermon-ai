import { supabaseAdmin as supabase } from './supabase'
import type { UserUsage } from '@/types'

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

  const now = new Date().toISOString()
  const defaultRecord: Record<string, any> = {
    user_id: userId,
    plan: 'none',
    user_status: 'active',
    trial_used: 0,
    trial_limit: 0,
    trial_start_at: now,
    trial_end_at: now,
    monthly_used: 0,
    monthly_limit: 0,
    workspace_used: 0,
    workspace_limit: 0,
    last_reset_month: '',
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
