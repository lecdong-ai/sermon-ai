'use client'

import { useEffect, useState, memo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Bug, LogIn, User, LogOut, LayoutDashboard, Cross, BookOpen, FileText, CreditCard } from 'lucide-react'
import { useAuth } from './AuthProvider'

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`))
  return match ? decodeURIComponent(match[2]) : null
}

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=31536000; SameSite=None; Secure`
}

export default memo(function Header() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [mockOn, setMockOn] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [plan, setPlan] = useState<string | null>(null)

  useEffect(() => {
    setMockOn(getCookie('use_mock') === 'true')
  }, [])

  useEffect(() => {
    if (user) {
      fetch('/api/usage')
        .then(r => r.json())
        .then(d => { if (!d.error) setPlan(d.plan) })
        .catch(() => {})
    }
  }, [user])

  const toggleMock = () => {
    const next = !mockOn
    setMockOn(next)
    setCookie('use_mock', next ? 'true' : 'false')
    window.location.reload()
  }

  const handleSignOut = async () => {
    setMenuOpen(false)
    await signOut()
    router.push('/')
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#e4e2dd]">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* SermonAI 로고 브랜딩 */}
        <Link href="/" className="flex items-center gap-2.5 group ml-[1.5cm]">
          <div className="w-8 h-8 rounded-lg bg-[#8d7a5b] flex items-center justify-center group-hover:bg-[#7a694e] transition-colors duration-200">
            <Cross className="w-4 h-4 text-white" />
          </div>
          <span className="text-[18px] font-bold tracking-tight text-[#2c2a29]">
            SermonAI
          </span>
        </Link>

        <nav className="flex items-center gap-2 mr-8">
          {user?.email === 'lecdong@gmail.com' && (
            <button
              onClick={toggleMock}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium border transition-all duration-200 ${
                mockOn
                  ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                  : 'bg-[#f5f4f0] border-[#e4e2dd] text-[#8a8580] hover:bg-[#eae8e3]'
              }`}
              title={mockOn ? 'Mock 데이터 사용 중 (클릭 시 해제)' : 'Mock 데이터 사용 (클릭 시 활성화)'}
            >
              <Bug className={`w-3.5 h-3.5 ${mockOn ? 'text-amber-500 animate-pulse' : ''}`} />
              {mockOn ? 'Mock 켜짐' : 'Mock'}
            </button>
          )}

          {loading ? (
            <div className="w-8 h-8 rounded-full bg-[#e4e2dd] animate-pulse" />
          ) : user ? (
            <>
              {/* 요금제 배지 */}
              {plan && (
                <span className={`hidden sm:inline-flex items-center px-2.5 py-1 rounded-lg text-[12px] font-bold ${
                  plan === 'pro'
                    ? 'bg-[#eae7e0] text-[#8d7a5b] border border-[#d4d1c9]'
                    : plan === 'none'
                    ? 'bg-[#f5f4f0] text-[#8a8580] border border-[#e4e2dd]'
                    : 'bg-[#f5f4f0] text-[#6b6764] border border-[#e4e2dd]'
                }`}>
                  {plan === 'pro' ? '✦ Pro' : plan === 'basic' ? 'Basic' : '🎁 Trial'}
                </span>
              )}

              <Link
                href="/pricing"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium text-[#6b6764] hover:text-[#2c2a29] hover:bg-[#f5f4f0] transition-all"
              >
                <CreditCard className="w-4 h-4" />
                요금제
              </Link>
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-[#f5f4f0] border border-transparent hover:border-[#e4e2dd] transition-all duration-200"
                >
                  <div className="w-7 h-7 rounded-full bg-[#8d7a5b] flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-[14px] font-medium text-[#2c2a29] hidden sm:block max-w-[120px] truncate">
                    {user.email?.split("@")[0]}
                  </span>
                </button>

                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-[#e4e2dd] py-2 z-50">
                      <div className="px-4 py-2.5 border-b border-[#e4e2dd]/60 mb-1.5">
                        <p className="text-[12px] text-[#8a8580] font-medium">로그인 정보</p>
                        <p className="text-[13px] font-bold text-[#2c2a29] truncate mt-0.5">{user.email}</p>
                        {plan && (
                          <div className="mt-1.5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                              plan === 'pro'
                                ? 'bg-[#eae7e0] text-[#8d7a5b]'
                                : plan === 'none'
                                ? 'bg-[#f5f4f0] text-[#8a8580]'
                                : 'bg-[#f5f4f0] text-[#6b6764]'
                            }`}>
                              {plan === 'pro' ? '✦ Pro' : plan === 'basic' ? 'Basic' : '🎁 Trial'}
                            </span>
                          </div>
                        )}
                      </div>
                      <Link
                        href="/pricing"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-[13px] font-medium text-[#4a4744] hover:text-[#2c2a29] hover:bg-[#f5f4f0] transition-all"
                      >
                        <CreditCard className="w-4 h-4 text-[#8d7a5b]" />
                        요금제
                      </Link>
                      <Link
                        href="/dashboard"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-[13px] font-medium text-[#4a4744] hover:text-[#2c2a29] hover:bg-[#f5f4f0] transition-all"
                      >
                        <LayoutDashboard className="w-4 h-4 text-[#8d7a5b]" />
                        설교 아카이브
                      </Link>
                      <Link
                        href="/mypage"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-[13px] font-medium text-[#4a4744] hover:text-[#2c2a29] hover:bg-[#f5f4f0] transition-all"
                      >
                        <User className="w-4 h-4 text-[#8d7a5b]" />
                        마이페이지
                      </Link>
                      <div className="border-t border-[#e4e2dd]/60 mt-1.5 pt-1.5">
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-2.5 w-full px-4 py-2 text-[13px] font-medium text-red-500 hover:text-red-600 hover:bg-red-50/60 transition-all"
                        >
                          <LogOut className="w-4 h-4 text-red-400" />
                          로그아웃
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                href="/pricing"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-[#e4e2dd] text-[#4a4744] text-[14px] font-medium hover:bg-[#f5f4f0] transition-all duration-200"
              >
                <CreditCard className="w-3.5 h-3.5" />
                요금제
              </Link>
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2c2a29] text-white text-[14px] font-medium hover:bg-[#1e1d1c] transition-all duration-200"
              >
                <LogIn className="w-3.5 h-3.5" />
                로그인
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
})
