'use client'

import { useState, useEffect } from 'react'
import { Lock, LogIn, Loader2, ShieldCheck } from 'lucide-react'

const SESSION_KEY = 'qt_admin_authenticated'
const SESSION_EXPIRY = 2 * 60 * 60 * 1000 // 2 hours

interface AdminGateProps {
  children: React.ReactNode
}

export function AdminGate({ children }: AdminGateProps) {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY)
    if (stored) {
      try {
        const { expiry } = JSON.parse(stored)
        if (Date.now() < expiry) {
          setAuthenticated(true)
        } else {
          sessionStorage.removeItem(SESSION_KEY)
        }
      } catch {
        sessionStorage.removeItem(SESSION_KEY)
      }
    }
    setChecking(false)
  }, [])

  const handleLogin = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (!res.ok) {
        setError('비밀번호가 일치하지 않습니다')
        return
      }

      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ expiry: Date.now() + SESSION_EXPIRY }))
      setAuthenticated(true)
    } catch {
      setError('인증 확인 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-5 h-5 animate-spin text-accent" />
      </div>
    )
  }

  if (authenticated) {
    return <>{children}</>
  }

  return (
    <div className="flex items-center justify-center py-20 px-4">
      <div className="w-full max-w-sm">
        <div className="bg-surface rounded-2xl border border-border p-8 shadow-elevated text-center space-y-6">
          <div className="w-14 h-14 rounded-full bg-accent-soft mx-auto flex items-center justify-center">
            <ShieldCheck className="w-7 h-7 text-accent" />
          </div>

          <div className="space-y-1">
            <h2 className="font-serif text-h2 text-foreground">관리자 접근</h2>
            <p className="text-meta text-foreground-muted">자료 업로드 및 관리를 위해 인증이 필요합니다</p>
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); handleLogin() }}
            className="space-y-4"
          >
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-subtle" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="관리자 비밀번호"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface-2 text-foreground text-meta placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
                autoFocus
              />
            </div>

            {error && (
              <p className="text-[12px] text-red-500">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-2.5 rounded-xl bg-accent text-white font-medium text-meta hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {loading ? '확인 중...' : '로그인'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
