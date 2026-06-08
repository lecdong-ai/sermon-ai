import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createServerClient } from '@supabase/ssr'
import { supabaseAdmin } from '@/lib/supabase'

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
    const user = await getUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const { data: usage } = await supabaseAdmin
      .from('user_usage')
      .select('plan')
      .eq('user_id', user.id)
      .single()

    if (usage?.plan !== 'pro') {
      return NextResponse.json({ success: false, error: 'Pro 플랜에서만 이용 가능합니다.' }, { status: 403 })
    }

    const body = await request.json()
    const { manuscript, coreMessage, outlinePoints, title, passage, allThemes } = body

    if (!manuscript && !coreMessage) {
      return NextResponse.json({ success: false, error: '원고 또는 핵심 메시지가 필요합니다.' }, { status: 400 })
    }

    const themeList = allThemes || []
    const themeOptions = themeList.map((t: any) => `{"id": "${t.id}", "name": "${t.name}"}`).join(', ')

    const systemPrompt = `당신은 설교문을 분석하여 가장 적합한 태그를 선택하는 AI입니다.
주어진 설교문의 내용, 핵심 메시지, 대지를 분석하여 아래 태그 목록에서 가장 잘 맞는 태그 ID를 4~6개 선택하세요.

사용 가능한 태그 목록:
${themeOptions}

반드시 JSON 배열 형식으로만 응답하세요. 예: ["theme-major-1", "situation-6", "emotion-2"]`

    const userText = `설교 제목: ${title || '미정'}
성경 본문: ${passage || '미정'}
핵심 메시지: ${coreMessage || ''}
대지: ${Array.isArray(outlinePoints) ? outlinePoints.filter(Boolean).join(' / ') : ''}
설교 원고: ${manuscript || ''}

위 내용을 분석하여 가장 적합한 태그 ID를 4~6개 선택하세요.`

    const res = await getOpenai().chat.completions.create({
      model: 'gpt-5.4-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userText },
      ],
      temperature: 0.3,
      max_completion_tokens: 200,
    })

    const raw = res.choices[0]?.message?.content || ''
    const cleaned = raw.replace(/^```json\s*|```\s*$/g, '').trim()
    let parsed: string[]
    try {
      parsed = JSON.parse(cleaned)
    } catch {
      const match = cleaned.match(/\[[\s\S]*?\]/)
      parsed = match ? JSON.parse(match[0]) : []
    }

    const validIds = themeList.map((t: any) => t.id)
    const filtered = parsed.filter((id: string) => validIds.includes(id))

    return NextResponse.json({ success: true, tags: filtered })
  } catch (err: any) {
    console.error('POST /api/analyze-tags error:', err)
    return NextResponse.json({ success: false, error: err.message || '분석 실패' }, { status: 500 })
  }
}
