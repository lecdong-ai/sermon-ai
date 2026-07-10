import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest, checkOpenAIRateLimit } from '@/lib/school/project/auth'
import OpenAI from 'openai'

let _openai: OpenAI | null = null
function getOpenai() {
  if (!_openai) {
    const key = process.env.OPENAI_API_KEY
    if (!key) throw new Error('OPENAI_API_KEY is not set')
    _openai = new OpenAI({ apiKey: key })
  }
  return _openai
}

const SUGGEST_SYSTEM_PROMPT = '당신은 설교 준비를 돕는 AI입니다. 간결하고 명확하게 제안하세요.'

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const body = await request.json()
    const { passage, topic } = body

    if (!passage && !topic) {
      return NextResponse.json({ success: false, error: '성경본문 또는 주제를 입력해주세요.' }, { status: 400 })
    }

    let userText: string
    let suggestionType: string

    if (passage && !topic) {
      userText = '[성경본문]\n' + passage + '\n\n위 본문에 맞는 설교 주제를 한 문장으로 간결하게 제안해주세요.'
      suggestionType = 'topic'
    } else {
      userText = '[주제]\n' + topic + '\n\n위 주제에 맞는 성경본문(책 장:절)을 하나만 간결하게 제안해주세요.'
      suggestionType = 'passage'
    }

    const res = await getOpenai().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SUGGEST_SYSTEM_PROMPT },
        { role: 'user', content: userText },
      ],
      temperature: 0.3,
      max_completion_tokens: 500,
    })

    const suggestion = res.choices[0].message.content || ''

    return NextResponse.json({ success: true, data: { suggestion, type: suggestionType } })
  } catch (err: any) {
    console.error('POST /api/sermons/[id]/ai/suggest error:', err)
    return NextResponse.json({ success: false, error: err.message || '제안 실패' }, { status: 500 })
  }
}
