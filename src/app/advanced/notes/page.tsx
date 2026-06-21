'use client'

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  filterNotes,
  findRelatedNotes,
  getAllTags,
  getInsightSummary,
  type SortMode,
  type NoteType,
  type NoteEntry,
} from '@/lib/advanced/notesData'
import InspirationStrip from '@/components/advanced/notes/InspirationStrip'
import NotesSidebar from '@/components/advanced/notes/NotesSidebar'
import CaptureStudio, { type CapturePayload } from '@/components/advanced/notes/CaptureStudio'
import AIAssistantPanel from '@/components/advanced/notes/AIAssistantPanel'
import InsightMasonryGrid from '@/components/advanced/notes/InsightMasonryGrid'
import NoteDetailPanel from '@/components/advanced/notes/NoteDetailPanel'
import QuickActionChips from '@/components/advanced/notes/QuickActionChips'
import NotesSummary from '@/components/advanced/notes/NotesSummary'

type ViewMode = 'atelier' | 'gallery' | 'summary'
type LoadState = 'idle' | 'loading' | 'ready' | 'error'

export default function NotesPage() {
  const router = useRouter()
  const [notes, setNotes] = useState<NoteEntry[]>([])
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)
  const inflightRef = useRef<Map<string, AbortController>>(new Map())

  const [searchQuery, setSearchQuery] = useState('')
  const [sortMode, setSortMode] = useState<SortMode>('recent')
  const [selectedNote, setSelectedNote] = useState<NoteEntry | null>(null)
  const [filterTypes, setFilterTypes] = useState<NoteType[]>([])
  const [filterTags, setFilterTags] = useState<string[]>([])
  const [starredOnly, setStarredOnly] = useState(false)
  const [pinnedOnly, setPinnedOnly] = useState(false)
  const [view, setView] = useState<ViewMode>('atelier')
  const [actionTarget, setActionTarget] = useState<NoteEntry | null>(null)

  const [draftText, setDraftText] = useState('')
  const [draftType, setDraftType] = useState<NoteType>('insight')
  const [draftTags, setDraftTags] = useState<string[]>([])
  const [draftScripture, setDraftScripture] = useState<string[]>([])

  const [projectLookup, setProjectLookup] = useState<Map<string, { title: string; passage: string }>>(new Map())
  const [seriesLookup, setSeriesLookup] = useState<Map<string, { name: string }>>(new Map())

  const showToast = useCallback((kind: 'success' | 'error', text: string) => {
    setToast({ kind, text })
    setTimeout(() => setToast(null), 2500)
  }, [])

  useEffect(() => {
    let ac: AbortController | null = null
    setLoadState('loading')
    setLoadError(null)
    ac = new AbortController()
    fetch('/api/insights', { signal: ac.signal })
      .then(async (r) => {
        const json = await r.json()
        if (!r.ok || !json.success) throw new Error(json.error || '조회 실패')
        setNotes(json.data || [])
        setLoadState('ready')
      })
      .catch((e) => {
        if (e?.name === 'AbortError') return
        setLoadError(e?.message || '불러오기 실패')
        setLoadState('error')
      })
    return () => { ac?.abort() }
  }, [])

  useEffect(() => {
    let ac: AbortController | null = null
    ac = new AbortController()
    Promise.all([
      fetch('/api/sermons?limit=200', { signal: ac.signal }).then((r) => r.json()).catch(() => null),
      fetch('/api/series', { signal: ac.signal }).then((r) => r.json()).catch(() => null),
    ]).then(([pj, sj]) => {
      if (pj?.success) {
        const m = new Map<string, { title: string; passage: string }>()
        ;(pj.data || []).forEach((s: any) => m.set(s.id, { title: s.title || '(제목 없음)', passage: s.normalizedPassage || s.passage || '' }))
        setProjectLookup(m)
      }
      if (sj?.success) {
        const m = new Map<string, { name: string }>()
        ;(sj.data || []).forEach((s: any) => m.set(s.id, { name: s.name || '(이름 없음)' }))
        setSeriesLookup(m)
      }
    })
    return () => { ac?.abort() }
  }, [notes])

  useEffect(() => {
    if (view !== 'atelier') return
    const node = document.getElementById('capture-textarea') as HTMLTextAreaElement | HTMLInputElement | null
    if (node) node.focus()
  }, [view])

  const allTags = useMemo(() => getAllTags(notes), [notes])
  const summary = useMemo(() => getInsightSummary(notes), [notes])

  const filtered = useMemo(
    () => filterNotes(notes, { types: filterTypes, tags: filterTags, starredOnly, pinnedOnly, searchQuery, sortMode }),
    [notes, filterTypes, filterTags, starredOnly, pinnedOnly, searchQuery, sortMode],
  )

  const relatedNotes = useMemo(() => {
    if (!selectedNote) return []
    return findRelatedNotes(selectedNote, notes, 6)
  }, [selectedNote, notes])

  const toggleTypeFilter = useCallback((type: NoteType) => {
    setFilterTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]))
  }, [])
  const toggleTagFilter = useCallback((tag: string) => {
    setFilterTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }, [])

  const patchNote = useCallback(async (id: string, patch: Partial<NoteEntry>) => {
    if (!id || id.startsWith('temp-')) return
    const inflight = inflightRef.current.get(id)
    if (inflight) inflight.abort()
    const ac = new AbortController()
    inflightRef.current.set(id, ac)
    try {
      const res = await fetch(`/api/insights/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
        signal: ac.signal,
      })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error || '수정 실패')
      setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...json.data } : n)))
      setSelectedNote((prev) => (prev?.id === id ? { ...prev, ...json.data } : prev))
    } catch (e: any) {
      if (e?.name === 'AbortError') return
      showToast('error', '저장 실패: ' + (e?.message || ''))
      setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...{ starred: !patch.starred, pinned: !patch.pinned } } : n)))
      setSelectedNote((prev) => (prev?.id === id ? { ...prev, ...{ starred: !patch.starred, pinned: !patch.pinned } } : prev))
    } finally {
      inflightRef.current.delete(id)
    }
  }, [showToast])

  const toggleStar = useCallback((id: string) => {
    const current = notes.find((n) => n.id === id)
    if (!current) return
    const next = !current.starred
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, starred: next } : n)))
    setSelectedNote((prev) => (prev?.id === id ? { ...prev, starred: next } : prev))
    patchNote(id, { starred: next })
  }, [notes, patchNote])

  const togglePin = useCallback((id: string) => {
    const current = notes.find((n) => n.id === id)
    if (!current) return
    const next = !current.pinned
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, pinned: next } : n)))
    setSelectedNote((prev) => (prev?.id === id ? { ...prev, pinned: next } : prev))
    patchNote(id, { pinned: next })
  }, [notes, patchNote])

  const clearFilters = useCallback(() => {
    setFilterTypes([])
    setFilterTags([])
    setStarredOnly(false)
    setPinnedOnly(false)
    setSearchQuery('')
  }, [])

  const activeFilterCount = filterTypes.length + filterTags.length + (starredOnly ? 1 : 0) + (pinnedOnly ? 1 : 0)

  const weeklyCount = useMemo(() => {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    return notes.filter((n) => new Date(n.updatedAt) > weekAgo).length
  }, [notes])

  const streak = useMemo(() => {
    const days = new Set<string>()
    notes.forEach((n) => days.add(new Date(n.updatedAt).toISOString().slice(0, 10)))
    let count = 0
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    while (days.has(d.toISOString().slice(0, 10))) {
      count++
      d.setDate(d.getDate() - 1)
    }
    return count
  }, [notes])

  const lastRecordedAt = useMemo(() => {
    if (notes.length === 0) return null
    return notes.reduce((max, n) => (new Date(n.updatedAt) > new Date(max) ? n.updatedAt : max), notes[0].updatedAt)
  }, [notes])

  const handleSave = useCallback(async (payload: CapturePayload) => {
    const tempId = `temp-${Date.now()}`
    const optimistic: NoteEntry = {
      id: tempId,
      type: payload.type,
      title: payload.title,
      content: payload.content,
      summary: payload.summary,
      tags: payload.tags,
      starred: false,
      pinned: false,
      connections: payload.connections,
      projectIds: [],
      archiveIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastReferencedAt: null,
      referenceCount: 0,
    }
    setNotes((prev) => [optimistic, ...prev])
    setDraftText('')
    setDraftTags([])
    setDraftScripture([])

    setSaving(true)
    try {
      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: payload.type,
          title: payload.title,
          content: payload.content,
          summary: payload.summary,
          tags: payload.tags,
          connections: payload.connections,
        }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error || '저장 실패')
      const saved = json.data as NoteEntry
      setNotes((prev) => prev.map((n) => (n.id === tempId ? saved : n)))
      setSelectedNote(saved)
      setActionTarget(saved)
      showToast('success', '통찰이 저장되었습니다')
    } catch (e: any) {
      setNotes((prev) => prev.filter((n) => n.id !== tempId))
      showToast('error', '저장 실패: ' + (e?.message || ''))
    } finally {
      setSaving(false)
    }
  }, [showToast])

  const handleDelete = useCallback(async (id: string) => {
    if (!id || id.startsWith('temp-')) {
      setNotes((prev) => prev.filter((n) => n.id !== id))
      setSelectedNote(null)
      return
    }
    const snapshot = notes
    setNotes((prev) => prev.filter((n) => n.id !== id))
    if (selectedNote?.id === id) setSelectedNote(null)
    try {
      const res = await fetch(`/api/insights/${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error || '삭제 실패')
      showToast('success', '삭제되었습니다')
    } catch (e: any) {
      setNotes(snapshot)
      showToast('error', '삭제 실패: ' + (e?.message || ''))
    }
  }, [notes, selectedNote, showToast])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'n') {
        e.preventDefault()
        setView('atelier')
      }
      if (e.key === 'Escape' && selectedNote) setSelectedNote(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedNote])

  return (
    <div className="flex h-full relative">
      <NotesSidebar
        notes={notes}
        filterTypes={filterTypes}
        filterTags={filterTags}
        starredOnly={starredOnly}
        pinnedOnly={pinnedOnly}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortMode={sortMode}
        setSortMode={setSortMode}
        toggleTypeFilter={toggleTypeFilter}
        toggleTagFilter={toggleTagFilter}
        setStarredOnly={setStarredOnly}
        setPinnedOnly={setPinnedOnly}
        clearFilters={clearFilters}
        activeFilterCount={activeFilterCount}
        view={view}
        setView={setView}
        totalCount={notes.length}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <InspirationStrip
          totalNotes={summary.totalNotes}
          weeklyCount={weeklyCount}
          streak={streak}
          lastRecordedAt={lastRecordedAt}
        />

        {loadState === 'loading' && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 mx-auto mb-3 rounded-full border-2 border-indigo-500/30 border-t-indigo-400 animate-spin" />
              <p className="text-xs text-slate-500 font-medium">통찰을 불러오는 중...</p>
            </div>
          </div>
        )}

        {loadState === 'error' && (
          <div className="flex-1 flex items-center justify-center px-8">
            <div className="text-center max-w-sm">
              <p className="text-sm text-slate-300 font-bold mb-1">통찰을 불러올 수 없습니다</p>
              <p className="text-xs text-slate-500 mb-3">{loadError}</p>
              <button
                onClick={() => window.location.reload()}
                className="text-[11px] font-bold text-indigo-300 border border-indigo-500/30 rounded-lg px-3 py-1.5 hover:bg-indigo-500/10"
              >
                다시 시도
              </button>
            </div>
          </div>
        )}

        {loadState === 'ready' && view === 'atelier' && (
          <div className="flex-1 flex min-h-0">
            <div className="flex-1 min-w-0">
              <CaptureStudio
                notes={notes}
                onSave={handleSave}
                onSelectNote={(id) => {
                  const n = notes.find((x) => x.id === id)
                  if (n) setSelectedNote(n)
                }}
              />
            </div>
            <AIAssistantPanel
              draftText={draftText}
              currentNoteId={selectedNote?.id || null}
              existingNotes={notes}
              onApplyType={(t) => setDraftType(t)}
              onApplyTags={(tags) => setDraftTags((prev) => Array.from(new Set([...prev, ...tags])))}
              onApplyScripture={(refs) => setDraftScripture((prev) => Array.from(new Set([...prev, ...refs])))}
              onOpenNote={(id) => {
                const n = notes.find((x) => x.id === id)
                if (n) setSelectedNote(n)
              }}
            />
          </div>
        )}

        {loadState === 'ready' && view === 'gallery' && (
          <div className="flex-1 flex min-h-0">
            <InsightMasonryGrid
              notes={filtered}
              selectedId={selectedNote?.id || null}
              onSelect={(n) => setSelectedNote(n)}
              onStar={toggleStar}
              onPin={togglePin}
            />
          </div>
        )}

        {loadState === 'ready' && view === 'summary' && (
          <NotesSummary
            notes={notes}
            onSelectNote={(id) => {
              const n = notes.find((x) => x.id === id)
              if (n) {
                setSelectedNote(n)
                setView('atelier')
              }
            }}
          />
        )}
      </div>

      {selectedNote && (
        <NoteDetailPanel
          note={selectedNote}
          relatedNotes={relatedNotes}
          onClose={() => setSelectedNote(null)}
          onStar={toggleStar}
          onPin={togglePin}
          onNavigate={(id) => {
            const n = notes.find((x) => x.id === id)
            if (n) setSelectedNote(n)
          }}
          onSendToPrepare={() => {}}
          onAddToSeries={() => {}}
          onReflectInManuscript={() => {}}
          onViewInGraph={() => router.push(`/advanced/graph?focus=${selectedNote.id}`)}
          onDelete={selectedNote ? () => handleDelete(selectedNote.id) : undefined}
          projectLookup={projectLookup}
          seriesLookup={seriesLookup}
          onInsightUpdated={(updated) => {
            setNotes((prev) => prev.map((n) => (n.id === updated.id ? { ...n, ...updated } : n)))
            setSelectedNote((prev) => (prev?.id === updated.id ? { ...prev, ...updated } : prev))
            // Note: the modal already PATCHes the server; we only sync local state here.
            // We re-fetch from server to pick up any server-side normalization (updated_at, etc).
            if (updated.id && !updated.id.startsWith('temp-')) {
              fetch(`/api/insights`)
                .then((r) => r.json())
                .then((json) => {
                  if (json?.success) {
                    const fresh = (json.data || []).find((n: NoteEntry) => n.id === updated.id)
                    if (fresh) {
                      setNotes((prev) => prev.map((n) => (n.id === fresh.id ? fresh : n)))
                      setSelectedNote((prev) => (prev?.id === fresh.id ? fresh : prev))
                    }
                  }
                })
                .catch(() => {})
            }
          }}
        />
      )}

      <QuickActionChips
        note={actionTarget}
        onDismiss={() => setActionTarget(null)}
        onSendToPrepare={() => {
          router.push('/advanced/projects')
          setActionTarget(null)
        }}
        onAddToSeries={() => {
          router.push('/advanced/series')
          setActionTarget(null)
        }}
        onReflectInManuscript={() => {
          router.push('/advanced/manuscript')
          setActionTarget(null)
        }}
        onViewInGraph={() => {
          router.push('/advanced/graph')
          setActionTarget(null)
        }}
      />

      {toast && (
        <div className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl border backdrop-blur-md text-xs font-bold transition-all ${
          toast.kind === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : 'bg-red-500/10 border-red-500/30 text-red-300'
        }`}>
          {toast.text}
        </div>
      )}

      {saving && (
        <div className="fixed top-4 right-4 z-50 px-3 py-1.5 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-[10px] text-indigo-300 font-bold flex items-center gap-1.5 backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          저장 중...
        </div>
      )}
    </div>
  )
}
