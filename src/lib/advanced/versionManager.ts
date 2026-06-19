import { getStorageItem, setStorageItem } from '@/lib/storage'
import type { JohnManuscriptData } from '@/lib/advanced/johnManuscriptData'

export interface ManuscriptVersion {
  id: string
  timestamp: number
  label: string
  note: string
  data: JohnManuscriptData
}

const MAX_VERSIONS = 20

export function getVersions(projectId: string): ManuscriptVersion[] {
  return getStorageItem<ManuscriptVersion[]>(`manuscript_${projectId}_versions`, [])
}

export function saveVersion(projectId: string, manuscript: JohnManuscriptData, note: string = ''): ManuscriptVersion {
  const versions = getVersions(projectId)
  const newVersion: ManuscriptVersion = {
    id: `v${Date.now()}`,
    timestamp: Date.now(),
    label: `v${versions.length + 1}`,
    note,
    data: JSON.parse(JSON.stringify(manuscript)), // Deep clone
  }
  const updated = [newVersion, ...versions].slice(0, MAX_VERSIONS)
  setStorageItem(`manuscript_${projectId}_versions`, updated)
  return newVersion
}

export function restoreVersion(projectId: string, versionId: string): JohnManuscriptData | null {
  const versions = getVersions(projectId)
  const version = versions.find(v => v.id === versionId)
  if (!version) return null
  return version.data
}

export function deleteVersion(projectId: string, versionId: string): boolean {
  const versions = getVersions(projectId)
  const updated = versions.filter(v => v.id !== versionId)
  if (updated.length === versions.length) return false
  setStorageItem(`manuscript_${projectId}_versions`, updated)
  return true
}

// Simple word-level diff
export function computeDiff(oldText: string, newText: string): { added: string[]; removed: string[]; same: string[] } {
  const oldWords = oldText.split(/(\s+)/)
  const newWords = newText.split(/(\s+)/)
  const added: string[] = []
  const removed: string[] = []
  const same: string[] = []

  let i = 0, j = 0
  while (i < oldWords.length || j < newWords.length) {
    if (i >= oldWords.length) {
      added.push(...newWords.slice(j))
      break
    }
    if (j >= newWords.length) {
      removed.push(...oldWords.slice(i))
      break
    }
    if (oldWords[i] === newWords[j]) {
      same.push(oldWords[i])
      i++
      j++
    } else {
      // Find if oldWord exists later in newWords
      let found = false
      for (let k = j + 1; k < Math.min(j + 10, newWords.length); k++) {
        if (oldWords[i] === newWords[k]) {
          added.push(...newWords.slice(j, k))
          same.push(oldWords[i])
          j = k + 1
          i++
          found = true
          break
        }
      }
      if (!found) {
        removed.push(oldWords[i])
        i++
      }
    }
  }
  return { added, removed, same }
}
