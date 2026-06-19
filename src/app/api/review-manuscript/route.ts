import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import JSON5 from 'json5'
import { createServerClient } from '@supabase/ssr'
import { PROMPTS } from '@/lib/dashboard/sermonWizardPrompts'

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

    const body = await request.json()
    const { manuscript, context } = body

    if (!manuscript || !context) {
      return NextResponse.json({ success: false, error: '원고와 컨텍스트가 필요합니다.' }, { status: 400 })
    }

    const p = PROMPTS.manuscriptReview(context)

    const res = await getOpenai().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: p.system },
        { role: 'user', content: p.user.replace('[MANUSCRIPT_PLACEHOLDER]', manuscript) },
      ],
      temperature: 0.4,
      max_completion_tokens: 2000,
    })

    const raw = res.choices[0]?.message?.content || ''
    let parsed
    try {
      parsed = JSON5.parse(raw.replace(/^```json\s*|```\s*$/g, '').trim())
    } catch {
      return NextResponse.json({ success: false, error: 'AI 응답 파싱 실패', raw: raw.slice(0, 300) }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      review: {
        gospel_centered: parsed.gospel_centered || { score: 0, feedback: '', suggestion: '' },
        biblical_faithfulness: parsed.biblical_faithfulness || { score: 0, feedback: '', suggestion: '' },
        application_specificity: parsed.application_specificity || { score: 0, feedback: '', suggestion: '' },
        logical_flow: parsed.logical_flow || { score: 0, feedback: '', suggestion: '' },
        overall: parsed.overall || { score: 0, summary: '' },
      },
    })
  } catch (e: any) {
    console.error('[review-manuscript] Error:', e)
    return NextResponse.json({ success: false, error: e.message || '서버 오류' }, { status: 500 })
  }
}
