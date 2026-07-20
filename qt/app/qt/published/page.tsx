import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Container } from '@/components/layout/Container'
import { GenerationTabs } from '@/components/qt/GenerationTabs'
import { GenerationCard } from '@/components/qt/GenerationCard'
import { getGenerationalQts, getGenerations, type Generation, getGenerationLabel } from '@/lib/data/generational-qt'
import { BookOpen, Sparkles } from 'lucide-react'

export const metadata: Metadata = {
  title: '세대별 큐티 자료',
  description: '초등부부터 장년부까지, 각 세대에 맞춘 큐티 자료를 만나보세요.',
}

export default async function GenerationalQtListPage({
  searchParams,
}: {
  searchParams: { generation?: string }
}) {
  const activeGen = searchParams.generation as Generation | undefined
  const items = await getGenerationalQts(activeGen)
  const genLabel = activeGen ? getGenerationLabel(activeGen) : null

  return (
    <Container className="py-10 sm:py-14">
      <div className="space-y-8">
        {/* Header */}
        <header className="space-y-3">
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-display text-foreground">
              {genLabel ? `${genLabel} 큐티 자료` : '세대별 큐티 자료'}
            </h1>
          </div>
          <p className="text-body-lg text-foreground-muted max-w-xl leading-relaxed">
            {genLabel
              ? `${genLabel}을 위한 큐티 자료입니다. 말씀과 함께 성장하는 시간이 되세요.`
              : '각 세대에 맞춘 큐티 자료를 제공합니다. 초등부, 중고등부, 청년부, 장년부 중 선택하여 자료를 내려받으세요.'}
          </p>
        </header>

        {/* Tabs */}
        <Suspense fallback={<div className="h-10" />}>
          <GenerationTabs />
        </Suspense>

        {/* Sub-info bar */}
        <div className="flex items-center justify-between">
          <p className="text-meta text-foreground-subtle">
            총 {items.length}개의 자료
          </p>
          <a
            href="/qt/admin"
            className="text-meta text-accent hover:text-accent/80 transition-colors font-medium"
          >
            관리자 업로드 →
          </a>
        </div>

        {/* Content */}
        {items.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <div className="w-16 h-16 rounded-full bg-accent-soft mx-auto flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-accent/60" />
            </div>
            <div>
              <p className="text-body text-foreground-muted">
                {activeGen
                  ? `아직 ${getGenerationLabel(activeGen)} 큐티 자료가 없습니다`
                  : '아직 업로드된 큐티 자료가 없습니다'}
              </p>
              <p className="text-meta text-foreground-subtle mt-1">
                큐티 자료는 관리자 페이지에서 업로드할 수 있습니다
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-card-gap">
            {items.map((item, idx) => (
              <div key={item.id} className="animate-fade-in-up" style={{ animationDelay: `${idx * 50}ms` }}>
                <GenerationCard item={item} />
              </div>
            ))}
          </div>
        )}

        {/* Features */}
        <div className="pt-8 border-t border-border">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: BookOpen, title: '세대별 맞춤', desc: '각 세대의 눈높이에 맞춘 큐티 자료를 제공합니다' },
              { icon: Sparkles, title: '무료 제공', desc: '모든 큐티 자료는 무료로 다운로드할 수 있습니다' },
              { icon: BookOpen, title: '파일 다운로드', desc: 'PDF, 이미지 파일로 제공되어 출력하거나 공유하기 쉽습니다' },
            ].map((feat, idx) => (
              <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-surface border border-border">
                <div className="w-9 h-9 rounded-lg bg-accent-soft flex items-center justify-center shrink-0">
                  <feat.icon className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <h3 className="text-meta font-semibold text-foreground">{feat.title}</h3>
                  <p className="text-caption text-foreground-muted mt-0.5 leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Container>
  )
}
