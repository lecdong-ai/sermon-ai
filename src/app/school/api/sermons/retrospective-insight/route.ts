import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

let _openai: OpenAI | null = null
function getOpenai() {
  if (!_openai) {
    const key = process.env.OPENAI_API_KEY
    if (!key) throw new Error('OPENAI_API_KEY is not set')
    _openai = new OpenAI({ apiKey: key })
  }
  return _openai
}

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

interface SnapshotSummary {
  label: string
  timestamp: number
  wordCount: number
  sectionCount: number
  illCount: number
  refCount: number
  greekCount: number
  textSnippet: string
}

const SYSTEM_PROMPT = `당신은 한국 개혁신학 목회자를 돕는 설교 분석 어시스턴트입니다.
설교의 여러 "스냅샷"(시점별 원고 상태)을 보고, 그 *진화*를 분석해 짧고 통찰력 있는 한국어 코멘트를 제공합니다.

출력은 반드시 JSON으로:
{
  "trajectory": "한 문장 (이 설교의 방향성)",
  "highlights": ["통찰 1 (한 문장)", "통찰 2", "통찰 3"],
  "concerns": ["우려 1 (있다면 한 문장)", "우려 2"]
}

규칙:
- 50~120자 내외의 짧은 문장
- 실제 데이터 변화에서 근거 있는 통찰만
- 위로보다 *구체적 관찰* 중심
- 비한국어/영어 단어 사용 금지`

export async function POST(req: NextRequest) {
  try {
    const { title, snapshots, userId, projectId } = await req.json() as { title: string; snapshots: SnapshotSummary[]; userId?: string; projectId?: string }
    if (!snapshots || snapshots.length < 2) {
      return NextResponse.json({ error: '최소 2개 스냅샷 필요' }, { status: 400 })
    }

    // projectId가 있으면 프로젝트 owner 추적
    let ownerId = userId
    if (!ownerId && projectId) {
      try {
        const sb = getSupabaseAdmin()
        const { data: project } = await sb.from('sermons').select('user_id').eq('id', projectId).single()
        if (project?.user_id) ownerId = project.user_id
      } catch { /* fallback: skip tracking */ }
    }

    const userPrompt = `설교 제목: ${title || '(제목 없음)'}

스냅샷 진화 (v1 → v${snapshots.length}):
${snapshots.map((s, i) => `[${s.label}] ${new Date(s.timestamp).toLocaleDateString('ko-KR')}
  - 분량: ${s.wordCount}자 / 섹션 ${s.sectionCount}개
  - 예화 ${s.illCount} / 참고 ${s.refCount} / 원어 ${s.greekCount}
  - 본문 발췌: ${s.textSnippet.slice(0, 200)}...`).join('\n\n')}

위 진화를 분석해 JSON으로 응답해 주세요.`

    const res = await getOpenai().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    })

    const text = res.choices[0]?.message?.content || '{}'
    const parsed = JSON.parse(text)

    // API 사용량 추적 (fire-and-forget, 프로젝트 owner userId)
    if (res.usage && ownerId) {
      const { trackAIUsage } = await import('@/lib/school/ai/trackUsage')
      trackAIUsage({
        userId: ownerId,
        apiType: 'retrospective-insight',
        model: 'gpt-4o-mini',
        usage: res.usage,
      }).catch(() => {})
    }

    return NextResponse.json({
      trajectory: parsed.trajectory || '',
      highlights: Array.isArray(parsed.highlights) ? parsed.highlights : [],
      concerns: Array.isArray(parsed.concerns) ? parsed.concerns : [],
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || '분석 실패' }, { status: 500 })
  }
}
