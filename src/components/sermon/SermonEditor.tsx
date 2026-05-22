import { useState } from 'react'
import { ChevronDown, Target, Search, Globe, ImageIcon, MessageSquare, Lightbulb } from 'lucide-react'

interface SermonEditorProps {
  coreMessage: string
  observationNotes: string
  backgroundNotes: string
  interpretationNotes: string
  illustrationNotes: string
  applicationPoints: string
  onChange: (field: string, value: string) => void
  saving: boolean
}

export default function SermonEditor({
  coreMessage,
  observationNotes,
  backgroundNotes,
  interpretationNotes,
  illustrationNotes,
  applicationPoints,
  onChange,
}: SermonEditorProps) {
  const [openSection, setOpenSection] = useState<string>('core-message')

  const sections = [
    { id: 'core-message', label: '핵심 메시지', icon: Lightbulb, color: 'text-amber-500', bg: 'bg-amber-50', placeholder: '이 설교를 한 문장으로 요약하면?', value: coreMessage, field: 'core_message', tip: '20~40자 권장' },
    { id: 'observation', label: '본문 관찰', icon: Search, color: 'text-blue-500', bg: 'bg-blue-50', placeholder: '본문을 관찰하며 발견한 단어, 반복, 구조를 기록하세요', value: observationNotes, field: 'observation_notes' },
    { id: 'background', label: '배경 연구', icon: Globe, color: 'text-emerald-500', bg: 'bg-emerald-50', placeholder: '역사적/문맥적 배경을 기록하세요', value: backgroundNotes, field: 'background_notes' },
    { id: 'interpretation', label: '해석 메모', icon: MessageSquare, color: 'text-purple-500', bg: 'bg-purple-50', placeholder: '본문의 의미를 해석한 내용', value: interpretationNotes, field: 'interpretation_notes' },
    { id: 'illustration', label: '예화 / 일러스트', icon: ImageIcon, color: 'text-pink-500', bg: 'bg-pink-50', placeholder: '사용할 예화, 이야기, 인용구', value: illustrationNotes, field: 'illustration_notes' },
    { id: 'application', label: '적용 포인트', icon: Target, color: 'text-rose-500', bg: 'bg-rose-50', placeholder: '청중의 삶에 적용할 구체적 포인트', value: applicationPoints, field: 'application_points' },
  ]

  return (
    <div className="glass-panel rounded-2xl p-5 border border-white/60">
      <h3 className="text-[15px] font-extrabold text-slate-800 mb-4 flex items-center gap-2">
        <Target className="w-4 h-4 text-indigo-500" />
        설교 준비 노트
      </h3>
      <div className="space-y-2.5">
        {sections.map(sec => {
          const isOpen = openSection === sec.id
          const Icon = sec.icon
          return (
            <div key={sec.id} className="rounded-xl bg-slate-50/50 border border-slate-200/60 overflow-hidden transition-all duration-200">
              <button
                onClick={() => setOpenSection(isOpen ? '' : sec.id)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white/80 hover:bg-white transition-colors text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg ${sec.bg} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${sec.color}`} />
                  </div>
                  <span className="text-[14px] font-bold text-slate-700">{sec.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {sec.tip && <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">{sec.tip}</span>}
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
              </button>
              {isOpen && (
                <div className="px-4 pb-3 animate-slide-down">
                  <textarea
                    value={sec.value}
                    onChange={e => onChange(sec.field, e.target.value)}
                    placeholder={sec.placeholder}
                    className="w-full min-h-[120px] p-3.5 rounded-xl bg-white border border-slate-200 text-[14px] text-slate-700 placeholder-slate-300 resize-y focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all leading-relaxed"
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
