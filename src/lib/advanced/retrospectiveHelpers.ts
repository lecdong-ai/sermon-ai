import type { JohnManuscriptData } from '@/lib/advanced/johnManuscriptData'
import { extractKeywords } from '@/lib/advanced/retrospectiveStorage'

export interface VersionMetrics {
  label: string
  timestamp: number
  wordCount: number
  sectionCount: number
  illCount: number
  refCount: number
  greekCount: number
  appCount: number
  hasPassage: boolean
  title: string
  oneSentenceSummary: string
  textSnippet: string
  topKeywords: string[]
}

export function computeMetrics(label: string, timestamp: number, data: JohnManuscriptData): VersionMetrics {
  const text = (data.sections || []).map(s => s.content).join('\n').trim()
  return {
    label,
    timestamp,
    wordCount: text.replace(/\s/g, '').length,
    sectionCount: (data.sections || []).filter(s => s.content?.trim()).length,
    illCount: (data.illustrationNotes || []).length,
    refCount: (data.referenceNotes || []).length,
    greekCount: (data.greekWords || []).length,
    appCount: (data.outlinePoints || []).filter((o: any) => /적용|application/i.test(o.title || '')).length || 0,
    hasPassage: !!data.passage,
    title: data.title || '',
    oneSentenceSummary: data.oneSentenceSummary || '',
    textSnippet: text.slice(0, 400),
    topKeywords: extractKeywords(text, 6),
  }
}

export function diffLines(a: string, b: string): Array<{ type: 'same' | 'add' | 'del'; text: string }> {
  const aLines = a.split('\n').map(l => l.trim()).filter(Boolean)
  const bLines = b.split('\n').map(l => l.trim()).filter(Boolean)
  const aSet = new Set(aLines)
  const bSet = new Set(bLines)
  const out: Array<{ type: 'same' | 'add' | 'del'; text: string }> = []
  const used = new Set<string>()
  for (const l of bLines) {
    if (!aSet.has(l) && !used.has(l)) {
      out.push({ type: 'add', text: l })
      used.add(l)
    } else if (aSet.has(l)) {
      out.push({ type: 'same', text: l })
      used.add(l)
    }
  }
  for (const l of aLines) {
    if (!bSet.has(l)) {
      out.push({ type: 'del', text: l })
    }
  }
  return out
}

export function diffStats(a: string, b: string): { added: number; removed: number; changed: number } {
  const aLines = a.split('\n').map(l => l.trim()).filter(Boolean)
  const bLines = b.split('\n').map(l => l.trim()).filter(Boolean)
  const aSet = new Set(aLines)
  const bSet = new Set(bLines)
  let added = 0, removed = 0
  for (const l of bLines) if (!aSet.has(l)) added++
  for (const l of aLines) if (!bSet.has(l)) removed++
  return { added, removed, changed: added + removed }
}

export function pickPhaseIcon(label: string, idx: number, total: number): { icon: string; tone: string } {
  const role = idx / Math.max(total - 1, 1)
  if (total === 1) return { icon: '🌱', tone: 'seed' }
  if (role === 0) return { icon: '🌱', tone: 'seed' }
  if (role < 0.34) return { icon: '📚', tone: 'study' }
  if (role < 0.67) return { icon: '📝', tone: 'draft' }
  if (role < 0.95) return { icon: '✏️', tone: 'refine' }
  return { icon: '🎤', tone: 'final' }
}

export function pickPhaseTone(tone: string): { ring: string; bg: string; text: string; dot: string; label: string } {
  switch (tone) {
    case 'seed':   return { ring: 'border-slate-500/30',   bg: 'bg-slate-500/10',   text: 'text-slate-300',   dot: 'bg-slate-400',   label: '싹' }
    case 'study':  return { ring: 'border-blue-500/30',    bg: 'bg-blue-500/10',    text: 'text-blue-300',    dot: 'bg-blue-400',    label: '연구' }
    case 'draft':  return { ring: 'border-amber-500/30',   bg: 'bg-amber-500/10',   text: 'text-amber-300',   dot: 'bg-amber-400',   label: '초고' }
    case 'refine': return { ring: 'border-indigo-500/30',  bg: 'bg-indigo-500/10',  text: 'text-indigo-300',  dot: 'bg-indigo-400',  label: '다듬기' }
    case 'final':  return { ring: 'border-emerald-500/30', bg: 'bg-emerald-500/10', text: 'text-emerald-300', dot: 'bg-emerald-400', label: '완성' }
    default:       return { ring: 'border-white/10',       bg: 'bg-white/5',        text: 'text-slate-300',   dot: 'bg-slate-500',   label: '단계' }
  }
}
