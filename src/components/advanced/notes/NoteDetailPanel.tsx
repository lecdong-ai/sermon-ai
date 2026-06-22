'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Library } from 'lucide-react'
import { NOTE_TYPE_LABELS, NOTE_TYPE_DOTS, type NoteType, type NoteEntry } from '@/lib/advanced/notesData'
import LinkInsightModal, { type LinkTarget } from './LinkInsightModal'
import ReflectInManuscriptModal from './ReflectInManuscriptModal'

interface NoteDetailPanelProps {
  note: NoteEntry
  relatedNotes: { note: NoteEntry; reason: string }[]
  onClose: () => void
  onStar: (id: string) => void
  onPin: (id: string) => void
  onNavigate: (id: string) => void
  onSendToPrepare: () => void
  onAddToSeries: () => void
  onReflectInManuscript: () => void
  onViewInGraph: () => void
  onDelete?: () => void
  projectLookup?: Map<string, { title: string; passage: string }>
  seriesLookup?: Map<string, { name: string }>
  onInsightUpdated?: (n: NoteEntry) => void
}

export default function NoteDetailPanel({
  note,
  relatedNotes,
  onClose,
  onStar,
  onPin,
  onNavigate,
  onSendToPrepare,
  onAddToSeries,
  onReflectInManuscript,
  onViewInGraph,
  onDelete,
  projectLookup,
  seriesLookup,
  onInsightUpdated,
}: NoteDetailPanelProps) {
  const router = useRouter()
  const [tab, setTab] = useState<'note' | 'related' | 'links'>('note')
  const [linkModal, setLinkModal] = useState<LinkTarget | null>(null)
  const [showReflectModal, setShowReflectModal] = useState(false)

  const projectIds = note.projectIds || []
  const seriesIds = note.seriesIds || []
  const linkedProjects = projectIds.map((id) => ({ id, info: projectLookup?.get(id) })).filter((p) => p.info)
  const linkedSeries = seriesIds.map((id) => ({ id, info: seriesLookup?.get(id) })).filter((s) => s.info)

  const openLinkModal = (target: LinkTarget) => {
    if (target === 'manuscript') {
      onReflectInManuscript()
      setShowReflectModal(true)
      return
    }
    if (target === 'project') {
      onSendToPrepare()
      setLinkModal('project')
    } else {
      onAddToSeries()
      setLinkModal('series')
    }
  }

  return (
    <aside className="w-80 shrink-0 border-l border-white/5 bg-[#04060f]/85 backdrop-blur-md flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-white/5 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">통찰 상세</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPin(note.id)}
            className={`p-1 rounded text-xs transition-colors ${note.pinned ? 'text-indigo-400' : 'text-slate-600 hover:text-indigo-400'}`}
            title="고정"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
          <button
            onClick={() => onStar(note.id)}
            className={`p-1 rounded text-xs transition-colors ${note.starred ? 'text-amber-400' : 'text-slate-600 hover:text-amber-400'}`}
            title="중요"
          >
            {note.starred ? '★' : '☆'}
          </button>
          {onDelete && (
            <button
              onClick={() => { if (confirm('이 통찰을 삭제하시겠습니까?')) onDelete() }}
              className="text-slate-600 hover:text-red-400 p-1 transition-colors"
              title="삭제"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
              </svg>
            </button>
          )}
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 p-1" title="닫기">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="px-4 pt-3 shrink-0 flex gap-1 border-b border-white/5">
        <TabBtn active={tab === 'note'} onClick={() => setTab('note')}>노트</TabBtn>
        <TabBtn active={tab === 'related'} onClick={() => setTab('related')}>
          관련 통찰{relatedNotes.length > 0 && <span className="ml-1 text-indigo-400">{relatedNotes.length}</span>}
        </TabBtn>
        <TabBtn active={tab === 'links'} onClick={() => setTab('links')}>
          이음{(linkedProjects.length + linkedSeries.length) > 0 && <span className="ml-1 text-indigo-400">{linkedProjects.length + linkedSeries.length}</span>}
        </TabBtn>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {tab === 'note' && <NoteTab note={note} />}
        {tab === 'related' && <RelatedTab related={relatedNotes} onNavigate={onNavigate} />}
        {tab === 'links' && (
          <LinksTab
            linkedProjects={linkedProjects}
            linkedSeries={linkedSeries}
            onAddProject={() => openLinkModal('project')}
            onAddSeries={() => openLinkModal('series')}
            onOpenProject={(id) => router.push(`/advanced/projects/${id}`)}
            onOpenSeries={(id) => router.push(`/advanced/series/${id}`)}
            onOpenLoom={() => router.push('/advanced/manuscript')}
          />
        )}
      </div>

      <div className="p-3 border-t border-white/5 grid grid-cols-2 gap-1.5 shrink-0">
        <button
          onClick={() => openLinkModal('project')}
          className={`text-[10px] font-bold rounded-lg py-2 border transition-colors ${
            projectIds.length > 0
              ? 'text-indigo-200 border-indigo-500/40 bg-indigo-500/10'
              : 'text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/10'
          }`}
        >
          <FileText className="w-3 h-3 inline mr-1" />설교 준비 {projectIds.length > 0 && <span className="ml-1 opacity-70">{projectIds.length}</span>}
        </button>
        <button
          onClick={() => openLinkModal('series')}
          className={`text-[10px] font-bold rounded-lg py-2 border transition-colors ${
            seriesIds.length > 0
              ? 'text-cyan-200 border-cyan-500/40 bg-cyan-500/10'
              : 'text-slate-300 border-white/10 hover:bg-white/5 hover:text-cyan-300'
          }`}
        >
          <Library className="w-3 h-3 inline mr-1" />시리즈 {seriesIds.length > 0 && <span className="ml-1 opacity-70">{seriesIds.length}</span>}
        </button>
        <button
          onClick={() => openLinkModal('manuscript')}
          className="text-[10px] font-bold text-slate-300 border border-white/10 rounded-lg py-2 hover:bg-white/5 hover:text-emerald-300 transition-colors"
        >
          ✍️ 원고 반영
        </button>
        <button
          onClick={onViewInGraph}
          className="text-[10px] font-bold text-slate-300 border border-white/10 rounded-lg py-2 hover:bg-white/5 hover:text-violet-300 transition-colors"
        >
          🌌 그래프
        </button>
      </div>

      {showReflectModal && (
        <ReflectInManuscriptModal
          insight={note}
          onClose={() => setShowReflectModal(false)}
          onReflected={onInsightUpdated ? (id) => {
            const next = Array.from(new Set([...(note.projectIds || []), id]))
            onInsightUpdated({ ...note, projectIds: next })
          } : undefined}
        />
      )}
      {linkModal === 'project' && (
        <LinkInsightModal
          target="project"
          insight={note}
          onClose={() => setLinkModal(null)}
          onLinked={onInsightUpdated ? (_k, ids) => {
            onInsightUpdated({ ...note, projectIds: ids })
          } : undefined}
          onUnlinked={onInsightUpdated ? (_k, id) => {
            onInsightUpdated({ ...note, projectIds: (note.projectIds || []).filter((x) => x !== id) })
          } : undefined}
        />
      )}
      {linkModal === 'series' && (
        <LinkInsightModal
          target="series"
          insight={note}
          onClose={() => setLinkModal(null)}
          onLinked={onInsightUpdated ? (_k, ids) => {
            onInsightUpdated({ ...note, seriesIds: ids })
          } : undefined}
          onUnlinked={onInsightUpdated ? (_k, id) => {
            onInsightUpdated({ ...note, seriesIds: (note.seriesIds || []).filter((x) => x !== id) })
          } : undefined}
        />
      )}
    </aside>
  )
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-[10px] font-bold border-b-2 transition-colors ${
        active ? 'text-indigo-300 border-indigo-400' : 'text-slate-500 border-transparent hover:text-slate-300'
      }`}
    >
      {children}
    </button>
  )
}

function NoteTab({ note }: { note: NoteEntry }) {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${NOTE_TYPE_DOTS[note.type]}`} />
        <span className="text-[10px] font-bold text-slate-300">{NOTE_TYPE_LABELS[note.type]}</span>
      </div>
      <h3 className="text-base font-bold text-white leading-snug">{note.title}</h3>
      <div className="bg-[#0c1020] rounded-xl border border-white/5 p-4">
        <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">{note.content}</p>
      </div>
      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {note.tags.map((tag) => (
            <span key={tag} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-slate-400">
              #{tag}
            </span>
          ))}
        </div>
      )}
      {note.connections.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">연결</p>
          {note.connections.map((c) => (
            <div key={c.id} className="flex items-center gap-2 text-xs">
              <span className={`w-1.5 h-1.5 rounded-full ${
                c.type === 'passage' ? 'bg-teal-500' :
                c.type === 'theme' ? 'bg-purple-500' :
                c.type === 'word' ? 'bg-blue-500' : 'bg-slate-500'
              }`} />
              <span className="text-slate-500 w-10 text-[10px] font-bold">
                {c.type === 'passage' ? '본문' : c.type === 'theme' ? '주제' : c.type === 'word' ? '원어' : c.type}
              </span>
              <span className="text-slate-300 font-bold text-[11px]">{c.label}</span>
            </div>
          ))}
        </div>
      )}
      <div className="border-t border-white/5 pt-3 text-[10px] text-slate-500 space-y-0.5 font-medium">
        <p>생성: {new Date(note.createdAt).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        <p>수정: {new Date(note.updatedAt).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        {note.referenceCount > 0 && <p>참조 {note.referenceCount}회</p>}
      </div>
    </div>
  )
}

function RelatedTab({ related, onNavigate }: { related: { note: NoteEntry; reason: string }[]; onNavigate: (id: string) => void }) {
  if (related.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-xs text-slate-500">관련 통찰이 없습니다</p>
        <p className="text-[10px] text-slate-600 mt-1">더 많은 통찰을 기록하면 자동으로 연결됩니다</p>
      </div>
    )
  }
  return (
    <div className="p-3 space-y-1.5">
      {related.map(({ note: n, reason }) => (
        <button
          key={n.id}
          onClick={() => onNavigate(n.id)}
          className="w-full text-left bg-[#0c1020] rounded-lg border border-white/5 p-3 hover:border-indigo-500/30 transition-colors group"
        >
          <div className="flex items-center gap-1.5 mb-1">
            <span className={`w-1.5 h-1.5 rounded-full ${NOTE_TYPE_DOTS[n.type]}`} />
            <span className="text-[9px] font-bold text-slate-500">{NOTE_TYPE_LABELS[n.type]}</span>
          </div>
          <p className="text-xs text-slate-200 font-bold group-hover:text-indigo-300 line-clamp-1">{n.title}</p>
          <p className="text-[9px] text-slate-500 mt-1 font-medium line-clamp-2">{reason}</p>
        </button>
      ))}
    </div>
  )
}

function LinksTab({
  linkedProjects, linkedSeries,
  onAddProject, onAddSeries,
  onOpenProject, onOpenSeries,
  onOpenLoom,
}: {
  linkedProjects: { id: string; info: { title: string; passage: string } | undefined }[]
  linkedSeries: { id: string; info: { name: string } | undefined }[]
  onAddProject: () => void
  onAddSeries: () => void
  onOpenProject: (id: string) => void
  onOpenSeries: (id: string) => void
  onOpenLoom?: () => void
}) {
  return (
    <div className="p-3 space-y-3">
      <section>
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
            <FileText className="w-3 h-3" />설교 프로젝트
          </p>
          <div className="flex items-center gap-2">
            {linkedProjects.length > 0 && onOpenLoom && (
              <button onClick={onOpenLoom} className="text-[10px] text-violet-400 hover:text-violet-300 font-bold">🧵 직조</button>
            )}
            <button onClick={onAddProject} className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold">+ 추가</button>
          </div>
        </div>
        {linkedProjects.length === 0 ? (
          <p className="text-[10px] text-slate-600 italic px-1 py-2">연결된 프로젝트가 없습니다</p>
        ) : (
          <div className="space-y-1">
            {linkedProjects.map(({ id, info }) => (
              <button
                key={id}
                onClick={() => onOpenProject(id)}
                className="w-full text-left bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-2 transition-colors group"
              >
                <p className="text-[11px] font-bold text-slate-200 group-hover:text-indigo-300 line-clamp-1">{info?.title || id}</p>
                {info?.passage && <p className="text-[9px] text-slate-500 mt-0.5">{info.passage}</p>}
              </button>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
            <Library className="w-3 h-3" />시리즈
          </p>
          <button onClick={onAddSeries} className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold">+ 추가</button>
        </div>
        {linkedSeries.length === 0 ? (
          <p className="text-[10px] text-slate-600 italic px-1 py-2">연결된 시리즈가 없습니다</p>
        ) : (
          <div className="space-y-1">
            {linkedSeries.map(({ id, info }) => (
              <button
                key={id}
                onClick={() => onOpenSeries(id)}
                className="w-full text-left bg-cyan-500/5 hover:bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-2 transition-colors group"
              >
                <p className="text-[11px] font-bold text-slate-200 group-hover:text-cyan-300 line-clamp-1">{info?.name || id}</p>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
