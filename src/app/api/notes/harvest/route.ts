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
      cookies: { getAll() { return request.cookies.getAll() }, setAll() {} },
    },
  )
  const { data } = await sb.auth.getUser()
  return data?.user ?? null
}

const DERIVATIVE_TYPES = ['summary', 'questions', 'cardnews', 'shorts', 'ppt', 'guide'] as const
type DerivativeType = (typeof DERIVATIVE_TYPES)[number]

const TYPE_LABEL: Record<DerivativeType, string> = {
  summary: '설교 요약서',
  questions: '소그룹 토론 질문',
  cardnews: '카드뉴스 템플릿',
  shorts: '유튜브 쇼츠 대본',
  ppt: 'PPT 슬라이드',
  guide: '토론 가이드',
}

const PROMPTS: Record<DerivativeType, string> = {
  summary: `당신은 설교 요약 전문가다. 주어진 설교를 한 단락(150-250자)으로 요약하라. 
회중이 설교의 핵심을 한 번에 파악할 수 있도록, 중심 메시지 + 적용 한 가지를 포함하라.
순수 텍스트만 출력하라.`,

  questions: `당신은 소그룹 인도자다. 주어진 설교를 기반으로 소그룹 토론 질문 5-7개를 생성하라.

형식:
1. [질문 1]
2. [질문 2]
3. [질문 3]
4. [질문 4]
5. [질문 5]

질문은 본문에서 시작해서 회중의 삶으로 적용되도록 구성하라. 순수 텍스트로만 출력하라.`,

  cardnews: `당신은 교회 SNS 콘텐츠 디자이너다. 주어진 설교를 5장의 카드뉴스로 구성하라.

형식:
[카드 1]
제목: ...
본문: ...
시각 제안: ...

[카드 2]
제목: ...
본문: ...
시각 제안: ...

(5장까지)

각 카드의 본문은 50자 이내로 짧고 강렬하게. 시각 제안은 배경색/이미지/타이포그래피 등. 텍스트로만 출력.`,

  shorts: `당신은 유튜브 쇼츠 대본가다. 주어진 설교를 60초(150-180자) 쇼츠 스크립트로 만들어라.

형식:
[오프닝 훅] (첫 3초, 시선 끄는 한 문장)
[본문] (핵심 메시지 2-3문장)
[CTA] (마지막, 행동 유도)

각 단락 사이에 --- 구분선을 넣어라. 순수 텍스트로만 출력.`,

  ppt: `당신은 설교 발표자료 제작자다. 주어진 설교를 8장의 PPT 슬라이드로 구성하라.

형식:
[슬라이드 1] 제목
키워드: ...
내용: ...

[슬라이드 2] 제목
키워드: ...
내용: ...

(8장까지)

각 슬라이드는 한 문장 핵심 + 키워드 2-3개. 텍스트로만 출력.`,

  guide: `당신은 성경공부 인도자다. 주어진 설교를 기반으로 한 주일 심화 학습 가이드를 만들어라.

형식:
[도입 질문] - 본문과 삶을 연결하는 따뜻한 질문
[관찰하기] - 본문에서 무엇을 볼 수 있는지 (3-4가지 관찰)
[해석하기] - 그 관찰이 무엇을 의미하는지 (2-3가지 통찰)
[적용하기] - 이번 주에 어떻게 실천할지 (3가지 구체적 적용)
[기도제목] - 이번 주를 위한 기도 제목 1가지

각 단락은 --- 로 구분하라. 텍스트로만 출력.`,
}

async function generateOne(type: DerivativeType, sermon: { title: string; passage: string; content: string; coreMessage?: string }): Promise<string> {
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true'
  if (useMock) return `[Mock] ${TYPE_LABEL[type]} 결과입니다.`

  const userText = `[설교 제목] ${sermon.title}
[본문] ${sermon.passage}
${sermon.coreMessage ? `[핵심 메시지] ${sermon.coreMessage}\n` : ''}
[설교 원고]
${sermon.content.slice(0, 6000)}`

  const res = await getOpenai().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: PROMPTS[type] },
      { role: 'user', content: userText },
    ],
    temperature: 0.6,
    max_completion_tokens: type === 'shorts' ? 400 : type === 'summary' ? 500 : 1200,
  })
  return res.choices[0]?.message?.content?.trim() || `[${TYPE_LABEL[type]}] 생성 실패`
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request)
    if (!user) return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 })

    const body = await request.json()
    const { sermonId, title, passage, content, coreMessage, types } = body

    if (!title || !passage || !content) {
      return NextResponse.json({ success: false, error: '설교 정보가 부족합니다.' }, { status: 400 })
    }

    const targetTypes: DerivativeType[] = Array.isArray(types) && types.length > 0
      ? types.filter((t): t is DerivativeType => DERIVATIVE_TYPES.includes(t as DerivativeType))
      : [...DERIVATIVE_TYPES]

    if (targetTypes.length === 0) {
      return NextResponse.json({ success: false, error: '생성할 콘텐츠가 선택되지 않았습니다.' }, { status: 400 })
    }

    const start = Date.now()
    const results = await Promise.all(
      targetTypes.map(async (type) => {
        try {
          const generated = await generateOne(type, { title, passage, content, coreMessage })
          return { type, success: true, content: generated }
        } catch (e: any) {
          return { type, success: false, error: e?.message || '생성 실패' }
        }
      }),
    )
    const elapsed = ((Date.now() - start) / 1000).toFixed(1)

    const out: Record<string, { success: boolean; content?: string; error?: string }> = {}
    results.forEach((r) => { out[r.type] = r })

    return NextResponse.json({
      success: true,
      results: out,
      sermonId: sermonId || null,
      elapsed: `${elapsed}초`,
    })
  } catch (err: any) {
    console.error('POST /api/notes/harvest error:', err)
    return NextResponse.json({ success: false, error: err.message || '수확 실패' }, { status: 500 })
  }
}
