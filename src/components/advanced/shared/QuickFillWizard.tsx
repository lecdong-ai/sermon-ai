'use client'

import { useState } from 'react'
import { BookOpen, FileText, Save, Sparkles } from 'lucide-react'
import type { QuickFill } from '@/lib/advanced/stageChecker'
import { saveQuickFill } from '@/lib/advanced/stageChecker'

interface QuickFillWizardProps {
  projectId: string
  initial: QuickFill | null
  passageHint: string
  onSaved: (data: QuickFill) => void
  onCancel: () => void
}

export default function QuickFillWizard({ projectId, initial, passageHint, onSaved, onCancel }: QuickFillWizardProps) {
  const [keyWords, setKeyWords] = useState((initial?.keyWords || []).join(', '))
  const [commentaries, setCommentaries] = useState((initial?.commentaries || ['', '', '']).slice(0, 3).join('\n\n'))
  const [theme, setTheme] = useState(initial?.theme || '')

  const handleSave = () => {
    const kws = keyWords.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 3)
    const cms = commentaries.split(/\n\n+/).map((s) => s.trim()).filter(Boolean).slice(0, 3)
    if (kws.length < 2) return
    if (cms.length < 3) return
    if (!theme.trim()) return
    const data: QuickFill = { keyWords: kws, commentaries: cms, theme: theme.trim(), savedAt: Date.now() }
    saveQuickFill(projectId, { keyWords: data.keyWords, commentaries: data.commentaries, theme: data.theme })
    onSaved(data)
  }

  const kwsCount = keyWords.split(',').filter((s) => s.trim()).length
  const cmsCount = commentaries.split(/\n\n+/).filter((s) => s.trim()).length
  const themeOk = !!theme.trim()
  const allValid = kwsCount >= 2 && cmsCount >= 3 && themeOk

  return (
    <div className="space-y-3">
      {passageHint && (
        <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1.5">
          <BookOpen className="w-3 h-3" />
          <span>{passageHint}</span>
        </div>
      )}

      <Field
        label="핵심 단어 (2개 이상)"
        value={keyWords}
        onChange={setKeyWords}
        placeholder="예: 은혜(χάρις), 순종(ὑπακοή), 믿음(πίστις)"
        hint={`${kwsCount}개 · 쉼표로 구분`}
        valid={kwsCount >= 2}
        required
      />

      <Field
        label="💬 주석 메모 (3개, 빈 줄로 구분)"
        value={commentaries}
        onChange={setCommentaries}
        placeholder={`본문을 보며 떠오른 통찰을 2-3문장씩 적어주세요\n(빈 줄로 구분)\n\n또 다른 통찰\n\n마지막 통찰`}
        hint={`${cmsCount}개 · 빈 줄로 구분`}
        valid={cmsCount >= 3}
        required
        multiline
      />

      <Field
        label="🏷 주제 (1개)"
        value={theme}
        onChange={setTheme}
        placeholder="예: 칭의, 성화, 화목, 사랑"
        valid={themeOk}
        required
      />

      <div className="flex items-center gap-2 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] font-bold transition-colors"
        >
          취소
        </button>
        <button
          onClick={handleSave}
          disabled={!allValid}
          className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-colors disabled:opacity-30 flex items-center justify-center gap-1.5"
        >
          <Save className="w-3.5 h-3.5" />
          저장하고 통과
        </button>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, hint, valid, required, multiline }: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  hint?: string
  valid?: boolean
  required?: boolean
  multiline?: boolean
}) {
  return (
    <div>
      <label className="text-[10px] font-bold text-slate-400 block mb-1">
        {label} {required && <span className="text-amber-400">*</span>}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={5}
          className={`w-full text-[11px] border rounded-lg px-2.5 py-1.5 bg-[#04060f] text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 resize-none font-medium leading-relaxed ${
            valid === false ? 'border-amber-500/40' : 'border-white/10'
          }`}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full text-[11px] border rounded-lg px-2.5 py-1.5 bg-[#04060f] text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 font-medium ${
            valid === false ? 'border-amber-500/40' : 'border-white/10'
          }`}
        />
      )}
      {hint && (
        <p className={`text-[9px] mt-0.5 font-bold ${
          valid ? 'text-emerald-400' : valid === false ? 'text-amber-400' : 'text-slate-500'
        }`}>
          {hint}
        </p>
      )}
    </div>
  )
}
