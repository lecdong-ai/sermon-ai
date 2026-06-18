'use client'

import { useEffect, useState, memo } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Bug, LogIn, User, LogOut, LayoutDashboard, Cross, Heart } from 'lucide-react'
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
  const pathname = usePathname()
  const isHome = pathname === '/'
  const [mockOn, setMockOn] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [supporter, setSupporter] = useState<{ active: boolean; until: string | null } | null>(null)

  useEffect(() => {
    setMockOn(getCookie('use_mock') === 'true')
  }, [])

  useEffect(() => {
    if (user) {
      fetch('/api/usage')
        .then(r => r.json())
        .then(d => { if (!d.error) setSupporter({ active: d.supporter, until: d.supporter_until }) })
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
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isHome 
        ? 'bg-[#0B1020]/80 backdrop-blur-md border-b border-white/10 text-white shadow-lg shadow-black/10' 
        : 'bg-white border-b border-[#e4e2dd] text-[#2c2a29]'
    }`}>
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Bunker 목양 로고 브랜딩 */}
        <Link href="/" className="flex items-center gap-2.5 group ml-[0.5cm]">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200 ${
            isHome 
              ? 'bg-indigo-600 group-hover:bg-indigo-500' 
              : 'bg-[#8d7a5b] group-hover:bg-[#7a694e]'
          }`}>
            <Cross className="w-4 h-4 text-white" />
          </div>
          <span className={`text-[18px] font-bold tracking-tight transition-colors duration-200 ${
            isHome ? 'text-white' : 'text-[#2c2a29]'
          }`}>
            Bunker 목양
          </span>
        </Link>

        <nav className="flex items-center gap-2 mr-8">
          {user?.email === 'lecdong@gmail.com' && (
            <button
              onClick={toggleMock}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium border transition-all duration-200 ${
                mockOn
                  ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                  : isHome
                  ? 'bg-white/10 border-white/10 text-slate-300 hover:bg-white/20'
                  : 'bg-[#f5f4f0] border-[#e4e2dd] text-[#8a8580] hover:bg-[#eae8e3]'
              }`}
              title={mockOn ? 'Mock 데이터 사용 중 (클릭 시 해제)' : 'Mock 데이터 사용 (클릭 시 활성화)'}
            >
              <Bug className={`w-3.5 h-3.5 ${mockOn ? 'text-amber-500 animate-pulse' : ''}`} />
              {mockOn ? 'Mock 켜짐' : 'Mock'}
            </button>
          )}

          {loading ? (
            <div className={`w-8 h-8 rounded-full animate-pulse ${isHome ? 'bg-white/10' : 'bg-[#e4e2dd]'}`} />
          ) : user ? (
            <>
              {/* 후원 상태 */}
              {supporter && (
                <span className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[12px] font-bold ${
                  supporter.active
                    ? isHome
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                    : isHome
                    ? 'bg-white/10 text-slate-300 border border-white/10'
                    : 'bg-[#f5f4f0] text-[#8a8580] border border-[#e4e2dd]'
                }`}>
                  {supporter.active ? '🏅 후원회원' : '일반회원'}
                </span>
              )}

              <Link
                href="/support"
                className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all ${
                  isHome 
                    ? 'text-slate-300 hover:text-white hover:bg-white/10' 
                    : 'text-[#6b6764] hover:text-[#2c2a29] hover:bg-[#f5f4f0]'
                }`}
              >
                <Heart className="w-4 h-4" />
                후원하기
              </Link>
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border border-transparent transition-all duration-200 ${
                    isHome 
                      ? 'hover:bg-white/10 hover:border-white/10' 
                      : 'hover:bg-[#f5f4f0] hover:border-[#e4e2dd]'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isHome ? 'bg-indigo-600' : 'bg-[#8d7a5b]'}`}>
                    <User className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className={`text-[14px] font-medium hidden sm:block max-w-[120px] truncate ${isHome ? 'text-white' : 'text-[#2c2a29]'}`}>
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
                        {supporter && (
                          <div className="mt-1.5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                              supporter.active
                                ? 'bg-rose-50 text-rose-700'
                                : 'bg-[#f5f4f0] text-[#8a8580]'
                            }`}>
                              {supporter.active ? '🏅 후원회원' : '일반회원'}
                            </span>
                          </div>
                        )}
                      </div>
                      <Link
                        href="/support"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-[13px] font-medium text-[#4a4744] hover:text-[#2c2a29] hover:bg-[#f5f4f0] transition-all"
                      >
                        <Heart className="w-4 h-4 text-rose-500" />
                        후원 안내
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
            <Link
              href="/login"
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[14px] font-medium transition-all duration-200 ${
                isHome
                  ? 'bg-indigo-600 text-white hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20'
                  : 'bg-[#2c2a29] text-white hover:bg-[#1e1d1c]'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              로그인
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
})
