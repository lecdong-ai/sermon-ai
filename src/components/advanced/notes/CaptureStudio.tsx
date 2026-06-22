'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { BookOpen, MessageSquare, Scroll, Zap } from 'lucide-react'
import {
  NOTE_TYPES,
  NOTE_TYPE_LABELS,
  NOTE_TYPE_COLORS,
  NOTE_TYPE_DOTS,
  type NoteType,
  type NoteEntry,
} from '@/lib/advanced/notesData'
import MoodBackground from './MoodBackground'
import ConstellationGraph from './ConstellationGraph'

export type CaptureMode = 'quick' | 'deep' | 'scripture' | 'chat'

interface CaptureStudioProps {
  notes: NoteEntry[]
  onSave: (payload: CapturePayload) => void
  onSelectNote: (id: string) => void
  onClose?: () => void
}

export interface CapturePayload {
  type: NoteType
  title: string
  content: string
  summary: string
  tags: string[]
  scripture: string[]
  connections: { type: 'passage' | 'theme' | 'word' | 'project' | 'series'; label: string; id: string }[]
}

const MODE_TABS: { key: CaptureMode; label: string; icon: any; desc: string }[] = [
  { key: 'quick', label: '간단 메모', icon: Zap, desc: '8자 이상의 핵심 통찰을 빠르게' },
  { key: 'deep', label: '깊이 쓰기', icon: BookOpen, desc: '마크다운으로 길게 정리' },
  { key: 'scripture', label: '본문 주석', icon: Scroll, desc: '성경 본문 위에 주석을 얹기' },
  { key: 'chat', label: 'AI 대화', icon: MessageSquare, desc: 'AI와 함께 통찰을 빚어내기' },
]

export default function CaptureStudio({ notes, onSave, onSelectNote, onClose }: CaptureStudioProps) {
  const [mode, setMode] = useState<CaptureMode>('quick')
  const [type, setType] = useState<NoteType>('insight')
  const [text, setText] = useState('')
  const [scripture, setScripture] = useState('')
  const [verseNotes, setVerseNotes] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [scriptureList, setScriptureList] = useState<string[]>([])
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [showPreview, setShowPreview] = useState(true)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: '어떤 통찰이 떠오르셨나요? 한 단어, 한 문장이어도 좋습니다. 함께 깊이 빚어내볼게요.' },
  ])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)

  const charCount = text.length
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0
  const readMinutes = Math.max(1, Math.round(wordCount / 250))

  useEffect(() => {
    const contentLength = mode === 'scripture' ? verseNotes.length : text.length
    if (contentLength < 12) {
      setSaveState('idle')
      return
    }
    setSaveState('saving')
    const t = setTimeout(() => {
      setSaveState('saved')
      setLastSavedAt(new Date())
    }, 900)
    return () => clearTimeout(t)
  }, [text, verseNotes, mode])

  useEffect(() => {
    const parts = scripture.split(/[,\n]/).map((s) => s.trim()).filter(Boolean)
    setScriptureList(parts)
  }, [scripture])

  useEffect(() => {
    if (mode === 'quick' && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [mode])

  const title = useMemo(() => {
    const first = text.trim().split('\n').find((l) => l.trim().length > 0) || ''
    return first.length > 60 ? first.slice(0, 60) + '…' : first
  }, [text])

  const summary = useMemo(() => {
    return text.trim().slice(0, 200) + (text.trim().length > 200 ? '…' : '')
  }, [text])

  const addTag = (t: string) => {
    const v = t.replace(/^#/, '').trim()
    if (v && !tags.includes(v)) setTags([...tags, v])
  }
  const removeTag = (t: string) => setTags(tags.filter((x) => x !== t))

  const handleTagKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(tagInput)
      setTagInput('')
    } else if (e.key === 'Backspace' && !tagInput && tags.length) {
      setTags(tags.slice(0, -1))
    }
  }

  const canSave = mode === 'scripture'
    ? (verseNotes.trim().length >= 4 || scriptureList.length > 0)
    : text.trim().length >= 4

  const handleSave = () => {
    if (!canSave) return
    const connections: CapturePayload['connections'] = []
    scriptureList.forEach((s) => {
      connections.push({ type: 'passage', label: s, id: `passage-${s}` })
    })
    onSave({
      type,
      title: title || '제목 없음',
      content: (mode === 'scripture' ? verseNotes : text).trim(),
      summary,
      tags,
      scripture: scriptureList,
      connections,
    })
    setText('')
    setScripture('')
    setScriptureList([])
    setVerseNotes('')
    setTags([])
    setTagInput('')
    setSaveState('idle')
    setLastSavedAt(null)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        handleSave()
      }
      if (e.key === 'Escape' && onClose) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return
    const next = [...chatMessages, { role: 'user' as const, content: chatInput }]
    setChatMessages(next)
    setChatInput('')
    setChatLoading(true)
    try {
      const res = await fetch('/api/notes/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next.map((m) => ({ role: m.role, content: m.content })),
          noteContext: (mode === 'scripture' ? verseNotes : text).slice(0, 1000),
        }),
      }).then(r => r.json())
      if (res.success && res.content) {
        setChatMessages([...next, { role: 'assistant' as const, content: res.content }])
      } else {
        setChatMessages([...next, { role: 'assistant' as const, content: '잠시 후 다시 시도해주세요.' }])
      }
    } catch {
      setChatMessages([...next, { role: 'assistant' as const, content: '연결이 원활하지 않습니다.' }])
    } finally {
      setChatLoading(false)
    }
  }

  const draftScripture = mode === 'scripture' ? scriptureList : scriptureList
  const draftTagsForGraph = tags
  const draftTypeForGraph: NoteType = type

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-[#04060f]">
      <MoodBackground type={type} active={text.length > 0} />

      <div className="relative shrink-0 border-b border-white/5 bg-[#04060f]/40 backdrop-blur-sm">
        <div className="px-4 py-2.5 flex items-center gap-1 overflow-x-auto scrollbar-thin">
          {MODE_TABS.map((m) => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === m.key
                  ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-500/30'
                  : 'text-slate-500 hover:text-slate-300 border border-transparent hover:bg-white/5'
              }`}
              title={m.desc}
            >
              <m.icon className="w-3.5 h-3.5" />
              <span>{m.label}</span>
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2 text-[10px]">
            <SaveIndicator state={saveState} lastSavedAt={lastSavedAt} />
            {onClose && (
              <button onClick={onClose} className="text-slate-500 hover:text-slate-300 p-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="relative flex-1 grid grid-cols-1 lg:grid-cols-[1fr_minmax(280px,400px)] overflow-hidden">
        <div className="relative flex flex-col overflow-hidden border-r border-white/5">
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            <div className="max-w-2xl mx-auto px-6 py-6">
              {mode === 'chat' ? (
                <ChatMode
                  messages={chatMessages}
                  input={chatInput}
                  setInput={setChatInput}
                  loading={chatLoading}
                  onSend={sendChat}
                  onUseAsDraft={(m) => setText((prev) => (prev ? prev + '\n\n' : '') + m)}
                />
              ) : mode === 'scripture' ? (
                <ScriptureMode
                  scripture={scripture}
                  setScripture={setScripture}
                  verseNotes={verseNotes}
                  setVerseNotes={setVerseNotes}
                  detected={scriptureList}
                />
              ) : mode === 'deep' ? (
                <DeepMode text={text} setText={setText} textareaRef={textareaRef} />
              ) : (
                <QuickMode text={text} setText={setText} textareaRef={textareaRef} />
              )}

              <div className="mt-4 flex items-center gap-2 flex-wrap">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">유형</span>
                {NOTE_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all ${
                      type === t
                        ? NOTE_TYPE_COLORS[t] + ' scale-105'
                        : 'border-white/5 text-slate-500 hover:bg-white/5'
                    }`}
                  >
                    <span className={`inline-block w-1 h-1 rounded-full mr-1 align-middle ${NOTE_TYPE_DOTS[t]}`} />
                    {NOTE_TYPE_LABELS[t]}
                  </button>
                ))}
              </div>

              <div className="mt-3">
                <label className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block mb-1.5">태그</label>
                <div className="flex flex-wrap items-center gap-1 bg-[#0c1020]/60 border border-white/5 rounded-lg px-2 py-1.5 focus-within:border-indigo-500/40">
                  {tags.map((t) => (
                    <span key={t} className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                      #{t}
                      <button onClick={() => removeTag(t)} className="text-indigo-400/60 hover:text-indigo-200">×</button>
                    </span>
                  ))}
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKey}
                    placeholder={tags.length === 0 ? '엔터로 추가 (예: 은혜, 십자가)' : ''}
                    className="flex-1 min-w-[120px] bg-transparent text-[11px] text-slate-300 placeholder:text-slate-600 focus:outline-none px-1 py-0.5"
                  />
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="text-[10px] text-slate-500 font-bold flex items-center gap-3">
                  <span>{charCount}자</span>
                  <span>·</span>
                  <span>약 {readMinutes}분 읽기</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowPreview((s) => !s)}
                    className="text-[10px] text-slate-500 hover:text-slate-300 font-bold"
                  >
                    {showPreview ? '✕ 미리보기' : '미리보기'}
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!canSave}
                    className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20"
                  >
                    통찰로 저장 <span className="text-[9px] opacity-60 ml-1">⌘↵</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {showPreview && text.trim() && (
            <div className="shrink-0 border-t border-white/5 bg-[#04060f]/85 backdrop-blur-md max-h-[40%] overflow-y-auto scrollbar-thin">
              <div className="px-6 py-3 max-w-2xl mx-auto">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">라이브 프리뷰</span>
                  <span className={`w-1 h-1 rounded-full ${NOTE_TYPE_DOTS[type]}`} />
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${NOTE_TYPE_COLORS[type]}`}>{NOTE_TYPE_LABELS[type]}</span>
                </div>
                <h5 className="text-sm font-bold text-white leading-snug">{title || '제목 미정'}</h5>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed whitespace-pre-wrap font-medium line-clamp-6">{text}</p>
                {scriptureList.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {scriptureList.map((s) => (
                      <span key={s} className="text-[9px] font-bold bg-teal-500/10 text-teal-300 px-1.5 py-0.5 rounded border border-teal-500/20">{s}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative hidden lg:flex flex-col bg-[#04060f]/60 backdrop-blur-sm">
          <div className="px-4 py-2.5 border-b border-white/5 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">✦ 별자리</span>
              <span className="text-[9px] text-slate-500">작성 중인 통찰과 기존 노트의 연결</span>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <ConstellationGraph
              notes={notes}
              draftText={text || (mode === 'scripture' ? verseNotes : '') || ' '}
              draftType={draftTypeForGraph}
              draftTags={draftTagsForGraph}
              draftScripture={draftScripture}
              onSelectNote={onSelectNote}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function SaveIndicator({ state, lastSavedAt }: { state: 'idle' | 'saving' | 'saved' | 'error'; lastSavedAt: Date | null }) {
  if (state === 'idle') return <span className="text-slate-600 font-bold">대기</span>
  if (state === 'saving') return (
    <span className="flex items-center gap-1 text-indigo-400 font-bold">
      <span className="w-1 h-1 rounded-full bg-indigo-400 animate-pulse" />
      자동저장
    </span>
  )
  if (state === 'saved') return (
    <span className="flex items-center gap-1 text-emerald-400 font-bold">
      <span>●</span>
      저장됨{lastSavedAt && ` · ${lastSavedAt.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}`}
    </span>
  )
  return <span className="text-red-400 font-bold">오류</span>
}

function QuickMode({ text, setText, textareaRef }: { text: string; setText: (s: string) => void; textareaRef: React.RefObject<HTMLTextAreaElement> }) {
  return (
    <div>
      <label className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block mb-1.5">⚡ 간단 메모</label>
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="지금 떠오른 통찰을 한 문장으로..."
        rows={2}
        className="w-full text-lg border-0 border-b border-white/10 focus:border-indigo-500/40 outline-none resize-none bg-transparent text-white placeholder:text-slate-600 leading-relaxed font-bold py-2"
      />
    </div>
  )
}

function DeepMode({ text, setText, textareaRef }: { text: string; setText: (s: string) => void; textareaRef: React.RefObject<HTMLTextAreaElement> }) {
  return (
    <div>
      <label className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block mb-1.5 flex items-center gap-1">
        <BookOpen className="w-3 h-3" />깊이 쓰기
      </label>
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={`# 통찰의 제목

배경:
- 

핵심 관찰:
- 

적용:
- `}
        rows={12}
        className="w-full text-sm border border-white/10 focus:border-indigo-500/40 rounded-xl outline-none resize-none bg-[#0c1020]/60 text-slate-200 placeholder:text-slate-600 leading-relaxed p-4 font-mono"
      />
      <p className="text-[9px] text-slate-600 mt-1.5 font-medium">마크다운 지원 · 첫 줄이 제목이 됩니다</p>
    </div>
  )
}

function ScriptureMode({ scripture, setScripture, verseNotes, setVerseNotes, detected }: { scripture: string; setScripture: (s: string) => void; verseNotes: string; setVerseNotes: (s: string) => void; detected: string[] }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block mb-1.5">📜 본문</label>
        <input
          value={scripture}
          onChange={(e) => setScripture(e.target.value)}
          placeholder="예: 요한복음 1:1-5, 시편 23"
          className="w-full text-sm border border-white/10 focus:border-indigo-500/40 rounded-lg outline-none bg-[#0c1020]/60 text-slate-200 placeholder:text-slate-600 px-3 py-2 font-bold"
        />
        {detected.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {detected.map((s) => (
              <span key={s} className="text-[10px] font-bold bg-teal-500/10 text-teal-300 px-2 py-0.5 rounded border border-teal-500/20">{s}</span>
            ))}
          </div>
        )}
      </div>
      <div>
        <label className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block mb-1.5">주석 · 묵상</label>
        <textarea
          value={verseNotes}
          onChange={(e) => setVerseNotes(e.target.value)}
          placeholder="이 본문에서 발견한 단어, 구조, 신학적 의미, 적용..."
          rows={10}
          className="w-full text-sm border border-white/10 focus:border-indigo-500/40 rounded-xl outline-none resize-none bg-[#0c1020]/60 text-slate-200 placeholder:text-slate-600 leading-relaxed p-4 font-medium"
        />
      </div>
      <p className="text-[9px] text-slate-600 italic">본문은 자동 태그로 저장되고, 별자리에 본문 노드로 표시됩니다.</p>
    </div>
  )
}

function ChatMode({ messages, input, setInput, loading, onSend, onUseAsDraft }: { messages: { role: 'user' | 'assistant'; content: string }[]; input: string; setInput: (s: string) => void; loading: boolean; onSend: () => void; onUseAsDraft: (m: string) => void }) {
  const endRef = useRef<HTMLDivElement>(null)
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])
  return (
    <div className="flex flex-col h-[440px]">
      <label className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block mb-2">💬 AI와 대화하며 통찰 빚기</label>
      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2 pr-1">
        {messages.map((m, i) => (
          <div key={i} className={`group flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] text-[12px] leading-relaxed rounded-2xl px-3.5 py-2 font-medium ${
              m.role === 'user'
                ? 'bg-indigo-500/15 text-indigo-100 border border-indigo-500/30 rounded-tr-sm'
                : 'bg-white/5 text-slate-200 border border-white/10 rounded-tl-sm'
            }`}>
              {m.content}
            </div>
            {m.role === 'assistant' && i > 0 && (
              <button
                onClick={() => onUseAsDraft(m.content)}
                className="text-[9px] text-slate-500 hover:text-indigo-400 font-bold mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ↳ 이 통찰을 노트로 옮기기
              </button>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-slate-400 flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-pulse" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-pulse" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-pulse" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend() } }}
          placeholder="통찰의 씨앗을 입력하세요..."
          className="flex-1 text-xs bg-[#0c1020]/80 border border-white/10 rounded-lg px-3 py-2 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/40"
        />
        <button
          onClick={onSend}
          disabled={!input.trim() || loading}
          className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-30"
        >
          전송
        </button>
      </div>
    </div>
  )
}
