import { getStorageItem, setStorageItem } from '@/lib/school/storage'
import type { AdvancedProject } from './types'

const CUSTOM_PROJECTS_KEY = 'custom_projects'

export function getCustomProjects(): AdvancedProject[] {
  return getStorageItem<AdvancedProject[]>(CUSTOM_PROJECTS_KEY, [])
}

export function addCustomProject(project: AdvancedProject): void {
  const all = getCustomProjects()
  all.unshift(project)
  setStorageItem(CUSTOM_PROJECTS_KEY, all)
}

export function removeCustomProject(id: string): boolean {
  const all = getCustomProjects()
  const filtered = all.filter(p => p.id !== id)
  if (filtered.length === all.length) return false
  setStorageItem(CUSTOM_PROJECTS_KEY, filtered)
  return true
}

export function updateCustomProject(id: string, updates: Partial<AdvancedProject>): boolean {
  const all = getCustomProjects()
  const idx = all.findIndex(p => p.id === id)
  if (idx === -1) return false
  all[idx] = { ...all[idx], ...updates }
  setStorageItem(CUSTOM_PROJECTS_KEY, all)
  return true
}
