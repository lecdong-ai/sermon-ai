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
  const isShopOrPricing = pathname.startsWith('/shop') || pathname.startsWith('/support') || pathname.endsWith('/pricing')
  const isSchool = pathname.startsWith('/school') && !pathname.endsWith('/pricing')
  const showHeader = isShopOrPricing || !(isDashboard || isAdmin || isAdvanced || isIntro || isConti || isSchool)

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
  const isShopOrPricing = pathname.startsWith('/shop') || pathname.startsWith('/support') || pathname.endsWith('/pricing')
  const isSchool = pathname.startsWith('/school') && !pathname.endsWith('/pricing')
  return isShopOrPricing || !(isDashboard || isAdmin || isAdvanced || isIntro || isConti || isSchool)
}
