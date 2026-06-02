'use client'

import { useEffect, useState } from 'react'
import { Loader2, Search, Shield } from 'lucide-react'

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

  useEffect(() => {
    fetch('/api/admin/users')
      .then(r => r.json())
      .then(d => { if (!d.error) setUsers(d.users) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
