import { Suspense } from 'react'
import ContiPageClient from './ContiPageClient'
import { getServerContiData } from '@/lib/conti/serverData'
import { Loader2 } from 'lucide-react'

export default async function ContiPage({
  searchParams,
}: {
  searchParams: { id?: string }
}) {
  const { contis, selectedConti } = await getServerContiData({
    id: searchParams.id || null,
  })

  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-[#050814]">
        <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
      </div>
    }>
      <ContiPageClient
        initialContis={contis}
        initialSelectedConti={selectedConti}
        initialSelectedId={searchParams.id || null}
      />
    </Suspense>
  )
}
