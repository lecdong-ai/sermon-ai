import type { Metadata, Viewport } from 'next'
import { Noto_Sans_KR, Outfit } from 'next/font/google'
import Script from 'next/script'
import { Suspense } from 'react'
import './globals.css'
import SiteHeader from '@/components/SiteHeader'
import MainWrapper from '@/components/MainWrapper'
import MessageButton from '@/components/MessageButton'
import KakaoTalkButton from '@/components/KakaoTalkButton'
import VisitorTracker from '@/components/VisitorTracker'
import { AuthProvider } from '@/components/AuthProvider'
import HydrationGuard from '@/components/HydrationGuard'

const notoSansKr = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-noto-sans-kr',
  preload: true,
  fallback: ['system-ui', '-apple-system', 'sans-serif'],
})

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['500', '700', '800'],
  display: 'swap',
  variable: '--font-outfit',
  preload: true,
  fallback: ['system-ui', '-apple-system', 'sans-serif'],
})

export const viewport: Viewport = {
  themeColor: '#3182f6',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://bunker.ai.kr'),
  title: {
    default: 'Bunker 목양 - AI 기반 설교 도우미',
    template: '%s | Bunker 목양',
  },
  description: '설교 원고를 업로드하면 AI가 요약, 소그룹 나눔, 카드뉴스 등을 자동 생성합니다.',
  keywords: ['설교', 'AI', '목회자', '설교준비', '카드뉴스', 'PPT', '소그룹'],
  openGraph: {
    title: 'Bunker 목양 - AI 기반 설교 도우미',
    description: '설교 원고를 업로드하면 AI가 요약, 소그룹 나눔, 카드뉴스 등을 자동 생성합니다.',
    url: 'https://bunker.ai.kr',
    siteName: 'Bunker 목양',
    locale: 'ko_KR',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bunker 목양 - AI 기반 설교 도우미',
    description: '설교 원고를 업로드하면 AI가 요약, 소그룹 나눔, 카드뉴스 등을 자동 생성합니다.',
    images: '/og-image.png',
  },
  robots: { index: true, follow: true },
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className={`${notoSansKr.variable} ${outfit.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning className="min-h-screen bg-[#f7f8fa] text-[#191f28]">
        <HydrationGuard>
          <AuthProvider>
            <Suspense fallback={null}>
              <SiteHeader />
              <MainWrapper>{children}</MainWrapper>
              <KakaoTalkButton />
              <MessageButton />
              <VisitorTracker />
            </Suspense>
            {process.env.NEXT_PUBLIC_KAKAO_KEY ? (
              <Script
                src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js"
                strategy="afterInteractive"
                crossOrigin="anonymous"
                onLoad={() => {
                  if (typeof window !== 'undefined' && typeof (window as any).Kakao !== 'undefined' && !(window as any).Kakao.isInitialized()) {
                    (window as any).Kakao.init(process.env.NEXT_PUBLIC_KAKAO_KEY!)
                  }
                }}
              />
            ) : null}
          </AuthProvider>
        </HydrationGuard>
      </body>
    </html>
  )
}
