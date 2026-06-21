'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { NoteEntry } from '@/lib/advanced/notesData'

interface ProjectOption {
  id: string
  title: string
  passage: string
  status: string
  updatedAt: string
}

interface ReflectInManuscriptModalProps {
  insight: NoteEntry
  onClose: () => void
  onReflected?: (projectId: string) => void
}

const STATUS_LABELS: Record<string, string> = {
  draft: '초안',
  in_progress: '작성 중',
  writing: '작성 중',
  prepare: '준비 중',
  research: '연구 중',
  review: '검토 중',
  completed: '완료',
}

export default function ReflectInManuscriptModal({ insight, onClose, onReflected }: ReflectInManuscriptModalProps) {
  const router = useRouter()
  const [projects, setProjects] = useState<ProjectOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [openingId, setOpeningId] = useState<string | null>(null)

  useEffect(() => {
    const ac = new AbortController()
    setLoading(true)
    setError(null)
    fetch('/api/sermons?status=writing,in_progress,prepare,review&limit=100', { signal: ac.signal })
      .then(async (r) => {
        const json = await r.json()
        if (!r.ok || !json.success) throw new Error(json.error || '설교 목록을 불러올 수 없습니다.')
        setProjects((json.data || []).map((s: any) => ({
          id: s.id,
          title: s.title || '(제목 없음)',
          passage: s.normalizedPassage || s.passage || '',
          status: s.status || 'draft',
          updatedAt: s.updatedAt || s.updated_at || '',
        })))
      })
      .catch((e) => {
        if (e?.name === 'AbortError') return
        setError(e?.message || '조회 실패')
      })
      .finally(() => setLoading(false))
    return () => ac.abort()
  }, [])

  const passageHint = useMemo(() => {
    const p = insight.connections.find((c) => c.type === 'passage')
    return p?.label || null
  }, [insight])

  const sorted = useMemo(() => {
    const q = search.trim().toLowerCase()
    let list = projects
    if (q) {
      list = list.filter((p) => (p.title || '').toLowerCase().includes(q) || (p.passage || '').toLowerCase().includes(q))
    }
    if (!passageHint) return list
    return [...list].sort((a, b) => {
      const aMatch = a.passage && a.passage.includes(passageHint)
      const bMatch = b.passage && b.passage.includes(passageHint)
      if (aMatch && !bMatch) return -1
      if (!aMatch && bMatch) return 1
      return 0
    })
  }, [projects, search, passageHint])

  const open = async (project: ProjectOption) => {
    setOpeningId(project.id)
    setError(null)
    try {
      const alreadyLinked = (insight.projectIds || []).includes(project.id)
      if (!alreadyLinked) {
        const next = [...(insight.projectIds || []), project.id]
        const res = await fetch(`/api/insights/${insight.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectIds: next }),
        })
        const json = await res.json()
        if (!res.ok || !json.success) throw new Error(json.error || '연결 실패')
      }
      onReflected?.(project.id)
      onClose()
      router.push(`/advanced/projects/${project.id}?insight=${insight.id}&tab=manuscript`)
    } catch (e: any) {
      setError(e?.message || '반영 실패')
      setOpeningId(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#03050c]/80 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0c1020] border border-white/10 rounded-2xl shadow-2xl w-[520px] max-h-[80vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-white/5 shrink-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span className="text-emerald-300">✍️</span> 원고에 반영
            </h3>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-300 p-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-[11px] text-slate-500">작성 중인 설교를 선택하면 원고 탭으로 이동합니다</p>
          {passageHint && (
            <div className="mt-2 flex items-center gap-1.5 text-[10px]">
              <span className="text-slate-500">통찰의 본문</span>
              <span className="text-teal-300 font-bold bg-teal-500/10 px-1.5 py-0.5 rounded border border-teal-500/20">{passageHint}</span>
              <span className="text-slate-600">→ 같은 본문 설교가 상단</span>
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
              placeholder="설교 제목·본문으로 검색..."
              className="w-full text-xs font-medium border border-white/5 rounded-xl pl-8 pr-3 py-2 bg-[#04060f] text-slate-300 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {loading && (
            <div className="flex items-center justify-center py-10">
              <div className="w-6 h-6 rounded-full border-2 border-emerald-500/30 border-t-emerald-400 animate-spin" />
            </div>
          )}
          {error && (
            <div className="m-4 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-[11px] text-red-300">{error}</div>
          )}
          {!loading && !error && sorted.length === 0 && (
            <div className="px-6 py-10 text-center">
              <p className="text-xs text-slate-400 font-bold mb-1">
                {search ? '검색 결과가 없습니다' : '작성 중인 설교가 없습니다'}
              </p>
              <p className="text-[10px] text-slate-500 mb-3">설교 프로젝트를 만들고 작성 단계로 진행하세요</p>
              <button
                onClick={() => { onClose(); router.push('/advanced/projects/new') }}
                className="text-[11px] font-bold text-emerald-300 border border-emerald-500/30 rounded-lg px-3 py-1.5 hover:bg-emerald-500/10"
              >
                + 새 설교 프로젝트 만들기
              </button>
            </div>
          )}
          {!loading && !error && sorted.length > 0 && (
            <div className="p-2 space-y-1.5">
              {sorted.map((p) => {
                const isMatch = passageHint && p.passage && p.passage.includes(passageHint)
                const isOpening = openingId === p.id
                return (
                  <div
                    key={p.id}
                    className={`group rounded-xl border p-3 transition-colors ${
                      isMatch
                        ? 'border-teal-500/30 bg-teal-500/5'
                        : 'border-white/5 hover:border-emerald-500/30 hover:bg-emerald-500/5'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <p className="text-[12px] font-bold text-slate-200 truncate group-hover:text-emerald-300 transition-colors">{p.title}</p>
                          {isMatch && (
                            <span className="text-[8px] font-bold text-teal-300 bg-teal-500/15 border border-teal-500/30 px-1 py-0.5 rounded uppercase tracking-wide shrink-0">같은 본문</span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium">
                          {p.passage && `${p.passage} · `}
                          {STATUS_LABELS[p.status] || p.status}
                        </p>
                      </div>
                      <button
                        onClick={() => open(p)}
                        disabled={!!openingId}
                        className="shrink-0 text-[10px] font-bold bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 rounded-lg px-3 py-1.5 hover:bg-emerald-500/30 transition-colors disabled:opacity-50 flex items-center gap-1"
                      >
                        {isOpening ? (
                          <>
                            <span className="w-2.5 h-2.5 rounded-full border-2 border-emerald-300/30 border-t-emerald-300 animate-spin" />
                            여는 중
                          </>
                        ) : (
                          <>열기 →</>
                        )}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-white/5 shrink-0 bg-[#04060f]/40 text-[10px] text-slate-500">
          선택한 설교와 자동으로 연결되며, 원고 탭 상단에 참고 통찰 배너가 표시됩니다.
        </div>
      </div>
    </div>
  )
}
