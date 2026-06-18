import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { ensureUsage } from '@/lib/usage'
import { supabaseAdmin } from '@/lib/supabase'

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

async function getSupporterUntil(userId: string): Promise<string | null> {
  const { data: user } = await supabaseAdmin.auth.admin.getUserById(userId).catch(() => ({ data: null }))
  const meta = (user?.user?.app_metadata as any) || {}
  if (meta.supporter_until) return meta.supporter_until
  return null
}

export async function GET(request: NextRequest) {
  const user = await getUser(request)
  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  await ensureUsage(user.id)
  const supporter_until = await getSupporterUntil(user.id)
  const supporterActive = supporter_until
    ? new Date(supporter_until) > new Date()
    : false

  return NextResponse.json({
    supporter: supporterActive,
    supporter_until,
  })
}
