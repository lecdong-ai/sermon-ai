// 음악 Key 호환성 분석 (캠튼 서클 + 5도권 기반)
// 인접한 두 곡의 key가 얼마나 자연스럽게 전이되는지 점수화

import type { MusicKey } from '@/types/conti'

// 12 음계 (반음 기준)
// C=0, C#=1, D=2, D#=3, E=4, F=5, F#=6, G=7, G#=8, A=9, A#=10, B=11
const PITCH_CLASS: Record<string, number> = {
  C: 0,  'C#': 1, Db: 1,
  D: 2,  'D#': 3, Eb: 3,
  E: 4,
  F: 5,  'F#': 6, Gb: 6,
  G: 7,  'G#': 8, Ab: 8,
  A: 9,  'A#': 10, Bb: 10,
  B: 11,
}

const KEY_TO_PITCH: Record<string, { pitch: number; isMinor: boolean }> = {
  C:  { pitch: 0,  isMinor: false },
  D:  { pitch: 2,  isMinor: false },
  E:  { pitch: 4,  isMinor: false },
  F:  { pitch: 5,  isMinor: false },
  G:  { pitch: 7,  isMinor: false },
  A:  { pitch: 9,  isMinor: false },
  B:  { pitch: 11, isMinor: false },
  Db: { pitch: 1,  isMinor: false },
  Eb: { pitch: 3,  isMinor: false },
  'F#': { pitch: 6, isMinor: false },
  Ab: { pitch: 8,  isMinor: false },
  Bb: { pitch: 10, isMinor: false },
  'C#': { pitch: 1, isMinor: false },
  Cm: { pitch: 0,  isMinor: true },
  Dm: { pitch: 2,  isMinor: true },
  Em: { pitch: 4,  isMinor: true },
  Fm: { pitch: 5,  isMinor: true },
  Gm: { pitch: 7,  isMinor: true },
  Am: { pitch: 9,  isMinor: true },
  Bm: { pitch: 11, isMinor: true },
}

export interface KeyCompatibility {
  semitones: number                 // 반음 차이 (0~6, 최소값)
  score: number                     // 0~100 (높을수록 자연스러움)
  label: 'perfect' | 'great' | 'okay' | 'awkward' | 'clash'
  description: string
}

// 5도권(원키/4도 위/5도 위) 또는 같은 키 → 자연스러움
// 2도/3도 → 괜찮음
// 6도/반대 → 어색
export function getKeyCompatibility(from: MusicKey, to: MusicKey): KeyCompatibility {
  const a = KEY_TO_PITCH[from]
  const b = KEY_TO_PITCH[to]
  if (!a || !b) {
    return { semitones: 0, score: 50, label: 'okay', description: '키 정보 없음' }
  }

  // 장조↔다른장조, 단조↔다른단조: 자연스러움
  // 장조→단조, 단조→장조: 같은 피치면 같은 장단조(병행) → 자연스러움
  let semitones = Math.abs(a.pitch - b.pitch)
  if (semitones > 6) semitones = 12 - semitones  // 순환 거리 최소값

  let score: number
  let label: KeyCompatibility['label']
  let description: string

  if (semitones === 0) {
    score = 100
    label = 'perfect'
    description = '같은 키 — 자연스러움'
  } else if (semitones === 1) {
    score = 85
    label = 'great'
    description = '반음 차이 — 자연스러움'
  } else if (semitones === 2) {
    score = 75
    label = 'great'
    description = '온음 차이 — 매끄러움'
  } else if (semitones === 3) {
    score = 55
    label = 'okay'
    description = '3도 — 괜찮음'
  } else if (semitones === 4) {
    score = 70
    label = 'great'
    description = '4도 (5도권) — 모더트한 전이'
  } else if (semitones === 5) {
    score = 80
    label = 'great'
    description = '5도권 — 전형적 전이'
  } else if (semitones === 6) {
    score = 35
    label = 'clash'
    description = '반대 키 (Tritone) — 갑작스러움'
  } else {
    score = 50
    label = 'okay'
    description = '보통'
  }

  // 장조↔단조 (같은 피치)면 매우 자연스러움 (relative key)
  if (a.pitch === b.pitch && a.isMinor !== b.isMinor) {
    score = Math.min(100, score + 15)
    label = 'perfect'
    description = '병행 키 (같은 피치) — 매우 자연스러움'
  }

  return { semitones, score, label, description }
}

export interface CamelotPosition {
  number: number      // 1~12
  letter: 'A' | 'B'   // A=minor, B=major
}

// 12개 키를 캠튼 서클 위치로 매핑
const KEY_TO_CAMELOT: Record<string, CamelotPosition> = {
  B:  { number: 1,  letter: 'B' },
  'F#': { number: 2, letter: 'B' },
  Db: { number: 2, letter: 'B' },
  'C#': { number: 3, letter: 'B' },
  Ab: { number: 4, letter: 'B' },
  Eb: { number: 5, letter: 'B' },
  Bb: { number: 6, letter: 'B' },
  F:  { number: 7, letter: 'B' },
  C:  { number: 8, letter: 'B' },
  G:  { number: 9, letter: 'B' },
  D:  { number: 10, letter: 'B' },
  A:  { number: 11, letter: 'B' },
  E:  { number: 12, letter: 'B' },
  Abm: { number: 1, letter: 'A' },
  'G#m': { number: 1, letter: 'A' },
  Ebm: { number: 2, letter: 'A' },
  'D#m': { number: 2, letter: 'A' },
  Bbm: { number: 3, letter: 'A' },
  Am: { number: 4, letter: 'A' },
  Em: { number: 5, letter: 'A' },
  Bm: { number: 6, letter: 'A' },
  'F#m': { number: 7, letter: 'A' },
  Gbm: { number: 7, letter: 'A' },
  Cm: { number: 8, letter: 'A' },
  Gm: { number: 9, letter: 'A' },
  Dm: { number: 10, letter: 'A' },
  Am_in: { number: 11, letter: 'A' },
  'C#m': { number: 12, letter: 'A' },
}

export function getCamelotPosition(key: MusicKey | null): CamelotPosition | null {
  if (!key) return null
  return KEY_TO_CAMELOT[key] ?? null
}

// 모든 키 옵션 (UI 드롭다운용)
export const ALL_KEYS: MusicKey[] = [
  'C', 'D', 'E', 'F', 'G', 'A', 'B',
  'Db', 'Eb', 'F#', 'Ab', 'Bb',
  'Am', 'Bm', 'Cm', 'Dm', 'Em', 'Fm', 'Gm',
]

export const KEY_DISPLAY: Record<string, string> = {
  C: 'C', D: 'D', E: 'E', F: 'F', G: 'G', A: 'A', B: 'B',
  Db: 'Db', Eb: 'Eb', 'F#': 'F#', Ab: 'Ab', Bb: 'Bb',
  Am: 'Am', Bm: 'Bm', Cm: 'Cm', Dm: 'Dm', Em: 'Em', Fm: 'Fm', Gm: 'Gm',
}

// Key 호환성 색상 (UI용)
export const KEY_COMPAT_COLORS: Record<KeyCompatibility['label'], { bg: string; text: string; border: string }> = {
  perfect: { bg: 'bg-emerald-500/15', text: 'text-emerald-300', border: 'border-emerald-500/30' },
  great:   { bg: 'bg-sky-500/15',     text: 'text-sky-300',     border: 'border-sky-500/30' },
  okay:    { bg: 'bg-amber-500/15',   text: 'text-amber-300',   border: 'border-amber-500/30' },
  awkward: { bg: 'bg-orange-500/15',  text: 'text-orange-300',  border: 'border-orange-500/30' },
  clash:   { bg: 'bg-rose-500/15',    text: 'text-rose-300',    border: 'border-rose-500/30' },
}
