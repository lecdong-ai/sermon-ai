'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils/cn'
import { mainNav } from '@/config/nav'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/layout/Container'

export function Header() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/60">
      <Container className="flex items-center justify-between h-16">
        <Link
          href="/qt"
          className="font-serif text-lg text-foreground tracking-tight hover:text-accent transition-colors duration-200"
        >
          큐티 아카이브
        </Link>

        <nav className="hidden md:flex items-center gap-0.5">
          {mainNav.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-3 py-2 text-sm rounded-md transition-all duration-200',
                  isActive
                    ? 'text-foreground bg-accent-soft/60 font-medium'
                    : 'text-foreground-muted hover:text-foreground hover:bg-surface-2'
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/search"
            className="hidden sm:flex items-center justify-center w-9 h-9 text-foreground-muted hover:text-foreground hover:bg-surface-2 rounded-md transition-all duration-200"
            aria-label="검색"
          >
            <Search className="w-4 h-4" />
          </Link>

          <button
            className="md:hidden flex items-center justify-center w-9 h-9 text-foreground-muted hover:text-foreground hover:bg-surface-2 rounded-md transition-all duration-200"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="메뉴"
          >
            {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </Container>

      {menuOpen && (
        <div className="md:hidden border-t border-border/60 bg-background/95 backdrop-blur-md animate-fade-in">
          <Container className="py-3 space-y-0.5">
            {mainNav.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    'block px-4 py-3 rounded-lg text-sm transition-all duration-200',
                    isActive
                      ? 'text-foreground bg-accent-soft/60 font-medium'
                      : 'text-foreground-muted hover:text-foreground hover:bg-surface-2'
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
            <Link
              href="/search"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm text-foreground-muted hover:text-foreground hover:bg-surface-2 transition-all duration-200"
            >
              <Search className="w-4 h-4" />
              검색
            </Link>
          </Container>
        </div>
      )}
    </header>
  )
}
