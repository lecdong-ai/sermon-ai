import type { ProjectStatus } from './types'

export const STATUS_DOT: Record<ProjectStatus, string> = {
  research: 'bg-teal-500',
  prepare: 'bg-amber-500',
  writing: 'bg-green-500',
  review: 'bg-blue-500',
  completed: 'bg-paper-400',
  archived: 'bg-paper-400',
}

export const STATUS_BADGE: Record<ProjectStatus, string> = {
  research: 'adv-badge-research',
  prepare: 'adv-badge-prepare',
  writing: 'adv-badge-writing',
  review: 'adv-badge-prepare',
  completed: 'adv-badge-completed',
  archived: 'adv-badge-completed',
}
