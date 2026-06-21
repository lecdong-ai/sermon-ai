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

export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request)
    if (!user) return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 })

    const body = await request.json()
    const { passage, book, chapter, verseStart, verseEnd, coreMessage } = body

    if (!passage) {
      return NextResponse.json({ success: false, error: '본문 정보가 필요합니다.' }, { status: 400 })
    }

    const useMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true'
    if (useMock) {
      return NextResponse.json({ success: true, ...mockData() })
    }

    const contextLine = [book, chapter, verseStart, verseEnd].filter(Boolean).join(' ')
    const systemPrompt = `당신은 신학 연구 보조 AI다. 주어진 성경 본문에 대한 단계 전환 진단용 **빠른 채우기 콘텐츠**를 생성하라.

반드시 아래 JSON 형식으로만 응답하라:
{
  "keyWords": ["헬라어 단어 1 (한국어 뜻)", "헬라어 단어 2 (한국어 뜻)"],
  "commentaries": ["주석 메모 1 (2-3문장)", "주석 메모 2", "주석 메모 3"],
  "theme": "이 본문의 중심 주제 (한 단어 또는 짧은 구)",
  "passageStructure": "본문의 구조 한 줄 요약"
}

원어(keyWords)는 신학적으로 의미 있는 헬라어 단어를 2개 선정하라 (예: χάρις(은혜), πίστις(믿음), ἀγάπη(사랑)). 각 단어에 한국어 뜻을 괄호로 표기.

주석은 본문의 핵심 통찰 3가지를 2-3문장씩. exegetical / theological / pastoral 관점 중 다양한 것.

주제는 한 단어 (예: 칭의, 성화, 은혜, 화목, 소망, 순종, 인내 등).`

    const userText = `[본문] ${passage}${contextLine ? ` (${contextLine})` : ''}
${coreMessage ? `[기존 중심명제 참고] ${coreMessage}` : ''}
위 본문에 대한 연구 채우기 콘텐츠를 생성하라.`

    const res = await getOpenai().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userText },
      ],
      temperature: 0.4,
      max_completion_tokens: 1000,
      response_format: { type: 'json_object' },
    })

    const raw = res.choices[0]?.message?.content || '{}'
    let parsed: any = {}
    try { parsed = JSON.parse(raw) } catch {
      const match = raw.match(/\{[\s\S]*\}/)
      if (match) parsed = JSON.parse(match[0])
    }

    return NextResponse.json({
      success: true,
      data: {
        keyWords: Array.isArray(parsed.keyWords) ? parsed.keyWords.slice(0, 3) : [],
        commentaries: Array.isArray(parsed.commentaries) ? parsed.commentaries.slice(0, 3) : [],
        theme: String(parsed.theme || '').slice(0, 100),
        passageStructure: String(parsed.passageStructure || '').slice(0, 200),
      },
    })
  } catch (err: any) {
    console.error('POST /api/notes/study-fill error:', err)
    return NextResponse.json({ success: false, error: err.message || 'AI 채우기 실패' }, { status: 500 })
  }
}

function mockData() {
  return {
    data: {
      keyWords: ['χάρις(은혜)', 'πίστις(믿음)'],
      commentaries: [
        '이 본문에서 바울은 복음의 핵심을 다시 한번 확인하며, 인간의 행위가 아닌 그리스도의 순종에 의한 의를 강조한다.',
        '헬라어 χάρις(은혜)는 인간의 заслу가 아닌 하나님의 선물로서의 구원을 가리키며, 로마서 신학의 중심 어휘이다.',
        '목회적으로 이 본문은 율법주의에 빠진 성도들에게 복음의 자유를 선포하며, 칭의의 확신을 회복시키는 데 목적이 있다.',
      ],
      theme: '칭의와 은혜',
      passageStructure: '인간 모두의 죄 → 그리스도의 의로 말미암은 칭의 → 아브라함의 믿음 예시',
    },
  }
}
