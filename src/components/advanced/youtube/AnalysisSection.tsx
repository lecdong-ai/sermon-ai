'use client'

import { ReactNode } from 'react'

interface AnalysisSectionProps {
  icon: ReactNode
  title: string
  color: 'indigo' | 'emerald' | 'rose' | 'amber' | 'sky'
  children: ReactNode
}

const colorMap = {
  indigo: { border: 'border-indigo-500/20', bg: 'bg-indigo-500/5', accent: 'text-indigo-300', dot: 'bg-indigo-400' },
  emerald: { border: 'border-emerald-500/20', bg: 'bg-emerald-500/5', accent: 'text-emerald-300', dot: 'bg-emerald-400' },
  rose: { border: 'border-rose-500/20', bg: 'bg-rose-500/5', accent: 'text-rose-300', dot: 'bg-rose-400' },
  amber: { border: 'border-amber-500/20', bg: 'bg-amber-500/5', accent: 'text-amber-300', dot: 'bg-amber-400' },
  sky: { border: 'border-sky-500/20', bg: 'bg-sky-500/5', accent: 'text-sky-300', dot: 'bg-sky-400' },
}

export function AnalysisSection({ icon, title, color, children }: AnalysisSectionProps) {
  const c = colorMap[color]
  return (
    <div className={`p-4 rounded-xl ${c.bg} border ${c.border}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className={c.accent}>{icon}</span>
        <h3 className={`text-sm font-semibold ${c.accent}`}>{title}</h3>
      </div>
      {children}
    </div>
  )
}

export function AnalysisItem({ title, children, color = 'indigo' }: { title: string; children: ReactNode; color?: 'indigo' | 'emerald' | 'rose' | 'amber' | 'sky' }) {
  const c = colorMap[color]
  return (
    <div className="mb-2 last:mb-0">
      <div className="flex items-start gap-2">
        <span className={`mt-1.5 w-1.5 h-1.5 rounded-full ${c.dot} shrink-0`} />
        <div>
          <p className="text-xs font-medium text-white/80">{title}</p>
          <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  )
}
