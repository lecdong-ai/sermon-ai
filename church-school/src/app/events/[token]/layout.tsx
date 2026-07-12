import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>
}): Promise<Metadata> {
  const { token } = await params
  const supabase = await createClient()

  const { data: event } = await supabase
    .from('events')
    .select('title, start_date, end_date, location, description, deadline')
    .eq('link_token', token)
    .single()

  if (!event) {
    return {
      title: '행사 신청 | 교회학교',
      description: '행사 정보를 찾을 수 없습니다.',
    }
  }

  const dateStr = event.start_date
    ? new Date(event.start_date).toLocaleDateString('ko-KR', {
        month: 'long',
        day: 'numeric',
        weekday: 'short',
      }) + (event.end_date
        ? ` ~ ${new Date(event.end_date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}`
        : '')
    : ''

  const ogTitle = `${event.title}`
  const ogDescription = [
    dateStr,
    event.location,
    event.deadline ? `마감: ${new Date(event.deadline).toLocaleDateString('ko-KR')}` : '',
    event.description,
  ]
    .filter(Boolean)
    .join(' | ')

  return {
    title: `${event.title} | 교회학교`,
    description: ogDescription,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      type: 'website',
      siteName: '교회학교',
      locale: 'ko_KR',
    },
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
