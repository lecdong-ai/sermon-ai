'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function NewSermonPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/sermon/new')
  }, [router])

  return (
    <div className="animate-fade-in flex items-center justify-center min-h-[calc(100vh-12rem)]">
      <p className="text-muted text-sm">이동 중...</p>
    </div>
  )
}
