import { Great_Vibes, Noto_Serif_KR } from 'next/font/google'
import './diary-dark.css'

const notoSerif = Noto_Serif_KR({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-noto-serif-kr',
  display: 'swap',
})

const greatVibes = Great_Vibes({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-great-vibes',
  display: 'swap',
})

export const metadata = {
  title: '다이어리 스튜디오 | 17개월 마스터 다이어리',
  description: '맞춤형 월간 다이어리와 연간 마스터 PDF를 만드는 스튜디오.',
}

export default function DiaryLayout({ children }: { children: React.ReactNode }) {
  return <div className={`min-h-screen ${notoSerif.variable} ${greatVibes.variable}`}>{children}</div>
}
