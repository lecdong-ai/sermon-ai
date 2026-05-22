'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Upload, Sparkles, FileText, Share2, Cross, LogIn, LayoutDashboard } from 'lucide-react'
import FileUpload from '@/components/FileUpload'
import UsageBadge from '@/components/UsageBadge'
import { useAuth } from '@/components/AuthProvider'

const STEPS = [
  { icon: Upload, title: '파일 업로드', desc: '설교 원고(PDF/TXT/DOCX)를 안전하게 업로드하세요', color: 'from-blue-500 to-indigo-600 shadow-blue-500/10' },
  { icon: Sparkles, title: 'AI 초고속 생성', desc: '인공지능이 6종 고품질 콘텐츠를 즉시 설계합니다', color: 'from-indigo-500 to-purple-600 shadow-indigo-500/10' },
  { icon: FileText, title: '다차원 결과 분석', desc: '설교 요약, 나눔, 대본 등을 한눈에 검토하세요', color: 'from-purple-500 to-pink-600 shadow-purple-500/10' },
  { icon: Share2, title: '스마트 공유 & 다운', desc: '링크 전달은 물론, PPT 및 문서로 간편 저장', color: 'from-pink-500 to-rose-600 shadow-pink-500/10' },
]

export default function HomePage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  const handleUploadSuccess = (sermonId: string) => {
    router.push(`/workspace?id=${sermonId}`)
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-slate-50/50">
      
      {/* 미래지향적 오로라 백그라운드 & 격자 데코레이션 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden bg-grid-tech">
        <div className="absolute top-[-25%] left-[-15%] w-[800px] h-[800px] rounded-full bg-gradient-to-br from-indigo-300/15 via-blue-300/10 to-transparent blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-[-15%] right-[-15%] w-[700px] h-[700px] rounded-full bg-gradient-to-tr from-purple-300/10 via-indigo-300/5 to-transparent blur-3xl animate-pulse-slower" />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 py-14 sm:py-20">
        
        {/* 히어로 영역 */}
        <div className="text-center mb-16 animate-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 via-blue-600 to-purple-600 shadow-2xl shadow-indigo-500/30 mb-8 animate-float">
            <Cross className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-5 text-balance font-outfit text-gradient leading-tight">
            목회자를 위한 지능형 AI 솔루션
          </h1>
          
          <p className="text-[19px] sm:text-[22px] text-slate-500 leading-relaxed max-w-2xl mx-auto font-medium">
            복잡한 설교 준비 과정을 획기적으로 혁신합니다. 원고를 업로드하면 요약서, 
            소그룹 나눔 질문, 카드뉴스, 유튜브 쇼츠 대본까지 자동으로 정밀 설계됩니다.
          </p>

          {/* CTA 버튼 */}
          {!loading && !user && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <Link
                href="/login?redirect=/"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-600 text-white font-bold text-[16px] hover:shadow-xl hover:shadow-indigo-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
              >
                <LogIn className="w-5 h-5" />
                지금 시작하기 (로그인)
              </Link>
            </div>
          )}

          {!loading && user && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-white border border-slate-200/60 text-slate-700 font-bold text-[16px] shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
              >
                <LayoutDashboard className="w-5 h-5 text-indigo-500" />
                대시보드로 이동
              </Link>
            </div>
          )}
        </div>

        {/* 미래지향적 사용 흐름 안내 카드 */}
        <div className="mb-14 animate-in" style={{ animationDelay: '0.1s' }}>
          <div className="glass-panel rounded-3xl p-8 border border-white/60">
            <h2 className="text-[14px] font-bold text-indigo-600 uppercase tracking-widest text-center mb-6">4-STEP 설교 설계 워크플로우</h2>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
              {STEPS.map((step, i) => (
                <div key={step.title} className="text-center group transition-transform duration-300 hover:scale-[1.03]">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-all duration-300`}>
                    <step.icon className="w-7 h-7 text-white" />
                  </div>
                  <p className="text-[16px] font-bold text-slate-800 mb-1.5">{step.title}</p>
                  <p className="text-[13px] text-slate-400 leading-normal px-2">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 메인 파일 업로드/로그인 유도 판넬 */}
        {!loading && (
          <div className="animate-in" style={{ animationDelay: '0.2s' }}>
            {user ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-3 glass-panel rounded-3xl p-1 border border-white/60 shadow-lg">
                  <FileUpload onSuccess={handleUploadSuccess} />
                </div>
                <div className="md:col-span-1 flex items-stretch">
                  <div className="glass-panel w-full rounded-3xl px-5 py-4 border border-white/60 flex items-center justify-center">
                    <UsageBadge />
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-panel rounded-3xl border border-white/80 p-12 text-center shadow-lg shadow-indigo-500/5 hover:border-indigo-500/20 transition-all duration-300">
                <Upload className="w-12 h-12 text-slate-300 mx-auto mb-4 animate-pulse" />
                <p className="text-[18px] font-bold text-slate-700 mb-2">원고 업로드를 위해 로그인이 필요합니다</p>
                <p className="text-[14px] text-slate-400 mb-6">간단히 소셜/이메일 로그인 후 AI 생성 서비스를 이용하실 수 있습니다.</p>
                <Link
                  href="/login?redirect=/"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold text-[15px] hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-200"
                >
                  <LogIn className="w-4.5 h-4.5" />
                  로그인하기
                </Link>
              </div>
            )}
          </div>
        )}

        {/* 든든한 꿀팁 알림 가이드 박스 */}
        <div className="mt-8 animate-in" style={{ animationDelay: '0.3s' }}>
          <div className="bg-gradient-to-br from-amber-50/70 via-orange-50/50 to-yellow-50/30 backdrop-blur-xl border border-amber-200/40 p-6 rounded-2xl shadow-sm">
            <p className="font-bold text-amber-800 text-[15px] mb-2.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              스마트 솔루션 알림 및 꿀팁 💡
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5 text-[13.5px] text-amber-700/90 font-medium">
              <li>• PDF, TXT, DOCX 포맷을 완벽하게 지원합니다 (최대 20MB)</li>
              <li>• 옛날 한글 문서(.doc)는 미리 .docx로 변환해 주세요!</li>
              <li>• AI 정밀 모델 설계는 통상 20~40초 가량 소요됩니다</li>
              <li>• 분석 완료된 모든 콘텐츠는 마이페이지 및 대시보드에 영구 소장됩니다</li>
            </ul>
          </div>
        </div>
        
      </div>
    </div>
  )
}

