'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import AdvancedSidebar from '@/components/advanced/Sidebar'
import AdvancedHeader from '@/components/advanced/Header'
import { Loader2 } from 'lucide-react'

export default function AdvancedLayoutClient({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [checking, setChecking] = useState(true)
  const [isSupporter, setIsSupporter] = useState(false)

  const isPreview = pathname?.startsWith('/advanced/preview')

  useEffect(() => {
    // Preview mode: skip all checks, render immediately
    if (isPreview) {
      setChecking(false)
      setIsSupporter(true)
      return
    }

    if (authLoading) return

    if (!user) {
      router.push('/login?redirect=/advanced')
      return
    }

    Promise.all([
      fetch('/api/admin/check-role').then(r => r.json()),
      fetch('/api/usage').then(r => r.json()),
    ])
      .then(([role, usage]) => {
        if (role.admin) {
          setIsSupporter(true)
          return
        }
        if (!usage.error && usage.supporter) {
          setIsSupporter(true)
          return
        }
        router.push('/support')
      })
      .catch(() => router.push('/support'))
      .finally(() => setChecking(false))
  }, [user, authLoading, router, isPreview])

  if (authLoading || checking) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#050814]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400 mx-auto mb-3" />
          <p className="text-slate-400 text-[14px]">접근 권한 확인 중...</p>
        </div>
      </div>
    )
  }

  if (!isSupporter) return null

  return (
    <div className="flex h-screen overflow-hidden bg-[#050814] text-slate-200 -mt-16 relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-indigo-500/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full bg-purple-500/5 blur-[120px]" />
      </div>

      <div className="relative z-10 flex w-full h-full">
        <AdvancedSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <AdvancedHeader />
          <main className="flex-1 overflow-y-auto bg-[#080d22]/30 backdrop-blur-sm relative scrollbar-thin">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
