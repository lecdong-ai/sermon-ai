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

// 신규 일반인용 6종 컴포넌트 임포트 (가로/세로)
import QtHabitTrackerPage from '@/components/advanced/QtHabitTrackerPage'
import QtHabitTrackerPortrait from '@/components/advanced/portrait/QtHabitTrackerPortrait'
import QtGratitudeJournalPage from '@/components/advanced/QtGratitudeJournalPage'
import QtGratitudeJournalPortrait from '@/components/advanced/portrait/QtGratitudeJournalPortrait'
import QtQuoteCopyingPage from '@/components/advanced/QtQuoteCopyingPage'
import QtQuoteCopyingPortrait from '@/components/advanced/portrait/QtQuoteCopyingPortrait'
import QtBudgetTrackerPage from '@/components/advanced/QtBudgetTrackerPage'
import QtBudgetTrackerPortrait from '@/components/advanced/portrait/QtBudgetTrackerPortrait'
import QtBudgetTrackerPage2 from '@/components/advanced/QtBudgetTrackerPage2'
import QtBudgetTrackerPortrait2 from '@/components/advanced/portrait/QtBudgetTrackerPortrait2'
import QtCultureLogPage from '@/components/advanced/QtCultureLogPage'
import QtCultureLogPortrait from '@/components/advanced/portrait/QtCultureLogPortrait'
import QtCultureLogPage2 from '@/components/advanced/QtCultureLogPage2'
import QtCultureLogPortrait2 from '@/components/advanced/portrait/QtCultureLogPortrait2'
import QtKptReviewPage from '@/components/advanced/QtKptReviewPage'
import QtKptReviewPortrait from '@/components/advanced/portrait/QtKptReviewPortrait'
import QtKptReviewPage2 from '@/components/advanced/QtKptReviewPage2'
import QtKptReviewPortrait2 from '@/components/advanced/portrait/QtKptReviewPortrait2'

// 신규 일반인용 선데이 리셋 컴포넌트 임포트 (가로/세로)
import QtSundayGeneralPage from '@/components/advanced/QtSundayGeneralPage'
import QtSundayGeneralPortrait from '@/components/advanced/portrait/QtSundayGeneralPortrait'

// 추가 감동 6종 컴포넌트 임포트 (가로/세로)
import QtBucketTravelPage from '@/components/advanced/QtBucketTravelPage'
import QtBucketTravelPortrait from '@/components/advanced/portrait/QtBucketTravelPortrait'
import QtWellnessMoodPage from '@/components/advanced/QtWellnessMoodPage'
import QtWellnessMoodPortrait from '@/components/advanced/portrait/QtWellnessMoodPortrait'
import QtHundredGoalPage from '@/components/advanced/QtHundredGoalPage'
import QtHundredGoalPortrait from '@/components/advanced/portrait/QtHundredGoalPortrait'
import QtHundredGoalPage2 from '@/components/advanced/QtHundredGoalPage2'
import QtHundredGoalPortrait2 from '@/components/advanced/portrait/QtHundredGoalPortrait2'

import QtIntercessoryPrayerPage from '@/components/advanced/QtIntercessoryPrayerPage'
import QtIntercessoryPrayerPortrait from '@/components/advanced/portrait/QtIntercessoryPrayerPortrait'
import QtSoapJournalPage from '@/components/advanced/QtSoapJournalPage'
import QtSoapJournalPortrait from '@/components/advanced/portrait/QtSoapJournalPortrait'
import QtFruitsTrackerPage from '@/components/advanced/QtFruitsTrackerPage'
import QtFruitsTrackerPortrait from '@/components/advanced/portrait/QtFruitsTrackerPortrait'

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

export type PreviewTabType =
  | 'calendar' | 'overview' | 'weekly' | 'daily'
  | 'habit' | 'gratitude' | 'quote' | 'budget' | 'budget2' | 'culture' | 'culture2' | 'kpt' | 'kpt2' | 'sundaygeneral'
  | 'buckettravel' | 'wellnessmood' | 'hundredgoal' | 'hundredgoal2'
  | 'prayer' | 'scripture' | 'sermon' | 'sermondeep' | 'biblemap' | 'letter'
  | 'intercessory' | 'soapjournal' | 'fruitstracker'

export default function DiaryPage() {
  const [selectedYear, setSelectedYear] = useState(2026)
  const [selectedMonth, setSelectedMonth] = useState(8) // 기본 8월
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0])
  const [selectedSizeOption, setSelectedSizeOption] = useState('A4Landscape')
  const [isEcoPrint, setIsEcoPrint] = useState(false)
  const [previewTab, setPreviewTab] = useState<PreviewTabType>('habit')
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'general' | 'church' | 'basic'>('all')
  const [activeDayNum, setActiveDayNum] = useState(1)
  const [isPdfGenerating, setIsPdfGenerating] = useState(false)

  // ★ PDF 제작 시 포함할 내지 선택 (맞춤형 제작 체계)
  const [selectedPages, setSelectedPages] = useState<Record<string, boolean>>({
    calendar: true,
    overview: true,
    weekly: true,
    daily: true,
    habit: true,
    gratitude: true,
    quote: true,
    budget: true,
    budget2: true,
    culture: true,
    culture2: true,
    kpt: true,
    kpt2: true,
    sundaygeneral: true,
    buckettravel: true,
    wellnessmood: true,
    hundredgoal: true,
    hundredgoal2: true,
    prayer: true,
    scripture: true,
    sermon: true,
    sermondeep: false,
    biblemap: true,
    letter: true,
    intercessory: true,
    soapjournal: true,
    fruitstracker: true,
  })

  // ★ 팝업 뷰어 & 스크롤 모드 상태 변수
  const [isFullscreenModalOpen, setIsFullscreenModalOpen] = useState(false)
  const [modalViewMode, setModalViewMode] = useState<'single' | 'continuous'>('continuous')
  const [zoomScale, setZoomScale] = useState(1.0)
  const [modalActiveTab, setModalActiveTab] = useState<PreviewTabType>('calendar')
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

  // 신규 컴포넌트 가로/세로 매핑
  const HabitComponent = isLandscape ? QtHabitTrackerPage : QtHabitTrackerPortrait
  const GratitudeComponent = isLandscape ? QtGratitudeJournalPage : QtGratitudeJournalPortrait
  const QuoteComponent = isLandscape ? QtQuoteCopyingPage : QtQuoteCopyingPortrait
  const BudgetComponent = isLandscape ? QtBudgetTrackerPage : QtBudgetTrackerPortrait
  const Budget2Component = isLandscape ? QtBudgetTrackerPage2 : QtBudgetTrackerPortrait2
  const CultureComponent = isLandscape ? QtCultureLogPage : QtCultureLogPortrait
  const Culture2Component = isLandscape ? QtCultureLogPage2 : QtCultureLogPortrait2
  const KptComponent = isLandscape ? QtKptReviewPage : QtKptReviewPortrait
  const Kpt2Component = isLandscape ? QtKptReviewPage2 : QtKptReviewPortrait2
  const SundayGeneralComponent = isLandscape ? QtSundayGeneralPage : QtSundayGeneralPortrait

  const BucketTravelComponent = isLandscape ? QtBucketTravelPage : QtBucketTravelPortrait
  const WellnessMoodComponent = isLandscape ? QtWellnessMoodPage : QtWellnessMoodPortrait
  const HundredGoalComponent = isLandscape ? QtHundredGoalPage : QtHundredGoalPortrait
  const HundredGoal2Component = isLandscape ? QtHundredGoalPage2 : QtHundredGoalPortrait2

  const IntercessoryComponent = isLandscape ? QtIntercessoryPrayerPage : QtIntercessoryPrayerPortrait
  const SoapJournalComponent = isLandscape ? QtSoapJournalPage : QtSoapJournalPortrait
  const FruitsTrackerComponent = isLandscape ? QtFruitsTrackerPage : QtFruitsTrackerPortrait

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

  // 1-Click Preset Helpers
  const applyPreset = (presetType: 'general' | 'church' | 'basic' | 'all') => {
    if (presetType === 'general') {
      setSelectedPages({
        calendar: true,
        overview: true,
        weekly: true,
        daily: true,
        habit: true,
        gratitude: true,
        quote: true,
        budget: true,
        budget2: true,
        culture: true,
        culture2: true,
        kpt: true,
        kpt2: true,
        sundaygeneral: true,
        buckettravel: true,
        wellnessmood: true,
        hundredgoal: true,
        hundredgoal2: true,
        prayer: false,
        scripture: false,
        sermon: false,
        sermondeep: false,
        biblemap: false,
        letter: false,
        intercessory: false,
        soapjournal: false,
        fruitstracker: false,
      })
      setCategoryFilter('general')
      setPreviewTab('buckettravel')
    } else if (presetType === 'church') {
      setSelectedPages({
        calendar: true,
        overview: true,
        weekly: true,
        daily: true,
        habit: false,
        gratitude: false,
        quote: false,
        budget: false,
        budget2: false,
        culture: false,
        culture2: false,
        kpt: false,
        kpt2: false,
        sundaygeneral: false,
        buckettravel: false,
        wellnessmood: false,
        hundredgoal: false,
        hundredgoal2: false,
        prayer: true,
        scripture: true,
        sermon: true,
        sermondeep: true,
        biblemap: true,
        letter: true,
        intercessory: true,
        soapjournal: true,
        fruitstracker: true,
      })
      setCategoryFilter('church')
      setPreviewTab('intercessory')
    } else if (presetType === 'basic') {
      setSelectedPages({
        calendar: true,
        overview: true,
        weekly: true,
        daily: true,
        habit: false,
        gratitude: false,
        quote: false,
        budget: false,
        budget2: false,
        culture: false,
        culture2: false,
        kpt: false,
        kpt2: false,
        sundaygeneral: false,
        buckettravel: false,
        wellnessmood: false,
        hundredgoal: false,
        hundredgoal2: false,
        prayer: false,
        scripture: false,
        sermon: false,
        sermondeep: false,
        biblemap: false,
        letter: false,
        intercessory: false,
        soapjournal: false,
        fruitstracker: false,
      })
      setCategoryFilter('basic')
      setPreviewTab('calendar')
    } else {
      setSelectedPages({
        calendar: true,
        overview: true,
        weekly: true,
        daily: true,
        habit: true,
        gratitude: true,
        quote: true,
        budget: true,
        budget2: true,
        culture: true,
        culture2: true,
        kpt: true,
        kpt2: true,
        sundaygeneral: true,
        buckettravel: true,
        wellnessmood: true,
        hundredgoal: true,
        hundredgoal2: true,
        prayer: true,
        scripture: true,
        sermon: true,
        sermondeep: true,
        biblemap: true,
        letter: true,
        intercessory: true,
        soapjournal: true,
        fruitstracker: true,
      })
      setCategoryFilter('all')
      setPreviewTab('buckettravel')
    }
  }

  const activeSelectedCount = Object.values(selectedPages).filter(Boolean).length
  const estimatedPdfPages = (selectedPages.weekly && selectedPages.daily ? totalDays + 5 : 0) + activeSelectedCount - (selectedPages.weekly && selectedPages.daily ? 2 : 0)

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* 1. Glassmorphic Top Studio Bar */}
      <header className="sticky top-0 z-40 px-6 py-3.5 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl flex items-center justify-between shadow-2xl">
        <div className="flex items-center space-x-4">
          <Link
            href="/advanced/qt"
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-medium group"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-indigo-400 group-hover:-translate-x-0.5 transition-transform" />
            고급 큐티 스튜디오
          </Link>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-amber-500 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-indigo-300" />
              </div>
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                커스텀 다이어리 제작 스튜디오
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  v2.5 Studio Edition
                </span>
              </h1>
              <p className="text-[10px] text-slate-400 font-medium">
                {selectedYear}년 {selectedMonth}월 · {sizeLabel} · 선택된 내지 {activeSelectedCount}종 (예상 {estimatedPdfPages}p)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* 전체화면 팝업 뷰어 버튼 */}
          <button
            onClick={() => setIsFullscreenModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold transition-all shadow-md hover:shadow-amber-500/10"
          >
            <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
            전체화면 팝업 뷰어
          </button>

          {/* PDF 다운로드 버튼 */}
          <button
            onClick={handleDownloadFullPdf}
            disabled={isPdfGenerating}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_auto] hover:bg-right transition-all duration-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 border border-indigo-300/30 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {isPdfGenerating ? 'PDF 제작 중...' : `맞춤 다이어리 PDF 다운로드 (${estimatedPdfPages}p)`}
          </button>
        </div>
      </header>

      {/* 2. Main Workspace Layout */}
      <div className="flex-1 grid grid-cols-12 gap-6 p-6 max-w-7xl mx-auto w-full">
        {/* Left Options Control Studio (4 cols) */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          
          {/* Module 1: 1-Click Presets */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 space-y-2.5 backdrop-blur-md shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                원클릭 구성 프리셋
              </h3>
              <span className="text-[10px] font-medium text-slate-400">내지 세트 자동 설정</span>
            </div>
            
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <button
                onClick={() => applyPreset('general')}
                className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold transition-all text-left flex flex-col gap-0.5 group"
              >
                <div className="flex items-center justify-between">
                  <span>🌿 일반인 갓생 팩</span>
                  <span className="text-[9px] opacity-70">18종</span>
                </div>
                <span className="text-[9.5px] font-normal text-slate-400">기본4종 + 일반인14종</span>
              </button>

              <button
                onClick={() => applyPreset('church')}
                className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold transition-all text-left flex flex-col gap-0.5 group"
              >
                <div className="flex items-center justify-between">
                  <span>⛪ 크리스천 묵상 팩</span>
                  <span className="text-[9px] opacity-70">13종</span>
                </div>
                <span className="text-[9.5px] font-normal text-slate-400">기본4종 + 크리스천9종</span>
              </button>

              <button
                onClick={() => applyPreset('basic')}
                className="p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 font-bold transition-all text-left flex flex-col gap-0.5 group"
              >
                <div className="flex items-center justify-between">
                  <span>📅 미니멀 기본 팩</span>
                  <span className="text-[9px] opacity-70">4종</span>
                </div>
                <span className="text-[9.5px] font-normal text-slate-400">달력/개요/주간/데일리만</span>
              </button>

              <button
                onClick={() => applyPreset('all')}
                className="p-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 font-bold transition-all text-left flex flex-col gap-0.5 group"
              >
                <div className="flex items-center justify-between">
                  <span>✨ 전체 수집 팩</span>
                  <span className="text-[9px] opacity-70">27종</span>
                </div>
                <span className="text-[9.5px] font-normal text-slate-400">스튜디오 전체 내지 포함</span>
              </button>
            </div>
          </div>

          {/* Module 2: Year, Month, Theme & Paper Controls */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 space-y-3.5 backdrop-blur-md shadow-2xl">
            {/* Year & Month Picker */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <CalendarIcon className="w-3.5 h-3.5 text-indigo-400" />
                  발행 연월 ({selectedYear}년 {selectedMonth}월)
                </span>
                <div className="flex items-center gap-1 text-[11px]">
                  {[2025, 2026, 2027, 2028].map((yr) => (
                    <button
                      key={yr}
                      onClick={() => setSelectedYear(yr)}
                      className={`px-2 py-0.5 rounded-lg font-bold border transition-all ${
                        selectedYear === yr
                          ? 'bg-indigo-600 border-indigo-400 text-white'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {yr}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-6 gap-1">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setSelectedMonth(m)
                      setActiveDayNum(1)
                    }}
                    className={`py-1 rounded-lg text-xs font-bold border transition-all ${
                      selectedMonth === m
                        ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-md'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/10'
                    }`}
                  >
                    {m}월
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-white/10" />

            {/* Pastel Palette Selector */}
            <div>
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-2">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                파스텔 수채화 테마
              </span>
              <div className="grid grid-cols-5 gap-1.5">
                {THEMES.map((t) => {
                  const isSel = selectedTheme.id === t.id
                  return (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTheme(t)}
                      className={`p-1.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                        isSel
                          ? 'bg-indigo-600/30 border-indigo-400 ring-2 ring-indigo-400/40'
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                      title={t.name}
                    >
                      <div className="w-4 h-4 rounded-full border border-white/30" style={{ backgroundColor: t.color }} />
                      <span className="text-[9px] font-medium text-slate-300 truncate w-full text-center">
                        {t.name.split(' ')[0]}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="h-px bg-white/10" />

            {/* Paper Size Options */}
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                용지 규격:
              </span>
              <div className="flex items-center gap-1">
                {Object.keys(PAGE_SIZES).map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSizeOption(sz)}
                    className={`px-2 py-1 rounded-lg font-bold border text-[11px] transition-all ${
                      selectedSizeOption === sz
                        ? 'bg-indigo-600 border-indigo-400 text-white'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    {PAGE_SIZES[sz]?.label?.split(' (')[0] || sz}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Module 3: Preview Form Selector with Categories */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 space-y-3 backdrop-blur-md shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                미리보기 양식 선택
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">27 Formats</span>
            </div>

            {/* Category Filter Pills */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950/80 rounded-xl border border-white/10 text-[10px] font-bold">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`py-1 rounded-lg transition-all ${
                  categoryFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                전체 (27)
              </button>
              <button
                onClick={() => setCategoryFilter('general')}
                className={`py-1 rounded-lg transition-all ${
                  categoryFilter === 'general' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                🌿 일반
              </button>
              <button
                onClick={() => setCategoryFilter('church')}
                className={`py-1 rounded-lg transition-all ${
                  categoryFilter === 'church' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                ⛪ 교회
              </button>
              <button
                onClick={() => setCategoryFilter('basic')}
                className={`py-1 rounded-lg transition-all ${
                  categoryFilter === 'basic' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                📅 기본
              </button>
            </div>

            {/* Template Buttons Grid */}
            <div className="grid grid-cols-2 gap-1.5 max-h-60 overflow-y-auto pr-1">
              {/* 1. 일반 6종 */}
              {(categoryFilter === 'all' || categoryFilter === 'general') && (
                <>
                  <button
                    onClick={() => setPreviewTab('habit')}
                    className={`p-2 rounded-xl border text-[11px] font-bold transition-all text-left flex items-center justify-between ${
                      previewTab === 'habit'
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 ring-1 ring-emerald-400/50'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <span>🌱 30일 해빗</span>
                    <span className="text-[8px] px-1 bg-emerald-500/30 text-emerald-300 rounded font-normal">일반</span>
                  </button>
                  <button
                    onClick={() => setPreviewTab('gratitude')}
                    className={`p-2 rounded-xl border text-[11px] font-bold transition-all text-left flex items-center justify-between ${
                      previewTab === 'gratitude'
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-1 ring-amber-400/50'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <span>☀️ 감사 & 확언</span>
                    <span className="text-[8px] px-1 bg-amber-500/30 text-amber-300 rounded font-normal">일반</span>
                  </button>
                  <button
                    onClick={() => setPreviewTab('quote')}
                    className={`p-2 rounded-xl border text-[11px] font-bold transition-all text-left flex items-center justify-between ${
                      previewTab === 'quote'
                        ? 'bg-purple-500/20 border-purple-400 text-purple-300 ring-1 ring-purple-400/50'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <span>📖 명언 & 책 필사</span>
                    <span className="text-[8px] px-1 bg-purple-500/30 text-purple-300 rounded font-normal">일반</span>
                  </button>
                  <button
                    onClick={() => setPreviewTab('budget')}
                    className={`p-2 rounded-xl border text-[11px] font-bold transition-all text-left flex items-center justify-between ${
                      previewTab === 'budget'
                        ? 'bg-blue-500/20 border-blue-400 text-blue-300 ring-1 ring-blue-400/50'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <span>💰 가계부① 예산&자산</span>
                    <span className="text-[8px] px-1 bg-blue-500/30 text-blue-300 rounded font-normal">일반</span>
                  </button>
                  <button
                    onClick={() => setPreviewTab('budget2')}
                    className={`p-2 rounded-xl border text-[11px] font-bold transition-all text-left flex items-center justify-between ${
                      previewTab === 'budget2'
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 ring-1 ring-emerald-400/50'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <span>💳 가계부② 데일리</span>
                    <span className="text-[8px] px-1 bg-emerald-500/30 text-emerald-300 rounded font-normal">일반</span>
                  </button>
                  <button
                    onClick={() => setPreviewTab('culture')}
                    className={`p-2 rounded-xl border text-[11px] font-bold transition-all text-left flex items-center justify-between ${
                      previewTab === 'culture'
                        ? 'bg-rose-500/20 border-rose-400 text-rose-300 ring-1 ring-rose-400/50'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <span>🎬 문화① 메인</span>
                    <span className="text-[8px] px-1 bg-rose-500/30 text-rose-300 rounded font-normal">일반</span>
                  </button>
                  <button
                    onClick={() => setPreviewTab('culture2')}
                    className={`p-2 rounded-xl border text-[11px] font-bold transition-all text-left flex items-center justify-between ${
                      previewTab === 'culture2'
                        ? 'bg-rose-500/20 border-rose-400 text-rose-300 ring-1 ring-rose-400/50'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <span>🎞️ 문화② 컬렉션</span>
                    <span className="text-[8px] px-1 bg-rose-500/30 text-rose-300 rounded font-normal">일반</span>
                  </button>
                  <button
                    onClick={() => setPreviewTab('kpt')}
                    className={`p-2 rounded-xl border text-[11px] font-bold transition-all text-left flex items-center justify-between ${
                      previewTab === 'kpt'
                        ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300 ring-1 ring-indigo-400/50'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <span>🔄 KPT① 마스터</span>
                    <span className="text-[8px] px-1 bg-indigo-500/30 text-indigo-300 rounded font-normal">일반</span>
                  </button>
                  <button
                    onClick={() => setPreviewTab('kpt2')}
                    className={`p-2 rounded-xl border text-[11px] font-bold transition-all text-left flex items-center justify-between ${
                      previewTab === 'kpt2'
                        ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300 ring-1 ring-indigo-400/50'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <span>⚡ KPT② 4주차 실행</span>
                    <span className="text-[8px] px-1 bg-indigo-500/30 text-indigo-300 rounded font-normal">일반</span>
                  </button>
                  <button
                    onClick={() => setPreviewTab('sundaygeneral')}
                    className={`p-2 rounded-xl border text-[11px] font-bold transition-all text-left flex items-center justify-between ${
                      previewTab === 'sundaygeneral'
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 ring-1 ring-emerald-400/50'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <span>🌿 선데이 리셋</span>
                    <span className="text-[8px] px-1 bg-emerald-500/30 text-emerald-300 rounded font-normal">일반</span>
                  </button>
                  <button
                    onClick={() => setPreviewTab('buckettravel')}
                    className={`p-2 rounded-xl border text-[11px] font-bold transition-all text-left flex items-center justify-between ${
                      previewTab === 'buckettravel'
                        ? 'bg-rose-500/20 border-rose-400 text-rose-300 ring-1 ring-rose-400/50'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <span>✈️ 버킷 & 트래블</span>
                    <span className="text-[8px] px-1 bg-rose-500/30 text-rose-300 rounded font-normal">일반</span>
                  </button>
                  <button
                    onClick={() => setPreviewTab('wellnessmood')}
                    className={`p-2 rounded-xl border text-[11px] font-bold transition-all text-left flex items-center justify-between ${
                      previewTab === 'wellnessmood'
                        ? 'bg-teal-500/20 border-teal-400 text-teal-300 ring-1 ring-teal-400/50'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <span>🥗 웰니스 & 감정</span>
                    <span className="text-[8px] px-1 bg-teal-500/30 text-teal-300 rounded font-normal">일반</span>
                  </button>
                  <button
                    onClick={() => setPreviewTab('hundredgoal')}
                    className={`p-2 rounded-xl border text-[11px] font-bold transition-all text-left flex items-center justify-between ${
                      previewTab === 'hundredgoal'
                        ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300 ring-1 ring-indigo-400/50'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <span>🎯 100일① 전반전</span>
                    <span className="text-[8px] px-1 bg-indigo-500/30 text-indigo-300 rounded font-normal">일반</span>
                  </button>
                  <button
                    onClick={() => setPreviewTab('hundredgoal2')}
                    className={`p-2 rounded-xl border text-[11px] font-bold transition-all text-left flex items-center justify-between ${
                      previewTab === 'hundredgoal2'
                        ? 'bg-rose-500/20 border-rose-400 text-rose-300 ring-1 ring-rose-400/50'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <span>🏆 100일② 완주전</span>
                    <span className="text-[8px] px-1 bg-rose-500/30 text-rose-300 rounded font-normal">일반</span>
                  </button>
                </>
              )}

              {/* 2. 교회 9종 */}
              {(categoryFilter === 'all' || categoryFilter === 'church') && (
                <>
                  <button
                    onClick={() => setPreviewTab('prayer')}
                    className={`p-2 rounded-xl border text-[11px] font-bold transition-all text-left flex items-center justify-between ${
                      previewTab === 'prayer'
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    <span>🙏 기도 & 습관</span>
                    <span className="text-[8px] px-1 bg-amber-500/20 text-amber-400 rounded font-normal">교회</span>
                  </button>
                  <button
                    onClick={() => setPreviewTab('scripture')}
                    className={`p-2 rounded-xl border text-[11px] font-bold transition-all text-left flex items-center justify-between ${
                      previewTab === 'scripture'
                        ? 'bg-purple-500/20 border-purple-400 text-purple-300'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    <span>📜 암송 필사</span>
                    <span className="text-[8px] px-1 bg-purple-500/20 text-purple-400 rounded font-normal">교회</span>
                  </button>
                  <button
                    onClick={() => setPreviewTab('sermon')}
                    className={`p-2 rounded-xl border text-[11px] font-bold transition-all text-left flex items-center justify-between ${
                      previewTab === 'sermon'
                        ? 'bg-blue-500/20 border-blue-400 text-blue-300'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    <span>🏛️ 주일 설교(월간)</span>
                    <span className="text-[8px] px-1 bg-blue-500/20 text-blue-400 rounded font-normal">교회</span>
                  </button>
                  <button
                    onClick={() => setPreviewTab('sermondeep')}
                    className={`p-2 rounded-xl border text-[11px] font-bold transition-all text-left flex items-center justify-between ${
                      previewTab === 'sermondeep'
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    <span>🌟 주일 심층 노트</span>
                    <span className="text-[8px] px-1 bg-amber-500/20 text-amber-400 rounded font-normal">교회</span>
                  </button>
                  <button
                    onClick={() => setPreviewTab('biblemap')}
                    className={`p-2 rounded-xl border text-[11px] font-bold transition-all text-left flex items-center justify-between ${
                      previewTab === 'biblemap'
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    <span>🕊️ 66권 통독</span>
                    <span className="text-[8px] px-1 bg-emerald-500/20 text-emerald-400 rounded font-normal">교회</span>
                  </button>
                  <button
                    onClick={() => setPreviewTab('letter')}
                    className={`p-2 rounded-xl border text-[11px] font-bold transition-all text-left flex items-center justify-between ${
                      previewTab === 'letter'
                        ? 'bg-rose-500/20 border-rose-400 text-rose-300'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    <span>💌 월말 편지</span>
                    <span className="text-[8px] px-1 bg-rose-500/20 text-rose-400 rounded font-normal">교회</span>
                  </button>
                  <button
                    onClick={() => setPreviewTab('intercessory')}
                    className={`p-2 rounded-xl border text-[11px] font-bold transition-all text-left flex items-center justify-between ${
                      previewTab === 'intercessory'
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    <span>💖 중보기도 카드</span>
                    <span className="text-[8px] px-1 bg-amber-500/20 text-amber-400 rounded font-normal">교회</span>
                  </button>
                  <button
                    onClick={() => setPreviewTab('soapjournal')}
                    className={`p-2 rounded-xl border text-[11px] font-bold transition-all text-left flex items-center justify-between ${
                      previewTab === 'soapjournal'
                        ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    <span>📖 SOAP 묵상</span>
                    <span className="text-[8px] px-1 bg-indigo-500/20 text-indigo-400 rounded font-normal">교회</span>
                  </button>
                  <button
                    onClick={() => setPreviewTab('fruitstracker')}
                    className={`p-2 rounded-xl border text-[11px] font-bold transition-all text-left flex items-center justify-between ${
                      previewTab === 'fruitstracker'
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    <span>🌱 성령의 열매</span>
                    <span className="text-[8px] px-1 bg-emerald-500/20 text-emerald-400 rounded font-normal">교회</span>
                  </button>
                </>
              )}

              {/* 3. 기본 4종 */}
              {(categoryFilter === 'all' || categoryFilter === 'basic') && (
                <>
                  <button
                    onClick={() => setPreviewTab('calendar')}
                    className={`p-2 rounded-xl border text-[11px] font-bold transition-all text-left flex items-center justify-between ${
                      previewTab === 'calendar'
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    <span>📅 월간 달력</span>
                    <span className="text-[8px] px-1 bg-slate-700 text-slate-300 rounded font-normal">기본</span>
                  </button>
                  <button
                    onClick={() => setPreviewTab('overview')}
                    className={`p-2 rounded-xl border text-[11px] font-bold transition-all text-left flex items-center justify-between ${
                      previewTab === 'overview'
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    <span>📊 월간 개요</span>
                    <span className="text-[8px] px-1 bg-slate-700 text-slate-300 rounded font-normal">기본</span>
                  </button>
                  <button
                    onClick={() => setPreviewTab('weekly')}
                    className={`p-2 rounded-xl border text-[11px] font-bold transition-all text-left flex items-center justify-between ${
                      previewTab === 'weekly'
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    <span>📆 주간 계획</span>
                    <span className="text-[8px] px-1 bg-slate-700 text-slate-300 rounded font-normal">기본</span>
                  </button>
                  <button
                    onClick={() => setPreviewTab('daily')}
                    className={`p-2 rounded-xl border text-[11px] font-bold transition-all text-left flex items-center justify-between ${
                      previewTab === 'daily'
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    <span>📝 데일리 노트</span>
                    <span className="text-[8px] px-1 bg-slate-700 text-slate-300 rounded font-normal">기본</span>
                  </button>
                </>
              )}
            </div>

            {/* Daily Selector */}
            {previewTab === 'daily' && (
              <div className="mt-2 pt-2 border-t border-white/10">
                <label className="text-[10px] text-slate-400 font-semibold mb-1 block">
                  {selectedMonth}월 일자 선택 (1일 ~ {totalDays}일)
                </label>
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                  {Array.from({ length: totalDays }, (_, i) => i + 1).map((d) => (
                    <button
                      key={d}
                      onClick={() => setActiveDayNum(d)}
                      className={`w-6 h-6 rounded-md text-[10px] font-bold transition-all ${
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

          {/* Module 4: Custom Page Selector */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 space-y-2.5 backdrop-blur-md shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-amber-400" />
                내지 포함 체커 ({activeSelectedCount}개 선택됨)
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">Custom Assembly</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-xs max-h-40 overflow-y-auto pr-1">
              {[
                { id: 'calendar', label: '📅 월간 달력' },
                { id: 'overview', label: '📊 월간 개요' },
                { id: 'weekly', label: '📆 주간 계획' },
                { id: 'daily', label: '📝 데일리 노트' },
                { id: 'habit', label: '🌱 30일 해빗' },
                { id: 'gratitude', label: '☀️ 감사 & 확언' },
                { id: 'quote', label: '📖 명언 & 필사' },
                { id: 'budget', label: '💰 가계부① 예산&자산' },
                { id: 'budget2', label: '💳 가계부② 데일리' },
                { id: 'culture', label: '🎬 문화① 메인' },
                { id: 'culture2', label: '🎞️ 문화② 컬렉션' },
                { id: 'kpt', label: '🔄 KPT① 마스터' },
                { id: 'kpt2', label: '⚡ KPT② 4주차 실행' },
                { id: 'sundaygeneral', label: '🌿 선데이 리셋' },
                { id: 'buckettravel', label: '✈️ 버킷 & 트래블' },
                { id: 'wellnessmood', label: '🥗 웰니스 & 감정' },
                { id: 'hundredgoal', label: '🎯 100일① 전반전' },
                { id: 'hundredgoal2', label: '🏆 100일② 완주전' },
                { id: 'prayer', label: '🙏 기도 (교회)' },
                { id: 'scripture', label: '📜 필사 (교회)' },
                { id: 'sermon', label: '🏛️ 설교 (교회)' },
                { id: 'biblemap', label: '🕊️ 66권 (교회)' },
                { id: 'letter', label: '💌 월말 편지' },
                { id: 'intercessory', label: '💖 중보기도 카드' },
                { id: 'soapjournal', label: '📖 SOAP 묵상' },
                { id: 'fruitstracker', label: '🌱 성령의 열매' },
              ].map((pg) => (
                <label
                  key={pg.id}
                  className={`flex items-center gap-2 p-1.5 rounded-lg border transition-all cursor-pointer ${
                    selectedPages[pg.id]
                      ? 'bg-indigo-600/20 border-indigo-400/50 text-slate-200 font-bold'
                      : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={!!selectedPages[pg.id]}
                    onChange={(e) => setSelectedPages({ ...selectedPages, [pg.id]: e.target.checked })}
                    className="w-3.5 h-3.5 rounded border-slate-600 text-indigo-600 focus:ring-0 cursor-pointer"
                  />
                  <span className="text-[10px] truncate">{pg.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right Studio Live Canvas Panel (8 cols) */}
        <div className="col-span-12 lg:col-span-8 flex flex-col items-center justify-start">
          {/* Top Canvas Toolbar */}
          <div className="w-full flex items-center justify-between mb-3 px-1 text-xs text-slate-400">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                스튜디오 캔버스
              </span>
              <span className="text-[11px] font-mono text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                {sizeLabel} ({pageWidth} × {pageHeight}px)
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Eco print toggle button */}
              <button
                onClick={() => setIsEcoPrint(!isEcoPrint)}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                  isEcoPrint
                    ? 'bg-emerald-600/20 border-emerald-400 text-emerald-300'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <span>🌿 잉크 절약:</span>
                <span>{isEcoPrint ? 'ON (순백색)' : 'OFF (컬러)'}</span>
              </button>

              <button
                onClick={() => {
                  setModalActiveTab(previewTab)
                  setIsFullscreenModalOpen(true)
                }}
                className="text-amber-400 hover:text-amber-300 font-bold text-[11px] flex items-center gap-1 transition-all hover:underline"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                전체화면 팝업
              </button>
            </div>
          </div>

          {/* Interactive Dot Grid Studio Canvas Frame */}
          {(() => {
            const canvasScale = isLandscape ? 0.72 : 0.58
            const canvasW = Math.round(pageWidth * canvasScale)
            const canvasH = Math.round(pageHeight * canvasScale)

            return (
              <div
                onClick={() => {
                  setModalActiveTab(previewTab)
                  setIsFullscreenModalOpen(true)
                }}
                className="w-full bg-[#070b19] border border-white/10 hover:border-indigo-500/50 rounded-2xl p-6 shadow-2xl flex items-center justify-center overflow-hidden cursor-pointer group relative transition-all duration-300 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px]"
              >
                {/* Hover overlay hint */}
                <div className="absolute inset-0 bg-indigo-950/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center z-20 pointer-events-none backdrop-blur-[1px]">
                  <span className="px-5 py-2.5 rounded-xl bg-slate-950/90 border border-indigo-400/50 text-indigo-200 font-bold text-xs shadow-2xl flex items-center gap-2 tracking-wide">
                    <Maximize2 className="w-4 h-4 text-amber-400 animate-bounce" />
                    클릭하여 전체화면 스튜디오 모달 열기
                  </span>
                </div>

                {/* Proportional Scaled Paper Wrapper */}
                <div
                  className="relative shrink-0 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] rounded-xl overflow-hidden pointer-events-none bg-slate-900 my-2"
                  style={{
                    width: `${canvasW}px`,
                    height: `${canvasH}px`,
                  }}
                >
                  <div
                    className="origin-top-left absolute top-0 left-0 transition-transform duration-300"
                    style={{
                      width: `${pageWidth}px`,
                      height: `${pageHeight}px`,
                      transform: `scale(${canvasScale})`,
                    }}
                  >
                    {previewTab === 'calendar' && (
                      <CalendarComponent year={selectedYear} month={selectedMonth} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                    )}
                    {previewTab === 'overview' && (
                      <OverviewComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                    )}
                    {previewTab === 'habit' && (
                      <HabitComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                    )}
                    {previewTab === 'gratitude' && (
                      <GratitudeComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                    )}
                    {previewTab === 'quote' && (
                      <QuoteComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                    )}
                    {previewTab === 'budget' && (
                      <BudgetComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                    )}
                    {previewTab === 'budget2' && (
                      <Budget2Component year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                    )}
                    {previewTab === 'culture' && (
                      <CultureComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                    )}
                    {previewTab === 'culture2' && (
                      <Culture2Component year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                    )}
                    {previewTab === 'kpt' && (
                      <KptComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                    )}
                    {previewTab === 'kpt2' && (
                      <Kpt2Component year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                    )}
                    {previewTab === 'sundaygeneral' && (
                      <SundayGeneralComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                    )}
                    {previewTab === 'buckettravel' && (
                      <BucketTravelComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                    )}
                    {previewTab === 'wellnessmood' && (
                      <WellnessMoodComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                    )}
                    {previewTab === 'hundredgoal' && (
                      <HundredGoalComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                    )}
                    {previewTab === 'hundredgoal2' && (
                      <HundredGoal2Component year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                    )}
                    {previewTab === 'intercessory' && (
                      <IntercessoryComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                    )}
                    {previewTab === 'soapjournal' && (
                      <SoapJournalComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                    )}
                    {previewTab === 'fruitstracker' && (
                      <FruitsTrackerComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                    )}
                    {previewTab === 'prayer' && (
                      <PrayerComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                    )}
                    {previewTab === 'scripture' && (
                      <ScriptureArtComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                    )}
                    {previewTab === 'sermon' && (
                      <SundaySermonComponent year={selectedYear} month={selectedMonth} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                    )}
                    {previewTab === 'sermondeep' && (
                      <SundaySermonDeepComponent year={selectedYear} month={selectedMonth} sundayNo={1} dateStr="08/02" monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                    )}
                    {previewTab === 'biblemap' && (
                      <BibleMapComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                    )}
                    {previewTab === 'letter' && (
                      <MonthlyLetterComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                    )}
                    {previewTab === 'weekly' && (() => {
                      const w1Data = getWeekData(1)
                      return (
                        <WeeklyComponent
                          year={selectedYear}
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
                          isChurchMode={categoryFilter === 'church'}
                        />
                      )
                    })()}
                  </div>
                </div>
              </div>
            )
          })()}
        </div>
      </div>

      {/* ★ ===== [전체화면 풀스크린 팝업창 모달] ===== */}
      {isFullscreenModalOpen && (
        <div className="fixed inset-0 z-[100] bg-[#030612]/98 backdrop-blur-2xl flex flex-col min-h-screen min-w-full animate-in fade-in duration-200">
          {/* Modal Header Bar */}
          <header className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-[#090e24]/95 backdrop-blur-md shrink-0 shadow-2xl z-20 gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>{selectedYear}년 {selectedMonth}월 맞춤형 다이어리 100% 실물 전체화면 뷰어</span>
              </div>
              <span className="text-xs text-slate-400 font-medium hidden md:inline-block">
                · 테마: <strong className="text-slate-200">{selectedTheme.name}</strong>
              </span>
            </div>

            {/* Center Controls: View Mode Switcher + Zoom Controls */}
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-white/10">
                <button
                  onClick={() => setModalViewMode('continuous')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    modalViewMode === 'continuous'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  전체 연속 스크롤 뷰
                </button>
                <button
                  onClick={() => setModalViewMode('single')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    modalViewMode === 'single'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
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
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono font-bold px-2 text-indigo-200 min-w-[48px] text-center">
                  {Math.round(zoomScale * 100)}%
                </span>
                <button
                  onClick={() => setZoomScale(s => Math.min(2.0, Number((s + 0.1).toFixed(1))))}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-all"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoomScale(1.0)}
                  className="px-2 py-1 text-[10px] font-bold rounded hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-all border border-white/10 ml-1"
                >
                  100%
                </button>
              </div>
            </div>

            <button
              onClick={() => setIsFullscreenModalOpen(false)}
              className="p-2 rounded-xl bg-white/10 hover:bg-rose-600 text-slate-300 hover:text-white transition-all border border-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </header>

          {/* Modal Main View */}
          <div
            className="flex-1 overflow-auto p-8 flex justify-center bg-[#050816]"
            ref={modalScrollRef}
            onClick={handleModalCanvasClick}
          >
            {modalViewMode === 'single' ? (
              <div
                className="transition-transform duration-200 origin-top my-4 shadow-2xl rounded-xl overflow-hidden shrink-0"
                style={{
                  transform: `scale(${zoomScale})`,
                  transformOrigin: 'top center',
                  width: `${pageWidth}px`,
                  height: `${pageHeight}px`,
                }}
              >
                {modalActiveTab === 'calendar' && <CalendarComponent year={selectedYear} month={selectedMonth} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />}
                {modalActiveTab === 'overview' && <OverviewComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />}
                {modalActiveTab === 'habit' && <HabitComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />}
                {modalActiveTab === 'gratitude' && <GratitudeComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />}
                {modalActiveTab === 'quote' && <QuoteComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />}
                {modalActiveTab === 'budget' && <BudgetComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />}
                {modalActiveTab === 'budget2' && <Budget2Component year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />}
                {modalActiveTab === 'culture' && <CultureComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />}
                {modalActiveTab === 'culture2' && <Culture2Component year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />}
                {modalActiveTab === 'kpt' && <KptComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />}
                {modalActiveTab === 'kpt2' && <Kpt2Component year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />}
                {modalActiveTab === 'sundaygeneral' && <SundayGeneralComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />}
                {modalActiveTab === 'buckettravel' && <BucketTravelComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />}
                {modalActiveTab === 'wellnessmood' && <WellnessMoodComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />}
                {modalActiveTab === 'hundredgoal' && <HundredGoalComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />}
                {modalActiveTab === 'hundredgoal2' && <HundredGoal2Component year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />}
                {modalActiveTab === 'intercessory' && <IntercessoryComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />}
                {modalActiveTab === 'soapjournal' && <SoapJournalComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />}
                {modalActiveTab === 'fruitstracker' && <FruitsTrackerComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />}
                {modalActiveTab === 'prayer' && <PrayerComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />}
                {modalActiveTab === 'scripture' && <ScriptureArtComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />}
                {modalActiveTab === 'sermon' && <SundaySermonComponent year={selectedYear} month={selectedMonth} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />}
                {modalActiveTab === 'sermondeep' && <SundaySermonDeepComponent year={selectedYear} month={selectedMonth} sundayNo={1} dateStr="08/02" monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />}
                {modalActiveTab === 'biblemap' && <BibleMapComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />}
                {modalActiveTab === 'letter' && <MonthlyLetterComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />}
                {modalActiveTab === 'weekly' && (() => {
                  const w1Data = getWeekData(1)
                  return (
                    <WeeklyComponent
                      year={selectedYear}
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
                      isChurchMode={categoryFilter === 'church'}
                    />
                  )
                })()}
              </div>
            ) : (
              <div
                className="transition-transform duration-200 origin-top flex flex-col items-center space-y-12 my-6 shrink-0"
                style={{
                  transform: `scale(${zoomScale})`,
                  transformOrigin: 'top center',
                  width: `${pageWidth}px`,
                }}
              >
                {selectedPages.calendar && (
                  <div id="modal-page-calendar" className="shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden shrink-0 bg-slate-900" style={{ width: `${pageWidth}px`, height: `${pageHeight}px` }}>
                    <CalendarComponent year={selectedYear} month={selectedMonth} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                  </div>
                )}
                {selectedPages.overview && (
                  <div id="modal-page-overview" className="shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden shrink-0 bg-slate-900" style={{ width: `${pageWidth}px`, height: `${pageHeight}px` }}>
                    <OverviewComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                  </div>
                )}
                {selectedPages.habit && (
                  <div id="modal-page-habit" className="shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden shrink-0 bg-slate-900" style={{ width: `${pageWidth}px`, height: `${pageHeight}px` }}>
                    <HabitComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                  </div>
                )}
                {selectedPages.gratitude && (
                  <div id="modal-page-gratitude" className="shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden shrink-0 bg-slate-900" style={{ width: `${pageWidth}px`, height: `${pageHeight}px` }}>
                    <GratitudeComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                  </div>
                )}
                {selectedPages.quote && (
                  <div id="modal-page-quote" className="shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden shrink-0 bg-slate-900" style={{ width: `${pageWidth}px`, height: `${pageHeight}px` }}>
                    <QuoteComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                  </div>
                )}
                {selectedPages.budget && (
                  <div id="modal-page-budget" className="shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden shrink-0 bg-slate-900" style={{ width: `${pageWidth}px`, height: `${pageHeight}px` }}>
                    <BudgetComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                  </div>
                )}
                {selectedPages.budget2 && (
                  <div id="modal-page-budget2" className="shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden shrink-0 bg-slate-900" style={{ width: `${pageWidth}px`, height: `${pageHeight}px` }}>
                    <Budget2Component year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                  </div>
                )}
                {selectedPages.culture && (
                  <div id="modal-page-culture" className="shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden shrink-0 bg-slate-900" style={{ width: `${pageWidth}px`, height: `${pageHeight}px` }}>
                    <CultureComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                  </div>
                )}
                {selectedPages.culture2 && (
                  <div id="modal-page-culture2" className="shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden shrink-0 bg-slate-900" style={{ width: `${pageWidth}px`, height: `${pageHeight}px` }}>
                    <Culture2Component year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                  </div>
                )}
                {selectedPages.kpt && (
                  <div id="modal-page-kpt" className="shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden shrink-0 bg-slate-900" style={{ width: `${pageWidth}px`, height: `${pageHeight}px` }}>
                    <KptComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                  </div>
                )}
                {selectedPages.kpt2 && (
                  <div id="modal-page-kpt2" className="shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden shrink-0 bg-slate-900" style={{ width: `${pageWidth}px`, height: `${pageHeight}px` }}>
                    <Kpt2Component year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                  </div>
                )}
                {selectedPages.sundaygeneral && (
                  Array.from({ length: 4 }, (_, i) => i + 1).map((sNo) => (
                    <div key={`modal-sundaygeneral-${sNo}`} id={`modal-page-sundaygeneral-${sNo}`} className="shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden shrink-0 bg-slate-900" style={{ width: `${pageWidth}px`, height: `${pageHeight}px` }}>
                      <SundayGeneralComponent year={selectedYear} month={selectedMonth} sundayNo={sNo} sundayLabel={`${selectedMonth}월 ${sNo}주차 선데이 리셋`} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                    </div>
                  ))
                )}
                {selectedPages.buckettravel && (
                  <div id="modal-page-buckettravel" className="shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden shrink-0 bg-slate-900" style={{ width: `${pageWidth}px`, height: `${pageHeight}px` }}>
                    <BucketTravelComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                  </div>
                )}
                {selectedPages.wellnessmood && (
                  <div id="modal-page-wellnessmood" className="shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden shrink-0 bg-slate-900" style={{ width: `${pageWidth}px`, height: `${pageHeight}px` }}>
                    <WellnessMoodComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                  </div>
                )}
                {selectedPages.hundredgoal && (
                  <div id="modal-page-hundredgoal" className="shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden shrink-0 bg-slate-900" style={{ width: `${pageWidth}px`, height: `${pageHeight}px` }}>
                    <HundredGoalComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                  </div>
                )}
                {selectedPages.hundredgoal2 && (
                  <div id="modal-page-hundredgoal2" className="shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden shrink-0 bg-slate-900" style={{ width: `${pageWidth}px`, height: `${pageHeight}px` }}>
                    <HundredGoal2Component year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                  </div>
                )}
                {selectedPages.intercessory && (
                  <div id="modal-page-intercessory" className="shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden shrink-0 bg-slate-900" style={{ width: `${pageWidth}px`, height: `${pageHeight}px` }}>
                    <IntercessoryComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                  </div>
                )}
                {selectedPages.soapjournal && (
                  <div id="modal-page-soapjournal" className="shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden shrink-0 bg-slate-900" style={{ width: `${pageWidth}px`, height: `${pageHeight}px` }}>
                    <SoapJournalComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                  </div>
                )}
                {selectedPages.fruitstracker && (
                  <div id="modal-page-fruitstracker" className="shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden shrink-0 bg-slate-900" style={{ width: `${pageWidth}px`, height: `${pageHeight}px` }}>
                    <FruitsTrackerComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                  </div>
                )}
                {selectedPages.prayer && (
                  <div id="modal-page-prayer" className="shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden shrink-0 bg-slate-900" style={{ width: `${pageWidth}px`, height: `${pageHeight}px` }}>
                    <PrayerComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                  </div>
                )}
                {selectedPages.scripture && (
                  <div id="modal-page-scripture" className="shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden shrink-0 bg-slate-900" style={{ width: `${pageWidth}px`, height: `${pageHeight}px` }}>
                    <ScriptureArtComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                  </div>
                )}
                {selectedPages.sermon && (
                  <div id="modal-page-sermon" className="shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden shrink-0 bg-slate-900" style={{ width: `${pageWidth}px`, height: `${pageHeight}px` }}>
                    <SundaySermonComponent year={selectedYear} month={selectedMonth} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                  </div>
                )}
                {selectedPages.sermondeep && (
                  <div id="modal-page-sermondeep" className="shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden shrink-0 bg-slate-900" style={{ width: `${pageWidth}px`, height: `${pageHeight}px` }}>
                    <SundaySermonDeepComponent year={selectedYear} month={selectedMonth} sundayNo={1} dateStr="08/02" monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                  </div>
                )}
                {selectedPages.biblemap && (
                  <div id="modal-page-biblemap" className="shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden shrink-0 bg-slate-900" style={{ width: `${pageWidth}px`, height: `${pageHeight}px` }}>
                    <BibleMapComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                  </div>
                )}
                {selectedPages.letter && (
                  <div id="modal-page-letter" className="shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden shrink-0 bg-slate-900" style={{ width: `${pageWidth}px`, height: `${pageHeight}px` }}>
                    <MonthlyLetterComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                  </div>
                )}
                {selectedPages.weekly && (
                  Array.from({ length: 5 }, (_, i) => i + 1).map((wNum) => {
                    const wData = getWeekData(wNum)
                    return (
                      <div key={`modal-week-${wNum}`} id={`modal-page-week-${wNum}`} className="shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden shrink-0 bg-slate-900" style={{ width: `${pageWidth}px`, height: `${pageHeight}px` }}>
                        <WeeklyComponent
                          year={selectedYear}
                          weekNum={wNum}
                          weekLabel={`${wNum}주차`}
                          dateRangeText={wData.dateRangeText}
                          daysInWeek={wData.daysInWeek}
                          monthName={monthName}
                          themeColor={activeColor}
                          pageWidth={pageWidth}
                          pageHeight={pageHeight}
                        />
                      </div>
                    )
                  })
                )}
                {selectedPages.daily && (
                  Array.from({ length: totalDays }, (_, i) => i + 1).map((d) => {
                    const dayNamesShort = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
                    const dateObj = new Date(selectedYear, selectedMonth - 1, d)
                    const realDayName = dayNamesShort[dateObj.getDay()]
                    const currentWeek = Math.floor((d - 1) / 7) + 1

                    return (
                      <div key={`modal-day-${d}`} id={`modal-page-day-${d}`} className="shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden shrink-0 bg-slate-900" style={{ width: `${pageWidth}px`, height: `${pageHeight}px` }}>
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
                          isChurchMode={categoryFilter === 'church'}
                        />
                      </div>
                    )
                  })
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hidden Full PDF Assembly Render Container for Custom PDF Download */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0, opacity: 1, zIndex: -1 }}>
        <div ref={pdfContainerRef}>
          {selectedPages.calendar && (
            <CalendarComponent year={selectedYear} month={selectedMonth} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
          )}
          {selectedPages.overview && (
            <OverviewComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
          )}
          {selectedPages.habit && (
            <HabitComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
          )}
          {selectedPages.gratitude && (
            <GratitudeComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
          )}
          {selectedPages.quote && (
            <QuoteComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
          )}
          {selectedPages.budget && (
            <BudgetComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
          )}
          {selectedPages.budget2 && (
            <Budget2Component year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
          )}
          {selectedPages.culture && (
            <CultureComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
          )}
          {selectedPages.culture2 && (
            <Culture2Component year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
          )}
          {selectedPages.kpt && (
            <KptComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
          )}
          {selectedPages.kpt2 && (
            <Kpt2Component year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
          )}
          {selectedPages.sundaygeneral && (
            Array.from({ length: 4 }, (_, i) => i + 1).map((sNo) => (
              <SundayGeneralComponent key={`pdf-sundaygeneral-${sNo}`} year={selectedYear} month={selectedMonth} sundayNo={sNo} sundayLabel={`${selectedMonth}월 ${sNo}주차 선데이 리셋`} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
            ))
          )}
          {selectedPages.buckettravel && (
            <BucketTravelComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
          )}
          {selectedPages.wellnessmood && (
            <WellnessMoodComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
          )}
          {selectedPages.hundredgoal && (
            <HundredGoalComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
          )}
          {selectedPages.hundredgoal2 && (
            <HundredGoal2Component year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
          )}
          {selectedPages.intercessory && (
            <IntercessoryComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
          )}
          {selectedPages.soapjournal && (
            <SoapJournalComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
          )}
          {selectedPages.fruitstracker && (
            <FruitsTrackerComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
          )}
          {selectedPages.prayer && (
            <PrayerComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
          )}
          {selectedPages.scripture && (
            <ScriptureArtComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
          )}
          {selectedPages.sermon && (
            <SundaySermonComponent year={selectedYear} month={selectedMonth} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
          )}
          {selectedPages.biblemap && (
            <BibleMapComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
          )}
          {selectedPages.letter && (
            <MonthlyLetterComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
          )}
          {selectedPages.weekly && selectedPages.daily && (
            Array.from({ length: totalDays }, (_, i) => i + 1).map((d) => {
              const currentWeek = Math.floor((d - 1) / 7) + 1
              const isWeekStart = (d - 1) % 7 === 0

              return (
                <React.Fragment key={d}>
                  {isWeekStart && (
                    <WeeklyComponent
                      year={selectedYear}
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
                    isChurchMode={categoryFilter === 'church'}
                  />
                </React.Fragment>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
