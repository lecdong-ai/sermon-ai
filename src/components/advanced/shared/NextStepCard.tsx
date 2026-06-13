'use client'

import { useRouter } from 'next/navigation'

export interface NextStepAction {
  label: string
  href?: string
  onClick?: () => void
  primary?: boolean
}

export default function NextStepCard({
  title,
  description,
  actions,
}: {
  title: string
  description: string
  actions: NextStepAction[]
}) {
  const router = useRouter()

  return (
    <div className="bg-[#04060f]/60 rounded-xl border border-white/5 p-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold text-white">{title}</h4>
          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{description}</p>
          <div className="flex items-center gap-2 mt-2">
            {actions.map((action, i) => (
              <button
                key={i}
                onClick={() => {
                  if (action.onClick) action.onClick()
                  else if (action.href) router.push(action.href)
                }}
                className={
                  action.primary
                    ? 'text-[11px] bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-3 py-1.5 rounded-xl transition-colors'
                    : 'text-[11px] text-slate-400 hover:text-indigo-400 font-medium px-3 py-1.5 rounded-xl hover:bg-indigo-500/10 transition-colors border border-white/5'
                }
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
