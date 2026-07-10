'use client'

import { useRouter } from 'next/navigation'

export default function QuietAction({
  label, href, onClick, icon,
}: {
  label: string
  href?: string
  onClick?: () => void
  icon?: string
}) {
  const router = useRouter()
  return (
    <button
      onClick={() => { if (onClick) onClick(); else if (href) router.push(href) }}
      className="w-full text-left text-[11px] text-paper-500 hover:text-green-600 px-3 py-2 rounded-lg hover:bg-green-50/40 transition-colors flex items-center gap-2"
    >
      {icon && <span className="text-[12px]">{icon}</span>}
      <span>{label}</span>
    </button>
  )
}
