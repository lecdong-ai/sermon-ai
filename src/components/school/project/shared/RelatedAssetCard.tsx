'use client'

import { useRouter } from 'next/navigation'

export interface RelatedAsset {
  id: string
  title: string
  subtitle?: string
  type: 'archive' | 'note' | 'project' | 'series' | 'passage'
  href: string
  meta?: string
}

const TYPE_STYLES: Record<string, string> = {
  archive: 'bg-paper-150 text-paper-600',
  note: 'bg-emerald-100 text-emerald-700',
  project: 'bg-amber-100 text-amber-700',
  series: 'bg-navy-100 text-navy-700',
  passage: 'bg-green-100 text-green-700',
}

const TYPE_LABELS: Record<string, string> = {
  archive: '아카이브',
  note: '노트',
  project: '프로젝트',
  series: '시리즈',
  passage: '본문',
}

export default function RelatedAssetCard({ asset }: { asset: RelatedAsset }) {
  const router = useRouter()

  return (
    <button
      onClick={() => router.push(asset.href)}
      className="w-full text-left border border-paper-200 rounded-lg p-3 hover:border-green-200 hover:bg-green-50/30 transition-all group"
    >
      <div className="flex items-start gap-2">
        <span className={`text-[9px] px-1.5 py-0.5 rounded shrink-0 mt-0.5 ${TYPE_STYLES[asset.type] || 'bg-paper-100 text-paper-500'}`}>
          {TYPE_LABELS[asset.type] || asset.type}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-medium text-paper-800 line-clamp-1 group-hover:text-green-700 transition-colors">
            {asset.title}
          </div>
          {asset.subtitle && (
            <div className="text-[10px] text-paper-500 mt-0.5 line-clamp-1">{asset.subtitle}</div>
          )}
          {asset.meta && (
            <div className="text-[9px] text-paper-400 mt-0.5">{asset.meta}</div>
          )}
        </div>
      </div>
    </button>
  )
}
