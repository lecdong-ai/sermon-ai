/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === 'development'

const cspHeader = isDev
  ? ''
  : `
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://t1.kakaocdn.net;
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https://*.kakaocdn.net;
  font-src 'self';
  connect-src 'self' ${process.env.NEXT_PUBLIC_SUPABASE_URL || ''} https://api.openai.com https://api.tosspayments.com;
  frame-src 'none';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
`.replace(/\s{2,}/g, ' ').trim()

const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.kakaocdn.net',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
    minimumCacheTTL: 86400,
  },
  compress: true,
  swcMinify: true,
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', 'd3-force'],
  },
  async headers() {
    const securityHeaders = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
      { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
      { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
    ]
    if (cspHeader) {
      securityHeaders.push({ key: 'Content-Security-Policy', value: cspHeader })
    }
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      {
        source: '/_next/static/(.*)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/favicon.svg',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400' }],
      },
      {
        source: '/og-image.png',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400' }],
      },
    ]
  },
  poweredByHeader: false,
  reactStrictMode: true,
}

export default nextConfig
