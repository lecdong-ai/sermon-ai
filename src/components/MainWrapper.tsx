'use client'

import { useShowSiteHeader } from './SiteHeader'

export default function MainWrapper({ children }: { children: React.ReactNode }) {
  const showHeader = useShowSiteHeader()
  return <main className={showHeader ? 'pt-16' : ''}>{children}</main>
}
