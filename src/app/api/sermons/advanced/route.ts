import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { checkUsage, consumeWorkspaceUsage } from '@/lib/usage'
import OpenAI from 'openai'

let _openai: OpenAI | null = null
function getOpenai() {
  if (!_openai) {
    const key = process.env.OPENAI_API_KEY
    if (!key) throw new Error('OPENAI_API_KEY is not set')
    _openai = new OpenAI({ apiKey: key })
  }
  return _openai
}

const STEP_PROMPTS: Record<number, { system: string; buildUser: (data: any) => string }> = {
  1: {
    system: `당신은 설교 준비를 돕는 AI입니다. 입력된 성경본문과 설교 정보를 분석하여 설교 준비의 기본 방향을 정리해주세요.
결과는 아래 JSON 형식으로만 출력하세요:
{
  "passage_summary": "본문 개요를 2~3문장으로 요약",
  "key_theme": "본문의 핵심 주제",
  "preparation_direction": "설교 준비 방향과 집중해야 할 포인트"
}`,
    buildUser: (data) => {
      const { passage, title, topic, audience, context, sermon_type } = data
      const typeLabels: Record<string, string> = { expository: '강해설교', topical: '주제설교', sunday: '주일예배', wednesday: '수요예배', dawn: '새벽예배', youth: '청년부', adult: '장년부', newfamily: '전도/새가족' }
      return [
        '[성경본문]', passage,
        title ? `[설교 제목] ${title}` : null,
        topic ? `[설교 주제] ${topic}` : null,
        audience ? `[회중 대상] ${audience}` : null,
        context ? `[교회 상황] ${context}` : null,
        `[예배 유형] ${typeLabels[sermon_type] || '강해설교'}`,
      ].filter(Boolean).join('\n')
    },
  },
  2: {
    system: `당신은 성경신학에 기반한 설교 준비 AI입니다. 본문을 깊이 분석하여 요약, 배경, 핵심 메시지를 제안하세요.
결과는 아래 JSON 형식으로만 출력하세요:
{
  "passage_summary": "본문 내용 요약 (4~6문장)",
  "background": "본문의 역사적/문맥적 배경 설명",
  "context_meaning": "본문이 원 독자에게 주는 의미",
  "core_topic": "본문의 핵심 주제 (한 문장)",
  "core_message": "오늘날 성도에게 주는 핵심 메시지 (한 문장)"
}`,
    buildUser: (data) => `[성경본문]\n${data.passage}\n\n[추가 정보]\n${data.step1_result || ''}`,
  },
  3: {
    system: `당신은 설교 구조를 설계하는 AI입니다. 본문과 핵심 메시지를 바탕으로 설교 제목 후보와 대지 구성을 제안하세요.
결과는 아래 JSON 형식으로만 출력하세요:
{
  "title_candidates": ["제목 후보 1", "제목 후보 2", "제목 후보 3"],
  "direction": "전체 설교 방향 설명 (2~3문장)",
  "main_points": [
    { "title": "대지 1 제목", "key_sentence": "대지 1 핵심 문장" },
    { "title": "대지 2 제목", "key_sentence": "대지 2 핵심 문장" },
    { "title": "대지 3 제목", "key_sentence": "대지 3 핵심 문장" }
  ]
}`,
    buildUser: (data) => `[성경본문]\n${data.passage}\n\n[핵심 메시지]\n${data.step2_result || ''}\n\n[설교 방향]\n${data.direction || ''}`,
  },
  4: {
    system: `당신은 설교 대지를 확장하는 AI입니다. 각 대지를 풍성하게 설명하세요.
결과는 아래 JSON 형식으로만 출력하세요:
{
  "expanded_points": [
    {
      "title": "대지 제목",
      "exposition": "본문 해설과 상세 설명 (400~600자)",
      "meaning": "신앙적 의미와 적용 방향",
      "pastoral_emphasis": "목회적 강조점"
    }
  ]
}`,
    buildUser: (data) => `[성경본문]\n${data.passage}\n\n[대지 구성]\n${JSON.stringify(data.main_points || [])}\n\n[핵심 내용]\n${data.step2_result || ''}`,
  },
  5: {
    system: `당신은 설교 적용과 예화를 제안하는 AI입니다. 각 대지에 맞는 실천적 적용과 예화 아이디어를 제안하세요.
결과는 아래 JSON 형식으로만 출력하세요:
{
  "applications": [
    {
      "point_title": "대지 제목",
      "life_application": "삶의 구체적 적용 (2~3문장)",
      "community_application": "공동체 차원의 적용",
      "illustration_idea": "예화/사례 아이디어",
      "question": "회중에게 던질 질문"
    }
  ]
}`,
    buildUser: (data) => `[대지별 상세]\n${JSON.stringify(data.expanded_points || [])}\n\n[회중 상황]\n${data.audience || '일반'}`,
  },
  6: {
    system: `당신은 설교의 결론을 작성하는 AI입니다. 지금까지의 내용을 바탕으로 설교의 결론과 결단 촉구를 제안하세요.
결과는 아래 JSON 형식으로만 출력하세요:
{
  "summary": "설교 전체 요약 (2~3문장)",
  "conclusion": "결론 문단 (300~500자)",
  "commitment_call": "결단 촉구 문장",
  "prayer": "마무리 기도문 또는 대표기도 문구"
}`,
    buildUser: (data) => `[본문]\n${data.passage}\n\n[핵심 메시지]\n${data.step2_result || ''}\n\n[대지]\n${JSON.stringify(data.main_points || [])}\n\n[적용]\n${JSON.stringify(data.applications || [])}`,
  },
}

const FINAL_INTEGRATION_PROMPT = `당신은 30년 이상 강단을 지켜온 정통 복음주의 설교자입니다.

## 핵심 임무
지금까지 준비된 모든 단계별 자료를 바탕으로 **실제 강단에서 바로 사용할 수 있는 완성된 설교원고**를 작성하세요.

## 절대 원칙
1. 설교의 중심은 언제나 성경 본문이어야 한다.
2. 본문 해석 없이 감동만 유도하지 마라.
3. 도덕주의나 자기계발식 설교로 흐르지 마라.
4. 그리스도 중심적이며 복음 중심적이어야 한다.
5. 죄, 회개, 은혜, 믿음, 순종이 균형 있게 다루어져야 한다.
6. 본문보다 예화가 앞서지 않게 하라.
7. 추상적 문장보다 선명한 진술, 분명한 적용, 회개와 믿음의 초청이 있어야 한다.

## 출력 구조
반드시 아래 구조를 따라 작성하세요:

# 설교 제목
# 본문
# 핵심 명제
## 서론
## 대지 1 (본문 해설 + 신학적 의미 + 적용)
## 대지 2 (본문 해설 + 신학적 의미 + 적용)
## 대지 3 (본문 해설 + 신학적 의미 + 적용)
## 결론
## 회개와 믿음의 촉구
## 마무리 기도

## 작성 지침
- "여러분" 호칭을 사용한 구어체
- 각 대지마다 본문 설명, 신학적 의미, 죄성 진단, 복음의 빛, 구체적 적용을 포함
- 6,000~10,000자 분량으로 풍성하게 작성
- 실제 강단에서 참고 가능한 문장형 원고
- 신앙적 울림과 목회적 적용이 균형 있게 담길 것`

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const usageInfo = await checkUsage(user.id)
    if (usageInfo.workspace.remaining <= 0) {
      return NextResponse.json({ success: false, error: '설교원고제작 사용 한도를 초과했습니다.' }, { status: 403 })
    }

    const body = await request.json()
    const { step, ...data } = body

    if (step === 'final') {
      const userText = [
        '[설교 제목]', data.title || '(미입력)',
        '', '[성경본문]', data.passage || '',
        '', '[핵심 메시지]', data.core_message || '',
        '', '[설교 대지]', JSON.stringify(data.main_points || []),
        '', '[대지별 상세]', JSON.stringify(data.expanded_points || []),
        '', '[적용/예화]', JSON.stringify(data.applications || []),
        '', '[결론 자료]', data.conclusion_data || '',
        '', '[회중 상황]', data.audience || '일반',
      ].join('\n')

      const res = await getOpenai().chat.completions.create({
        model: 'gpt-5.4-mini',
        messages: [
          { role: 'system', content: FINAL_INTEGRATION_PROMPT },
          { role: 'user', content: userText },
        ],
        temperature: 0.7,
        max_tokens: 16000,
      })

      await consumeWorkspaceUsage(user.id).catch(() => {})

      return NextResponse.json({
        success: true,
        data: { full_text: res.choices[0]?.message?.content || '' },
      })
    }

    const stepConfig = STEP_PROMPTS[step]
    if (!stepConfig) {
      return NextResponse.json({ success: false, error: '올바른 단계를 지정해주세요.' }, { status: 400 })
    }

    if (!data.passage?.trim()) {
      return NextResponse.json({ success: false, error: '성경본문을 입력해주세요.' }, { status: 400 })
    }

    const userText = stepConfig.buildUser(data)

    const res = await getOpenai().chat.completions.create({
      model: 'gpt-5.4-mini',
      messages: [
        { role: 'system', content: stepConfig.system },
        { role: 'user', content: userText },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    })

    const raw = res.choices[0]?.message?.content || ''
    let parsed
    try {
      const cleaned = raw.replace(/^```json\s*|```\s*$/g, '').trim()
      parsed = JSON.parse(cleaned)
    } catch {
      parsed = { raw_text: raw }
    }

    return NextResponse.json({ success: true, data: parsed })
  } catch (err: any) {
    console.error('POST /api/sermons/advanced error:', err)
    return NextResponse.json({ success: false, error: err.message || '처리 실패' }, { status: 500 })
  }
}
