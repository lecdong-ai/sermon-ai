'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import ActivityHeatmap from '@/components/mypage/ActivityHeatmap'
import { getCustomProjects } from '@/lib/advanced/customProjects'
import {
  Mail, LogOut, KeyRound, Shield, Crown, Sparkles,
  BookOpen, Network, BrainCircuit, Archive, ChevronRight, AlertCircle,
  CheckCircle, Edit3, ExternalLink, ArrowUpRight,
  Quote, Copy, Check, Heart, Users,
} from 'lucide-react'

interface UsageInfo {
  supporter: boolean
  supporter_until: string | null
  plan: string
  monthly_limit: number
  monthly_used: number
  workspace_limit: number
  workspace_used: number
  limits?: {
    tier: 'general' | 'supporter'
    inGracePeriod: boolean
    gracePeriodEnd: string | null
    resetAt: string
    daysUntilReset: number
    actions: {
      ai_analysis: { current: number; limit: number; remaining: number; allowed: boolean }
      manual_sermon: { current: number; limit: number; remaining: number; allowed: boolean }
      project: { current: number; limit: number; remaining: number; allowed: boolean }
      youtube: { current: number; limit: number; remaining: number; allowed: boolean }
    }
  }
}

interface Profile {
  id: string
  email: string
  name: string
  updated_at?: string
}

const DAILY_VERSES = [
  '"너는 내게 부르짖으라. 내가 네게 응답하겠고 네가 보지 못하던 큰 일과 알지 못하던 비밀 일을 네게 보일 것이니라." — 렘 33:3',
  '"내가 너와 함께 있으리라 네가 어디로 가든지 네게 확신하고 너를 이 모든 고난에서 건져내리라." — 행 11:15-16',
  '"여호와는 나의 목자시니 내게 부족함이 없으리로다." — 시 23:1',
  '"항상 기뻐하라 쉬지 말고 기도하라 범사에 감사하라." — 살전 5:16-18',
  '"너의 행사를 여호와께 맡기라 그러하면 네 모략이 성립하리라." — 잠 16:3',
  '"두려워하지 말라 내가 너와 함께 함이니라." — 사 41:10',
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
  const [usage, setUsage] = useState<UsageInfo | null>(null)
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

      const [usageRes, sermonsRes, insightsRes, localProjects] = await Promise.all([
        fetch('/api/usage').then(r => r.json()).catch(() => null),
        fetch('/api/sermons').then(r => r.json()).catch(() => ({ data: [] })),
        fetch('/api/insights').then(r => r.json()).catch(() => ({ data: [] })),
        Promise.resolve(getCustomProjects()),
      ])
      if (usageRes && !usageRes.error) setUsage(usageRes)
      const apiSermons: any[] = Array.isArray(sermonsRes?.data) ? sermonsRes.data : []
      const insightsList = Array.isArray(insightsRes?.data) ? insightsRes.data : []

      // Merge: API + localStorage (deduped by id)
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

      // 활동 히트맵용 타임스탬프 수집
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
        name,
        updated_at: new Date().toISOString(),
      })
      if (error) {
        setSaveMessage({ kind: 'error', text: `저장 실패: ${error.message}` })
      } else {
        setSaveMessage({ kind: 'success', text: '저장되었습니다' })
        setEditingName(false)
        loadAll()
      }
    } catch (e: any) {
      setSaveMessage({ kind: 'error', text: `오류: ${e?.message || '네트워크 오류'}` })
    } finally {
      setSaving(false)
      setTimeout(() => setSaveMessage(null), 4000)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const handleDeleteAccount = async () => {
    if (deleting) return
    if (!confirm('정말 탈퇴하시겠습니까?\n\n모든 설교 데이터가 영구 삭제되며, 동일 이메일로 재가입 시 무료 체험이 불가능합니다.')) return
    if (!confirm('최종 확인: 정말 탈퇴하시겠습니까?')) return
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
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="relative w-8 h-8">
          <div className="absolute inset-0 rounded-full border border-white/10" />
          <div className="absolute inset-0 rounded-full border border-transparent border-t-indigo-500/60 animate-spin" />
        </div>
      </div>
    )
  }

  if (!user) return null

  const isSupporter = !!usage?.supporter
  const workspacePct = usage && usage.workspace_limit > 0 && usage.workspace_limit !== -1
    ? Math.round((usage.workspace_used / usage.workspace_limit) * 100)
    : 0

  const displayName = profile?.name || user.email?.split('@')[0] || '사역자'
  const initial = displayName.slice(0, 1).toUpperCase()
  const joinDate = user.created_at ? new Date(user.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' }) : ''
  const daysSinceJoin = user.created_at
    ? Math.floor((Date.now() - new Date(user.created_at).getTime()) / 86400000)
    : 0

  // 오늘의 말씀 (날짜 기반 결정적)
  const verse = DAILY_VERSES[new Date().getDate() % DAILY_VERSES.length]

  return (
    <div className="min-h-screen bg-[#04060f] -mt-16">
      {/* ── 히어로: 풀-뷰포트 임팩트 ── */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        {/* 배경 그라데이션 오브 — 등급별 */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[120px] opacity-40 pointer-events-none"
          style={{
            background: isSupporter
              ? 'rgba(245, 158, 11, 0.4)'
              : 'rgba(99, 102, 241, 0.3)',
          }}
        />
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-violet-500/5 blur-3xl pointer-events-none" />

        {/* 그리드 패턴 */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)] pointer-events-none" />

        <div className="relative max-w-[800px] mx-auto px-6 py-24 text-center">
          {/* 아바타 — 거대하고 글래스 */}
          <div className="relative inline-block mb-8">
            <div
              className="w-28 h-28 rounded-3xl flex items-center justify-center text-5xl font-light text-white shadow-2xl ring-1 ring-white/10 backdrop-blur-md"
              style={{
                background: isSupporter
                  ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.5), rgba(15, 23, 42, 0.8))'
                  : 'linear-gradient(135deg, rgba(99, 102, 241, 0.5), rgba(15, 23, 42, 0.8))',
              }}
            >
              {initial}
            </div>
            {/* 등급 배지 (아바타 우하단) */}
            {isSupporter ? (
              <div
                className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-[#04060f] border border-amber-500/30 flex items-center justify-center shadow-lg"
                title="사역 동참자"
              >
                <Heart className="w-4 h-4 text-amber-300 fill-amber-300" />
              </div>
            ) : (
              <div
                className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-[#04060f] border border-indigo-500/30 flex items-center justify-center shadow-lg"
                title="일반회원"
              >
                <Users className="w-4 h-4 text-indigo-300" />
              </div>
            )}
          </div>

          {/* 이름 — 거대한 타이포그래피 */}
          <h1 className="text-5xl md:text-6xl font-extralight text-white tracking-tight mb-4">
            {displayName}
          </h1>

          {/* 등급 배지 + 메타 라인 */}
          <div className="flex items-center justify-center gap-3 text-[13px] text-slate-500 flex-wrap mb-2">
            {isSupporter ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-medium">
                <Heart className="w-3 h-3 fill-amber-300" />
                사역 동참자
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-medium">
                <Users className="w-3 h-3" />
                일반회원
              </span>
            )}
            {usage?.supporter_until && (
              <span className="text-slate-500 text-[12px]">
                후원 만료 {new Date(usage.supporter_until).toLocaleDateString('ko-KR')}
              </span>
            )}
            {joinDate && (
              <span className="text-slate-500 text-[12px]">
                · {joinDate} 부터 함께 ({daysSinceJoin}일)
              </span>
            )}
          </div>

          {/* 이메일 + 복사 */}
          <button
            onClick={copyEmail}
            className="inline-flex items-center gap-1.5 text-[12px] text-slate-500 hover:text-slate-300 transition-colors mt-2 group"
          >
            <Mail className="w-3 h-3" />
            {user.email}
            {copied ? (
              <Check className="w-3 h-3 text-emerald-400" />
            ) : (
              <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </button>

          {/* CTA — 사역 동참자에게는 후원 안내, 일반회원에게는 후원 유도 */}
          <div className="mt-12 flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/advanced"
              className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-[#04060f] text-[13px] font-semibold hover:bg-slate-200 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              워크스페이스 열기
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
            {!isSupporter && (
              <Link
                href="/support"
                className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[13px] font-medium transition-all"
              >
                <Heart className="w-3.5 h-3.5 fill-amber-300" />
                사역에 동참하기
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ── 메인 콘텐츠: 2-Column ── */}
      <div className="max-w-[1100px] mx-auto px-6 pb-24">

        {/* ── 한 줄 카운터 (Stripe 스타일) — 설교 진행 현황 ── */}
        <div className="mb-4">
          <h2 className="text-[11px] uppercase tracking-[0.2em] text-slate-500 font-semibold">
            설교 진행 현황
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-px bg-white/[0.06] rounded-2xl overflow-hidden border border-white/[0.06] mb-8">
          <CounterCell label="전체" value={counts.projects} sub="편" />
          <CounterCell label="진행 중" value={counts.inProgress} sub="편" amber />
          <CounterCell label="완료" value={counts.completed} sub="편" emerald />
          <CounterCell label="보관" value={counts.archived} sub="편" />
          <CounterCell label="통찰" value={counts.notes} sub="개" violet />
        </div>

        {/* ── 활동 히트맵 ── */}
        <ActivityHeatmap activities={activities} />

        {/* ── 2-Column Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* 좌측: 큰 카드들 */}
          <div className="lg:col-span-2 space-y-6">

            {/* 사용량 카드 — 등급별 한도 안내 (Phase 1) */}
            <article className="rounded-2xl border border-white/[0.06] bg-white/[0.015] backdrop-blur-sm p-8">
              <header className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-[11px] uppercase tracking-[0.2em] text-slate-500 font-semibold mb-2">
                    이번 30일 사용량 · {isSupporter ? '사역 동참자' : '일반회원'}
                  </h2>
                  <p className="text-2xl font-light text-white">
                    {usage?.limits ? (
                      <>
                        다음 리셋 <span className="font-semibold text-emerald-300">D-{usage.limits.daysUntilReset}</span>
                        <span className="text-[14px] text-slate-400 ml-1">· 가입일 기준 30일</span>
                      </>
                    ) : (
                      <span className="text-[14px] text-slate-400">한도 정보 없음</span>
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">등급</div>
                  <div className={`text-[12px] font-medium ${
                    isSupporter ? 'text-amber-300' : 'text-indigo-300'
                  }`}>
                    {usage?.limits?.inGracePeriod ? '유예 기간 · 기존 정책' : isSupporter ? '사역 동참자' : '일반회원'}
                  </div>
                </div>
              </header>

              {/* 한도별 카운터 (Phase 1) */}
              {usage?.limits && (
                <div className="grid grid-cols-2 gap-3 py-4 border-y border-white/[0.06]">
                  {[
                    { key: 'ai_analysis', label: 'AI 분석 6종', note: '업로드 설교' },
                    { key: 'manual_sermon', label: '새 설교 등록', note: 'manual' },
                    { key: 'project', label: '말씀 연구실', note: '설교 프로젝트' },
                    { key: 'youtube', label: '유튜브 연구소', note: '영상 분석' },
                  ].map(item => {
                    const a = usage.limits!.actions[item.key as keyof typeof usage.limits.actions]
                    const isUnlimited = a.limit === -1
                    const isZero = a.limit === 0
                    const pct = !isUnlimited && a.limit > 0 ? Math.min(100, (a.current / a.limit) * 100) : 0
                    const color = isZero
                      ? 'text-amber-400'
                      : isUnlimited
                      ? 'text-blue-300'
                      : pct >= 100
                      ? 'text-rose-400'
                      : pct >= 80
                      ? 'text-amber-300'
                      : isSupporter
                      ? 'text-amber-300'
                      : 'text-indigo-300'
                    return (
                      <div key={item.key} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">{item.label}</p>
                        <p className="text-[10px] text-slate-600 mb-1.5">{item.note}</p>
                        {isZero ? (
                          <p className="text-[18px] font-extralight text-amber-400">사역 동참자 전용</p>
                        ) : isUnlimited ? (
                          <p className="text-[18px] font-extralight text-blue-300">무제한 · 유예 중</p>
                        ) : (
                          <>
                            <p className={`text-[20px] font-extralight tabular-nums ${color}`}>
                              {a.current}<span className="text-slate-600 text-[12px]"> / </span>{a.limit}
                            </p>
                            <div className="h-1 rounded-full bg-white/5 overflow-hidden mt-1.5">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  pct >= 100
                                    ? 'bg-gradient-to-r from-rose-500 to-rose-400'
                                    : pct >= 80
                                    ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                                    : isSupporter
                                    ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                                    : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* 워크스페이스 */}
              <div className="mt-6">
                <div className="flex items-center justify-between text-[13px] mb-3">
                  <span className="text-slate-400">워크스페이스</span>
                  <span className="text-slate-200 font-medium">
                    {usage?.workspace_used ?? 0} <span className="text-slate-600">/</span> {usage?.workspace_limit ?? (isSupporter ? 20 : 1)}
                  </span>
                </div>
                <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-1000"
                    style={{ width: `${Math.min(workspacePct, 100)}%` }}
                  />
                </div>
              </div>
            </article>

            {/* 빠른 이동 — 카드 그리드 */}
            <article>
              <h2 className="text-[11px] uppercase tracking-[0.2em] text-slate-500 font-semibold mb-4">워크스페이스</h2>
              <div className="grid grid-cols-2 gap-px bg-white/[0.06] rounded-2xl overflow-hidden border border-white/[0.06]">
                <NavCell href="/advanced/projects" label="설교 프로젝트" sub="진행 중 · 완료 · 보관" />
                <NavCell href="/advanced/notes" label="통찰 노트" sub="묵상과 아이디어" />
                <NavCell href="/advanced/graph" label="지식 그래프" sub="연결 관계 시각화" />
                <NavCell href="/advanced/archive" label="아카이브" sub="완료된 설교" />
              </div>
            </article>
          </div>

          {/* 우측: 인용 + 작은 카드들 */}
          <div className="space-y-6">

            {/* 오늘의 말씀 */}
            <article className="relative rounded-2xl border border-white/[0.06] bg-gradient-to-br from-indigo-950/30 via-[#04060f] to-violet-950/20 backdrop-blur-sm p-7 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />
              <Quote className="w-5 h-5 text-indigo-400/40 mb-4" />
              <p className="text-[13px] text-slate-200 leading-relaxed font-light italic">
                {verse.split(' — ')[0]}
              </p>
              <p className="text-[11px] text-indigo-300/70 mt-3 font-medium">{verse.split(' — ')[1]}</p>
            </article>

            {/* 프로필 인라인 편집 */}
            <article className="rounded-2xl border border-white/[0.06] bg-white/[0.015] backdrop-blur-sm p-6">
              <h2 className="text-[11px] uppercase tracking-[0.2em] text-slate-500 font-semibold mb-4">프로필</h2>

              <div className="space-y-3">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1.5">이름</div>
                  {editingName ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="이름을 입력하세요"
                        autoFocus
                        className="flex-1 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-[14px] text-white outline-none focus:border-indigo-500/40 transition-all"
                      />
                      <button
                        onClick={saveProfile}
                        disabled={saving}
                        className="px-3 py-2 rounded-lg bg-white text-[#04060f] text-[12px] font-bold hover:bg-slate-200 transition-all disabled:opacity-50"
                      >
                        {saving ? '...' : '저장'}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingName(true)}
                      className="w-full text-left px-3 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.06] text-[14px] text-slate-200 flex items-center justify-between transition-all group"
                    >
                      <span>{profile?.name || <span className="text-slate-500">이름 설정 안됨</span>}</span>
                      <Edit3 className="w-3 h-3 text-slate-500 group-hover:text-slate-300 transition-colors" />
                    </button>
                  )}
                </div>

                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1.5">이메일</div>
                  <div className="px-3 py-2 rounded-lg bg-white/[0.04] text-[13px] text-slate-300 truncate">
                    {user.email}
                  </div>
                </div>
              </div>

              {saveMessage && (
                <div className={`mt-3 flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg ${
                  saveMessage.kind === 'error'
                    ? 'text-red-300 bg-red-500/10'
                    : 'text-emerald-300 bg-emerald-500/10'
                }`}>
                  {saveMessage.kind === 'error' ? <AlertCircle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                  {saveMessage.text}
                </div>
              )}
            </article>

            {/* 계정 관리 */}
            <article className="rounded-2xl border border-white/[0.06] bg-white/[0.015] backdrop-blur-sm divide-y divide-white/[0.06]">
              <Link
                href="/auth/reset-password"
                className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/[0.02] transition-colors group"
              >
                <KeyRound className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                <span className="text-[13px] text-slate-200 flex-1">비밀번호 변경</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-white/[0.02] transition-colors group text-left"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors" />
                <span className="text-[13px] text-slate-200 flex-1">로그아웃</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              </button>
              <div className="p-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="w-full text-[11px] text-red-400/70 hover:text-red-300 hover:bg-red-500/5 transition-colors py-2 rounded-lg disabled:opacity-50"
                >
                  {deleting ? '처리 중...' : '회원 탈퇴'}
                </button>
              </div>
            </article>
          </div>
        </div>

        {/* 푸터 */}
        <footer className="mt-24 text-center">
          <p className="text-[10px] text-slate-700 tracking-wider">
            Bunker 목양 · 말씀 위에 선 사역자를 위하여
          </p>
        </footer>
      </div>
    </div>
  )
}

/* ── Sub-Components ── */

function CounterCell({ label, value, sub, accent, amber, emerald, violet }: {
  label: string; value: number; sub: string
  accent?: boolean; amber?: boolean; emerald?: boolean; violet?: boolean
}) {
  const color = emerald
    ? 'text-emerald-300'
    : amber
    ? 'text-amber-300'
    : violet
    ? 'text-violet-300'
    : accent
    ? 'text-indigo-300'
    : 'text-white'
  return (
    <div className="bg-[#04060f] p-6 md:p-7">
      <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-semibold mb-3">{label}</div>
      <div className="flex items-baseline gap-1.5">
        <span className={`text-4xl md:text-5xl font-extralight tabular-nums ${color}`}>
          {value}
        </span>
        <span className="text-[12px] text-slate-600 font-medium">{sub}</span>
      </div>
    </div>
  )
}

function NavCell({ href, label, sub }: { href: string; label: string; sub: string }) {
  return (
    <Link
      href={href}
      className="group bg-[#04060f] p-5 hover:bg-white/[0.02] transition-colors block"
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-[13px] font-medium text-slate-200 group-hover:text-white transition-colors">
          {label}
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all" />
      </div>
      <div className="text-[11px] text-slate-500">{sub}</div>
    </Link>
  )
}
