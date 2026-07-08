'use client'

import { useEffect, useRef } from 'react'
import { getStorageItem } from '@/lib/storage'
import { syncToSupabase, type SyncField } from './projectSync'

const MIGRATION_KEY = '_migration_v1_done'

interface MigrationResult {
  migrated: number
  errors: number
}

interface ProjectDataCheck {
  id: string
  field: SyncField
  storageKey: string
}

function getDataChecks(projectIds: string[]): ProjectDataCheck[] {
  const checks: ProjectDataCheck[] = []
  for (const id of projectIds) {
    const fields: [SyncField, string][] = [
      ['manuscriptData', `manuscript_${id}`],
      ['prepData', `prep_${id}`],
      ['studyMemos', `study_memos_${id}`],
    ]
    for (const [field, key] of fields) {
      checks.push({ id, field, storageKey: key })
    }
  }
  return checks
}

export function useProjectMigration(projectIds: string[]): MigrationResult {
  const ranRef = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (ranRef.current) return
    if (localStorage.getItem(MIGRATION_KEY)) return
    if (projectIds.length === 0) return

    ranRef.current = true
    let migrated = 0
    let errors = 0

    const checks = getDataChecks(projectIds)

    for (const check of checks) {
      try {
        const raw = localStorage.getItem(check.storageKey)
        if (!raw) continue
        const data = JSON.parse(raw)
        const localSavedAt = data._savedAt ?? 0

        // If local has data, push to Supabase
        syncToSupabase(check.id, check.field, data)
          .then(() => { migrated++ })
          .catch(() => { errors++ })
      } catch {
        errors++
      }
    }

    localStorage.setItem(MIGRATION_KEY, 'true')
  }, [projectIds])

  return { migrated: 0, errors: 0 }
}
