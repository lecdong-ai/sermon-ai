// Admin notification helper. Server-side only (uses service_role).
import { supabaseAdmin } from './supabase'

export type AdminNotificationType = 'new_user' | 'new_donation' | 'new_message' | 'quota_warning' | 'error' | 'system'

export interface CreateNotificationInput {
  type: AdminNotificationType
  title: string
  message: string
  link?: string
  relatedUserId?: string
  metadata?: Record<string, any>
}

/** Insert a notification for admin. Fire-and-forget — caller should not block on errors. */
export async function notifyAdmins(input: CreateNotificationInput): Promise<void> {
  try {
    await supabaseAdmin.from('admin_notifications').insert({
      type: input.type,
      title: input.title,
      message: input.message,
      link: input.link ?? null,
      related_user_id: input.relatedUserId ?? null,
      metadata: input.metadata ?? {},
    })
  } catch (e) {
    console.error('[notifyAdmins] failed:', e)
  }
}
