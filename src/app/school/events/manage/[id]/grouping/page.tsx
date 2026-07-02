'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, Shuffle, Users } from 'lucide-react'
import { getRegistrations, getGroups, getTeams, saveGroup, saveTeam, deleteGroup, deleteTeam, updateRegistration, updateGroup } from '@/lib/events/db'
import type { Registration, EventGroup, EventTeam } from '@/types/event'

export default function GroupingPage() {
  const { id } = useParams<{ id: string }>()
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [groups, setGroups] = useState<EventGroup[]>([])
  const [teams, setTeams] = useState<EventTeam[]>([])
  const [loading, setLoading] = useState(true)
  const [newGroupName, setNewGroupName] = useState('')
  const [newTeamName, setNewTeamName] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)

  const loadData = () => {
    Promise.all([getRegistrations(id), getGroups(id)]).then(([regs, grps]) => {
      setRegistrations(regs)
      setGroups(grps)
      const allTeams: EventTeam[] = []
      Promise.all(grps.map(g => getTeams(g.id).then(ts => allTeams.push(...ts)))).then(() => {
        setTeams(allTeams)
        setLoading(false)
      })
    })
  }

  useEffect(loadData, [id])

  const addGroup = async () => {
    if (!newGroupName.trim()) return
    await saveGroup(id, { eventId: id, name: newGroupName, description: '', maxCapacity: 50, color: '#4ECDC4', order: groups.length })
    setNewGroupName('')
    loadData()
  }

  const removeGroup = async (gid: string) => {
    if (!confirm('이 반을 삭제하시겠습니까?')) return
    await deleteGroup(id, gid)
    loadData()
  }

  const addTeam = async () => {
    if (!newTeamName.trim() || !selectedGroup) return
    await saveTeam(selectedGroup, { groupId: selectedGroup, name: newTeamName, maxCapacity: 20, order: teams.filter(t => t.groupId === selectedGroup).length })
    setNewTeamName('')
    loadData()
  }

  const removeTeam = async (tid: string) => {
    await deleteTeam(selectedGroup!, tid)
    loadData()
  }

  const assignGroup = async (regId: string, groupId: string | null) => {
    await updateRegistration(regId, { groupId, teamId: groupId ? null : null })
    loadData()
  }

  const assignTeam = async (regId: string, teamId: string | null) => {
    await updateRegistration(regId, { teamId })
    loadData()
  }

  const randomAssign = async () => {
    const unassigned = registrations.filter(r => !r.groupId && r.status !== 'cancelled')
    if (unassigned.length === 0 || groups.length === 0) return
    const shuffled = [...unassigned].sort(() => Math.random() - 0.5)
    let gidx = 0
    for (const reg of shuffled) {
      await updateRegistration(reg.id, { groupId: groups[gidx % groups.length].id })
      gidx++
    }
    loadData()
  }

  if (loading) return null

  const confirmedRegs = registrations.filter(r => r.status !== 'cancelled')
  const groupTeams = (gid: string) => teams.filter(t => t.groupId === gid)
  const groupRegs = (gid: string) => confirmedRegs.filter(r => r.groupId === gid)
  const teamRegs = (tid: string) => confirmedRegs.filter(r => r.teamId === tid)

  return (
    <div className="bg-cs-warm-50 min-h-screen">
      <div className="container-custom py-6">
        <Link href={`/school/events/manage/${id}`} className="inline-flex items-center gap-1.5 text-sm text-cs-navy-500 hover:text-cs-navy-700 mb-4">
          <ArrowLeft className="w-4 h-4" /> 행사 관리
        </Link>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-extrabold text-cs-navy-900">반/조 편성</h1>
          <button onClick={randomAssign} className="btn-outline btn-sm">
            <Shuffle className="w-4 h-4" /> 자동 배정
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="card-flat p-4 bg-white">
              <h3 className="font-bold text-cs-navy-900 mb-3 text-sm">반 관리</h3>
              <div className="flex gap-2 mb-3">
                <input type="text" placeholder="반 이름" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} className="input-field text-sm flex-1" onKeyDown={e => e.key === 'Enter' && addGroup()} />
                <button onClick={addGroup} className="btn-primary btn-sm !px-3"><Plus className="w-4 h-4" /></button>
              </div>
              <div className="space-y-1">
                {groups.map(g => (
                  <div key={g.id} className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-sm ${selectedGroup === g.id ? 'bg-cs-mint-50 text-cs-mint-700 font-bold' : 'hover:bg-cs-warm-50'}`} onClick={() => setSelectedGroup(g.id)}>
                    <span>{g.name} <span className="text-cs-navy-400 font-normal">({groupRegs(g.id).length}명)</span></span>
                    <button onClick={e => { e.stopPropagation(); removeGroup(g.id) }} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>
            </div>

            {selectedGroup && (
              <div className="card-flat p-4 bg-white">
                <h3 className="font-bold text-cs-navy-900 mb-3 text-sm">조 관리 ({groups.find(g => g.id === selectedGroup)?.name})</h3>
                <div className="flex gap-2 mb-3">
                  <input type="text" placeholder="조 이름" value={newTeamName} onChange={e => setNewTeamName(e.target.value)} className="input-field text-sm flex-1" onKeyDown={e => e.key === 'Enter' && addTeam()} />
                  <button onClick={addTeam} className="btn-primary btn-sm !px-3"><Plus className="w-4 h-4" /></button>
                </div>
                <div className="space-y-1">
                  {groupTeams(selectedGroup).map(t => (
                    <div key={t.id} className="flex items-center justify-between p-2 rounded-lg text-sm hover:bg-cs-warm-50">
                      <span>{t.name} <span className="text-cs-navy-400 font-normal">({teamRegs(t.id).length}명)</span></span>
                      <button onClick={() => removeTeam(t.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-3">
            <div className="card-flat p-4 bg-white">
              <h3 className="font-bold text-cs-navy-900 mb-3 text-sm">참가자 배정</h3>
              {groups.length === 0 ? (
                <p className="text-sm text-cs-navy-500 text-center py-8">먼저 반을 생성해주세요.</p>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {confirmedRegs.map(reg => (
                    <div key={reg.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-cs-warm-100 hover:bg-cs-warm-50">
                      <span className="text-sm font-medium text-cs-navy-900 w-24 truncate">{reg.participantName}</span>
                      <select value={reg.groupId || ''} onChange={e => assignGroup(reg.id, e.target.value || null)} className="text-xs border border-cs-warm-200 rounded-lg p-1.5 bg-white flex-1">
                        <option value="">반 선택</option>
                        {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                      </select>
                      <select value={reg.teamId || ''} onChange={e => assignTeam(reg.id, e.target.value || null)} className="text-xs border border-cs-warm-200 rounded-lg p-1.5 bg-white flex-1">
                        <option value="">조 선택</option>
                        {groupTeams(reg.groupId || '').map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
