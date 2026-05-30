'use client'

import { useApp } from '@/lib/dashboard/store'

export default function SettingsPage() {
  const { state } = useApp()

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
          <h3 className="text-sm font-semibold text-foreground">앱 정보</h3>
          <div className="mt-3 space-y-2 text-sm text-muted">
            <p>버전: 1.0.0</p>
            <p>제작: 설교 대시보드 팀</p>
            <p>데이터 저장: 브라우저 로컬 (샘플 데이터 기반)</p>
          </div>
        </div>

        <div className="h-px bg-border" />

        <div>
          <h3 className="text-sm font-semibold text-foreground">데이터 초기화</h3>
          <p className="text-sm text-muted mt-1 mb-3">
            이 기능은 아직 구현되지 않았습니다. 다음 버전에서 제공될 예정입니다.
          </p>
        </div>
      </div>
    </div>
  )
}
