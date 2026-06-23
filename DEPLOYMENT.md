# Vercel 배포 가이드

## 1단계: Vercel 대시보드 접속

<https://vercel.com/new> 접속 → GitHub 계정으로 로그인

## 2단계: 저장소 Import

**Import Git Repository**:
- `lecdong-ai/sermon-ai` 검색 후 **Import** 클릭
- (또는 <https://github.com/lecdong-ai/sermon-ai> → Vercel에서 import)

## 3단계: 프로젝트 설정

| 항목 | 값 |
|------|-----|
| **Project Name** | sermon-ai (또는 원하는 이름) |
| **Framework Preset** | Next.js (자동 감지) |
| **Root Directory** | `./` (기본값) |
| **Build Command** | `next build` (기본값) |
| **Output Directory** | `.next` (기본값) |
| **Region** | Seoul (icn1) — `vercel.json`에서 설정됨 |
| **Node Version** | 20.x (기본값) |

## 4단계: 환경변수 설정

**Environment Variables** 섹션에서 아래 변수들을 추가:

### 필수 (Production)

| Key | 어디서 발급 | 비고 |
|-----|------------|------|
| `OPENAI_API_KEY` | <https://platform.openai.com/api-keys> | gpt-4o-mini, gpt-5.4-mini 사용 |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API | 공개 클라이언트용 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API | 공개 클라이언트용 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API | 서버 전용, RLS 우회 |

### 선택 (Production)

| Key | 어디서 발급 | 비고 |
|-----|------------|------|
| `NEXT_PUBLIC_KAKAO_KEY` | <https://developers.kakao.com/> | 카카오톡 공유 SDK |
| `NEXT_PUBLIC_KAKAO_CHANNEL_URL` | 카카오 채널 관리 | 채널 추가 링크 |
| `NEXT_PUBLIC_TOSS_CLIENT_KEY` | <https://dashboard.tosspayments.com/> | 토스페이먼츠 결제 |
| `TOSS_SECRET_KEY` | 토스페이먼츠 대시보드 | 서버 검증용 |
| `TOSS_WEBHOOK_SECRET` | 토스페이먼츠 대시보드 | 웹훅 검증 |

> **중요**: 각 환경변수에 대해 **Production**, **Preview**, **Development** 모두 체크하는 것을 권장.

## 5단계: Deploy 클릭

**Deploy** 버튼 클릭 → 2~4분 대기 → 빌드 성공 시 production URL 생성됨

배포 URL 예시: `https://sermon-ai-xxx.vercel.app`

## 6단계: 배포 후 필수 작업

### A. Supabase Auth 리다이렉트 URL 추가

Supabase Dashboard → Authentication → URL Configuration → Redirect URLs에 추가:
```
https://sermon-ai-xxx.vercel.app/auth/callback
```

### B. 토스페이먼츠 웹훅 URL 등록 (결제 사용 시)

토스페이먼츠 대시보드 → 웹훅 설정:
```
https://sermon-ai-xxx.vercel.app/api/payments/webhook
```

### C. 카카오 개발자 콘솔 플랫폼 등록

<https://developers.kakao.com/> → 앱 설정 → 플랫폼 → Web 플랫폼 추가:
```
https://sermon-ai-xxx.vercel.app
```

## 7단계: 도메인 연결 (선택)

Vercel 프로젝트 → Settings → Domains → 커스텀 도메인 추가

## 자동 배포 설정

- `main` 브랜치 푸시 → Production 자동 배포
- 다른 브랜치 푸시 → Preview 자동 배포 (임시 URL)
- PR 생성 시 → PR별 Preview URL 자동 생성

## 롤백

Vercel 대시보드 → Deployments → 이전 배포 선택 → **Promote to Production**

## 모니터링

- **Logs**: Vercel 프로젝트 → Logs 탭
- **Analytics**: Vercel 프로젝트 → Analytics 탭 (유료 플랜)
- **Speed Insights**: Vercel 프로젝트 → Speed Insights 탭
