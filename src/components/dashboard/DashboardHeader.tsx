'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { LogOut, User, LayoutDashboard } from 'lucide-react'

export default function DashboardHeader() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [plan, setPlan] = useState<string | null>(null)
  const [isSupporter, setIsSupporter] = useState<boolean>(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(null)

  useEffect(() => {
    if (user) {
      fetch('/api/usage')
        .then(r => r.json())
        .then(d => {
          if (!d.error) {
            setPlan(d.plan)
            setIsSupporter(!!d.supporter)
          }
        })
        .catch(() => {})
    }
  }, [user])

  useEffect(() => {
    if (menuOpen && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      setMenuPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right })
    } else {
      setMenuPos(null)
    }
  }, [menuOpen])

  const handleSignOut = async () => {
    setMenuOpen(false)
    await signOut()
    router.push('/')
  }

  if (!user) return null

  return (
    <header className="h-14 border-b border-white/5 bg-[#050814]/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0 relative z-10">
      <button
        onClick={() => router.push('/')}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-white transition-colors font-medium"
      >
        <span>←</span>
        <span>메인 페이지</span>
      </button>

      <div className="flex items-center gap-3">
        {plan && (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[12px] font-bold ${
            (plan === 'pro' || isSupporter)
              ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
              : 'bg-white/5 text-slate-500 border border-white/5'
          }`}>
            {(plan === 'pro' || isSupporter) ? '👑 후원회원' : '일반회원'}
          </span>
        )}

        <div className="relative">
          <button
            ref={btnRef}
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
              <User className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-[13px] font-bold text-slate-200 max-w-[120px] truncate">
              {user.email?.split('@')[0]}
            </span>
          </button>

          {menuOpen && typeof document !== 'undefined' && createPortal(
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              {menuPos && (
                <div
                  className="fixed z-50 w-56 bg-[#0c1020] rounded-2xl shadow-2xl border border-white/10 py-2"
                  style={{ top: menuPos.top, right: menuPos.right }}
                  onClick={e => e.stopPropagation()}
                >
                  <div className="px-4 py-2.5 border-b border-white/5 mb-1.5">
                    <p className="text-[11px] text-slate-500 font-medium">로그인 정보</p>
                    <p className="text-[12px] font-bold text-white truncate mt-0.5">{user.email}</p>
                    {plan && (
                      <div className="mt-1.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          (plan === 'pro' || isSupporter) ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/5 text-slate-500'
                        }`}>
                          {(plan === 'pro' || isSupporter) ? '👑 후원회원' : '일반회원'}
                        </span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => { setMenuOpen(false); router.push('/mypage') }}
                    className="flex items-center gap-2.5 w-full px-4 py-2 text-[13px] font-bold text-slate-300 hover:text-indigo-300 hover:bg-white/5 transition-all"
                  >
                    <User className="w-4 h-4 text-purple-400" />
                    마이페이지
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); router.push('/dashboard') }}
                    className="flex items-center gap-2.5 w-full px-4 py-2 text-[13px] font-bold text-slate-300 hover:text-indigo-300 hover:bg-white/5 transition-all"
                  >
                    <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                    대시보드 홈
                  </button>
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
              )}
            </>,
            document.body
          )}
        </div>
      </div>
    </header>
  )
}
