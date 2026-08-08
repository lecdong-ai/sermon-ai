'use client'

import { Suspense, useState, useCallback } from 'react'
import { createClient, hasSupabaseClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Cross, Mail, Lock, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-[#e5e8eb]" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary-500 animate-spin" />
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validatePassword(password: string) {
  if (password.length < 6) return '비밀번호는 최소 6자 이상이어야 합니다.'
  return null
}

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams?.get('redirect') || '/'
  const [supabase] = useState(() => {
    if (!hasSupabaseClient()) return null as any
    return createClient()
  })
  const isSupabaseReady = hasSupabaseClient()

  const validate = useCallback(() => {
    const errors: { email?: string; password?: string } = {}
    if (!email.trim()) errors.email = '이메일을 입력해주세요.'
    else if (!validateEmail(email)) errors.email = '올바른 이메일 형식이 아닙니다.'
    if (mode !== 'reset') {
      if (!password) errors.password = '비밀번호를 입력해주세요.'
      else {
        const pwErr = validatePassword(password)
        if (pwErr) errors.password = pwErr
      }
    }
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }, [email, password, mode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setResetSent(false)
    if (!isSupabaseReady) { setError('Supabase 인증이 구성되지 않았습니다.'); return }
    if (!validate()) return

    setLoading(true)

    if (mode === 'reset') {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${location.origin}/auth/callback?next=/mypage`,
      })
      if (error) setError(error.message)
      else setResetSent(true)
      setLoading(false)
      return
    }

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('이메일 또는 비밀번호가 올바르지 않습니다.')
        } else if (error.message.includes('Email not confirmed')) {
          setError('이메일 인증이 완료되지 않았습니다. 메일함을 확인해주세요.')
        } else {
          setError(error.message)
        }
      } else {
        router.push(redirect)
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: `${location.origin}/auth/callback` },
      })
      if (error) {
        if (error.message.includes('already registered')) {
          setError('이미 가입된 이메일입니다. 로그인해주세요.')
        } else {
          setError(error.message)
        }
      } else {
        setError('')
        setMode('login')
        setPassword('')
        setResetSent(true)
      }
    }
    setLoading(false)
  }

  const handleKakao = async () => {
    if (!isSupabaseReady) return
    setLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: `${location.origin}/auth/callback?next=${redirect}`,
        scopes: 'profile_nickname, profile_image',
      },
    })
    setLoading(false)
  }

  const handleGoogle = async () => {
    if (!isSupabaseReady) return
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback?next=${redirect}`,
      },
    })
    if (error) setError(error.message)
    setLoading(false)
  }

  const switchMode = (newMode: 'login' | 'signup' | 'reset') => {
    setMode(newMode)
    setError('')
    setFieldErrors({})
    setResetSent(false)
    setShowPassword(false)
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mx-auto mb-4 shadow-md">
            <Cross className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-[24px] font-extrabold tracking-tight">
            {mode === 'login' ? '로그인' : mode === 'signup' ? '회원가입' : '비밀번호 재설정'}
          </h1>
          <p className="text-[14px] text-[#8b95a1] mt-1">
            {mode === 'login' && '목회자 AI 솔루션에 오신 것을 환영합니다'}
            {mode === 'signup' && '새 계정을 만들어보세요'}
            {mode === 'reset' && '가입한 이메일을 입력해주세요'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b95a1]" />
              <input
                type="email"
                placeholder="이메일 주소"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: undefined })) }}
                className={`w-full pl-10 pr-4 py-3.5 rounded-xl border text-[15px] outline-none transition-all bg-white ${
                  fieldErrors.email ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100' : 'border-[#e5e8eb] focus:border-primary-400 focus:ring-2 focus:ring-primary-100'
                }`}
              />
            </div>
            {fieldErrors.email && (
              <p className="text-[12px] text-red-500 mt-1 ml-1">{fieldErrors.email}</p>
            )}
          </div>

          {mode !== 'reset' && (
            <div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b95a1]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="비밀번호"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: undefined })) }}
                  className={`w-full pl-10 pr-11 py-3.5 rounded-xl border text-[15px] outline-none transition-all bg-white ${
                    fieldErrors.password ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100' : 'border-[#e5e8eb] focus:border-primary-400 focus:ring-2 focus:ring-primary-100'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8b95a1] hover:text-[#4e5968] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-[12px] text-red-500 mt-1 ml-1">{fieldErrors.password}</p>
              )}
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 text-[13px] text-red-600 bg-red-50 px-3.5 py-2.5 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {resetSent && mode === 'login' && (
            <div className="flex items-start gap-2 text-[13px] text-emerald-600 bg-emerald-50 px-3.5 py-2.5 rounded-lg">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>회원가입 확인 이메일이 발송되었습니다. 메일함을 확인해주세요.</span>
            </div>
          )}

          {resetSent && mode === 'reset' && (
            <div className="flex items-start gap-2 text-[13px] text-emerald-600 bg-emerald-50 px-3.5 py-2.5 rounded-lg">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>비밀번호 재설정 링크가 이메일로 발송되었습니다. 메일함을 확인해주세요.</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold text-[16px] hover:shadow-md hover:shadow-primary-200 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                처리 중...
              </span>
            ) : mode === 'login' ? '로그인' : mode === 'signup' ? '회원가입' : '재설정 링크 보내기'}
          </button>
        </form>

        {mode !== 'reset' && (
          <>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#e5e8eb]" />
              </div>
              <div className="relative flex justify-center text-[13px]">
                <span className="px-3 bg-white text-[#8b95a1]">또는</span>
              </div>
            </div>

            <button
              onClick={handleKakao}
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#FEE500] text-[#191919] font-bold text-[16px] flex items-center justify-center gap-2 hover:bg-[#FDD800] hover:shadow-md transition-all duration-200 disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#191919">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-1-3-3-1 3-1 1-3 1 3 3 1-3 1-1 3z" />
              </svg>
              카카오 로그인
            </button>

            <button
              onClick={handleGoogle}
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-white text-[#191f28] font-bold text-[16px] flex items-center justify-center gap-2.5 border border-[#e5e8eb] hover:bg-[#f7f8fa] hover:shadow-md transition-all duration-200 disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google 로그인
            </button>
          </>
        )}

        <div className="text-center text-[14px] text-[#8b95a1] mt-6 space-y-2">
          {mode === 'login' && (
            <>
              <p>
                계정이 없으신가요?{' '}
                <button onClick={() => switchMode('signup')} className="text-primary-500 font-medium hover:underline">
                  회원가입
                </button>
              </p>
              <p>
                <button onClick={() => switchMode('reset')} className="text-[#8b95a1] hover:text-primary-500 hover:underline text-[13px]">
                  비밀번호를 잊으셨나요?
                </button>
              </p>
            </>
          )}
          {mode === 'signup' && (
            <p>
              이미 계정이 있으신가요?{' '}
              <button onClick={() => switchMode('login')} className="text-primary-500 font-medium hover:underline">
                로그인
              </button>
            </p>
          )}
          {mode === 'reset' && (
            <p>
              <button onClick={() => switchMode('login')} className="text-primary-500 font-medium hover:underline">
                로그인으로 돌아가기
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
