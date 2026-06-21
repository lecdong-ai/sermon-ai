'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Plus, Sparkles, Bug, User, Heart, LogOut, LayoutDashboard, BookOpen } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import SavedNotesModal from '@/components/advanced/bible/SavedNotesModal'

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
  const { user, signOut } = useAuth()
  const [query, setQuery] = useState('')
  const [mockOn, setMockOn] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showSavedNotes, setShowSavedNotes] = useState(false)
  const [isSupporter, setIsSupporter] = useState<boolean>(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMockOn(getCookie('use_mock') === 'true')
  }, [])

  useEffect(() => {
    if (user) {
      fetch('/api/usage')
        .then(r => r.json())
        .then(d => {
          if (!d.error) {
            setIsSupporter(!!d.supporter)
          }
        })
        .catch(() => {})
    }
  }, [user])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false)
      }
    }
    if (showMenu) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showMenu])

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

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  const emailPrefix = user?.email ? user.email.split('@')[0] : '?'
  const fullEmail = user?.email || '로그인 필요'

  return (
    <>
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

        {/* 사용자 아바타 */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(v => !v)}
            className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-[10px] font-bold text-indigo-300 shadow-md hover:border-indigo-500/40 transition-colors"
          >
            {emailPrefix.slice(0, 2).toUpperCase()}
          </button>

          {/* 드롭다운 메뉴 */}
          {showMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-[#0c1020] border border-white/10 shadow-2xl overflow-hidden animate-in-fast z-50">
              {/* 사용자 정보 */}
              <div className="px-4 py-3 border-b border-white/5">
                <p className="text-[13px] font-bold text-white truncate">{fullEmail}</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isSupporter ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-500/20 text-slate-400'
                  }`}>
                    {isSupporter ? '👑 후원회원' : '일반회원'}
                  </span>
                </div>
              </div>

              {/* 빠른 작업 */}
              <div className="p-1.5 space-y-0.5 border-b border-white/5">
                <button
                  onClick={() => { setShowMenu(false); setShowSavedNotes(true) }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  연구 노트
                </button>
                <button
                  onClick={() => { setShowMenu(false); router.push('/advanced/projects/new') }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] font-medium text-indigo-300 hover:bg-white/5 hover:text-indigo-200 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  새 프로젝트
                </button>
              </div>

              {/* 메뉴 항목 */}
              <div className="p-1.5 space-y-0.5">
                <button
                  onClick={() => { setShowMenu(false); router.push('/mypage') }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  마이페이지
                </button>
                <button
                  onClick={() => { setShowMenu(false); router.push('/support') }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                >
                  <Heart className="w-3.5 h-3.5" />
                  후원 안내
                </button>
              </div>

              {/* 로그아웃 */}
              <div className="p-1.5 border-t border-white/5">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  로그아웃
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>

    {/* Saved Notes Modal */}
    {showSavedNotes && <SavedNotesModal onClose={() => setShowSavedNotes(false)} />}
    </>
  )
}
