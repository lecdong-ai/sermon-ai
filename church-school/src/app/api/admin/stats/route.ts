import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin'
import { getUserFromRequest } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const user = await getUserFromRequest(request)
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [
    eventsRes,
    appsRes,
    templatesRes,
    usersRes,
    upcomingRes,
    recentUsersRes,
    newUsersRes,
    prevNewUsersRes,
  ] = await Promise.allSettled([
    supabaseAdmin.from('events').select('status, created_at'),
    supabaseAdmin.from('applications').select('status, check_in_status, check_in_at, created_at, event_id'),
    supabaseAdmin.from('ppt_templates').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabaseAdmin.from('users').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('events').select('id, title, start_date, end_date, status, capacity').in('status', ['draft', 'open']).gte('end_date', now.toISOString()).order('start_date', { ascending: true }).limit(10),
    supabaseAdmin.from('users').select('id, email, name, created_at').order('created_at', { ascending: false }).limit(10),
    supabaseAdmin.from('users').select('id', { count: 'exact', head: true }).gte('created_at', weekAgo),
    supabaseAdmin.from('users').select('id', { count: 'exact', head: true }).gte('created_at', twoWeeksAgo).lt('created_at', weekAgo),
  ])

  const events = eventsRes.status === 'fulfilled' ? (eventsRes.value.data || []) : []
  const apps = appsRes.status === 'fulfilled' ? (appsRes.value.data || []) : []
  const templateCount = templatesRes.status === 'fulfilled' ? (templatesRes.value.count ?? 0) : 0
  const totalUsers = usersRes.status === 'fulfilled' ? (usersRes.value.count ?? 0) : 0
  const newUsersWeek = newUsersRes.status === 'fulfilled' ? (newUsersRes.value.count ?? 0) : 0
  const prevNewUsersWeek = prevNewUsersRes.status === 'fulfilled' ? (prevNewUsersRes.value.count ?? 0) : 0
  const upcoming = upcomingRes.status === 'fulfilled' ? (upcomingRes.value.data || []) : []
  const recentUsers = recentUsersRes.status === 'fulfilled' ? (recentUsersRes.value.data || []) : []

  const draftEvents = events.filter(e => e.status === 'draft').length
  const openEvents = events.filter(e => e.status === 'open').length
  const closedEvents = events.filter(e => e.status === 'closed').length
  const cancelledEvents = events.filter(e => e.status === 'cancelled').length

  const totalApplications = apps.length
  const confirmedApplications = apps.filter(a => a.status !== 'cancelled').length
  const checkedInTotal = apps.filter(a => a.check_in_status === 'checked_in').length
  const checkedInTodayCount = apps.filter(a => a.check_in_status === 'checked_in' && a.check_in_at >= todayStart).length

  const appsThisWeek = apps.filter(a => new Date(a.created_at) >= new Date(weekAgo)).length
  const appsPrevWeek = apps.filter(a => {
    const d = new Date(a.created_at)
    return d >= new Date(twoWeeksAgo) && d < new Date(weekAgo)
  }).length

  const dailyCounts30: Record<string, number> = {}
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    dailyCounts30[d.toISOString().slice(0, 10)] = 0
  }
  const apps30 = apps.filter(a => new Date(a.created_at) >= new Date(thirtyDaysAgo))
  for (const a of apps30) {
    const key = new Date(a.created_at).toISOString().slice(0, 10)
    if (dailyCounts30[key] !== undefined) dailyCounts30[key]++
  }
  const dailyApplications30 = Object.entries(dailyCounts30).map(([date, count]) => ({ date, count }))

  const upcomingWithCounts = await Promise.all(
    upcoming.map(async (ev) => {
      const { count } = await supabaseAdmin
        .from('applications')
        .select('id', { count: 'exact', head: true })
        .eq('event_id', ev.id)
        .neq('status', 'cancelled')
      return { ...ev, applicationCount: count ?? 0 }
    })
  )

  const checkinRate = confirmedApplications > 0 ? checkedInTotal / confirmedApplications : 0
  const userGrowth = prevNewUsersWeek > 0 ? Math.round((newUsersWeek - prevNewUsersWeek) / prevNewUsersWeek * 100) : newUsersWeek > 0 ? 100 : 0
  const appGrowth = appsPrevWeek > 0 ? Math.round((appsThisWeek - appsPrevWeek) / appsPrevWeek * 100) : appsThisWeek > 0 ? 100 : 0

  const alerts: { type: 'warning' | 'danger' | 'info' | 'success'; message: string; link?: string }[] = []

  const lowFillEvents = upcomingWithCounts.filter(e => e.capacity && e.applicationCount / e.capacity < 0.3)
  for (const e of lowFillEvents) {
    alerts.push({
      type: 'warning',
      message: `'${e.title}' 신청률 ${Math.round(e.applicationCount / e.capacity * 100)}%, 마감 전`,
      link: `/events/manage/${e.id}`,
    })
  }

  if (openEvents === 0 && events.length > 0) {
    alerts.push({ type: 'info', message: '현재 오픈된 행사가 없습니다. 행사를 개설해보세요.' })
  }

  if (checkedInTotal > 0 && checkinRate < 0.5) {
    alerts.push({ type: 'danger', message: `전체 체크인율 ${Math.round(checkinRate * 100)}%로 낮습니다.` })
  }

  if (newUsersWeek > 0) {
    alerts.push({ type: 'success', message: `이번 주 신규 가입 ${newUsersWeek}명 (전주 대비 ${userGrowth >= 0 ? '+' : ''}${userGrowth}%)` })
  }

  let insight = ''
  if (totalUsers === 0 && events.length === 0) {
    insight = '아직 등록된 데이터가 없습니다. 첫 행사를 개설해보세요!'
  } else {
    const parts: string[] = []
    if (newUsersWeek > 0) parts.push(`이번 주 신규 가입 ${newUsersWeek}명`)
    if (openEvents > 0) parts.push(`진행 중인 행사 ${openEvents}개`)
    if (appsThisWeek > 0) parts.push(`이번 주 신청 ${appsThisWeek}건 (전주 대비 ${appGrowth >= 0 ? '+' : ''}${appGrowth}%)`)
    if (checkedInTodayCount > 0) parts.push(`오늘 체크인 ${checkedInTodayCount}명`)
    if (parts.length > 0) {
      insight = parts.join('. ') + '.'
    } else {
      insight = '모든 서비스가 정상 작동 중입니다.'
    }
  }

  return NextResponse.json({
    insight,
    metrics: {
      totalUsers,
      newUsersThisWeek: newUsersWeek,
      userGrowth: prevNewUsersWeek === 0 && newUsersWeek === 0 ? 0 : userGrowth,
      totalEvents: events.length,
      openEvents,
      totalApplications,
      appsThisWeek,
      appGrowth: appsPrevWeek === 0 && appsThisWeek === 0 ? 0 : appGrowth,
      confirmedApplications,
      checkedIn: checkedInTotal,
      checkedInToday: checkedInTodayCount,
      checkinRate: Math.round(checkinRate * 100),
      pptTemplates: templateCount,
    },
    eventsByStatus: { draft: draftEvents, open: openEvents, closed: closedEvents, cancelled: cancelledEvents },
    dailyApplications: dailyApplications30,
    upcomingEvents: upcomingWithCounts,
    recentUsers,
    alerts,
  })
}
