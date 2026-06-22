import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import JSON5 from 'json5'
import { createServerClient } from '@supabase/ssr'
import { supabaseAdmin } from '@/lib/supabase'
import { PROMPTS } from '@/lib/dashboard/sermonWizardPrompts'
import { checkOpenAIRateLimit } from '@/lib/auth'

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

function escapeJSON(str: string): string {
  let result = ''
  let inString = false
  for (let i = 0; i < str.length; i++) {
    const ch = str[i]
    if (ch === '"' && (i === 0 || str[i - 1] !== '\\')) inString = !inString
    if (inString && ch === '\n') { result += '\\n'; continue }
    if (inString && ch === '\r') { result += '\\r'; continue }
    if (inString && ch === '\t') { result += '\\t'; continue }
    result += ch
  }
  return result
}

function safeParse(raw: string): any {
  let cleaned = raw.replace(/^```json\s*|```\s*$/g, '').trim()
  
  // Find the first [ or { and slice from there
  const firstBracket = Math.min(
    cleaned.indexOf('[') !== -1 ? cleaned.indexOf('[') : Infinity,
    cleaned.indexOf('{') !== -1 ? cleaned.indexOf('{') : Infinity
  )
  if (firstBracket !== Infinity) {
    cleaned = cleaned.slice(firstBracket)
  }
  
  // Try parsing directly first
  try { return JSON5.parse(cleaned) } catch {}
  try { return JSON.parse(cleaned) } catch {}
  
  // Try with escaped newlines
  const escaped = escapeJSON(cleaned)
  try { return JSON5.parse(escaped) } catch {}
  try { return JSON.parse(escaped) } catch {}
  
  // Try extracting just the array/object with balanced brackets
  const bracketMatch = cleaned.match(/^(\[[\s\S]*\]|\{[\s\S]*\})/)
  if (bracketMatch) {
    const str = bracketMatch[1]
    const escaped = escapeJSON(str)
    try { return JSON5.parse(escaped) } catch {}
    try { return JSON.parse(escaped) } catch {}
  }
  
  // Last resort: try to find any JSON-like structure
  for (let start = 0; start < cleaned.length; start++) {
    if (cleaned[start] === '[' || cleaned[start] === '{') {
      for (let end = cleaned.length; end > start; end--) {
        if ((cleaned[start] === '[' && cleaned[end-1] === ']') ||
            (cleaned[start] === '{' && cleaned[end-1] === '}')) {
          const segment = cleaned.slice(start, end)
          const escaped = escapeJSON(segment)
          try { return JSON5.parse(escaped) } catch {}
          try { return JSON.parse(escaped) } catch {}
        }
      }
    }
  }
  
  throw new Error('Failed to parse AI response as JSON:\n' + cleaned.slice(0, 500))
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
    const { title, passage, coreMessage, pointIndex, mode, context, bibleText: bibleTextInput, pointTitle, length: msLength, pointDetail, sentence, existingManuscript, style: msStyle } = body

    let systemPrompt: string
    let userText: string

    // ── Wizard mode handlers ──
    if (mode === 'wizard-titles') {
      const p = PROMPTS.suggestTitles(passage || '', bibleTextInput || '')
      systemPrompt = p.system
      userText = p.user
    } else if (mode === 'wizard-core-message') {
      const p = PROMPTS.coreMessage(context || '')
      systemPrompt = p.system
      userText = p.user
    } else if (mode === 'wizard-outline') {
      const p = PROMPTS.outline(context || '')
      systemPrompt = p.system
      userText = p.user
    } else if (mode === 'wizard-body-section') {
      const p = PROMPTS.bodySection(context || '', typeof pointIndex === 'number' ? pointIndex : 0, pointTitle || '')
      systemPrompt = p.system
      userText = p.user
    } else if (mode === 'wizard-intro-conclusion') {
      const p = PROMPTS.introConclusion(context || '')
      systemPrompt = p.system
      userText = p.user
    } else if (mode === 'wizard-manuscript') {
      const p = PROMPTS.manuscript(context || '', msLength || '30분', msStyle || '강해식')
      systemPrompt = p.system
      userText = p.user
    } else if (mode === 'wizard-manuscript-section') {
      const p = PROMPTS.manuscriptSection(context || '', pointTitle || '', existingManuscript || '')
      systemPrompt = p.system
      userText = p.user
    } else if (mode === 'wizard-audience-profile') {
      const p = PROMPTS.audienceProfile(context || '')
      systemPrompt = p.system
      userText = p.user
    } else if (mode === 'wizard-audience-needs') {
      const p = PROMPTS.audienceNeeds(context || '')
      systemPrompt = p.system
      userText = p.user
    } else if (mode === 'wizard-application-direction') {
      const p = PROMPTS.applicationDirection(context || '')
      systemPrompt = p.system
      userText = p.user
    } else if (mode === 'wizard-outline-point') {
      const p = PROMPTS.outlinePoint(context || '', typeof pointIndex === 'number' ? pointIndex : 0, pointTitle || '')
      systemPrompt = p.system
      userText = p.user
    } else if (mode === 'wizard-point-title') {
      const sentence = body.sentence || ''
      const p = PROMPTS.pointTitleFromSentence(context || '', sentence)
      systemPrompt = p.system
      userText = p.user
    } else if (mode === 'wizard-point-variation') {
      const detail = body.pointDetail || ''
      const p = PROMPTS.pointVariation(context || '', pointTitle || '', detail)
      systemPrompt = p.system
      userText = p.user
    } else if (title && !passage) {
      systemPrompt = '당신은 설교 준비를 돕는 AI입니다. 주어진 설교 제목에 가장 적합한 성경본문(책 장:절) 5가지를 추천하고, 각각을 추천하는 이유를 한 문장씩 설명하세요. 반드시 JSON 배열로만 응답하세요.'
      userText = `설교 제목: ${title}\n\n[{"value": "본문1", "reason": "추천 이유1"}, {"value": "본문2", "reason": "추천 이유2"}, {"value": "본문5", "reason": "추천 이유5"}] 형식으로 5가지를 추천해주세요.`
    } else if (passage && !title) {
      systemPrompt = '당신은 설교 준비를 돕는 AI입니다. 주어진 성경본문에 가장 적합한 설교 제목 5가지를 추천하고, 각각을 추천하는 이유를 한 문장씩 설명하세요. 반드시 JSON 배열로만 응답하세요.'
      userText = `성경본문: ${passage}\n\n[{"value": "제목1", "reason": "추천 이유1"}, {"value": "제목2", "reason": "추천 이유2"}, {"value": "제목5", "reason": "추천 이유5"}] 형식으로 5가지를 추천해주세요.`
    } else if (title && passage && !coreMessage) {
      systemPrompt = '당신은 설교 준비를 돕는 AI입니다. 주어진 설교 제목과 성경본문에 가장 적합한 핵심 메시지 4가지를 추천하고, 각각을 추천하는 이유를 한 문장씩 설명하세요. 각 핵심 메시지는 1~2문장으로 간결하게 작성하세요. 반드시 JSON 배열로만 응답하세요.'
      userText = `설교 제목: ${title}\n성경본문: ${passage}\n\n[{"value": "핵심 메시지1", "reason": "추천 이유1"}, {"value": "핵심 메시지2", "reason": "추천 이유2"}, {"value": "핵심 메시지3", "reason": "추천 이유3"}, {"value": "핵심 메시지4", "reason": "추천 이유4"}] 형식으로 4가지를 추천해주세요.`
    } else if (title && passage && coreMessage && typeof pointIndex === 'number') {
      const labels = ['첫째', '둘째', '셋째']
      const label = labels[pointIndex] || `${pointIndex + 1}번째`
      systemPrompt = '당신은 개혁주의 복음주의 설교 조수다. 본문의 원뜻을 우선 파악하고, 이미 정해진 핵심 메시지를 중심으로 설교의 흐름을 정리하라. 한국교회 주일예배 강단에서 바로 사용할 수 있는 소주제를 추천하라. 반드시 지킬 원칙: 1) 본문 구조와 문맥에서 나와야 한다. 2) 핵심 메시지를 분명하게 뒷받침해야 한다. 3) 명사형 제목이 아니라 설교형 문장으로 작성하라. 4) 문장은 짧고 분명하고 회중이 기억하기 쉽게 써라. 5) 단순한 도덕 교훈으로 흐르지 말고 그리스도 중심적으로 정리하라. 반드시 JSON 배열로만 응답하세요.'
      userText = `설교 제목: ${title}\n성경본문: ${passage}\n핵심 메시지: ${coreMessage}\n\n위 설교의 ${label} 대지로 적합한 소주제 3가지를 추천하고, 각각에 대한 상세 설명도 함께 제공하세요.\n\n[{"title": "소주제 문장1", "description": "이 대지에 대한 상세 설명", "reason": "추천 이유1"}, {"title": "소주제 문장2", "description": "이 대지에 대한 상세 설명", "reason": "추천 이유2"}, {"title": "소주제 문장3", "description": "이 대지에 대한 상세 설명", "reason": "추천 이유3"}]`
    } else if (title && passage && coreMessage && body.generateAllPoints) {
      systemPrompt = `당신은 개혁주의 복음주의 설교 조수다. 내가 주는 설교 제목, 성경 본문, 핵심 메시지를 바탕으로 본문에 충실하고 강단에서 바로 선포할 수 있는 설교 3대지를 추천하라.

[역할]
- 본문의 원뜻을 우선 파악하라.
- 이미 정해진 핵심 메시지를 중심으로 설교의 흐름을 정리하라.
- 한국교회 주일예배 강단에서 바로 사용할 수 있는 3대지를 제안하라.

[반드시 지킬 원칙]
1. 대지는 반드시 본문 구조와 문맥에서 나와야 한다.
2. 이미 정해진 핵심 메시지를 분명하게 뒷받침해야 한다.
3. 3대지는 서로 중복되지 않아야 한다.
4. 3대지는 논리적으로 자연스럽게 연결되어야 한다.
5. 대지는 명사형 제목이 아니라 설교형 문장으로 작성하라.
6. 문장은 짧고 분명하고 회중이 기억하기 쉽게 써라.
7. 각 대지는 설명, 복음, 적용으로 확장 가능해야 한다.
8. 단순한 도덕 교훈으로 흐르지 말고 그리스도 중심적으로 정리하라.
9. 본문이 실제로 말하지 않는 내용은 넣지 마라.
10. 억지로 감동적이거나 추상적으로 쓰지 말고, 성경적이고 목회적으로 작성하라.

반드시 아래 JSON 배열 형식으로만 응답하라. 각 항목은 title(대지 제목), description(대지에 대한 상세 설명), reason(추천 이유) 필드를 가져야 한다.`
      userText = `[입력]
설교 제목: ${title}
성경 본문: ${passage}
핵심 메시지: ${coreMessage}

[{"title": "대지1 제목", "description": "대지1 상세 설명", "reason": "추천 이유1"}, {"title": "대지2 제목", "description": "대지2 상세 설명", "reason": "추천 이유2"}, {"title": "대지3 제목", "description": "대지3 상세 설명", "reason": "추천 이유3"}]`
    } else if (title && passage && coreMessage && body.generateApplication) {
      const points = body.outlinePoints || []
      const details = body.outlineDetails || []
      systemPrompt = body.suggestOnly
        ? `당신은 개혁주의 복음주의 설교 조수다. 설교 제목, 성경 본문, 핵심 메시지, 3대지를 바탕으로 "그리스도 중심으로 연결하기" 적용 3가지를 추천하라. 각 적용은 3~5문장으로 작성하라. 반드시 JSON 배열로만 응답하라.`
        : `당신은 개혁주의 복음주의 설교 조수다. 설교 제목, 성경 본문, 핵심 메시지, 3대지를 바탕으로 "그리스도 중심으로 연결하기" 적용을 작성하라.

[역할]
- 3대지 각각을 그리스도와 어떻게 연결할지 제시하라.
- 본문이 말하는 그리스도의 구속사적 의미를 드러내라.
- 회중이 오늘날 어떻게 그리스도 안에서 이 말씀을 살아낼지 구체적으로 제시하라.

[반드시 지킬 원칙]
1. 단순한 도덕 교훈이 아니라 그리스도의 복음으로 연결하라.
2. 각 대지별로 그리스도와의 연결점을 한 문단씩 작성하라.
3. 회중이 실제로 적용할 수 있는 구체적인 삶의 영역을 제시하라.
4. 억지로 감동적이거나 추상적으로 쓰지 말고, 성경적이고 목회적으로 작성하라.
5. 한국교회 주일예배 강단에서 바로 선포할 수 있는 언어로 써라.

반드시 JSON 객체 형식으로 응답하라. value 필드에 전체 적용문을 담아라.`
      userText = `설교 제목: ${title}
성경 본문: ${passage}
핵심 메시지: ${coreMessage}
3대지:
${points.map((p: string, i: number) => `대지 ${i + 1}: ${p}${details[i] ? ` - ${details[i]}` : ''}`).join('\n')}

${body.suggestOnly ? '[{"value": "적용1", "reason": "추천 이유1"}, {"value": "적용2", "reason": "추천 이유2"}, {"value": "적용3", "reason": "추천 이유3"}]' : '{"value": "그리스도 중심 적용문 전체"}'}`
    } else if (title && passage && coreMessage && body.generateIntroduction) {
      const points = body.outlinePoints || []
      const details = body.outlineDetails || []
      systemPrompt = body.suggestOnly
        ? `당신은 개혁주의 복음주의 설교 조수다. 설교 제목, 성경 본문, 핵심 메시지, 3대지를 바탕으로 강단에서 바로 사용할 수 있는 설교 서론 3가지를 추천하라. 각 서론은 3~5문장으로 작성하라. 반드시 JSON 배열로만 응답하라.`
        : `당신은 개혁주의 복음주의 설교 조수다. 설교 제목, 성경 본문, 핵심 메시지, 3대지를 바탕으로 강단에서 바로 사용할 수 있는 설교 서론을 작성하라.

[역할]
- 회중의 관심을 끌고 본문으로 자연스럽게 인도하라.
- 본문의 배경이나 상황을 간략하게 소개하라.
- 핵심 메시지로 자연스럽게 연결되도록 하라.

[반드시 지킬 원칙]
1. 지나치게 길지 않게 3~5문장으로 작성하라.
2. 본문과 직접 관련된 내용으로 시작하라.
3. 설교형 문장으로 강단에서 선포하듯 써라.
4. 억지로 감동적이거나 추상적으로 쓰지 말라.

반드시 JSON 객체 형식으로 응답하라. value 필드에 서론 전문을 담아라.`
      userText = `설교 제목: ${title}
성경 본문: ${passage}
핵심 메시지: ${coreMessage}
3대지:
${points.map((p: string, i: number) => `대지 ${i + 1}: ${p}${details[i] ? ` - ${details[i]}` : ''}`).join('\n')}

${body.suggestOnly ? '[{"value": "결론1", "reason": "추천 이유1"}, {"value": "결론2", "reason": "추천 이유2"}, {"value": "결론3", "reason": "추천 이유3"}]' : '{"value": "결론 전문"}'}`
    } else if (title && passage && coreMessage && body.generateConclusion) {
      const points = body.outlinePoints || []
      const details = body.outlineDetails || []
      const intro = body.introduction || ''
      const application = body.application || ''
      const illustration = body.illustration || ''
      systemPrompt = body.suggestOnly
        ? `당신은 개혁주의 복음주의 설교 조수다. 설교 제목, 성경 본문, 핵심 메시지, 3대지, 적용, 서론, 예화를 모두 종합하여 강단에서 바로 사용할 수 있는 설교 결론 3가지를 추천하라. 각 결론은 3~5문장으로 작성하라. 반드시 JSON 배열로만 응답하라.`
        : `당신은 개혁주의 복음주의 설교 조수다. 설교 제목, 성경 본문, 핵심 메시지, 3대지, 적용, 서론, 예화를 모두 종합하여 강단에서 바로 사용할 수 있는 설교 결론을 작성하라.

[역할]
- 3대지를 요약하고 핵심 메시지로 수렴하라.
- 회중이 오늘날 어떻게 살아야 할지 구체적으로 적용하라.
- 그리스도의 은혜와 복음으로 마무리하라.

[반드시 지킬 원칙]
1. 지나치게 길지 않게 3~5문장으로 작성하라.
2. 기도나 고백으로 마무리하는 형식을 사용할 수 있다.
3. 핵심 메시지를 다시 한번 각인시키라.
4. 희망과 도전을 동시에 주는 결론이 되게 하라.

반드시 JSON 객체 형식으로 응답하라. value 필드에 결론 전문을 담아라.`
      userText = `설교 제목: ${title}
성경 본문: ${passage}
핵심 메시지: ${coreMessage}
3대지:
${points.map((p: string, i: number) => `대지 ${i + 1}: ${p}${details[i] ? ` - ${details[i]}` : ''}`).join('\n')}
${intro ? `\n서론: ${intro}` : ''}
${application ? `\n적용: ${application}` : ''}
${illustration ? `\n예화: ${illustration}` : ''}

${body.suggestOnly ? '[{"value": "결론1", "reason": "추천 이유1"}, {"value": "결론2", "reason": "추천 이유2"}, {"value": "결론3", "reason": "추천 이유3"}]' : '{"value": "결론 전문"}'}`
    } else if (title && passage && coreMessage && body.generateIllustration) {
      const points = body.outlinePoints || []
      const details = body.outlineDetails || []
      const intro = body.introduction || ''
      const conclusion = body.conclusion || ''
      const application = body.application || ''
      systemPrompt = body.suggestOnly
        ? `당신은 개혁주의 복음주의 설교 조수다. 설교 제목, 성경 본문, 핵심 메시지, 3대지를 바탕으로 설교에 사용할 예화 3가지를 추천하라. 각 예화는 실제 사례나 이야기 형식으로 3~5문장으로 작성하라. 반드시 JSON 배열로만 응답하라.`
        : `당신은 개혁주의 복음주의 설교 조수다. 설교 제목, 성경 본문, 핵심 메시지, 3대지를 바탕으로 설교에 사용할 예화를 작성하라.

[역할]
- 본문의 주제와 연결되는 실제적인 예화를 제시하라.
- 회중이 공감할 수 있는 일상적인 상황이나 실제 사례를 들어라.
- 예화를 통해 핵심 메시지가 더 선명하게 드러나도록 하라.

[반드시 지킬 원칙]
1. 지나치게 길지 않게 3~5문장으로 작성하라.
2. 본문과 직접 관련된 내용이어야 한다.
3. 설교형 문장으로 강단에서 선포하듯 써라.
4. 억지로 감동적이거나 추상적으로 쓰지 말라.
5. 실제로 일어날 법한 현실적인 예화를 들어라.

반드시 JSON 객체 형식으로 응답하라. value 필드에 예화 전문을 담아라.`
      userText = `설교 제목: ${title}
성경 본문: ${passage}
핵심 메시지: ${coreMessage}
3대지:
${points.map((p: string, i: number) => `대지 ${i + 1}: ${p}${details[i] ? ` - ${details[i]}` : ''}`).join('\n')}
${intro ? `\n서론: ${intro}` : ''}
${conclusion ? `\n결론: ${conclusion}` : ''}
${application ? `\n적용: ${application}` : ''}

${body.suggestOnly ? '[{"value": "예화1", "reason": "추천 이유1"}, {"value": "예화2", "reason": "추천 이유2"}, {"value": "예화3", "reason": "추천 이유3"}]' : '{"value": "예화 전문"}'}`
    } else if (title && passage && coreMessage && body.generateManuscript) {
      const points = body.outlinePoints || []
      const details = body.outlineDetails || []
      const intro = body.introduction || ''
      const conclusion = body.conclusion || ''
      const application = body.application || ''
      const illustration = body.illustration || ''
      const lengthGuide = body.length === '10분' ? '1,400~1,700자 (약 10분 설교)'
        : body.length === '20분' ? '2,800~3,400자 (약 20분 설교)'
        : body.length === '30분' ? '4,200~5,100자 (약 30분 설교)'
        : body.length === '40분' ? '5,600~6,800자 (약 40분 설교)'
        : body.length === '50분' ? '7,000~8,500자 (약 50분 설교)'
        : '8,400~10,200자 (약 60분 설교)'
      systemPrompt = `당신은 개혁주의 복음주의 설교 조수다. 아래 모든 내용을 종합하여 강단에서 바로 선포할 수 있는 완전한 설교 원고를 작성하라.

[설교 구조]
1. 서론 (본문 배경, 설교 주제 제시, 회중의 관심 끌기)
2. 대지 1: ${points[0] || '첫째 대지'} (본문 설명 → 예화 → 복음 연결 → 적용)
3. 대지 2: ${points[1] || '둘째 대지'} (본문 설명 → 예화 → 복음 연결 → 적용)
4. 대지 3: ${points[2] || '셋째 대지'} (본문 설명 → 예화 → 복음 연결 → 적용)
5. 결론 (핵심 요약, 복음 재진술, 구체적 도전, 축도)

[반드시 지킬 원칙]
- 각 대지는 반드시 예화를 포함하라.
- 그리스도 중심의 복음으로 연결하라.
- 설교형 문장으로 강단에서 선포하듯 생동감 있게 써라.
- **매우 상세하고 풍성하게 작성하라. 각 섹션을 충분히 풀어서 설명하라.**
- **분량은 반드시 ${lengthGuide}를 충족해야 한다. 분량이 부족하면 절대 안 된다.**
- **결론까지 모두 작성한 후에도 분량이 부족하면 추가 설명, 예화, 적용을 계속 추가하라.**

반드시 JSON 객체 형식으로 응답하라. value 필드에 전체 설교 원고를 담아라.`
      userText = `설교 제목: ${title}
성경 본문: ${passage}
핵심 메시지: ${coreMessage}
3대지:
${points.map((p: string, i: number) => `대지 ${i + 1}: ${p}${details[i] ? ` - ${details[i]}` : ''}`).join('\n')}
${intro ? `\n서론: ${intro}` : ''}
${conclusion ? `\n결론: ${conclusion}` : ''}
${application ? `\n적용: ${application}` : ''}
${illustration ? `\n예화: ${illustration}` : ''}

{"value": "완전한 설교 원고 전문"}`
    } else {
      return NextResponse.json({ success: false, error: '제목과 본문 중 하나 이상을 입력해주세요.' }, { status: 400 })
    }

    const res = await getOpenai().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userText },
      ],
      temperature: mode === 'wizard-manuscript' || body.generateManuscript ? 0.7 : mode === 'wizard-body-section' || mode === 'wizard-intro-conclusion' ? 0.5 : 0.3,
      presence_penalty: mode === 'wizard-manuscript' || body.generateManuscript ? 0.6 : 0,
      max_completion_tokens: mode === 'wizard-manuscript'
        ? msLength === '10분' ? 3000
        : msLength === '15분' ? 4000
        : msLength === '20분' ? 6000
        : msLength === '25분' ? 8000
        : msLength === '30분' ? 10000
        : msLength === '40분' ? 14000
        : 10000
        : body.generateManuscript
          ? body.length === '10분' ? 3000
          : body.length === '20분' ? 6000
          : body.length === '30분' ? 10000
          : body.length === '40분' ? 14000
          : body.length === '50분' ? 18000
          : 22000
        : mode === 'wizard-outline' ? 2000
        : mode === 'wizard-body-section' ? 1500
        : mode === 'wizard-intro-conclusion' ? 1500
        : (body.generateAllPoints || (body.generateApplication && !body.suggestOnly) || (body.generateIllustration && !body.suggestOnly) || (body.generateIntroduction && !body.suggestOnly) || (body.generateConclusion && !body.suggestOnly)) ? 2000 : 1000,
    })

    // API 사용량 추적 (fire-and-forget)
    if (res.usage) {
      const { trackAIUsage } = await import('@/lib/ai/trackUsage')
      trackAIUsage({
        userId: user.id,
        apiType: `suggest:${mode || 'default'}`,
        model: 'gpt-4o-mini',
        usage: res.usage,
      }).catch(() => {})
    }

    const raw = res.choices[0]?.message?.content || ''
    let parsed
    try {
      parsed = safeParse(raw)
    } catch (parseErr: any) {
      console.error('[suggest] parse error:', parseErr.message)
      return NextResponse.json({ success: false, error: parseErr.message || 'JSON 파싱 실패', rawResponse: raw.slice(0, 300) }, { status: 500 })
    }

    // ── Wizard mode responses (return raw parsed data as-is) ──
    if (mode === 'wizard-titles' || mode === 'wizard-core-message') {
      const items = Array.isArray(parsed)
        ? parsed
        : parsed.suggestions || []
      return NextResponse.json({ success: true, suggestions: items })
    }
    if (mode === 'wizard-outline') {
      return NextResponse.json({ success: true, data: parsed })
    }
    if (mode === 'wizard-body-section') {
      return NextResponse.json({ success: true, data: parsed })
    }
    if (mode === 'wizard-intro-conclusion') {
      return NextResponse.json({ success: true, data: parsed })
    }
    if (mode === 'wizard-manuscript') {
      const raw = parsed.value || parsed.text || ''
      const text = typeof raw === 'string' ? raw : typeof raw === 'object' ? JSON.stringify(raw, null, 2) : String(raw)
      return NextResponse.json({ success: true, text })
    }
    if (mode === 'wizard-manuscript-section') {
      const raw = parsed.value || parsed.text || ''
      const text = typeof raw === 'string' ? raw : typeof raw === 'object' ? JSON.stringify(raw, null, 2) : String(raw)
      return NextResponse.json({ success: true, text })
    }
    if (mode === 'wizard-audience-profile' || mode === 'wizard-audience-needs' || mode === 'wizard-application-direction') {
      const items = Array.isArray(parsed)
        ? parsed
        : parsed.suggestions || []
      return NextResponse.json({ success: true, suggestions: items })
    }
    if (mode === 'wizard-outline-point') {
      return NextResponse.json({ success: true, data: parsed })
    }
    if (mode === 'wizard-point-title' || mode === 'wizard-point-variation') {
      const items = Array.isArray(parsed)
        ? parsed
        : parsed.suggestions || []
      return NextResponse.json({ success: true, suggestions: items })
    }

    let items: { value: string; reason: string }[] = Array.isArray(parsed)
      ? parsed
      : parsed.suggestions
        ? parsed.suggestions
        : parsed.value
          ? [{ value: parsed.value, reason: parsed.reason || '' }]
          : parsed.text
            ? [{ value: parsed.text, reason: '' }]
            : Object.values(parsed).filter((v): v is string => typeof v === 'string').map(v => ({ value: v, reason: '' }))

    if ((body.generateApplication && !body.suggestOnly) || body.generateManuscript || (body.generateIllustration && !body.suggestOnly) || (body.generateIntroduction && !body.suggestOnly) || (body.generateConclusion && !body.suggestOnly)) {
      return NextResponse.json({ success: true, text: parsed.value || parsed.text || '' })
    }

    if (items.length === 0) {
      console.error('[suggest] empty items, raw response:', raw.slice(0, 500))
      return NextResponse.json({ success: false, error: 'AI 응답에서 추천 항목을 찾지 못했습니다', rawResponse: raw.slice(0, 500) }, { status: 500 })
    }

    return NextResponse.json({ success: true, suggestions: items })
  } catch (err: any) {
    console.error('POST /api/suggest error:', err)
    return NextResponse.json({ success: false, error: err.message || '제안 실패' }, { status: 500 })
  }
}
