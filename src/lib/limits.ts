import { getUserFromRequest } from './auth'

export type ActionType = 'ai_analysis' | 'manual_sermon' | 'project' | 'youtube'
export type Tier = 'general' | 'supporter'

const ACTION_LABELS: Record<ActionType, string> = {
  ai_analysis: 'AI 분석 6종',
  manual_sermon: '새 설교 등록',
  project: '말씀 연구실',
  youtube: '유튜브 연구소',
}

export interface LimitInfo {
  allowed: boolean
  action: ActionType
  tier: Tier
  current: number
  limit: number
  remaining: number
  resetAt: string
  daysUntilReset: number
  reason?: 'limit_reached' | 'supporter_only'
  upgradeUrl?: string
  message?: string
}

export function getCurrentPeriod(signupDate: Date | string, now: Date = new Date()) {
  const DAY_MS = 30 * 24 * 60 * 60 * 1000
  const signupMs = new Date(signupDate).getTime()
  const nowMs = now.getTime()
  const elapsed = nowMs - signupMs
  const periodIndex = Math.max(0, Math.floor(elapsed / DAY_MS))
  const periodStart = new Date(signupMs + periodIndex * DAY_MS)
  const periodEnd = new Date(signupMs + (periodIndex + 1) * DAY_MS)
  const msUntilReset = periodEnd.getTime() - nowMs
  const daysUntilReset = Math.max(0, Math.ceil(msUntilReset / (24 * 60 * 60 * 1000)))
  return { periodStart, periodEnd, daysUntilReset, periodIndex }
}

export async function isActiveSupporter(_userId: string): Promise<boolean> {
  return true
}

export async function isInGracePeriod(_userId: string): Promise<boolean> {
  return false
}

export async function getUserLimits(userId: string): Promise<{
  tier: Tier
  signupDate: string | null
  gracePeriodEnd: string | null
  limits: Record<ActionType, number>
}> {
  return {
    tier: 'supporter',
    signupDate: null,
    gracePeriodEnd: null,
    limits: {
      ai_analysis: Infinity,
      manual_sermon: Infinity,
      project: Infinity,
      youtube: Infinity,
    },
  }
}

export async function getLimitInfo(
  userId: string,
  action: ActionType
): Promise<LimitInfo> {
  return {
    allowed: true,
    action,
    tier: 'supporter',
    current: 0,
    limit: -1,
    remaining: -1,
    resetAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    daysUntilReset: 30,
  }
}

export async function assertWithinLimit(
  request: Request,
  action: ActionType
): Promise<{ ok: true; userId: string; info: LimitInfo } | { ok: false; response: Response; userId?: string }> {
  const user = await getUserFromRequest(request as any)
  if (!user) {
    return {
      ok: false,
      response: new Response(
        JSON.stringify({ success: false, error: '로그인이 필요합니다.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      ),
    }
  }
  const info = await getLimitInfo(user.id, action)
  return { ok: true, userId: user.id, info }
}

export function getActionLabel(action: ActionType): string {
  return ACTION_LABELS[action]
}
