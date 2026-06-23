import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
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

const DAY_MS = 24 * 60 * 60 * 1000

function formatDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

function toDateKey(isoOrDate: string | Date): string {
  if (typeof isoOrDate === 'string') {
    // KST 기준 날짜 추출
    const d = new Date(isoOrDate)
    return formatDate(d)
  }
  return formatDate(isoOrDate)
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUser(request)
    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const url = new URL(request.url)
    const daysParam = parseInt(url.searchParams.get('days') || '30')
    const days = Math.max(7, Math.min(90, daysParam))

    const now = new Date()
    const periodEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
    const periodStart = new Date(periodEnd.getTime() - (days - 1) * DAY_MS)
    const periodStartISO = periodStart.toISOString()
    const periodEndISO = periodEnd.toISOString()

    // sermons 테이블에서 일별 집계 (AI 분석 + manual 분리)
    const { data: sermonRows } = await supabaseAdmin
      .from('sermons')
      .select('created_at, source')
      .eq('user_id', user.id)
      .gte('created_at', periodStartISO)
      .lte('created_at', periodEndISO)

    // youtube_analyses 일별 집계
    const { data: youtubeRows } = await supabaseAdmin
      .from('youtube_analyses')
      .select('created_at')
      .eq('user_id', user.id)
      .gte('created_at', periodStartISO)
      .lte('created_at', periodEndISO)

    // 일별 카운트 맵
    type DayCounts = { ai_analysis: number; manual_sermon: number; youtube: number }
    const countsMap = new Map<string, DayCounts>()

    // 30일 모든 날짜 0으로 초기화
    for (let i = 0; i < days; i++) {
      const d = new Date(periodStart.getTime() + i * DAY_MS)
      countsMap.set(formatDate(d), { ai_analysis: 0, manual_sermon: 0, youtube: 0 })
    }

    // sermons 카운트
    for (const r of (sermonRows || []) as any[]) {
      const key = toDateKey(r.created_at)
      const c = countsMap.get(key)
      if (!c) continue
      if (r.source === 'upload') c.ai_analysis += 1
      else c.manual_sermon += 1
    }

    // youtube 카운트
    for (const r of (youtubeRows || []) as any[]) {
      const key = toDateKey(r.created_at)
      const c = countsMap.get(key)
      if (!c) continue
      c.youtube += 1
    }

    // 배열로 변환 (오래된 → 최신 순)
    const daysResult = Array.from(countsMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, c]) => ({
        date,
        counts: c,
        total: c.ai_analysis + c.manual_sermon + c.youtube,
      }))

    return NextResponse.json({
      periodStart: formatDate(periodStart),
      periodEnd: formatDate(periodEnd),
      days: daysResult,
      totalCount: daysResult.reduce((s, d) => s + d.total, 0),
    })
  } catch (err: any) {
    console.error('GET /api/usage/calendar error:', err)
    return NextResponse.json({ error: err.message || '조회 실패' }, { status: 500 })
  }
}
