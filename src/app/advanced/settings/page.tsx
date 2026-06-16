'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { resetUserCache } from '@/lib/storage'

export default function SettingsPage() {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const [confirming, setConfirming] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  const handleClearLocalStorage = () => {
    if (confirming !== 'local') {
      setConfirming('local')
      return
    }
    setProcessing(true)
    try {
      // Clear all sermonai keys for current user
      const keysToRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('sermonai_')) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k))
      resetUserCache()
    } finally {
      setProcessing(false)
      setConfirming(null)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    resetUserCache()
    router.push('/login')
  }

  const handleFullReset = () => {
    if (confirming !== 'full') {
      setConfirming('full')
      return
    }
    setProcessing(true)
    try {
      // Clear localStorage
      const keysToRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('sermonai_')) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k))
      resetUserCache()
      // Sign out
      signOut()
      router.push('/login')
    } finally {
      setProcessing(false)
      setConfirming(null)
    }
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-thin">
      <div className="max-w-[720px] mx-auto px-6 py-8 space-y-8">
        <div>
          <h1 className="text-xl font-bold text-white">설정</h1>
          <p className="text-sm text-slate-500 mt-1">데이터 관리 및 초기화</p>
        </div>

        {/* User Info */}
        <div className="bg-[#0a0e1a] border border-white/10 rounded-2xl p-5">
          <h2 className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3">계정 정보</h2>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-xs font-bold text-indigo-300">
              {user?.email?.slice(0, 2).toUpperCase() || '?'}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{user?.email || '로그인 필요'}</p>
              <p className="text-[11px] text-slate-500">ID: {user?.id?.slice(0, 8) || '—'}</p>
            </div>
          </div>
        </div>

        {/* Reset Local Storage */}
        <div className="bg-[#0a0e1a] border border-white/10 rounded-2xl p-5">
          <h2 className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">로컬 데이터 초기화</h2>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            브라우저에 저장된 모든 연구 데이터, 설교 준비, 원고 데이터를 삭제합니다.
            Supabase 서버에 저장된 노트는 유지됩니다.
          </p>
          <button
            onClick={handleClearLocalStorage}
            disabled={processing}
            className={`text-xs px-4 py-2 rounded-xl font-medium transition-all ${
              confirming === 'local'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
                : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-white'
            } disabled:opacity-50`}
          >
            {processing ? '처리 중...' : confirming === 'local' ? '정말 삭제하시겠습니까? 다시 클릭하세요' : '로컬 데이터 삭제'}
          </button>
        </div>

        {/* Full Reset */}
        <div className="bg-[#0a0e1a] border border-red-500/20 rounded-2xl p-5">
          <h2 className="text-[10px] font-semibold text-red-400 uppercase tracking-widest mb-2">전체 초기화 및 로그아웃</h2>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            모든 로컬 데이터를 삭제하고 로그아웃합니다.
            Supabase 서버에 저장된 연구 노트는 유지됩니다.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleFullReset}
              disabled={processing}
              className={`text-xs px-4 py-2 rounded-xl font-medium transition-all ${
                confirming === 'full'
                  ? 'bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30'
                  : 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
              } disabled:opacity-50`}
            >
              {processing ? '처리 중...' : confirming === 'full' ? '정말 초기화하시겠습니까? 다시 클릭하세요' : '전체 초기화'}
            </button>
            <button
              onClick={handleSignOut}
              className="text-xs px-4 py-2 rounded-xl font-medium bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-white transition-all"
            >
              로그아웃만
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
