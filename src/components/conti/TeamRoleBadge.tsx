'use client'

import type { MemberRole } from '@/types/conti'
import { MEMBER_ROLE_META } from '@/types/conti'

interface Props {
  role: MemberRole
  size?: 'xs' | 'sm' | 'md'
  showIcon?: boolean
}

const SIZE_CLS = {
  xs: 'text-[11px] px-1.5 py-0 gap-0.5',
  sm: 'text-[12px] px-2 py-0.5 gap-1',
  md: 'text-[13px] px-2.5 py-1 gap-1',
}

const COLOR_CLS: Record<string, string> = {
  amber:   'bg-amber-500/15 text-amber-300 border-amber-500/30',
  rose:    'bg-rose-500/15 text-rose-300 border-rose-500/30',
  indigo:  'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  orange:  'bg-orange-500/15 text-orange-300 border-orange-500/30',
  sky:     'bg-sky-500/15 text-sky-300 border-sky-500/30',
  cyan:    'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  slate:   'bg-slate-500/15 text-slate-300 border-slate-500/30',
}

export default function TeamRoleBadge({ role, size = 'sm', showIcon = true }: Props) {
  const meta = MEMBER_ROLE_META[role]
  return (
    <span className={`inline-flex items-center rounded-md font-bold border whitespace-nowrap ${COLOR_CLS[meta.color]} ${SIZE_CLS[size]}`}>
      {showIcon && <span className="text-[12px] leading-none">{meta.icon}</span>}
      {meta.label}
    </span>
  )
}

export const ROLE_COLOR_CLS = COLOR_CLS
