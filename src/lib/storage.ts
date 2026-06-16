/**
 * User-scoped localStorage utility.
 * All keys are prefixed with the user ID to prevent data leakage between users on the same browser.
 */

function getUserId(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(/(?:^| )sb-[^-]+-auth-token=([^;]+)/)
  if (match) {
    try {
      const token = decodeURIComponent(match[1])
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.sub || null
    } catch {
      return null
    }
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
