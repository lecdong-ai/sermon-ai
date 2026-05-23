'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, BookOpen, Sparkles, Loader2, Check, Copy, RefreshCw, ChevronLeft, ChevronRight, AlertCircle, Target, Eye } from 'lucide-react'

export default function AdvancedSermonPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [finalText, setFinalText] = useState('')
  const [completed, setCompleted] = useState(false)

  const [passage, setPassage] = useState('')
  const [title, setTitle] = useState('')
  const [topic, setTopic] = useState('')
  const [audience, setAudience] = useState('')
  const [context, setContext] = useState('')
  const [sermonType, setSermonType] = useState('expository')

  const [step2Result, setStep2Result] = useState<any>(null)
  const [step3Result, setStep3Result] = useState<any>(null)
  const [step4Result, setStep4Result] = useState<any>(null)
  const [step5Result, setStep5Result] = useState<any>(null)
  const [step6Result, setStep6Result] = useState<any>(null)
  const [coreMessage, setCoreMessage] = useState('')
  const [activePoint, setActivePoint] = useState(0)

  const steps = [
    { id: 1, label: '본문 입력', done: !!passage },
    { id: 2, label: '본문 분석', done: !!step2Result },
    { id: 3, label: '대지 구성', done: !!step3Result },
    { id: 4, label: '대지 확장', done: !!step4Result },
    { id: 5, label: '적용/예화', done: !!step5Result },
    { id: 6, label: '결론', done: !!step6Result },
    { id: 7, label: '최종 원고', done: !!finalText },
  ]
  const doneCount = steps.filter(s => s.done).length
  const progress = Math.round((doneCount / steps.length) * 100)

  const callStep = useCallback(async (stepNum: number) => {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/sermons/advanced', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: stepNum, passage, title, topic, audience, context, sermon_type: sermonType,
          core_message: coreMessage, direction: step3Result?.direction || '',
          main_points: step3Result?.main_points || [],
          expanded_points: step4Result?.expanded_points || [],
          applications: step5Result?.applications || [],
          conclusion_data: step6Result ? JSON.stringify(step6Result) : '',
        }),
      })
      const json = await res.json()
      if (!json.success) { setError(json.error || '처리 실패'); return null }
      return json.data
    } catch { setError('네트워크 오류'); return null }
    finally { setLoading(false) }
  }, [passage, title, topic, audience, context, sermonType, step3Result, step4Result, step5Result, step6Result, coreMessage])

  const handleStep1Next = async () => {
    if (!passage.trim()) { setError('성경본문을 입력해주세요.'); return }
    const data = await callStep(1)
    if (data) setStep2Result(data)
    setStep(2)
  }

  const handleStep2 = async () => {
    const data = await callStep(2)
    if (data) { setStep2Result(data); setCoreMessage(data.core_message || '') }
  }

  const handleStep3 = async () => {
    const data = await callStep(3)
    if (data) setStep3Result(data)
  }

  const handleStep4 = async () => {
    if (!step3Result?.main_points?.length) { setError('먼저 대지를 구성해주세요.'); return }
    const data = await callStep(4)
    if (data) setStep4Result(data)
  }

  const handleStep5 = async () => {
    const data = await callStep(5)
    if (data) setStep5Result(data)
  }

  const handleStep6 = async () => {
    const data = await callStep(6)
    if (data) setStep6Result(data)
  }

  const handleFinal = async () => {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/sermons/advanced', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 'final', passage, title, topic, audience, context,
          core_message: coreMessage,
          main_points: step3Result?.main_points || [],
          expanded_points: step4Result?.expanded_points || [],
          applications: step5Result?.applications || [],
          conclusion_data: step6Result ? JSON.stringify(step6Result) : '',
        }),
      })
      const json = await res.json()
      if (json.success) { setFinalText(json.data.full_text); setCompleted(true) }
      else setError(json.error || '생성 실패')
    } catch { setError('네트워크 오류') }
    finally { setLoading(false) }
  }

  const regenerateStep = () => {
    if (step === 2) handleStep2(); else if (step === 3) handleStep3()
    else if (step === 4) handleStep4(); else if (step === 5) handleStep5()
    else if (step === 6) handleStep6()
  }

  const SERMON_TYPES = [
    { id: 'expository', label: '강해설교' }, { id: 'topical', label: '주제설교' },
    { id: 'sunday', label: '주일예배' }, { id: 'wednesday', label: '수요예배' },
    { id: 'dawn', label: '새벽예배' }, { id: 'youth', label: '청년부' },
    { id: 'adult', label: '장년부' }, { id: 'newfamily', label: '전도/새가족' },
  ]

  return (
    <div className="relative min-h-screen bg-slate-50/50">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[700px] h-[700px] rounded-full bg-gradient-to-br from-indigo-300/10 via-blue-300/5 to-transparent blur-3xl" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-purple-300/8 via-indigo-300/5 to-transparent blur-3xl" />
      </div>

      <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/sermon')} className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-all hover:scale-105 active:scale-95 shrink-0">
              <ArrowLeft className="w-4.5 h-4.5 text-slate-500" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-sm">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-[17px] font-extrabold text-slate-800">실전형 설교 준비</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-bold">GPT-4o</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {finalText && (
              <button onClick={async () => { await navigator.clipboard.writeText(finalText); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-slate-600 text-[12px] font-bold hover:bg-slate-200 transition-all"
              >{copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}{copied ? '복사됨' : '복사'}</button>
            )}
            <button onClick={() => router.push('/sermon')} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[12px] font-bold hover:shadow-lg transition-all">목록으로</button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex">
        {/* Sidebar */}
        <aside className="w-56 shrink-0 p-4 hidden lg:block">
          <div className="glass-panel rounded-2xl p-4 border border-white/60">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[12px] font-bold text-slate-400">진행률</span>
              <span className="text-[12px] font-bold text-indigo-600">{progress}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden mb-4">
              <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-400 transition-all duration-700 ease-out" style={{ width: progress + '%' }} />
            </div>
            <nav className="space-y-0">
              {steps.map((s, i) => (
                <div key={s.id} className="relative">
                  {i < steps.length - 1 && (
                    <div className={`absolute left-[15px] top-[30px] w-[2px] h-[32px] transition-colors duration-500 ${s.done ? 'bg-indigo-300' : 'bg-slate-200'}`} />
                  )}
                  <div className="relative flex items-center gap-2 px-2 py-2 rounded-xl transition-all duration-200">
                    <div className={`w-[28px] h-[28px] rounded-xl flex items-center justify-center text-[11px] font-bold shrink-0 transition-all duration-300 ${
                      s.done ? 'bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-md shadow-indigo-200' :
                      step === s.id ? 'bg-amber-500 text-white shadow-sm' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {s.done ? <Check className="w-3 h-3" /> : s.id}
                    </div>
                    <span className={`text-[12px] font-semibold transition-colors ${s.done ? 'text-slate-700' : step === s.id ? 'text-amber-700' : 'text-slate-400'}`}>{s.label}</span>
                  </div>
                </div>
              ))}
            </nav>
            {completed && (
              <div className="mt-4 pt-4 border-t border-slate-200/60">
                <div className="flex flex-col items-center gap-2 px-2 py-3 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200/50">
                  <Check className="w-6 h-6 text-emerald-500" />
                  <span className="text-[12px] font-bold text-emerald-700 text-center">작성 완료!</span>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0 p-4">
          {step === 1 && (
            <div className="glass-panel rounded-2xl p-6 border border-white/60">
              <h3 className="text-[16px] font-extrabold text-slate-800 mb-1 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-500" />설교 기본 정보
              </h3>
              <p className="text-[12px] text-slate-400 mb-5">성경본문과 설교 상황을 입력하면 AI가 준비 방향을 분석합니다.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-1">성경본문 *</label>
                  <input value={passage} onChange={e => setPassage(e.target.value)} placeholder="예: 에베소서 2:1-10"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-[14px] text-slate-700 placeholder-slate-300 focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[13px] font-bold text-slate-700 mb-1">설교 제목 (선택)</label>
                    <input value={title} onChange={e => setTitle(e.target.value)} placeholder="예: 은혜로 거듭난 사람"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-[14px] text-slate-700 placeholder-slate-300 focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-slate-700 mb-1">설교 주제 (선택)</label>
                    <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="예: 하나님의 은혜와 정체성"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-[14px] text-slate-700 placeholder-slate-300 focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[13px] font-bold text-slate-700 mb-1">회중 대상 (선택)</label>
                    <input value={audience} onChange={e => setAudience(e.target.value)} placeholder="예: 청년부, 장년부"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-[14px] text-slate-700 placeholder-slate-300 focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-slate-700 mb-1">예배 유형</label>
                    <select value={sermonType} onChange={e => setSermonType(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-[14px] text-slate-700 focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all"
                    >{SERMON_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}</select>
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-1">교회 상황 (선택)</label>
                  <textarea value={context} onChange={e => setContext(e.target.value)} placeholder="교회의 특별한 상황, 강조하고 싶은 방향, 설교에 반영할 목회적 고민"
                    className="w-full min-h-[60px] px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-[14px] text-slate-700 placeholder-slate-300 resize-y focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all" />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="glass-panel rounded-2xl p-6 border border-white/60">
              <h3 className="text-[16px] font-extrabold text-slate-800 mb-1 flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-500" />본문 분석
              </h3>
              <p className="text-[12px] text-slate-400 mb-5">AI가 본문을 분석하여 요약, 배경, 핵심 메시지를 제안합니다.</p>
              {!step2Result ? (
                <button onClick={handleStep2} disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-[14px] font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}AI 분석 시작</button>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100"><p className="text-[11px] font-bold text-indigo-500 mb-1">본문 요약</p><p className="text-[14px] text-slate-700">{step2Result.passage_summary}</p></div>
                  <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-200"><p className="text-[11px] font-bold text-slate-500 mb-1">본문 배경</p><p className="text-[14px] text-slate-700">{step2Result.background}</p></div>
                  <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100"><p className="text-[11px] font-bold text-amber-500 mb-1">문맥적 의미</p><p className="text-[14px] text-slate-700">{step2Result.context_meaning}</p></div>
                  <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100"><p className="text-[11px] font-bold text-emerald-600 mb-1">핵심 주제</p><p className="text-[15px] font-bold text-slate-800">{step2Result.core_topic}</p></div>
                  <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
                    <p className="text-[11px] font-bold text-amber-600 mb-1">핵심 메시지</p>
                    <textarea value={coreMessage} onChange={e => setCoreMessage(e.target.value)} className="w-full text-[15px] font-bold text-slate-800 bg-transparent border-none resize-none focus:outline-none" rows={2} />
                  </div>
                  <button onClick={handleStep2} disabled={loading} className="flex items-center gap-1.5 text-[13px] text-indigo-600 font-bold hover:text-indigo-700 transition-colors">
                    <RefreshCw className="w-3.5 h-3.5" />재생성
                  </button>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="glass-panel rounded-2xl p-6 border border-white/60">
              <h3 className="text-[16px] font-extrabold text-slate-800 mb-1 flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-500" />대지 구성
              </h3>
              <p className="text-[12px] text-slate-400 mb-5">AI가 설교 방향과 대지 구성을 제안합니다.</p>
              {!step3Result ? (
                <button onClick={handleStep3} disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-[14px] font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}대지 구성 제안받기</button>
              ) : (
                <div className="space-y-3">
                  {step3Result.title_candidates?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      <span className="text-[11px] font-bold text-slate-400 w-full">제목 후보</span>
                      {step3Result.title_candidates.map((t: string, i: number) => (
                        <button key={i} onClick={() => setTitle(t)}
                          className={`px-3 py-1.5 rounded-lg text-[12px] font-bold border transition-all ${title === t ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}>{t}</button>
                      ))}
                    </div>
                  )}
                  <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-200">
                    <p className="text-[11px] font-bold text-slate-500 mb-1">설교 방향</p>
                    <textarea value={step3Result.direction || ''} onChange={e => setStep3Result({...step3Result, direction: e.target.value})}
                      className="w-full text-[14px] text-slate-700 bg-transparent border-none resize-none focus:outline-none" rows={2} />
                  </div>
                  <div className="space-y-2">
                    {step3Result.main_points?.map((p: any, i: number) => (
                      <div key={i} className="p-4 rounded-xl bg-white border border-slate-200">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-[11px] font-bold text-white shrink-0">{i+1}</span>
                          <input value={p.title} onChange={e => {const pts=[...step3Result.main_points]; pts[i]={...pts[i], title: e.target.value}; setStep3Result({...step3Result, main_points: pts})}}
                            className="text-[14px] font-bold text-slate-800 bg-transparent border-none focus:outline-none flex-1" />
                        </div>
                        <textarea value={p.key_sentence} onChange={e => {const pts=[...step3Result.main_points]; pts[i]={...pts[i], key_sentence: e.target.value}; setStep3Result({...step3Result, main_points: pts})}}
                          className="w-full text-[13px] text-slate-500 bg-transparent border-none resize-none focus:outline-none mt-1" rows={1} />
                      </div>
                    ))}
                  </div>
                  <button onClick={handleStep3} disabled={loading} className="flex items-center gap-1.5 text-[13px] text-indigo-600 font-bold hover:text-indigo-700 transition-colors">
                    <RefreshCw className="w-3.5 h-3.5" />재생성
                  </button>
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="glass-panel rounded-2xl p-6 border border-white/60">
              <h3 className="text-[16px] font-extrabold text-slate-800 mb-1 flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-500" />대지 확장
              </h3>
              <p className="text-[12px] text-slate-400 mb-5">각 대지를 상세하게 확장합니다.</p>
              {!step4Result ? (
                <button onClick={handleStep4} disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-[14px] font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}대지 확장하기</button>
              ) : (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    {step4Result.expanded_points?.map((_: any, i: number) => (
                      <button key={i} onClick={() => setActivePoint(i)}
                        className={`px-3 py-1.5 rounded-lg text-[12px] font-bold border transition-all ${activePoint === i ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'}`}
                      >대지 {i+1}</button>
                    ))}
                  </div>
                  {step4Result.expanded_points?.[activePoint] && (
                    <div className="space-y-3">
                      {['exposition', 'meaning', 'pastoral_emphasis'].map((field) => {
                        const labels: Record<string, string> = { exposition: '본문 해설', meaning: '신앙적 의미', pastoral_emphasis: '목회적 강조점' }
                        const colors: Record<string, string> = { exposition: 'bg-indigo-50/50 border-indigo-100 text-indigo-500', meaning: 'bg-slate-50/50 border-slate-200 text-slate-500', pastoral_emphasis: 'bg-amber-50/50 border-amber-100 text-amber-500' }
                        return (
                          <div key={field} className={`p-4 rounded-xl border ${colors[field].split(' ').slice(0,2).join(' ')}`}>
                            <p className={`text-[11px] font-bold mb-1 ${colors[field].split(' ')[2]}`}>{labels[field]}</p>
                            <textarea value={(step4Result.expanded_points[activePoint] as any)[field] || ''}
                              onChange={e => {const pts=[...step4Result.expanded_points]; pts[activePoint]={...pts[activePoint], [field]: e.target.value}; setStep4Result({...step4Result, expanded_points: pts})}}
                              className="w-full text-[14px] text-slate-700 bg-transparent border-none resize-y focus:outline-none min-h-[60px]" />
                          </div>
                        )
                      })}
                    </div>
                  )}
                  <button onClick={handleStep4} disabled={loading} className="flex items-center gap-1.5 text-[13px] text-indigo-600 font-bold hover:text-indigo-700 transition-colors">
                    <RefreshCw className="w-3.5 h-3.5" />재생성
                  </button>
                </div>
              )}
            </div>
          )}

          {step === 5 && (
            <div className="glass-panel rounded-2xl p-6 border border-white/60">
              <h3 className="text-[16px] font-extrabold text-slate-800 mb-1 flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-500" />적용 / 예화
              </h3>
              <p className="text-[12px] text-slate-400 mb-5">각 대지에 맞는 적용과 예화 아이디어를 제안합니다.</p>
              {!step5Result ? (
                <button onClick={handleStep5} disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-[14px] font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}적용/예화 제안받기</button>
              ) : (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    {step5Result.applications?.map((_: any, i: number) => (
                      <button key={i} onClick={() => setActivePoint(i)}
                        className={`px-3 py-1.5 rounded-lg text-[12px] font-bold border transition-all ${activePoint === i ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'}`}
                      >대지 {i+1}</button>
                    ))}
                  </div>
                  {step5Result.applications?.[activePoint] && (
                    <div className="space-y-3">
                      <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100"><p className="text-[11px] font-bold text-emerald-600 mb-1">삶의 적용</p><p className="text-[14px] text-slate-700">{step5Result.applications[activePoint].life_application}</p></div>
                      <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-200"><p className="text-[11px] font-bold text-slate-500 mb-1">공동체 적용</p><p className="text-[14px] text-slate-700">{step5Result.applications[activePoint].community_application}</p></div>
                      <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100">
                        <p className="text-[11px] font-bold text-amber-500 mb-1">예화/사례 아이디어</p>
                        <textarea value={step5Result.applications[activePoint].illustration_idea || ''}
                          onChange={e => {const apps=[...step5Result.applications]; apps[activePoint]={...apps[activePoint], illustration_idea: e.target.value}; setStep5Result({...step5Result, applications: apps})}}
                          className="w-full text-[14px] text-slate-700 bg-transparent border-none resize-y focus:outline-none min-h-[60px]" />
                      </div>
                      <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100"><p className="text-[11px] font-bold text-blue-500 mb-1">회중 질문</p><p className="text-[14px] text-slate-700">{step5Result.applications[activePoint].question}</p></div>
                    </div>
                  )}
                  <button onClick={handleStep5} disabled={loading} className="flex items-center gap-1.5 text-[13px] text-indigo-600 font-bold hover:text-indigo-700 transition-colors">
                    <RefreshCw className="w-3.5 h-3.5" />재생성
                  </button>
                </div>
              )}
            </div>
          )}

          {step === 6 && (
            <div className="glass-panel rounded-2xl p-6 border border-white/60">
              <h3 className="text-[16px] font-extrabold text-slate-800 mb-1 flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-500" />결론
              </h3>
              <p className="text-[12px] text-slate-400 mb-5">AI가 설교의 결론과 결단 촉구를 제안합니다.</p>
              {!step6Result ? (
                <button onClick={handleStep6} disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-[14px] font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}결론 제안받기</button>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-200"><p className="text-[11px] font-bold text-slate-500 mb-1">설교 요약</p><p className="text-[14px] text-slate-700">{step6Result.summary}</p></div>
                  <div className="p-4 rounded-xl bg-white border border-slate-200"><p className="text-[11px] font-bold text-indigo-500 mb-1">결론 문단</p><textarea value={step6Result.conclusion || ''} onChange={e => setStep6Result({...step6Result, conclusion: e.target.value})} className="w-full min-h-[80px] text-[14px] text-slate-700 bg-transparent border-none resize-y focus:outline-none" /></div>
                  <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100"><p className="text-[11px] font-bold text-amber-600 mb-1">결단 촉구</p><textarea value={step6Result.commitment_call || ''} onChange={e => setStep6Result({...step6Result, commitment_call: e.target.value})} className="w-full text-[14px] text-slate-700 bg-transparent border-none resize-none focus:outline-none" rows={2} /></div>
                  <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100"><p className="text-[11px] font-bold text-emerald-600 mb-1">마무리 기도문</p><textarea value={step6Result.prayer || ''} onChange={e => setStep6Result({...step6Result, prayer: e.target.value})} className="w-full min-h-[60px] text-[14px] text-slate-700 bg-transparent border-none resize-y focus:outline-none" /></div>
                  <button onClick={handleStep6} disabled={loading} className="flex items-center gap-1.5 text-[13px] text-indigo-600 font-bold hover:text-indigo-700 transition-colors">
                    <RefreshCw className="w-3.5 h-3.5" />재생성
                  </button>
                </div>
              )}
            </div>
          )}

          {step === 7 && (
            <div className="glass-panel rounded-2xl p-6 border border-white/60">
              <h3 className="text-[16px] font-extrabold text-slate-800 mb-1 flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-500" />최종 설교원고
              </h3>
              <p className="text-[12px] text-slate-400 mb-5">지금까지 준비된 모든 내용을 통합하여 완성된 설교원고를 생성합니다.</p>
              {!finalText ? (
                <button onClick={handleFinal} disabled={loading}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-[16px] font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >{loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}최종 설교원고 생성</button>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-slate-400">약 {finalText.length.toLocaleString()}자</span>
                  </div>
                  <div className="p-5 rounded-xl bg-white border border-slate-200 text-[15px] text-slate-800 leading-[1.9] whitespace-pre-wrap">{finalText}</div>
                  <button onClick={handleFinal} disabled={loading} className="flex items-center gap-1.5 text-[13px] text-indigo-600 font-bold hover:text-indigo-700 transition-colors">
                    <RefreshCw className="w-3.5 h-3.5" />다시 생성
                  </button>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-[13px] text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-4">
            <button onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-[13px] font-bold text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50"
            ><ChevronLeft className="w-4 h-4" />이전</button>

            {step < 7 ? (
              step === 1 ? (
                <button onClick={handleStep1Next} disabled={!passage.trim() || loading}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-[13px] font-bold hover:shadow-lg transition-all disabled:opacity-50"
                >다음<ChevronRight className="w-4 h-4" /></button>
              ) : (
                <button onClick={() => {
                  if (step === 2 && !step2Result) { handleStep2(); return }
                  if (step === 3 && !step3Result) { handleStep3(); return }
                  if (step === 4 && !step4Result) { handleStep4(); return }
                  if (step === 5 && !step5Result) { handleStep5(); return }
                  if (step === 6 && !step6Result) { handleStep6(); return }
                  setStep(Math.min(7, step + 1))
                }} disabled={loading}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-[13px] font-bold hover:shadow-lg transition-all disabled:opacity-50"
                >다음<ChevronRight className="w-4 h-4" /></button>
              )
            ) : (
              <div />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
