import { GenerationItem } from '@/types'
import { Sparkles, RefreshCw } from 'lucide-react'

interface Props {
  itemId: GenerationItem
  label: string
  status: 'idle' | 'generating' | 'done' | 'error'
  error?: string
  onGenerate: (item: GenerationItem) => void
  onRetry: (item: GenerationItem) => void
}

export default function GenerateButton({ itemId, label, status, error, onGenerate, onRetry }: Props) {
  if (status === 'done') return null

  return (
    <div className="rounded-xl border border-[#e4e2dd] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] text-center">
      {status === 'generating' ? (
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-2 border-[#e4e2dd]" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#8d7a5b] animate-spin" />
          </div>
          <p className="text-[14px] text-[#6b6764] font-medium">생성 중...</p>
        </div>
      ) : status === 'error' ? (
        <div className="space-y-3">
          <p className="text-[14px] text-red-600 font-medium">{error || '생성 중 오류가 발생했습니다.'}</p>
          <button
            onClick={() => onRetry(itemId)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#a94442] text-white px-4 py-2 text-[14px] font-medium hover:bg-[#8c3635] transition-all duration-200"
          >
            <RefreshCw className="w-4 h-4" />
            다시 시도
          </button>
        </div>
      ) : (
        <button
          onClick={() => onGenerate(itemId)}
          className="inline-flex items-center gap-2 rounded-lg bg-[#8d7a5b] text-white px-5 py-2.5 text-[15px] font-semibold hover:bg-[#7a694e] transition-all duration-200"
        >
          <Sparkles className="w-4 h-4" />
          {label} 생성하기
        </button>
      )}
    </div>
  )
}
