'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { resetUserCache } from '@/lib/storage'
import { CheckCircle2 } from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const [confirming, setConfirming] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)

  const clearAllLocalData = (): number => {
    // 삭제 대상: sermonai_* (user-scoped) + 비-scoped 앱 데이터
    // 보존: sb-*-auth-token (Supabase 세션), theme/UI 설정
    const APP_KEY_PATTERNS = [
      /^sermonai_/,           // user-scoped 데이터
      /^custom_projects$/,    // custom projects (전역)
      /^sermon-options$/,     // dashboard 설정
      /^loom_/,               // SermonLoom
      /^sermon-wizard-/,      // SermonWizard 초안
    ]
    let removed = 0
    const toRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key) continue
      if (APP_KEY_PATTERNS.some(re => re.test(key))) {
        toRemove.push(key)
      }
    }
    toRemove.forEach(k => { localStorage.removeItem(k); removed++ })
    resetUserCache()
    return removed
  }

  const handleClearLocalStorage = () => {
    if (confirming !== 'local') {
      setConfirming('local')
      setMessage(null)
      return
    }
    setProcessing(true)
    setMessage(null)
    try {
      const removed = clearAllLocalData()
      setMessage({ type: 'ok', text: `${removed}개 항목을 삭제했습니다. 페이지를 새로고침하면 변경 사항이 반영됩니다.` })
    } catch (e: any) {
      setMessage({ type: 'error', text: e?.message || '삭제 중 오류가 발생했습니다.' })
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

  const handleFullReset = async () => {
    if (confirming !== 'full') {
      setConfirming('full')
      setMessage(null)
      return
    }
    setProcessing(true)
    setMessage(null)
    try {
      // 1. 클라우드 Supabase DB에서 내 모든 설교, 시리즈, 강해, 큐티 데이터 일괄 삭제
      const res = await fetch('/api/user/reset-all', { method: 'POST' })
      const resData = await res.json()
      if (!resData.success) {
        throw new Error(resData.error || 'DB 초기화에 실패했습니다.')
      }

      // 2. 로컬 브라우저 캐시 삭제
      clearAllLocalData()
      setMessage({ type: 'ok', text: '내 모든 설교, 강해, 시리즈 및 연구 데이터가 DB에서 완벽하게 초기화되었습니다.' })
    } catch (e: any) {
      setMessage({ type: 'error', text: e?.message || '초기화 중 오류가 발생했습니다.' })
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

        {message && (
          <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
            message.type === 'ok'
              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
          }`}>
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {message.text}
          </div>
        )}

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
            이 브라우저에 저장된 모든 로컬 데이터(연구 노트, 설교 준비, 원고, 커스텀 프로젝트, SermonLoom, Wizard 초안)를 삭제합니다.
            Supabase 서버에 저장된 데이터는 유지됩니다.
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
