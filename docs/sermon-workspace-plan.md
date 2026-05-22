# 설교 준비 워크스페이스 — 기획 문서 v1.0

---

## 1. 기능 개요

### 핵심 목적
목회자가 **본문 묵상부터 설교 원고 완성까지** 전 과정을 AI 보조와 함께 진행할 수 있는 통합 워크스페이스를 제공한다.

### 사용자가 얻는 가치
- 설교 준비 시간 단축 (평균 3~5시간 → 1~2시간)
- 본문 관찰의 깊이 향상 (AI가 놓친 관점 제시)
- 구조화된 설교 작성 습관 형성
- 설교 자료의 체계적 보관 및 재활용

### 주요 사용자
| 사용자 | 니즈 |
|--------|------|
| 담임목사 | 주 2~3편 설교, 시간 부족, 일관된 품질 필요 |
| 부목사 | 새 설교자, 구조적 도움 필요, 피드백 필요 |
| 교육전도사 | 소그룹/주일학교용 간소화된 설교 필요 |
| 신학생 | 설교 작성 연습, 모범 구조 학습 |

### 대표 사용 시나리오

**시나리오 1 — 담임목사의 주일 설교 준비**
1. 월요일, 에베소서 2:1-10 본문 입력
2. AI가 본문 관찰 질문 생성 → 묵상하며 답변 작성
3. AI가 핵심 메시지 후보 3개 제안 → 선택 후 수정
4. 설교 개요 생성 → 구조 조정
5. 초안 생성 → 수정 → 적용/예화 추가
6. 목요일, 최종 원고 완성 → 저장

**시나리오 2 — 부목사의 첫 설교 준비**
1. 담임목사가 본문 할당 (마가복음 4:35-41)
2. AI가 배경/문맥 정보 제공
3. 단계별 가이드 따라 첫 개요 작성
4. AI가 추상적 표현 탐지 → 구체화 제안
5. 완성 후 담임목사와 공유

**시나리오 3 — 교육전도사의 소그룹 교재 전환**
1. 기존 설교 원고 불러오기 (빌립보서 4:4-7)
2. AI가 소그룹 나눔용 질문 5개 생성
3. 연령별 적용 분기 작성

---

## 2. 설교 준비 프로세스 정리

| 단계 | 목적 | 목회자의 행동 | AI 기능 |
|------|------|-------------|---------|
| **1. 본문/주제 선정** | 설교할 본문과 주제 결정 | 성경 읽기, 교회 절기/상황 고려 | 절기 기반 본문 추천, 시리즈 연결 |
| **2. 본문 반복 읽기와 묵상** | 본문에 대한 친숙도 상승 | 동일 본문 여러 번 읽기, 느낌 기록 | 읽기 안내 제공, 묵상 질문 생성 |
| **3. 본문 관찰** | 본문이 실제로 말하는 것 파악 | 반복 단어, 인물, 장소, 구조 관찰 | 관찰 질문 생성, 관찰 포인트 제안 |
| **4. 배경/문맥 연구** | 역사적·문학적 맥락 이해 | 주석 참고, 배경 자료 조사 | 배경 정보 요약, 참고 구절 연결 |
| **5. 핵심 메시지 도출** | 한 문장으로 설교의 중심 정리 | 관찰+해석 → 메시지 압축 | 핵심 메시지 후보 3개 생성 |
| **6. 개요 작성** | 논리적 구조 설계 | 서론-본론-결론 구성, 소제목 배치 | 설교 개요 템플릿 생성 |
| **7. 예화/적용 정리** | 청중의 삶과 연결 | 예화 발굴, 적용 포인트 구체화 | 적용 질문 생성, 예화 제안 |
| **8. 설교문 작성** | 완성된 원고 제작 | 개요 기반 초안 작성 | 초안 생성, 문장 피드백 |
| **9. 검토/수정** | 설교 점검 및 보완 | 소리내어 읽기, 수정 | 추상 표현 감지, 대안 제안 |

---

## 3. 웹페이지 정보 구조 및 화면 구성

### 안 1: 단계형 설교 빌더 (Stepped Sermon Builder)

**장점**
- 단계별 집중 가능, 초보자 친화적
- 진행률 시각화 → 성취감
- 각 단계별 AI 도움을 명확히 제시

**단점**
- 유연성 부족 (순서 강제)
- 숙련자에게 답답함
- 단계 이동 시 컨텍스트 전환

**적합 사용자**: 부목사, 신학생, 교육전도사

**화면 구성**:
```
Step 1. 본문 입력 [진행률 0/9]
Step 2. 본문 관찰
Step 3. 배경 연구
Step 4. 핵심 메시지
Step 5. 개요 작성
Step 6. 적용 정리
Step 7. 예화 추가
Step 8. 초안 생성
Step 9. 최종 검토
```

### 안 2: 한 화면 워크벤치형 (Sermon Workbench)

**장점**
- 자유로운 순서, 숙련자 선호
- 전체 맥락 유지
- 빠른 편집 가능

**단점**
- 초보자에게 복잡함
- 진행 가이드 부재 가능
- 화면이 복잡해질 위험

**적합 사용자**: 담임목사, 경험 많은 목회자

**화면 구성**:
```
┌─────────┬──────────────────────────────────────┐
│ 사이드바 │          메인 에디터 영역              │
│ (단계 목록)│                                    │
│         │  [AI 도움말 버튼]                     │
│ ☑ 본문  │  ┌────────────────────────────────┐   │
│ ☑ 관찰  │  │  설교문 / 개요 / 메모          │   │
│ ☐ 메시지│  │  (탭 전환 가능)                │   │
│ ☐ 개요  │  │                                │   │
│ ☐ 적용  │  └────────────────────────────────┘   │
│ ☐ 초안  │                                    │
│ ☐ 검토  │  [AI 생성] [적용 추가] [저장]       │
│         │                                    │
│ 사용량  │                                    │
│ v0.1.0  │                                    │
└─────────┴──────────────────────────────────────┘
```

### 추천: 하이브리드 접근

**MVP에서는 안 2(워크벤치형)**를 채택하되, 사이드바에 단계 진행률과 순서 가이드를 함께 제공한다.

- 기본 구조: 워크벤치 (자유 편집)
- 사이드바: 9단계 진행 가이드 + 현재 단계 하이라이트
- 우측 하단: "AI 도움 요청" 플로팅 버튼 → 컨텍스트에 맞는 AI 명령어 제공

---

## 4. 추천 MVP 화면 설계

### 화면 구성표

| 화면 | 목적 | 주요 UI | 주요 버튼/액션 | 저장 데이터 |
|------|------|---------|---------------|------------|
| **설교 목록** | 모든 설교 확인/선택 | 카드 리스트, 검색, 필터 | 새 설교, 복제, 삭제 | 모든 sermon 레코드 |
| **설교 작성** | 설교 준비 전과정 | 사이드바(단계) + 메인 에디터 + AI 패널 | AI관찰, AI메시지, AI개요, AI초안, 저장, 내보내기 | sermon, sermon_notes |
| **설교 미리보기** | 완성 원고 검토 | 프린트 스타일 뷰어 | PDF 저장, 복사, 편집으로 돌아가기 | (읽기 전용) |

### 설교 작성 페이지 상세

```
┌─────────────────────────────────────────────────────────┐
│ 뒤로  설교 제목 입력 ___________________  [저장] [미리보기] │
│─────────────────────────────────────────────────────────│
│ ┌─ 사이드바 ─────────────────┐ ┌─ 메인 영역 ────────────┐ │
│ │                           │ │ [입력] [개요] [원고]    │ │
│ │ 진행률  ■■■□□□□□□□ 30%    │ │ (탭 전환)              │ │
│ │                           │ │                        │ │
│ │ 1. ☑ 본문 입력           │ │ ▸ 입력 탭:            │ │
│ │ 2. ☑ 본문 관찰           │ │   본문: [select]       │ │
│ │ 3. ☐ 배경 연구    [AI]   │ │   제목: [input]        │ │
│ │ 4. ☐ 핵심 메시지  [AI]   │ │   날짜: [date]         │ │
│ │ 5. ☐ 개요 작성    [AI]   │ │   절기: [select]       │ │
│ │ 6. ☐ 적용 정리    [AI]   │ │   대상: [select]       │ │
│ │ 7. ☐ 예화 추가           │ │   묵상 노트: [textarea] │ │
│ │ 8. ☐ 초안 생성    [AI]   │ │   관찰 노트: [textarea] │ │
│ │ 9. ☐ 최종 검토          │ │   해석 노트: [textarea]  │ │
│ │                           │ │   적용 노트: [textarea]  │ │
│ │ [AI 도움 요청]            │ │                        │ │
│ └───────────────────────────┘ │ ▸ 개요 탭:            │ │
│                               │   서론, 본론, 결론 편집 │ │
│                               │ ▸ 원고 탭:             │ │
│                               │   전체 설교문 편집기    │ │
│                               └────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 5. 설교 제작 페이지 입력 항목 설계

| 항목 | 필수 | 타입 | 설명/placeholder |
|------|------|------|-----------------|
| 설교 제목 | 필수 | input | "설교의 제목을 입력하세요" |
| 성경 본문 | 필수 | select + input | "예: 에베소서 2:1-10" (책 선택 + 장:절) |
| 설교 날짜 | 필수 | date | 기본값: 다음 주일 |
| 설교 시리즈 | 선택 | select or input | "시리즈가 있다면 입력하세요" |
| 절기/특별일 | 선택 | select | 부활절, 성탄절, 추수감사절, 없음 |
| 설교 대상 | 선택 | multi-select | 전체, 청년, 장년, 소그룹, 학생 |
| 공동체 상황 | 선택 | textarea | "교회의 현재 상황이나 특징을 적어주세요 (예: 새성전 이전, 부흥기, 위기)" |
| 핵심 메시지 (한 문장) | 권장 | textarea | "이 설교를 한 문장으로 요약하면?" |
| 본문 관찰 노트 | 선택 | textarea | "본문을 관찰하며 발견한 단어, 반복, 구조를 기록하세요" |
| 배경 연구 노트 | 선택 | textarea | "역사적/문맥적 배경을 기록하세요" |
| 해석 메모 | 선택 | textarea | "본문의 의미를 해석한 내용" |
| 예화/일러스트 메모 | 선택 | textarea | "사용할 예화, 이야기, 인용구" |
| 적용 포인트 | 선택 | textarea | "청중의 삶에 적용할 구체적 포인트" |
| 설교 개요 | 권장 | structured (JSON) | 서론/본론1/본론2/본론3/결론 구조 |
| 최종 설교문 | 저장 시 자동 | rich text | "최종 완성된 설교 원고" |

### TypeScript Interface

```typescript
interface Sermon {
  id: string
  user_id: string
  title: string
  passage: string
  book: string
  chapter_start: number
  chapter_end?: number
  verse_start?: number
  verse_end?: number
  sermon_date: string
  series?: string
  season?: string
  audience: string[]
  church_context?: string

  // Notes
  core_message?: string
  observation_notes?: string
  background_notes?: string
  interpretation_notes?: string
  illustration_notes?: string
  application_points?: string

  // Outline
  outline?: SermonOutline

  // Manuscript
  manuscript?: string

  // Status
  status: 'draft' | 'in_progress' | 'completed'
  version: number
  created_at: string
  updated_at: string
}

interface SermonOutline {
  introduction?: string
  main_points: SermonMainPoint[]
  conclusion?: string
}

interface SermonMainPoint {
  title: string
  content: string
  sub_points?: string[]
  application?: string
  illustration?: string
}
```

---

## 6. AI 기능 설계

| 기능 | 입력값 | 출력값 | 버튼명 | 주의사항 |
|------|--------|--------|--------|---------|
| **본문 관찰 질문 생성** | 본문(passage) | 관찰 질문 5개 | 🤖 본문 관찰 도움 | 질문은 열린 질문으로, 단정적이지 않게 |
| **핵심 메시지 후보 생성** | 본문 + 관찰 노트 | 3가지 메시지 후보 | 🤖 핵심 메시지 추천 | 복음 중심, 행위 구원이 아닌 은혜 중심인지 검증 |
| **설교 제목 후보 생성** | 본문 + 핵심 메시지 | 5가지 제목 | 🤖 제목 추천 | 너무 자극적이지 않게 |
| **설교 개요 생성** | 본문 + 핵심 메시지 + 상황 | 3~4 point 개요 | 🤖 개요 생성 | 본문의 논리적 흐름을 따를 것 |
| **적용 질문 생성** | 핵심 메시지 + 대상 | 대상별 적용 질문 | 🤖 적용 질문 생성 | 추상적이지 않고 구체적 행동 중심 |
| **초안 설교문 생성** | 본문 + 핵심 메시지 + 개요 | 전체 설교문 초안 | 🤖 초안 생성 | "여러분" 호칭, 구어체, 15~20분 분량 |
| **문장 피드백** | 선택 문장 | 개선 제안 + 이유 | 🤖 문장 점검 | 추상적 표현 → 구체화, 전문 용어 설명 |
| **소그룹 교재 변환** | 설교문 | 나눔 질문 + 기도문 | 📖 리더가이드 생성 | 복음 왜곡 없이 |

---

## 7. AI 프롬프트 구조

### 시스템 프롬프트 초안

```
당신은 복음주의 개혁파 전통에 기반한 설교 준비 도우미 AI입니다.
당신의 역할은 목회자의 설교 준비를 보조하는 것이지, 설교를 대신하거나 신학적 단정을 내리는 것이 아닙니다.

## 핵심 원칙
1. 본문 중심(Sola Scriptura): 항상 본문의 내용에 기반하여 답변하세요.
2. 복음 중심: 모든 적용은 행위 구원이 아닌 은혜의 복음에 기반해야 합니다.
3. 목회적 톤: 존중, 격려, 건설적인 어조를 유지하세요.
4. 제안이지 명령이 아닙니다: "~하는 것이 좋습니다"와 같은 제안형 어미를 사용하세요.
5. 단정적 표현 금지: "이 본문의 의미는 ~입니다" → "이렇게 이해할 수 있습니다"

## 금지 사항
- 특정 교단의 독특한 신학을 절대적으로 주장하지 마세요
- 원어(헬라어/히브리어)에 대한 확정적 해석을 내리지 마세요
- 청중의 상황을 모르므로 적용을 지시하지 말고 제안만 하세요
- 설교자의 개인적 경험을 대체하지 마세요
```

### 유저 프롬프트 템플릿 (핵심 메시지 생성 예시)

```
당신은 설교 준비 도우미입니다.
아래 정보를 바탕으로 **설교 핵심 메시지 후보 3가지**를 제안해주세요.

[본문]
{passage}

[본문 관찰 노트]
{observation_notes}

[설교 상황]
- 설교 대상: {audience}
- 교회 상황: {church_context}

[지침]
- 각 메시지는 한 문장(30자 이내)으로 요약하세요
- 반드시 본문의 중심 주제에서 출발하세요
- 복음(은혜)에 기반해야 합니다
- 행위/노력 중심의 메시지는 피하세요
- 각 메시지에 1~2문장의 설명을 덧붙이세요
```

### JSON 응답 스키마

```typescript
interface AIMessageResponse<T> {
  success: boolean
  data: T
  warning?: string  // 신학적 주의사항이 있을 때
}

// 핵심 메시지 생성 응답
interface CoreMessageResult {
  candidates: CoreMessage[]
}

interface CoreMessage {
  message: string
  description: string
  bible_basis: string  // 본문 근거
  caution?: string     // 오해 가능성 주의
}

// 개요 생성 응답
interface OutlineResult {
  introduction_suggestion: string
  main_points: {
    title: string
    key_idea: string
    supporting_verses: string[]
    application_suggestion: string
  }[]
  conclusion_suggestion: string
}

// 초안 생성 응답
interface DraftResult {
  full_text: string
  estimated_duration_minutes: number
  sections: {
    type: 'introduction' | 'body' | 'conclusion'
    content: string
  }[]
  abstract_phrases?: {
    original: string
    suggestion: string
    reason: string
  }[]
}
```

---

## 8. API 설계

### RESTful API 목록

```typescript
// ========================
// 설교 CRUD
// ========================

// POST /api/sermons
// 목적: 새 설교 생성
// Request:
{
  "title": "은혜로 말미암은 구원",
  "passage": "에베소서 2:1-10",
  "sermon_date": "2026-06-07",
  "series": "에베소서 강해",
  "audience": ["전체"],
  "church_context": "새 성전 이전 후 첫 주일"
}
// Response:
{
  "success": true,
  "data": {
    "id": "uuid-xxx",
    "title": "은혜로 말미암은 구원",
    "status": "draft",
    "created_at": "2026-05-21T10:00:00Z"
  }
}

// GET /api/sermons
// 목적: 설교 목록 조회
// Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid-xxx",
      "title": "은혜로 말미암은 구원",
      "passage": "에베소서 2:1-10",
      "sermon_date": "2026-06-07",
      "status": "in_progress",
      "updated_at": "2026-05-21T10:00:00Z"
    }
  ]
}

// GET /api/sermons/:id
// 목적: 단일 설교 조회 (모든 필드 포함)

// PUT /api/sermons/:id
// 목적: 설교 내용 저장
// Request:
{
  "manuscript": "...",
  "outline": { ... },
  "status": "in_progress"
}

// DELETE /api/sermons/:id
// 목적: 설교 삭제

// ========================
// AI 생성 API
// ========================

// POST /api/sermons/:id/ai/generate-observations
// 목적: 본문 관찰 질문 생성
// Request: {}
// Response:
{
  "success": true,
  "data": {
    "questions": [
      "이 본문에서 가장 반복되는 단어는 무엇인가요?",
      "바울이 '그러나'라는 접속사로 연결하는 두 상태의 차이는 무엇인가요?"
    ]
  }
}

// POST /api/sermons/:id/ai/generate-core-message
// 목적: 핵심 메시지 후보 생성
// Response: CoreMessageResult (위 참조)

// POST /api/sermons/:id/ai/generate-title
// 목적: 설교 제목 후보 생성
// Response:
{
  "success": true,
  "data": {
    "candidates": [
      "죄에서 은혜로",
      "하나님의 작품",
      "은혜로 부름받은 자"
    ]
  }
}

// POST /api/sermons/:id/ai/generate-outline
// 목적: 설교 개요 생성
// Response: OutlineResult (위 참조)

// POST /api/sermons/:id/ai/generate-application
// 목적: 적용 질문 생성
// Response:
{
  "success": true,
  "data": {
    "applications": [
      {
        "audience": "청년",
        "question": "은혜로 구원받았다는 사실이 이번 주 당신의 결정에 어떤 영향을 주어야 할까요?"
      },
      {
        "audience": "장년",
        "question": "..."
      }
    ]
  }
}

// POST /api/sermons/:id/ai/generate-draft
// 목적: 초안 설교문 생성
// Response: DraftResult (위 참조)

// POST /api/sermons/:id/ai/check-abstract
// 목적: 추상적 문장 피드백
// Request:
{
  "text": "우리는 더욱 신실하게 살아야 합니다"
}
// Response:
{
  "success": true,
  "data": {
    "feedback": [
      {
        "original": "더욱 신실하게 살아야 합니다",
        "issue": "추상적이고 행위 중심의 표현입니다",
        "suggestion": "그리스도의 신실하심이 우리를 매일 붙드심을 기억합시다",
        "reason": "'~해야 한다'는 행위 구원으로 오해될 수 있습니다. 복음은 우리가 무엇을 해야 하는지보다 하나님이 무엇을 하셨는지에 초점을 둡니다"
      }
    ]
  }
}

// POST /api/sermons/:id/convert-to-study-guide
// 목적: 설교를 소그룹 리더가이드로 변환
// Response: StudyGuideOutput (기존 스키마 재사용)
```

---

## 9. DB 스키마 제안

```sql
-- 1. sermons (설교 기본 정보)
CREATE TABLE sermons (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id),
  title         TEXT NOT NULL DEFAULT '',
  passage       TEXT NOT NULL DEFAULT '',
  book          TEXT,                          -- 성경책 이름 (검색용)
  chapter_start INT,
  chapter_end   INT,
  verse_start   INT,
  verse_end     INT,
  sermon_date   DATE,
  series        TEXT,                          -- 시리즈 이름
  season        TEXT,                          -- 절기
  audience      TEXT[] DEFAULT '{}',           -- 대상 배열
  church_context TEXT,
  status        TEXT DEFAULT 'draft'
                CHECK (status IN ('draft', 'in_progress', 'completed')),
  version       INT DEFAULT 1,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- 2. sermon_notes (설교 준비 노트)
CREATE TABLE sermon_notes (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sermon_id           UUID NOT NULL REFERENCES sermons(id) ON DELETE CASCADE,
  core_message        TEXT,
  observation_notes   TEXT,
  background_notes    TEXT,
  interpretation_notes TEXT,
  illustration_notes  TEXT,
  application_points  TEXT,
  UNIQUE(sermon_id)
);

-- 3. sermon_outlines (설교 개요)
CREATE TABLE sermon_outlines (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sermon_id       UUID NOT NULL REFERENCES sermons(id) ON DELETE CASCADE,
  introduction    TEXT,
  conclusion      TEXT,
  -- main_points는 JSONB로 저장 (유연성)
  main_points     JSONB DEFAULT '[]',
  UNIQUE(sermon_id)
);

-- 4. sermon_manuscripts (설교 원고)
CREATE TABLE sermon_manuscripts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sermon_id   UUID NOT NULL REFERENCES sermons(id) ON DELETE CASCADE,
  content     TEXT,
  word_count  INT,
  UNIQUE(sermon_id)
);

-- 5. sermon_versions (버전 관리)
CREATE TABLE sermon_versions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sermon_id   UUID NOT NULL REFERENCES sermons(id) ON DELETE CASCADE,
  version     INT NOT NULL,
  snapshot    JSONB NOT NULL,       -- 전체 상태 스냅샷
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 6. generated_outputs (AI 생성 결과 캐시/히스토리)
CREATE TABLE generated_outputs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sermon_id   UUID NOT NULL REFERENCES sermons(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,        -- 'observation' | 'core_message' | 'outline' | 'draft' | 'application'
  input_data  JSONB,                -- 생성에 사용된 입력
  output_data JSONB NOT NULL,       -- 생성 결과
  user_action TEXT,                 -- 'accepted' | 'rejected' | 'modified'
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 인덱스
CREATE INDEX idx_sermons_user_id ON sermons(user_id);
CREATE INDEX idx_sermons_status ON sermons(status);
CREATE INDEX idx_sermons_sermon_date ON sermons(sermon_date DESC);
CREATE INDEX idx_generated_outputs_sermon ON generated_outputs(sermon_id, type);
```

---

## 10. UX 디테일

### 자동 저장
- 입력 후 3초 debounce → PUT /api/sermons/:id
- 저장 상태 표시: "저장됨" / "저장 중..." / "수정됨"
- 오프라인 대비 localStorage 백업

### 버전 관리
- 저장 시 자동 버전 증가 (sermon_versions에 스냅샷)
- UI 하단: "버전 3" 클릭 → 버전 히스토리 드롭다운
- 버전 간 diff 표시 (선택한 두 버전 비교)

### AI 생성 전/후 비교
- AI 생성 결과 수락 전, 기존 내용과 diff 표시
- "수락", "수정 후 적용", "취소" 3단계 선택

### 핵심 메시지 미입력 경고
- 개요 생성/초안 생성 시 핵심 메시지가 비어있으면 경고
- "핵심 메시지를 먼저 입력하면 더 집중된 개요를 생성할 수 있습니다"

### 적용이 추상적일 때 안내
- 적용에 "~해야 합니다", "~하자" 같은 추상적 표현이 많으면 안내
- "더 구체적인 적용을 위해 [대상]이 [어떤 상황]에서 [무엇을] 할 수 있을지 생각해보세요"

### 예화가 본문보다 길 때 경고
- 예화 섹션의 글자 수 > 본문 해석 섹츠의 글자 수이면 경고
- "예화가 본문보다 깁니다. 본문의 메시지가 희석되지 않도록 주의하세요"

### 설교 대상별 적용 분기
- 적용 생성 시 대상(청년/장년/학생)별로 분기
- UI: 탭 또는 아코디언으로 대상별 적용 표시

### 기타 UX
- 본문 입력 시 자동으로 책/장/절 파싱
- 핵심 메시지 글자수 카운터 (권장: 20~40자)
- 설교문 예상 시간 계산 (성인 기준 분당 350~400자)
- 완료된 설교는 "대시보드"에 노출
- PDF/Word 내보내기 버튼

---

## 11. MVP와 확장 기능 구분

### MVP (Phase 1 — 6주)

| 기능 | 우선순위 | 비고 |
|------|---------|------|
| 설교 CRUD (목록/생성/조회/수정/삭제) | P0 | 기본 |
| 설교 기본 정보 입력 (제목, 본문, 날짜, 시리즈) | P0 | |
| 메모 필드 (관찰, 해석, 적용) | P0 | textarea |
| 개요 편집 (구조화된 입력) | P0 | 수동 입력 |
| 설교문 에디터 | P0 | 텍스트 에디터 |
| 자동 저장 | P0 | |
| AI: 핵심 메시지 후보 생성 | P1 | |
| AI: 설교 개요 생성 | P1 | |
| AI: 적용 질문 생성 | P1 | |
| AI: 초안 설교문 생성 | P1 | |
| 버전 관리 (스냅샷 저장) | P1 | 기본 버전 |
| 상태 관리 (draft/in_progress/completed) | P1 | |

### Phase 2 (4주)

| 기능 | 비고 |
|------|------|
| AI: 본문 관찰 질문 생성 | |
| AI: 설교 제목 후보 생성 | |
| AI: 문장 피드백 (추상 표현 감지) | |
| 설교 대상별 적용 분기 | |
| PDF/Word 내보내기 | |
| 설교 시리즈 관리 | |

### Phase 3 (4주)

| 기능 | 비고 |
|------|------|
| AI: 소그룹 리더가이드 변환 | 기존 API 재사용 |
| 절기/특별일 템플릿 | |
| 설교 통계 대시보드 | |
| 교역자 팀 협업 (공유/댓글) | |
| AI 생성 전/후 비교 UI | |
| 오프라인 지원 | |

---

## 12. 최종 정리

### 1. 추천 페이지 구조

```
/sermon                  → 설교 목록 (대시보드)
/sermon/new              → 새 설교 생성
/sermon/[id]             → 설교 준비 워크벤치 (메인 페이지)
/sermon/[id]/preview     → 설교 미리보기
```

### 2. MVP 기능 목록

```
[필수]
- 설교 CRUD
- 본문/제목/날짜 입력
- 관찰/해석/적용 메모
- 개요 편집기
- 설교문 에디터
- 자동 저장
- 버전 관리 (기본)

[AI - MVP]
- 핵심 메시지 후보 생성
- 설교 개요 생성
- 적용 질문 생성
- 초안 설교문 생성
```

### 3. 핵심 AI 기능 목록

```
MVP AI:
1. 핵심 메시지 후보 생성 (본문 → 3개 메시지)
2. 설교 개요 생성 (메시지 → 3-4 point 구조)
3. 적용 질문 생성 (메시지 → 대상별 적용)
4. 초안 설교문 생성 (개요 → 원고)

Phase 2 AI:
5. 본문 관찰 질문 생성
6. 설교 제목 후보 생성
7. 추상 표현 피드백

Phase 3 AI:
8. 소그룹 리더가이드 변환
```

### 4. 개발 우선순위

```
Week 1-2: DB 스키마 + API CRUD + 기본 UI
Week 3-4: AI API 연동 (메시지/개요/적용/초안)
Week 5-6: UX 향상 (자동 저장, 버전, 상태 관리, 폴리싱)
Week 7-8: 피드백 반영 + Phase 2 기능
```

---

## 부록: 기술 구현 참고

### AI Service Layer 구조 (예시)

```typescript
// src/lib/ai/sermon-service.ts

interface AIServiceConfig {
  model: string
  temperature: number
  maxTokens: number
}

type AIType =
  | 'generate-observations'
  | 'generate-core-message'
  | 'generate-title'
  | 'generate-outline'
  | 'generate-application'
  | 'generate-draft'
  | 'check-abstract'
  | 'convert-to-study-guide'

const SYSTEM_PROMPTS: Record<AIType, string> = {
  'generate-core-message': `당신은 설교 준비 도우미 AI입니다...`,
  // ...
}

const USER_PROMPT_TEMPLATES: Record<AIType, (input: any) => string> = {
  'generate-core-message': (input) => `[본문]\n${input.passage}\n\n[관찰 노트]\n${input.observation_notes}...`,
  // ...
}

async function callAI<T>(type: AIType, input: any): Promise<T> {
  const systemPrompt = SYSTEM_PROMPTS[type]
  const userPrompt = USER_PROMPT_TEMPLATES[type](input)

  const response = await fetch(process.env.AI_API_URL!, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.AI_API_KEY}` },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
    }),
  })

  return response.json()
}
```

### 컴포넌트 구조 (Next.js App Router)

```
src/app/sermon/
  page.tsx                  → 설교 목록 페이지
  new/page.tsx              → 새 설교 생성 페이지
  [id]/
    page.tsx                → 설교 워크벤치 메인
    preview/page.tsx        → 설교 미리보기

src/components/sermon/
  SermonList.tsx            → 설교 목록
  SermonCard.tsx            → 설교 카드
  SermonWorkbench.tsx       → 워크벤치 메인 레이아웃
  SermonSidebar.tsx         → 단계 진행 + 메뉴
  SermonEditor.tsx          → 입력 탭
  SermonOutlineEditor.tsx   → 개요 편집기
  SermonManuscriptEditor.tsx→ 원고 에디터
  SermonAIPanel.tsx         → AI 도움 패널
  AIGenerateButton.tsx      → AI 생성 버튼
  SermonPreview.tsx         → 미리보기

src/lib/ai/
  sermon-service.ts         → AI 서비스 레이어
  prompts/
    core-message.ts
    outline.ts
    draft.ts
    application.ts
    observation.ts
    feedback.ts
```
