'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

export default function LoginModal({ next }: { next?: string }) {
  const [loading, setLoading] = useState<string | null>(null)

  const handleOAuth = async (provider: 'kakao' | 'google') => {
    setLoading(provider)
    try {
      const supabase = createClient()
      const redirectTo = next
        ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
        : `${window.location.origin}/auth/callback`

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo },
      })
      if (error) throw error
    } catch (err) {
      console.error(`${provider} OAuth error:`, err)
      setLoading(null)
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-navy-500 text-center">SNS 계정으로 간편 로그인</p>
      <div className="space-y-2.5">
        <button
          onClick={() => handleOAuth('kakao')}
          disabled={!!loading}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-[#FEE500] text-[#3A1D1D] font-bold text-sm hover:bg-[#FDD800] transition-all disabled:opacity-50"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#3A1D1D">
            <path d="M12 3C6.5 3 2 6.58 2 11c0 2.76 1.42 5.2 3.68 6.88L4 22l4.68-2.56C9.7 19.8 10.82 20 12 20c5.5 0 10-3.58 10-8S17.5 3 12 3z"/>
          </svg>
          {loading === 'kakao' ? '카카오 로그인 중...' : '카카오 로그인'}
        </button>
        <button
          onClick={() => handleOAuth('google')}
          disabled={!!loading}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-white text-navy-800 font-bold text-sm border-2 border-warm-200 hover:bg-warm-50 hover:border-navy-300 transition-all disabled:opacity-50"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {loading === 'google' ? '구글 로그인 중...' : '구글 로그인'}
        </button>
      </div>
    </div>
  )
}
