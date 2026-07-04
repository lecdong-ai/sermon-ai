/**
 * Unified project-scoped localStorage reader.
 * All per-project data (prep, manuscript, study handoff, quickfill) is read
 * with a single function call, reducing 5 separate getStorageItem calls to 1.
 *
 * Read-only in this version (C2-read). Write migration (C2-write) will follow.
 */

import { getStorageItem } from '@/lib/storage'

/**
 * All per-project localStorage data bundled into one shape.
 * Every field is optional; missing data resolves to `undefined` (caller falls back).
 */
export interface ProjectLocalData {
  prep?: any
  manuscript?: any
  manuscriptVersions?: any
  quickfill?: any
}

const KEY_PREFIX = {
  prep: (id: string) => `prep_${id}`,
  manuscript: (id: string) => `manuscript_${id}`,
  manuscriptVersions: (id: string) => `manuscript_${id}_versions`,
  quickfill: (id: string) => `quickfill_${id}`,
}

export function readProjectLocal(projectId: string): ProjectLocalData {
  if (!projectId) return {}
  return {
    prep: getStorageItem<any | null>(KEY_PREFIX.prep(projectId), null) ?? undefined,
    manuscript: getStorageItem<any | null>(KEY_PREFIX.manuscript(projectId), null) ?? undefined,
    manuscriptVersions: getStorageItem<any | null>(KEY_PREFIX.manuscriptVersions(projectId), null) ?? undefined,
    quickfill: getStorageItem<any | null>(KEY_PREFIX.quickfill(projectId), null) ?? undefined,
  }
}

/**
 * Lightweight helper: only read prep + manuscript (the two most common pair).
 * Avoids the full key read for callers that only need these.
 */
export function readProjectCore(projectId: string): {
  prep?: any
  manuscript?: any
} {
  if (!projectId) return {}
  return {
    prep: getStorageItem<any | null>(KEY_PREFIX.prep(projectId), null) ?? undefined,
    manuscript: getStorageItem<any | null>(KEY_PREFIX.manuscript(projectId), null) ?? undefined,
  }
}
