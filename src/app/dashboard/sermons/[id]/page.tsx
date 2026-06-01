'use client'

import { useApp } from '@/lib/dashboard/store'
import { useRouter } from 'next/navigation'

export default function SermonDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const { id } = params
  const { state, deleteSermon, getSeries, getTheme, getRelatedSermons } = useApp()
  const router = useRouter()
  const sermon = state.sermons.find((s) => s.id === id)

  if (!sermon) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted">설교를 찾을 수 없습니다</p>
        <button
          onClick={() => router.push('/dashboard/sermons')}
          className="mt-3 text-sm text-primary hover:text-primary-dark"
        >
          ← 목록으로 돌아가기
        </button>
      </div>
    )
  }

  const srs = getSeries(sermon.seriesId)
  const relatedSermons = getRelatedSermons(sermon.id)
  const themes = {
    major: sermon.themeIds
      .map((tid) => state.themes.find((t) => t.id === tid))
      .filter((t) => t?.category === 'major'),
    situation: sermon.themeIds
      .map((tid) => state.themes.find((t) => t.id === tid))
      .filter((t) => t?.category === 'situation'),
    emotion: sermon.themeIds
      .map((tid) => state.themes.find((t) => t.id === tid))
      .filter((t) => t?.category === 'emotion'),
  }

  const relatedByPassage = state.sermons.filter(
    (s) => s.bibleBook === sermon.bibleBook && s.id !== sermon.id
  )
  const relatedBySeason = state.sermons.filter(
    (s) => s.season === sermon.season && s.id !== sermon.id
  )
  const relatedByAudience = state.sermons.filter(
    (s) => s.audience === sermon.audience && s.id !== sermon.id
  )
  const relatedBySeries = state.sermons.filter(
    (s) => s.seriesId === sermon.seriesId && s.id !== sermon.id
  )

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="text-sm text-muted hover:text-foreground transition-colors"
        >
          ← 뒤로
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`/dashboard/sermons/new?edit=${sermon.id}`)}
            className="text-xs border border-border px-3 py-1.5 rounded-md hover:bg-background transition-colors"
          >
            수정
          </button>
          <button
            onClick={async () => {
              if (confirm('정말 삭제하시겠습니까?')) {
                const success = await deleteSermon(sermon.id)
                if (success) {
                  router.push('/dashboard/sermons')
                } else {
                  alert('삭제에 실패했습니다.')
                }
              }
            }}
            className="text-xs border border-red-200 text-red-500 px-3 py-1.5 rounded-md hover:bg-red-50 transition-colors"
          >
            삭제
          </button>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-lg p-6">
        <h1 className="text-2xl font-bold text-foreground">{sermon.title}</h1>
        <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-muted">
          <span>{sermon.date.replace(/-/g, '.')}</span>
          <span>·</span>
          <span>{sermon.sermonType}</span>
          <span>·</span>
          <span>{sermon.audience}</span>
          {sermon.preacher && (
            <>
              <span>·</span>
              <span>{sermon.preacher}</span>
            </>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-surface border border-border rounded-lg p-5">
          <h3 className="text-sm font-semibold text-muted mb-2">본문</h3>
          <p className="text-lg font-medium text-primary">{sermon.normalizedPassage}</p>
          <p className="text-xs text-muted mt-1">{sermon.bibleBook} {sermon.chapterStart}:{sermon.verseStart}-{sermon.chapterEnd}:{sermon.verseEnd}</p>
        </div>

        <div className="bg-surface border border-border rounded-lg p-5">
          <h3 className="text-sm font-semibold text-muted mb-2">핵심 메시지</h3>
          <p className="text-sm leading-relaxed">{sermon.coreMessage}</p>
        </div>

        {(sermon.outlineIntro ||
          sermon.outlinePoint1 ||
          sermon.outlinePoint2 ||
          sermon.outlinePoint3 ||
          sermon.outlineConclusion) && (
          <div className="bg-surface border border-border rounded-lg p-5">
            <h3 className="text-sm font-semibold text-muted mb-3">설교 개요</h3>
            <div className="space-y-3 text-sm leading-relaxed">
              {sermon.outlineIntro && (
                <div>
                  <span className="font-medium text-foreground">서론</span>
                  <p className="text-muted mt-0.5">{sermon.outlineIntro}</p>
                </div>
              )}
              {sermon.outlinePoint1 && (
                <div>
                  <span className="font-medium text-foreground">{sermon.outlinePoint1.split(' — ')[0]}</span>
                  <p className="text-muted mt-0.5">{sermon.outlinePoint1.split(' — ').slice(1).join(' - ')}</p>
                </div>
              )}
              {sermon.outlinePoint2 && (
                <div>
                  <span className="font-medium text-foreground">{sermon.outlinePoint2.split(' — ')[0]}</span>
                  <p className="text-muted mt-0.5">{sermon.outlinePoint2.split(' — ').slice(1).join(' - ')}</p>
                </div>
              )}
              {sermon.outlinePoint3 && (
                <div>
                  <span className="font-medium text-foreground">{sermon.outlinePoint3.split(' — ')[0]}</span>
                  <p className="text-muted mt-0.5">{sermon.outlinePoint3.split(' — ').slice(1).join(' - ')}</p>
                </div>
              )}
              {sermon.outlineConclusion && (
                <div>
                  <span className="font-medium text-foreground">결론</span>
                  <p className="text-muted mt-0.5">{sermon.outlineConclusion}</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-surface border border-border rounded-lg p-5">
          <h3 className="text-sm font-semibold text-muted mb-3">설교문 원고</h3>
          <div className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
            {sermon.manuscript}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {srs && (
          <div className="bg-surface border border-border rounded-lg p-4">
            <h3 className="text-xs font-semibold text-muted mb-2">시리즈</h3>
            <p
              className="text-sm font-medium text-primary cursor-pointer hover:underline"
              onClick={() => router.push(`/dashboard/series/${srs.id}`)}
            >
              {srs.name}
            </p>
            <p className="text-xs text-muted mt-1">{srs.status === 'active' ? '진행 중' : srs.status === 'completed' ? '완료' : '예정'}</p>
          </div>
        )}

        {sermon.season && (
          <div className="bg-surface border border-border rounded-lg p-4">
            <h3 className="text-xs font-semibold text-muted mb-2">절기</h3>
            <p className="text-sm">{sermon.season}</p>
          </div>
        )}

        {themes.major.length > 0 && (
          <div className="bg-surface border border-border rounded-lg p-4">
            <h3 className="text-xs font-semibold text-muted mb-2">대주제 태그</h3>
            <div className="flex flex-wrap gap-1.5">
              {themes.major.map((t) => (
                <span key={t!.id} className="text-[11px] bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full">
                  {t!.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {themes.situation.length > 0 && (
          <div className="bg-surface border border-border rounded-lg p-4">
            <h3 className="text-xs font-semibold text-muted mb-2">상황 태그</h3>
            <div className="flex flex-wrap gap-1.5">
              {themes.situation.map((t) => (
                <span key={t!.id} className="text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                  {t!.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {themes.emotion.length > 0 && (
          <div className="bg-surface border border-border rounded-lg p-4">
            <h3 className="text-xs font-semibold text-muted mb-2">정서 태그</h3>
            <div className="flex flex-wrap gap-1.5">
              {themes.emotion.map((t) => (
                <span key={t!.id} className="text-[11px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
                  {t!.name}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="bg-surface border border-border rounded-lg p-4">
          <h3 className="text-xs font-semibold text-muted mb-2">정보</h3>
          <div className="space-y-1.5 text-xs text-muted">
            <div className="flex justify-between">
              <span>설교자</span>
              <span className="text-foreground">{sermon.preacher}</span>
            </div>
            <div className="flex justify-between">
              <span>등록일</span>
              <span className="text-foreground">{sermon.createdAt.slice(0, 10).replace(/-/g, '.')}</span>
            </div>
            <div className="flex justify-between">
              <span>수정일</span>
              <span className="text-foreground">{sermon.updatedAt.slice(0, 10).replace(/-/g, '.')}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-lg p-5">
        <h3 className="text-sm font-semibold text-muted mb-4">연결 정보</h3>
        <div className="grid grid-cols-3 gap-4">
          {relatedByPassage.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted mb-2">같은 본문 설교 ({relatedByPassage.length})</p>
              <div className="space-y-1">
                {relatedByPassage.map((s) => (
                  <p
                    key={s.id}
                    onClick={() => router.push(`/dashboard/sermons/${s.id}`)}
                    className="text-xs text-primary cursor-pointer hover:underline"
                  >
                    {s.title}
                  </p>
                ))}
              </div>
            </div>
          )}
          {relatedBySeason.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted mb-2">같은 절기 설교 ({relatedBySeason.length})</p>
              <div className="space-y-1">
                {relatedBySeason.map((s) => (
                  <p
                    key={s.id}
                    onClick={() => router.push(`/dashboard/sermons/${s.id}`)}
                    className="text-xs text-primary cursor-pointer hover:underline"
                  >
                    {s.title}
                  </p>
                ))}
              </div>
            </div>
          )}
          {relatedByAudience.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted mb-2">같은 회중 설교 ({relatedByAudience.length})</p>
              <div className="space-y-1">
                {relatedByAudience.map((s) => (
                  <p
                    key={s.id}
                    onClick={() => router.push(`/dashboard/sermons/${s.id}`)}
                    className="text-xs text-primary cursor-pointer hover:underline"
                  >
                    {s.title}
                  </p>
                ))}
              </div>
            </div>
          )}
          {relatedBySeries.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted mb-2">같은 시리즈 설교 ({relatedBySeries.length})</p>
              <div className="space-y-1">
                {relatedBySeries.map((s) => (
                  <p
                    key={s.id}
                    onClick={() => router.push(`/dashboard/sermons/${s.id}`)}
                    className="text-xs text-primary cursor-pointer hover:underline"
                  >
                    {s.title}
                  </p>
                ))}
              </div>
            </div>
          )}
          {relatedSermons.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted mb-2">수동 관련 설교 ({relatedSermons.length})</p>
              <div className="space-y-1">
                {relatedSermons.map((s) => (
                  <p
                    key={s.id}
                    onClick={() => router.push(`/dashboard/sermons/${s.id}`)}
                    className="text-xs text-primary cursor-pointer hover:underline"
                  >
                    {s.title}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => router.push(`/dashboard/graph?focus=${sermon.id}`)}
        className="w-full text-sm bg-background border border-border text-muted hover:text-foreground hover:border-primary/30 rounded-lg py-3 transition-colors text-center"
      >
        이 설교를 그래프로 보기 →
      </button>
    </div>
  )
}
