// ─── Workspace Types (church-school) ───

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

export interface SermonResultData {
  summary?: Summary | null
  groupDiscussion?: GroupDiscussion | null
  cardNews?: CardNews | null
  sermonScript?: string | null
  shortsScript?: string | null
  sermon_title?: string
  sermon_passage?: string
}

export interface SermonRecord {
  id: string
  title: string
  passage: string
  file_name: string
  raw_text: string
  result: SermonResultData
  created_at: string
}

export type GenerationItem =
  | 'summary'
  | 'groupDiscussion'
  | 'cardNews'
  | 'sermonScript'
  | 'shortsScript'

export type GenerationStatus = 'idle' | 'generating' | 'done' | 'error'

export interface GenerationState {
  status: GenerationStatus
  error?: string
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
        teens: {
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
        twentiesThirties: {
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
        forties: {
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
        fiftiesSixties: {
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
        seventiesPlus: {
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

// ─── PPT Slide (AI PPT 스튜디오) ───

export type PptSlideLayout =
  | 'title' | 'bullets' | 'section-header' | 'quote' | 'two-column' | 'closing'
  | 'vs-contrast' | 'timeline-flow' | 'central-focus' | 'grid-matrix'

export interface PptSlideColor {
  /** hex (# 없이, 예: "1B3A5C") */
  primary: string
  /** hex (# 없이) */
  accent: string
  /** hex (# 없이) */
  background: string
}

/** 텍스트 스타일 (사용자 편집 가능) */
export interface PptTextStyle {
  /** 글꼴 — 'Malgun Gothic' | 'Nanum Gothic' | 'Nanum Myeongjo' | 'Batang' | 'Dotum' | 'Pretendard' */
  fontFace?: string
  /** 글자 크기 (pt) */
  fontSize?: number
  bold?: boolean
  italic?: boolean
  underline?: boolean
  /** 텍스트 색상 hex 6자리 (# 제외) */
  color?: string
  align?: 'left' | 'center' | 'right'
  valign?: 'top' | 'middle' | 'bottom'
  /** 행간 배수 (1.0~2.0) */
  lineSpacing?: number
}

/** 개별 콘텐츠 항목 (text + 선택적 스타일 오버라이드) */
export interface ContentItem {
  text: string
  /** 개별 스타일. 미설정 시 PptSlide.bodyStyle 상속 */
  style?: Partial<PptTextStyle>
}

/** 텍스트 박스 위치 (inches, pptxgenJS 좌표계) */
export interface PptSlideTextPosition {
  x: number
  y: number
  w: number
  h: number
}

export interface PptSlide {
  title: string
  /** 멀티레벨 제목 배열. 미설정 시 [{text:title}] 자동 변환 */
  titles?: ContentItem[]
  content: ContentItem[]
  layout: PptSlideLayout
  /** 핵심 메시지 요약 (1~2문장) — 발표자 참고용, 이미지에 포함되지 않음 */
  coreMessage?: string
  /** 발표자 스크립트 (청중과의 상호작용 포함) — 발표자 참고용 */
  speakerNotes?: string
  /** 슬라이드 색상 팔레트 — 렌더링용 */
  color?: PptSlideColor
  /** 카메라 구도 */
  cameraAngle?: string
  /** 조명 */
  lighting?: string
  /** 폰트 스타일 */
  fontStyle?: string
  /** 아이콘/여백 위치 */
  iconPosition?: string
  /** 제목 텍스트 스타일 (사용자 편집, PPTX + 미리보기에 적용) */
  titleStyle?: PptTextStyle
  /** 본문 텍스트 스타일 (사용자 편집) */
  bodyStyle?: PptTextStyle
  /** 제목 텍스트 박스 위치 (inches, 편집용) */
  titlePosition?: PptSlideTextPosition
  /** 본문 텍스트 박스 위치 (inches, 편집용) */
  bodyPosition?: PptSlideTextPosition
}

export interface PptData {
  slides: PptSlide[]
}

// ─── PPT Slide Structured Schema (GPT-5.5용, 10레이아웃 + 8필드 디자인 메타) ───

export const PPT_SLIDE_STRUCTURED_SCHEMA = {
  type: 'json_schema' as const,
  json_schema: {
    name: 'ppt_slides_structured',
    strict: true,
    schema: {
      type: 'object',
      properties: {
        slides: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string', description: '슬라이드 제목 (12자 이내, 간결하고 기억에 남게)' },
              content: {
                type: 'array',
                items: { type: 'string' },
                description: '슬라이드 내용 항목들 (각 15~30자 내외). 레이아웃에 맞춰 1~8개. quote는 [구절본문, 출처]. vs-contrast는 ["A제목: 항목1|항목2", "B제목: 항목1|항목2"]. timeline-flow는 ["1단계: 내용", ...]. central-focus는 [핵심어, 보조1, 보조2, ...]. grid-matrix는 ["라벨: 설명", ...]',
              },
              layout: {
                type: 'string',
                enum: ['title', 'bullets', 'section-header', 'quote', 'two-column', 'closing', 'vs-contrast', 'timeline-flow', 'central-focus', 'grid-matrix'],
                description: '슬라이드 레이아웃 타입',
              },
              color: {
                type: 'object',
                properties: {
                  primary: { type: 'string', description: '주 색상 hex 6자리 (# 제외, 예: 1B3A5C)' },
                  accent: { type: 'string', description: '포인트 색상 hex 6자리 (# 제외, 예: 4A90D9)' },
                  background: { type: 'string', description: '배경 색상 hex 6자리 (# 제외, 예: FFFFFF)' },
                },
                required: ['primary', 'accent', 'background'],
                additionalProperties: false,
              },
              cameraAngle: { type: 'string', description: '카메라 구도 (영어, 예: "wide establishing shot", "top-down flat lay", "centered symmetrical composition")' },
              lighting: { type: 'string', description: '조명 (영어, 예: "warm golden hour light", "soft diffused studio lighting", "dramatic side lighting")' },
              fontStyle: { type: 'string', description: '폰트 스타일 (영어, 예: "clean modern sans-serif bold", "elegant serif italic", "warm hand-lettered script")' },
              iconPosition: { type: 'string', description: '아이콘/여백 위치 (영어, 예: "icon top-left, text center", "leave bottom third empty for text overlay", "centered cross symbol above title")' },
              coreMessage: { type: 'string', description: '이 슬라이드의 핵심 메시지 1~2문장 (한국어, 발표자 참고용)' },
              speakerNotes: { type: 'string', description: '발표자 스크립트 (한국어, 200~400자, 따뜻하고 생동감 있는 내러티브)' },
            },
            required: ['title', 'content', 'layout', 'color', 'cameraAngle', 'lighting', 'fontStyle', 'iconPosition', 'coreMessage', 'speakerNotes'],
            additionalProperties: false,
          },
          description: '8~12장 PPT 슬라이드 (표지 포함)',
        },
      },
      required: ['slides'],
      additionalProperties: false,
    },
  },
}

// ─── PPT Image Prompt Schema (GPT-5.4-mini용, 슬라이드별 DALL-E 영어 프롬프트) ───

export const PPT_IMAGE_PROMPT_SCHEMA = {
  type: 'json_schema' as const,
  json_schema: {
    name: 'ppt_image_prompts',
    strict: true,
    schema: {
      type: 'object',
      properties: {
        prompts: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              index: { type: 'integer', description: '슬라이드 인덱스 (0-based)' },
              prompt: { type: 'string', description: 'gpt-image-1 영어 프롬프트 (200~400자, 16:9 1536x1024 PPT 슬라이드용)' },
            },
            required: ['index', 'prompt'],
            additionalProperties: false,
          },
        },
      },
      required: ['prompts'],
      additionalProperties: false,
    },
  },
}
