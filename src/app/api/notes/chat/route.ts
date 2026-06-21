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

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const body = await request.json()
    const messages: ChatMessage[] = Array.isArray(body.messages) ? body.messages.slice(-12) : []
    const noteContext: string = (body.noteContext || '').trim()

    if (messages.length === 0) {
      return NextResponse.json({ success: false, error: '메시지가 비어 있습니다.' }, { status: 400 })
    }

    const useMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true'
    if (useMock) {
      return NextResponse.json({ success: true, content: mockReply(messages) })
    }

    const systemPrompt = `당신은 개혁주의 복음주의 설교를 돕는 신학 보조 AI다. 사용자가 설교 준비 중 메모한 통찰/관찰/질문을 더 깊이 발전시키고자 할 때 대화 상대가 되어준다.

원칙:
1) 신학적으로 정확하게 답변하되, 학파 간 논쟁점은 열린 태도를 유지하라.
2) 원어(히브리어/헬라어), 주석, 신학적 전통 등 깊이 있는 통찰을 제공하라.
3) 답변은 간결하게 2~4문장으로, 한국어로.
4) 사용자의 관찰을 격려하되 더 넓은 본문/신학적 맥락으로 확장해 주라.
5) 마지막에 한 줄 follow-up 질문으로 대화를 이어가라.
${noteContext ? `\n[현재 메모 중인 내용]\n${noteContext.slice(0, 1000)}` : ''}`

    const res = await getOpenai().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      temperature: 0.6,
      max_completion_tokens: 500,
    })

    const content = res.choices[0]?.message?.content?.trim() || ''
    if (!content) throw new Error('AI 응답이 비어 있습니다.')

    return NextResponse.json({ success: true, content })
  } catch (err: any) {
    console.error('POST /api/notes/chat error:', err)
    return NextResponse.json({ success: false, error: err.message || '대화 실패' }, { status: 500 })
  }
}

function mockReply(messages: ChatMessage[]) {
  const last = messages[messages.length - 1]?.content || ''
  if (last.includes('?')) {
    return '좋은 질문입니다. 본문에서 그 단어가 사용된 맥락을 살펴보면, 헬라어 χάρι스(은혜)는 단순한 호의가 아니라 "의도된 호의로운 선물"을 가리킵니다. 이 뉘앙스를 적용에 어떻게 연결해볼 수 있을까요?'
  }
  return '그 관찰은 통찰의 본질을 잘 짚고 있습니다. 한 걸음 더 들어가 보면, 이 진리가 구약의 어떤 약속과 연결되는지, 그리고 회중이 이 진리를 자신의 삶에서 어떻게 드러낼 수 있는지 탐구해볼 수 있을 것 같습니다. 어떤 방향이 더 끌리시나요?'
}
