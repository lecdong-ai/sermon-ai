import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getUserFromRequest } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { path, device, sessionId } = body as {
      path?: string
      device?: string
      sessionId?: string
    }

    if (!path || !device || !sessionId) {
      return NextResponse.json({ success: false, error: '필수 파라미터 누락' }, { status: 400 })
    }

    if (!['mobile', 'desktop', 'tablet'].includes(device)) {
      return NextResponse.json({ success: false, error: '잘못된 device 값' }, { status: 400 })
    }

    // user_id 추출 (선택)
    let userId: string | null = null
    try {
      const user = await getUserFromRequest(request)
      if (user?.id) userId = user.id
    } catch {}

    const { error } = await supabaseAdmin
      .from('visitor_logs')
      .insert({
        path: path.slice(0, 500),
        device,
        session_id: sessionId.slice(0, 64),
        user_id: userId,
      })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('POST /api/track-visitor error:', err)
    return NextResponse.json({ success: false, error: err.message || '기록 실패' }, { status: 500 })
  }
}
