import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const publicRoutes = ['/', '/login', '/auth/callback', '/auth/reset-password', '/intro', '/preview']
const publicPrefixes = ['/share/', '/api/auth', '/api/bible']

const hasSupabaseConfig = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

function generateNonce(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

function buildCsp(nonce: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  return [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'unsafe-inline' https://t1.kakaocdn.net`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' blob: data: https://*.kakaocdn.net`,
    `font-src 'self'`,
    `connect-src 'self' ${supabaseUrl} https://api.openai.com https://api.tosspayments.com`,
    `frame-src 'none'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
  ].join('; ')
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPublic = publicRoutes.some((route) => pathname === route) ||
    publicPrefixes.some((prefix) => pathname.startsWith(prefix))

  const response = NextResponse.next({ request })

  if (!hasSupabaseConfig) {
    if (!isPublic && !pathname.startsWith('/advanced')) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }
    return response
  }

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
            response.cookies.set(name, value, {
              ...options,
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production',
            }),
          )
        },
      },
    },
  )

  let { data: { user } } = await supabase.auth.getUser()

  // Protect /advanced/* routes — require authentication
  if (pathname.startsWith('/advanced') && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  if (!isPublic && !user && !pathname.startsWith('/advanced')) {
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
