'use client'

import { useRouter } from 'next/navigation'

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
}: {
  icon: string
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
}) {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="text-3xl mb-3">{icon}</span>
      <h3 className="text-sm font-bold text-slate-200">{title}</h3>
      <p className="text-xs text-slate-500 mt-1 max-w-sm leading-relaxed">{description}</p>
      {actionLabel && actionHref && (
        <button
          onClick={() => router.push(actionHref)}
          className="mt-4 text-[11px] bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-xl transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
