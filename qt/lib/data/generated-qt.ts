import { supabase } from '@/lib/supabase'

export interface PublishedQtItem {
  id: string
  title: string | null
  subtitle: string | null
  bible_book: string
  week_number: number
  excerpt: string | null
  series_name: string
  start_passage: string | null
  end_passage: string | null
  created_at: string
}

export interface PublishedQtDay {
  dayName: string
  passage: string
  title: string
  focus: string
  finalContent: string
}

export interface PublishedQtDetail extends PublishedQtItem {
  full_manuscript: string
  day_data: PublishedQtDay[]
  audience: string
  level: string
  tone: string
  size_option: string
  design_template: string
}

export async function getPublishedQts({ limit = 20, page = 1 }: { limit?: number; page?: number } = {}) {
  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error, count } = await supabase
    .from('qt_history')
    .select('id, title, subtitle, bible_book, week_number, excerpt, series_name, start_passage, end_passage, created_at', { count: 'exact' })
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('Published QT fetch error:', error)
    return { items: [] as PublishedQtItem[], total: 0 }
  }

  return {
    items: (data || []) as PublishedQtItem[],
    total: count || 0,
  }
}

export async function getPublishedQt(id: string): Promise<PublishedQtDetail | null> {
  const { data, error } = await supabase
    .from('qt_history')
    .select('*')
    .eq('id', id)
    .eq('is_published', true)
    .single()

  if (error || !data) {
    console.error('Published QT detail fetch error:', error)
    return null
  }

  return data as unknown as PublishedQtDetail
}

export async function getLatestPublishedQts(limit = 3) {
  return getPublishedQts({ limit, page: 1 })
}
