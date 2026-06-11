'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { MOCK_BIBLE_STUDY } from '@/lib/advanced/bibleStudyData'
import type { BibleStudyData, WordDetail, CommentaryItem, VerseParallel } from '@/lib/advanced/bibleStudyData'
import { BIBLE_BOOKS } from '@/lib/advanced/bibleBooks'

type DetailView = 'word' | 'verse' | 'theme' | 'none'

export default function BiblePage() {
  const router = useRouter()
  const data = MOCK_BIBLE_STUDY as BibleStudyData

  const [book, setBook] = useState('로마서')
  const [chapter, setChapter] = useState(8)
  const [verseStart, setVerseStart] = useState(1)
  const [verseEnd, setVerseEnd] = useState(11)
  const [testament, setTestament] = useState<'OT' | 'NT'>('NT')
  const [memoText, setMemoText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const [detailView, setDetailView] = useState<DetailView>('none')
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null)
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null)
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null)

  const [showTranslations, setShowTranslations] = useState<Record<string, boolean>>({
    greek: true, krv: true, niv: true, esv: true, translit: false,
  })

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

  const handleLoad = useCallback(() => {
    setDetailView('none')
    setSelectedWordId(null)
    setSelectedVerse(null)
    setSelectedTheme(null)
  }, [])

  const handleWordClick = useCallback((wordId: string, _verse: number) => {
    setDetailView('word')
    setSelectedWordId(wordId)
    setSelectedVerse(null)
    setSelectedTheme(null)
  }, [])

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
    setSelectedVerse(null)
    setSelectedTheme(null)
  }, [])

  const filteredVerses = useMemo(() => {
    return data.verses.filter(v => v.verse >= verseStart && v.verse <= verseEnd)
  }, [data.verses, verseStart, verseEnd])

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
        showTranslations={showTranslations}
        onToggleTranslation={key => setShowTranslations(prev => ({ ...prev, [key]: !prev[key] }))}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          <div className="max-w-[900px] mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="adv-section-title">성경 연구</h2>
                <p className="text-xs text-paper-500 mt-0.5">
                  {book} {chapter}장 {verseStart}절~{verseEnd}절 · {data.verses.length}절
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-paper-400 bg-paper-100 px-2 py-1 rounded">
                  연구 현황: 원어 {Object.keys(data.words).length}개 · 주석 {data.commentaries.length}건
                </span>
              </div>
            </div>

            <ContextInfoCard before={data.contextInfo.before} after={data.contextInfo.after} />

            <div className="adv-card p-0 overflow-hidden">
              <div className="px-5 py-3 border-b border-paper-200 bg-paper-100 flex items-center justify-between">
                <span className="adv-card-title">본문 연구</span>
                <span className="text-[10px] text-paper-400">원어 단어를 클릭하면 상세 분석을 볼 수 있습니다</span>
              </div>
              <div className="divide-y divide-paper-150">
                {filteredVerses.map(v => (
                  <VerseRow
                    key={v.verse}
                    verse={v}
                    words={data.words}
                    showTranslations={showTranslations}
                    selectedWordId={selectedWordId}
                    selectedVerse={selectedVerse}
                    onWordClick={handleWordClick}
                    onVerseClick={handleVerseClick}
                  />
                ))}
              </div>
            </div>

            <TranslationNotesSection notes={data.translationNotes} />

            <CommentarySection
              commentaries={data.commentaries}
              selectedVerse={selectedVerse}
              onVerseClick={handleVerseClick}
            />

            <ParallelPassagesSection passages={data.parallelPassages} router={router} />

            <ThemeSection themes={data.themes} onThemeClick={handleThemeClick} selectedTheme={selectedTheme} />

            <StudyMemoSection value={memoText} onChange={setMemoText} />

            <div className="flex items-center gap-3 pb-8">
              <button className="text-sm bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-md transition-colors font-medium">
                연구 노트 저장
              </button>
              <button className="text-sm border border-paper-200 hover:border-green-300 text-paper-600 hover:text-green-600 px-5 py-2 rounded-md transition-colors">
                새 설교 프로젝트로 시작 →
              </button>
            </div>
          </div>
        </div>
      </div>

      {detailView !== 'none' && (
        <DetailPanel
          data={data}
          detailView={detailView}
          selectedWordId={selectedWordId}
          selectedVerse={selectedVerse}
          selectedTheme={selectedTheme}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  )
}

/* ─── Sidebar ─── */

function BibleSidebar({
  books, selectedBook, selectedChapter, testament, onTestamentChange,
  onBookSelect, onChapterSelect, searchQuery, onSearchChange,
  chapterOptions, verseStart, verseEnd, onVerseStartChange, onVerseEndChange,
  maxVerses, onLoad, showTranslations, onToggleTranslation,
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
  showTranslations: Record<string, boolean>
  onToggleTranslation: (key: string) => void
}) {
  return (
    <aside className="w-56 shrink-0 border-r border-paper-200 bg-paper-50 flex flex-col overflow-hidden">
      <div className="p-3 border-b border-paper-200">
        <div className="text-[11px] font-semibold text-paper-500 uppercase tracking-wider mb-2">본문 선택</div>
        <div className="flex rounded-md overflow-hidden border border-paper-200 mb-2">
          <button
            onClick={() => onTestamentChange('OT')}
            className={`flex-1 text-[11px] py-1.5 font-medium transition-colors ${
              testament === 'OT' ? 'bg-navy-600 text-white' : 'bg-white text-paper-500 hover:bg-paper-100'
            }`}
          >
            구약
          </button>
          <button
            onClick={() => onTestamentChange('NT')}
            className={`flex-1 text-[11px] py-1.5 font-medium transition-colors ${
              testament === 'NT' ? 'bg-navy-600 text-white' : 'bg-white text-paper-500 hover:bg-paper-100'
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
          className="w-full text-xs bg-white border border-paper-200 rounded-md px-2.5 py-1.5 outline-none focus:border-green-400 placeholder:text-paper-400"
        />
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {books.map(b => (
          <button
            key={b.name}
            onClick={() => onBookSelect(b.name)}
            className={`w-full text-left px-3 py-1.5 text-xs transition-colors flex items-center justify-between ${
              selectedBook === b.name
                ? 'bg-green-100 text-green-700 font-medium'
                : 'text-paper-600 hover:bg-paper-100'
            }`}
          >
            <span>{b.name}</span>
            <span className="text-[10px] text-paper-400">{b.chapters}장</span>
          </button>
        ))}
      </div>

      <div className="border-t border-paper-200 p-3 space-y-2 bg-white">
        <div>
          <label className="text-[10px] text-paper-400 block mb-1">장</label>
          <select
            value={selectedChapter}
            onChange={e => onChapterSelect(Number(e.target.value))}
            className="w-full text-xs border border-paper-200 rounded-md px-2 py-1.5 outline-none focus:border-green-400 bg-white"
          >
            {chapterOptions.map(ch => (
              <option key={ch} value={ch}>{ch}장</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-[10px] text-paper-400 block mb-1">시작</label>
            <select
              value={verseStart}
              onChange={e => onVerseStartChange(Number(e.target.value))}
              className="w-full text-xs border border-paper-200 rounded-md px-2 py-1.5 outline-none focus:border-green-400 bg-white"
            >
              {Array.from({ length: maxVerses }, (_, i) => i + 1).map(v => (
                <option key={v} value={v}>{v}절</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="text-[10px] text-paper-400 block mb-1">끝</label>
            <select
              value={verseEnd}
              onChange={e => onVerseEndChange(Number(e.target.value))}
              className="w-full text-xs border border-paper-200 rounded-md px-2 py-1.5 outline-none focus:border-green-400 bg-white"
            >
              {Array.from({ length: maxVerses }, (_, i) => i + 1).filter(v => v >= verseStart).map(v => (
                <option key={v} value={v}>{v}절</option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={onLoad}
          className="w-full text-xs bg-green-500 hover:bg-green-600 text-white py-1.5 rounded-md transition-colors font-medium"
        >
          불러오기
        </button>
        <div className="pt-1">
          <label className="text-[10px] text-paper-400 block mb-1">표시 번역</label>
          <div className="flex flex-wrap gap-1">
            {(['greek', 'krv', 'niv', 'esv', 'translit'] as const).map(key => (
              <button
                key={key}
                onClick={() => onToggleTranslation(key)}
                className={`text-[10px] px-1.5 py-0.5 rounded transition-colors ${
                  showTranslations[key]
                    ? 'bg-navy-100 text-navy-700'
                    : 'bg-white border border-paper-200 text-paper-400'
                }`}
              >
                {{ greek: '원문', krv: '개역', niv: 'NIV', esv: 'ESV', translit: '음역' }[key]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}

/* ─── Context Info ─── */

function ContextInfoCard({ before, after }: { before: string; after: string }) {
  return (
    <div className="bg-amber-50/60 border border-amber-200/60 rounded-lg p-4">
      <div className="flex gap-4 text-xs text-paper-600 leading-relaxed">
        <div className="flex-1">
          <span className="font-medium text-amber-700 block mb-1">◀ 앞 문맥</span>
          {before}
        </div>
        <div className="w-px bg-amber-200/60" />
        <div className="flex-1">
          <span className="font-medium text-amber-700 block mb-1">뒤 문맥 ▶</span>
          {after}
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
  onWordClick: (wordId: string, verse: number) => void
  onVerseClick: (verse: number) => void
}) {
  const isSelected = selectedVerse === verse.verse

  return (
    <div className={`px-5 py-4 transition-colors ${isSelected ? 'bg-green-50/50' : 'hover:bg-paper-50/50'}`}>
      <div className="flex gap-4">
        <button
          onClick={() => onVerseClick(verse.verse)}
          className={`w-8 h-8 rounded-full text-xs font-bold shrink-0 transition-colors ${
            isSelected
              ? 'bg-green-500 text-white shadow-sm'
              : 'bg-paper-150 text-paper-500 hover:bg-paper-200'
          }`}
        >
          {verse.verse}
        </button>
        <div className="flex-1 min-w-0 space-y-2">
          {showTranslations.greek && (
            <div className="flex items-start gap-2">
              <span className="text-[10px] text-paper-400 w-8 shrink-0 mt-1">원문</span>
              <p className="text-sm text-paper-800 leading-relaxed font-greek flex-1">
                {verse.greek.split(' ').map((word, i) => {
                  const matchedEntry = Object.entries(words).find(([_, w]) =>
                    w.lemmaGreek && word.includes(w.lemmaGreek.slice(0, 4))
                  )
                  if (matchedEntry) {
                    return (
                      <button
                        key={i}
                        onClick={() => onWordClick(matchedEntry[0], verse.verse)}
                        className={`hover:text-green-600 transition-colors cursor-pointer border-b border-dotted ${
                          selectedWordId === matchedEntry[0]
                            ? 'text-green-600 border-green-400 bg-green-50 rounded px-0.5'
                            : 'border-paper-300 hover:border-green-400'
                        }`}
                        title={matchedEntry[1].basicMeaning}
                      >
                        {word}{' '}
                      </button>
                    )
                  }
                  return <span key={i}>{word} </span>
                })}
              </p>
            </div>
          )}
          {showTranslations.translit && (
            <p className="text-xs text-paper-400 italic pl-10">{verse.translit}</p>
          )}
          {showTranslations.krv && (
            <div className="flex items-start gap-2">
              <span className="text-[10px] text-paper-400 w-8 shrink-0 mt-0.5">KRV</span>
              <p className="text-sm text-paper-700 leading-relaxed">{verse.korean}</p>
            </div>
          )}
          {showTranslations.niv && (
            <div className="flex items-start gap-2">
              <span className="text-[10px] text-blue-500 w-8 shrink-0 mt-0.5">NIV</span>
              <p className="text-xs text-paper-500 leading-relaxed">{verse.niv}</p>
            </div>
          )}
          {showTranslations.esv && (
            <div className="flex items-start gap-2">
              <span className="text-[10px] text-amber-600 w-8 shrink-0 mt-0.5">ESV</span>
              <p className="text-xs text-paper-500 leading-relaxed">{verse.esv}</p>
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
    <div className="adv-card">
      <div className="adv-card-header">
        <span className="adv-card-title">번역 비교 노트</span>
        <span className="text-[10px] text-paper-400">{notes.length}건</span>
      </div>
      <div className="space-y-3">
        {notes.map((n, i) => (
          <div key={i} className="bg-blue-50/50 border border-blue-100/60 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-medium text-blue-700">{n.verse}절</span>
              <div className="flex gap-1">
                {n.versions.map(v => (
                  <span key={v} className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-blue-200 text-blue-600">
                    {v}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-xs text-paper-600 leading-relaxed">{n.note}</p>
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
    exegetical: 'bg-teal-100 text-teal-700',
    theological: 'bg-gold-100 text-gold-700',
    historical: 'bg-amber-100 text-amber-700',
    pastoral: 'bg-green-100 text-green-700',
  }

  return (
    <div className="adv-card">
      <div className="adv-card-header">
        <span className="adv-card-title">원문 주석</span>
        <span className="text-[10px] text-paper-400">{commentaries.length}건 · 저자 클릭 시 상세 패널</span>
      </div>
      <div className="space-y-4">
        {Object.entries(grouped).map(([verse, comms]) => (
          <div key={verse}>
            <button
              onClick={() => onVerseClick(parseInt(verse))}
              className={`inline-flex items-center gap-1.5 text-xs font-medium mb-2 transition-colors ${
                selectedVerse === parseInt(verse) ? 'text-green-600' : 'text-paper-600 hover:text-green-600'
              }`}
            >
              <span className="w-5 h-5 rounded bg-paper-150 text-[10px] flex items-center justify-center font-bold">{verse}</span>
              절 주석 ({comms.length}건)
            </button>
            <div className="space-y-2">
              {comms.map((c, i) => (
                <div key={i} className="text-xs text-paper-600 leading-relaxed pl-3 border-l-2 border-paper-200">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="font-medium text-paper-700">{c.author}</span>
                    <span className={`text-[10px] px-1 py-0.5 rounded ${typeColor[c.type] || 'bg-paper-150 text-paper-600'}`}>
                      {typeLabel[c.type] || c.type}
                    </span>
                  </div>
                  {c.text.length > 150 ? c.text.slice(0, 150) + '...' : c.text}
                  <p className="text-[10px] text-paper-400 mt-0.5 italic">— {c.source}</p>
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
    <div className="adv-card">
      <div className="adv-card-header">
        <span className="adv-card-title">평행본문 / 관련 본문</span>
      </div>
      <div className="space-y-3">
        {passages.map((p, i) => (
          <div key={i} className="flex gap-3 p-3 rounded-lg hover:bg-paper-100 transition-colors cursor-pointer">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 h-fit shrink-0">
              {relationLabel[p.relation] || p.relation}
            </span>
            <div>
              <span className="text-xs font-medium text-paper-700">{p.ref}</span>
              <p className="text-xs text-paper-600 leading-relaxed mt-0.5">{p.text}</p>
              <p className="text-[11px] text-paper-400 mt-1 italic">{p.description}</p>
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
    <div className="adv-card">
      <div className="adv-card-header">
        <span className="adv-card-title">주제 사전 연결</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {themes.map(t => (
          <button
            key={t.name}
            onClick={() => onThemeClick(t.name)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              selectedTheme === t.name
                ? 'bg-gold-100 border-gold-300 text-gold-700'
                : 'bg-white border-paper-200 text-paper-600 hover:border-gold-300 hover:text-gold-700'
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

/* ─── Study Memo ─── */

function StudyMemoSection({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="adv-card">
      <div className="adv-card-header">
        <span className="adv-card-title">연구 메모</span>
      </div>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="본문을 연구하면서 떠오른 통찰, 질문, 적용 아이디어를 기록하세요..."
        className="w-full min-h-[120px] text-sm text-paper-700 bg-paper-100 rounded-lg p-4 border border-paper-200 outline-none resize-y focus:border-green-300 focus:bg-white transition-colors leading-relaxed"
      />
      <div className="flex justify-between mt-2">
        <div className="flex gap-2">
          <span className="text-[10px] text-paper-400 bg-paper-100 px-2 py-1 rounded">💡 통찰</span>
          <span className="text-[10px] text-paper-400 bg-paper-100 px-2 py-1 rounded">❓ 질문</span>
          <span className="text-[10px] text-paper-400 bg-paper-100 px-2 py-1 rounded">📌 적용</span>
        </div>
        <span className="text-[10px] text-paper-400">{value.length}자</span>
      </div>
    </div>
  )
}

/* ─── Detail Panel ─── */

function DetailPanel({
  data, detailView, selectedWordId, selectedVerse, selectedTheme, onClose,
}: {
  data: BibleStudyData
  detailView: DetailView
  selectedWordId: string | null
  selectedVerse: number | null
  selectedTheme: string | null
  onClose: () => void
}) {
  return (
    <aside className="w-[380px] shrink-0 border-l border-paper-200 bg-white overflow-y-auto scrollbar-thin">
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
    <div className="flex items-center justify-between px-5 py-4 border-b border-paper-200">
      <h3 className="text-xs font-semibold text-paper-500 uppercase tracking-widest">{title}</h3>
      <button onClick={onClose} className="text-paper-400 hover:text-paper-600 p-1">
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
        <div className="text-center py-5 bg-paper-100 rounded-lg">
          <p className="text-2xl font-greek text-paper-800">{word.lemmaGreek}</p>
          <p className="text-sm text-paper-500 mt-1">{word.transliteration || word.pronunciation}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <InfoBox label="Strong 번호" value={word.strong} />
          <InfoBox label="품사" value={word.partOfSpeech} />
          <InfoBox label="발음" value={word.pronunciation} />
          <InfoBox label="형태" value={word.morphology} />
        </div>
        <SectionBox title="기본 의미" className="bg-paper-100">
          {word.basicMeaning}
        </SectionBox>
        <SectionBox title="문맥상 의미" className="bg-green-50 border border-green-100">
          {word.contextualMeaning}
        </SectionBox>
        <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
          <h4 className="text-[11px] font-semibold text-amber-700 mb-1">쉽게 설명하면</h4>
          <p className="text-sm text-amber-800 leading-relaxed">{word.simpleExplanation}</p>
        </div>
        {word.usage.length > 0 && (
          <div>
            <h4 className="text-[11px] font-semibold text-paper-500 uppercase tracking-wider mb-1.5">성경 용례</h4>
            <div className="space-y-1.5">
              {word.usage.map((u, i) => (
                <div key={i} className="text-xs text-paper-600 bg-paper-100 rounded-lg p-2.5">
                  <span className="font-medium text-paper-700">{u.ref}: </span>
                  {u.text}
                </div>
              ))}
            </div>
          </div>
        )}
        {word.sermonNote && (
          <SectionBox title="설교 적용 노트" className="bg-paper-100 border-l-2 border-green-400">
            {word.sermonNote}
          </SectionBox>
        )}
        {word.relatedWords.length > 0 && (
          <div>
            <h4 className="text-[11px] font-semibold text-paper-500 uppercase tracking-wider mb-1.5">관련 원어</h4>
            <div className="flex flex-wrap gap-1.5">
              {word.relatedWords.map(r => (
                <span key={r} className="text-[11px] px-2 py-0.5 rounded bg-paper-150 text-paper-600 font-mono">{r}</span>
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
    exegetical: 'bg-teal-100 text-teal-700',
    theological: 'bg-gold-100 text-gold-700',
    historical: 'bg-amber-100 text-amber-700',
    pastoral: 'bg-green-100 text-green-700',
  }

  return (
    <div>
      <DetailHeader title={`${verse}절 주석`} onClose={onClose} />
      <div className="p-5 space-y-4">
        <div className="bg-paper-100 rounded-lg p-3">
          <p className="text-xs text-paper-600 leading-relaxed">{text}</p>
        </div>
        {commentaries.length > 0 ? (
          <div className="space-y-3">
            {commentaries.map((c, i) => (
              <div key={i} className="bg-white rounded-lg border border-paper-200 p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-medium text-paper-700">{c.author}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${typeColor[c.type] || ''}`}>
                    {typeLabel[c.type] || c.type}
                  </span>
                </div>
                <p className="text-xs text-paper-600 leading-relaxed">{c.text}</p>
                <p className="text-[10px] text-paper-400 mt-1.5 italic">— {c.source}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-paper-400 text-center py-8">
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
  if (!theme) return null
  return (
    <div>
      <DetailHeader title="주제 연결" onClose={onClose} />
      <div className="p-5 space-y-4">
        <div className="text-center py-4">
          <span className="inline-block px-4 py-1.5 rounded-full bg-gold-100 text-gold-700 text-sm font-medium">
            {theme.name}
          </span>
        </div>
        <p className="text-sm text-paper-700 leading-relaxed">{theme.description}</p>
        <div className="flex items-center justify-between text-xs text-paper-500 bg-paper-100 rounded-lg p-3">
          <span>연결된 설교</span>
          <span className="font-medium text-paper-700">{theme.connectedSermons}편</span>
        </div>
        <button className="w-full text-xs text-green-600 border border-green-200 rounded-lg py-2 hover:bg-green-50 transition-colors">
          이 주제로 설교 검색 →
        </button>
      </div>
    </div>
  )
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-paper-100 rounded-lg p-2.5">
      <div className="text-[10px] text-paper-400">{label}</div>
      <div className="text-xs font-medium text-paper-700 mt-0.5">{value}</div>
    </div>
  )
}

function SectionBox({ title, className, children }: { title: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={`rounded-lg p-3 ${className || ''}`}>
      <h4 className="text-[11px] font-semibold text-paper-500 uppercase tracking-wider mb-1.5">{title}</h4>
      <p className="text-sm text-paper-700 leading-relaxed">{children}</p>
    </div>
  )
}
