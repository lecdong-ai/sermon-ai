import { Sparkles, Lightbulb, ListOrdered, MessageSquare, FileText, Clock, AlertTriangle, X, Check } from 'lucide-react'

interface SermonAIResultProps {
  type: string
  data: any
  onClose: () => void
  onSelect?: (type: string, value: any) => void
}

export default function SermonAIResult({ type, data, onClose, onSelect }: SermonAIResultProps) {
  if (!data) return null

  const renderCoreMessage = () => {
    const candidates = data.candidates || []
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          <span className="text-[13px] font-bold text-slate-700">핵심 메시지 후보</span>
        </div>
        {candidates.map((c: any, i: number) => (
          <div key={i} className="p-4 rounded-xl bg-white border border-slate-200 hover:border-indigo-200 transition-all">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                <span className="text-[13px] font-bold text-white">{i + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-bold text-slate-800 mb-1">{c.message}</p>
                <p className="text-[13px] text-slate-500 mb-2 leading-relaxed">{c.description}</p>
                <div className="flex items-start gap-2 text-[12px] text-slate-400 bg-slate-50 rounded-lg p-2.5">
                  <span className="font-bold text-indigo-600 shrink-0">본문 근거:</span>
                  <span>{c.bible_basis}</span>
                </div>
                {c.caution && (
                  <div className="flex items-start gap-1.5 mt-2 p-2.5 rounded-lg bg-amber-50 text-[12px] text-amber-800 border border-amber-200">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{c.caution}</span>
                  </div>
                )}
                {onSelect && (
                  <button
                    onClick={() => onSelect(type, c)}
                    className="mt-3 w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 text-[13px] font-bold hover:from-amber-100 hover:to-orange-100 transition-all border border-amber-200/50 active:scale-[0.98] flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    이 메시지 선택하기
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderOutline = () => {
    const candidates = data.candidates || []
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <ListOrdered className="w-4 h-4 text-blue-500" />
          <span className="text-[13px] font-bold text-slate-700">설교 개요 후보</span>
        </div>
        {candidates.map((cand: any, ci: number) => (
          <div key={ci} className="p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-200 transition-all">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <span className="text-[11px] font-bold text-white">{ci + 1}</span>
              </div>
              <span className="text-[14px] font-bold text-slate-700">{cand.title}</span>
            </div>
            {cand.introduction_suggestion && (
              <div className="mb-2 p-3 rounded-xl bg-blue-50/50 border border-blue-100">
                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-1">서론</p>
                <p className="text-[12px] text-slate-600 leading-relaxed">{cand.introduction_suggestion}</p>
              </div>
            )}
            {(cand.main_points || []).map((p: any, i: number) => (
              <div key={i} className="mb-2 pl-3 border-l-[3px] border-blue-300 py-1.5">
                <p className="text-[12px] font-bold text-slate-700">{p.title}</p>
                <p className="text-[11px] text-slate-500">{p.key_idea}</p>
              </div>
            ))}
            {cand.conclusion_suggestion && (
              <div className="mt-2 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mb-1">결론</p>
                <p className="text-[12px] text-slate-600 leading-relaxed">{cand.conclusion_suggestion}</p>
              </div>
            )}
            {onSelect && (
              <button
                onClick={() => onSelect(type, cand)}
                className="mt-3 w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-[13px] font-bold hover:from-blue-100 hover:to-indigo-100 transition-all border border-blue-200/50 active:scale-[0.98] flex items-center justify-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                이 개요 선택하기
              </button>
            )}
          </div>
        ))}
      </div>
    )
  }

  const renderApplication = () => {
    const candidates = data.candidates || []
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <MessageSquare className="w-4 h-4 text-emerald-500" />
          <span className="text-[13px] font-bold text-slate-700">적용 질문 후보</span>
        </div>
        {candidates.map((cand: any, ci: number) => (
          <div key={ci} className="p-4 rounded-xl bg-white border border-slate-200 hover:border-emerald-200 transition-all">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                <span className="text-[11px] font-bold text-white">{ci + 1}</span>
              </div>
              <span className="text-[14px] font-bold text-slate-700">{cand.title}</span>
            </div>
            {(cand.applications || []).map((a: any, i: number) => (
              <div key={i} className="mb-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="inline-block text-[10px] px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 font-bold mb-1.5">{a.audience}</span>
                <p className="text-[12px] text-slate-600 mb-1 leading-relaxed">{a.question}</p>
                {a.action_plan && (
                  <p className="text-[11px] text-slate-400"><span className="font-medium text-slate-500">실천:</span> {a.action_plan}</p>
                )}
              </div>
            ))}
            {onSelect && (
              <button
                onClick={() => onSelect(type, cand)}
                className="mt-3 w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 text-[13px] font-bold hover:from-emerald-100 hover:to-green-100 transition-all border border-emerald-200/50 active:scale-[0.98] flex items-center justify-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                이 적용 선택하기
              </button>
            )}
          </div>
        ))}
      </div>
    )
  }

  const renderDraft = () => {
    const sections = data.sections || []
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-500" />
            <span className="text-[13px] font-bold text-slate-700">설교문 초안</span>
          </div>
          {data.estimated_duration_minutes && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 text-[11px] font-medium text-purple-600">
              <Clock className="w-3 h-3" />
              약 {data.estimated_duration_minutes}분
            </div>
          )}
        </div>
        {sections.map((s: any, i: number) => {
          const labels: Record<string, string> = { introduction: '서론', body: '본론', conclusion: '결론' }
          const colors: Record<string, string> = {
            introduction: 'bg-blue-500',
            body: 'bg-purple-500',
            conclusion: 'bg-emerald-500',
          }
          return (
            <div key={i} className="p-4 rounded-xl bg-white border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${colors[s.type] || 'bg-slate-400'}`} />
                <span className="text-[11px] font-bold text-slate-500">{labels[s.type] || s.type}</span>
              </div>
              <p className="text-[13px] text-slate-600 whitespace-pre-wrap leading-relaxed">{s.content}</p>
            </div>
          )
        })}
        {data.abstract_phrases?.length > 0 && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
            <div className="flex items-center gap-1.5 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span className="text-[12px] font-bold text-amber-800">추상 표현 제안</span>
            </div>
            {data.abstract_phrases.map((p: any, i: number) => (
              <div key={i} className="mb-2 last:mb-0 text-[12px] p-2.5 rounded-lg bg-white/50">
                <p className="text-amber-800"><span className="font-medium">원문:</span> {p.original}</p>
                <p className="text-amber-700"><span className="font-medium">제안:</span> {p.suggestion}</p>
                {p.reason && <p className="text-amber-600 text-[11px] mt-0.5">{p.reason}</p>}
              </div>
            ))}
          </div>
        )}
        {onSelect && (
          <button
            onClick={() => onSelect(type, data)}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-[13px] font-bold hover:shadow-lg hover:shadow-indigo-200/50 transition-all active:scale-[0.98]"
          >
            이 초안을 원고에 적용하기
          </button>
        )}
        {data.full_text && (
          <div className="p-4 rounded-xl bg-white border border-slate-200">
            <p className="text-[11px] font-bold text-slate-400 mb-2 tracking-wider uppercase">전체 원문</p>
            <p className="text-[13px] text-slate-600 whitespace-pre-wrap leading-relaxed max-h-[400px] overflow-y-auto">{data.full_text}</p>
          </div>
        )}
      </div>
    )
  }

  const renderByType = () => {
    switch (type) {
      case 'generate-core-message': return renderCoreMessage()
      case 'generate-outline': return renderOutline()
      case 'generate-application': return renderApplication()
      case 'generate-draft': return renderDraft()
      default: return <pre className="text-[12px] text-slate-700 whitespace-pre-wrap bg-slate-50 rounded-xl p-4">{JSON.stringify(data, null, 2)}</pre>
    }
  }

  return (
    <div className="rounded-2xl border border-indigo-200/60 bg-gradient-to-br from-indigo-50/50 to-blue-50/30 p-5 animate-scale">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-sm">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-[15px] font-extrabold text-indigo-700">AI 생성 결과</span>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-xl bg-white/80 hover:bg-white flex items-center justify-center transition-all text-slate-400 hover:text-slate-600 border border-slate-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      {renderByType()}
    </div>
  )
}
