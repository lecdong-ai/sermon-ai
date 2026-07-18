import { Badge } from '@/components/ui/badge'
import type { Season } from '@/types'

const seasonLabels: Record<Season, string> = {
  대림: '대림',
  성탄: '성탄',
  사순: '사순',
  부활: '부활',
  연중: '연중',
}

export function SeasonBadge({ season }: { season: Season }) {
  return <Badge variant="season">{seasonLabels[season] || season}</Badge>
}
