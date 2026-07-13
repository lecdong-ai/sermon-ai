import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export const dynamic = 'force-dynamic'

function getClient(request: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll() {},
      },
    },
  )
}

async function getUser(request: NextRequest) {
  const sb = getClient(request)
  const { data } = await sb.auth.getUser()
  return data.user
}

export async function GET(request: NextRequest) {
  const user = await getUser(request)
  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  return NextResponse.json({
    supporter: true,
    supporter_until: null,
    plan: 'free',
    monthly_limit: -1,
    monthly_used: 0,
    workspace_limit: -1,
    workspace_used: 0,
    limits: {
      tier: 'supporter',
      inGracePeriod: false,
      gracePeriodEnd: null,
      resetAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      daysUntilReset: 30,
      actions: {
        ai_analysis: { current: 0, limit: -1, remaining: -1, allowed: true },
        manual_sermon: { current: 0, limit: -1, remaining: -1, allowed: true },
        project: { current: 0, limit: -1, remaining: -1, allowed: true },
        youtube: { current: 0, limit: -1, remaining: -1, allowed: true },
      },
    },
  })
}
