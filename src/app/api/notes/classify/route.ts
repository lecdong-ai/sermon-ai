import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createServerClient } from '@supabase/ssr'

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
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll() {},
      },
    },
  )
  const { data } = await sb.auth.getUser()
  return data?.user ?? null
}

const VALID_TYPES = ['insight', 'research', 'application', 'question', 'pastoral', 'illustration', 'warning', 'word'] as const
type NoteType = (typeof VALID_TYPES)[number]

const TYPE_LABELS: Record<NoteType, string> = {
  insight: '통찰',
  research: '연구 메모',
  application: '적용 아이디어',
  question: '질문',
  pastoral: '목회적 관찰',
  illustration: '예화 후보',
  warning: '경고 메모',
  word: '원어 단어',
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const body = await request.json()
    const text: string = (body.text || '').trim()

    if (!text || text.length < 5) {
      return NextResponse.json({ success: false, error: '분석할 텍스트가 너무 짧습니다.' }, { status: 400 })
    }

    const systemPrompt = `당신은 설교 준비를 돕는 신학 보조 AI다. 사용자가 작성한 메모의 성격을 분석해 가장 적합한 노트 유형 하나를 추천하라.

노트 유형과 의미:
- insight: 핵심 진술형 통찰 (신학적, 구조적, 언어적 깊이를 꿰뚫는 요점)
- research: 연구 기록 (원어, 주석, 배경 탐구)
- application: 적용 아이디어 (회중 삶과 연결되는 실천)
- question: 열린 질문 (더 연구가 필요한 지점)
- pastoral: 목회적 관찰 (회중 상황과 설교의 접점)
- illustration: 예화 후보 (본문을 설명할 이미지, 사례)
- warning: 설교 경고 (피해야 할 함정, 신학적 위험)

반드시 JSON 객체로만 응답하라: {"type": "위 7개 중 하나", "confidence": 0~1, "reason": "이 유형을 추천한 이유 한 문장"}`

    const res = await getOpenai().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `다음 메모를 분석하라:\n\n${text.slice(0, 1500)}` },
      ],
      temperature: 0.2,
      max_completion_tokens: 200,
      response_format: { type: 'json_object' },
    })

    const raw = res.choices[0]?.message?.content || '{}'
    let parsed: any = {}
    try {
      parsed = JSON.parse(raw)
    } catch {
      const match = raw.match(/\{[\s\S]*\}/)
      if (match) parsed = JSON.parse(match[0])
    }

    const suggested: NoteType = VALID_TYPES.includes(parsed.type) ? parsed.type : 'insight'
    const confidence = Math.max(0, Math.min(1, Number(parsed.confidence) || 0.5))
    const reason: string = parsed.reason || ''

    return NextResponse.json({
      success: true,
      type: suggested,
      label: TYPE_LABELS[suggested],
      confidence,
      reason,
    })
  } catch (err: any) {
    console.error('POST /api/notes/classify error:', err)
    return NextResponse.json({ success: false, error: err.message || '분류 실패' }, { status: 500 })
  }
}
