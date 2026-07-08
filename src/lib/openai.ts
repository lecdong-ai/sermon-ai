import OpenAI from 'openai'
import {
  SUMMARY_SCHEMA,
  GROUP_DISCUSSION_SCHEMA,
  CARD_NEWS_SCHEMA,
  SERMON_SCRIPT_SCHEMA,
  SHORTS_SCRIPT_SCHEMA,
  PPT_SCHEMA,
  PPT_SLIDE_STRUCTURED_SCHEMA,
  SermonResultData,
  GenerationItem,
  SummaryResponse,
  PptSlide,
} from '@/types'
import * as SummaryPrompt from './prompts/summary'
import * as GroupDiscussionPrompt from './prompts/groupDiscussion'
import * as CardNewsPrompt from './prompts/cardNews'
import * as SermonScriptPrompt from './prompts/sermonScript'
import * as ShortsScriptPrompt from './prompts/shortsScript'
import * as PptOutlinePrompt from './prompts/pptOutline'
import * as StudyGuidePrompt from './prompts/studyGuide'
import * as PptStructuredPrompt from './prompts/pptStructured'
import { STUDY_GUIDE_SCHEMA, StudyGuideInput, StudyGuideOutput } from '@/types'

const SLIDE_MODEL = 'gpt-5.4-mini'

let _openai: OpenAI | null = null

function getOpenAI(): OpenAI {
  if (!_openai) {
    const key = process.env.OPENAI_API_KEY
    if (!key) throw new Error('OPENAI_API_KEY is not set')
    _openai = new OpenAI({ apiKey: key })
  }
  return _openai
}

function truncate(text: string, maxChars = 20000): string {
  if (text.length <= maxChars) return text
  return text.substring(0, maxChars) + '\n\n[텍스트가 길어 일부가 생략되었습니다...]'
}

async function callAI<T>(
  systemPrompt: string,
  userText: string,
  schema: any,
  maxTokens = 4000,
  temperature = 0.3,
): Promise<T> {
  const res = await getOpenAI().chat.completions.create({
    model: 'gpt-5.4-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `다음 설교 원고를 바탕으로 작업해주세요:\n\n${truncate(userText)}` },
    ],
    temperature,
    max_completion_tokens: maxTokens,
    response_format: schema,
  })

  const raw = res.choices[0].message.content
  if (!raw) throw new Error('OpenAI 응답이 비어 있습니다.')

  const cleaned = raw.replace(/^```json\s*|```\s*$/g, '').trim()

  try {
    return JSON.parse(cleaned) as T
  } catch {
    throw new Error(`JSON 파싱 실패: 응답이 올바른 JSON 형식이 아닙니다.\n${cleaned.substring(0, 200)}`)
  }
}

async function safeCallAI<T>(
  systemPrompt: string,
  userText: string,
  schema: any,
  itemName: string,
  maxTokens?: number,
  temperature?: number,
): Promise<T | null> {
  try {
    return await callAI<T>(systemPrompt, userText, schema, maxTokens, temperature)
  } catch (err) {
    console.error(`[${itemName}] generation failed:`, err)
    return null
  }
}

export async function generateAll(text: string): Promise<SermonResultData> {
  const [summary, groupDiscussion, cardNews, sermonScript, shortsScript, ppt] =
    await Promise.all([
      safeCallAI<SummaryResponse>(SummaryPrompt.SYSTEM_PROMPT, text, SUMMARY_SCHEMA, 'summary', 6000),
      safeCallAI<any>(GroupDiscussionPrompt.SYSTEM_PROMPT, text, GROUP_DISCUSSION_SCHEMA, 'groupDiscussion', 8000),
      safeCallAI<any>(CardNewsPrompt.SYSTEM_PROMPT, text, CARD_NEWS_SCHEMA, 'cardNews', 3000),
      safeCallAI<any>(SermonScriptPrompt.SYSTEM_PROMPT, text, SERMON_SCRIPT_SCHEMA, 'sermonScript', 4000, 0.3),
      safeCallAI<any>(ShortsScriptPrompt.SYSTEM_PROMPT, text, SHORTS_SCRIPT_SCHEMA, 'shortsScript', 2000),
      safeCallAI<any>(PptOutlinePrompt.SYSTEM_PROMPT, text, PPT_SCHEMA, 'pptOutline', 3000),
    ])

  const result: SermonResultData = {}

  if (summary) {
    result.summary = {
      central_topic: summary.central_topic,
      intro: summary.intro,
      body: summary.body,
      conclusion: summary.conclusion,
      application: summary.application,
      passage_text: summary.passage_text,
    }
    result.sermon_title = summary.title
    result.sermon_passage = summary.passage
  }

  if (groupDiscussion) {
    result.groupDiscussion = groupDiscussion
  }

  if (cardNews) {
    result.cardNews = cardNews
  }

  if (sermonScript) {
    result.sermonScript = sermonScript.script
  }

  if (shortsScript) {
    result.shortsScript = shortsScript.script
  }

  if (ppt) {
    result.pptData = { slides: ppt.slides }
  }

  return result
}

const VALID_ITEMS: GenerationItem[] = ['summary', 'groupDiscussion', 'cardNews', 'sermonScript', 'shortsScript', 'pptData']

export async function generateSingleItem(
  text: string,
  item: GenerationItem,
): Promise<Partial<SermonResultData>> {
  if (!VALID_ITEMS.includes(item)) {
    throw new Error(`유효하지 않은 생성 항목입니다: ${item}`)
  }
  const configs: Record<string, {
    prompt: string
    schema: any
    mapper: (data: any) => Partial<SermonResultData>
    maxTokens?: number
    temperature?: number
  }> = {
    summary: {
      prompt: SummaryPrompt.SYSTEM_PROMPT,
      schema: SUMMARY_SCHEMA,
      maxTokens: 6000,
      mapper: (d: any) => ({
        summary: { central_topic: d.central_topic, intro: d.intro, body: d.body, conclusion: d.conclusion, application: d.application, passage_text: d.passage_text },
      }),
    },
    groupDiscussion: {
      prompt: GroupDiscussionPrompt.SYSTEM_PROMPT,
      schema: GROUP_DISCUSSION_SCHEMA,
      maxTokens: 8000,
      mapper: (d: any) => ({ groupDiscussion: d }),
    },
    cardNews: {
      prompt: CardNewsPrompt.SYSTEM_PROMPT,
      schema: CARD_NEWS_SCHEMA,
      maxTokens: 3000,
      mapper: (d: any) => ({ cardNews: d }),
    },
    sermonScript: {
      prompt: SermonScriptPrompt.SYSTEM_PROMPT,
      schema: SERMON_SCRIPT_SCHEMA,
      mapper: (d: any) => ({ sermonScript: d.script }),
      maxTokens: 4000,
      temperature: 0.3,
    },
    shortsScript: {
      prompt: ShortsScriptPrompt.SYSTEM_PROMPT,
      schema: SHORTS_SCRIPT_SCHEMA,
      mapper: (d: any) => ({ shortsScript: d.script }),
      maxTokens: 2000,
    },
    pptData: {
      prompt: PptOutlinePrompt.SYSTEM_PROMPT,
      schema: PPT_SCHEMA,
      maxTokens: 3000,
      mapper: (d: any) => ({ pptData: { slides: d.slides } }),
    },
  }

  const config = configs[item]
  const data = await callAI(config.prompt, text, config.schema, config.maxTokens, config.temperature)
  const mapped = config.mapper(data)
  return mapped
}

export async function generateStudyGuide(input: StudyGuideInput): Promise<StudyGuideOutput> {
  const userMessage = [
    `## 설교 정보`,
    `- 제목: ${input.title}`,
    `- 성경본문: ${input.passage}`,
    `- 설교원고: ${input.sermonText}`,
    ``,
    `## 설정`,
    input.ageGroup ? `- 대상 연령층: ${input.ageGroup}` : null,
    input.atmosphere ? `- 모임 분위기: ${input.atmosphere}` : null,
    input.emphasis?.length ? `- 강조 포인트: ${input.emphasis.join(', ')}` : null,
    input.avoid?.length ? `- 피하고 싶은 방향: ${input.avoid.join(', ')}` : null,
    input.reference ? `- 참고자료: ${input.reference}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  const res = await callAI<StudyGuideOutput>(
    StudyGuidePrompt.SYSTEM_PROMPT,
    userMessage,
    STUDY_GUIDE_SCHEMA,
    4000,
  )

  return res
}

// ─── PPT 슬라이드 구조화 (GPT-5.5) ────────────────────────────

const THEME_COLOR_HINTS: Record<string, string> = {
  modern: '모던 — 딥 네이비(1B3A5C)와 화이트, 포인트 스카이블루(4A90D9), 깔끔한 산세리프',
  warm: '웜 — 크림 화이트와 딥 앰버(8d7a5b), 따뜻한 베이지 배경, 부드러운 그라데이션',
  classic: '클래식 — 진한 버건디(6B1A1A)와 골드(C9A84C), 품위 있는 전통적 레이아웃',
}

export async function generatePptSlidesGpt(
  text: string,
  options?: { theme?: string; slideCount?: number },
): Promise<PptSlide[]> {
  const theme = options?.theme || 'modern'
  const themeHint = THEME_COLOR_HINTS[theme] || THEME_COLOR_HINTS.modern
  const countHint = options?.slideCount
    ? `슬라이드 장수: ${options.slideCount}장 내외 (표지 포함).`
    : '슬라이드 장수: 8~12장 (표지 포함).'

  const systemPrompt = `${PptStructuredPrompt.SYSTEM_PROMPT}\n\n${themeHint}\n${countHint}`

  const res = await getOpenAI().chat.completions.create({
    model: SLIDE_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `아래 설교 원고를 분석하여 Elite PPT 슬라이드 덱을 생성해주세요:\n\n${truncate(text, 30000)}` },
    ],
    max_completion_tokens: 8000,
    response_format: PPT_SLIDE_STRUCTURED_SCHEMA,
  })

  const raw = res.choices[0].message.content
  if (!raw) throw new Error('GPT 응답이 비어 있습니다.')

  const cleaned = raw.replace(/^```json\s*|```\s*$/g, '').trim()
  let parsed: { slides: PptSlide[] }
  try {
    parsed = JSON.parse(cleaned)
  } catch (e) {
    throw new Error(`슬라이드 파싱 실패: ${e instanceof Error ? e.message : '알 수 없는 오류'}`)
  }

  if (!Array.isArray(parsed.slides) || parsed.slides.length === 0) {
    throw new Error('슬라이드 데이터가 올바르지 않습니다.')
  }
  return parsed.slides
}

// ─── 슬라이드 개별 수정 (GPT-5.5) ─────────────────────────────

export async function refineSlideGpt(
  slide: PptSlide,
  instruction: string,
  theme?: string,
): Promise<PptSlide> {
  const themeHint = theme ? `\n${THEME_COLOR_HINTS[theme] || THEME_COLOR_HINTS.modern}` : ''

  const userMessage = `현재 슬라이드:
- 제목: ${slide.title}
- 레이아웃: ${slide.layout}
- 내용: ${slide.content.map((c, i) => `  ${i + 1}. ${c}`).join('\n')}
- 색상: ${slide.color ? `primary=${slide.color.primary}, accent=${slide.color.accent}, bg=${slide.color.background}` : '없음'}
- 카메라 구도: ${slide.cameraAngle || '없음'}
- 조명: ${slide.lighting || '없음'}
- 폰트 스타일: ${slide.fontStyle || '없음'}
- 아이콘 위치: ${slide.iconPosition || '없음'}
- 핵심 메시지: ${slide.coreMessage || '없음'}
- 발표자 노트: ${slide.speakerNotes || '없음'}

사용자 요청: ${instruction}

레이아웃은 현재("${slide.layout}")를 유지하거나 더 적합한 레이아웃으로 변경할 수 있습니다.
수정된 슬라이드를 스키마에 맞게 반환하세요. color/cameraAngle/lighting/fontStyle/iconPosition/coreMessage/speakerNotes도 업데이트해주세요.`

  const res = await getOpenAI().chat.completions.create({
    model: SLIDE_MODEL,
    messages: [
      { role: 'system', content: `${PptStructuredPrompt.REFINE_PROMPT}${themeHint}` },
      { role: 'user', content: userMessage },
    ],
    max_completion_tokens: 2000,
    response_format: {
      type: 'json_schema' as const,
      json_schema: {
        name: 'ppt_slide_refine',
        strict: true,
        schema: PPT_SLIDE_STRUCTURED_SCHEMA.json_schema.schema.properties.slides.items,
      },
    },
  })

  const raw = res.choices[0].message.content
  if (!raw) throw new Error('GPT 응답이 비어 있습니다.')

  const cleaned = raw.replace(/^```json\s*|```\s*$/g, '').trim()
  let parsed: PptSlide
  try {
    parsed = JSON.parse(cleaned)
  } catch (e) {
    throw new Error(`슬라이드 파싱 실패: ${e instanceof Error ? e.message : '알 수 없는 오류'}`)
  }
  if (!parsed.title || !parsed.layout) {
    throw new Error('슬라이드 데이터가 올바르지 않습니다.')
  }
  return parsed
}


