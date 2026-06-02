import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { isAdmin } from '@/lib/admin'
import { supabaseAdmin as supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  if (!await isAdmin(user.id)) return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 })

  const { targetUserId, action, plan } = await request.json()
  if (!targetUserId || !action) {
    return NextResponse.json({ error: '필수 파라미터가 누락되었습니다.' }, { status: 400 })
  }

  const now = new Date()
  const end = new Date(now)
  end.setMonth(end.getMonth() + 1)

  if (action === 'reset_trial') {
    const trialEnd = new Date(now)
    trialEnd.setDate(trialEnd.getDate() + 15)

    const { error } = await supabase
      .from('user_usage')
      .update({
        plan: 'none',
        user_status: 'trial',
        trial_used: 0,
        trial_limit: 3,
        trial_start_at: now.toISOString(),
        trial_end_at: trialEnd.toISOString(),
        monthly_used: 0,
        monthly_limit: 0,
        updated_at: now.toISOString(),
      })
      .eq('user_id', targetUserId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, message: '무료체험이 초기화되었습니다.' })
  }

  if (action === 'give_month') {
    if (plan !== 'basic' && plan !== 'pro') {
      return NextResponse.json({ error: '플랜은 basic 또는 pro만 가능합니다.' }, { status: 400 })
    }

    const monthlyLimit = plan === 'pro' ? 20 : 10

    const { data: existing } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', targetUserId)
      .eq('status', 'active')
      .single()

    if (existing) {
      const { error } = await supabase
        .from('subscriptions')
        .update({
          plan,
          status: 'active',
          billing_cycle_end: end.toISOString(),
          monthly_limit: monthlyLimit,
          monthly_used: 0,
          updated_at: now.toISOString(),
        })
        .eq('id', existing.id)

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    } else {
      const { data: sub, error: subError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: targetUserId,
          plan,
          status: 'active',
          billing_cycle_start: now.toISOString(),
          billing_cycle_end: end.toISOString(),
          monthly_limit: monthlyLimit,
          monthly_used: 0,
          payment_provider: 'admin',
        })
        .select()
        .single()

      if (subError) return NextResponse.json({ error: subError.message }, { status: 500 })

      await supabase
        .from('user_usage')
        .update({ subscription_id: sub.id })
        .eq('user_id', targetUserId)
    }

    const { error: usageError } = await supabase
      .from('user_usage')
      .update({
        plan,
        user_status: 'active',
        monthly_limit: monthlyLimit,
        monthly_used: 0,
        updated_at: now.toISOString(),
      })
      .eq('user_id', targetUserId)

    if (usageError) return NextResponse.json({ error: usageError.message }, { status: 500 })

    const planName = plan === 'pro' ? 'Pro' : 'Basic'
    return NextResponse.json({ success: true, message: `${planName} 1개월 이용권이 지급되었습니다.` })
  }

  return NextResponse.json({ error: '알 수 없는 action입니다.' }, { status: 400 })
}
