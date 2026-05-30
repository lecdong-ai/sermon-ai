'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/Header'

export default function SiteHeader() {
  const pathname = usePathname()
  const isDashboard = pathname.startsWith('/dashboard')

  if (isDashboard) return null

  return <Header />
}
