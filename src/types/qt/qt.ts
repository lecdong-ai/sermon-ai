import type { Season, Tag, Series, ImageData } from './common'

export interface QtPost {
  id: string
  slug: string
  title: string
  excerpt: string
  thumbnail?: ImageData
  season: Season
  series?: Pick<Series, 'id' | 'slug' | 'title'>
  bibleRange?: string
  tags: Tag[]
  publishedAt: string
  isFree: true
  readTime?: number
  viewCount?: number
}

export interface QtPostDetail extends QtPost {
  content: string
  bibleText?: string
  keyVerse?: string
  downloads: { pdf?: string; text?: string }
  series?: Series & {
    posts: Array<{
      slug: string
      title: string
      order: number
      publishedAt: string
    }>
  }
  relatedQt: QtPost[]
  relatedCuration: Array<{
    id: string
    slug: string
    title: string
    coverImage: string
    summary: string
  }>
  relatedShop?: {
    slug: string
    name: string
    thumbnail: string
    price: number
  }
}

export interface QtQueryParams {
  season?: Season
  tag?: string
  sort?: 'latest' | 'popular'
  search?: string
  page?: number
  pageSize?: number
}
