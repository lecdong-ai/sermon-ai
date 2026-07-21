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

## Active / Blocked
- **Active**: Vercel auto-deploy (GitHub push → `bunker.ai.kr` 배포 중)
- **Blocked**: 없음

## Next Steps (After Deploy Verify)
1. `bunker.ai.kr/qt` → QT 아카이브 정상 작동 확인
2. `bunker.ai.kr/school` → 교회학교 정상 작동 확인
3. church-school + qt-archive Vercel 프로젝트 삭제
4. `qt.bunker.ai.kr` 도메인 DNS 정리 (카페24)

## Critical Context
- **Supabase**: `xtknqtdidyujuamskbpo.supabase.co` (유일 survivior)
- **Vercel 프로젝트**: `sermon-dashboard` (prj_PDAy19aQvpFcRZXYULDyiovljsE2) — `bunker.ai.kr`
- **GitHub**: `lecdong-ai/sermon-ai` (monorepo, main 브랜치)
- **현재 HEAD**: `443d569`
- **구 Vercel 프로젝트** (삭제 예정):
  - `church-school` (prj_bpDO10wPvg1V9G3oDoe8vkZ6Ro6f)
  - `qt-archive` (prj_ZBOh0L7lMGM5LzYs7QGF5CLfvN5l)
