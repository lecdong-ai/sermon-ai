'use client'

import { useEffect, useState, memo } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { LogIn, User, LogOut, LayoutDashboard, Cross, Heart, ScrollText, Crown } from 'lucide-react'
import { useAuth } from './AuthProvider'

export default memo(function Header() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const isHome = pathname === '/'
  const [menuOpen, setMenuOpen] = useState(false)
  const [supporter, setSupporter] = useState<{ active: boolean; until: string | null } | null>(null)

  useEffect(() => {
    if (user) {
      fetch('/api/usage')
        .then(r => r.json())
        .then(d => { if (!d.error) setSupporter({ active: d.supporter, until: d.supporter_until }) })
        .catch(() => {})
    }
  }, [user])

  const handleSignOut = async () => {
    setMenuOpen(false)
    await signOut()
    router.push('/')
  }

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isHome
        ? 'bg-[#0B1020]/80 backdrop-blur-md border-b border-white/10 text-white shadow-lg shadow-black/10'
        : 'bg-[#050814]/85 backdrop-blur-md border-b border-white/5 text-white shadow-lg shadow-black/20'
    }`}>
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Bunker 목양 로고 브랜딩 */}
        <Link href="/" className="flex items-center gap-2.5 group ml-[0.5cm]">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200 ${
            isHome
              ? 'bg-indigo-600 group-hover:bg-indigo-500'
              : 'bg-gradient-to-br from-indigo-500 to-purple-600 group-hover:from-indigo-400 group-hover:to-purple-500 shadow-lg shadow-indigo-500/20'
          }`}>
            <Cross className="w-4 h-4 text-white" />
          </div>
          <span className={`text-[18px] font-bold tracking-tight transition-colors duration-200 ${
            isHome ? 'text-white' : 'text-white'
          }`}>
            Bunker 목양
          </span>
        </Link>

        <nav className="flex items-center gap-2 mr-8">
          {loading ? (
            <div className={`w-8 h-8 rounded-full animate-pulse ${isHome ? 'bg-white/10' : 'bg-white/5'}`} />
          ) : user ? (
            <>
              {/* 후원 상태 */}
              {supporter && (
                <span className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[12px] font-bold ${
                  supporter.active
                    ? isHome
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                    : isHome
                    ? 'bg-white/10 text-slate-300 border border-white/10'
                    : 'bg-white/5 text-slate-400 border border-white/10'
                }`}>
                  {supporter.active ? '🏅 후원회원' : '일반회원'}
                </span>
              )}

              <Link
                href="/support"
                className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all ${
                  isHome
                    ? 'text-slate-300 hover:text-white hover:bg-white/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
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
                      : 'hover:bg-white/5 hover:border-white/10'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isHome ? 'bg-indigo-600' : 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md shadow-indigo-500/20'}`}>
                    <User className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className={`text-[14px] font-bold hidden sm:block max-w-[120px] truncate ${isHome ? 'text-white' : 'text-slate-200'}`}>
                    {user.email?.split("@")[0]}
                  </span>
                </button>

                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-52 bg-[#0c1020] rounded-2xl shadow-2xl shadow-black/40 border border-white/10 py-2 z-50">
                      <div className="px-4 py-2.5 border-b border-white/5 mb-1.5">
                        <p className="text-[12px] text-slate-500 font-medium">로그인 정보</p>
                        <p className="text-[13px] font-bold text-white truncate mt-0.5">{user.email}</p>
                        {supporter && (
                          <div className="mt-1.5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                              supporter.active
                                ? 'bg-indigo-500/15 text-indigo-300'
                                : 'bg-white/5 text-slate-500'
                            }`}>
                              {supporter.active ? '🏅 후원회원' : '일반회원'}
                            </span>
                          </div>
                        )}
                      </div>
                      <Link
                        href="/support"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-[13px] font-bold text-slate-300 hover:text-indigo-300 hover:bg-white/5 transition-all"
                      >
                        <Heart className="w-4 h-4 text-rose-400" />
                        후원 안내
                      </Link>
                      <Link
                        href="/dashboard"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-[13px] font-bold text-slate-300 hover:text-indigo-300 hover:bg-white/5 transition-all"
                      >
                        <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                        설교 아카이브
                      </Link>
                      {supporter?.active ? (
                        <Link
                          href="/advanced/bible"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-[13px] font-bold text-indigo-300 hover:text-indigo-200 hover:bg-indigo-500/10 transition-all"
                        >
                          <ScrollText className="w-4 h-4 text-indigo-400" />
                          말씀 연구실
                          <Crown className="w-3.5 h-3.5 ml-auto text-indigo-400" />
                        </Link>
                      ) : (
                        <Link
                          href="/support"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-[13px] font-bold text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all"
                          title="후원회원 전용 메뉴입니다"
                        >
                          <ScrollText className="w-4 h-4 text-slate-600" />
                          <span>말씀 연구실</span>
                          <span className="ml-auto text-[9px] font-bold text-amber-400 bg-amber-500/15 px-1.5 py-0.5 rounded-full border border-amber-500/20">
                            👑 후원 전용
                          </span>
                        </Link>
                      )}
                      <Link
                        href="/mypage"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-[13px] font-bold text-slate-300 hover:text-indigo-300 hover:bg-white/5 transition-all"
                      >
                        <User className="w-4 h-4 text-indigo-400" />
                        마이페이지
                      </Link>
                      <div className="border-t border-white/5 mt-1.5 pt-1.5">
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-2.5 w-full px-4 py-2 text-[13px] font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
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
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[14px] font-bold transition-all duration-200 ${
                isHome
                  ? 'bg-indigo-600 text-white hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 hover:shadow-lg hover:shadow-indigo-500/30'
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
