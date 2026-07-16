# 세션 요약 — 통합 웹 플랫폼 (메인 + 교회학교)

## Goal
1. **PPT Studio DB 템플릿 + AI 추천** — 관리자가 .pptx 업로드 시 색상/폰트 자동 추출, DB 저장, AI 자동 추천 및 스타일 적용
2. **카드뉴스 생성기** — 설교 내용 기반 PNG/PDF 카드뉴스 (13개 테마, 3 SNS 사이즈)
3. **교회 행사 신청 시스템** — 관리자/신청자/QR체크인/CSV내보내기
4. **카카오/구글 OAuth 로그인** — 메인+교회학교 양쪽 동일
5. **Vercel path-based 통합** — `bunker.ai.kr/school/*` 로 교회학교 서비스

## Constraints & Preferences
- 템플릿은 Supabase DB, 관리자 CRUD UI로 관리
- `.pptx` 업로드 시 JSZip로 색상/폰트 자동 추출
- AI 자동 추천은 수동 선택 없을 때만, 수동 선택 우선
- 템플릿 스타일은 생성 슬라이드에 자동 적용
- DELETE 는 hard delete
- 모든 변경은 두 프로젝트 모두 build 통과해야 함
- Vercel rewrite 방식으로 path-based 라우팅 (단일 도메인)
- 같은 Supabase 인스턴스 공유 → 로그인 상태 공유
- 커밋은 필요한 경우만 (사용자 선호)

## Progress
### Done — PPT Studio
- `ppt_templates` Supabase 테이블 + 7 seed 템플릿
- `@/lib/pptxParser.ts`: .pptx theme.xml → 색상/폰트 추출
- `@/lib/templateRegistry.ts`: 클라이언트 fetch, localStorage 캐시(5분), static fallback, `applyTemplate()`, `invalidateCache()`
- `/api/admin/templates` GET(open)/POST(admin), `/api/admin/templates/[id]` PUT/DELETE(hard)
- `/admin/templates` CRUD UI (.pptx 업로드 + 색상/폰트 미리보기)
- `generatePptSlidesGpt()` 에 템플릿 주입, `recommendTemplate()` 함수
- PptSlidePreview: 10개 레이아웃 모두 템플릿 색상/폰트 사용
- 양 프로젝트 build 성공

### Done — 카드뉴스 (church-school)
- CardNewsSection.tsx: 13개 테마, 3 SNS 사이즈, 인라인 편집, PNG/PDF 내보내기
- 10개 설교 테마, 풍부한 콘텐츠 생성

### Done — 교회 행사 신청 시스템
- `supabase_migration_events.sql`: events + applications 테이블, RLS, 트리거, UNIQUE 제약
- 11 API 라우트: 3 공개(이벤트 정보/신청/중복+형제), QR 체크인, 8 관리(CRUD/복제/검색/상태/CSV/일괄)
- 8 페이지: 3 공개(모바일 신청/완료+QR/체크인), 5 관리(목록/생성/상세+대시보드/신청목록+일괄/상세)
- QR 체크인, 형제자매 자동완성, 템플릿 복제, 카톡 공유(포맷팅 텍스트), 스마트 대시보드
- Route group `(main)/` 분리: 공개 페이지는 minimal layout

### Done — OAuth 로그인 (church-school)
- `LoginModal.tsx`: Kakao(yellow) + Google(white) 버튼
- `/auth/callback/route.ts`: OAuth 리다이렉트 핸들러

### Done — Vercel Path-based 통합
- Vercel API 토큰 (Full Access) 생성으로 Vercel 직접 제어 가능
- `church-school` 프로젝트 진단: Vercel Authentication ON, Root Directory 잘못 설정
- `passwordProtection: null` PATCH → OFF
- `ssoProtection: null` PATCH → OFF
- Root Directory `church-school/` 로 변경 (GitHub 빌드가 church-school 코드 사용)
- 303bd79 (오래된) 배포가 실제로는 메인 프로젝트를 빌드한 것이었음 확인
- Vercel API로 새 배포 트리거 (`POST /v13/deployments`)
- 새 빌드 (commit 1eee6d4) READY, `<title>교회학교 솔루션</title>` 확인
- 메인 `vercel.json` 에 rewrites 추가:
  ```json
  "rewrites": [
    { "source": "/school", "destination": "https://church-school-jun-jung-woo-s-projects.vercel.app/school" },
    { "source": "/school/:path*", "destination": "https://church-school-jun-jung-woo-s-projects.vercel.app/school/:path*" }
  ]
  ```
- church-school `next.config.mjs` 에 `basePath: '/school'` 추가 (production only)
- `bunker.ai.kr/school` → church-school 정상, 내부 링크 모두 `/school/*` prefix ✓

### Done — 교회학교 자체 로그인 UI 완전 제거 (가장 최근 작업)
- **사용자 결정**: 교회학교에서 로그인 기능 제거, 메인 페이지에서 로그인
- **삭제 (2 파일, ~280줄)**:
  - `church-school/src/components/LoginModal.tsx`
  - `church-school/src/app/auth/callback/route.ts`
- **신규 (1 파일)**: `church-school/src/lib/auth-redirect.ts` (메인 로그인으로 이동)
- **수정 (7 파일, ~-150줄)**:
  - `Header.tsx`: LoginModal/로그인/시작하기 버튼 제거, user info + 로그아웃만
  - `AuthProvider.tsx`: login/register 함수 제거, logout/refreshUser 유지
  - `auth.ts`: signInUser/signUpUser 제거, unused `supabase` import 제거
  - `pricing/notice-writer`: LoginModal 사용 제거, 미로그인 시 redirectToMainLogin
  - `mypage/projects`: 미로그인 시 useEffect 로 redirectToMainLogin
  - `events/manage`: 권한 체크 추가 (useAuth + redirectToMainLogin)
- **순 감소**: -347줄 (12 files, +225/-572)
- **부수효과**: Supabase Dashboard / Kakao / Google Console 추가 설정 0건
- **커밋**: `cbc1aaf` → 빌드 READY → `bunker.ai.kr/school` 정상 작동 확인

### Done — QT 히스토리 (생성 기록 저장/조회)
- `supabase_migration_qt_history.sql`: `qt_history` 테이블 + RLS + updated_at 트리거
- `src/app/api/advanced/qt/history/route.ts`: GET(목록) + POST(저장)
- `src/app/api/advanced/qt/history/[id]/route.ts`: GET(상세) + PUT(수정) + DELETE(삭제)
- `QtGenerator.tsx`: 자동 저장, 기록 패널(헤더 `📋 기록` 버튼), 5개 액션 (보기/재생성/편집/삭제/PDF)
- 양 프로젝트 build 성공
- Supabase SQL Editor에서 `supabase_migration_qt_history.sql` 실행 필요

### Done — 유틸리티 스크립트
- `church-school/vercel-fix.mjs`: Vercel Authentication 끄기
- `church-school/cleanup-and-rebuild.mjs`: Root Directory 변경, 배포 정리
- `church-school/check-deploys.mjs`: 배포 목록 확인
- `church-school/token-diagnose.mjs`: 토큰 형식 진단

### Blocked
- 없음 (Supabase OAuth Redirect URL 추가 불필요 — 자체 로그인 제거로)

## Key Decisions
- `.pptx` 업로드 → 추출 방식 채택
- 템플릿 DB 저장 (배포 불필요)
- localStorage 5분 캐시 + invalidateCache()
- Static fallback 템플릿
- DELETE hard
- 카드뉴스 DALL-E 없이 순수 CSS/SVG
- 행사 시스템: admin 라우트는 supabaseAdmin (service_role)
- Route group `(main)` 으로 공개/관리 페이지 레이아웃 분리
- **Kakao/Google OAuth 제거됨**: church-school 자체 로그인 UI 완전 제거 (메인에서만 로그인)
- **Vercel rewrite vs 별도 도메인**: rewrite 선택 (단일 도메인, DNS 불필요)
- **basePath '/school' 사용**: 내부 절대 경로 자동 prefix
- **Production only basePath**: dev 환경은 basePath 없이 (`VERCEL_ENV === 'production'` 체크)
- **Root Directory = `church-school/`**: GitHub 트리거 빌드가 church-school 코드만 사용
- **Vercel API 직접 사용**: CLI npx 타임아웃 회피, POST /v13/deployments 로 배포 트리거
- **로그인 공유**: 같은 도메인 (bunker.ai.kr) + 같은 Supabase → 쿠키 자동 공유 → 메인 로그인 시 church-school 자동 인증
- **redirectToMainLogin 헬퍼**: 미로그인 시 메인 로그인 페이지로 이동 (`?next=` 파라미터로 복귀 경로 전달)

## Next Steps
1. 최종 테스트:
   - `bunker.ai.kr` → 메인 (정상) ✓
   - `bunker.ai.kr/school` → church-school (정상) ✓
   - 메인에서 로그인 → `/school` 에서 자동 로그인 (쿠키 공유)
   - 미로그인 상태로 `/school/mypage` → 메인 로그인으로 redirect
   - `/school` 내부 네비게이션 (예: `/school/login`, `/school/events/manage`) 정상
2. 추가 개선 가능 (선택):
   - 메인 `/login` 페이지가 `?next=` 파라미터로 로그인 후 원래 경로로 복귀하는지 확인
   - 메인 페이지에 church-school 카드 (이미 구현됨: `src/app/page.tsx:871`) 작동 확인
   - church-school 자체 dev 환경 (`localhost:3000`) 에서 basePath 없이 정상 작동 확인

## Critical Context
- **공유 Supabase**: `otzdebgfztoattfuvxqy.supabase.co` (auth + 양쪽 데이터)
- **별도 Supabase**: `wpvcsxencajgmunnndjs.supabase.co` (설교 프로젝트 전용, PPT 이미지)
- **Vercel 프로젝트**:
  - `sermon-dashboard` (prj_PDAy19aQvpFcRZXYULDyiovljsE2) — `bunker.ai.kr`
  - `church-school` (prj_bpDO10wPvg1V9G3oDoe8vkZ6Ro6f) — `church-school-jun-jung-woo-s-projects.vercel.app`
  - Vercel Authentication: **OFF** (passwordProtection, ssoProtection 둘 다 null)
  - Root Directory (church-school): `church-school/`
- **GitHub repo**: `lecdong-ai/sermon-ai` (monorepo, main 브랜치)
- **현재 HEAD**: `1eee6d4` (모든 변경사항 커밋됨, 푸시됨)
- **Vercel API**: 사용자 Vercel 토큰 (`vcp_4X37...`) 보유, Full Access
- **공유 도메인 (`bunker.ai.kr`)**: sermon-dashboard 에서 호스팅, /school/* → church-school 로 rewrite
- **로그인 공유**: 같은 도메인 + 같은 Supabase → 쿠키 자동 공유
- **PPTX 템플릿**: DB에 `#` 없이 저장, PptSlidePreview 에서 `#` prefix 추가
- **church-school church-school.vercel.app 도메인**: 다른 프로젝트에 할당됨 (사용 안 함)

## Relevant Files

### Vercel 통합
- `vercel.json`: rewrites 추가됨 (`/school` → church-school)
- `church-school/next.config.mjs`: `basePath: '/school'` (production only)
- `church-school/src/components/LoginModal.tsx`: `redirectTo` pathname 감지
- `church-school/vercel-fix.mjs`, `cleanup-and-rebuild.mjs`, `check-deploys.mjs`, `token-diagnose.mjs`: 유틸리티 스크립트 (모두 커밋됨)

### PPT Studio
- `supabase_migration_ppt_templates.sql`: DDL + 7 seed
- `src/lib/pptxParser.ts`, `src/lib/templateRegistry.ts`: 핵심 로직
- `src/app/api/admin/templates/route.ts`, `src/app/api/admin/templates/[id]/route.ts`: CRUD API
- `src/app/admin/templates/page.tsx`: CRUD UI
- `src/components/PptStudio.tsx`: 동적 템플릿, 자동 추천, 자동 적용
- `src/lib/openai.ts`: `generatePptSlidesGpt()` 템플릿 주입, `recommendTemplate()`
- `src/app/api/ppt/generate/route.ts`: templateId 처리
- `church-school/` 대응 파일들: 동일한 구조

### 카드뉴스
- `church-school/src/components/CardNewsSection.tsx`: 13 테마, 3 사이즈, 인라인 편집, PNG/PDF

### 행사 시스템
- `church-school/supabase_migration_events.sql`: events + applications DDL
- `church-school/src/types/event.ts`: 타입 정의
- `church-school/src/app/api/events/...`: 공개 API 3개
- `church-school/src/app/api/manage/events/...`: 관리 API 8개
- `church-school/src/app/events/[token]/...`: 공개 페이지 3개
- `church-school/src/app/(main)/events/manage/...`: 관리 페이지 5개
- `church-school/src/components/Header.tsx`: '행사 관리' nav 추가
- `church-school/src/app/(main)/layout.tsx`: route group layout

### OAuth
- `church-school/src/components/LoginModal.tsx`: Kakao + Google 버튼
- `church-school/src/app/auth/callback/route.ts`: OAuth 핸들러
- `church-school/next.config.mjs`: `eslint.ignoreDuringBuilds: true`
- `church-school/vercel.json`: Vercel 배포 설정
