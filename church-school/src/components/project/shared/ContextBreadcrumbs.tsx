'use client'

import { useRouter } from 'next/navigation'

export interface BreadcrumbItem {
  label: string
  href?: string
}

export default function ContextBreadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const router = useRouter()

  return (
    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-2">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-slate-600">/</span>}
          {item.href ? (
            <button
              onClick={() => router.push(item.href!)}
              className="hover:text-indigo-400 transition-colors"
            >
              {item.label}
            </button>
          ) : (
            <span className="text-slate-200 font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </div>
  )
}
