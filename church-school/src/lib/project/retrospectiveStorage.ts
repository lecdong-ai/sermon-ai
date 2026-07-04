import { getStorageItem, setStorageItem } from '@/lib/storage'

export interface VersionReflection {
  versionId: string
  note: string
  updatedAt: number
}

export interface SermonFeedback {
  versionId?: string
  date: string
  rating: number
  memo: string
  createdAt: number
}

export function getReflections(projectId: string): VersionReflection[] {
  return getStorageItem<VersionReflection[]>(`reflection_${projectId}`, [])
}

export function setReflection(projectId: string, versionId: string, note: string): void {
  const all = getReflections(projectId)
  const idx = all.findIndex(r => r.versionId === versionId)
  const next: VersionReflection = { versionId, note, updatedAt: Date.now() }
  if (idx >= 0) all[idx] = next
  else all.push(next)
  setStorageItem(`reflection_${projectId}`, all)
}

export function getFeedbackList(projectId: string): SermonFeedback[] {
  return getStorageItem<SermonFeedback[]>(`feedback_${projectId}`, [])
}

export function addFeedback(projectId: string, fb: Omit<SermonFeedback, 'createdAt'>): void {
  const all = getFeedbackList(projectId)
  all.unshift({ ...fb, createdAt: Date.now() })
  setStorageItem(`feedback_${projectId}`, all.slice(0, 50))
}

export function deleteFeedback(projectId: string, index: number): void {
  const all = getFeedbackList(projectId)
  all.splice(index, 1)
  setStorageItem(`feedback_${projectId}`, all)
}

export function extractKeywords(text: string, limit: number = 8): string[] {
  if (!text) return []
  const stop = new Set([
    '그리고', '그러나', '하지만', '그래서', '그렇습니다', '있는', '없는', '이런', '저런',
    '우리', '오늘', '이번', '통해', '위해', '함께', '통하여', '보이는', '들은', '하는',
    '되었습니다', '것입니다', '것이', '때문', '때문에', '이제', '다시', '바로',
    '하나님', '말씀', '주님', '예수', '그리스도', '성도', '성경',
    'the', 'and', 'that', 'this', 'with', 'for', 'are', 'was', 'were', 'have', 'has',
  ])
  const words = text.match(/[가-힣]{2,}/g) || []
  const freq: Record<string, number> = {}
  for (const w of words) {
    if (stop.has(w)) continue
    freq[w] = (freq[w] || 0) + 1
  }
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([w]) => w)
}
