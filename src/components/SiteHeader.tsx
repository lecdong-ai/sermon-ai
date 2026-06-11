'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/Header'

export default function SiteHeader() {
  const pathname = usePathname()
  const isDashboard = pathname.startsWith('/dashboard')
  const isAdmin = pathname.startsWith('/admin')
  const isAdvanced = pathname.startsWith('/advanced')
  const isIntro = pathname === '/intro'

  if (isDashboard || isAdmin || isAdvanced || isIntro) return null

  return <Header />
}
