import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const publicRoutes = ['/', '/login', '/auth/callback', '/auth/reset-password', '/pricing']
const publicPrefixes = ['/share/', '/api/']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPublic = publicRoutes.some((route) => pathname === route) ||
    publicPrefixes.some((prefix) => pathname.startsWith(prefix))

  const response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  let { data: { user } } = await supabase.auth.getUser()
  
  if (!user && (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_USE_MOCK === 'true')) {
    user = { id: '25721757-65b2-474c-8668-e762ae319b4e', email: 'mock@example.com' } as any
  }

  if (!isPublic && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  if (pathname === '/login' && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
