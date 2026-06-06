'use client'

import { X, Share2, FileDown, Menu, CheckCircle, Loader2, AlertCircle, ChevronRight, BookOpen, Upload } from 'lucide-react'
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
        className={`fixed top-16 left-0 bottom-0 z-40 w-72 bg-[#f5f4f0] border-r border-[#e4e2dd] shadow-[1px_0_3px_rgba(0,0,0,0.01)] transform transition-all duration-300 ease-out lg:translate-x-0 lg:static lg:z-auto ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* 모바일 닫기 */}
          <div className="flex items-center justify-between px-5 h-14 lg:hidden">
            <span className="text-[14px] font-bold text-[#2c2a29] tracking-tight">메뉴</span>
            <button onClick={onClose} className="w-7 h-7 rounded-lg bg-white/50 hover:bg-white/80 flex items-center justify-center transition-all duration-200 border border-[#e4e2dd]">
              <X className="w-3.5 h-3.5 text-[#4a4744]" />
            </button>
          </div>

          {/* 사용량 */}
          <UsageSidebarBadge />

          {/* 업로드된 설교 버튼 */}
          <div className="px-5 pt-3">
            <Link
              href="/dashboard/sermons/uploaded"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-left text-[#6b6764] hover:text-[#2c2a29] hover:bg-[#eae8e3]/50 transition-all duration-200"
            >
              <Upload className="w-5 h-5 text-[#8d7a5b]" />
              <div>
                <span className="block text-[14px] font-bold tracking-tight text-[#2c2a29]">업로드된 설교</span>
                <span className="block text-[11px] mt-0.5 font-medium text-[#8a8580]">파일 관리</span>
              </div>
            </Link>
          </div>

          {/* 구분선 */}
          <div className="mx-5 h-px bg-[#e4e2dd] my-2" />

          {/* 네비게이션 */}
          <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
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
                    className={`relative w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                      isActive
                        ? 'bg-[#eae7e0] text-[#2c2a29]'
                        : 'text-[#6b6764] hover:text-[#2c2a29] hover:bg-[#eae8e3]/50'
                    }`}
                  >
                    {/* 활성 인디케이터 */}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-full bg-[#8d7a5b]" />
                    )}

                    {/* 아이콘 */}
                    <span className={`text-[18px] transition-transform duration-200 ${
                      isActive ? 'scale-110' : 'group-hover:scale-105'
                    }`}>
                      {item.icon}
                    </span>

                    {/* 텍스트 */}
                    <div className="flex-1 text-left min-w-0">
                      <span className={`block text-[14px] font-bold tracking-tight truncate transition-colors duration-200 ${
                        isActive ? 'text-[#2c2a29]' : 'text-[#4a4744] group-hover:text-[#2c2a29]'
                      }`}>
                        {item.label}
                      </span>
                      <span className={`block text-[11px] mt-0.5 font-medium transition-colors duration-200 ${
                        isActive ? 'text-[#8a8580]' : 'text-[#8a8580] group-hover:text-[#6b6764]'
                      }`}>
                        {item.description}
                      </span>
                    </div>

                    {/* 상태 */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {status === 'done' ? (
                        <div className="relative">
                          <CheckCircle className="w-[18px] h-[18px] text-[#8d7a5b] drop-shadow-sm" />
                        </div>
                      ) : status === 'generating' ? (
                        <Loader2 className="w-[18px] h-[18px] text-[#8d7a5b] animate-spin" />
                      ) : status === 'error' ? (
                        <AlertCircle className="w-[18px] h-[18px] text-red-500" />
                      ) : (
                        <ChevronRight className={`w-4 h-4 transition-all duration-200 ${
                          isActive ? 'text-[#8a8580]/50 translate-x-0' : 'text-[#8a8580]/30 group-hover:text-[#8a8580]/50 group-hover:translate-x-0.5'
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
            <p className="text-[10px] text-[#8a8580]/40 text-center font-medium tracking-[0.15em]">v0.1.0</p>
          </div>
        </div>
      </aside>
    </>
  )
}
