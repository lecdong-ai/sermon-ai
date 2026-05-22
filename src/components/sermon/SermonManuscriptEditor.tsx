import { Clock, FileText } from 'lucide-react'

interface SermonManuscriptEditorProps {
  manuscript: string
  onChange: (value: string) => void
}

export default function SermonManuscriptEditor({ manuscript, onChange }: SermonManuscriptEditorProps) {
  const charCount = manuscript.replace(/\s/g, '').length
  const estimatedMinutes = Math.round(charCount / 375)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-extrabold text-slate-800">설교 원고</h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-[12px] font-medium text-slate-500">
            <FileText className="w-3.5 h-3.5" />
            {charCount.toLocaleString()}자
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-[12px] font-medium text-indigo-600">
            <Clock className="w-3.5 h-3.5" />
            약 {estimatedMinutes}분
          </div>
        </div>
      </div>
      <textarea
        value={manuscript}
        onChange={e => onChange(e.target.value)}
        placeholder="설교 원고를 작성하세요..."
        className="w-full min-h-[500px] p-5 rounded-2xl bg-white border border-slate-200 text-[15px] text-slate-700 leading-[1.9] placeholder-slate-300 resize-y focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all"
      />
    </div>
  )
}
