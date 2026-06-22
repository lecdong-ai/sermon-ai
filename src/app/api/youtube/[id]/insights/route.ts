import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { createApiClient } from '@/lib/supabase/api'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const { id } = await params
    const { saved_insights } = await request.json()

    const supabase = createApiClient(request)
    const { data, error } = await supabase
      .from('youtube_analyses')
      .update({ saved_insights })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: '저장 중 오류가 발생했습니다.' }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('YouTube insights update error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
