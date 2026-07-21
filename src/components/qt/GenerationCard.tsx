import Link from 'next/link'
import { FileText, Image, FileArchive, Download, Calendar } from 'lucide-react'
import type { GenerationalQtItem } from '@/lib/data/generational-qt'
import { formatDate, formatFileSize, getGenerationLabel } from '@/lib/data/generational-qt'

const GEN_TAG_COLORS: Record<string, string> = {
  '초등': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  '중고등': 'bg-sky-100 text-sky-700 border-sky-200',
  '청년': 'bg-violet-100 text-violet-700 border-violet-200',
  '장년': 'bg-amber-100 text-amber-700 border-amber-200',
}

function getFileIcon(type: string) {
  if (type.startsWith('image/')) return Image
  if (type === 'application/pdf') return FileText
  return FileArchive
}

export function GenerationCard({ item }: { item: GenerationalQtItem }) {
  const fileCount = item.files.length
  const hasFiles = fileCount > 0
  const tagColor = GEN_TAG_COLORS[item.generation] || 'bg-accent-soft text-accent border-accent-muted'

  return (
    <Link
      href={`/qt/published/${item.id}`}
      className="group block bg-surface rounded-xl border border-border hover:border-accent/30 transition-all duration-300 overflow-hidden hover:shadow-card-hover hover:-translate-y-0.5"
    >
      <div className="p-5 space-y-4">
        {/* 상단: 세대 태그 + 주차 */}
        <div className="flex items-center justify-between gap-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${tagColor}`}>
            {getGenerationLabel(item.generation)}
          </span>
          {item.week_label && (
            <span className="text-[11px] text-foreground-subtle font-medium">{item.week_label}</span>
          )}
        </div>

        {/* 제목 */}
        <div>
          <h3 className="font-serif text-h3 text-foreground leading-snug line-clamp-2 group-hover:text-accent transition-colors duration-200">
            {item.title}
          </h3>
          {item.description && (
            <p className="text-meta text-foreground-muted mt-1 line-clamp-1">{item.description}</p>
          )}
        </div>

        {/* 성경 본문 */}
        {item.bible_passage && (
          <div className="flex items-center gap-1.5 text-[12px] text-foreground-subtle">
            <span className="w-1 h-1 rounded-full bg-accent/40" />
            <span className="font-medium">{item.bible_passage}</span>
          </div>
        )}

        {/* 하단: 파일 정보 + 날짜 */}
        <div className="flex items-center justify-between pt-1 border-t border-border/50">
          <div className="flex items-center gap-3">
            {hasFiles ? (
              <div className="flex items-center gap-1.5 text-[12px] text-foreground-subtle">
                <Download className="w-3.5 h-3.5" />
                <span>파일 {fileCount}개</span>
              </div>
            ) : (
              <span className="text-[12px] text-foreground-subtle">파일 없음</span>
            )}
          </div>
          <div className="flex items-center gap-1 text-[12px] text-foreground-subtle">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(item.created_at)}</span>
          </div>
        </div>

        {/* 파일 미리보기 아이콘들 */}
        {hasFiles && (
          <div className="flex flex-wrap gap-1.5">
            {item.files.slice(0, 4).map((file, idx) => {
              const Icon = getFileIcon(file.type)
              return (
                <div
                  key={idx}
                  className="flex items-center gap-1 px-2 py-1 rounded-md bg-surface-2 text-[10px] text-foreground-subtle"
                  title={`${file.name} (${formatFileSize(file.size)})`}
                >
                  <Icon className="w-3 h-3" />
                  <span className="max-w-[60px] truncate">{file.name}</span>
                </div>
              )
            })}
            {fileCount > 4 && (
              <span className="text-[10px] text-foreground-subtle px-1 self-center">+{fileCount - 4}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}
