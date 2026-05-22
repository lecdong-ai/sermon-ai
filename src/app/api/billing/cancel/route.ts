import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cancelSubscription } from '@/lib/billing'

function getUser(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll() {},
      },
    },
  )
  return supabase.auth.getUser().then(r => r.data.user)
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request)
    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const result = await cancelSubscription(user.id)

    return NextResponse.json({
      success: true,
      message: '구독이 해지되었습니다. 현재 결제 주기가 종료될 때까지 서비스를 계속 사용할 수 있습니다.',
      subscription: {
        status: 'canceled',
        billing_cycle_end: result.billing_cycle_end,
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || '구독 해지 실패' }, { status: 500 })
  }
}
