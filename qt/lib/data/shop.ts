import type { ShopProduct, ShopProductDetail, ShopCategory } from '@/types'
import listRaw from '@/lib/data-source/mock/shop.json'
import detailRaw from '@/lib/data-source/mock/shop-detail.json'
import qtRaw from '@/lib/data-source/mock/qt.json'

const allProducts: ShopProduct[] = listRaw.items as ShopProduct[]
const allQtPosts = qtRaw.items as Array<{ slug: string; title: string; excerpt: string }>

interface MockShopDetail {
  slug: string
  galleryImages: ShopProductDetail['galleryImages']
  story: string
  specs: ShopProductDetail['specs']
  purchaseUrl: string
  supportMessage: ShopProductDetail['supportMessage']
  relatedProducts: string[]
  relatedQt: string[]
}

const detailMap = new Map(
  (detailRaw.items as MockShopDetail[]).map((d) => [d.slug, d])
)

export async function getShopProducts(params?: {
  category?: ShopCategory
  limit?: number
}): Promise<ShopProduct[]> {
  let result = [...allProducts]
  if (params?.category) {
    result = result.filter((p) => p.category === params.category)
  }
  if (params?.limit) result = result.slice(0, params.limit)
  return result
}

export async function getShopProduct(
  slug: string
): Promise<ShopProduct | undefined> {
  return allProducts.find((p) => p.slug === slug)
}

export async function getShopProductDetail(
  slug: string
): Promise<ShopProductDetail | undefined> {
  const product = allProducts.find((p) => p.slug === slug)
  if (!product) return undefined

  const detail = detailMap.get(slug)

  // Related products
  const relatedSlugs = detail?.relatedProducts ?? []
  const relatedProducts = allProducts.filter((p) =>
    relatedSlugs.includes(p.slug)
  )

  // Related QT posts — match by tag/season or by explicit slug list
  const qtSlugs = detail?.relatedQt ?? []
  const relatedQt = qtSlugs
    .map((s) => allQtPosts.find((q) => q.slug === s))
    .filter(Boolean) as ShopProductDetail['relatedQt']

  return {
    ...product,
    galleryImages: detail?.galleryImages ?? [product.thumbnail],
    story: detail?.story ?? product.story ?? '',
    specs: detail?.specs ?? [],
    purchaseUrl: detail?.purchaseUrl ?? product.externalStoreUrl ?? '',
    supportMessage: detail?.supportMessage ?? {
      slogan: '쇼핑이 후원입니다',
      description: '이 구매는 무료 자료의 운영과 제작에 사용됩니다.',
      detailLink: '/shop/about',
    },
    relatedProducts,
    relatedQt: relatedQt && relatedQt.length > 0 ? relatedQt : undefined,
  }
}

export async function getShopProductSlugs(): Promise<string[]> {
  return allProducts.map((p) => p.slug)
}
