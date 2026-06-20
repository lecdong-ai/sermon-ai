import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { ensureUsage } from '@/lib/usage'
import { supabaseAdmin } from '@/lib/supabase'

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

async function getSupporterUntil(userId: string): Promise<string | null> {
  const { data: user } = await supabaseAdmin.auth.admin.getUserById(userId).catch(() => ({ data: null }))
  const meta = (user?.user?.app_metadata as any) || {}
  if (meta.supporter_until) return meta.supporter_until
  return null
}

export async function GET(request: NextRequest) {
  const user = await getUser(request)
  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const usage = await ensureUsage(user.id)
  const supporter_until = await getSupporterUntil(user.id)
  const supporterActive = supporter_until
    ? new Date(supporter_until) > new Date()
    : false

  // 후원회원이지만 plan이 'none'이면 'basic'으로 간주
  const effectivePlan = supporterActive && usage.plan === 'none' ? 'basic' : usage.plan
  const effectiveMonthlyLimit = supporterActive && usage.monthly_limit === 0 ? 10 : usage.monthly_limit
  const effectiveWorkspaceLimit = supporterActive && usage.workspace_limit === 0 ? 10 : usage.workspace_limit

  return NextResponse.json({
    supporter: supporterActive,
    supporter_until,
    plan: effectivePlan,
    monthly_limit: effectiveMonthlyLimit,
    monthly_used: usage.monthly_used || 0,
    workspace_limit: effectiveWorkspaceLimit,
    workspace_used: usage.workspace_used || 0,
  })
}
