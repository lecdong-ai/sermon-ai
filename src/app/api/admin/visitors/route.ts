import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getUserFromRequest } from '@/lib/auth'
import { isAdmin } from '@/lib/admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 })
    }

    // admin 체크 (프로젝트의 isAdmin 헬퍼 사용)
    const admin = await isAdmin(user.id)
    if (!admin) {
      return NextResponse.json({ success: false, error: '관리자 권한이 필요합니다.' }, { status: 403 })
    }

    const now = new Date()
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)

    // 1) 최근 5분 이내 unique session_id (LIVE)
    const { data: liveData } = await supabaseAdmin
      .from('visitor_logs')
      .select('session_id')
      .gt('created_at', fiveMinutesAgo.toISOString())

    const liveSessions = new Set((liveData || []).map((r: any) => r.session_id))
    const liveCount = liveSessions.size

    // 2) 최근 24시간 시간대별 카운트
    const { data: hourlyData } = await supabaseAdmin
      .from('visitor_logs')
      .select('created_at, session_id')
      .gt('created_at', twentyFourHoursAgo.toISOString())

    const hourly = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      visits: 0,
      unique: 0,
    }))
    const hourlySessions = Array.from({ length: 24 }, () => new Set<string>())
    ;(hourlyData || []).forEach((r: any) => {
      const h = new Date(r.created_at).getHours()
      hourly[h].visits += 1
      hourlySessions[h].add(r.session_id)
    })
    hourly.forEach((h, i) => { h.unique = hourlySessions[i].size })

    // 3) 최근 7일 일별 카운트
    const { data: dailyData } = await supabaseAdmin
      .from('visitor_logs')
      .select('created_at, session_id')
      .gt('created_at', sevenDaysAgo.toISOString())

    const daily = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now)
      d.setDate(d.getDate() - (6 - i))
      d.setHours(0, 0, 0, 0)
      return { date: d.toISOString().slice(0, 10), visits: 0, unique: 0 }
    })
    const dailySessions = Array.from({ length: 7 }, () => new Set<string>())
    ;(dailyData || []).forEach((r: any) => {
      const day = r.created_at.slice(0, 10)
      const idx = daily.findIndex(d => d.date === day)
      if (idx !== -1) {
        daily[idx].visits += 1
        dailySessions[idx].add(r.session_id)
      }
    })
    daily.forEach((d, i) => { d.unique = dailySessions[i].size })

    // 4) 디바이스 분포 (최근 24시간)
    const deviceMap: Record<string, number> = { mobile: 0, desktop: 0, tablet: 0 }
    ;(hourlyData || []).forEach((r: any) => {
      // device 컬럼은 hourly select에 없으므로 별도 쿼리 불필요
      // (이미 hourlyData에 device를 추가하지 않았으므로 생략)
    })

    const { data: deviceData } = await supabaseAdmin
      .from('visitor_logs')
      .select('device')
      .gt('created_at', twentyFourHoursAgo.toISOString())
    ;(deviceData || []).forEach((r: any) => {
      if (r.device in deviceMap) deviceMap[r.device] += 1
    })
    const deviceTotal = deviceMap.mobile + deviceMap.desktop + deviceMap.tablet
    const deviceRatio = {
      mobile: deviceTotal > 0 ? deviceMap.mobile / deviceTotal : 0,
      desktop: deviceTotal > 0 ? deviceMap.desktop / deviceTotal : 0,
      tablet: deviceTotal > 0 ? deviceMap.tablet / deviceTotal : 0,
    }

    // 5) 인기 페이지 TOP 5 (최근 24시간)
    const { data: pathData } = await supabaseAdmin
      .from('visitor_logs')
      .select('path')
      .gt('created_at', twentyFourHoursAgo.toISOString())
    const pathCount: Record<string, number> = {}
    ;(pathData || []).forEach((r: any) => {
      const p = r.path || '/'
      pathCount[p] = (pathCount[p] || 0) + 1
    })
    const topPaths = Object.entries(pathCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([path, count]) => ({ path, count }))

    // 6) 오늘 vs 어제 vs 주 평균
    const todayStart = new Date(now)
    todayStart.setHours(0, 0, 0, 0)
    const yesterdayStart = new Date(todayStart)
    yesterdayStart.setDate(yesterdayStart.getDate() - 1)
    const { count: todayCount } = await supabaseAdmin
      .from('visitor_logs')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', todayStart.toISOString())
    const { count: yesterdayCount } = await supabaseAdmin
      .from('visitor_logs')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', yesterdayStart.toISOString())
      .lt('created_at', todayStart.toISOString())
    const weekAvg = Math.round(daily.reduce((s, d) => s + d.visits, 0) / 7)

    return NextResponse.json({
      success: true,
      data: {
        liveCount,
        hourly,
        daily,
        device: { counts: deviceMap, ratio: deviceRatio, total: deviceTotal },
        topPaths,
        today: todayCount || 0,
        yesterday: yesterdayCount || 0,
        weekAvg,
      },
    })
  } catch (err: any) {
    console.error('GET /api/admin/visitors error:', err)
    return NextResponse.json({ success: false, error: err.message || '조회 실패' }, { status: 500 })
  }
}
