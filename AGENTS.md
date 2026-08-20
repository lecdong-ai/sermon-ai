# 세션 요약 — 통합 웹 플랫폼 (단일 배포)

## Goal
1. **Supabase 통합** — 3개 인스턴스 → 1개 (Main), 월 $50 절감 ✅
2. **단일 Vercel 배포** — `bunker.ai.kr` 하나로 모든 서비스 (QT + 교회학교 + 메인) ✅
3. **단일 로그인** — Main Supabase 인증으로 모든 서비스 사용 ✅

## Supabase Migration
- Survivor: `xtknqtdidyujuamskbpo` (Main, 21+테이블)
- 삭제됨: `otzdebgfztoattfuvxqy` (Shared), `wpvcsxencajgmunnndjs` (Project)
- 모든 `.env.local` Main URL 통일 (church-school + qt)
- Vercel env vars도 Main으로 업데이트

## Phase 2 — Code Consolidation
- **QT 아카이브**: `qt/app/qt/` → `src/app/qt/` (6 pages + layout)
- **QT API**: `qt/app/api/` → `src/app/api/` (5 routes: qt-archive, generational-qt, admin/verify)
- **QT 컴포넌트**: 30개 → `src/components/{layout,qt,common,admin,ui}/`
- **QT 타입**: `src/types/qt/` + `src/types/qt-index.ts`
- **QT 스타일**: `.qt-archive` CSS 변수 스코핑, tailwind.config.ts 확장 (fontSize/spacing/maxWidth)
- **교회학교**: 누락 페이지 2개 복사 (`events/manage/new`, `applications/[aid]`)
- **vercel.json**: `/school` redirect 제거 (단일 배포로 전환)
- **build**: 성공 ✅ | 커밋: `443d569` | push: GitHub main → Vercel auto-deploy

## Key Decisions
- **QT 디자인 유지**: 별도 layout(`src/app/qt/layout.tsx`) + scoped CSS(`globals-qt.css`)로 충돌 없이 독립 디자인
- **Tailwind 충돌 회피**: QT 색상 클래스는 CSS override로 처리, tailwind config는 fontSize/spacing만 추가
- **Mock data 유지**: `src/lib/data-source/mock/` → QT는 Supabase + Mock 데이터 혼용
- **기존 QtGenerator 유지**: `src/app/advanced/qt/`는 그대로, 새로운 `src/app/qt/`는 아카이브 전용
- **Vercel rewrites 제거**: 더 이상 분산 배포하지 않으므로 rewrites 불필요
- **API Vercel 토큰**: 환경에 없어 git push로 자동 배포 트리거

## Phase 3 — Bug Fixes & Shop
- **Middleware**: `/school` → `publicPrefixes` 제거, 세분화된 public 패턴/경로로 교체
- **AuthProvider.tsx**: `refreshUser` + `isPremium` stub 추가 (mypage destructure 오류 수정)
- **DB JOIN 수정**: `applications/[aid]/route.ts`에서 `.select('*, events(title)')` → `church_events(title)` (events → church_events 테이블명 변경 반영)
- **Header**: "요금제" → "스토어", 이메일 표시 제거, user.name → user.user_metadata?.name, "말씀 연구실" 후원 배지 제거, `/school/mypage` → `/mypage` 링크 변경
- **mypage**: `user.name` → `user.user_metadata?.name` (TypeError 방지), `/school/mypage` → `/mypage` 리다이렉트
- **Applications page**: 401/403 auth 에러 시 로그인 안내 버튼
- **Form submit**: `res.ok` 체크 + `data.application?.id` null 방어
- **Shop page**: `src/app/shop/page.tsx` 신규 — 6개 섹션 (Hero, Categories, Featured Products, How It Works, Why Shop Here, CTA)
- **build**: 성공 ✅ | 커밋: `96cf9b3` (fix(qt): add nowrap to pdf header badges & add community connection line rule)
- **Tailwind 동적 클래스 수정**: `${color}` 템플릿 리터럴 → 정적 className 객체로 변경 (JIT 인식 문제 해결)

## Phase 4 — QT 묵상 팩 = /diary 크리스천 묵상 팩 일치화
- **공유 프리셋**: `src/lib/diaryPresets.ts` 신규 — `CHURCH_PRESET_PAGES` 상수 (church 프리셋 38개 페이지 플래그)
- **`/diary` page.tsx**: `applyPreset('church')`의 하드코딩 객체 → `{ ...CHURCH_PRESET_PAGES }`로 교체 (진실 공급원 통합)
- **`QtDiaryPackViewer.tsx`**: 하드코딩 페이지 목록 → 프리셋 기반 렌더. 부록 순서 `/diary`와 동일화 (표지→벽달력→연간그리드→100소원→성경맵). 100가지 소원은 프리셋 false라 자동 제외됨
- **자동 반영**: 개별 페이지 컴포넌트 디자인 변경 + 팩 구성(포함/제외/순서) 변경 모두 양쪽 자동 반영. 미동기화 유일 지점 = themeColor (wizard는 `#4F7796` 고정, /diary는 수채화 테마 선택)
- **build**: 성공 ✅ | 아직 커밋 안 됨

## Phase 5 — 강해 모델 선택 + 안티그래비티 원고 재가공
- **강해 모델 3종**: `src/lib/advanced/expositoryModels.ts` 신규 — pastoral(박영선), deep(로이드존스), textual(파이퍼), sectionsPerSermon 기반 자동 회차 산정
- **expository-plan API**: targetCount 수동 입력 제거, 모델별 스타일 프롬프트 주입, plan에 model/modelLabel 저장
- **시리즈 페이지**: 헤더에 modelLabel 표시, 로딩/에러 상태, 정렬 순서 기반 완료 카운트
- **AntigravityRewritePanel**: `src/components/advanced/project/` 신규 — 원고 재구성 (제목/본문/중심메시지 보존, 3회/분 rate limit, 6만자 제한), StudioHeader에 "안티그래비티" 버튼
- **요한복음 13-21장 소제목 섹션 추가** (`src/lib/bible/sections.ts`)
- **build**: 성공 ✅ | 커밋: `6ce3126` | push 완료 → Vercel auto-deploy

## Active / Blocked
- **Active**: 없음
- **Blocked**: 없음

## Next Steps
1. 배포 확인: `bunker.ai.kr/advanced/projects/expository` 모델 선택 UI + 시리즈 페이지 modelLabel
2. `bunker.ai.kr/advanced/qt` → 큐티 + 묵상 팩 미리보기 확인 (100소원 제거·순서)
3. (선택) themeColor 동기화: wizard에서 /diary 수채화 테마 연동 or 테마 선택 UI
4. 레거시 "큐티만" 경로 `coverMainTitle` 한글 유지 여부 결정

## Critical Context
- **Supabase**: `xtknqtdidyujuamskbpo.supabase.co` (유일 survivior)
- **Vercel 프로젝트**: `sermon-dashboard` (prj_PDAy19aQvpFcRZXYULDyiovljsE2) — `bunker.ai.kr`
- **GitHub**: `lecdong-ai/sermon-ai` (monorepo, main 브랜치)
- **현재 HEAD**: `6ce3126`
- **구 Vercel 프로젝트** (삭제 예정):
  - `church-school` (prj_bpDO10wPvg1V9G3oDoe8vkZ6Ro6f)
  - `qt-archive` (prj_ZBOh0L7lMGM5LzYs7QGF5CLfvN5l)
