'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/Header'

export default function SiteHeader() {
  const pathname = usePathname()
  const isDashboard = pathname.startsWith('/dashboard')
  const isAdmin = pathname.startsWith('/admin')
  const isAdvanced = pathname.startsWith('/advanced')
  const isIntro = pathname === '/intro'
  const isConti = pathname.startsWith('/conti')
  const isSchool = pathname.startsWith('/school')
  const showHeader = !(isDashboard || isAdmin || isAdvanced || isIntro || isConti || isSchool)

  if (!showHeader) return null

  return <Header />
}

export function useShowSiteHeader(): boolean {
  const pathname = usePathname()
  const isDashboard = pathname.startsWith('/dashboard')
  const isAdmin = pathname.startsWith('/admin')
  const isAdvanced = pathname.startsWith('/advanced')
  const isIntro = pathname === '/intro'
  const isConti = pathname.startsWith('/conti')
  const isSchool = pathname.startsWith('/school')
  return !(isDashboard || isAdmin || isAdvanced || isIntro || isConti || isSchool)
}
