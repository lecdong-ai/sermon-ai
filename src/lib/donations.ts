import { supabaseAdmin } from './supabase'

export async function checkSupporterAccess(userId: string): Promise<boolean> {
  let meta: Record<string, any> = {}
  try {
    const { data: user } = await supabaseAdmin.auth.admin.getUserById(userId)
    meta = (user?.user?.app_metadata as any) || {}
  } catch {
    meta = {}
  }
  if (meta.supporter_until) {
    return new Date(meta.supporter_until) > new Date()
  }

  try {
    const { data } = await supabaseAdmin
      .from('user_usage')
      .select('supporter_until')
      .eq('user_id', userId)
      .single()
    if (data?.supporter_until) {
      return new Date(data.supporter_until) > new Date()
    }
  } catch {
    // column may not exist yet
  }
  return false
}

export async function grantSupporter(
  userId: string,
  days: number,
): Promise<boolean> {
  // 현재 supporter_until 조회 (있으면 연장, 없으면 오늘부터)
  let currentDate = new Date()
  try {
    const { data: user } = await supabaseAdmin.auth.admin.getUserById(userId)
    const meta = (user?.user?.app_metadata as any) || {}
    if (meta.supporter_until) {
      const parsed = new Date(meta.supporter_until)
      if (parsed > currentDate) currentDate = parsed
    }
  } catch {}

  const until = new Date(currentDate.getTime() + days * 24 * 60 * 60 * 1000).toISOString()

  let metaOk = false
  try {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      app_metadata: { supporter_until: until } as any,
    })
    metaOk = !error
    if (error) console.error('grantSupporter (app_metadata) error:', error)
  } catch (e) {
    console.error('grantSupporter (app_metadata) error:', e)
  }

  // user_usage 테이블에 supporter_until + plan 업그레이드
  try {
    await supabaseAdmin
      .from('user_usage')
      .upsert(
        {
          user_id: userId,
          supporter_until: until,
          plan: 'basic',
          user_status: 'active',
          monthly_limit: 10,
          workspace_limit: 10,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' },
      )
  } catch (e) {
    console.error('grantSupporter (user_usage) error:', e)
  }

  return metaOk
}
