export type Season = '대림' | '성탄' | '사순' | '부활' | '연중'

export interface Tag {
  id: string
  slug: string
  name: string
}

export interface Series {
  id: string
  slug: string
  title: string
  description?: string
}

export interface ImageData {
  src: string
  alt: string
  width?: number
  height?: number
}

export interface PaginationMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface Paginated<T> {
  items: T[]
  pagination: PaginationMeta
}

export interface SupportMessage {
  slogan: string
  description: string
  detailLink?: string
}
