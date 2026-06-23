'use client'

import { useEffect } from 'react'

const SESSION_KEY = 'bunker_visitor_session'
const SESSION_DURATION_MS = 30 * 60 * 1000 // 30분

function getDevice(): 'mobile' | 'desktop' | 'tablet' {
  if (typeof window === 'undefined') return 'desktop'
  const ua = navigator.userAgent
  if (/tablet|ipad/i.test(ua)) return 'tablet'
  if (/mobile|android|iphone/i.test(ua)) return 'mobile'
  return 'desktop'
}

function getOrCreateSession(): string {
  if (typeof window === 'undefined') return ''
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as { id: string; expires: number }
      if (parsed.expires > Date.now()) {
        // 갱신
        parsed.expires = Date.now() + SESSION_DURATION_MS
        localStorage.setItem(SESSION_KEY, JSON.stringify(parsed))
        return parsed.id
      }
    }
    const newId = crypto.randomUUID
      ? crypto.randomUUID()
      : `s-${Date.now()}-${Math.random().toString(36).slice(2)}`
    const payload = { id: newId, expires: Date.now() + SESSION_DURATION_MS }
    localStorage.setItem(SESSION_KEY, JSON.stringify(payload))
    return newId
  } catch {
    return `s-${Date.now()}`
  }
}

export default function VisitorTracker() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    // admin 페이지는 추적 안 함 (자체 조회시 카운트 폭증 방지)
    if (window.location.pathname.startsWith('/admin')) return
    // track-visitor API 자체 호출도 제외
    if (window.location.pathname.startsWith('/api/')) return

    const sessionId = getOrCreateSession()
    const device = getDevice()
    const path = window.location.pathname

    // beacon으로 비동기 전송 (페이지 떠도 안전)
    try {
      const body = JSON.stringify({ path, device, sessionId })
      if (navigator.sendBeacon) {
        const blob = new Blob([body], { type: 'application/json' })
        navigator.sendBeacon('/api/track-visitor', blob)
      } else {
        fetch('/api/track-visitor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
          keepalive: true,
        }).catch(() => {})
      }
    } catch {}
  }, [])

  return null
}
