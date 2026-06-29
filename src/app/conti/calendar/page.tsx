'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Suspense } from 'react'
import type { ContiSet } from '@/types/conti'
import { getSampleContiList, SAMPLE_CONTIS } from '@/lib/conti/samples'
import { loadMockContiList } from '@/lib/conti/mockStorage'
import ContiSidebar from '@/components/conti/ContiSidebar'
import WorshipCalendar from '@/components/conti/WorshipCalendar'
import { Loader2, Calendar, Music, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

function CalendarPageInner() {
  const router = useRouter()
  const [contis, setContis] = useState<ContiSet[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  const fetchList = useCallback(() => {
    try {
      const stored = loadMockContiList()
      const merged = stored.length > 0 ? stored : SAMPLE_CONTIS
      setContis(merged)
    } catch {
      setContis(SAMPLE_CONTIS)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    setMounted(true)
    fetchList()
  }, [fetchList])

  if (!mounted || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#050814]">
        <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-[#050814] text-slate-200 overflow-hidden -mt-16 pt-16">
      {/* 배경 글로우 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-indigo-500/5 blur-[120px]" />
      </div>

      <div className="relative z-10 flex w-full h-full">
        <ContiSidebar
          contis={contis}
          loading={false}
          selectedId={null}
          searchText=""
          onSearchChange={() => {}}
          onSelect={(id) => router.push(`/conti?id=${id}`)}
          onNew={() => router.push('/conti')}
        />

        <div className="flex-1 flex flex-col min-w-0 bg-[#080d22]/30 overflow-hidden">
          {/* 헤더 */}
          <div className="px-6 py-4 border-b border-white/5 bg-[#0a0f1f]/60 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <Link
                href="/conti"
                className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                title="콘티로 돌아가기"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <h1 className="text-[20px] font-extrabold text-white tracking-tight flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-300" />
                  예배 캘린더
                </h1>
                <p className="text-[13px] text-slate-500 font-medium mt-0.5">
                  월별 예배 일정 한 눈에 보기 · 날짜 클릭 시 해당 콘티로 이동
                </p>
              </div>
            </div>
          </div>

          {/* 본문 */}
          <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
            <div className="max-w-4xl mx-auto">
              <WorshipCalendar contis={contis} onSelect={(id) => router.push(`/conti?id=${id}`)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CalendarPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-[#050814]">
        <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
      </div>
    }>
      <CalendarPageInner />
    </Suspense>
  )
}
