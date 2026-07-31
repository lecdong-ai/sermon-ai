import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase'

export type Generation = '중고등' | '청년' | '장년'

export interface GenerationalQtFile {
  name: string
  url: string
  type: string
  size: number
}

export interface GenerationalQtItem {
  id: string
  generation: Generation
  title: string
  description: string
  bible_passage: string
  week_label: string
  files: GenerationalQtFile[]
  created_at: string
  updated_at: string
}

const GENERATIONS: Generation[] = ['중고등', '청년', '장년']

// Storage 객체 경로용 ASCII 세대 키 (한글 경로는 Signed URL 서명 불일치 유발)
const GENERATION_PATH_KEYS: Record<Generation, string> = {
  '중고등': 'youth',
  '청년': 'young',
  '장년': 'adult',
}

export function getGenerationPathKey(gen: string): string {
  return GENERATION_PATH_KEYS[gen as Generation] || 'common'
}

// 파일명에서 비-ASCII 문자를 제거하여 Storage 경로에 안전한 이름 생성
// (표시용 원본 이름은 DB files[].name에 별도 저장됨)
export function toAsciiSafeName(fileName: string): string {
  const withoutExt = fileName.replace(/\.[^.]+$/, '')
  const ext = fileName.match(/\.[^.]+$/)?.[0] || ''
  const asciiName = withoutExt
    .normalize('NFC')
    .replace(/[^\x00-\x7F]/g, '_')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
  return `${asciiName || 'file'}${ext}`
}

export function getGenerations() {
  return GENERATIONS
}

export function getGenerationLabel(gen: Generation) {
  const labels: Record<Generation, string> = {
    '중고등': '중고등부',
    '청년': '청년부',
    '장년': '장년부',
  }
  return labels[gen] || gen
}

export async function getGenerationalQts(generation?: Generation): Promise<GenerationalQtItem[]> {
  let query = supabase
    .from('generational_qt')
    .select('*')
    .order('created_at', { ascending: false })

  if (generation) {
    query = query.eq('generation', generation)
  }

  const { data, error } = await query

  if (error) {
    console.error('Failed to fetch generational QTs:', error)
    return []
  }

  return (data || []) as GenerationalQtItem[]
}

export async function getGenerationalQt(id: string): Promise<GenerationalQtItem | null> {
  const { data, error } = await supabase
    .from('generational_qt')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    console.error('Failed to fetch generational QT:', error)
    return null
  }

  return data as GenerationalQtItem
}

export async function getLatestGenerationalQts(limit = 4): Promise<GenerationalQtItem[]> {
  const { data, error } = await supabase
    .from('generational_qt')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Failed to fetch latest generational QTs:', error)
    return []
  }

  return (data || []) as GenerationalQtItem[]
}

export function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}
