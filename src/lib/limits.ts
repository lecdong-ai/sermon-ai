import { supabaseAdmin } from './supabase'
import { isAdmin } from './admin'
import { getUserFromRequest } from './auth'

/**
 * 회원 등급별 한도 시스템
 *
 * 일반 회원:
 *   - AI 분석 6종: 10편/30일
 *   - 새 설교 등록 (manual): 10편/30일
 *   - 말씀 연구실 (project): 1편/30일
 *   - 유튜브: 1회/30일
 *
 * 사역 동참자:
 *   - AI 분석 6종: 20편/30일
 *   - 새 설교 등록: 20편/30일
 *   - 설교 프로젝트: 20편/30일
 *   - 유튜브: 10회/30일
 *
 * 리셋: 가입일 기준 30일 롤링
 */

export type ActionType = 'ai_analysis' | 'manual_sermon' | 'project' | 'youtube'

export type Tier = 'general' | 'supporter'

const DAY_MS = 30 * 24 * 60 * 60 * 1000

const GENERAL_LIMITS = {
  ai_analysis: 10,
  manual_sermon: 10,
  project: 1,
  youtube: 1,
}

const SUPPORTER_LIMITS = {
  ai_analysis: 20,
  manual_sermon: 20,
  project: 20,
  youtube: 10,
}

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

/** 30일 롤링 기간 계산 */
export function getCurrentPeriod(signupDate: Date | string, now: Date = new Date()) {
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

/** 사역 동참자 여부 확인 (기간 포함) */
export async function isActiveSupporter(userId: string): Promise<boolean> {
  try {
    const { data: user } = await supabaseAdmin.auth.admin.getUserById(userId).catch(() => ({ data: null }))
    const meta = (user?.user?.app_metadata as any) || {}
    if (meta.supporter_until && new Date(meta.supporter_until) > new Date()) {
      return true
    }
  } catch {}
  try {
    const { data: usage } = await supabaseAdmin
      .from('user_usage')
      .select('supporter_until')
      .eq('user_id', userId)
      .maybeSingle()
    if (usage?.supporter_until && new Date(usage.supporter_until) > new Date()) {
      return true
    }
  } catch {}
  return false
}

/** grace_period_end 확인 — 유예 중이면 true */
export async function isInGracePeriod(userId: string): Promise<boolean> {
  try {
    const { data } = await supabaseAdmin
      .from('user_usage')
      .select('grace_period_end')
      .eq('user_id', userId)
      .maybeSingle()
    if (data?.grace_period_end && new Date(data.grace_period_end) > new Date()) {
      return true
    }
  } catch {}
  return false
}

/** 사용자 usage 정보 조회 (한도 + 가입일) */
export async function getUserLimits(userId: string): Promise<{
  tier: Tier
  signupDate: string | null
  gracePeriodEnd: string | null
  limits: Record<ActionType, number>
}> {
  const supporter = await isActiveSupporter(userId)
  const tier: Tier = supporter ? 'supporter' : 'general'
  const limits = supporter ? SUPPORTER_LIMITS : GENERAL_LIMITS

  let signupDate: string | null = null
  let gracePeriodEnd: string | null = null
  try {
    const { data } = await supabaseAdmin
      .from('user_usage')
      .select('signup_date, grace_period_end')
      .eq('user_id', userId)
      .maybeSingle()
    signupDate = data?.signup_date || null
    gracePeriodEnd = data?.grace_period_end || null
  } catch {}

  return { tier, signupDate, gracePeriodEnd, limits }
}

/** sermons 테이블 카운트 (source 조건) */
async function countSermonsInPeriod(
  userId: string,
  sourceFilter: 'upload' | 'not_upload',
  periodStart: Date
): Promise<number> {
  let q = supabaseAdmin
    .from('sermons')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', periodStart.toISOString())

  if (sourceFilter === 'upload') {
    q = q.eq('source', 'upload')
  } else {
    q = q.neq('source', 'upload')
  }

  const { count } = await q
  return count || 0
}

/** youtube_analyses 카운트 */
async function countYoutubeInPeriod(userId: string, periodStart: Date): Promise<number> {
  const { count } = await supabaseAdmin
    .from('youtube_analyses')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', periodStart.toISOString())

  return count || 0
}

/** ppt_image_generations 카운트 (슬라이드 장 단위) */
async function countPptImageInPeriod(userId: string, periodStart: Date): Promise<number> {
  const { count, error } = await supabaseAdmin
    .from('ppt_image_generations')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', periodStart.toISOString())

  if (error) {
    // 테이블이 아직 없을 수 있음 → 0으로 처리
    return 0
  }
  return count || 0
}

/** PPT 이미지 생성 기록 insert (슬라이드 장 수만큼) */
export async function recordPptImageGenerations(
  userId: string,
  sermonId: string | null,
  count: number,
  mode: 'hybrid' | 'full',
): Promise<void> {
  if (count <= 0) return
  const now = new Date().toISOString()
  const rows = Array.from({ length: count }, () => ({
    user_id: userId,
    sermon_id: sermonId,
    mode,
    created_at: now,
  }))
  await supabaseAdmin.from('ppt_image_generations').insert(rows)
}

/** 사용자 등급 + 한도 정보 조회 (UI 표시용) */
export async function getLimitInfo(
  userId: string,
  action: ActionType
): Promise<LimitInfo> {
  const { tier, signupDate, gracePeriodEnd, limits } = await getUserLimits(userId)
  const limit = limits[action]

  // 유예 기간 중이면 한도 검사 우회 (무제한)
  const inGrace = gracePeriodEnd && new Date(gracePeriodEnd) > new Date()

  if (!signupDate) {
    // 가입일 정보 없음 → 무제한
    return {
      allowed: true,
      action,
      tier,
      current: 0,
      limit: -1,
      remaining: -1,
      resetAt: new Date(Date.now() + DAY_MS).toISOString(),
      daysUntilReset: 30,
    }
  }

  const { periodEnd, daysUntilReset } = getCurrentPeriod(signupDate)

  // 유예 중: 카운트만 표시, 허용
  if (inGrace) {
    return {
      allowed: true,
      action,
      tier,
      current: 0,
      limit: -1,
      remaining: -1,
      resetAt: periodEnd.toISOString(),
      daysUntilReset,
      message: '기존 정책 유예 기간 중',
    }
  }

  // 한도 0 = 사역 동참자 전용 (project, youtube)
  if (limit === 0) {
    return {
      allowed: false,
      action,
      tier: 'general',
      current: 0,
      limit: 0,
      remaining: 0,
      resetAt: periodEnd.toISOString(),
      daysUntilReset,
      reason: 'supporter_only',
      upgradeUrl: '/support',
      message: `${ACTION_LABELS[action]}은 사역 동참자 전용입니다.`,
    }
  }

  // 카운트 조회
  let current = 0
  const periodStart = new Date(periodEnd.getTime() - DAY_MS)
  if (action === 'ai_analysis') {
    current = await countSermonsInPeriod(userId, 'upload', periodStart)
  } else if (action === 'manual_sermon') {
    current = await countSermonsInPeriod(userId, 'not_upload', periodStart)
  } else if (action === 'youtube') {
    current = await countYoutubeInPeriod(userId, periodStart)
  } else if (action === 'project') {
    // project는 localStorage → 0으로 가정 (실제 카운트 없음)
    // UI에서 클라이언트 측에서 addCustomProject 후 로컬 체크
    current = 0
  }

  const remaining = Math.max(0, limit - current)
  const allowed = current < limit

  return {
    allowed,
    action,
    tier,
    current,
    limit,
    remaining,
    resetAt: periodEnd.toISOString(),
    daysUntilReset,
    reason: allowed ? undefined : 'limit_reached',
    upgradeUrl: allowed ? undefined : '/support',
    message: allowed
      ? undefined
      : `${ACTION_LABELS[action]}은 ${daysUntilReset}일 후 리셋됩니다 (월 ${limit}편/30일).`,
  }
}

/** API 핸들러용 — 한도 초과 시 응답 반환 */
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
  // 관리자는 우회
  if (await isAdmin(user.id)) {
    const info = await getLimitInfo(user.id, action)
    return { ok: true, userId: user.id, info }
  }

  const info = await getLimitInfo(user.id, action)

  if (!info.allowed) {
    return {
      ok: false,
      userId: user.id,
      response: new Response(
        JSON.stringify({
          success: false,
          error: info.reason === 'supporter_only' ? 'supporter_only' : 'limit_reached',
          message: info.message,
          details: {
            action: info.action,
            current: info.current,
            limit: info.limit,
            resetAt: info.resetAt,
            daysUntilReset: info.daysUntilReset,
          },
          upgradeUrl: info.upgradeUrl,
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      ),
    }
  }

  return { ok: true, userId: user.id, info }
}

/** 클라이언트 표시용 라벨 */
export function getActionLabel(action: ActionType): string {
  return ACTION_LABELS[action]
}
