import type { ImageData } from './common'

export type TemplateCategory =
  | '묵상기록'
  | '가정묵상'
  | '새벽기도'
  | '소그룹'
  | '일기'

export interface Template {
  id: string
  slug: string
  title: string
  description: string
  previewImage: ImageData
  category: TemplateCategory
  notionDuplicateUrl: string
  isFree: true
  publishedAt: string
  updatedAt: string
  downloadCount?: number
}

export interface TemplateDetail extends Template {
  galleryImages: ImageData[]
  usageSteps: Array<{
    order: number
    title: string
    description: string
  }>
  includedSections: string[]
  recommendedTemplates: Template[]
  relatedQt?: Array<{
    slug: string
    title: string
    excerpt: string
  }>
}
