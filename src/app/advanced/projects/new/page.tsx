'use client'

import { useRouter } from 'next/navigation'

export default function NewProjectPage() {
  const router = useRouter()

  return (
    <div className="p-6 max-w-[1440px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="adv-section-title">새 설교 프로젝트</h2>
          <p className="text-sm text-paper-600 mt-1">성경 본문을 선택하고 새로운 설교 프로젝트를 시작하세요</p>
        </div>
        <button
          onClick={() => router.push('/advanced')}
          className="text-sm text-paper-500 hover:text-paper-700"
        >
          ← 취소
        </button>
      </div>
      <div className="adv-card p-10 text-center">
        <p className="text-paper-400 text-sm">본문 선택 UI — 개발 중</p>
      </div>
    </div>
  )
}
