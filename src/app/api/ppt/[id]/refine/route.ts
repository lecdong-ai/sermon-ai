import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { supabaseAdmin } from '@/lib/supabase'
import { getUserFromRequest } from '@/lib/auth'
import { checkOpenAIRateLimit } from '@/lib/auth'

let _openai: OpenAI | null = null
function getOpenAI(): OpenAI {
  if (!_openai) {
    const key = process.env.OPENAI_API_KEY
    if (!key) throw new Error('OPENAI_API_KEY is not set')
    _openai = new OpenAI({ apiKey: key })
  }
  return _openai
}

const REFINE_SCHEMA = {
  type: 'json_schema' as const,
  json_schema: {
    name: 'slide_refinement',
    strict: true,
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: '수정된 슬라이드 제목 (12자 이내)' },
        content: { type: 'string', description: '수정된 슬라이드 내용 — 5~8개의 불릿 포인트, 각 15~20자' },
        style: { type: 'string', enum: ['list', 'scripture', 'highlight', 'apply'], description: '슬라이드 성격에 맞는 스타일' },
        icon: { type: 'string', description: '아이콘 (heart/cross/book/star/lightbulb/check/quote/bible/pray 중 하나)' },
        rationale: { type: 'string', description: '변경 이유에 대한 한 줄 설명' },
      },
      required: ['title', 'content', 'style', 'icon', 'rationale'],
      additionalProperties: false,
    },
  },
}

const REFINE_SYSTEM_PROMPT = `당신은 설교 PPT 슬라이드를 리파인하는 전문가입니다. 설교의 흐름과 설교자의 의도를 존중하되, 사용자의 리파인 요청에 따라 슬라이드 콘텐츠를 개선합니다.

## 응답 형식
{
  "title": "수정된 슬라이드 제목 (12자 이내)",
  "content": "수정된 슬라이드 내용 — 5~8개의 불릿 포인트, 각 불릿은 15~20자 내외",
  "style": "list | scripture | highlight | apply",
  "icon": "heart | cross | book | star | lightbulb | check | quote | bible | pray",
  "rationale": "변경 이유 한 줄 설명"
}

## 스타일 가이드
- list: 일반 내용 (대부분)
- scripture: 성경 인용
- highlight: 핵심 강조
- apply: 적용/실천

## 지침
- 사용자의 요청 의도를 정확히 반영
- 슬라이드 구조(5~8개 불릿, 각 15~20자)는 유지
- 설교의 전체 맥락에서 벗어나지 않도록 주의
- JSON만 출력하고 다른 텍스트는 포함하지 마세요`

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const rateLimitResponse = checkOpenAIRateLimit(request, user.id)
    if (rateLimitResponse) return rateLimitResponse

    const { slide, prompt, context } = await request.json()

    if (!slide || !prompt) {
      return NextResponse.json({ success: false, error: 'slide와 prompt는 필수입니다.' }, { status: 400 })
    }

    // 소유권 확인
    const { data: sermon, error: sermonError } = await supabaseAdmin
      .from('sermons')
      .select('id, user_id, title, passage, result')
      .eq('id', params.id)
      .single()

    if (sermonError || !sermon) {
      return NextResponse.json({ success: false, error: '설교를 찾을 수 없습니다.' }, { status: 404 })
    }
    if (sermon.user_id !== user.id) {
      return NextResponse.json({ success: false, error: '접근 권한이 없습니다.' }, { status: 403 })
    }

    const userMessage = [
      `## 설교 컨텍스트`,
      `- 설교 제목: ${sermon.title || '제목 없음'}`,
      `- 성경 본문: ${sermon.passage || '본문 없음'}`,
      context?.summaryIntro ? `- 설교 개요: ${context.summaryIntro}` : null,
      context?.passageText ? `- 본문 전문: ${context.passageText}` : null,
      ``,
      `## 현재 슬라이드`,
      `- 제목: ${slide.title || ''}`,
      `- 스타일: ${slide.style || 'list'}`,
      `- 아이콘: ${slide.icon || 'star'}`,
      `- 내용:`,
      slide.content || '(내용 없음)',
      ``,
      `## 리파인 요청`,
      prompt,
    ].filter(Boolean).join('\n')

    const res = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: REFINE_SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.5,
      max_completion_tokens: 1500,
      response_format: REFINE_SCHEMA,
    })

    const raw = res.choices[0].message.content
    if (!raw) throw new Error('OpenAI 응답이 비어 있습니다.')

    const cleaned = raw.replace(/^```json\s*|```\s*$/g, '').trim()
    const refined = JSON.parse(cleaned)

    return NextResponse.json({ success: true, data: refined })
  } catch (err: any) {
    console.error('PPT refine error:', err)
    return NextResponse.json({ success: false, error: err.message || '리파인 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
