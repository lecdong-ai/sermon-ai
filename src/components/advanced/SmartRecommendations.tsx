'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, BookOpen, FileText, ArrowRight, TrendingUp } from 'lucide-react'
import type { AdvancedProject } from '@/lib/advanced/types'

interface SmartRecommendationsProps {
  projects: AdvancedProject[]
}

interface Recommendation {
  id: string
  icon: 'book' | 'file' | 'trend' | 'sparkle'
  title: string
  description: string
  cta: string
  href: string
  accent: 'indigo' | 'amber' | 'emerald' | 'pink'
}

const ACCENT_MAP = {
  indigo:  { bg: 'bg-indigo-500/10',  border: 'border-indigo-500/30',  text: 'text-indigo-300',  icon: 'text-indigo-400' },
  amber:   { bg: 'bg-amber-500/10',   border: 'border-amber-500/30',   text: 'text-amber-300',   icon: 'text-amber-400' },
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-300', icon: 'text-emerald-400' },
  pink:    { bg: 'bg-pink-500/10',    border: 'border-pink-500/30',    text: 'text-pink-300',    icon: 'text-pink-400' },
}

export default function SmartRecommendations({ projects }: SmartRecommendationsProps) {
  const router = useRouter()

  const recommendations = useMemo<Recommendation[]>(() => {
    const out: Recommendation[] = []

    // 1) 가장 오래된 진행 중 프로젝트 (작성 멈춘 것)
    const activeProjects = projects
      .filter((p) => ['research', 'prepare', 'writing', 'review'].includes(p.status))
      .sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime())

    if (activeProjects.length > 0) {
      const oldest = activeProjects[0]
      const daysSince = Math.floor((Date.now() - new Date(oldest.updatedAt).getTime()) / 86_400_000)
      out.push({
        id: 'stale-project',
        icon: 'trend',
        title: `잠자는 프로젝트: "${oldest.title}"`,
        description: `${daysSince}일 전 업데이트 · ${oldest.passage || '본문 미정'}`,
        cta: '이어서 작업',
        href: `/advanced/projects/${oldest.id}`,
        accent: daysSince > 7 ? 'amber' : 'indigo',
      })
    }

    // 2) 본문은 정했지만 연구가 0단계인 것
    const needsStudy = projects.filter((p) => p.status === 'research')
    if (needsStudy.length > 0) {
      out.push({
        id: 'needs-study',
        icon: 'book',
        title: `연구가 필요한 본문 ${needsStudy.length}개`,
        description: '본문 해석과 원어 연구를 시작하면 설교 깊이가 달라집니다',
        cta: '연구 시작하기',
        href: '/advanced/projects?status=research',
        accent: 'pink',
      })
    }

    // 3) 검토 단계 (거의 다 됨)
    const inReview = projects.filter((p) => p.status === 'review')
    if (inReview.length > 0) {
      out.push({
        id: 'review-ready',
        icon: 'file',
        title: `검토 대기 설교 ${inReview.length}개`,
        description: '마지막 검토만 마치면 완료 단계로 이동할 수 있어요',
        cta: '검토하러 가기',
        href: '/advanced/projects?status=review',
        accent: 'emerald',
      })
    }

    // 4) 새 프로젝트 (0개일 때)
    if (projects.length === 0) {
      out.push({
        id: 'new-project',
        icon: 'sparkle',
        title: '첫 설교 프로젝트를 시작해보세요',
        description: '본문을 정하고 AI의 도움으로 설교를 준비할 수 있습니다',
        cta: '새 프로젝트',
        href: '/advanced/projects/new',
        accent: 'indigo',
      })
    }

    return out.slice(0, 3)
  }, [projects])

  if (recommendations.length === 0) {
    return null
  }

  return (
    <section className="glass-dark p-6 rounded-2xl border border-white/10">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-amber-400" />
        <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">AI 추천</h2>
        <span className="text-[10px] text-slate-600 font-medium">Smart Recommendations</span>
      </div>

      <div className="space-y-2">
        {recommendations.map((rec) => {
          const accent = ACCENT_MAP[rec.accent]
          const Icon = rec.icon === 'book' ? BookOpen : rec.icon === 'file' ? FileText : rec.icon === 'trend' ? TrendingUp : Sparkles
          return (
            <button
              key={rec.id}
              onClick={() => router.push(rec.href)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border ${accent.border} ${accent.bg} hover:scale-[1.01] transition-all text-left group`}
            >
              <div className={`w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0 border ${accent.border}`}>
                <Icon className={`w-4 h-4 ${accent.icon}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-[12px] font-extrabold ${accent.text} line-clamp-1`}>
                  {rec.title}
                </p>
                <p className="text-[10px] text-slate-400 font-medium line-clamp-1 mt-0.5">
                  {rec.description}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className={`text-[10px] font-bold ${accent.text} hidden sm:inline`}>{rec.cta}</span>
                <ArrowRight className={`w-3.5 h-3.5 ${accent.icon} group-hover:translate-x-0.5 transition-transform`} />
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
