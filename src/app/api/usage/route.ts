import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { ensureUsage } from '@/lib/usage'
import { supabaseAdmin } from '@/lib/supabase'
import { getLimitInfo, isActiveSupporter, getCurrentPeriod } from '@/lib/limits'

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

  // 사역 동참자이지만 plan이 'none'이면 'basic'으로 간주
  const effectivePlan = supporterActive && usage.plan === 'none' ? 'basic' : usage.plan
  const effectiveMonthlyLimit = supporterActive && usage.monthly_limit === 0 ? 10 : usage.monthly_limit
  const effectiveWorkspaceLimit = supporterActive && usage.workspace_limit === 0 ? 10 : usage.workspace_limit

  // 한도 정보 조회 (Phase 1)
  const [aiInfo, manualInfo, projectInfo, youtubeInfo] = await Promise.all([
    getLimitInfo(user.id, 'ai_analysis'),
    getLimitInfo(user.id, 'manual_sermon'),
    getLimitInfo(user.id, 'project'),
    getLimitInfo(user.id, 'youtube'),
  ])

  return NextResponse.json({
    supporter: supporterActive,
    supporter_until,
    plan: effectivePlan,
    monthly_limit: effectiveMonthlyLimit,
    monthly_used: usage.monthly_used || 0,
    workspace_limit: effectiveWorkspaceLimit,
    workspace_used: usage.workspace_used || 0,
    // Phase 1: 회원 등급별 한도 정보
    limits: {
      tier: aiInfo.tier,
      inGracePeriod: !!(usage as any).grace_period_end && new Date((usage as any).grace_period_end) > new Date(),
      gracePeriodEnd: (usage as any).grace_period_end || null,
      resetAt: aiInfo.resetAt,
      daysUntilReset: aiInfo.daysUntilReset,
      actions: {
        ai_analysis: {
          current: aiInfo.current,
          limit: aiInfo.limit,
          remaining: aiInfo.remaining,
          allowed: aiInfo.allowed,
        },
        manual_sermon: {
          current: manualInfo.current,
          limit: manualInfo.limit,
          remaining: manualInfo.remaining,
          allowed: manualInfo.allowed,
        },
        project: {
          current: projectInfo.current,
          limit: projectInfo.limit,
          remaining: projectInfo.remaining,
          allowed: projectInfo.allowed,
          reason: projectInfo.reason,
        },
        youtube: {
          current: youtubeInfo.current,
          limit: youtubeInfo.limit,
          remaining: youtubeInfo.remaining,
          allowed: youtubeInfo.allowed,
          reason: youtubeInfo.reason,
        },
      },
    },
  })
}
