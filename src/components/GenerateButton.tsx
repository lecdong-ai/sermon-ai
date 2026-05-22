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
    <div className="rounded-2xl border border-[#e5e8eb] bg-white p-6 shadow-sm animate-scale text-center">
      {status === 'generating' ? (
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-2 border-[#e5e8eb]" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary-500 animate-spin" />
          </div>
          <p className="text-[16px] text-[#4e5968] font-medium">생성 중...</p>
        </div>
      ) : status === 'error' ? (
        <div className="space-y-3">
          <p className="text-[15px] text-red-600">{error || '생성 중 오류가 발생했습니다.'}</p>
          <button
            onClick={() => onRetry(itemId)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2.5 text-[15px] font-medium hover:shadow-md hover:shadow-red-200 transition-all duration-200"
          >
            <RefreshCw className="w-4 h-4" />
            다시 시도
          </button>
        </div>
      ) : (
        <button
          onClick={() => onGenerate(itemId)}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white px-5 py-3 text-[16px] font-bold hover:shadow-md hover:shadow-primary-200 hover:-translate-y-0.5 transition-all duration-200"
        >
          <Sparkles className="w-4 h-4" />
          {label} 생성하기
        </button>
      )}
    </div>
  )
}
