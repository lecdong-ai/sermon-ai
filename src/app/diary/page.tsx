'use client'

import React, { useState, useRef } from 'react'

// 명품 수채화 가로/세로 컴포넌트 전체 임포트
import QtMonthlyCalendarPage from '@/components/advanced/QtMonthlyCalendarPage'
import QtMonthlyCalendarPortrait from '@/components/advanced/portrait/QtMonthlyCalendarPortrait'
import QtMonthlyOverviewPage from '@/components/advanced/QtMonthlyOverviewPage'
import QtMonthlyOverviewPortrait from '@/components/advanced/portrait/QtMonthlyOverviewPortrait'
import QtPrayerAnswerPage from '@/components/advanced/QtPrayerAnswerPage'
import QtPrayerAnswerPortrait from '@/components/advanced/portrait/QtPrayerAnswerPortrait'
import QtPrayerAnswerPage2 from '@/components/advanced/QtPrayerAnswerPage2'
import QtPrayerAnswerPortrait2 from '@/components/advanced/portrait/QtPrayerAnswerPortrait2'
import QtScriptureArtPage from '@/components/advanced/QtScriptureArtPage'
import QtScriptureArtPortrait from '@/components/advanced/portrait/QtScriptureArtPortrait'
import QtScriptureArtPage2 from '@/components/advanced/QtScriptureArtPage2'
import QtScriptureArtPortrait2 from '@/components/advanced/portrait/QtScriptureArtPortrait2'
import QtSundaySermonPage from '@/components/advanced/QtSundaySermonPage'
import QtSundaySermonPortrait from '@/components/advanced/portrait/QtSundaySermonPortrait'
import QtSundaySermonDeepPage from '@/components/advanced/QtSundaySermonDeepPage'
import QtSundaySermonDeepPortrait from '@/components/advanced/portrait/QtSundaySermonDeepPortrait'
import QtBibleReadingMapPage from '@/components/advanced/QtBibleReadingMapPage'
import QtBibleReadingMapPortrait from '@/components/advanced/portrait/QtBibleReadingMapPortrait'
import QtBibleReadingMapPage2 from '@/components/advanced/QtBibleReadingMapPage2'
import QtBibleReadingMapPortrait2 from '@/components/advanced/portrait/QtBibleReadingMapPortrait2'
import QtMonthlyLetterPage from '@/components/advanced/QtMonthlyLetterPage'
import QtMonthlyLetterPortrait from '@/components/advanced/portrait/QtMonthlyLetterPortrait'
import QtMonthlyLetterPage2 from '@/components/advanced/QtMonthlyLetterPage2'
import QtMonthlyLetterPortrait2 from '@/components/advanced/portrait/QtMonthlyLetterPortrait2'
import QtWeeklyPlanPage from '@/components/advanced/QtWeeklyPlanPage'
import QtWeeklyPlanPortrait from '@/components/advanced/portrait/QtWeeklyPlanPortrait'
import QtDailyDiaryPage from '@/components/advanced/QtDailyDiaryPage'
import QtDailyDiaryPortrait from '@/components/advanced/portrait/QtDailyDiaryPortrait'

// 신규 5종 컴포넌트 임포트 (가로/세로)
import QtHabitTrackerPage from '@/components/advanced/QtHabitTrackerPage'
import QtHabitTrackerPortrait from '@/components/advanced/portrait/QtHabitTrackerPortrait'
import QtHabitTrackerPage2 from '@/components/advanced/QtHabitTrackerPage2'
import QtHabitTrackerPortrait2 from '@/components/advanced/portrait/QtHabitTrackerPortrait2'
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
import QtIntercessoryPrayerPage2 from '@/components/advanced/QtIntercessoryPrayerPage2'
import QtIntercessoryPrayerPortrait2 from '@/components/advanced/portrait/QtIntercessoryPrayerPortrait2'
import QtSoapJournalPage from '@/components/advanced/QtSoapJournalPage'
import QtSoapJournalPortrait from '@/components/advanced/portrait/QtSoapJournalPortrait'
import QtSoapJournalPage2 from '@/components/advanced/QtSoapJournalPage2'
import QtSoapJournalPortrait2 from '@/components/advanced/portrait/QtSoapJournalPortrait2'
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
  | 'habit' | 'habit2' | 'gratitude' | 'quote' | 'budget' | 'budget2' | 'culture' | 'culture2' | 'kpt' | 'kpt2' | 'sundaygeneral'
  | 'buckettravel' | 'wellnessmood' | 'hundredgoal' | 'hundredgoal2'
  | 'prayer' | 'prayer2' | 'scripture' | 'scripture2' | 'sermon' | 'sermondeep' | 'biblemap' | 'biblemap2' | 'letter' | 'letter2'
  | 'intercessory' | 'intercessory2' | 'soapjournal' | 'soapjournal2' | 'fruitstracker'

export default function DiaryPage() {
  const [selectedYear, setSelectedYear] = useState(2026)
  const [selectedMonth, setSelectedMonth] = useState(8)
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0])
  const [selectedSizeOption, setSelectedSizeOption] = useState('A4Landscape')
  const [isEcoPrint, setIsEcoPrint] = useState(false)
  const [previewTab, setPreviewTab] = useState<PreviewTabType>('calendar')
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'general' | 'church' | 'basic'>('all')
  const [activeDayNum, setActiveDayNum] = useState(1)
  const [isPdfGenerating, setIsPdfGenerating] = useState(false)

  const [selectedPages, setSelectedPages] = useState<Record<string, boolean>>({
    calendar: true,
    overview: true,
    weekly: true,
    daily: true,
    habit: true,
    habit2: true,
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
    prayer2: true,
    scripture: true,
    scripture2: true,
    sermon: true,
    sermondeep: false,
    biblemap: true,
    biblemap2: true,
    letter: true,
    letter2: true,
    intercessory: true,
    intercessory2: true,
    soapjournal: true,
    soapjournal2: true,
    fruitstracker: true,
  })

  const [isFullscreenModalOpen, setIsFullscreenModalOpen] = useState(false)
  const [modalViewMode, setModalViewMode] = useState<'single' | 'continuous'>('continuous')
  const [zoomScale, setZoomScale] = useState(1.0)
  const [modalActiveTab, setModalActiveTab] = useState<PreviewTabType>('calendar')
  const [modalDayNum, setModalDayNum] = useState(1)

  const pdfContainerRef = useRef<HTMLDivElement>(null)
  const modalScrollRef = useRef<HTMLDivElement>(null)

  const monthName = MONTH_NAMES[selectedMonth - 1] || 'August'
  const totalDays = new Date(selectedYear, selectedMonth, 0).getDate()

  const activeColor = isEcoPrint ? '#475569' : selectedTheme.color

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

  const CalendarComponent = isLandscape ? QtMonthlyCalendarPage : QtMonthlyCalendarPortrait
  const OverviewComponent = isLandscape ? QtMonthlyOverviewPage : QtMonthlyOverviewPortrait
  const PrayerComponent = isLandscape ? QtPrayerAnswerPage : QtPrayerAnswerPortrait
  const Prayer2Component = isLandscape ? QtPrayerAnswerPage2 : QtPrayerAnswerPortrait2
  const ScriptureArtComponent = isLandscape ? QtScriptureArtPage : QtScriptureArtPortrait
  const ScriptureArt2Component = isLandscape ? QtScriptureArtPage2 : QtScriptureArtPortrait2
  const SundaySermonComponent = isLandscape ? QtSundaySermonPage : QtSundaySermonPortrait
  const SundaySermonDeepComponent = isLandscape ? QtSundaySermonDeepPage : QtSundaySermonDeepPortrait
  const BibleMapComponent = isLandscape ? QtBibleReadingMapPage : QtBibleReadingMapPortrait
  const BibleMap2Component = isLandscape ? QtBibleReadingMapPage2 : QtBibleReadingMapPortrait2
  const MonthlyLetterComponent = isLandscape ? QtMonthlyLetterPage : QtMonthlyLetterPortrait
  const MonthlyLetter2Component = isLandscape ? QtMonthlyLetterPage2 : QtMonthlyLetterPortrait2
  const WeeklyComponent = isLandscape ? QtWeeklyPlanPage : QtWeeklyPlanPortrait
  const DailyComponent = isLandscape ? QtDailyDiaryPage : QtDailyDiaryPortrait

  const HabitComponent = isLandscape ? QtHabitTrackerPage : QtHabitTrackerPortrait
  const Habit2Component = isLandscape ? QtHabitTrackerPage2 : QtHabitTrackerPortrait2
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
  const Intercessory2Component = isLandscape ? QtIntercessoryPrayerPage2 : QtIntercessoryPrayerPortrait2
  const SoapJournalComponent = isLandscape ? QtSoapJournalPage : QtSoapJournalPortrait
  const SoapJournal2Component = isLandscape ? QtSoapJournalPage2 : QtSoapJournalPortrait2
  const FruitsTrackerComponent = isLandscape ? QtFruitsTrackerPage : QtFruitsTrackerPortrait

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
      alert(`PDF 생성 실패: ${e?.message || '알 수 없는 오류'}`)
    } finally {
      setIsPdfGenerating(false)
    }
  }

  const selectAllPages = () => {
    const next: Record<string, boolean> = {}
    Object.keys(selectedPages).forEach(k => { next[k] = true })
    setSelectedPages(next)
  }

  const deselectAllPages = () => {
    const next: Record<string, boolean> = {}
    Object.keys(selectedPages).forEach(k => { next[k] = false })
    setSelectedPages(next)
  }

  const handlePresetGeneral = () => {
    setCategoryFilter('general')
    setSelectedPages({
      calendar: true, overview: true, weekly: true, daily: true,
      habit: true, habit2: true, gratitude: true, quote: true,
      budget: true, budget2: true, culture: true, culture2: true,
      kpt: true, kpt2: true, sundaygeneral: true, buckettravel: true,
      wellnessmood: true, hundredgoal: true, hundredgoal2: true,
      letter: true, letter2: true,
      prayer: false, prayer2: false, scripture: false, scripture2: false,
      sermon: false, sermondeep: false, biblemap: false, biblemap2: false,
      intercessory: false, intercessory2: false, soapjournal: false, soapjournal2: false, fruitstracker: false,
    })
  }

  const handlePresetChurch = () => {
    setCategoryFilter('church')
    setSelectedPages({
      calendar: true, overview: true, weekly: true, daily: true,
      habit: true, habit2: true, gratitude: true, quote: true,
      budget: true, budget2: true, culture: true, culture2: true,
      kpt: true, kpt2: true, sundaygeneral: false, buckettravel: true,
      wellnessmood: true, hundredgoal: true, hundredgoal2: true,
      letter: true, letter2: true,
      prayer: true, prayer2: true, scripture: true, scripture2: true,
      sermon: true, sermondeep: true, biblemap: true, biblemap2: true,
      intercessory: true, intercessory2: true, soapjournal: true, soapjournal2: true, fruitstracker: true,
    })
  }

  const handlePresetEssential = () => {
    setSelectedPages({
      calendar: true, overview: true, weekly: true, daily: true,
      habit: true, habit2: false, gratitude: true, quote: false,
      budget: true, budget2: false, culture: false, culture2: false,
      kpt: true, kpt2: false, sundaygeneral: false, buckettravel: false,
      wellnessmood: true, hundredgoal: false, hundredgoal2: false,
      letter: true, letter2: false,
      prayer: true, prayer2: false, scripture: false, scripture2: false,
      sermon: false, sermondeep: false, biblemap: false, biblemap2: false,
      intercessory: false, intercessory2: false, soapjournal: false, soapjournal2: false, fruitstracker: false,
    })
  }

  const openModalAt = (tab: PreviewTabType, dayNo: number = 1) => {
    setModalActiveTab(tab)
    setModalDayNum(dayNo)
    setIsFullscreenModalOpen(true)

    if (modalViewMode === 'continuous') {
      setTimeout(() => {
        let targetId = `modal-page-${tab}`
        if (tab === 'daily') targetId = `modal-page-day-${dayNo}`
        const el = document.getElementById(targetId)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-24">
      {/* Header Bar */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
            ✍️
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              수채화 다이어리 스튜디오 <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Professional Edition</span>
            </h1>
            <p className="text-xs text-slate-400">맞춤형 내지 구성 & 1년 365일 고해상도 PDF 실시간 인쇄 시스템</p>
          </div>
        </div>

        {/* Header Quick Controls */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => openModalAt(previewTab, activeDayNum)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <span>🔍</span> 팝업 미리보기 (확대/스크롤)
          </button>

          <button
            onClick={handleDownloadFullPdf}
            disabled={isPdfGenerating}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-md hover:shadow-indigo-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isPdfGenerating ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>고해상도 PDF 수록 중...</span>
              </>
            ) : (
              <>
                <span>📥</span> PDF 일괄 생성 & 다운로드
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Studio Body */}
      <div className="max-w-[1600px] mx-auto px-6 pt-6 grid grid-cols-12 gap-6">
        {/* Left Control Sidebar (4 cols) */}
        <div className="col-span-12 lg:col-span-4 space-y-5">
          {/* Preset Buttons */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 shadow-xl backdrop-blur-sm space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <span>🎯</span> 스마트 내지 맞춤 팩 (Presets)
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={handlePresetGeneral}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                  categoryFilter === 'general'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-900/30'
                    : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                🌿 일반인 갓생 팩
              </button>
              <button
                onClick={handlePresetChurch}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                  categoryFilter === 'church'
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-900/30'
                    : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                ⛪ 크리스천 묵상 팩
              </button>
              <button
                onClick={handlePresetEssential}
                className="py-2 px-3 rounded-xl text-xs font-bold bg-slate-900/80 text-slate-300 border border-slate-800 hover:bg-slate-800 transition-all"
              >
                ⚡ 라이트 다이어리
              </button>
            </div>
          </div>

          {/* Theme & Size Settings */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 shadow-xl backdrop-blur-sm space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <span>🎨</span> 테마 & 규격 옵션 (Theme & Paper)
            </h3>

            {/* Theme Select */}
            <div>
              <label className="text-xs text-slate-400 font-semibold mb-2 block">수채화 색상 테마</label>
              <div className="grid grid-cols-5 gap-2">
                {THEMES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTheme(t)}
                    className={`h-10 rounded-xl flex flex-col items-center justify-center transition-all border ${
                      selectedTheme.id === t.id
                        ? 'ring-2 ring-indigo-400 border-white scale-105'
                        : 'border-slate-800 hover:scale-102'
                    }`}
                    style={{ backgroundColor: t.color }}
                    title={t.name}
                  >
                    {selectedTheme.id === t.id && <span className="text-xs text-slate-900 font-bold">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Select */}
            <div>
              <label className="text-xs text-slate-400 font-semibold mb-2 block">용지 크기 & 가로/세로 방향</label>
              <select
                value={selectedSizeOption}
                onChange={(e) => setSelectedSizeOption(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 font-semibold focus:outline-none focus:border-indigo-500"
              >
                <option value="A4Landscape">A4 가로형 (297 x 210 mm) — 메인 와이드 추천</option>
                <option value="A4Portrait">A4 세로형 (210 x 297 mm) — 정통 노드 바인딩</option>
                <option value="A5Landscape">A5 가로형 (210 x 148 mm)</option>
                <option value="A5Portrait">A5 세로형 (148 x 210 mm)</option>
                <option value="B5Landscape">B5 가로형 (250 x 176 mm)</option>
                <option value="B5Portrait">B5 세로형 (176 x 250 mm)</option>
                <option value="iPadPro12_9">iPad Pro 12.9 (굿노트 최적화)</option>
              </select>
            </div>

            {/* Eco Print Option */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-900">
              <span className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
                <span>🌱</span> 에코 흑백 절약 인쇄 모드
              </span>
              <input
                type="checkbox"
                checked={isEcoPrint}
                onChange={(e) => setIsEcoPrint(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right Canvas Preview & Navigation (8 cols) */}
        <div className="col-span-12 lg:col-span-8 space-y-5">
          {/* Main Navigation Tabs */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3 shadow-xl backdrop-blur-sm flex flex-wrap gap-1.5 items-center justify-between">
            <div className="flex flex-wrap gap-1 items-center">
              <button
                onClick={() => setPreviewTab('calendar')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  previewTab === 'calendar' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                📅 월간 달력
              </button>
              <button
                onClick={() => setPreviewTab('overview')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  previewTab === 'overview' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                📊 월간 개요
              </button>
              <button
                onClick={() => setPreviewTab('weekly')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  previewTab === 'weekly' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                🗓️ 주간 플랜
              </button>
              <button
                onClick={() => setPreviewTab('daily')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  previewTab === 'daily' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                📝 데일리 노트
              </button>
              <button
                onClick={() => setPreviewTab('habit')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  previewTab === 'habit' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                ✨ 습관 트래커
              </button>
              <button
                onClick={() => setPreviewTab('budget')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  previewTab === 'budget' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                💰 가계부
              </button>
            </div>

            <button
              onClick={() => openModalAt(previewTab, activeDayNum)}
              className="px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold hover:bg-indigo-500/30 transition-all"
            >
              🖥️ 전체 화면
            </button>
          </div>

          {/* Canvas Wrapper */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 shadow-2xl overflow-hidden flex flex-col items-center justify-center min-h-[680px]">
            <div
              className="relative shadow-2xl rounded-sm overflow-hidden bg-white transition-all duration-300"
              style={{
                width: `${pageWidth}px`,
                height: `${pageHeight}px`,
                transform: `scale(${pageWidth > 900 ? 0.72 : 0.65})`,
                transformOrigin: 'top center',
                marginBottom: `-${pageHeight * (pageWidth > 900 ? 0.28 : 0.35)}px`,
              }}
            >
              {previewTab === 'calendar' && (
                <CalendarComponent year={selectedYear} month={selectedMonth} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} isGeneralMode={categoryFilter !== 'church'} />
              )}
              {previewTab === 'overview' && (
                <OverviewComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} isGeneralMode={categoryFilter !== 'church'} />
              )}
              {previewTab === 'habit' && (
                <HabitComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
              )}
              {previewTab === 'habit2' && (
                <Habit2Component year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
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
                <SundayGeneralComponent year={selectedYear} month={selectedMonth} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
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
              {previewTab === 'intercessory2' && (
                <Intercessory2Component year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
              )}
              {previewTab === 'soapjournal' && (
                <SoapJournalComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
              )}
              {previewTab === 'soapjournal2' && (
                <SoapJournal2Component year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
              )}
              {previewTab === 'fruitstracker' && (
                <FruitsTrackerComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
              )}
              {previewTab === 'prayer' && (
                <PrayerComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
              )}
              {previewTab === 'prayer2' && (
                <Prayer2Component year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
              )}
              {previewTab === 'scripture' && (
                <ScriptureArtComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
              )}
              {previewTab === 'scripture2' && (
                <ScriptureArt2Component year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
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
              {previewTab === 'biblemap2' && (
                <BibleMap2Component year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
              )}
              {previewTab === 'letter' && (
                <MonthlyLetterComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
              )}
              {previewTab === 'letter2' && (
                <MonthlyLetter2Component year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
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
                    isGeneralMode={categoryFilter !== 'church'}
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
                    activeWeek="W1"
                    isChurchMode={categoryFilter === 'church'}
                  />
                )
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* 팝업 모달 */}
      {isFullscreenModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex flex-col justify-between overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-3">
              <span className="text-xl">✍️</span>
              <h2 className="text-base font-bold text-white">수채화 다이어리 스튜디오 — 30년 전문가 바인딩 프리뷰</h2>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setModalViewMode('continuous')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  modalViewMode === 'continuous' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                📜 30년 전문가 배치 순서 연속 스크롤
              </button>
              <button
                onClick={() => setIsFullscreenModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm flex items-center justify-center"
              >
                ✕
              </button>
            </div>
          </div>

          <div ref={modalScrollRef} className="flex-1 overflow-y-auto p-8 flex flex-col items-center">
            {modalViewMode === 'continuous' && (
              <div
                className="transition-transform duration-200 origin-top flex flex-col items-center space-y-12 my-6 shrink-0"
                style={{
                  transform: `scale(${zoomScale})`,
                  transformOrigin: 'top center',
                  width: `${pageWidth}px`,
                }}
              >
                {/* 1. INTRO & VISION (서약 & 100가지 꿈 & 버킷) */}
                {selectedPages.letter && (
                  <div id="modal-page-letter" className="shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden shrink-0 bg-slate-900" style={{ width: `${pageWidth}px`, height: `${pageHeight}px` }}>
                    <MonthlyLetterComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                  </div>
                )}
                {selectedPages.letter2 && (
                  <div id="modal-page-letter2" className="shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden shrink-0 bg-slate-900" style={{ width: `${pageWidth}px`, height: `${pageHeight}px` }}>
                    <MonthlyLetter2Component year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
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
                {selectedPages.buckettravel && (
                  <div id="modal-page-buckettravel" className="shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden shrink-0 bg-slate-900" style={{ width: `${pageWidth}px`, height: `${pageHeight}px` }}>
                    <BucketTravelComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                  </div>
                )}

                {/* 2. MACRO PLANNING (연간 읽기표 & 메인 달력 & 5주 개요) */}
                {selectedPages.biblemap && (
                  <div id="modal-page-biblemap" className="shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden shrink-0 bg-slate-900" style={{ width: `${pageWidth}px`, height: `${pageHeight}px` }}>
                    <BibleMapComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                  </div>
                )}
                {selectedPages.biblemap2 && (
                  <div id="modal-page-biblemap2" className="shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden shrink-0 bg-slate-900" style={{ width: `${pageWidth}px`, height: `${pageHeight}px` }}>
                    <BibleMap2Component year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                  </div>
                )}
                {selectedPages.calendar && (
                  <div id="modal-page-calendar" className="shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden shrink-0 bg-slate-900" style={{ width: `${pageWidth}px`, height: `${pageHeight}px` }}>
                    <CalendarComponent year={selectedYear} month={selectedMonth} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} isGeneralMode={categoryFilter !== 'church'} />
                  </div>
                )}
                {selectedPages.overview && (
                  <div id="modal-page-overview" className="shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden shrink-0 bg-slate-900" style={{ width: `${pageWidth}px`, height: `${pageHeight}px` }}>
                    <OverviewComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} isGeneralMode={categoryFilter !== 'church'} />
                  </div>
                )}

                {/* 3. LIFESTYLE & HABIT TRACKERS (습관, 웰니스, 가계부, 문화생활) */}
                {selectedPages.habit && (
                  <div id="modal-page-habit" className="shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden shrink-0 bg-slate-900" style={{ width: `${pageWidth}px`, height: `${pageHeight}px` }}>
                    <HabitComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                  </div>
                )}
                {selectedPages.habit2 && (
                  <div id="modal-page-habit2" className="shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden shrink-0 bg-slate-900" style={{ width: `${pageWidth}px`, height: `${pageHeight}px` }}>
                    <Habit2Component year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                  </div>
                )}
                {selectedPages.wellnessmood && (
                  <div id="modal-page-wellnessmood" className="shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden shrink-0 bg-slate-900" style={{ width: `${pageWidth}px`, height: `${pageHeight}px` }}>
                    <WellnessMoodComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
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

                {/* 4. MICRO EXECUTION: WEEKLY & DAILY CYCLE (주간 계획 + 7일 데일리 결합) */}
                {selectedPages.weekly && selectedPages.daily && (
                  Array.from({ length: totalDays }, (_, i) => i + 1).map((d) => {
                    const dayNamesShort = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
                    const dateObj = new Date(selectedYear, selectedMonth - 1, d)
                    const realDayName = dayNamesShort[dateObj.getDay()]
                    const currentWeek = Math.floor((d - 1) / 7) + 1
                    const isWeekStart = (d - 1) % 7 === 0
                    const wData = getWeekData(currentWeek)

                    return (
                      <React.Fragment key={`modal-cycle-${d}`}>
                        {isWeekStart && (
                          <div id={`modal-page-week-${currentWeek}`} className="shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden shrink-0 bg-slate-900" style={{ width: `${pageWidth}px`, height: `${pageHeight}px` }}>
                            <WeeklyComponent
                              year={selectedYear}
                              weekNum={currentWeek}
                              weekLabel={`${currentWeek}주차`}
                              dateRangeText={wData.dateRangeText}
                              daysInWeek={wData.daysInWeek}
                              monthName={monthName}
                              themeColor={activeColor}
                              pageWidth={pageWidth}
                              pageHeight={pageHeight}
                              isGeneralMode={categoryFilter !== 'church'}
                            />
                          </div>
                        )}
                        <div id={`modal-page-day-${d}`} className="shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden shrink-0 bg-slate-900" style={{ width: `${pageWidth}px`, height: `${pageHeight}px` }}>
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
                      </React.Fragment>
                    )
                  })
                )}

                {/* 5. REFLECTION & DEEP DIVE (감사, 필사, 묵상, 기도, 설교, 성령의 열매, KPT 성찰) */}
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
                {selectedPages.soapjournal && (
                  <div id="modal-page-soapjournal" className="shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden shrink-0 bg-slate-900" style={{ width: `${pageWidth}px`, height: `${pageHeight}px` }}>
                    <SoapJournalComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                  </div>
                )}
                {selectedPages.soapjournal2 && (
                  <div id="modal-page-soapjournal2" className="shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden shrink-0 bg-slate-900" style={{ width: `${pageWidth}px`, height: `${pageHeight}px` }}>
                    <SoapJournal2Component year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                  </div>
                )}
                {selectedPages.intercessory && (
                  <div id="modal-page-intercessory" className="shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden shrink-0 bg-slate-900" style={{ width: `${pageWidth}px`, height: `${pageHeight}px` }}>
                    <IntercessoryComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                  </div>
                )}
                {selectedPages.intercessory2 && (
                  <div id="modal-page-intercessory2" className="shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden shrink-0 bg-slate-900" style={{ width: `${pageWidth}px`, height: `${pageHeight}px` }}>
                    <Intercessory2Component year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                  </div>
                )}
                {selectedPages.prayer && (
                  <div id="modal-page-prayer" className="shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden shrink-0 bg-slate-900" style={{ width: `${pageWidth}px`, height: `${pageHeight}px` }}>
                    <PrayerComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                  </div>
                )}
                {selectedPages.prayer2 && (
                  <div id="modal-page-prayer2" className="shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden shrink-0 bg-slate-900" style={{ width: `${pageWidth}px`, height: `${pageHeight}px` }}>
                    <Prayer2Component year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                  </div>
                )}
                {selectedPages.scripture && (
                  <div id="modal-page-scripture" className="shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden shrink-0 bg-slate-900" style={{ width: `${pageWidth}px`, height: `${pageHeight}px` }}>
                    <ScriptureArtComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                  </div>
                )}
                {selectedPages.scripture2 && (
                  <div id="modal-page-scripture2" className="shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden shrink-0 bg-slate-900" style={{ width: `${pageWidth}px`, height: `${pageHeight}px` }}>
                    <ScriptureArt2Component year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                  </div>
                )}
                {selectedPages.fruitstracker && (
                  <div id="modal-page-fruitstracker" className="shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden shrink-0 bg-slate-900" style={{ width: `${pageWidth}px`, height: `${pageHeight}px` }}>
                    <FruitsTrackerComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                  </div>
                )}
                {selectedPages.sermon && (
                  Array.from({ length: 4 }, (_, i) => i + 1).map((sNo) => (
                    <div key={`modal-sermon-${sNo}`} id={`modal-page-sermon-${sNo}`} className="shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden shrink-0 bg-slate-900" style={{ width: `${pageWidth}px`, height: `${pageHeight}px` }}>
                      <SundaySermonComponent year={selectedYear} month={selectedMonth} sundayNo={sNo} sundayLabel={`${selectedMonth}월 ${sNo}주차 주일예배`} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                    </div>
                  ))
                )}
                {selectedPages.sermondeep && (
                  <div id="modal-page-sermondeep" className="shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden shrink-0 bg-slate-900" style={{ width: `${pageWidth}px`, height: `${pageHeight}px` }}>
                    <SundaySermonDeepComponent year={selectedYear} month={selectedMonth} sundayNo={1} dateStr="08/02" monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                  </div>
                )}
                {selectedPages.sundaygeneral && (
                  Array.from({ length: 4 }, (_, i) => i + 1).map((sNo) => (
                    <div key={`modal-sundaygeneral-${sNo}`} id={`modal-page-sundaygeneral-${sNo}`} className="shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden shrink-0 bg-slate-900" style={{ width: `${pageWidth}px`, height: `${pageHeight}px` }}>
                      <SundayGeneralComponent year={selectedYear} month={selectedMonth} sundayNo={sNo} sundayLabel={`${selectedMonth}월 ${sNo}주차 선데이 리셋`} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                    </div>
                  ))
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
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hidden Full PDF Assembly Render Container for Custom PDF Download */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0, opacity: 1, zIndex: -1 }}>
        <div ref={pdfContainerRef}>
          {/* 1. INTRO & VISION */}
          {selectedPages.letter && (
            <MonthlyLetterComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
          )}
          {selectedPages.letter2 && (
            <MonthlyLetter2Component year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
          )}
          {selectedPages.hundredgoal && (
            <HundredGoalComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
          )}
          {selectedPages.hundredgoal2 && (
            <HundredGoal2Component year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
          )}
          {selectedPages.buckettravel && (
            <BucketTravelComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
          )}

          {/* 2. MACRO PLANNING */}
          {selectedPages.biblemap && (
            <BibleMapComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
          )}
          {selectedPages.biblemap2 && (
            <BibleMap2Component year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
          )}
          {selectedPages.calendar && (
            <CalendarComponent year={selectedYear} month={selectedMonth} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} isGeneralMode={categoryFilter !== 'church'} />
          )}
          {selectedPages.overview && (
            <OverviewComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} isGeneralMode={categoryFilter !== 'church'} />
          )}

          {/* 3. LIFESTYLE & HABIT TRACKERS */}
          {selectedPages.habit && (
            <HabitComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
          )}
          {selectedPages.habit2 && (
            <Habit2Component year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
          )}
          {selectedPages.wellnessmood && (
            <WellnessMoodComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
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

          {/* 4. MICRO EXECUTION: WEEKLY & DAILY CYCLE */}
          {selectedPages.weekly && selectedPages.daily && (
            Array.from({ length: totalDays }, (_, i) => i + 1).map((d) => {
              const dayNamesShort = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
              const dateObj = new Date(selectedYear, selectedMonth - 1, d)
              const realDayName = dayNamesShort[dateObj.getDay()]
              const currentWeek = Math.floor((d - 1) / 7) + 1
              const isWeekStart = (d - 1) % 7 === 0
              const wData = getWeekData(currentWeek)

              return (
                <React.Fragment key={`pdf-cycle-${d}`}>
                  {isWeekStart && (
                    <WeeklyComponent
                      year={selectedYear}
                      weekNum={currentWeek}
                      weekLabel={`${currentWeek}주차`}
                      dateRangeText={wData.dateRangeText}
                      daysInWeek={wData.daysInWeek}
                      monthName={monthName}
                      themeColor={activeColor}
                      pageWidth={pageWidth}
                      pageHeight={pageHeight}
                      isGeneralMode={categoryFilter !== 'church'}
                    />
                  )}
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
                </React.Fragment>
              )
            })
          )}

          {/* 5. REFLECTION & DEEP DIVE */}
          {selectedPages.gratitude && (
            <GratitudeComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
          )}
          {selectedPages.quote && (
            <QuoteComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
          )}
          {selectedPages.soapjournal && (
            <SoapJournalComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
          )}
          {selectedPages.soapjournal2 && (
            <SoapJournal2Component year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
          )}
          {selectedPages.intercessory && (
            <IntercessoryComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
          )}
          {selectedPages.intercessory2 && (
            <Intercessory2Component year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
          )}
          {selectedPages.prayer && (
            <PrayerComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
          )}
          {selectedPages.prayer2 && (
            <Prayer2Component year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
          )}
          {selectedPages.scripture && (
            <ScriptureArtComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
          )}
          {selectedPages.scripture2 && (
            <ScriptureArt2Component year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
          )}
          {selectedPages.fruitstracker && (
            <FruitsTrackerComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
          )}
          {selectedPages.sermon && (
            Array.from({ length: 4 }, (_, i) => i + 1).map((sNo) => (
              <SundaySermonComponent key={`pdf-sermon-${sNo}`} year={selectedYear} month={selectedMonth} sundayNo={sNo} sundayLabel={`${selectedMonth}월 ${sNo}주차 주일예배`} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
            ))
          )}
          {selectedPages.sermondeep && (
            <SundaySermonDeepComponent year={selectedYear} month={selectedMonth} sundayNo={1} dateStr="08/02" monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
          )}
          {selectedPages.sundaygeneral && (
            Array.from({ length: 4 }, (_, i) => i + 1).map((sNo) => (
              <SundayGeneralComponent key={`pdf-sundaygeneral-${sNo}`} year={selectedYear} month={selectedMonth} sundayNo={sNo} sundayLabel={`${selectedMonth}월 ${sNo}주차 선데이 리셋`} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
            ))
          )}
          {selectedPages.kpt && (
            <KptComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
          )}
          {selectedPages.kpt2 && (
            <Kpt2Component year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
          )}
        </div>
      </div>
    </div>
  )
}
