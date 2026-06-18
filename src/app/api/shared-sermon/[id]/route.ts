import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const RATE_LIMIT_WINDOW = 60_000
const RATE_LIMIT_MAX = 30
const ipRequests = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(request: NextRequest): boolean {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const now = Date.now()
  const entry = ipRequests.get(ip)
  if (!entry || now > entry.resetAt) {
    ipRequests.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW })
    return false
  }
  entry.count++
  return entry.count > RATE_LIMIT_MAX
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (isRateLimited(request)) {
      return NextResponse.json({ error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' }, { status: 429 })
    }

    const { data, error } = await supabaseAdmin
      .from('sermons')
      .select('id, title, passage, result, file_name, created_at')
      .eq('id', params.id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: '설교를 찾을 수 없습니다.' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 })
  }
}
