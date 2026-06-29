// localStorage 기반 콘티 mock 저장소
// Supabase 연결 전까지 사용자 추가 콘티를 브라우저에 보관

import type {
  ContiSet, ContiItem, ContiSong,
  ContiTeam, ContiTeamMember, ContiAssignment,
  SheetProject,
} from '@/types/conti'

const STORAGE_PREFIX = 'conti:mock:'

function k(key: string) {
  return STORAGE_PREFIX + key
}

function safeGet(key: string): string | null {
  try { return localStorage.getItem(key) } catch { return null }
}
function safeSet(key: string, value: string): boolean {
  try { localStorage.setItem(key, value); return true } catch { return false }
}
function safeRemove(key: string) {
  try { localStorage.removeItem(key) } catch { /* ignore */ }
}

// ─── 콘티 목록 ───
export function saveMockContiList(items: ContiSet[]): void {
  safeSet(k('list'), JSON.stringify(items))
}
export function loadMockContiList(): ContiSet[] {
  const data = safeGet(k('list'))
  if (!data) return []
  try { return JSON.parse(data) as ContiSet[] } catch { return [] }
}

// ─── 콘티 상세 (콘티 + items) ───
export interface MockContiDetail {
  conti: ContiSet
  items: ContiItem[]
}

export function saveMockContiDetail(id: string, detail: MockContiDetail): void {
  safeSet(k('detail:' + id), JSON.stringify(detail))
}
export function loadMockContiDetail(id: string): MockContiDetail | null {
  const data = safeGet(k('detail:' + id))
  if (!data) return null
  try { return JSON.parse(data) as MockContiDetail } catch { return null }
}

// ─── 곡 라이브러리 (시스템 + 사용자) ───
export function saveMockSongList(songs: ContiSong[]): void {
  safeSet(k('songs'), JSON.stringify(songs))
}
export function loadMockSongList(): ContiSong[] {
  const data = safeGet(k('songs'))
  if (!data) return []
  try { return JSON.parse(data) as ContiSong[] } catch { return [] }
}

// ─── 콘티 삭제 ───
export function deleteMockContiData(id: string): void {
  safeRemove(k('detail:' + id))
  const list = loadMockContiList().filter((c) => c.id !== id)
  saveMockContiList(list)
}

// ─── 공유 토큰 → 콘티 ID 매핑 ───
// 토큰은 "conti-share-{random}" 형태
export function setMockShareToken(token: string, contiId: string): void {
  safeSet(k('share:' + token), contiId)
}

export function getMockShareContiId(token: string): string | null {
  return safeGet(k('share:' + token))
}

export function deleteMockShareToken(token: string): void {
  safeRemove(k('share:' + token))
}

// ─── 공개 콘티 검색 (is_public = true) ───
export function getMockPublicContiList(): ContiSet[] {
  return loadMockContiList().filter((c) => c.is_public)
}

// ─── 토큰 생성 ───
export function generateShareToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = 'sh_'
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// ─── 팀 ───
export function saveMockTeams(teams: ContiTeam[]): void {
  safeSet(k('teams'), JSON.stringify(teams))
}
export function loadMockTeams(): ContiTeam[] {
  const data = safeGet(k('teams'))
  if (!data) return []
  try { return JSON.parse(data) as ContiTeam[] } catch { return [] }
}

// ─── 팀원 ───
export function saveMockTeamMembers(members: ContiTeamMember[]): void {
  safeSet(k('members'), JSON.stringify(members))
}
export function loadMockTeamMembers(): ContiTeamMember[] {
  const data = safeGet(k('members'))
  if (!data) return []
  try { return JSON.parse(data) as ContiTeamMember[] } catch { return [] }
}

export function getMockTeamMembersByTeam(teamId: string): ContiTeamMember[] {
  return loadMockTeamMembers().filter((m) => m.team_id === teamId)
}

// ─── 역할 배정 ───
export function saveMockAssignments(assignments: ContiAssignment[]): void {
  safeSet(k('assignments'), JSON.stringify(assignments))
}
export function loadMockAssignments(): ContiAssignment[] {
  const data = safeGet(k('assignments'))
  if (!data) return []
  try { return JSON.parse(data) as ContiAssignment[] } catch { return [] }
}

export function getMockAssignmentsByConti(contiId: string): ContiAssignment[] {
  return loadMockAssignments().filter((a) => a.conti_id === contiId)
}

export function getMockAssignmentsByMember(memberId: string): ContiAssignment[] {
  return loadMockAssignments().filter((a) => a.member_id === memberId)
}

// ─── 악보 편집 프로젝트 ───
export function saveMockSheetProject(contiId: string, project: SheetProject): void {
  safeSet(k('sheet:' + contiId), JSON.stringify(project))
}
export function loadMockSheetProject(contiId: string): SheetProject | null {
  const data = safeGet(k('sheet:' + contiId))
  if (!data) return null
  try { return JSON.parse(data) as SheetProject } catch { return null }
}
export function deleteMockSheetProject(contiId: string): void {
  safeRemove(k('sheet:' + contiId))
}

// ─── 샘플 시드: 공개된 샘플 콘티의 토큰을 자동 등록 ───
import { SAMPLE_CONTIS } from '@/lib/conti/samples'

let seedInitialized = false
export function seedMockShareTokens(): void {
  if (seedInitialized || typeof window === 'undefined') return
  seedInitialized = true
  // 샘플에서 is_public=true 인 콘티의 토큰 등록
  for (const c of SAMPLE_CONTIS) {
    if (c.is_public && c.share_token) {
      safeSet(k('share:' + c.share_token), c.id)
    }
  }
}
