'use client'

import type { ContiSet, ContiItem, MusicKey } from '@/types/conti'
import ContiItemListSortable from './ContiItemListSortable'
import ContiVisualAnalysis from './ContiVisualAnalysis'
import ContiAssignments from './ContiAssignments'
import WorshipTypeBadge from './WorshipTypeBadge'
import {
  Calendar, Music2, Sparkles, MessageSquare, Plus, ArrowRight,
  Share2, Printer, ChevronLeft, Loader2, Clock, Users,
  Sparkle, Wand2, Music4, Lightbulb, FileText,
} from 'lucide-react'

interface Props {
  conti: ContiSet
  items: ContiItem[]
  loading: boolean
  onClose: () => void
  onAddSong: () => void
  onAIRecommend: () => void
  onCoach: () => void
  onPrint: () => void
  onSheetMusicEdit: () => void
  onShare: () => void
  onReorder: (newOrder: ContiItem[]) => void
  onRemove: (itemId: string) => void
  onUpdateItem: (item: ContiItem) => void
}

function formatDateLong(iso: string | null): string {
  if (!iso) return '날짜 미정'
  const d = new Date(iso)
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${['일', '월', '화', '수', '목', '금', '토'][d.getDay()]})`
}

function formatDateShort(iso: string | null): string {
  if (!iso) return '날짜 미정'
  const d = new Date(iso)
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${['일', '월', '화', '수', '목', '금', '토'][d.getDay()]})`
}

export default function ContiDetail({
  conti, items, loading,
  onClose, onAddSong, onAIRecommend, onCoach, onPrint, onSheetMusicEdit, onShare,
  onReorder, onRemove, onUpdateItem,
}: Props) {
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#080d22]/30">
        <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
      </div>
    )
  }

  // 통계 계산
  const totalDuration = items.reduce((acc, item) => acc + (item.song?.duration_sec ?? 0), 0)
  const totalMinutes = Math.floor(totalDuration / 60)
  const totalSeconds = totalDuration % 60

  const bpms = items.map((i) => i.bpm_override ?? i.song?.bpm ?? null).filter((b): b is number => b != null)
  const avgBpm = bpms.length > 0 ? Math.round(bpms.reduce((a, b) => a + b, 0) / bpms.length) : null
  const minBpm = bpms.length ? Math.min(...bpms) : null
  const maxBpm = bpms.length ? Math.max(...bpms) : null

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-gradient-to-br from-[#080d22]/40 to-[#050814]/40 overflow-hidden relative">
      {/* 배경 글로우 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -right-20 w-[500px] h-[500px] rounded-full bg-indigo-500/[0.04] blur-[100px]" />
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-purple-500/[0.04] blur-[100px]" />
      </div>

      {items.length === 0 ? (
        /* ═══════════ HERO STAGE (빈 상태 — 강화 버전) ═══════════ */
        <div className="flex-1 flex items-center justify-center px-6 py-6 relative overflow-y-auto">
          <div className="max-w-5xl w-full">
            {/* 떠 있는 음표 일러스트 (자동 애니메이션) */}
            <div className="relative h-48 sm:h-56 flex items-center justify-center mb-6">
              {/* 메인 halo */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-56 h-56 rounded-full bg-gradient-to-br from-indigo-500/20 via-purple-500/15 to-rose-500/10 blur-3xl" />
              </div>

              {/* 떠 있는 음표들 (자동 애니메이션) */}
              <FloatingNote className="absolute top-2 left-[12%] text-indigo-300/60" delay="0s" duration="3.5s" rotate={-12}>♪</FloatingNote>
              <FloatingNote className="absolute top-10 right-[15%] text-purple-300/60" delay="0.6s" duration="4s" rotate={8}>♫</FloatingNote>
              <FloatingNote className="absolute bottom-6 left-[18%] text-rose-300/50" delay="1.2s" duration="3.8s" rotate={-6}>♩</FloatingNote>
              <FloatingNote className="absolute bottom-2 right-[10%] text-amber-300/50" delay="0.3s" duration="4.2s" rotate={15}>♬</FloatingNote>
              <FloatingNote className="absolute top-1/2 left-[8%] -translate-y-1/2 text-cyan-300/40" delay="1.5s" duration="3.2s" rotate={-18}>♪</FloatingNote>
              <FloatingNote className="absolute top-1/2 right-[6%] -translate-y-1/2 text-emerald-300/40" delay="0.9s" duration="3.6s" rotate={20}>♫</FloatingNote>

              {/* Sparkles 장식 (다양한 위치) */}
              <Sparkle className="absolute top-4 left-1/4 w-4 h-4 text-indigo-300/40 animate-pulse" />
              <Sparkle className="absolute top-8 right-1/4 w-3 h-3 text-purple-300/40 animate-pulse" style={{ animationDelay: '0.5s' }} />
              <Sparkle className="absolute bottom-10 left-1/3 w-3 h-3 text-amber-300/40 animate-pulse" style={{ animationDelay: '1s' }} />
              <Sparkle className="absolute top-1/3 left-[5%] w-2 h-2 text-rose-300/40 animate-pulse" style={{ animationDelay: '1.5s' }} />
              <Sparkle className="absolute bottom-1/4 right-[5%] w-2 h-2 text-cyan-300/40 animate-pulse" style={{ animationDelay: '0.8s' }} />

              {/* 메인 로고 카드 (네온 효과 강화) */}
              <div className="relative px-10 py-6 rounded-3xl bg-gradient-to-br from-white/[0.10] via-white/[0.05] to-white/[0.02] border border-white/15 backdrop-blur-md shadow-2xl shadow-indigo-500/20">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-purple-500/0" />
                <div className="relative flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/50 ring-1 ring-white/20">
                    <Music2 className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-[12px] font-extrabold uppercase tracking-[0.25em] text-indigo-300 mb-0.5">
                      Conti Workshop
                    </p>
                    <p className="text-base font-extrabold text-white">콘티 라이브러리</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 메인 타이틀 (더 크게 + 더 세련된 그라디언트) */}
            <div className="text-center space-y-3 mb-8">
              <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95]">
                <span className="bg-gradient-to-br from-white via-indigo-100 to-purple-200 bg-clip-text text-transparent">
                  예배 콘티
                </span>
                <br />
                <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-rose-300 bg-clip-text text-transparent">
                  제작실
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto">
                찬양 세트를 한눈에 배치하고,<br className="sm:hidden" />
                AI의 검수와 추천을 받으세요.
              </p>
            </div>

            {/* 3단계 가이드 (번호 + 화살표) */}
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr_auto_1fr] gap-3 sm:gap-2 items-stretch max-w-3xl mx-auto mb-8">
              <StepCard
                num={1}
                icon={Music4}
                title="콘티 생성"
                desc="날짜/유형 지정"
                color="indigo"
              />
              <ArrowDivider />
              <StepCard
                num={2}
                icon={Plus}
                title="곡 추가"
                desc="라이브러리에서"
                color="purple"
              />
              <ArrowDivider />
              <StepCard
                num={3}
                icon={Wand2}
                title="AI 검수"
                desc="추천 + 코치"
                color="amber"
              />
            </div>

            {/* 3대 기능 카드 (3D 호버 효과) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto mb-6">
              {[
                {
                  icon: Music4,
                  title: '드래그 편집',
                  desc: '곡 순서 자유롭게',
                  gradient: 'from-indigo-500/20 to-indigo-500/5',
                  border: 'border-indigo-500/20 hover:border-indigo-500/40',
                  iconBg: 'bg-indigo-500/15',
                },
                {
                  icon: Wand2,
                  title: 'AI 추천',
                  desc: '분위기 → 자동 배치',
                  gradient: 'from-amber-500/20 to-amber-500/5',
                  border: 'border-amber-500/20 hover:border-amber-500/40',
                  iconBg: 'bg-amber-500/15',
                },
                {
                  icon: Printer,
                  title: '인쇄 3모드',
                  desc: '팀/인도자/PPT',
                  gradient: 'from-emerald-500/20 to-emerald-500/5',
                  border: 'border-emerald-500/20 hover:border-emerald-500/40',
                  iconBg: 'bg-emerald-500/15',
                },
              ].map((f, i) => (
                <div
                  key={i}
                  className={`group relative p-5 rounded-2xl bg-gradient-to-br ${f.gradient} border ${f.border} transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}
                >
                  <div className={`w-10 h-10 rounded-xl ${f.iconBg} flex items-center justify-center mb-3 mx-auto group-hover:scale-110 transition-transform`}>
                    <f.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-[15px] font-extrabold text-white mb-0.5">{f.title}</p>
                  <p className="text-[12px] text-slate-500 font-medium">{f.desc}</p>
                </div>
              ))}
            </div>

            {/* 미니 통계 (사회적 증거) */}
            <div className="flex items-center justify-center gap-6 sm:gap-8 mb-6 flex-wrap">
              <MiniStat icon={Users} value="50+" label="사용 중인 목회자" />
              <MiniStat icon={Music2} value="200+" label="등록된 찬양" />
              <MiniStat icon={Sparkles} value="95%" label="AI 검수 정확도" />
            </div>

            {/* CTA 버튼들 */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 mb-4">
              <button
                onClick={onAddSong}
                className="group flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white text-[15px] font-bold transition-all hover:-translate-y-0.5"
              >
                <Plus className="w-4 h-4" />
                곡 라이브러리에서 선택
              </button>
              <button
                onClick={onAIRecommend}
                className="group flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:via-purple-500 hover:to-indigo-500 text-white text-[15px] font-extrabold transition-all shadow-xl shadow-indigo-600/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5"
              >
                <Sparkles className="w-4 h-4" />
                AI 추천으로 시작
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Tip */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/5 border border-indigo-500/15">
              <Lightbulb className="w-3 h-3 text-amber-300" />
              <span className="text-[12px] text-slate-400 font-medium">
                <strong className="text-amber-200">Tip:</strong> AI 추천이 가장 빠른 시작점이에요
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* ═══════════ 콘티 선택됨 (헤더 + 차트 + 곡 리스트) ═══════════ */
        <>
          {/* 메인 헤더 */}
          <div className="px-3 sm:px-4 pt-2.5 pb-2.5 border-b border-white/5 bg-gradient-to-b from-[#0a0f1f]/80 to-transparent backdrop-blur-md relative">
            <div className="max-w-6xl mx-auto">
              {/* 상단: 뱃지들 */}
              <div className="flex items-center gap-1.5 mb-2">
                <button
                  onClick={onClose}
                  className="p-1 rounded hover:bg-white/5 text-slate-400 hover:text-white transition-colors md:hidden"
                  title="뒤로"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <WorshipTypeBadge type={conti.worship_type} />
                {conti.is_public && (
                  <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold">
                    공개
                  </span>
                )}
                <span className="ml-auto text-[12px] text-slate-500 font-medium">
                  {formatDateLong(conti.date)}
                </span>
              </div>

              {/* 메인 타이틀 + 메타 (컴팩트) */}
              <div className="flex items-end justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight leading-tight">
                    <span className="bg-gradient-to-br from-white via-indigo-50 to-purple-100 bg-clip-text text-transparent">
                      {conti.title}
                    </span>
                  </h1>
                  <div className="flex items-center gap-2.5 mt-1.5 text-[13px] text-slate-400 font-medium flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-indigo-300" />
                      {formatDateShort(conti.date)}
                    </span>
                    <span className="text-slate-700">·</span>
                    <span className="flex items-center gap-1">
                      <Music2 className="w-3 h-3 text-purple-300" />
                      <strong className="text-white font-extrabold">{items.length}</strong>곡
                    </span>
                    {totalDuration > 0 && (
                      <>
                        <span className="text-slate-700">·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-emerald-300" />
                          <strong className="text-white font-extrabold">
                            {totalMinutes}:{String(totalSeconds).padStart(2, '0')}
                          </strong>
                        </span>
                      </>
                    )}
                    {avgBpm && (
                      <>
                        <span className="text-slate-700">·</span>
                        <span className="flex items-center gap-1">
                          <span className="text-[11px] text-slate-500">평균</span>
                          <strong className="text-white font-extrabold">♩{avgBpm}</strong>
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* 메모 */}
              {conti.memo && (
                <div className="mt-2 px-3 py-2 rounded-lg bg-gradient-to-r from-amber-500/[0.08] to-transparent border border-amber-500/20 flex items-start gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-amber-300 flex-shrink-0 mt-0.5" />
                  <p className="text-[13px] text-amber-100/90 font-medium leading-relaxed">{conti.memo}</p>
                </div>
              )}

              {/* 팀 배정 */}
              <div className="mt-2">
                <ContiAssignments
                  contiId={conti.id}
                  totalSongs={items.length}
                  songTitles={items.map((it) => it.song?.title || '')}
                />
              </div>
            </div>
          </div>

          {/* 본문 */}
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 space-y-4">
              {/* 시각 분석 */}
              <ContiVisualAnalysis items={items} />

              {/* 곡 리스트 헤더 */}
              <div className="flex items-end justify-between border-b border-white/5 pb-2">
                <div>
                  <h2 className="text-[15px] font-extrabold text-white tracking-tight flex items-center gap-1.5">
                    <Music2 className="w-3.5 h-3.5 text-indigo-300" />
                    곡 순서
                    <span className="text-[12px] font-bold text-slate-500 bg-white/5 px-1.5 py-0.5 rounded-full">
                      {items.length}
                    </span>
                  </h2>
                  <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                    드래그로 순서 변경 · 호버 시 편집/삭제
                  </p>
                </div>
                <button
                  onClick={onAddSong}
                  className="flex items-center gap-1 px-2 py-1 rounded-md bg-indigo-600/15 hover:bg-indigo-600/25 text-indigo-300 hover:text-indigo-200 text-[12px] font-bold border border-indigo-500/30 transition-all"
                >
                  <Plus className="w-3 h-3" />
                  곡 추가
                </button>
              </div>

              {/* 곡 리스트 */}
              <ContiItemListSortable
                items={items}
                onReorder={onReorder}
                onRemove={onRemove}
                onUpdate={onUpdateItem}
                onAdd={onAddSong}
              />
            </div>
          </div>

          {/* Sticky Action Bar (하단 고정) */}
          <div className="border-t border-white/5 bg-gradient-to-t from-[#0a0f1f]/95 to-[#0a0f1f]/70 backdrop-blur-md">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-1.5 flex items-center gap-1.5 overflow-x-auto scrollbar-thin">
              <ActionChip icon={Wand2} label="AI 추천" gradient onClick={onAIRecommend} />
              <ActionChip icon={Sparkles} label="AI 코치" onClick={onCoach} />
              <ActionChip icon={FileText} label="악보 편집" onClick={onSheetMusicEdit} />
              <ActionChip icon={Printer} label="인쇄" onClick={onPrint} />
              <ActionChip icon={Share2} label="공유" onClick={onShare} />
              <div className="w-px h-4 bg-white/10 mx-0.5 flex-shrink-0" />
              <ActionChip icon={Plus} label="곡 추가" variant="primary" onClick={onAddSong} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function ActionChip({
  icon: Icon, label, onClick, gradient = false, variant = 'default',
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  onClick: () => void
  gradient?: boolean
  variant?: 'default' | 'primary'
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-bold transition-all hover:-translate-y-0.5 flex-shrink-0 ${
        variant === 'primary'
          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/30'
          : gradient
          ? 'bg-gradient-to-r from-amber-500/20 to-rose-500/20 hover:from-amber-500/30 hover:to-rose-500/30 border border-amber-500/30 text-amber-100'
          : 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-slate-200'
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  )
}

// 떠 있는 음표 (자동 애니메이션)
function FloatingNote({
  children, className = '', delay = '0s', duration = '3.5s', rotate = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: string
  duration?: string
  rotate?: number
}) {
  return (
    <span
      className={`text-3xl sm:text-4xl font-extrabold select-none pointer-events-none ${className}`}
      style={{
        animation: `floatNote ${duration} ease-in-out ${delay} infinite alternate`,
        transform: `rotate(${rotate}deg)`,
        textShadow: '0 0 20px currentColor',
      }}
    >
      {children}
      <style jsx>{`
        @keyframes floatNote {
          0% { transform: translateY(0px) rotate(${rotate}deg); opacity: 0.6; }
          100% { transform: translateY(-15px) rotate(${rotate}deg); opacity: 1; }
        }
      `}</style>
    </span>
  )
}

// 화살표 구분선 (3단계 가이드용)
function ArrowDivider() {
  return (
    <div className="hidden sm:flex items-center justify-center text-slate-600">
      <ArrowRight className="w-4 h-4" />
    </div>
  )
}

// 3단계 가이드 카드
function StepCard({
  num, icon: Icon, title, desc, color,
}: {
  num: number
  icon: React.ComponentType<{ className?: string }>
  title: string
  desc: string
  color: 'indigo' | 'purple' | 'amber'
}) {
  const colorMap = {
    indigo: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', text: 'text-indigo-300', numBg: 'from-indigo-500 to-indigo-600' },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-300', numBg: 'from-purple-500 to-purple-600' },
    amber:  { bg: 'bg-amber-500/10',  border: 'border-amber-500/30',  text: 'text-amber-300',  numBg: 'from-amber-500 to-amber-600'  },
  }[color]

  return (
    <div className={`relative p-4 rounded-2xl ${colorMap.bg} border ${colorMap.border} hover:-translate-y-0.5 transition-all`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorMap.numBg} flex items-center justify-center text-white text-sm font-black shadow-md flex-shrink-0`}>
          {num}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <Icon className={`w-3.5 h-3.5 ${colorMap.text}`} />
            <p className="text-[14px] font-extrabold text-white">{title}</p>
          </div>
          <p className="text-[12px] text-slate-500 font-medium mt-0.5">{desc}</p>
        </div>
      </div>
    </div>
  )
}

// 미니 통계 (사회적 증거)
function MiniStat({
  icon: Icon, value, label,
}: {
  icon: React.ComponentType<{ className?: string }>
  value: string
  label: string
}) {
  return (
    <div className="flex items-center gap-2 text-left">
      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-indigo-300" />
      </div>
      <div>
        <p className="text-base font-extrabold text-white tabular-nums leading-none">{value}</p>
        <p className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">{label}</p>
      </div>
    </div>
  )
}
