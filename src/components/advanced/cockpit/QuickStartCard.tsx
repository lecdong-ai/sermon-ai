'use client'

import { useRouter } from 'next/navigation'

const items = [
  { icon: '📖', label: '새 본문 연구', desc: '성경 본문을 선택하세요', href: '/advanced/projects/new' },
  { icon: '✏️', label: '프로젝트 이어하기', desc: '작업 중인 설교를 계속', href: '/advanced/projects' },
  { icon: '🔗', label: '그래프 탐색', desc: '설교 연결을 시각적으로', href: '/advanced/graph' },
  { icon: '📚', label: '아카이브', desc: '완료된 설교를 돌아보기', href: '/advanced/archive' },
]

export default function QuickStartCard() {
  const router = useRouter()

  return (
    <div className="adv-card">
      <div className="adv-card-header">
        <span className="adv-card-title">빠른 시작</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {items.map(item => (
          <button
            key={item.href}
            onClick={() => router.push(item.href)}
            className="flex flex-col items-center justify-center gap-1.5 p-4 rounded-lg border border-paper-200 hover:border-green-200 hover:bg-green-50/40 transition-colors text-center"
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-xs font-medium text-paper-700">{item.label}</span>
            <span className="text-[10px] text-paper-400 leading-tight">{item.desc}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
