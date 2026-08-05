'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  Calendar as CalendarIcon, Download, Sparkles, BookOpen, Layers,
  ChevronLeft, ArrowLeft, RotateCcw, Check, FileText, Maximize2,
  X, ZoomIn, ZoomOut, Eye, Sliders, ArrowUp, List
} from 'lucide-react'
import Link from 'next/link'
import QtMonthlyCalendarPage from '@/components/advanced/QtMonthlyCalendarPage'
import QtMonthlyOverviewPage from '@/components/advanced/QtMonthlyOverviewPage'
import QtWeeklyPlanPage from '@/components/advanced/QtWeeklyPlanPage'
import QtDailyDiaryPage from '@/components/advanced/QtDailyDiaryPage'
import QtMonthlyCalendarPortrait from '@/components/advanced/portrait/QtMonthlyCalendarPortrait'
import QtMonthlyOverviewPortrait from '@/components/advanced/portrait/QtMonthlyOverviewPortrait'
import QtWeeklyPlanPortrait from '@/components/advanced/portrait/QtWeeklyPlanPortrait'
import QtDailyDiaryPortrait from '@/components/advanced/portrait/QtDailyDiaryPortrait'
import QtPrayerAnswerPage from '@/components/advanced/QtPrayerAnswerPage'
import QtPrayerAnswerPortrait from '@/components/advanced/portrait/QtPrayerAnswerPortrait'
import QtScriptureArtPage from '@/components/advanced/QtScriptureArtPage'
import QtScriptureArtPortrait from '@/components/advanced/portrait/QtScriptureArtPortrait'
import QtSundaySermonPage from '@/components/advanced/QtSundaySermonPage'
import QtSundaySermonPortrait from '@/components/advanced/portrait/QtSundaySermonPortrait'
import QtSundaySermonDeepPage from '@/components/advanced/QtSundaySermonDeepPage'
import QtSundaySermonDeepPortrait from '@/components/advanced/portrait/QtSundaySermonDeepPortrait'
import QtBibleReadingMapPage from '@/components/advanced/QtBibleReadingMapPage'
import QtBibleReadingMapPortrait from '@/components/advanced/portrait/QtBibleReadingMapPortrait'
import QtMonthlyLetterPage from '@/components/advanced/QtMonthlyLetterPage'
import QtMonthlyLetterPortrait from '@/components/advanced/portrait/QtMonthlyLetterPortrait'
import { generateQtPdf } from '@/lib/qtPdfGen'
import { PAGE_SIZES } from '@/lib/qtPdfSizes'

const THEMES = [
  { id: 'cool-blue', name: '쿨 블루 (Cool Grey Blue)', color: '#B8C6D9' },
  { id: 'butter-yellow', name: '버터 옐로우 (Butter Yellow)', color: '#E8D8A0' },
  { id: 'soft-lavender', name: '소프트 라벤더 (Soft Lavender)', color: '#C8B8D8' },
  { id: 'sage-green', name: '세이지 그린 (Sage Green)', color: '#A0C8B0' },
  { id: 'soft-peach', name: '소프트 피치 (Soft Peach)', color: '#E8B0B0' },
]

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export default function DiaryPage() {
  const [selectedYear, setSelectedYear] = useState(2026)
  const [selectedMonth, setSelectedMonth] = useState(8) // 기본 8월
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0])
  const [selectedSizeOption, setSelectedSizeOption] = useState('A4Landscape')
  const [isEcoPrint, setIsEcoPrint] = useState(false)
  const [previewTab, setPreviewTab] = useState<'calendar' | 'overview' | 'prayer' | 'scripture' | 'sermon' | 'sermondeep' | 'biblemap' | 'letter' | 'weekly' | 'daily'>('prayer')
  const [activeDayNum, setActiveDayNum] = useState(1)
  const [isPdfGenerating, setIsPdfGenerating] = useState(false)

  // ★ 팝업 뷰어 & 스크롤 모드 상태 변수
  const [isFullscreenModalOpen, setIsFullscreenModalOpen] = useState(false)
  const [modalViewMode, setModalViewMode] = useState<'single' | 'continuous'>('continuous')
  const [zoomScale, setZoomScale] = useState(1.0)
  const [modalActiveTab, setModalActiveTab] = useState<'calendar' | 'overview' | 'prayer' | 'scripture' | 'sermon' | 'sermondeep' | 'biblemap' | 'letter' | 'weekly' | 'daily'>('calendar')
  const [modalDayNum, setModalDayNum] = useState(1)

  const pdfContainerRef = useRef<HTMLDivElement>(null)
  const modalScrollRef = useRef<HTMLDivElement>(null)

  const monthName = MONTH_NAMES[selectedMonth - 1] || 'August'
  const totalDays = new Date(selectedYear, selectedMonth, 0).getDate()

  // 적용할 테마 색상 (에코 인쇄 모드 시 흑백/다크그레이 적용)
  const activeColor = isEcoPrint ? '#475569' : selectedTheme.color

  // ★ 선택된 용지 규격 → 화면 렌더링 픽셀 크기 계산
  const BASE_LONG = 1024
  const sizeInfo = PAGE_SIZES[selectedSizeOption] || PAGE_SIZES['A4Landscape']
  const isLandscape = sizeInfo.widthMm >= sizeInfo.heightMm

  const pageWidth = isLandscape
    ? BASE_LONG
    : Math.round(BASE_LONG * (sizeInfo.widthMm / sizeInfo.heightMm))
  const pageHeight = isLandscape
    ? Math.round(BASE_LONG * (sizeInfo.heightMm / sizeInfo.widthMm))
    : BASE_LONG
  const sizeLabel = sizeInfo.label

  // ★ isLandscape 여부에 따른 가로/세로 전용 컴포넌트 자동 전환
  const CalendarComponent = isLandscape ? QtMonthlyCalendarPage : QtMonthlyCalendarPortrait
  const OverviewComponent = isLandscape ? QtMonthlyOverviewPage : QtMonthlyOverviewPortrait
  const PrayerComponent = isLandscape ? QtPrayerAnswerPage : QtPrayerAnswerPortrait
  const ScriptureArtComponent = isLandscape ? QtScriptureArtPage : QtScriptureArtPortrait
  const SundaySermonComponent = isLandscape ? QtSundaySermonPage : QtSundaySermonPortrait
  const SundaySermonDeepComponent = isLandscape ? QtSundaySermonDeepPage : QtSundaySermonDeepPortrait
  const BibleMapComponent = isLandscape ? QtBibleReadingMapPage : QtBibleReadingMapPortrait
  const MonthlyLetterComponent = isLandscape ? QtMonthlyLetterPage : QtMonthlyLetterPortrait
  const WeeklyComponent = isLandscape ? QtWeeklyPlanPage : QtWeeklyPlanPortrait
  const DailyComponent = isLandscape ? QtDailyDiaryPage : QtDailyDiaryPortrait

  // ★ 해당 월/연도에 맞는 주차별 실제 날짜 & 1주차~5주차 정보 동적 계산 헬퍼
  const getWeekData = (wIndex: number) => {
    const totalDaysCount = new Date(selectedYear, selectedMonth, 0).getDate()
    const startDay = (wIndex - 1) * 7 + 1
    const endDay = Math.min(totalDaysCount, wIndex * 7)

    const dateRangeText = `${String(selectedMonth).padStart(2, '0')}/${String(startDay).padStart(2, '0')} - ${String(selectedMonth).padStart(2, '0')}/${String(endDay).padStart(2, '0')}`

    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
    const daysInWeek = Array.from({ length: 7 }, (_, i) => {
      const dayNum = (wIndex - 1) * 7 + i + 1
      const isValid = dayNum <= totalDaysCount
      const d = isValid ? new Date(selectedYear, selectedMonth - 1, dayNum) : null
      const dayName = d ? dayNames[d.getDay()] : dayNames[i]
      const dateStr = isValid ? `${String(selectedMonth).padStart(2, '0')}/${String(dayNum).padStart(2, '0')}` : '-'
      return {
        dayNum: isValid ? dayNum : 0,
        dayName,
        dateStr,
      }
    })

    return {
      weekNum: wIndex,
      weekLabel: `${wIndex}주차`,
      dateRangeText,
      daysInWeek,
    }
  }

  // PDF 다운로드 핸들러
  const handleDownloadFullPdf = async () => {
    if (!pdfContainerRef.current) return
    setIsPdfGenerating(true)
    try {
      const mockForm = {
        bibleBook: '다이어리',
        weekNumber: 1,
        audience: 'all',
        level: 'normal',
        tone: 'warm',
        seriesName: `${selectedYear}년 ${selectedMonth}월 수채화 다이어리`,
        sizeOption: selectedSizeOption,
        designTemplate: 'warm-modern',
        startDate: `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`,
      }
      await generateQtPdf(
        pdfContainerRef.current,
        mockForm as any,
        { fullManuscript: '' },
        selectedSizeOption,
        'warm-modern'
      )
    } catch (e: any) {
      console.error(e)
      alert(`PDF 생성 실패: ${e?.message || '알 수 없는 오류'}`)
    } finally {
      setIsPdfGenerating(false)
    }
  }

  // 특정 데일리 페이지로 모달 스크롤 이동
  const scrollToPageElement = (idStr: string) => {
    const el = document.getElementById(idStr)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // ★ 팝업 뷰어 캔버스 내부 클릭 시 링크 이벤트 처리 (날짜, 주차, 헤더 탭 클릭 시 부드럽게 자동 이동)
  const handleModalCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement
    const navTargetEl = target.closest('[data-nav-target], [data-day]') as HTMLElement | null

    if (!navTargetEl) return

    const navTarget = navTargetEl.getAttribute('data-nav-target')
    const dayAttr = navTargetEl.getAttribute('data-day')

    if (navTarget) {
      if (navTarget === 'calendar') {
        if (modalViewMode === 'single') setModalActiveTab('calendar')
        else scrollToPageElement('modal-page-calendar')
      } else if (navTarget === 'overview') {
        if (modalViewMode === 'single') setModalActiveTab('overview')
        else scrollToPageElement('modal-page-overview')
      } else if (navTarget.startsWith('week-')) {
        const wNum = navTarget.replace('week-', '')
        if (modalViewMode === 'single') {
          setModalActiveTab('weekly')
        } else {
          scrollToPageElement(`modal-page-week-${wNum}`)
        }
      } else if (navTarget.startsWith('day-')) {
        const dNum = Number(navTarget.replace('day-', ''))
        if (!isNaN(dNum)) {
          if (modalViewMode === 'single') {
            setModalActiveTab('daily')
            setModalDayNum(dNum)
          } else {
            scrollToPageElement(`modal-page-day-${dNum}`)
          }
        }
      }
    } else if (dayAttr) {
      const dNum = Number(dayAttr)
      if (!isNaN(dNum) && dNum > 0) {
        if (modalViewMode === 'single') {
          setModalActiveTab('daily')
          setModalDayNum(dNum)
        } else {
          scrollToPageElement(`modal-page-day-${dNum}`)
        }
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* 1. Header Navigation Bar */}
      <header className="px-6 py-4 border-b border-white/10 bg-slate-900/90 backdrop-blur flex items-center justify-between sticky top-0 z-30 shadow-xl">
        <div className="flex items-center space-x-4">
          <Link
            href="/advanced/qt"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4 text-indigo-400" />
            고급 큐티 생성기로 돌아가기
          </Link>
          <div className="h-4 w-px bg-white/15" />
          <h1 className="text-base font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            {selectedYear}년 {selectedMonth}월 수채화 다이어리 (기도제목 포함) 제작소
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          {/* 전체화면 팝업 뷰어 열기 버튼 */}
          <button
            onClick={() => setIsFullscreenModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-400/30 text-xs font-bold transition-all shadow-md"
            title="모니터 전체 화면 팝업 뷰어로 시원하게 보기"
          >
            <Maximize2 className="w-4 h-4 text-amber-400" />
            🔍 시원하게 보기 (전체화면 팝업)
          </button>

          {/* PDF 다운로드 버튼 */}
          <button
            onClick={handleDownloadFullPdf}
            disabled={isPdfGenerating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 border border-indigo-400/30 transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {isPdfGenerating ? 'PDF 제작 중...' : `${selectedMonth}월 다이어리 전체 PDF 다운로드 (${totalDays + 8}페이지)`}
          </button>
        </div>
      </header>

      {/* 2. Main Workspace Grid */}
      <div className="flex-1 grid grid-cols-12 gap-6 p-6 max-w-7xl mx-auto w-full">
        {/* Left Options Panel (4 cols) */}
        <div className="col-span-12 lg:col-span-4 space-y-5">
          {/* Dynamic Year & Month Selector */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-white/10 space-y-3 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span className="flex items-center">
                <CalendarIcon className="w-4 h-4 mr-1.5 text-indigo-400" />
                연도 및 월 지정 ({selectedYear}년 {selectedMonth}월)
              </span>
            </h3>
            
            {/* Year Selector */}
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-xs text-slate-400 font-semibold mr-1">연도:</span>
              {[2025, 2026, 2027, 2028].map((yr) => (
                <button
                  key={yr}
                  onClick={() => setSelectedYear(yr)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all ${
                    selectedYear === yr
                      ? 'bg-indigo-600/30 border-indigo-400 text-indigo-200 shadow-sm'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/10'
                  }`}
                >
                  {yr}년
                </button>
              ))}
            </div>

            {/* Month Selector Grid */}
            <div className="grid grid-cols-4 gap-1.5">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setSelectedMonth(m)
                    setActiveDayNum(1)
                  }}
                  className={`py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    selectedMonth === m
                      ? 'bg-amber-500/25 border-amber-400 text-amber-300 font-bold shadow-sm'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/10'
                  }`}
                >
                  {m}월
                </button>
              ))}
            </div>
          </div>

          {/* Theme Selector */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-white/10 space-y-3 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center">
              <FileText className="w-4 h-4 mr-1.5 text-indigo-400" />
              수채화 파스텔 테마 선택
            </h3>
            <div className="space-y-2">
              {THEMES.map((theme) => {
                const isSelected = selectedTheme.id === theme.id
                return (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-400 text-indigo-200 shadow-md'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-5 h-5 rounded-full border border-white/20 shadow-xs"
                        style={{ backgroundColor: theme.color }}
                      />
                      <span>{theme.name}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-indigo-400" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Paper Size & Eco Print Option */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-white/10 space-y-3 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span className="flex items-center">
                <FileText className="w-4 h-4 mr-1.5 text-indigo-400" />
                인쇄 용지 규격 (A4 / B5 / A5 / Tablet)
              </span>
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {Object.keys(PAGE_SIZES).map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSelectedSizeOption(sz)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    selectedSizeOption === sz
                      ? 'bg-indigo-600/30 border-indigo-400 text-indigo-200 shadow-sm'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/10'
                  }`}
                >
                  {PAGE_SIZES[sz]?.label?.split(' (')[0] || sz}
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
                🌿 잉크 절약 에코 인쇄 모드
              </span>
              <button
                onClick={() => setIsEcoPrint(!isEcoPrint)}
                className={`px-3 py-1 rounded-lg border text-xs font-bold transition-all ${
                  isEcoPrint
                    ? 'bg-emerald-600/30 border-emerald-400 text-emerald-300'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
                }`}
              >
                {isEcoPrint ? 'ON (순백색)' : 'OFF (컬러)'}
              </button>
            </div>
          </div>

          {/* Preview Tab Selector */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-white/10 space-y-3 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center">
              <Layers className="w-4 h-4 mr-1.5 text-indigo-400" />
              미리보기 양식 전환
            </h3>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => setPreviewTab('calendar')}
                className={`p-2 rounded-xl border text-[11px] font-semibold transition-all ${
                  previewTab === 'calendar'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                📅 월간 달력
              </button>

              <button
                onClick={() => setPreviewTab('overview')}
                className={`p-2 rounded-xl border text-[11px] font-semibold transition-all ${
                  previewTab === 'overview'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                📊 월간 개요
              </button>

              <button
                onClick={() => setPreviewTab('prayer')}
                className={`p-2 rounded-xl border text-[11px] font-semibold transition-all ${
                  previewTab === 'prayer'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                🙏 기도 & 습관
              </button>

              <button
                onClick={() => setPreviewTab('scripture')}
                className={`p-2 rounded-xl border text-[11px] font-semibold transition-all ${
                  previewTab === 'scripture'
                    ? 'bg-purple-500/20 border-purple-400 text-purple-300 font-bold'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                📜 암송 필사
              </button>

              <button
                onClick={() => setPreviewTab('sermon')}
                className={`p-2 rounded-xl border text-[11px] font-semibold transition-all ${
                  previewTab === 'sermon'
                    ? 'bg-blue-500/20 border-blue-400 text-blue-300 font-bold'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                🏛️ 주일 설교(월간)
              </button>

              <button
                onClick={() => setPreviewTab('sermondeep')}
                className={`p-2 rounded-xl border text-[11px] font-semibold transition-all ${
                  previewTab === 'sermondeep'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                🌟 주일 심층 노트(Draft1)
              </button>

              <button
                onClick={() => setPreviewTab('biblemap')}
                className={`p-2 rounded-xl border text-[11px] font-semibold transition-all ${
                  previewTab === 'biblemap'
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                🕊️ 66권 통독
              </button>

              <button
                onClick={() => setPreviewTab('letter')}
                className={`p-2 rounded-xl border text-[11px] font-semibold transition-all ${
                  previewTab === 'letter'
                    ? 'bg-rose-500/20 border-rose-400 text-rose-300 font-bold'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                💌 월말 편지
              </button>

              <button
                onClick={() => setPreviewTab('weekly')}
                className={`p-2 rounded-xl border text-[11px] font-semibold transition-all ${
                  previewTab === 'weekly'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                📆 주간 계획
              </button>

              <button
                onClick={() => setPreviewTab('daily')}
                className={`p-2 rounded-xl border text-[11px] font-semibold transition-all ${
                  previewTab === 'daily'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                📝 데일리+기도
              </button>
            </div>

            {/* Daily Selector */}
            {previewTab === 'daily' && (
              <div className="mt-3 pt-3 border-t border-white/10">
                <label className="text-[11px] text-slate-400 font-semibold mb-1.5 block">
                  {selectedMonth}월 일자 선택 (1일 ~ {totalDays}일)
                </label>
                <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto pr-1">
                  {Array.from({ length: totalDays }, (_, i) => i + 1).map((d) => (
                    <button
                      key={d}
                      onClick={() => setActiveDayNum(d)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                        activeDayNum === d
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white/5 hover:bg-white/15 text-slate-300'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Live Preview Panel (8 cols) */}
        <div className="col-span-12 lg:col-span-8 flex flex-col items-center justify-start">
          <div className="w-full flex items-center justify-between mb-3 text-xs text-slate-400">
            <span>
              실시간 PDF 미리보기 — <strong className="text-slate-200">{sizeLabel}</strong> <span className="text-indigo-400">({pageWidth}×{pageHeight}px)</span>
            </span>
            <button
              onClick={() => setIsFullscreenModalOpen(true)}
              className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 transition-all"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              전체화면 팝업 뷰어로 시원하게 보기 ➔
            </button>
          </div>

          {/* Interactive Preview Canvas */}
          <div
            onClick={() => setIsFullscreenModalOpen(true)}
            className="w-full bg-slate-900 border border-white/10 hover:border-indigo-400/50 rounded-2xl p-4 shadow-2xl flex items-center justify-center overflow-hidden cursor-pointer group relative transition-all"
            style={{
              minHeight: isLandscape ? '540px' : '880px',
            }}
          >
            <div className="absolute inset-0 bg-indigo-900/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center z-10 pointer-events-none">
              <span className="px-4 py-2 rounded-xl bg-slate-950/90 border border-indigo-400/40 text-indigo-200 font-bold text-sm shadow-2xl flex items-center gap-2">
                <Maximize2 className="w-4 h-4 text-amber-400 animate-bounce" />
                클릭하여 39페이지 전체화면 팝업창 열기
              </span>
            </div>

            <div
              className={`origin-top transition-transform duration-200 my-2 ${
                isLandscape
                  ? 'scale-[0.52] sm:scale-[0.62] lg:scale-[0.65] xl:scale-[0.72]'
                  : 'scale-[0.6] sm:scale-[0.75] lg:scale-[0.8] xl:scale-[0.85]'
              }`}
              style={{
                height: isLandscape ? `${Math.round(pageHeight * 0.72)}px` : `${Math.round(pageHeight * 0.85)}px`,
              }}
            >
              {previewTab === 'calendar' && (
                <CalendarComponent
                  year={selectedYear}
                  month={selectedMonth}
                  monthName={monthName}
                  themeColor={activeColor}
                  pageWidth={pageWidth}
                  pageHeight={pageHeight}
                />
              )}
              {previewTab === 'overview' && (
                <OverviewComponent
                  year={selectedYear}
                  monthName={monthName}
                  themeColor={activeColor}
                  pageWidth={pageWidth}
                  pageHeight={pageHeight}
                />
              )}
              {previewTab === 'prayer' && (
                <PrayerComponent
                  year={selectedYear}
                  monthName={monthName}
                  themeColor={activeColor}
                  pageWidth={pageWidth}
                  pageHeight={pageHeight}
                />
              )}
              {previewTab === 'scripture' && (
                <ScriptureArtComponent
                  year={selectedYear}
                  monthName={monthName}
                  themeColor={activeColor}
                  pageWidth={pageWidth}
                  pageHeight={pageHeight}
                />
              )}
              {previewTab === 'sermon' && (
                <SundaySermonComponent
                  year={selectedYear}
                  month={selectedMonth}
                  monthName={monthName}
                  themeColor={activeColor}
                  pageWidth={pageWidth}
                  pageHeight={pageHeight}
                />
              )}
              {previewTab === 'sermondeep' && (
                <SundaySermonDeepComponent
                  year={selectedYear}
                  month={selectedMonth}
                  sundayNo={1}
                  dateStr="08/02"
                  monthName={monthName}
                  themeColor={activeColor}
                  pageWidth={pageWidth}
                  pageHeight={pageHeight}
                />
              )}
              {previewTab === 'biblemap' && (
                <BibleMapComponent
                  year={selectedYear}
                  monthName={monthName}
                  themeColor={activeColor}
                  pageWidth={pageWidth}
                  pageHeight={pageHeight}
                />
              )}
              {previewTab === 'letter' && (
                <MonthlyLetterComponent
                  year={selectedYear}
                  monthName={monthName}
                  themeColor={activeColor}
                  pageWidth={pageWidth}
                  pageHeight={pageHeight}
                />
              )}
              {previewTab === 'weekly' && (() => {
                const w1Data = getWeekData(1)
                return (
                  <WeeklyComponent
                    weekNum={w1Data.weekNum}
                    weekLabel={w1Data.weekLabel}
                    dateRangeText={w1Data.dateRangeText}
                    daysInWeek={w1Data.daysInWeek}
                    monthName={monthName}
                    themeColor={activeColor}
                    pageWidth={pageWidth}
                    pageHeight={pageHeight}
                  />
                )
              })()}
              {previewTab === 'daily' && (() => {
                const dayNamesShort = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
                const dateObj = new Date(selectedYear, selectedMonth - 1, activeDayNum)
                const realDayName = dayNamesShort[dateObj.getDay()]
                return (
                  <DailyComponent
                    dateLabel={`${String(activeDayNum).padStart(2, '0')} ${realDayName}`}
                    dayNum={activeDayNum}
                    dayName={realDayName}
                    monthName={monthName}
                    yearLabel={String(selectedYear)}
                    themeColor={activeColor}
                    pageWidth={pageWidth}
                    pageHeight={pageHeight}
                    activeWeek={`W${Math.floor((activeDayNum - 1) / 7) + 1}`}
                  />
                )
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* ★ ===== [39페이지 전체화면 풀스크린 팝업창 모달] ===== */}
      {isFullscreenModalOpen && (
        <div className="fixed inset-0 z-[100] bg-[#030612]/98 backdrop-blur-2xl flex flex-col min-h-screen min-w-full animate-in fade-in duration-200">
          {/* Modal Header Bar */}
          <header className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-[#090e24]/95 backdrop-blur-md shrink-0 shadow-2xl z-20 gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>2026년 8월 다이어리 100% 실물 전체화면 뷰어</span>
              </div>
              <span className="text-xs text-slate-400 font-medium hidden md:inline-block">
                · 테마: <strong className="text-slate-200">{selectedTheme.name}</strong>
              </span>
            </div>

            {/* Center Controls: View Mode Switcher + Zoom Controls */}
            <div className="flex items-center gap-3">
              {/* View Mode Switcher */}
              <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-white/10">
                <button
                  onClick={() => setModalViewMode('continuous')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    modalViewMode === 'continuous'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="39페이지 전체를 아래로 연속 스크롤하며 보기"
                >
                  <List className="w-3.5 h-3.5" />
                  39p 전체 연속 스크롤 뷰
                </button>
                <button
                  onClick={() => setModalViewMode('single')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    modalViewMode === 'single'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="단일 페이지 집중 보기"
                >
                  <Eye className="w-3.5 h-3.5" />
                  단일 페이지 뷰
                </button>
              </div>

              {/* Zoom Scale Controls */}
              <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-white/10">
                <button
                  onClick={() => setZoomScale(s => Math.max(0.4, Number((s - 0.1).toFixed(1))))}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-all"
                  title="축소"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>

                <span className="text-xs font-mono font-bold px-2 text-indigo-200 min-w-[48px] text-center">
                  {Math.round(zoomScale * 100)}%
                </span>

                <button
                  onClick={() => setZoomScale(s => Math.min(2.0, Number((s + 0.1).toFixed(1))))}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-all"
                  title="확대"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setZoomScale(1.0)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white/10 text-[11px] font-bold text-slate-300 hover:text-white transition-all ml-1 border-l border-white/10"
                >
                  <RotateCcw className="w-3 h-3" />
                  100%
                </button>
              </div>
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleDownloadFullPdf}
                disabled={isPdfGenerating}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-amber-500/20 border border-amber-300/30"
              >
                <Download className="w-4 h-4" />
                {isPdfGenerating ? '제작 중...' : 'PDF 저장'}
              </button>

              <button
                onClick={() => setIsFullscreenModalOpen(false)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-red-500/20 text-slate-300 hover:text-red-200 text-xs font-bold transition-all border border-white/10"
              >
                <X className="w-4 h-4" />
                닫기
              </button>
            </div>
          </header>

          {/* Modal Main Layout (Index Sidebar + Canvas View) */}
          <div className="flex flex-1 min-h-0 overflow-hidden">
            {/* Quick-Jump Index Sidebar (Left 220px) */}
            <div className="w-56 bg-[#060a1a] border-r border-white/10 p-4 overflow-y-auto space-y-4 shrink-0 font-sans">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>📑 목차 Quick-Jump</span>
                <span className="text-[9px] text-indigo-400">39 Pages</span>
              </div>

              {/* 1. Monthly Pages */}
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setModalActiveTab('calendar')
                    if (modalViewMode === 'continuous') scrollToPageElement('modal-page-calendar')
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-amber-300 border border-white/5 flex items-center justify-between"
                >
                  <span>📅 P1. 월간 달력</span>
                </button>
                <button
                  onClick={() => {
                    setModalActiveTab('overview')
                    if (modalViewMode === 'continuous') scrollToPageElement('modal-page-overview')
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-amber-300 border border-white/5 flex items-center justify-between"
                >
                  <span>📊 P2. 월간 개요</span>
                </button>
                <button
                  onClick={() => {
                    setModalActiveTab('prayer')
                    if (modalViewMode === 'continuous') scrollToPageElement('modal-page-prayer')
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-amber-300 border border-white/5 flex items-center justify-between"
                >
                  <span>🙏 P3. 기도 & 은혜 기념비</span>
                </button>
                <button
                  onClick={() => {
                    setModalActiveTab('scripture')
                    if (modalViewMode === 'continuous') scrollToPageElement('modal-page-scripture')
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 flex items-center justify-between"
                >
                  <span>📜 P4. 암송 필사 카드</span>
                </button>
                <button
                  onClick={() => {
                    setModalActiveTab('sermon')
                    if (modalViewMode === 'continuous') scrollToPageElement('modal-page-sermon')
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/20 flex items-center justify-between"
                >
                  <span>🏛️ P5. 주일 설교 요약 (월간)</span>
                </button>
                <button
                  onClick={() => {
                    setModalActiveTab('sermondeep')
                    if (modalViewMode === 'continuous') scrollToPageElement('modal-page-sermondeep')
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 flex items-center justify-between"
                >
                  <span>🌟 P5-2. 주일 심층 노트 (Draft 1)</span>
                </button>
                <button
                  onClick={() => {
                    setModalActiveTab('biblemap')
                    if (modalViewMode === 'continuous') scrollToPageElement('modal-page-biblemap')
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 flex items-center justify-between"
                >
                  <span>🕊️ P6. 성경 66권 통독 맵</span>
                </button>
                <button
                  onClick={() => {
                    setModalActiveTab('letter')
                    if (modalViewMode === 'continuous') scrollToPageElement('modal-page-letter')
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 flex items-center justify-between"
                >
                  <span>💌 P-Last. 하나님께 드리는 편지</span>
                </button>
              </div>

              {/* 2. Weeks & Daily Pages */}
              <div className="space-y-3 pt-2 border-t border-white/10">
                {Array.from({ length: Math.ceil(totalDays / 7) }, (_, idx) => {
                  const w = idx + 1
                  const startD = idx * 7 + 1
                  const endD = Math.min(totalDays, (idx + 1) * 7)
                  const days = Array.from({ length: endD - startD + 1 }, (_, dIdx) => startD + dIdx)
                  return { w, label: `W${w} (${selectedMonth}/${startD}~${selectedMonth}/${endD})`, days }
                }).map((weekItem) => (
                  <div key={weekItem.w} className="space-y-1">
                    <button
                      onClick={() => {
                        setModalActiveTab('weekly')
                        if (modalViewMode === 'continuous') scrollToPageElement(`modal-page-week-${weekItem.w}`)
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/25 flex items-center justify-between"
                    >
                      <span>📆 {weekItem.label}</span>
                    </button>
                    <div className="grid grid-cols-4 gap-1 pl-1">
                      {weekItem.days.map((d) => (
                        <button
                          key={d}
                          onClick={() => {
                            setModalActiveTab('daily')
                            setModalDayNum(d)
                            if (modalViewMode === 'continuous') scrollToPageElement(`modal-page-day-${d}`)
                          }}
                          className="py-1 rounded bg-white/5 hover:bg-indigo-600 hover:text-white text-[10px] text-slate-300 text-center font-semibold"
                        >
                          {d}일
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Main Scrollable Viewer Area */}
            <div
              ref={modalScrollRef}
              onClick={handleModalCanvasClick}
              className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-start scrollbar-thin bg-gradient-to-b from-[#030612] via-[#080d22] to-[#030612]"
            >
              {modalViewMode === 'continuous' ? (
                /* ★ 39페이지 전체 연속 스크롤 모드 */
                <div
                  className="space-y-8 transition-all duration-200 origin-top flex flex-col items-center"
                  style={{
                    transform: `scale(${zoomScale})`,
                    transformOrigin: 'top center',
                  }}
                >
                  {/* P1: Monthly Calendar */}
                  <div id="modal-page-calendar" className="relative group">
                    <div className="absolute -top-6 left-0 text-[11px] font-bold text-amber-400 bg-slate-900/90 px-3 py-0.5 rounded-t-lg border border-white/10">
                      P1. {selectedYear}년 {selectedMonth}월 월간 달력
                    </div>
                    <CalendarComponent
                      year={selectedYear}
                      month={selectedMonth}
                      monthName={monthName}
                      themeColor={activeColor}
                      pageWidth={pageWidth}
                      pageHeight={pageHeight}
                    />
                  </div>

                  {/* P2: Monthly Overview */}
                  <div id="modal-page-overview" className="relative group">
                    <div className="absolute -top-6 left-0 text-[11px] font-bold text-amber-400 bg-slate-900/90 px-3 py-0.5 rounded-t-lg border border-white/10">
                      P2. {selectedYear}년 {selectedMonth}월 월간 개요
                    </div>
                    <OverviewComponent
                      year={selectedYear}
                      monthName={monthName}
                      themeColor={activeColor}
                      pageWidth={pageWidth}
                      pageHeight={pageHeight}
                    />
                  </div>

                  {/* P3: Prayer & Grace Milestone */}
                  <div id="modal-page-prayer" className="relative group">
                    <div className="absolute -top-6 left-0 text-[11px] font-bold text-amber-400 bg-slate-900/90 px-3 py-0.5 rounded-t-lg border border-white/10">
                      P3. {selectedYear}년 {selectedMonth}월 기도 & 은혜의 기념비
                    </div>
                    <PrayerComponent
                      year={selectedYear}
                      monthName={monthName}
                      themeColor={activeColor}
                      pageWidth={pageWidth}
                      pageHeight={pageHeight}
                    />
                  </div>

                  {/* P4: Scripture Art */}
                  <div id="modal-page-scripture" className="relative group">
                    <div className="absolute -top-6 left-0 text-[11px] font-bold text-purple-300 bg-slate-900/90 px-3 py-0.5 rounded-t-lg border border-white/10">
                      P4. {selectedYear}년 {selectedMonth}월 수채화 암송 & 필사 카드
                    </div>
                    <ScriptureArtComponent
                      year={selectedYear}
                      monthName={monthName}
                      themeColor={activeColor}
                      pageWidth={pageWidth}
                      pageHeight={pageHeight}
                    />
                  </div>

                  {/* P5: Sunday Sermon Notes */}
                  <div id="modal-page-sermon" className="relative group">
                    <div className="absolute -top-6 left-0 text-[11px] font-bold text-blue-300 bg-slate-900/90 px-3 py-0.5 rounded-t-lg border border-white/10">
                      P5. {selectedYear}년 {selectedMonth}월 주일 설교 요약표
                    </div>
                    <SundaySermonComponent
                      year={selectedYear}
                      month={selectedMonth}
                      monthName={monthName}
                      themeColor={activeColor}
                      pageWidth={pageWidth}
                      pageHeight={pageHeight}
                    />
                  </div>

                  {/* P5-2: Sunday Sermon Deep Journal (Draft 1) */}
                  <div id="modal-page-sermondeep" className="relative group">
                    <div className="absolute -top-6 left-0 text-[11px] font-bold text-amber-300 bg-slate-900/90 px-3 py-0.5 rounded-t-lg border border-white/10">
                      P5-2. {selectedYear}년 {selectedMonth}월 주일 심층 묵상 바인더 (Draft 1)
                    </div>
                    <SundaySermonDeepComponent
                      year={selectedYear}
                      month={selectedMonth}
                      sundayNo={1}
                      dateStr="08/02"
                      monthName={monthName}
                      themeColor={activeColor}
                      pageWidth={pageWidth}
                      pageHeight={pageHeight}
                    />
                  </div>

                  {/* P6: Bible Reading Journey Map */}
                  <div id="modal-page-biblemap" className="relative group">
                    <div className="absolute -top-6 left-0 text-[11px] font-bold text-emerald-300 bg-slate-900/90 px-3 py-0.5 rounded-t-lg border border-white/10">
                      P6. {selectedYear}년 {selectedMonth}월 성경 66권 통독 맵
                    </div>
                    <BibleMapComponent
                      year={selectedYear}
                      monthName={monthName}
                      themeColor={activeColor}
                      pageWidth={pageWidth}
                      pageHeight={pageHeight}
                    />
                  </div>

                  {/* Pages 3~39: 5 Weeks & 31 Days */}
                  {Array.from({ length: totalDays }, (_, i) => i + 1).map((d) => {
                    const currentWeek = Math.floor((d - 1) / 7) + 1
                    const isWeekStart = (d - 1) % 7 === 0

                    return (
                      <React.Fragment key={d}>
                        {isWeekStart && (() => {
                          const wData = getWeekData(currentWeek)
                          return (
                            <div id={`modal-page-week-${currentWeek}`} className="relative group mt-6">
                              <div className="absolute -top-6 left-0 text-[11px] font-bold text-indigo-300 bg-slate-900/90 px-3 py-0.5 rounded-t-lg border border-white/10 flex items-center gap-2">
                                <span>{selectedMonth}월 {currentWeek}주차 주간 계획</span>
                                <span className="text-amber-300 font-mono">({wData.dateRangeText})</span>
                              </div>
                              <WeeklyComponent
                                weekNum={wData.weekNum}
                                weekLabel={wData.weekLabel}
                                dateRangeText={wData.dateRangeText}
                                daysInWeek={wData.daysInWeek}
                                monthName={monthName}
                                themeColor={activeColor}
                                pageWidth={pageWidth}
                                pageHeight={pageHeight}
                              />
                            </div>
                          )
                        })()}
                        <div id={`modal-page-day-${d}`} className="relative group">
                          <div className="absolute -top-6 left-0 text-[11px] font-bold text-slate-300 bg-slate-900/90 px-3 py-0.5 rounded-t-lg border border-white/10 flex items-center gap-2">
                            <span>{selectedMonth}월 {d}일 데일리 다이어리 & 기도제목</span>
                            {(() => {
                              const dayNamesShort = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
                              const dateObj = new Date(selectedYear, selectedMonth - 1, d)
                              const realDayName = dayNamesShort[dateObj.getDay()]
                              const isSun = realDayName === 'SUN'
                              return (
                                <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                                  isSun ? 'bg-amber-400 text-slate-950 shadow-xs' : 'bg-slate-800 text-slate-300'
                                }`}>
                                  {d < 10 ? `0${d}` : d} {realDayName} {isSun ? ' (주일)' : ''}
                                </span>
                              )
                            })()}
                          </div>
                          {(() => {
                            const dayNamesShort = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
                            const dateObj = new Date(selectedYear, selectedMonth - 1, d)
                            const realDayName = dayNamesShort[dateObj.getDay()]
                            return (
                              <DailyComponent
                                dateLabel={`${String(d).padStart(2, '0')} ${realDayName}`}
                                dayNum={d}
                                dayName={realDayName}
                                monthName={monthName}
                                yearLabel={String(selectedYear)}
                                themeColor={activeColor}
                                pageWidth={pageWidth}
                                pageHeight={pageHeight}
                                activeWeek={`W${currentWeek}`}
                              />
                            )
                          })()}
                        </div>
                      </React.Fragment>
                    )
                  })}

                  {/* P-Last: End-of-Month Letter to God */}
                  <div id="modal-page-letter" className="relative group mt-6">
                    <div className="absolute -top-6 left-0 text-[11px] font-bold text-rose-300 bg-slate-900/90 px-3 py-0.5 rounded-t-lg border border-white/10">
                      P-Last. {selectedYear}년 {selectedMonth}월 하나님께 드리는 월말 편지 & 감사 회고
                    </div>
                    <MonthlyLetterComponent
                      year={selectedYear}
                      monthName={monthName}
                      themeColor={activeColor}
                      pageWidth={pageWidth}
                      pageHeight={pageHeight}
                    />
                  </div>
                </div>
              ) : (
                /* ★ 단일 페이지 뷰 모드 */
                <div
                  className="transition-all duration-200 origin-top my-4"
                  style={{
                    transform: `scale(${zoomScale})`,
                    transformOrigin: 'top center',
                  }}
                >
                  {modalActiveTab === 'calendar' && (
                    <CalendarComponent
                      year={selectedYear}
                      month={selectedMonth}
                      monthName={monthName}
                      themeColor={activeColor}
                      pageWidth={pageWidth}
                      pageHeight={pageHeight}
                    />
                  )}
                  {modalActiveTab === 'overview' && (
                    <OverviewComponent
                      year={selectedYear}
                      monthName={monthName}
                      themeColor={activeColor}
                      pageWidth={pageWidth}
                      pageHeight={pageHeight}
                    />
                  )}
                  {modalActiveTab === 'prayer' && (
                    <PrayerComponent
                      year={selectedYear}
                      monthName={monthName}
                      themeColor={activeColor}
                      pageWidth={pageWidth}
                      pageHeight={pageHeight}
                    />
                  )}
                  {modalActiveTab === 'scripture' && (
                    <ScriptureArtComponent
                      year={selectedYear}
                      monthName={monthName}
                      themeColor={activeColor}
                      pageWidth={pageWidth}
                      pageHeight={pageHeight}
                    />
                  )}
                  {modalActiveTab === 'sermon' && (
                    <SundaySermonComponent
                      year={selectedYear}
                      month={selectedMonth}
                      monthName={monthName}
                      themeColor={activeColor}
                      pageWidth={pageWidth}
                      pageHeight={pageHeight}
                    />
                  )}
                  {modalActiveTab === 'sermondeep' && (
                    <SundaySermonDeepComponent
                      year={selectedYear}
                      month={selectedMonth}
                      sundayNo={1}
                      dateStr="08/02"
                      monthName={monthName}
                      themeColor={activeColor}
                      pageWidth={pageWidth}
                      pageHeight={pageHeight}
                    />
                  )}
                  {modalActiveTab === 'biblemap' && (
                    <BibleMapComponent
                      year={selectedYear}
                      monthName={monthName}
                      themeColor={activeColor}
                      pageWidth={pageWidth}
                      pageHeight={pageHeight}
                    />
                  )}
                  {modalActiveTab === 'letter' && (
                    <MonthlyLetterComponent
                      year={selectedYear}
                      monthName={monthName}
                      themeColor={activeColor}
                      pageWidth={pageWidth}
                      pageHeight={pageHeight}
                    />
                  )}
                  {modalActiveTab === 'weekly' && (() => {
                    const w1Data = getWeekData(1)
                    return (
                      <WeeklyComponent
                        weekNum={w1Data.weekNum}
                        weekLabel={w1Data.weekLabel}
                        dateRangeText={w1Data.dateRangeText}
                        daysInWeek={w1Data.daysInWeek}
                        monthName={monthName}
                        themeColor={activeColor}
                        pageWidth={pageWidth}
                        pageHeight={pageHeight}
                      />
                    )
                  })()}
                  {modalActiveTab === 'daily' && (() => {
                    const dayNamesShort = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
                    const dateObj = new Date(selectedYear, selectedMonth - 1, modalDayNum)
                    const realDayName = dayNamesShort[dateObj.getDay()]
                    return (
                      <DailyComponent
                        dateLabel={`${String(modalDayNum).padStart(2, '0')} ${realDayName}`}
                        dayNum={modalDayNum}
                        dayName={realDayName}
                        monthName={monthName}
                        yearLabel={String(selectedYear)}
                        themeColor={activeColor}
                        pageWidth={pageWidth}
                        pageHeight={pageHeight}
                        activeWeek={`W${Math.floor((modalDayNum - 1) / 7) + 1}`}
                      />
                    )
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hidden Full PDF Assembly Render Container for PDF Download */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0, opacity: 1, zIndex: -1 }}>
        <div ref={pdfContainerRef}>
          {/* Page 1: Monthly Calendar */}
          <CalendarComponent
            year={selectedYear}
            month={selectedMonth}
            monthName={monthName}
            themeColor={activeColor}
            pageWidth={pageWidth}
            pageHeight={pageHeight}
          />
          {/* Page 2: Monthly Overview */}
          <OverviewComponent
            year={selectedYear}
            monthName={monthName}
            themeColor={activeColor}
            pageWidth={pageWidth}
            pageHeight={pageHeight}
          />
          {/* Pages 3~39: 5 Weeks & 31 Daily Pages */}
          {Array.from({ length: totalDays }, (_, i) => i + 1).map((d) => {
            const currentWeek = Math.floor((d - 1) / 7) + 1
            const isWeekStart = (d - 1) % 7 === 0

            return (
              <React.Fragment key={d}>
                {isWeekStart && (
                  <WeeklyComponent
                    weekNum={currentWeek}
                    weekLabel={`WEEK ${31 + currentWeek}`}
                    monthName={monthName}
                    themeColor={activeColor}
                    pageWidth={pageWidth}
                    pageHeight={pageHeight}
                  />
                )}
                <DailyComponent
                  dateLabel={`${String(d).padStart(2, '0')} DAY`}
                  dayNum={d}
                  dayName={d === 1 ? 'SAT' : (d % 7 === 1 ? 'SUN' : 'DAY')}
                  monthName={monthName}
                  yearLabel={String(selectedYear)}
                  themeColor={activeColor}
                  pageWidth={pageWidth}
                  pageHeight={pageHeight}
                  activeWeek={`W${currentWeek}`}
                />
              </React.Fragment>
            )
          })}
        </div>
      </div>
    </div>
  )
}
