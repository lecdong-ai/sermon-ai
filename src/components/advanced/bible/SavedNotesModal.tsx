'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, X, Trash2, ArrowRight, FileText, Loader2 } from 'lucide-react'

interface SavedNote {
  id: string
  book: string
  chapter: number
  verse_start: number
  verse_end: number | null
  passage: string
  memo: string | null
  created_at: string
}

export default function SavedNotesModal({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const [notes, setNotes] = useState<SavedNote[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedNote, setSelectedNote] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/bible/notes')
      .then(r => r.json())
      .then(json => { if (json.success) setNotes(json.data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const handleLoad = (id: string) => {
    setSelectedNote(id)
    router.push(`/advanced/bible?loadNote=${id}`)
    onClose()
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('정말 이 연구 노트를 삭제하시겠습니까?')) return
    setDeleting(id)
    try {
      const res = await fetch('/api/bible/notes', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
      const json = await res.json()
      if (json.success) setNotes(prev => prev.filter(n => n.id !== id))
    } catch {
      alert('삭제 중 오류가 발생했습니다.')
    } finally {
      setDeleting(null)
    }
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#03050c]/80 backdrop-blur-md">
      <div ref={modalRef} className="relative w-full max-w-2xl rounded-3xl glass-dark border border-white/10 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[85vh] overflow-y-auto scrollbar-thin">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
              <BookOpen className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h4 className="text-[17px] font-bold text-white">내 연구 노트</h4>
              <p className="text-[11px] text-slate-500 font-semibold">{notes.length}개의 저장된 연구</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            <p className="text-sm text-slate-400">노트 불러오는 중...</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <FileText className="w-10 h-10 text-slate-600" />
            <p className="text-sm font-bold text-slate-400">아직 저장된 연구 노트가 없습니다</p>
            <p className="text-xs text-slate-600">성경 연구 후 &quot;연구 노트 저장&quot; 버튼을 눌러주세요</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notes.map(note => (
              <div
                key={note.id}
                className={`group relative rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden ${
                  selectedNote === note.id ? 'border-indigo-500/40 bg-indigo-500/5' : 'border-white/5 bg-white/[0.02] hover:border-indigo-500/20 hover:bg-white/[0.04]'
                }`}
                onClick={() => handleLoad(note.id)}
              >
                <div className="p-4 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                    <span className="text-[11px] font-bold text-indigo-300">{note.book.slice(0, 2)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[13px] font-bold text-white">{note.passage}</span>
                      <span className="text-[10px] text-slate-500 font-medium">{formatDate(note.created_at)}</span>
                    </div>
                    {note.memo && (
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{note.memo}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleDelete(note.id, e)}
                      disabled={deleting === note.id}
                      className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors disabled:opacity-50"
                      title="삭제"
                    >
                      {deleting === note.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
