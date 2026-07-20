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
      <div className="h-full overflow-y-auto scrollbar-thin pb-12 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAdminUser) return null

  return (
    <div className="h-full overflow-y-auto scrollbar-thin pb-12">
      <div className="max-w-[1000px] mx-auto px-6 py-8 w-full">
        <QtGenerator />
      </div>
    </div>
  )
}
