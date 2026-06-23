import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest, checkOpenAIRateLimit } from '@/lib/auth'
import { assertWithinLimit } from '@/lib/limits'
import { createApiClient } from '@/lib/supabase/api'
import { YoutubeTranscript } from 'youtube-transcript'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    // 한도 체크 (유튜브 분석)
    const limitCheck = await assertWithinLimit(request, 'youtube')
    if (!limitCheck.ok) {
      return limitCheck.response
    }

    const { url, force } = await request.json()
    if (!url) {
      return NextResponse.json({ error: 'YouTube URL을 입력해주세요.' }, { status: 400 })
    }

    const videoId = extractVideoId(url)
    if (!videoId) {
      return NextResponse.json({ error: '올바른 YouTube URL이 아닙니다.' }, { status: 400 })
    }

    const supabase = createApiClient(request)

    // Check existing analysis for this video
    if (!force) {
      const { data: existing } = await supabase
        .from('youtube_analyses')
        .select('*')
        .eq('user_id', user.id)
        .eq('video_id', videoId)
        .single()

      if (existing) {
        return NextResponse.json({ data: existing, cached: true })
      }
    }

    // Fetch video metadata via oEmbed
    let title: string | null = null
    let channelName: string | null = null
    let thumbnailUrl: string | null = null
    try {
      const oembedRes = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`)
      if (oembedRes.ok) {
        const meta = await oembedRes.json()
        title = meta.title || null
        channelName = meta.author_name || null
        thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      }
    } catch {}

    // Fetch transcript
    let transcriptItems: { text: string; offset: number; duration: number }[] = []
    try {
      transcriptItems = await YoutubeTranscript.fetchTranscript(videoId)
    } catch {
      return NextResponse.json(
        { error: '자막을 가져올 수 없습니다. 이 영상에는 자막이 없거나 접근이 제한되어 있습니다.' },
        { status: 400 }
      )
    }

    if (transcriptItems.length === 0) {
      return NextResponse.json({ error: '자막이 없는 영상입니다.' }, { status: 400 })
    }

    const fullText = transcriptItems.map(t => t.text).join(' ')

    const systemPrompt = `당신은 설교자를 위한 YouTube 영상 분석 AI입니다.
영상 자막을 분석하여 설교 준비에 필요한 JSON을 반환하세요.

분석 결과는 **계층형 아웃라인 구조**여야 하며, 각 항목은 **풍부한 문장으로 작성된 설교 연구 노트** 스타일이어야 합니다.
각 섹션/포인트는 영상 내 시간(timestamp)을 포함하여, 사용자가 클릭하면 해당 위치로 이동할 수 있어야 합니다.

반환 JSON 구조:
{
  "overallSummary": "영상 전체의 핵심 내용을 5-8문장으로 상세하게 요약. 강의의 흐름과 주요 논점, 결론까지 포함한 종합적인 요약 (한글)",
  "sections": [
    {
      "title": "대주제 제목",
      "number": "1",
      "timeStart": 시작시간(초),
      "timeEnd": 종료시간(초),
      "subsections": [
        {
          "title": "소주제 제목",
          "number": "1-1",
          "timeStart": 시작시간(초),
          "timeEnd": 종료시간(초),
          "points": [
            { "text": "풍부한 문장으로 설명하는 핵심 내용... 영상의 해당 부분을 듣고 정리한 설교 노트처럼 상세하게", "time": 해당시점(초) }
          ],
          "bibleConnections": [
            { "passage": "성경구절", "explanation": "연결 설명", "time": 시점(초) }
          ],
          "insights": [
            { "title": "인사이트 제목", "detail": "인사이트 내용", "time": 시점(초) }
          ]
        }
      ],
      "usageSuggestions": [
        { "title": "제안 제목", "description": "제안 내용" }
      ]
    }
  ]
}

규칙:
- 영상의 주요 흐름에 따라 2-4개의 대주제(sections)로 나누고, 각각 2-4개의 소주제(subsections)로 구성
- **각 points의 text는 한두 단어가 아니라, 완전한 문장으로 된 풍부한 설명이어야 함.** 예: "예수님, 가야바에게 잡혀가서 빌라도에게 재판 받음 — 유대인들은 사형 집행권이 없어서 로마 총독 빌라도에게만 사형 선고와 집행을 요청할 수 있었다." 처럼 해당 내용의 맥락과 의미를 함께 설명
- 각 subsection당 points는 2-4개로 충분하되, 각각을 풍부하게 서술
- bibleConnections와 insights는 해당 내용이 언급되는 subsection 내에 배치. 별도 섹션으로 분리하지 말 것
- usageSuggestions는 각 section(대주제) 단위로 max 2개
- timeStart/timeEnd가 없으면 이전 항목의 시간 기준 자동 계산
- points의 time이 null이면 subsection의 timeStart 사용
- 모든 시간은 초(seconds) 단위`

    const res = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `다음 YouTube 영상 자막을 분석하여 계층형 아웃라인 JSON을 생성해주세요:\n\n${fullText.slice(0, 15000)}` },
      ],
      temperature: 0.4,
      max_tokens: 6000,
      response_format: { type: 'json_object' },
    })

    const content = res.choices[0]?.message?.content
    if (!content) {
      return NextResponse.json({ error: 'AI 분석에 실패했습니다.' }, { status: 500 })
    }

    const analysis = JSON.parse(content)

    // Save to database
    const { data: saved, error: saveError } = await supabase
      .from('youtube_analyses')
      .insert({
        user_id: user.id,
        video_id: videoId,
        title,
        channel_name: channelName,
        thumbnail_url: thumbnailUrl,
        video_url: url,
        transcript: transcriptItems,
        analysis,
        saved_insights: [],
        note_ids: [],
      })
      .select()
      .single()

    if (saveError) {
      console.error('Save error:', saveError)
      return NextResponse.json({ error: '분석 저장 중 오류가 발생했습니다.' }, { status: 500 })
    }

    return NextResponse.json({ data: saved, cached: false })
  } catch (error) {
    console.error('YouTube analyze error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
