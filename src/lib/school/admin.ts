import { supabaseAdmin } from './supabase'
import type { User } from '@supabase/supabase-js'

const ADMIN_EMAILS = ['lecdong@gmail.com']

function isAdminFromMeta(user: User): boolean {
  return !!(user.app_metadata as any)?.is_admin || ADMIN_EMAILS.includes(user.email || '')
}

export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const { data } = await supabaseAdmin.auth.admin.getUserById(userId)
    if (data?.user) {
      return isAdminFromMeta(data.user)
    }
  } catch {
  }
  try {
    const { data: profile } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', userId)
      .maybeSingle()
    if (profile?.role === 'admin') return true
  } catch {
  }
  return false
}
