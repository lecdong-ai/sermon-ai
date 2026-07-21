import { Noto_Serif_KR } from 'next/font/google'
import './../globals-qt.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MobileTabBar } from '@/components/layout/MobileTabBar'

const notoSerif = Noto_Serif_KR({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-noto-serif-kr',
  display: 'swap',
})

export const metadata = {
  title: {
    default: '큐티 아카이브 | 매일의 묵상을 위한 작은 서재',
    template: '%s | 큐티 아카이브',
  },
  description: '무료 큐티 자료와 콘텐츠를 모은 아카이브.',
}

export default function QtLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`qt-archive min-h-screen flex flex-col ${notoSerif.variable}`}>
      <Header />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <Footer />
      <MobileTabBar />
    </div>
  )
}
