'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Save, Sparkles, Eye, Lightbulb, ListOrdered, FileText,
  MessageSquare, BookOpen, Check, ChevronDown, X, Cross,
  PenLine, Target, Search, Globe, Image as ImageIcon,
  PartyPopper, Trophy, ChevronRight, Zap, Layers, Wand2,
  Lock, Circle, ArrowRight,
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
    { id: 8, label: '초안 생성', done: !!sermon.manuscript, ai: 'generate-draft', action: () => setShowDraftModal(true), label2: 'AI 초안' },
  ]

  const doneCount = steps.filter(s => s.done).length
  const progress = Math.round((doneCount / steps.length) * 100)

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: 'input', label: '입력', icon: BookOpen },
    { id: 'outline', label: '개요', icon: ListOrdered },
    { id: 'manuscript', label: '원고', icon: FileText },
  ]

  return (
    <div className="relative min-h-screen bg-[#0a0c14]">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-5%] w-[900px] h-[900px] rounded-full bg-gradient-to-br from-indigo-600/6 via-blue-500/4 to-transparent blur-[150px]" />
        <div className="absolute bottom-[-25%] right-[-5%] w-[800px] h-[800px] rounded-full bg-gradient-to-tr from-violet-600/5 via-indigo-500/3 to-transparent blur-[150px]" />
        <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] rounded-full bg-gradient-to-bl from-sky-500/3 to-transparent blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.03)_0%,_transparent_60%)]" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#0a0c14]/80 backdrop-blur-2xl border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={() => router.push('/sermon')}
              className="w-9 h-9 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 shrink-0 group"
            >
              <ArrowLeft className="w-4 h-4 text-white/40 group-hover:text-white/70 transition-colors" />
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2.5">
                <input
                  value={sermon.title}
                  onChange={e => handleFieldChange('title', e.target.value)}
                  placeholder="설교 제목을 입력하세요"
                  className="text-[19px] font-bold text-white/90 bg-transparent border-none focus:outline-none placeholder-white/15 w-full tracking-tight truncate"
                />
                {isCompleted ? (
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300/80 border border-emerald-500/15 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    준비 완료
                  </span>
                ) : (
                  <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full shrink-0 transition-all duration-300 border ${
                    saveStatus === 'saved' ? 'bg-emerald-500/8 text-emerald-300/60 border-emerald-500/12' :
                    saveStatus === 'saving' ? 'bg-blue-500/8 text-blue-300/60 border-blue-500/12 animate-pulse' :
                    'bg-amber-500/8 text-amber-300/60 border-amber-500/12'
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
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-white/50 hover:text-white/80 text-[12px] font-semibold transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-40"
            >
              <Save className="w-3.5 h-3.5" />
              저장
            </button>
            <button
              onClick={() => router.push('/sermon/' + sermon.id + '/preview')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500/90 to-violet-500/90 text-white text-[12px] font-semibold shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/25 hover:from-indigo-400 hover:to-violet-400 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <Eye className="w-3.5 h-3.5" />
              미리보기
            </button>
          </div>
        </div>
        <div className="absolute bottom-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      </header>

      <div className="max-w-7xl mx-auto flex relative z-10 lg:gap-8">
        {/* Sidebar */}
        <aside className="w-[220px] shrink-0 p-4 lg:pl-6 lg:pr-0 hidden lg:block">
          <div className="sticky top-[76px]">
            <div className="rounded-2xl bg-white/[0.02] border border-white/[0.04] p-4 shadow-[0_8px_32px_-16px_rgba(0,0,0,0.4)]">
              <div className="flex items-center justify-between mb-3.5 px-1">
                <span className="text-[11px] font-semibold tracking-wider text-white/30">진행률</span>
                <span className="text-[12px] font-bold text-white/50">{progress}%</span>
              </div>
              <div className="w-full h-1 rounded-full bg-white/[0.04] overflow-hidden mb-5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-400/80 via-blue-400/80 to-indigo-400/80 transition-all duration-700 ease-out"
                  style={{ width: progress + '%' }}
                />
              </div>
              <nav className="space-y-0">
                {steps.map((step, i) => (
                  <div key={step.id} className="relative">
                    {i < steps.length - 1 && (
                      <div className={`absolute left-[14px] top-[28px] w-[1.5px] h-[30px] transition-colors duration-500 ${
                        step.done ? 'bg-indigo-400/20' : 'bg-white/[0.04]'
                      }`} />
                    )}
                    <div className={`relative flex items-center gap-2.5 px-2 py-[7px] rounded-xl transition-all duration-200 ${
                      step.done ? '' : ''
                    }`}>
                      <div className={`w-[26px] h-[26px] rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 transition-all duration-300 ${
                        step.done
                          ? 'bg-indigo-400/20 text-indigo-300/80'
                          : 'bg-white/[0.04] text-white/20'
                      }`}>
                        {step.done ? <Check className="w-3 h-3" /> : step.id}
                      </div>
                      <span className={`text-[11.5px] font-medium transition-colors ${
                        step.done ? 'text-white/60' : 'text-white/25'
                      }`}>
                        {step.label}
                      </span>
                      {step.ai && (
                        <button
                          onClick={step.action}
                          disabled={aiLoading === step.ai}
                          className="ml-auto text-[8px] px-1.5 py-0.5 rounded-md bg-white/[0.04] text-white/30 font-semibold hover:bg-white/[0.08] hover:text-white/50 transition-all disabled:opacity-30"
                        >
                          {aiLoading === step.ai ? (
                            <span className="flex items-center gap-0.5">
                              <span className="w-1 h-1 rounded-full bg-white/40 animate-bounce" />
                            </span>
                          ) : step.label2}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </nav>

              <div className="mt-4 pt-4 border-t border-white/[0.04]">
                {isCompleted ? (
                  <div className="flex flex-col items-center gap-2 px-2 py-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                    <div className="w-7 h-7 rounded-full bg-emerald-400/20 flex items-center justify-center">
                      <PartyPopper className="w-3.5 h-3.5 text-emerald-300/70" />
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-300/60 text-center">설교 준비 완료</span>
                  </div>
                ) : progress === 100 && (
                  <button
                    onClick={handleComplete}
                    disabled={completing}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-300/80 text-[12px] font-semibold border border-emerald-500/15 hover:from-emerald-500/30 hover:to-green-500/30 transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    <Trophy className="w-3.5 h-3.5" />
                    {completing ? '처리 중...' : '설교 준비 완료로 표시'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 p-4 lg:pr-6">
          {/* Tabs */}
          <div className="inline-flex rounded-2xl bg-white/[0.02] border border-white/[0.04] p-1 mb-6">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12px] font-semibold transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white/[0.06] text-white/90 shadow-sm'
                    : 'text-white/30 hover:text-white/50 hover:bg-white/[0.02]'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
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
                  <div className="rounded-2xl bg-white/[0.02] border border-white/[0.04] p-5 shadow-[0_8px_32px_-16px_rgba(0,0,0,0.3)]">
                    <div className="flex items-center gap-2.5 mb-5">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-400/15 to-violet-400/15 border border-indigo-400/10 flex items-center justify-center">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-300/60" />
                      </div>
                      <h3 className="text-[14px] font-semibold text-white/70">AI 도우미</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5 mb-3">
                      <button
                        onClick={handleCoreMessage}
                        disabled={aiLoading !== null}
                        className="group relative flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.04] text-[12.5px] font-medium text-white/50 hover:bg-indigo-500/8 hover:border-indigo-400/20 hover:text-indigo-200/70 transition-all duration-300 active:scale-[0.98] disabled:opacity-35 overflow-hidden"
                      >
                        <Lightbulb className="w-4 h-4 text-amber-300/50 group-hover:text-amber-200/70 transition-colors" />
                        <span>{aiLoading === 'generate-core-message' ? '생성 중...' : '핵심 메시지'}</span>
                      </button>
                      <button
                        onClick={handleOutline}
                        disabled={aiLoading !== null}
                        className="group relative flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.04] text-[12.5px] font-medium text-white/50 hover:bg-blue-500/8 hover:border-blue-400/20 hover:text-blue-200/70 transition-all duration-300 active:scale-[0.98] disabled:opacity-35 overflow-hidden"
                      >
                        <ListOrdered className="w-4 h-4 text-blue-300/50 group-hover:text-blue-200/70 transition-colors" />
                        <span>{aiLoading === 'generate-outline' ? '생성 중...' : '개요 생성'}</span>
                      </button>
                      <button
                        onClick={handleApplication}
                        disabled={aiLoading !== null}
                        className="group relative flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.04] text-[12.5px] font-medium text-white/50 hover:bg-emerald-500/8 hover:border-emerald-400/20 hover:text-emerald-200/70 transition-all duration-300 active:scale-[0.98] disabled:opacity-35 overflow-hidden"
                      >
                        <MessageSquare className="w-4 h-4 text-emerald-300/50 group-hover:text-emerald-200/70 transition-colors" />
                        <span>{aiLoading === 'generate-application' ? '생성 중...' : '적용 질문'}</span>
                      </button>
                      <button
                        onClick={() => setShowDraftModal(true)}
                        disabled={aiLoading !== null}
                        className="group relative flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-400/10 to-violet-400/10 border border-indigo-400/15 text-[12.5px] font-semibold text-white/70 hover:from-indigo-400/15 hover:to-violet-400/15 transition-all duration-300 active:scale-[0.98] disabled:opacity-35 overflow-hidden"
                      >
                        <FileText className="w-4 h-4 text-indigo-300/60" />
                        <span>{aiLoading === 'generate-draft' ? '생성 중...' : '초안 생성'}</span>
                      </button>
                    </div>
                    {aiError && (
                      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-500/8 border border-rose-500/15 text-[12.5px] font-medium text-rose-200/70">
                        <X className="w-3.5 h-3.5 text-rose-300/50 shrink-0" />
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

                {/* Right sidebar */}
                <div className="space-y-4">
                  <div className="rounded-2xl bg-white/[0.02] border border-white/[0.04] p-5 shadow-[0_8px_32px_-16px_rgba(0,0,0,0.3)]">
                    <div className="flex items-center gap-2.5 mb-5">
                      <div className="w-6 h-6 rounded-lg bg-white/[0.04] border border-white/[0.04] flex items-center justify-center">
                        <PenLine className="w-3 h-3 text-white/40" />
                      </div>
                      <h3 className="text-[13px] font-semibold text-white/60">설교 정보</h3>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-semibold tracking-wider text-white/25 block mb-1.5">성경 본문</label>
                        <input
                          value={sermon.passage}
                          onChange={e => handleFieldChange('passage', e.target.value)}
                          placeholder="예: 에베소서 2:1-10"
                          className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.04] text-[12.5px] text-white/60 placeholder-white/15 focus:outline-none focus:border-indigo-400/20 focus:ring-1 focus:ring-indigo-400/10 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold tracking-wider text-white/25 block mb-1.5">설교 날짜</label>
                        <input
                          type="date"
                          value={sermon.sermon_date || ''}
                          onChange={e => handleFieldChange('sermon_date', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.04] text-[12.5px] text-white/60 focus:outline-none focus:border-indigo-400/20 focus:ring-1 focus:ring-indigo-400/10 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold tracking-wider text-white/25 block mb-1.5">시리즈</label>
                        <input
                          value={sermon.series || ''}
                          onChange={e => handleFieldChange('series', e.target.value)}
                          placeholder="시리즈가 있다면 입력하세요"
                          className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.04] text-[12.5px] text-white/60 placeholder-white/15 focus:outline-none focus:border-indigo-400/20 focus:ring-1 focus:ring-indigo-400/10 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold tracking-wider text-white/25 block mb-1.5">공동체 상황</label>
                        <textarea
                          value={sermon.church_context || ''}
                          onChange={e => handleFieldChange('church_context', e.target.value)}
                          placeholder="교회의 현재 상황이나 특징을 적어주세요"
                          className="w-full min-h-[80px] px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.04] text-[12.5px] text-white/60 placeholder-white/15 resize-y focus:outline-none focus:border-indigo-400/20 focus:ring-1 focus:ring-indigo-400/10 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'outline' && (
              <div className="rounded-2xl bg-white/[0.02] border border-white/[0.04] p-6 shadow-[0_8px_32px_-16px_rgba(0,0,0,0.3)] max-w-3xl">
                <SermonOutlineEditor outline={sermon.outline || null} onChange={handleOutlineChange} />
              </div>
            )}

            {activeTab === 'manuscript' && (
              <div className="rounded-2xl bg-white/[0.02] border border-white/[0.04] p-6 shadow-[0_8px_32px_-16px_rgba(0,0,0,0.3)] max-w-3xl">
                <SermonManuscriptEditor manuscript={sermon.manuscript || ''} onChange={handleManuscriptChange} />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Core message modal - suggestion step */}
      {showCoreInput && coreStep === 'suggest' && coreSuggestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4" onClick={() => setShowCoreInput(false)}>
          <div className="w-full max-w-md rounded-2xl bg-[#0e101a] border border-white/[0.06] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] overflow-hidden animate-scale" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-white/[0.04] flex items-center justify-between">
              <div>
                <h2 className="text-[15px] font-semibold text-white/80">AI 추천</h2>
                <p className="text-[11px] text-white/35 mt-0.5">AI가 추천한 내용입니다. 확인 후 수정하세요.</p>
              </div>
              <button onClick={() => setShowCoreInput(false)} className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center transition-all">
                <X className="w-3.5 h-3.5 text-white/40" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-white/60 mb-1.5">
                  {coreSuggestion.includes(':') ? '추천 성경본문' : '추천 주제'}
                </label>
                <textarea
                  value={coreSuggestion}
                  onChange={e => setCoreSuggestion(e.target.value)}
                  className="w-full min-h-[80px] px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04] text-[13px] text-white/60 placeholder-white/15 resize-y focus:outline-none focus:border-indigo-400/20 focus:ring-1 focus:ring-indigo-400/10 transition-all"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setCoreStep('input'); setCoreSuggestion(''); }}
                  className="flex-1 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.04] text-[13px] font-semibold text-white/40 hover:bg-white/[0.08] transition-all active:scale-[0.98]"
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
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500/80 to-violet-500/80 text-[13px] font-semibold text-white shadow-sm hover:from-indigo-400 hover:to-violet-400 transition-all active:scale-[0.98]"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4" onClick={() => setShowDraftModal(false)}>
          <div className="w-full max-w-sm rounded-2xl bg-[#0e101a] border border-white/[0.06] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] overflow-hidden animate-scale" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-white/[0.04]">
              <h2 className="text-[15px] font-semibold text-white/80">초안 분량 선택</h2>
              <p className="text-[11px] text-white/35 mt-0.5">원하는 설교 분량을 선택하세요</p>
            </div>
            <div className="p-5 space-y-2">
              {([
                ['short', '짧게 (약 10분)'],
                ['medium', '보통 (약 20분)'],
                ['long', '길게 (30분 이상)'],
              ] as const).map(([key, label]) => (
                <button key={key} type="button" onClick={() => setDraftLength(key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left text-[13px] font-medium transition-all ${
                    draftLength === key
                      ? 'border-indigo-400/25 bg-indigo-400/8 text-indigo-200/80'
                      : 'border-white/[0.04] bg-white/[0.01] text-white/40 hover:bg-white/[0.04] hover:border-white/[0.06]'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    draftLength === key ? 'border-indigo-400/60' : 'border-white/15'
                  }`}>
                    {draftLength === key && <div className="w-2 h-2 rounded-full bg-indigo-400/60" />}
                  </div>
                  {label}
                </button>
              ))}
            </div>
            <div className="px-5 pb-5 flex gap-2">
              <button onClick={() => setShowDraftModal(false)} className="flex-1 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.04] text-[13px] font-semibold text-white/40 hover:bg-white/[0.08] transition-all">취소</button>
              <button onClick={runDraft} disabled={aiLoading !== null} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500/80 to-violet-500/80 text-[13px] font-semibold text-white shadow-sm hover:from-indigo-400 hover:to-violet-400 transition-all disabled:opacity-40">
                {aiLoading === 'generate-draft' ? '생성 중...' : '생성하기'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Core message modal - input step */}
      {showCoreInput && coreStep !== 'suggest' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4" onClick={() => setShowCoreInput(false)}>
          <div className="w-full max-w-md rounded-2xl bg-[#0e101a] border border-white/[0.06] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] overflow-hidden animate-scale" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-white/[0.04]">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[15px] font-semibold text-white/80">핵심 메시지 추천</h2>
                  <p className="text-[11px] text-white/35 mt-0.5">아래 정보를 입력하면 AI가 핵심 메시지를 추천합니다</p>
                </div>
              <button onClick={() => setShowCoreInput(false)} className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center transition-all">
                <X className="w-3.5 h-3.5 text-white/40" />
              </button>
            </div>
            </div>
            <div className="p-5 space-y-4">
              {sermon.title && (
                <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/8 to-violet-500/5 border border-indigo-400/10">
                  <p className="text-[9px] font-semibold tracking-wider text-indigo-300/40 mb-1">설교 제목</p>
                  <p className="text-[15px] font-bold text-indigo-200/70 leading-tight">{sermon.title}</p>
                </div>
              )}
              <div>
                <label className="block text-[12px] font-semibold text-white/60 mb-1.5">성경본문 *</label>
                <input
                  value={corePassage}
                  onChange={e => setCorePassage(e.target.value)}
                  placeholder="예: 에베소서 2:1-10"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04] text-[13px] text-white/60 placeholder-white/15 focus:outline-none focus:border-indigo-400/20 focus:ring-1 focus:ring-indigo-400/10 transition-all"
                  autoFocus
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[12px] font-semibold text-white/60">주제 *</label>
                  {corePassage.trim() && (
                    <button type="button" onClick={suggestTopics} disabled={suggestingTopic}
                      className="flex items-center gap-1 text-[10px] text-indigo-300/50 font-medium hover:text-indigo-200/70 transition-colors disabled:opacity-40"
                    >
                      <Sparkles className="w-2.5 h-2.5" />{suggestingTopic ? '추천 중...' : '주제 추천'}
                    </button>
                  )}
                </div>
                <textarea
                  value={coreTopic}
                  onChange={e => { setCoreTopic(e.target.value); setTopicSuggestions([]) }}
                  placeholder="설교의 주제나 내용을 간략히 입력하세요"
                  className="w-full min-h-[80px] px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04] text-[13px] text-white/60 placeholder-white/15 resize-y focus:outline-none focus:border-indigo-400/20 focus:ring-1 focus:ring-indigo-400/10 transition-all"
                />
                {topicSuggestions.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {topicSuggestions.map((s, i) => (
                      <button key={i} type="button" onClick={() => { setCoreTopic(s.value); setTopicSuggestions([]) }}
                        className="w-full flex items-start gap-2 px-3 py-2 rounded-xl border border-indigo-400/15 bg-indigo-400/5 hover:bg-indigo-400/8 text-left text-[12px] text-indigo-200/60 font-medium transition-all"
                      >
                        <Check className="w-3 h-3 text-indigo-300/40 shrink-0 mt-0.5" />
                        <div>
                          <span className="block">{s.value}</span>
                          <span className="block text-[10px] text-indigo-300/30 font-normal mt-0.5">{s.reason}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCoreInput(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.04] text-[13px] font-semibold text-white/40 hover:bg-white/[0.08] transition-all active:scale-[0.98]"
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
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500/80 to-violet-500/80 text-[13px] font-semibold text-white shadow-sm hover:from-indigo-400 hover:to-violet-400 transition-all active:scale-[0.98]"
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
