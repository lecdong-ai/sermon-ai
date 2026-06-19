'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Users, Heart, Search, Loader2, Check, X,
  Shield, Calendar, Mail, Clock,
  LayoutGrid, List, Download, ChevronUp, ChevronDown,
  Eye, Activity, CreditCard, AlertTriangle,
} from 'lucide-react'

interface Member {
  id: string
  email: string
  name: string | null
  role: string
  supporter_until: string | null
  created_at: string
  last_sign_in_at: string | null
}

interface DetailUsage {
  plan: string
  user_status: string
  monthly_used: number
  monthly_limit: number
  workspace_used: number
  workspace_limit: number
  trial_used: number
  trial_limit: number
  trial_start_at: string
  trial_end_at: string
  supporter_until?: string | null
}

interface DetailSubscription {
  id: string
  plan: string
  status: string
  billing_cycle_start: string
  billing_cycle_end: string
  monthly_limit: number
  monthly_used: number
}

interface DetailData {
  usage: DetailUsage | null
  subscription: DetailSubscription | null
}

const GRANT_PRESETS = [
  { label: '30일', days: 30, desc: '5,000원' },
  { label: '90일', days: 90, desc: '12,000원' },
  { label: '365일', days: 365, desc: '50,000원' },
]

type SortField = 'name' | 'email' | 'role' | 'supporter_until' | 'created_at' | 'last_sign_in_at'
type ViewMode = 'card' | 'table'

const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString('ko-KR') : '-'

function DetailDrawer({ member, data, loading, onClose, onGrant, onDelete }: {
  member: Member
  data: DetailData | null
  loading: boolean
  onClose: () => void
  onGrant: (id: string, days: number) => void
  onDelete: (id: string) => void
}) {
  const active = member.supporter_until && new Date(member.supporter_until) > new Date()
  const [showGrant, setShowGrant] = useState(false)
  const [selectedDays, setSelectedDays] = useState(30)
  const [customDays, setCustomDays] = useState('')
  const [granting, setGranting] = useState(false)

  const handleGrant = async () => {
    const days = customDays ? parseInt(customDays) : selectedDays
    if (days < 1) return
    setGranting(true)
    await onGrant(member.id, days)
    setGranting(false)
    setShowGrant(false)
    setCustomDays('')
  }

  const usage = data?.usage
  const sub = data?.subscription

  const statusStyles: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-700',
    trialing: 'bg-blue-100 text-blue-700',
    past_due: 'bg-amber-100 text-amber-700',
    canceled: 'bg-slate-100 text-slate-500',
    expired: 'bg-rose-100 text-rose-700',
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white shadow-2xl h-full overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-[16px] font-extrabold text-slate-800">회원 상세</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* 기본 정보 */}
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-[16px] shrink-0 ${
              member.role === 'admin'
                ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
                : active
                  ? 'bg-gradient-to-br from-rose-400 to-pink-500'
                  : 'bg-gradient-to-br from-slate-300 to-slate-400'
            }`}>
              {member.name ? member.name.charAt(0) : member.email.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[16px] font-bold text-slate-800">
                {member.name || <span className="text-slate-400">이름 없음</span>}
              </p>
              <p className="text-[13px] text-slate-500 flex items-center gap-1 mt-0.5">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{member.email}</span>
              </p>
              <div className="flex items-center gap-2 mt-2">
                {member.role === 'admin' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-600 text-[11px] font-bold">
                    <Shield className="w-3 h-3" />
                    관리자
                  </span>
                )}
                {active ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-50 text-rose-600 text-[11px] font-bold">
                    <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                    후원회원
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-500 text-[11px] font-bold">
                    일반회원
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 사용량 */}
          <div>
            <h3 className="text-[13px] font-bold text-slate-500 flex items-center gap-1.5 mb-3">
              <Activity className="w-3.5 h-3.5" />
              사용량
            </h3>
            {loading ? (
              <div className="flex items-center gap-2 text-[13px] text-slate-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                불러오는 중...
              </div>
            ) : usage ? (
              <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-slate-500">플랜</span>
                  <span className="font-bold text-slate-700 capitalize">{usage.plan === 'none' ? '없음' : usage.plan}</span>
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-slate-500">상태</span>
                  <span className="font-bold text-slate-700">{usage.user_status === 'trial' ? '트라이얼' : '활성'}</span>
                </div>
                <div>
                  <div className="flex items-center justify-between text-[13px] mb-1">
                    <span className="text-slate-500">월간 사용</span>
                    <span className="font-bold text-slate-700">{usage.monthly_used}/{usage.monthly_limit}</span>
                  </div>
                  {usage.monthly_limit > 0 && (
                    <div className="h-1.5 rounded-full bg-slate-200">
                      <div className="h-full rounded-full bg-indigo-500" style={{ width: `${Math.min((usage.monthly_used / usage.monthly_limit) * 100, 100)}%` }} />
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-slate-500">워크스페이스</span>
                  <span className="font-bold text-slate-700">{usage.workspace_used}/{usage.workspace_limit}</span>
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-slate-500">트라이얼</span>
                  <span className="font-bold text-slate-700">{usage.trial_used}/{usage.trial_limit}</span>
                </div>
                {usage.supporter_until && (
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-slate-500">후원 만료</span>
                    <span className="font-bold text-slate-700">{new Date(usage.supporter_until).toLocaleDateString('ko-KR')}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-[13px] text-slate-400">사용량 데이터가 없습니다.</p>
            )}
          </div>

          {/* 구독 정보 */}
          <div>
            <h3 className="text-[13px] font-bold text-slate-500 flex items-center gap-1.5 mb-3">
              <CreditCard className="w-3.5 h-3.5" />
              구독 정보
            </h3>
            {loading ? (
              <div className="flex items-center gap-2 text-[13px] text-slate-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                불러오는 중...
              </div>
            ) : sub ? (
              <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-slate-500">플랜</span>
                  <span className="font-bold text-slate-700 capitalize">{sub.plan}</span>
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-slate-500">상태</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[12px] font-bold ${statusStyles[sub.status] || 'bg-slate-100 text-slate-500'}`}>
                    {sub.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-slate-500">결제 주기</span>
                  <span className="font-bold text-slate-700">
                    {new Date(sub.billing_cycle_start).toLocaleDateString('ko-KR')} ~ {new Date(sub.billing_cycle_end).toLocaleDateString('ko-KR')}
                  </span>
                </div>
                <div>
                  <div className="flex items-center justify-between text-[13px] mb-1">
                    <span className="text-slate-500">사용량</span>
                    <span className="font-bold text-slate-700">{sub.monthly_used}/{sub.monthly_limit}</span>
                  </div>
                  {sub.monthly_limit > 0 && (
                    <div className="h-1.5 rounded-full bg-slate-200">
                      <div className="h-full rounded-full bg-indigo-500" style={{ width: `${Math.min((sub.monthly_used / sub.monthly_limit) * 100, 100)}%` }} />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-[13px] text-slate-400">구독 정보가 없습니다.</p>
            )}
          </div>

          {/* 활동 정보 */}
          <div>
            <h3 className="text-[13px] font-bold text-slate-500 flex items-center gap-1.5 mb-3">
              <Clock className="w-3.5 h-3.5" />
              활동
            </h3>
            <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-[13px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">가입일</span>
                <span className="font-bold text-slate-700">{formatDate(member.created_at)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">최근 접속</span>
                <span className="font-bold text-slate-700">{formatDate(member.last_sign_in_at)}</span>
              </div>
            </div>
          </div>

          {/* 액션 */}
          <div className="border-t border-slate-100 pt-4 space-y-3">
            {showGrant ? (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  {GRANT_PRESETS.map(p => (
                    <button
                      key={p.days}
                      onClick={() => { setSelectedDays(p.days); setCustomDays('') }}
                      className={`flex-1 py-2 rounded-lg text-[12px] font-bold transition-all ${
                        selectedDays === p.days
                          ? 'bg-rose-100 text-rose-700 border border-rose-300'
                          : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="직접 입력"
                    value={customDays}
                    onChange={e => setCustomDays(e.target.value)}
                    className="w-20 text-[12px] border border-slate-200 rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                    min="1"
                  />
                  <button
                    onClick={handleGrant}
                    disabled={granting}
                    className="flex-1 py-2 rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[13px] font-bold hover:shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-1"
                  >
                    {granting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Heart className="w-3.5 h-3.5" />}
                    {active ? '연장' : '부여'}
                  </button>
                  <button
                    onClick={() => { setShowGrant(false); setCustomDays('') }}
                    className="px-3 py-2 bg-slate-100 text-slate-500 rounded-lg text-[12px] font-bold hover:bg-slate-200 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowGrant(true)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[13px] font-bold hover:shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Heart className="w-4 h-4" />
                {active ? '후원 연장' : '후원 부여'}
              </button>
            )}
            <button
              onClick={() => { onClose(); setTimeout(() => onDelete(member.id), 300) }}
              className="w-full py-3 rounded-xl border border-rose-200 text-rose-600 text-[13px] font-bold hover:bg-rose-50 transition-all flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              탈퇴 처리
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function MemberCard({ member, onGrant, onDelete, onDetail }: {
  member: Member
  onGrant: (id: string, days: number) => void
  onDelete: (id: string) => void
  onDetail: (member: Member) => void
}) {
  const active = member.supporter_until && new Date(member.supporter_until) > new Date()
  const [showGrant, setShowGrant] = useState(false)
  const [selectedDays, setSelectedDays] = useState(30)
  const [customDays, setCustomDays] = useState('')
  const [granting, setGranting] = useState(false)

  const handleGrant = async () => {
    const days = customDays ? parseInt(customDays) : selectedDays
    if (days < 1) return
    setGranting(true)
    await onGrant(member.id, days)
    setGranting(false)
    setShowGrant(false)
    setCustomDays('')
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 hover:shadow-md transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-[14px] ${
            member.role === 'admin'
              ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md shadow-indigo-200'
              : active
                ? 'bg-gradient-to-br from-rose-400 to-pink-500 shadow-md shadow-rose-200'
                : 'bg-gradient-to-br from-slate-300 to-slate-400'
          }`}>
            {member.name ? member.name.charAt(0) : member.email.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-[15px] font-bold text-slate-800">
              {member.name || <span className="text-slate-400">이름 없음</span>}
            </p>
            <p className="text-[12px] text-slate-400 flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {member.email}
            </p>
          </div>
        </div>
        {member.role === 'admin' && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-600 text-[11px] font-bold border border-indigo-100">
            <Shield className="w-3 h-3" />
            관리자
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {active ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 text-rose-700 text-[12px] font-semibold border border-rose-200/60">
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
              후원회원
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-500 text-[12px] font-semibold">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              일반회원
            </span>
          )}
        </div>
        {active && (
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            ~{new Date(member.supporter_until!).toLocaleDateString('ko-KR')}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 text-[11px] text-slate-400 mb-4">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          가입 {new Date(member.created_at).toLocaleDateString('ko-KR')}
        </span>
        {member.last_sign_in_at && (
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            최근 {new Date(member.last_sign_in_at).toLocaleDateString('ko-KR')}
          </span>
        )}
      </div>

      {showGrant ? (
        <div className="space-y-2 border-t border-slate-100 pt-3">
          <div className="flex items-center gap-1.5">
            {GRANT_PRESETS.map(p => (
              <button
                key={p.days}
                onClick={() => { setSelectedDays(p.days); setCustomDays('') }}
                className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                  selectedDays === p.days
                    ? 'bg-rose-100 text-rose-700 border border-rose-300'
                    : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="직접"
              value={customDays}
              onChange={e => setCustomDays(e.target.value)}
              className="w-16 text-[12px] border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              min="1"
            />
            <button
              onClick={handleGrant}
              disabled={granting}
              className="flex-1 py-1.5 rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[12px] font-bold hover:shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-1"
            >
              {granting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Heart className="w-3 h-3" />}
              {active ? '연장' : '부여'}
            </button>
            <button
              onClick={() => { setShowGrant(false); setCustomDays('') }}
              className="px-2 py-1.5 bg-slate-100 text-slate-500 rounded-lg text-[12px] font-bold hover:bg-slate-200 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <button
            onClick={() => onDetail(member)}
            className="py-2 px-2.5 rounded-xl bg-slate-50 text-slate-400 text-[12px] font-bold hover:bg-indigo-50 hover:text-indigo-500 transition-all"
            title="상세 보기"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setShowGrant(true)}
            className="flex-1 py-2 rounded-xl bg-slate-50 text-slate-600 text-[12px] font-bold hover:bg-rose-50 hover:text-rose-600 transition-all flex items-center justify-center gap-1.5"
          >
            <Heart className="w-3.5 h-3.5" />
            {active ? '후원 연장' : '후원 부여'}
          </button>
          <button
            onClick={() => onDelete(member.id)}
            className="py-2 px-3 rounded-xl bg-slate-50 text-slate-400 text-[12px] font-bold hover:bg-rose-50 hover:text-rose-500 transition-all"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}

function SortIcon({ field, sortField, sortOrder }: { field: SortField; sortField: SortField | null; sortOrder: 'asc' | 'desc' }) {
  if (sortField !== field) return <ChevronUp className="w-3 h-3 text-slate-300" />
  return sortOrder === 'asc'
    ? <ChevronUp className="w-3 h-3 text-indigo-500" />
    : <ChevronDown className="w-3 h-3 text-indigo-500" />
}

export default function AdminUsersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'supporter' | 'general'>('all')
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null)

  const [viewMode, setViewMode] = useState<ViewMode>('card')
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [detailData, setDetailData] = useState<DetailData | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const loadMembers = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/users')
    const data = await res.json()
    if (!data.error) setMembers(data.users || [])
    setLoading(false)
  }, [])

  useEffect(() => { loadMembers() }, [loadMembers])

  useEffect(() => {
    if (!selectedMember) {
      setDetailData(null)
      return
    }
    setDetailLoading(true)
    setDetailData(null)
    fetch(`/api/admin/users/detail?userId=${selectedMember.id}`)
      .then(r => r.json())
      .then(d => {
        if (!d.error) setDetailData(d)
      })
      .catch(() => {})
      .finally(() => setDetailLoading(false))
  }, [selectedMember?.id])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const handleGrant = async (userId: string, days: number) => {
    setMessage(null)
    const res = await fetch('/api/admin/grant-supporter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, days }),
    })
    const d = await res.json()
    if (d.success) {
      setMessage({ type: 'ok', text: `${days}일 후원자 권한이 부여되었습니다.` })
      loadMembers()
    } else {
      setMessage({ type: 'error', text: d.error || '부여 실패' })
    }
  }

  const handleDelete = async (userId: string) => {
    setMessage(null)
    const res = await fetch('/api/admin/users/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    const d = await res.json()
    if (d.success) {
      setMessage({ type: 'ok', text: '회원 탈퇴 처리되었습니다.' })
      setDeleteTarget(null)
      loadMembers()
    } else {
      setMessage({ type: 'error', text: d.error || '삭제 실패' })
      setDeleteTarget(null)
    }
  }

  const handleExportCSV = () => {
    const headers = ['이름', '이메일', '역할', '후원상태', '후원만료일', '가입일', '최근접속일']
    const rows = filtered.map(m => [
      m.name || '',
      m.email,
      m.role === 'admin' ? '관리자' : '회원',
      m.supporter_until && new Date(m.supporter_until) > new Date() ? '후원중' : '일반',
      m.supporter_until ? new Date(m.supporter_until).toLocaleDateString('ko-KR') : '',
      new Date(m.created_at).toLocaleDateString('ko-KR'),
      m.last_sign_in_at ? new Date(m.last_sign_in_at).toLocaleDateString('ko-KR') : '',
    ])
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `회원목록_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const filtered = members.filter(m => {
    const matchSearch = m.email?.toLowerCase().includes(search.toLowerCase()) ||
      m.name?.toLowerCase().includes(search.toLowerCase())
    if (!matchSearch) return false
    if (filter === 'supporter') return m.supporter_until && new Date(m.supporter_until) > new Date()
    if (filter === 'general') return !(m.supporter_until && new Date(m.supporter_until) > new Date())
    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    if (!sortField) return 0
    const dir = sortOrder === 'asc' ? 1 : -1
    const aVal = a[sortField]
    const bVal = b[sortField]
    if (aVal === null && bVal === null) return 0
    if (aVal === null) return 1
    if (bVal === null) return -1
    return aVal < bVal ? -dir : aVal > bVal ? dir : 0
  })

  const supporterCount = members.filter(m => m.supporter_until && new Date(m.supporter_until) > new Date()).length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-extrabold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500" />
            회원 관리
          </h1>
          <p className="text-[14px] text-slate-500 mt-1">
            전체 {members.length}명 · 후원 {supporterCount}명 · 일반 {members.length - supporterCount}명
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-[12px] font-bold text-slate-600 hover:bg-slate-50 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            CSV 내보내기
          </button>
          <div className="flex items-center bg-slate-100 rounded-xl p-0.5">
            <button
              onClick={() => setViewMode('card')}
              className={`p-2 rounded-lg text-[12px] font-bold transition-all ${
                viewMode === 'card' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg text-[12px] font-bold transition-all ${
                viewMode === 'table' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 메시지 */}
      {message && (
        <div className={`px-4 py-3 rounded-xl text-[13px] font-semibold flex items-center gap-2 ${
          message.type === 'ok' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'ok' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
          {message.text}
        </div>
      )}

      {/* 검색 + 필터 */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="이메일 또는 이름으로 검색..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-[14px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {(['all', 'supporter', 'general'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-[12px] font-bold transition-all ${
                filter === f
                  ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                  : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {f === 'all' ? '전체' : f === 'supporter' ? '❤️ 후원' : '일반'}
            </button>
          ))}
        </div>
      </div>

      {/* 회원 목록 */}
      {sorted.length === 0 ? (
        <div className="text-center py-16 text-slate-400 text-[14px]">검색 결과가 없습니다</div>
      ) : viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sorted.map(m => (
            <MemberCard
              key={m.id}
              member={m}
              onGrant={handleGrant}
              onDelete={(id) => setDeleteTarget(m)}
              onDetail={setSelectedMember}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {([
                    { key: 'name', label: '이름' },
                    { key: 'email', label: '이메일' },
                    { key: 'role', label: '상태' },
                    { key: 'supporter_until', label: '후원만료일' },
                    { key: 'created_at', label: '가입일' },
                    { key: 'last_sign_in_at', label: '최근접속일' },
                  ] as { key: SortField; label: string }[]).map(col => (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      className="text-left px-5 py-3.5 font-bold text-slate-600 cursor-pointer hover:text-indigo-600 transition-colors select-none"
                    >
                      <div className="flex items-center gap-1">
                        {col.label}
                        <SortIcon field={col.key} sortField={sortField} sortOrder={sortOrder} />
                      </div>
                    </th>
                  ))}
                  <th className="text-left px-5 py-3.5 font-bold text-slate-600">관리</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((m, i) => {
                  const active = m.supporter_until && new Date(m.supporter_until) > new Date()
                  return (
                    <tr
                      key={m.id}
                      onClick={() => setSelectedMember(m)}
                      className={`border-b border-slate-100 cursor-pointer transition-colors ${
                        i % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                      } hover:bg-indigo-50/40`}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-[11px] shrink-0 ${
                            m.role === 'admin'
                              ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
                              : active
                                ? 'bg-gradient-to-br from-rose-400 to-pink-500'
                                : 'bg-gradient-to-br from-slate-300 to-slate-400'
                          }`}>
                            {m.name ? m.name.charAt(0) : m.email.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-bold text-slate-700">
                            {m.name || <span className="text-slate-400">이름 없음</span>}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">{m.email}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          {m.role === 'admin' && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-600 text-[10px] font-bold">
                              <Shield className="w-2.5 h-2.5" />
                              관리자
                            </span>
                          )}
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold ${
                            active
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}>
                            {active ? (
                              <><Heart className="w-2.5 h-2.5 fill-rose-500 text-rose-500" />후원</>
                            ) : '일반'}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 text-[12px]">
                        {active ? new Date(m.supporter_until!).toLocaleDateString('ko-KR') : '-'}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 text-[12px]">
                        {new Date(m.created_at).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 text-[12px]">
                        {m.last_sign_in_at ? new Date(m.last_sign_in_at).toLocaleDateString('ko-KR') : '-'}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                          {GRANT_PRESETS.map(p => (
                            <button
                              key={p.days}
                              onClick={() => handleGrant(m.id, p.days)}
                              className="px-1.5 py-1 rounded-lg bg-rose-50 text-rose-600 text-[10px] font-bold hover:bg-rose-100 transition-colors"
                              title={`${p.label} 후원 부여`}
                            >
                              {p.label}
                            </button>
                          ))}
                          <button
                            onClick={() => setDeleteTarget(m)}
                            className="px-2 py-1 rounded-lg bg-slate-100 text-slate-400 text-[11px] font-bold hover:bg-rose-50 hover:text-rose-500 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 상세 드로어 */}
      {selectedMember && (
        <DetailDrawer
          member={selectedMember}
          data={detailData}
          loading={detailLoading}
          onClose={() => setSelectedMember(null)}
          onGrant={handleGrant}
          onDelete={(id) => { setSelectedMember(null); setDeleteTarget(members.find(m => m.id === id) || null) }}
        />
      )}

      {/* 탈퇴 확인 모달 */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setDeleteTarget(null)}>
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 max-w-sm w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-rose-500" />
            </div>
            <h2 className="text-[18px] font-extrabold text-slate-800 text-center mb-2">회원 탈퇴</h2>
            <p className="text-[14px] text-slate-500 text-center mb-4">{deleteTarget.email}</p>
            <div className="bg-amber-50 rounded-xl px-4 py-3 mb-5 text-[12px] text-amber-700 flex items-start gap-2">
              <X className="w-4 h-4 shrink-0 mt-0.5" />
              모든 데이터가 영구 삭제되며 복구할 수 없습니다.
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-[14px] font-bold text-slate-600 hover:bg-slate-50 transition-all"
              >
                취소
              </button>
              <button
                onClick={() => handleDelete(deleteTarget.id)}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white text-[14px] font-bold hover:bg-rose-600 transition-all flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                탈퇴 처리
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


