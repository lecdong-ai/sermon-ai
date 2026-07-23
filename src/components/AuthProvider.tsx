'use client'

import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { resetUserCache } from '@/lib/storage'
import type { User, SupabaseClient } from '@supabase/supabase-js'

interface AuthValue {
  user: User | null
  loading: boolean
  isLoggedIn: boolean
  signOut: () => Promise<void>
  logout: () => Promise<void>
  refreshUser?: () => Promise<void>
  isPremium?: boolean
}

const defaultSignOut = async () => {}
const AuthCtx = createContext<AuthValue>({ user: null, loading: true, isLoggedIn: false, signOut: defaultSignOut, logout: defaultSignOut })

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabaseRef = useRef<SupabaseClient | null>(null)

  useEffect(() => {
    // 개발 환경이고 localStorage에 bypass_auth=true가 있거나 URL 파라미터에 ?bypass=true가 있으면 mock user로 인증 우회
    if (process.env.NODE_ENV === 'development') {
      try {
        if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search)
          if (params.get('bypass') === 'true') {
            localStorage.setItem('bypass_auth', 'true')
          }

          if (localStorage.getItem('bypass_auth') === 'true') {
            setUser({
              id: 'mock-user-uuid-1234-5678',
              email: 'test@example.com',
              user_metadata: { name: '테스트 목회자' },
              app_metadata: {},
              aud: 'authenticated',
              created_at: new Date().toISOString(),
            } as any)
            setLoading(false)
            return
          }
        }
      } catch (e) {
        console.warn('Auth bypass check failed:', e)
      }
    }

    if (!supabaseRef.current) {
      try {
        supabaseRef.current = createClient()
      } catch {
        setLoading(false)
        return
      }
    }
    const supabase = supabaseRef.current
    if (!supabase) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const signOut = useCallback(async () => {
    if (supabaseRef.current) {
      await supabaseRef.current.auth.signOut()
    }
    resetUserCache()
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    if (supabaseRef.current) {
      const { data: { user: refreshed } } = await supabaseRef.current.auth.getUser()
      if (refreshed) setUser(refreshed)
    }
  }, [])

  return (
    <AuthCtx.Provider value={{ user, loading, isLoggedIn: !!user, signOut, logout: signOut, refreshUser, isPremium: false }}>
      {children}
    </AuthCtx.Provider>
  )
}

export const useAuth = () => useContext(AuthCtx)
