import type { PendingLinkSnapshot } from './qtPdfGen'

const DB_NAME = 'diary-master-store'
const DB_VERSION = 2
const MONTH_STORE = 'months'
const BLOB_STORE = 'blobs'
const META_STORE = 'meta'

export interface MonthlyDiaryRecord {
  id: string
  year: number
  month: number
  pdfBlob: Blob
  pageCount: number
  pageTargetMap: Record<string, number>
  pendingLinks: PendingLinkSnapshot[]
  createdAt: string
  settingsKey: string
}

export type MonthlyDiaryMeta = Omit<MonthlyDiaryRecord, 'pdfBlob'>

export interface DiaryJobMeta {
  id: 'job'
  settingsKey: string
  sizeOption: string
  selectedPages: Record<string, boolean>
  categoryFilter: string
  themeId: string
  updatedAt: string
}

export function monthRecordId(year: number, month: number): string {
  return `month-${year}-${month}`
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('이 브라우저에서는 IndexedDB를 사용할 수 없습니다.'))
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(MONTH_STORE)) {
        db.createObjectStore(MONTH_STORE, { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains(BLOB_STORE)) {
        db.createObjectStore(BLOB_STORE, { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE, { keyPath: 'id' })
      }

      // v1 → v2 마이그레이션: 월별 기록의 인라인 pdfBlob을 별도 스토어로 분리한다.
      const tx = request.transaction
      if (tx && db.objectStoreNames.contains(MONTH_STORE) && db.objectStoreNames.contains(BLOB_STORE)) {
        const monthStore = tx.objectStore(MONTH_STORE)
        const blobStore = tx.objectStore(BLOB_STORE)
        const cursorReq = monthStore.openCursor()
        cursorReq.onsuccess = () => {
          const cursor = cursorReq.result
          if (!cursor) return
          const record = cursor.value as MonthlyDiaryRecord
          if (record.pdfBlob) {
            blobStore.put({ id: record.id, pdfBlob: record.pdfBlob })
            const meta: MonthlyDiaryMeta = { ...record }
            delete (meta as Partial<MonthlyDiaryRecord>).pdfBlob
            cursor.update(meta)
          }
          cursor.continue()
        }
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function closeOnComplete(db: IDBDatabase, tx: IDBTransaction, resolve: () => void, reject: (error: unknown) => void) {
  tx.oncomplete = () => { db.close(); resolve() }
  tx.onerror = () => { db.close(); reject(tx.error) }
  tx.onabort = () => { db.close(); reject(tx.error || new Error('IndexedDB 작업이 중단되었습니다.')) }
}

export async function saveMonthlyDiary(record: MonthlyDiaryRecord): Promise<void> {
  const { pdfBlob, ...meta } = record
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction([MONTH_STORE, BLOB_STORE], 'readwrite')
    tx.objectStore(MONTH_STORE).put(meta)
    tx.objectStore(BLOB_STORE).put({ id: record.id, pdfBlob })
    closeOnComplete(db, tx, resolve, reject)
  })
}

export async function loadMonthlyDiary(id: string): Promise<MonthlyDiaryRecord | null> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction([MONTH_STORE, BLOB_STORE], 'readonly')
    const monthReq = tx.objectStore(MONTH_STORE).get(id)
    const blobReq = tx.objectStore(BLOB_STORE).get(id)
    let monthRecord: MonthlyDiaryMeta | undefined
    let blobRecord: { id: string; pdfBlob: Blob } | undefined
    monthReq.onsuccess = () => { monthRecord = monthReq.result as MonthlyDiaryMeta | undefined }
    blobReq.onsuccess = () => { blobRecord = blobReq.result as { id: string; pdfBlob: Blob } | undefined }
    tx.oncomplete = () => {
      db.close()
      if (!monthRecord) {
        resolve(null)
        return
      }
      resolve({ ...monthRecord, pdfBlob: blobRecord?.pdfBlob ?? new Blob([]) })
    }
    tx.onerror = () => { db.close(); reject(tx.error) }
  })
}

export async function listMonthlyDiaryMeta(): Promise<MonthlyDiaryMeta[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(MONTH_STORE, 'readonly')
    const request = tx.objectStore(MONTH_STORE).getAll()
    request.onsuccess = () => {
      const records = (request.result as MonthlyDiaryMeta[]).sort((a, b) =>
        a.year - b.year || a.month - b.month,
      )
      resolve(records)
    }
    request.onerror = () => reject(request.error)
    tx.oncomplete = () => db.close()
    tx.onerror = () => { db.close(); reject(tx.error) }
  })
}

export async function listMonthlyDiaries(): Promise<MonthlyDiaryRecord[]> {
  const metas = await listMonthlyDiaryMeta()
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(BLOB_STORE, 'readonly')
    const request = tx.objectStore(BLOB_STORE).getAll()
    request.onsuccess = () => {
      const blobs = new Map((request.result as { id: string; pdfBlob: Blob }[]).map((b) => [b.id, b.pdfBlob]))
      resolve(metas.map((meta) => ({ ...meta, pdfBlob: blobs.get(meta.id) ?? new Blob([]) })))
    }
    request.onerror = () => reject(request.error)
    tx.oncomplete = () => db.close()
    tx.onerror = () => { db.close(); reject(tx.error) }
  })
}

export async function deleteMonthlyDiary(id: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction([MONTH_STORE, BLOB_STORE], 'readwrite')
    tx.objectStore(MONTH_STORE).delete(id)
    tx.objectStore(BLOB_STORE).delete(id)
    closeOnComplete(db, tx, resolve, reject)
  })
}

export async function clearMonthlyDiaries(): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction([MONTH_STORE, BLOB_STORE], 'readwrite')
    tx.objectStore(MONTH_STORE).clear()
    tx.objectStore(BLOB_STORE).clear()
    closeOnComplete(db, tx, resolve, reject)
  })
}

export async function loadDiaryJobMeta(): Promise<DiaryJobMeta | null> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(META_STORE, 'readonly')
    const request = tx.objectStore(META_STORE).get('job')
    request.onsuccess = () => resolve((request.result as DiaryJobMeta | undefined) || null)
    request.onerror = () => reject(request.error)
    tx.oncomplete = () => db.close()
    tx.onerror = () => { db.close(); reject(tx.error) }
  })
}

export async function saveDiaryJobMeta(meta: DiaryJobMeta): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(META_STORE, 'readwrite')
    tx.objectStore(META_STORE).put(meta)
    closeOnComplete(db, tx, resolve, reject)
  })
}

export function makeDiarySettingsKey(input: {
  sizeOption: string
  selectedPages: Record<string, boolean>
  categoryFilter: string
  themeId: string
}): string {
  return JSON.stringify({
    renderProfileVersion: 3,
    sizeOption: input.sizeOption,
    selectedPages: Object.keys(input.selectedPages).sort().reduce<Record<string, boolean>>((result, key) => {
      result[key] = Boolean(input.selectedPages[key])
      return result
    }, {}),
    categoryFilter: input.categoryFilter,
    themeId: input.themeId,
  })
}
