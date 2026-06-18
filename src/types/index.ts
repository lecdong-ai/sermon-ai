export type UserRole = 'user' | 'admin'

export interface UserProfile {
  id: string
  email: string
  name?: string
  role: UserRole
  created_at: string
}

// ─── Usage Types ───

export interface UserUsage {
  id: string
  user_id: string
  plan: string
  user_status: string
  trial_used: number
  trial_limit: number
  trial_start_at: string
  trial_end_at: string
  monthly_used: number
  monthly_limit: number
  workspace_used: number
  workspace_limit: number
  last_reset_month: string
  supporter_until?: string | null
  created_at: string
  updated_at: string
}

// ─── Core Result Types ───

export interface Summary {
  central_topic: string
  intro: string
  body: string
  conclusion: string
  application: string
  passage_text?: string
}

export interface AgeGroupMaterial {
  goal: string
  coreMessage: string
  icebreakers: string[]
  observationQuestions: string[]
  interpretationQuestions: string[]
  applicationQuestions: string[]
  prayerTopics: string[]
}

export interface GroupDiscussion {
  title: string
  passage: string
  topic: string
  summary: string
  directionPoints: string[]
  teens: AgeGroupMaterial
  twentiesThirties: AgeGroupMaterial
  forties: AgeGroupMaterial
  fiftiesSixties: AgeGroupMaterial
  seventiesPlus: AgeGroupMaterial
  closingQuestions: string[]
  representativePrayer: string
}

export interface CardSlide {
  title: string
  content: string
  imagePrompt: string
}

export interface CardNews {
  slides: CardSlide[]
}

export interface SermonScript {
  script: string
}

export interface ShortsScript {
  script: string
}

export interface PPTShare {
  title: string
  content: string
}

export interface PPTData {
  slides: PPTShare[]
}

export interface SermonResultData {
  summary?: Summary | null
  groupDiscussion?: GroupDiscussion | null
  cardNews?: CardNews | null
  sermonScript?: string | null
  shortsScript?: string | null
  pptData?: PPTData | null
  hymn_title?: string
  hymn_number?: string
  sermon_title?: string
  sermon_passage?: string
}

// ─── API Types ───

export interface SermonRecord {
  id: string
  title: string
  passage: string
  file_name: string
  raw_text: string
  result: SermonResultData
  created_at: string
}

export interface FileUploadResponse {
  success: boolean
  sermonId?: string
  preview?: string
  error?: string
  warning?: string
}

// ─── OpenAI Response Schemas ───

export interface SummaryResponse {
  title: string
  passage: string
  central_topic: string
  intro: string
  body: string
  conclusion: string
  application: string
  passage_text: string
}

export const SUMMARY_SCHEMA = {
  type: 'json_schema' as const,
  json_schema: {
    name: 'summary',
    strict: true,
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: '설교 제목 (원고에서 추출)' },
        passage: { type: 'string', description: '성경 본문 (참조 구절)' },
        central_topic: { type: 'string', description: '중심 주제 — 설교 전체를 관통하는 핵심 주제를 한 문장으로 밝힘' },
        intro: { type: 'string', description: '서론 — 본문 배경과 저자의 의도, 인간 문제와 복음의 대답을 포함하여 설교 도입부 작성. 600~1000자. 구체적이고 풍성하게.' },
        body: { type: 'string', description: '본론 — 3대지 설교형. 각 대지: 제목(짧고 명확) + 설명(2~4문장) + ▶ 핵심 의미: .... 가독성 좋게 줄바꿈 충분히. 각 대지당 400~600자, 총 1000~1500자. 성경 인용과 예화 포함.' },
        conclusion: { type: 'string', description: '결론 — 설교 전체의 핵심 메시지를 압축해서 정리. 중심 진술이 한눈에 보이도록 작성. 300~500자.' },
        application: { type: 'string', description: '적용 — 성도들이 실제 삶에서 붙들 수 있도록 3~5가지 구체적 방법 제시. 개인과 공동체 측면을 나눔. 400~700자.' },
        passage_text: { type: 'string', description: '설교 본문 성경 구절 전문 (개역개정, KRV)을 그대로 인용하세요. 예: "오순절 날이 이미 이르매 그들이 다 같이 한 곳에 모였더니..."' },
      },
      required: ['title', 'passage', 'central_topic', 'intro', 'body', 'conclusion', 'application', 'passage_text'],
      additionalProperties: false,
    },
  },
}

export const GROUP_DISCUSSION_SCHEMA = {
  type: 'json_schema' as const,
  json_schema: {
    name: 'group_discussion',
    strict: true,
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: '제목' },
        passage: { type: 'string', description: '본문' },
        topic: { type: 'string', description: '주제' },
        summary: { type: 'string', description: '본문 핵심 요약 (4~6문장)' },
        directionPoints: { type: 'array', items: { type: 'string' }, description: '전체 나눔 방향 핵심 포인트 (bullet)' },
        teens:   {
          type: 'object',
          properties: {
            goal: { type: 'string', description: '나눔 목표' },
            coreMessage: { type: 'string', description: '연령대에 맞는 핵심 메시지' },
            icebreakers: { type: 'array', items: { type: 'string' }, description: '아이스브레이크 질문 2개' },
            observationQuestions: { type: 'array', items: { type: 'string' }, description: '본문 관찰 질문 2개' },
            interpretationQuestions: { type: 'array', items: { type: 'string' }, description: '해석/이해 질문 2개' },
            applicationQuestions: { type: 'array', items: { type: 'string' }, description: '삶 적용 질문 3개' },
            prayerTopics: { type: 'array', items: { type: 'string' }, description: '기도제목 3개' },
          },
          required: ['goal', 'coreMessage', 'icebreakers', 'observationQuestions', 'interpretationQuestions', 'applicationQuestions', 'prayerTopics'],
          additionalProperties: false,
        },
        twentiesThirties:  {
          type: 'object',
          properties: {
            goal: { type: 'string', description: '나눔 목표' },
            coreMessage: { type: 'string', description: '연령대에 맞는 핵심 메시지' },
            icebreakers: { type: 'array', items: { type: 'string' }, description: '아이스브레이크 질문 2개' },
            observationQuestions: { type: 'array', items: { type: 'string' }, description: '본문 관찰 질문 2개' },
            interpretationQuestions: { type: 'array', items: { type: 'string' }, description: '해석/이해 질문 2개' },
            applicationQuestions: { type: 'array', items: { type: 'string' }, description: '삶 적용 질문 3개' },
            prayerTopics: { type: 'array', items: { type: 'string' }, description: '기도제목 3개' },
          },
          required: ['goal', 'coreMessage', 'icebreakers', 'observationQuestions', 'interpretationQuestions', 'applicationQuestions', 'prayerTopics'],
          additionalProperties: false,
        },
        forties:  {
          type: 'object',
          properties: {
            goal: { type: 'string', description: '나눔 목표' },
            coreMessage: { type: 'string', description: '연령대에 맞는 핵심 메시지' },
            icebreakers: { type: 'array', items: { type: 'string' }, description: '아이스브레이크 질문 2개' },
            observationQuestions: { type: 'array', items: { type: 'string' }, description: '본문 관찰 질문 2개' },
            interpretationQuestions: { type: 'array', items: { type: 'string' }, description: '해석/이해 질문 2개' },
            applicationQuestions: { type: 'array', items: { type: 'string' }, description: '삶 적용 질문 3개' },
            prayerTopics: { type: 'array', items: { type: 'string' }, description: '기도제목 3개' },
          },
          required: ['goal', 'coreMessage', 'icebreakers', 'observationQuestions', 'interpretationQuestions', 'applicationQuestions', 'prayerTopics'],
          additionalProperties: false,
        },
        fiftiesSixties:  {
          type: 'object',
          properties: {
            goal: { type: 'string', description: '나눔 목표' },
            coreMessage: { type: 'string', description: '연령대에 맞는 핵심 메시지' },
            icebreakers: { type: 'array', items: { type: 'string' }, description: '아이스브레이크 질문 2개' },
            observationQuestions: { type: 'array', items: { type: 'string' }, description: '본문 관찰 질문 2개' },
            interpretationQuestions: { type: 'array', items: { type: 'string' }, description: '해석/이해 질문 2개' },
            applicationQuestions: { type: 'array', items: { type: 'string' }, description: '삶 적용 질문 3개' },
            prayerTopics: { type: 'array', items: { type: 'string' }, description: '기도제목 3개' },
          },
          required: ['goal', 'coreMessage', 'icebreakers', 'observationQuestions', 'interpretationQuestions', 'applicationQuestions', 'prayerTopics'],
          additionalProperties: false,
        },
        seventiesPlus:  {
          type: 'object',
          properties: {
            goal: { type: 'string', description: '나눔 목표' },
            coreMessage: { type: 'string', description: '연령대에 맞는 핵심 메시지' },
            icebreakers: { type: 'array', items: { type: 'string' }, description: '아이스브레이크 질문 2개' },
            observationQuestions: { type: 'array', items: { type: 'string' }, description: '본문 관찰 질문 2개' },
            interpretationQuestions: { type: 'array', items: { type: 'string' }, description: '해석/이해 질문 2개' },
            applicationQuestions: { type: 'array', items: { type: 'string' }, description: '삶 적용 질문 3개' },
            prayerTopics: { type: 'array', items: { type: 'string' }, description: '기도제목 3개' },
          },
          required: ['goal', 'coreMessage', 'icebreakers', 'observationQuestions', 'interpretationQuestions', 'applicationQuestions', 'prayerTopics'],
          additionalProperties: false,
        },
        closingQuestions: { type: 'array', items: { type: 'string' }, description: '전체 마무리 질문 4개' },
        representativePrayer: { type: 'string', description: '대표기도문 1개' },
      },
      required: ['title', 'passage', 'topic', 'summary', 'directionPoints', 'teens', 'twentiesThirties', 'forties', 'fiftiesSixties', 'seventiesPlus', 'closingQuestions', 'representativePrayer'],
      additionalProperties: false,
    },
  },
}

export const CARD_NEWS_SCHEMA = {
  type: 'json_schema' as const,
  json_schema: {
    name: 'card_news',
    strict: true,
    schema: {
      type: 'object',
      properties: {
        slides: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string', description: '카드 제목 (12자 이내, 짧고 임팩트 있게)' },
              content: { type: 'string', description: '카드 내용 (4~6문장, 150~250자, 풍성하게)' },
              imagePrompt: { type: 'string', description: 'DALL-E 이미지 생성을 위한 상세 영어 프롬프트 (100~200자)' },
            },
            required: ['title', 'content', 'imagePrompt'],
            additionalProperties: false,
          },
          description: '8장의 카드뉴스 (커버/도입, 배경+메시지1, 메시지2, 메시지3, 메시지4+예화, 적용1, 적용2, 마무리)',
        },
      },
      required: ['slides'],
      additionalProperties: false,
    },
  },
}

export const SERMON_SCRIPT_SCHEMA = {
  type: 'json_schema' as const,
  json_schema: {
    name: 'sermon_script',
    strict: true,
    schema: {
      type: 'object',
      properties: {
        script: { type: 'string', description: '유튜브 영상용 설교 대본. 약 2000자 내외. 첫 2~3문장은 집중을 끄는 훅, 본론은 2~3개 핵심 포인트(짧은 설명+삶의 적용), 마지막은 은혜로운 결론. 따뜻하고 부드러운 구어체.' },
      },
      required: ['script'],
      additionalProperties: false,
    },
  },
}

export const SHORTS_SCRIPT_SCHEMA = {
  type: 'json_schema' as const,
  json_schema: {
    name: 'shorts_script',
    strict: true,
    schema: {
      type: 'object',
      properties: {
        script: { type: 'string', description: '60~90초 유튜브 쇼츠 대본 (250~350자, 오프닝훅/본문/클로징 구조, 은유와 비유 활용, 평어체)' },
      },
      required: ['script'],
      additionalProperties: false,
    },
  },
}

export const PPT_SCHEMA = {
  type: 'json_schema' as const,
  json_schema: {
    name: 'ppt_outline',
    strict: true,
    schema: {
      type: 'object',
      properties: {
        slides: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string', description: '슬라이드 제목 (12자 이내 간결하게)' },
              content: { type: 'string', description: '슬라이드 내용 — 반드시 5~8개의 불릿 포인트로 구성, 각 불릿은 15~20자 내외의 완전한 문장, 설교자가 30~60초간 설명 가능한 충분한 분량' },
            },
            required: ['title', 'content'],
            additionalProperties: false,
          },
          description: '16~20장 PPT 슬라이드 (표지/말씀/개요/본문배경/포인트4개/요약/교훈/적용/결단/인용/기도/마무리)',
        },
      },
      required: ['slides'],
      additionalProperties: false,
    },
  },
}

// ─── Study Guide (소그룹 리더가이드) ───

export interface StudyGuideInput {
  title: string
  passage: string
  sermonText: string
  ageGroup?: string
  atmosphere?: string
  emphasis?: string[]
  avoid?: string[]
  reference?: string
}

export interface OpeningQuestion {
  question: string
  intent: string
  ifSilence: string
  leaderTip: string
}

export interface SermonDiscussionQuestion {
  type: 'observation' | 'interpretation' | 'application'
  question: string
  intent: string
  expectedResponses: string[]
  followUp: string
  scripture: string
  bridge: string
}

export interface LifeApplicationQuestion {
  text: string
  intention: string
  silenceGuide: string
  tip: string
}

export interface StudyGuideOutput {
  title: string
  focus: string[]
  readingGuide: string
  openingQuestions: OpeningQuestion[]
  sermonDiscussion: SermonDiscussionQuestion[]
  lifeApplication: string[]
  prayerTopics: string[]
  leaderNotes: string[]
}

export interface StudyGuideRecord {
  id: string
  user_id: string
  version: number
  input_data: StudyGuideInput
  output_data: StudyGuideOutput
  is_edited: boolean
  created_at: string
  updated_at: string
}

export const STUDY_GUIDE_SCHEMA = {
  type: 'json_schema' as const,
  json_schema: {
    name: 'study_guide',
    strict: true,
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: '설교 핵심을 한 문장으로 드러내는 제목. "참된 신앙은 ~이다"처럼 메시지가 분명한 문장형 제목' },
        focus: {
          type: 'array',
          items: { type: 'string' },
          description: '이번 모임에서 리더가 꼭 붙들어야 할 핵심 3가지를 번호로 정리. 마지막은 →로 시작하는 한 줄 결론/초청문',
        },
        readingGuide: { type: 'string', description: '본문을 함께 읽도록 초대하는 한 줄 안내문' },
        openingQuestions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              question: { type: 'string', description: '여는 질문. 아이스브레이크 성격이면서도 신앙의 태도를 돌아보게 하는 질문' },
              intent: { type: 'string', description: '질문 의도' },
              ifSilence: { type: 'string', description: '침묵이 흐를 때 리더가 사용할 멘트' },
              leaderTip: { type: 'string', description: '진행 팁' },
            },
            required: ['question', 'intent', 'ifSilence', 'leaderTip'],
            additionalProperties: false,
          },
          description: '여는 질문 2개',
        },
        sermonDiscussion: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['observation', 'interpretation', 'application'], description: '질문 유형: 관찰 1문항, 해석 2문항, 적용 1문항 순서' },
              question: { type: 'string', description: '질문 내용' },
              intent: { type: 'string', description: '질문 의도' },
              expectedResponses: { type: 'array', items: { type: 'string' }, description: '예상 응답 방향 2개' },
              followUp: { type: 'string', description: '보조 질문' },
              scripture: { type: 'string', description: '참고 성경구절' },
              bridge: { type: 'string', description: '다음 질문으로 연결하는 자연스러운 연결 문장' },
            },
            required: ['type', 'question', 'intent', 'expectedResponses', 'followUp', 'scripture', 'bridge'],
            additionalProperties: false,
          },
          description: '말씀 나눔 4문항 (1 관찰, 2 해석, 1 적용)',
        },
        lifeApplication: {
          type: 'array',
          items: { type: 'string' },
          description: '실천 질문 2개. "이번 주", "내일", "구체적인 상황" 등의 표현으로 실제 행동 연결. 마지막 질문은 중보기도로 이어지게',
        },
        prayerTopics: {
          type: 'array',
          items: { type: 'string' },
          description: '함께 기도제목 3개. 1)개인의 내면 변화 2)삶의 현장에서의 순종 3)공동체의 성숙',
        },
        leaderNotes: {
          type: 'array',
          items: { type: 'string' },
          description: '리더가 오늘 나눔에서 꼭 기억할 점 3가지',
        },
      },
      required: ['title', 'focus', 'readingGuide', 'openingQuestions', 'sermonDiscussion', 'lifeApplication', 'prayerTopics', 'leaderNotes'],
      additionalProperties: false,
    },
  },
}

// ─── Generation Status ───

export type GenerationItem =
  | 'summary'
  | 'groupDiscussion'
  | 'cardNews'
  | 'sermonScript'
  | 'shortsScript'
  | 'pptData'

export type GenerationStatus = 'idle' | 'generating' | 'done' | 'error'

export interface GenerationState {
  status: GenerationStatus
  error?: string
}

// ─── Sermon Workspace (설교 준비 워크스페이스) ───

export interface SermonMainPoint {
  title: string
  content: string
  sub_points?: string[]
  application?: string
  illustration?: string
}

export interface SermonOutline {
  introduction?: string
  main_points: SermonMainPoint[]
  conclusion?: string
}

export interface SermonWorkspace {
  id: string
  user_id: string
  title: string
  passage: string
  book?: string
  chapter_start?: number
  chapter_end?: number
  verse_start?: number
  verse_end?: number
  sermon_date?: string
  series?: string
  season?: string
  audience: string[]
  church_context?: string
  core_message?: string
  observation_notes?: string
  background_notes?: string
  interpretation_notes?: string
  illustration_notes?: string
  application_points?: string
  outline?: SermonOutline
  manuscript?: string
  status: 'draft' | 'in_progress' | 'completed'
  version: number
  created_at: string
  updated_at: string
}

export interface SermonListItem {
  id: string
  title: string
  passage: string
  sermon_date?: string
  status: 'draft' | 'in_progress' | 'completed'
  version: number
  updated_at: string
}

export interface CreateSermonInput {
  title: string
  passage: string
  book?: string
  chapter_start?: number
  chapter_end?: number
  verse_start?: number
  verse_end?: number
  sermon_date?: string
  series?: string
  season?: string
  audience?: string[]
  church_context?: string
}

export interface UpdateSermonInput {
  title?: string
  passage?: string
  book?: string
  chapter_start?: number
  chapter_end?: number
  verse_start?: number
  verse_end?: number
  sermon_date?: string
  series?: string
  season?: string
  audience?: string[]
  church_context?: string
  core_message?: string
  observation_notes?: string
  background_notes?: string
  interpretation_notes?: string
  illustration_notes?: string
  application_points?: string
  outline?: SermonOutline
  manuscript?: string
  status?: 'draft' | 'in_progress' | 'completed'
}

// ─── AI Generation Types ───

export interface CoreMessage {
  message: string
  description: string
  bible_basis: string
  caution?: string
}

export interface CoreMessageResult {
  candidates: CoreMessage[]
}

export interface OutlineCandidate {
  title: string
  introduction_suggestion: string
  main_points: {
    title: string
    key_idea: string
    supporting_verses: string[]
    application_suggestion: string
  }[]
  conclusion_suggestion: string
}

export interface OutlineResult {
  candidates: OutlineCandidate[]
}

export interface DraftResult {
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

export interface SermonVersion {
  id: string
  sermon_id: string
  version: number
  snapshot: any
  created_at: string
}

export interface GeneratedOutput {
  id: string
  sermon_id: string
  type: string
  input_data?: any
  output_data: any
  user_action?: string
  created_at: string
}
