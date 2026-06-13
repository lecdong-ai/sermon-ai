'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { AppSectionHeader } from '@/components/advanced/shared'
import {
  NOTES as INITIAL_NOTES,
  NOTE_TYPES,
  NOTE_TYPE_LABELS,
  NOTE_TYPE_DESCRIPTIONS,
  NOTE_TYPE_COLORS,
  NOTE_TYPE_DOTS,
  getAllTags,
  getInsightSummary,
  findRelatedNotes,
  filterNotes,
  SortMode,
  NoteType,
  NoteEntry,
  NoteConnection,
} from '@/lib/advanced/notesData'

/* ─── Constants ─── */

type ViewMode = 'feed' | 'summary'

const VIEW_OPTIONS = [
  { key: 'starred', label: '중요', icon: '★' },
  { key: 'pinned', label: '고정', icon: '⚑' },
  { key: 'recent', label: '최근', icon: '◷' },
  { key: 'unclassified', label: '미분류', icon: '○' },
] as const

/* ─── Main Page ─── */

export default function NotesPage() {
  const router = useRouter()
  const [notes, setNotes] = useState<NoteEntry[]>(INITIAL_NOTES)
  const allTags = useMemo(() => getAllTags(notes), [notes])
  const summary = useMemo(() => getInsightSummary(notes), [notes])

  const [searchQuery, setSearchQuery] = useState('')
  const [sortMode, setSortMode] = useState<SortMode>('recent')
  const [selectedNote, setSelectedNote] = useState<NoteEntry | null>(null)
  const [selectedView, setSelectedView] = useState<string | null>(null)
  const [filterTypes, setFilterTypes] = useState<NoteType[]>([])
  const [filterTags, setFilterTags] = useState<string[]>([])
  const [starredOnly, setStarredOnly] = useState(false)
  const [pinnedOnly, setPinnedOnly] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('feed')
  const [showCapture, setShowCapture] = useState(false)

  const filtered = useMemo(() => {
    let connFilter: { connectionType?: any; connectionId?: string } = {}
    return filterNotes(notes, {
      types: filterTypes,
      tags: filterTags,
      starredOnly,
      pinnedOnly,
      searchQuery,
      sortMode,
      ...connFilter,
    })
  }, [notes, filterTypes, filterTags, starredOnly, pinnedOnly, searchQuery, sortMode])

  // Quick capture state
  const [captureText, setCaptureText] = useState('')
  const [captureType, setCaptureType] = useState<NoteType>('insight')
  const [captureTags, setCaptureTags] = useState('')
  const [capturePassage, setCapturePassage] = useState('')
  const [showCaptureSuccess, setShowCaptureSuccess] = useState(false)

  const handleQuickSave = useCallback(() => {
    if (!captureText.trim()) return
    const tags = captureTags.split(',').map(t => t.trim()).filter(Boolean)
    const connections: NoteConnection[] = []
    if (capturePassage.trim()) {
      connections.push({ type: 'passage', label: capturePassage.trim(), id: `passage-${Date.now()}` })
    }
    const firstLine = captureText.trim().split('\n')[0]
    const title = firstLine.length > 50 ? firstLine.slice(0, 50) + '…' : firstLine
    const newNote: NoteEntry = {
      id: `note-${Date.now()}`,
      type: captureType,
      title,
      content: captureText.trim(),
      summary: captureText.trim().slice(0, 120) + (captureText.trim().length > 120 ? '…' : ''),
      tags,
      starred: false,
      pinned: false,
      connections,
      projectIds: [],
      archiveIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastReferencedAt: null,
      referenceCount: 0,
    }
    setNotes(prev => [newNote, ...prev])
    setCaptureText('')
    setCaptureTags('')
    setCapturePassage('')
    setShowCapture(false)
    setShowCaptureSuccess(true)
    setTimeout(() => setShowCaptureSuccess(false), 2000)
  }, [captureText, captureType, captureTags, capturePassage])

  const toggleTypeFilter = useCallback((type: NoteType) => {
    setFilterTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type])
  }, [])

  const toggleTagFilter = useCallback((tag: string) => {
    setFilterTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }, [])

  const toggleStar = useCallback((noteId: string) => {
    setNotes(prev => prev.map(n => n.id === noteId ? { ...n, starred: !n.starred } : n))
    setSelectedNote(prev => prev?.id === noteId ? { ...prev, starred: !prev.starred } : prev)
  }, [])

  const togglePin = useCallback((noteId: string) => {
    setNotes(prev => prev.map(n => n.id === noteId ? { ...n, pinned: !n.pinned } : n))
    setSelectedNote(prev => prev?.id === noteId ? { ...prev, pinned: !prev.pinned } : prev)
  }, [])

  const clearFilters = useCallback(() => {
    setFilterTypes([])
    setFilterTags([])
    setStarredOnly(false)
    setPinnedOnly(false)
    setSearchQuery('')
    setSelectedView(null)
  }, [])

  const activeFilterCount = filterTypes.length + filterTags.length + (starredOnly ? 1 : 0) + (pinnedOnly ? 1 : 0)

  const counts = useMemo(() => {
    const c: Record<string, number> = {}
    NOTE_TYPES.forEach(t => { c[t] = notes.filter(n => n.type === t).length })
    return c
  }, [notes])

  const relatedNotes = useMemo(() => {
    if (!selectedNote) return []
    return findRelatedNotes(selectedNote, notes, 5)
  }, [selectedNote, notes])

  return (
    <div className="flex h-full">
      {/* ─── Left Filter Panel ─── */}
      <aside className="w-56 shrink-0 border-r border-white/5 bg-[#04060f]/70 backdrop-blur-md flex flex-col overflow-y-auto scrollbar-thin">
        {/* Breadcrumbs */}
        <div className="px-4 pt-3 pb-1">
          <div className="flex items-center gap-1 text-[10px] text-slate-500">
            <button onClick={() => router.push('/advanced')} className="hover:text-indigo-400 transition-colors font-bold">말씀 사역</button>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400 font-bold">노트/통찰</span>
          </div>
        </div>
        {/* New Note Button */}
        <div className="px-4 pb-3 pt-1 border-b border-white/5 space-y-2">
          <button onClick={() => setShowCapture(true)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/15">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            통찰 기록하기
          </button>
          <button onClick={() => setViewMode(m => m === 'summary' ? 'feed' : 'summary')}
            className={`w-full text-xs px-3 py-1.5 rounded-xl transition-colors font-bold ${
              viewMode === 'summary' ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30' : 'text-slate-500 hover:bg-white/5 border border-transparent'
            }`}>
            {viewMode === 'summary' ? '✓ ' : ''}통찰 요약
          </button>
        </div>

        {/* Note Type Filters */}
        <div className="p-3 border-b border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">노트 유형</span>
            <span className="text-[10px] text-slate-600 font-bold">{summary.totalNotes}개</span>
          </div>
          <div className="space-y-0.5">
            {NOTE_TYPES.map(type => (
              <button key={type} onClick={() => toggleTypeFilter(type)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  filterTypes.includes(type) ? 'bg-indigo-500/15 text-indigo-300' : 'hover:bg-white/5 text-slate-500'
                }`}>
                <span className={`w-2 h-2 rounded-full shrink-0 ${NOTE_TYPE_DOTS[type]}`} />
                <span className="flex-1 text-left">{NOTE_TYPE_LABELS[type]}</span>
                <span className="text-[10px] text-slate-600">{counts[type] || 0}</span>
              </button>
            ))}
          </div>
        </div>

        {/* View Modes */}
        <div className="p-3 border-b border-white/5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">보기</span>
          <div className="space-y-0.5">
            <button onClick={() => { setStarredOnly(s => !s); setPinnedOnly(false) }}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                starredOnly ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' : 'hover:bg-white/5 text-slate-500 border border-transparent'
              }`}>
              <span className="text-xs">★</span>
              <span>중요 노트</span>
              <span className="text-[10px] text-slate-600 ml-auto">{summary.starredCount}</span>
            </button>
              <button onClick={() => { setPinnedOnly(s => !s); setStarredOnly(false) }}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  pinnedOnly ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30' : 'hover:bg-white/5 text-slate-500 border border-transparent'
                }`}>
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                <span>고정 노트</span>
                <span className="text-[10px] text-slate-600 ml-auto">{summary.pinnedCount}</span>
              </button>
          </div>
        </div>

        {/* Tags */}
        {allTags.length > 0 && (
          <div className="p-3 border-b border-white/5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">태그</span>
            <div className="flex flex-wrap gap-1">
              {allTags.map(tag => (
                <button key={tag} onClick={() => toggleTagFilter(tag)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors border ${
                    filterTags.includes(tag) ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10'
                  }`}>
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Connection-based quick views */}
        <div className="p-3 border-b border-white/5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">연결 기준</span>
          <div className="space-y-0.5">
            <QuickConnView label="본문 연결" count={notes.filter(n => n.connections.some(c => c.type === 'passage')).length} />
            <QuickConnView label="주제 연결" count={notes.filter(n => n.connections.some(c => c.type === 'theme')).length} />
            <QuickConnView label="원어 연결" count={notes.filter(n => n.connections.some(c => c.type === 'word')).length} />
            <QuickConnView label="프로젝트 연결" count={notes.filter(n => n.projectIds.length > 0).length} />
          </div>
        </div>

        {/* Sort */}
        <div className="p-3">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">정렬</span>
          <select value={sortMode} onChange={e => setSortMode(e.target.value as SortMode)}
            className="w-full text-xs font-bold border border-white/5 rounded-xl px-2 py-1.5 outline-none focus:border-indigo-500/50 bg-[#0c1020] text-slate-300">
            <option value="recent">최신순</option>
            <option value="referenced">최근 참조순</option>
            <option value="connections">연결 많은 순</option>
            <option value="starred">중요순</option>
          </select>
        </div>

        {activeFilterCount > 0 && (
          <div className="p-3 pt-0">
            <button onClick={clearFilters}
              className="w-full text-[10px] font-bold text-slate-500 hover:text-slate-300 transition-colors py-1">
              필터 초기화 ({activeFilterCount})
            </button>
          </div>
        )}
      </aside>

      {/* ─── Main Content ─── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Search Bar */}
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-white/5 bg-[#04060f]/60 backdrop-blur-sm shrink-0">
          <div className="relative flex-1 max-w-sm">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="노트 제목, 내용, 태그, 연결 검색..."
              className="w-full text-xs font-medium border border-white/5 rounded-xl pl-8 pr-3 py-1.5 bg-[#0c1020] text-slate-300 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
          </div>
          <span className="text-[10px] font-bold text-slate-500">
            {filtered.length}개 노트
          </span>
          {showCaptureSuccess && (
            <span className="text-[10px] text-indigo-400 animate-pulse font-bold">저장됨 ✓</span>
          )}
        </div>

        {/* Summary View */}
        {viewMode === 'summary' ? (
          <NotesInsightSummary summary={summary} notes={notes} />
        ) : (
          <NotesFeed
            notes={filtered}
            selectedNoteId={selectedNote?.id || null}
            onSelect={setSelectedNote}
            onStar={toggleStar}
            onPin={togglePin}
            searchQuery={searchQuery}
          />
        )}
      </div>

      {/* ─── Right Detail Panel ─── */}
      {selectedNote && (
        <NoteDetailPanel
          note={selectedNote}
          relatedNotes={relatedNotes}
          onClose={() => setSelectedNote(null)}
          onStar={toggleStar}
          onPin={togglePin}
          onNavigate={(id) => {
            const n = notes.find(n => n.id === id)
            if (n) setSelectedNote(n)
          }}
          router={router}
        />
      )}

      {/* ─── Quick Capture Overlay ─── */}
      {showCapture && (
        <div className="fixed inset-0 z-50 bg-[#03050c]/80 backdrop-blur-md flex items-start justify-center pt-[15vh]">
          <div className="bg-[#0c1020] border border-white/5 rounded-2xl shadow-2xl w-[560px] max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-200">통찰 기록하기</span>
              </div>
              <button onClick={() => setShowCapture(false)} className="text-slate-500 hover:text-slate-300 p-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-5 space-y-4">
              {/* Type selector */}
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1.5">노트 유형</label>
                <div className="flex flex-wrap gap-1.5">
                  {NOTE_TYPES.map(type => (
                    <button key={type} onClick={() => setCaptureType(type)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full border transition-colors ${
                        captureType === type
                          ? `${NOTE_TYPE_COLORS[type]}`
                          : 'border-white/5 text-slate-500 hover:bg-white/5'
                      }`}>
                      {NOTE_TYPE_LABELS[type]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick note textarea */}
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1.5">통찰 기록</label>
                <textarea value={captureText} onChange={e => setCaptureText(e.target.value)}
                  placeholder="떠오른 생각, 관찰, 질문, 아이디어를 자유롭게 기록하세요..."
                  className="w-full text-sm border border-white/5 rounded-xl px-3.5 py-2.5 outline-none focus:border-indigo-500/50 resize-none min-h-[120px] bg-[#04060f] text-slate-300 placeholder:text-slate-600 leading-relaxed font-medium" />
              </div>

              {/* Tags + Connection */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">태그 (쉼표 구분)</label>
                  <input type="text" value={captureTags} onChange={e => setCaptureTags(e.target.value)}
                    placeholder="예: 성령,은혜,로마서"
                    className="w-full text-xs font-medium border border-white/5 rounded-xl px-3 py-2 outline-none focus:border-indigo-500/50 bg-[#04060f] text-slate-300 placeholder:text-slate-600" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">본문 연결 (선택)</label>
                  <input type="text" value={capturePassage} onChange={e => setCapturePassage(e.target.value)}
                    placeholder="예: 요 1:1-5"
                    className="w-full text-xs font-medium border border-white/5 rounded-xl px-3 py-2 outline-none focus:border-indigo-500/50 bg-[#04060f] text-slate-300 placeholder:text-slate-600" />
                </div>
              </div>

              {/* Type hint */}
              <div className="bg-white/5 rounded-xl px-3 py-2 border border-white/5">
                <span className="text-[10px] text-slate-500 leading-relaxed font-medium">
                  {NOTE_TYPE_DESCRIPTIONS[captureType]}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button onClick={() => setShowCapture(false)}
                  className="flex-1 text-xs font-bold border border-white/5 text-slate-500 py-2.5 rounded-xl hover:bg-white/5 transition-colors">
                  취소
                </button>
                <button onClick={handleQuickSave}
                  disabled={!captureText.trim()}
                  className="flex-1 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl transition-colors shadow-lg shadow-indigo-600/15 disabled:opacity-50 disabled:cursor-not-allowed">
                  통찰로 저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Quick Connection View ─── */

function QuickConnView({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-slate-500">
      <span className="flex-1 font-bold">{label}</span>
      <span className="text-[10px] text-slate-600 font-bold">{count}개</span>
    </div>
  )
}

/* ─── Notes Feed ─── */

function NotesFeed({ notes, selectedNoteId, onSelect, onStar, onPin, searchQuery }: {
  notes: NoteEntry[]
  selectedNoteId: string | null
  onSelect: (n: NoteEntry) => void
  onStar: (id: string) => void
  onPin: (id: string) => void
  searchQuery: string
}) {
  if (notes.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-xs">
          {searchQuery ? (
            <>
              <svg className="w-10 h-10 mx-auto mb-3 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-sm text-slate-400 font-bold mb-1">검색 결과가 없습니다</p>
              <p className="text-xs text-slate-500">다른 검색어를 시도해보세요</p>
            </>
          ) : (
            <>
              <svg className="w-10 h-10 mx-auto mb-3 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <p className="text-sm text-slate-400 font-bold mb-1">아직 기록된 통찰이 없습니다</p>
              <p className="text-xs text-slate-500">설교 준비 중 떠오른 생각을 기록해보세요</p>
              <p className="text-xs text-slate-600 mt-3 italic font-medium">
                작은 관찰 한 줄도 축적되면 사역의 깊이가 됩니다
              </p>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin">
      <div className="p-4 space-y-2.5">
        {notes.map(note => (
          <InsightNoteCard
            key={note.id}
            note={note}
            isSelected={note.id === selectedNoteId}
            onSelect={() => onSelect(note)}
            onStar={() => onStar(note.id)}
            onPin={() => onPin(note.id)}
          />
        ))}
      </div>
    </div>
  )
}

/* ─── Insight Note Card ─── */

function InsightNoteCard({ note, isSelected, onSelect, onStar, onPin }: {
  note: NoteEntry
  isSelected: boolean
  onSelect: () => void
  onStar: () => void
  onPin: () => void
}) {
  const passageConns = note.connections.filter(c => c.type === 'passage')
  const themeConns = note.connections.filter(c => c.type === 'theme')
  const wordConns = note.connections.filter(c => c.type === 'word')

  return (
    <div onClick={onSelect}
      className={`rounded-2xl border transition-all cursor-pointer ${
        isSelected
          ? 'border-indigo-500/30 bg-indigo-500/10'
          : 'border-white/5 bg-[#04060f]/60 hover:border-indigo-500/20'
      }`}>
      <div className="p-4">
        {/* Top row: type badge + actions */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${NOTE_TYPE_DOTS[note.type]}`} />
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-lg border ${NOTE_TYPE_COLORS[note.type]}`}>
              {NOTE_TYPE_LABELS[note.type]}
            </span>
            {note.pinned && (
              <svg className="w-3 h-3 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            )}
          </div>
          <div className="flex items-center gap-0.5" onClick={e => e.stopPropagation()}>
            <button onClick={onStar}
              className={`p-1 rounded text-xs transition-colors ${note.starred ? 'text-amber-400' : 'text-slate-600 hover:text-amber-400'}`}>
              {note.starred ? '★' : '☆'}
            </button>
            <button onClick={onPin}
              className={`p-1 rounded text-xs transition-colors ${note.pinned ? 'text-indigo-400' : 'text-slate-600 hover:text-indigo-400'}`}>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Title + Content Preview */}
        <h4 className="text-sm font-bold text-white mb-1 leading-snug">{note.title}</h4>
        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-2 font-medium">{note.summary}</p>

        {/* Connection badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {passageConns.slice(0, 2).map(c => (
            <span key={c.id} className="text-[10px] font-bold bg-teal-500/10 text-teal-300 px-1.5 py-0.5 rounded-lg border border-teal-500/20">
              {c.label}
            </span>
          ))}
          {themeConns.slice(0, 2).map(c => (
            <span key={c.id} className="text-[10px] font-bold bg-purple-500/10 text-purple-300 px-1.5 py-0.5 rounded-lg border border-purple-500/20">
              {c.label}
            </span>
          ))}
          {wordConns.slice(0, 1).map(c => (
            <span key={c.id} className="text-[10px] font-bold bg-blue-500/10 text-blue-300 px-1.5 py-0.5 rounded-lg border border-blue-500/20">
              {c.label}
            </span>
          ))}
          {note.tags.slice(0, 2).map(tag => (
            <span key={tag} className="text-[10px] font-bold text-slate-500">#{tag}</span>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
          <span className="text-[10px] text-slate-500 font-bold">
            {new Date(note.updatedAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
            {note.referenceCount > 0 && ` · 참조 ${note.referenceCount}회`}
          </span>
          {note.projectIds.length > 0 && (
            <span className="text-[10px] text-slate-500 font-bold">프로젝트 {note.projectIds.length}개</span>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Note Detail Panel ─── */

function NoteDetailPanel({ note, relatedNotes, onClose, onStar, onPin, onNavigate, router }: {
  note: NoteEntry
  relatedNotes: { note: NoteEntry; reason: string }[]
  onClose: () => void
  onStar: (id: string) => void
  onPin: (id: string) => void
  onNavigate: (id: string) => void
  router: ReturnType<typeof useRouter>
}) {
  const passageConns = note.connections.filter(c => c.type === 'passage')
  const themeConns = note.connections.filter(c => c.type === 'theme')
  const wordConns = note.connections.filter(c => c.type === 'word')
  const otherConns = note.connections.filter(c => c.type === 'series' || c.type === 'project')

  return (
    <aside className="w-80 shrink-0 border-l border-white/5 bg-[#04060f]/85 backdrop-blur-md flex flex-col overflow-y-auto scrollbar-thin">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">노트 상세</span>
        <div className="flex items-center gap-1">
          <button onClick={() => onPin(note.id)}
            className={`p-1 rounded text-xs transition-colors ${note.pinned ? 'text-indigo-400' : 'text-slate-600 hover:text-indigo-400'}`}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
          <button onClick={() => onStar(note.id)}
            className={`p-1 rounded text-xs transition-colors ${note.starred ? 'text-amber-400' : 'text-slate-600 hover:text-amber-400'}`}>
            {note.starred ? '★' : '☆'}
          </button>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 p-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Type badge */}
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${NOTE_TYPE_DOTS[note.type]}`} />
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${NOTE_TYPE_COLORS[note.type]}`}>
              {NOTE_TYPE_LABELS[note.type]}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">{NOTE_TYPE_DESCRIPTIONS[note.type]}</span>
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-white leading-snug">{note.title}</h3>

          {/* Content */}
          <div className="bg-[#0c1020] rounded-xl border border-white/5 p-4">
            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">{note.content}</p>
          </div>

          {/* Tags */}
          {note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {note.tags.map(tag => (
                <span key={tag} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-slate-500">#{tag}</span>
              ))}
            </div>
          )}

          {/* Connection Info */}
          {(passageConns.length > 0 || themeConns.length > 0 || wordConns.length > 0 || otherConns.length > 0) && (
            <div>
              <AppSectionHeader title="연결 정보" />
              <div className="space-y-1.5">
                {passageConns.map(c => (
                  <ConncectionRow key={c.id} label="본문" value={c.label} color="bg-teal-500" />
                ))}
                {themeConns.map(c => (
                  <ConncectionRow key={c.id} label="주제" value={c.label} color="bg-purple-500" />
                ))}
                {wordConns.map(c => (
                  <ConncectionRow key={c.id} label="원어" value={c.label} color="bg-blue-500" />
                ))}
                {otherConns.map(c => (
                  <ConncectionRow key={c.id} label={c.type} value={c.label} color="bg-slate-500" />
                ))}
              </div>
            </div>
          )}

          {/* Related Notes */}
          {relatedNotes.length > 0 && (
            <div>
              <AppSectionHeader title="관련 노트 추천" count={relatedNotes.length} />
              <div className="space-y-1.5">
                {relatedNotes.map(({ note: rn, reason }) => (
                  <button key={rn.id} onClick={() => onNavigate(rn.id)}
                    className="w-full text-left bg-[#0c1020] rounded-xl border border-white/5 p-3 hover:border-indigo-500/30 transition-colors group">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${NOTE_TYPE_DOTS[rn.type]}`} />
                      <span className={`text-[9px] font-bold px-1 py-0.5 rounded-lg border ${NOTE_TYPE_COLORS[rn.type]}`}>
                        {NOTE_TYPE_LABELS[rn.type]}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-bold group-hover:text-indigo-400 transition-colors line-clamp-1">
                      {rn.title}
                    </p>
                    <p className="text-[9px] text-slate-500 mt-0.5 font-medium">{reason}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="border-t border-white/5 pt-3 text-[10px] text-slate-500 space-y-0.5 font-medium">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              <span className="text-[9px] text-indigo-400 font-bold">최근 저장됨</span>
              <span className="text-slate-600">·</span>
              <span className="text-[9px] text-slate-500">{new Date(note.updatedAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <p>생성: {new Date(note.createdAt).toLocaleString('ko-KR')}</p>
            <p>수정: {new Date(note.updatedAt).toLocaleString('ko-KR')}</p>
            {note.lastReferencedAt && (
              <p>최근 참조: {new Date(note.lastReferencedAt).toLocaleString('ko-KR')}</p>
            )}
            <p>참조 횟수: {note.referenceCount}회</p>
          </div>
        </div>
      </div>

      {/* Workflow Actions */}
      <div className="p-3 border-t border-white/5 space-y-1.5">
        <button onClick={() => router.push(note.projectIds.length > 0 ? `/advanced/projects/${note.projectIds[0]}?tab=prep` : '/advanced/projects')}
          className="w-full text-[10px] font-bold text-indigo-400 border border-indigo-500/30 rounded-xl py-2.5 hover:bg-indigo-500/10 transition-colors">
          설교 준비로 보내기 ↗
        </button>
        <button onClick={() => router.push(note.projectIds.length > 0 ? `/advanced/projects/${note.projectIds[0]}?tab=manuscript` : '/advanced/projects')}
          className="w-full text-[10px] font-bold text-slate-500 border border-white/5 rounded-xl py-2 hover:bg-white/5 hover:text-indigo-400 transition-colors">
          설교 작성에 반영 →
        </button>
        <button onClick={() => router.push('/advanced/graph')}
          className="w-full text-[10px] font-bold text-slate-500 border border-white/5 rounded-xl py-2 hover:bg-white/5 transition-colors">
          그래프에서 보기 →
        </button>
        <button onClick={() => router.push('/advanced/archive')}
          className="w-full text-[10px] font-bold text-slate-500 border border-white/5 rounded-xl py-2 hover:bg-white/5 transition-colors">
          관련 아카이브 검색 →
        </button>
      </div>
    </aside>
  )
}

function ConncectionRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${color}`} />
      <span className="text-slate-500 w-8 font-bold">{label}</span>
      <span className="text-slate-300 font-bold">{value}</span>
    </div>
  )
}

/* ─── Notes Insight Summary ─── */

function NotesInsightSummary({ summary, notes }: {
  summary: ReturnType<typeof getInsightSummary>
  notes: NoteEntry[]
}) {
  const typeColors: Record<string, string> = {
    insight: 'bg-emerald-500',
    research: 'bg-blue-500',
    application: 'bg-violet-500',
    question: 'bg-amber-500',
    pastoral: 'bg-rose-500',
    illustration: 'bg-cyan-500',
    warning: 'bg-red-500',
  }

  const filteredSummary = summary.byType.filter(t => t.count > 0)

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin">
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        {/* Hero */}
        <div className="text-center pb-4 border-b border-white/5">
          <h2 className="text-lg font-bold text-white">통찰 요약</h2>
          <p className="text-xs text-slate-500 font-bold mt-1">
            {summary.totalNotes}개의 노트 · 기록이 쌓일수록 사역의 깊이가 깊어집니다
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          <StatCard label="전체 노트" value={summary.totalNotes} />
          <StatCard label="중요 표시" value={summary.starredCount} />
          <StatCard label="고정 노트" value={summary.pinnedCount} />
          <StatCard label="최근 7일" value={summary.recentNotes} />
        </div>

        {/* By Type */}
        {filteredSummary.length > 0 && (
          <div className="bg-[#04060f]/60 rounded-2xl border border-white/5 p-5">
            <AppSectionHeader title="유형별 분포" />
            <div className="space-y-2.5">
              {filteredSummary.map(t => {
                const pct = Math.round((t.count / summary.totalNotes) * 100)
                return (
                  <div key={t.type}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${typeColors[t.type] || 'bg-slate-500'}`} />
                        <span className="text-slate-300 font-bold">{t.label}</span>
                      </div>
                      <span className="text-slate-500 font-bold">{t.count}개 ({pct}%)</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${typeColors[t.type] || 'bg-slate-500'}`}
                        style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Top Topics */}
        {summary.topTopics.length > 0 && (
          <div className="bg-[#04060f]/60 rounded-2xl border border-white/5 p-5">
            <AppSectionHeader title="자주 다룬 주제" />
            <div className="flex flex-wrap gap-2">
              {summary.topTopics.map(t => (
                <div key={t.topic}
                  className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs text-indigo-300 font-bold">
                  {t.topic}
                  <span className="text-indigo-400 ml-1">· {t.count}회</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Most Referenced */}
        {summary.mostReferenced.length > 0 && (
          <div className="bg-[#04060f]/60 rounded-2xl border border-white/5 p-5">
            <AppSectionHeader title="가장 많이 참조된 통찰" />
            <div className="space-y-2">
              {summary.mostReferenced.map(n => (
                <div key={n.id} className="flex items-start gap-3 p-3 bg-[#0c1020] rounded-xl border border-white/5">
                  <span className={`w-2 h-2 rounded-full shrink-0 mt-1 ${typeColors[n.type] || 'bg-slate-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-300">{n.title}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
                      참조 {n.referenceCount}회 · {NOTE_TYPE_LABELS[n.type]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom message */}
        <div className="text-center py-4">
          <p className="text-[11px] text-slate-500 italic leading-relaxed font-medium">
            {'\u201C'}작은 통찰 하나가 쌓여 사역의 깊이가 됩니다. <br />
            오늘 기록한 한 줄이 내일의 설교를 바꿉니다.{'\u201D'}
          </p>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-center">
      <div className="text-lg font-bold text-white">{value}</div>
      <div className="text-[10px] text-slate-500 font-bold mt-0.5">{label}</div>
    </div>
  )
}
