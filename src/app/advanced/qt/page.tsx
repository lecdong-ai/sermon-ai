'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import QtGenerator from '@/components/advanced/QtGenerator'

export default function QtPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [isAdminUser, setIsAdminUser] = useState(false)

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.push('/login?redirect=/advanced/qt')
      return
    }
    fetch('/api/admin/check-role')
      .then(r => r.json())
      .then(d => setIsAdminUser(d.admin))
      .catch(() => setIsAdminUser(false))
      .finally(() => setChecking(false))
  }, [user, loading, router])

  if (loading || checking) {
    return (
      <div className="h-full overflow-y-auto scrollbar-thin flex items-center justify-center bg-[#030612]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-slate-400">말씀 연구실 Q.T 스튜디오 로딩 중...</span>
        </div>
      </div>
    )
  }

  if (!isAdminUser) return null

  return (
    <div className="h-full overflow-y-auto scrollbar-thin pb-16 bg-[#030612] text-slate-100">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6 w-full">
        <QtGenerator />
      </div>
    </div>
  )
}
