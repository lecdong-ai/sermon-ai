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
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/40 backdrop-blur-xl border-b border-slate-200/30">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* SermonAI 신설 로고 브랜딩 */}
        <Link href="/" className="flex items-center gap-2.5 group ml-[1.5cm]">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/10 group-hover:scale-105 group-hover:rotate-6 transition-all duration-300">
            <Cross className="w-5 h-5 text-white" />
          </div>
          <span className="text-[19px] font-extrabold tracking-tight font-outfit text-gradient">
            SermonAI
          </span>
        </Link>

        <nav className="flex items-center gap-3 mr-8">
          <button
            onClick={toggleMock}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium border transition-all duration-200 ${
              mockOn
                ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                : 'bg-slate-100/60 border-slate-200/50 text-slate-500 hover:bg-slate-200/60'
            }`}
            title={mockOn ? 'Mock 데이터 사용 중 (클릭 시 해제)' : 'Mock 데이터 사용 (클릭 시 활성화)'}
          >
            <Bug className={`w-3.5 h-3.5 ${mockOn ? 'text-amber-500 animate-pulse' : ''}`} />
            {mockOn ? 'Mock 켜짐' : 'Mock'}
          </button>

          {loading ? (
            <div className="w-8 h-8 rounded-full bg-slate-200/60 animate-pulse" />
          ) : user ? (
            <>
              {/* 요금제 배지 */}
              {plan && (
                <span className={`hidden sm:inline-flex items-center px-2.5 py-1 rounded-lg text-[12px] font-bold ${
                  plan === 'pro'
                    ? 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-600 border border-indigo-200/50'
                    : plan === 'none'
                    ? 'bg-slate-100/60 text-slate-500 border border-slate-200/50'
                    : 'bg-emerald-50 text-emerald-600 border border-emerald-200/50'
                }`}>
                  {plan === 'pro' ? '👑 Pro' : plan === 'none' ? 'Free' : '🎁 Trial'}
                </span>
              )}

              <Link
                href="/pricing"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-100/60 transition-all"
              >
                <CreditCard className="w-4 h-4" />
                요금제
              </Link>
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-100/60 border border-transparent hover:border-slate-200/30 transition-all duration-200"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
                    <User className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-[14px] font-semibold text-slate-700 hidden sm:block max-w-[120px] truncate">
                    {user.email?.split("@")[0]}
                  </span>
                </button>

                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200/60 py-2 z-50 animate-scale">
                      <div className="px-4 py-2.5 border-b border-slate-200/40 mb-1.5">
                        <p className="text-[12px] text-slate-400 font-medium">로그인 정보</p>
                        <p className="text-[13px] font-bold text-slate-800 truncate mt-0.5">{user.email}</p>
                        {plan && (
                          <div className="mt-1.5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                              plan === 'pro'
                                ? 'bg-indigo-100 text-indigo-700'
                                : plan === 'none'
                                ? 'bg-slate-100 text-slate-500'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}>
{plan === 'pro' ? '👑 Pro' : plan === 'basic' ? 'Basic' : '🎁 Trial'}
                            </span>
                          </div>
                        )}
                      </div>
                      <Link
                        href="/pricing"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-[14px] font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-all"
                      >
                        <CreditCard className="w-4 h-4 text-emerald-500" />
                        요금제
                      </Link>
                      <Link
                        href="/dashboard"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-[14px] font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-all"
                      >
                        <LayoutDashboard className="w-4 h-4 text-indigo-500" />
                        대시보드
                      </Link>
                      <Link
                        href="/mypage"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-[14px] font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-all"
                      >
                        <User className="w-4 h-4 text-purple-500" />
                        마이페이지
                      </Link>
                      <div className="border-t border-slate-200/40 mt-1.5 pt-1.5">
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-2.5 w-full px-4 py-2 text-[14px] font-semibold text-rose-500 hover:text-rose-600 hover:bg-rose-50/50 transition-all"
                        >
                          <LogOut className="w-4 h-4 text-rose-500" />
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
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200/60 text-slate-700 text-[14px] font-bold hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
              >
                <CreditCard className="w-3.5 h-3.5" />
                요금제
              </Link>
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-600 text-white text-[14px] font-bold hover:shadow-lg hover:shadow-indigo-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
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
