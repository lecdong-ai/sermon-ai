/**
 * User-scoped localStorage utility.
 * All keys are prefixed with the user ID to prevent data leakage between users on the same browser.
 * Reads the user ID from the Supabase auth session stored in localStorage.
 */

let _cachedUserId: string | null = null

/**
 * Extract user ID from Supabase auth session in localStorage.
 * Supabase stores the session at key: sb-{project-ref}-auth-token
 */
function getUserId(): string | null {
  if (typeof window === 'undefined') return _cachedUserId
  if (_cachedUserId) return _cachedUserId

  try {
    // Find the Supabase auth token key
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.includes('-auth-token')) {
        const raw = localStorage.getItem(key)
        if (raw) {
          const parsed = JSON.parse(raw)
          // Supabase session structure: { access_token, refresh_token, expires_at, user: { id, email, ... } }
          const userId = parsed?.user?.id || parsed?.user?.sub || null
          if (userId) {
            _cachedUserId = userId
            return userId
          }
        }
      }
    }
  } catch {
    // ignore
  }
  return null
}

function scopedKey(key: string): string {
  const uid = getUserId()
  return uid ? `sermonai_${uid}_${key}` : `sermonai_anon_${key}`
}

export function getStorageItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(scopedKey(key))
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function setStorageItem(key: string, value: unknown): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(scopedKey(key), JSON.stringify(value))
  } catch {
    // Storage full or unavailable
  }
}

export function removeStorageItem(key: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(scopedKey(key))
  } catch {
    // Ignore
  }
}

/** Reset cached userId (call after logout) */
export function resetUserCache(): void {
  _cachedUserId = null
}
