import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Container } from '@/components/layout/Container'
import { getGenerationalQt, formatDate, formatFileSize, getGenerationLabel, type Generation } from '@/lib/data/generational-qt'
import { ArrowLeft, Download, FileText, Image as ImageIcon, FileArchive, Calendar, BookOpen } from 'lucide-react'

interface Props {
  params: { id: string }
}

const GEN_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  '초등': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  '중고등': { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
  '청년': { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
  '장년': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
}

function getFileIcon(type: string) {
  if (type.startsWith('image/')) return ImageIcon
  if (type === 'application/pdf') return FileText
  return FileArchive
}

function getFileColor(type: string) {
  if (type.startsWith('image/')) return 'text-rose-500 bg-rose-50 border-rose-200'
  if (type === 'application/pdf') return 'text-blue-600 bg-blue-50 border-blue-200'
  return 'text-amber-600 bg-amber-50 border-amber-200'
}

export default async function GenerationalQtDetailPage({ params }: Props) {
  const item = await getGenerationalQt(params.id)

  if (!item) {
    notFound()
  }

  const colors = GEN_COLORS[item.generation] || GEN_COLORS['초등']
  const hasFiles = item.files.length > 0

  return (
    <Container className="py-10 sm:py-14">
      <div className="max-w-content mx-auto space-y-8">
        {/* Back link */}
        <Link
          href={`/qt/published${item.generation ? `?generation=${item.generation}` : ''}`}
          className="inline-flex items-center gap-1.5 text-meta text-foreground-subtle hover:text-accent transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          {getGenerationLabel(item.generation)} 큐티 자료 목록
        </Link>

        {/* Header card */}
        <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-elevated">
          {/* Color accent bar */}
          <div className={`h-2 ${colors.bg}`} />

          <div className="p-6 sm:p-8 space-y-6">
            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-[12px] font-semibold border ${colors.bg} ${colors.text} ${colors.border}`}>
                {getGenerationLabel(item.generation)}
              </span>
              {item.week_label && (
                <span className="text-[12px] text-foreground-subtle flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {item.week_label}
                </span>
              )}
              <span className="text-[12px] text-foreground-subtle">
                {formatDate(item.created_at)}
              </span>
            </div>

            {/* Title */}
            <h1 className="font-serif text-display text-foreground leading-snug">
              {item.title}
            </h1>

            {/* Description */}
            {item.description && (
              <p className="text-body-lg text-foreground-muted leading-relaxed">
                {item.description}
              </p>
            )}

            {/* Bible passage */}
            {item.bible_passage && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-accent-soft border border-accent-muted">
                <BookOpen className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <div>
                  <p className="text-meta font-semibold text-accent mb-0.5">말씀 본문</p>
                  <p className="text-body text-foreground font-serif">{item.bible_passage}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Files section */}
        <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-elevated">
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-h2 text-foreground">
                첨부 파일
              </h2>
              {hasFiles && (
                <span className="text-meta text-foreground-subtle">
                  총 {item.files.length}개 파일
                </span>
              )}
            </div>

            {!hasFiles ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 rounded-full bg-surface-2 mx-auto flex items-center justify-center mb-3">
                  <FileText className="w-6 h-6 text-foreground-subtle" />
                </div>
                <p className="text-body text-foreground-muted">첨부된 파일이 없습니다</p>
              </div>
            ) : (
              <div className="space-y-3">
                {item.files.map((file, idx) => {
                  const Icon = getFileIcon(file.type)
                  const fileColor = getFileColor(file.type)
                  const isImage = file.type.startsWith('image/')

                  return (
                    <a
                      key={idx}
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-accent/30 hover:bg-surface-2/50 transition-all group"
                    >
                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 transition-colors ${fileColor} group-hover:scale-105`}>
                        <Icon className="w-5 h-5" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-body font-medium text-foreground truncate group-hover:text-accent transition-colors">
                          {file.name}
                        </p>
                        <p className="text-meta text-foreground-subtle mt-0.5">
                          {formatFileSize(file.size)}
                          {isImage && ' · 이미지'}
                          {file.type === 'application/pdf' && ' · PDF'}
                        </p>
                      </div>

                      {/* Download */}
                      <div className="w-10 h-10 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-foreground-subtle group-hover:bg-accent group-hover:text-white group-hover:border-accent transition-all">
                        <Download className="w-4 h-4" />
                      </div>
                    </a>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </Container>
  )
}
