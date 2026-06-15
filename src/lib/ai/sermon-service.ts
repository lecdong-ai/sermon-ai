import OpenAI from 'openai'
import * as CoreMessagePrompt from './prompts/core-message'
import * as OutlinePrompt from './prompts/outline'
import * as ApplicationPrompt from './prompts/application'
import * as DraftPrompt from './prompts/draft'
import * as AdvancedDraftPrompt from './prompts/draft-advanced'
import type { CoreMessageResult, OutlineResult, DraftResult } from '@/types'

let _openai: OpenAI | null = null
function getOpenai() {
  if (!_openai) {
    const key = process.env.OPENAI_API_KEY
    if (!key) throw new Error('OPENAI_API_KEY is not set')
    _openai = new OpenAI({ apiKey: key })
  }
  return _openai
}

interface CoreMessageInput {
  passage: string
  observation_notes: string
  audience: string[]
  church_context: string
}

interface OutlineInput {
  passage: string
  core_message: string
  church_context: string
  audience: string[]
}

interface ApplicationInput {
  passage: string
  core_message: string
  audience: string[]
  church_context: string
}

interface DraftInput {
  title: string
  passage: string
  sermon_date: string
  series: string
  core_message: string
  church_context: string
  audience: string[]
  outline: any
  observation_notes: string
  background_notes: string
  interpretation_notes: string
  illustration_notes: string
  application_points: string
}

const CORE_MESSAGE_SCHEMA = {
  type: 'json_schema' as const,
  json_schema: {
    name: 'core_message',
    strict: true,
    schema: {
      type: 'object',
      properties: {
        candidates: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              message: { type: 'string', description: '핵심 메시지 (30자 이내)' },
              description: { type: 'string', description: '메시지 설명 (1~2문장)' },
              bible_basis: { type: 'string', description: '본문 근거' },
              caution: { type: 'string', description: '오해 가능성 주의' },
            },
            required: ['message', 'description', 'bible_basis', 'caution'],
            additionalProperties: false,
          },
          description: '핵심 메시지 후보 3개',
        },
      },
      required: ['candidates'],
      additionalProperties: false,
    },
  },
}

const OUTLINE_SCHEMA = {
  type: 'json_schema' as const,
  json_schema: {
    name: 'sermon_outline',
    strict: true,
    schema: {
      type: 'object',
      properties: {
        candidates: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string', description: '개요 스타일 제목' },
              introduction_suggestion: { type: 'string', description: '서론 제안' },
              main_points: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    key_idea: { type: 'string' },
                    supporting_verses: { type: 'array', items: { type: 'string' } },
                    application_suggestion: { type: 'string' },
                  },
                  required: ['title', 'key_idea', 'supporting_verses', 'application_suggestion'],
                  additionalProperties: false,
                },
                description: '본론 포인트',
              },
              conclusion_suggestion: { type: 'string', description: '결론 제안' },
            },
            required: ['title', 'introduction_suggestion', 'main_points', 'conclusion_suggestion'],
            additionalProperties: false,
          },
          description: '3가지 개요 후보',
        },
      },
      required: ['candidates'],
      additionalProperties: false,
    },
  },
}

const APPLICATION_SCHEMA = {
  type: 'json_schema' as const,
  json_schema: {
    name: 'application',
    strict: true,
    schema: {
      type: 'object',
      properties: {
        candidates: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string', description: '적용 스타일 제목' },
              applications: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    audience: { type: 'string' },
                    question: { type: 'string', description: '적용 질문' },
                    action_plan: { type: 'string', description: '구체적 행동 계획' },
                  },
                  required: ['audience', 'question', 'action_plan'],
                  additionalProperties: false,
                },
              },
            },
            required: ['title', 'applications'],
            additionalProperties: false,
          },
          description: '3가지 적용 스타일 후보',
        },
      },
      required: ['candidates'],
      additionalProperties: false,
    },
  },
}

const DRAFT_SCHEMA = {
  type: 'json_schema' as const,
  json_schema: {
    name: 'sermon_draft',
    strict: true,
    schema: {
      type: 'object',
      properties: {
        full_text: { type: 'string', description: '전체 설교문 (한글 5,000자 이상, 풍성하고 깊이 있게)' },
        estimated_duration_minutes: { type: 'number' },
        sections: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['introduction', 'body', 'conclusion'] },
              content: { type: 'string' },
            },
            required: ['type', 'content'],
            additionalProperties: false,
          },
        },
        abstract_phrases: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              original: { type: 'string' },
              suggestion: { type: 'string' },
              reason: { type: 'string' },
            },
            required: ['original', 'suggestion', 'reason'],
            additionalProperties: false,
          },
        },
      },
      required: ['full_text', 'estimated_duration_minutes', 'sections', 'abstract_phrases'],
      additionalProperties: false,
    },
  },
}

async function callAI<T>(systemPrompt: string, userText: string, schema: any, maxTokens = 4000): Promise<T> {
  const res = await getOpenai().chat.completions.create({
    model: 'gpt-5.4-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userText },
    ],
    temperature: 0.3,
    max_completion_tokens: maxTokens,
    response_format: schema,
  })

  const raw = res.choices[0].message.content
  if (!raw) throw new Error('OpenAI 응답이 비어 있습니다.')

  const cleaned = raw.replace(/^```json\s*|```\s*$/g, '').trim()

  try {
    return JSON.parse(cleaned) as T
  } catch {
    throw new Error('JSON parse failure')
  }
}

export async function generateCoreMessage(input: CoreMessageInput): Promise<CoreMessageResult> {
  const userText = [
    '[본문]',
    input.passage,
    '',
    '[본문 관찰 노트]',
    input.observation_notes || '(입력된 관찰 내용이 없습니다)',
    '',
    '[설교 상황]',
    '- 설교 대상: ' + (input.audience.length ? input.audience.join(', ') : '(미지정)'),
    '- 교회 상황: ' + (input.church_context || '(미입력)'),
  ].join('\n')

  return callAI<CoreMessageResult>(CoreMessagePrompt.SYSTEM_PROMPT, userText, CORE_MESSAGE_SCHEMA)
}

export async function generateOutline(input: OutlineInput): Promise<OutlineResult> {
  const userText = [
    '[본문]',
    input.passage,
    '',
    '[핵심 메시지]',
    input.core_message,
    '',
    '[설교 상황]',
    '- 교회 상황: ' + (input.church_context || '(미입력)'),
    '- 설교 대상: ' + (input.audience.length ? input.audience.join(', ') : '(미지정)'),
  ].join('\n')

  const result = await callAI<{ candidates: any[] }>(OutlinePrompt.SYSTEM_PROMPT, userText, OUTLINE_SCHEMA)
  return result as OutlineResult
}

export async function generateApplication(input: ApplicationInput) {
  const userText = [
    '[본문]',
    input.passage,
    '',
    '[핵심 메시지]',
    input.core_message || '(미입력)',
    '',
    '[설교 대상]',
    input.audience.length ? input.audience.join(', ') : '(미지정)',
    '',
    '[교회 상황]',
    input.church_context || '(미입력)',
  ].join('\n')

  return callAI(ApplicationPrompt.SYSTEM_PROMPT, userText, APPLICATION_SCHEMA)
}

export async function generateAdvancedDraft(input: DraftInput): Promise<string> {
  const outlineText = input.outline ? [
    '[설교 개요]',
    '서론: ' + (input.outline.introduction || '(미작성)'),
    ...(input.outline.main_points || []).map((p: any, i: number) => '본론 ' + (i + 1) + ': ' + p.title + ' - ' + p.key_idea),
    '결론: ' + (input.outline.conclusion || '(미작성)'),
  ].join('\n') : '(개요 미작성)'

  const userText = [
    '[설교 제목]',
    input.title || '(미입력)',
    '',
    '[성경본문]',
    input.passage,
    '',
    '[핵심 메시지]',
    input.core_message || '(미입력)',
    '',
    outlineText,
    '',
    '[본문 관찰 노트]',
    input.observation_notes || '(없음)',
    '',
    '[배경 연구 노트]',
    input.background_notes || '(없음)',
    '',
    '[해석 메모]',
    input.interpretation_notes || '(없음)',
    '',
    '[예화/일러스트 메모]',
    input.illustration_notes || '(없음)',
    '',
    '[적용 포인트]',
    input.application_points || '(없음)',
    '',
    '[설교 정보]',
    '- 설교 날짜: ' + (input.sermon_date || '(미지정)'),
    '- 시리즈: ' + (input.series || '(없음)'),
    '- 설교 대상: ' + (input.audience.length ? input.audience.join(', ') : '(미지정)'),
    '- 교회 상황: ' + (input.church_context || '(미입력)'),
  ].join('\n')

  const res = await getOpenai().chat.completions.create({
    model: 'gpt-5.4-mini',
    messages: [
      { role: 'system', content: AdvancedDraftPrompt.SYSTEM_PROMPT },
      { role: 'user', content: userText },
    ],
    temperature: 0.7,
    max_completion_tokens: 16000,
  })

  return res.choices[0]?.message?.content || ''
}

export async function generateDraft(input: DraftInput): Promise<DraftResult> {
  const outlineText = input.outline ? [
    '[설교 개요]',
    '서론: ' + (input.outline.introduction || '(미작성)'),
    ...(input.outline.main_points || []).map((p: any, i: number) => '본론 ' + (i + 1) + ': ' + p.title + ' - ' + p.key_idea),
    '결론: ' + (input.outline.conclusion || '(미작성)'),
  ].join('\n') : '(개요 미작성)'

  const userText = [
    '[설교 제목]',
    input.title || '(미입력)',
    '',
    '[성경본문]',
    input.passage,
    '',
    '[핵심 메시지]',
    input.core_message || '(미입력)',
    '',
    outlineText,
    '',
    '[본문 관찰 노트]',
    input.observation_notes || '(없음)',
    '',
    '[배경 연구 노트]',
    input.background_notes || '(없음)',
    '',
    '[해석 메모]',
    input.interpretation_notes || '(없음)',
    '',
    '[예화/일러스트 메모]',
    input.illustration_notes || '(없음)',
    '',
    '[적용 포인트]',
    input.application_points || '(없음)',
    '',
    '[설교 정보]',
    '- 설교 날짜: ' + (input.sermon_date || '(미지정)'),
    '- 시리즈: ' + (input.series || '(없음)'),
    '- 설교 대상: ' + (input.audience.length ? input.audience.join(', ') : '(미지정)'),
    '- 교회 상황: ' + (input.church_context || '(미입력)'),
  ].join('\n')

  return callAI<DraftResult>(DraftPrompt.SYSTEM_PROMPT, userText, DRAFT_SCHEMA, 12000)
}
