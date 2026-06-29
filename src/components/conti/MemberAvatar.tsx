'use client'

import { MEMBER_COLORS } from '@/types/conti'

const COLOR_BG: Record<string, string> = {
  sky:     'bg-sky-500',
  emerald: 'bg-emerald-500',
  amber:   'bg-amber-500',
  rose:    'bg-rose-500',
  indigo:  'bg-indigo-500',
  orange:  'bg-orange-500',
  cyan:    'bg-cyan-500',
  pink:    'bg-pink-500',
  lime:    'bg-lime-500',
  fuchsia: 'bg-fuchsia-500',
  slate:   'bg-slate-500',
}

interface Props {
  name: string
  color: string
  size?: 'sm' | 'md' | 'lg'
}

function getInitial(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return '?'
  // 한글: 첫 글자, 영문: 첫 글자 대문자
  const ch = trimmed[0]
  return /[ㄱ-ㅎ가-힣]/.test(ch) ? ch : ch.toUpperCase()
}

export default function MemberAvatar({ name, color, size = 'md' }: Props) {
  const SIZE_CLS = {
    sm: 'w-6 h-6 text-[12px]',
    md: 'w-9 h-9 text-[15px]',
    lg: 'w-12 h-12 text-[17px]',
  }[size]

  const bg = COLOR_BG[color] || 'bg-slate-500'

  return (
    <div
      className={`${SIZE_CLS} ${bg} rounded-full flex items-center justify-center font-extrabold text-white shadow-sm flex-shrink-0`}
      title={name}
    >
      {getInitial(name)}
    </div>
  )
}

export function getRandomColor(): string {
  return MEMBER_COLORS[Math.floor(Math.random() * MEMBER_COLORS.length)]
}
