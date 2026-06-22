// Simple in-memory rate limiter for OpenAI calls (single-instance dev/prod)
// Prevents cost bombs. User-based when authenticated, IP-based otherwise.

interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

// Cleanup expired entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [k, v] of Array.from(buckets)) {
    if (now > v.resetAt) buckets.delete(k)
  }
}, 60_000).unref()

export interface RateLimitConfig {
  /** Max requests per window */
  max: number
  /** Window in seconds */
  windowSec: number
}

export type RateLimitResult =
  | { allowed: true; remaining: number; resetAt: number }
  | { allowed: false; retryAfterSec: number }

export function checkRate(
  key: string,
  config: RateLimitConfig,
): RateLimitResult {
  const now = Date.now()
  const windowMs = config.windowSec * 1000
  const existing = buckets.get(key)

  if (!existing || now > existing.resetAt) {
    const resetAt = now + windowMs
    buckets.set(key, { count: 1, resetAt })
    return { allowed: true, remaining: config.max - 1, resetAt }
  }

  if (existing.count >= config.max) {
    return { allowed: false, retryAfterSec: Math.ceil((existing.resetAt - now) / 1000) }
  }

  existing.count++
  return {
    allowed: true,
    remaining: config.max - existing.count,
    resetAt: existing.resetAt,
  }
}

/** Per-user (if authenticated) or per-IP (fallback) rate limit for OpenAI endpoints. */
export function checkOpenAIRate(request: Request, userId: string | null, config?: Partial<RateLimitConfig>): RateLimitResult {
  const cfg: RateLimitConfig = { max: 20, windowSec: 60, ...config }
  let key: string
  if (userId) {
    key = `u:${userId}`
  } else {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown'
    key = `ip:${ip}`
  }
  return checkRate(key, cfg)
}
