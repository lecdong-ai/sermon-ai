import OpenAI from 'openai'
import { getMockResult } from './mock'
import {
  SUMMARY_SCHEMA,
  GROUP_DISCUSSION_SCHEMA,
  CARD_NEWS_SCHEMA,
  SERMON_SCRIPT_SCHEMA,
  SHORTS_SCRIPT_SCHEMA,
  PPT_SCHEMA,
  SermonResultData,
  GenerationItem,
  SummaryResponse,
} from '@/types'
import * as SummaryPrompt from './prompts/summary'
import * as GroupDiscussionPrompt from './prompts/groupDiscussion'
import * as CardNewsPrompt from './prompts/cardNews'
import * as SermonScriptPrompt from './prompts/sermonScript'
import * as ShortsScriptPrompt from './prompts/shortsScript'
import * as PptOutlinePrompt from './prompts/pptOutline'
import * as StudyGuidePrompt from './prompts/studyGuide'
import { STUDY_GUIDE_SCHEMA, StudyGuideInput, StudyGuideOutput } from '@/types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

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
  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `다음 설교 원고를 바탕으로 작업해주세요:\n\n${truncate(userText)}` },
    ],
    temperature,
    max_tokens: maxTokens,
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

export async function generateAll(text: string, useMock?: boolean): Promise<SermonResultData> {
  const mock = useMock ?? process.env.NEXT_PUBLIC_USE_MOCK === 'true'
  if (mock) {
    await new Promise((r) => setTimeout(r, 1500))
    return getMockResult()
  }

  const [summary, groupDiscussion, cardNews, sermonScript, shortsScript, ppt] =
    await Promise.all([
      safeCallAI<SummaryResponse>(SummaryPrompt.SYSTEM_PROMPT, text, SUMMARY_SCHEMA, 'summary', 6000),
      safeCallAI<any>(GroupDiscussionPrompt.SYSTEM_PROMPT, text, GROUP_DISCUSSION_SCHEMA, 'groupDiscussion', 3000),
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
  const configs: Record<GenerationItem, {
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
      maxTokens: 3000,
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

  const res = await callAI<{ output: StudyGuideOutput }>(
    StudyGuidePrompt.SYSTEM_PROMPT,
    userMessage,
    STUDY_GUIDE_SCHEMA,
    4000,
  )

  return res.output
}
