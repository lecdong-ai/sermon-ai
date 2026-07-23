'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import ActivityHeatmap from '@/components/mypage/ActivityHeatmap'
import { getCustomProjects } from '@/lib/advanced/customProjects'
import {
  Mail, LogOut, KeyRound, Sparkles,
  ChevronRight, AlertCircle, CheckCircle,
  Edit3, ArrowUpRight, Quote, Copy, Check,
  BookOpen, Wand2, Presentation, Calendar,
  Shield, Lightbulb, Activity, User, Heart
} from 'lucide-react'

interface Profile {
  id: string
  email: string
  name: string
  updated_at?: string
}

const DAILY_VERSES = [
  { verse: '너는 내게 부르짖으라. 내가 네게 응답하겠고 네가 보지 못하던 큰 일과 알지 못하던 비밀 일을 네게 보일 것이니라.', ref: 'Jeremiah 33:3' },
  { verse: '여호와는 나의 목자시니 내게 부족함이 없으리로다.', ref: 'Psalms 23:1' },
  { verse: '항상 기뻐하라 쉬지 말고 기도하라 범사에 감사하라.', ref: '1 Thessalonians 5:16-18' },
  { verse: '너의 행사를 여호와께 맡기라 그러하면 네 모략이 성립하리라.', ref: 'Proverbs 16:3' },
  { verse: '두려워하지 말라 내가 너와 함께 함이니라 놀라지 말라 나는 네 하나님이 됨이라.', ref: 'Isaiah 41:10' },
  { verse: '오직 여호와를 바라는 자는 새 힘을 얻으리니 독수리가 날개치며 올라감 같을 것이요.', ref: 'Isaiah 40:31' },
]

export default function MyPage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)
  const [editingName, setEditingName] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [counts, setCounts] = useState<{ projects: number; inProgress: number; notes: number; completed: number; archived: number }>({
    projects: 0, inProgress: 0, notes: 0, completed: 0, archived: 0,
  })
  const [activities, setActivities] = useState<string[]>([])
  const [copied, setCopied] = useState(false)

  const loadAll = useCallback(async () => {
    if (!user) return
    setProfileLoading(true)
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data: p } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      if (p) {
        setProfile(p)
        setName(p.name || '')
      }

      const [sermonsRes, insightsRes, localProjects] = await Promise.all([
        fetch('/api/sermons').then(r => r.json()).catch(() => ({ data: [] })),
        fetch('/api/insights').then(r => r.json()).catch(() => ({ data: [] })),
        Promise.resolve(getCustomProjects()),
      ])
      const apiSermons: any[] = Array.isArray(sermonsRes?.data) ? sermonsRes.data : []
      const insightsList = Array.isArray(insightsRes?.data) ? insightsRes.data : []

      const byId = new Map<string, any>()
      for (const s of apiSermons) byId.set(s.id, s)
      for (const s of localProjects) byId.set(s.id, s)
      const sermonList = Array.from(byId.values())

      const completed = sermonList.filter((s: any) => s.status === 'completed').length
      const archived = sermonList.filter((s: any) => s.status === 'archived').length
      const inProgress = sermonList.filter((s: any) => !['completed', 'archived'].includes(s.status)).length
      setCounts({
        projects: sermonList.length,
        inProgress,
        notes: insightsList.length,
        completed,
        archived,
      })

      const acts: string[] = []
      for (const s of sermonList) {
        if (s.createdAt) acts.push(s.createdAt)
        if (s.updatedAt && s.updatedAt !== s.createdAt) acts.push(s.updatedAt)
      }
      for (const n of insightsList) {
        if (n.createdAt) acts.push(n.createdAt)
        if (n.updatedAt && n.updatedAt !== n.createdAt) acts.push(n.updatedAt)
      }
      setActivities(acts)
    } catch (e) {
      console.error('mypage load error:', e)
    } finally {
      setProfileLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/mypage')
      return
    }
    if (user) loadAll()
  }, [user, loading, loadAll, router])

  const saveProfile = async () => {
    if (!user) return
    setSaving(true)
    setSaveMessage(null)
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { error } = await supabase.from('user_profiles').upsert({
        id: user.id,
        email: user.email,
        name: name.trim(),
        updated_at: new Date().toISOString(),
      })
      if (error) {
        setSaveMessage({ kind: 'error', text: `저장 실패: ${error.message}` })
      } else {
        setSaveMessage({ kind: 'success', text: '프로필이 변경되었습니다.' })
        setEditingName(false)
        loadAll()
      }
    } catch (e: any) {
      setSaveMessage({ kind: 'error', text: `오류: ${e?.message || '네트워크 오류'}` })
    } finally {
      setSaving(false)
      setTimeout(() => setSaveMessage(null), 3000)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const handleDeleteAccount = async () => {
    if (deleting) return
    if (!confirm('정말 탈퇴하시겠습니까?\n\n모든 사역 데이터가 삭제되며 복구할 수 없습니다.')) return
    if (!confirm('최종 확인: 정말 회원 탈퇴를 진행하시겠습니까?')) return
    setDeleting(true)
    try {
      const res = await fetch('/api/auth/delete', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        await signOut()
        router.push('/')
      } else {
        alert('탈퇴 처리 중 오류: ' + (data.error || '알 수 없는 오류'))
      }
    } catch (err: any) {
      alert('탈퇴 처리 중 오류: ' + (err?.message || '네트워크 오류'))
    } finally {
      setDeleting(false)
    }
  }

  const copyEmail = async () => {
    if (!user?.email) return
    try {
      await navigator.clipboard.writeText(user.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  if (loading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] bg-[#070913]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-medium">마이페이지 정보 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  const displayName = profile?.name || user.email?.split('@')[0] || '사역자'
  const initial = displayName.slice(0, 1).toUpperCase()
  const joinDate = user.created_at ? new Date(user.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' }) : ''
  const daysSinceJoin = user.created_at
    ? Math.max(1, Math.floor((Date.now() - new Date(user.created_at).getTime()) / 86400000))
    : 1

  const todayVerse = DAILY_VERSES[new Date().getDate() % DAILY_VERSES.length]

  return (
    <div className="min-h-screen bg-[#070913] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white pb-24">

      {/* ════════════════════════════════════════════
          1. HEADER PROFILE BANNER
         ════════════════════════════════════════════ */}
      <section className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-[#0c1024] via-[#080b1a] to-[#070913] pt-12 pb-10 md:pt-16 md:pb-12">
        <div className="absolute top-0 right-1/4 w-[500px] h-[300px] bg-indigo-600/10 blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-10 w-[400px] h-[250px] bg-rose-600/10 blur-[100px] pointer-events-none rounded-full" />

        <div className="container-custom max-w-6xl">
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">

              {/* Avatar & Main Profile Info */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left min-w-0">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-700 p-1 shadow-lg shadow-indigo-500/20">
                    <div className="w-full h-full bg-[#0d1127] rounded-[22px] flex items-center justify-center text-3xl sm:text-4xl font-extrabold text-white">
                      {initial}
                    </div>
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-[#070913] flex items-center justify-center text-[10px] text-white font-black shadow-xs" title="온라인">
                    ✓
                  </span>
                </div>

                {/* Info & Name Editor */}
                <div className="space-y-2.5 min-w-0">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[11px] font-bold">
                      ✨ 인증 사역자
                    </span>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-bold">
                      100% 영구 무료 계정
                    </span>
                  </div>

                  {editingName ? (
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="이름 입력"
                        className="px-3 py-1.5 rounded-xl bg-white/10 border border-indigo-400/50 text-white text-base font-bold focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={saveProfile}
                        disabled={saving}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold transition-all shadow-xs"
                      >
                        {saving ? '저장 중...' : '저장'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingName(false)}
                        className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-medium transition-all"
                      >
                        취소
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center sm:justify-start gap-2 group">
                      <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                        {displayName}
                      </h1>
                      <button
                        type="button"
                        onClick={() => setEditingName(true)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                        title="이름 수정"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Email & Join Stats */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-400 font-medium">
                    <button
                      type="button"
                      onClick={copyEmail}
                      className="inline-flex items-center gap-1.5 hover:text-white transition-colors bg-white/5 px-2.5 py-1 rounded-lg border border-white/5"
                      title="이메일 복사"
                    >
                      <Mail className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{user.email}</span>
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 opacity-60" />}
                    </button>

                    {joinDate && (
                      <span className="text-slate-400">
                        🗓️ {joinDate} 가입 · <strong className="text-indigo-300">{daysSinceJoin}일째</strong> 동행 중
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-auto shrink-0">
                <Link
                  href="/advanced"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-500/20 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  설교 워크스페이스
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/school/"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm border border-white/10 transition-all"
                >
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  교회학교 솔루션
                </Link>
              </div>

            </div>

            {saveMessage && (
              <div className={`mt-4 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                saveMessage.kind === 'error' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {saveMessage.kind === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle className="w-4 h-4 shrink-0" />}
                <span>{saveMessage.text}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          2. MINISTRY METRICS CARDS (사역 현황 통계)
         ════════════════════════════════════════════ */}
      <section className="py-8">
        <div className="container-custom max-w-6xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs uppercase tracking-wider text-slate-400 font-extrabold flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              사역 현황 요약
            </h2>
            <span className="text-[11px] text-slate-500">실시간 데이터 업데이트</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
            <div className="bg-white/[0.03] backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/10 hover:border-indigo-500/40 hover:-translate-y-1 transition-all">
              <p className="text-[11px] text-slate-400 font-bold mb-1">전체 설교</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-black text-white">{counts.projects}</span>
                <span className="text-xs text-slate-400">편</span>
              </div>
            </div>

            <div className="bg-white/[0.03] backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/10 hover:border-amber-500/40 hover:-translate-y-1 transition-all">
              <p className="text-[11px] text-amber-400/90 font-bold mb-1">진행 중 설교</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-black text-amber-300">{counts.inProgress}</span>
                <span className="text-xs text-slate-400">편</span>
              </div>
            </div>

            <div className="bg-white/[0.03] backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/10 hover:border-emerald-500/40 hover:-translate-y-1 transition-all">
              <p className="text-[11px] text-emerald-400/90 font-bold mb-1">완료된 설교</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-black text-emerald-300">{counts.completed}</span>
                <span className="text-xs text-slate-400">편</span>
              </div>
            </div>

            <div className="bg-white/[0.03] backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/10 hover:border-purple-500/40 hover:-translate-y-1 transition-all">
              <p className="text-[11px] text-purple-400/90 font-bold mb-1">통찰 노트</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-black text-purple-300">{counts.notes}</span>
                <span className="text-xs text-slate-400">개</span>
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-white/[0.03] backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/10 hover:border-indigo-500/40 hover:-translate-y-1 transition-all">
              <p className="text-[11px] text-slate-400 font-bold mb-1">보관된 설교</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-black text-slate-300">{counts.archived}</span>
                <span className="text-xs text-slate-400">편</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          3. QUICK SOLUTIONS GRID (핵심 사역 바로가기)
         ════════════════════════════════════════════ */}
      <section className="py-8">
        <div className="container-custom max-w-6xl space-y-4">
          <h2 className="text-xs uppercase tracking-wider text-slate-400 font-extrabold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            핵심 사역 워크스페이스 바로가기
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* 1. 설교 프로젝트 */}
            <Link
              href="/advanced/projects"
              className="bg-white/[0.025] hover:bg-white/[0.05] rounded-3xl p-6 border border-white/10 hover:border-indigo-400/40 transition-all group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform border border-indigo-500/30">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors flex items-center justify-between">
                    <span>설교 프로젝트</span>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    본문 연구부터 개요 작성, 대지 구성 및 완성형 설교 보관함
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
                <span>프로젝트 {counts.projects}개 진행 중</span>
                <span className="text-indigo-400 font-bold">열기 →</span>
              </div>
            </Link>

            {/* 2. 공지문 작성기 */}
            <Link
              href="/school/notice-writer"
              className="bg-white/[0.025] hover:bg-white/[0.05] rounded-3xl p-6 border border-white/10 hover:border-emerald-400/40 transition-all group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform border border-emerald-500/30">
                  <Wand2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors flex items-center justify-between">
                    <span>스마트 공지문 작성기</span>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    상황과 대상별 AI 맞춤 4가지 공지 시안 실시간 생성 & 복사
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
                <span>SMS · 카톡 · 가정통신문</span>
                <span className="text-emerald-400 font-bold">작성하기 →</span>
              </div>
            </Link>

            {/* 3. PPT 스튜디오 */}
            <Link
              href="/school/pptx"
              className="bg-white/[0.025] hover:bg-white/[0.05] rounded-3xl p-6 border border-white/10 hover:border-purple-400/40 transition-all group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform border border-purple-500/30">
                  <Presentation className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors flex items-center justify-between">
                    <span>PPT 스튜디오</span>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    예배 및 교육용 프레젠테이션 템플릿 실시간 제작 & 다운로드
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
                <span>프리미엄 템플릿 무제한</span>
                <span className="text-purple-400 font-bold">제작하기 →</span>
              </div>
            </Link>

            {/* 4. 행사 관리 */}
            <Link
              href="/school/events/manage"
              className="bg-white/[0.025] hover:bg-white/[0.05] rounded-3xl p-6 border border-white/10 hover:border-rose-400/40 transition-all group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform border border-rose-500/30">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-rose-300 transition-colors flex items-center justify-between">
                    <span>교회학교 행사 관리</span>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    모바일 참가 신청 링크 생성, 출석 체크인 및 명단 관리
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
                <span>신청자 엑셀/CSV 지원</span>
                <span className="text-rose-400 font-bold">관리하기 →</span>
              </div>
            </Link>

            {/* 5. QT 아카이브 */}
            <Link
              href="/qt"
              className="bg-white/[0.025] hover:bg-white/[0.05] rounded-3xl p-6 border border-white/10 hover:border-amber-400/40 transition-all group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform border border-amber-500/30">
                  <Heart className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors flex items-center justify-between">
                    <span>QT 아카이브</span>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    세대별(유치/초등/청소년) QT 나눔 자료 및 묵상 아카이브
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
                <span>매일 묵상 나눔</span>
                <span className="text-amber-400 font-bold">묵상하기 →</span>
              </div>
            </Link>

            {/* 6. 통찰 노트 */}
            <Link
              href="/advanced/notes"
              className="bg-white/[0.025] hover:bg-white/[0.05] rounded-3xl p-6 border border-white/10 hover:border-sky-400/40 transition-all group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center group-hover:scale-110 transition-transform border border-sky-500/30">
                  <Lightbulb className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors flex items-center justify-between">
                    <span>통찰 노트</span>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    묵상 아이디어, 성경 구절 스크랩 및 사역 메모 보관함
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
                <span>노트 {counts.notes}개 저장됨</span>
                <span className="text-sky-400 font-bold">열기 →</span>
              </div>
            </Link>

          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          4. ACTIVITY HEATMAP & DAILY VERSE
         ════════════════════════════════════════════ */}
      <section className="py-8">
        <div className="container-custom max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Heatmap */}
            <div className="lg:col-span-8 space-y-3">
              <h2 className="text-xs uppercase tracking-wider text-slate-400 font-extrabold flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                사역활동 기록 (Activity Heatmap)
              </h2>
              <ActivityHeatmap activities={activities} title="나의 사역 발자취" />
            </div>

            {/* Daily Verse Card */}
            <div className="lg:col-span-4 space-y-3">
              <h2 className="text-xs uppercase tracking-wider text-slate-400 font-extrabold flex items-center gap-2">
                <Quote className="w-4 h-4 text-amber-400" />
                오늘의 묵상 말씀
              </h2>
              
              <div className="bg-gradient-to-br from-indigo-950/60 via-[#0d122b] to-purple-950/40 rounded-3xl p-6 sm:p-7 border border-indigo-500/30 shadow-xl space-y-4 relative overflow-hidden">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-500/30">
                  <Quote className="w-5 h-5" />
                </div>

                <p className="text-xs sm:text-sm text-slate-100 font-serif leading-relaxed tracking-wide italic">
                  &quot;{todayVerse.verse}&quot;
                </p>

                <div className="pt-2 border-t border-indigo-500/20 flex items-center justify-between text-xs">
                  <span className="text-indigo-300 font-bold font-sans">— {todayVerse.ref}</span>
                  <span className="text-[10px] text-slate-400">매일 새로운 묵상</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          5. ACCOUNT & SECURITY SETTINGS
         ════════════════════════════════════════════ */}
      <section className="py-8">
        <div className="container-custom max-w-6xl space-y-4">
          <h2 className="text-xs uppercase tracking-wider text-slate-400 font-extrabold flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-400" />
            계정 정보 및 보안 관리
          </h2>

          <div className="bg-white/[0.03] backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden divide-y divide-white/10">
            
            {/* Account Details */}
            <div className="p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400">계정 이메일</p>
                <p className="text-sm font-semibold text-white">{user.email}</p>
              </div>
              <div className="space-y-1 sm:text-right">
                <p className="text-xs font-bold text-slate-400">플랜 상태</p>
                <p className="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30 inline-block">
                  영구 무료 목회자 멤버십
                </p>
              </div>
            </div>

            {/* Security Options */}
            <div className="p-6 sm:p-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                href="/auth/reset-password"
                className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">비밀번호 변경</p>
                    <p className="text-[11px] text-slate-400">비밀번호 재설정 링크 발송</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
              </Link>

              <button
                type="button"
                onClick={handleSignOut}
                className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
                    <LogOut className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">안전 로그아웃</p>
                    <p className="text-[11px] text-slate-400">현재 세션 종료 및 로그아웃</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Danger Zone */}
            <div className="p-4 sm:p-5 bg-red-950/10 flex items-center justify-between gap-4">
              <div className="text-xs text-slate-400">
                서비스를 더 이상 이용하지 않으시나요?
              </div>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="px-4 py-2 rounded-xl text-xs font-bold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all disabled:opacity-50"
              >
                {deleting ? '처리 중...' : '회원 탈퇴'}
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-16 text-center text-xs text-slate-600 font-medium">
        Bunker 목양 · 사역자의 더 나은 내일을 위해 함께합니다.
      </footer>

    </div>
  )
}
