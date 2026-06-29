'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Suspense } from 'react'
import {
  ContiTeam, ContiTeamMember, ContiAssignment, MemberRole,
} from '@/types/conti'
import {
  getSampleTeams, getSampleMembers, getSampleAssignmentsByConti, getSampleMemberById,
} from '@/lib/conti/samples'
import {
  loadMockTeams, saveMockTeams,
  loadMockTeamMembers, saveMockTeamMembers,
  loadMockAssignments, saveMockAssignments,
} from '@/lib/conti/mockStorage'
import TeamRoleBadge from '@/components/conti/TeamRoleBadge'
import MemberAvatar, { getRandomColor } from '@/components/conti/MemberAvatar'
import { ALL_MEMBER_ROLES, MEMBER_ROLE_META } from '@/types/conti'
import { SAMPLE_CONTIS } from '@/lib/conti/samples'
import { getSampleSongById } from '@/lib/conti/samples'
import {
  Users, Plus, X, User, Music, ChevronRight, Mail, Loader2, Edit3, Trash2, Save, Calendar, Music2,
} from 'lucide-react'
import Link from 'next/link'

function TeamsPageInner() {
  const router = useRouter()
  const [teams, setTeams] = useState<ContiTeam[]>([])
  const [members, setMembers] = useState<ContiTeamMember[]>([])
  const [assignments, setAssignments] = useState<ContiAssignment[]>([])
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  // 모달 상태
  const [showNewTeam, setShowNewTeam] = useState(false)
  const [editingMember, setEditingMember] = useState<ContiTeamMember | null>(null)
  const [showAddMember, setShowAddMember] = useState(false)

  // 로드
  const loadAll = useCallback(() => {
    const storedTeams = loadMockTeams()
    const storedMembers = loadMockTeamMembers()
    const storedAssignments = loadMockAssignments()

    // mock 데이터와 병합 (저장된 것이 우선)
    const sampleT = getSampleTeams()
    const sampleM = getSampleMembers()
    const finalTeams = storedTeams.length > 0 ? storedTeams : sampleT
    const finalMembers = storedMembers.length > 0 ? storedMembers : sampleM
    setTeams(finalTeams)
    setMembers(finalMembers)
    setAssignments(storedAssignments)
    if (!selectedTeamId && finalTeams.length > 0) setSelectedTeamId(finalTeams[0].id)
  }, [selectedTeamId])

  useEffect(() => {
    setMounted(true)
    loadAll()
    setLoading(false)
  }, [loadAll])

  const selectedTeam = teams.find((t) => t.id === selectedTeamId) || null
  const teamMembers = members.filter((m) => m.team_id === selectedTeamId)

  // ─── 팀 CRUD ───
  function handleCreateTeam(name: string, memo: string) {
    const now = new Date().toISOString()
    const newTeam: ContiTeam = {
      id: `team-${Date.now()}`,
      user_id: 'mock-user',
      name,
      memo,
      created_at: now,
      updated_at: now,
    }
    const next = [newTeam, ...teams]
    setTeams(next)
    saveMockTeams(next)
    setSelectedTeamId(newTeam.id)
    setShowNewTeam(false)
  }

  function handleDeleteTeam(id: string) {
    if (!confirm('이 팀과 모든 팀원이 삭제됩니다. 계속할까요?')) return
    const next = teams.filter((t) => t.id !== id)
    setTeams(next)
    saveMockTeams(next)
    // 팀원도 함께 삭제
    const nextMembers = members.filter((m) => m.team_id !== id)
    setMembers(nextMembers)
    saveMockTeamMembers(nextMembers)
    if (selectedTeamId === id) setSelectedTeamId(next[0]?.id || null)
  }

  // ─── 팀원 CRUD ───
  function handleAddMember(name: string, email: string, role: MemberRole) {
    if (!selectedTeamId) return
    const newMember: ContiTeamMember = {
      id: `mem-${Date.now()}`,
      team_id: selectedTeamId,
      name: name.trim(),
      email: email.trim() || null,
      primary_role: role,
      color: getRandomColor(),
      joined_at: new Date().toISOString(),
    }
    const next = [...members, newMember]
    setMembers(next)
    saveMockTeamMembers(next)
    setShowAddMember(false)
  }

  function handleUpdateMember(updated: ContiTeamMember) {
    const next = members.map((m) => (m.id === updated.id ? updated : m))
    setMembers(next)
    saveMockTeamMembers(next)
    setEditingMember(null)
  }

  function handleDeleteMember(id: string) {
    if (!confirm('이 팀원을 삭제할까요?')) return
    const next = members.filter((m) => m.id !== id)
    setMembers(next)
    saveMockTeamMembers(next)
    setEditingMember(null)
  }

  // 이 팀의 콘티 (배정 기반)
  const teamContiIds = Array.from(new Set(
    assignments
      .filter((a) => teamMembers.some((m) => m.id === a.member_id))
      .map((a) => a.conti_id)
  ))
  const teamContis = SAMPLE_CONTIS.filter((c) => teamContiIds.includes(c.id))

  if (!mounted || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#050814]">
        <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-[#050814] text-slate-200 overflow-hidden -mt-16 pt-16">
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-indigo-500/5 blur-[120px]" />
      </div>

      <div className="relative z-10 flex w-full h-full">
        <div className="w-72 flex-shrink-0 border-r border-white/5 bg-[#070b18] flex flex-col h-full">
          {/* 팀 헤더 */}
          <div className="px-4 pt-4 pb-3 border-b border-white/5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-300" />
                <h2 className="text-[16px] font-bold text-white">팀 관리</h2>
              </div>
              <button
                onClick={() => setShowNewTeam(true)}
                className="flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-[12px] font-bold border border-amber-500/30 transition-colors"
              >
                <Plus className="w-3 h-3" />
                새 팀
              </button>
            </div>
            <p className="text-[12px] text-slate-500 font-medium">팀원 관리 + 콘티별 역할 배정</p>
          </div>

          {/* 팀 목록 */}
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {teams.length === 0 ? (
              <div className="text-center py-12 px-4 text-[13px] text-slate-500 font-medium">
                아직 팀이 없습니다.<br />"새 팀" 버튼으로 시작하세요.
              </div>
            ) : (
              <ul className="py-1">
                {teams.map((team) => {
                  const teamCount = members.filter((m) => m.team_id === team.id).length
                  const isSelected = selectedTeamId === team.id
                  return (
                    <li key={team.id}>
                      <button
                        onClick={() => setSelectedTeamId(team.id)}
                        className={`w-full text-left px-4 py-3 border-l-2 transition-all ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-400'
                            : 'border-transparent hover:bg-white/[0.03]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <p className={`text-[14px] font-bold truncate ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                            {team.name}
                          </p>
                          <span className="text-[12px] text-slate-500 font-bold">{teamCount}명</span>
                        </div>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>

        {/* 메인: 팀 상세 */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#080d22]/30 overflow-hidden">
          {selectedTeam ? (
            <>
              {/* 팀 헤더 */}
              <div className="px-6 py-4 border-b border-white/5 bg-[#0a0f1f]/60 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Link
                        href="/conti"
                        className="text-[13px] text-slate-500 hover:text-white transition-colors"
                      >
                        ← 콘티로
                      </Link>
                    </div>
                    <h1 className="text-[22px] font-extrabold text-white tracking-tight">
                      {selectedTeam.name}
                    </h1>
                    {selectedTeam.memo && (
                      <p className="text-[13px] text-slate-400 font-medium mt-1">{selectedTeam.memo}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1.5 text-[12px] text-slate-500 font-medium">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {teamMembers.length}명
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Music2 className="w-3 h-3" />
                        {teamContis.length}개 콘티
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowAddMember(true)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-[13px] font-bold border border-amber-500/30"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      팀원 추가
                    </button>
                    <button
                      onClick={() => handleDeleteTeam(selectedTeam.id)}
                      className="p-2 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="팀 삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-5">
                {/* 팀원 그리드 */}
                <section>
                  <h2 className="text-[12px] font-extrabold uppercase tracking-widest text-slate-500 mb-2.5">
                    팀원 ({teamMembers.length})
                  </h2>
                  {teamMembers.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-[13px] text-slate-500 font-medium">
                      아직 팀원이 없습니다. "팀원 추가" 버튼으로 시작하세요.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {teamMembers.map((member) => {
                        const memberAssignments = assignments.filter((a) => a.member_id === member.id)
                        const contiCount = new Set(memberAssignments.map((a) => a.conti_id)).size
                        return (
                          <button
                            key={member.id}
                            onClick={() => setEditingMember(member)}
                            className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-amber-500/30 hover:bg-amber-500/[0.04] transition-all text-left group"
                          >
                            <MemberAvatar name={member.name} color={member.color} size="md" />
                            <div className="flex-1 min-w-0">
                              <p className="text-[14px] font-bold text-white truncate">{member.name}</p>
                              <div className="mt-1">
                                <TeamRoleBadge role={member.primary_role} size="xs" />
                              </div>
                              {member.email && (
                                <p className="text-[11px] text-slate-500 font-medium mt-1 truncate">{member.email}</p>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                              <span className="text-[12px] text-slate-400 font-bold">{contiCount}</span>
                              <span className="text-[10px] text-slate-600">콘티</span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </section>

                {/* 이 팀의 콘티 */}
                <section>
                  <h2 className="text-[12px] font-extrabold uppercase tracking-widest text-slate-500 mb-2.5">
                    이 팀이 배정된 콘티 ({teamContis.length})
                  </h2>
                  {teamContis.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-[13px] text-slate-500 font-medium">
                      콘티 헤더의 "팀 배정" 으로 이 팀을 콘티에 추가하세요.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {teamContis.map((c) => {
                        const teamAssignments = assignments.filter((a) => a.conti_id === c.id && teamMembers.some((m) => m.id === a.member_id))
                        return (
                          <Link
                            key={c.id}
                            href={`/conti?id=${c.id}`}
                            className="block p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-amber-500/30 transition-all group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex-1 min-w-0">
                                <p className="text-[14px] font-bold text-white truncate">{c.title}</p>
                                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                  {teamAssignments.slice(0, 4).map((a) => {
                                    const member = getSampleMemberById(a.member_id)
                                    if (!member) return null
                                    return (
                                      <div key={a.id} className="flex items-center gap-1">
                                        <MemberAvatar name={member.name} color={member.color} size="sm" />
                                        <TeamRoleBadge role={a.role} size="xs" />
                                      </div>
                                    )
                                  })}
                                  {teamAssignments.length > 4 && (
                                    <span className="text-[11px] text-slate-500 font-bold">+{teamAssignments.length - 4}</span>
                                  )}
                                </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-amber-300" />
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </section>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-[14px]">
              왼쪽에서 팀을 선택하거나 "새 팀" 으로 시작하세요.
            </div>
          )}
        </div>
      </div>

      {/* 모달들 */}
      {showNewTeam && (
        <NewTeamModal
          onClose={() => setShowNewTeam(false)}
          onCreate={handleCreateTeam}
        />
      )}
      {showAddMember && selectedTeamId && (
        <AddMemberModal
          teamName={selectedTeam?.name || ''}
          onClose={() => setShowAddMember(false)}
          onAdd={handleAddMember}
        />
      )}
      {editingMember && (
        <EditMemberModal
          member={editingMember}
          onClose={() => setEditingMember(null)}
          onSave={handleUpdateMember}
          onDelete={handleDeleteMember}
        />
      )}
    </div>
  )
}

// =========================================================================
// 모달들
// =========================================================================

function NewTeamModal({ onClose, onCreate }: { onClose: () => void; onCreate: (name: string, memo: string) => void }) {
  const [name, setName] = useState('')
  const [memo, setMemo] = useState('')

  function handleSubmit() {
    if (!name.trim()) {
      alert('팀 이름을 입력해 주세요.')
      return
    }
    onCreate(name.trim(), memo.trim())
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#03050c]/85 backdrop-blur-md" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-[#0a0f1f] border border-white/10 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-[16px] font-bold text-white">새 팀</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/5 text-slate-400"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <label className="text-[12px] font-bold text-slate-400 mb-1 block">팀 이름 *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: Bunker 찬양팀"
              autoFocus
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[14px] text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/40"
            />
          </div>
          <div>
            <label className="text-[12px] font-bold text-slate-400 mb-1 block">설명</label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="주일 오전 1교대 전담"
              rows={2}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[14px] text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/40 resize-y"
            />
          </div>
        </div>
        <div className="px-5 py-3 border-t border-white/5 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-[13px] font-bold text-slate-400 hover:bg-white/5">취소</button>
          <button onClick={handleSubmit} className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-[#0a0f1f] text-[13px] font-extrabold flex items-center gap-1.5">
            <Save className="w-3.5 h-3.5" />
            생성
          </button>
        </div>
      </div>
    </div>
  )
}

function AddMemberModal({ teamName, onClose, onAdd }: { teamName: string; onClose: () => void; onAdd: (name: string, email: string, role: MemberRole) => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<MemberRole>('vocal1')

  function handleSubmit() {
    if (!name.trim()) {
      alert('이름을 입력해 주세요.')
      return
    }
    onAdd(name, email, role)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#03050c]/85 backdrop-blur-md" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-[#0a0f1f] border border-white/10 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-[16px] font-bold text-white">팀원 추가 · {teamName}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/5 text-slate-400"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <label className="text-[12px] font-bold text-slate-400 mb-1 block">이름 *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 김은혜"
              autoFocus
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[14px] text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/40"
            />
          </div>
          <div>
            <label className="text-[12px] font-bold text-slate-400 mb-1 block">이메일 (선택)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="kim@example.com"
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[14px] text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/40"
            />
          </div>
          <div>
            <label className="text-[12px] font-bold text-slate-400 mb-1.5 block">주 역할</label>
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
        </div>
        <div className="px-5 py-3 border-t border-white/5 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-[13px] font-bold text-slate-400 hover:bg-white/5">취소</button>
          <button onClick={handleSubmit} className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-[#0a0f1f] text-[13px] font-extrabold flex items-center gap-1.5">
            <Save className="w-3.5 h-3.5" />
            추가
          </button>
        </div>
      </div>
    </div>
  )
}

function EditMemberModal({
  member, onClose, onSave, onDelete,
}: {
  member: ContiTeamMember
  onClose: () => void
  onSave: (m: ContiTeamMember) => void
  onDelete: (id: string) => void
}) {
  const [name, setName] = useState(member.name)
  const [email, setEmail] = useState(member.email || '')
  const [role, setRole] = useState<MemberRole>(member.primary_role)

  function handleSave() {
    if (!name.trim()) {
      alert('이름을 입력해 주세요.')
      return
    }
    onSave({
      ...member,
      name: name.trim(),
      email: email.trim() || null,
      primary_role: role,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#03050c]/85 backdrop-blur-md" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-[#0a0f1f] border border-white/10 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <MemberAvatar name={name} color={member.color} size="md" />
            <h2 className="text-[16px] font-bold text-white">팀원 편집</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/5 text-slate-400"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <label className="text-[12px] font-bold text-slate-400 mb-1 block">이름 *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[14px] text-white focus:outline-none focus:border-amber-500/40"
            />
          </div>
          <div>
            <label className="text-[12px] font-bold text-slate-400 mb-1 block">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[14px] text-white focus:outline-none focus:border-amber-500/40"
            />
          </div>
          <div>
            <label className="text-[12px] font-bold text-slate-400 mb-1.5 block">주 역할</label>
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
        </div>
        <div className="px-5 py-3 border-t border-white/5 flex items-center gap-2">
          <button
            onClick={() => onDelete(member.id)}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-[13px] font-bold text-rose-400 hover:bg-rose-500/10"
          >
            <Trash2 className="w-3.5 h-3.5" />
            팀원 삭제
          </button>
          <div className="ml-auto flex gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg text-[13px] font-bold text-slate-400 hover:bg-white/5">취소</button>
            <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-[#0a0f1f] text-[13px] font-extrabold flex items-center gap-1.5">
              <Save className="w-3.5 h-3.5" />
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TeamsPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-[#050814]">
        <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
      </div>
    }>
      <TeamsPageInner />
    </Suspense>
  )
}
