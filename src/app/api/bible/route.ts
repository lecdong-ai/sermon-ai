import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { passage } = await request.json()
    if (!passage?.trim()) {
      return NextResponse.json({ success: false, error: '성경본문을 입력해주세요.' }, { status: 400 })
    }

    const res = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: '당신은 성경 구절을 정확히 인용하는 도우미입니다. 주어진 성경본문(책 장:절)에 해당하는 개역개정판 성경 구절을 그대로 인용해주세요. 각 구절 앞에 장과 절 번호를 표시하고, 이어서 구절을 출력하세요. 설명이나 해석은 절대 붙이지 마세요.' },
        { role: 'user', content: `성경본문: ${passage}\n\n위 본문에 해당하는 개역개정판 구절을 출력하세요.` },
      ],
      temperature: 0.1,
      max_tokens: 1000,
    })

    const text = res.choices[0]?.message?.content?.trim() || ''
    return NextResponse.json({ success: true, text })
  } catch (err: any) {
    console.error('POST /api/bible error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
