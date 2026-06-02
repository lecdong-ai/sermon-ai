'use client'

import { useEffect, useState } from 'react'
import { Loader2, Search, Shield, Trash2, XCircle, AlertTriangle } from 'lucide-react'

interface User {
  id: string
  email: string
  name: string | null
  role: string
  created_at: string
  last_sign_in_at: string | null
  confirmed_at: string | null
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [confirmUser, setConfirmUser] = useState<User | null>(null)

  const fetchUsers = () => {
    setLoading(true)
    fetch('/api/admin/users')
      .then(r => r.json())
      .then(d => { if (!d.error) setUsers(d.users) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchUsers() }, [])

  const handleDelete = async (userId: string) => {
    setDeleting(userId)
    try {
      const res = await fetch('/api/admin/users/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      const data = await res.json()
      if (data.success) {
        setConfirmUser(null)
        fetchUsers()
      } else {
        alert(data.error || '삭제 실패')
      }
    } catch {
      alert('네트워크 오류')
    } finally {
      setDeleting(null)
    }
  }

  const filtered = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.name?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-extrabold text-slate-800 mb-1">사용자 관리</h1>
        <p className="text-[14px] text-slate-500">전체 {users.length}명의 사용자</p>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="이메일 또는 이름으로 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-5 py-3 font-bold text-slate-600">이메일</th>
                <th className="text-left px-5 py-3 font-bold text-slate-600">이름</th>
                <th className="text-left px-5 py-3 font-bold text-slate-600">권한</th>
                <th className="text-left px-5 py-3 font-bold text-slate-600">가입일</th>
                <th className="text-left px-5 py-3 font-bold text-slate-600">마지막 접속</th>
                <th className="text-left px-5 py-3 font-bold text-slate-600">관리</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr key={u.id} className={`border-b border-slate-100 hover:bg-slate-50/50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                  <td className="px-5 py-3">
                    <span className="font-semibold text-slate-700">{u.email}</span>
                  </td>
                  <td className="px-5 py-3 text-slate-500">{u.name || '-'}</td>
                  <td className="px-5 py-3">
                    {u.role === 'admin' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-100 text-indigo-700 text-[12px] font-bold">
                        <Shield className="w-3 h-3" />
                        Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-slate-100 text-slate-500 text-[12px] font-medium">
                        User
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {new Date(u.created_at).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString('ko-KR') : '-'}
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => setConfirmUser(u)}
                      disabled={deleting === u.id}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg text-[12px] font-medium text-rose-600 hover:bg-rose-50 transition-all disabled:opacity-50"
                    >
                      {deleting === u.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Trash2 className="w-3 h-3" />
                      )}
                      탈퇴
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {confirmUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 max-w-sm w-full mx-4 animate-in">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-rose-500" />
            </div>
            <h2 className="text-[18px] font-extrabold text-slate-800 text-center mb-2">사용자 탈퇴</h2>
            <p className="text-[14px] text-slate-500 text-center mb-1">
              다음 사용자를 탈퇴시키겠습니까?
            </p>
            <p className="text-[15px] font-bold text-slate-700 text-center mb-4">
              {confirmUser.email}
            </p>
            <div className="bg-amber-50 rounded-xl px-4 py-3 mb-5 text-[12px] text-amber-700 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              모든 데이터(설교, 사용량, 구독 등)가 영구 삭제되며 복구할 수 없습니다.
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmUser(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-[14px] font-bold text-slate-600 hover:bg-slate-50 transition-all"
              >
                취소
              </button>
              <button
                onClick={() => handleDelete(confirmUser.id)}
                disabled={deleting === confirmUser.id}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white text-[14px] font-bold hover:bg-rose-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting === confirmUser.id ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> 처리 중...</>
                ) : (
                  <><Trash2 className="w-4 h-4" /> 탈퇴 처리</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
