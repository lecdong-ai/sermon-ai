import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getUserFromRequest } from '@/lib/auth'
import { SYSTEM_PROMPT } from '@/lib/ai/prompts/sermon-series'

let _openai: OpenAI | null = null
function getOpenai() {
  if (!_openai) {
    const key = process.env.OPENAI_API_KEY
    if (!key) throw new Error('OPENAI_API_KEY is not set')
    _openai = new OpenAI({ apiKey: key })
  }
  return _openai
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const body = await request.json()
    const { theme } = body as { theme: string }

    if (!theme) {
      return NextResponse.json({ success: false, error: '주제를 선택해주세요.' }, { status: 400 })
    }

    const res = await getOpenai().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `주제: "${theme}"에 대한 4주 설교 시리즈를 구성해주세요.` },
      ],
      temperature: 0.7,
      max_completion_tokens: 4000,
      response_format: { type: 'json_object' },
    })

    let output = res.choices[0]?.message?.content || ''

    // Extract JSON robustly
    const start = output.indexOf('{')
    if (start !== -1) {
      let count = 0
      let end = -1
      for (let i = start; i < output.length; i++) {
        if (output[i] === '{') count++
        else if (output[i] === '}') count--
        if (count === 0) {
          end = i
          break
        }
      }
      if (end !== -1) {
        output = output.slice(start, end + 1)
      }
    }

    if (!output) {
      return NextResponse.json({ success: false, error: 'AI 응답을 생성하지 못했습니다.' }, { status: 500 })
    }

    try {
      const parsed = JSON.parse(output)
      return NextResponse.json({ success: true, data: parsed })
    } catch {
      return NextResponse.json({ success: false, error: 'AI 응답 형식이 올바르지 않습니다.' }, { status: 422 })
    }
  } catch (err: any) {
    console.error('POST /api/advanced/series error:', err)
    return NextResponse.json({ success: false, error: err.message || '시리즈 생성 실패' }, { status: 500 })
  }
}
