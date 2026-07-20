import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'

export type Generation = '초등' | '중고등' | '청년' | '장년'

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

const GENERATIONS: Generation[] = ['초등', '중고등', '청년', '장년']

export function getGenerations() {
  return GENERATIONS
}

export function getGenerationLabel(gen: Generation) {
  const labels: Record<Generation, string> = {
    '초등': '초등부',
    '중고등': '중고등부',
    '청년': '청년부',
    '장년': '장년부',
  }
  return labels[gen]
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
