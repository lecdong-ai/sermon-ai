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

  const handleResetOptions = () => {
    if (!confirm('추가한 설교 유형, 회중, 설교자 옵션을 기본값으로 초기화하시겠습니까?')) return
    localStorage.removeItem('sermon-options')
    window.location.reload()
  }

  return (
    <div className="animate-fade-in space-y-6 max-w-4xl">
      <h2 className="text-xl font-bold">설정</h2>

      <div className="bg-surface border border-border rounded-lg p-6 space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-foreground">데이터 정보</h3>
          <div className="mt-3 space-y-2 text-sm text-muted">
            <p>설교 수: {state.sermons.length}개</p>
            <p>태그 수: {state.themes.length}개</p>
            <p>시리즈 수: {state.series.length}개</p>
          </div>
        </div>

        <div className="h-px bg-border" />

        <div>
          <h3 className="text-sm font-semibold text-foreground">데이터 초기화</h3>
          <p className="text-sm text-muted mt-1 mb-4">선택한 항목의 데이터가 영구 삭제됩니다.</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
              <div>
                <p className="text-sm font-medium text-foreground">설교 전체 삭제</p>
                <p className="text-xs text-muted mt-0.5">{state.sermons.length}개의 설교가 삭제됩니다</p>
              </div>
              <button
                type="button"
                onClick={handleResetSermons}
                disabled={resetting === 'sermons' || state.sermons.length === 0}
                className="px-4 py-2 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resetting === 'sermons' ? '삭제 중...' : '삭제'}
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
              <div>
                <p className="text-sm font-medium text-foreground">시리즈 전체 삭제</p>
                <p className="text-xs text-muted mt-0.5">{state.series.length}개의 시리즈가 삭제됩니다</p>
              </div>
              <button
                type="button"
                onClick={handleResetSeries}
                disabled={state.series.length === 0}
                className="px-4 py-2 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                삭제
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
              <div>
                <p className="text-sm font-medium text-foreground">옵션 초기화</p>
                <p className="text-xs text-muted mt-0.5">설교 유형, 회중, 설교자 옵션이 기본값으로 돌아갑니다</p>
              </div>
              <button
                type="button"
                onClick={handleResetOptions}
                className="px-4 py-2 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
              >
                초기화
              </button>
            </div>
          </div>
        </div>

        <div className="h-px bg-border" />

        <div>
          <h3 className="text-sm font-semibold text-foreground">앱 정보</h3>
          <div className="mt-3 space-y-2 text-sm text-muted">
            <p>버전: 1.0.0</p>
            <p>제작: 설교 대시보드 팀</p>
          </div>
        </div>
      </div>
    </div>
  )
}
