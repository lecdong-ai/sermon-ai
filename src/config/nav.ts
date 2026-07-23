export const mainNav = [
  { label: '홈', href: '/qt' },
  { label: '큐티', href: '/qt' },
  { label: 'QT 모음', href: '/qt/published' },
  { label: '템플릿', href: '/qt/templates' },
  { label: '후원 스토어', href: '/qt/shop' },
  { label: '소개', href: '/qt/about' },
]

export const mobileTabNav = [
  { label: '홈', href: '/qt', icon: 'Home' },
  { label: '큐티', href: '/qt', icon: 'BookOpen' },
  { label: '템플릿', href: '/qt/templates', icon: 'Layout' },
  { label: '검색', href: '/search', icon: 'Search' },
  { label: '후원 스토어', href: '/qt/shop', icon: 'Heart' },
]

export const seasons = [
  { slug: '대림', name: '대림' },
  { slug: '성탄', name: '성탄' },
  { slug: '사순', name: '사순' },
  { slug: '부활', name: '부활' },
  { slug: '연중', name: '연중' },
] as const
