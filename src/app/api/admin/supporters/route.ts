import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const { data: adminCheck } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (adminCheck?.role !== 'admin') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 })
    }

    const url = new URL(request.url)
    const search = url.searchParams.get('q') || ''

    let profileQuery = supabaseAdmin
      .from('user_profiles')
      .select('id, email, name, created_at')
      .order('created_at', { ascending: false })
      .limit(50)

    if (search) {
      profileQuery = profileQuery.or(`email.ilike.%${search}%,name.ilike.%${search}%`)
    }

    const { data: profiles, error } = await profileQuery

    if (error) {
      console.error('GET /api/admin/supporters error:', error)
      return NextResponse.json({ error: '조회 실패' }, { status: 500 })
    }

    const userIds = (profiles || []).map(p => p.id)

    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers()
    const authMetaMap = new Map(
      authUsers?.users.map(u => [u.id, (u.app_metadata as any)?.supporter_until]) || []
    )

    const supporters = (profiles || []).map(p => ({
      id: p.id,
      email: p.email,
      name: p.name,
      created_at: p.created_at,
      supporter_until: authMetaMap.get(p.id) || null,
    }))

    return NextResponse.json({ supporters })
  } catch (err: any) {
    console.error('GET /api/admin/supporters error:', err)
    return NextResponse.json({ error: err.message || '처리 실패' }, { status: 500 })
  }
}
