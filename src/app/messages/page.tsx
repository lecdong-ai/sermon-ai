import { Suspense } from 'react'
import MessagesPage from './MessagesPage'

export const dynamic = 'force-dynamic'

export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-[14px] text-slate-500">메시지 불러오는 중...</div>
      </div>
    }>
      <MessagesPage />
    </Suspense>
  )
}
