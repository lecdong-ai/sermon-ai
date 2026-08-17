'use client'

import { useApp } from '@/lib/dashboard/store'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SettingsPage() {
  const { state, deleteSermon, deleteSeries } = useApp()
  const router = useRouter()
  const [resetting, setResetting] = useState<string | null>(null)

  const handleResetSermons = async () => {
    if (!confirm(`설교 ${state.sermons.length}개를 모두 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) return
    if (!confirm('최종 확인: 정말 모든 설교를 삭제하시겠습니까?')) return
    setResetting('sermons')
    for (const sermon of state.sermons) {
      await deleteSermon(sermon.id)
    }
    setResetting(null)
    alert('모든 설교가 삭제되었습니다.')
  }

  const handleResetSeries = () => {
    if (!confirm(`시리즈 ${state.series.length}개를 모두 삭제하시겠습니까?`)) return
    state.series.forEach((srs) => deleteSeries(srs.id))
    alert('모든 시리즈가 삭제되었습니다.')
  }

  const handleResetAllData = async () => {
    if (!confirm('⚠️ 1차 경고: 정말로 내 모든 설교, 시리즈, 성경 한권강해, 큐티, 연구 자료를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없으며 클라우드 DB에서 완벽하게 초기화됩니다.')) return
    if (!confirm('🚨 2차 최종 확인: 내 모든 데이터가 영구히 지워집니다. 진행하시겠습니까?')) return

    setResetting('all')
    try {
      const res = await fetch('/api/user/reset-all', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        localStorage.clear()
        alert('모든 설교 및 연구 자료가 깨끗하게 초기화되었습니다.')
        window.location.reload()
      } else {
        alert(`초기화 실패: ${data.error || '오류 발생'}`)
      }
    } catch (e: any) {
      alert(`초기화 중 에러가 발생했습니다: ${e?.message || '알 수 없는 에러'}`)
    } finally {
      setResetting(null)
    }
  }

  return (
    <div className="animate-fade-in space-y-6 max-w-4xl">
      <h2 className="text-xl font-bold">설정</h2>

      <div className="bg-white/[0.03] border border-white/10 rounded-lg p-6 space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-white">데이터 정보</h3>
          <div className="mt-3 space-y-2 text-sm text-slate-400">
            <p>설교 수: {state.sermons.length}개</p>
            <p>태그 수: {state.themes.length}개</p>
            <p>시리즈 수: {state.series.length}개</p>
          </div>
        </div>

        <div className="h-px bg-border" />

        <div>
          <h3 className="text-sm font-semibold text-white">데이터 초기화</h3>
          <p className="text-sm text-slate-400 mt-1 mb-4">내 계정에 저장된 클라우드 DB 자료 및 로컬 데이터를 영구 초기화합니다.</p>
          <div className="space-y-3">
            {/* 🌟 내 모든 설교 & 연구 자료 DB 전체 초기화 마스터 버튼 */}
            <div className="flex items-center justify-between p-4 bg-red-950/20 rounded-xl border border-red-500/30">
              <div>
                <p className="text-sm font-bold text-red-400 flex items-center gap-1.5">
                  <span>💥 내 모든 설교 & 연구 자료 전체 초기화 (Master Reset)</span>
                </p>
                <p className="text-xs text-slate-400 mt-0.5">내 계정의 모든 설교, 시리즈, 성경 한권강해, 큐티, 연구 자료를 클라우드 DB에서 깨끗하게 완전 삭제합니다</p>
              </div>
              <button
                type="button"
                onClick={handleResetAllData}
                disabled={resetting === 'all'}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 border border-red-500 rounded-lg shadow-md hover:shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0 cursor-pointer"
              >
                {resetting === 'all' ? '전체 초기화 중...' : '🔥 내 전체 자료 백지화'}
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-lg border border-white/10">
              <div>
                <p className="text-sm font-medium text-white">설교 전체 삭제</p>
                <p className="text-xs text-slate-400 mt-0.5">{state.sermons.length}개의 설교가 삭제됩니다</p>
              </div>
              <button
                type="button"
                onClick={handleResetSermons}
                disabled={resetting === 'sermons' || state.sermons.length === 0}
                className="px-4 py-2 text-xs font-medium text-red-400 border-red-500/30 rounded-lg hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resetting === 'sermons' ? '삭제 중...' : '삭제'}
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-lg border border-white/10">
              <div>
                <p className="text-sm font-medium text-white">시리즈 전체 삭제</p>
                <p className="text-xs text-slate-400 mt-0.5">{state.series.length}개의 시리즈가 삭제됩니다</p>
              </div>
              <button
                type="button"
                onClick={handleResetSeries}
                disabled={state.series.length === 0}
                className="px-4 py-2 text-xs font-medium text-red-400 border-red-500/30 rounded-lg hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                삭제
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-lg border border-white/10">
              <div>
                <p className="text-sm font-medium text-white">옵션 초기화</p>
                <p className="text-xs text-slate-400 mt-0.5">설교 유형, 회중, 설교자 옵션이 기본값으로 돌아갑니다</p>
              </div>
              <button
                type="button"
                onClick={handleResetOptions}
                className="px-4 py-2 text-xs font-medium text-red-400 border-red-500/30 rounded-lg hover:bg-red-500/10"
              >
                초기화
              </button>
            </div>
          </div>
        </div>

        <div className="h-px bg-border" />

        <div>
          <h3 className="text-sm font-semibold text-white">앱 정보</h3>
          <div className="mt-3 space-y-2 text-sm text-slate-400">
            <p>버전: 1.0.0</p>
            <p>제작: 거창 전집사</p>
          </div>
        </div>
      </div>
    </div>
  )
}
