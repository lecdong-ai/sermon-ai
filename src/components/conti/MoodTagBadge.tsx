'use client'

import type { MoodTag } from '@/types/conti'

const MOOD_META: Record<MoodTag, { label: string; color: string }> = {
  '은혜':  { label: '은혜',  color: 'bg-sky-500/15 text-sky-300 border-sky-500/30' },
  '경배':  { label: '경배',  color: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' },
  '찬양':  { label: '찬양',  color: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  '회개':  { label: '회개',  color: 'bg-slate-500/15 text-slate-300 border-slate-500/30' },
  '축제':  { label: '축제',  color: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
  '축복':  { label: '축복',  color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  '말씀':  { label: '말씀',  color: 'bg-purple-500/15 text-purple-300 border-purple-500/30' },
  '고백':  { label: '고백',  color: 'bg-blue-500/15 text-blue-300 border-blue-500/30' },
  '선교':  { label: '선교',  color: 'bg-orange-500/15 text-orange-300 border-orange-500/30' },
  '위로':  { label: '위로',  color: 'bg-teal-500/15 text-teal-300 border-teal-500/30' },
  '소망':  { label: '소망',  color: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' },
  '감사':  { label: '감사',  color: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30' },
  '사랑':  { label: '사랑',  color: 'bg-pink-500/15 text-pink-300 border-pink-500/30' },
  '결단':  { label: '결단',  color: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30' },
}

export default function MoodTagBadge({ tag, size = 'sm' }: { tag: MoodTag; size?: 'sm' | 'xs' }) {
  const meta = MOOD_META[tag]
  const sizeCls = size === 'xs' ? 'text-[11px] px-1.5 py-0' : 'text-[12px] px-2 py-0.5'
  return (
    <span className={`inline-flex items-center rounded-md font-bold border ${meta.color} ${sizeCls}`}>
      #{meta.label}
    </span>
  )
}

export { MOOD_META }
