import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rowToNote, type InsightRow } from '@/lib/advanced/insightsApi'

const VALID_TYPES = ['insight', 'research', 'application', 'question', 'pastoral', 'illustration', 'warning']

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 })

    const { data, error } = await supabase
      .from('insights')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(500)

    if (error) throw error
    const notes = (data || []).map((r) => rowToNote(r as InsightRow))
    return NextResponse.json({ success: true, data: notes })
  } catch (err: any) {
    console.error('GET /api/insights error:', err)
    return NextResponse.json({ success: false, error: err.message || '조회 실패' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 })

    const body = await request.json()
    const { type, title, content, summary, tags, connections } = body || {}

    if (!type || !VALID_TYPES.includes(type)) {
      return NextResponse.json({ success: false, error: '유효하지 않은 노트 유형입니다.' }, { status: 400 })
    }
    if (!title || !content) {
      return NextResponse.json({ success: false, error: '제목과 내용은 필수입니다.' }, { status: 400 })
    }

    const insertRow = {
      user_id: user.id,
      type,
      title: String(title).slice(0, 300),
      content: String(content),
      summary: String(summary || '').slice(0, 500),
      tags: Array.isArray(tags) ? tags.slice(0, 20).map(String) : [],
      connections: Array.isArray(connections) ? connections : [],
    }

    const { data, error } = await supabase
      .from('insights')
      .insert(insertRow)
      .select('*')
      .single()

    if (error) throw error
    return NextResponse.json({ success: true, data: rowToNote(data as InsightRow) })
  } catch (err: any) {
    console.error('POST /api/insights error:', err)
    return NextResponse.json({ success: false, error: err.message || '저장 실패' }, { status: 500 })
  }
}
