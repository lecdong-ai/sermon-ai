import { Plus, Trash2, GripVertical } from 'lucide-react'
import type { SermonOutline, SermonMainPoint } from '@/types'

interface SermonOutlineEditorProps {
  outline: SermonOutline | null
  onChange: (outline: SermonOutline) => void
}

export default function SermonOutlineEditor({ outline, onChange }: SermonOutlineEditorProps) {
  const points = outline?.main_points || []
  const introduction = outline?.introduction || ''
  const conclusion = outline?.conclusion || ''

  const updateIntroduction = (val: string) => {
    onChange({ introduction: val, main_points: points, conclusion })
  }

  const updateConclusion = (val: string) => {
    onChange({ introduction, main_points: points, conclusion: val })
  }

  const updatePoint = (index: number, field: keyof SermonMainPoint, val: any) => {
    const newPoints = [...points]
    newPoints[index] = { ...newPoints[index], [field]: val }
    onChange({ introduction, main_points: newPoints, conclusion })
  }

  const addPoint = () => {
    const newPoints = [...points, { title: '', content: '' }]
    onChange({ introduction, main_points: newPoints, conclusion })
  }

  const removePoint = (index: number) => {
    const newPoints = points.filter((_, i) => i !== index)
    onChange({ introduction, main_points: newPoints, conclusion })
  }

  return (
    <div className="space-y-5">
      <h3 className="text-[15px] font-extrabold text-white/90">설교 개요</h3>

      {/* Introduction */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shrink-0">
            <span className="text-[11px] font-bold text-white">서</span>
          </div>
          <span className="text-[13px] font-bold text-white/60">서론</span>
        </div>
        <textarea
          value={introduction}
          onChange={e => updateIntroduction(e.target.value)}
          placeholder="서론을 입력하세요"
          className="w-full min-h-[80px] px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-[14px] text-white/80 placeholder-white/20 resize-y focus:outline-none focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/10 transition-all"
        />
      </div>

      {/* Main points */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center shrink-0">
              <span className="text-[11px] font-bold text-white">본</span>
            </div>
            <span className="text-[13px] font-bold text-white/60">본론</span>
          </div>
          <button
            onClick={addPoint}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-300 text-[12px] font-bold hover:bg-indigo-500/20 transition-all active:scale-95 border border-indigo-500/10"
          >
            <Plus className="w-3.5 h-3.5" />
            포인트 추가
          </button>
        </div>
        <div className="space-y-3">
          {points.map((point, i) => (
            <div key={i} className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:border-indigo-500/20 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-white/20" />
                  <span className="text-[11px] font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/10">포인트 {i + 1}</span>
                </div>
                <button
                  onClick={() => removePoint(i)}
                  className="w-7 h-7 rounded-lg hover:bg-rose-500/10 flex items-center justify-center transition-all text-white/30 hover:text-rose-300"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <input
                value={point.title}
                onChange={e => updatePoint(i, 'title', e.target.value)}
                placeholder="소제목"
                className="w-full mb-2 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[14px] font-bold text-white/80 placeholder-white/20 focus:outline-none focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/10 transition-all"
              />
              <textarea
                value={point.content}
                onChange={e => updatePoint(i, 'content', e.target.value)}
                placeholder="내용을 입력하세요"
                className="w-full min-h-[80px] px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[14px] text-white/80 placeholder-white/20 resize-y focus:outline-none focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/10 transition-all"
              />
              <div className="grid grid-cols-2 gap-2 mt-2">
                <input
                  value={point.sub_points?.join(', ') || ''}
                  onChange={e => updatePoint(i, 'sub_points', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                  placeholder="세부 포인트 (쉼표로 구분)"
                  className="px-2.5 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[12px] text-white/60 placeholder-white/20 focus:outline-none focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                />
                <input
                  value={point.application || ''}
                  onChange={e => updatePoint(i, 'application', e.target.value)}
                  placeholder="적용"
                  className="px-2.5 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[12px] text-white/60 placeholder-white/20 focus:outline-none focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                />
              </div>
            </div>
          ))}
          {points.length === 0 && (
            <div className="text-center py-8 text-white/30 text-[13px] font-medium">
              아직 포인트가 없습니다. &quot;포인트 추가&quot; 버튼을 눌러주세요.
            </div>
          )}
        </div>
      </div>

      {/* Conclusion */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shrink-0">
            <span className="text-[11px] font-bold text-white">결</span>
          </div>
          <span className="text-[13px] font-bold text-white/60">결론</span>
        </div>
        <textarea
          value={conclusion}
          onChange={e => updateConclusion(e.target.value)}
          placeholder="결론을 입력하세요"
          className="w-full min-h-[80px] px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-[14px] text-white/80 placeholder-white/20 resize-y focus:outline-none focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/10 transition-all"
        />
      </div>
    </div>
  )
}
