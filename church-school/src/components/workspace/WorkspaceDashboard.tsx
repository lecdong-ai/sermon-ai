'use client'

import { useState, useEffect, useCallback } from 'react'
import { Upload, Folder, AlertCircle, Sparkles } from 'lucide-react'
import Link from 'next/link'
import WorkspaceStatsCard from './WorkspaceStatsCard'
import WorkspaceListCard, { type WorkspaceSermon } from './WorkspaceListCard'
import EmptyWorkspace from './EmptyWorkspace'

interface Props {
  onUpload: () => void
  refreshKey?: number
}

interface DashboardData {
  stats: {
    total: number
    completed: number
    inProgress: number
    notStarted: number
  }
  sermons: WorkspaceSermon[]
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-[#e4e2dd] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] animate-pulse">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="h-4 bg-[#f0eee9] rounded w-2/3" />
        <div className="h-5 bg-[#f0eee9] rounded w-16" />
      </div>
      <div className="h-3 bg-[#f0eee9] rounded w-1/2 mb-3" />
      <div className="h-3 bg-[#f0eee9] rounded w-full mb-1.5" />
      <div className="h-3 bg-[#f0eee9] rounded w-4/5 mb-3" />
      <div className="h-1.5 bg-[#f0eee9] rounded-full w-full mt-3" />
    </div>
  )
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="bg-[#f5f4f0] rounded-2xl p-5 border border-[#e4e2dd] animate-pulse">
          <div className="w-9 h-9 rounded-xl bg-[#eae7e0] mb-3" />
          <div className="h-7 bg-[#e4e2dd] rounded w-12 mb-1" />
          <div className="h-3 bg-[#eae7e0] rounded w-16" />
        </div>
      ))}
    </div>
  )
}

export default function WorkspaceDashboard({ onUpload, refreshKey = 0 }: Props) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/workspace')
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || '데이터를 불러올 수 없습니다.')
      }
      const json = await res.json()
      setData(json.data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData, refreshKey])

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#fbfaf7]">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 animate-in">
          <div>
            <h1 className="text-2xl font-extrabold text-[#2c2a29] flex items-center gap-2 mb-1">
              <Folder className="w-6 h-6 text-[#8d7a5b]" strokeWidth={2.5} />
              워크스페이스
            </h1>
            <p className="text-[14px] text-[#8a8580]">
              설교 원고를 업로드하고 AI 콘텐츠를 생성하세요
            </p>
          </div>
          <button
            onClick={onUpload}
            className="inline-flex items-center gap-2 rounded-xl bg-[#8d7a5b] text-white px-5 py-2.5 text-[14px] font-bold hover:bg-[#7a694e] active:scale-[0.98] transition-all duration-200 shadow-md self-start sm:self-auto"
          >
            <Upload className="w-4 h-4" />
            설교원고 업로드
          </button>
        </div>

        {/* AI PPT 스튜디오 진입 배너 */}
        <Link
          href="/ppt-studio"
          className="block mb-8 rounded-2xl bg-gradient-to-r from-navy-800 to-navy-600 p-5 shadow-card hover:shadow-card-hover transition-all duration-200 group"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-[16px] leading-tight">AI PPT 스튜디오</p>
                <p className="text-white/70 text-[12px] mt-0.5">GPT-5.5 슬라이드 구조화 + gpt-image-1 이미지로 전문가급 PPT 제작</p>
              </div>
            </div>
            <div className="text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all text-[13px] font-bold shrink-0 hidden sm:block">
              시작하기 →
            </div>
          </div>
        </Link>

        {/* 에러 상태 */}
        {error && !loading && (
          <div className="max-w-lg mx-auto py-16 text-center">
            <div className="bg-white border border-[#e4e2dd] p-8 rounded-2xl shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6 text-rose-500" />
              </div>
              <h2 className="font-bold text-[18px] text-slate-800 mb-2">불러오기 실패</h2>
              <p className="text-[14px] text-slate-500 mb-5">{error}</p>
              <button
                onClick={fetchData}
                className="inline-flex items-center gap-2 rounded-xl bg-[#2c2a29] text-white px-5 py-2.5 text-[14px] font-bold hover:bg-[#1e1d1c] transition-all"
              >
                다시 시도
              </button>
            </div>
          </div>
        )}

        {/* 로딩 상태 */}
        {loading && (
          <>
            <StatsSkeleton />
            <div className="mt-8">
              <div className="h-5 bg-[#f0eee9] rounded w-24 mb-4 animate-pulse" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[0, 1, 2].map((i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            </div>
          </>
        )}

        {/* 데이터 있음 */}
        {!loading && !error && data && data.sermons.length > 0 && (
          <>
            {/* 통계 카드 */}
            <WorkspaceStatsCard stats={data.stats} />

            {/* 최근 설교 그리드 */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[16px] font-bold text-[#2c2a29]">
                  최근 설교 ({data.sermons.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.sermons.map((sermon, i) => (
                  <WorkspaceListCard key={sermon.id} sermon={sermon} index={i} />
                ))}
              </div>
            </div>
          </>
        )}

        {/* 빈 상태 */}
        {!loading && !error && data && data.sermons.length === 0 && (
          <div className="bg-white rounded-2xl border border-[#e4e2dd] shadow-sm">
            <EmptyWorkspace onUpload={onUpload} />
          </div>
        )}
      </div>
    </div>
  )
}
