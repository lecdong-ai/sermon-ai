import type { Metadata, Viewport } from 'next'
import { Noto_Sans_KR, Outfit } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import Header from '@/components/Header'
import { AuthProvider } from '@/components/AuthProvider'

const notoSansKr = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-noto-sans-kr',
})

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['500', '700', '800'],
  display: 'swap',
  variable: '--font-outfit',
})

export const viewport: Viewport = {
  themeColor: '#3182f6',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://sermonai.app'),
  title: {
    default: '목회자 AI 솔루션 - SermonAI',
    template: '%s | SermonAI',
  },
  description: '설교 원고를 업로드하면 AI가 요약, 소그룹 나눔, 카드뉴스 등을 자동 생성합니다.',
  keywords: ['설교', 'AI', '목회자', '설교준비', '카드뉴스', 'PPT', '소그룹'],
  openGraph: {
    title: '목회자 AI 솔루션 - SermonAI',
    description: '설교 원고를 업로드하면 AI가 요약, 소그룹 나눔, 카드뉴스 등을 자동 생성합니다.',
    url: 'https://sermonai.app',
    siteName: 'SermonAI',
    locale: 'ko_KR',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '목회자 AI 솔루션 - SermonAI',
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
    <html lang="ko" className={`${notoSansKr.variable} ${outfit.variable}`}>
      <body className="min-h-screen bg-[#f7f8fa] text-[#191f28]">
        <AuthProvider>
          <Header />
          <main className="pt-16">{children}</main>
          {process.env.NEXT_PUBLIC_KAKAO_KEY ? (
            <Script
              src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js"
              strategy="lazyOnload"
              crossOrigin="anonymous"
              onLoad={() => {
                if (typeof Kakao !== 'undefined' && !Kakao.isInitialized()) {
                  Kakao.init(process.env.NEXT_PUBLIC_KAKAO_KEY!)
                }
              }}
            />
          ) : null}
        </AuthProvider>
      </body>
    </html>
  )
}
