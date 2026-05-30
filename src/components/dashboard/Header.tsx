'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Header() {
  const router = useRouter()
  const [query, setQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/dashboard/sermons?search=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <header className="h-14 border-b border-border bg-surface flex items-center justify-between px-6 shrink-0">
      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">⌕</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="설교 제목, 본문, 주제 검색..."
            className="w-full pl-8 pr-3 py-1.5 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-light focus:border-primary-light placeholder:text-muted/50"
          />
        </div>
      </form>
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/dashboard/sermons/new')}
          className="text-sm bg-primary hover:bg-primary-dark text-white px-4 py-1.5 rounded-md transition-colors"
        >
          + 새 설교
        </button>
        <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
          K
        </div>
      </div>
    </header>
  )
}
