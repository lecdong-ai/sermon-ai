import { NextRequest, NextResponse } from 'next/server'
import { projectSupabaseAdmin } from '@/lib/project/supabase'
import { getUserFromRequest } from '@/lib/project/auth'

const WORKSPACE_TABS = ['summary', 'groupDiscussion', 'sermonScript', 'shortsScript'] as const

function calcProgress(result: any): { current: number; total: number; percent: number } {
  const total = WORKSPACE_TABS.length
  const current = WORKSPACE_TABS.filter((k) => result?.[k]).length
  return { current, total, percent: Math.round((current / total) * 100) }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const { data, error } = await projectSupabaseAdmin
      .from('sermons')
      .select('id, title, passage, file_name, source, raw_text, result, created_at, updated_at')
      .eq('user_id', user.id)
      .in('source', ['upload', 'manuscript'])
      .order('updated_at', { ascending: false })
      .limit(50)

    if (error) throw error

    const sermons = (data || []).map((row: any) => {
      const result = row.result || {}
      const progress = calcProgress(result)
      const rawText = row.raw_text || ''
      const preview = rawText.substring(0, 150).trim() + (rawText.length > 150 ? '...' : '')

      return {
        id: row.id,
        title: row.title || '제목 없음',
        passage: row.passage || '',
        file_name: row.file_name || '',
        source: row.source || 'upload',
        created_at: row.created_at || new Date().toISOString(),
        updated_at: row.updated_at || new Date().toISOString(),
        progress,
        preview,
      }
    })

    const stats = {
      total: sermons.length,
      completed: sermons.filter((s: any) => s.progress.current === s.progress.total).length,
      inProgress: sermons.filter((s: any) => s.progress.current > 0 && s.progress.current < s.progress.total).length,
      notStarted: sermons.filter((s: any) => s.progress.current === 0).length,
    }

    return NextResponse.json({ success: true, data: { stats, sermons } })
  } catch (err: any) {
    console.error('GET /api/workspace error:', err)
    return NextResponse.json({ success: false, error: err.message || '조회 실패' }, { status: 500 })
  }
}
