import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { supabaseAdmin as supabase } from '@/lib/supabase'

function getUser(request: NextRequest) {
  const sb = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll() {},
      },
    },
  )
  return sb.auth.getUser().then(r => r.data.user)
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUser(request)
    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['active', 'past_due'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    return NextResponse.json({
      subscription: subscription ? {
        id: subscription.id,
        plan: subscription.plan,
        status: subscription.status,
        billing_cycle_start: subscription.billing_cycle_start,
        billing_cycle_end: subscription.billing_cycle_end,
        monthly_limit: subscription.monthly_limit,
        monthly_used: subscription.monthly_used,
        payment_method: subscription.payment_method_id ? '카드' : null,
      } : null,
    })
  } catch {
    return NextResponse.json({ subscription: null })
  }
}
