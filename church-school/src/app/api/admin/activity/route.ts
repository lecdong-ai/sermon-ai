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

  const [eventsRes, appsRes, usersRes] = await Promise.allSettled([
    supabaseAdmin.from('events').select('id, title, status, created_at, user_id').order('created_at', { ascending: false }).limit(20),
    supabaseAdmin.from('applications').select('id, student_name, event_id, status, created_at').order('created_at', { ascending: false }).limit(30),
    supabaseAdmin.from('users').select('id, name, email, created_at').order('created_at', { ascending: false }).limit(20),
  ])

  const events = eventsRes.status === 'fulfilled' ? (eventsRes.value.data || []) : []
  const apps = appsRes.status === 'fulfilled' ? (appsRes.value.data || []) : []
  const users = usersRes.status === 'fulfilled' ? (usersRes.value.data || []) : []

  const feed: { id: string; type: 'event_created' | 'application_submitted' | 'user_joined'; message: string; timestamp: string; link?: string }[] = []

  for (const ev of events) {
    feed.push({
      id: `evt-${ev.id}`,
      type: 'event_created',
      message: `새 행사 '${ev.title}' 생성됨`,
      timestamp: ev.created_at,
      link: `/events/manage/${ev.id}`,
    })
  }

  for (const a of apps) {
    feed.push({
      id: `app-${a.id}`,
      type: 'application_submitted',
      message: `${a.student_name} 님이 행사에 신청`,
      timestamp: a.created_at,
    })
  }

  for (const u of users) {
    feed.push({
      id: `usr-${u.id}`,
      type: 'user_joined',
      message: `${u.name || u.email} 님이 가입`,
      timestamp: u.created_at,
    })
  }

  feed.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  feed.splice(30)

  return NextResponse.json({ feed })
}
