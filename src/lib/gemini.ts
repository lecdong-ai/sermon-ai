import { GoogleGenerativeAI } from '@google/generative-ai'
import type { PptSlide } from '@/types'

const MODEL = 'gemini-2.5-flash'

// ─── 스키마 정의 ───────────────────────────────────────────────

const PPT_SCHEMA = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      title: { type: 'string' },
      content: {
        type: 'array',
        items: { type: 'string' },
      },
      layout: {
        type: 'string',
        enum: [
          'title',
          'bullets',
          'section-header',
          'quote',
          'two-column',
          'closing',
          'vs-contrast',
          'timeline-flow',
          'central-focus',
          'grid-matrix',
        ],
      },
      coreMessage: { type: 'string' },
      speakerNotes: { type: 'string' },
      visualRecommendation: { type: 'string' },
      designNote: { type: 'string' },
    },
    required: ['title', 'content', 'layout', 'coreMessage', 'speakerNotes', 'visualRecommendation', 'designNote'],
  },
}

const SLIDE_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    content: {
      type: 'array',
      items: { type: 'string' },
    },
    layout: {
      type: 'string',
      enum: [
        'title',
        'bullets',
        'section-header',
        'quote',
        'two-column',
        'closing',
        'vs-contrast',
        'timeline-flow',
        'central-focus',
        'grid-matrix',
      ],
    },
    coreMessage: { type: 'string' },
    speakerNotes: { type: 'string' },
    visualRecommendation: { type: 'string' },
    designNote: { type: 'string' },
  },
  required: ['title', 'content', 'layout', 'coreMessage', 'speakerNotes', 'visualRecommendation', 'designNote'],
}

// ─── 시스템 프롬프트 ───────────────────────────────────────────

const SYSTEM_PROMPT = `당신은 Elite Presentation Designer이자 구조적 콘텐츠 AI입니다. 
교회 설교 원고를 깊이 분석하여 시각 중심의 전문 PPT 슬라이드 덱으로 변환합니다.

## 핵심 프로세스

1. 원고의 핵심 메시지, 흐름, 핵심 포인트를 분석합니다.
2. 청중(성도/교인)과 어조를 파악합니다.
3. 논리적 순서로 텍스트를 슬라이드 단위로 청킹합니다 (정보 밀도를 낮게, 명확하게, 임팩트 있게).
4. 각 청크를 아래 전문 레이아웃 중 하나에 매핑합니다.

## 레이아웃 타입 선택 규칙 (매우 중요!)

다음 레이아웃을 맥락에 따라 동적으로 선택하세요. 모든 슬라이드에 불릿 목록을 쓰지 마세요:

- **vs-contrast**: 두 그룹, 개념, 행동을 비교할 때 (예: 율법 vs 은혜, 옛사람 vs 새사람)
  → content[0]은 "A 측 제목: 항목1|항목2|항목3" 형식, content[1]은 "B 측 제목: 항목1|항목2|항목3" 형식

- **timeline-flow**: 시간순 사건, 역사적 배경, 단계별 프로세스를 설명할 때 (예: 광야의 3가지 시험 순서)
  → content 배열의 각 항목이 하나의 단계 (예: ["1단계: 돌을 떡으로", "2단계: 성전 꼭대기에서", "3단계: 천하를 줌"])

- **central-focus**: 하나의 핵심 키워드나 핵심 개념, 마음의 결론을 정의할 때
  → content[0]이 중앙 핵심어(1~3단어), 나머지는 그 핵심어를 설명하는 보조 문장

- **grid-matrix**: 여러 요소나 카테고리를 동시에 나열할 때 (예: 마음에서 나오는 12가지)
  → content 배열에 각 아이템 (4~8개 권장)

- **title**: 표지 슬라이드 (설교 제목, 본문, 설교자)
- **section-header**: 대지 전환 섹션 헤더 (큰 제목만)
- **quote**: 성경 구절 강조 (인용 스타일)
  → content[0]이 구절 본문, content[1]은 출처 (예: "요한복음 3:16")
- **bullets**: 일반 내용 (위 레이아웃이 맞지 않을 때만 사용)
- **closing**: 마무리, 적용, 결단 슬라이드

## 각 슬라이드 필수 필드

모든 슬라이드에 다음 4개 필드를 반드시 작성하세요:

**coreMessage**: 이 슬라이드의 핵심 메시지 1~2문장 (청중이 하나만 기억한다면 이것)

**speakerNotes**: 발표자를 위한 따뜻하고 생동감 있는 내러티브 스크립트.
- 청중과의 상호작용 프롬프트 포함 (예: "이 구절을 읽기 전에 잠깐 눈을 감아보세요.")
- 실생활 예시나 비유 포함
- 300~500자 분량의 완전한 문장

**visualRecommendation**: 슬라이드의 비주얼 추천.
- 구체적인 일러스트 또는 아이콘 아이디어 (예: "두 갈래 길 위에 서있는 사람 실루엣")
- 레이아웃 배치 방식
- 통일된 디자인 테마와의 연계

**designNote**: 디자이너 노트.
- 색상 강조 포인트
- 폰트 사이즈 제안 (예: "제목 48pt 볼드")
- 배경 요소나 특수 효과 제안

## 슬라이드 구성 가이드

1. **표지** (layout: "title"): 설교 제목, 본문, 설교자명
2. **말씀 배경** (layout: "section-header" 또는 "quote"): 핵심 성경 구절
3. **대지 전환** (layout: "section-header"): 각 대지 시작마다
4. **핵심 내용** (layout: 상황에 맞게 선택): 각 대지의 내용
5. **비교/대조** (layout: "vs-contrast"): 두 개념 대비가 있을 때
6. **흐름 설명** (layout: "timeline-flow"): 단계가 있을 때
7. **핵심 단어** (layout: "central-focus"): 가장 중요한 개념 하나
8. **마무리** (layout: "closing"): 적용과 결론, 기도 초청

## 품질 기준

- 모든 텍스트는 한국어로 작성
- 제목은 12자 이내, 간결하고 캐치하게
- 학술적 용어를 일상적 언어로 변환
- 은유, 비유, 실생활 예시 적극 활용
- 슬라이드당 정보 밀도를 낮게 유지 (한 슬라이드에 한 가지 메시지)
- content 배열의 각 항목은 슬라이드 표시에 적합한 길이 유지`

const THEME_PROMPTS: Record<string, string> = {
  modern: '디자인 테마: 모던 — 딥 네이비(#1B3A5C)와 화이트, 포인트 색상 스카이블루(#4A90D9), 깔끔한 산세리프 폰트.',
  warm: '디자인 테마: 웜 — 크림 화이트와 딥 앰버(#8d7a5b), 따뜻한 베이지 배경, 부드러운 그라데이션.',
  classic: '디자인 테마: 클래식 — 진한 버건디(#6B1A1A)와 골드(#C9A84C), 품위 있는 전통적 레이아웃.',
}

// ─── Gemini 클라이언트 ─────────────────────────────────────────

let _genAI: GoogleGenerativeAI | null = null

function getGenAI(): GoogleGenerativeAI {
  if (!_genAI) {
    const key = process.env.GEMINI_API_KEY
    if (!key) throw new Error('GEMINI_API_KEY is not set')
    _genAI = new GoogleGenerativeAI(key)
  }
  return _genAI
}

function truncate(text: string, maxChars = 30000): string {
  if (text.length <= maxChars) return text
  return text.substring(0, maxChars) + '\n\n[텍스트가 길어 일부가 생략되었습니다...]'
}

// ─── PPT 슬라이드 생성 ────────────────────────────────────────

export async function generatePptSlides(
  text: string,
  options?: { theme?: string; slideCount?: number },
): Promise<PptSlide[]> {
  const genAI = getGenAI()
  const model = genAI.getGenerativeModel({
    model: MODEL,
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: PPT_SCHEMA as any,
      temperature: 0.5,
    },
  })

  const theme = options?.theme || 'modern'
  const themePrompt = THEME_PROMPTS[theme] || THEME_PROMPTS.modern
  const countHint = options?.slideCount
    ? `\n슬라이드 장수: ${options.slideCount}장 내외로 생성해주세요 (표지 포함).`
    : '\n슬라이드 장수: 8~12장으로 생성해주세요 (표지 포함).'

  const prompt = `${SYSTEM_PROMPT}\n\n${themePrompt}${countHint}\n\n아래 설교 원고를 분석하여 Elite PPT 슬라이드 덱을 생성해주세요:\n\n${truncate(text)}`

  const result = await model.generateContent(prompt)
  const responseText = result.response.text()

  if (!responseText) {
    throw new Error('Gemini 응답이 비어 있습니다.')
  }

  try {
    const parsed = JSON.parse(responseText) as PptSlide[]
    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error('슬라이드 데이터가 올바르지 않습니다.')
    }
    return parsed
  } catch (e) {
    throw new Error(`Gemini 응답 파싱 실패: ${e instanceof Error ? e.message : '알 수 없는 오류'}`)
  }
}

// ─── 슬라이드 개별 수정 ───────────────────────────────────────

export async function refineSlide(
  slide: PptSlide,
  instruction: string,
  theme?: string,
): Promise<PptSlide> {
  const genAI = getGenAI()
  const model = genAI.getGenerativeModel({
    model: MODEL,
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: SLIDE_SCHEMA as any,
      temperature: 0.5,
    },
  })

  const themePrompt = theme ? (THEME_PROMPTS[theme] || THEME_PROMPTS.modern) : ''

  const prompt = `당신은 PPT 슬라이드를 개선하는 Elite AI 어시스턴트입니다.
주어진 슬라이드를 사용자의 요청에 따라 수정해주세요.
${themePrompt}

현재 슬라이드:
- 제목: ${slide.title}
- 레이아웃: ${slide.layout}
- 내용: ${slide.content.map((c, i) => `  ${i + 1}. ${c}`).join('\n')}
- 핵심 메시지: ${slide.coreMessage || '없음'}
- 발표자 노트: ${slide.speakerNotes || '없음'}

사용자 요청: ${instruction}

레이아웃은 현재("${slide.layout}")를 유지하거나 더 적합한 레이아웃으로 변경할 수 있습니다.
레이아웃 선택 기준:
- vs-contrast: 두 개념 비교
- timeline-flow: 단계별 흐름
- central-focus: 핵심 개념 하나 강조
- grid-matrix: 여러 항목 나열
- bullets: 일반 내용
- quote: 성경 구절
- section-header: 섹션 구분
- closing: 마무리

수정된 슬라이드를 JSON으로 반환하세요. speakerNotes, coreMessage, visualRecommendation, designNote도 업데이트해주세요.`

  const result = await model.generateContent(prompt)
  const responseText = result.response.text()

  if (!responseText) {
    throw new Error('Gemini 응답이 비어 있습니다.')
  }

  try {
    const parsed = JSON.parse(responseText) as PptSlide
    if (!parsed.title || !parsed.layout) {
      throw new Error('슬라이드 데이터가 올바르지 않습니다.')
    }
    return parsed
  } catch (e) {
    throw new Error(`Gemini 응답 파싱 실패: ${e instanceof Error ? e.message : '알 수 없는 오류'}`)
  }
}
