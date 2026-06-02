'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { LogOut, User, LayoutDashboard } from 'lucide-react'

export default function DashboardHeader() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [plan, setPlan] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (user) {
      fetch('/api/usage')
        .then(r => r.json())
        .then(d => { if (!d.error) setPlan(d.plan) })
        .catch(() => {})
    }
  }, [user])

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  if (!user) return null

  return (
    <header className="h-14 border-b border-border bg-surface flex items-center justify-between px-6 shrink-0">
      <button
        onClick={() => router.push('/')}
        className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
      >
        <span>←</span>
        <span className="font-medium">메인 페이지</span>
      </button>

      <div className="flex items-center gap-3">
        {plan && (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[12px] font-bold ${
            plan === 'pro'
              ? 'bg-indigo-50 text-indigo-600 border border-indigo-200/50'
              : plan === 'none'
              ? 'bg-slate-100 text-slate-500 border border-slate-200/50'
              : 'bg-emerald-50 text-emerald-600 border border-emerald-200/50'
          }`}>
            {plan === 'pro' ? '👑 Pro' : plan === 'none' ? 'Free' : '🎁 Trial'}
          </span>
        )}

        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-background transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
              <User className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-[13px] font-semibold text-foreground max-w-[120px] truncate">
              {user.email?.split('@')[0]}
            </span>
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200/60 py-2 z-50">
                <div className="px-4 py-2.5 border-b border-slate-200/40 mb-1.5">
                  <p className="text-[11px] text-slate-400 font-medium">로그인 정보</p>
                  <p className="text-[12px] font-bold text-slate-800 truncate mt-0.5">{user.email}</p>
                  {plan && (
                    <div className="mt-1.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        plan === 'pro' ? 'bg-indigo-100 text-indigo-700' : plan === 'none' ? 'bg-slate-100 text-slate-500' : 'bg-emerald-100 text-emerald-700'
                      }`}>
{plan === 'pro' ? '👑 Pro' : plan === 'basic' ? 'Basic' : '🎁 Trial'}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => { setMenuOpen(false); router.push('/mypage') }}
                  className="flex items-center gap-2.5 w-full px-4 py-2 text-[13px] font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-all"
                >
                  <User className="w-4 h-4 text-purple-500" />
                  마이페이지
                </button>
                <button
                  onClick={() => { setMenuOpen(false); router.push('/dashboard') }}
                  className="flex items-center gap-2.5 w-full px-4 py-2 text-[13px] font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-all"
                >
                  <LayoutDashboard className="w-4 h-4 text-indigo-500" />
                  대시보드 홈
                </button>
                <div className="border-t border-slate-200/40 mt-1.5 pt-1.5">
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2.5 w-full px-4 py-2 text-[13px] font-semibold text-rose-500 hover:text-rose-600 hover:bg-rose-50/50 transition-all"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    로그아웃
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
