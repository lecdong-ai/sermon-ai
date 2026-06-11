'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdvancedHeader() {
  const router = useRouter()
  const [query, setQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/advanced/projects?search=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <header className="h-14 border-b border-paper-200 bg-paper-50 flex items-center justify-between px-6 shrink-0">
      <form onSubmit={handleSearch} className="flex-1 max-w-sm">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-paper-400 text-sm pointer-events-none">⌕</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="설교 제목, 본문, 주제, 노트 검색..."
            className="adv-input pl-8 pr-3"
          />
        </div>
      </form>
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/advanced/projects/new')}
          className="text-sm bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded-md transition-colors font-medium"
        >
          + 새 프로젝트
        </button>
        <div className="w-7 h-7 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-medium">
          K
        </div>
      </div>
    </header>
  )
}
