'use client'

import { WORSHIP_TYPE_META, type WorshipType } from '@/types/conti'

const COLOR_CLASS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  amber:   { bg: 'bg-amber-500/10',   text: 'text-amber-300',   border: 'border-amber-500/30',   dot: 'bg-amber-400' },
  orange:  { bg: 'bg-orange-500/10',  text: 'text-orange-300',  border: 'border-orange-500/30',  dot: 'bg-orange-400' },
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-300', border: 'border-emerald-500/30', dot: 'bg-emerald-400' },
  indigo:  { bg: 'bg-indigo-500/10',  text: 'text-indigo-300',  border: 'border-indigo-500/30',  dot: 'bg-indigo-400' },
  rose:    { bg: 'bg-rose-500/10',    text: 'text-rose-300',    border: 'border-rose-500/30',    dot: 'bg-rose-400' },
}

export default function WorshipTypeBadge({ type, size = 'sm' }: { type: WorshipType; size?: 'sm' | 'xs' }) {
  const meta = WORSHIP_TYPE_META[type]
  const c = COLOR_CLASS[meta.color]
  const sizeCls = size === 'xs' ? 'text-[11px] px-1.5 py-0' : 'text-[12px] px-2 py-0.5'
  return (
    <span className={`inline-flex items-center gap-1 rounded-md font-bold border ${c.bg} ${c.text} ${c.border} ${sizeCls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {meta.label}
    </span>
  )
}
