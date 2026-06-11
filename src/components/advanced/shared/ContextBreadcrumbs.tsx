'use client'

import { useRouter } from 'next/navigation'

export interface BreadcrumbItem {
  label: string
  href?: string
}

export default function ContextBreadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const router = useRouter()

  return (
    <div className="flex items-center gap-1.5 text-[11px] text-paper-400 mb-2">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-paper-300">/</span>}
          {item.href ? (
            <button
              onClick={() => router.push(item.href!)}
              className="hover:text-green-600 transition-colors"
            >
              {item.label}
            </button>
          ) : (
            <span className="text-paper-600 font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </div>
  )
}
