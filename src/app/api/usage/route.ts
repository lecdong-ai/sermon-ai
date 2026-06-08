import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { getUsageInfo, checkFeatureAccess } from '@/lib/usage'

export const dynamic = 'force-dynamic'

function getClient(request: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll() {},
      },
    },
  )
}

async function getUser(request: NextRequest) {
  const sb = getClient(request)
  const { data } = await sb.auth.getUser()
  return data.user
}

// GET /api/usage - 사용량 조회 + 기능 접근 권한
export async function GET(request: NextRequest) {
  const user = await getUser(request)
  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const usage = await getUsageInfo(user.id)

  const features = [
    await checkFeatureAccess(user.id, 'generate'),
    await checkFeatureAccess(user.id, 'workspace'),
  ]

  return NextResponse.json({ ...usage, features })
}
