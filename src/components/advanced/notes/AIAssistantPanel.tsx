'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { NOTE_TYPE_LABELS, NOTE_TYPE_COLORS, NOTE_TYPE_DOTS, type NoteType, type NoteEntry } from '@/lib/advanced/notesData'

interface ClassifyResult { type: NoteType; label: string; confidence: number; reason: string }
interface SuggestResult { tags: string[]; scripture: string[] }
interface MatchResult { id: string; score: number; reason: string }
interface ChatMessage { role: 'user' | 'assistant'; content: string; ts: number }

type AiStatus = 'idle' | 'classifying' | 'suggesting' | 'matching' | 'chatting' | 'error'

interface AIAssistantPanelProps {
  draftText: string
  currentNoteId?: string | null
  existingNotes: NoteEntry[]
  onApplyType: (t: NoteType) => void
  onApplyTags: (tags: string[]) => void
  onApplyScripture: (refs: string[]) => void
  onOpenNote: (id: string) => void
  initialChatMessage?: string
}

const STATUS_LABELS: Record<AiStatus, string> = {
  idle: '대기 중',
  classifying: '유형 분석 중',
  suggesting: '태그·본문 추출 중',
  matching: '관련 통찰 찾는 중',
  chatting: 'AI 대화 중',
  error: '오류',
}

export default function AIAssistantPanel({
  draftText,
  currentNoteId,
  existingNotes,
  onApplyType,
  onApplyTags,
  onApplyScripture,
  onOpenNote,
  initialChatMessage,
}: AIAssistantPanelProps) {
  const [status, setStatus] = useState<AiStatus>('idle')
  const [classify, setClassify] = useState<ClassifyResult | null>(null)
  const [suggest, setSuggest] = useState<SuggestResult | null>(null)
  const [matches, setMatches] = useState<MatchResult[]>([])
  const [error, setError] = useState<string | null>(null)
  const [chat, setChat] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const runAi = useCallback(async (text: string) => {
    if (!text || text.length < 8) {
      setClassify(null)
      setSuggest(null)
      setMatches([])
      setStatus('idle')
      return
    }
    abortRef.current?.abort()
    const ac = new AbortController()
    abortRef.current = ac
    setError(null)

    try {
      setStatus('classifying')
      const [cls, sug] = await Promise.all([
        fetch('/api/notes/classify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }), signal: ac.signal }).then(r => r.json()),
        fetch('/api/notes/suggest-tags', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, existingTags: Array.from(new Set(existingNotes.flatMap(n => n.tags))).slice(0, 40) }), signal: ac.signal }).then(r => r.json()),
      ])
      if (ac.signal.aborted) return
      if (cls.success) setClassify(cls)
      if (sug.success) setSuggest(sug)
      setStatus('matching')

      if (existingNotes.length > 0) {
        const slim = existingNotes
          .filter((n) => n.id !== currentNoteId)
          .map((n) => ({ id: n.id, title: n.title, summary: n.summary, tags: n.tags, type: n.type, updatedAt: n.updatedAt }))
          .slice(0, 40)
        const matchRes = await fetch('/api/notes/find-similar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, existingNotes: slim, currentNoteId }),
          signal: ac.signal,
        }).then(r => r.json())
        if (ac.signal.aborted) return
        if (matchRes.success && Array.isArray(matchRes.matches)) setMatches(matchRes.matches)
      } else {
        setMatches([])
      }
      setStatus('idle')
    } catch (e: any) {
      if (e?.name === 'AbortError') return
      console.error(e)
      setError(e?.message || 'AI 호출 실패')
      setStatus('error')
    }
  }, [existingNotes, currentNoteId])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => runAi(draftText), 700)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [draftText, runAi])

  useEffect(() => {
    if (initialChatMessage && chat.length === 0) {
      setChat([{ role: 'assistant', content: initialChatMessage, ts: Date.now() }])
    }
  }, [initialChatMessage, chat.length])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chat])

  const sendChat = useCallback(async () => {
    const text = chatInput.trim()
    if (!text) return
    const next: ChatMessage[] = [...chat, { role: 'user', content: text, ts: Date.now() }]
    setChat(next)
    setChatInput('')
    setStatus('chatting')
    try {
      const res = await fetch('/api/notes/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next.map((m) => ({ role: m.role, content: m.content })),
          noteContext: draftText.slice(0, 1000),
        }),
      }).then(r => r.json())
      if (res.success && res.content) {
        setChat([...next, { role: 'assistant', content: res.content, ts: Date.now() }])
      } else {
        setChat([...next, { role: 'assistant', content: '대화를 이어가려면 잠시 후 다시 시도해주세요.', ts: Date.now() }])
      }
      setStatus('idle')
    } catch (e: any) {
      setChat([...next, { role: 'assistant', content: '연결이 원활하지 않습니다.', ts: Date.now() }])
      setStatus('error')
    }
  }, [chat, chatInput, draftText])

  const noteById = useCallback((id: string) => existingNotes.find((n) => n.id === id), [existingNotes])

  return (
    <aside className="w-80 shrink-0 border-l border-white/5 bg-[#04060f]/85 backdrop-blur-md flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-white/5 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${
              status === 'idle' ? 'bg-emerald-400' :
              status === 'error' ? 'bg-red-400' :
              'bg-indigo-400 animate-pulse'
            }`} />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI 어시스턴트</span>
          </div>
          <span className="text-[9px] text-slate-500 font-bold">{STATUS_LABELS[status]}</span>
        </div>
        <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">작성하면 실시간으로 분석합니다</p>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="p-3 space-y-3">
          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-[10px] text-red-300">
              {error}
            </div>
          )}

          <Section title="유형 추천" loading={status === 'classifying'}>
            {classify ? (
              <div className="space-y-2">
                <button
                  onClick={() => onApplyType(classify.type)}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all hover:scale-[1.02] ${NOTE_TYPE_COLORS[classify.type]}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${NOTE_TYPE_DOTS[classify.type]}`} />
                  <span className="flex-1 text-left">{classify.label}</span>
                  <span className="text-[9px] opacity-70">{Math.round(classify.confidence * 100)}%</span>
                </button>
                <p className="text-[10px] text-slate-500 leading-relaxed px-1">{classify.reason}</p>
              </div>
            ) : (
              <Placeholder text="8자 이상 입력하면 추천을 시작합니다" />
            )}
          </Section>

          <Section title="태그 추천" loading={status === 'suggesting'}>
            {suggest?.tags?.length ? (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  {suggest.tags.map((t) => (
                    <button
                      key={t}
                      onClick={() => onApplyTags([t])}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:bg-indigo-500/15 hover:text-indigo-300 hover:border-indigo-500/30 transition-colors"
                    >
                      #{t}
                    </button>
                  ))}
                </div>
                {suggest.tags.length > 1 && (
                  <button
                    onClick={() => onApplyTags(suggest.tags)}
                    className="text-[10px] text-indigo-400 font-bold hover:underline"
                  >
                    + 모두 적용
                  </button>
                )}
              </div>
            ) : (
              <Placeholder text="주제를 인식하면 태그를 제안합니다" />
            )}
          </Section>

          <Section title="성경 본문" loading={status === 'suggesting'}>
            {suggest?.scripture?.length ? (
              <div className="flex flex-wrap gap-1">
                {suggest.scripture.map((s) => (
                  <button
                    key={s}
                    onClick={() => onApplyScripture([s])}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-300 hover:bg-teal-500/20 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            ) : (
              <Placeholder text="본문 인용이 감지되면 자동 연결" />
            )}
          </Section>

          <Section title="관련 통찰" loading={status === 'matching'} count={matches.length}>
            {matches.length > 0 ? (
              <div className="space-y-1.5">
                {matches.map((m) => {
                  const n = noteById(m.id)
                  if (!n) return null
                  return (
                    <button
                      key={m.id}
                      onClick={() => onOpenNote(m.id)}
                      className="w-full text-left bg-white/5 hover:bg-white/10 rounded-lg p-2 transition-colors group"
                    >
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className={`w-1 h-1 rounded-full ${NOTE_TYPE_DOTS[n.type]}`} />
                        <span className="text-[9px] text-slate-500 font-bold">{NOTE_TYPE_LABELS[n.type]}</span>
                        <span className="text-[9px] text-indigo-400 ml-auto font-bold">{Math.round(m.score * 100)}%</span>
                      </div>
                      <p className="text-[11px] text-slate-200 font-bold group-hover:text-indigo-300 line-clamp-1">{n.title}</p>
                      <p className="text-[9px] text-slate-500 mt-0.5 line-clamp-1">{m.reason}</p>
                    </button>
                  )
                })}
              </div>
            ) : (
              <Placeholder text={existingNotes.length === 0 ? '저장된 노트가 없습니다' : '관련 노트가 없습니다'} />
            )}
          </Section>

          <div className="border-t border-white/5 pt-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">💬 AI와 대화</span>
              {chat.length > 0 && (
                <span className="text-[9px] text-slate-500">{chat.length}개 메시지</span>
              )}
            </div>
            <div className="space-y-2 max-h-[280px] overflow-y-auto scrollbar-thin pr-1">
              {chat.length === 0 && (
                <p className="text-[10px] text-slate-500 leading-relaxed px-1">
                  이 통찰을 더 깊이 발전시키고 싶을 때, 신학적 배경·원어·적용을 물어보세요.
                </p>
              )}
              {chat.map((m) => (
                <div key={m.ts} className={`text-[11px] leading-relaxed rounded-lg px-2.5 py-1.5 font-medium ${
                  m.role === 'user'
                    ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-100 ml-4'
                    : 'bg-white/5 border border-white/5 text-slate-300 mr-4'
                }`}>
                  {m.content}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="mt-2 flex gap-1.5">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat() } }}
                placeholder="신학적 배경을 물어보세요..."
                className="flex-1 text-[11px] bg-[#0c1020] border border-white/5 rounded-lg px-2.5 py-1.5 text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/40"
              />
              <button
                onClick={sendChat}
                disabled={!chatInput.trim() || status === 'chatting'}
                className="text-[10px] font-bold bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 px-2.5 rounded-lg transition-colors disabled:opacity-30"
              >
                전송
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}

function Section({ title, loading, count, children }: { title: string; loading?: boolean; count?: number; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{title}</span>
          {loading && <span className="w-1 h-1 rounded-full bg-indigo-400 animate-pulse" />}
        </div>
        {typeof count === 'number' && count > 0 && (
          <span className="text-[9px] text-slate-500 font-bold">{count}</span>
        )}
      </div>
      {children}
    </div>
  )
}

function Placeholder({ text }: { text: string }) {
  return <p className="text-[10px] text-slate-600 italic px-1">{text}</p>
}
