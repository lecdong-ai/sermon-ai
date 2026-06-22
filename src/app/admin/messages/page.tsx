import { Suspense } from 'react'
import AdminMessagesPage from './AdminMessagesPage'

export const dynamic = 'force-dynamic'

export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="text-[14px] text-slate-400">메시지 불러오는 중...</div>
      </div>
    }>
      <AdminMessagesPage />
    </Suspense>
  )
}
