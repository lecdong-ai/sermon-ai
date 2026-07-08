'use client'

export type SyncField = 'manuscriptData' | 'prepData' | 'studyMemos' | 'quickfill'

export type SyncStatus = 'saved' | 'saving' | 'unsaved' | 'offline'

const syncStatusMap = new Map<string, SyncStatus>()
const statusSubscribers = new Set<(projectId: string, field: SyncField, status: SyncStatus) => void>()

function getKey(projectId: string, field: SyncField): string {
  return `${projectId}_${field}`
}

export function getLocalKey(projectId: string, field: SyncField): string {
  const keyMap: Record<SyncField, string> = {
    manuscriptData: `manuscript_${projectId}`,
    prepData: `prep_${projectId}`,
    studyMemos: `study_memos_${projectId}`,
    quickfill: `quickfill_${projectId}`,
  }
  return keyMap[field]
}

export function subscribeSyncStatus(
  callback: (projectId: string, field: SyncField, status: SyncStatus) => void
): () => void {
  statusSubscribers.add(callback)
  return () => statusSubscribers.delete(callback)
}

function notify(projectId: string, field: SyncField, status: SyncStatus) {
  syncStatusMap.set(getKey(projectId, field), status)
  statusSubscribers.forEach(cb => cb(projectId, field, status))
}

const retryQueue: Array<{ projectId: string; field: SyncField; data: any }> = []

let isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    isOnline = true
    flushRetryQueue()
  })
  window.addEventListener('offline', () => {
    isOnline = false
  })
}

export async function syncToSupabase<T>(
  projectId: string,
  field: SyncField,
  data: T,
): Promise<boolean> {
  if (!isOnline) {
    notify(projectId, field, 'offline')
    return false
  }

  notify(projectId, field, 'saving')
  try {
    const res = await fetch(`/api/sermons/${projectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ result: { [field]: data } }),
    })
    if (!res.ok) {
      const json = await res.json().catch(() => ({ error: '네트워크 오류' }))
      throw new Error(json.error || `저장 실패 (${res.status})`)
    }
    notify(projectId, field, 'saved')
    return true
  } catch (err: any) {
    notify(projectId, field, 'unsaved')
    throw err
  }
}

export function queueRetry(projectId: string, field: SyncField, data: any): void {
  const existing = retryQueue.findIndex(
    item => item.projectId === projectId && item.field === field
  )
  if (existing >= 0) retryQueue[existing] = { projectId, field, data }
  else retryQueue.push({ projectId, field, data })
}

export async function flushRetryQueue(): Promise<void> {
  if (!isOnline || retryQueue.length === 0) return
  const items = [...retryQueue]
  retryQueue.length = 0
  for (const item of items) {
    try {
      await syncToSupabase(item.projectId, item.field, item.data)
    } catch {
      retryQueue.push(item)
    }
  }
}
