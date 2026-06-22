# 목회자 AI 솔루션 (Sermon AI)

설교 원고를 업로드하면 AI가 자동으로 **요약, 소그룹 나눔 자료, 카드뉴스, 설교 대본, 쇼츠 대본, PPT**를 생성하는 웹앱입니다.

> Next.js 14 · TypeScript · Tailwind CSS · Supabase · OpenAI GPT-4o-mini

---

## 기능

| 기능 | 설명 |
|------|------|
| 📄 **파일 업로드** | PDF/TXT/DOCX 업로드, 텍스트 자동 추출 |
| 📖 **설교 요약** | 서론/본론/결론/적용 포인트 요약 |
| 👥 **소그룹 나눔** | 연령대별(10대~70대 이상) 맞춤 나눔 질문 |
| 🖼️ **카드뉴스** | 5장 슬라이드 + 이미지 저장 |
| 🎤 **10분 설교대본** | 구어체 설교 대본 생성 |
| 📹 **쇼츠 대본** | YouTube Shorts 60초 대본 |
| 📊 **설교 PPT** | .pptx 파일 다운로드 (표지/목차/본문/마무리) |
| 🔗 **공유** | 링크 복사 · 카카오톡 공유 · OG 메타태그 |

---

## 빠른 시작

### 1. 저장소 클론

```bash
git clone <your-repo-url>
cd sermon-ai
```

### 2. 환경변수 설정

```bash
cp .env.example .env.local
```

`.env.local` 파일을 열어 아래 값을 채우세요:

```env
OPENAI_API_KEY=sk-...                                    # OpenAI 키 (필수)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co # Supabase URL (필수)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key               # Supabase anon key (필수)
NEXT_PUBLIC_KAKAO_KEY=                                    # 카카오 SDK 키 (선택)
```

### 3. Supabase 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. SQL Editor에서 아래 쿼리 실행:

```sql
CREATE TABLE sermons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT DEFAULT '',
  passage TEXT DEFAULT '',
  file_name TEXT NOT NULL,
  raw_text TEXT NOT NULL,
  result JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE sermons DISABLE ROW LEVEL SECURITY;
```

3. 프로젝트 Settings > API에서 `Project URL`과 `anon public key` 복사 → `.env.local`에 입력

### 4. OpenAI API 키 설정

1. [OpenAI Platform](https://platform.openai.com/api-keys)에서 API 키 생성
2. `.env.local`의 `OPENAI_API_KEY`에 입력

> gpt-4o-mini 사용. 비용: 약 $0.15/회 (100만 토큰당 $0.15)

### 5. 패키지 설치 및 실행

```bash
# 패키지 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

---

## 사용법

### 첫 이용 가이드

1. **메인 화면**에서 설교 원고 파일 업로드 (PDF/TXT/DOCX)
2. **자동 리디렉션** → 워크스페이스 페이지
3. **탭**으로 각종 결과 확인
4. **".pptx" 버튼** → PPT 다운로드
5. **"공유 링크" 버튼** → 팀원들과 공유

### 팁

- 업로드 후 AI 생성에 20~40초 소요됩니다
- 각 탭에서 생성 실패 시 **다시 시도** 버튼이 나타납니다
- **전체보기**로 모든 결과를 한 페이지에서 확인 가능
- **카드뉴스**는 슬라이드로 넘겨보고 이미지 저장 가능
- **공유 페이지**에서 카카오톡·링크 복사로 공유

---

## 배포 (Vercel)

### 1. Vercel 가입 및 연결

1. [Vercel](https://vercel.com)에 GitHub 계정으로 가입
2. `Add New > Project` 클릭
3. 이 저장소를 선택하고 `Import`

### 2. 환경변수 설정

Vercel 프로젝트 설정 > **Environment Variables**에서 추가:

| 이름 | 값 |
|------|-----|
| `OPENAI_API_KEY` | OpenAI API 키 |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |

### 3. 배포

`Deploy` 버튼 클릭 → 자동 빌드 및 배포

배포 완료 후 `https://your-project.vercel.app`에서 접속 가능

---

## 프로젝트 구조

```
src/
├── app/
│   ├── api/
│   │   ├── upload/          # 업로드 + AI 생성 API
│   │   ├── sermon/[id]/     # 설교 조회 API
│   │   └── ppt/[id]/        # PPT 생성 API
│   ├── share/[id]/          # 공유 페이지
│   ├── workspace/           # 워크스페이스 페이지
│   ├── page.tsx             # 메인 페이지
│   └── layout.tsx           # 루트 레이아웃
├── components/
│   ├── FileUpload.tsx       # 파일 업로드 컴포넌트
│   ├── ResultTabs.tsx       # 탭 UI
│   ├── SectionCard.tsx      # 공통 섹션 카드
│   ├── SummarySection.tsx   # 요약 섹션
│   ├── GroupDiscussionSection.tsx
│   ├── CardNewsSection.tsx  # 카드뉴스 (슬라이드 + 저장)
│   ├── SermonScriptSection.tsx
│   ├── ShortsScriptSection.tsx
│   ├── PPTSection.tsx       # PPT 다운로드
│   ├── GenerateButton.tsx   # 생성 버튼
│   ├── Toast.tsx            # 토스트 메시지
│   └── Header.tsx           # 헤더
├── lib/
│   ├── supabase.ts          # Supabase 클라이언트
│   ├── parsers.ts           # PDF/TXT/DOCX 파서
│   ├── openai.ts            # OpenAI 연동
│   ├── pptTheme.ts          # PPT 테마 상수
│   └── prompts/             # AI 프롬프트 템플릿
├── types/
│   └── index.ts             # 타입 정의
```

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | Next.js 14 (App Router) |
| 언어 | TypeScript |
| 스타일링 | Tailwind CSS |
| 데이터베이스 | Supabase (PostgreSQL) |
| AI | OpenAI GPT-4o-mini |
| PPT | PptxGenJS |
| 파싱 | pdf-parse, mammoth |
| 배포 | Vercel |

---

## 주의사항

1. **API 키 보안**: `OPENAI_API_KEY`는 서버에서만 사용되며 클라이언트에 노출되지 않습니다
2. **파일 크기**: 20MB 제한. 초과 시 업로드 불가
3. **파일 형식**: .doc 파일은 읽을 수 없습니다. .docx로 변환 후 업로드
4. **AI 비용**: gpt-4o-mini 기준 약 $0.15/회 (설교 1회 분석 기준)
5. **데이터 보존**: 현재는 RLS 비활성화 상태입니다. 실서비스 시 적절한 인증/권한 설정 필요
6. **한글 폰트**: PPT 생성 시 `Noto Sans KR` 폰트를 지정하나, PowerPoint에 해당 폰트가 없으면 기본 폰트로 대체됩니다

---

## 2차 개발 예정

- [ ] 사용자 인증 (Supabase Auth)
- [ ] 카드뉴스 이미지 자동 생성 (DALL-E)
- [ ] 다국어 지원 (영어/일본어)
- [ ] 설교 목록/검색/관리 페이지
- [ ] 배치 처리 (여러 설교 동시 생성)
- [ ] PPT 템플릿 커스터마이징 (색상/폰트 선택)
- [ ] Google Drive / Notion 연동
