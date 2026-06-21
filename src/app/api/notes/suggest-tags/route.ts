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

const SCRIPTURE_REGEX = /\b(창|출|레|민|신|수|삿|룻|삼상|삼하|왕상|왕하|대상|대하|스|느|에|욥|시|잠|전|아|사|렘|애|겔|단|호|요엘|암|옵|욘|미|나|합|습|학|슥|말|마|막|눅|요|행|롬|고전|고후|갈|엡|빌|골|살전|살후|딤전|딤후|딛|몬|히|약|벧전|벧후|요일|요이|요삼|유|계)(?:\s*\d+)?(?::\d+(?:[-–,]\d+)*)?/g

export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const body = await request.json()
    const text: string = (body.text || '').trim()
    const existingTags: string[] = Array.isArray(body.existingTags) ? body.existingTags : []

    if (!text || text.length < 5) {
      return NextResponse.json({ success: false, error: '분석할 텍스트가 너무 짧습니다.' }, { status: 400 })
    }

    const useMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true'
    if (useMock) {
      return NextResponse.json({ success: true, ...mockSuggest(text, existingTags) })
    }

    const systemPrompt = `당신은 설교 준비를 돕는 신학 보조 AI다. 사용자가 작성한 메모를 분석해 다음 두 가지를 추출하라.

1. tags: 메모의 핵심 주제·신학 개념·대상·감정을 포착하는 한국어 태그 3~5개. 각 태그는 1~3 단어, '#' 없이 단답형. 다음 기존 태그가 적합하면 우선 사용: ${existingTags.slice(0, 30).join(', ') || '(없음)'}
2. scripture: 메모에서 발견되는 성경 본문 참조(예: "요한복음 1:1", "롬 8:28-30", "시편 23"). 책 이름은 짧은 약어(창/출/마/요/롬/고전 등) 사용. 없으면 빈 배열.

반드시 JSON 객체로만 응답하라: {"tags": ["태그1", "태그2"], "scripture": ["요 1:1"]}`

    const res = await getOpenai().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `다음 메모를 분석하라:\n\n${text.slice(0, 1500)}` },
      ],
      temperature: 0.3,
      max_completion_tokens: 300,
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

    const aiTags: string[] = Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5).map((t: string) => String(t).replace(/^#/, '').trim()).filter(Boolean) : []
    const aiScripture: string[] = Array.isArray(parsed.scripture) ? parsed.scripture.slice(0, 5).map((s: string) => String(s).trim()).filter(Boolean) : []

    const localScripture = Array.from(new Set((text.match(SCRIPTURE_REGEX) || []).map((s) => s.trim()))).slice(0, 5)
    const scripture = Array.from(new Set([...aiScripture, ...localScripture])).slice(0, 5)

    return NextResponse.json({
      success: true,
      tags: aiTags,
      scripture,
    })
  } catch (err: any) {
    console.error('POST /api/notes/suggest-tags error:', err)
    return NextResponse.json({ success: false, error: err.message || '태그 추천 실패' }, { status: 500 })
  }
}

function mockSuggest(text: string, existing: string[]) {
  const keywords = ['은혜', '사랑', '십자가', '회개', '소망', '교제', '말씀', '기도', '성령', '순종', '감사', '평안', '인내', '믿음', '회복']
  const tags: string[] = []
  for (const k of keywords) {
    if (text.includes(k) && !tags.includes(k)) tags.push(k)
    if (tags.length >= 4) break
  }
  if (tags.length === 0 && existing.length > 0) tags.push(existing[0])
  if (tags.length === 0) tags.push('은혜')

  const scripture = Array.from(new Set((text.match(SCRIPTURE_REGEX) || []).map((s) => s.trim()))).slice(0, 3)
  return { tags, scripture }
}
