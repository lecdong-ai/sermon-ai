import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getUserFromRequest } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)

    // 1. 환경변수에서 프로젝트 URL
    const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || null
    const projectRef = projectUrl ? new URL(projectUrl).hostname.split('.')[0] : null

    // 2. 서버가 인식한 user_id
    const serverUserId = user?.id || null
    const serverUserIdPrefix = serverUserId?.slice(0, 8) || null

    // 3. DB의 모든 설교 개수 (user_id 필터 없이)
    const { count: allCount, error: allCountError } = await supabaseAdmin
      .from('sermons')
      .select('id', { count: 'exact', head: true })

    // 4. 이 user의 설교 개수
    let userCount = null
    let userCountError = null
    if (serverUserId) {
      const { count, error } = await supabaseAdmin
        .from('sermons')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', serverUserId)
      userCount = count
      userCountError = error?.message || null
    }

    // 5. 최근 설교 3개 (user_id 상관없이)
    const { data: recent, error: recentError } = await supabaseAdmin
      .from('sermons')
      .select('id, title, user_id, status, created_at, updated_at')
      .order('updated_at', { ascending: false })
      .limit(3)

    // 6. server user_id의 다른 user_id 소유 설교들 (user_id가 다른 경우)
    let otherUserSermonsCount = null
    if (serverUserId) {
      // 다른 user_id를 가진 설교 수
      const { count } = await supabaseAdmin
        .from('sermons')
        .select('id', { count: 'exact', head: true })
        .neq('user_id', serverUserId)
      otherUserSermonsCount = count
    }

    return NextResponse.json({
      env: {
        projectUrl,
        projectRef,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      },
      serverUser: {
        id: serverUserId,
        idPrefix: serverUserIdPrefix,
        email: user?.email || null,
      },
      dbStats: {
        allSermonsCount: allCount,
        allSermonsError: allCountError?.message || null,
        userSermonsCount: userCount,
        userSermonsError: userCountError,
        otherUserSermonsCount,
      },
      recentSermons: recent || [],
      recentSermonsError: recentError?.message || null,
    })
  } catch (err: any) {
    return NextResponse.json({
      error: err.message,
      stack: err.stack,
    }, { status: 500 })
  }
}
