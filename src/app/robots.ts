import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/auth/', '/workspace/', '/share/', '/study-guide/', '/dashboard/', '/mypage/'],
    },
    sitemap: 'https://sermonai.app/sitemap.xml',
  }
}