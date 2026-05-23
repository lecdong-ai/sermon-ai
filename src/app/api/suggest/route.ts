import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, passage } = body

    let systemPrompt: string
    let userText: string

    if (title && !passage) {
      systemPrompt = '당신은 설교 준비를 돕는 AI입니다. 주어진 설교 제목에 가장 적합한 성경본문(책 장:절) 3가지를 추천하고, 각각을 추천하는 이유를 한 문장씩 설명하세요. 반드시 JSON 배열로만 응답하세요.'
      userText = `설교 제목: ${title}\n\n[{"value": "본문1", "reason": "추천 이유1"}, {"value": "본문2", "reason": "추천 이유2"}, {"value": "본문3", "reason": "추천 이유3"}] 형식으로 3가지를 추천해주세요.`
    } else if (passage && !title) {
      systemPrompt = '당신은 설교 준비를 돕는 AI입니다. 주어진 성경본문에 가장 적합한 설교 제목 3가지를 추천하고, 각각을 추천하는 이유를 한 문장씩 설명하세요. 반드시 JSON 배열로만 응답하세요.'
      userText = `성경본문: ${passage}\n\n[{"value": "제목1", "reason": "추천 이유1"}, {"value": "제목2", "reason": "추천 이유2"}, {"value": "제목3", "reason": "추천 이유3"}] 형식으로 3가지를 추천해주세요.`
    } else {
      return NextResponse.json({ success: false, error: '제목 또는 본문을 입력해주세요.' }, { status: 400 })
    }

    const res = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userText },
      ],
      temperature: 0.3,
      max_tokens: 500,
    })

    const raw = res.choices[0]?.message?.content || ''
    const cleaned = raw.replace(/^```json\s*|```\s*$/g, '').trim()
    const parsed = JSON.parse(cleaned)
    const items: { value: string; reason: string }[] = Array.isArray(parsed) ? parsed : (parsed.suggestions || [])

    return NextResponse.json({ success: true, suggestions: items })
  } catch (err: any) {
    console.error('POST /api/suggest error:', err)
    return NextResponse.json({ success: false, error: err.message || '제안 실패' }, { status: 500 })
  }
}
