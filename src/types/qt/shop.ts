import type { ImageData, SupportMessage } from './common'
import type { QtPost } from './qt'

export type ShopCategory = '문구' | '굿즈' | '독서용품'

export interface ShopProduct {
  id: string
  slug: string
  name: string
  shortDescription: string
  thumbnail: ImageData
  category: ShopCategory
  price: number
  externalStoreUrl?: string
  isFree: false
  story?: string
  publishedAt: string
  salesCount?: number
}

export interface ShopProductDetail extends ShopProduct {
  galleryImages: ImageData[]
  story: string
  specs: Array<{ label: string; value: string }>
  purchaseUrl: string
  supportMessage: SupportMessage
  relatedProducts: ShopProduct[]
  relatedQt?: QtPost[]
}
