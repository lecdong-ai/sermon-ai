import { STATUS_BADGE, STATUS_DOT } from '@/lib/school/project/statusStyles'
import { PROJECT_STATUS_LABELS } from '@/lib/school/project/types'
import type { ProjectStatus } from '@/lib/school/project/types'

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span className={`adv-badge ${STATUS_BADGE[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[status]} mr-1.5 inline-block`} />
      {PROJECT_STATUS_LABELS[status]}
    </span>
  )
}
