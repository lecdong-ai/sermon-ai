'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Sparkles, ArrowRight, BookOpen, FileText, Network, Archive, BarChart3 } from 'lucide-react'

const DEMO_PROJECTS = [
  {
    id: 'demo-1',
    title: '성령 안에 있는 생명',
    passage: '롬 8:1-11',
    status: 'completed' as const,
    wordCount: 5240,
    coreMessage: '성령께서 그리스도 안에서 우리에게 주시는 생명의 자유와 능력',
    themeNames: ['성령', '자유', '생명'],
    sermonDate: '2026-06-14',
    seriesName: '로마서 강해',
  },
  {
    id: 'demo-2',
    title: '은혜로 구원 받은 자',
    passage: '엡 2:1-10',
    status: 'completed' as const,
    wordCount: 5100,
    coreMessage: '우리는 행위로 말미암지 않고 오직 은혜로 믿음을 통해 구원을 받았으며, 이는 하나님이 예비하신 선한 일을 행하게 하심이다.',
    themeNames: ['은혜', '구원', '새창조'],
    sermonDate: '2025-09-14',
    seriesName: '에베소서 강해',
  },
  {
    id: 'demo-3',
    title: '여호와는 나의 목자',
    passage: '시 23:1-6',
    status: 'completed' as const,
    wordCount: 3560,
    coreMessage: '여호와는 나의 목자시니 내게 부족함이 없으며, 사망의 음침한 골짜기로 다닐지라도 해를 두려워하지 않을 것은 주께서 나와 함께 하심이다.',
    themeNames: ['인도', '보호', '공급'],
    sermonDate: '2025-03-30',
  },
]

const DEMO_INSIGHTS = [
  { label: '누적 설교', value: '24', icon: FileText },
  { label: 'AI 분석', value: '89', icon: Sparkles },
  { label: '시리즈', value: '4', icon: BookOpen },
  { label: '연구 노트', value: '156', icon: Archive },
]

export default function PreviewPage() {
  const router = useRouter()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const handleLocked = () => setShowUpgradeModal(true)

  return (
    <div className="flex h-screen bg-[#04060f]">
      <div className="w-56 bg-[#04060f] border-r border-white/5 text-slate-300 flex flex-col shrink-0 h-full relative z-20">
        <div className="px-5 py-5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <h1 className="text-[15px] font-bold tracking-tight text-white font-outfit">말씀 연구실</h1>
          </div>
          <p className="text-[10px] text-slate-500 mt-1 font-medium">목회자를 위한 지능형 AI 워크스페이스</p>
        </div>
        <div className="px-5 py-3 border-b border-white/5 bg-indigo-500/5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-[10px] font-semibold text-indigo-300">체험 모드</span>
          </div>
        </div>
        <div className="flex-1 py-4 px-5 space-y-3">
          {['대시보드', '프로젝트', '성경 연구', '설교 준비', '원고 작성', '시리즈', '지식 그래프', '노트'].map((item, i) => (
            <button key={item} onClick={handleLocked} className="w-full text-left text-[13px] text-slate-500 py-2 flex items-center justify-between group cursor-not-allowed">
              <span>{item}</span>
              <Lock className="w-3 h-3 text-slate-700 group-hover:text-slate-500" />
            </button>
          ))}
        </div>
        <div className="px-4 py-4 border-t border-white/5">
          <button onClick={() => router.push('/')} className="w-full text-left px-3 py-2 text-[11px] text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all flex items-center gap-2 group">
            <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-white transition-transform group-hover:-translate-x-0.5 rotate-180" />
            <span>메인 사이트 이동</span>
          </button>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-indigo-600/20 border-b border-indigo-500/20 px-6 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[11px] font-semibold text-indigo-300">체험 모드</span>
            <span className="text-[10px] text-slate-500">· 모든 기능은 후원회원이 되시면 사용 가능합니다</span>
          </div>
          <button
            onClick={() => router.push('/support')}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-300 hover:text-indigo-200 transition-colors"
          >
            말씀 준비의 패러다임을 바꾸세요
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[1200px] mx-auto px-6 py-8 space-y-8">
            <div>
              <h1 className="text-2xl font-bold text-white">말씀 연구실</h1>
              <p className="text-sm text-slate-400 mt-1">AI가 함께 만드는 지능형 설교 워크스페이스</p>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {DEMO_INSIGHTS.map(stat => (
                <div key={stat.label} className="bg-[#0a0e1a] rounded-xl border border-white/5 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <stat.icon className="w-4 h-4 text-indigo-400" />
                    <span className="text-[11px] text-slate-500">{stat.label}</span>
                  </div>
                  <span className="text-2xl font-bold text-white">{stat.value}</span>
                </div>
              ))}
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-white">최근 설교 프로젝트</h2>
                <button onClick={handleLocked} className="flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-slate-300 transition-colors">
                  <Lock className="w-3 h-3" />
                  전체보기
                </button>
              </div>
              <div className="space-y-3">
                {DEMO_PROJECTS.map(project => (
                  <div
                    key={project.id}
                    className="bg-[#0a0e1a] rounded-xl border border-white/5 p-4 flex items-center gap-4 group relative"
                  >
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10 flex items-center justify-center" onClick={handleLocked}>
                      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black/60 border border-white/10">
                        <Lock className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="text-[11px] font-semibold text-white">후원회원 전용</span>
                      </div>
                    </div>

                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">✓</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-white">{project.title}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-slate-400">{project.passage}</span>
                        <span className="text-[9px] text-slate-700">·</span>
                        <span className="text-[10px] text-slate-500">{project.sermonDate}</span>
                        <span className="text-[9px] text-slate-700">·</span>
                        <span className="text-[10px] text-slate-500">{project.wordCount.toLocaleString()}자</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{project.coreMessage}</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5 shrink-0">
                      {project.themeNames.slice(0, 2).map(t => (
                        <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">{t}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: BookOpen, title: '성경 정밀 연구', desc: '원어 분석, 주석, 평행본문을 한 곳에서', color: 'text-emerald-400' },
                { icon: Network, title: '지식 연결 그래프', desc: '설교 간 신학적 흐름을 시각화', color: 'text-blue-400' },
                { icon: BarChart3, title: 'AI 시리즈 인사이트', desc: '시리즈의 균형과 다음 설교를 제안', color: 'text-amber-400' },
              ].map(feature => (
                <div key={feature.title} className="bg-[#0a0e1a] rounded-xl border border-white/5 p-5 relative overflow-hidden group cursor-pointer" onClick={handleLocked}>
                  <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black/60 border border-white/10">
                      <Lock className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="text-[11px] font-semibold text-white">후원회원 전용</span>
                    </div>
                  </div>
                  <feature.icon className={`w-6 h-6 ${feature.color} mb-3`} />
                  <h3 className="text-sm font-bold text-white mb-1">{feature.title}</h3>
                  <p className="text-[11px] text-slate-500">{feature.desc}</p>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 border border-indigo-500/20 rounded-2xl p-8 text-center">
              <Sparkles className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
              <h2 className="text-lg font-bold text-white mb-2">설교의 새로운 차원을 경험하세요</h2>
              <p className="text-sm text-slate-400 mb-4 max-w-md mx-auto">원고 하나만으로 요약, 소그룹 질문, 카드뉴스, PPT를 5분 만에 생성합니다.</p>
              <button onClick={() => router.push('/support')} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-0.5">
                말씀 준비의 패러다임을 바꾸세요
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowUpgradeModal(false)}>
          <div className="bg-[#0a0e1a] border border-white/10 rounded-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-4 border border-indigo-500/20">
                <Lock className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">후원회원 전용 기능</h3>
              <p className="text-sm text-slate-400 mb-6">이 기능은 후원회원만 사용할 수 있습니다.<br />후원하시면 모든 기능을 제한 없이 이용하실 수 있습니다.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowUpgradeModal(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:border-white/20 text-sm font-medium transition-colors">닫기</button>
                <button onClick={() => router.push('/support')} className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-colors">후원하기</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
