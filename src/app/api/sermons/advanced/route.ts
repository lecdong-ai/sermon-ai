import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { SYSTEM_PROMPT } from '@/lib/ai/prompts/draft-advanced'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const LENGTH_GUIDE: Record<string, string> = {
  outline: '개요형: 핵심 골자와 대지 중심으로 간략하게 작성',
  standard: '표준형: 일반 설교 분량으로 충실하게 작성',
  full: '풍성한 원고형: 강단에서 바로 읽을 수 있도록 상세하고 풍성하게 작성',
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { passage, topic, audience, context, sermon_type, length } = body

    if (!passage?.trim()) {
      return NextResponse.json({ success: false, error: '성경본문을 입력해주세요.' }, { status: 400 })
    }

    const typeLabels: Record<string, string> = {
      expository: '강해설교', topical: '주제설교', sunday: '주일예배',
      wednesday: '수요예배', dawn: '새벽예배', youth: '청년부',
      adult: '장년부', newfamily: '전도/새가족 대상',
    }

    const userText = [
      '[성경본문]',
      passage.trim(),
      '',
      topic ? '[설교 주제]\n' + topic.trim() : null,
      audience ? '[회중 대상]\n' + audience.trim() : null,
      context ? '[교회 상황]\n' + context.trim() : null,
      '',
      '[설교 형태]',
      typeLabels[sermon_type] || '강해설교',
      '',
      '[출력 형태]',
      LENGTH_GUIDE[length] || LENGTH_GUIDE.full,
    ].filter(Boolean).join('\n')

    const lengthTokens = length === 'outline' ? 4000 : length === 'standard' ? 10000 : 16000

    const res = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userText },
      ],
      temperature: 0.7,
      max_tokens: lengthTokens,
    })

    const fullText = res.choices[0]?.message?.content || ''

    return NextResponse.json({ success: true, data: { full_text: fullText } })
  } catch (err: any) {
    console.error('POST /api/sermons/advanced error:', err)
    return NextResponse.json({ success: false, error: err.message || '생성 실패' }, { status: 500 })
  }
}
