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
          <Lightbulb className="w-4 h-4 text-amber-300" />
          <span className="text-[13px] font-bold text-white/70">핵심 메시지 후보</span>
        </div>
        {candidates.map((c: any, i: number) => (
          <div key={i} className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:border-amber-500/20 transition-all">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                <span className="text-[13px] font-bold text-white">{i + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-bold text-white/90 mb-1">{c.message}</p>
                <p className="text-[13px] text-white/50 mb-2 leading-relaxed">{c.description}</p>
                <div className="flex items-start gap-2 text-[12px] text-white/40 bg-white/[0.04] rounded-lg p-2.5 border border-white/[0.06]">
                  <span className="font-bold text-indigo-300 shrink-0">본문 근거:</span>
                  <span>{c.bible_basis}</span>
                </div>
                {c.caution && (
                  <div className="flex items-start gap-1.5 mt-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[12px] text-amber-200">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{c.caution}</span>
                  </div>
                )}
                {onSelect && (
                  <button
                    onClick={() => onSelect(type, c)}
                    className="mt-3 w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-200 text-[13px] font-bold hover:from-amber-500/20 hover:to-orange-500/20 transition-all border border-amber-500/20 active:scale-[0.98] flex items-center justify-center gap-1.5"
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
          <ListOrdered className="w-4 h-4 text-blue-300" />
          <span className="text-[13px] font-bold text-white/70">설교 개요 후보</span>
        </div>
        {candidates.map((cand: any, ci: number) => (
          <div key={ci} className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:border-blue-500/20 transition-all">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                <span className="text-[11px] font-bold text-white">{ci + 1}</span>
              </div>
              <span className="text-[14px] font-bold text-white/80">{cand.title}</span>
            </div>
            {cand.introduction_suggestion && (
              <div className="mb-2 p-3 rounded-xl bg-blue-500/5 border border-blue-500/20">
                <p className="text-[10px] font-bold text-blue-300 uppercase tracking-wider mb-1">서론</p>
                <p className="text-[12px] text-white/60 leading-relaxed">{cand.introduction_suggestion}</p>
              </div>
            )}
            {(cand.main_points || []).map((p: any, i: number) => (
              <div key={i} className="mb-2 pl-3 border-l-[3px] border-blue-500/30 py-1.5">
                <p className="text-[12px] font-bold text-white/80">{p.title}</p>
                <p className="text-[11px] text-white/50">{p.key_idea}</p>
              </div>
            ))}
            {cand.conclusion_suggestion && (
              <div className="mt-2 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider mb-1">결론</p>
                <p className="text-[12px] text-white/60 leading-relaxed">{cand.conclusion_suggestion}</p>
              </div>
            )}
            {onSelect && (
              <button
                onClick={() => onSelect(type, cand)}
                className="mt-3 w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-200 text-[13px] font-bold hover:from-blue-500/20 hover:to-indigo-500/20 transition-all border border-blue-500/20 active:scale-[0.98] flex items-center justify-center gap-1.5"
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
          <MessageSquare className="w-4 h-4 text-emerald-300" />
          <span className="text-[13px] font-bold text-white/70">적용 질문 후보</span>
        </div>
        {candidates.map((cand: any, ci: number) => (
          <div key={ci} className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:border-emerald-500/20 transition-all">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center">
                <span className="text-[11px] font-bold text-white">{ci + 1}</span>
              </div>
              <span className="text-[14px] font-bold text-white/80">{cand.title}</span>
            </div>
            {(cand.applications || []).map((a: any, i: number) => (
              <div key={i} className="mb-2 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                <span className="inline-block text-[10px] px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-300 font-bold mb-1.5 border border-emerald-500/20">{a.audience}</span>
                <p className="text-[12px] text-white/60 mb-1 leading-relaxed">{a.question}</p>
                {a.action_plan && (
                  <p className="text-[11px] text-white/40"><span className="font-medium text-white/60">실천:</span> {a.action_plan}</p>
                )}
              </div>
            ))}
            {onSelect && (
              <button
                onClick={() => onSelect(type, cand)}
                className="mt-3 w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500/10 to-green-500/10 text-emerald-200 text-[13px] font-bold hover:from-emerald-500/20 hover:to-green-500/20 transition-all border border-emerald-500/20 active:scale-[0.98] flex items-center justify-center gap-1.5"
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
            <FileText className="w-4 h-4 text-purple-300" />
            <span className="text-[13px] font-bold text-white/70">설교문 초안</span>
          </div>
          {data.estimated_duration_minutes && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-[11px] font-medium text-purple-200">
              <Clock className="w-3 h-3" />
              약 {data.estimated_duration_minutes}분
            </div>
          )}
        </div>
        {sections.map((s: any, i: number) => {
          const labels: Record<string, string> = { introduction: '서론', body: '본론', conclusion: '결론' }
          const colors: Record<string, string> = {
            introduction: 'bg-blue-400',
            body: 'bg-purple-400',
            conclusion: 'bg-emerald-400',
          }
          return (
            <div key={i} className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.06]">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${colors[s.type] || 'bg-white/30'}`} />
                <span className="text-[11px] font-bold text-white/50">{labels[s.type] || s.type}</span>
              </div>
              <p className="text-[13px] text-white/60 whitespace-pre-wrap leading-relaxed">{s.content}</p>
            </div>
          )
        })}
        {data.abstract_phrases?.length > 0 && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center gap-1.5 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-300" />
              <span className="text-[12px] font-bold text-amber-200">추상 표현 제안</span>
            </div>
            {data.abstract_phrases.map((p: any, i: number) => (
              <div key={i} className="mb-2 last:mb-0 text-[12px] p-2.5 rounded-lg bg-white/[0.04]">
                <p className="text-amber-200"><span className="font-medium">원문:</span> {p.original}</p>
                <p className="text-amber-200/70"><span className="font-medium">제안:</span> {p.suggestion}</p>
                {p.reason && <p className="text-amber-200/50 text-[11px] mt-0.5">{p.reason}</p>}
              </div>
            ))}
          </div>
        )}
        {onSelect && (
          <button
            onClick={() => onSelect(type, data)}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-[13px] font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all active:scale-[0.98]"
          >
            이 초안을 원고에 적용하기
          </button>
        )}
        {data.full_text && (
          <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            <p className="text-[11px] font-bold text-white/40 mb-2 tracking-wider uppercase">전체 원문</p>
            <p className="text-[13px] text-white/60 whitespace-pre-wrap leading-relaxed max-h-[400px] overflow-y-auto">{data.full_text}</p>
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
      default: return <pre className="text-[12px] text-white/60 whitespace-pre-wrap bg-white/[0.04] rounded-xl p-4 border border-white/[0.06]">{JSON.stringify(data, null, 2)}</pre>
    }
  }

  return (
    <div className="rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-indigo-500/20 p-5 animate-scale shadow-[0_8px_32px_-8px_rgba(0,0,0,0.3)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-sm">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-[15px] font-extrabold text-white/80">AI 생성 결과</span>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center transition-all text-white/40 hover:text-white/60 border border-white/[0.06]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      {renderByType()}
    </div>
  )
}
