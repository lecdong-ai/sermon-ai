'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  Calendar as CalendarIcon, Download, Sparkles, BookOpen, Layers,
  ChevronLeft, ArrowLeft, RotateCcw, Check, FileText, Maximize2,
  X, ZoomIn, ZoomOut, Eye, Sliders, ArrowUp, List, ChevronDown, ChevronUp,
  GripHorizontal, Move, Pin, Palette
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

import { generateQtPdf, createMasterPdfContext, appendContainerPagesToMasterPdf, finalizeMasterPdfLinks, saveMasterPdf } from '@/lib/qtPdfGen'
import { PAGE_SIZES } from '@/lib/qtPdfSizes'
import YearlyBuilderModal, { YearlyMasterConfig } from '@/components/advanced/diary/YearlyBuilderModal'

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
  all: 34,
  general: 19, // 기본 4종 + 갓생라이프 15종
  church: 19,  // 기본 4종 + 크리스천 영성 15종
  basic: 4,
}

export type PreviewTabType =
  | 'yearlygrid' | 'calendar' | 'overview' | 'weekly' | 'daily'
  | 'habit' | 'habit2' | 'gratitude' | 'quote' | 'budget' | 'budget2' | 'culture' | 'culture2' | 'kpt' | 'kpt2' | 'sundaygeneral'
  | 'buckettravel' | 'wellnessmood' | 'hundredgoal' | 'hundredgoal2'
  | 'prayer' | 'prayer2' | 'scripture' | 'scripture2' | 'sermon' | 'sermondeep' | 'biblemap' | 'biblemap2' | 'letter' | 'letter2'
  | 'intercessory' | 'intercessory2' | 'soapjournal' | 'soapjournal2' | 'fruitstracker'

export default function DiaryPage() {
  const [selectedYear, setSelectedYear] = useState(2026)
  const [selectedMonth, setSelectedMonth] = useState(8) // 기본 8월
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0])
  const [activeThemeCategory, setActiveThemeCategory] = useState<'watercolor' | 'modern'>('watercolor')
  const [selectedSizeOption, setSelectedSizeOption] = useState('A4Landscape')
  const [isEcoPrint, setIsEcoPrint] = useState(false)
  const [previewTab, setPreviewTab] = useState<PreviewTabType>('yearlygrid')
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'general' | 'church' | 'basic'>('all')
  const [activeDayNum, setActiveDayNum] = useState(1)
  const [isPdfGenerating, setIsPdfGenerating] = useState(false)

  // ★ 연간 마스터 다이어리 일괄 생성 모달 상태
  const [isYearlyModalOpen, setIsYearlyModalOpen] = useState(false)
  const [isYearlyGenerating, setIsYearlyGenerating] = useState(false)
  const [yearlyProgress, setYearlyProgress] = useState({
    currentStep: 0,
    totalSteps: 0,
    currentMonthName: '',
    percentage: 0,
  })

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

  // ★ 플로팅 마우스 드래그 가능한 스마트 제어 패널 상태 변수
  const [showPreviewFloating, setShowPreviewFloating] = useState(true)
  const [showPageCheckerFloating, setShowPageCheckerFloating] = useState(true)
  const [isPageCheckerOpen, setIsPageCheckerOpen] = useState(true)
  const [isPreviewSelectorOpen, setIsPreviewSelectorOpen] = useState(true)

  const [previewPos, setPreviewPos] = useState({ x: 30, y: 110 })
  const [pageCheckerPos, setPageCheckerPos] = useState({ x: 360, y: 110 })

  const activeDragTarget = useRef<'preview' | 'checker' | null>(null)
  const dragStartOffset = useRef({ x: 0, y: 0 })

  const handlePointerDown = (e: React.PointerEvent, target: 'preview' | 'checker') => {
    activeDragTarget.current = target
    const currentPos = target === 'preview' ? previewPos : pageCheckerPos
    dragStartOffset.current = {
      x: e.clientX - currentPos.x,
      y: e.clientY - currentPos.y,
    }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!activeDragTarget.current) return
    const newX = Math.max(10, Math.min(window.innerWidth - 320, e.clientX - dragStartOffset.current.x))
    const newY = Math.max(70, Math.min(window.innerHeight - 100, e.clientY - dragStartOffset.current.y))

    if (activeDragTarget.current === 'preview') {
      setPreviewPos({ x: newX, y: newY })
    } else {
      setPageCheckerPos({ x: newX, y: newY })
    }
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (activeDragTarget.current) {
      activeDragTarget.current = null
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

  // 연간 마스터 다이어리 청크 순차 일괄 생성 및 2-Pass 스마트 하이퍼링크 구축 핸들러
  const handleStartYearlyMaster = async (cfg: YearlyMasterConfig) => {
    if (!pdfContainerRef.current) return
    setIsYearlyGenerating(true)

    // 시작 연월부터 종료 연월까지 17개 월 목록 구축
    const monthList: { year: number; month: number; label: string }[] = []
    let currY = cfg.startYear
    let currM = cfg.startMonth

    while (currY < cfg.endYear || (currY === cfg.endYear && currM <= cfg.endMonth)) {
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

        // 1. 상태(연도, 월) 변경하여 해당 월 DOM 새로 그리기
        setSelectedYear(target.year)
        setSelectedMonth(target.month)

        // 2. React DOM 렌더링 완성 대기 (350ms)
        await new Promise((resolve) => setTimeout(resolve, 350))

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
      setPreviewTab('buckettravel')
    } else if (presetType === 'church') {
      setSelectedPages({
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
      setPreviewTab('intercessory')
    } else if (presetType === 'basic') {
      setSelectedPages({
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
      setPreviewTab('calendar')
    } else {
      setSelectedPages({
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

        <div className="flex items-center space-x-2.5">
          {/* 미리보기 양식 선택 플로팅 창 토글 버튼 */}
          <button
            onClick={() => setShowPreviewFloating(!showPreviewFloating)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border shadow-md ${
              showPreviewFloating
                ? 'bg-indigo-600 border-indigo-400 text-white shadow-indigo-500/20'
                : 'bg-white/5 hover:bg-white/10 text-slate-400 border-white/10 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-indigo-300" />
            <span>미리보기 패널</span>
          </button>

          {/* 내지 구성 선택 플로팅 창 토글 버튼 */}
          <button
            onClick={() => setShowPageCheckerFloating(!showPageCheckerFloating)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border shadow-md ${
              showPageCheckerFloating
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-amber-500/20'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>내지 구성 ({activeSelectedCount}종)</span>
          </button>

          {/* 전체화면 팝업 뷰어 버튼 */}
          <button
            onClick={() => setIsFullscreenModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold transition-all shadow-md hover:shadow-amber-500/10"
          >
            <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
            전체화면 팝업 뷰어
          </button>

          {/* 연간 마스터 다이어리 일괄 제작 버튼 */}
          <button
            onClick={() => setIsYearlyModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 via-indigo-500/20 to-purple-500/20 hover:from-amber-500/30 hover:to-purple-500/30 text-amber-300 border border-amber-400/40 text-xs font-extrabold transition-all shadow-lg shadow-amber-500/10 animate-pulse"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>✨ 연간 일괄 제작 (2026~2027)</span>
          </button>

          {/* PDF 다운로드 버튼 */}
          <button
            onClick={handleDownloadFullPdf}
            disabled={isPdfGenerating}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_auto] hover:bg-right transition-all duration-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 border border-indigo-300/30 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {isPdfGenerating ? 'PDF 제작 중...' : `월간 다이어리 PDF 다운로드 (${estimatedPdfPages}p)`}
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
                  <span className="text-[9px] opacity-70">19종</span>
                </div>
                <span className="text-[9.5px] font-normal text-slate-400">기본4종 + 일반인15종</span>
              </button>

              <button
                onClick={() => applyPreset('church')}
                className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold transition-all text-left flex flex-col gap-0.5 group"
              >
                <div className="flex items-center justify-between">
                  <span>⛪ 크리스천 묵상 팩</span>
                  <span className="text-[9px] opacity-70">19종</span>
                </div>
                <span className="text-[9.5px] font-normal text-slate-400">기본4종 + 크리스천15종</span>
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
                  <span className="text-[9px] opacity-70">34종</span>
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

            {/* Theme Collection Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-indigo-400" />
                  스튜디오 컬러 테마
                </span>
                <span className="text-[10px] text-amber-300 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  {selectedTheme.name}
                </span>
              </div>

              {/* Theme Category Tabs */}
              <div className="flex items-center gap-1 p-1 bg-slate-950/80 rounded-xl border border-white/10 text-[10.5px] font-bold">
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
              <div className="grid grid-cols-4 gap-1.5">
                {THEMES.filter(t => t.category === activeThemeCategory).map((t) => {
                  const isSel = selectedTheme.id === t.id
                  return (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTheme(t)}
                      className={`p-1.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                        isSel
                          ? 'bg-indigo-600/30 border-indigo-400 ring-2 ring-indigo-400/40 shadow-sm'
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                      title={t.name}
                    >
                      <div className="w-4 h-4 rounded-full border border-white/30 shadow-xs" style={{ backgroundColor: t.color }} />
                      <span className="text-[9.5px] font-medium text-slate-300 truncate w-full text-center">
                        {t.name}
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
          {/* Floating Control Windows Info Card in Sidebar */}
          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-2 backdrop-blur-md shadow-xl">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
              <Move className="w-4 h-4 text-indigo-400 animate-pulse" />
              <span>마우스 드래그 플로팅 패널</span>
            </div>
            <p className="text-[10.5px] text-slate-400 leading-relaxed">
              <strong className="text-indigo-300">[미리보기 패널]</strong> 및 <strong className="text-amber-300">[내지 구성 선택]</strong> 창은 마우스로 잡고 화면 어디든 자유롭게 드래그하여 배치하실 수 있습니다. (상단 바 버튼으로 ON/OFF 가능)
            </p>
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
                    {previewTab === 'yearlygrid' && (
                      <YearlyGridComponent startYear={selectedYear} startMonth={selectedMonth} endYear={selectedYear + 1} endMonth={12} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} isGeneralMode={categoryFilter !== 'church'} />
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
                {selectedPages.intercessory2 && (
                  <div id="modal-page-intercessory2" className="shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden shrink-0 bg-slate-900" style={{ width: `${pageWidth}px`, height: `${pageHeight}px` }}>
                    <Intercessory2Component year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
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
                          isGeneralMode={categoryFilter !== 'church'}
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
          {/* 0. 연간 마스터 12개월 달력 그리드 (Yearly 12-Month Master Grid) */}
          {selectedPages.yearlygrid && (
            <YearlyGridComponent startYear={selectedYear} startMonth={selectedMonth} endYear={selectedYear + 1} endMonth={12} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} isGeneralMode={categoryFilter !== 'church'} />
          )}

          {/* 1. 월간 달력 (Monthly Calendar) */}
          {selectedPages.calendar && (
            <CalendarComponent year={selectedYear} month={selectedMonth} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} isGeneralMode={categoryFilter !== 'church'} />
          )}

          {/* 2. 월간 개요 & 목표 (Monthly Overview) */}
          {selectedPages.overview && (
            <OverviewComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} isGeneralMode={categoryFilter !== 'church'} />
          )}

          {/* 3. 주차별 주간 계획 + 일일 다이어리 교대 배치 (Weekly Plan + 7-Day Daily Diaries for each week) */}
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
                      weekLabel={`WEEK ${currentWeek}`}
                      monthName={monthName}
                      themeColor={activeColor}
                      pageWidth={pageWidth}
                      pageHeight={pageHeight}
                      isGeneralMode={categoryFilter !== 'church'}
                    />
                  )}
                  <DailyComponent
                    dateLabel={`${String(d).padStart(2, '0')} DAY`}
                    dayNum={d}
                    dayName={d % 7 === 1 ? 'SUN' : d % 7 === 2 ? 'MON' : d % 7 === 3 ? 'TUE' : d % 7 === 4 ? 'WED' : d % 7 === 5 ? 'THU' : d % 7 === 6 ? 'FRI' : 'SAT'}
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

          {/* 4. 월간 서브 노트 및 갓생/영성 트래커들 (Monthly Trackers & Special Notes) */}
          {selectedPages.habit && (
            <HabitComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
          )}
          {selectedPages.habit2 && (
            <Habit2Component year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
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
          {selectedPages.biblemap && (
            <BibleMapComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
          )}
          {selectedPages.biblemap2 && (
            <BibleMap2Component year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
          )}
          {selectedPages.letter && (
            <MonthlyLetterComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
          )}
          {selectedPages.letter2 && (
            <MonthlyLetter2Component year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
          )}
          {selectedPages.intercessory && (
            <IntercessoryComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
          )}
          {selectedPages.intercessory2 && (
            <Intercessory2Component year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
          )}
          {selectedPages.soapjournal && (
            <SoapJournalComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
          )}
          {selectedPages.soapjournal2 && (
            <SoapJournal2Component year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
          )}
          {selectedPages.fruitstracker && (
            <FruitsTrackerComponent year={selectedYear} monthName={monthName} themeColor={activeColor} pageWidth={pageWidth} pageHeight={pageHeight} />
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
  )
}
