'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, Search, Heart } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const tabs = [
  { label: '홈', href: '/', icon: Home },
  { label: '큐티', href: '/qt', icon: BookOpen },
  { label: '검색', href: '/search', icon: Search },
  { label: '후원샵', href: '/shop', icon: Heart },
]

export function MobileTabBar() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-t border-border/60 pb-[env(safe-area-inset-bottom,0px)]">
      <div className="flex items-center justify-around h-14">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href
          const Icon = tab.icon
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 w-full h-full text-caption transition-all duration-200',
                isActive
                  ? 'text-accent'
                  : 'text-foreground-subtle hover:text-foreground-muted'
              )}
            >
              <Icon className={cn('w-5 h-5', isActive && 'fill-accent/10')} />
              <span>{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
