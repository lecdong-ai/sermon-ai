import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createServerClient } from '@supabase/ssr'
import { checkOpenAIRateLimit } from '@/lib/auth'

let _openai: OpenAI | null = null
function getOpenai() {
  if (!_openai) {
    const key = process.env.OPENAI_API_KEY
    if (!key) throw new Error('OPENAI_API_KEY is not set')
    _openai = new OpenAI({ apiKey: key })
  }
  return _openai
}

async function getUser(request: NextRequest) {
  const sb = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: { getAll() { return request.cookies.getAll() }, setAll() {} },
    },
  )
  const { data } = await sb.auth.getUser()
  return data?.user ?? null
}

interface InsightInput {
  id: string
  title: string
  content: string
  summary: string
  tags: string[]
  type: string
}

interface ArrangeRequest {
  insights: InsightInput[]
  passage: string
  sermonTitle?: string
  coreMessage?: string
}

const SECTIONS = ['intro', 'main1', 'main2', 'main3', 'conclusion'] as const
type Section = (typeof SECTIONS)[number]

const SECTION_LABELS: Record<Section, string> = {
  intro: '서론 (도입)',
  main1: '본론 1',
  main2: '본론 2',
  main3: '본론 3',
  conclusion: '결론',
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request)
    if (!user) return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 })

    const body = (await request.json()) as ArrangeRequest
    const { insights, passage, sermonTitle, coreMessage } = body

    if (!Array.isArray(insights) || insights.length === 0) {
      return NextResponse.json({ success: false, error: '배치할 통찰이 없습니다.' }, { status: 400 })
    }
    if (!passage) {
      return NextResponse.json({ success: false, error: '본문 정보가 필요합니다.' }, { status: 400 })
    }

    const compact = insights.map((i) => ({
      id: i.id,
      title: i.title,
      summary: i.summary || (i.content || '').slice(0, 200),
      tags: i.tags || [],
      type: i.type,
    }))

    const systemPrompt = `당신은 설교 구조 설계에 정통한 신학 보조 AI다. 사용자가 모은 통찰들을 설교의 5개 구간(서론/본론1/본론2/본론3/결론)에 어떻게 배치할지 결정하라.

배치 원칙:
1. 서론: 청중의 관심을 끄는 질문·이미지·공감 포인트
2. 본론 1·2·3: 통찰의 논리적 흐름. 같은 통찰 유형끼리 묶고, 시간적/인과적 순서로 배치
3. 결론: 핵심 메시지 재진술, 적용·도전·소망으로 마무리
4. 한 통찰은 정확히 하나의 구간에만 배치
5. 모든 통찰을 빠짐없이 배치
6. 비슷한 통찰이 여러 개면 가장 강력한 것을 본론 중앙에, 보조적은 본론 가장자리나 결론에
7. 같은 본문/주제의 통찰은 가까운 구간끼리 묶어 흐름 만들기

반드시 JSON 객체로만 응답하라:
{
  "arrangement": {
    "intro": ["insight_id_1"],
    "main1": ["insight_id_2", "insight_id_3"],
    "main2": ["insight_id_4"],
    "main3": ["insight_id_5"],
    "conclusion": ["insight_id_6"]
  },
  "reasoning": "각 구간에 어떤 통찰을 왜 배치했는지 한 단락 설명 (한국어)"
}`

    const userText = `[설교 본문] ${passage}
${sermonTitle ? `[설교 제목] ${sermonTitle}\n` : ''}${coreMessage ? `[핵심 메시지] ${coreMessage}\n` : ''}
[통찰 목록]
${JSON.stringify(compact, null, 2)}`

    const res = await getOpenai().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userText },
      ],
      temperature: 0.4,
      max_completion_tokens: 2000,
      response_format: { type: 'json_object' },
    })

    const raw = res.choices[0]?.message?.content || '{}'
    let parsed: any = {}
    try { parsed = JSON.parse(raw) } catch {
      const match = raw.match(/\{[\s\S]*\}/)
      if (match) parsed = JSON.parse(match[0])
    }

    const arr = parsed.arrangement || {}
    const allIds = new Set(insights.map((i) => i.id))
    const result: Record<Section, string[]> = { intro: [], main1: [], main2: [], main3: [], conclusion: [] }
    const placed = new Set<string>()

    for (const sec of SECTIONS) {
      const ids = Array.isArray(arr[sec]) ? arr[sec] : []
      for (const id of ids) {
        if (allIds.has(id) && !placed.has(id)) {
          result[sec].push(id)
          placed.add(id)
        }
      }
    }
    // 배치 안 된 통찰은 본론 2에 기본 배치
    Array.from(allIds).forEach((id) => {
      if (!placed.has(id)) {
        result.main2.push(id)
        placed.add(id)
      }
    })

    return NextResponse.json({
      success: true,
      arrangement: result,
      reasoning: String(parsed.reasoning || ''),
    })
  } catch (err: any) {
    console.error('POST /api/notes/arrange error:', err)
    return NextResponse.json({ success: false, error: err.message || '배치 실패' }, { status: 500 })
  }
}
