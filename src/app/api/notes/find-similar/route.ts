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

interface ExistingNote {
  id: string
  title: string
  summary: string
  tags: string[]
  type: string
  updatedAt: string
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const body = await request.json()
    const text: string = (body.text || '').trim()
    const existingNotes: ExistingNote[] = Array.isArray(body.existingNotes) ? body.existingNotes.slice(0, 50) : []
    const currentNoteId: string | null = body.currentNoteId || null

    if (!text || text.length < 10) {
      return NextResponse.json({ success: true, matches: [] })
    }
    if (existingNotes.length === 0) {
      return NextResponse.json({ success: true, matches: [] })
    }

    const useMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true'
    if (useMock) {
      return NextResponse.json({ success: true, matches: mockSimilarity(text, existingNotes, currentNoteId) })
    }

    const compact = existingNotes
      .filter((n) => n.id !== currentNoteId)
      .map((n) => ({ id: n.id, t: n.title, s: n.summary, g: n.tags.join(','), y: n.type }))
      .slice(0, 40)

    const systemPrompt = `당신은 설교 메모의 의미적 유사도를 판단하는 보조 AI다. 사용자가 작성 중인 새 메모와 기존 메모 목록을 비교해, 의미적으로 관련 있는 기존 메모의 ID를 관련도 순으로 정렬해 반환하라.

판단 기준:
- 같은 주제·신학 개념·본문을 다룰 때
- 같은 적용·질문·고민을 공유할 때
- 같은 시리즈/맥락에 놓일 때
- 단순히 같은 단어 포함이 아니라 의미적 연관성 우선

반드시 JSON 객체로만 응답하라: {"matches": [{"id": "기존메모ID", "score": 0~1, "reason": "관련 이유 한 문장"}]}
점수 0.5 이상만 포함하고, 최대 5개까지. 관련 메모가 없으면 빈 배열.`

    const res = await getOpenai().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `[새 메모]\n${text.slice(0, 800)}\n\n[기존 메모 목록]\n${JSON.stringify(compact)}`,
        },
      ],
      temperature: 0.2,
      max_completion_tokens: 600,
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

    const matches = Array.isArray(parsed.matches) ? parsed.matches : []
    const validIds = new Set(existingNotes.map((n) => n.id))
    const filtered = matches
      .filter((m: any) => validIds.has(m.id) && m.id !== currentNoteId)
      .slice(0, 5)
      .map((m: any) => ({
        id: m.id,
        score: Math.max(0, Math.min(1, Number(m.score) || 0.5)),
        reason: String(m.reason || '').slice(0, 120),
      }))

    return NextResponse.json({ success: true, matches: filtered })
  } catch (err: any) {
    console.error('POST /api/notes/find-similar error:', err)
    return NextResponse.json({ success: false, error: err.message || '유사 노트 검색 실패', matches: [] }, { status: 500 })
  }
}

function mockSimilarity(text: string, existing: ExistingNote[], currentNoteId: string | null) {
  const tokens = new Set(text.toLowerCase().split(/\s+/).filter((t) => t.length >= 2))
  const scored = existing
    .filter((n) => n.id !== currentNoteId)
    .map((n) => {
      const haystack = `${n.title} ${n.summary} ${n.tags.join(' ')}`.toLowerCase()
      let hits = 0
      tokens.forEach((t) => { if (haystack.includes(t)) hits++ })
      const score = Math.min(0.95, hits / Math.max(tokens.size, 5))
      return { id: n.id, score, reason: hits > 0 ? `공통 키워드 ${hits}개` : '관련 주제' }
    })
    .filter((m) => m.score >= 0.3)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
  return scored
}
