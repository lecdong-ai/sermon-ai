'use client'

import { useState, useMemo, useCallback, useEffect, Fragment } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Sparkles, BookOpen, PenLine, Check, X } from 'lucide-react'
import { ProjectDetail, BiblePassage } from '@/lib/advanced/types'
import { getStorageItem, setStorageItem } from '@/lib/storage'
import type { SermonSection, ReferenceNote, JohnManuscriptData } from '@/lib/advanced/johnManuscriptData'
import {
  JOHN_VERSES, JOHN_WORDS, JOHN_COMMENTARIES,
  JOHN_TRANSLATION_NOTES, JOHN_PARALLEL_PASSAGES,
  JOHN_THEMES, JOHN_CONTEXT,
} from '@/lib/advanced/johnStudyData'
import { MOCK_BIBLE_STUDY } from '@/lib/advanced/bibleStudyData'
import type { JohnWordDetail, JohnCommentary } from '@/lib/advanced/johnStudyData'
import ProjectContextRow from '@/components/advanced/shared/ProjectContextRow'
import StudyCompleteModal from '@/components/advanced/shared/StudyCompleteModal'

const STUDY_DATA_REGISTRY: Record<string, {
  passage: string
  verses: any[]
  words: Record<string, any>
  commentaries: any[]
  translationNotes: any[]
  parallelPassages: any[]
  themes: { name: string; description: string; connectedSermons: number }[]
  contextInfo: { before: string; after: string; bookStructure: string }
}> = {
  '로마서_8': {
    passage: '롬 8:1-11',
    verses: MOCK_BIBLE_STUDY.verses,
    words: MOCK_BIBLE_STUDY.words,
    commentaries: MOCK_BIBLE_STUDY.commentaries,
    translationNotes: MOCK_BIBLE_STUDY.translationNotes,
    parallelPassages: MOCK_BIBLE_STUDY.parallelPassages,
    themes: MOCK_BIBLE_STUDY.themes,
    contextInfo: {
      before: MOCK_BIBLE_STUDY.contextInfo.before,
      after: MOCK_BIBLE_STUDY.contextInfo.after,
      bookStructure: '로마서: 1-3장(죄) → 4-5장(칭의) → 6-8장(성화) → 9-11장(이스라엘) → 12-16장(실천)',
    },
  },
  '요한복음_1': {
    passage: '요한복음 1:1-5',
    verses: JOHN_VERSES as any[],
    words: JOHN_WORDS as Record<string, any>,
    commentaries: JOHN_COMMENTARIES as any[],
    translationNotes: JOHN_TRANSLATION_NOTES as any[],
    parallelPassages: JOHN_PARALLEL_PASSAGES as any[],
    themes: JOHN_THEMES,
    contextInfo: {
      before: JOHN_CONTEXT.before,
      after: JOHN_CONTEXT.after,
      bookStructure: JOHN_CONTEXT.bookStructure,
    },
  },
}

function getStudyData(book: string, chapter: number) {
  const key = `${book}_${chapter}`
  return STUDY_DATA_REGISTRY[key] || null
}

interface Props { project: ProjectDetail; passages?: BiblePassage[] }

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
  const activeChapter = currentPassage?.chapter ?? project.chapter
  const activeVerseStart = currentPassage?.verseStart ?? project.verseStart
  const activeVerseEnd = currentPassage?.verseEnd ?? project.verseEnd
  const activePassageDisplay = currentPassage?.passage || project.passage
  const [viewMode, setViewMode] = useState<ViewMode>('parallel')
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null)
  const [selectedEnglishWord, setSelectedEnglishWord] = useState<{ word: string; clean: string; verse: number; version: string } | null>(null)
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null)
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null)
  const [memoText, setMemoText] = useState('')
  const [memoTags, setMemoTags] = useState<string[]>([])
  const [expandedCommentary, setExpandedCommentary] = useState<number | null>(null)
  const [showTranslations, setShowTranslations] = useState<Record<string, boolean>>({
    greek: true, translit: false, niv: true, esv: true, korean: true,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const [aiStudyData, setAiStudyData] = useState<Record<string, any>>({})
  const [aiStudyLoading, setAiStudyLoading] = useState(false)
  const [aiStudyError, setAiStudyError] = useState<string | null>(null)
  const [selectedFallbackWord, setSelectedFallbackWord] = useState<{ word: string; clean: string; verse: number; version?: string } | null>(null)
  const [wordLookup, setWordLookup] = useState<Record<string, JohnWordDetail>>({})
  const [lookupLoading, setLookupLoading] = useState(false)
  const [englishLookup, setEnglishLookup] = useState<Record<string, EnglishWordDetail>>({})
  const [englishLookupLoading, setEnglishLookupLoading] = useState(false)
  const [showStudyComplete, setShowStudyComplete] = useState(false)
  const [citingCommentary, setCitingCommentary] = useState<JohnCommentary | null>(null)
  const [citeSuccessMsg, setCiteSuccessMsg] = useState<string | null>(null)
  const [citeLoading, setCiteLoading] = useState(false)

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

  const passageKey = `${activeBook}_${activeChapter}`

  const studyData = useMemo(() => {
    const registered = getStudyData(activeBook, activeChapter)
    if (registered) return registered
    return aiStudyData[passageKey] || null
  }, [activeBook, activeChapter, aiStudyData, passageKey])

  const allWords = useMemo(() => ({
    ...(studyData?.words || {}),
    ...wordLookup,
  }), [studyData?.words, wordLookup])

  const fetchAiStudy = useCallback(() => {
    if (getStudyData(activeBook, activeChapter)) return
    if (aiStudyData[passageKey]) return
    const cached = getStorageItem<Record<string, any> | null>(`study_${passageKey}`, null)
    if (cached) {
      setAiStudyData(prev => ({ ...prev, [passageKey]: cached }))
      return
    }
    setAiStudyError(null)
    setAiStudyLoading(true)
    fetch('/api/advanced/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'bible-study',
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
              verses: parsed.verses,
              words: Object.fromEntries((parsed.words || []).map((w: any) => [w.id, w])),
              commentaries: parsed.commentaries || [],
              translationNotes: parsed.translationNotes || [],
              parallelPassages: parsed.parallelPassages || [],
              themes: parsed.themes || [],
              contextInfo: parsed.contextInfo || { before: '', after: '', bookStructure: '' },
              wordAlignments: parsed.wordAlignments || [],
            }
            setAiStudyData(prev => ({ ...prev, [passageKey]: data }))
            setStorageItem(`study_${passageKey}`, data)
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
  }, [passageKey, activeVerseStart, activeVerseEnd, activePassageDisplay, aiStudyData, activeBook, activeChapter])

  useEffect(() => {
    fetchAiStudy()
  }, [fetchAiStudy])

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
      fetch('/api/advanced/ai', {
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
      fetch('/api/advanced/ai', {
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
    if (!memoText.trim()) return
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      setLastSaved(new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }))
    }, 800)
  }, [memoText])

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
    const prepPayload = {
      passageStructure: studyData?.contextInfo?.bookStructure || '',
      contextPoints: contextEntries,
      keyWords: keyWordEntries,
      researchInsights: insightEntries,
      memoText,
      memoTags,
    }
    console.log('[BibleStudyTab] Saving to prep:', prepPayload)
    setStorageItem(`study_to_prep_${project.id}`, prepPayload)
    sessionStorage.setItem(`sermonai_study_to_prep_${project.id}`, JSON.stringify(prepPayload))
    ;(window as any).__prepDataBuffer = prepPayload
    router.push(`/advanced/projects/${project.id}?tab=prep`)
  }, [project.id, router, studyData, wordLookup, memoText, memoTags])

  const toggleTranslation = useCallback((key: string) => {
    setShowTranslations(prev => ({ ...prev, [key]: !prev[key] }))
  }, [])

  const toggleMemoTag = useCallback((tag: string) => {
    setMemoTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }, [])

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
    if (memoText) text += `\n## 연구 메모\n${memoText}\n`

    navigator.clipboard.writeText(text)
  }, [studyData, memoText])

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
          stageStatus={{ study: 'done', prep: 'progress', manuscript: 'empty' }}
          lastSaved={lastSaved || undefined}
        />

        {/* Passage Tabs */}
        {passages && passages.length > 1 && (
          <div className="flex items-center gap-1.5 px-5 py-3 border-b border-white/5 bg-[#04060f]/40">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider mr-2">본문</span>
            {passages.map((p, i) => (
              <button
                key={i}
                onClick={() => setSelectedPassageIndex(i)}
                className={`text-[12px] px-3 py-1.5 rounded-xl font-bold transition-all ${
                  selectedPassageIndex === i
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                }`}
              >
                {p.passage}
              </button>
            ))}
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
            />

            {/* Context Explorer - always visible */}
            <ContextExplorer
              before={studyData.contextInfo.before}
              after={studyData.contextInfo.after}
              bookStructure={studyData.contextInfo.bookStructure}
            />

            {/* 병렬 모드: 여러 번역본 나란히 */}
            {viewMode === 'parallel' && (
              <ParallelPassagePanel
                verses={studyData.verses}
                words={allWords}
                wordAlignments={(studyData as any)?.wordAlignments || []}
                showTranslations={showTranslations}
                selectedWordId={selectedWordId}
                selectedVerse={selectedVerse}
                onWordClick={handleWordClick}
                onVerseClick={handleVerseClick}
              />
            )}

            {/* 집중 모드: 원어 분석, 주석에 집중 */}
            {viewMode === 'focused' && (
              <>
                <ParallelPassagePanel
                  verses={studyData.verses}
                  words={allWords}
                  wordAlignments={(studyData as any)?.wordAlignments || []}
                  showTranslations={showTranslations}
                  selectedWordId={selectedWordId}
                  selectedVerse={selectedVerse}
                  onWordClick={handleWordClick}
                  onVerseClick={handleVerseClick}
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
                  onClick={fetchAiStudy}
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
          value={memoText}
          onChange={setMemoText}
          tags={memoTags}
          onToggleTag={toggleMemoTag}
          onSave={handleSaveMemo}
          isSaving={isSaving}
          lastSaved={lastSaved}
        />

        {/* ─── Research Summary for Prep Handoff ─── */}
        {studyData && <ResearchSummaryForPrep studyData={studyData} onSendToPrep={handleSendToPrep} />}

        {/* Bottom spacer */}
        <div className="h-8" />
      </div>

      {/* ─── Right Panel ─── */}
      <div className="w-80 shrink-0 border-l border-white/5 bg-[#04060f]/60 overflow-y-auto scrollbar-thin">
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
          memoText={memoText}
          memoTags={memoTags}
          commentaries={studyData?.commentaries || []}
          verses={studyData?.verses || []}
          themes={studyData?.themes || []}
          onCopyResults={handleCopyStudyResults}
          onViewFullChapter={handleViewFullChapter}
          onStudyComplete={() => setShowStudyComplete(true)}
        />
      </div>

      {/* Study Complete Modal */}
      <StudyCompleteModal
        isOpen={showStudyComplete}
        onClose={() => setShowStudyComplete(false)}
        studyData={studyData}
        projectId={project.id}
        onSendToPrep={() => {
          setShowStudyComplete(false)
          handleSendToPrep()
        }}
      />

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
              const res = await fetch('/api/advanced/ai', {
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
              const res = await fetch('/api/advanced/ai', {
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

  const sectionIcons: Record<string, string> = {
    introduction: '📝',
    body: '📖',
    conclusion: '✨',
    application: '💡',
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
                        <div className="text-xs text-slate-200">
                          {sectionIcons[s.type] || '📄'} {s.label}
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
              {loading ? '생성 중...' : '✨ 새 대지 생성'}
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

/* ─── Research Toolbar ─── */

function ResearchToolbar({
  passage, viewMode, onViewModeChange, showTranslations, onToggleTranslation,
  isSaving, lastSaved, onSendToPrep,
}: {
  passage: string
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  showTranslations: Record<string, boolean>
  onToggleTranslation: (key: string) => void
  isSaving: boolean
  lastSaved: string | null
  onSendToPrep: () => void
}) {
  const viewModes: { key: ViewMode; label: string }[] = [
    { key: 'parallel', label: '병렬' },
    { key: 'focused', label: '집중' },
    { key: 'compare', label: '비교' },
  ]

  return (
    <div className="sticky top-0 z-10 bg-[#050814]/95 backdrop-blur-sm border-b border-white/5 px-5 py-3 mb-5">
      <div className="flex items-center justify-between">
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
          {/* Translation Toggles */}
          <div className="flex items-center gap-1">
            {([
              { key: 'greek', label: '원문' },
              { key: 'translit', label: '음역' },
              { key: 'korean', label: '개역' },
              { key: 'niv', label: 'NIV' },
              { key: 'esv', label: 'ESV' },
            ]).map(t => (
              <button
                key={t.key}
                onClick={() => onToggleTranslation(t.key)}
                className={`text-[10px] px-2 py-1 rounded transition-colors ${
                  showTranslations[t.key]
                    ? 'bg-indigo-500/10 text-indigo-300 font-medium'
                    : 'bg-[#04060f]/60 border border-white/5 text-slate-500'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

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

          {/* CTA */}
          <button
            onClick={onSendToPrep}
            className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-xl transition-colors font-medium"
          >
            설교 준비로 →
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Context Explorer ─── */

function ContextExplorer({ before, after, bookStructure }: {
  before: string; after: string; bookStructure: string
}) {
  return (
    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-5">
      <div className="text-[10px] font-semibold text-amber-300 uppercase tracking-widest mb-2">문맥 확장</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300 leading-relaxed">
        <div>
          <span className="font-medium text-amber-300 block mb-1">앞 문맥</span>
          {before}
        </div>
        <div className="border-x border-amber-500/20 px-4">
          <span className="font-medium text-amber-300 block mb-1">책 구조</span>
          {bookStructure}
        </div>
        <div>
          <span className="font-medium text-amber-300 block mb-1">뒤 문맥</span>
          {after}
        </div>
      </div>
    </div>
  )
}

/* ─── Parallel Passage Panel ─── */

function ParallelPassagePanel({
  verses, words, wordAlignments, showTranslations, selectedWordId, selectedVerse,
  onWordClick, onVerseClick,
}: {
  verses: typeof JOHN_VERSES
  words: Record<string, JohnWordDetail>
  wordAlignments: Array<{ verse: number; englishVersion: string; englishWord: string; greekWordId: string }>
  showTranslations: Record<string, boolean>
  selectedWordId: string | null
  selectedVerse: number | null
  onWordClick: (id: string, fallbackWord?: { word: string; clean: string; verse: number; version?: string } | null) => void
  onVerseClick: (v: number) => void
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

  return (
    <div className="bg-[#04060f]/60 rounded-xl border border-white/5 mb-5 overflow-hidden">
      <div className="px-5 py-3 border-b border-white/5 bg-[#04060f]/60 flex items-center justify-between">
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">병렬 본문</span>
        <span className="text-[10px] text-slate-500">단어를 클릭하면 상세 분석을 볼 수 있습니다</span>
      </div>
      <div className="divide-y divide-white/5">
        {verses.map(v => (
          <div
            key={v.verse}
            className={`px-5 py-4 transition-colors ${
              selectedVerse === v.verse ? 'bg-indigo-500/10' : 'hover:bg-white/5'
            }`}
          >
            <div className="flex gap-4">
              <button
                onClick={() => onVerseClick(v.verse)}
                className={`w-8 h-8 rounded-full text-xs font-bold shrink-0 transition-colors ${
                  selectedVerse === v.verse
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white/5 text-slate-400 hover:bg-white/5'
                }`}
              >
                {v.verse}
              </button>
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
}: {
  value: string
  onChange: (v: string) => void
  tags: string[]
  onToggleTag: (t: string) => void
  onSave: () => void
  isSaving: boolean
  lastSaved: string | null
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
      <div className="flex items-center justify-between mt-2">
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
        <div className="flex items-center gap-2">
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
    </div>
  )
}

/* ─── Right Panel ─── */

function RightPanel({
  words, selectedWordId, selectedFallbackWord, lookupLoading, selectedEnglishWord, englishLookup, englishLookupLoading, selectedVerse, selectedTheme, onCloseDetail,
  onSendToPrep, memoText, memoTags, commentaries, verses, themes,
  onCopyResults, onViewFullChapter, onStudyComplete,
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
  memoText: string
  memoTags: string[]
  commentaries: any[]
  verses: any[]
  themes: any[]
  onCopyResults?: () => void
  onViewFullChapter?: () => void
  onStudyComplete?: () => void
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
      <div className="p-5">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
          <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">원어 단어 ({selectedFallbackWord.verse}절)</h3>
          <button onClick={onCloseDetail} className="text-slate-500 hover:text-slate-200 p-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-4">
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
        <div className="p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
            <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">영어 단어 ({selectedEnglishWord.verse}절, {selectedEnglishWord.version})</h3>
            <button onClick={onCloseDetail} className="text-slate-500 hover:text-slate-200 p-1">
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
      )
    }
    if (wordData) {
      return (
        <div className="p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
            <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">영어 단어 ({selectedEnglishWord.verse}절, {selectedEnglishWord.version})</h3>
            <button onClick={onCloseDetail} className="text-slate-500 hover:text-slate-200 p-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="space-y-4">
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
      <div className="p-5">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
          <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">영어 단어 ({selectedEnglishWord.verse}절, {selectedEnglishWord.version})</h3>
          <button onClick={onCloseDetail} className="text-slate-500 hover:text-slate-200 p-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="text-center py-8">
          <p className="text-2xl font-bold text-white font-serif">{selectedEnglishWord.word}</p>
          <p className="text-xs text-slate-500 mt-2">분석 정보를 불러오는 중입니다...</p>
        </div>
      </div>
    )
  }

  // Word Detail
  if (selectedWordId && words[selectedWordId]) {
    const word = words[selectedWordId]
    return (
      <div className="p-5">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
          <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">원어 단어 분석</h3>
          <button onClick={onCloseDetail} className="text-slate-500 hover:text-slate-200 p-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-4">
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
      <div className="p-5">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
          <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">{selectedVerse}절 주석</h3>
          <button onClick={onCloseDetail} className="text-slate-500 hover:text-slate-200 p-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
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
    )
  }

  // Theme Detail
  if (selectedTheme) {
    const themeData = (themes || []).find((t: any) => t.name === selectedTheme)
    if (themeData) {
      return (
        <div className="p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
            <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">주제 연결</h3>
            <button onClick={onCloseDetail} className="text-slate-500 hover:text-slate-200 p-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
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
            className="w-full text-left text-xs text-indigo-400 hover:bg-indigo-500/10 rounded-xl px-3 py-2 transition-colors font-medium border border-indigo-500/20"
          >
            설교 준비 탭으로 보내기 →
          </button>
          <button
            onClick={onStudyComplete}
            className="w-full text-left text-xs text-emerald-400 hover:bg-emerald-500/10 rounded-xl px-3 py-2 transition-colors font-medium border border-emerald-500/20"
          >
            ✨ 연구 완료 — 설교 자료 생성
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
      {memoText && (
        <div>
          <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3">현재 메모</h3>
          <div className="bg-white/5 rounded-xl p-3">
            <p className="text-xs text-slate-200 leading-relaxed line-clamp-4">{memoText}</p>
            {memoTags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {memoTags.map(tag => (
                  <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300">{tag}</span>
                ))}
              </div>
            )}
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

function ResearchSummaryForPrep({ studyData, onSendToPrep }: { studyData: any; onSendToPrep: () => void }) {
  const themes = (studyData?.themes || []).map((t: any) => t.name).slice(0, 6)
  const insights = (studyData?.commentaries || []).slice(0, 4).map((c: any) => c.text)
  const words = Object.values(studyData?.words || {}).slice(0, 4).map((w: any) => ({
    word: w.lemmaGreek || '',
    meaning: w.basicMeaning?.slice(0, 30) || '',
  }))

  return (
    <div className="bg-[#04060f]/60 rounded-xl border border-indigo-500/20 mb-5 overflow-hidden">
      <div className="px-5 py-3 bg-indigo-500/10 border-b border-indigo-500/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <span className="text-[10px] font-semibold text-indigo-300 uppercase tracking-widest">설교 준비로 가져갈 핵심 정리</span>
        </div>
        <span className="text-[10px] text-indigo-400">연구에서 정리한 내용입니다</span>
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

        {/* Key Greek Words */}
        {words.length > 0 && (
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block mb-2">핵심 원어</span>
            <div className="grid grid-cols-2 gap-2">
              {words.map(kw => (
                <div key={kw.word} className="bg-[#04060f]/60 rounded-xl border border-white/5 p-2.5">
                  <span className="text-xs text-slate-100 font-greek">{kw.word}</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">{kw.meaning}</p>
                </div>
              ))}
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
