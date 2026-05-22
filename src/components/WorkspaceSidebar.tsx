'use client'

import { X, Share2, FileDown, Menu, CheckCircle, Loader2, AlertCircle, ChevronRight, BookOpen } from 'lucide-react'
import Link from 'next/link'
import type { SermonRecord } from '@/types'
import UsageSidebarBadge from './UsageSidebarBadge'

interface NavItem {
  id: string
  label: string
  icon: string
  description: string
}

const NAV_ITEMS: NavItem[] = [
  { id: 'summary', label: '설교 요약', icon: '📄', description: '설교 핵심 요약' },
  { id: 'groupDiscussion', label: '나눔 자료', icon: '💬', description: '연령별 나눔 질문' },
  { id: 'cardNews', label: '카드뉴스', icon: '🎴', description: 'SNS 카드 콘텐츠' },
  { id: 'sermonScript', label: '유튜브 설교대본', icon: '🎙️', description: '유튜브 설교 대본' },
  { id: 'shortsScript', label: '유튜브 쇼츠대본', icon: '📱', description: '유튜브 쇼츠 스크립트' },
  { id: 'pptData', label: 'PPT 자료', icon: '📊', description: '슬라이드 아웃라인' },
]

interface Props {
  sermon: SermonRecord
  activeTab: string
  onTabChange: (id: string) => void
  onShare: () => void
  onDownloadPPT: () => void
  open: boolean
  onClose: () => void
  sermonId?: string
}

function getItemStatus(sermon: SermonRecord, itemId: string): 'done' | 'idle' | 'generating' | 'error' {
  const result = (sermon.result as any)?.[itemId]
  return result ? 'done' : 'idle'
}

export default function WorkspaceSidebar({
  sermon,
  activeTab,
  onTabChange,
  onShare,
  onDownloadPPT,
  open,
  onClose,
  sermonId,
}: Props) {
  const doneCount = NAV_ITEMS.filter((item) => getItemStatus(sermon, item.id) === 'done').length
  const totalCount = NAV_ITEMS.length
  const progressPercent = Math.round((doneCount / totalCount) * 100)

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-16 left-0 bottom-0 z-40 w-72 bg-gradient-to-b from-[#14181f] via-[#161b24] to-[#0f131a] border-r border-white/[0.06] shadow-2xl shadow-black/20 transform transition-all duration-300 ease-out lg:translate-x-0 lg:static lg:z-auto ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* 모바일 닫기 */}
          <div className="flex items-center justify-between px-5 h-14 lg:hidden">
            <span className="text-[15px] font-bold text-white/80 tracking-tight">메뉴</span>
            <button onClick={onClose} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all duration-200 border border-white/10">
              <X className="w-3.5 h-3.5 text-white/60" />
            </button>
          </div>

          {/* 사용량 */}
          <UsageSidebarBadge />

          {/* 구분선 */}
          <div className="mx-5 h-px bg-gradient-to-r from-white/0 via-white/10 to-white/0" />

          {/* 네비게이션 */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {NAV_ITEMS.map((item, idx) => {
              const isActive = activeTab === item.id
              const status = getItemStatus(sermon, item.id)
              return (
                <button
                  key={item.id}
                  onClick={() => { onTabChange(item.id); onClose() }}
                  className="group relative w-full"
                >
                  <div
                    className={`relative w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-primary-500/20 via-primary-400/10 to-transparent text-white shadow-lg shadow-primary-500/5'
                        : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04]'
                    }`}
                  >
                    {/* 활성 인디케이터 */}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-full bg-gradient-to-b from-primary-400 to-primary-500 shadow-sm shadow-primary-500/50" />
                    )}

                    {/* 아이콘 */}
                    <span className={`text-[20px] transition-transform duration-200 ${
                      isActive ? 'scale-110' : 'group-hover:scale-105'
                    }`}>
                      {item.icon}
                    </span>

                    {/* 텍스트 */}
                    <div className="flex-1 text-left min-w-0">
                      <span className={`block text-[15px] font-semibold tracking-tight truncate transition-colors duration-200 ${
                        isActive ? 'text-white' : 'text-white/70 group-hover:text-white/90'
                      }`}>
                        {item.label}
                      </span>
                      <span className={`block text-[11px] mt-0.5 font-medium transition-colors duration-200 ${
                        isActive ? 'text-white/40' : 'text-white/30 group-hover:text-white/40'
                      }`}>
                        {item.description}
                      </span>
                    </div>

                    {/* 상태 */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {status === 'done' ? (
                        <div className="relative">
                          <CheckCircle className="w-[18px] h-[18px] text-emerald-400 drop-shadow-sm" />
                          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping opacity-50" />
                        </div>
                      ) : status === 'generating' ? (
                        <Loader2 className="w-[18px] h-[18px] text-primary-400 animate-spin" />
                      ) : status === 'error' ? (
                        <AlertCircle className="w-[18px] h-[18px] text-red-400" />
                      ) : (
                        <ChevronRight className={`w-4 h-4 transition-all duration-200 ${
                          isActive ? 'text-white/30 translate-x-0' : 'text-white/10 group-hover:text-white/30 group-hover:translate-x-0.5'
                        }`} />
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </nav>

          {/* 하단 버전 */}
          <div className="px-5 py-3">
            <p className="text-[10px] text-white/15 text-center font-medium tracking-[0.15em]">v0.1.0</p>
          </div>
        </div>
      </aside>
    </>
  )
}
