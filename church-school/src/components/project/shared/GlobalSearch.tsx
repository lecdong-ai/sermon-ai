'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, FileText, BrainCircuit, ArrowRight } from 'lucide-react'
import { getCustomProjects } from '@/lib/project/customProjects'

interface SearchResult {
  id: string
  type: 'project' | 'insight'
  title: string
  subtitle: string
  match: string
  href: string
}

const TYPE_META = {
  project: { Icon: FileText, color: 'text-indigo-300 bg-indigo-500/15', label: '설교' },
  insight: { Icon: BrainCircuit, color: 'text-violet-300 bg-violet-500/15', label: '통찰' },
}

export default function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [activeIdx, setActiveIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((v) => !v)
      } else if (e.key === 'Escape' && open) {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery('')
      setResults([])
      setActiveIdx(0)
    }
  }, [open])

  const performSearch = useCallback((q: string) => {
    const term = q.trim().toLowerCase()
    if (!term) {
      setResults([])
      return
    }
    const out: SearchResult[] = []
    const customProjects = getCustomProjects()
    for (const p of customProjects) {
      const fields = [p.title, p.passage, p.coreMessage, p.sermonType, p.preacher, ...(p.themeNames || [])]
      const matchField = fields.find((f) => f && String(f).toLowerCase().includes(term))
      if (matchField) {
        out.push({
          id: p.id,
          type: 'project',
          title: p.title || '(제목 없음)',
          subtitle: p.passage || '',
          match: matchField,
          href: `/projects/${p.id}`,
        })
      }
    }
    setResults(out.slice(0, 12))
    setActiveIdx(0)
  }, [])

  useEffect(() => {
    performSearch(query)
  }, [query, performSearch])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && results[activeIdx]) {
      e.preventDefault()
      router.push(results[activeIdx].href)
      setOpen(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4">
      <div
        className="absolute inset-0 bg-[#04060f]/80 backdrop-blur-md"
        onClick={() => setOpen(false)}
      />
      <div className="relative w-full max-w-2xl rounded-2xl border border-white/[0.08] bg-[#0c1020]/95 backdrop-blur-xl shadow-2xl shadow-indigo-500/10 overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06]">
          <Search className="w-4 h-4 text-slate-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="설교, 통찰, 본문, 주제 검색..."
            className="flex-1 bg-transparent text-[14px] text-white placeholder:text-slate-500 outline-none"
          />
          <kbd className="text-[10px] text-slate-500 bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.06]">ESC</kbd>
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          {query && results.length === 0 && (
            <div className="px-5 py-12 text-center">
              <p className="text-[12px] text-slate-500">&quot;{query}&quot;에 대한 결과가 없습니다</p>
            </div>
          )}
          {!query && (
            <div className="px-5 py-8 text-center">
              <p className="text-[12px] text-slate-500">설교, 통찰, 본문, 주제를 검색하세요</p>
              <div className="flex items-center justify-center gap-2 mt-3 text-[10px] text-slate-600">
                <kbd className="px-1.5 py-0.5 bg-white/[0.04] rounded border border-white/[0.06]">↑↓</kbd>
                <span>이동</span>
                <kbd className="px-1.5 py-0.5 bg-white/[0.04] rounded border border-white/[0.06]">↵</kbd>
                <span>선택</span>
              </div>
            </div>
          )}
          {results.length > 0 && (
            <div className="py-2">
              {results.map((r, i) => {
                const meta = TYPE_META[r.type]
                const Icon = meta.Icon
                const isActive = i === activeIdx
                return (
                  <button
                    key={`${r.type}-${r.id}`}
                    onClick={() => { router.push(r.href); setOpen(false) }}
                    onMouseEnter={() => setActiveIdx(i)}
                    className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-colors ${
                      isActive ? 'bg-indigo-500/10' : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${meta.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                          {meta.label}
                        </span>
                      </div>
                      <div className="text-[13px] text-white font-medium truncate">
                        {highlightMatch(r.title, query)}
                      </div>
                      {r.subtitle && (
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">{r.subtitle}</div>
                      )}
                    </div>
                    {isActive && <ArrowRight className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                  </button>
                )
              })}
            </div>
          )}
        </div>
        <div className="px-5 py-2.5 border-t border-white/[0.06] bg-[#0a0e1c] flex items-center justify-between text-[10px] text-slate-600">
          <span>{results.length > 0 ? `${results.length}개 결과` : '준비됨'}</span>
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 bg-white/[0.04] rounded border border-white/[0.06]">⌘K</kbd>
            <span>검색</span>
          </span>
        </div>
      </div>
    </div>
  )
}

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-indigo-500/30 text-indigo-200 rounded px-0.5">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  )
}
