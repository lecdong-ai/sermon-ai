'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Cross, Lock, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react'

const supabase = createClient()

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login')
      }
    })
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.')
      return
    }
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
    } else {
      setDone(true)
      setTimeout(() => router.push('/mypage'), 2000)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mx-auto mb-4 shadow-md">
            <Cross className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-[24px] font-extrabold tracking-tight">새 비밀번호 설정</h1>
          <p className="text-[14px] text-[#8b95a1] mt-1">변경할 비밀번호를 입력해주세요</p>
        </div>

        {done ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-emerald-600" />
            </div>
            <p className="text-[16px] font-bold text-[#191f28]">비밀번호가 변경되었습니다</p>
            <p className="text-[14px] text-[#8b95a1]">잠시 후 마이페이지로 이동합니다...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b95a1]" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="새 비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-11 py-3.5 rounded-xl border border-[#e5e8eb] text-[15px] outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8b95a1] hover:text-[#4e5968] transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b95a1]" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="새 비밀번호 확인"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-[#e5e8eb] text-[15px] outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all bg-white"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 text-[13px] text-red-600 bg-red-50 px-3.5 py-2.5 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold text-[16px] hover:shadow-md hover:shadow-primary-200 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50"
            >
              {loading ? '처리 중...' : '비밀번호 변경'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
