'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, BookOpen } from 'lucide-react'
import type { BibleStudyData, WordDetail, CommentaryItem, VerseParallel } from '@/lib/advanced/bibleStudyData'
import { BIBLE_BOOKS } from '@/lib/advanced/bibleBooks'
import { getStorageItem, setStorageItem, removeStorageItem } from '@/lib/storage'
import SavedNotesModal from '@/components/advanced/bible/SavedNotesModal'

type DetailView = 'word' | 'verse' | 'theme' | 'none'

export default function BiblePage() {
  const router = useRouter()

  const [book, setBook] = useState('로마서')
  const [chapter, setChapter] = useState(8)
  const [verseStart, setVerseStart] = useState(1)
  const [verseEnd, setVerseEnd] = useState(11)
  const [testament, setTestament] = useState<'OT' | 'NT'>('NT')
  const [memoText, setMemoText] = useState('')
  const [savingMemo, setSavingMemo] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const [detailView, setDetailView] = useState<DetailView>('none')
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null)
  const [selectedFallbackWord, setSelectedFallbackWord] = useState<{ word: string; clean: string; verse: number; version?: string } | null>(null)
  const [selectedEnglishWord, setSelectedEnglishWord] = useState<{ word: string; clean: string; verse: number; version: string } | null>(null)
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null)
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null)

  const [wordLookup, setWordLookup] = useState<Record<string, WordDetail>>({})
  const [lookupLoading, setLookupLoading] = useState(false)
  const [englishLookup, setEnglishLookup] = useState<Record<string, any>>({})
  const [englishLookupLoading, setEnglishLookupLoading] = useState(false)

  const [showTranslations, setShowTranslations] = useState<Record<string, boolean>>({
    greek: false, krv: true, niv: false, esv: false, translit: false,
  })
  const [translationData, setTranslationData] = useState<Record<string, Record<string, any[]>>>({})
  const [translationLoading, setTranslationLoading] = useState<Record<string, Record<string, boolean>>>({})

  const [data, setData] = useState<BibleStudyData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isAILoading, setIsAILoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const passageKey = `${book}_${chapter}_${verseStart}_${verseEnd}`

  const fetchTranslation = useCallback((version: 'greek' | 'translit' | 'niv' | 'esv') => {
    if (!data) return
    if (translationData[passageKey]?.[version]) return
    if (translationLoading[passageKey]?.[version]) return

    const cached = getStorageItem<any[] | null>(`bible_${passageKey}_trans_${version}`, null)
    if (cached && Array.isArray(cached) && cached[0] && 'text' in cached[0] && !(version in cached[0])) {
      removeStorageItem(`bible_${passageKey}_trans_${version}`)
    } else if (cached) {
      setTranslationData(prev => ({
        ...prev,
        [passageKey]: { ...(prev[passageKey] || {}), [version]: cached },
      }))
      return
    }

    setTranslationLoading(prev => ({
      ...prev,
      [passageKey]: { ...(prev[passageKey] || {}), [version]: true },
    }))

    const start = Math.min(verseStart, verseEnd)
    const end = Math.max(verseStart, verseEnd)
    fetch('/api/advanced/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'bible-study-translation',
        data: {
          book,
          chapter: String(chapter),
          verseStart: String(start),
          verseEnd: String(end),
          passage: `${book} ${chapter}:${start}${end > start ? `-${end}` : ''}`,
          version,
        },
      }),
    })
      .then(r => r.json())
      .then(json => {
        if (json.success) {
          try {
            const parsed = JSON.parse(json.data.output)
            const list = (parsed.verses || []).map((v: any) => ({ verse: v.verse, [version]: v.text }))
            setTranslationData(prev => ({
              ...prev,
              [passageKey]: { ...(prev[passageKey] || {}), [version]: list },
            }))
            setStorageItem(`bible_${passageKey}_trans_${version}`, list)
          } catch {
            // ignore parse error
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        setTranslationLoading(prev => ({
          ...prev,
          [passageKey]: { ...(prev[passageKey] || {}), [version]: false },
        }))
      })
  }, [data, passageKey, book, chapter, verseStart, verseEnd, translationData, translationLoading])

  const cycleTranslation = useCallback(() => {
    setShowTranslations(prev => {
      if (!prev.greek) {
        fetchTranslation('greek')
        return { ...prev, greek: true, translit: true }
      }
      if (!prev.niv) {
        fetchTranslation('niv')
        return { ...prev, niv: true }
      }
      if (!prev.esv) {
        fetchTranslation('esv')
        return { ...prev, esv: true }
      }
      return { ...prev, greek: false, niv: false, esv: false, translit: false }
    })
  }, [fetchTranslation])

  useEffect(() => {
    setDetailView('none')
    setSelectedWordId(null)
    setSelectedFallbackWord(null)
    setSelectedEnglishWord(null)
    setSelectedVerse(null)
    setSelectedTheme(null)
    setWordLookup({})
    setEnglishLookup({})
    setTranslationData({})
    setTranslationLoading({})

    const registeredKey = `bible_${book}_${chapter}_${verseStart}_${verseEnd}`
    const cached = getStorageItem<BibleStudyData | null>(registeredKey, null)
    if (cached) {
      setData(cached)
      return
    }
    setData(null)
  }, [book, chapter, verseStart, verseEnd])

  const handleLoad = useCallback(async () => {
    const key = `bible_${book}_${chapter}_${verseStart}_${verseEnd}`
    setDetailView('none')
    setSelectedWordId(null)
    setSelectedFallbackWord(null)
    setSelectedEnglishWord(null)
    setSelectedVerse(null)
    setSelectedTheme(null)
    setWordLookup({})
    setEnglishLookup({})
    setError(null)
    setTranslationData({})
    setTranslationLoading({})
    
    setData(null)
    setIsLoading(true)
    setIsAILoading(false)
    
    const start = Math.min(verseStart, verseEnd)
    const end = Math.max(verseStart, verseEnd)
    const passageRef = `${book} ${chapter}:${start}${end > start ? `-${end}` : ''}`
    
    // Phase 1: Korean text from bible API (instant)
    let basicData: BibleStudyData | null = null
    try {
      const bibleRes = await fetch(`/api/bible?book=${encodeURIComponent(book)}&chapter=${chapter}&verseStart=${start}&verseEnd=${end}`)
      if (bibleRes.ok) {
        const bibleJson = await bibleRes.json()
        if (bibleJson.success) {
          basicData = {
            passage: passageRef,
            verses: bibleJson.verses.map((v: any) => ({
              verse: v.verse, korean: v.content,
              greek: '', translit: '', niv: '', esv: '',
            })),
            words: {}, commentaries: [],
            translationNotes: [], parallelPassages: [],
            themes: [], contextInfo: { before: '', after: '' },
          }
          setData(basicData)
          setIsLoading(false)
          setIsAILoading(true)
        }
      }
    } catch (e) {
      console.error('Phase 1 (bible API) failed:', e)
    }
    
    // Phase 2: AI analysis
    try {
      const aiRes = await fetch('/api/advanced/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'bible-study-core',
          data: {
            book,
            chapter: String(chapter),
            verseStart: String(start),
            verseEnd: String(end),
            passage: passageRef,
          },
        }),
      })
      const aiJson = await aiRes.json()
      if (aiJson.success) {
        const parsed = JSON.parse(aiJson.data.output)
        const finalData: BibleStudyData = {
          passage: passageRef,
          verses: (parsed.verses && parsed.verses.length > 0)
            ? parsed.verses
            : (basicData?.verses || []),
          words: Object.fromEntries((parsed.words || []).map((w: any) => [w.id, w])),
          commentaries: parsed.commentaries || [],
          translationNotes: parsed.translationNotes || [],
          parallelPassages: parsed.parallelPassages || [],
          themes: parsed.themes || [],
          contextInfo: parsed.contextInfo || { before: '', after: '' },
        }
        if (finalData.verses.length === 0) {
          setError('본문 데이터를 불러올 수 없습니다. 다시 시도해주세요.')
          setIsLoading(false)
          setIsAILoading(false)
          return
        }
        setData(finalData)
        setStorageItem(key, finalData)
      } else if (!basicData) {
        setError(aiJson.error || 'AI 분석에 실패했습니다.')
      }
    } catch (e) {
      if (!basicData) setError('AI 서버에 연결할 수 없습니다.')
    } finally {
      setIsLoading(false)
      setIsAILoading(false)
    }
  }, [book, chapter, verseStart, verseEnd])

  const reAnalyze = useCallback(() => {
    const key = `bible_${passageKey}`
    removeStorageItem(key)
    ;(['greek', 'niv', 'esv', 'translit'] as const).forEach(v => {
      removeStorageItem(`bible_${passageKey}_trans_${v}`)
    })
    setTranslationData({})
    setTranslationLoading({})
    handleLoad()
  }, [passageKey, handleLoad])

  const handleSaveMemo = async () => {
    if (!data) return
    setSavingMemo(true)
    try {
      const res = await fetch('/api/bible/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          book, chapter, verseStart, verseEnd,
          passage: `${book} ${chapter}:${verseStart}${verseEnd > verseStart ? `-${verseEnd}` : ''}`,
          studyData: data,
          memo: memoText,
        }),
      })
      const json = await res.json()
      if (json.success) alert('연구 노트가 저장되었습니다.')
      else alert('저장 실패: ' + (json.error || '알 수 없는 오류'))
    } catch {
      alert('저장 중 오류가 발생했습니다.')
    } finally {
      setSavingMemo(false)
    }
  }

  const handleStartProject = () => {
    router.push(`/advanced/projects/new?book=${book}&chapter=${chapter}&vs=${verseStart}&ve=${verseEnd}`)
  }

  const searchParams = useSearchParams()
  const loadNoteId = searchParams.get('loadNote')

  useEffect(() => {
    if (loadNoteId) {
      fetch(`/api/bible/notes?id=${loadNoteId}`)
        .then(r => r.json())
        .then(json => {
          if (json.success) {
            const note = json.data
            const b = BIBLE_BOOKS.find(bb => bb.name === note.book)
            if (b) {
              setBook(note.book)
              setTestament(b.testament as 'OT' | 'NT')
              setChapter(note.chapter)
              setVerseStart(note.verse_start)
              setVerseEnd(note.verse_end || note.verse_start)
              setMemoText(note.memo || '')
            }
          }
        })
        .catch(() => {})
    }
  }, [loadNoteId])

  const filteredBooks = useMemo(() => {
    let list = BIBLE_BOOKS.filter(b => b.testament === testament)
    if (searchQuery) {
      list = list.filter(b => b.name.includes(searchQuery))
    }
    return list
  }, [testament, searchQuery])

  const currentBook = useMemo(() => BIBLE_BOOKS.find(b => b.name === book), [book])
  const chapterOptions = useMemo(() => {
    if (!currentBook) return []
    return Array.from({ length: currentBook.chapters }, (_, i) => i + 1)
  }, [currentBook])

  const handleBookSelect = useCallback((name: string) => {
    const b = BIBLE_BOOKS.find(bb => bb.name === name)
    if (b) {
      setBook(name)
      setChapter(1)
      setVerseStart(1)
      setVerseEnd(11)
    }
  }, [])

  const handleChapterSelect = useCallback((ch: number) => {
    setChapter(ch)
    setVerseStart(1)
    setVerseEnd(11)
  }, [])

  const handleWordClick = useCallback((wordId: string, verse: number, fallbackWord?: { word: string; clean: string; verse: number; version?: string } | null) => {
    if (fallbackWord && fallbackWord.version) {
      const cacheKey = `_englk_${verse}_${fallbackWord.version}_${fallbackWord.clean}`
      if (englishLookup[cacheKey]) {
        setSelectedEnglishWord(fallbackWord as { word: string; clean: string; verse: number; version: string })
        setSelectedWordId(null)
        setSelectedFallbackWord(null)
        setSelectedVerse(null)
        setSelectedTheme(null)
        setDetailView('word')
        return
      }
      setSelectedEnglishWord(fallbackWord as { word: string; clean: string; verse: number; version: string })
      setSelectedWordId(null)
      setSelectedFallbackWord(null)
      setSelectedVerse(null)
      setSelectedTheme(null)
      setDetailView('word')
      setEnglishLookupLoading(true)
      fetch('/api/advanced/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'english-word',
          data: { word: fallbackWord.word, context: `${book} ${chapter}:${verse}` },
        }),
      })
        .then(r => r.json())
        .then(json => {
          if (json.success) {
            const parsed = JSON.parse(json.data.output)
            setEnglishLookup(prev => ({ ...prev, [cacheKey]: parsed }))
          }
        })
        .catch(() => {})
        .finally(() => setEnglishLookupLoading(false))
    } else if (fallbackWord) {
      const cacheKey = `_lookup_${verse}_${fallbackWord.clean}`
      if (wordLookup[cacheKey]) {
        setSelectedWordId(cacheKey)
        setSelectedFallbackWord(null)
        setSelectedEnglishWord(null)
        setSelectedVerse(null)
        setSelectedTheme(null)
        setDetailView('word')
        return
      }
      setSelectedFallbackWord(fallbackWord)
      setSelectedWordId(null)
      setSelectedEnglishWord(null)
      setSelectedVerse(null)
      setSelectedTheme(null)
      setDetailView('word')
      setLookupLoading(true)
      fetch('/api/advanced/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'word-lookup',
          data: { word: fallbackWord.word, context: `${book} ${chapter}:${verse}` },
        }),
      })
        .then(r => r.json())
        .then(json => {
          if (json.success) {
            const parsed = JSON.parse(json.data.output)
            const wd: WordDetail = { id: parsed.id || cacheKey, ...parsed }
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
      setDetailView('word')
    }
  }, [book, chapter, wordLookup, englishLookup])

  const handleVerseClick = useCallback((verse: number) => {
    setDetailView('verse')
    setSelectedVerse(verse)
    setSelectedWordId(null)
    setSelectedTheme(null)
  }, [])

  const handleThemeClick = useCallback((theme: string) => {
    setDetailView('theme')
    setSelectedTheme(theme)
    setSelectedWordId(null)
    setSelectedVerse(null)
  }, [])

  const handleCloseDetail = useCallback(() => {
    setDetailView('none')
    setSelectedWordId(null)
    setSelectedFallbackWord(null)
    setSelectedEnglishWord(null)
    setSelectedVerse(null)
    setSelectedTheme(null)
  }, [])

  const mergedVerses = useMemo(() => {
    if (!data) return []
    const trans = translationData[passageKey] || {}
    return data.verses.map(cv => {
      const g = trans.greek?.find((v: any) => v.verse === cv.verse)
      const t = trans.translit?.find((v: any) => v.verse === cv.verse)
      const n = trans.niv?.find((v: any) => v.verse === cv.verse)
      const e = trans.esv?.find((v: any) => v.verse === cv.verse)
      return {
        ...cv,
        greek: g?.greek ?? cv.greek ?? '',
        translit: t?.translit ?? cv.translit ?? '',
        niv: n?.niv ?? cv.niv ?? '',
        esv: e?.esv ?? cv.esv ?? '',
      }
    })
  }, [data, translationData, passageKey])

  const filteredVerses = useMemo(() => {
    return mergedVerses.filter(v => v.verse >= verseStart && v.verse <= verseEnd)
  }, [mergedVerses, verseStart, verseEnd])

  const allWords = useMemo(() => ({
    ...(data?.words || {}),
    ...wordLookup,
  }), [data?.words, wordLookup])

  useEffect(() => {
    if (!passageKey || !data) return
    if (data.verses[0]?.greek) return
    const trans = translationData[passageKey] || {}
    const loading = translationLoading[passageKey] || {}
    ;(['greek', 'translit', 'niv', 'esv'] as const).forEach(v => {
      if (showTranslations[v] && !trans[v] && !loading[v]) {
        fetchTranslation(v)
      }
    })
  }, [showTranslations, passageKey, data, translationData, translationLoading, fetchTranslation])

  return (
    <div className="flex h-full overflow-hidden">
      <BibleSidebar
        books={filteredBooks}
        selectedBook={book}
        selectedChapter={chapter}
        testament={testament}
        onTestamentChange={setTestament}
        onBookSelect={handleBookSelect}
        onChapterSelect={handleChapterSelect}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        chapterOptions={chapterOptions}
        verseStart={verseStart}
        verseEnd={verseEnd}
        onVerseStartChange={setVerseStart}
        onVerseEndChange={setVerseEnd}
        maxVerses={50}
        onLoad={handleLoad}
      />

      <div className="flex-1 flex flex-col min-w-0" key={passageKey}>
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          <div className="max-w-[900px] mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">성경 연구</span>
                </div>
                <h2 className="text-xl font-extrabold text-white mt-1">성경 연구</h2>
                <p
                  className="text-xs text-slate-500 font-bold mt-0.5 cursor-pointer select-none transition-colors hover:text-slate-300"
                  onClick={cycleTranslation}
                  title="번역 순환: 한글 → 원문 → NIV → ESV"
                >
                  {book} {chapter}장 {verseStart}절~{verseEnd}절
                  {!showTranslations.greek ? '' : !showTranslations.niv ? ' · +원문' : !showTranslations.esv ? ' · +NIV' : ' · +ESV'}
                </p>
              </div>
              {data && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 font-bold bg-white/5 border border-white/5 px-3 py-1.5 rounded-xl">
                    원어 {Object.keys(data.words).length}개 · 주석 {data.commentaries.length}건
                  </span>
                </div>
              )}
            </div>

            {isLoading && !data && (
              <div className="flex flex-col items-center justify-center py-20 space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-bold text-white">AI가 본문을 분석하고 있습니다</h3>
                  <p className="text-sm text-slate-400 mt-1">{book} {chapter}:{verseStart}{verseEnd > verseStart ? `-${verseEnd}` : ''}</p>
                  <p className="text-sm text-slate-400">원문 분석, 주석 등을 생성하는 중입니다 (3-5초 소요)</p>
                </div>
                <div className="w-full max-w-lg space-y-3 animate-pulse">
                  <div className="h-4 bg-white/5 rounded-xl w-3/4" />
                  <div className="h-4 bg-white/5 rounded-xl w-full" />
                  <div className="h-4 bg-white/5 rounded-xl w-5/6" />
                  <div className="h-20 bg-white/5 rounded-xl w-full" />
                </div>
              </div>
            )}

            {error && !data && (
              <div className="flex flex-col items-center justify-center py-20 space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-bold text-white">분석 중 오류 발생</h3>
                  <p className="text-sm text-red-400/80 mt-2">{error}</p>
                </div>
                <button
                  onClick={handleLoad}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-colors"
                >
                  <Loader2 className="w-4 h-4" />
                  다시 시도
                </button>
              </div>
            )}

            {!data && !isLoading && !error && (
              <div className="flex flex-col items-center justify-center py-20 space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-bold text-white">본문을 선택하세요</h3>
                  <p className="text-sm text-slate-400 mt-1">왼쪽에서 책, 장, 절을 선택한 후<br />&quot;본문 불러오기&quot;를 클릭하면 AI가 분석합니다</p>
                </div>
              </div>
            )}

            {data && (
              <>
                {isAILoading ? (
                  <div className="rounded-2xl border border-white/5 bg-[#04060f]/60 p-5">
                    <div className="animate-pulse space-y-3">
                      <div className="flex gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="h-2.5 bg-white/5 rounded-xl w-1/4" />
                          <div className="h-3 bg-white/5 rounded-xl w-full" />
                          <div className="h-3 bg-white/5 rounded-xl w-5/6" />
                        </div>
                        <div className="w-px bg-white/5" />
                        <div className="flex-1 space-y-2">
                          <div className="h-2.5 bg-white/5 rounded-xl w-1/4" />
                          <div className="h-3 bg-white/5 rounded-xl w-full" />
                          <div className="h-3 bg-white/5 rounded-xl w-5/6" />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <ContextInfoCard before={data.contextInfo.before} after={data.contextInfo.after} />
                )}

                <div className="rounded-2xl border border-white/5 bg-[#04060f]/60 overflow-hidden">
                  <div className="px-5 py-3 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">본문 연구</span>
                    <div className="flex items-center gap-1.5">
                      {(['greek', 'krv', 'niv', 'esv', 'translit'] as const).map(key => (
                        <button
                          key={key}
                          onClick={() => setShowTranslations(prev => ({ ...prev, [key]: !prev[key] }))}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-lg transition-all border ${
                            showTranslations[key]
                              ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300'
                              : 'bg-white/5 border-white/5 text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          {{ greek: '원문', krv: '개역', niv: 'NIV', esv: 'ESV', translit: '음역' }[key]}
                        </button>
                      ))}
                      <div className="w-px h-4 bg-white/5 mx-1" />
                      <button
                        onClick={reAnalyze}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-lg transition-all border border-white/5 text-slate-500 hover:text-indigo-300 hover:border-indigo-500/30"
                        title="재분석"
                      >
                        ↻ 재분석
                      </button>
                    </div>
                  </div>
                  <div className="divide-y divide-white/5">
                    {filteredVerses.map(v => (
                      <VerseRow
                        key={v.verse}
                        verse={v}
                        words={allWords}
                        showTranslations={showTranslations}
                        selectedWordId={selectedWordId}
                        selectedVerse={selectedVerse}
                        onWordClick={handleWordClick}
                        onVerseClick={handleVerseClick}
                      />
                    ))}
                  </div>
                </div>

                {isAILoading ? (
                  <div className="space-y-6">
                    <div className="rounded-2xl border border-white/5 bg-[#04060f]/60 p-5">
                      <div className="animate-pulse space-y-2">
                        <div className="h-2.5 bg-white/5 rounded-xl w-1/5" />
                        <div className="h-3 bg-white/5 rounded-xl w-3/4" />
                        <div className="h-3 bg-white/5 rounded-xl w-full" />
                        <div className="h-3 bg-white/5 rounded-xl w-2/3" />
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/5 bg-[#04060f]/60 p-5">
                      <div className="animate-pulse space-y-2">
                        <div className="h-2.5 bg-white/5 rounded-xl w-1/6" />
                        <div className="h-3 bg-white/5 rounded-xl w-5/6" />
                        <div className="h-3 bg-white/5 rounded-xl w-3/4" />
                        <div className="h-3 bg-white/5 rounded-xl w-full" />
                        <div className="h-3 bg-white/5 rounded-xl w-1/2" />
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/5 bg-[#04060f]/60 p-5">
                      <div className="animate-pulse space-y-2">
                        <div className="h-2.5 bg-white/5 rounded-xl w-1/5" />
                        <div className="h-3 bg-white/5 rounded-xl w-full" />
                        <div className="h-3 bg-white/5 rounded-xl w-4/5" />
                        <div className="h-3 bg-white/5 rounded-xl w-3/5" />
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/5 bg-[#04060f]/60 p-5">
                      <div className="animate-pulse space-y-2">
                        <div className="h-2.5 bg-white/5 rounded-xl w-[12%]" />
                        <div className="flex gap-2">
                          <div className="h-6 bg-white/5 rounded-full w-16" />
                          <div className="h-6 bg-white/5 rounded-full w-20" />
                          <div className="h-6 bg-white/5 rounded-full w-14" />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <TranslationNotesSection notes={data.translationNotes} />
                    <CommentarySection
                      commentaries={data.commentaries}
                      selectedVerse={selectedVerse}
                      onVerseClick={handleVerseClick}
                    />
                    <ParallelPassagesSection passages={data.parallelPassages} router={router} />
                    <ThemeSection themes={data.themes} onThemeClick={handleThemeClick} selectedTheme={selectedTheme} />
                  </>
                )}

                <StudyMemoSection value={memoText} onChange={setMemoText} />

                <div className="flex items-center gap-3 pb-8">
                  <button
                    onClick={handleSaveMemo}
                    disabled={savingMemo}
                    className="text-[13px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl transition-colors shadow-lg shadow-indigo-600/15 disabled:opacity-50"
                  >
                    {savingMemo ? '저장 중...' : '연구 노트 저장'}
                  </button>
                  <button
                    onClick={() => setShowNotes(true)}
                    className="text-[13px] font-bold border border-white/5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white px-5 py-2.5 rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    내 연구 노트
                  </button>
                  <button
                    onClick={handleStartProject}
                    className="text-[13px] font-bold border border-white/5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white px-5 py-2.5 rounded-xl transition-colors"
                  >
                    새 설교 프로젝트로 시작 →
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {data && detailView !== 'none' && (
        <DetailPanel
          data={data}
          detailView={detailView}
          selectedWordId={selectedWordId}
          selectedFallbackWord={selectedFallbackWord}
          lookupLoading={lookupLoading}
          selectedEnglishWord={selectedEnglishWord}
          englishLookup={englishLookup}
          englishLookupLoading={englishLookupLoading}
          selectedVerse={selectedVerse}
          selectedTheme={selectedTheme}
          onClose={handleCloseDetail}
          wordLookup={allWords}
        />
      )}

      {showNotes && <SavedNotesModal onClose={() => setShowNotes(false)} />}
    </div>
  )
}

/* ─── Sidebar ─── */

function BibleSidebar({
  books, selectedBook, selectedChapter, testament, onTestamentChange,
  onBookSelect, onChapterSelect, searchQuery, onSearchChange,
  chapterOptions, verseStart, verseEnd, onVerseStartChange, onVerseEndChange,
  maxVerses, onLoad,
}: {
  books: { name: string; chapters: number }[]
  selectedBook: string
  selectedChapter: number
  testament: 'OT' | 'NT'
  onTestamentChange: (t: 'OT' | 'NT') => void
  onBookSelect: (name: string) => void
  onChapterSelect: (ch: number) => void
  searchQuery: string
  onSearchChange: (q: string) => void
  chapterOptions: number[]
  verseStart: number
  verseEnd: number
  onVerseStartChange: (v: number) => void
  onVerseEndChange: (v: number) => void
  maxVerses: number
  onLoad: () => void
}) {
  return (
    <aside className="w-56 shrink-0 border-r border-white/5 bg-[#04060f]/70 backdrop-blur-md flex flex-col overflow-hidden">
      <div className="p-3 border-b border-white/5">
        <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">본문 선택</div>
        <div className="flex rounded-xl overflow-hidden border border-white/5 mb-2 bg-[#090d20] p-0.5 gap-0.5">
          <button
            onClick={() => onTestamentChange('OT')}
            className={`flex-1 text-[11px] py-1.5 font-bold transition-all rounded-lg ${
              testament === 'OT' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            구약
          </button>
          <button
            onClick={() => onTestamentChange('NT')}
            className={`flex-1 text-[11px] py-1.5 font-bold transition-all rounded-lg ${
              testament === 'NT' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            신약
          </button>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="책 이름 검색..."
          className="w-full text-xs bg-[#0c1020] border border-white/5 rounded-xl px-2.5 py-1.5 outline-none focus:border-indigo-500/50 placeholder:text-slate-600 text-slate-200 font-medium"
        />
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {books.map(b => (
          <button
            key={b.name}
            onClick={() => onBookSelect(b.name)}
            className={`w-full text-left px-4 py-2 text-[12px] font-bold transition-all flex items-center justify-between border-l-2 ${
              selectedBook === b.name
                ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500'
                : 'text-slate-500 hover:bg-white/[0.02] hover:text-slate-300 border-transparent'
            }`}
          >
            <span>{b.name}</span>
            <span className="text-[9px] text-slate-600 font-bold">{b.chapters}장</span>
          </button>
        ))}
      </div>

      <div className="border-t border-white/5 p-3 space-y-2 bg-[#04060f]/80">
        <div>
          <label className="text-[10px] text-slate-500 font-bold block mb-1">장</label>
          <select
            value={selectedChapter}
            onChange={e => onChapterSelect(Number(e.target.value))}
            className="w-full text-[12px] font-bold border border-white/5 rounded-xl px-2 py-1.5 outline-none focus:border-indigo-500/50 bg-[#0c1020] text-slate-300"
          >
            {chapterOptions.map(ch => (
              <option key={ch} value={ch}>{ch}장</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-[10px] text-slate-500 font-bold block mb-1">시작</label>
            <select
              value={verseStart}
              onChange={e => onVerseStartChange(Number(e.target.value))}
              className="w-full text-[12px] font-bold border border-white/5 rounded-xl px-2 py-1.5 outline-none focus:border-indigo-500/50 bg-[#0c1020] text-slate-300"
            >
              {Array.from({ length: maxVerses }, (_, i) => i + 1).map(v => (
                <option key={v} value={v}>{v}절</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="text-[10px] text-slate-500 font-bold block mb-1">끝</label>
            <select
              value={verseEnd}
              onChange={e => onVerseEndChange(Number(e.target.value))}
              className="w-full text-[12px] font-bold border border-white/5 rounded-xl px-2 py-1.5 outline-none focus:border-indigo-500/50 bg-[#0c1020] text-slate-300"
            >
              {Array.from({ length: maxVerses }, (_, i) => i + 1).filter(v => v >= verseStart).map(v => (
                <option key={v} value={v}>{v}절</option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={onLoad}
          className="w-full text-[12px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl transition-colors shadow-lg shadow-indigo-600/15"
        >
          본문 불러오기
        </button>

      </div>
    </aside>
  )
}

/* ─── Context Info ─── */

function ContextInfoCard({ before, after }: { before: string; after: string }) {
  return (
    <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-5">
      <div className="flex gap-4 text-xs text-slate-400 leading-relaxed">
        <div className="flex-1">
          <span className="font-extrabold text-indigo-300 block mb-1.5 text-[10px] uppercase tracking-wider">◀ 앞 문맥</span>
          <p className="text-slate-300 font-medium">{before}</p>
        </div>
        <div className="w-px bg-indigo-500/20" />
        <div className="flex-1">
          <span className="font-extrabold text-indigo-300 block mb-1.5 text-[10px] uppercase tracking-wider">뒤 문맥 ▶</span>
          <p className="text-slate-300 font-medium">{after}</p>
        </div>
      </div>
    </div>
  )
}

/* ─── Verse Row ─── */

function VerseRow({
  verse, words, showTranslations,
  selectedWordId, selectedVerse, onWordClick, onVerseClick,
}: {
  verse: VerseParallel
  words: BibleStudyData['words']
  showTranslations: Record<string, boolean>
  selectedWordId: string | null
  selectedVerse: number | null
  onWordClick: (wordId: string, verse: number, fallbackWord?: { word: string; clean: string; verse: number; version?: string } | null) => void
  onVerseClick: (verse: number) => void
}) {
  const isSelected = selectedVerse === verse.verse

  function normalizeGreek(s: string): string {
    return s.normalize('NFD').replace(/[\u0300-\u036f\u0313\u0314\u0342\u0345]/g, '').toLowerCase()
  }

  function renderAlignedText(text: string, version: string) {
    if (!text) return null
    const words_arr = text.split(' ')
    return words_arr.map((word, i) => {
      const clean = word.replace(/[.,;:'"!?()\[\]{}…·]/g, '').toLowerCase()
      const wordId = `_eng_${verse.verse}_${version}_${i}`
      const isSel = selectedWordId === wordId
      return (
        <span key={i} className="inline">
          <button
            onClick={() => onWordClick(wordId, verse.verse, { word, clean, verse: verse.verse, version })}
            className={`transition-colors cursor-pointer ${
              isSel ? 'text-indigo-400 bg-indigo-500/10 rounded px-0.5' : 'hover:text-white/70'
            }`}
            title={`${version}: ${clean}`}
          >
            {word}
          </button>
          {i < words_arr.length - 1 && <span className="text-inherit"> </span>}
        </span>
      )
    })
  }

  return (
    <div className={`px-5 py-4 transition-colors ${isSelected ? 'bg-indigo-500/10' : 'hover:bg-white/[0.02]'}`}>
      <div className="flex gap-4">
        <button
          onClick={() => onVerseClick(verse.verse)}
          className={`w-8 h-8 rounded-full text-xs font-extrabold shrink-0 transition-all ${
            isSelected
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'bg-white/5 border border-white/5 text-slate-500 hover:border-indigo-500/30 hover:text-indigo-400'
          }`}
        >
          {verse.verse}
        </button>
        <div className="flex-1 min-w-0 space-y-2">
          {showTranslations.greek && (
            <div className="flex items-start gap-2">
              <span className="text-[9px] font-extrabold text-indigo-400 w-8 shrink-0 mt-1 uppercase tracking-wider">원문</span>
              <p className="text-sm text-slate-200 leading-relaxed font-greek flex-1">
                {verse.greek.split(' ').map((word, i) => {
                  const clean = word.replace(/[.,;:'"!?()\[\]{}…·]/g, '')
                  const normalized = normalizeGreek(clean)
                  const matchedEntry = Object.entries(words).find(([_, w]) =>
                    w.lemmaGreek && normalized.includes(normalizeGreek(w.lemmaGreek.slice(0, 4)))
                  )
                  if (matchedEntry) {
                    const isSel = selectedWordId === matchedEntry[0]
                    return (
                      <span key={i} className="inline">
                        <button
                          onClick={() => onWordClick(matchedEntry[0], verse.verse)}
                          className={`transition-colors cursor-pointer border-b border-dotted ${
                            isSel
                              ? 'text-indigo-300 border-indigo-400 bg-indigo-500/10 rounded px-0.5'
                              : 'border-slate-600 hover:border-indigo-400 hover:text-indigo-300'
                          }`}
                          title={matchedEntry[1].basicMeaning}
                        >
                          {word}
                        </button>
                        {' '}
                      </span>
                    )
                  }
                  const wordId = `_gk_${verse.verse}_${i}`
                  const isSel = selectedWordId === wordId
                  return (
                    <span key={i} className="inline">
                      <button
                        onClick={() => onWordClick(wordId, verse.verse, { word, clean, verse: verse.verse })}
                        className={`transition-colors cursor-pointer ${
                          isSel ? 'text-indigo-400 bg-indigo-500/10 rounded px-0.5' : 'hover:text-white/70'
                        }`}
                        title={clean}
                      >
                        {word}
                      </button>
                      {' '}
                    </span>
                  )
                })}
              </p>
            </div>
          )}
          {showTranslations.translit && (
            <p className="text-xs text-slate-500 italic pl-10">{verse.translit}</p>
          )}
          {showTranslations.krv && (
            <div className="flex items-start gap-2">
              <span className="text-[9px] font-extrabold text-slate-500 w-8 shrink-0 mt-0.5">KRV</span>
              <p className="text-sm text-slate-300 leading-relaxed font-medium">{verse.korean}</p>
            </div>
          )}
          {showTranslations.niv && (
            <div className="flex items-start gap-2">
              <span className="text-[9px] font-extrabold text-sky-500 w-8 shrink-0 mt-0.5">NIV</span>
              <span className="text-xs text-slate-400 leading-relaxed">{renderAlignedText(verse.niv, 'NIV')}</span>
            </div>
          )}
          {showTranslations.esv && (
            <div className="flex items-start gap-2">
              <span className="text-[9px] font-extrabold text-amber-500 w-8 shrink-0 mt-0.5">ESV</span>
              <span className="text-xs text-slate-400 leading-relaxed">{renderAlignedText(verse.esv, 'ESV')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Translation Notes ─── */

function TranslationNotesSection({ notes }: { notes: BibleStudyData['translationNotes'] }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#04060f]/60 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">번역 비교 노트</span>
        <span className="text-[10px] text-slate-600 font-bold">{notes.length}건</span>
      </div>
      <div className="space-y-3">
        {notes.map((n, i) => (
          <div key={i} className="bg-sky-500/10 border border-sky-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-extrabold text-sky-300">{n.verse}절</span>
              <div className="flex gap-1">
                {n.versions.map(v => (
                  <span key={v} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-sky-500/10 border border-sky-500/20 text-sky-300">
                    {v}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-[12px] text-slate-400 leading-relaxed font-medium">{n.note}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Commentary ─── */

function CommentarySection({
  commentaries, selectedVerse, onVerseClick,
}: {
  commentaries: BibleStudyData['commentaries']
  selectedVerse: number | null
  onVerseClick: (v: number) => void
}) {
  const grouped = commentaries.reduce<Record<number, typeof commentaries>>((acc, c) => {
    if (!acc[c.verse]) acc[c.verse] = []
    acc[c.verse].push(c)
    return acc
  }, {})

  const typeLabel: Record<string, string> = {
    exegetical: '본문 주석',
    theological: '신학',
    historical: '역사',
    pastoral: '목회',
  }

  const typeColor: Record<string, string> = {
    exegetical: 'bg-teal-500/10 text-teal-300 border-teal-500/20',
    theological: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
    historical: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    pastoral: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  }

  return (
    <div className="rounded-2xl border border-white/5 bg-[#04060f]/60 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">원문 주석</span>
        <span className="text-[10px] text-slate-600 font-bold">{commentaries.length}건</span>
      </div>
      <div className="space-y-4">
        {Object.entries(grouped).map(([verse, comms]) => (
          <div key={verse}>
            <button
              onClick={() => onVerseClick(parseInt(verse))}
              className={`inline-flex items-center gap-2 text-xs font-extrabold mb-2 transition-colors ${
                selectedVerse === parseInt(verse) ? 'text-indigo-400' : 'text-slate-500 hover:text-indigo-400'
              }`}
            >
              <span className="w-5 h-5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[9px] flex items-center justify-center font-extrabold text-indigo-300">{verse}</span>
              절 주석 ({comms.length}건)
            </button>
            <div className="space-y-2">
              {comms.map((c, i) => (
                <div key={i} className="text-[12px] text-slate-400 leading-relaxed pl-4 border-l-2 border-indigo-500/30">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="font-extrabold text-slate-300">{c.author}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${typeColor[c.type] || 'bg-white/5 border-white/5 text-slate-500'}`}>
                      {typeLabel[c.type] || c.type}
                    </span>
                  </div>
                  {c.text.length > 150 ? c.text.slice(0, 150) + '...' : c.text}
                  <p className="text-[10px] text-slate-600 mt-1 italic">— {c.source}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Parallel Passages ─── */

function ParallelPassagesSection({ passages, router }: { passages: BibleStudyData['parallelPassages']; router: ReturnType<typeof useRouter> }) {
  const relationLabel: Record<string, string> = {
    direct_quote: '직접 인용',
    allusion: '암시',
    thematic: '주제적 연결',
    typology: '예표/성취',
  }

  return (
    <div className="rounded-2xl border border-white/5 bg-[#04060f]/60 p-5 space-y-4">
      <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">평행본문 / 관련 본문</span>
      <div className="space-y-3">
        {passages.map((p, i) => (
          <div key={i} className="flex gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/20 transition-all cursor-pointer">
            <span className="text-[9px] font-extrabold px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 h-fit shrink-0">
              {relationLabel[p.relation] || p.relation}
            </span>
            <div>
              <span className="text-[12px] font-extrabold text-indigo-300">{p.ref}</span>
              <p className="text-[12px] text-slate-400 leading-relaxed mt-0.5 font-medium">{p.text}</p>
              <p className="text-[10px] text-slate-600 mt-1 italic">{p.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Themes ─── */

function ThemeSection({ themes, onThemeClick, selectedTheme }: {
  themes: BibleStudyData['themes']
  onThemeClick: (t: string) => void
  selectedTheme: string | null
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#04060f]/60 p-5 space-y-4">
      <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">주제 사전 연결</span>
      <div className="flex flex-wrap gap-2">
        {themes.map(t => (
          <button
            key={t.name}
            onClick={() => onThemeClick(t.name)}
            className={`text-[11px] font-bold px-3.5 py-1.5 rounded-full border transition-all ${
              selectedTheme === t.name
                ? 'bg-purple-500/15 border-purple-500/40 text-purple-300 shadow-sm'
                : 'bg-white/5 border-white/5 text-slate-400 hover:border-purple-500/30 hover:text-purple-300'
            }`}
          >
            {t.name}
            <span className="ml-1.5 text-[10px] opacity-50">{t.connectedSermons}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

/* ─── Study Memo ─── */

function StudyMemoSection({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#04060f]/60 p-5 space-y-4">
      <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">연구 메모</span>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="본문을 연구하면서 떠오른 통찰, 질문, 적용 아이디어를 기록하세요..."
        className="w-full min-h-[120px] text-[13px] text-slate-300 bg-[#0c1020] rounded-xl p-4 border border-white/5 outline-none resize-y focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all leading-relaxed placeholder:text-slate-600 font-medium"
      />
      <div className="flex justify-between">
        <div className="flex gap-1.5">
          <span className="text-[10px] font-bold text-slate-500 bg-white/5 border border-white/5 px-2 py-1 rounded-lg">통찰</span>
          <span className="text-[10px] font-bold text-slate-500 bg-white/5 border border-white/5 px-2 py-1 rounded-lg">질문</span>
          <span className="text-[10px] font-bold text-slate-500 bg-white/5 border border-white/5 px-2 py-1 rounded-lg">적용</span>
        </div>
        <span className="text-[10px] text-slate-600 font-bold">{value.length}자</span>
      </div>
    </div>
  )
}

/* ─── Detail Panel ─── */

function DetailPanel({
  data, detailView, selectedWordId, selectedFallbackWord, lookupLoading,
  selectedEnglishWord, englishLookup, englishLookupLoading,
  selectedVerse, selectedTheme, onClose, wordLookup,
}: {
  data: BibleStudyData
  detailView: DetailView
  selectedWordId: string | null
  selectedFallbackWord: { word: string; clean: string; verse: number; version?: string } | null
  lookupLoading: boolean
  selectedEnglishWord: { word: string; clean: string; verse: number; version: string } | null
  englishLookup: Record<string, any>
  englishLookupLoading: boolean
  selectedVerse: number | null
  selectedTheme: string | null
  onClose: () => void
  wordLookup: Record<string, WordDetail>
}) {
  if (selectedFallbackWord) {
    return (
      <aside className="w-[380px] shrink-0 border-l border-white/5 bg-[#04060f]/85 backdrop-blur-md overflow-y-auto scrollbar-thin">
        <div className="p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
            <h3 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
              원어 단어 ({selectedFallbackWord.verse}절)
            </h3>
            <button onClick={onClose} className="text-slate-500 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="space-y-4">
            <div className="text-center py-6 bg-white/5 rounded-2xl">
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
      </aside>
    )
  }

  if (selectedEnglishWord) {
    const cacheKey = `_englk_${selectedEnglishWord.verse}_${selectedEnglishWord.version}_${selectedEnglishWord.clean}`
    const wordData = englishLookup[cacheKey]
    if (englishLookupLoading && !wordData) {
      return (
        <aside className="w-[380px] shrink-0 border-l border-white/5 bg-[#04060f]/85 backdrop-blur-md overflow-y-auto scrollbar-thin">
          <div className="p-5">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
              <h3 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                영어 단어 ({selectedEnglishWord.verse}절, {selectedEnglishWord.version})
              </h3>
              <button onClick={onClose} className="text-slate-500 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex flex-col items-center py-10 space-y-3">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
              <p className="text-xs text-slate-400">AI가 이 단어를 분석하고 있습니다...</p>
            </div>
          </div>
        </aside>
      )
    }
    if (wordData) {
      return (
        <aside className="w-[380px] shrink-0 border-l border-white/5 bg-[#04060f]/85 backdrop-blur-md overflow-y-auto scrollbar-thin">
          <div className="p-5">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
              <h3 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                영어 단어 ({selectedEnglishWord.verse}절, {selectedEnglishWord.version})
              </h3>
              <button onClick={onClose} className="text-slate-500 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div className="text-center py-4 bg-white/5 rounded-2xl">
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
              <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/20">
                <h4 className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest mb-1.5">쉽게 설명하면</h4>
                <p className="text-xs text-amber-200 leading-relaxed">{wordData.simpleExplanation}</p>
              </div>
              {wordData.sermonNote && (
                <SectionBox title="설교적 의미" className="bg-white/5 border-l-2 border-indigo-500">
                  {wordData.sermonNote}
                </SectionBox>
              )}
            </div>
          </div>
        </aside>
      )
    }
  }

  return (
    <aside className="w-[380px] shrink-0 border-l border-white/5 bg-[#04060f]/85 backdrop-blur-md overflow-y-auto scrollbar-thin">
      {detailView === 'word' && selectedWordId && wordLookup[selectedWordId] && (
        <WordDetailView word={wordLookup[selectedWordId]} onClose={onClose} />
      )}
      {detailView === 'word' && selectedWordId && data.words[selectedWordId] && (
        <WordDetailView word={data.words[selectedWordId]} onClose={onClose} />
      )}
      {detailView === 'verse' && selectedVerse && (
        <CommentaryDetailView
          verse={selectedVerse}
          text={data.verses.find(v => v.verse === selectedVerse)?.korean || ''}
          commentaries={data.commentaries.filter(c => c.verse === selectedVerse)}
          onClose={onClose}
        />
      )}
      {detailView === 'theme' && selectedTheme && (
        <ThemeDetailView
          theme={data.themes.find(t => t.name === selectedTheme) || null}
          onClose={onClose}
        />
      )}
    </aside>
  )
}

function DetailHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
      <h3 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">{title}</h3>
      <button onClick={onClose} className="text-slate-500 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

function WordDetailView({ word, onClose }: { word: WordDetail; onClose: () => void }) {
  return (
    <div>
      <DetailHeader title="원어 단어 분석" onClose={onClose} />
      <div className="p-5 space-y-4">
        <div className="text-center py-6 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
          <p className="text-3xl font-greek text-indigo-200">{word.lemmaGreek}</p>
          <p className="text-xs text-slate-500 font-bold mt-1.5">{word.transliteration || word.pronunciation}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <InfoBox label="Strong 번호" value={word.strong} />
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
        <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/20">
          <h4 className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest mb-1.5">쉽게 설명하면</h4>
          <p className="text-[13px] text-amber-200 leading-relaxed font-medium">{word.simpleExplanation}</p>
        </div>
        {word.usage.length > 0 && (
          <div>
            <h4 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">성경 용례</h4>
            <div className="space-y-1.5">
              {word.usage.map((u, i) => (
                <div key={i} className="text-xs text-slate-400 bg-[#0c1020] rounded-xl p-3 border border-white/5">
                  <span className="font-bold text-slate-300">{u.ref}: </span>
                  {u.text}
                </div>
              ))}
            </div>
          </div>
        )}
        {word.sermonNote && (
          <SectionBox title="설교 적용 노트" className="bg-emerald-500/10 border border-emerald-500/20">
            {word.sermonNote}
          </SectionBox>
        )}
        {word.relatedWords.length > 0 && (
          <div>
            <h4 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">관련 원어</h4>
            <div className="flex flex-wrap gap-1.5">
              {word.relatedWords.map(r => (
                <span key={r} className="text-[11px] px-2 py-0.5 rounded-lg bg-white/5 border border-white/5 text-slate-400 font-mono">{r}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function CommentaryDetailView({ verse, text, commentaries, onClose }: {
  verse: number
  text: string
  commentaries: CommentaryItem[]
  onClose: () => void
}) {
  const typeLabel: Record<string, string> = {
    exegetical: '본문 주석',
    theological: '신학',
    historical: '역사',
    pastoral: '목회',
  }
  const typeColor: Record<string, string> = {
    exegetical: 'bg-teal-500/10 text-teal-300 border-teal-500/20',
    theological: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
    historical: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    pastoral: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  }

  return (
    <div>
      <DetailHeader title={`${verse}절 주석`} onClose={onClose} />
      <div className="p-5 space-y-4">
        <div className="bg-[#0c1020] border border-white/5 rounded-xl p-4">
          <p className="text-sm text-slate-300 leading-relaxed font-medium">{text}</p>
        </div>
        {commentaries.length > 0 ? (
          <div className="space-y-3">
            {commentaries.map((c, i) => (
              <div key={i} className="bg-[#04060f]/60 border border-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-extrabold text-slate-300">{c.author}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${typeColor[c.type] || 'bg-white/5 border-white/5 text-slate-500'}`}>
                    {typeLabel[c.type] || c.type}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{c.text}</p>
                <p className="text-[10px] text-slate-600 mt-1.5 italic">— {c.source}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-slate-500 text-center py-8">
            이 절에 대한 주석이 없습니다.
          </div>
        )}
      </div>
    </div>
  )
}

function ThemeDetailView({ theme, onClose }: {
  theme: { name: string; description: string; connectedSermons: number } | null
  onClose: () => void
}) {
  const router = useRouter()
  if (!theme) return null
  return (
    <div>
      <DetailHeader title="주제 연결" onClose={onClose} />
      <div className="p-5 space-y-4">
        <div className="text-center py-4">
          <span className="inline-block px-5 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-sm font-extrabold">
            {theme.name}
          </span>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed font-medium">{theme.description}</p>
        <div className="flex items-center justify-between text-xs text-slate-500 bg-[#0c1020] border border-white/5 rounded-xl p-3">
          <span className="font-bold">연결된 설교</span>
          <span className="font-extrabold text-slate-300">{theme.connectedSermons}편</span>
        </div>
        <button
          onClick={() => router.push(`/advanced/projects?search=${encodeURIComponent(theme.name)}`)}
          className="w-full text-xs font-bold text-indigo-400 border border-indigo-500/30 rounded-xl py-2.5 hover:bg-indigo-500/10 transition-colors"
        >
          이 주제로 설교 검색 →
        </button>
      </div>
    </div>
  )
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/5 border border-white/[0.04] rounded-xl p-3">
      <div className="text-[9px] font-extrabold text-slate-600 uppercase tracking-wider">{label}</div>
      <div className="text-[12px] font-bold text-slate-300 mt-0.5">{value}</div>
    </div>
  )
}

function SectionBox({ title, className, children }: { title: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={`rounded-xl p-4 ${className || 'bg-white/5'}`}>
      <h4 className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">{title}</h4>
      <p className="text-[13px] text-slate-300 leading-relaxed font-medium">{children}</p>
    </div>
  )
}
