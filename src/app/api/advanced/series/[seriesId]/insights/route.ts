import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getUserFromRequest, checkOpenAIRateLimit } from '@/lib/auth'
import { SYSTEM_PROMPT } from '@/lib/ai/prompts/series-insights'
import { getSeriesById } from '@/lib/advanced/seriesData'

let _openai: OpenAI | null = null
function getOpenai() {
  if (!_openai) {
    const key = process.env.OPENAI_API_KEY
    if (!key) throw new Error('OPENAI_API_KEY is not set')
    _openai = new OpenAI({ apiKey: key })
  }
  return _openai
}

export async function GET(
  request: NextRequest,
  { params }: { params: { seriesId: string } }
) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const series = getSeriesById(params.seriesId)
    if (!series) {
      return NextResponse.json({ success: false, error: '시리즈를 찾을 수 없습니다.' }, { status: 404 })
    }

    const sermonData = series.sermons.map(s => ({
      title: s.title,
      passage: s.passage,
      status: s.status,
      wordCount: s.wordCount,
      coreMessage: s.coreMessage,
      order: s.order,
    }))

    const analysisInput = JSON.stringify({
      seriesTitle: series.title,
      seriesDescription: series.description,
      themeNames: series.themeNames,
      keyTopics: series.keyTopics,
      sermons: sermonData,
      totalSermons: series.totalSermons,
      completedSermons: series.completedSermons,
    })

    const res = await getOpenai().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `다음 설교 시리즈 데이터를 분석해주세요:\n\n${analysisInput}` },
      ],
      temperature: 0.5,
      max_completion_tokens: 3000,
      response_format: { type: 'json_object' },
    })

    let output = res.choices[0]?.message?.content || ''

    const start = output.indexOf('{')
    if (start !== -1) {
      let count = 0
      let end = -1
      for (let i = start; i < output.length; i++) {
        if (output[i] === '{') count++
        else if (output[i] === '}') count--
        if (count === 0) {
          end = i
          break
        }
      }
      if (end !== -1) output = output.slice(start, end + 1)
    }

    if (!output) {
      return NextResponse.json({ success: false, error: 'AI 응답을 생성하지 못했습니다.' }, { status: 500 })
    }

    try {
      const parsed = JSON.parse(output)
      return NextResponse.json({ success: true, data: parsed })
    } catch {
      return NextResponse.json({ success: false, error: 'AI 응답 형식이 올바르지 않습니다.' }, { status: 422 })
    }
  } catch (err: any) {
    console.error('GET /api/advanced/series/[seriesId]/insights error:', err)
    return NextResponse.json({ success: false, error: err.message || '분석 실패' }, { status: 500 })
  }
}
