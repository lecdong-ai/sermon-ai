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

  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim() || ''

  if (!q || q.length < 1) {
    return NextResponse.json({ users: [], events: [], applications: [] })
  }

  const [usersRes, eventsRes, appsRes] = await Promise.allSettled([
    supabaseAdmin.from('users').select('id, name, email, church_name, created_at').or(`name.ilike.%${q}%,email.ilike.%${q}%`).limit(20),
    supabaseAdmin.from('events').select('id, title, status, start_date, created_at').or(`title.ilike.%${q}%`).limit(20),
    supabaseAdmin.from('applications').select('id, student_name, parent_name, parent_phone, event_id, status, created_at').or(`student_name.ilike.%${q}%,parent_name.ilike.%${q}%,parent_phone.ilike.%${q}%`).limit(20),
  ])

  return NextResponse.json({
    users: usersRes.status === 'fulfilled' ? (usersRes.value.data || []) : [],
    events: eventsRes.status === 'fulfilled' ? (eventsRes.value.data || []) : [],
    applications: appsRes.status === 'fulfilled' ? (appsRes.value.data || []) : [],
  })
}
