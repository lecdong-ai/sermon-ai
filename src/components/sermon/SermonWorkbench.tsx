'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Save, Sparkles, Eye, Lightbulb, ListOrdered, FileText,
  MessageSquare, BookOpen, Check, ChevronDown, X, Cross,
  PenLine, Target, Search, Globe, Image as ImageIcon,
  PartyPopper, Trophy, ChevronRight, Zap, Layers, Wand2,
  Lock,
} from 'lucide-react'
import SermonEditor from './SermonEditor'
import SermonOutlineEditor from './SermonOutlineEditor'
import SermonManuscriptEditor from './SermonManuscriptEditor'
import SermonAIResult from './SermonAIResult'
import type { SermonWorkspace, SermonOutline, CoreMessageResult, OutlineResult, DraftResult } from '@/types'

type TabType = 'input' | 'outline' | 'manuscript'

interface SermonWorkbenchProps {
  sermon: SermonWorkspace
  advanced?: boolean
}

export default function SermonWorkbench({ sermon: initial, advanced }: SermonWorkbenchProps) {
  const router = useRouter()
  const [sermon, setSermon] = useState<SermonWorkspace>(initial)
  const [activeTab, setActiveTab] = useState<TabType>('input')
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved')
  const [aiLoading, setAiLoading] = useState<string | null>(null)
  const [aiResult, setAiResult] = useState<any>(null)
  const [showAiResult, setShowAiResult] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [aiType, setAiType] = useState<string>("")
  const [showCoreInput, setShowCoreInput] = useState(false)
  const [showDraftModal, setShowDraftModal] = useState(false)
  const [draftLength, setDraftLength] = useState<'short' | 'medium' | 'long'>('medium')
  const [corePassage, setCorePassage] = useState("")
  const [coreTopic, setCoreTopic] = useState("")
  const [coreStep, setCoreStep] = useState<'input' | 'suggest'>('input')
  const [coreSuggestion, setCoreSuggestion] = useState("")
  const [topicSuggestions, setTopicSuggestions] = useState<{ value: string; reason: string }[]>([])
  const [suggestingTopic, setSuggestingTopic] = useState(false)
  const [completing, setCompleting] = useState(false)
  const isCompleted = sermon.status === 'completed'
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const save = useCallback(async (data: Partial<SermonWorkspace>) => {
    setSaveStatus('saving')
    try {
      const res = await fetch(`/api/sermons/${sermon.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (json.success) {
        setSaveStatus('saved')
      }
    } catch {
      setSaveStatus('unsaved')
    }
  }, [sermon.id])

  const debouncedSave = useCallback((data: Partial<SermonWorkspace>) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setSaveStatus('unsaved')
    debounceRef.current = setTimeout(() => save(data), 2000)
  }, [save])

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const handleFieldChange = (field: string, value: string) => {
    setSermon(prev => ({ ...prev, [field]: value }))
    debouncedSave({ [field]: value })
  }

  const handleOutlineChange = (outline: SermonOutline) => {
    setSermon(prev => ({ ...prev, outline }))
    debouncedSave({ outline })
  }

  const handleManuscriptChange = (manuscript: string) => {
    setSermon(prev => ({ ...prev, manuscript }))
    debouncedSave({ manuscript })
  }

  const handleSaveNow = async () => {
    setSaving(true)
    await save({
      title: sermon.title,
      passage: sermon.passage,
      sermon_date: sermon.sermon_date,
      series: sermon.series,
      church_context: sermon.church_context,
      audience: sermon.audience,
      core_message: sermon.core_message,
      observation_notes: sermon.observation_notes,
      background_notes: sermon.background_notes,
      interpretation_notes: sermon.interpretation_notes,
      illustration_notes: sermon.illustration_notes,
      application_points: sermon.application_points,
      outline: sermon.outline,
      manuscript: sermon.manuscript,
    })
    setSaving(false)
  }

  const callAI = async (endpoint: string, onResult: (data: any) => void) => {
    setAiLoading(endpoint)
    setAiType(endpoint)
    setShowAiResult(false)
    setAiError(null)
    try {
      const res = await fetch(`/api/sermons/${sermon.id}/ai/${endpoint}`, { method: 'POST' })
      const json = await res.json()
      if (json.success) {
        setAiResult(json.data)
        setShowAiResult(true)
        onResult(json.data)
      } else {
        setAiError(json.error || "AI 생성에 실패했습니다.")
      }
    } catch (err: any) {
      setAiError(err.message || "네트워크 오류")
    } finally {
      setAiLoading(null)
    }
  }

  const callAIWithBody = async (endpoint: string, body: any, onResult: (data: any) => void) => {
    setAiLoading(endpoint)
    setAiType(endpoint)
    setShowAiResult(false)
    setAiError(null)
    try {
      const res = await fetch(`/api/sermons/${sermon.id}/ai/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (json.success) {
        setAiResult(json.data)
        setShowAiResult(true)
        onResult(json.data)
      } else {
        setAiError(json.error || "AI 생성에 실패했습니다.")
      }
    } catch (err: any) {
      setAiError(err.message || "네트워크 오류")
    } finally {
      setAiLoading(null)
    }
  }

  const handleCoreMessage = () => {
    setCorePassage(sermon.passage || "")
    setCoreTopic("")
    setCoreStep('input')
    setCoreSuggestion("")
    setTopicSuggestions([])
    setShowCoreInput(true)
  }

  const suggestTopics = async () => {
    if (!corePassage.trim()) return
    setSuggestingTopic(true)
    try {
      const res = await fetch('/api/suggest', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passage: corePassage.trim() }),
      })
      const json = await res.json()
      if (json.success && json.suggestions?.length) setTopicSuggestions(json.suggestions)
    } catch {} finally { setSuggestingTopic(false) }
  }

  const runCoreMessage = () => callAIWithBody('generate-core-message', { passage: corePassage, topic: coreTopic }, (data: CoreMessageResult) => {
    if (data.candidates?.[0]) {
      setSermon(prev => ({ ...prev, core_message: data.candidates[0].message }))
    }
  })

  const handleAIResultSelect = (type: string, value: any) => {
    if (type === 'generate-core-message' && value?.message) {
      handleFieldChange('core_message', value.message)
    }
    if (type === 'generate-outline' && value) {
      const outline = {
        introduction: value.introduction_suggestion,
        main_points: (value.main_points || []).map((p: any) => ({
          title: p.title,
          content: p.key_idea,
          sub_points: p.supporting_verses,
          application: p.application_suggestion,
        })),
        conclusion: value.conclusion_suggestion,
      }
      handleOutlineChange(outline)
    }
    if (type === 'generate-application' && value?.applications) {
      const points = value.applications.map((a: any) => a.question + (a.action_plan ? ' (' + a.action_plan + ')' : '')).join('\n')
      handleFieldChange('application_points', points)
    }
    if (type === 'generate-draft' && value?.full_text) {
      handleFieldChange('manuscript', value.full_text)
    }
    setShowAiResult(false)
  }

  const handleOutline = () => callAI('generate-outline', () => {})
  const handleDraft = () => {
    if (advanced) {
      setAiLoading('generate-draft')
      fetch(`/api/sermons/${sermon.id}/ai/advanced-draft`, { method: 'POST' })
        .then(r => r.json()).then(json => {
          if (json.success && json.data?.full_text) handleFieldChange('manuscript', json.data.full_text)
        }).catch(() => {}).finally(() => setAiLoading(null))
      return
    }
    callAI('generate-draft', (data: DraftResult) => {
      if (data?.full_text) handleFieldChange('manuscript', data.full_text)
    })
  }
  const runDraft = () => {
    setShowDraftModal(false)
    if (advanced) {
      setAiLoading('generate-draft')
      setAiType('generate-draft')
      setShowAiResult(false)
      setAiError(null)
      fetch(`/api/sermons/${sermon.id}/ai/advanced-draft`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draft_length: draftLength }),
      })
        .then(r => r.json()).then(json => {
          if (json.success && json.data?.full_text) {
            const data: DraftResult = { full_text: json.data.full_text, estimated_duration_minutes: 0, sections: [] }
            setAiResult(data)
            setShowAiResult(true)
            handleFieldChange('manuscript', json.data.full_text)
          } else {
            setAiError(json.error || '생성 실패')
          }
        }).catch(() => setAiError('네트워크 오류')).finally(() => setAiLoading(null))
      return
    }
    callAI('generate-draft', (data: DraftResult) => {
      if (data?.full_text) handleFieldChange('manuscript', data.full_text)
    })
  }

  const handleApplication = () => callAI('generate-application', () => {})

  const handleComplete = async () => {
    setCompleting(true)
    try {
      const res = await fetch(`/api/sermons/${sermon.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      })
      const json = await res.json()
      if (json.success) {
        setSermon(prev => ({ ...prev, status: 'completed' }))
      }
    } catch {}
    setCompleting(false)
  }

  const steps = [
    { id: 1, label: '본문 입력', done: !!sermon.passage },
    { id: 2, label: '본문 관찰', done: !!sermon.observation_notes },
    { id: 3, label: '배경 연구', done: !!sermon.background_notes },
    { id: 4, label: '핵심 메시지', done: !!sermon.core_message, ai: 'generate-core-message', action: handleCoreMessage, label2: 'AI 추천' },
    { id: 5, label: '개요 작성', done: !!(sermon.outline?.main_points?.length), ai: 'generate-outline', action: handleOutline, label2: 'AI 생성' },
    { id: 6, label: '적용 정리', done: !!sermon.application_points, ai: 'generate-application', action: handleApplication, label2: 'AI 생성' },
    { id: 7, label: '예화 추가', done: !!sermon.illustration_notes },
    { id: 8, label: '초안 생성', done: !!sermon.manuscript, ai: 'generate-draft', action: () => setShowDraftModal(true), label2: advanced ? 'GPT-4o 초안' : 'AI 초안' },
  ]

  const doneCount = steps.filter(s => s.done).length
  const progress = Math.round((doneCount / steps.length) * 100)

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: 'input', label: '입력', icon: BookOpen },
    { id: 'outline', label: '개요', icon: ListOrdered },
    { id: 'manuscript', label: '원고', icon: FileText },
  ]

  return (
    <div className="relative min-h-screen bg-[#141829]">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] left-[-8%] w-[800px] h-[800px] rounded-full bg-gradient-to-br from-indigo-500/8 via-blue-500/5 to-transparent blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-20%] right-[-8%] w-[700px] h-[700px] rounded-full bg-gradient-to-tr from-purple-500/6 via-indigo-500/4 to-transparent blur-[120px] animate-pulse-slower" />
        <div className="absolute top-[30%] right-[15%] w-[500px] h-[500px] rounded-full bg-gradient-to-bl from-blue-400/4 to-transparent blur-[100px]" />
        <div className="absolute inset-0 bg-grid-tech opacity-[0.03]" />
      </div>

      {/* Sticky header */}
      <header className="sticky top-0 z-30 bg-[#0d0f1a]/80 backdrop-blur-2xl border-b border-white/[0.06] shadow-[0_1px_0_0_rgba(255,255,255,0.04)]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={() => router.push('/sermon')}
              className="w-9 h-9 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.06] flex items-center justify-center transition-all hover:scale-105 active:scale-95 shrink-0"
            >
              <ArrowLeft className="w-4.5 h-4.5 text-white/60" />
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2.5">
                <input
                  value={sermon.title}
                  onChange={e => handleFieldChange('title', e.target.value)}
                  placeholder="설교 제목을 입력하세요"
                  className="text-[18px] font-extrabold text-white bg-transparent border-none focus:outline-none placeholder-white/20 w-full tracking-tight"
                />
                {advanced && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 font-bold border border-amber-500/20 shrink-0">
                    GPT-4o
                  </span>
                )}
                {isCompleted ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    <Trophy className="w-3 h-3" />
                    준비 완료
                  </span>
                ) : (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 transition-all border ${
                    saveStatus === 'saved' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' :
                    saveStatus === 'saving' ? 'bg-blue-500/10 text-blue-300 border-blue-500/20 animate-pulse' :
                    'bg-amber-500/10 text-amber-300 border-amber-500/20'
                  }`}>
                    {saveStatus === 'saved' ? '저장됨' : saveStatus === 'saving' ? '저장 중...' : '수정됨'}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleSaveNow}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.06] text-white/70 hover:text-white text-[13px] font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              저장
            </button>
            <button
              onClick={() => router.push('/sermon/' + sermon.id + '/preview')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-[13px] font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all hover:scale-105 active:scale-95"
            >
              <Eye className="w-4 h-4" />
              미리보기
            </button>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-400/20 to-transparent" />
      </header>

      <div className="max-w-7xl mx-auto flex relative z-10 lg:gap-6">
        {/* Sidebar */}
        <aside className="w-[240px] shrink-0 p-4 lg:pl-0 lg:pr-0 hidden lg:block">
          <div className="sticky top-[76px]">
            <div className="rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] p-4 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.3)]">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-[11px] font-bold tracking-wider text-white/40">진행률</span>
                <span className="text-[12px] font-bold text-indigo-300">{progress}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden mb-5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-blue-400 to-indigo-400 transition-all duration-700 ease-out shadow-[0_0_8px_rgba(99,102,241,0.3)]"
                  style={{ width: progress + '%' }}
                />
              </div>
              <nav className="space-y-0">
                {steps.map((step, i) => (
                  <div key={step.id} className="relative">
                    {i < steps.length - 1 && (
                      <div className={`absolute left-[15px] top-[30px] w-[2px] h-[32px] transition-colors duration-500 ${
                        step.done ? 'bg-indigo-500/30' : 'bg-white/[0.06]'
                      }`} />
                    )}
                    <div className={`relative flex items-center gap-2.5 px-2 py-2 rounded-xl transition-all duration-200 ${
                      step.done ? 'opacity-100' : 'opacity-60'
                    }`}>
                      <div className={`w-[28px] h-[28px] rounded-xl flex items-center justify-center text-[11px] font-bold shrink-0 transition-all duration-300 ${
                        step.done
                          ? 'bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/20'
                          : 'bg-white/[0.06] text-white/30 border border-white/[0.06]'
                      }`}>
                        {step.done ? <Check className="w-3 h-3" /> : step.id}
                      </div>
                      <span className={`text-[12px] font-semibold transition-colors ${
                        step.done ? 'text-white/80' : 'text-white/40'
                      }`}>
                        {step.label}
                      </span>
                      {step.ai && (
                        <button
                          onClick={step.action}
                          disabled={aiLoading === step.ai}
                          className="ml-auto text-[9px] px-1.5 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-300 font-bold hover:bg-indigo-500/20 transition-all disabled:opacity-40 border border-indigo-500/10"
                        >
                          {aiLoading === step.ai ? (
                            <span className="flex items-center gap-0.5">
                              <span className="w-1 h-1 rounded-full bg-indigo-400 animate-bounce" />
                            </span>
                          ) : step.label2}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </nav>

              <div className="mt-5 pt-4 border-t border-white/[0.06]">
                {isCompleted ? (
                  <div className="flex flex-col items-center gap-2 px-2 py-3 rounded-xl bg-gradient-to-br from-emerald-500/10 to-green-500/5 border border-emerald-500/20">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                      <PartyPopper className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-[12px] font-bold text-emerald-300 text-center">설교 준비 완료!</span>
                    <span className="text-[10px] text-emerald-400/60 text-center">모든 단계를 완료했습니다</span>
                  </div>
                ) : progress === 100 && (
                  <button
                    onClick={handleComplete}
                    disabled={completing}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white text-[13px] font-bold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all active:scale-[0.98] disabled:opacity-60"
                  >
                    <Trophy className="w-4 h-4" />
                    {completing ? '처리 중...' : '설교 준비 완료로 표시'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 p-4">
          {/* Tabs */}
          <div className="inline-flex rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] p-1 mb-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.2)]">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/20'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="animate-in" key={activeTab}>
            {activeTab === 'input' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-5">
                  {/* AI 도우미 */}
                  <div className="rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] p-5 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.3)]">
                    <div className="flex items-center gap-2.5 mb-5">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-indigo-300" />
                      </div>
                      <h3 className="text-[15px] font-extrabold text-white/90">AI 도우미</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5 mb-3">
                      <button
                        onClick={handleCoreMessage}
                        disabled={aiLoading !== null}
                        className="group relative flex items-center gap-3 px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-[13px] font-semibold text-white/70 hover:bg-indigo-500/10 hover:border-indigo-500/30 hover:text-indigo-200 transition-all hover:shadow-lg hover:shadow-indigo-500/5 active:scale-[0.98] disabled:opacity-40 overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/0 to-transparent group-hover:from-indigo-500/5 transition-all duration-500" />
                        <Lightbulb className="w-4.5 h-4.5 text-amber-400/70 group-hover:text-amber-300 relative" />
                        <span className="relative">{aiLoading === 'generate-core-message' ? '생성 중...' : '핵심 메시지'}</span>
                      </button>
                      <button
                        onClick={handleOutline}
                        disabled={aiLoading !== null}
                        className="group relative flex items-center gap-3 px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-[13px] font-semibold text-white/70 hover:bg-blue-500/10 hover:border-blue-500/30 hover:text-blue-200 transition-all hover:shadow-lg hover:shadow-blue-500/5 active:scale-[0.98] disabled:opacity-40 overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-transparent group-hover:from-blue-500/5 transition-all duration-500" />
                        <ListOrdered className="w-4.5 h-4.5 text-blue-400/70 group-hover:text-blue-300 relative" />
                        <span className="relative">{aiLoading === 'generate-outline' ? '생성 중...' : '개요 생성'}</span>
                      </button>
                      <button
                        onClick={handleApplication}
                        disabled={aiLoading !== null}
                        className="group relative flex items-center gap-3 px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-[13px] font-semibold text-white/70 hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-200 transition-all hover:shadow-lg hover:shadow-emerald-500/5 active:scale-[0.98] disabled:opacity-40 overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/0 to-transparent group-hover:from-emerald-500/5 transition-all duration-500" />
                        <MessageSquare className="w-4.5 h-4.5 text-emerald-400/70 group-hover:text-emerald-300 relative" />
                        <span className="relative">{aiLoading === 'generate-application' ? '생성 중...' : '적용 질문'}</span>
                      </button>
                      <button
                        onClick={() => setShowDraftModal(true)}
                        disabled={aiLoading !== null}
                        className="group relative flex items-center gap-3 px-4 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 text-[13px] font-bold text-white hover:from-indigo-500/30 hover:to-violet-500/30 transition-all hover:shadow-lg hover:shadow-indigo-500/10 active:scale-[0.98] disabled:opacity-40 overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/0 to-transparent group-hover:from-indigo-500/10 transition-all duration-500" />
                        <FileText className="w-4.5 h-4.5 text-indigo-300 relative" />
                        <span className="relative">{aiLoading === 'generate-draft' ? '생성 중...' : '초안 생성'}</span>
                      </button>
                    </div>
                    {aiError && (
                      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[13px] font-medium text-rose-200">
                        <X className="w-4 h-4 text-rose-400 shrink-0" />
                        {aiError}
                      </div>
                    )}
                  </div>

                  {showAiResult && aiResult && (
                    <SermonAIResult
                      type={aiType}
                      data={aiResult}
                      onClose={() => setShowAiResult(false)}
                      onSelect={handleAIResultSelect}
                    />
                  )}

                  {/* Editor sections */}
                  <SermonEditor
                    coreMessage={sermon.core_message || ''}
                    observationNotes={sermon.observation_notes || ''}
                    backgroundNotes={sermon.background_notes || ''}
                    interpretationNotes={sermon.interpretation_notes || ''}
                    illustrationNotes={sermon.illustration_notes || ''}
                    applicationPoints={sermon.application_points || ''}
                    onChange={handleFieldChange}
                    saving={saveStatus === 'saving'}
                  />
                </div>

                {/* Right sidebar - 설교 정보 */}
                <div className="space-y-4">
                  <div className="rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] p-5 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.3)]">
                    <div className="flex items-center gap-2.5 mb-5">
                      <div className="w-7 h-7 rounded-lg bg-white/[0.06] border border-white/[0.06] flex items-center justify-center">
                        <PenLine className="w-3.5 h-3.5 text-white/50" />
                      </div>
                      <h3 className="text-[14px] font-extrabold text-white/80">설교 정보</h3>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-[11px] font-bold tracking-wider text-white/40 block mb-1.5">성경 본문</label>
                        <input
                          value={sermon.passage}
                          onChange={e => handleFieldChange('passage', e.target.value)}
                          placeholder="예: 에베소서 2:1-10"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-[13px] text-white/80 placeholder-white/20 focus:outline-none focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold tracking-wider text-white/40 block mb-1.5">설교 날짜</label>
                        <input
                          type="date"
                          value={sermon.sermon_date || ''}
                          onChange={e => handleFieldChange('sermon_date', e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-[13px] text-white/80 focus:outline-none focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold tracking-wider text-white/40 block mb-1.5">시리즈</label>
                        <input
                          value={sermon.series || ''}
                          onChange={e => handleFieldChange('series', e.target.value)}
                          placeholder="시리즈가 있다면 입력하세요"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-[13px] text-white/80 placeholder-white/20 focus:outline-none focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold tracking-wider text-white/40 block mb-1.5">공동체 상황</label>
                        <textarea
                          value={sermon.church_context || ''}
                          onChange={e => handleFieldChange('church_context', e.target.value)}
                          placeholder="교회의 현재 상황이나 특징을 적어주세요"
                          className="w-full min-h-[90px] px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-[13px] text-white/80 placeholder-white/20 resize-y focus:outline-none focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'outline' && (
              <div className="rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] p-6 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.3)] max-w-3xl">
                <SermonOutlineEditor outline={sermon.outline || null} onChange={handleOutlineChange} />
              </div>
            )}

            {activeTab === 'manuscript' && (
              <div className="rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] p-6 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.3)] max-w-3xl">
                <SermonManuscriptEditor manuscript={sermon.manuscript || ''} onChange={handleManuscriptChange} />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Core message modal - suggestion step */}
      {showCoreInput && coreStep === 'suggest' && coreSuggestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md px-4" onClick={() => setShowCoreInput(false)}>
          <div className="w-full max-w-md rounded-2xl bg-[#181c30] border border-white/[0.08] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden animate-scale" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <div>
                <h2 className="text-[16px] font-extrabold text-white/90">AI 추천</h2>
                <p className="text-[12px] text-white/40 mt-0.5">AI가 추천한 내용입니다. 확인 후 수정하세요.</p>
              </div>
              <button onClick={() => setShowCoreInput(false)} className="w-8 h-8 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center transition-all">
                <X className="w-4 h-4 text-white/50" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-[13px] font-bold text-white/70 mb-1.5">
                  {coreSuggestion.includes(':') ? '추천 성경본문' : '추천 주제'}
                </label>
                <textarea
                  value={coreSuggestion}
                  onChange={e => setCoreSuggestion(e.target.value)}
                  className="w-full min-h-[80px] px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-[14px] text-white/80 placeholder-white/20 resize-y focus:outline-none focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setCoreStep('input'); setCoreSuggestion(''); }}
                  className="flex-1 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.06] text-[14px] font-bold text-white/50 hover:bg-white/[0.12] transition-all active:scale-[0.98]"
                >
                  다시 입력
                </button>
                <button
                  onClick={() => {
                    setShowCoreInput(false)
                    const passage = (coreSuggestion.includes(':') || !corePassage.trim()) ? coreSuggestion : corePassage
                    const topic = (coreSuggestion.includes(':') || !corePassage.trim()) ? coreTopic : coreSuggestion
                    callAIWithBody('generate-core-message', { passage, topic }, (data: CoreMessageResult) => {
                      if (data.candidates?.[0]) {
                        setSermon(prev => ({ ...prev, core_message: data.candidates[0].message }))
                      }
                    })
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-[14px] font-bold text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all active:scale-[0.98]"
                >
                  이 내용으로 생성하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Draft length modal */}
      {showDraftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md px-4" onClick={() => setShowDraftModal(false)}>
          <div className="w-full max-w-sm rounded-2xl bg-[#121420] border border-white/[0.08] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden animate-scale" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-white/[0.06]">
              <h2 className="text-[16px] font-extrabold text-white/90">초안 분량 선택</h2>
              <p className="text-[12px] text-white/40 mt-0.5">원하는 설교 분량을 선택하세요</p>
            </div>
            <div className="p-5 space-y-2">
              {([
                ['short', '짧게 (약 10분)'],
                ['medium', '보통 (약 20분)'],
                ['long', '길게 (30분 이상)'],
              ] as const).map(([key, label]) => (
                <button key={key} type="button" onClick={() => setDraftLength(key)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left text-[14px] font-medium transition-all ${
                    draftLength === key
                      ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-200'
                      : 'border-white/[0.06] bg-white/[0.02] text-white/60 hover:bg-white/[0.06] hover:border-white/[0.10]'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    draftLength === key ? 'border-indigo-400' : 'border-white/20'
                  }`}>
                    {draftLength === key && <div className="w-2 h-2 rounded-full bg-indigo-400" />}
                  </div>
                  {label}
                </button>
              ))}
            </div>
            <div className="px-5 pb-5 flex gap-2">
              <button onClick={() => setShowDraftModal(false)} className="flex-1 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.06] text-[14px] font-bold text-white/50 hover:bg-white/[0.12] transition-all">취소</button>
              <button onClick={runDraft} disabled={aiLoading !== null} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-[14px] font-bold text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all disabled:opacity-50">
                {aiLoading === 'generate-draft' ? '생성 중...' : '생성하기'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Core message modal - input step */}
      {showCoreInput && coreStep !== 'suggest' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md px-4" onClick={() => setShowCoreInput(false)}>
          <div className="w-full max-w-md rounded-2xl bg-[#181c30] border border-white/[0.08] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden animate-scale" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-white/[0.06]">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[16px] font-extrabold text-white/90">핵심 메시지 추천</h2>
                  <p className="text-[12px] text-white/40 mt-0.5">아래 정보를 입력하면 AI가 핵심 메시지를 추천합니다</p>
                </div>
              <button onClick={() => setShowCoreInput(false)} className="w-8 h-8 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center transition-all">
                <X className="w-4 h-4 text-white/50" />
              </button>
            </div>
            </div>
            <div className="p-5 space-y-4">
              {sermon.title && (
                <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/10 to-violet-500/5 border border-indigo-500/20 shadow-sm">
                  <p className="text-[10px] font-bold tracking-wider text-indigo-300/60 mb-1">설교 제목</p>
                  <p className="text-[16px] font-extrabold text-indigo-200 leading-tight">{sermon.title}</p>
                </div>
              )}
              <div>
                <label className="block text-[13px] font-bold text-white/70 mb-1.5">성경본문 *</label>
                <input
                  value={corePassage}
                  onChange={e => setCorePassage(e.target.value)}
                  placeholder="예: 에베소서 2:1-10"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-[14px] text-white/80 placeholder-white/20 focus:outline-none focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                  autoFocus
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[13px] font-bold text-white/70">주제 *</label>
                  {corePassage.trim() && (
                    <button type="button" onClick={suggestTopics} disabled={suggestingTopic}
                      className="flex items-center gap-1 text-[11px] text-indigo-300 font-semibold hover:text-indigo-200 transition-colors disabled:opacity-50"
                    >
                      <Sparkles className="w-3 h-3" />{suggestingTopic ? '추천 중...' : '주제 추천'}
                    </button>
                  )}
                </div>
                <textarea
                  value={coreTopic}
                  onChange={e => { setCoreTopic(e.target.value); setTopicSuggestions([]) }}
                  placeholder="설교의 주제나 내용을 간략히 입력하세요"
                  className="w-full min-h-[80px] px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-[14px] text-white/80 placeholder-white/20 resize-y focus:outline-none focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                />
                {topicSuggestions.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {topicSuggestions.map((s, i) => (
                      <button key={i} type="button" onClick={() => { setCoreTopic(s.value); setTopicSuggestions([]) }}
                        className="w-full flex items-start gap-2 px-3 py-2 rounded-xl border border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 text-left text-[13px] text-indigo-200 font-medium transition-all"
                      >
                        <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="block">{s.value}</span>
                          <span className="block text-[11px] text-indigo-400/60 font-normal mt-0.5">{s.reason}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCoreInput(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.06] text-[14px] font-bold text-white/50 hover:bg-white/[0.12] transition-all active:scale-[0.98]"
                >
                  취소
                </button>
                <button
                  onClick={async () => {
                    const passage = corePassage || ''
                    const topic = coreTopic || ''
                    if (!passage.trim() && !topic.trim()) {
                      alert('성경본문 또는 주제를 입력해주세요')
                      return
                    }
                    setShowCoreInput(false)
                    if (!passage.trim() && topic.trim()) {
                      const r = await fetch('/api/sermons/' + sermon.id + '/ai/suggest', {
                        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topic }) })
                      const j = await r.json()
                      if (j.success) callAIWithBody('generate-core-message', { passage: j.data.suggestion, topic }, (d) => {
                        if (d.candidates?.[0]) setSermon(p => ({ ...p, core_message: d.candidates[0].message }))
                      })
                      else setAiError(j.error || '오류')
                    } else if (passage.trim() && !topic.trim()) {
                      const r = await fetch('/api/sermons/' + sermon.id + '/ai/suggest', {
                        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ passage }) })
                      const j = await r.json()
                      if (j.success) callAIWithBody('generate-core-message', { passage, topic: j.data.suggestion }, (d) => {
                        if (d.candidates?.[0]) setSermon(p => ({ ...p, core_message: d.candidates[0].message }))
                      })
                      else setAiError(j.error || '오류')
                    } else {
                      runCoreMessage()
                    }
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-[14px] font-bold text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all active:scale-[0.98]"
                >
                  생성하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
