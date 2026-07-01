'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface SermonDetail {
  id: string
  title: string
  passage: string
  file_name: string
  sermon_date: string
  created_at: string
  book: string | null
  series: string | null
  season: string | null
  result: {
    summary?: {
      title?: string
      passage?: string
      central_topic?: string
      intro?: string
      body?: string
      conclusion?: string
      application?: string
      passage_text?: string
    } | null
    groupDiscussion?: {
      questions?: Array<{ question: string; guide?: string }>
      icebreaker?: string
    } | null
    cardNews?: {
      slides?: Array<{ title: string; content: string }>
    } | null
    sermonScript?: string | null
    shortsScript?: string | null
    pptData?: {
      slides?: Array<{ title: string; content: string }>
    } | null
    hymn_title?: string
    hymn_number?: string
    sermon_title?: string
    sermon_passage?: string
  } | null
}

const SECTIONS = [
  { key: 'summary', label: '📋 요약', has: (r: any) => r?.summary },
  { key: 'groupDiscussion', label: '👥 소그룹 나눔', has: (r: any) => r?.groupDiscussion },
  { key: 'cardNews', label: '🖼️ 카드뉴스', has: (r: any) => r?.cardNews },
  { key: 'sermonScript', label: '📝 설교문', has: (r: any) => r?.sermonScript },
  { key: 'shortsScript', label: '▶️ 유튜브 대본', has: (r: any) => r?.shortsScript },
  { key: 'pptData', label: '📊 PPT 개요', has: (r: any) => r?.pptData },
]

export default function UploadedSermonDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const router = useRouter()
  const [sermon, setSermon] = useState<SermonDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState('summary')

  useEffect(() => {
    const sb = createClient()
    sb.auth.getUser().then(({ data }) => {
      if (!data?.user) {
        router.push('/login?redirect=/dashboard/sermons/uploaded/' + id)
        return
      }
      sb
        .from('sermons')
        .select('id, title, passage, file_name, sermon_date, created_at, book, series, season, result')
        .eq('id', id)
        .eq('user_id', data.user.id)
        .single()
        .then(({ data: d, error }) => {
          if (!error && d) setSermon(d as SermonDetail)
          setLoading(false)
        })
    })
  }, [id, router])

  if (loading) {
    return (
      <div className="animate-fade-in py-12 text-center">
        <p className="text-muted text-sm">로딩 중...</p>
      </div>
    )
  }

  if (!sermon) {
    return (
      <div className="animate-fade-in py-12 text-center">
        <p className="text-muted text-sm mb-4">설교를 찾을 수 없습니다</p>
        <button
          onClick={() => router.push('/dashboard/sermons/uploaded')}
          className="text-sm bg-primary hover:bg-primary-dark text-white px-5 py-2 rounded-md transition-colors"
        >
          ← 목록으로
        </button>
      </div>
    )
  }

  const result = sermon.result || {}
  const displayTitle = result.sermon_title || sermon.title || sermon.file_name?.replace(/\.[^.]+$/, '') || '제목 없음'
  const displayPassage = result.sermon_passage || sermon.passage || ''

  const availableSections = SECTIONS.filter(s => s.has(result))
  if (availableSections.length > 0 && !availableSections.find(s => s.key === activeSection)) {
    setActiveSection(availableSections[0].key)
  }

  return (
    <div className="animate-fade-in space-y-6 max-w-5xl">
      <button
        onClick={() => router.push('/dashboard/sermons/uploaded')}
        className="text-sm text-muted hover:text-foreground transition-colors"
      >
        ← 업로드된 설교 목록
      </button>

      <div className="bg-surface border border-border rounded-lg p-6">
        <h1 className="text-2xl font-bold text-foreground">{displayTitle}</h1>
        {displayPassage && (
          <p className="text-lg text-primary mt-2">{displayPassage}</p>
        )}
        <div className="flex items-center gap-3 mt-3 text-sm text-muted">
          <span>{new Date(sermon.created_at).toLocaleDateString('ko-KR')}</span>
          {sermon.season && <span>· {sermon.season}</span>}
          {sermon.series && <span>· {sermon.series}</span>}
        </div>
      </div>

      {availableSections.length === 0 ? (
        <div className="bg-surface border border-border rounded-lg p-12 text-center">
          <p className="text-muted text-sm">아직 분석 결과가 없습니다</p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 flex-wrap">
            {availableSections.map(s => (
              <button
                key={s.key}
                onClick={() => setActiveSection(s.key)}
                className={`text-sm px-4 py-2 rounded-md transition-colors ${
                  activeSection === s.key
                    ? 'bg-primary text-white'
                    : 'bg-surface border border-border text-muted hover:text-foreground'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="bg-surface border border-border rounded-lg p-6">
            {activeSection === 'summary' && result.summary && (
              <div className="space-y-5">
                {result.summary.central_topic && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted mb-2">중심 주제</h3>
                    <p className="text-base text-foreground">{result.summary.central_topic}</p>
                  </div>
                )}
                {result.summary.intro && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted mb-2">서론</h3>
                    <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{result.summary.intro}</p>
                  </div>
                )}
                {result.summary.body && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted mb-2">본론</h3>
                    <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{result.summary.body}</p>
                  </div>
                )}
                {result.summary.conclusion && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted mb-2">결론</h3>
                    <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{result.summary.conclusion}</p>
                  </div>
                )}
                {result.summary.application && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted mb-2">적용</h3>
                    <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{result.summary.application}</p>
                  </div>
                )}
                {result.summary.passage_text && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted mb-2">성경 본문</h3>
                    <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap italic">{result.summary.passage_text}</p>
                  </div>
                )}
              </div>
            )}

            {activeSection === 'groupDiscussion' && result.groupDiscussion && (
              <div className="space-y-5">
                {result.groupDiscussion.icebreaker && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted mb-2">아이스브레이커</h3>
                    <p className="text-sm leading-relaxed text-foreground">{result.groupDiscussion.icebreaker}</p>
                  </div>
                )}
                {result.groupDiscussion.questions && result.groupDiscussion.questions.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted mb-3">나눔 질문</h3>
                    <div className="space-y-3">
                      {result.groupDiscussion.questions.map((q, i) => (
                        <div key={i} className="bg-background rounded-lg p-4">
                          <p className="text-sm font-medium text-foreground">Q{i + 1}. {q.question}</p>
                          {q.guide && (
                            <p className="text-xs text-muted mt-1">{q.guide}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeSection === 'cardNews' && result.cardNews && (
              <div className="space-y-4">
                {result.cardNews.slides && result.cardNews.slides.map((slide, i) => (
                  <div key={i} className="bg-background rounded-lg p-5 border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Slide {i + 1}</span>
                      <h4 className="text-sm font-semibold text-foreground">{slide.title}</h4>
                    </div>
                    <p className="text-sm text-muted leading-relaxed whitespace-pre-wrap">{slide.content}</p>
                  </div>
                ))}
              </div>
            )}

            {activeSection === 'sermonScript' && result.sermonScript && (
              <div className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                {result.sermonScript}
              </div>
            )}

            {activeSection === 'shortsScript' && result.shortsScript && (
              <div className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                {result.shortsScript}
              </div>
            )}

            {activeSection === 'pptData' && result.pptData && (
              <div className="space-y-4">
                {result.pptData.slides && result.pptData.slides.map((slide, i) => (
                  <div key={i} className="bg-background rounded-lg p-5 border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Slide {i + 1}</span>
                      <h4 className="text-sm font-semibold text-foreground">{slide.title}</h4>
                    </div>
                    <p className="text-sm text-muted leading-relaxed whitespace-pre-wrap">{slide.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
