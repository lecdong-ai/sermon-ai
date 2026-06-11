'use client'

import { useRouter } from 'next/navigation'

interface PlaceholderPageProps {
  title: string
  description: string
  icon: string
  estimatedDate?: string
}

export default function PlaceholderPage({ title, description, icon, estimatedDate }: PlaceholderPageProps) {
  const router = useRouter()

  return (
    <div className="p-6 max-w-[1440px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="adv-section-title">{title}</h2>
          <p className="text-sm text-paper-600 mt-1">{description}</p>
        </div>
        <button
          onClick={() => router.push('/advanced')}
          className="text-sm text-paper-500 hover:text-paper-700 transition-colors"
        >
          ← 대시보드로
        </button>
      </div>

      <div className="adv-card flex flex-col items-center justify-center py-20 text-center">
        <span className="text-5xl mb-4 opacity-60">{icon}</span>
        <h3 className="text-lg font-medium text-paper-700 mb-2">준비 중입니다</h3>
        <p className="text-sm text-paper-500 max-w-md leading-relaxed">
          이 페이지는 현재 개발 중입니다. 곧 업데이트될 예정입니다.
        </p>
        {estimatedDate && (
          <span className="text-xs text-paper-400 mt-3">예상: {estimatedDate}</span>
        )}
      </div>
    </div>
  )
}
