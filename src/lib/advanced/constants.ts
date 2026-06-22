import { MenuItem } from './types'

export const ADVANCED_MENUS: MenuItem[] = [
  { key: 'intro', label: '제품 소개', href: '/intro', icon: '◈', section: 'main' },
  { key: 'dashboard', label: '대시보드 홈', href: '/advanced', icon: '◈', section: 'main' },
  { key: 'projects', label: '설교 프로젝트', href: '/advanced/projects', icon: '◆', section: 'main' },
  { key: 'bible', label: '성경 연구', href: '/advanced/bible', icon: '◇', section: 'ministry' },
  { key: 'archive', label: '설교 아카이브', href: '/advanced/archive', icon: '◇', section: 'ministry' },
  { key: 'graph', label: '그래프', href: '/advanced/graph', icon: '◇', section: 'knowledge' },
  { key: 'notes', label: '노트/통찰', href: '/advanced/notes', icon: '◇', section: 'knowledge' },
  { key: 'series', label: '시리즈', href: '/advanced/series', icon: '◇', section: 'knowledge' },
  { key: 'youtube', label: '유튜브 연구소', href: '/advanced/youtube', icon: '🎬', section: 'ministry' },
  { key: 'settings', label: '설정', href: '/advanced/settings', icon: '◇', section: 'system' },
]

export const SECTION_LABELS: Record<string, string> = {
  main: '',
  ministry: '말씀 사역',
  knowledge: '지식 연결',
  system: '시스템',
}
