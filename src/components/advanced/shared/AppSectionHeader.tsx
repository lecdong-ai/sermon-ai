import type { ReactNode } from 'react'

export default function AppSectionHeader({
  title,
  count,
  action,
  className,
}: {
  title: string
  count?: number | string
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={`flex items-center justify-between mb-4 ${className || ''}`}>
      <div className="flex items-center gap-2">
        <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{title}</h3>
        {count !== undefined && (
          <span className="text-[10px] text-slate-500 bg-white/5 border border-white/5 px-1.5 py-0.5 rounded font-bold">{count}</span>
        )}
      </div>
      {action && <div className="flex items-center gap-1">{action}</div>}
    </div>
  )
}
