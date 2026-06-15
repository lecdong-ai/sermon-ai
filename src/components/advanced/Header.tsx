'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Plus, Sparkles, Bug } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'

function getCookie(name: string): string {
  if (typeof document === 'undefined') return ''
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`))
  return match ? decodeURIComponent(match[2]) : ''
}

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=86400`
}

export default function AdvancedHeader() {
  const router = useRouter()
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [mockOn, setMockOn] = useState(false)

  useEffect(() => {
    setMockOn(getCookie('use_mock') === 'true')
  }, [])

  const toggleMock = () => {
    const next = !mockOn
    setMockOn(next)
    setCookie('use_mock', next ? 'true' : 'false')
    window.location.reload()
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/advanced/projects?search=${encodeURIComponent(query.trim())}`)
    }
  }

  const emailPrefix = user?.email ? user.email.split('@')[0] : '?'
  const fullEmail = user?.email || '로그인 필요'

  return (
    <header className="h-14 border-b border-white/5 bg-[#050814]/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0 relative z-10">
      <form onSubmit={handleSearch} className="flex-1 max-w-sm">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="설교, 성경 구절, 주제, 노트 통합 검색..."
            className="w-full text-[13px] bg-[#0c1020] border border-white/5 rounded-xl pl-9 pr-3 py-1.5 text-slate-200 placeholder:text-slate-600 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all font-medium"
          />
        </div>
      </form>
      <div className="flex items-center gap-4">
        {/* AI 인텔리전스 상태 */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[11px] font-bold text-indigo-300">
          <Sparkles className="w-3 h-3 text-indigo-400 animate-pulse" />
          AI Engine Online
        </div>

        {/* Mock 토글 */}
        <button
          onClick={toggleMock}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border ${
            mockOn
              ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
              : 'bg-white/5 border-white/5 text-slate-500 hover:text-slate-300 hover:bg-white/10'
          }`}
          title={mockOn ? 'Mock 데이터 사용 중 (클릭 시 해제)' : 'Mock 데이터 사용 (클릭 시 활성화)'}
        >
          <Bug className={`w-3 h-3 ${mockOn ? 'text-amber-400 animate-pulse' : ''}`} />
          {mockOn ? 'Mock' : 'Mock'}
        </button>

        {/* 새 프로젝트 버튼 */}
        <button
          onClick={() => router.push('/advanced/projects/new')}
          className="text-[12px] bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-xl transition-all font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/15 hover:shadow-indigo-600/25 hover:-translate-y-0.5"
        >
          <Plus className="w-3.5 h-3.5" />
          새 프로젝트
        </button>

        {/* 사용자 정보 */}
        <div
          className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-[10px] font-bold text-indigo-300 shadow-md cursor-default relative group"
          title={fullEmail}
        >
          {emailPrefix.slice(0, 2).toUpperCase()}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 rounded-lg bg-[#0c1020] border border-white/10 text-[10px] text-slate-300 font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
            {fullEmail}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0c1020]" />
          </div>
        </div>
      </div>
    </header>
  )
}
