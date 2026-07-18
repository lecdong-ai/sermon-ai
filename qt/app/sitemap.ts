import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://qt.bunker.ai.kr'

  const staticPages = [
    { url: baseUrl, changeFrequency: 'weekly' as const, priority: 1.0 },
    { url: `${baseUrl}/qt`, changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: `${baseUrl}/templates`, changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${baseUrl}/curation`, changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${baseUrl}/shop`, changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${baseUrl}/shop/about`, changeFrequency: 'monthly' as const, priority: 0.4 },
    { url: `${baseUrl}/about`, changeFrequency: 'monthly' as const, priority: 0.4 },
    { url: `${baseUrl}/search`, changeFrequency: 'monthly' as const, priority: 0.3 },
  ]

  const qtSlugs = [
    'waiting-in-advent-day-1', 'psalm-1-two-ways', 'lenten-silence-day-3',
    'morning-prayer-july', 'exodus-14-crossing', 'epiphany-light',
  ]
  const templateSlugs = [
    'daily-qt-journal', 'family-worship-template', 'dawn-prayer-90days', 'small-group-study',
  ]
  const shopSlugs = [
    'advent-candle-set', 'scripture-card-set-01', 'reading-bookmark-brass', 'qt-journal-notebook',
  ]
  const curationSlugs = ['advent-waiting-journey', 'psalms-one-week', 'lenten-silence']

  const detailPages = [
    ...qtSlugs.map((slug) => ({
      url: `${baseUrl}/qt/${slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    ...templateSlugs.map((slug) => ({
      url: `${baseUrl}/templates/${slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    ...shopSlugs.map((slug) => ({
      url: `${baseUrl}/shop/${slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    })),
    ...curationSlugs.map((slug) => ({
      url: `${baseUrl}/curation/${slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ]

  return [...staticPages, ...detailPages]
}
