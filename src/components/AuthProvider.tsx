'use client'

import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { resetUserCache } from '@/lib/storage'
import type { User, SupabaseClient } from '@supabase/supabase-js'

interface AuthValue {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthCtx = createContext<AuthValue>({ user: null, loading: true, signOut: async () => {} })

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabaseRef = useRef<SupabaseClient | null>(null)

  useEffect(() => {
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

  return (
    <AuthCtx.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthCtx.Provider>
  )
}

export const useAuth = () => useContext(AuthCtx)
