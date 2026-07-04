interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

const cleanupInterval = setInterval(() => {
  const now = Date.now()
  for (const [k, v] of Array.from(buckets)) {
    if (now > v.resetAt) buckets.delete(k)
  }
}, 60_000)
if (typeof cleanupInterval?.unref === 'function') {
  cleanupInterval.unref()
}

export interface RateLimitConfig {
  max: number
  windowSec: number
}

export type RateLimitResult =
  | { allowed: true; remaining: number; resetAt: number }
  | { allowed: false; retryAfterSec: number }

export function checkRate(key: string, config: RateLimitConfig): RateLimitResult {
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
