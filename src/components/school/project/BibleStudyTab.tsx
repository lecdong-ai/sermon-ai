'use client'

import { useState, useMemo, useCallback, useEffect, useRef, useLayoutEffect, Fragment } from 'react'
import { useRouter } from 'next/navigation'
import { Anchor, ArrowRight, BookMarked, BookOpen, Check, ChevronDown, ChevronRight, Cross, FileText, Globe, Heart, History, Lightbulb, Loader2, PenLine, Plus, Sparkles, Tags, Volume2, Waypoints, X } from 'lucide-react'
import { ProjectDetail, BiblePassage } from '@/lib/school/project/types'
import { getStorageItem, setStorageItem, removeStorageItem } from '@/lib/school/storage'
import { syncToSupabase } from '@/lib/school/project/projectSync'
import type { SermonSection, ReferenceNote, JohnManuscriptData } from '@/lib/school/project/johnManuscriptData'
import {
  JOHN_VERSES,
  JOHN_TRANSLATION_NOTES,
  JOHN_COMMENTARIES,
  JOHN_PARALLEL_PASSAGES,
  JOHN_THEMES,
  type JohnWordDetail,
  type JohnCommentary,
} from '@/lib/school/project/johnStudyData'
import ProjectContextRow from '@/components/school/project/shared/ProjectContextRow'
import { computeProjectProgress, toStageStatusMap } from '@/lib/school/project/projectProgress'

const STUDY_DATA_REGISTRY: Record<string, {
  passage: string
  verses: any[]
  words: Record<string, any>
  commentaries: any[]
  translationNotes: any[]
  parallelPassages: any[]
  themes: { name: string; description: string; connectedSermons: number }[]
  contextInfo: {
    before: string; after: string; bookStructure: string;
    historicalBackground?: string; culturalContext?: string;
    theologicalContext?: string; redemptiveHistory?: string;
    keyThemes?: string[]; narrativeArc?: string;
  }}> = {}

function getStudyData(book: string, chapter: number) {
  const key = `${book}_${chapter}`
  return STUDY_DATA_REGISTRY[key] || null
}interface Props { project: ProjectDetail; passages?: BiblePassage[] }

type ViewMode = 'parallel' | 'focused' | 'compare'

interface EnglishWordDetail {
  id: string
  word: string
  partOfSpeech: string
  pronunciation: string
  basicMeaning: string
  contextualMeaning: string
  simpleExplanation: string
  usage: { ref: string; text: string }[]
  sermonNote: string
}

export default function BibleStudyTab({ project, passages }: Props) {
  const router = useRouter()
  const [selectedPassageIndex, setSelectedPassageIndex] = useState(0)

  const currentPassage = passages && passages.length > 1 ? passages[selectedPassageIndex] : null
  const activeBook = currentPassage?.book || project.book
  const activeChapter = currentPassage?.chapter ?? (currentPassage as any)?.chapterStart ?? project.chapter
  const activeVerseStart = currentPassage?.verseStart ?? project.verseStart
  const activeVerseEnd = currentPassage?.verseEnd ?? project.verseEnd
  const activePassageDisplay = currentPassage?.passage || project.passage
  const [viewMode, setViewMode] = useState<ViewMode>('parallel')
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null)
  const [selectedEnglishWord, setSelectedEnglishWord] = useState<{ word: string; clean: string; verse: number; version: string } | null>(null)
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null)
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null)
  const rightPanelRef = useRef<HTMLDivElement>(null)
  const scrollPosRef = useRef(0)
  const prevViewKeyRef = useRef('')
  const [memosByPassage, setMemosByPassage] = useState<Record<string, { text: string; tags: string[] }>>(() => {
    if (typeof window === 'undefined') return {}
    try {
      // 새 포맷: study_memos_${id} → JSON 객체
      const newFormat = localStorage.getItem(`study_memos_${project.id}`)
      if (newFormat) return JSON.parse(newFormat)
      // 마이그레이션: 옛 포맷 → legacy 키로 이관
      const oldText = localStorage.getItem(`study_memo_${project.id}`)
      if (oldText !== null) {
        const oldTags = localStorage.getItem(`study_memo_tags_${project.id}`)
        return { legacy: { text: oldText, tags: oldTags ? JSON.parse(oldTags) : [] } }
      }
    } catch (e) {
      console.error('[memo] init failed:', e)
    }
    return {}
  })
  const [suggestingMemo, setSuggestingMemo] = useState<'insight' | 'questions' | 'application' | null>(null)
  const [memoActionError, setMemoActionError] = useState<string | null>(null)
  const [expandedCommentary, setExpandedCommentary] = useState<number | null>(null)
  // ─── Translation Guardian: 기본은 한글만 켜진 상태 ───
  // 다른 4개(원어/음역/NIV/ESV)는 모두 OFF — 토글 시 lazy fetch
  const [showTranslations, setShowTranslations] = useState<Record<string, boolean>>({
    greek: false, translit: false, niv: false, esv: false, korean: true,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  // 핵심 분석 데이터 (words, commentaries, themes, contextInfo, verses.korean)
  const [coreData, setCoreData] = useState<Record<string, any>>({})
  // 번역 데이터 (lazy fetch) — { passageKey: { greek?: [], translit?: [], niv?: [], esv?: [] } }
  const [translationData, setTranslationData] = useState<Record<string, Record<string, any[]>>>({})
  // 번역 로딩 상태 — { passageKey: { greek?: bool, ... } }
  const [translationLoading, setTranslationLoading] = useState<Record<string, Record<string, boolean>>>({})
  const [translationError, setTranslationError] = useState<Record<string, Record<string, string | null>>>({})
  const [aiStudyLoading, setAiStudyLoading] = useState(false)
  const [aiStudyError, setAiStudyError] = useState<string | null>(null)
  const [bibleTextReady, setBibleTextReady] = useState(false)
  const [selectedFallbackWord, setSelectedFallbackWord] = useState<{ word: string; clean: string; verse: number; version?: string } | null>(null)
  const [wordLookup, setWordLookup] = useState<Record<string, JohnWordDetail>>({})
  const [lookupLoading, setLookupLoading] = useState(false)
  const [englishLookup, setEnglishLookup] = useState<Record<string, EnglishWordDetail>>({})
  const [englishLookupLoading, setEnglishLookupLoading] = useState(false)
  const [citingCommentary, setCitingCommentary] = useState<JohnCommentary | null>(null)
  const [citeSuccessMsg, setCiteSuccessMsg] = useState<string | null>(null)
  const [citeLoading, setCiteLoading] = useState(false)

  // ─── 다중 본문 통합 분석 (NEW) ───
  const isMulti = (passages?.length || 0) > 1
  const [activeView, setActiveView] = useState<'passage' | 'integration'>('passage')

  // 현재 선택된 passage의 메모 key (id 없으면 tab_${index}, 단일은 'legacy')
  const currentMemoKey = currentPassage?.id || (isMulti ? `tab_${selectedPassageIndex}` : 'legacy')
  const currentMemo = memosByPassage[currentMemoKey] || { text: '', tags: [] }
  const [multiStudyData, setMultiStudyData] = useState<{
    passages?: any[]  // 개별 분석은 coreData에 저장되므로 optional
    integration: {
      commonThemes: string[]
      connections: string[]
      contrasts: string[]
      synthesis: string
      parallelPassages: Array<{ ref: string; text: string; reason: string }>
    } | null
    generatedAt: string
    modelUsed?: string
    isFallback?: boolean
  } | null>(null)
  const [multiStudyLoading, setMultiStudyLoading] = useState(false)
  const [multiStudyError, setMultiStudyError] = useState<string | null>(null)

  const currentViewKey = selectedWordId
    || `${selectedFallbackWord?.word}_${selectedFallbackWord?.verse}`
    || `${selectedEnglishWord?.word}_${selectedEnglishWord?.verse}`
    || `verse_${selectedVerse}`
    || `theme_${selectedTheme}`
    || 'default'
  useLayoutEffect(() => {
    if (!rightPanelRef.current) return
    if (prevViewKeyRef.current === currentViewKey) {
      rightPanelRef.current.scrollTop = scrollPosRef.current
    } else {
      rightPanelRef.current.scrollTop = 0
    }
    prevViewKeyRef.current = currentViewKey
  })

  const multiCacheKey = useMemo(() => {
    if (!isMulti || !passages) return null
    const refs = passages
      .map(p => `${p.book}_${p.chapter}_${p.verseStart}-${p.verseEnd || p.verseStart}`)
      .sort()
      .join('__')
    return `multi_study_${refs}`
  }, [isMulti, passages])

  const loadManuscriptSections = useCallback((): SermonSection[] => {
    const saved = getStorageItem<JohnManuscriptData | null>(`manuscript_${project.id}`, null)
    return saved?.sections || []
  }, [project.id])

  const saveReferenceToManuscript = useCallback((commentary: JohnCommentary) => {
    const saved = getStorageItem<JohnManuscriptData | null>(`manuscript_${project.id}`, null)
    if (!saved) return
    const newNote: ReferenceNote = {
      id: `ref_${commentary.author}_${commentary.verse}_${Date.now()}`,
      title: `${commentary.author} - ${commentary.verse}절 주석`,
      content: commentary.text,
      category: commentary.type === 'exegetical' ? 'commentary' : commentary.type as any,
      author: commentary.author,
      book: commentary.source,
      tags: [commentary.type],
    }
    const updated = {
      ...saved,
      referenceNotes: [...(saved.referenceNotes || []), newNote],
    }
    setStorageItem(`manuscript_${project.id}`, { ...updated, _savedAt: Date.now() })
  }, [project.id])

  const passageKey = `${activeBook}_${activeChapter}_${activeVerseStart}-${activeVerseEnd || activeVerseStart}`

  const studyData = useMemo(() => {
    const registered = getStudyData(activeBook, activeChapter)
    if (registered) return registered
    return coreData[passageKey] || null
  }, [activeBook, activeChapter, coreData, passageKey])

  // ─── Translation Guardian: core(korean) + 켜진 translations 병합 ───
  // ParallelPassagePanel은 verses prop으로 greek/translit/korean/niv/esv를 모두 받음
  // coreData.verses에는 korean만, translationData에서 켜진 version을 합성
  const mergedVerses = useMemo(() => {
    const registered = getStudyData(activeBook, activeChapter)
    // Registered (MOCK) 데이터는 이미 4개 번역 다 있음 — 그대로 사용
    if (registered) return registered.verses

    const core = coreData[passageKey]
    if (!core?.verses) return []
    const trans = translationData[passageKey] || {}

    return core.verses.map((cv: any) => {
      const g = trans.greek?.find((v: any) => v.verse === cv.verse)
      const t = trans.translit?.find((v: any) => v.verse === cv.verse)
      const n = trans.niv?.find((v: any) => v.verse === cv.verse)
      const e = trans.esv?.find((v: any) => v.verse === cv.verse)
      return {
        ...cv,
        greek: g?.greek,
        translit: t?.translit,
        niv: n?.niv,
        esv: e?.esv,
      }
    })
  }, [activeBook, activeChapter, coreData, translationData, passageKey])

  const allWords = useMemo(() => ({
    ...(studyData?.words || {}),
    ...wordLookup,
  }), [studyData?.words, wordLookup])

  // ─── Legacy 캐시 마이그레이션: 옛 study_${key} → study_${key}_core + study_${key}_trans_${ver} ───
  const migrateLegacyCache = useCallback((key: string) => {
    try {
      const old = getStorageItem<any | null>(`study_${key}`, null)
      if (!old) return null
      const oldVerses: any[] = old.verses || []

      // core: korean만 보존, 나머지 메타데이터 그대로
      const core = {
        passage: old.passage || activePassageDisplay,
        verses: oldVerses.map((v: any) => ({ verse: v.verse, korean: v.korean || '' })),
        words: old.words || {},
        commentaries: old.commentaries || [],
        translationNotes: old.translationNotes || [],
        parallelPassages: old.parallelPassages || [],
        themes: old.themes || [],
        contextInfo: old.contextInfo || {},
        wordAlignments: old.wordAlignments || [],
      }
      setStorageItem(`study_${key}_core`, core)

      // trans: 각 version별로 분리 저장 (필드가 있는 것만)
      const transMap: Record<string, any[]> = {}
      for (const v of oldVerses) {
        if (v.greek) transMap.greek = [...(transMap.greek || []), { verse: v.verse, greek: v.greek }]
        if (v.translit) transMap.translit = [...(transMap.translit || []), { verse: v.verse, translit: v.translit }]
        if (v.niv) transMap.niv = [...(transMap.niv || []), { verse: v.verse, niv: v.niv }]
        if (v.esv) transMap.esv = [...(transMap.esv || []), { verse: v.verse, esv: v.esv }]
      }
      for (const [version, list] of Object.entries(transMap)) {
        setStorageItem(`study_${key}_trans_${version}`, list)
      }

      // 옛 키 삭제
      removeStorageItem(`study_${key}`)
      return { core, transMap }
    } catch (e) {
      console.error('[migration] legacy cache failed:', e)
      return null
    }
  }, [activePassageDisplay])

  // ─── 핵심 분석 fetch (Translation Guardian: bible-study-core) ───
  // - words, commentaries, themes, contextInfo, parallelPassages, translationNotes, wordAlignments
  // - verses에는 korean만 (서버에서 개역개정 자동 주입)
  // - greek/translit/niv/esv는 별도 lazy fetch (fetchTranslation)
  const fetchCore = useCallback(async () => {
    if (getStudyData(activeBook, activeChapter)) return
    if (coreData[passageKey]) return

    // 1) 신 캐시 확인
    const cached = getStorageItem<any | null>(`study_${passageKey}_core`, null)
    if (cached) {
      setCoreData(prev => ({ ...prev, [passageKey]: cached }))
      return
    }

    // 2) Legacy 캐시 마이그레이션
    const migrated = migrateLegacyCache(passageKey)
    if (migrated) {
      setCoreData(prev => ({ ...prev, [passageKey]: migrated.core }))
      if (Object.keys(migrated.transMap).length > 0) {
        setTranslationData(prev => ({
          ...prev,
          [passageKey]: { ...(prev[passageKey] || {}), ...migrated.transMap },
        }))
      }
      return
    }

    // 3) Phase 1: Bible API로 한글 본문 즉시 로딩 (서버 메모리 캐시 → < 50ms)
    setAiStudyError(null)
    setBibleTextReady(false)
    try {
      const bibleRes = await fetch(
        `/api/bible?book=${encodeURIComponent(activeBook)}&chapter=${activeChapter}&verseStart=${activeVerseStart}&verseEnd=${activeVerseEnd || activeVerseStart}`
      )
      if (bibleRes.ok) {
        const bibleJson = await bibleRes.json()
        if (bibleJson.success) {
          const partialData = {
            passage: activePassageDisplay,
            verses: bibleJson.verses.map((v: any) => ({ verse: v.verse, korean: v.content })),
            words: {},
            commentaries: [],
            translationNotes: [],
            parallelPassages: [],
            themes: [],
            contextInfo: {
              before: '', after: '', bookStructure: '',
              historicalBackground: '', culturalContext: '',
              theologicalContext: '', redemptiveHistory: '',
              keyThemes: [], narrativeArc: '',
            },
            wordAlignments: [],
          }
          setCoreData(prev => ({ ...prev, [passageKey]: partialData }))
          setBibleTextReady(true)
        }
      }
    } catch {
      // Bible API 실패 → AI에 의존
    }

    // 4) Phase 2: AI 분석 (words, commentaries, themes, ...)
    setAiStudyLoading(true)
    fetch('/school/api/sermons/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'bible-study-core',
        data: {
          book: activeBook,
          chapter: String(activeChapter),
          verseStart: String(activeVerseStart),
          verseEnd: activeVerseEnd ? String(activeVerseEnd) : undefined,
          passage: activePassageDisplay,
        },
      }),
    })
      .then(r => r.json())
      .then(json => {
        if (json.success) {
          try {
            const parsed = JSON.parse(json.data.output)
            const data = {
              passage: activePassageDisplay,
              verses: parsed.verses || [],  // korean만
              words: Object.fromEntries((parsed.words || []).map((w: any) => [w.id, w])),
              commentaries: parsed.commentaries || [],
              translationNotes: parsed.translationNotes || [],
              parallelPassages: parsed.parallelPassages || [],
              themes: parsed.themes || [],
              contextInfo: {
                before: parsed.contextInfo?.before || '',
                after: parsed.contextInfo?.after || '',
                bookStructure: parsed.contextInfo?.bookStructure || '',
                historicalBackground: parsed.contextInfo?.historicalBackground || '',
                culturalContext: parsed.contextInfo?.culturalContext || '',
                theologicalContext: parsed.contextInfo?.theologicalContext || '',
                redemptiveHistory: parsed.contextInfo?.redemptiveHistory || '',
                keyThemes: Array.isArray(parsed.contextInfo?.keyThemes) ? parsed.contextInfo.keyThemes : [],
                narrativeArc: parsed.contextInfo?.narrativeArc || '',
              },
              wordAlignments: parsed.wordAlignments || [],
            }
            setCoreData(prev => ({ ...prev, [passageKey]: data }))
            setStorageItem(`study_${passageKey}_core`, data)
          } catch {
            setAiStudyError('AI 응답을 해석하는 중 오류가 발생했습니다. 본문이 너무 길거나 응답이 잘렸습니다.')
          }
        } else {
          setAiStudyError(json.error || 'AI 분석에 실패했습니다.')
        }
      })
      .catch(() => {
        setAiStudyError('AI 서버에 연결할 수 없습니다. 다시 시도해주세요.')
      })
      .finally(() => setAiStudyLoading(false))
  }, [passageKey, activeVerseStart, activeVerseEnd, activePassageDisplay, coreData, activeBook, activeChapter, migrateLegacyCache])

  // ─── [신규] 번역 lazy fetch: greek | translit | niv | esv ───
  const fetchTranslation = useCallback((version: 'greek' | 'translit' | 'niv' | 'esv') => {
    if (getStudyData(activeBook, activeChapter)) return  // MOCK 경로는 fetch 불필요
    if (translationData[passageKey]?.[version]) return  // 이미 로드됨
    if (translationLoading[passageKey]?.[version]) return  // 이미 로딩 중

    // 1) 신 캐시 확인
    const cached = getStorageItem<any[] | null>(`study_${passageKey}_trans_${version}`, null)
    // [버그픽스] 옛 신 캐시 형식({verse, text}) 감지 시 무효화하고 재fetch
    //   - 이전 fetchTranslation이 {verse, text}로 저장했지만 mergedVerses는 {verse, [version]}을 찾음
    //   - 브라우저에 남은 broken cache를 자동 정리하여 즉시 정상화
    if (cached && Array.isArray(cached) && cached[0] && 'text' in cached[0] && !(version in cached[0])) {
      removeStorageItem(`study_${passageKey}_trans_${version}`)
      // fall through to API call below
    } else if (cached) {
      setTranslationData(prev => ({
        ...prev,
        [passageKey]: { ...(prev[passageKey] || {}), [version]: cached },
      }))
      return
    }

    // 2) API 호출
    setTranslationLoading(prev => ({
      ...prev,
      [passageKey]: { ...(prev[passageKey] || {}), [version]: true },
    }))
    setTranslationError(prev => ({
      ...prev,
      [passageKey]: { ...(prev[passageKey] || {}), [version]: null },
    }))

    fetch('/school/api/sermons/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'bible-study-translation',
        data: {
          book: activeBook,
          chapter: String(activeChapter),
          verseStart: String(activeVerseStart),
          verseEnd: activeVerseEnd ? String(activeVerseEnd) : undefined,
          passage: activePassageDisplay,
          version,
        },
      }),
    })
      .then(r => r.json())
      .then(json => {
        if (json.success) {
          try {
            const parsed = JSON.parse(json.data.output)
            // [버그픽스] API 응답 {verse, text}를 {verse, [version]: text}로 변환
            //   - mergedVerses가 n?.[version]을 찾으므로 저장 형식 일치 필요
            const list = (parsed.verses || []).map((v: any) => ({ verse: v.verse, [version]: v.text }))
            setTranslationData(prev => ({
              ...prev,
              [passageKey]: { ...(prev[passageKey] || {}), [version]: list },
            }))
            setStorageItem(`study_${passageKey}_trans_${version}`, list)
          } catch {
            setTranslationError(prev => ({
              ...prev,
              [passageKey]: { ...(prev[passageKey] || {}), [version]: 'AI 응답을 해석할 수 없습니다' },
            }))
          }
        } else {
          setTranslationError(prev => ({
            ...prev,
            [passageKey]: { ...(prev[passageKey] || {}), [version]: json.error || 'AI 분석에 실패했습니다' },
          }))
        }
      })
      .catch(() => {
        setTranslationError(prev => ({
          ...prev,
          [passageKey]: { ...(prev[passageKey] || {}), [version]: 'AI 서버에 연결할 수 없습니다' },
        }))
      })
      .finally(() => {
        setTranslationLoading(prev => ({
          ...prev,
          [passageKey]: { ...(prev[passageKey] || {}), [version]: false },
        }))
      })
  }, [passageKey, activeVerseStart, activeVerseEnd, activePassageDisplay, translationData, translationLoading, activeBook, activeChapter])

  // [신규] 재분석 함수 — core + 모든 translations 캐시 삭제 후 fetchCore
  const reAnalyze = useCallback((key: string) => {
    removeStorageItem(`study_${key}_core`)
    removeStorageItem(`study_${key}_trans_greek`)
    removeStorageItem(`study_${key}_trans_translit`)
    removeStorageItem(`study_${key}_trans_niv`)
    removeStorageItem(`study_${key}_trans_esv`)
    setCoreData(prev => {
      const next = { ...prev }
      delete next[key]
      return next
    })
    setTranslationData(prev => {
      const next = { ...prev }
      delete next[key]
      return next
    })
    setTranslationLoading(prev => {
      const next = { ...prev }
      delete next[key]
      return next
    })
    setTimeout(() => { void fetchCore() }, 50)
  }, [fetchCore])

  useEffect(() => {
    void fetchCore()
  }, [fetchCore])

  // 마이그레이션: 다중 본문에서 'legacy'로 저장된 메모를 'tab_0'으로 이관
  useEffect(() => {
    if (!isMulti) return
    setMemosByPassage(prev => {
      if (prev.legacy?.text?.trim() && !prev.tab_0?.text?.trim()) {
        return { ...prev, tab_0: prev.legacy }
      }
      return prev
    })
  }, [isMulti])

  // ─── 다중 본문 통합 분석 fetch (NEW) ───
  const fetchMultiStudy = useCallback(async () => {
    if (!isMulti || !passages || !multiCacheKey) return
    setMultiStudyError(null)

    // 1) 캐시 확인
    try {
      const cached = getStorageItem<any>(multiCacheKey, null)
      if (cached && cached.integration) {
        setMultiStudyData(cached)
        return
      }
    } catch {}

    // 2) API 호출 — 통합 분석만 (개별 분석은 fetchCore가 담당)
    setMultiStudyLoading(true)
    try {
      const res = await fetch('/school/api/sermons/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'bible-study',
          data: {
            passages: passages.map(p => ({
              book: p.book,
              chapter: p.chapter,
              verseStart: p.verseStart,
              verseEnd: p.verseEnd,
              text: p.passage,
            })),
            integrationOnly: true,  // 통합 분석만 요청 → 작은 출력, 잘림 방지
          },
        }),
      })
      const json = await res.json()
      if (json.success && json.data?.output) {
        try {
          const parsed = JSON.parse(json.data.output)
          const result = {
            integration: parsed.integration || null,
            generatedAt: new Date().toISOString(),
            modelUsed: json.data.modelUsed,
            isFallback: json.data.isFallback,
          }
          setMultiStudyData(result)
          try {
            setStorageItem(multiCacheKey, result)
          } catch {}
        } catch {
          setMultiStudyError('AI 응답을 해석하는 중 오류가 발생했습니다.')
        }
      } else {
        setMultiStudyError(json.error || 'AI 분석에 실패했습니다.')
      }
    } catch {
      setMultiStudyError('AI 서버에 연결할 수 없습니다.')
    } finally {
      setMultiStudyLoading(false)
    }
  }, [isMulti, passages, multiCacheKey])

  useEffect(() => {
    if (isMulti) {
      fetchMultiStudy()
    }
  }, [isMulti, fetchMultiStudy])

  const handleWordClick = (wordId: string, fallbackWord?: { word: string; clean: string; verse: number; version?: string } | null) => {
    if (fallbackWord && fallbackWord.version) {
      const cacheKey = `_englk_${fallbackWord.verse}_${fallbackWord.version}_${fallbackWord.clean}`
      if (englishLookup[cacheKey]) {
        setSelectedEnglishWord(fallbackWord as { word: string; clean: string; verse: number; version: string })
        setSelectedWordId(null)
        setSelectedFallbackWord(null)
        setSelectedVerse(null)
        setSelectedTheme(null)
        return
      }
      setSelectedEnglishWord(fallbackWord as { word: string; clean: string; verse: number; version: string })
      setSelectedWordId(null)
      setSelectedFallbackWord(null)
      setSelectedVerse(null)
      setSelectedTheme(null)
      setEnglishLookupLoading(true)
      fetch('/school/api/sermons/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'english-word',
          data: { word: fallbackWord.word, context: project.passage },
        }),
      })
        .then(r => r.json())
        .then(json => {
          if (json.success) {
            const parsed = JSON.parse(json.data.output)
            const wd: EnglishWordDetail = { ...parsed }
            setEnglishLookup(prev => ({ ...prev, [cacheKey]: wd }))
            setSelectedEnglishWord(fallbackWord as { word: string; clean: string; verse: number; version: string })
          }
        })
        .catch(() => {})
        .finally(() => setEnglishLookupLoading(false))
    } else if (fallbackWord) {
      const cacheKey = `_lookup_${fallbackWord.verse}_${fallbackWord.clean}`
      if (wordLookup[cacheKey]) {
        setSelectedWordId(cacheKey)
        setSelectedFallbackWord(null)
        setSelectedEnglishWord(null)
        setSelectedVerse(null)
        setSelectedTheme(null)
        return
      }
      setSelectedFallbackWord(fallbackWord)
      setSelectedWordId(null)
      setSelectedEnglishWord(null)
      setSelectedVerse(null)
      setSelectedTheme(null)
      setLookupLoading(true)
      fetch('/school/api/sermons/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'word-lookup',
          data: { word: fallbackWord.word, context: project.passage },
        }),
      })
        .then(r => r.json())
        .then(json => {
          if (json.success) {
            const parsed = JSON.parse(json.data.output)
            const wd: JohnWordDetail = { id: parsed.id || cacheKey, ...parsed }
            setWordLookup(prev => ({ ...prev, [cacheKey]: wd }))
            setSelectedWordId(cacheKey)
            setSelectedFallbackWord(null)
          }
        })
        .catch(() => {})
        .finally(() => setLookupLoading(false))
    } else {
      setSelectedWordId(wordId)
      setSelectedFallbackWord(null)
      setSelectedEnglishWord(null)
      setSelectedVerse(null)
      setSelectedTheme(null)
    }
  }

  const handleVerseClick = useCallback((verse: number) => {
    setSelectedVerse(verse)
    setSelectedWordId(null)
    setSelectedFallbackWord(null)
    setSelectedEnglishWord(null)
    setSelectedTheme(null)
  }, [])

  // ─── Auto Diff: 비교 인사이트에서 절 클릭 시 스크롤 + 선택 ───
  const handleScrollToVerse = useCallback((verse: number) => {
    setSelectedVerse(verse)
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        const el = document.getElementById(`verse-row-${verse}`)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 50)
    }
  }, [])

  // ─── Auto Diff: 활성 영어 버전 + 차이점 절 set 계산 ───
  const activeEnglishVersions = useMemo(() => {
    const out: string[] = []
    if (showTranslations.niv) out.push('NIV')
    if (showTranslations.esv) out.push('ESV')
    return out
  }, [showTranslations.niv, showTranslations.esv])

  const diffVerses = useMemo(() => {
    if (activeEnglishVersions.length < 2) return new Set<number>()
    const notes = (studyData as any)?.translationNotes as any[] | undefined
    if (!notes) return new Set<number>()
    const set = new Set<number>()
    for (const n of notes) {
      if (Array.isArray(n?.versions) && n.versions.some((v: string) => activeEnglishVersions.includes(v))) {
        if (typeof n.verse === 'number') set.add(n.verse)
      }
    }
    return set
  }, [activeEnglishVersions, studyData])

  const handleThemeClick = useCallback((theme: string) => {
    setSelectedTheme(theme)
    setSelectedWordId(null)
    setSelectedFallbackWord(null)
    setSelectedEnglishWord(null)
    setSelectedVerse(null)
  }, [])

  const handleCloseDetail = useCallback(() => {
    setSelectedWordId(null)
    setSelectedFallbackWord(null)
    setSelectedEnglishWord(null)
    setSelectedVerse(null)
    setSelectedTheme(null)
  }, [])

  const handleSaveMemo = useCallback(() => {
    if (!currentMemo.text.trim()) return
    setIsSaving(true)
    try {
      localStorage.setItem(`study_memos_${project.id}`, JSON.stringify(memosByPassage))
    } catch (e) {
      console.error('[memo] localStorage save failed:', e)
    }
    syncToSupabase(project.id, 'studyMemos', memosByPassage)
      .then(() => {})
      .catch(() => {})
    setIsSaving(false)
    setLastSaved(new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }))
  }, [currentMemo.text, memosByPassage, project.id])

  const handleSendToPrep = useCallback(() => {
    if (!studyData) {
      console.warn('[BibleStudyTab] studyData is null — cannot send to prep')
      return
    }
    const words = studyData?.words || {}
    const allWords = { ...words, ...wordLookup }
    const keyWordEntries = Object.values(allWords).slice(0, 7).map((w: any) => ({
      word: w.lemmaGreek ? `${w.lemmaGreek} (${w.lemma || ''})` : w.word || '',
      meaning: w.basicMeaning || '',
      note: w.contextualMeaning || w.simpleExplanation || '',
    }))
    const insightEntries = (studyData?.commentaries || []).map((c: any) => c.text).filter(Boolean).slice(0, 5)
    const contextEntries = [
      ...(studyData?.themes || []).map((t: any) => `${t.name}: ${t.description}`),
      ...(studyData?.translationNotes || []).map((n: any) => `[${n.verse}절 번역] ${n.note}`),
    ].slice(0, 5)
    // 각 passage의 메모에 라벨 부여
    const memosByPassageWithLabel: Record<string, { label: string; text: string; tags: string[] }> = {}
    ;((passages as BiblePassage[] | undefined) || []).forEach((p: BiblePassage, i: number) => {
      const key = p.id || (isMulti ? `tab_${i}` : 'legacy')
      const m = memosByPassage[key]
      memosByPassageWithLabel[key] = {
        label: p.passage || `${p.book} ${p.chapter}:${p.verseStart}${p.verseEnd && p.verseEnd !== p.verseStart ? `-${p.verseEnd}` : ''}`,
        text: m?.text || '',
        tags: m?.tags || [],
      }
    })
    // legacy 단일 passage fallback (passages prop에 항목이 1개도 없을 때)
    if (Object.keys(memosByPassageWithLabel).length === 0 && memosByPassage.legacy) {
      memosByPassageWithLabel.legacy = {
        label: project.passage || `${project.book} ${project.chapter}:${project.verseStart}${project.verseEnd && project.verseEnd !== project.verseStart ? `-${project.verseEnd}` : ''}`,
        text: memosByPassage.legacy.text,
        tags: memosByPassage.legacy.tags,
      }
    }
    // 다중 본문: 각 passage의 연구 데이터를 수집
    const multiPassageData: Array<{
      label: string
      words: any[]
      commentaries: string[]
      themes: string[]
      contextInfo: any
    }> = []
    if (isMulti && passages) {
      for (const p of passages) {
        const vs = p.verseStart ?? 1
        const ve = p.verseEnd ?? vs
        const key = `${p.book}_${p.chapter}_${vs}-${ve}`
        // 신 캐시(_core) 우선, 없으면 옛 캐시(study_${key}) 시도 (마이그레이션 이전 데이터 호환)
        const data = coreData[key] || getStorageItem<any | null>(`study_${key}_core`, null) || getStorageItem<any | null>(`study_${key}`, null)
        if (data) {
          multiPassageData.push({
            label: p.passage || `${p.book} ${p.chapter}:${vs}${ve !== vs ? `-${ve}` : ''}`,
            words: data.words ? Object.values(data.words).slice(0, 5).map((w: any) => ({
              word: w.lemmaGreek ? `${w.lemmaGreek} (${w.lemma || ''})` : w.word || '',
              meaning: w.basicMeaning || '',
              note: w.contextualMeaning || w.simpleExplanation || '',
            })) : [],
            commentaries: (data.commentaries || []).map((c: any) => c.text).filter(Boolean).slice(0, 3),
            themes: (data.themes || []).map((t: any) => `${t.name}: ${t.description}`).slice(0, 3),
            contextInfo: data.contextInfo || null,
          })
        }
      }
    }

    const prepPayload = {
      passageStructure: studyData?.contextInfo?.bookStructure || '',
      contextPoints: contextEntries,
      keyWords: keyWordEntries,
      researchInsights: insightEntries,
      memosByPassage: memosByPassageWithLabel,
      multiPassageData: multiPassageData.length > 0 ? multiPassageData : undefined,
      multiIntegration: isMulti && multiStudyData?.integration ? {
        commonThemes: multiStudyData.integration.commonThemes,
        connections: multiStudyData.integration.connections,
        contrasts: multiStudyData.integration.contrasts,
        synthesis: multiStudyData.integration.synthesis,
      } : undefined,
    }
    setStorageItem(`study_to_prep_${project.id}`, prepPayload)
    sessionStorage.setItem(`sermonai_study_to_prep_${project.id}`, JSON.stringify(prepPayload))
    ;(window as any).__prepDataBuffer = prepPayload
    router.push(`/projects/${project.id}?tab=prep`)
  }, [project.id, router, studyData, wordLookup, memosByPassage, passages, project, isMulti, coreData, multiStudyData])

  // ─── Translation Guardian: 토글 + Smart Cascade ───
  // greek ↔ translit 자동 연동 (원어 켜면 음역도, 끄면 음역도)
  // fetch는 useEffect에서 처리 (showTranslations 변동 감지)
  const toggleTranslation = useCallback((key: string) => {
    setShowTranslations(prev => {
      const willBeOn = !prev[key]
      const next = { ...prev, [key]: willBeOn }
      // Smart Cascade: greek ↔ translit
      if (key === 'greek') {
        next.translit = willBeOn
      }
      return next
    })
  }, [])

  // 켜진 version 중 데이터 없는 것 lazy fetch
  useEffect(() => {
    if (!passageKey) return
    const trans = translationData[passageKey] || {}
    const loading = translationLoading[passageKey] || {}
    ;(['greek', 'translit', 'niv', 'esv'] as const).forEach(v => {
      if (showTranslations[v] && !trans[v] && !loading[v]) {
        fetchTranslation(v)
      }
    })
  }, [showTranslations, passageKey, translationData, translationLoading, fetchTranslation])

  const toggleMemoTag = useCallback((tag: string) => {
    setMemosByPassage(prev => {
      const cur = prev[currentMemoKey] || { text: '', tags: [] }
      const newTags = cur.tags.includes(tag) ? cur.tags.filter(t => t !== tag) : [...cur.tags, tag]
      return { ...prev, [currentMemoKey]: { ...cur, tags: newTags } }
    })
  }, [currentMemoKey])

  const updateMemoText = useCallback((value: string) => {
    setMemosByPassage(prev => {
      const cur = prev[currentMemoKey] || { text: '', tags: [] }
      return { ...prev, [currentMemoKey]: { ...cur, text: value } }
    })
  }, [currentMemoKey])

  const handleMemoAction = useCallback(async (type: 'insight' | 'questions' | 'application') => {
    setSuggestingMemo(type)
    setMemoActionError(null)
    const apiType = type === 'insight' ? 'memo-insight' : type === 'questions' ? 'memo-questions' : 'memo-application-idea'
    const headerLabel = type === 'insight' ? 'AI 통찰' : type === 'questions' ? '질문' : '적용 아이디어'
    const currentText = memosByPassage[currentMemoKey]?.text || ''
    const currentTags = memosByPassage[currentMemoKey]?.tags || []
    try {
      const res = await fetch('/school/api/sermons/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: apiType,
          data: {
            book: currentPassage?.book || project.book,
            chapter: currentPassage?.chapter ?? (currentPassage as any)?.chapterStart ?? project.chapter,
            verseStart: currentPassage?.verseStart ?? project.verseStart,
            verseEnd: currentPassage?.verseEnd ?? project.verseEnd,
            memoText: currentText,
            memoTags: currentTags,
          },
        }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'AI 요청에 실패했습니다')
      }
      const parsed = JSON.parse(json.data.output)
      const items: string[] = parsed.insights || parsed.questions || parsed.applications || []
      if (items.length === 0) {
        throw new Error('AI 응답이 비어 있습니다')
      }
      const bulletText = items.map(i => `- ${i}`).join('\n')
      const separator = currentText.trim() ? '\n\n' : ''
      const newBlock = `${separator}## ${headerLabel}\n${bulletText}\n`
      setMemosByPassage(prev => {
        const cur = prev[currentMemoKey] || { text: '', tags: [] }
        return { ...prev, [currentMemoKey]: { ...cur, text: cur.text + newBlock } }
      })
    } catch (e: any) {
      setMemoActionError(e?.message || 'AI 요청 중 오류가 발생했습니다')
      setTimeout(() => setMemoActionError(null), 3000)
    } finally {
      setSuggestingMemo(null)
    }
  }, [memosByPassage, currentMemoKey, currentPassage, project])

  const handleCopyStudyResults = useCallback(() => {
    if (!studyData) return
    const words = studyData?.words || {}
    const wordList = Object.values(words).slice(0, 5)
    const commentaries = studyData?.commentaries || []
    const themes = studyData?.themes || []

    let text = `# ${studyData.passage} 연구 결과\n\n`
    text += `## 본문 구조\n${studyData.contextInfo?.bookStructure || ''}\n\n`
    text += `## 원어 연구\n`
    wordList.forEach((w: any) => {
      text += `- ${w.lemmaGreek || w.word}: ${w.basicMeaning}\n`
    })
    text += `\n## 주석 통찰\n`
    commentaries.slice(0, 5).forEach((c: any) => {
      text += `- ${c.author}: ${c.text}\n`
    })
    text += `\n## 주제\n`
    themes.forEach((t: any) => {
      text += `- ${t.name}: ${t.description}\n`
    })
    const memoEntries = Object.entries(memosByPassage).filter(([, m]) => m.text?.trim())
    if (memoEntries.length > 0) {
      text += `\n## 연구 메모\n`
      for (const [key, m] of memoEntries) {
        const p = (passages || []).find((pp, idx) => {
          const ppKey = pp.id || (isMulti ? `tab_${idx}` : 'legacy')
          return ppKey === key
        })
        const label = p?.passage || key
        text += `\n### ${label}\n${m.text.trim()}\n`
      }
    }

    navigator.clipboard.writeText(text)
  }, [studyData, memosByPassage, passages, isMulti])

  const handleViewFullChapter = useCallback(() => {
    window.open(`/advanced/study/${activeBook}/${activeChapter}`, '_blank')
  }, [activeBook, activeChapter])

  return (
    <div className="flex gap-0 h-full">
      {/* ─── Main Content ─── */}
      <div className="flex-1 min-w-0 overflow-y-auto scrollbar-thin pr-5">

        {/* Project Context */}
        <ProjectContextRow
          project={project}
          currentStage="study"
          stageStatus={toStageStatusMap(computeProjectProgress(project.id, project.passages))}
          lastSaved={lastSaved || undefined}
        />

        {/* Passage Tabs */}
        {passages && passages.length > 1 && (
          <div className="flex items-center gap-1.5 px-5 py-3 border-b border-white/5 bg-[#04060f]/40">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider mr-2">본문</span>
            {passages.map((p, i) => (
              <button
                key={i}
                onClick={() => { setSelectedPassageIndex(i); setActiveView('passage') }}
                className={`text-[12px] px-3 py-1.5 rounded-xl font-bold transition-all ${
                  selectedPassageIndex === i && activeView === 'passage'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                }`}
              >
                {p.passage}
              </button>
            ))}
            {/* 통합 인사이트 탭 (NEW) — 분석 완료 또는 에러 시 표시 */}
            {isMulti && (multiStudyData?.integration || multiStudyError) && (
              <button
                onClick={() => setActiveView('integration')}
                className={`text-[12px] px-3 py-1.5 rounded-xl font-bold transition-all ${
                  activeView === 'integration'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                    : multiStudyError
                    ? 'bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/20'
                    : 'bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 border border-purple-500/20'
                }`}
              >
                ✨ 통합 인사이트 {multiStudyError && <span className="ml-1 text-rose-400">⚠</span>}
              </button>
            )}
          </div>
        )}

        {/* 통합 인사이트 뷰 (NEW) — 다중 본문 모드에서만 */}
        {isMulti && activeView === 'integration' && (
          <div className="space-y-4 animate-fade-in px-5 py-5">
            {multiStudyLoading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
                <div className="text-center space-y-2">
                  <h3 className="text-[16px] font-bold text-white">
                    AI가 {passages?.length || 0}개 본문을 통합 분석 중입니다
                  </h3>
                  <p className="text-[12px] text-slate-400">
                    각 본문 분석 + 신학적 연결점 + 통합 메시지 도출
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-3 text-[11px]">
                    {(passages || []).map((p, i) => (
                      <span key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                        {p.passage}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : multiStudyError ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                  <X className="w-8 h-8 text-rose-400" />
                </div>
                <div className="text-center space-y-2 max-w-md">
                  <h3 className="text-[15px] font-bold text-white">통합 분석을 가져올 수 없습니다</h3>
                  <p className="text-[12px] text-rose-300/80 break-words">{multiStudyError}</p>
                </div>
                <button
                  onClick={fetchMultiStudy}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-bold"
                >
                  <Loader2 className="w-3.5 h-3.5" /> 다시 시도
                </button>
              </div>
            ) : multiStudyData?.integration ? (
              <div className="space-y-4">
                {/* 통합 헤더 */}
                <div className="bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-cyan-500/10 border border-purple-500/20 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Sparkles className="w-4 h-4 text-purple-300" />
                    <h2 className="text-[14px] font-extrabold text-white">통합 인사이트</h2>
                  </div>
                  <p className="text-[10.5px] text-slate-500">
                    {(passages || []).map(p => p.passage).join(' · ')} 통합 분석 결과
                    {multiStudyData.modelUsed && (
                      <span className="ml-1.5 text-[9.5px] text-slate-600">
                        · {multiStudyData.isFallback ? '⚠ ' : ''}{multiStudyData.modelUsed}
                      </span>
                    )}
                  </p>
                </div>

                {/* 통합 메시지 */}
                {multiStudyData.integration.synthesis && (
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/[0.12] to-indigo-500/[0.08] border border-purple-500/30 p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                      <span className="text-[10px] font-extrabold text-purple-200 uppercase tracking-wider">통합 메시지</span>
                    </div>
                    <p className="text-[18px] font-extrabold text-white leading-relaxed">
                      &ldquo;{multiStudyData.integration.synthesis}&rdquo;
                    </p>
                  </div>
                )}

                {/* 공통 주제 */}
                {multiStudyData.integration.commonThemes.length > 0 && (
                  <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4">
                    <h3 className="text-[10px] font-extrabold text-indigo-300 uppercase tracking-wider mb-2">📌 공통 주제</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {multiStudyData.integration.commonThemes.map((t, i) => (
                        <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-200 text-[11px] font-bold">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 연결점 */}
                {multiStudyData.integration.connections.length > 0 && (
                  <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4">
                    <h3 className="text-[10px] font-extrabold text-emerald-300 uppercase tracking-wider mb-2">🔗 연결점 ({multiStudyData.integration.connections.length}개)</h3>
                    <ul className="space-y-1.5">
                      {multiStudyData.integration.connections.map((c, i) => (
                        <li key={i} className="flex items-start gap-2 text-[12px] text-slate-300 leading-relaxed">
                          <span className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 대비점 */}
                {multiStudyData.integration.contrasts.length > 0 && (
                  <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4">
                    <h3 className="text-[10px] font-extrabold text-rose-300 uppercase tracking-wider mb-2">⚔️ 긴장 / 대비</h3>
                    <ul className="space-y-1.5">
                      {multiStudyData.integration.contrasts.map((c, i) => (
                        <li key={i} className="flex items-start gap-2 text-[12px] text-slate-300 leading-relaxed">
                          <span className="text-rose-300 mt-0.5">⚡</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 평행 본문 */}
                {multiStudyData.integration.parallelPassages.length > 0 && (
                  <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4">
                    <h3 className="text-[10px] font-extrabold text-cyan-300 uppercase tracking-wider mb-2">📖 관련 평행 본문</h3>
                    <div className="space-y-1.5">
                      {multiStudyData.integration.parallelPassages.map((p, i) => (
                        <div key={i} className="p-2.5 rounded-lg bg-cyan-500/[0.05] border border-cyan-500/20">
                          <div className="flex items-center gap-1.5 mb-1">
                            <BookOpen className="w-3 h-3 text-cyan-300" />
                            <span className="text-[11px] font-bold text-cyan-200 tabular-nums">{p.ref}</span>
                          </div>
                          <p className="text-[11px] text-slate-300 leading-relaxed">{p.text}</p>
                          {p.reason && (
                            <p className="text-[10px] text-slate-500 italic mt-1 pt-1 border-t border-white/5">💡 {p.reason}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16 text-[12px] text-slate-500">
                통합 인사이트를 생성 중입니다...
              </div>
            )}
          </div>
        )}

        {studyData ? (
          <>
            {/* Research Toolbar */}
            <ResearchToolbar
              passage={studyData.passage}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              showTranslations={showTranslations}
              onToggleTranslation={toggleTranslation}
              isSaving={isSaving}
              lastSaved={lastSaved}
              onSendToPrep={handleSendToPrep}
              onReAnalyze={() => reAnalyze(passageKey)}
              translationState={(() => {
                const trans = translationData[passageKey] || {}
                const loading = translationLoading[passageKey] || {}
                return {
                  greek: { loading: !!loading.greek, hasData: !!trans.greek },
                  translit: { loading: !!loading.translit, hasData: !!trans.translit },
                  niv: { loading: !!loading.niv, hasData: !!trans.niv },
                  esv: { loading: !!loading.esv, hasData: !!trans.esv },
                }
              })()}
              previewVerses={(() => {
                const trans = translationData[passageKey] || {}
                const findFirst = (arr: any[]) => arr?.find((v: any) => v.verse === 1) || arr?.[0]
                return {
                  greek: findFirst(trans.greek || [])?.greek,
                  translit: findFirst(trans.translit || [])?.translit,
                  niv: findFirst(trans.niv || [])?.niv,
                  esv: findFirst(trans.esv || [])?.esv,
                }
              })()}
            />

            {/* AI 분석 진행 중 (Phase 1 본문 표시 완료, Phase 2 AI 분석 중) */}
            {aiStudyLoading && bibleTextReady && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[12px] text-indigo-300">
                <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                <span>AI가 단어 분석, 주석, 테마를 생성하는 중입니다...</span>
              </div>
            )}

            {/* Auto Diff: NIV + ESV 등 2개 영어 버전 켜졌을 때 비교 인사이트 */}
            {viewMode !== 'compare' && (
              <TranslationDiffSummary
                translationNotes={(studyData as any)?.translationNotes || []}
                activeEnglishVersions={activeEnglishVersions}
                onScrollToVerse={handleScrollToVerse}
              />
            )}

            {/* Context Explorer - 본문(Diff) 다음에 표시 */}
            <ContextExplorer info={studyData.contextInfo} />

            {/* 병렬 모드: 여러 번역본 나란히 */}
            {viewMode === 'parallel' && (
              <ParallelPassagePanel
                verses={mergedVerses}
                words={allWords}
                wordAlignments={(studyData as any)?.wordAlignments || []}
                showTranslations={showTranslations}
                selectedWordId={selectedWordId}
                selectedVerse={selectedVerse}
                onWordClick={handleWordClick}
                onVerseClick={handleVerseClick}
                translationLoading={translationLoading[passageKey] || {}}
                diffVerses={diffVerses}
              />
            )}

            {/* 집중 모드: 원어 분석, 주석에 집중 */}
            {viewMode === 'focused' && (
              <>
                <ParallelPassagePanel
                  verses={mergedVerses}
                  words={allWords}
                  wordAlignments={(studyData as any)?.wordAlignments || []}
                  showTranslations={showTranslations}
                  selectedWordId={selectedWordId}
                  selectedVerse={selectedVerse}
                  onWordClick={handleWordClick}
                  onVerseClick={handleVerseClick}
                  translationLoading={translationLoading[passageKey] || {}}
                  diffVerses={diffVerses}
                />
                <CommentarySummary
                  commentaries={studyData.commentaries}
                  expandedId={expandedCommentary}
                  onToggleExpand={setExpandedCommentary}
                  onVerseClick={handleVerseClick}
                  onSaveReference={(c) => {
                    saveReferenceToManuscript(c)
                    setCiteSuccessMsg(`"${c.author}" 주석이 설교 자료의 참고 메모에 저장되었습니다`)
                    setTimeout(() => setCiteSuccessMsg(null), 3000)
                  }}
                  onCiteInManuscript={setCitingCommentary}
                />
              </>
            )}

            {/* 비교 모드: 번역 차이, 평행본문, 주제 연결 */}
            {viewMode === 'compare' && (
              <>
                <TranslationDifferenceCard notes={studyData.translationNotes} />
                <ParallelPassagesSection passages={studyData.parallelPassages} />
                <ThemeConnections
                  themes={studyData.themes}
                  selectedTheme={selectedTheme}
                  onThemeClick={handleThemeClick}
                />
              </>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 space-y-6">
            {aiStudyError ? (
              <>
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-bold text-white">분석 중 오류 발생</h3>
                  <p className="text-sm text-slate-400 mt-1">{activePassageDisplay}</p>
                  <p className="text-sm text-red-400/80 mt-2">{aiStudyError}</p>
                </div>
                <button
                  onClick={fetchCore}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-colors"
                >
                  <Loader2 className="w-4 h-4" />
                  다시 시도
                </button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-bold text-white">
                    {aiStudyLoading ? 'AI가 본문을 분석하고 있습니다' : '분석 준비 중'}
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">{activePassageDisplay}</p>
                  <p className="text-sm text-slate-400">
                    {aiStudyLoading
                      ? '원문 분석, 주석, 번역 비교 등을 생성하는 중입니다 (10-20초 소요)'
                      : '잠시만 기다려주세요'}
                  </p>
                </div>
                {aiStudyLoading && (
                  <div className="w-full max-w-lg space-y-3 animate-pulse">
                    <div className="h-4 bg-white/5 rounded-xl w-3/4" />
                    <div className="h-4 bg-white/5 rounded-xl w-full" />
                    <div className="h-4 bg-white/5 rounded-xl w-5/6" />
                    <div className="h-20 bg-white/5 rounded-xl w-full" />
                    <div className="h-4 bg-white/5 rounded-xl w-2/3" />
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Research Notes Editor */}
        <ResearchNotesEditor
          value={currentMemo.text}
          onChange={updateMemoText}
          tags={currentMemo.tags}
          onToggleTag={toggleMemoTag}
          onSave={handleSaveMemo}
          isSaving={isSaving}
          lastSaved={lastSaved}
          onSuggest={handleMemoAction}
          suggesting={suggestingMemo}
          suggestionError={memoActionError}
        />

        {/* ─── Research Summary for Prep Handoff ─── */}
        {studyData && <ResearchSummaryForPrep studyData={studyData} onSendToPrep={handleSendToPrep} projectTitle={project.title} passage={activePassageDisplay} projectId={project.id} />}

        {/* Bottom spacer */}
        <div className="h-8" />
      </div>

      {/* ─── Right Panel ─── */}
      <div ref={rightPanelRef} onScroll={(e) => { scrollPosRef.current = e.currentTarget.scrollTop }} className="w-80 shrink-0 border-l border-white/5 bg-[#04060f]/60 overflow-y-auto scrollbar-thin">
        <RightPanel
          words={allWords}
          selectedWordId={selectedWordId}
          selectedFallbackWord={selectedFallbackWord}
          lookupLoading={lookupLoading}
          selectedEnglishWord={selectedEnglishWord}
          englishLookup={englishLookup}
          englishLookupLoading={englishLookupLoading}
          selectedVerse={selectedVerse}
          selectedTheme={selectedTheme}
          onCloseDetail={handleCloseDetail}
          onSendToPrep={handleSendToPrep}
          memosByPassage={memosByPassage}
          currentMemoLabel={memosByPassage[currentMemoKey] ? (currentPassage?.passage || '') : ''}
          passages={passages || []}
          commentaries={studyData?.commentaries || []}
          verses={studyData?.verses || []}
          themes={studyData?.themes || []}
          onCopyResults={handleCopyStudyResults}
          onViewFullChapter={handleViewFullChapter}
        />
      </div>

      {/* Citation Dialog */}
      {citingCommentary && (
        <CitationDialog
          commentary={citingCommentary}
          sections={loadManuscriptSections()}
          projectId={project.id}
          onClose={() => setCitingCommentary(null)}
          onCiteToSection={async (sectionId, sectionLabel) => {
            setCiteLoading(true)
            try {
              const res = await fetch('/school/api/sermons/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  type: 'reference-weave',
                  data: {
                    sectionContent: '',
                    referenceContent: citingCommentary!.text,
                    referenceAuthor: citingCommentary!.author,
                    referenceBook: citingCommentary!.source,
                  },
                }),
              })
              const json = await res.json()
              let woven = json.data?.output || ''
              const firstOpen = woven.indexOf('{')
              const lastClose = woven.lastIndexOf('}')
              if (firstOpen !== -1 && lastClose > firstOpen) {
                try {
                  woven = JSON.parse(woven.slice(firstOpen, lastClose + 1))
                  woven = woven.text || woven.content || woven
                } catch {}
              }

              const saved = getStorageItem<JohnManuscriptData | null>(`manuscript_${project.id}`, null)
              if (saved) {
                const newNote: ReferenceNote = {
                  id: `ref_${citingCommentary!.author}_${citingCommentary!.verse}_${Date.now()}`,
                  title: `${citingCommentary!.author} - ${citingCommentary!.verse}절 주석`,
                  content: citingCommentary!.text,
                  category: citingCommentary!.type === 'exegetical' ? 'commentary' : citingCommentary!.type as any,
                  author: citingCommentary!.author,
                  book: citingCommentary!.source,
                  tags: [citingCommentary!.type],
                  linkedSectionId: sectionId,
                }
                const updatedSections = saved.sections.map(s =>
                  s.id === sectionId
                    ? { ...s, content: s.content + (s.content ? '\n\n' : '') + (typeof woven === 'string' ? woven : citingCommentary!.text) }
                    : s
                )
                setStorageItem(`manuscript_${project.id}`, {
                  ...saved,
                  sections: updatedSections,
                  referenceNotes: [...(saved.referenceNotes || []), newNote],
                  _savedAt: Date.now(),
                })
                setCitingCommentary(null)
                setCiteSuccessMsg(`"${citingCommentary!.author}" 주석이 [${sectionLabel}]에 인용되었습니다`)
                setTimeout(() => setCiteSuccessMsg(null), 4000)
              }
            } catch {
              setCiteSuccessMsg('인용 중 오류가 발생했습니다')
              setTimeout(() => setCiteSuccessMsg(null), 3000)
            }
            setCiteLoading(false)
          }}
          onCreateSection={async () => {
            setCiteLoading(true)
            try {
              const res = await fetch('/school/api/sermons/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  type: 'commentary-to-section',
                  data: {
                    author: citingCommentary!.author,
                    text: citingCommentary!.text,
                    source: citingCommentary!.source,
                    type: citingCommentary!.type,
                  },
                }),
              })
              const json = await res.json()
              let sectionData = json.data?.output || ''
              const firstBrace = sectionData.indexOf('{')
              const lastBrace = sectionData.lastIndexOf('}')
              if (firstBrace !== -1 && lastBrace > firstBrace) {
                try {
                  const parsed = JSON.parse(sectionData.slice(firstBrace, lastBrace + 1))
                  sectionData = parsed
                } catch {
                  sectionData = { label: `${citingCommentary!.author} 주석 중심`, content: sectionData }
                }
              }
              const parsedSection = typeof sectionData === 'object' ? sectionData : { label: `${citingCommentary!.author} 주석`, content: sectionData }

              const saved = getStorageItem<JohnManuscriptData | null>(`manuscript_${project.id}`, null)
              const newSection: SermonSection = {
                id: `sec_body_${Date.now()}`,
                type: 'body',
                label: parsedSection.label || `${citingCommentary!.author} 주석 중심`,
                content: parsedSection.content || '',
                aiGenerated: true,
              }
              const newNote: ReferenceNote = {
                id: `ref_${citingCommentary!.author}_${citingCommentary!.verse}_${Date.now()}`,
                title: `${citingCommentary!.author} - ${citingCommentary!.verse}절 주석`,
                content: citingCommentary!.text,
                category: citingCommentary!.type === 'exegetical' ? 'commentary' : citingCommentary!.type as any,
                author: citingCommentary!.author,
                book: citingCommentary!.source,
                tags: [citingCommentary!.type],
                linkedSectionId: newSection.id,
              }
              const updated: JohnManuscriptData = saved || {
                title: '', oneSentenceSummary: '', passage: activePassageDisplay,
                sermonDate: '', audience: '', tone: '',
                sections: [], illustrationNotes: [], referenceNotes: [],
                coreMessage: '', outlinePoints: [], prepInsights: [], warningPoints: [],
                greekWords: [], relatedPassages: [],
              }
              setStorageItem(`manuscript_${project.id}`, {
                ...updated,
                sections: [...updated.sections, newSection],
                referenceNotes: [...(updated.referenceNotes || []), newNote],
                _savedAt: Date.now(),
              })
              setCitingCommentary(null)
              setCiteSuccessMsg(`"${citingCommentary!.author}" 주석으로 새 대지가 생성되었습니다. 설교 작성 탭에서 확인하세요!`)
              setTimeout(() => setCiteSuccessMsg(null), 5000)
            } catch {
              setCiteSuccessMsg('대지 생성 중 오류가 발생했습니다')
              setTimeout(() => setCiteSuccessMsg(null), 3000)
            }
            setCiteLoading(false)
          }}
          loading={citeLoading}
        />
      )}

      {/* Success Toast */}
      {citeSuccessMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-teal-600/90 text-white text-xs font-medium px-4 py-3 rounded-xl shadow-2xl backdrop-blur-sm animate-fade-in">
          <Check className="w-4 h-4 shrink-0" />
          {citeSuccessMsg}
          <button onClick={() => setCiteSuccessMsg(null)} className="ml-2 opacity-60 hover:opacity-100">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  )
}

function CitationDialog({ commentary, sections, projectId, onClose, onCiteToSection, onCreateSection, loading }: {
  commentary: JohnCommentary
  sections: SermonSection[]
  projectId: string
  onClose: () => void
  onCiteToSection: (sectionId: string, sectionLabel: string) => void
  onCreateSection: () => void
  loading: boolean
}) {
  const [mode, setMode] = useState<'create' | 'cite'>(sections.length > 0 ? 'cite' : 'create')
  const [selectedSection, setSelectedSection] = useState(sections[0]?.id || '')

  const sectionIcons: Record<string, any> = {
    introduction: FileText,
    body: BookOpen,
    conclusion: Sparkles,
    application: Lightbulb,
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0a0e1a] border border-white/10 rounded-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <PenLine className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-semibold text-slate-100">원고에 인용</span>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-[#04060f]/60 rounded-xl p-3 border border-white/5">
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">인용할 주석</div>
            <div className="text-xs text-slate-100 font-medium mb-0.5">{commentary.author}</div>
            <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
              {commentary.text.slice(0, 100)}...
            </p>
            <p className="text-[10px] text-slate-500 mt-1 italic">— {commentary.source}</p>
          </div>

          <div>
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">인용 방식</div>
            <div className="space-y-1">
              {/* 새 대지 만들기 */}
              <button
                onClick={() => setMode('create')}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${
                  mode === 'create'
                    ? 'bg-teal-500/10 border border-teal-500/30'
                    : 'bg-[#04060f]/60 border border-white/5 hover:bg-white/5'
                }`}
              >
                <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5">
                  {mode === 'create' && <div className="w-2.5 h-2.5 rounded-full bg-teal-400" />}
                </div>
                <div>
                  <div className="text-xs font-medium text-teal-300 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    이 주석으로 새 대지 만들기
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    AI가 주석을 바탕으로 설교 본문 대지를 자동 생성합니다
                  </div>
                </div>
              </button>

              {/* 기존 섹션에 인용 */}
              {sections.length > 0 && (
                <>
                  <div className="flex items-center gap-2 py-1">
                    <div className="flex-1 h-px bg-white/5" />
                    <span className="text-[9px] text-slate-500 uppercase tracking-widest">또는 기존 섹션</span>
                    <div className="flex-1 h-px bg-white/5" />
                  </div>
                  {sections.map(s => (
                    <button
                      key={s.id}
                      onClick={() => { setMode('cite'); setSelectedSection(s.id) }}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${
                        mode === 'cite' && selectedSection === s.id
                          ? 'bg-indigo-500/10 border border-indigo-500/30'
                          : 'bg-[#04060f]/60 border border-white/5 hover:bg-white/5'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5">
                        {mode === 'cite' && selectedSection === s.id && <div className="w-2.5 h-2.5 rounded-full bg-indigo-400" />}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs text-slate-200 flex items-center gap-1.5">
                          {(() => {
                            const Icon = sectionIcons[s.type] || FileText
                            return <Icon className="w-3 h-3 text-slate-400" />
                          })()}
                          {s.label}
                        </div>
                        {s.content && (
                          <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                            {s.content.slice(0, 60)}...
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 p-5 border-t border-white/5">
          <button
            onClick={onClose}
            className="text-xs px-4 py-2 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10 transition-colors"
          >
            취소
          </button>
          {mode === 'create' ? (
            <button
              onClick={onCreateSection}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
            >
              {loading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Sparkles className="w-3 h-3" />
              )}
              {loading ? '생성 중...' : '새 대지 생성'}
            </button>
          ) : (
            <button
              onClick={() => {
                const section = sections.find(s => s.id === selectedSection)
                onCiteToSection(selectedSection, section?.label || '')
              }}
              disabled={!selectedSection || loading}
              className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
            >
              {loading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <PenLine className="w-3 h-3" />
              )}
              {loading ? '인용문 생성 중...' : '이 섹션에 인용'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function normalizeGreek(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f\u0313\u0314\u0342\u0345]/g, '').toLowerCase()
}

/* ═══════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════ */

/* ─── Translation Card 스타일 매핑 ───
   Tailwind는 동적 class name을 빌드 타임에 감지하므로 lookup 테이블로 처리 */

const VERSION_CARD_STYLE: Record<string, {
  bgOn: string; borderOn: string; iconOn: string; labelOn: string; personaOn: string;
  glow: string; dot: string;
}> = {
  greek: {
    bgOn: 'bg-purple-500/15', borderOn: 'border-purple-500/50',
    iconOn: 'text-purple-300', labelOn: 'text-purple-100', personaOn: 'text-purple-300/80',
    glow: 'shadow-purple-500/20', dot: 'bg-purple-400',
  },
  translit: {
    bgOn: 'bg-cyan-500/15', borderOn: 'border-cyan-500/50',
    iconOn: 'text-cyan-300', labelOn: 'text-cyan-100', personaOn: 'text-cyan-300/80',
    glow: 'shadow-cyan-500/20', dot: 'bg-cyan-400',
  },
  niv: {
    bgOn: 'bg-blue-500/15', borderOn: 'border-blue-500/50',
    iconOn: 'text-blue-300', labelOn: 'text-blue-100', personaOn: 'text-blue-300/80',
    glow: 'shadow-blue-500/20', dot: 'bg-blue-400',
  },
  esv: {
    bgOn: 'bg-amber-500/15', borderOn: 'border-amber-500/50',
    iconOn: 'text-amber-300', labelOn: 'text-amber-100', personaOn: 'text-amber-300/80',
    glow: 'shadow-amber-500/20', dot: 'bg-amber-400',
  },
}

const VERSION_CARD_META: Record<string, {
  label: string; persona: string; icon: any;
}> = {
  greek: { label: '원어', persona: '어원 · 구조', icon: Globe },
  translit: { label: '음역', persona: '발음 · 표기', icon: Volume2 },
  niv: { label: 'NIV', persona: '의미 · 현대', icon: BookOpen },
  esv: { label: 'ESV', persona: '직역 · 정확', icon: BookMarked },
}

/* ─── Translation Card ─── */

function TranslationCard({
  version, isOn, isLoading, onToggle, preview,
}: {
  version: 'greek' | 'translit' | 'niv' | 'esv'
  isOn: boolean
  isLoading: boolean
  onToggle: () => void
  preview?: string  // 첫 절 텍스트 (loaded 시)
}) {
  const meta = VERSION_CARD_META[version]
  const style = VERSION_CARD_STYLE[version]
  const Icon = meta.icon
  const [hover, setHover] = useState(false)

  return (
    <button
      onClick={onToggle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`relative w-[128px] h-[58px] rounded-lg border transition-all text-left px-3 py-2 group ${
        isOn
          ? `${style.bgOn} ${style.borderOn} shadow-md ${style.glow}`
          : 'bg-[#04060f]/60 border-white/5 hover:border-white/20 hover:bg-white/[0.04]'
      }`}
    >
      <div className="flex items-center justify-between mb-0.5">
        <div className="flex items-center gap-1.5">
          <Icon className={`w-3 h-3 ${isOn ? style.iconOn : 'text-slate-500'}`} />
          <span className={`text-[10.5px] font-bold tracking-wide ${
            isOn ? style.labelOn : 'text-slate-400'
          }`}>
            {meta.label}
          </span>
        </div>
        {isLoading ? (
          <Loader2 className="w-3 h-3 text-slate-400 animate-spin" />
        ) : isOn ? (
          <Check className={`w-3 h-3 ${style.iconOn}`} />
        ) : null}
      </div>
      <div className={`text-[9px] leading-tight ${
        isOn ? style.personaOn : 'text-slate-500'
      }`}>
        {isLoading ? '로딩 중…' : isOn ? meta.persona : '클릭하여 켜기'}
      </div>

      {/* 호버 미리보기 — ON + 로드 완료 시에만 */}
      {isOn && !isLoading && preview && hover && (
        <div className="absolute z-50 left-0 top-full mt-2 w-80 p-3 rounded-lg bg-[#0a0e1a] border border-white/10 text-[10.5px] text-slate-300 pointer-events-none shadow-2xl">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
            <span className={`text-[9px] font-bold uppercase tracking-wider ${style.iconOn}`}>
              {meta.label} 미리보기 (1절)
            </span>
          </div>
          <div className="italic leading-relaxed line-clamp-3">&ldquo;{preview}&rdquo;</div>
        </div>
      )}
    </button>
  )
}

/* ─── Research Toolbar ─── */

function ResearchToolbar({
  passage, viewMode, onViewModeChange, showTranslations, onToggleTranslation,
  isSaving, lastSaved, onSendToPrep, onReAnalyze, translationState, previewVerses,
}: {
  passage: string
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  showTranslations: Record<string, boolean>
  onToggleTranslation: (key: string) => void
  isSaving: boolean
  lastSaved: string | null
  onSendToPrep: () => void
  onReAnalyze: () => void
  translationState: Record<string, { loading?: boolean; hasData?: boolean }>
  previewVerses: Record<string, string>  // version → 첫 절 텍스트
}) {
  const viewModes: { key: ViewMode; label: string }[] = [
    { key: 'parallel', label: '병렬' },
    { key: 'focused', label: '집중' },
    { key: 'compare', label: '비교' },
  ]

  const cardVersions: ('greek' | 'translit' | 'niv' | 'esv')[] = ['greek', 'translit', 'niv', 'esv']

  return (
    <div className="sticky top-0 z-10 bg-[#050814]/95 backdrop-blur-sm border-b border-white/5 px-5 py-3 mb-5">
      {/* Top row: passage + view mode + save status + re-analyze + CTA */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-4">
          {/* Current Passage */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">본문</span>
            <span className="text-sm font-bold text-white font-serif bg-white/5 px-3 py-1 rounded-xl">
              {passage}
            </span>
          </div>

          {/* View Mode */}
          <div className="flex rounded-xl overflow-hidden border border-white/5">
            {viewModes.map(mode => (
              <button
                key={mode.key}
                onClick={() => onViewModeChange(mode.key)}
                className={`text-[11px] px-3 py-1.5 font-medium transition-colors ${
                  viewMode === mode.key
                    ? 'bg-indigo-600 text-white'
                    : 'bg-[#04060f]/60 text-slate-400 hover:bg-white/5'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Save Status */}
          <div className="flex items-center gap-1.5 text-[11px]">
            {isSaving ? (
              <span className="text-amber-500">저장 중...</span>
            ) : lastSaved ? (
              <span className="text-indigo-400">✓ {lastSaved} 저장됨</span>
            ) : (
              <span className="text-slate-500">자동 저장</span>
            )}
          </div>

          {/* 재분석 버튼 */}
          <button
            onClick={onReAnalyze}
            className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors"
            title="캐시 삭제 후 새로 분석"
          >
            🔄 재분석
          </button>

          {/* CTA */}
          <button
            onClick={onSendToPrep}
            className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-xl transition-colors font-medium"
          >
            설교 준비로 →
          </button>
        </div>
      </div>

      {/* Bottom row: 4 Translation Cards + korean note */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-slate-500 uppercase tracking-wider mr-1 shrink-0">번역</span>
        {cardVersions.map(v => (
          <TranslationCard
            key={v}
            version={v}
            isOn={showTranslations[v] || false}
            isLoading={translationState[v]?.loading || false}
            onToggle={() => onToggleTranslation(v)}
            preview={previewVerses[v]}
          />
        ))}
        <div className="flex items-center gap-1.5 ml-2 text-[10px] text-slate-500">
          <span className="px-2 py-1 rounded bg-slate-500/10 border border-slate-500/20 text-slate-300 font-medium">
            한글
          </span>
          <span>본문에 기본 표시</span>
        </div>
      </div>
    </div>
  )
}

/* ─── Context Explorer ─── */

interface ContextInfo {
  before: string
  after: string
  bookStructure: string
  historicalBackground: string
  culturalContext: string
  theologicalContext: string
  redemptiveHistory: string
  keyThemes: string[]
  narrativeArc: string
}

function ContextExplorer({ info }: { info: Partial<ContextInfo> }) {
  const [expanded, setExpanded] = useState<'beforeAfter' | null>(null)

  const sections = [
    {
      key: 'historical',
      icon: History,
      color: 'text-cyan-300',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
      label: '역사적 배경',
      content: info.historicalBackground,
    },
    {
      key: 'cultural',
      icon: Globe,
      color: 'text-emerald-300',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      label: '문화적 맥락',
      content: info.culturalContext,
    },
    {
      key: 'theological',
      icon: Cross,
      color: 'text-purple-300',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
      label: '신학적 맥락',
      content: info.theologicalContext,
    },
    {
      key: 'redemptive',
      icon: Heart,
      color: 'text-rose-300',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      label: '구속사적 흐름',
      content: info.redemptiveHistory,
    },
  ]

  const hasThemes = Array.isArray(info.keyThemes) && info.keyThemes.length > 0
  const hasNarrative = info.narrativeArc
  const hasBeforeAfter = info.before || info.after
  const hasBookStructure = info.bookStructure

  return (
    <div className="bg-gradient-to-r from-amber-500/[0.07] to-indigo-500/[0.07] border border-amber-500/20 rounded-xl p-4 mb-5">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="w-3.5 h-3.5 text-amber-300" />
        <span className="text-[10px] font-semibold text-amber-300 uppercase tracking-widest">문맥 확장</span>
      </div>

      {/* Context Section Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
        {sections.map((s) => {
          const Icon = s.icon
          return (
            <div
              key={s.key}
              className={`${s.bg} ${s.border} border rounded-lg p-3 transition-all hover:brightness-110`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Icon className={`w-3 h-3 ${s.color}`} />
                <span className={`text-[11px] font-bold ${s.color}`}>{s.label}</span>
              </div>
              {s.content ? (
                <p className="text-[11px] text-slate-300 leading-relaxed">{s.content}</p>
              ) : (
                <p className="text-[11px] text-slate-600 italic">생성되지 않음</p>
              )}
            </div>
          )
        })}
      </div>

      {/* Key Themes */}
      {hasThemes && (
        <div className="bg-white/5 border border-white/10 rounded-lg p-3 mb-2">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Tags className="w-3 h-3 text-indigo-300" />
            <span className="text-[11px] font-bold text-indigo-300">핵심 주제</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {info.keyThemes!.map((theme, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-200 border border-indigo-500/30"
              >
                {theme}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Narrative Arc + Book Structure Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
        {hasNarrative && (
          <div className="bg-white/5 border border-white/10 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Waypoints className="w-3 h-3 text-amber-300" />
              <span className="text-[11px] font-bold text-amber-300">본문 흐름</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">{info.narrativeArc}</p>
          </div>
        )}
        {hasBookStructure && (
          <div className="bg-white/5 border border-white/10 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <BookOpen className="w-3 h-3 text-sky-300" />
              <span className="text-[11px] font-bold text-sky-300">책 구조</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">{info.bookStructure}</p>
          </div>
        )}
      </div>

      {/* 앞·뒤 문맥 (Collapsible) */}
      {hasBeforeAfter && (
        <div className="bg-white/[0.03] border border-white/5 rounded-lg overflow-hidden">
          <button
            onClick={() => setExpanded(expanded === 'beforeAfter' ? null : 'beforeAfter')}
            className="flex items-center justify-between w-full px-3 py-2 text-[11px] font-bold text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
          >
            <span>앞·뒤 문맥</span>
            {expanded === 'beforeAfter' ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>
          {expanded === 'beforeAfter' && (
            <div className="px-3 pb-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-slate-400 leading-relaxed">
              <div>
                <span className="font-medium text-slate-300 block mb-0.5">앞 문맥</span>
                {info.before}
              </div>
              <div>
                <span className="font-medium text-slate-300 block mb-0.5">뒤 문맥</span>
                {info.after}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ─── Translation Diff Summary (Auto Diff) ─── */

function TranslationDiffSummary({
  translationNotes, activeEnglishVersions, onScrollToVerse,
}: {
  translationNotes: any[]
  activeEnglishVersions: string[]
  onScrollToVerse: (verse: number) => void
}) {
  // 활성화된 영어 버전 2개 이상일 때만 표시
  if (activeEnglishVersions.length < 2) return null

  // 노트 중 활성화된 버전과 매칭되는 것만
  const relevantNotes = translationNotes.filter(note =>
    Array.isArray(note.versions) && note.versions.some((v: string) => activeEnglishVersions.includes(v))
  )
  if (relevantNotes.length === 0) return null

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-amber-500/[0.08] via-orange-500/[0.04] to-transparent border border-amber-500/20 rounded-2xl p-4 mb-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-amber-300 text-base">⚡</span>
        <h3 className="text-[13px] font-bold text-white">번역 비교 인사이트</h3>
        <span className="text-[10px] text-amber-300/80 font-medium">
          {activeEnglishVersions.join(' ↔ ')} · {relevantNotes.length}개 차이
        </span>
      </div>
      <div className="space-y-1.5">
        {relevantNotes.map((note, i) => (
          <button
            key={i}
            onClick={() => onScrollToVerse(note.verse)}
            className="w-full text-left p-2.5 rounded-lg bg-[#04060f]/60 hover:bg-amber-500/[0.08] border border-white/5 hover:border-amber-500/30 transition-colors group"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-amber-300 bg-amber-500/15 px-1.5 py-0.5 rounded tabular-nums">
                {note.verse}절
              </span>
              <div className="flex gap-1">
                {(note.versions || []).map((v: string) => (
                  <span
                    key={v}
                    className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                      activeEnglishVersions.includes(v)
                        ? 'bg-amber-500/15 text-amber-200 border border-amber-500/20'
                        : 'bg-white/5 text-slate-500'
                    }`}
                  >
                    {v}
                  </span>
                ))}
              </div>
              <span className="ml-auto text-[10px] text-slate-500 group-hover:text-amber-300 transition-colors">
                이동 →
              </span>
            </div>
            <p className="text-[11.5px] text-slate-300 leading-relaxed">{note.note}</p>
            {note.preachingNote && (
              <p className="text-[10.5px] text-amber-200/80 leading-relaxed mt-1.5 pt-1.5 border-t border-amber-500/10 italic">
                💡 설교 적용: {note.preachingNote}
              </p>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ─── Parallel Passage Panel ─── */

function ParallelPassagePanel({
  verses, words, wordAlignments, showTranslations, selectedWordId, selectedVerse,
  onWordClick, onVerseClick, translationLoading, diffVerses,
}: {
  verses: typeof JOHN_VERSES
  words: Record<string, JohnWordDetail>
  wordAlignments: Array<{ verse: number; englishVersion: string; englishWord: string; greekWordId: string }>
  showTranslations: Record<string, boolean>
  selectedWordId: string | null
  selectedVerse: number | null
  onWordClick: (id: string, fallbackWord?: { word: string; clean: string; verse: number; version?: string } | null) => void
  onVerseClick: (v: number) => void
  translationLoading?: Record<string, boolean>
  diffVerses?: Set<number>  // 번역 차이가 있는 절 번호들
}) {
  const alignmentMap = useMemo(() => {
    const m = new Map<string, string>()
    for (const a of wordAlignments) {
      const key = `${a.verse}_${a.englishVersion}_${a.englishWord.replace(/[^\w]/g, '').toLowerCase()}`
      m.set(key, a.greekWordId)
    }
    return m
  }, [wordAlignments])

  function renderAlignedText(text: string, verse: number, version: string) {
    if (!text) return null
    const words_arr = text.split(' ')
    return words_arr.map((word, i) => {
      const clean = word.replace(/[.,;:'"!?()\[\]{}…·]/g, '').toLowerCase()
      const alignmentKey = `${verse}_${version}_${clean}`
      const greekWordId = alignmentMap.get(alignmentKey)
      if (greekWordId && words[greekWordId]) {
        const isSelected = selectedWordId === greekWordId
        return (
            <Fragment key={i}>
            <span className="inline">
              <button
                onClick={() => onWordClick(greekWordId)}
                className={`transition-colors cursor-pointer border-b border-dotted ${
                  isSelected
                    ? 'text-indigo-400 border-indigo-500 bg-indigo-500/10 rounded px-0.5'
                    : 'border-white/5 hover:border-indigo-500/30 hover:text-indigo-400'
                }`}
                title={words[greekWordId].basicMeaning}
              >
                {word}
              </button>
            </span>
            {i < words_arr.length - 1 && <span className="text-inherit"> </span>}
          </Fragment>
        )
      }
      const wordId = `_eng_${verse}_${version}_${i}`
      const isSelected = selectedWordId === wordId
      return (
        <Fragment key={i}>
          <span className="inline">
            <button
              onClick={() => onWordClick(wordId, { word, clean, verse, version })}
              className={`transition-colors cursor-pointer ${
                isSelected ? 'text-indigo-400 bg-indigo-500/10 rounded px-0.5' : 'hover:text-white/70'
              }`}
              title={`${version}: ${clean}`}
            >
              {word}
            </button>
          </span>
          {i < words_arr.length - 1 && <span className="text-inherit"> </span>}
        </Fragment>
      )
    })
  }

  // ─── Translation Guardian: 켜졌지만 데이터 로딩 중인 version ───
  const loadingVersions = Object.entries(translationLoading || {})
    .filter(([k, v]) => v && showTranslations[k])
    .map(([k]) => k)

  return (
    <div className="bg-[#04060f]/60 rounded-xl border border-white/5 mb-5 overflow-hidden">
      <div className="px-5 py-3 border-b border-white/5 bg-[#04060f]/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">병렬 본문</span>
          {loadingVersions.length > 0 && (
            <span className="flex items-center gap-1.5 text-[10px] text-indigo-300">
              <Loader2 className="w-3 h-3 animate-spin" />
              {loadingVersions.map(v => v.toUpperCase()).join(', ')} 번역 생성 중...
            </span>
          )}
        </div>
        <span className="text-[10px] text-slate-500">단어를 클릭하면 상세 분석을 볼 수 있습니다</span>
      </div>
      <div className="divide-y divide-white/5">
        {verses.map(v => (
          <div
            key={v.verse}
            id={`verse-row-${v.verse}`}
            className={`px-5 py-4 transition-colors relative ${
              selectedVerse === v.verse
                ? 'bg-indigo-500/10 ring-1 ring-indigo-500/30'
                : 'hover:bg-white/5'
            }`}
          >
            <div className="flex gap-4">
              <div className="relative shrink-0">
                <button
                  onClick={() => onVerseClick(v.verse)}
                  className={`w-8 h-8 rounded-full text-xs font-bold transition-colors ${
                    selectedVerse === v.verse
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white/5 text-slate-400 hover:bg-white/5'
                  }`}
                >
                  {v.verse}
                </button>
                {/* Δ 마커: 이 절에 번역 차이가 있을 때 */}
                {diffVerses?.has(v.verse) && (
                  <span
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center shadow-md ring-2 ring-[#04060f]"
                    title="번역 차이 있음"
                  >
                    Δ
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                {/* Greek */}
                {showTranslations.greek && (
                  <div className="flex items-start gap-2">
                    <span className="text-[10px] text-slate-500 w-10 shrink-0 mt-1 font-medium">원문</span>
                    <span className="text-sm text-white leading-relaxed font-greek flex-1">
                      {(v.greek || '').split(' ').map((word, i) => {
                        const clean = word.replace(/[.,;:'"!?()\[\]{}…·]/g, '')
                        const normalized = normalizeGreek(clean)
                        const matchedEntry = Object.entries(words).find(([_, w]) =>
                          w.lemmaGreek && normalized.includes(normalizeGreek(w.lemmaGreek.slice(0, 4)))
                        )
                        const wordId = matchedEntry ? matchedEntry[0] : `_noword_${v.verse}_${i}`
                        const isSelected = selectedWordId === wordId
                        return (
                          <Fragment key={i}>
                            <button
                              onClick={() => onWordClick(wordId, matchedEntry ? null : { word, clean, verse: v.verse })}
                              className={`transition-colors cursor-pointer ${
                                isSelected
                                  ? 'text-indigo-400 bg-indigo-500/10 rounded px-0.5'
                                  : matchedEntry
                                    ? 'hover:text-indigo-400 border-b border-dotted border-white/5 hover:border-indigo-500/30'
                                    : 'hover:text-white/70'
                              }`}
                              title={matchedEntry ? matchedEntry[1].basicMeaning : clean}
                            >
                              {word}
                            </button>
                            {' '}
                          </Fragment>
                        )
                      })}
                    </span>
                  </div>
                )}
                {/* Transliteration */}
                {showTranslations.translit && (
                  <p className="text-xs text-slate-500 italic pl-12">{v.translit}</p>
                )}
                {/* Korean */}
                {showTranslations.korean && (
                  <div className="flex items-start gap-2">
                    <span className="text-[10px] text-slate-500 w-10 shrink-0 mt-0.5 font-medium">개역</span>
                    <p className="text-sm text-slate-100 leading-relaxed">{v.korean}</p>
                  </div>
                )}
                {/* NIV */}
                {showTranslations.niv && (
                  <div className="flex items-start gap-2">
                    <span className="text-[10px] text-blue-500 w-10 shrink-0 mt-0.5 font-medium">NIV</span>
                    <span className="text-xs text-slate-400 leading-relaxed">{v.niv ? renderAlignedText(v.niv, v.verse, 'NIV') : v.niv}</span>
                  </div>
                )}
                {/* ESV */}
                {showTranslations.esv && (
                  <div className="flex items-start gap-2">
                    <span className="text-[10px] text-amber-600 w-10 shrink-0 mt-0.5 font-medium">ESV</span>
                    <span className="text-xs text-slate-400 leading-relaxed">{v.esv ? renderAlignedText(v.esv, v.verse, 'ESV') : v.esv}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Translation Difference Card ─── */

function TranslationDifferenceCard({ notes }: { notes: typeof JOHN_TRANSLATION_NOTES }) {
  return (
    <div className="bg-[#04060f]/60 rounded-xl border border-white/5 p-5 mb-5">
      <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3">번역 차이 설명</div>
      <div className="space-y-3">
        {notes.map((n, i) => (
          <div key={i} className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-blue-300">{n.verse}절</span>
              <div className="flex gap-1">
                {n.versions.map(v => (
                  <span key={v} className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-300 font-medium">
                    {v}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{n.note}</p>
            {n.preachingNote && (
              <div className="mt-2 pt-2 border-t border-blue-500/20">
                <span className="text-[10px] font-semibold text-amber-300 block mb-0.5">설교 적용 시 참고</span>
                <p className="text-xs text-amber-200 leading-relaxed">{n.preachingNote}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Commentary Summary ─── */

function CommentarySummary({
  commentaries, expandedId, onToggleExpand, onVerseClick, onSaveReference, onCiteInManuscript,
}: {
  commentaries: typeof JOHN_COMMENTARIES
  expandedId: number | null
  onToggleExpand: (id: number | null) => void
  onVerseClick: (v: number) => void
  onSaveReference: (c: JohnCommentary) => void
  onCiteInManuscript: (c: JohnCommentary) => void
}) {
  const grouped = commentaries.reduce<Record<number, typeof commentaries>>((acc, c) => {
    if (!acc[c.verse]) acc[c.verse] = []
    acc[c.verse].push(c)
    return acc
  }, {})

  const typeLabel: Record<string, string> = {
    exegetical: '본문',
    theological: '신학',
    historical: '역사',
    pastoral: '목회',
  }
  const typeColor: Record<string, string> = {
    exegetical: 'bg-teal-500/10 text-teal-300',
    theological: 'bg-amber-500/10 text-amber-300',
    historical: 'bg-amber-500/10 text-amber-300',
    pastoral: 'bg-indigo-500/10 text-indigo-300',
  }

  return (
    <div className="bg-[#04060f]/60 rounded-xl border border-white/5 p-5 mb-5">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">원문 주석 요약</div>
        <span className="text-[11px] text-slate-500">{commentaries.length}건</span>
      </div>
      <div className="space-y-3">
        {Object.entries(grouped).map(([verse, comms]) => {
          const isExpanded = expandedId === parseInt(verse)
          return (
            <div key={verse}>
              <button
                onClick={() => onToggleExpand(isExpanded ? null : parseInt(verse))}
                className="w-full flex items-center justify-between py-2 text-left group"
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-white/5 text-[10px] font-bold flex items-center justify-center text-slate-200 group-hover:bg-indigo-500/10 group-hover:text-indigo-300 transition-colors">
                    {verse}
                  </span>
                  <span className="text-xs font-medium text-slate-200 group-hover:text-indigo-400 transition-colors">
                    절 주석 ({comms.length}건)
                  </span>
                </div>
                <svg className={`w-4 h-4 text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Summary (always visible) */}
              <div className="space-y-2 pl-2">
                {comms.slice(0, 1).map((c, i) => (
                  <div key={i} className="text-xs text-slate-300 leading-relaxed pl-3 border-l-2 border-white/5">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="font-medium text-slate-100">{c.author}</span>
                      <span className={`text-[9px] px-1 py-0.5 rounded ${typeColor[c.type]}`}>
                        {typeLabel[c.type]}
                      </span>
                    </div>
                    {c.text.length > 120 ? c.text.slice(0, 120) + '...' : c.text}
                  </div>
                ))}
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="mt-2 space-y-2 pl-2 animate-fade-in">
                  {comms.map((c, i) => (
                    <div key={i} className="bg-[#04060f]/60 rounded-xl p-3 border border-white/5">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-xs font-semibold text-slate-100">{c.author}</span>
                        <span className={`text-[9px] px-1 py-0.5 rounded ${typeColor[c.type]}`}>
                          {typeLabel[c.type]}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{c.text}</p>
                      <p className="text-[10px] text-slate-500 mt-1.5 italic">— {c.source}</p>
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5">
                        <button
                          onClick={() => onSaveReference(c)}
                          className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg bg-teal-500/10 text-teal-300 hover:bg-teal-500/20 transition-colors"
                        >
                          <BookOpen className="w-3 h-3" />
                          참고 메모로 저장
                        </button>
                        <button
                          onClick={() => onCiteInManuscript(c)}
                          className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 transition-colors"
                        >
                          <PenLine className="w-3 h-3" />
                          원고에 인용
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Parallel Passages Section ─── */

function ParallelPassagesSection({ passages }: { passages: typeof JOHN_PARALLEL_PASSAGES }) {
  const relationLabel: Record<string, string> = {
    direct_quote: '직접 인용',
    allusion: '암시',
    thematic: '주제적 연결',
    typology: '예표/성취',
  }
  const relationColor: Record<string, string> = {
    direct_quote: 'bg-indigo-500/10 text-indigo-300',
    allusion: 'bg-blue-500/10 text-blue-300',
    thematic: 'bg-amber-500/10 text-amber-300',
    typology: 'bg-amber-500/10 text-amber-300',
  }

  return (
    <div className="bg-[#04060f]/60 rounded-xl border border-white/5 p-5 mb-5">
      <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3">평행본문 / 관련 본문</div>
      <div className="space-y-2">
        {passages.map((p, i) => (
          <div key={i} className="flex gap-3 p-3 rounded-xl border border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/10 transition-colors cursor-pointer">
            <span className={`text-[10px] px-1.5 py-0.5 rounded h-fit shrink-0 font-medium ${relationColor[p.relation]}`}>
              {relationLabel[p.relation]}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-semibold text-white">{p.ref}</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">{p.text}</p>
              <p className="text-[11px] text-slate-500 mt-1 italic">{p.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Theme Connections ─── */

function ThemeConnections({
  themes, selectedTheme, onThemeClick,
}: {
  themes: typeof JOHN_THEMES
  selectedTheme: string | null
  onThemeClick: (t: string) => void
}) {
  return (
    <div className="bg-[#04060f]/60 rounded-xl border border-white/5 p-5 mb-5">
      <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3">주제 사전 연결</div>
      <div className="flex flex-wrap gap-2">
        {themes.map(t => (
          <button
            key={t.name}
            onClick={() => onThemeClick(t.name)}
            className={`text-xs px-4 py-2 rounded-full border transition-colors ${
              selectedTheme === t.name
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 font-medium'
                : 'bg-[#04060f]/60 border-white/5 text-slate-300 hover:border-amber-500/30 hover:text-amber-300'
            }`}
          >
            {t.name}
            <span className="ml-1 text-[10px] opacity-60">{t.connectedSermons}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

/* ─── Research Notes Editor ─── */

function ResearchNotesEditor({
  value, onChange, tags, onToggleTag, onSave, isSaving, lastSaved,
  onSuggest, suggesting, suggestionError,
}: {
  value: string
  onChange: (v: string) => void
  tags: string[]
  onToggleTag: (t: string) => void
  onSave: () => void
  isSaving: boolean
  lastSaved: string | null
  onSuggest: (type: 'insight' | 'questions' | 'application') => Promise<void>
  suggesting: 'insight' | 'questions' | 'application' | null
  suggestionError: string | null
}) {
  const availableTags = ['관찰', '질문', '적용', '통찰', '예화', '핵심']

  return (
    <div className="bg-[#04060f]/60 rounded-xl border border-white/5 p-5 mb-5">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">연구 메모</div>
        <div className="flex items-center gap-2 text-[11px]">
          {isSaving ? (
            <span className="text-amber-500">저장 중...</span>
          ) : lastSaved ? (
            <span className="text-indigo-400">✓ {lastSaved}</span>
          ) : null}
        </div>
      </div>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="본문을 연구하며 떠오른 통찰, 질문, 적용 아이디어를 기록하세요. 이 메모는 설교 준비 탭으로 전달됩니다."
        className="w-full min-h-[140px] text-sm text-slate-100 bg-[#04060f]/60 rounded-xl p-4 border border-white/5 outline-none resize-y focus:border-indigo-500/30 focus:bg-[#04060f]/60 transition-colors leading-relaxed"
      />
      <div className="flex items-center justify-between mt-2 gap-2">
        <div className="flex flex-wrap gap-1.5">
          {availableTags.map(tag => (
            <button
              key={tag}
              onClick={() => onToggleTag(tag)}
              className={`text-[10px] px-2 py-0.5 rounded transition-colors ${
                tags.includes(tag)
                  ? 'bg-indigo-500/10 text-indigo-300 font-medium'
                  : 'bg-white/5 text-slate-500 hover:bg-white/5'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          {([
            { type: 'insight' as const, label: '통찰', color: 'text-amber-300' },
            { type: 'questions' as const, label: '질문', color: 'text-cyan-300' },
            { type: 'application' as const, label: '적용', color: 'text-emerald-300' },
          ]).map(btn => {
            const isLoading = suggesting === btn.type
            const isDisabled = !!suggesting
            return (
              <button
                key={btn.type}
                onClick={() => onSuggest(btn.type)}
                disabled={isDisabled}
                className={`flex items-center gap-1 text-[10.5px] px-2 py-0.5 rounded transition-colors ${
                  isLoading
                    ? `${btn.color} bg-white/5`
                    : isDisabled
                      ? 'text-slate-600 cursor-not-allowed'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {isLoading ? (
                  <Loader2 className={`w-3 h-3 animate-spin ${btn.color}`} />
                ) : (
                  <Sparkles className={`w-3 h-3 ${btn.color}`} />
                )}
                {btn.label}
              </button>
            )
          })}
          <div className="w-px h-3 bg-white/10 mx-0.5" />
          <span className="text-[10px] text-slate-500">{value.length}자</span>
          <button
            onClick={onSave}
            disabled={!value.trim() || isSaving}
            className="text-xs bg-indigo-600 hover:bg-indigo-700 disabled:bg-white/5 disabled:text-slate-500 text-white px-3 py-1 rounded-xl transition-colors font-medium"
          >
            저장
          </button>
        </div>
      </div>
      {suggestionError && (
        <div className="mt-1.5 text-[10px] text-red-400/80">
          ⚠ {suggestionError}
        </div>
      )}
    </div>
  )
}

/* ─── Right Panel ─── */

function RightPanel({
  words, selectedWordId, selectedFallbackWord, lookupLoading, selectedEnglishWord, englishLookup, englishLookupLoading, selectedVerse, selectedTheme, onCloseDetail,
  onSendToPrep, memosByPassage, currentMemoLabel, passages, commentaries, verses, themes,
  onCopyResults, onViewFullChapter,
}: {
  words: Record<string, JohnWordDetail>
  selectedWordId: string | null
  selectedFallbackWord: { word: string; clean: string; verse: number } | null
  lookupLoading: boolean
  selectedEnglishWord: { word: string; clean: string; verse: number; version: string } | null
  englishLookup: Record<string, EnglishWordDetail>
  englishLookupLoading: boolean
  selectedVerse: number | null
  selectedTheme: string | null
  onCloseDetail: () => void
  onSendToPrep: () => void
  memosByPassage: Record<string, { text: string; tags: string[] }>
  currentMemoLabel: string
  passages: BiblePassage[]
  commentaries: any[]
  verses: any[]
  themes: any[]
  onCopyResults?: () => void
  onViewFullChapter?: () => void
}) {
  const typeLabel: Record<string, string> = {
    exegetical: '본문',
    theological: '신학',
    historical: '역사',
    pastoral: '목회',
  }
  const typeColor: Record<string, string> = {
    exegetical: 'bg-teal-500/10 text-teal-300',
    theological: 'bg-amber-500/10 text-amber-300',
    historical: 'bg-amber-500/10 text-amber-300',
    pastoral: 'bg-indigo-500/10 text-indigo-300',
  }

  // Word Detail - Fallback (unmatched word, loading or pending)
  if (selectedFallbackWord) {
    return (
      <div>
        <div className="sticky top-0 z-10 bg-[#04060f]/95 backdrop-blur-sm border-b border-white/5">
          <div className="flex items-center justify-between px-5 py-4">
            <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">원어 단어 ({selectedFallbackWord.verse}절)</h3>
            <button onClick={onCloseDetail} className="text-slate-500 hover:text-slate-200 p-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="p-5 space-y-4">
          <div className="text-center py-6 bg-white/5 rounded-xl">
            <p className="text-2xl font-greek text-white">{selectedFallbackWord.word}</p>
            <p className="text-sm text-slate-400 mt-1">{selectedFallbackWord.clean}</p>
          </div>
          {lookupLoading ? (
            <div className="flex flex-col items-center py-6 space-y-3">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
              <p className="text-xs text-slate-400">AI가 이 단어를 분석하고 있습니다...</p>
            </div>
          ) : (
            <div className="bg-indigo-500/10 rounded-xl p-4 border border-indigo-500/20">
              <p className="text-xs text-indigo-200 text-center">이 단어를 클릭하면 AI가 분석합니다</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // English Word Detail
  if (selectedEnglishWord) {
    const cacheKey = `_englk_${selectedEnglishWord.verse}_${selectedEnglishWord.version}_${selectedEnglishWord.clean}`
    const wordData = englishLookup[cacheKey]
    if (englishLookupLoading && !wordData) {
      return (
        <div>
          <div className="sticky top-0 z-10 bg-[#04060f]/95 backdrop-blur-sm border-b border-white/5">
            <div className="flex items-center justify-between px-5 py-4">
              <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">영어 단어 ({selectedEnglishWord.verse}절, {selectedEnglishWord.version})</h3>
              <button onClick={onCloseDetail} className="text-slate-500 hover:text-slate-200 p-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div className="p-5">
            <div className="flex flex-col items-center py-10 space-y-3">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
              <p className="text-xs text-slate-400">AI가 이 단어를 분석하고 있습니다...</p>
            </div>
          </div>
        </div>
      )
    }
    if (wordData) {
      return (
        <div>
          <div className="sticky top-0 z-10 bg-[#04060f]/95 backdrop-blur-sm border-b border-white/5">
            <div className="flex items-center justify-between px-5 py-4">
              <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">영어 단어 ({selectedEnglishWord.verse}절, {selectedEnglishWord.version})</h3>
              <button onClick={onCloseDetail} className="text-slate-500 hover:text-slate-200 p-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <div className="text-center py-4 bg-white/5 rounded-xl">
              <p className="text-2xl font-bold text-white font-serif">{wordData.word}</p>
              <p className="text-sm text-slate-400 mt-1">{wordData.pronunciation}</p>
            </div>
            <div className="grid grid-cols-1 gap-2 text-xs">
              <InfoBox label="품사" value={wordData.partOfSpeech} />
            </div>
            <SectionBox title="기본 의미" className="bg-white/5">
              {wordData.basicMeaning}
            </SectionBox>
            <SectionBox title="문맥상 의미" className="bg-indigo-500/10 border border-indigo-500/20">
              {wordData.contextualMeaning}
            </SectionBox>
            <div className="bg-amber-500/10 rounded-xl p-3 border border-amber-500/20">
              <h4 className="text-[10px] font-semibold text-amber-300 mb-1">쉽게 설명하면</h4>
              <p className="text-xs text-amber-200 leading-relaxed">{wordData.simpleExplanation}</p>
            </div>
            {wordData.sermonNote && (
              <SectionBox title="설교적 의미" className="bg-white/5 border-l-2 border-indigo-500">
                {wordData.sermonNote}
              </SectionBox>
            )}
            {wordData.usage && wordData.usage.length > 0 && (
              <div>
                <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">성경 용례</h4>
                <div className="space-y-1">
                  {wordData.usage.map((u, i) => (
                    <div key={i} className="text-[11px] text-slate-200 bg-white/5 rounded-xl p-2">
                      <span className="font-medium text-slate-100">{u.ref}: </span>
                      {u.text}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )
    }
    return (
      <div>
        <div className="sticky top-0 z-10 bg-[#04060f]/95 backdrop-blur-sm border-b border-white/5">
          <div className="flex items-center justify-between px-5 py-4">
            <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">영어 단어 ({selectedEnglishWord.verse}절, {selectedEnglishWord.version})</h3>
            <button onClick={onCloseDetail} className="text-slate-500 hover:text-slate-200 p-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="p-5">
          <div className="text-center py-8">
            <p className="text-2xl font-bold text-white font-serif">{selectedEnglishWord.word}</p>
            <p className="text-xs text-slate-500 mt-2">분석 정보를 불러오는 중입니다...</p>
          </div>
        </div>
      </div>
    )
  }

  // Word Detail
  if (selectedWordId && words[selectedWordId]) {
    const word = words[selectedWordId]
    return (
      <div>
        <div className="sticky top-0 z-10 bg-[#04060f]/95 backdrop-blur-sm border-b border-white/5">
          <div className="flex items-center justify-between px-5 py-4">
            <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">원어 단어 분석</h3>
            <button onClick={onCloseDetail} className="text-slate-500 hover:text-slate-200 p-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="p-5 space-y-4">
          <div className="text-center py-4 bg-white/5 rounded-xl">
            <p className="text-2xl font-greek text-white">{word.lemmaGreek}</p>
            <p className="text-sm text-slate-400 mt-1">{word.transliteration}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <InfoBox label="Strong" value={word.strong} />
            <InfoBox label="품사" value={word.partOfSpeech} />
            <InfoBox label="발음" value={word.pronunciation} />
            <InfoBox label="형태" value={word.morphology} />
          </div>
          <SectionBox title="기본 의미" className="bg-white/5">
            {word.basicMeaning}
          </SectionBox>
          <SectionBox title="문맥상 의미" className="bg-indigo-500/10 border border-indigo-500/20">
            {word.contextualMeaning}
          </SectionBox>
          <div className="bg-amber-500/10 rounded-xl p-3 border border-amber-500/20">
            <h4 className="text-[10px] font-semibold text-amber-300 mb-1">쉽게 설명하면</h4>
            <p className="text-xs text-amber-200 leading-relaxed">{word.simpleExplanation}</p>
          </div>
          <SectionBox title="설교적 의미" className="bg-white/5 border-l-2 border-indigo-500">
            {word.sermonNote}
          </SectionBox>
          {word.usage.length > 0 && (
            <div>
              <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">성경 용례</h4>
              <div className="space-y-1">
                {word.usage.map((u, i) => (
                  <div key={i} className="text-[11px] text-slate-200 bg-white/5 rounded-xl p-2">
                    <span className="font-medium text-slate-100">{u.ref}: </span>
                    {u.text}
                  </div>
                ))}
              </div>
            </div>
          )}
          {word.relatedWords.length > 0 && (
            <div>
              <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">관련 원어</h4>
              <div className="flex flex-wrap gap-1">
                {word.relatedWords.map(r => (
                  <span key={r} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-200 font-mono">{r}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Verse Commentary
  if (selectedVerse) {
    const verseCommentaries = (commentaries || []).filter((c: any) => c.verse === selectedVerse)
    const verseData = (verses || []).find((v: any) => v.verse === selectedVerse)
    return (
      <div>
        <div className="sticky top-0 z-10 bg-[#04060f]/95 backdrop-blur-sm border-b border-white/5">
          <div className="flex items-center justify-between px-5 py-4">
            <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">{selectedVerse}절 주석</h3>
            <button onClick={onCloseDetail} className="text-slate-500 hover:text-slate-200 p-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="p-5">
        {verseData && (
          <div className="bg-white/5 rounded-xl p-3 mb-4">
            <p className="text-xs text-slate-200 leading-relaxed">{verseData.korean}</p>
          </div>
        )}
        {verseCommentaries.length > 0 ? (
          <div className="space-y-3">
            {verseCommentaries.map((c, i) => (
              <div key={i} className="bg-[#04060f]/60 rounded-xl border border-white/5 p-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="text-xs font-semibold text-slate-100">{c.author}</span>
                  <span className={`text-[9px] px-1 py-0.5 rounded ${typeColor[c.type]}`}>
                    {typeLabel[c.type]}
                  </span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">{c.text}</p>
                <p className="text-[10px] text-slate-500 mt-1.5 italic">— {c.source}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-slate-500 text-center py-8">이 절에 대한 주석이 없습니다.</div>
        )}
      </div>
      </div>
    )
  }

  // Theme Detail
  if (selectedTheme) {
    const themeData = (themes || []).find((t: any) => t.name === selectedTheme)
    if (themeData) {
      return (
        <div>
          <div className="sticky top-0 z-10 bg-[#04060f]/95 backdrop-blur-sm border-b border-white/5">
            <div className="flex items-center justify-between px-5 py-4">
              <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">주제 연결</h3>
              <button onClick={onCloseDetail} className="text-slate-500 hover:text-slate-200 p-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div className="p-5">
            <div className="text-center py-4">
              <span className="inline-block px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-300 text-sm font-medium">
                {themeData.name}
              </span>
            </div>
            <p className="text-sm text-slate-100 leading-relaxed mb-4">{themeData.description}</p>
            <div className="flex items-center justify-between text-xs text-slate-400 bg-white/5 rounded-xl p-3">
              <span>연결된 설교</span>
              <span className="font-medium text-slate-100">{themeData.connectedSermons}편</span>
            </div>
            <button className="w-full mt-4 text-xs text-indigo-400 border border-indigo-500/20 rounded-xl py-2 hover:bg-indigo-500/10 transition-colors">
              이 주제로 설교 검색 →
            </button>
          </div>
        </div>
      )
    }
  }

  // Default: Quick Actions + Recent Notes
  return (
    <div className="p-5 space-y-5">
      {/* Quick Actions */}
      <div>
        <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3">작업</h3>
        <div className="space-y-1.5">
          <button
            onClick={onSendToPrep}
            className="w-full text-left text-xs text-emerald-400 hover:bg-emerald-500/10 rounded-xl px-3 py-2 transition-colors font-medium border border-emerald-500/20"
          >
            <ArrowRight className="w-3.5 h-3.5 inline" /> 설교 준비로 이동
          </button>
          <button
            onClick={onCopyResults}
            className="w-full text-left text-xs text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-xl px-3 py-2 transition-colors"
          >
            연구 결과 복사
          </button>
          <button
            onClick={onViewFullChapter}
            className="w-full text-left text-xs text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-xl px-3 py-2 transition-colors"
          >
            전체 장 보기
          </button>
        </div>
      </div>

      {/* 연구 메모 미리보기 */}
      {Object.values(memosByPassage).some(m => m.text?.trim() || (m.tags?.length || 0) > 0) && (
        <div>
          <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3">연구 메모</h3>
          <div className="space-y-2">
            {Object.entries(memosByPassage).map(([key, m]) => {
              if (!m.text?.trim() && !(m.tags?.length || 0)) return null
              const p = passages.find(pp => (pp.id || 'legacy') === key)
              const label = p?.passage || (key === 'legacy' ? '본문' : key)
              return (
                <div key={key} className="bg-white/5 rounded-xl p-3">
                  <div className="text-[9px] font-semibold text-indigo-300 mb-1">{label}</div>
                  {m.text?.trim() && (
                    <p className="text-xs text-slate-200 leading-relaxed line-clamp-4 whitespace-pre-wrap">{m.text}</p>
                  )}
                  {m.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {m.tags.map(tag => (
                        <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300">#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Default Guide */}
      <div className="space-y-3 text-xs text-slate-500 leading-relaxed">
        <div className="bg-white/5 rounded-xl p-3">
          <p className="font-medium text-slate-200 mb-1">단어 분석</p>
          <p>본문에서 원어 단어를 클릭하면 상세 정보를 볼 수 있습니다.</p>
        </div>
        <div className="bg-white/5 rounded-xl p-3">
          <p className="font-medium text-slate-200 mb-1">주석 보기</p>
          <p>절 번호를 클릭하면 해당 절의 주석을 확인할 수 있습니다.</p>
        </div>
        <div className="bg-white/5 rounded-xl p-3">
          <p className="font-medium text-slate-200 mb-1">주제 연결</p>
          <p>주제를 클릭하면 연결된 설교와 자료를 탐색할 수 있습니다.</p>
        </div>
      </div>
    </div>
  )
}

/* ─── Research Summary for Prep ─── */

function ResearchSummaryForPrep({ studyData, onSendToPrep, projectTitle, passage, projectId }: {
  studyData: any; onSendToPrep: () => void; projectTitle?: string; passage?: string; projectId?: string
}) {
  const router = useRouter()
  const themes = (studyData?.themes || []).map((t: any) => t.name).slice(0, 6)
  const insights = (studyData?.commentaries || []).slice(0, 4).map((c: any) => c.text)
  const rawWords = Object.values(studyData?.words || {}).slice(0, 6)
  const projectIdForWord = projectId || ''
  const words = rawWords.map((w: any) => {
    const wordLabel = w.lemmaGreek || w.word || ''
    const wid = `word-${projectIdForWord}-${wordLabel.replace(/[^a-zA-Z0-9가-힣]/g, '_')}`
    return {
      id: wid,
      word: wordLabel,
      transliteration: w.transliteration || w.pronunciation || '',
      partOfSpeech: w.partOfSpeech || '',
      strong: w.strong || '',
      basicMeaning: w.basicMeaning || '',
      contextualMeaning: w.contextualMeaning || '',
      simpleExplanation: w.simpleExplanation || '',
      sermonNote: w.sermonNote || '',
      usage: Array.isArray(w.usage) ? w.usage.slice(0, 2) : [],
    }
  })

  // 통찰로 저장 기능
  const [selectMode, setSelectMode] = useState(false)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set())
  const [savingIdx, setSavingIdx] = useState<number | null>(null)
  const [bulkSaving, setBulkSaving] = useState(false)
  const [toast, setToast] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)

  const showToast = (kind: 'success' | 'error', text: string) => {
    setToast({ kind, text })
    setTimeout(() => setToast(null), 3000)
  }

  const buildNoteContent = (kw: typeof words[number]) => {
    const lines: string[] = []
    if (kw.basicMeaning) lines.push(`**기본 의미**: ${kw.basicMeaning}`)
    if (kw.contextualMeaning) lines.push(`**이 본문에서의 의미**: ${kw.contextualMeaning}`)
    if (kw.simpleExplanation) lines.push(`**쉽게 설명하면**: ${kw.simpleExplanation}`)
    if (kw.sermonNote) lines.push(`**설교 적용**: ${kw.sermonNote}`)
    if (kw.usage.length > 0) {
      lines.push('**성경 용례**:')
      kw.usage.forEach((u: { ref: string; text: string }) => lines.push(`- ${u.ref}: "${u.text}"`))
    }
    return lines.join('\n\n')
  }

  const buildNoteTags = (kw: typeof words[number]) => {
    const tags = ['원어', '헬라어']
    if (kw.transliteration) tags.push(kw.transliteration)
    if (passage) {
      // Extract book name from passage
      const bookMatch = passage.match(/^([\d가-힣\s]+?)\s*\d/)
      if (bookMatch) tags.push(bookMatch[1].trim())
    }
    return tags.slice(0, 8)
  }

  const saveAsInsight = async (idx: number) => {
    if (savingIdx !== null || bulkSaving) return
    const kw = words[idx]
    if (!kw?.word) {
      showToast('error', '저장할 단어가 없습니다')
      return
    }
    setSavingIdx(idx)
    try {
      const res = await fetch('/school/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'word',
          title: `[원어] ${kw.word}${kw.transliteration ? ` (${kw.transliteration})` : ''}`,
          content: buildNoteContent(kw),
          summary: kw.basicMeaning?.slice(0, 200) || kw.contextualMeaning?.slice(0, 200) || '',
          tags: buildNoteTags(kw),
          projectIds: projectIdForWord ? [projectIdForWord] : [],
          connections: [
            ...(projectTitle ? [{ type: 'sermon', id: projectIdForWord, title: projectTitle }] : []),
            { type: 'word', id: kw.id, title: kw.word },
          ],
        }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error || '저장 실패')
      setSavedIds((prev) => new Set(Array.from(prev).concat([idx])))
      showToast('success', `"${kw.word}" 노트가 저장되었습니다`)
    } catch (e: any) {
      showToast('error', `저장 실패: ${e?.message || '네트워크 오류'}`)
    } finally {
      setSavingIdx(null)
    }
  }

  const toggleSelect = (idx: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  const saveSelected = async () => {
    if (selected.size === 0 || bulkSaving) return
    setBulkSaving(true)
    let successCount = 0
    for (const idx of Array.from(selected)) {
      const kw = words[idx]
      if (!kw?.word) continue
      try {
        const res = await fetch('/school/api/insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'word',
            title: `[원어] ${kw.word}${kw.transliteration ? ` (${kw.transliteration})` : ''}`,
            content: buildNoteContent(kw),
            summary: kw.basicMeaning?.slice(0, 200) || kw.contextualMeaning?.slice(0, 200) || '',
            tags: buildNoteTags(kw),
            projectIds: projectIdForWord ? [projectIdForWord] : [],
            connections: [
              ...(projectTitle ? [{ type: 'sermon', id: projectIdForWord, title: projectTitle }] : []),
              { type: 'word', id: kw.id, title: kw.word },
            ],
          }),
        })
        const json = await res.json()
        if (res.ok && json.success) {
          successCount++
          setSavedIds((prev) => new Set(Array.from(prev).concat([idx])))
        }
      } catch {}
    }
    showToast('success', `${successCount}개 노트가 저장되었습니다`)
    setSelected(new Set())
    setSelectMode(false)
    setBulkSaving(false)
  }

  return (
    <div className="bg-[#04060f]/60 rounded-xl border border-indigo-500/20 mb-5 overflow-hidden relative">
      <div className="px-5 py-3 bg-indigo-500/10 border-b border-indigo-500/20 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <span className="text-[10px] font-semibold text-indigo-300 uppercase tracking-widest">설교 준비로 가져갈 핵심 정리</span>
        </div>
        {words.length > 0 && (
          <button
            onClick={() => { setSelectMode(!selectMode); setSelected(new Set()) }}
            className={`text-[10px] px-2.5 py-1 rounded-md transition-colors ${
              selectMode
                ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-500/40'
                : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10'
            }`}
          >
            {selectMode ? '선택 모드 끄기' : '선택 모드'}
          </button>
        )}
      </div>

      <div className="p-5 space-y-5">
        {/* Recurring Themes */}
        {themes.length > 0 && (
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block mb-2">반복 주제</span>
            <div className="flex flex-wrap gap-2">
              {themes.map((t: string) => (
                <span key={t} className="text-[11px] px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 font-medium">
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Key Insights */}
        {insights.length > 0 && (
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block mb-2">핵심 통찰</span>
            <div className="space-y-1.5">
              {insights.map((insight: string, i: number) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-200 leading-relaxed">
                  <span className="w-1 h-1 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Greek Words — 풍성한 원어 분석 */}
        {words.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">핵심 원어</span>
              {selectMode && (
                <span className="text-[10px] text-indigo-300 font-medium">
                  {selected.size}개 선택됨
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {words.map((kw, idx) => {
                const isSelected = selected.has(idx)
                const isSaved = savedIds.has(idx)
                return (
                  <div
                    key={idx}
                    onClick={selectMode ? () => toggleSelect(idx) : undefined}
                    className={`bg-[#04060f]/60 rounded-xl border overflow-hidden transition-all ${
                      selectMode ? 'cursor-pointer ' + (isSelected ? 'border-indigo-500/60 ring-1 ring-indigo-500/40' : 'border-white/5 hover:border-white/15') : 'border-white/5'
                    }`}
                  >
                    {/* 헤더: 헬라어 + 음역 + 메타 + 저장 버튼 */}
                    <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02] flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="text-lg text-white font-greek font-semibold">{kw.word}</span>
                          {kw.transliteration && (
                            <span className="text-xs text-indigo-300 italic">{kw.transliteration}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                          {kw.partOfSpeech && <span>· {kw.partOfSpeech}</span>}
                          {kw.strong && <span className="font-mono">{kw.strong}</span>}
                        </div>
                      </div>
                      {!selectMode && (
                        isSaved ? (
                          <button
                            onClick={(e) => { e.stopPropagation(); router.push('/school/advanced/graph') }}
                            className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all"
                            title="별자리에서 보기"
                          >
                            <Check className="w-3 h-3" />
                            <span>저장됨 ↗</span>
                          </button>
                        ) : (
                          <button
                            onClick={(e) => { e.stopPropagation(); saveAsInsight(idx) }}
                            disabled={savingIdx === idx}
                            className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold transition-all bg-pink-500/15 hover:bg-pink-500/30 text-pink-300 border border-pink-500/30 disabled:opacity-60"
                            title="원어 단어 노트로 저장"
                          >
                            {savingIdx === idx ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Plus className="w-3 h-3" />
                            )}
                            <span>노트로</span>
                          </button>
                        )
                      )}
                      {selectMode && (
                        <div className={`shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-indigo-500 border-indigo-500' : 'border-slate-600'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                      )}
                    </div>

                    <div className="px-4 py-3 space-y-2.5">
                      {/* 기본 의미 */}
                      {kw.basicMeaning && (
                        <div>
                          <div className="text-[9px] uppercase tracking-wider text-slate-500 font-bold mb-0.5">기본 의미</div>
                          <p className="text-[11.5px] text-slate-200 leading-relaxed">{kw.basicMeaning}</p>
                        </div>
                      )}

                      {/* 문맥상 의미 */}
                      {kw.contextualMeaning && (
                        <div>
                          <div className="text-[9px] uppercase tracking-wider text-indigo-400 font-bold mb-0.5">이 본문에서의 의미</div>
                          <p className="text-[11.5px] text-indigo-200 leading-relaxed">{kw.contextualMeaning}</p>
                        </div>
                      )}

                      {/* 쉽게 설명 */}
                      {kw.simpleExplanation && (
                        <div>
                          <div className="text-[9px] uppercase tracking-wider text-amber-400 font-bold mb-0.5">쉽게 설명하면</div>
                          <p className="text-[11.5px] text-amber-100 leading-relaxed">{kw.simpleExplanation}</p>
                        </div>
                      )}

                      {/* 설교적 적용 */}
                      {kw.sermonNote && (
                        <div className="border-l-2 border-indigo-500 pl-3">
                          <div className="text-[9px] uppercase tracking-wider text-indigo-300 font-bold mb-0.5">설교 적용</div>
                          <p className="text-[11.5px] text-slate-300 leading-relaxed italic">{kw.sermonNote}</p>
                        </div>
                      )}

                      {/* 성경 용례 */}
                      {kw.usage.length > 0 && (
                        <div>
                          <div className="text-[9px] uppercase tracking-wider text-slate-500 font-bold mb-1">성경 용례</div>
                          <div className="space-y-1">
                            {kw.usage.map((u: { ref: string; text: string }, i: number) => (
                              <div key={i} className="text-[11px] text-slate-400 leading-relaxed">
                                <span className="text-indigo-400 font-mono mr-1.5">{u.ref}</span>
                                <span>&ldquo;{u.text}&rdquo;</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* 일괄 저장 sticky bar (선택 모드) */}
        {selectMode && selected.size > 0 && (
          <div className="sticky bottom-3 z-10 bg-pink-950/90 backdrop-blur-md border border-pink-500/30 rounded-xl px-4 py-3 flex items-center justify-between gap-3 shadow-2xl">
            <div className="text-[12px] text-pink-100 font-medium">
              <span className="text-pink-300 font-bold">{selected.size}개</span>의 원어를 노트로 저장
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelected(new Set())}
                className="text-[11px] text-slate-400 hover:text-slate-200 px-3 py-1.5"
              >
                선택 해제
              </button>
              <button
                onClick={saveSelected}
                disabled={bulkSaving}
                className="text-[11px] font-bold bg-pink-600 hover:bg-pink-700 text-white px-4 py-1.5 rounded-lg inline-flex items-center gap-1.5 disabled:opacity-50"
              >
                {bulkSaving ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    저장 중
                  </>
                ) : (
                  <>
                    <Plus className="w-3 h-3" />
                    노트로 일괄 저장
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="text-right">
          <button
            onClick={onSendToPrep}
            className="inline-flex items-center gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl transition-colors font-medium"
          >
            이 연구를 바탕으로 설교 구조 세우기 →
          </button>
          <p className="text-[10px] text-slate-500 mt-1.5">
            연구에서 정리한 핵심 통찰과 원어 분석이 설교 준비 탭으로 전달됩니다
          </p>
        </div>
      </div>

      {/* 토스트 알림 */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl text-[12px] font-bold shadow-2xl border backdrop-blur-md ${
          toast.kind === 'success'
            ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/30'
            : 'bg-red-950/90 text-red-200 border-red-500/30'
        }`}>
          {toast.text}
        </div>
      )}
    </div>
  )
}

/* ─── Utility Components ─── */

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/5 rounded-xl p-2">
      <div className="text-[9px] text-slate-500">{label}</div>
      <div className="text-[11px] font-medium text-slate-100 mt-0.5">{value}</div>
    </div>
  )
}

function SectionBox({ title, className, children }: { title: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={`rounded-xl p-3 ${className || ''}`}>
      <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">{title}</h4>
      <p className="text-xs text-slate-100 leading-relaxed">{children}</p>
    </div>
  )
}
