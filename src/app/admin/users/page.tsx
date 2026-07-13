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

type ServerSortField = 'name' | 'email' | 'role' | 'created_at' | 'last_sign_in_at'
type ClientSortField = 'total_donation' | 'api_cost'
type SortField = ServerSortField | ClientSortField
type ViewMode = 'card' | 'table'

const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString('ko-KR') : '-'

function DetailDrawer({ member, onClose, onDelete }: {
  member: Member
  onClose: () => void
  onDelete: (id: string) => void
}) {
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
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-[16px] shrink-0 bg-gradient-to-br from-indigo-500 to-purple-600">
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
              </div>
            </div>
          </div>

          {/* 액션 */}
          <div className="border-t border-white/5 pt-4 space-y-3">
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

function MemberCard({ member, onDelete, onDetail }: {
  member: Member
  onDelete: (id: string) => void
  onDetail: (member: Member) => void
}) {
  return (
    <div
      onClick={() => onDetail(member)}
      className="bg-[#0a0e1a] rounded-2xl border border-white/5 p-5 hover:shadow-md hover:border-indigo-500/30 transition-all group cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-[14px] bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md shadow-indigo-500/20">
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

      <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
        <button
          onClick={() => onDelete(member.id)}
          className="py-2 px-2.5 rounded-xl bg-white/5 text-slate-500 text-[12px] font-bold hover:bg-rose-500/10 hover:text-rose-500 transition-all"
          title="탈퇴 처리"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
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
              onDelete={(id) => setDeleteTarget(m)}
              onDetail={setSelectedMember}
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
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-[11px] shrink-0 bg-gradient-to-br from-indigo-500 to-purple-600">
                        {m.name ? m.name.charAt(0) : m.email.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-slate-200">
                        {m.name || <span className="text-slate-500">이름 없음</span>}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">{m.email}</td>
                  <td className="px-5 py-3.5">
                    {m.role === 'admin' && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 text-[10px] font-bold">
                        <Shield className="w-2.5 h-2.5" />
                        관리자
                      </span>
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
          onDelete={(id) => { setSelectedMember(null); setDeleteTarget(members.find(m => m.id === id) || null) }}
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


