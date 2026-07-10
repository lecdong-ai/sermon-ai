import type { ProjectStatus } from '@/lib/school/project/types'
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_ORDER } from '@/lib/school/project/types'

export default function StatusTimeline({
  currentStatus,
}: {
  currentStatus: ProjectStatus
}) {
  const currentIdx = PROJECT_STATUS_ORDER.indexOf(currentStatus)

  return (
    <div className="flex items-center gap-0">
      {PROJECT_STATUS_ORDER.map((status, i) => {
        const isReached = i <= currentIdx
        const isCurrent = i === currentIdx
        return (
          <div key={status} className="flex items-center flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-full shrink-0 transition-all ${
                isCurrent
                  ? 'bg-indigo-600 ring-2 ring-indigo-500/30'
                  : isReached
                    ? 'bg-indigo-400'
                    : 'bg-white/5'
              }`} />
              <span className={`text-[9px] whitespace-nowrap ${
                isCurrent ? 'text-white font-medium' :
                isReached ? 'text-slate-400' : 'text-slate-600'
              }`}>
                {PROJECT_STATUS_LABELS[status]}
              </span>
            </div>
            {i < PROJECT_STATUS_ORDER.length - 1 && (
              <div className={`flex-1 h-px mx-1 ${i < currentIdx ? 'bg-indigo-400' : 'bg-white/5'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
