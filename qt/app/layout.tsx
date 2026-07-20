import type { Metadata } from 'next'
import { Noto_Serif_KR, Crimson_Pro } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MobileTabBar } from '@/components/layout/MobileTabBar'
import MessageButton from '@/components/MessageButton'

const notoSerif = Noto_Serif_KR({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-noto-serif-kr',
  display: 'swap',
})

const crimsonPro = Crimson_Pro({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-crimson',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://qt.bunker.ai.kr'),
  title: {
    default: '큐티 아카이브 | 매일의 묵상을 위한 작은 서재',
    template: '%s | 큐티 아카이브',
  },
  description:
    '무료 큐티 자료와 노션 템플릿을 모은 아카이브. 쇼핑이 후원입니다.',
  openGraph: {
    title: '큐티 아카이브',
    description: '매일의 묵상을 위한 작은 서재',
    locale: 'ko_KR',
    type: 'website',
    images: [{ url: '/Korean_text_on_paper_202607180401.jpeg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="ko"
      className={`${notoSerif.variable} ${crimsonPro.variable}`}
    >
      <head>
        <link
          rel="stylesheet"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@latest/dist/web/static/pretendard.min.css"
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pb-16 md:pb-0">{children}</main>
        <Footer />
        <MobileTabBar />
        <MessageButton />
      </body>
    </html>
  )
}
