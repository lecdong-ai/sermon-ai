'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { NoteEntry } from '@/lib/advanced/notesData'

export type LinkTarget = 'project' | 'series' | 'manuscript'

interface ProjectOption {
  id: string
  title: string
  passage: string
  status: string
}

interface SeriesOption {
  id: string
  name: string
  description: string
}

interface LinkInsightModalProps {
  target: LinkTarget
  insight: NoteEntry
  onClose: () => void
  onLinked?: (kind: 'project' | 'series', ids: string[]) => void
  onUnlinked?: (kind: 'project' | 'series', id: string) => void
  onNavigateToProject?: (id: string) => void
}

const STATUS_LABELS: Record<string, string> = {
  draft: '초안',
  in_progress: '작성 중',
  completed: '완료',
  research: '연구 중',
  prepare: '준비 중',
  writing: '작성 중',
  review: '검토 중',
  archived: '보관',
}

export default function LinkInsightModal({ target, insight, onClose, onLinked, onUnlinked, onNavigateToProject }: LinkInsightModalProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [items, setItems] = useState<ProjectOption[] | SeriesOption[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let ac: AbortController | null = null
    setLoading(true)
    setError(null)
    ac = new AbortController()
    const url = target === 'project' ? '/api/sermons' : target === 'series' ? '/api/series' : '/api/sermons?status=writing,in_progress,prepare,research,draft'
    fetch(url, { signal: ac.signal })
      .then(async (r) => {
        const json = await r.json()
        if (!r.ok || !json.success) throw new Error(json.error || '목록을 불러올 수 없습니다.')
        if (target === 'project' || target === 'manuscript') {
          setItems((json.data || []).map((s: any) => ({
            id: s.id,
            title: s.title || '(제목 없음)',
            passage: s.normalizedPassage || s.passage || '',
            status: s.status || 'draft',
          })))
        } else {
          setItems((json.data || []).map((s: any) => ({
            id: s.id,
            name: s.name || '(이름 없음)',
            description: s.description || '',
          })))
        }
      })
      .catch((e) => {
        if (e?.name === 'AbortError') return
        setError(e?.message || '조회 실패')
      })
      .finally(() => setLoading(false))
    return () => { ac?.abort() }
  }, [target])

  const linkedIds = useMemo(() => {
    if (target === 'project' || target === 'manuscript') return new Set(insight.projectIds || [])
    return new Set(insight.seriesIds || [])
  }, [target, insight])

  const passageHint = useMemo(() => {
    if (target !== 'project' && target !== 'manuscript') return null
    const p = insight.connections.find((c) => c.type === 'passage')
    return p?.label || null
  }, [target, insight])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter((it: any) => {
      const text = (it.title || it.name || '').toLowerCase()
      return text.includes(q) || (it.passage || '').toLowerCase().includes(q) || (it.description || '').toLowerCase().includes(q)
    })
  }, [items, search])

  const sorted = useMemo(() => {
    if (target !== 'project' && target !== 'manuscript') return filtered
    if (!passageHint) return filtered
    return [...filtered].sort((a: any, b: any) => {
      const aMatch = a.passage && passageHint && a.passage.includes(passageHint)
      const bMatch = b.passage && passageHint && b.passage.includes(passageHint)
      if (aMatch && !bMatch) return -1
      if (!aMatch && bMatch) return 1
      return 0
    })
  }, [filtered, passageHint, target])

  const handleLink = async (id: string) => {
    setBusyId(id)
    try {
      const field = target === 'series' ? 'seriesIds' : 'projectIds'
      const current = target === 'series' ? (insight.seriesIds || []) : (insight.projectIds || [])
      if (current.includes(id)) {
        setBusyId(null)
        return
      }
      const res = await fetch(`/api/insights/${insight.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: [...current, id] }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error || '연결 실패')
      onLinked?.(target === 'series' ? 'series' : 'project', [...current, id])
    } catch (e: any) {
      setError(e?.message || '연결 실패')
    } finally {
      setBusyId(null)
    }
  }

  const handleUnlink = async (id: string) => {
    setBusyId(id)
    try {
      const field = target === 'series' ? 'seriesIds' : 'projectIds'
      const current = target === 'series' ? (insight.seriesIds || []) : (insight.projectIds || [])
      const next = current.filter((x) => x !== id)
      const res = await fetch(`/api/insights/${insight.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: next }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error || '해제 실패')
      onUnlinked?.(target === 'series' ? 'series' : 'project', id)
    } catch (e: any) {
      setError(e?.message || '해제 실패')
    } finally {
      setBusyId(null)
    }
  }

  const titles: Record<LinkTarget, { title: string; desc: string }> = {
    project: { title: '설교 준비에 연결', desc: '이 통찰이 발견된 설교 프로젝트와 이어보세요' },
    series: { title: '시리즈에 연결', desc: '이 통찰이 기여할 시리즈와 이어보세요' },
    manuscript: { title: '원고에 반영', desc: '작성 중인 설교에 참고 통찰로 반영' },
  }
  const t = titles[target]

  return (
    <div className="fixed inset-0 z-50 bg-[#03050c]/80 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0c1020] border border-white/10 rounded-2xl shadow-2xl w-[520px] max-h-[80vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-white/5 shrink-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-bold text-white">{t.title}</h3>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-300 p-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-[11px] text-slate-500">{t.desc}</p>
          {passageHint && (target === 'project' || target === 'manuscript') && (
            <div className="mt-2 flex items-center gap-1.5 text-[10px]">
              <span className="text-slate-500">통찰의 본문</span>
              <span className="text-teal-300 font-bold bg-teal-500/10 px-1.5 py-0.5 rounded border border-teal-500/20">{passageHint}</span>
              <span className="text-slate-600">→ 같은 본문 프로젝트가 상단에 표시</span>
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-b border-white/5 shrink-0">
          <div className="relative">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={target === 'series' ? '시리즈 이름으로 검색...' : '설교 제목·본문으로 검색...'}
              className="w-full text-xs font-medium border border-white/5 rounded-xl pl-8 pr-3 py-2 bg-[#04060f] text-slate-300 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {loading && (
            <div className="flex items-center justify-center py-10">
              <div className="w-6 h-6 rounded-full border-2 border-indigo-500/30 border-t-indigo-400 animate-spin" />
            </div>
          )}
          {error && (
            <div className="m-4 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-[11px] text-red-300">{error}</div>
          )}
          {!loading && !error && sorted.length === 0 && (
            <div className="px-6 py-10 text-center">
              <p className="text-xs text-slate-400 font-bold mb-1">
                {search ? '검색 결과가 없습니다' : target === 'series' ? '아직 시리즈가 없습니다' : '아직 프로젝트가 없습니다'}
              </p>
              <p className="text-[10px] text-slate-500 mb-3">
                {target === 'series' ? '시리즈를 먼저 만들어보세요' : '설교 프로젝트를 먼저 만들어보세요'}
              </p>
              <button
                onClick={() => {
                  onClose()
                  router.push(target === 'series' ? '/advanced/series' : '/advanced/projects/new')
                }}
                className="text-[11px] font-bold text-indigo-300 border border-indigo-500/30 rounded-lg px-3 py-1.5 hover:bg-indigo-500/10"
              >
                + 새로 만들기
              </button>
            </div>
          )}
          {!loading && !error && sorted.length > 0 && (
            <div className="p-2 space-y-1">
              {sorted.map((it: any) => {
                const isLinked = linkedIds.has(it.id)
                const isMatch = target !== 'series' && passageHint && it.passage && it.passage.includes(passageHint)
                return (
                  <div
                    key={it.id}
                    className={`group flex items-center gap-2 p-2.5 rounded-xl border transition-colors ${
                      isLinked
                        ? 'border-indigo-500/30 bg-indigo-500/10'
                        : isMatch
                          ? 'border-teal-500/20 bg-teal-500/5'
                          : 'border-transparent hover:border-white/10 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-[12px] font-bold text-slate-200 truncate">{it.title || it.name}</p>
                        {isMatch && (
                          <span className="text-[8px] font-bold text-teal-300 bg-teal-500/15 border border-teal-500/30 px-1 py-0.5 rounded uppercase tracking-wide">같은 본문</span>
                        )}
                        {isLinked && (
                          <span className="text-[8px] font-bold text-indigo-300 bg-indigo-500/20 border border-indigo-500/30 px-1 py-0.5 rounded">✓ 연결됨</span>
                        )}
                      </div>
                      {(it.passage || it.description) && (
                        <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                          {it.passage && `${it.passage}`}
                          {it.passage && it.status && ' · '}
                          {it.status && STATUS_LABELS[it.status]}
                          {it.description && ` · ${it.description}`}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {(target === 'project' || target === 'manuscript') && (
                        <button
                          onClick={() => onNavigateToProject ? onNavigateToProject(it.id) : router.push(`/advanced/projects/${it.id}`)}
                          className="text-[10px] text-slate-500 hover:text-indigo-300 p-1"
                          title="열기"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </button>
                      )}
                      {isLinked ? (
                        <button
                          onClick={() => handleUnlink(it.id)}
                          disabled={busyId === it.id}
                          className="text-[10px] font-bold text-slate-400 hover:text-red-400 border border-white/10 hover:border-red-500/30 rounded-lg px-2 py-1 transition-colors disabled:opacity-50"
                        >
                          {busyId === it.id ? '해제 중...' : '해제'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleLink(it.id)}
                          disabled={busyId === it.id}
                          className="text-[10px] font-bold text-indigo-300 border border-indigo-500/30 rounded-lg px-2.5 py-1 hover:bg-indigo-500/10 transition-colors disabled:opacity-50"
                        >
                          {busyId === it.id ? '연결 중...' : '+ 연결'}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-white/5 shrink-0 flex items-center justify-between bg-[#04060f]/40">
          <span className="text-[10px] text-slate-500">
            {linkedIds.size > 0 ? `${linkedIds.size}개와 연결됨` : '아직 연결되지 않음'}
          </span>
          <button
            onClick={() => {
              onClose()
              router.push(target === 'series' ? '/advanced/series' : '/advanced/projects/new')
            }}
            className="text-[11px] font-bold text-slate-300 hover:text-indigo-300"
          >
            + 새 {target === 'series' ? '시리즈' : '프로젝트'} 만들기
          </button>
        </div>
      </div>
    </div>
  )
}
