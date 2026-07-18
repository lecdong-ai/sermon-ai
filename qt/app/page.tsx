import { getQtPosts, getLatestQt } from '@/lib/data/qt'
import { getPopularTemplates } from '@/lib/data/template'
import { getCurations } from '@/lib/data/curation'
import { getShopProducts } from '@/lib/data/shop'

import { HeroSection } from '@/components/home/HeroSection'
import { TodayQt } from '@/components/home/TodayQt'
import { PopularTemplates } from '@/components/home/PopularTemplates'
import { TopicExplorer } from '@/components/home/TopicExplorer'
import { CurationSection } from '@/components/home/CurationSection'
import { ShopBanner } from '@/components/home/ShopBanner'
import { LatestContent } from '@/components/home/LatestContent'
import { NewsletterSection } from '@/components/home/NewsletterSection'

export default async function HomePage() {
  const [{ posts: latestPosts }, latestQt, templates, curations, shopProducts] =
    await Promise.all([
      getQtPosts({ pageSize: 3 }),
      getLatestQt(),
      getPopularTemplates(4),
      getCurations({ limit: 3 }),
      getShopProducts({ limit: 3 }),
    ])

  return (
    <>
      <HeroSection />
      <TodayQt posts={latestQt ? [latestQt] : []} />
      <PopularTemplates templates={templates} />
      <TopicExplorer />
      <CurationSection curations={curations} />
      <ShopBanner />
      <LatestContent posts={latestPosts} />
      <NewsletterSection />
    </>
  )
}
