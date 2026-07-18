import type { Season, ImageData } from './common'
import type { QtPost } from './qt'
import type { Template } from './template'
import type { ShopProduct } from './shop'

export interface Curation {
  id: string
  slug: string
  title: string
  summary: string
  coverImage: ImageData
  season?: Season
  editorName?: string
  publishedAt: string
  counts: {
    qt: number
    templates: number
    shop: number
  }
}

export interface CurationDetail extends Curation {
  editorialIntro: string
  editorNote?: string
  qtPosts: QtPost[]
  templates: Template[]
  shopProducts: Array<{
    product: ShopProduct
    reason: string
  }>
  relatedCurations: Curation[]
}

export { type QtPost, type Template, type ShopProduct }
