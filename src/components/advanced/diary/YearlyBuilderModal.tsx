'use client'

import React, { useState } from 'react'
import {
  Sparkles, Calendar, Layers, ShieldCheck, Download,
  CheckCircle2, Loader2, AlertCircle, Cpu, FileCheck
} from 'lucide-react'
import { ThemeItem } from '@/app/diary/page'

interface YearlyBuilderModalProps {
  isOpen: boolean
  onClose: () => void
  startYear: number
  startMonth: number
  endYear: number
  endMonth: number
  selectedTheme: ThemeItem
  sizeOption: string
  isEcoPrint: boolean
  onStartGenerate: (config: YearlyMasterConfig) => void
  isGenerating: boolean
  progress: {
    currentStep: number
    totalSteps: number
    currentMonthName: string
    percentage: number
  }
}

export interface YearlyMasterConfig {
  startYear: number
  startMonth: number
  endYear: number
  endMonth: number
  packagePreset: 'essential' | 'spiritual' | 'life'
  exportFormat: 'single' | 'quarterly'
  includeYearlyCover: boolean
  includeYearlyGoals: boolean
  includeReadingMap: boolean
  includeMonthlyDivider: boolean
  includeWallCalendar: boolean
}

export default function YearlyBuilderModal({
  isOpen,
  onClose,
  selectedTheme,
  sizeOption,
  onStartGenerate,
  isGenerating,
  progress,
}: YearlyBuilderModalProps) {
  const [config, setConfig] = useState<YearlyMasterConfig>({
    startYear: 2026,
    startMonth: 8,
    endYear: 2027,
    endMonth: 12,
    packagePreset: 'essential',
    exportFormat: 'single',
    includeYearlyCover: true,
    includeYearlyGoals: true,
    includeReadingMap: true,
    includeMonthlyDivider: true,
    includeWallCalendar: true,
  })

  if (!isOpen) return null

  // 총 개월 수 계산
  const totalMonthsCount = Math.max(1, (config.endYear - config.startYear) * 12 + (config.endMonth - config.startMonth + 1))

  // ★ 예상 페이지 수 / 파일 크기 / 생성 시간 추정 (부록 조합 반영)
  const PER_MONTH_PAGES: Record<string, number> = { essential: 38, spiritual: 54, life: 52 }
  const perMonthPages = PER_MONTH_PAGES[config.packagePreset] || 38
  const yearlyPages = 1 + (config.includeWallCalendar ? Math.ceil(totalMonthsCount / 6) : 0)
  const totalPages = perMonthPages * totalMonthsCount + yearlyPages
  const estSizeMB = Math.round(totalPages * 0.2)
  const estMinutes = Math.max(1, Math.round((totalPages * 0.25 + totalMonthsCount * 0.35) / 60))

  const handleRun = () => {
    onStartGenerate(config)
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 max-w-2xl w-full overflow-hidden transition-all duration-300 transform scale-100">
        {/* 상단 럭셔리 헤더 */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 relative">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-400/30">
              <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-50">
                연간 마스터 다이어리 일괄 생성
              </h2>
              <p className="text-xs sm:text-sm text-indigo-200/80 mt-0.5">
                {config.startYear}년 {config.startMonth}월부터 {config.endYear}년 {config.endMonth}월까지 (총 {totalMonthsCount}개월) 초고화질 맞춤형 다이어리 제작
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
            <span className="px-2.5 py-1 bg-white/10 rounded-full border border-white/15 text-slate-200">
              🎨 테마: {selectedTheme.name}
            </span>
            <span className="px-2.5 py-1 bg-white/10 rounded-full border border-white/15 text-slate-200">
              📏 용지: {sizeOption.includes('Landscape') ? '가로형 A4' : '세로형 A4'}
            </span>
            <span className="px-2.5 py-1 bg-indigo-500/30 text-amber-300 font-semibold rounded-full border border-amber-400/30">
              ⚡ 토큰 & 메모리 과부하 100% 방지 청크 엔진
            </span>
          </div>
        </div>

        {/* 본문 콘텐츠 / 생성 중 상태 분기 */}
        <div className="p-6 sm:p-8 max-h-[70vh] overflow-y-auto space-y-6">
          {isGenerating ? (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Cpu className="w-8 h-8 text-indigo-600 animate-pulse" />
                </div>
              </div>

              <div className="space-y-2 max-w-md">
                <h3 className="text-lg font-bold text-slate-800">
                  {progress.currentMonthName || '연간 다이어리 PDF 변환 중...'}
                </h3>
                <p className="text-xs text-slate-500">
                  브라우저 렉이나 튕김을 막기 위해 {progress.totalSteps}단계 중 {progress.currentStep}단계를 안전하게 처리하고 있습니다.
                </p>
              </div>

              {/* 실시간 프로그레스 바 */}
              <div className="w-full max-w-md space-y-1.5">
                <div className="flex justify-between text-xs text-slate-600 font-mono font-medium">
                  <span>진행률</span>
                  <span>{progress.percentage}% ({progress.currentStep} / {progress.totalSteps})</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 rounded-full transition-all duration-300"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-800 text-left flex items-start space-x-3">
                <ShieldCheck className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>안심하고 기다려주세요!</strong> 청크 엔진이 메모리를 자동으로 비우며 대용량 PDF를 병합하고 있습니다. 창을 닫지 마세요.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* 1. 기간 선택 구역 */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span>제작 기간 설정</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <span className="text-[11px] text-slate-500 block mb-1">시작 연월</span>
                    <div className="flex items-center space-x-2">
                      <select
                        value={config.startYear}
                        onChange={(e) => setConfig({ ...config, startYear: Number(e.target.value) })}
                        className="bg-white border border-slate-300 text-slate-800 text-xs rounded-xl p-2 font-medium"
                      >
                        <option value={2026}>2026년</option>
                        <option value={2027}>2027년</option>
                      </select>
                      <select
                        value={config.startMonth}
                        onChange={(e) => setConfig({ ...config, startMonth: Number(e.target.value) })}
                        className="bg-white border border-slate-300 text-slate-800 text-xs rounded-xl p-2 font-medium"
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                          <option key={m} value={m}>{m}월</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <span className="text-[11px] text-slate-500 block mb-1">종료 연월</span>
                    <div className="flex items-center space-x-2">
                      <select
                        value={config.endYear}
                        onChange={(e) => setConfig({ ...config, endYear: Number(e.target.value) })}
                        className="bg-white border border-slate-300 text-slate-800 text-xs rounded-xl p-2 font-medium"
                      >
                        <option value={2026}>2026년</option>
                        <option value={2027}>2027년</option>
                      </select>
                      <select
                        value={config.endMonth}
                        onChange={(e) => setConfig({ ...config, endMonth: Number(e.target.value) })}
                        className="bg-white border border-slate-300 text-slate-800 text-xs rounded-xl p-2 font-medium"
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                          <option key={m} value={m}>{m}월</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. 패키지 구성 프리셋 */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span>내지 포함 패키지 선택</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'essential', title: '에센셜 코어', desc: '월간/주간/데일리 필수 구성' },
                    { id: 'spiritual', title: '크리스천 영성', desc: '코어 + 묵상/기도/독경표' },
                    { id: 'life', title: '갓생 라이너', desc: '코어 + 해빗/가계부/KPT회고' },
                  ].map((pkg) => (
                    <button
                      key={pkg.id}
                      onClick={() => setConfig({ ...config, packagePreset: pkg.id as any })}
                      className={`p-3.5 rounded-2xl border text-left transition-all ${
                        config.packagePreset === pkg.id
                          ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold">{pkg.title}</span>
                        {config.packagePreset === pkg.id && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 block leading-tight">{pkg.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. 옵션 선택 체크박스 */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2">
                  마스터 다이어리 전용 럭셔리 부록
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.includeYearlyCover}
                      onChange={(e) => setConfig({ ...config, includeYearlyCover: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>연간 타이틀 표지 (Yearly Cover)</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.includeYearlyGoals}
                      onChange={(e) => setConfig({ ...config, includeYearlyGoals: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>1년 100가지 비전 & 목표 (100 Goals)</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.includeReadingMap}
                      onChange={(e) => setConfig({ ...config, includeReadingMap: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>1년 성경 완독 맵 (Bible Map)</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.includeMonthlyDivider}
                      onChange={(e) => setConfig({ ...config, includeMonthlyDivider: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>월별 구분 인덱스 커버 (Monthly Divider)</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.includeWallCalendar}
                      onChange={(e) => setConfig({ ...config, includeWallCalendar: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>연간 월력 벽달력 (Yearly Wall Calendar)</span>
                  </label>
                </div>
              </div>

              {/* 4. 예상 산출물 정보 */}
              <div className="flex items-center justify-between bg-indigo-50/60 border border-indigo-100 rounded-2xl px-4 py-3">
                <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-800">
                  <FileCheck className="w-4 h-4 text-indigo-600" />
                  <span>예상 산출물</span>
                </div>
                <div className="text-xs text-slate-600 font-medium">
                  약 <strong className="text-indigo-700">{totalPages.toLocaleString()}</strong> 페이지
                  · 약 <strong className="text-indigo-700">{estSizeMB.toLocaleString()}MB</strong>
                  · 생성 약 <strong className="text-indigo-700">{estMinutes}분</strong>
                </div>
              </div>
            </>
          )}
        </div>

        {/* 하단 푸터 버튼 */}
        {!isGenerating && (
          <div className="bg-slate-50 border-t border-slate-200/80 p-4 sm:p-6 flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              취소
            </button>

            <button
              onClick={handleRun}
              className="flex items-center space-x-2 px-7 py-3 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white text-xs font-bold rounded-2xl shadow-lg shadow-indigo-500/25 hover:from-indigo-700 hover:to-indigo-900 transition-all duration-200 transform active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>{totalMonthsCount}개월 마스터 다이어리 일괄 생성 시작</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
