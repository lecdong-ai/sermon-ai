import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { QT_SYSTEM_PROMPT } from '@/lib/prompts/qt-theological-dna'

let _openai: any = null
function getOpenai() {
  if (!_openai) {
    const OpenAI = require('openai').default
    const key = process.env.OPENAI_API_KEY
    if (!key) throw new Error('OPENAI_API_KEY is not set')
    _openai = new OpenAI({ apiKey: key })
  }
  return _openai
}

interface SuggestionItem {
  value: string
  reason: string
}

function buildPrompt(
  field: string,
  context: { title?: string; passage?: string; bibleText?: string; keyVerse?: string; excerpt?: string }
): { system: string; user: string; maxTokens: number; returnArray: boolean } {
  const { title, passage, bibleText, keyVerse, excerpt } = context

  switch (field) {
    case 'title':
      return {
        system: `${QT_SYSTEM_PROMPT}\n\n주어진 성경 본문에 맞는 큐티 제목 5가지를 추천하라. 각 제목은 하나님 중심적이어야 하며, 복음을 향해 열려 있어야 한다. 도덕주의적, 성공주의적 제목을 피하라.\n\n반드시 JSON 형식으로 응답하고, 한국어를 사용하라.`,
        user: `성경 본문: ${passage}\n\n{"suggestions": [{"value": "제목1", "reason": "추천 이유1"}, {"value": "제목2", "reason": "추천 이유2"}, {"value": "제목3", "reason": "추천 이유3"}, {"value": "제목4", "reason": "추천 이유4"}, {"value": "제목5", "reason": "추천 이유5"}]} 형식으로 5가지를 추천해주세요.`,
        maxTokens: 800,
        returnArray: true,
      }

    case 'passage':
      return {
        system: `${QT_SYSTEM_PROMPT}\n\n주어진 큐티 제목에 가장 적합한 성경 본문 5가지를 추천하라. 각 본문은 문맥 안에서 해석 가능해야 하며, 복음과 연결될 수 있어야 한다.\n\n반드시 JSON 형식으로 응답하고, 한국어를 사용하라.`,
        user: `큐티 제목: ${title}\n\n{"suggestions": [{"value": "본문1", "reason": "추천 이유1"}, {"value": "본문2", "reason": "추천 이유2"}, {"value": "본문3", "reason": "추천 이유3"}, {"value": "본문4", "reason": "추천 이유4"}, {"value": "본문5", "reason": "추천 이유5"}]} 형식으로 5가지를 추천해주세요.`,
        maxTokens: 800,
        returnArray: true,
      }

    case 'excerpt':
      return {
        system: `${QT_SYSTEM_PROMPT}\n\n주어진 제목과 성경 본문에 맞는 큐티 간단 설명을 작성하라. 2~3문장으로, 인간의 무능과 복음의 필요성을 암시하는 방향으로 써라. 도덕적 교훈이나 감성적 위로로 끝나지 않게 하라.`,
        user: `제목: ${title}\n성경 본문: ${passage}\n\n{"value": "간단 설명", "reason": "이 설명이 적합한 이유"} 형식으로 응답해주세요.`,
        maxTokens: 400,
        returnArray: false,
      }

    case 'bibleText':
      return {
        system: `${QT_SYSTEM_PROMPT}\n\n주어진 성경 본문의 실제 텍스트를 한국어로 제공하라. 개역개정 또는 쉬운 성경 번역을 사용하라. 오직 성경 텍스트만 반환하라.`,
        user: `성경 본문: ${passage}\n\n{"value": "성경 본문 텍스트 전체"} 형식으로 응답해주세요.`,
        maxTokens: 1200,
        returnArray: false,
      }

    case 'keyVerse':
      return {
        system: `${QT_SYSTEM_PROMPT}\n\n주어진 성경 본문에서 큐티의 핵심을 가장 잘 담고 있는 구절 하나를 추천하라. 그 구절이 핵심인 이유를 한 문장으로 설명하라.`,
        user: `성경 본문: ${passage}\n제목: ${title}\n\n{"value": "핵심 구절 (책 장:절)", "reason": "이 구절이 핵심인 이유"} 형식으로 응답해주세요.`,
        maxTokens: 400,
        returnArray: false,
      }

    case 'content':
      return {
        system: `${QT_SYSTEM_PROMPT}\n\n주어진 제목, 성경 본문, 성경 본문 텍스트를 바탕으로 큐티 본문을 작성하라.

[구조]
1. 서론: 본문이 말하려는 핵심을 한두 문장으로 제시
2. 본문 관찰: 문맥 안에서 하나님이 어떻게 일하시는지를 보여줌
3. 인간의 무능과 죄 드러냄: 본문이 진단하는 인간의 실상
4. 복음의 빛: 본문이 가리키는 그리스도와 은혜
5. 적용: 은혜의 반응으로서의 순종 (도덕적 압박이 아님)

[반드시 지킬 것]
- 짧고 단정한 문장, 그러나 얕지 않게
- 차갑지 않되 날카롭게, 따뜻하되 무디지 않게
- 죄 진단 없이 따뜻하기만 한 글이 되지 말 것
- 복음 없이 결단만 강조하지 말 것
- 설교문처럼 과하게 길지 않게 (800~1200자)
- 마크다운 형식 사용 (## 소제목, > 인용구)`,
        user: `제목: ${title}
성경 본문: ${passage}
${bibleText ? `성경 본문 텍스트: ${bibleText}` : ''}
${keyVerse ? `핵심 구절: ${keyVerse}` : ''}

{"value": "큐티 본문 전체"} 형식으로 응답해주세요.`,
        maxTokens: 2000,
        returnArray: false,
      }

    default:
      throw new Error(`Unknown field: ${field}`)
  }
}

function safeParse(raw: string, returnArray: boolean): any {
  let cleaned = raw.replace(/^```(?:json)?\s*|```\s*$/g, '').trim()

  const firstBracket = Math.min(
    cleaned.indexOf('[') !== -1 ? cleaned.indexOf('[') : Infinity,
    cleaned.indexOf('{') !== -1 ? cleaned.indexOf('{') : Infinity
  )
  if (firstBracket !== Infinity) {
    cleaned = cleaned.slice(firstBracket)
  }

  try { return JSON.parse(cleaned) } catch {}
  try { return require('json5').parse(cleaned) } catch {}

  const bracketMatch = cleaned.match(/^(\[[\s\S]*\]|\{[\s\S]*\})/)
  if (bracketMatch) {
    try { return JSON.parse(bracketMatch[1]) } catch {}
    try { return require('json5').parse(bracketMatch[1]) } catch {}
  }

  if (!returnArray) {
    return { value: raw.trim() }
  }

  throw new Error('Failed to parse AI response: ' + cleaned.slice(0, 300))
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll() },
          setAll() {},
        },
      },
    )
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
      return NextResponse.json({ success: false, error: '인증이 필요합니다' }, { status: 401 })
    }

    const body = await request.json()
    const { field, title, passage, bibleText, keyVerse, excerpt } = body

    const validFields = ['title', 'passage', 'excerpt', 'bibleText', 'keyVerse', 'content']
    if (!validFields.includes(field)) {
      return NextResponse.json({ success: false, error: '올바르지 않은 필드입니다' }, { status: 400 })
    }

    const context: any = {}
    if (title) context.title = title
    if (passage) context.passage = passage
    if (bibleText) context.bibleText = bibleText
    if (keyVerse) context.keyVerse = keyVerse
    if (excerpt) context.excerpt = excerpt

    const { system, user, maxTokens, returnArray } = buildPrompt(field, context)

    const res = await getOpenai().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: field === 'content' ? 0.7 : 0.3,
      max_completion_tokens: maxTokens,
    })

    const raw = res.choices[0]?.message?.content || ''
    let parsed
    try {
      parsed = safeParse(raw, returnArray)
    } catch (e: any) {
      console.error('[qt-suggest] parse error:', e.message)
      return NextResponse.json({ success: false, error: e.message }, { status: 500 })
    }

    if (returnArray) {
      const items: SuggestionItem[] = Array.isArray(parsed)
        ? parsed
        : parsed.suggestions
          ? parsed.suggestions
          : parsed.value
            ? [{ value: parsed.value, reason: parsed.reason || '' }]
            : []
      if (items.length === 0) {
        return NextResponse.json({ success: false, error: '추천 항목을 생성하지 못했습니다' }, { status: 500 })
      }
      return NextResponse.json({ success: true, suggestions: items })
    } else {
      const value = parsed.value || parsed.text || ''
      const reason = parsed.reason || ''
      if (!value) {
        return NextResponse.json({ success: false, error: '내용을 생성하지 못했습니다' }, { status: 500 })
      }
      return NextResponse.json({ success: true, suggestions: [{ value, reason }] })
    }
  } catch (err: any) {
    console.error('POST /api/qt-suggest error:', err)
    return NextResponse.json({ success: false, error: err.message || '추천 실패' }, { status: 500 })
  }
}
