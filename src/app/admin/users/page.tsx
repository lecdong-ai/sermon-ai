'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Users, Heart, Search, Loader2, Check, X, XCircle,
  Shield, Calendar, Mail, Clock, Sparkles, Trophy,
  LayoutGrid, List, Download, ChevronUp, ChevronDown,
  AlertTriangle,
} from 'lucide-react'
import { useUsersListState } from '@/lib/hooks/useUsersListState'
import Pagination from '@/components/admin/Pagination'

interface Member {
  id: string
  email: string
  name: string | null
  role: string
  supporter_until: string | null
  created_at: string
  last_sign_in_at: string | null
}

interface DetailData {
  apiUsage?: ApiUsageData | null
  manualDonations?: ManualDonationItem[]
}

interface ApiUsageData {
  monthly: { cost_krw: number; count: number }
  total: { cost_krw: number; count: number }
  byApi: { api_type: string; cost_krw: number; count: number }[]
  recent: { api_type: string; model: string; cost_krw: number; created_at: string }[]
  donation: { manual_krw: number; auto_krw: number; total_krw: number }
}

interface ManualDonationItem {
  id: string
  amount_krw: number
  note: string | null
  created_at: string
}

const GRANT_PRESETS = [
  { label: '30일', days: 30, defaultAmount: 5000 },
  { label: '90일', days: 90, defaultAmount: 12000 },
  { label: '365일', days: 365, defaultAmount: 50000 },
]

type ServerSortField = 'name' | 'email' | 'role' | 'supporter_until' | 'created_at' | 'last_sign_in_at'
type ClientSortField = 'total_donation' | 'api_cost'
type SortField = ServerSortField | ClientSortField
type ViewMode = 'card' | 'table'

const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString('ko-KR') : '-'

function DonationUsageSection({ data, memberId, onAdded, onDeleted }: {
  data: DetailData | null
  memberId: string
  onAdded?: () => void
  onDeleted?: () => void
}) {
  const [showInput, setShowInput] = useState(false)
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const api = data?.apiUsage
  const donation = api?.donation
  const manualDonations = data?.manualDonations || []

  // 누적 계산: manualDonations 배열에서 직접 계산 (가장 신뢰할 수 있는 fresh data)
  const manualKrw = manualDonations.reduce((sum, d) => sum + (d.amount_krw || 0), 0)
  const autoKrw = donation?.auto_krw || 0
  const totalDonationKrw = manualKrw + autoKrw

  const monthlyKrw = api?.monthly.cost_krw || 0
  const totalApiKrw = api?.total.cost_krw || 0
  const margin = totalDonationKrw - totalApiKrw

  const marginRatio = totalDonationKrw > 0 ? Math.max(0, Math.min(100, (margin / totalDonationKrw) * 100)) : 0
  const marginStatus = totalDonationKrw === 0 ? 'none'
    : margin < 0 ? 'over'
    : marginRatio < 20 ? 'caution'
    : marginRatio < 50 ? 'normal'
    : 'healthy'

  const statusMeta = {
    none: { color: 'text-slate-500', bg: 'bg-slate-500/10', border: 'border-slate-500/20', label: '후원 없음' },
    over: { color: 'text-rose-300', bg: 'bg-rose-500/10', border: 'border-rose-500/30', label: '초과' },
    caution: { color: 'text-amber-300', bg: 'bg-amber-500/10', border: 'border-amber-500/30', label: '주의' },
    normal: { color: 'text-blue-300', bg: 'bg-blue-500/10', border: 'border-blue-500/30', label: '정상' },
    healthy: { color: 'text-emerald-300', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', label: '여유' },
  }[marginStatus]

  const handleAdd = async () => {
    const amt = parseInt(amount.replace(/[^0-9]/g, ''))
    if (!amt || amt <= 0) return
    setSaving(true)
    const res = await fetch('/api/admin/donations/manual', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: memberId, amountKrw: amt, note }),
    })
    setSaving(false)
    if (res.ok) {
      setAmount('')
      setNote('')
      setShowInput(false)
      onAdded?.()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('이 입력을 삭제하시겠습니까?')) return
    const res = await fetch(`/api/admin/donations/manual/${id}`, { method: 'DELETE' })
    if (res.ok) onDeleted?.()
  }

  return (
    <div>
      <h3 className="text-[13px] font-bold text-slate-500 flex items-center gap-1.5 mb-3">
        <Heart className="w-3.5 h-3.5" />
        후원 / 사용 비교
      </h3>

      <div className="bg-white/5 rounded-xl p-4 space-y-3">
        {/* 수동 입력 */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-slate-500 font-semibold">수동 입력</span>
            <span className="text-[12px] text-slate-200 font-bold">
              {manualKrw > 0 ? `₩${manualKrw.toLocaleString('ko-KR')}` : '₩0'}
              {manualDonations.length > 0 && <span className="text-slate-500 font-normal ml-1">({manualDonations.length}건)</span>}
            </span>
          </div>
          {showInput ? (
            <div className="space-y-2">
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="금액 (₩)"
                  className="flex-1 text-[12px] bg-[#04060f] text-slate-100 border border-white/10 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <input
                  type="text"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="메모 (선택)"
                  className="flex-1 text-[12px] bg-[#04060f] text-slate-100 border border-white/10 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={handleAdd}
                  disabled={saving}
                  className="flex-1 py-1.5 rounded bg-emerald-500/20 text-emerald-300 text-[11px] font-bold hover:bg-emerald-500/30 disabled:opacity-50"
                >
                  {saving ? '저장 중...' : '저장'}
                </button>
                <button
                  onClick={() => { setShowInput(false); setAmount(''); setNote('') }}
                  className="px-3 py-1.5 rounded bg-white/5 text-slate-400 text-[11px] font-bold hover:bg-white/10"
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowInput(true)}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold"
            >
              + 금액 입력
            </button>
          )}
          {manualDonations.length > 0 && (
            <div className="mt-2 space-y-1">
              {manualDonations.slice(0, 3).map(d => (
                <div key={d.id} className="flex items-center justify-between text-[10px] text-slate-500 bg-black/20 rounded px-2 py-1">
                  <span className="truncate flex-1">
                    {new Date(d.created_at).toLocaleDateString('ko-KR')} · ₩{d.amount_krw.toLocaleString('ko-KR')}
                    {d.note && <span className="text-slate-600 ml-1">· {d.note}</span>}
                  </span>
                  <button
                    onClick={() => handleDelete(d.id)}
                    className="text-slate-600 hover:text-rose-400 ml-1"
                  >
                    ×
                  </button>
                </div>
              ))}
              {manualDonations.length > 3 && (
                <div className="text-[10px] text-slate-600 text-center">+{manualDonations.length - 3}건 더</div>
              )}
            </div>
          )}
        </div>

        {/* 자동 집계 */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <span className="text-[11px] text-slate-500 font-semibold">자동 집계</span>
          <span className="text-[12px] text-slate-200 font-bold">
            {autoKrw > 0 ? `₩${autoKrw.toLocaleString('ko-KR')}` : '₩0'}
          </span>
        </div>

        {/* 누적 후원 */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">누적 후원액</span>
          <span className="text-[14px] text-emerald-300 font-bold">
            ₩{totalDonationKrw.toLocaleString('ko-KR')}
          </span>
        </div>

        {/* API 비용 */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">누적 API 비용</span>
          <span className={`text-[14px] font-bold ${totalApiKrw >= 6500 ? 'text-amber-400' : 'text-slate-200'}`}>
            ₩{totalApiKrw.toLocaleString('ko-KR')}
          </span>
        </div>
        {api && api.monthly.count > 0 && (
          <div className="text-[10px] text-slate-500 -mt-1">이번 달 ₩{monthlyKrw.toLocaleString('ko-KR')} ({api.monthly.count}회)</div>
        )}

        {/* 마진 비교 */}
        {totalDonationKrw > 0 && (
          <div className="pt-3 border-t border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-slate-500">마진</span>
              <div className="flex items-center gap-2">
                <span className={`text-[12px] font-bold ${margin < 0 ? 'text-rose-400' : 'text-emerald-300'}`}>
                  ₩{margin.toLocaleString('ko-KR')}
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${statusMeta.bg} ${statusMeta.color} border ${statusMeta.border}`}>
                  {statusMeta.label}
                </span>
              </div>
            </div>
            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className={`h-full transition-all ${
                  marginStatus === 'over' ? 'bg-rose-500' :
                  marginStatus === 'caution' ? 'bg-amber-500' :
                  marginStatus === 'normal' ? 'bg-blue-500' :
                  'bg-emerald-500'
                }`}
                style={{ width: `${marginStatus === 'over' ? 100 : marginRatio}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-500 mt-1 text-right">
              사용률 {margin < 0 ? Math.round(((totalApiKrw / totalDonationKrw) * 100)) : Math.round(100 - marginRatio)}%
            </div>
          </div>
        )}

        {/* API 분포 */}
        {api && api.byApi.length > 0 && (
          <div className="pt-3 border-t border-white/5">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5">API 분포</div>
            <div className="space-y-1">
              {api.byApi.slice(0, 4).map(b => {
                const pct = totalApiKrw > 0 ? (b.cost_krw / totalApiKrw) * 100 : 0
                return (
                  <div key={b.api_type}>
                    <div className="flex items-center justify-between text-[10px] mb-0.5">
                      <span className="text-slate-400 truncate">{b.api_type}</span>
                      <span className="text-slate-500">₩{b.cost_krw.toLocaleString('ko-KR')}</span>
                    </div>
                    <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full bg-indigo-500/60" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function SupporterSection({
  member, active, showGrant, setShowGrant,
  selectedDays, setSelectedDays, customDays, setCustomDays,
  grantAmount, setGrantAmount, granting, handleGrant,
}: {
  member: Member
  active: boolean
  showGrant: boolean
  setShowGrant: (v: boolean) => void
  selectedDays: number
  setSelectedDays: (n: number) => void
  customDays: string
  setCustomDays: (s: string) => void
  grantAmount: string
  setGrantAmount: (s: string) => void
  granting: boolean
  handleGrant: () => void
}) {
  // D-day 계산
  const supporterDate = member.supporter_until ? new Date(member.supporter_until) : null
  const today = new Date()
  const daysLeft = supporterDate
    ? Math.ceil((supporterDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    : -999
  const expired = daysLeft <= 0
  const imminent = !expired && daysLeft <= 7

  const badge = active
    ? imminent
      ? { bg: 'bg-amber-500/15', text: 'text-amber-300', border: 'border-amber-500/30', label: `후원 임박 (${daysLeft}일 남음)` }
      : { bg: 'bg-emerald-500/15', text: 'text-emerald-300', border: 'border-emerald-500/30', label: `사역 동참자 (${daysLeft}일 남음)` }
    : { bg: 'bg-white/5', text: 'text-slate-500', border: 'border-white/10', label: '일반 회원' }

  return (
    <div>
      <h3 className="text-[13px] font-bold text-slate-500 flex items-center gap-1.5 mb-3">
        <Trophy className="w-3.5 h-3.5" />
        사역 동참자 자격
      </h3>

      <div className="bg-white/5 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-500">상태</span>
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}>
            {badge.label}
          </span>
        </div>

        {active && supporterDate && (
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-slate-500">만료일</span>
            <span className="font-bold text-slate-200">
              {supporterDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        )}

        {!active && supporterDate && (
          <div className="text-[12px] text-slate-500 text-center">
            {supporterDate.toLocaleDateString('ko-KR')}에 만료됨
          </div>
        )}

        {!supporterDate && !active && (
          <p className="text-[12px] text-slate-500 text-center py-1">후원 이력이 없습니다</p>
        )}

        {/* 부여/연장 UI */}
        <div className="pt-2 border-t border-white/5">
          {showGrant ? (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                {GRANT_PRESETS.map(p => (
                  <button
                    key={p.days}
                    onClick={() => { setSelectedDays(p.days); setCustomDays('') }}
                    className={`flex-1 py-1.5 rounded-lg text-[12px] font-bold transition-all ${
                      selectedDays === p.days
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-white/5 text-slate-500 border border-white/5 hover:bg-white/10'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="일수"
                  value={customDays}
                  onChange={e => setCustomDays(e.target.value)}
                  className="w-16 text-[12px] bg-[#04060f] text-slate-100 border border-white/10 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  min="1"
                />
                <input
                  type="text"
                  placeholder="금액(₩)"
                  value={grantAmount ? Number(grantAmount).toLocaleString('ko-KR') : ''}
                  onChange={e => setGrantAmount(e.target.value.replace(/[^0-9]/g, ''))}
                  className="flex-1 text-[12px] bg-[#04060f] text-slate-100 border border-white/10 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
                <button
                  onClick={handleGrant}
                  disabled={granting}
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[12px] font-bold hover:shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  {granting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Heart className="w-3 h-3" />}
                  {active ? '연장' : '부여'}
                </button>
                <button
                  onClick={() => { setShowGrant(false); setCustomDays('') }}
                  className="px-2 py-1.5 bg-white/5 text-slate-500 rounded-lg text-[12px] font-bold hover:bg-white/10 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowGrant(true)}
              className="w-full py-2 rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[12px] font-bold hover:shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <Heart className="w-3.5 h-3.5" />
              {active ? '후원 연장' : '후원 부여'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function DetailDrawer({ member, data, loading, onClose, onGrant, onRevoke, onDelete, onManualDonationAdded, onManualDonationDeleted }: {
  member: Member
  data: DetailData | null
  loading: boolean
  onClose: () => void
  onGrant: (id: string, days: number, amountKrw?: number) => void
  onRevoke?: (id: string) => void
  onDelete: (id: string) => void
  onManualDonationAdded?: () => void
  onManualDonationDeleted?: () => void
}) {
  const active = member.supporter_until && new Date(member.supporter_until) > new Date()
  const [showGrant, setShowGrant] = useState(false)
  const [selectedDays, setSelectedDays] = useState(30)
  const [customDays, setCustomDays] = useState('')
  const [grantAmount, setGrantAmount] = useState('5000')
  const [granting, setGranting] = useState(false)

  // Esc 키로 닫기
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  // 스크롤 잠금 (모달 열렸을 때 body)
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const handleGrant = async () => {
    const days = customDays ? parseInt(customDays) : selectedDays
    if (days < 1) return
    setGranting(true)
    const amt = parseInt(grantAmount.replace(/[^0-9]/g, '')) || 0
    await onGrant(member.id, days, amt > 0 ? amt : undefined)
    setGranting(false)
    setShowGrant(false)
    setCustomDays('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl max-h-[88vh] bg-[#0a0e1a] shadow-2xl shadow-black/40 rounded-2xl border border-white/10 overflow-hidden flex flex-col animate-modal-in"
      >
        <div className="sticky top-0 bg-[#0a0e1a]/95 backdrop-blur-sm border-b border-white/5 px-6 py-4 flex items-center justify-between z-10 shrink-0">
          <h2 className="text-[16px] font-extrabold text-slate-100">회원 상세</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <X className="w-4 h-4 text-slate-500" />
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
              <p className="text-[16px] font-bold text-slate-100">
                {member.name || <span className="text-slate-500">이름 없음</span>}
              </p>
              <p className="text-[13px] text-slate-500 flex items-center gap-1 mt-0.5">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{member.email}</span>
              </p>
              <div className="flex items-center gap-2 mt-2">
                {member.role === 'admin' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-600 text-[11px] font-bold">
                    <Shield className="w-3 h-3" />
                    관리자
                  </span>
                )}
                {active ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-500/10 text-rose-300 text-[11px] font-bold">
                    <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                    사역 동참자
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/5 text-slate-500 text-[11px] font-bold">
                    일반회원
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 🏆 사역 동참자 자격 */}
          <SupporterSection
            member={member}
            active={!!active}
            showGrant={showGrant}
            setShowGrant={setShowGrant}
            selectedDays={selectedDays}
            setSelectedDays={setSelectedDays}
            customDays={customDays}
            setCustomDays={setCustomDays}
            grantAmount={grantAmount}
            setGrantAmount={setGrantAmount}
            granting={granting}
            handleGrant={handleGrant}
          />

          {/* 후원 / 사용 비교 */}
          <DonationUsageSection
            data={data}
            memberId={member.id}
            onAdded={onManualDonationAdded}
            onDeleted={onManualDonationDeleted}
          />

          {/* 액션 */}
          <div className="border-t border-white/5 pt-4 space-y-3">
            {active && (
              <button
                onClick={() => {
                  if (confirm('정말 이 사용자의 사역 동참자 자격을 강등시키겠습니까?')) {
                    fetch('/api/admin/revoke-supporter', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ userId: member.id }),
                    })
                      .then(r => r.json())
                      .then(d => {
                        if (d.success) {
                          onRevoke?.(member.id)
                        } else {
                          alert(d.error || '강등 실패')
                        }
                      })
                  }
                }}
                className="w-full py-3 rounded-xl border border-white/10 text-slate-300 text-[13px] font-bold hover:bg-white/5 transition-all flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                사역 동참자 강등
              </button>
            )}
            <button
              onClick={() => { onClose(); setTimeout(() => onDelete(member.id), 300) }}
              className="w-full py-3 rounded-xl border border-rose-500/30 text-rose-300 text-[13px] font-bold hover:bg-rose-500/10 transition-all flex items-center justify-center gap-2"
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

function MemberCard({ member, onGrant, onDelete, onDetail, summary }: {
  member: Member
  onGrant: (id: string, days: number, amountKrw?: number) => void
  onDelete: (id: string) => void
  onDetail: (member: Member) => void
  summary?: { api_cost_krw: number; manual_donation_krw: number; auto_donation_krw: number; total_donation_krw: number }
}) {
  const active = member.supporter_until && new Date(member.supporter_until) > new Date()
  const [showGrant, setShowGrant] = useState(false)
  const [selectedDays, setSelectedDays] = useState(30)
  const [customDays, setCustomDays] = useState('')
  const [grantAmount, setGrantAmount] = useState('5000')
  const [granting, setGranting] = useState(false)

  const handleGrant = async () => {
    const days = customDays ? parseInt(customDays) : selectedDays
    if (days < 1) return
    setGranting(true)
    const amt = parseInt(grantAmount.replace(/[^0-9]/g, '')) || 0
    await onGrant(member.id, days, amt > 0 ? amt : undefined)
    setGranting(false)
    setShowGrant(false)
    setCustomDays('')
  }

  return (
    <div
      onClick={() => onDetail(member)}
      className="bg-[#0a0e1a] rounded-2xl border border-white/5 p-5 hover:shadow-md hover:border-indigo-500/30 transition-all group cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-[14px] ${
            member.role === 'admin'
              ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md shadow-indigo-500/20'
              : active
                ? 'bg-gradient-to-br from-rose-400 to-pink-500 shadow-md shadow-rose-500/20'
                : 'bg-gradient-to-br from-slate-300 to-slate-400'
          }`}>
            {member.name ? member.name.charAt(0) : member.email.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-[15px] font-bold text-slate-100">
              {member.name || <span className="text-slate-500">이름 없음</span>}
            </p>
            <p className="text-[12px] text-slate-500 flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {member.email}
            </p>
          </div>
        </div>
        {member.role === 'admin' && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-600 text-[11px] font-bold border border-indigo-100">
            <Shield className="w-3 h-3" />
            관리자
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {active ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/10 text-rose-300 text-[12px] font-semibold border border-rose-500/30">
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
              사역 동참자
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 text-slate-500 text-[12px] font-semibold">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              일반회원
            </span>
          )}
        </div>
        {active && (
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            ~{new Date(member.supporter_until!).toLocaleDateString('ko-KR')}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 text-[11px] text-slate-500 mb-4">
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

      {summary && (summary.total_donation_krw > 0 || summary.api_cost_krw > 0) && (
        <div className="border-t border-white/5 pt-3 mb-3 space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500 flex items-center gap-1">
              <Heart className="w-3 h-3" /> 누적 후원
            </span>
            <span className="text-slate-200 font-semibold">
              {summary.total_donation_krw > 0 ? `₩${summary.total_donation_krw.toLocaleString('ko-KR')}` : '-'}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> API 비용
            </span>
            <span className={`font-semibold ${summary.api_cost_krw >= 6500 ? 'text-amber-400' : 'text-slate-200'}`}>
              {summary.api_cost_krw > 0 ? `₩${summary.api_cost_krw.toLocaleString('ko-KR')}` : '-'}
            </span>
          </div>
        </div>
      )}

      {showGrant ? (
        <div className="space-y-2 border-t border-white/5 pt-3" onClick={e => e.stopPropagation()}>
          <div className="flex items-center gap-1.5">
            {GRANT_PRESETS.map(p => (
              <button
                key={p.days}
                onClick={() => { setSelectedDays(p.days); setCustomDays('') }}
                className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                  selectedDays === p.days
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-300'
                    : 'bg-white/5 text-slate-500 border border-white/5 hover:bg-white/10'
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
              className="w-16 text-[12px] bg-[#04060f] text-slate-100 border border-white/10 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              min="1"
            />
            <input
              type="text"
              placeholder="금액(₩)"
              value={grantAmount ? Number(grantAmount).toLocaleString('ko-KR') : ''}
              onChange={e => setGrantAmount(e.target.value.replace(/[^0-9]/g, ''))}
              className="w-20 text-[12px] bg-[#04060f] text-slate-100 border border-white/10 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
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
              className="px-2 py-1.5 bg-white/5 text-slate-500 rounded-lg text-[12px] font-bold hover:bg-white/10 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => setShowGrant(true)}
            className="flex-1 py-2 rounded-xl bg-white/5 text-slate-600 text-[12px] font-bold hover:bg-rose-500/10 hover:text-rose-300 transition-all flex items-center justify-center gap-1.5"
          >
            <Heart className="w-3.5 h-3.5" />
            {active ? '후원 연장' : '후원 부여'}
          </button>
          <button
            onClick={() => onDelete(member.id)}
            className="py-2 px-2.5 rounded-xl bg-white/5 text-slate-500 text-[12px] font-bold hover:bg-rose-500/10 hover:text-rose-500 transition-all"
            title="탈퇴 처리"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}

function SortIcon({ field, sortField, sortOrder }: { field: SortField; sortField: SortField | null; sortOrder: 'asc' | 'desc' }) {
  if (sortField !== field) return <ChevronUp className="w-3 h-3 text-slate-600" />
  return sortOrder === 'asc'
    ? <ChevronUp className="w-3 h-3 text-indigo-400" />
    : <ChevronDown className="w-3 h-3 text-indigo-400" />
}

export default function AdminUsersPage() {
  const { state, update } = useUsersListState()
  const [members, setMembers] = useState<Member[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState(state.search)
  const [refreshKey, setRefreshKey] = useState(0)
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null)

  const [viewMode, setViewMode] = useState<ViewMode>('card')
  const [clientSortField, setClientSortField] = useState<ClientSortField | null>(null)
  const [clientSortOrder, setClientSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [detailData, setDetailData] = useState<DetailData | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailRefreshKey, setDetailRefreshKey] = useState(0)
  const [userSummary, setUserSummary] = useState<Record<string, { api_cost_krw: number; manual_donation_krw: number; auto_donation_krw: number; total_donation_krw: number }>>({})

  const refreshMembers = useCallback(() => setRefreshKey(k => k + 1), [])

  // URL → input 동기화 (뒤로가기 등)
  useEffect(() => { setSearchInput(state.search) }, [state.search])

  // 디바운스된 검색어 → URL
  useEffect(() => {
    if (searchInput === state.search) return
    const id = setTimeout(() => {
      update({ search: searchInput })
    }, 300)
    return () => clearTimeout(id)
  }, [searchInput, state.search, update])

  // 페이지/필터/서버 정렬 변경 시 fetch
  useEffect(() => {
    let cancelled = false
    const abort = new AbortController()

    const loadMembers = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          page: String(state.page),
          limit: String(state.limit),
          ...(state.search && { search: state.search }),
          filter: state.filter,
          sort: state.sort,
          order: state.order,
        })
        const [usersRes, summaryRes] = await Promise.all([
          fetch(`/api/admin/users?${params}`, { signal: abort.signal, cache: 'no-store' }),
          fetch('/api/admin/users/summary', { signal: abort.signal, cache: 'no-store' }),
        ])
        const data = await usersRes.json()
        const sData = await summaryRes.json()
        if (cancelled) return
        if (!data.error) {
          setMembers(data.users || [])
          setTotal(data.total ?? 0)
          setTotalPages(data.totalPages ?? 1)
        }
        if (!sData.error) setUserSummary(sData.summary || {})
      } catch (e) {
        if ((e as any)?.name !== 'AbortError') console.error('loadMembers error:', e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadMembers()
    return () => { cancelled = true; abort.abort() }
  }, [state.page, state.limit, state.search, state.filter, state.sort, state.order, refreshKey])

  useEffect(() => {
    if (!selectedMember) {
      setDetailData(null)
      return
    }
    setDetailLoading(true)
    Promise.all([
      fetch(`/api/admin/users/usage?userId=${selectedMember.id}`).then(r => r.json()),
      fetch(`/api/admin/donations/manual?userId=${selectedMember.id}`).then(r => r.json()),
    ]).then(([usage, donations]) => {
      setDetailData(prev => ({
        ...(prev || {}),
        apiUsage: usage.error ? null : usage,
        manualDonations: donations.donations || [],
      }))
    }).catch(() => {})
      .finally(() => setDetailLoading(false))
  }, [selectedMember?.id, detailRefreshKey])

  const handleSort = (field: SortField) => {
    if (field === 'total_donation' || field === 'api_cost') {
      // 클라이언트 정렬 (summary 데이터 기반)
      if (clientSortField === field) {
        setClientSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
      } else {
        setClientSortField(field)
        setClientSortOrder('desc')
      }
    } else {
      // 서버 정렬
      const isCurrent = state.sort === field
      update({ sort: field, order: isCurrent ? (state.order === 'asc' ? 'desc' : 'asc') : 'desc' })
    }
  }

  const handleGrant = async (userId: string, days: number, amountKrw?: number) => {
    setMessage(null)
    const res = await fetch('/api/admin/grant-supporter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, days, amountKrw, note: amountKrw ? `후원 부여 ${days}일` : undefined }),
    })
    const d = await res.json()
    if (d.success) {
      setMessage({ type: 'ok', text: amountKrw ? `${days}일 부여 · ₩${amountKrw.toLocaleString('ko-KR')} 기록됨` : `${days}일 후원자 권한이 부여되었습니다.` })
      // 클라이언트 측에서 즉시 UI 업데이트 (서버 캐시 무관)
      const now = new Date()
      const newUntil = new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString()
      setMembers(prev => prev.map(m => m.id === userId ? { ...m, supporter_until: newUntil } : m))
      setSelectedMember(prev => prev?.id === userId ? { ...prev, supporter_until: newUntil } : prev)
      // 백그라운드 새로고침 (데이터 동기화)
      setTimeout(() => refreshMembers(), 800)
    } else {
      setMessage({ type: 'error', text: d.error || '부여 실패' })
    }
  }

  const handleRevoke = async (userId: string) => {
    if (!confirm('정말 이 사용자의 사역 동참자 자격을 강등시키겠습니까?')) return
    setMessage(null)
    const res = await fetch('/api/admin/revoke-supporter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    const d = await res.json()
    if (d.success) {
      setMessage({ type: 'ok', text: '사역 동참자 자격이 강등되었습니다.' })
      // 즉시 UI 업데이트
      setMembers(prev => prev.map(m => m.id === userId ? { ...m, supporter_until: null } : m))
      setSelectedMember(prev => prev?.id === userId ? { ...prev, supporter_until: null } : prev)
      setTimeout(() => refreshMembers(), 800)
    } else {
      setMessage({ type: 'error', text: d.error || '강등 실패' })
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
      refreshMembers()
    } else {
      setMessage({ type: 'error', text: d.error || '삭제 실패' })
      setDeleteTarget(null)
    }
  }

  const handleExportCSV = () => {
    const exportData = clientSortField ? [...members].sort((a, b) => {
      const dir = clientSortOrder === 'asc' ? 1 : -1
      const aVal = clientSortField === 'total_donation' ? (userSummary[a.id]?.total_donation_krw || 0) : (userSummary[a.id]?.api_cost_krw || 0)
      const bVal = clientSortField === 'total_donation' ? (userSummary[b.id]?.total_donation_krw || 0) : (userSummary[b.id]?.api_cost_krw || 0)
      return aVal < bVal ? -dir : aVal > bVal ? dir : 0
    }) : members
    const headers = ['이름', '이메일', '역할', '후원상태', '후원만료일', '수동후원', '자동후원', '누적후원', '누적API비용', '마진', '가입일', '최근접속일']
    const rows = exportData.map(m => {
      const sum = userSummary[m.id]
      const totalDonation = sum?.total_donation_krw || 0
      const totalApi = sum?.api_cost_krw || 0
      const margin = totalDonation - totalApi
      return [
        m.name || '',
        m.email,
        m.role === 'admin' ? '관리자' : '회원',
        m.supporter_until && new Date(m.supporter_until) > new Date() ? '후원중' : '일반',
        m.supporter_until ? new Date(m.supporter_until).toLocaleDateString('ko-KR') : '',
        sum?.manual_donation_krw || 0,
        sum?.auto_donation_krw || 0,
        totalDonation,
        totalApi,
        margin,
        new Date(m.created_at).toLocaleDateString('ko-KR'),
        m.last_sign_in_at ? new Date(m.last_sign_in_at).toLocaleDateString('ko-KR') : '',
      ]
    })
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `회원목록_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const filtered = members

  // 클라이언트 정렬 (summary 기반 컬럼만)
  const sorted = clientSortField
    ? [...members].sort((a, b) => {
        const dir = clientSortOrder === 'asc' ? 1 : -1
        const aVal = clientSortField === 'total_donation'
          ? (userSummary[a.id]?.total_donation_krw || 0)
          : (userSummary[a.id]?.api_cost_krw || 0)
        const bVal = clientSortField === 'total_donation'
          ? (userSummary[b.id]?.total_donation_krw || 0)
          : (userSummary[b.id]?.api_cost_krw || 0)
        return aVal < bVal ? -dir : aVal > bVal ? dir : 0
      })
    : members

  const supporterCount = members.filter(m => m.supporter_until && new Date(m.supporter_until) > new Date()).length
  const activeSortField: SortField | null = clientSortField || state.sort
  const activeSortOrder: 'asc' | 'desc' = clientSortField ? clientSortOrder : state.order

  // 첫 로딩 시에만 전체 로더, 이후엔 인라인
  if (loading && members.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-extrabold text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            회원 관리
          </h1>
          <p className="text-[14px] text-slate-500 mt-1">
            전체 <span className="text-slate-300 font-semibold">{total.toLocaleString('ko-KR')}</span>명
            {state.search && <span className="ml-1.5 text-indigo-300">· &ldquo;{state.search}&rdquo; 검색</span>}
            {state.filter !== 'all' && (
              <span className="ml-1.5 text-indigo-300">· {state.filter === 'supporter' ? '사역 동참자만' : '일반회원만'}</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/5 bg-[#0a0e1a] text-[12px] font-bold text-slate-600 hover:bg-white/5 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            CSV 내보내기
          </button>
          <div className="flex items-center bg-white/5 rounded-xl p-0.5">
            <button
              onClick={() => setViewMode('card')}
              className={`p-2 rounded-lg text-[12px] font-bold transition-all ${
                viewMode === 'card' ? 'bg-[#0a0e1a] text-slate-200 shadow-sm' : 'text-slate-500 hover:text-slate-600'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg text-[12px] font-bold transition-all ${
                viewMode === 'table' ? 'bg-[#0a0e1a] text-slate-200 shadow-sm' : 'text-slate-500 hover:text-slate-600'
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
          message.type === 'ok' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/10 text-red-300 border border-red-500/30'
        }`}>
          {message.type === 'ok' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
          {message.text}
        </div>
      )}

      {/* 검색 + 필터 */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="이메일 또는 이름으로 검색..."
            className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-white/10 bg-[#04060f] text-[14px] text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 focus:border-indigo-400"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded text-slate-500 hover:text-slate-200 transition-colors"
              title="검색어 지우기"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {(['all', 'supporter', 'general'] as const).map(f => (
            <button
              key={f}
              onClick={() => update({ filter: f })}
              className={`px-3 py-2 rounded-xl text-[12px] font-bold transition-all ${
                state.filter === f
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'bg-[#0a0e1a] text-slate-500 border border-white/5 hover:bg-white/5'
              }`}
            >
              {f === 'all' ? '전체' : f === 'supporter' ? '❤️ 후원' : '일반'}
            </button>
          ))}
        </div>
      </div>

      {/* 회원 목록 */}
      {loading && members.length > 0 ? (
        <div className="text-center py-4 text-[12px] text-slate-500 flex items-center justify-center gap-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> 불러오는 중...
        </div>
      ) : null}
      {sorted.length === 0 ? (
        <div className="text-center py-16 text-slate-500 text-[14px]">
          {state.search || state.filter !== 'all'
            ? '검색 결과가 없습니다'
            : '등록된 회원이 없습니다'}
        </div>
      ) : viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sorted.map(m => (
            <MemberCard
              key={m.id}
              member={m}
              onGrant={handleGrant}
              onDelete={(id) => setDeleteTarget(m)}
              onDetail={setSelectedMember}
              summary={userSummary[m.id]}
            />
          ))}
        </div>
      ) : (
        <div className="bg-[#0a0e1a] rounded-2xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-white/5 border-b border-white/5">
                  {([
                    { key: 'name', label: '이름' },
                    { key: 'email', label: '이메일' },
                    { key: 'role', label: '상태' },
                    { key: 'supporter_until', label: '후원만료일' },
                    { key: 'total_donation', label: '누적 후원' },
                    { key: 'api_cost', label: '누적 API' },
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
                        <SortIcon field={col.key} sortField={activeSortField} sortOrder={activeSortOrder} />
                      </div>
                    </th>
                  ))}
                  <th className="text-left px-5 py-3.5 font-bold text-slate-600">관리</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((m, i) => {
                  const active = m.supporter_until && new Date(m.supporter_until) > new Date()
                  const sum = userSummary[m.id]
                  return (
                    <tr
                      key={m.id}
                      onClick={() => setSelectedMember(m)}
                      className={`border-b border-white/5 cursor-pointer transition-colors ${
                        i % 2 === 0 ? 'bg-[#0a0e1a]' : 'bg-white/5'
                      } hover:bg-indigo-500/10/40`}
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
                          <span className="font-bold text-slate-200">
                            {m.name || <span className="text-slate-500">이름 없음</span>}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">{m.email}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          {m.role === 'admin' && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 text-[10px] font-bold">
                              <Shield className="w-2.5 h-2.5" />
                              관리자
                            </span>
                          )}
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold ${
                            active
                              ? 'bg-rose-500/10 text-rose-300'
                              : 'bg-white/5 text-slate-500'
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
                      <td className="px-5 py-3.5 text-[12px]">
                        {sum && sum.total_donation_krw > 0 ? (
                          <span className="text-emerald-400 font-semibold">₩{sum.total_donation_krw.toLocaleString('ko-KR')}</span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-[12px]">
                        {sum && sum.api_cost_krw > 0 ? (
                          <span className={sum.api_cost_krw >= 6500 ? 'text-amber-400 font-semibold' : 'text-slate-200'}>
                            ₩{sum.api_cost_krw.toLocaleString('ko-KR')}
                          </span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
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
                              onClick={() => handleGrant(m.id, p.days, p.defaultAmount)}
                              className="px-1.5 py-1 rounded-lg bg-rose-500/10 text-rose-300 text-[10px] font-bold hover:bg-rose-500/20 transition-colors"
                              title={`${p.label} 후원 부여 (₩${p.defaultAmount.toLocaleString('ko-KR')} 기록)`}
                            >
                              {p.label}
                            </button>
                          ))}
                          {active && (
                            <button
                              onClick={() => handleRevoke(m.id)}
                              className="px-2 py-1 rounded-lg bg-white/5 text-slate-500 text-[10px] font-bold hover:bg-white/10 transition-colors"
                              title="사역 동참자 강등"
                            >
                              강등
                            </button>
                          )}
                          <button
                            onClick={() => setDeleteTarget(m)}
                            className="px-2 py-1 rounded-lg bg-white/5 text-slate-500 text-[11px] font-bold hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
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

      {/* 페이지네이션 */}
      <Pagination
        page={state.page}
        totalPages={totalPages}
        total={total}
        limit={state.limit}
        onPageChange={(p) => update({ page: p })}
        loading={loading}
      />

      {/* 상세 드로어 */}
      {selectedMember && (
        <DetailDrawer
          member={selectedMember}
          data={detailData}
          loading={detailLoading}
          onClose={() => setSelectedMember(null)}
          onGrant={handleGrant}
          onRevoke={handleRevoke}
          onDelete={(id) => { setSelectedMember(null); setDeleteTarget(members.find(m => m.id === id) || null) }}
          onManualDonationAdded={() => {
            setDetailRefreshKey(k => k + 1)
            refreshMembers()
          }}
          onManualDonationDeleted={() => {
            setDetailRefreshKey(k => k + 1)
            refreshMembers()
          }}
        />
      )}

      {/* 탈퇴 확인 모달 */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setDeleteTarget(null)}>
          <div className="bg-[#0a0e1a] rounded-3xl shadow-2xl border border-white/5 p-6 max-w-sm w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-100 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-rose-500" />
            </div>
            <h2 className="text-[18px] font-extrabold text-slate-100 text-center mb-2">회원 탈퇴</h2>
            <p className="text-[14px] text-slate-500 text-center mb-4">{deleteTarget.email}</p>
            <div className="bg-amber-500/10 rounded-xl px-4 py-3 mb-5 text-[12px] text-amber-300 flex items-start gap-2">
              <X className="w-4 h-4 shrink-0 mt-0.5" />
              모든 데이터가 영구 삭제되며 복구할 수 없습니다.
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/5 text-[14px] font-bold text-slate-600 hover:bg-white/5 transition-all"
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


