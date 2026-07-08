'use client'

import { Folder, CheckCircle, Loader2, Circle } from 'lucide-react'

interface Props {
  stats: {
    total: number
    completed: number
    inProgress: number
    notStarted: number
  }
}

export default function WorkspaceStatsCard({ stats }: Props) {
  const cards = [
    {
      icon: Folder,
      label: '전체 설교',
      value: stats.total,
      bg: 'bg-[#f5f4f0]',
      iconBg: 'bg-[#eae7e0]',
      iconColor: 'text-[#8d7a5b]',
      valueColor: 'text-[#2c2a29]',
    },
    {
      icon: CheckCircle,
      label: '완료',
      value: stats.completed,
      bg: 'bg-emerald-50',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      valueColor: 'text-emerald-700',
    },
    {
      icon: Loader2,
      label: '진행 중',
      value: stats.inProgress,
      bg: 'bg-amber-50',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      valueColor: 'text-amber-700',
    },
    {
      icon: Circle,
      label: '시작 전',
      value: stats.notStarted,
      bg: 'bg-slate-50',
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-400',
      valueColor: 'text-slate-500',
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {cards.map((card, i) => {
        const Icon = card.icon
        return (
          <div
            key={card.label}
            className={`${card.bg} rounded-2xl p-4 sm:p-5 border border-[#e4e2dd] transition-all duration-300 hover:shadow-md animate-in`}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className={`w-9 h-9 rounded-xl ${card.iconBg} flex items-center justify-center mb-3`}>
              <Icon className={`w-4 h-4 ${card.iconColor}`} strokeWidth={2.5} />
            </div>
            <div className={`text-2xl sm:text-3xl font-extrabold ${card.valueColor} leading-none mb-1`}>
              {card.value}
            </div>
            <div className="text-[12px] font-medium text-[#8a8580]">{card.label}</div>
          </div>
        )
      })}
    </div>
  )
}
