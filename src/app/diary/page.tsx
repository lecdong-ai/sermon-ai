'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react'
import {
  Calendar as CalendarIcon, Download, Sparkles, BookOpen, Layers,
  ChevronLeft, ArrowLeft, RotateCcw, Check, FileText, Maximize2,
  X, ZoomIn, ZoomOut, Eye, Sliders, ArrowUp, List, ChevronDown, ChevronUp,
  GripHorizontal, Move, Pin, Palette, CheckSquare
} from 'lucide-react'
import Link from 'next/link'
import QtMonthlyCalendarPage from '@/components/advanced/QtMonthlyCalendarPage'
import QtMonthlyOverviewPage from '@/components/advanced/QtMonthlyOverviewPage'
import QtYearlyOverviewGridPage from '@/components/advanced/QtYearlyOverviewGridPage'
import QtWeeklyPlanPage from '@/components/advanced/QtWeeklyPlanPage'
import QtDailyDiaryPage from '@/components/advanced/QtDailyDiaryPage'
import QtMonthlyCalendarPortrait from '@/components/advanced/portrait/QtMonthlyCalendarPortrait'
import QtMonthlyOverviewPortrait from '@/components/advanced/portrait/QtMonthlyOverviewPortrait'
import QtYearlyOverviewGridPortrait from '@/components/advanced/portrait/QtYearlyOverviewGridPortrait'
import QtWeeklyPlanPortrait from '@/components/advanced/portrait/QtWeeklyPlanPortrait'
import QtDailyDiaryPortrait from '@/components/advanced/portrait/QtDailyDiaryPortrait'
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

// 신규 일반인용 6종 컴포넌트 임포트 (가로/세로)
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
import QtYearlyWallCalendarPage from '@/components/advanced/QtYearlyWallCalendarPage'

import { generateQtPdf, createMasterPdfContext, appendContainerPagesToMasterPdf, finalizeMasterPdfLinks, saveMasterPdf } from '@/lib/qtPdfGen'
import { PAGE_SIZES } from '@/lib/qtPdfSizes'
import YearlyBuilderModal, { YearlyMasterConfig } from '@/components/advanced/diary/YearlyBuilderModal'
import { DiaryPeriodProvider } from '@/components/advanced/diary/DiaryPeriodContext'

export interface ThemeItem {
  id: string
  name: string
  color: string
  category: 'watercolor' | 'modern'
  categoryName: string
}

const THEME_CATEGORIES = [
  { id: 'watercolor', name: '🌸 파스텔 수채화' },
  { id: 'modern', name: '✨ 모던 미니멀' },
]

const THEMES: ThemeItem[] = [
  // 1. 파스텔 수채화 컬렉션 (Soft Pastel Watercolor)
  { id: 'ocean-blue', name: '딥 오션 블루', color: '#4F7796', category: 'watercolor', categoryName: '파스텔 수채화' },
  { id: 'emerald-sage', name: '에메랄드 세이지', color: '#3B7A57', category: 'watercolor', categoryName: '파스텔 수채화' },
  { id: 'butter-gold', name: '버터 엠버', color: '#D99B26', category: 'watercolor', categoryName: '파스텔 수채화' },
  { id: 'royal-lavender', name: '로얄 라벤더', color: '#8E559E', category: 'watercolor', categoryName: '파스텔 수채화' },
  { id: 'coral-rose', name: '코랄 로즈', color: '#E05A47', category: 'watercolor', categoryName: '파스텔 수채화' },
  { id: 'sand-brown', name: '모카 샌드', color: '#9E6B4C', category: 'watercolor', categoryName: '파스텔 수채화' },
  { id: 'teal-mint', name: '민트 틸', color: '#2A9D8F', category: 'watercolor', categoryName: '파스텔 수채화' },
  { id: 'classic-charcoal', name: '클래식 차콜', color: '#334155', category: 'watercolor', categoryName: '파스텔 수채화' },

  // 2. 모던 미니멀 감성 컬렉션 (Modern Minimalist Luxury)
  { id: 'midnight-navy', name: '미드나잇 네이비', color: '#1E293B', category: 'modern', categoryName: '모던 미니멀' },
  { id: 'nordic-olive', name: '노르딕 올리브', color: '#4A5D4E', category: 'modern', categoryName: '모던 미니멀' },
  { id: 'vintage-bordeaux', name: '빈티지 보르도', color: '#722F37', category: 'modern', categoryName: '모던 미니멀' },
  { id: 'warm-taupe', name: '웜 토프 베이지', color: '#8C7A6B', category: 'modern', categoryName: '모던 미니멀' },
  { id: 'neon-cyan', name: '사이언 럭스', color: '#0891B2', category: 'modern', categoryName: '모던 미니멀' },
  { id: 'deep-plum', name: '디프 플럼 자수정', color: '#581C87', category: 'modern', categoryName: '모던 미니멀' },
  { id: 'terracotta-clay', name: '테라코타 클레이', color: '#C86D51', category: 'modern', categoryName: '모던 미니멀' },
  { id: 'forest-pine', name: '파인 딥 포레스트', color: '#1E4620', category: 'modern', categoryName: '모던 미니멀' },
]

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const CATEGORY_COUNTS = {
  all: 35,
  general: 20, // 기본 5종 + 갓생라이프 15종
  church: 20,  // 기본 5종 + 크리스천 영성 15종
  basic: 5,
}

export type PreviewTabType =
  | 'yearlygrid' | 'calendar' | 'overview' | 'weekly' | 'daily'
  | 'wallcalendar'
  | 'habit' | 'habit2' | 'gratitude' | 'quote' | 'budget' | 'budget2' | 'culture' | 'culture2' | 'kpt' | 'kpt2' | 'sundaygeneral'
  | 'buckettravel' | 'wellnessmood' | 'hundredgoal' | 'hundredgoal2'
  | 'prayer' | 'prayer2' | 'scripture' | 'scripture2' | 'sermon' | 'sermondeep' | 'biblemap' | 'biblemap2' | 'letter' | 'letter2'
  | 'intercessory' | 'intercessory2' | 'soapjournal' | 'soapjournal2' | 'fruitstracker'

export default function DiaryPage() {
  const [selectedYear, setSelectedYear] = useState(2026)
  const [selectedMonth, setSelectedMonth] = useState(8) // 기본 8월

  // ★ 연간 색인(17개월)에 반영할 제작 기간 (연간 일괄 생성 설정과 동기화)
  const [yearlyPeriod, setYearlyPeriod] = useState({
    startYear: 2026,
    startMonth: 8,
    endYear: 2027,
    endMonth: 12,
  })
  const diaryPeriodMonths = useMemo(() => {
    const months: { year: number; month: number }[] = []
    let cy = yearlyPeriod.startYear
    let cm = yearlyPeriod.startMonth
    while (cy < yearlyPeriod.endYear || (cy === yearlyPeriod.endYear && cm <= yearlyPeriod.endMonth)) {
      months.push({ year: cy, month: cm })
      cm++
      if (cm > 12) {
        cm = 1
        cy++
      }
    }
    return months
  }, [yearlyPeriod])

  // ★ 연간 마스터 그리드 2장(2026년 장 / 2027년 장) — 기간의 전체 달력 연도 목록
  const yearlyGridYears = useMemo(() => {
    const ys: number[] = []
    for (let y = yearlyPeriod.startYear; y <= yearlyPeriod.endYear; y++) ys.push(y)
    return ys
  }, [yearlyPeriod])
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0])
  const [activeThemeCategory, setActiveThemeCategory] = useState<'watercolor' | 'modern'>('watercolor')
  const [selectedSizeOption, setSelectedSizeOption] = useState('A4Landscape')
  const [isEcoPrint, setIsEcoPrint] = useState(false)
  const [previewTab, setPreviewTab] = useState<PreviewTabType>('yearlygrid')
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'general' | 'church' | 'basic'>('all')
  const [activeDayNum, setActiveDayNum] = useState(1)
  const [isPdfGenerating, setIsPdfGenerating] = useState(false)

  // ★ 연간 마스터 다이어리 직통 PDF 생성 상태
  const [isYearlyGenerating, setIsYearlyGenerating] = useState(false)
  const [yearlyProgress, setYearlyProgress] = useState({
    currentStep: 0,
    totalSteps: 0,
    currentMonthName: '',
    percentage: 0,
  })

  // ★ 연간 일괄 생성 시 연도 정렬 월력(벽달력) 페이지 렌더 상태 (기간 시작 반복에서 2026 2장, 연도 경계에서 2027 2장)
  const [activeWallChunks, setActiveWallChunks] = useState<{
    months: { year: number; month: number }[]
    index: number
    total: number
  }[] | null>(null)

  // ★ 연간 일괄 생성 반복 인덱스 (첫 반복에서만 연간 그리드 1장 렌더 → 17장 중복 방지)
  const [yearlyBatchIndex, setYearlyBatchIndex] = useState(-1)

  // ★ PDF 제작 시 포함할 내지 선택 (맞춤형 제작 체계)
  const [selectedPages, setSelectedPages] = useState<Record<string, boolean>>({
    yearlygrid: true,
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

  // ★ 신의 4가지 UX 스튜디오 모드 및 스텝 워크플로우 상태 변수
  const [layoutMode, setLayoutMode] = useState<'focus' | 'split' | 'cinema' | 'step'>('focus')
  const [activeWorkflowStep, setActiveWorkflowStep] = useState<1 | 2 | 3>(1)
  const [modalFullMaster, setModalFullMaster] = useState(false)

  // ★ 자유 발행 기간 & 개월 수 제어 상태 변수 (시작연, 시작월, 개월수)
  const [periodStartYear, setPeriodStartYear] = useState<number>(selectedYear)
  const [periodStartMonth, setPeriodStartMonth] = useState<number>(selectedMonth)
  const [periodDurationMonths, setPeriodDurationMonths] = useState<number>(17)

  // ★ 17개월 풀 다이어리 캔버스 연속 스트림 상태 변수
  const [isStreamView, setIsStreamView] = useState(false)

  // ★ 사용자가 지정한 자유 시작 연월부터 N개월 간의 전체 기간 월 목록 동적 계산
  const activePeriodMonths = useMemo(() => {
    const list: { year: number; month: number; label: string }[] = []
    let currY = periodStartYear
    let currM = periodStartMonth

    for (let i = 0; i < periodDurationMonths; i++) {
      list.push({
        year: currY,
        month: currM,
        label: `${String(currY).slice(2)}.${String(currM).padStart(2, '0')}`
      })
      currM++
      if (currM > 12) {
        currM = 1
        currY++
      }
    }
    return list
  }, [periodStartYear, periodStartMonth, periodDurationMonths])

  // ★ 플로팅 마우스 드래그 가능한 스마트 제어 패널 상태 변수
  const [showPreviewFloating, setShowPreviewFloating] = useState(true)
  const [showPageCheckerFloating, setShowPageCheckerFloating] = useState(true)
  const [isPageCheckerOpen, setIsPageCheckerOpen] = useState(true)
  const [isPreviewSelectorOpen, setIsPreviewSelectorOpen] = useState(true)

  const [previewPos, setPreviewPos] = useState({ x: 30, y: 110 })
  const [pageCheckerPos, setPageCheckerPos] = useState({ x: 360, y: 110 })
  const [presetPos, setPresetPos] = useState({ x: 0, y: 0 })
  const [yearMonthPos, setYearMonthPos] = useState({ x: 0, y: 0 })
  const [canvasPos, setCanvasPos] = useState({ x: 0, y: 0 })

  const [activeDragTarget, setActiveDragTarget] = useState<'preview' | 'checker' | 'preset' | 'yearmonth' | 'canvas' | null>(null)
  const dragStartOffset = useRef({ x: 0, y: 0 })

  const handlePointerDown = (e: React.PointerEvent, target: 'preview' | 'checker' | 'preset' | 'yearmonth' | 'canvas') => {
    setActiveDragTarget(target)
    let currentPos = { x: 0, y: 0 }
    if (target === 'preview') currentPos = previewPos
    else if (target === 'checker') currentPos = pageCheckerPos
    else if (target === 'preset') currentPos = presetPos
    else if (target === 'yearmonth') currentPos = yearMonthPos
    else if (target === 'canvas') currentPos = canvasPos

    dragStartOffset.current = {
      x: e.clientX - currentPos.x,
      y: e.clientY - currentPos.y,
    }
    const elem = e.currentTarget as HTMLElement
    if (elem.setPointerCapture) {
      try { elem.setPointerCapture(e.pointerId) } catch {}
    }
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!activeDragTarget) return
    const newX = e.clientX - dragStartOffset.current.x
    const newY = e.clientY - dragStartOffset.current.y

    if (activeDragTarget === 'preview') {
      setPreviewPos({ x: Math.max(10, Math.min(window.innerWidth - 320, newX)), y: Math.max(70, Math.min(window.innerHeight - 100, newY)) })
    } else if (activeDragTarget === 'checker') {
      setPageCheckerPos({ x: Math.max(10, Math.min(window.innerWidth - 320, newX)), y: Math.max(70, Math.min(window.innerHeight - 100, newY)) })
    } else if (activeDragTarget === 'preset') {
      setPresetPos({ x: newX, y: newY })
    } else if (activeDragTarget === 'yearmonth') {
      setYearMonthPos({ x: newX, y: newY })
    } else if (activeDragTarget === 'canvas') {
      setCanvasPos({ x: newX, y: newY })
    }
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (activeDragTarget) {
      const elem = e.currentTarget as HTMLElement
      if (elem.releasePointerCapture) {
        try { elem.releasePointerCapture(e.pointerId) } catch {}
      }
      setActiveDragTarget(null)
    }
  }

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

  // ★ 벽달력 미리보기: 선택 연도의 전체 12개월 → 6개월씩 2청크 (2026: JAN~JUN / JUL~DEC)
  const wallPreviewChunks = useMemo(() => {
    const chunks: { year: number; month: number }[][] = []
    for (let s = 1; s <= 12; s += 6) {
      const chunkMonths: { year: number; month: number }[] = []
      for (let m = s; m <= s + 5; m++) chunkMonths.push({ year: selectedYear, month: m })
      chunks.push(chunkMonths)
    }
    return chunks
  }, [selectedYear])

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
  const YearlyGridComponent = isLandscape ? QtYearlyOverviewGridPage : QtYearlyOverviewGridPortrait
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

  // 신규 컴포넌트 가로/세로 매핑
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

  // 🌟 Zero-Modal 직통 연간 마스터 PDF 다운로드 엔진 (상단 툴바 설정 100% 직통 즉시 가동)
  const handleDirectYearlyMaster = async () => {
    if (!pdfContainerRef.current) return
    setIsYearlyGenerating(true)

    // 상단 툴바에서 설정한 시작 연월 및 총 기간 개월 수로 마스터 캘린더 계산
    const endCalc = getEndYearMonth(periodStartYear, periodStartMonth, periodDurationMonths)
    const startY = periodStartYear
    const startM = periodStartMonth
    const endY = endCalc.year
    const endM = endCalc.month

    // 연간 색인(17개월/12개월 칩) 동기화
    setYearlyPeriod({
      startYear: startY,
      startMonth: startM,
      endYear: endY,
      endMonth: endM,
    })

    // React State DOM 적용 대기 (400ms 보장)
    await new Promise((resolve) => setTimeout(resolve, 400))

    // 시작 연월부터 종료 연월까지 선택 기간의 월 목록 구축
    const monthList: { year: number; month: number; label: string }[] = []
    let currY = startY
    let currM = startM

    while (currY < endY || (currY === endY && currM <= endM)) {
      monthList.push({
        year: currY,
        month: currM,
        label: `${currY}년 ${currM}월`
      })
      currM++
      if (currM > 12) {
        currM = 1
        currY++
      }
    }

    const totalSteps = monthList.length

    // ★ 연도 정렬 벽달력 청크: 각 연도 전체 12개월 → 6개월씩 2장
    const wallChunks: { year: number; month: number }[][] = []
    for (let y = startY; y <= endY; y++) {
      for (let s = 1; s <= 12; s += 6) {
        const chunkMonths: { year: number; month: number }[] = []
        for (let m = s; m <= s + 5; m++) chunkMonths.push({ year: y, month: m })
        wallChunks.push(chunkMonths)
      }
    }

    setYearlyProgress({ currentStep: 0, totalSteps, currentMonthName: '연간 PDF & 하이퍼링크 엔진 가동 중...', percentage: 0 })

    try {
      const masterCtx = createMasterPdfContext(selectedSizeOption)

      for (let i = 0; i < monthList.length; i++) {
        const target = monthList[i]
        const pct = Math.round(((i + 1) / totalSteps) * 90)
        setYearlyProgress({
          currentStep: i + 1,
          totalSteps,
          currentMonthName: `${target.label} 다이어리 렌더링 & 페이지 인덱싱 중...`,
          percentage: pct,
        })

        // ★ 벽달력 활성화: 청크의 첫 "기간 내" 월과 일치하는 반복에서 렌더
        let wallActive: { months: { year: number; month: number }[]; index: number; total: number }[] | null = null
        if (selectedPages.wallcalendar) {
          wallActive = wallChunks
            .map((chunk, ci) => {
              const firstInPeriod = chunk.find(
                (m) => m.year > startY || (m.year === startY && m.month >= startM)
              )
              if (!firstInPeriod) return { months: chunk, index: ci + 1, total: wallChunks.length }
              if (firstInPeriod.year === target.year && firstInPeriod.month === target.month) {
                return { months: chunk, index: ci + 1, total: wallChunks.length }
              }
              return null
            })
            .filter((c): c is { months: { year: number; month: number }[]; index: number; total: number } => c !== null)
          if (wallActive.length === 0) wallActive = null
        }
        setActiveWallChunks(wallActive)

        // 1. 상태(연도, 월) 변경하여 해당 월 DOM 새로 그리기
        setSelectedYear(target.year)
        setSelectedMonth(target.month)
        setYearlyBatchIndex(i)

        // 2. React DOM 렌더링 완성 대기 (첫 0번 배치 시 부록 렌더링 포함되어 550ms 보장)
        await new Promise((resolve) => setTimeout(resolve, i === 0 ? 550 : 350))

        // 3. 현재 월 DOM 페이지들을 Master Context에 순차 캡처 및 페이지 번호 인덱싱
        if (pdfContainerRef.current) {
          await appendContainerPagesToMasterPdf(masterCtx, pdfContainerRef.current, selectedSizeOption, target.year, target.month)
        }
      }

      // 4. 2-Pass: 모든 17개월 페이지 번호 매핑 완성 후 PDF 인터랙티브 하이퍼링크 일괄 주입
      setYearlyProgress({
        currentStep: totalSteps,
        totalSteps,
        currentMonthName: '✨ 17개월 스마트 하이퍼링크(월/날짜/주차) 100% 매핑 주입 중...',
        percentage: 95,
      })
      finalizeMasterPdfLinks(masterCtx)

      setYearlyProgress({
        currentStep: totalSteps,
        totalSteps,
        currentMonthName: '🎉 마스터 다이어리 생성 완료!',
        percentage: 100,
      })

      if (masterCtx.hasContent) {
        saveMasterPdf(
          masterCtx.pdf,
          `Master_Diary_${cfg.startYear}.${String(cfg.startMonth).padStart(2, '0')}-${cfg.endYear}.${String(cfg.endMonth).padStart(2, '0')}.pdf`
        )
      } else {
        alert('렌더링할 다이어리 페이지가 없습니다.')
      }
    } catch (e: any) {
      console.error(e)
      alert(`연간 마스터 PDF 생성 실패: ${e?.message || '알 수 없는 오류'}`)
    } finally {
      setIsYearlyGenerating(false)
      setIsYearlyModalOpen(false)
      setActiveWallChunks(null)
      setYearlyBatchIndex(-1)
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
      } else if (navTarget.startsWith('month-')) {
        // 벽달력/색인 월 카드·칩 클릭 → 해당 연월의 월간 달력으로 이동 (연도 포함 파싱)
        const mParts = navTarget.replace('month-', '').split('-')
        const mNum = Number(mParts[mParts.length - 1])
        if (!isNaN(mNum) && mNum >= 1 && mNum <= 12) {
          if (modalViewMode === 'single') {
            if (mParts.length === 2) {
              const yNum = Number(mParts[0])
              if (!isNaN(yNum) && yNum >= 2000 && yNum <= 2100) setSelectedYear(yNum)
            }
            setModalActiveTab('calendar')
            setSelectedMonth(mNum)
          } else {
            scrollToPageElement('modal-page-calendar')
          }
        }
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
      } else {
        if (modalViewMode === 'single') {
          setModalActiveTab(navTarget)
        } else {
          scrollToPageElement(`modal-page-${navTarget}`)
        }
        setPreviewTab(navTarget)
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
        yearlygrid: true,
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
        prayer: false,
        prayer2: false,
        scripture: false,
        scripture2: false,
        sermon: false,
        sermondeep: false,
        biblemap: false,
        biblemap2: false,
        letter: false,
        letter2: false,
        intercessory: false,
        intercessory2: false,
        soapjournal: false,
        soapjournal2: false,
        fruitstracker: false,
      })
      setCategoryFilter('general')
      setPreviewTab('yearlygrid')
    } else if (presetType === 'church') {
      setSelectedPages({
        yearlygrid: true,
        calendar: true,
        overview: true,
        weekly: true,
        daily: true,
        habit: false,
        habit2: false,
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
        prayer2: true,
        scripture: true,
        scripture2: true,
        sermon: true,
        sermondeep: true,
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
      setCategoryFilter('church')
      setPreviewTab('yearlygrid')
    } else if (presetType === 'basic') {
      setSelectedPages({
        yearlygrid: true,
        calendar: true,
        overview: true,
        weekly: true,
        daily: true,
        habit: false,
        habit2: false,
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
        prayer2: false,
        scripture: false,
        scripture2: false,
        sermon: false,
        sermondeep: false,
        biblemap: false,
        biblemap2: false,
        letter: false,
        letter2: false,
        intercessory: false,
        intercessory2: false,
        soapjournal: false,
        soapjournal2: false,
        fruitstracker: false,
      })
      setCategoryFilter('basic')
      setPreviewTab('yearlygrid')
    } else {
      setSelectedPages({
        yearlygrid: true,
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
        sermondeep: true,
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
      setCategoryFilter('all')
      setPreviewTab('buckettravel')
    }
  }

  const activeSelectedCount = Object.values(selectedPages).filter(Boolean).length
  const estimatedPdfPages = (selectedPages.weekly && selectedPages.daily ? totalDays + 5 : 0) + activeSelectedCount - (selectedPages.weekly && selectedPages.daily ? 2 : 0)

  return (
    <DiaryPeriodProvider periodMonths={diaryPeriodMonths} currentYear={selectedYear} currentMonth={selectedMonth}>
      <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* 1. Divine Luxury Top Studio Bar (Centered Balance & State-of-the-Art Glassmorphism) */}
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-slate-950/85 backdrop-blur-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
        <div className="max-w-[1650px] mx-auto px-6 py-2.5 flex flex-wrap items-center justify-between gap-4">
          
          {/* Left: Studio Title & Back Link */}
          <div className="flex items-center space-x-3 shrink-0">
            <Link
              href="/advanced/qt"
              className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white transition-all duration-200 flex items-center gap-1.5 text-xs font-semibold shadow-inner group hover:border-indigo-400/40"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-indigo-400 group-hover:-translate-x-1 transition-transform" />
              <span>QT 스튜디오</span>
            </Link>

            <div className="h-4 w-px bg-white/15" />

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 via-indigo-500 to-purple-600 p-0.5 shadow-lg shadow-indigo-500/25">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                </div>
              </div>
              <div>
                <h1 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-2">
                  다이어리 제작 스튜디오
                  <span className="text-[9.5px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 tracking-wider">
                    STUDIO 2.5
                  </span>
                </h1>
                <p className="text-[10px] text-slate-400 font-medium tracking-tight">
                  {selectedYear}.{String(selectedMonth).padStart(2, '0')} · {sizeLabel} · 내지 {activeSelectedCount}종 선택 ({estimatedPdfPages}p)
                </p>
              </div>
            </div>
          </div>

          {/* Center: 🎨 4가지 UX 레이아웃 스위처 (Perfect Center Symmetry) */}
          <div className="flex items-center justify-center flex-1 mx-auto">
            <div className="flex items-center bg-slate-950/90 p-1 rounded-xl border border-white/15 text-xs font-bold gap-1 shadow-inner">
              <span className="text-[10px] text-slate-400 px-2 font-mono flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-slate-400" />
                UX모드:
              </span>
              <button
                type="button"
                onClick={() => setLayoutMode('focus')}
                className={`px-3 py-1 rounded-lg transition-all text-xs cursor-pointer ${
                  layoutMode === 'focus'
                    ? 'bg-slate-800 text-slate-100 font-bold border border-slate-600 shadow-sm scale-[1.02]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
                title="1. 황금비 Focus Studio 모드"
              >
                🌟 황금비
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode('split')}
                className={`px-3 py-1 rounded-lg transition-all text-xs cursor-pointer ${
                  layoutMode === 'split'
                    ? 'bg-slate-800 text-slate-100 font-bold border border-slate-600 shadow-sm scale-[1.02]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
                title="2. 🗂️ 2-컬럼 대시보드 모드"
              >
                🗂️ 2-컬럼
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode('cinema')}
                className={`px-3 py-1 rounded-lg transition-all text-xs cursor-pointer ${
                  layoutMode === 'cinema'
                    ? 'bg-slate-800 text-slate-100 font-bold border border-slate-600 shadow-sm scale-[1.02]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
                title="3. 🖼️ 시네마틱 캔버스 무대 모드"
              >
                🖼️ 시네마
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode('step')}
                className={`px-3 py-1 rounded-lg transition-all text-xs cursor-pointer ${
                  layoutMode === 'step'
                    ? 'bg-slate-800 text-slate-100 font-bold border border-slate-600 shadow-sm scale-[1.02]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
                title="4. 📑 3단계 스텝 바이 스텝 모드"
              >
                📑 스텝 탭
              </button>
            </div>
          </div>

          {/* Right: Studio Action Buttons */}
          <div className="flex items-center justify-end flex-wrap gap-2 shrink-0">
            {/* 미리보기 패널 토글 버튼 */}
            <button
              onClick={() => setShowPreviewFloating(!showPreviewFloating)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 border cursor-pointer ${
                showPreviewFloating
                  ? 'bg-slate-800/90 text-slate-100 border-slate-500 shadow-sm scale-[1.01]'
                  : 'bg-slate-900/80 text-slate-400 border-white/10 hover:border-slate-500 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              <span>미리보기</span>
            </button>

            {/* 내지 구성 선택 플로팅 창 토글 버튼 */}
            <button
              onClick={() => setShowPageCheckerFloating(!showPageCheckerFloating)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 border cursor-pointer ${
                showPageCheckerFloating
                  ? 'bg-slate-800/90 text-amber-300/90 border-slate-500 shadow-sm scale-[1.01]'
                  : 'bg-slate-900/80 text-slate-400 border-white/10 hover:border-slate-500 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-amber-400/80" />
              <span>내지 구성 ({activeSelectedCount}종)</span>
            </button>

            {/* 전체화면 팝업 뷰어 버튼 */}
            <button
              onClick={() => setIsFullscreenModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-white/10 text-xs font-semibold transition-all duration-200 shadow-sm hover:border-slate-500 hover:text-white cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
              <span>전체화면</span>
            </button>

            {/* 연간 마스터 다이어리 일괄 제작 버튼 */}
            <button
              onClick={() => setIsYearlyModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-amber-300/90 border border-amber-500/30 hover:border-amber-400/50 text-xs font-bold transition-all duration-200 shadow-sm cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400/80" />
              <span>연간 제작</span>
            </button>

            {/* PDF 다운로드 메인 CTA 버튼 */}
            <button
              onClick={handleDownloadFullPdf}
              disabled={isPdfGenerating}
              className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-amber-300 font-bold text-xs shadow-md border border-amber-500/40 hover:border-amber-400 transition-all duration-200 disabled:opacity-50 cursor-pointer ml-1"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>{isPdfGenerating ? 'PDF 제작 중...' : `PDF 다운로드 (${estimatedPdfPages}p)`}</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Studio Professional Workspace Layout (Dynamic 4-Dimension UX Mode Switcher) */}
      <div className="flex-1 max-w-[1600px] mx-auto w-full p-6">
        
        {/* ★ MODE 4: Step Workflow 1-2-3 Navigation Bar (Muted Slate Tone) */}
        {layoutMode === 'step' && (
          <div className="mb-6 bg-slate-900/90 border border-white/10 p-2 rounded-2xl shadow-xl flex items-center justify-between gap-2 backdrop-blur-xl">
            <button
              onClick={() => setActiveWorkflowStep(1)}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
                activeWorkflowStep === 1
                  ? 'bg-slate-800 text-slate-100 font-bold border-slate-500 shadow-sm scale-[1.01]'
                  : 'bg-slate-950/60 text-slate-400 border-white/10 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-slate-950/50 flex items-center justify-center text-[11px] font-extrabold text-slate-300">1</span>
              <span>📅 Step 1: 컨셉 & 발행 연월 설정</span>
            </button>

            <button
              onClick={() => setActiveWorkflowStep(2)}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
                activeWorkflowStep === 2
                  ? 'bg-slate-800 text-slate-100 font-bold border-slate-500 shadow-sm scale-[1.01]'
                  : 'bg-slate-950/60 text-slate-400 border-white/10 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-slate-950/50 flex items-center justify-center text-[11px] font-extrabold text-slate-300">2</span>
              <span>📑 Step 2: 내지 구성 선택 ({activeSelectedCount}종)</span>
            </button>

            <button
              onClick={() => setActiveWorkflowStep(3)}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
                activeWorkflowStep === 3
                  ? 'bg-slate-800 text-slate-100 font-bold border-slate-500 shadow-sm scale-[1.01]'
                  : 'bg-slate-950/60 text-slate-400 border-white/10 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-slate-950/50 flex items-center justify-center text-[11px] font-extrabold text-slate-300">3</span>
              <span>🎨 Step 3: 라이브 캔버스 검수 & PDF 발행</span>
            </button>
          </div>
        )}

        {/* MODE 1: Focus Studio (3:9 Grid) / MODE 2: Split Lounge (4:8 Grid) */}
        {(layoutMode === 'focus' || layoutMode === 'split' || (layoutMode === 'step' && activeWorkflowStep !== 2)) && (
          <div className="grid grid-cols-12 gap-6">
            {/* Left Control Column (Focus: 3 cols, Split: 4 cols, Step 1: 12 cols, Step 3: Hidden) */}
            {(layoutMode !== 'step' || activeWorkflowStep === 1) && (
              <div className={`${layoutMode === 'step' ? 'col-span-12 max-w-3xl mx-auto' : layoutMode === 'split' ? 'col-span-12 lg:col-span-4' : 'col-span-12 lg:col-span-3'} space-y-3`}>
                
                {/* Module 1: 1-Click Presets */}
                <div
                  style={{ transform: `translate3d(${presetPos.x}px, ${presetPos.y}px, 0px)` }}
                  className={`p-3.5 rounded-2xl bg-slate-900/85 border space-y-2 backdrop-blur-md transition-shadow duration-200 select-none ${
                    activeDragTarget === 'preset'
                      ? 'z-50 border-emerald-400 shadow-[0_30px_70px_rgba(0,0,0,0.85)] ring-2 ring-emerald-400/40 scale-[1.01]'
                      : 'border-white/10 shadow-2xl hover:border-emerald-400/50 hover:shadow-[0_20px_40px_rgba(16,185,129,0.15)]'
                  }`}
                >
                  <div
                    onPointerDown={(e) => handlePointerDown(e, 'preset')}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    className="flex items-center justify-between cursor-grab active:cursor-grabbing select-none pb-1.5 border-b border-white/10 group"
                    title="마우스로 잡고 어디든 자유롭게 이동"
                  >
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <GripHorizontal className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      원클릭 구성 프리셋
                    </h3>
                    <span className="text-[9.5px] font-mono text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/30 shadow-xs">
                      🖱️ 잡고 드래그
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-1.5 text-xs pt-1">
                    <button
                      onClick={() => applyPreset('general')}
                      className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold transition-all text-left flex items-center justify-between group"
                    >
                      <span>🌿 일반인 갓생 팩 (20종)</span>
                      <span className="text-[9.5px] font-normal text-slate-400">기본5+갓생15</span>
                    </button>

                    <button
                      onClick={() => applyPreset('church')}
                      className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold transition-all text-left flex items-center justify-between group"
                    >
                      <span>⛪ 크리스천 묵상 팩 (20종)</span>
                      <span className="text-[9.5px] font-normal text-slate-400">기본5+영성15</span>
                    </button>

                    <button
                      onClick={() => applyPreset('basic')}
                      className="p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 font-bold transition-all text-left flex items-center justify-between group"
                    >
                      <span>📅 미니멀 기본 팩 (5종)</span>
                      <span className="text-[9.5px] font-normal text-slate-400">핵심 5종</span>
                    </button>

                    <button
                      onClick={() => applyPreset('all')}
                      className="p-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 font-bold transition-all text-left flex items-center justify-between group"
                    >
                      <span>✨ 전체 수집 팩 (35종)</span>
                      <span className="text-[9.5px] font-normal text-slate-400">전체 35종</span>
                    </button>
                  </div>
                </div>

                {/* Module 2: Year, Month, Theme & Paper Controls */}
                <div
                  style={{ transform: `translate3d(${yearMonthPos.x}px, ${yearMonthPos.y}px, 0px)` }}
                  className={`p-3.5 rounded-2xl bg-slate-900/85 border space-y-3 backdrop-blur-md transition-shadow duration-200 select-none ${
                    activeDragTarget === 'yearmonth'
                      ? 'z-50 border-indigo-400 shadow-[0_30px_70px_rgba(0,0,0,0.85)] ring-2 ring-indigo-400/40 scale-[1.01]'
                      : 'border-white/10 shadow-2xl hover:border-indigo-400/50 hover:shadow-[0_20px_40px_rgba(99,102,241,0.15)]'
                  }`}
                >
                  {/* Draggable Title Header */}
                  <div
                    onPointerDown={(e) => handlePointerDown(e, 'yearmonth')}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    className="flex items-center justify-between cursor-grab active:cursor-grabbing select-none pb-1.5 border-b border-white/10 group"
                    title="마우스로 잡고 어디든 자유롭게 이동"
                  >
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <GripHorizontal className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                      <CalendarIcon className="w-3.5 h-3.5 text-indigo-400" />
                      발행 연월 ({selectedYear}.{String(selectedMonth).padStart(2, '0')})
                    </span>
                    <span className="text-[9.5px] font-mono text-indigo-300 bg-indigo-500/20 px-1.5 py-0.5 rounded border border-indigo-500/30 shadow-xs">
                      🖱️ 잡고 드래그
                    </span>
                  </div>

                  {/* Year & Month Picker */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold text-slate-400">연도 선택</span>
                      <div className="flex items-center gap-0.5 text-[10.5px]">
                        {[2025, 2026, 2027, 2028].map((yr) => (
                          <button
                            key={yr}
                            onClick={() => setSelectedYear(yr)}
                            className={`px-1.5 py-0.5 rounded-md font-bold border transition-all ${
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
                          className={`py-1 rounded-md text-[11px] font-bold border transition-all ${
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

                  {/* Theme Collection Selector */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <Palette className="w-3.5 h-3.5 text-indigo-400" />
                        컬러 테마
                      </span>
                      <span className="text-[10px] text-amber-300 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 truncate max-w-[110px]">
                        {selectedTheme.name}
                      </span>
                    </div>

                    {/* Theme Category Tabs */}
                    <div className="flex items-center gap-1 p-0.5 bg-slate-950/80 rounded-xl border border-white/10 text-[10px] font-bold">
                      {THEME_CATEGORIES.map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => setActiveThemeCategory(cat.id as any)}
                          className={`flex-1 py-1 rounded-lg transition-all ${
                            activeThemeCategory === cat.id
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>

                    {/* Theme Grid */}
                    <div className="grid grid-cols-4 gap-1">
                      {THEMES.filter(t => t.category === activeThemeCategory).map((t) => {
                        const isSel = selectedTheme.id === t.id
                        return (
                          <button
                            key={t.id}
                            onClick={() => setSelectedTheme(t)}
                            className={`p-1 rounded-lg border flex flex-col items-center gap-0.5 transition-all ${
                              isSel
                                ? 'bg-indigo-600/30 border-indigo-400 ring-1 ring-indigo-400/40 shadow-sm'
                                : 'bg-white/5 border-white/10 hover:bg-white/10'
                            }`}
                            title={t.name}
                          >
                            <div className="w-3.5 h-3.5 rounded-full border border-white/30 shadow-xs" style={{ backgroundColor: t.color }} />
                            <span className="text-[9px] font-medium text-slate-300 truncate w-full text-center">
                              {t.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="h-px bg-white/10" />

                  {/* Paper Size Options (Neat 2-Line Stacked Display) */}
                  <div className="space-y-2 text-xs pt-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-300 flex items-center gap-1.5 text-[11px]">
                        <FileText className="w-3.5 h-3.5 text-indigo-400" />
                        용지 규격 선택
                      </span>
                      <span className="text-[10px] font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-bold">
                        {sizeLabel}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-1.5">
                      {Object.keys(PAGE_SIZES).map((sz) => {
                        const item = PAGE_SIZES[sz]
                        const isSel = selectedSizeOption === sz
                        const labelPart = item?.label?.split(' (')[0] || sz
                        const dimPart = item?.label?.includes('(') ? item.label.split('(')[1].replace(')', '') : ''

                        return (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => setSelectedSizeOption(sz)}
                            className={`p-2 rounded-xl border transition-all text-left flex flex-col justify-center gap-0.5 cursor-pointer ${
                              isSel
                                ? 'bg-slate-800 border-amber-400/80 text-amber-200 shadow-md ring-1 ring-amber-400/30'
                                : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/10'
                            }`}
                          >
                            <span className="text-[11px] font-extrabold tracking-tight text-slate-100 flex items-center justify-between">
                              <span>{labelPart}</span>
                              {isSel && <Check className="w-3 h-3 text-amber-400 shrink-0" />}
                            </span>
                            {dimPart && (
                              <span className={`text-[9.5px] font-mono font-medium ${isSel ? 'text-amber-300/80' : 'text-slate-400'}`}>
                                {dimPart}
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* ★ 2-컬럼 (Split Mode) 일 때 내지 선택 체크리스트를 좌측 패널에 직접 임베드 안착 */}
                {layoutMode === 'split' && (
                  <div className="p-3.5 rounded-2xl bg-slate-900/85 border border-indigo-500/30 space-y-2 backdrop-blur-md shadow-2xl">
                    <div className="flex items-center justify-between pb-1 border-b border-white/10">
                      <h3 className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                        <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
                        <span>통합 내지 구성 체크리스트</span>
                      </h3>
                      <span className="text-[10px] text-amber-300 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                        {activeSelectedCount}종 선택
                      </span>
                    </div>

                    <div className="max-h-72 overflow-y-auto custom-scrollbar space-y-1 pr-1 text-xs">
                      {Object.keys(selectedPages).map((pk) => {
                        const isChecked = selectedPages[pk as keyof typeof selectedPages]
                        return (
                          <label
                            key={`embedded-split-${pk}`}
                            className={`flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                              isChecked
                                ? 'bg-indigo-600/20 border-indigo-400/50 text-indigo-200 font-bold'
                                : 'bg-white/5 border-white/5 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <span className="truncate pr-2 font-medium">{pk} 내지</span>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => setSelectedPages({ ...selectedPages, [pk]: e.target.checked })}
                              className="rounded border-slate-700 bg-slate-900 text-amber-400 focus:ring-amber-400 w-4 h-4 cursor-pointer"
                            />
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Right Canvas Column (Focus: 9 cols, Split: 8 cols, Step 3: 12 cols) */}
            {(layoutMode !== 'step' || activeWorkflowStep === 3) && (
              <div className={`${layoutMode === 'step' ? 'col-span-12' : layoutMode === 'split' ? 'col-span-12 lg:col-span-8' : 'col-span-12 lg:col-span-9'} flex flex-col items-center justify-start`}>
                {(() => {
                  const canvasScale = isLandscape ? 0.72 : 0.58
                  const canvasW = Math.round(pageWidth * canvasScale)
                  const canvasH = Math.round(pageHeight * canvasScale)
                  const previewStackFactor = previewTab === 'yearlygrid' || previewTab === 'wallcalendar' ? 2 : 1
                  const containerW = canvasW + 32

                  return (
                    <div
                      style={{
                        width: `${containerW}px`,
                        maxWidth: '100%',
                        transform: `translate3d(${canvasPos.x}px, ${canvasPos.y}px, 0px)`,
                      }}
                      className={`flex flex-col items-center mx-auto space-y-3 transition-shadow duration-200 ${
                        activeDragTarget === 'canvas' ? 'z-50 shadow-[0_30px_70px_rgba(0,0,0,0.85)] scale-[1.005]' : ''
                      }`}
                    >
                      {/* Top Canvas Toolbar with Drag Grip Handle & 17-Month Period Timeline */}
                      <div className="w-full text-xs space-y-2">
                        {/* 🌟 Divine Luxury Master Period Controller & Timeline Slider Toolbar */}
                        <div className="w-full bg-slate-950/90 border border-slate-700/80 p-2 rounded-2xl shadow-[0_15px_35px_rgba(0,0,0,0.8)] flex flex-wrap items-center justify-between gap-2 backdrop-blur-xl">
                          {/* Left Group: Premium Glass Period Selectors */}
                          <div className="flex items-center gap-2 flex-wrap shrink-0">
                            {/* 1. 시작 연/월 럭셔리 알약 캡슐 */}
                            <div className="flex items-center gap-1.5 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-700/70 text-xs font-bold text-slate-200 shadow-inner">
                              <CalendarIcon className="w-3.5 h-3.5 text-amber-400" />
                              <span className="text-[11px] text-slate-400 font-medium">시작:</span>
                              
                              {/* 연도 드롭다운 */}
                              <div className="relative flex items-center">
                                <select
                                  value={periodStartYear}
                                  onChange={(e) => {
                                    const y = Number(e.target.value)
                                    setPeriodStartYear(y)
                                    setSelectedYear(y)
                                  }}
                                  className="appearance-none bg-slate-950 text-amber-300 border border-amber-500/30 hover:border-amber-400/60 rounded-lg pl-2 pr-5 py-0.5 text-xs font-mono font-bold cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-400 transition-colors"
                                >
                                  {[2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
                                    <option key={y} value={y} className="bg-slate-900 text-slate-100">{y}년</option>
                                  ))}
                                </select>
                                <ChevronDown className="w-3 h-3 text-amber-400 absolute right-1.5 pointer-events-none" />
                              </div>

                              {/* 월 드롭다운 */}
                              <div className="relative flex items-center">
                                <select
                                  value={periodStartMonth}
                                  onChange={(e) => {
                                    const m = Number(e.target.value)
                                    setPeriodStartMonth(m)
                                    setSelectedMonth(m)
                                    setActiveDayNum(1)
                                  }}
                                  className="appearance-none bg-slate-950 text-amber-300 border border-amber-500/30 hover:border-amber-400/60 rounded-lg pl-2 pr-5 py-0.5 text-xs font-mono font-bold cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-400 transition-colors"
                                >
                                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                                    <option key={m} value={m} className="bg-slate-900 text-slate-100">{String(m).padStart(2, '0')}월</option>
                                  ))}
                                </select>
                                <ChevronDown className="w-3 h-3 text-amber-400 absolute right-1.5 pointer-events-none" />
                              </div>
                            </div>

                            {/* 2. 유동 개월 수 카운터 & 빠른 프리셋 칩 */}
                            <div className="flex items-center gap-1.5 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-700/70 text-xs font-bold text-slate-200 shadow-inner">
                              <span className="text-[11px] text-slate-400 font-medium">기간:</span>
                              
                              {/* Step Counter */}
                              <div className="flex items-center bg-slate-950 px-1.5 py-0.5 rounded-lg border border-amber-500/30">
                                <button
                                  type="button"
                                  onClick={() => setPeriodDurationMonths((m) => Math.max(1, m - 1))}
                                  className="w-5 h-5 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-300 font-black text-sm flex items-center justify-center transition-colors cursor-pointer"
                                  title="1개월 줄이기"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  min={1}
                                  max={36}
                                  value={periodDurationMonths}
                                  onChange={(e) => setPeriodDurationMonths(Math.max(1, Math.min(36, Number(e.target.value) || 1)))}
                                  className="w-7 text-center bg-transparent text-amber-300 text-xs font-extrabold font-mono focus:outline-none"
                                />
                                <span className="text-[10px] text-slate-400 font-normal pr-1">개월</span>
                                <button
                                  type="button"
                                  onClick={() => setPeriodDurationMonths((m) => Math.min(36, m + 1))}
                                  className="w-5 h-5 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-300 font-black text-sm flex items-center justify-center transition-colors cursor-pointer"
                                  title="1개월 늘리기"
                                >
                                  +
                                </button>
                              </div>

                              {/* Quick Preset Segmented Buttons */}
                              <div className="flex items-center gap-1 ml-1 pl-1 border-l border-white/10">
                                {[
                                  { label: '6개월', months: 6 },
                                  { label: '1년치(12m)', months: 12 },
                                  { label: '마스터(17m)', months: 17 },
                                  { label: '2년치(24m)', months: 24 },
                                ].map((p) => (
                                  <button
                                    key={`preset-${p.months}`}
                                    type="button"
                                    onClick={() => setPeriodDurationMonths(p.months)}
                                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                                      periodDurationMonths === p.months
                                        ? 'bg-slate-800 text-amber-300 border border-slate-600 shadow-sm'
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                                    }`}
                                  >
                                    {p.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Right Group: Full Stream View Toggle & Direct Zero-Modal Master PDF Download */}
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => setIsStreamView(!isStreamView)}
                              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer border flex items-center gap-1.5 shadow-md ${
                                isStreamView
                                  ? 'bg-slate-800 text-slate-100 border-slate-600 scale-[1.01]'
                                  : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:border-slate-500 hover:text-white'
                              }`}
                            >
                              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                              <span>{isStreamView ? '📖 1개월 단일 뷰' : `✨ ${periodDurationMonths}개월 풀 스트림 뷰`}</span>
                            </button>

                            {/* 🌟 Zero-Modal 직통 연간 마스터 PDF 원클릭 구동 버튼 */}
                            <button
                              type="button"
                              disabled={isYearlyGenerating}
                              onClick={handleDirectYearlyMaster}
                              className="px-4 py-1.5 rounded-xl text-xs font-extrabold text-slate-950 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 hover:from-amber-200 hover:to-amber-400 border border-amber-300/80 shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_25px_rgba(245,158,11,0.6)] active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                            >
                              {isYearlyGenerating ? (
                                <>
                                  <div className="w-3.5 h-3.5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                                  <span>PDF 매핑 생성 중 ({yearlyProgress.percentage}%)...</span>
                                </>
                              ) : (
                                <>
                                  <Download className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />
                                  <span>✨ {periodDurationMonths}개월 마스터 PDF 다운로드</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* 3. 실시간 타임라인 월 칩 슬라이더 리본 */}
                        <div className="w-full bg-slate-950/80 border border-white/10 p-1 rounded-xl shadow-lg flex items-center gap-1 overflow-x-auto custom-scrollbar backdrop-blur-md">
                          <span className="text-[10px] text-slate-400 font-mono font-semibold px-2 shrink-0 flex items-center gap-1">
                            <span>타임라인:</span>
                          </span>
                          <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar flex-1 py-0.5">
                            {activePeriodMonths.map((mObj) => {
                              const isSel = selectedYear === mObj.year && selectedMonth === mObj.month
                              return (
                                <button
                                  key={`timeline-${mObj.year}-${mObj.month}`}
                                  type="button"
                                  onClick={() => {
                                    setSelectedYear(mObj.year)
                                    setSelectedMonth(mObj.month)
                                    setActiveDayNum(1)
                                  }}
                                  className={`px-2.5 py-1 rounded-lg text-[10.5px] font-mono font-bold border transition-all cursor-pointer whitespace-nowrap ${
                                    isSel
                                      ? 'bg-slate-800 text-amber-200 border-slate-500 shadow-sm scale-[1.02]'
                                      : 'bg-slate-950/60 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                                  }`}
                                >
                                  {mObj.label}
                                </button>
                              )
                            })}
                          </div>
                        </div>

                        {/* Draggable Header */}
                        <div
                          onPointerDown={(e) => handlePointerDown(e, 'canvas')}
                          onPointerMove={handlePointerMove}
                          onPointerUp={handlePointerUp}
                          className="flex items-center justify-between p-1.5 bg-slate-900/90 rounded-xl border border-white/15 cursor-grab active:cursor-grabbing select-none shadow-lg group"
                          title="마우스로 잡고 전체 캔버스 어디든 자유롭게 이동"
                        >
                          <div className="flex items-center gap-2">
                            <GripHorizontal className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                            <span className="font-semibold text-slate-300 flex items-center gap-1.5 text-xs">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                              스튜디오 라이브 캔버스 ({selectedYear}.{String(selectedMonth).padStart(2, '0')})
                            </span>
                            <span className="text-[10px] font-mono text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/30">
                              🖱️ 캔버스 드래그
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Eco print toggle button */}
                            <button
                              onClick={() => setIsEcoPrint(!isEcoPrint)}
                              className={`px-2 py-1 rounded-lg border text-[10.5px] font-bold transition-all flex items-center gap-1 ${
                                isEcoPrint
                                  ? 'bg-emerald-600/20 border-emerald-400 text-emerald-300'
                                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                              }`}
                            >
                              <span>🌿 잉크 절약:</span>
                              <span>{isEcoPrint ? 'ON' : 'OFF'}</span>
                            </button>

                            <button
                              onClick={() => {
                                setModalActiveTab(previewTab)
                                setIsFullscreenModalOpen(true)
                              }}
                              className="text-amber-400 hover:text-amber-300 font-bold text-[10.5px] flex items-center gap-1 transition-all hover:underline"
                            >
                              <Maximize2 className="w-3.5 h-3.5" />
                              전체화면
                            </button>
                          </div>
                        </div>

                        {/* Compact 1-Row Gold Ribbon Controller */}
                        <div className="w-full bg-slate-950/95 border border-white/15 p-1 rounded-2xl shadow-2xl flex items-center justify-between gap-1 backdrop-blur-md">
                          {(categoryFilter === 'church'
                            ? [
                                { id: 'yearlygrid', icon: '📅', name: '연간 캘린더' },
                                { id: 'wallcalendar', icon: '🖼️', name: '연간 벽달력' },
                                { id: 'calendar', icon: '🗓️', name: '월간 달력' },
                                { id: 'overview', icon: '📑', name: '월간 개요' },
                                { id: 'soapjournal', icon: '📖', name: 'SOAP 묵상' },
                                { id: 'intercessory', icon: '🙏', name: '중보 기도' },
                                { id: 'sermon', icon: '🎤', name: '주일 설교' },
                                { id: 'weekly', icon: '📋', name: '주간 계획' },
                                { id: 'daily', icon: '📓', name: '일간 일기' },
                              ]
                            : [
                                { id: 'yearlygrid', icon: '📅', name: '연간 캘린더' },
                                { id: 'wallcalendar', icon: '🖼️', name: '연간 벽달력' },
                                { id: 'calendar', icon: '🗓️', name: '월간 달력' },
                                { id: 'overview', icon: '📑', name: '월간 개요' },
                                { id: 'habit', icon: '🌱', name: '습관 트래커' },
                                { id: 'budget', icon: '💰', name: '지출 가계부' },
                                { id: 'kpt', icon: '🔄', name: 'KPT 회고' },
                                { id: 'weekly', icon: '📋', name: '주간 계획' },
                                { id: 'daily', icon: '📓', name: '일간 일기' },
                              ]
                          ).map((chip) => {
                            const isActive = previewTab === chip.id
                            return (
                              <button
                                key={chip.id}
                                type="button"
                                onClick={() => setPreviewTab(chip.id as any)}
                                className={`flex-1 py-1.5 px-0.5 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-0.5 border whitespace-nowrap shrink-0 ${
                                  isActive
                                    ? 'bg-slate-800 text-amber-200 font-bold border-slate-500 shadow-sm scale-[1.01] z-10'
                                    : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/90 border-white/5'
                                }`}
                                title={`${chip.name} 미리보기`}
                              >
                                <span className="text-[10px] shrink-0">{chip.icon}</span>
                                <span className="font-extrabold text-[9.5px] sm:text-[10.5px] tracking-tight whitespace-nowrap shrink-0">
                                  {chip.name}
                                </span>
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Interactive Dot Grid Studio Canvas Frame */}
                      <div
                        onClick={() => {
                          if (!isStreamView) {
                            setModalActiveTab(previewTab)
                            setIsFullscreenModalOpen(true)
                          }
                        }}
                        className={`w-full bg-[#070b19] border border-white/10 hover:border-indigo-500/50 rounded-2xl p-4 shadow-2xl flex items-center justify-center overflow-hidden group relative transition-all duration-300 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] ${
                          isStreamView ? 'max-h-[680px] overflow-y-auto custom-scrollbar' : 'cursor-pointer'
                        }`}
                      >
                        {/* Hover overlay hint */}
                        {!isStreamView && (
                          <div className="absolute inset-0 bg-indigo-950/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center z-20 pointer-events-none backdrop-blur-[1px]">
                            <span className="px-5 py-2.5 rounded-xl bg-slate-950/90 border border-indigo-400/50 text-indigo-200 font-bold text-xs shadow-2xl flex items-center gap-2 tracking-wide">
                              <Maximize2 className="w-4 h-4 text-amber-400 animate-bounce" />
                              클릭하여 전체화면 스튜디오 모달 열기
                            </span>
                          </div>
                        )}

                        {/* Proportional Scaled Paper Wrapper */}
                        {isStreamView ? (
                          /* ✨ 17개월 연속 풀 마스터 캔버스 스트림 (2026.08 ~ 2027.12) */
                          <div className="flex flex-col items-center space-y-6 py-4 my-2">
                            <div className="px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold">
                              ✨ 17개월 풀 다이어리 캔버스 스트림 (2026.08 ~ 2027.12)
                            </div>
                            {activePeriodMonths.map((mObj) => {
                              const mName = `${mObj.month}월`
                              return (
                                <div
                                  key={`stream-canvas-month-${mObj.year}-${mObj.month}`}
                                  className="relative shrink-0 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] rounded-xl overflow-hidden bg-slate-900 border border-white/10"
                                  style={{
                                    width: `${canvasW}px`,
                                    height: `${canvasH}px`,
                                  }}
                                >
                                  <div
                                    className="origin-top-left absolute top-0 left-0"
                                    style={{
                                      width: `${pageWidth}px`,
                                      height: `${pageHeight}px`,
                                      transform: `scale(${canvasScale})`,
                                    }}
                                  >
                                    <CalendarComponent year={mObj.year} month={mObj.month} monthName={mName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} isGeneralMode={categoryFilter !== 'church'} />
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          <div
                            className="relative shrink-0 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] rounded-xl overflow-hidden pointer-events-none bg-slate-900 my-2"
                            style={{
                              width: `${canvasW}px`,
                              height: `${canvasH * previewStackFactor}px`,
                            }}
                          >
                          <div
                            className="origin-top-left absolute top-0 left-0 transition-transform duration-300"
                            style={{
                              width: `${pageWidth}px`,
                              height: `${pageHeight * previewStackFactor}px`,
                              transform: `scale(${canvasScale})`,
                            }}
                          >
                            {previewTab === 'yearlygrid' && (
                              <div className="flex flex-col">
                                {yearlyGridYears.map((gy) => (
                                  <YearlyGridComponent key={`preview-yearlygrid-${gy}`} startYear={gy} startMonth={1} endYear={gy} endMonth={12} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} isGeneralMode={categoryFilter !== 'church'} />
                                ))}
                              </div>
                            )}
                            {previewTab === 'wallcalendar' && (
                              isLandscape ? (
                                <div className="flex flex-col">
                                  {wallPreviewChunks.map((chunk, ci) => (
                                    <QtYearlyWallCalendarPage key={`preview-wall-${ci}`} months={chunk} chunkIndex={ci + 1} chunkCount={wallPreviewChunks.length} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                                  ))}
                                </div>
                              ) : (
                                <div className="w-full h-full bg-white flex flex-col items-center justify-center gap-3 text-slate-500">
                                  <span className="text-3xl">🗓️</span>
                                  <p className="text-sm font-bold text-slate-700">연간 벽달력은 가로형 용지 전용입니다</p>
                                  <p className="text-xs text-slate-400">용지 규격을 가로형으로 변경해 주세요.</p>
                                </div>
                              )
                            )}
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
                                  activeWeek={`W${Math.floor((activeDayNum - 1) / 7) + 1}`}
                                  isChurchMode={categoryFilter === 'church'}
                                />
                              )
                            })()}
                          </div>
                        </div>
                        )}
                      </div>

                      {/* Canvas Master Info Toolbar */}
                      <div className="w-full p-2.5 rounded-2xl bg-slate-950/80 border border-white/10 flex items-center justify-between gap-2 text-xs text-slate-400 backdrop-blur-md font-mono shadow-xl">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1.5 text-emerald-300 font-bold text-[11px]">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            300 DPI Print Ready
                          </span>
                          <span className="text-slate-700">|</span>
                          <span className="text-indigo-300 font-semibold text-[11px] flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-400" />
                            2-Pass 3D Hyperlink
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-[10.5px]">
                          <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300">
                            📄 내지: <strong className="text-amber-300">{activeSelectedCount}종</strong>
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300">
                            🎨 테마: <strong className="text-indigo-300">{selectedTheme.name}</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })()}
              </div>
            )}
          </div>
        )}

        {/* MODE 3: Cinema Stage (100% Full Canvas Screen) */}
        {layoutMode === 'cinema' && (
          <div className="flex flex-col items-center justify-start max-w-5xl mx-auto space-y-4">
            <div className="w-full p-3 rounded-2xl bg-slate-950/90 border border-emerald-500/30 flex items-center justify-between text-xs text-slate-300 shadow-2xl backdrop-blur-xl">
              <span className="font-bold text-emerald-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                🖼️ 시네마틱 무대 모드: 종이 캔버스 100% 극대화 몰입 뷰
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsFullscreenModalOpen(true)}
                  className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold hover:bg-amber-500/30 transition-all"
                >
                  전체화면 팝업 뷰어
                </button>
              </div>
            </div>

            {/* Cinema Scaled Canvas */}
            {(() => {
              const canvasScale = 0.85
              const canvasW = Math.round(pageWidth * canvasScale)
              const canvasH = Math.round(pageHeight * canvasScale)
              const previewStackFactor = previewTab === 'yearlygrid' || previewTab === 'wallcalendar' ? 2 : 1
              const containerW = canvasW + 32

              return (
                <div
                  style={{ width: `${containerW}px`, maxWidth: '100%' }}
                  className="flex flex-col items-center mx-auto space-y-3"
                >
                  {/* Compact 1-Row Gold Ribbon Controller */}
                  <div className="w-full bg-slate-950/95 border border-white/15 p-1.5 rounded-2xl shadow-2xl flex items-center justify-between gap-1 backdrop-blur-md">
                    {(categoryFilter === 'church'
                      ? [
                          { id: 'yearlygrid', icon: '📅', name: '연간 캘린더' },
                          { id: 'wallcalendar', icon: '🖼️', name: '연간 벽달력' },
                          { id: 'calendar', icon: '🗓️', name: '월간 달력' },
                          { id: 'overview', icon: '📑', name: '월간 개요' },
                          { id: 'soapjournal', icon: '📖', name: 'SOAP 묵상' },
                          { id: 'intercessory', icon: '🙏', name: '중보 기도' },
                          { id: 'sermon', icon: '🎤', name: '주일 설교' },
                          { id: 'weekly', icon: '📋', name: '주간 계획' },
                          { id: 'daily', icon: '📓', name: '일간 일기' },
                        ]
                      : [
                          { id: 'yearlygrid', icon: '📅', name: '연간 캘린더' },
                          { id: 'wallcalendar', icon: '🖼️', name: '연간 벽달력' },
                          { id: 'calendar', icon: '🗓️', name: '월간 달력' },
                          { id: 'overview', icon: '📑', name: '월간 개요' },
                          { id: 'habit', icon: '🌱', name: '습관 트래커' },
                          { id: 'budget', icon: '💰', name: '지출 가계부' },
                          { id: 'kpt', icon: '🔄', name: 'KPT 회고' },
                          { id: 'weekly', icon: '📋', name: '주간 계획' },
                          { id: 'daily', icon: '📓', name: '일간 일기' },
                        ]
                    ).map((chip) => {
                      const isActive = previewTab === chip.id
                      return (
                        <button
                          key={chip.id}
                          type="button"
                          onClick={() => setPreviewTab(chip.id as any)}
                          className={`flex-1 py-1.5 px-1 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-1 border whitespace-nowrap shrink-0 ${
                            isActive
                              ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 text-slate-950 font-black shadow-md shadow-amber-500/25 border-amber-200 scale-[1.02] z-10'
                              : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800/90 border-white/10 hover:border-amber-400/30'
                          }`}
                        >
                          <span className="text-xs shrink-0">{chip.icon}</span>
                          <span className="font-extrabold text-[11px] tracking-tight whitespace-nowrap shrink-0">
                            {chip.name}
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  {/* Cinema Canvas Frame */}
                  <div
                    onClick={() => {
                      setModalActiveTab(previewTab)
                      setIsFullscreenModalOpen(true)
                    }}
                    className="w-full bg-[#070b19] border border-emerald-500/30 hover:border-emerald-400 rounded-2xl p-4 shadow-2xl flex items-center justify-center overflow-hidden cursor-pointer group relative transition-all duration-300 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px]"
                  >
                    <div
                      className="relative shrink-0 shadow-[0_30px_80px_-15px_rgba(0,0,0,0.9)] rounded-xl overflow-hidden pointer-events-none bg-slate-900 my-2"
                      style={{
                        width: `${canvasW}px`,
                        height: `${canvasH * previewStackFactor}px`,
                      }}
                    >
                      <div
                        className="origin-top-left absolute top-0 left-0 transition-transform duration-300"
                        style={{
                          width: `${pageWidth}px`,
                          height: `${pageHeight * previewStackFactor}px`,
                          transform: `scale(${canvasScale})`,
                        }}
                      >
                        {previewTab === 'yearlygrid' && (
                          <div className="flex flex-col">
                            {yearlyGridYears.map((gy) => (
                              <YearlyGridComponent key={`preview-cinema-yearlygrid-${gy}`} startYear={gy} startMonth={1} endYear={gy} endMonth={12} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} isGeneralMode={categoryFilter !== 'church'} />
                            ))}
                          </div>
                        )}
                        {previewTab === 'wallcalendar' && (
                          isLandscape ? (
                            <div className="flex flex-col">
                              {wallPreviewChunks.map((chunk, ci) => (
                                <QtYearlyWallCalendarPage key={`preview-cinema-wall-${ci}`} months={chunk} chunkIndex={ci + 1} chunkCount={wallPreviewChunks.length} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                              ))}
                            </div>
                          ) : (
                            <div className="w-full h-full bg-white flex flex-col items-center justify-center gap-3 text-slate-500">
                              <span className="text-3xl">🗓️</span>
                              <p className="text-sm font-bold text-slate-700">연간 벽달력은 가로형 용지 전용입니다</p>
                              <p className="text-xs text-slate-400">용지 규격을 가로형으로 변경해 주세요.</p>
                            </div>
                          )
                        )}
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
                              activeWeek={`W${Math.floor((activeDayNum - 1) / 7) + 1}`}
                              isChurchMode={categoryFilter === 'church'}
                            />
                          )
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>
        )}

        {/* MODE 4: Step Workflow - Step 2 View */}
        {layoutMode === 'step' && activeWorkflowStep === 2 && (
          <div className="max-w-4xl mx-auto space-y-4 bg-slate-900/90 border border-indigo-500/30 p-6 rounded-3xl shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-sm font-extrabold text-indigo-300 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-amber-400" />
                  <span>Step 2: 전체 35종 내지 구성 선택 체크리스트</span>
                </h3>
                <p className="text-xs text-slate-400">발행할 다이어리에 포함하고 싶은 내지를 체크해 주세요.</p>
              </div>
              <button
                onClick={() => setActiveWorkflowStep(3)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs shadow-lg hover:scale-105 transition-all"
              >
                다음: Step 3 캔버스 검수 →
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
              {Object.keys(selectedPages).map((pk) => {
                const isChecked = selectedPages[pk as keyof typeof selectedPages]
                return (
                  <label
                    key={`step2-checklist-${pk}`}
                    className={`flex items-center justify-between p-3 rounded-2xl border text-xs cursor-pointer transition-all ${
                      isChecked
                        ? 'bg-indigo-600/25 border-indigo-400/60 text-white font-bold shadow-md'
                        : 'bg-white/5 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10'
                    }`}
                  >
                    <span className="truncate pr-2">{pk}</span>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => setSelectedPages({ ...selectedPages, [pk]: e.target.checked })}
                      className="rounded border-slate-700 bg-slate-900 text-amber-400 focus:ring-amber-400 w-4 h-4 cursor-pointer"
                    />
                  </label>
                )
              })}
            </div>
          </div>
        )}

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

            {/* Center Controls: Full Master Toggle + View Mode Switcher + Zoom Controls */}
            <div className="flex items-center gap-3">
              {/* 사용자가 설정한 전체 기간 풀 마스터 뷰 토글 버튼 */}
              <div className="flex items-center bg-slate-950/90 p-1 rounded-xl border border-amber-500/30">
                <button
                  type="button"
                  onClick={() => setModalFullMaster(false)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    !modalFullMaster
                      ? 'bg-slate-800 text-amber-300 border border-slate-600 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  🗓️ {selectedYear}.{String(selectedMonth).padStart(2, '0')} 1개월 뷰
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setModalFullMaster(true)
                    setModalViewMode('continuous')
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    modalFullMaster
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black shadow-md scale-[1.01]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ✨ 설정 기간 마스터 뷰 ({activePeriodMonths.length}개월 전체)
                </button>
              </div>

              <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-white/10">
                <button
                  onClick={() => setModalViewMode('continuous')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    modalViewMode === 'continuous'
                      ? 'bg-slate-800 text-slate-100 font-bold border border-slate-600 shadow-sm'
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
                      ? 'bg-slate-800 text-slate-100 font-bold border border-slate-600 shadow-sm'
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
                  height: `${modalActiveTab === 'yearlygrid' || modalActiveTab === 'wallcalendar' ? pageHeight * 2 : pageHeight}px`,
                }}
              >
                {modalActiveTab === 'yearlygrid' && (
                  <div className="flex flex-col">
                    {yearlyGridYears.map((gy) => (
                      <YearlyGridComponent key={`modal-yearlygrid-${gy}`} startYear={gy} startMonth={1} endYear={gy} endMonth={12} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} isGeneralMode={categoryFilter !== 'church'} />
                    ))}
                  </div>
                )}
                {modalActiveTab === 'wallcalendar' && (
                  isLandscape ? (
                    <div className="flex flex-col">
                      {wallPreviewChunks.map((chunk, ci) => (
                        <QtYearlyWallCalendarPage key={`modal-wall-${ci}`} months={chunk} chunkIndex={ci + 1} chunkCount={wallPreviewChunks.length} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                      ))}
                    </div>
                  ) : (
                    <div className="w-full h-full bg-white flex flex-col items-center justify-center gap-3 text-slate-500">
                      <span className="text-3xl">🗓️</span>
                      <p className="text-sm font-bold text-slate-700">연간 벽달력은 가로형 용지 전용입니다</p>
                      <p className="text-xs text-slate-400">용지 규격을 가로형으로 변경해 주세요.</p>
                    </div>
                  )
                )}
                {modalActiveTab === 'calendar' && <CalendarComponent year={selectedYear} month={selectedMonth} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} isGeneralMode={categoryFilter !== 'church'} />}
                {modalActiveTab === 'overview' && <OverviewComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} isGeneralMode={categoryFilter !== 'church'} />}
                {modalActiveTab === 'habit' && <HabitComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />}
                {modalActiveTab === 'habit2' && <Habit2Component year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />}
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
                {modalActiveTab === 'intercessory2' && <Intercessory2Component year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />}
                {modalActiveTab === 'soapjournal' && <SoapJournalComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />}
                {modalActiveTab === 'soapjournal2' && <SoapJournal2Component year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />}
                {modalActiveTab === 'fruitstracker' && <FruitsTrackerComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />}
                {modalActiveTab === 'prayer' && <PrayerComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />}
                {modalActiveTab === 'prayer2' && <Prayer2Component year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />}
                {modalActiveTab === 'scripture' && <ScriptureArtComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />}
                {modalActiveTab === 'scripture2' && <ScriptureArt2Component year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />}
                {modalActiveTab === 'sermon' && <SundaySermonComponent year={selectedYear} month={selectedMonth} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />}
                {modalActiveTab === 'sermondeep' && <SundaySermonDeepComponent year={selectedYear} month={selectedMonth} sundayNo={1} dateStr="08/02" monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />}
                {modalActiveTab === 'biblemap' && <BibleMapComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />}
                {modalActiveTab === 'biblemap2' && <BibleMap2Component year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />}
                {modalActiveTab === 'letter' && <MonthlyLetterComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />}
                {modalActiveTab === 'letter2' && <MonthlyLetter2Component year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />}
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
                      isGeneralMode={categoryFilter !== 'church'}
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
                {/* 1. 연간 마스터 & 비전 부록 파트 */}
                {selectedPages.yearlygrid && (
                  <div id="modal-page-yearlygrid" className="shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden shrink-0 bg-slate-900">
                    {yearlyGridYears.map((gy) => (
                      <div key={`modal-page-yearlygrid-${gy}`} className="overflow-hidden" style={{ width: `${pageWidth}px`, height: `${pageHeight}px` }}>
                        <YearlyGridComponent startYear={gy} startMonth={1} endYear={gy} endMonth={12} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} isGeneralMode={categoryFilter !== 'church'} />
                      </div>
                    ))}
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

                {/* 2. 월간 달력 & 개요 파트 (사용자 지정 전체 기간 풀 마스터 뷰 지원) */}
                {modalFullMaster ? (
                  activePeriodMonths.map((mObj) => {
                    const mName = `${mObj.month}월`
                    return (
                      <React.Fragment key={`modal-full-master-period-${mObj.year}-${mObj.month}`}>
                        {selectedPages.calendar && (
                          <div id={`modal-page-calendar-m${mObj.year}-${mObj.month}`} className="shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden shrink-0 bg-slate-900 border border-white/10" style={{ width: `${pageWidth}px`, height: `${pageHeight}px` }}>
                            <CalendarComponent year={mObj.year} month={mObj.month} monthName={mName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} isGeneralMode={categoryFilter !== 'church'} />
                          </div>
                        )}
                        {selectedPages.overview && (
                          <div id={`modal-page-overview-m${mObj.year}-${mObj.month}`} className="shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden shrink-0 bg-slate-900 border border-white/10" style={{ width: `${pageWidth}px`, height: `${pageHeight}px` }}>
                            <OverviewComponent year={mObj.year} monthName={mName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} isGeneralMode={categoryFilter !== 'church'} />
                          </div>
                        )}
                      </React.Fragment>
                    )
                  })
                ) : (
                  <>
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
                  </>
                )}

                {/* 3. 월간 4대 핵심 트래커 파트 (전진 배치) */}
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
                {selectedPages.gratitude && (
                  <div id="modal-page-gratitude" className="shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden shrink-0 bg-slate-900" style={{ width: `${pageWidth}px`, height: `${pageHeight}px` }}>
                    <GratitudeComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
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
                {selectedPages.quote && (
                  <div id="modal-page-quote" className="shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden shrink-0 bg-slate-900" style={{ width: `${pageWidth}px`, height: `${pageHeight}px` }}>
                    <QuoteComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
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

                {/* 4. 주차별 밀착 Interleaved Flow (Week 1 -> Day 1..7 -> Week 2 -> Day 8..14 ...) */}
                {selectedPages.weekly && selectedPages.daily && (
                  Array.from({ length: 5 }, (_, i) => i + 1).map((wNum) => {
                    const wData = getWeekData(wNum)
                    const startDay = (wNum - 1) * 7 + 1
                    const endDay = Math.min(totalDays, wNum * 7)
                    const dayList = []
                    for (let d = startDay; d <= endDay; d++) dayList.push(d)

                    return (
                      <React.Fragment key={`modal-interleaved-week-${wNum}`}>
                        {/* 해당 주차 주간 계획표 */}
                        <div id={`modal-page-week-${wNum}`} className="shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden shrink-0 bg-slate-900" style={{ width: `${pageWidth}px`, height: `${pageHeight}px` }}>
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
                            isGeneralMode={categoryFilter !== 'church'}
                          />
                        </div>

                        {/* 해당 주차에 속한 7일간의 데일리 일기장 */}
                        {dayList.map((d) => {
                          const dayNamesShort = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
                          const dateObj = new Date(selectedYear, selectedMonth - 1, d)
                          const realDayName = dayNamesShort[dateObj.getDay()]

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
                                activeWeek={`W${wNum}`}
                                isChurchMode={categoryFilter === 'church'}
                              />
                            </div>
                          )
                        })}
                      </React.Fragment>
                    )
                  })
                )}

                {/* 5. 크리스천 영성 팩 */}
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
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hidden Full PDF Assembly Render Container for Custom PDF Download */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0, opacity: 1, zIndex: -1 }}>
        <div ref={pdfContainerRef}>
          {/* 0.0 연간 월력 벽달력 (Yearly Wall Calendar, 연도별 6개월씩 2장 / 연간 일괄 생성 전용) */}
          {activeWallChunks && activeWallChunks.length > 0 && (
            activeWallChunks.map((chunk) => (
              <QtYearlyWallCalendarPage
                key={`wall-${chunk.index}`}
                months={chunk.months}
                chunkIndex={chunk.index}
                chunkCount={chunk.total}
                themeColor={activeColor}
                pageWidth={pageWidth}
                pageHeight={pageHeight}
              />
            ))
          )}

          {/* 0.0 연간 월력 벽달력 (Yearly Wall Calendar, 연도별 6개월씩 4장) */}
          {activeWallChunks && activeWallChunks.length > 0 && (
            activeWallChunks.map((chunk) => (
              <QtYearlyWallCalendarPage
                key={`wall-${chunk.index}`}
                months={chunk.months}
                chunkIndex={chunk.index}
                chunkCount={chunk.total}
                themeColor={activeColor}
                pageWidth={pageWidth}
                pageHeight={pageHeight}
              />
            ))
          )}

          {/* 0.1 연간 마스터 12개월 달력 그리드 2장 (연간 일괄 시 첫 반복에서만 렌더) */}
          {selectedPages.yearlygrid && (!isYearlyGenerating || yearlyBatchIndex === 0) && (
            yearlyGridYears.map((gy) => (
              <YearlyGridComponent key={`pdf-yearlygrid-${gy}`} startYear={gy} startMonth={1} endYear={gy} endMonth={12} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} isGeneralMode={categoryFilter !== 'church'} />
            ))
          )}

          {/* 0.2 100가지 비전 & 목표 2장 (연간 일괄 시 첫 반복에서만 렌더) */}
          {selectedPages.hundredgoal && (!isYearlyGenerating || yearlyBatchIndex === 0) && (
            <HundredGoalComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
          )}
          {selectedPages.hundredgoal2 && (!isYearlyGenerating || yearlyBatchIndex === 0) && (
            <HundredGoal2Component year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
          )}

          {/* 0.3 성경/독서 완독 맵 2장 (연간 일괄 시 첫 반복에서만 렌더) */}
          {selectedPages.biblemap && (!isYearlyGenerating || yearlyBatchIndex === 0) && (
            <BibleMapComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
          )}
          {selectedPages.biblemap2 && (!isYearlyGenerating || yearlyBatchIndex === 0) && (
            <BibleMap2Component year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
          )}

          {/* 1.0 월간 달력 (Monthly Calendar) */}
          {selectedPages.calendar && (
            <CalendarComponent year={selectedYear} month={selectedMonth} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} isGeneralMode={categoryFilter !== 'church'} />
          )}

          {/* 1.1 월간 개요 & 목표 (Monthly Overview) */}
          {selectedPages.overview && (
            <OverviewComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} isGeneralMode={categoryFilter !== 'church'} />
          )}

          {/* 2.0 월간 4대 핵심 트래커 파트 (달력 직후 전진 배치!) */}
          {selectedPages.habit && (
            <HabitComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
          )}
          {selectedPages.habit2 && (
            <Habit2Component year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
          )}
          {selectedPages.gratitude && (
            <GratitudeComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
          )}
          {selectedPages.budget && (
            <BudgetComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
          )}
          {selectedPages.budget2 && (
            <Budget2Component year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
          )}
          {selectedPages.kpt && (
            <KptComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
          )}
          {selectedPages.kpt2 && (
            <Kpt2Component year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
          )}
          {selectedPages.quote && (
            <QuoteComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
          )}
          {selectedPages.culture && (
            <CultureComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
          )}
          {selectedPages.culture2 && (
            <Culture2Component year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
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

          {/* 3.0 주차별 밀착 Interleaved Flow (Weekly Plan + 7-Day Daily Diaries for each week) */}
          {selectedPages.weekly && selectedPages.daily && (
            Array.from({ length: 5 }, (_, i) => i + 1).map((wNum) => {
              const wData = getWeekData(wNum)
              const startDay = (wNum - 1) * 7 + 1
              const endDay = Math.min(totalDays, wNum * 7)
              const dayList = []
              for (let d = startDay; d <= endDay; d++) dayList.push(d)

              return (
                <React.Fragment key={`pdf-interleaved-week-${wNum}`}>
                  {/* 해당 주차 주간 계획표 */}
                  <WeeklyComponent
                    year={selectedYear}
                    weekNum={wNum}
                    weekLabel={`WEEK ${wNum}`}
                    dateRangeText={wData.dateRangeText}
                    daysInWeek={wData.daysInWeek}
                    monthName={monthName}
                    themeColor={activeColor}
                    pageWidth={pageWidth}
                    pageHeight={pageHeight}
                    isGeneralMode={categoryFilter !== 'church'}
                  />

                  {/* 해당 주차에 속한 7일간의 데일리 일기장 */}
                  {dayList.map((d) => {
                    const dayNamesShort = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
                    const dateObj = new Date(selectedYear, selectedMonth - 1, d)
                    const realDayName = dayNamesShort[dateObj.getDay()]

                    return (
                      <DailyComponent
                        key={`pdf-day-${d}`}
                        dateLabel={`${String(d).padStart(2, '0')} DAY`}
                        dayNum={d}
                        dayName={realDayName}
                        monthName={monthName}
                        yearLabel={String(selectedYear)}
                        themeColor={activeColor}
                        pageWidth={pageWidth}
                        pageHeight={pageHeight}
                        activeWeek={`W${wNum}`}
                        isChurchMode={categoryFilter === 'church'}
                      />
                    )
                  })}
                </React.Fragment>
              )
            })
          )}

          {/* 4.0 크리스천 영성 전용 내지 파트 */}
          {categoryFilter !== 'general' && (
            <>
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
              {selectedPages.fruitstracker && (
                <FruitsTrackerComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
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
              {selectedPages.sermon && (
                Array.from({ length: 4 }, (_, i) => i + 1).map((sNo) => (
                  <SundaySermonComponent key={`pdf-sermon-${sNo}`} year={selectedYear} month={selectedMonth} sundayNo={sNo} sundayLabel={`${selectedMonth}월 ${sNo}주차 주일예배`} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
                ))
              )}
              {selectedPages.sermondeep && (
                <SundaySermonDeepComponent year={selectedYear} month={selectedMonth} sundayNo={1} dateStr="08/02" monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
              )}
              {selectedPages.letter && (
                <MonthlyLetterComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
              )}
              {selectedPages.letter2 && (
                <MonthlyLetter2Component year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
              )}
            </>
          )}
        </div>
      </div>
      {/* 🖱️ 마우스 드래그 가능한 스마트 플로팅 윈도우 1: 미리보기 양식 선택 */}
      {showPreviewFloating && (
        <div
          style={{ left: `${previewPos.x}px`, top: `${previewPos.y}px`, touchAction: 'none' }}
          className="fixed z-50 w-72 rounded-2xl bg-slate-950/90 border border-indigo-500/30 backdrop-blur-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden transition-[border-color,box-shadow] duration-200 hover:border-indigo-400 select-none"
        >
          {/* Title Bar Handle */}
          <div
            onPointerDown={(e) => handlePointerDown(e, 'preview')}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="p-3 bg-slate-900/90 border-b border-white/10 flex items-center justify-between cursor-grab active:cursor-grabbing select-none group touch-none"
          >
            <div className="flex items-center gap-2">
              <GripHorizontal className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
              <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                미리보기 패널
                <span className="text-[9px] font-mono text-indigo-300 bg-indigo-500/20 px-1.5 py-0.5 rounded border border-indigo-500/30">
                  드래그 가능
                </span>
              </h3>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsPreviewSelectorOpen(!isPreviewSelectorOpen)}
                className="p-1 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                title={isPreviewSelectorOpen ? '접기' : '펼치기'}
              >
                {isPreviewSelectorOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setShowPreviewFloating(false)}
                className="p-1 rounded-md hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-colors"
                title="닫기"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Body */}
          {isPreviewSelectorOpen && (
            <div className="p-3 space-y-2.5 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {/* Category Filter */}
              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 text-[10px] font-bold">
                <button
                  onClick={() => setCategoryFilter('all')}
                  className={`flex-1 py-1 rounded-lg transition-all ${
                    categoryFilter === 'all' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  전체 ({CATEGORY_COUNTS.all})
                </button>
                <button
                  onClick={() => setCategoryFilter('general')}
                  className={`flex-1 py-1 rounded-lg transition-all ${
                    categoryFilter === 'general' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  갓생 ({CATEGORY_COUNTS.general})
                </button>
                <button
                  onClick={() => setCategoryFilter('church')}
                  className={`flex-1 py-1 rounded-lg transition-all ${
                    categoryFilter === 'church' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  영성 ({CATEGORY_COUNTS.church})
                </button>
              </div>

              {/* Template Buttons */}
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  // 1. 기본 5종 (언제나 포함)
                  { id: 'yearlygrid', label: '✨ 12개월 연간달력' },
                  { id: 'wallcalendar', label: '🗓️ 연간 벽달력' },
                  { id: 'calendar', label: '📅 월간 달력' },
                  { id: 'overview', label: '📊 월간 개요' },
                  { id: 'weekly', label: '📆 주간 계획' },
                  { id: 'daily', label: '📝 데일리 노트' },

                  // 2. 갓생라이프 15종 (영성 전용 탭일 때는 숨김)
                  ...(categoryFilter !== 'church' ? [
                    { id: 'habit', label: '🌱 습관① 매트릭스' },
                    { id: 'habit2', label: '🔥 습관② 주간회고' },
                    { id: 'gratitude', label: '☀️ 감사 & 확언' },
                    { id: 'quote', label: '📖 명언 & 필사' },
                    { id: 'budget', label: '💰 가계부① 예산' },
                    { id: 'budget2', label: '💳 가계부② 데일리' },
                    { id: 'culture', label: '🎬 문화① 메인' },
                    { id: 'culture2', label: '🎞️ 문화② 컬렉션' },
                    { id: 'kpt', label: '🔄 KPT① 마스터' },
                    { id: 'kpt2', label: '⚡ KPT② 4주차' },
                    { id: 'sundaygeneral', label: '🌿 선데이 리셋' },
                    { id: 'buckettravel', label: '✈️ 버킷&트래블' },
                    { id: 'wellnessmood', label: '🥗 웰니스&감정' },
                    { id: 'hundredgoal', label: '🎯 100일① 전반전' },
                    { id: 'hundredgoal2', label: '🏆 100일② 완주전' },
                  ] : []),

                  // 3. 크리스천 영성 15종 (갓생 전용 탭일 때는 숨김)
                  ...(categoryFilter !== 'general' ? [
                    { id: 'prayer', label: '🙏 기도① 제목' },
                    { id: 'prayer2', label: '🎉 기도② 은혜' },
                    { id: 'scripture', label: '📜 암송① 대표' },
                    { id: 'scripture2', label: '📜 암송② 4주차' },
                    { id: 'sermon', label: '🏛️ 설교① 주일' },
                    { id: 'sermondeep', label: '🌟 설교② 심층' },
                    { id: 'biblemap', label: '🕊️ 통독① 66권' },
                    { id: 'biblemap2', label: '📖 통독② 31일' },
                    { id: 'letter', label: '💌 편지① 감사' },
                    { id: 'letter2', label: '💌 편지② 축복' },
                    { id: 'intercessory', label: '💖 중보① 가족' },
                    { id: 'intercessory2', label: '💌 중보② 열방' },
                    { id: 'soapjournal', label: '📖 SOAP① 관찰' },
                    { id: 'soapjournal2', label: '🌱 SOAP② 순종' },
                    { id: 'fruitstracker', label: '🌱 성령의 열매' },
                  ] : [])
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setPreviewTab(item.id as PreviewTabType)}
                    className={`p-1.5 rounded-lg border text-[10.5px] font-bold transition-all text-left truncate ${
                      previewTab === item.id
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-sm'
                        : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 🖱️ 마우스 드래그 가능한 스마트 플로팅 윈도우 2: 내지 구성 선택 */}
      {showPageCheckerFloating && (
        <div
          style={{ left: `${pageCheckerPos.x}px`, top: `${pageCheckerPos.y}px`, touchAction: 'none' }}
          className="fixed z-50 w-84 rounded-2xl bg-slate-950/95 border border-cyan-500/30 backdrop-blur-2xl shadow-[0_20px_50px_rgba(8,145,178,0.2)] overflow-hidden transition-[border-color,box-shadow] duration-200 hover:border-cyan-400/60 select-none"
        >
          {/* Title Bar Handle */}
          <div
            onPointerDown={(e) => handlePointerDown(e, 'checker')}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="p-3.5 bg-slate-900/90 border-b border-white/10 flex items-center justify-between cursor-grab active:cursor-grabbing select-none group touch-none"
          >
            <div className="flex items-center gap-2">
              <GripHorizontal className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              <h3 className="text-xs font-bold text-slate-100 flex items-center gap-2 tracking-tight">
                내지 구성 선택
                <span className="text-[9.5px] font-mono font-semibold text-cyan-300 bg-cyan-500/15 px-2 py-0.5 rounded-full border border-cyan-500/30 shadow-xs">
                  {activeSelectedCount}개 선택됨
                </span>
              </h3>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsPageCheckerOpen(!isPageCheckerOpen)}
                className="p-1 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                title={isPageCheckerOpen ? '접기' : '펼치기'}
              >
                {isPageCheckerOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setShowPageCheckerFloating(false)}
                className="p-1 rounded-md hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-colors"
                title="닫기"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Body */}
          {isPageCheckerOpen && (
            <div className="p-3.5 space-y-3 max-h-[62vh] overflow-y-auto custom-scrollbar">
              {/* Quick Actions */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 rounded-xl border border-white/5">
                <button
                  onClick={() => applyPreset('all')}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 font-bold text-[10px] transition-all text-center"
                >
                  ✨ 전체 선택
                </button>
                <button
                  onClick={() => applyPreset('basic')}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-bold text-[10px] transition-all text-center"
                >
                  📌 기본 4종
                </button>
                <button
                  onClick={() => {
                    const noneMap: Record<string, boolean> = {}
                    Object.keys(selectedPages).forEach(k => { noneMap[k] = false })
                    setSelectedPages(noneMap as any)
                  }}
                  className="py-1.5 px-2.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-bold text-[10px] transition-all text-center"
                >
                  ✕ 해제
                </button>
              </div>

              {/* Grid Page Checklist */}
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {[
                  { id: 'yearlygrid', label: '✨ 12개월 연간달력' },
                  { id: 'calendar', label: '📅 월간 달력' },
                  { id: 'overview', label: '📊 월간 개요' },
                  { id: 'weekly', label: '📆 주간 계획' },
                  { id: 'daily', label: '📝 데일리 노트' },
                  { id: 'habit', label: '🌱 습관① 매트릭스' },
                  { id: 'habit2', label: '🔥 습관② 주간회고' },
                  { id: 'gratitude', label: '☀️ 감사 & 확언' },
                  { id: 'quote', label: '📖 명언 & 필사' },
                  { id: 'budget', label: '💰 가계부① 예산' },
                  { id: 'budget2', label: '💳 가계부② 데일리' },
                  { id: 'culture', label: '🎬 문화① 메인' },
                  { id: 'culture2', label: '🎞️ 문화② 컬렉션' },
                  { id: 'kpt', label: '🔄 KPT① 마스터' },
                  { id: 'kpt2', label: '⚡ KPT② 4주차' },
                  { id: 'sundaygeneral', label: '🌿 선데이 리셋' },
                  { id: 'buckettravel', label: '✈️ 버킷 & 트래블' },
                  { id: 'wellnessmood', label: '🥗 웰니스 & 감정' },
                  { id: 'hundredgoal', label: '🎯 100일① 전반전' },
                  { id: 'hundredgoal2', label: '🏆 100일② 완주전' },
                  { id: 'prayer', label: '🙏 기도① 제목말씀' },
                  { id: 'prayer2', label: '🎉 기도② 은혜응답' },
                  { id: 'scripture', label: '📜 암송① 대표필사' },
                  { id: 'scripture2', label: '📜 암송② 4주차' },
                  { id: 'sermon', label: '🏛️ 설교① 주일설교' },
                  { id: 'sermondeep', label: '🌟 설교② 심층나눔' },
                  { id: 'biblemap', label: '🕊️ 통독① 66권진도' },
                  { id: 'biblemap2', label: '📖 통독② 31일' },
                  { id: 'letter', label: '💌 편지① 하나님감사' },
                  { id: 'letter2', label: '💌 편지② 축복' },
                  { id: 'intercessory', label: '💖 중보① 가족' },
                  { id: 'intercessory2', label: '💌 중보② 열방' },
                  { id: 'soapjournal', label: '📖 SOAP① 필사' },
                  { id: 'soapjournal2', label: '🌱 SOAP② 순종' },
                  { id: 'fruitstracker', label: '🌱 성령의 열매' },
                ].map((pg) => {
                  const isChecked = !!selectedPages[pg.id]
                  return (
                    <button
                      key={pg.id}
                      type="button"
                      onClick={() => setSelectedPages({ ...selectedPages, [pg.id]: !isChecked })}
                      className={`flex items-center justify-between p-2 rounded-xl border text-left transition-all group select-none ${
                        isChecked
                          ? 'bg-gradient-to-r from-cyan-950/50 to-indigo-950/50 border-cyan-500/40 text-cyan-200 shadow-sm shadow-cyan-950/50 font-semibold'
                          : 'bg-slate-900/40 border-white/5 text-slate-400 hover:bg-white/5 hover:text-slate-300'
                      }`}
                    >
                      <span className="text-[10.5px] truncate pr-1">{pg.label}</span>
                      <div
                        className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                          isChecked
                            ? 'bg-cyan-500 border-cyan-400 text-slate-950 shadow-xs'
                            : 'border-white/15 bg-white/5 group-hover:border-white/30'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 연간 마스터 다이어리 일괄 생성 마법사 모달 */}
      <YearlyBuilderModal
        isOpen={isYearlyModalOpen}
        onClose={() => setIsYearlyModalOpen(false)}
        startYear={2026}
        startMonth={8}
        endYear={2027}
        endMonth={12}
        selectedTheme={selectedTheme}
        sizeOption={selectedSizeOption}
        isEcoPrint={isEcoPrint}
        onStartGenerate={handleStartYearlyMaster}
        isGenerating={isYearlyGenerating}
        progress={yearlyProgress}
      />
      </div>
    </DiaryPeriodProvider>
  )
}
