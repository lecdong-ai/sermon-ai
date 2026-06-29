'use client'

import { useState, useEffect } from 'react'
import type { ContiTeam, ContiTeamMember, ContiAssignment, MemberRole } from '@/types/conti'
import { ALL_MEMBER_ROLES, MEMBER_ROLE_META } from '@/types/conti'
import {
  loadMockTeams, loadMockTeamMembers, loadMockAssignments,
  saveMockAssignments, deleteMockContiData,
} from '@/lib/conti/mockStorage'
import {
  getSampleTeams, getSampleMembers,
} from '@/lib/conti/samples'
import TeamRoleBadge from './TeamRoleBadge'
import MemberAvatar from './MemberAvatar'
import { Users, Plus, X, Save, ChevronDown, ChevronUp, Music } from 'lucide-react'

interface Props {
  contiId: string
  totalSongs: number
  songTitles: string[]                  // 곡 제목 (곡별 배정용)
  onChanged?: () => void
}

export default function ContiAssignments({ contiId, totalSongs, songTitles, onChanged }: Props) {
  const [teams, setTeams] = useState<ContiTeam[]>([])
  const [members, setMembers] = useState<ContiTeamMember[]>([])
  const [assignments, setAssignments] = useState<ContiAssignment[]>([])
  const [expanded, setExpanded] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const storedT = loadMockTeams()
    const storedM = loadMockTeamMembers()
    const storedA = loadMockAssignments()
    setTeams(storedT.length > 0 ? storedT : getSampleTeams())
    setMembers(storedM.length > 0 ? storedM : getSampleMembers())
    setAssignments(storedA)
  }, [])

  if (!mounted) return null

  const contiAssignments = assignments.filter((a) => a.conti_id === contiId)
  // song_position 0 = 전체 (곡 무관)
  const overallAssignments = contiAssignments.filter((a) => a.song_position === 0)
  const songSpecificAssignments = contiAssignments.filter((a) => a.song_position > 0)

  function getMember(id: string): ContiTeamMember | undefined {
    return members.find((m) => m.id === id)
  }

  function handleAddAssignment(memberId: string, role: MemberRole, songPosition: number) {
    const newAs: ContiAssignment = {
      id: `as-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      conti_id: contiId,
      member_id: memberId,
      song_position: songPosition,
      role,
      note: '',
    }
    const next = [...assignments, newAs]
    setAssignments(next)
    saveMockAssignments(next)
    onChanged?.()
  }

  function handleRemoveAssignment(id: string) {
    const next = assignments.filter((a) => a.id !== id)
    setAssignments(next)
    saveMockAssignments(next)
    onChanged?.()
  }

  function handleChangeRole(id: string, role: MemberRole) {
    const next = assignments.map((a) => (a.id === id ? { ...a, role } : a))
    setAssignments(next)
    saveMockAssignments(next)
    onChanged?.()
  }

  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-2.5 flex items-center gap-2 hover:bg-white/[0.03] transition-colors"
      >
        <Users className="w-3.5 h-3.5 text-amber-300" />
        <h3 className="text-[13px] font-extrabold text-slate-200">
          팀 배정 ({contiAssignments.length}건)
        </h3>
        <span className="text-[11px] text-slate-600 font-medium">전체 {overallAssignments.length}명 · 곡별 {songSpecificAssignments.length}건</span>
        <div className="ml-auto">
          {expanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-white/5 p-3 space-y-3">
          {contiAssignments.length === 0 ? (
            <div className="text-center py-3 text-[13px] text-slate-500 font-medium">
              아직 배정된 팀원이 없습니다.
            </div>
          ) : (
            <>
              {/* 전체 (곡 무관) 배정 */}
              {overallAssignments.length > 0 && (
                <div>
                  <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500 mb-1.5">
                    전체
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {overallAssignments.map((a) => {
                      const member = getMember(a.member_id)
                      if (!member) return null
                      return (
                        <div key={a.id} className="group flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-md bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all">
                          <MemberAvatar name={member.name} color={member.color} size="sm" />
                          <TeamRoleBadge role={a.role} size="xs" />
                          <button
                            onClick={() => handleRemoveAssignment(a.id)}
                            className="ml-1 p-0.5 rounded text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* 곡별 배정 */}
              {songSpecificAssignments.length > 0 && (
                <div>
                  <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500 mb-1.5 flex items-center gap-1">
                    <Music className="w-2.5 h-2.5" /> 곡별 특별 배정
                  </div>
                  <div className="space-y-1">
                    {songSpecificAssignments.map((a) => {
                      const member = getMember(a.member_id)
                      if (!member) return null
                      const songTitle = songTitles[a.song_position - 1] || `${a.song_position}번`
                      return (
                        <div key={a.id} className="group flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-white/[0.03] border border-white/5">
                          <span className="text-[12px] font-extrabold text-slate-500 w-12 flex-shrink-0">
                            {a.song_position}번
                          </span>
                          <span className="text-[12px] text-slate-300 font-medium truncate flex-1 min-w-0">
                            {songTitle}
                          </span>
                          <MemberAvatar name={member.name} color={member.color} size="sm" />
                          <TeamRoleBadge role={a.role} size="xs" />
                          <button
                            onClick={() => handleRemoveAssignment(a.id)}
                            className="ml-auto p-1 rounded text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {/* 추가 버튼 */}
          <button
            onClick={() => setShowPicker(true)}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-md border border-dashed border-white/10 text-[12px] font-bold text-slate-400 hover:text-amber-300 hover:border-amber-500/30 hover:bg-amber-500/5 transition-colors"
          >
            <Plus className="w-3 h-3" />
            팀원 배정 추가
          </button>
        </div>
      )}

      {showPicker && (
        <AssignmentPicker
          members={members}
          onClose={() => setShowPicker(false)}
          onAdd={handleAddAssignment}
          totalSongs={totalSongs}
        />
      )}
    </div>
  )
}

function AssignmentPicker({
  members, totalSongs, onClose, onAdd,
}: {
  members: ContiTeamMember[]
  totalSongs: number
  onClose: () => void
  onAdd: (memberId: string, role: MemberRole, songPosition: number) => void
}) {
  const [selectedMember, setSelectedMember] = useState<string | null>(null)
  const [role, setRole] = useState<MemberRole>('vocal1')
  const [songPosition, setSongPosition] = useState<number>(0)  // 0 = 전체

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#03050c]/85 backdrop-blur-md" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-[#0a0f1f] border border-white/10 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-[16px] font-bold text-white">팀원 배정 추가</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/5 text-slate-400"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-3">
          {/* 팀원 선택 */}
          <div>
            <label className="text-[12px] font-bold text-slate-400 mb-1.5 block">팀원</label>
            <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto scrollbar-thin">
              {members.length === 0 ? (
                <p className="col-span-2 text-[12px] text-slate-500 font-medium text-center py-3">
                  먼저 팀 관리에서 팀원을 추가하세요.
                </p>
              ) : (
                members.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMember(m.id)}
                    className={`flex items-center gap-2 p-2 rounded-md border transition-all ${
                      selectedMember === m.id
                        ? 'bg-amber-500/15 border-amber-500/40'
                        : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]'
                    }`}
                  >
                    <MemberAvatar name={m.name} color={m.color} size="sm" />
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-[13px] font-bold text-white truncate">{m.name}</p>
                      <p className="text-[11px] text-slate-500 font-medium truncate">
                        {MEMBER_ROLE_META[m.primary_role].icon} {MEMBER_ROLE_META[m.primary_role].label}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* 역할 선택 */}
          <div>
            <label className="text-[12px] font-bold text-slate-400 mb-1.5 block">역할</label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_MEMBER_ROLES.map((r) => {
                const meta = MEMBER_ROLE_META[r]
                const isActive = role === r
                return (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={`px-2 py-1 rounded-md text-[12px] font-bold transition-colors flex items-center gap-1 ${
                      isActive
                        ? 'bg-amber-500 text-[#0a0f1f]'
                        : 'bg-white/5 text-slate-300 border border-white/5 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-[12px] leading-none">{meta.icon}</span>
                    {meta.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 곡 선택 (0 = 전체) */}
          <div>
            <label className="text-[12px] font-bold text-slate-400 mb-1.5 block">대상 곡</label>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSongPosition(0)}
                className={`px-2.5 py-1 rounded-md text-[12px] font-bold transition-colors ${
                  songPosition === 0
                    ? 'bg-amber-500 text-[#0a0f1f]'
                    : 'bg-white/5 text-slate-300 border border-white/5 hover:bg-white/10'
                }`}
              >
                전체 (모든 곡)
              </button>
              {Array.from({ length: totalSongs }, (_, i) => i + 1).map((pos) => (
                <button
                  key={pos}
                  onClick={() => setSongPosition(pos)}
                  className={`px-2.5 py-1 rounded-md text-[12px] font-bold transition-colors ${
                    songPosition === pos
                      ? 'bg-amber-500 text-[#0a0f1f]'
                      : 'bg-white/5 text-slate-300 border border-white/5 hover:bg-white/10'
                  }`}
                >
                  {pos}번
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="px-5 py-3 border-t border-white/5 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-[13px] font-bold text-slate-400 hover:bg-white/5">취소</button>
          <button
            onClick={() => {
              if (!selectedMember) {
                alert('팀원을 선택하세요.')
                return
              }
              onAdd(selectedMember, role, songPosition)
              onClose()
            }}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-[#0a0f1f] text-[13px] font-extrabold flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            배정
          </button>
        </div>
      </div>
    </div>
  )
}
