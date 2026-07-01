import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getUserFromRequest } from '@/lib/auth'
import { isAdmin } from '@/lib/admin'

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    if (!await isAdmin(user.id)) {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 })
    }

    const url = new URL(request.url)
    const search = url.searchParams.get('q') || ''

    // Auth 유저 전체 조회
    const { data: authData } = await supabaseAdmin.auth.admin.listUsers()
    let authUsers = authData?.users || []

    // user_profiles는 옵셔널
    const { data: profiles } = await supabaseAdmin
      .from('user_profiles')
      .select('id, email, name, created_at')
    const profileMap = new Map((profiles || []).map(p => [p.id, p]))

    // search 필터
    if (search) {
      const q = search.toLowerCase()
      authUsers = authUsers.filter(u =>
        (u.email || '').toLowerCase().includes(q) ||
        (profileMap.get(u.id)?.name || '').toLowerCase().includes(q)
      )
    }

    // 생성일 내림차순 정렬, 50개 제한
    authUsers.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    const supporters = authUsers.slice(0, 50).map(u => {
      const p = profileMap.get(u.id)
      return {
        id: u.id,
        email: u.email || p?.email || '',
        name: p?.name || null,
        created_at: u.created_at,
        supporter_until: (u.app_metadata as any)?.supporter_until || null,
      }
    })

    return NextResponse.json({ supporters })
  } catch (err: any) {
    console.error('GET /api/admin/supporters error:', err)
    return NextResponse.json({ error: err.message || '처리 실패' }, { status: 500 })
  }
}
