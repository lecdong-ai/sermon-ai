# 확장 가이드 — Mock to Production

## 목차
1. [데이터 분리 전략](#1-데이터-분리-전략)
2. [ID/Slug 기반 참조 구조](#2-idslug-기반-참조-구조)
3. [서버/클라이언트 컴포넌트 분리 원칙](#3-서버클라이언트-컴포넌트-분리-원칙)
4. [검색/필터 고도화 방향](#4-검색필터-고도화-방향)
5. [관리자 업로드 구조](#5-관리자-업로드-구조)
6. [이미지 자산 관리](#6-이미지-자산-관리)
7. [SEO 구조](#7-seo-구조)
8. [추후 추가 가능 기능](#8-추후-추가-가능-기능)

---

## 1. 데이터 분리 전략

### 계층 구조

```
lib/data-source/           ← 현재: mock JSON
  ├── mock/                ← 삭제하지 않고 fallback으로 유지
  │   ├── qt.json
  │   ├── qt-detail.json
  │   ├── templates.json
  │   ├── templates-detail.json
  │   ├── shop.json
  │   ├── shop-detail.json
  │   └── curations.json
  ├── supabase/            ← 추가 예정
  │   ├── qt.ts
  │   ├── template.ts
  │   ├── shop.ts
  │   └── curation.ts
  └── cms/                 ← 또는 추가 예정
      └── index.ts
```

### 전환 규칙

- `lib/data/{domain}.ts`는 **인터페이스를 절대 변경하지 않음**
- 현재: `import listRaw from '@/lib/data-source/mock/{domain}.json'`
- Supabase 전환 시: `import { supabase } from '@/lib/supabase/client'`
- 환경변수로 소스 선택:
  ```ts
  // lib/data-source/index.ts
  export const dataSource = process.env.DATA_SOURCE ?? 'mock'
  ```
- 각 함수는 내부 구현만 교체 — 호출자는 변경 불필요

### Supabase 테이블 스키마 제안

```sql
-- qt_posts
create table qt_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text,
  content text,                    -- markdown
  bible_text text,
  key_verse text,
  season text references seasons(slug),
  series_id uuid references series(id),
  bible_range text,
  published_at timestamptz,
  read_time int,
  view_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- templates
create table templates (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  category text not null,
  notion_duplicate_url text not null,
  gallery_images jsonb,            -- image urls array
  usage_steps jsonb,               -- [{ order, title, description }]
  included_sections text[],
  published_at timestamptz,
  download_count int default 0
);

-- shop_products
create table shop_products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  short_description text,
  story text,
  category text not null,
  price int not null,
  purchase_url text,
  specs jsonb,                     -- [{ label, value }]
  support_message jsonb,           -- { slogan, description, detailLink }
  gallery_images jsonb,
  published_at timestamptz
);

-- relations (many-to-many)
create table qt_tags (
  qt_id uuid references qt_posts(id),
  tag_id uuid references tags(id)
);

create table related_qt (
  source_id uuid references qt_posts(id),
  target_id uuid references qt_posts(id)
);

create table shop_related_qt (
  product_id uuid references shop_products(id),
  qt_id uuid references qt_posts(id)
);
```

---

## 2. ID/Slug 기반 참조 구조

### 현재 구조 (비정규화, mock에 적합)

```ts
// types/qt.ts — 현재
export interface QtPostDetail extends QtPost {
  relatedQt: QtPost[]           // 중복 데이터 포함될 수 있음
  relatedCuration: Curation[]
}
```

### 확장 후 구조 (ID 참조 + lookup)

```ts
// types/common.ts — 추가
export interface RelationRef {
  id: string
  slug: string
  title: string
}

// lib/data/relations.ts — lookup 전용 모듈
export async function getRelatedQt(postId: string): Promise<QtPost[]>
export async function getShopRelatedQt(productId: string): Promise<QtPost[]>
export async function getSeriesPosts(seriesId: string): Promise<QtPost[]>
```

### 미리 ID 체계를 갖춰야 할 필드

| 도메인 | 참조 필드 | 현재 타입 | 확장 타입 |
|--------|-----------|-----------|-----------|
| QT → Tag | `tags` | `Tag[]` (전체 객체) | `Tag[]` 그대로 유지 (작고 자주 조회) |
| QT → Series | `series` | `Pick<Series, 'id'|'slug'|'title'>` | `seriesId: string` + lookup |
| QT → relatedQt | `relatedQt` | `QtPost[]` | `relatedQtIds: string[]` → lookup |
| QT → relatedCuration | `relatedCuration` | `Curation[]` | `relatedCurationIds: string[]` → lookup |
| QT → relatedShop | `relatedShop` | 객체 | `relatedShopId: string` → lookup |
| Template → relatedQt | `relatedQt` | `QtPost[]` | `relatedQtIds: string[]` |
| Template → recommended | `recommendedTemplates` | `Template[]` | `recommendedIds: string[]` |
| Shop → relatedQt | `relatedQt` | `QtPost[]?` | `relatedQtIds: string[]` |
| Shop → relatedProducts | `relatedProducts` | `ShopProduct[]` | `relatedProductIds: string[]` |
| Curation → 모든 참조 | 전부 | 임베드 배열 | 전부 `Id[]` |

### 전환 전략

1. **Phase 1** (현재): mock 데이터에 **참조 ID도 함께 저장** (중복)
2. **Phase 2**: `lib/data/relations.ts` 모듈 생성, lookup 함수 구현
3. **Phase 3**: detail 데이터에서 임베드 배열 제거 → ID만 남김
4. **Phase 4**: 실제 DB 마이그레이션

---

## 3. 서버/클라이언트 컴포넌트 분리 원칙

### 원칙

```
서버 컴포넌트 (기본값)
├── 데이터 fetching (직접 호출)
├── SEO (generateMetadata, generateStaticParams)
├── layout/header/footer
├── 정적 컨텐츠 렌더링
├── Map, reduce, filter 같은 무거운 처리
└── API key, secret 등 민감 정보 접근

클라이언트 컴포넌트 ('use client')
├── useState, useEffect 필요
├── onClick, onChange 등 이벤트
├── 브라우저 API 사용 (localStorage, navigator 등)
├── window resize, scroll 등
└── Router.push / useSearchParams
```

### 현재 분류 현황

| 컴포넌트 | 현 위치 | 옳은 분류 |
|----------|---------|-----------|
| `Header` | `'use client'` | ✅ useState(menu), usePathname 필요 |
| `Footer` | `서버 컴포넌트` | ✅ 정적 |
| `QtFilterBar` | `'use client'` | ✅ useRouter, useSearchParams |
| `QtCard` | `서버 컴포넌트` | ✅ Link + Image만 사용 |
| `ShopCard` | `서버 컴포넌트` | ✅ 동일 |
| `ContentCard` | `서버 컴포넌트` | ✅ 동일 |
| `ChipFilter` | `'use client'` | ✅ useRouter, useSearchParams |
| `SearchInput` | `'use client'` | ✅ useState, useRef, 이벤트 |
| `SectionHeader` | `서버 컴포넌트` | ✅ 정적 |
| `SupportBanner` | `서버 컴포넌트` | ✅ Link만 사용 |
| `EmptyState` | `서버 컴포넌트` | ✅ 정적 |
| `RecommendationSection` | `서버 컴포넌트` | ✅ 정적 |
| `RelatedContent` | `서버 컴포넌트` | ✅ 정적 |

### 확장 시 주의사항

1. **Data fetching은 서버 컴포넌트에서만**: 클라이언트는 props로 받은 데이터만 렌더링
2. **'use client' 경계**: 클라이언트 컴포넌트는 가능한 leaf에 가깝게. 부모는 서버 컴포넌트 유지
3. **Suspense 경계**: 검색/필터 결과를 Suspense로 감싸서 부분 로딩
4. **커스텀 hook 패턴**: 필터 상태/URL sync는 커스텀 hook으로 추출

```tsx
// lib/hooks/useFilterParams.ts — 미래 확장용
export function useFilterParams<T extends Record<string, string | undefined>>(
  paramDefaults: T
) {
  const searchParams = useSearchParams()
  // ... generic URL sync logic
}
```

---

## 4. 검색/필터 고도화 방향

### 현재

- 파일 내 `filter()` / `sort()` → JavaScript in-memory
- QT: season filter + text search + sort + pagination (in-memory)
- Template: category filter
- Shop: category filter

### 단계별 확장

**Phase 1 — In-memory (now)**
- 적은 데이터(수십~수백)에 적합
- `lib/data/{domain}.ts` 내부에서 처리
- 검색은 title/excerpt에 `includes()`

**Phase 2 — Supabase 쿼리**
```ts
// lib/data-source/supabase/qt.ts
export async function getQtPosts(params: QtQueryParams) {
  let query = supabase
    .from('qt_posts')
    .select('*', { count: 'exact' })

  if (params.season) query = query.eq('season', params.season)
  if (params.search) query = query.ilike('title', `%${params.search}%`)
  if (params.sort === 'popular') query = query.order('view_count', { ascending: false })
  else query = query.order('published_at', { ascending: false })

  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 12
  const from = (page - 1) * pageSize
  query = query.range(from, from + pageSize - 1)

  return query
}
```

**Phase 3 — Full-text search (PostgreSQL tsvector)**
```sql
alter table qt_posts add column search_vector tsvector
  generated always as (
    to_tsvector('korean', coalesce(title, '') || ' ' || coalesce(content, ''))
  ) stored;

create index idx_qt_search on qt_posts using gin(search_vector);
```

**Phase 4 — 외부 검색 엔진** (데이터 10만+ 건)
- Meilisearch (경량, 셀프 호스팅 가능)
- Algolia (비용 있음, 관리 불필요)

### 필터 고도화 우선순위

| 기능 | 우선순위 | 설명 |
|------|----------|------|
| 태그 필터 | P1 | QT list에서 태그로 거르기 |
| 날짜 범위 필터 | P2 | 특정 기간의 QT 모아보기 |
| 성경 책별 필터 | P2 | "창세기" 관련 QT만 |
| 가격대 필터 (shop) | P3 | min/max price |
| 복합 필터 저장/공유 | P4 | URL로 필터 상태 공유 |

---

## 5. 관리자 업로드 구조

### 최소 관리자 기능 (MVP 이후)

```
/admin
├── /qt                    ← QT CRUD
│   ├── new
│   └── [id]/edit
├── /templates
│   ├── new
│   └── [id]/edit
├── /shop
│   ├── new
│   └── [id]/edit
├── /tags
│   ├── list
│   └── merge
└── /dashboard             ← 통계
```

### 업로드 폼 필드 제안 (QT 기준)

```
필드              입력 방식
─────────────────────────────────────────
제목              text input
슬러그            auto-generate + 수정 가능
본문 (content)    markdown editor (MDX?)
절기              select (대림/성탄/사순/부활/연중)
시리즈            select (시리즈 목록에서)
성경 범위         text input
성경 본문         textarea (선택)
요절              text input (선택)
썸네일            image upload + crop
태그              multi-select (기존) + create new
관련 큐티         multi-select (검색 + 선택)
발행일            date picker
읽기 시간         auto-calculate from content length
```

### 마크다운 에디터 고려사항

- 선택지: **MDX Editor** (shadcn/ui 기반), **Plate**, **TipTap**, **ContentLayer**
- 조건: Next.js App Router 호환, 확장 가능, 파일 업로드 지원
- 추천: `plate` 또는 `@mdxeditor/editor`

### 시리즈 관리

시리즈는 별도 CRUD 필요 (QT 작성 전에 먼저 생성):

```
시리즈 필드:
- title, slug, description
- cover image (optional)
- 소속 QT 목록 (order 포함)
```

---

## 6. 이미지 자산 관리

### 현재

- `/public/images/` 에 정적 파일
- `ImageData` 타입으로 `src`, `alt`, `width`, `height` 보관

### 확장 방향

**Option A — 외부 스토리지 (추천)**
```
// .env.local
NEXT_PUBLIC_IMAGE_BASE_URL=https://storage.googleapis.com/qt-archive-images
```

```ts
// lib/utils/image.ts
export function getImageUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_IMAGE_BASE_URL ?? '/images'
  return `${base}/${path}`
}
```

- Supabase Storage / Cloudflare R2 / Google Cloud Storage
- 이미지 최적화: Next.js `<Image>`의 `remotePatterns`에 추가

**Option B — CMS 내장 미디어 라이브러리**
- Strapi, Sanity 등 CMS 사용 시 이미지가 CMS에托管
- CMS API에서 `src` 직접 반환

### 이미지 최적화 설정

```ts
// next.config.js — 확장 시 추가
remotePatterns: [
  {
    protocol: 'https',
    hostname: 'storage.googleapis.com',
    pathname: '/qt-archive-images/**',
  },
  {
    protocol: 'https',
    hostname: '**.supabase.co',
    pathname: '/storage/v1/object/public/**',
  },
],
```

### 이미지 변환 규칙

| 용도 | 권장 크기 | 포맷 | 비고 |
|------|-----------|------|------|
| QT 썸네일 | 800×1000 | WebP | 4:5 비율 |
| 템플릿 미리보기 | 1200×750 | WebP | 16:10 비율 |
| 상품 썸네일 | 800×800 | WebP | 1:1 비율 |
| 상품 갤러리 | 1200×1200 | WebP | 최대 5장 |
| 커레이션 커버 | 1200×630 | WebP | SNS 공유 대비 |

---

## 7. SEO 구조

### 현재 적용

- 각 list/detail 페이지에 `generateMetadata` → `title`, `description`
- `lib/config/site.ts`에서 사이트 기본 정보

### 확장할 항목

```ts
// app/layout.tsx — 확장 버전
export const metadata: Metadata = {
  metadataBase: new URL('https://qt-archive.org'),
  title: {
    default: siteConfig.name,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    siteName: siteConfig.name,
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
}
```

### SEO 적용 체크리스트

| 항목 | 상태 | 비고 |
|------|------|------|
| `metadataBase` | ❌ | URL 설정 필요 |
| `title.template` | ❌ | 전체 페이지에 `— 큐티 아카이브` 자동 |
| OpenGraph | ❌ | SNS 공유 필수 |
| Twitter Card | ❌ | |
| JSON-LD (BreadcrumbList) | ❌ | 검색 결과에서 breadcrumb |
| JSON-LD (Article) | ❌ | QT 상세에서 구조화된 데이터 |
| JSON-LD (Product) | ❌ | Shop 상세에서 |
| sitemap.xml | ❌ | 동적 SSG 페이지 포함 |
| robots.txt | ❌ | |
| canonical URL | ❌ | 페이지별 고유 URL |
| h1 중복 방지 | ✅ | 각 페이지 1개 h1 |
| 이미지 alt | ✅ | 데이터 모델에 포함 |

### JSON-LD 예시 (QT 상세)

```tsx
// app/qt/[slug]/page.tsx (확장)
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: post.title,
  description: post.excerpt,
  datePublished: post.publishedAt,
  author: { '@type': 'Person', name: siteConfig.name },
}

return (
  <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
    {/* ... rest of page */}
  </>
)
```

### sitemap 예시

```ts
// app/sitemap.ts
import { getAllSlugs } from '@/lib/data'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://qt-archive.org'

  const [qtSlugs, templateSlugs, shopSlugs] = await Promise.all([
    getQtSlugs(),
    getTemplateSlugs(),
    getShopSlugs(),
  ])

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly' },
    { url: `${baseUrl}/qt`, changeFrequency: 'weekly' },
    { url: `${baseUrl}/templates`, lastModified: new Date() },
    { url: `${baseUrl}/shop`, changeFrequency: 'monthly' },
    { url: `${baseUrl}/shop/about`, changeFrequency: 'monthly' },
    ...qtSlugs.map((s) => ({
      url: `${baseUrl}/qt/${s}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
    })),
    ...templateSlugs.map((s) => ({
      url: `${baseUrl}/templates/${s}`,
      lastModified: new Date(),
    })),
    ...shopSlugs.map((s) => ({
      url: `${baseUrl}/shop/${s}`,
      lastModified: new Date(),
    })),
  ]
}
```

---

## 8. 추후 추가 가능 기능

### 즉시 가능 (현재 구조에 추가)

| 기능 | 위치 | 난이도 | 설명 |
|------|------|--------|------|
| **ViewCount** | QT detail | 하 | `viewCount` 필드 표시, 인기순 정렬 이미 동작 |
| **다운로드 수** | 템플릿 카드 | 하 | `downloadCount` 표시 |
| **시리즈 페이지** | `/qt/series/[slug]` | 중 | 시리즈별 모아보기 (데이터는 이미 존재) |
| **태그 페이지** | `/qt/tag/[slug]` | 중 | 태그별 QT 목록 |
| **검색 페이지** | `/search` | 중 | 전역 검색 (QT + Template + Shop 통합) |
| **랜덤 QT** | 홈 | 하 | "오늘의 QT" 대신 랜덤 표시 |
| **인기 QT 위젯** | 홈/사이드바 | 하 | `viewCount` 기반 top 5 |

### 단기 (1-2달)

| 기능 | 설명 |
|------|------|
| **반응형 이미지** | `next/image`에 `sizes`, `quality` 최적화 |
| **무한 스크롤** | QT list 페이지 (Intersection Observer) |
| **QT 북마크/저장** | localStorage 기반 (로그인 불필요) |
| **공유 버튼** | 각 detail 페이지에 SNS/링크 복사 |
| **인쇄 스타일** | QT detail에 `@media print` CSS |
| **다크모드** | `next-themes` + CSS variable |

### 중기 (3-6달)

| 기능 | 설명 |
|------|------|
| **Supabase 마이그레이션** | mock → 실제 DB 전환 |
| **관리자 페이지** | `/admin` CRUD |
| **사용자 댓글/감사** | 익명 or 간단 인증 댓글 |
| **QT 오디오 버전** | TTS 또는 녹음 파일 |
| **굿즈 재고 표시** | Shop에 재고 상태 |
| **정기 구독 후원** | 유료 구독 모델 (선택적) |
| **이메일 뉴스레터** | 큐티 자료를 이메일로 발송 |
| **PWA** | 오프라인 저장, 앱 설치 |

### 장기 (6-12달+)

| 기능 | 설명 |
|------|------|
| **영문/다국어 지원** | i18n, 다국어 큐티 |
| **커뮤니티 기능** | 나눔 게시판, 기도제목 |
| **사용자 프로필** | 읽은 QT 기록, 템플릿 컬렉션 |
| **AI 요약/추천** | 큐티 내용 기반 개인화 추천 |
| **모바일 앱** | React Native or Flutter |

### 절대 하지 말아야 할 것

1. **유료화**: `FreeBadge`는 약속. 모든 자료는 영원히 무료.
2. **광고**: 배너 광고는 브랜드 훼손.
3. **개인정보 강제 수집**: 댓글/구독은 선택. 로그인 없이 모든 콘텐츠 접근 가능.
4. **상품 판매 강조**: commerce는 지원 수단. "사지 않아도 괜찮습니다" 원칙 유지.

---

## 부록: Supabase 마이그레이션 체크리스트

- [ ] `lib/supabase/client.ts` 생성 (singleton)
- [ ] `lib/data-source/supabase/` 디렉토리 생성
- [ ] 각 domain 데이터 함수의 Supabase 버전 구현
- [ ] `DATA_SOURCE=supabase` 환경변수 읽는 로직
- [ ] 타입 재사용 검증 (Supabase `Row` → 기존 `types/` 매핑)
- [ ] 성능 비교: mock vs Supabase 응답 시간
- [ ] 에러 처리: Supabase 다운 시 mock fallback
- [ ] RLS(Row Level Security) 정책: public read, admin write
- [ ] 인증: NextAuth 또는 Supabase Auth
