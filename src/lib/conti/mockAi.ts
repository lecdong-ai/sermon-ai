// AI 추천 + AI 코치 (mock 시뮬레이션)
// 실제 구현 시 OpenAI ChatCompletion API 사용
// 구조: prompt → JSON 결과

import type {
  ContiItem, ContiSong, MoodTag, MusicKey, AIRecommendRequest, AIRecommendResult,
} from '@/types/conti'
import { ALL_SAMPLE_SONGS, ALL_SAMPLE_SONGS_BY_ID } from '@/lib/conti/samples'
import { getKeyCompatibility } from '@/lib/conti/keyTheory'

// 분위기 → 시스템 곡 매칭 (점수 기반)
function scoreSongForMoods(song: ContiSong, moods: MoodTag[]): number {
  if (moods.length === 0) return 0
  let score = 0
  for (const mood of moods) {
    if (song.tags.includes(mood)) {
      score += 10
    }
  }
  // 다양성 보너스: 여러 태그 매칭
  score += song.tags.filter((t) => moods.includes(t)).length * 2
  return score
}

// 분위기 진행 추천: opening(은혜) → middle(경배/찬양) → closing(축제/축복)
function getPositionMoods(position: number, total: number, requested: MoodTag[]): MoodTag[] {
  const ratio = total === 1 ? 0.5 : position / (total - 1)
  // 비율에 따라 분위기 가중치 계산
  if (ratio < 0.34) {
    // 시작: 은혜, 위로, 말씀 위주
    return (['은혜', '위로', '말씀'] as MoodTag[]).filter((m) => requested.includes(m))
  } else if (ratio < 0.67) {
    // 중반: 경배, 찬양, 고백
    return (['경배', '찬양', '고백'] as MoodTag[]).filter((m) => requested.includes(m))
  } else {
    // 마무리: 축제, 축복, 사랑, 감사
    return (['축제', '축복', '사랑', '감사', '소망'] as MoodTag[]).filter((m) => requested.includes(m))
  }
}

// AI 추천: 분위기 + 곡 수 + 메인키 → 곡 자동 배치
export async function mockAIRecommend(
  request: AIRecommendRequest,
  availableSongs: ContiSong[],
): Promise<AIRecommendResult> {
  await new Promise((resolve) => setTimeout(resolve, 1500))

  const { moods, song_count, main_key } = request

  // 1) 시스템 곡 + 사용자 곡 결합
  const allSongs = availableSongs.length > 0 ? availableSongs : ALL_SAMPLE_SONGS

  // 2) 각 곡을 분위기 점수로 평가
  const scored = allSongs
    .map((song) => ({ song, score: scoreSongForMoods(song, moods) }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)

  // 3) 곡 수 만큼 선택 (중복 방지)
  const picked: ContiSong[] = []
  const usedIds = new Set<string>()
  for (const { song } of scored) {
    if (picked.length >= song_count) break
    if (usedIds.has(song.id)) continue
    picked.push(song)
    usedIds.add(song.id)
  }

  // 4) 점수 매칭이 부족하면 moods 무시하고 다른 곡으로 채움
  if (picked.length < song_count) {
    for (const song of allSongs) {
      if (picked.length >= song_count) break
      if (usedIds.has(song.id)) continue
      picked.push(song)
      usedIds.add(song.id)
    }
  }

  // 5) 각 곡에 추천 Key/BPM + 이유 부여
  const baseKey = main_key || 'C'
  const items: AIRecommendResult['items'] = picked.map((song, idx) => {
    // Key: 메인 키에서 1~5도 자연스러운 전이로 계산
    const targetKey = computeRecommendedKey(baseKey, idx, picked.length)
    return {
      song_id: song.id,
      title: song.title,
      artist: song.artist,
      recommended_key: targetKey,
      recommended_bpm: song.bpm || 80,
      reason: generateReason(song, moods, idx, picked.length),
    }
  })

  return {
    items,
    overall_reasoning: generateOverallReasoning(moods, song_count, main_key, picked),
  }
}

// 추천 Key 계산: 메인 키에서 자연스러운 전이로
function computeRecommendedKey(base: MusicKey, idx: number, total: number): MusicKey {
  // 진행 패턴: 메인 → 5도권 → 원위치 (arc) 또는 빌드업 (5도씩)
  const ratios = [0, 0.25, 0.5, 0.75, 1.0]
  const ratio = ratios[Math.min(idx, ratios.length - 1)]
  // 간단한 진행: C → G → D → A → E (5도권 빌드업) 또는 같은 키 변주
  const progression: MusicKey[] = [base, 'G', 'D', 'A', 'E', 'C']
  return progression[Math.min(idx, progression.length - 1)]
}

function generateReason(song: ContiSong, moods: MoodTag[], idx: number, total: number): string {
  const matchedTags = song.tags.filter((t) => moods.includes(t))
  const position = idx === 0 ? '오프닝' :
                   idx === total - 1 ? '마무리' :
                   idx < total / 2 ? '전반부' : '후반부'
  if (matchedTags.length > 0) {
    return `${position} — ${matchedTags.slice(0, 2).map((t) => `#${t}`).join(' ')} 분위기에 적합`
  }
  return `${position} 분위기 보완용`
}

function generateOverallReasoning(moods: MoodTag[], count: number, key: MusicKey | null, songs: ContiSong[]): string {
  const moodText = moods.length > 0 ? moods.join(', ') : '균형 잡힌'
  const keyText = key ? `${key} 메인 키` : '유연한 키'
  const avgBpm = songs.length > 0
    ? Math.round(songs.reduce((acc, s) => acc + (s.bpm || 80), 0) / songs.length)
    : 80

  return `${count}곡으로 ${moodText} 분위기의 콘티를 구성했습니다. ${keyText} 기반으로, 평균 BPM은 ${avgBpm}입니다. 분위기 균형과 Key 호환성을 고려해 곡 순서를 배치했으니, 마음에 들지 않는 곡은 라이브러리에서 교체하세요.`
}

// =========================================================================
// AI 코치: 기존 콘티를 분석해 리포트 생성
// =========================================================================

export interface CoachReport {
  summary: string                              // 한 줄 요약
  overall_score: number                         // 0~100
  key_analysis: {
    issues: string[]                            // Key 관련 경고
    good: string[]                              // Key 관련 칭찬
  }
  bpm_analysis: {
    flow_pattern: 'up' | 'down' | 'arc' | 'flat' | 'irregular'
    flow_label: string                          // "빌드업", "다운", "아크", "안정", "불규칙"
    tempo_range: { min: number; max: number; avg: number } | null
    issues: string[]
    good: string[]
  }
  mood_analysis: {
    distribution: Record<string, number>       // 분위기 → 비율 (0~1)
    top_moods: string[]                         // 상위 분위기
    issues: string[]
    good: string[]
  }
  flow_suggestion: string                       // 한 줄 제안
}

export async function mockAICoach(items: ContiItem[]): Promise<CoachReport> {
  await new Promise((resolve) => setTimeout(resolve, 1500))

  if (items.length === 0) {
    return {
      summary: '콘티가 비어 있습니다. 곡을 추가하면 분석이 가능합니다.',
      overall_score: 0,
      key_analysis: { issues: [], good: [] },
      bpm_analysis: { flow_pattern: 'flat', flow_label: '없음', tempo_range: null, issues: [], good: [] },
      mood_analysis: { distribution: {}, top_moods: [], issues: [], good: [] },
      flow_suggestion: '',
    }
  }

  // 1) Key 분석
  const keys = items.map((it) => it.key || it.song?.original_key || null)
  const keyIssues: string[] = []
  const keyGood: string[] = []
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i]
    const b = keys[i + 1]
    if (!a || !b) continue
    const compat = getKeyCompatibility(a, b)
    if (compat.label === 'clash' || compat.label === 'awkward') {
      keyIssues.push(
        `${i + 1}번 → ${i + 2}번곡 key 전이 (${a} → ${b})가 ${compat.semitones}도 점프로 갑작스럽습니다. ${i + 2}번곡을 ${suggestAlternativeKey(a, b)}로 옮기면 더 자연스러워요.`,
      )
    } else if (compat.label === 'perfect' || compat.label === 'great') {
      keyGood.push(`${i + 1}번 → ${i + 2}번곡 key 전이 (${a} → ${b}) — ${compat.description}`)
    }
  }

  // 2) BPM 분석
  const bpms = items.map((it) => it.bpm_override ?? it.song?.bpm ?? null).filter((b): b is number => b != null)
  const tempoRange = bpms.length > 0
    ? { min: Math.min(...bpms), max: Math.max(...bpms), avg: Math.round(bpms.reduce((a, b) => a + b, 0) / bpms.length) }
    : null

  let flowPattern: CoachReport['bpm_analysis']['flow_pattern'] = 'flat'
  let flowLabel = '안정'
  if (bpms.length >= 2) {
    const first = bpms[0]
    const last = bpms[bpms.length - 1]
    const diff = last - first
    const mid = bpms[Math.floor(bpms.length / 2)]

    // 변동성 계산
    const variance = bpms.reduce((acc, b) => acc + Math.abs(b - (tempoRange?.avg || b)), 0) / bpms.length
    const isIrregular = variance > 20

    if (isIrregular) {
      flowPattern = 'irregular'
      flowLabel = '불규칙'
    } else if (mid > first + 8 && mid > last) {
      flowPattern = 'arc'
      flowLabel = '아크형 (중심 강조)'
    } else if (diff > 6) {
      flowPattern = 'up'
      flowLabel = '빌드업'
    } else if (diff < -6) {
      flowPattern = 'down'
      flowLabel = '다운'
    } else {
      flowPattern = 'flat'
      flowLabel = '안정'
    }
  }

  const bpmIssues: string[] = []
  const bpmGood: string[] = []
  if (tempoRange && tempoRange.max - tempoRange.min > 40) {
    bpmIssues.push(`BPM 범위(${tempoRange.min}~${tempoRange.max})가 너무 넓습니다. 인접 곡 BPM 차이를 20 이내로 줄여보세요.`)
  }
  if (flowPattern === 'up') {
    bpmGood.push('오프닝부터 마무리까지 점진적 빌드업이 좋습니다.')
  } else if (flowPattern === 'arc') {
    bpmGood.push('중심부에 정점이 있는 아크형 흐름 — 클라이맥스 강조에 효과적입니다.')
  } else if (flowPattern === 'irregular') {
    bpmIssues.push('BPM 변동이 불규칙합니다. 찬양팀이 따라가기 어려울 수 있어요.')
  }

  // 3) 분위기 분석
  const moodCount: Record<string, number> = {}
  items.forEach((it) => {
    if (!it.song?.tags) return
    const weight = 1 / (it.song.tags.length || 1)
    it.song.tags.forEach((t) => {
      moodCount[t] = (moodCount[t] || 0) + weight
    })
  })
  const totalWeight = Object.values(moodCount).reduce((a, b) => a + b, 0)
  const moodDistribution: Record<string, number> = {}
  Object.keys(moodCount).forEach((k) => {
    moodDistribution[k] = totalWeight > 0 ? moodCount[k] / totalWeight : 0
  })
  const topMoods = Object.entries(moodDistribution)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([m]) => m)

  const moodIssues: string[] = []
  const moodGood: string[] = []
  // 경배 분위기 부족
  const worshipRatio = moodDistribution['경배'] || 0
  if (items.length >= 4 && worshipRatio < 0.15) {
    moodIssues.push('전체적으로 "경배" 분위기가 부족합니다. 중반(2~3번)에 경배 곡 1개 추가를 고려해보세요.')
  }
  // 다양성 부족
  if (topMoods.length === 1 && items.length >= 3) {
    moodIssues.push('분위기가 한 가지에 집중되어 있습니다. 다양한 분위기를 섞으면 예배 흐름이 풍부해져요.')
  } else if (topMoods.length >= 3) {
    moodGood.push(`${topMoods.slice(0, 3).map((m) => `#${m}`).join(' ')} 등 다양한 분위기가 균형 있게 배치되어 있습니다.`)
  }

  // 4) 전체 점수 계산
  let score = 70
  score += keyGood.length * 5
  score -= keyIssues.length * 8
  score += bpmGood.length * 5
  score -= bpmIssues.length * 8
  score += moodGood.length * 5
  score -= moodIssues.length * 8
  score = Math.max(0, Math.min(100, score))

  // 5) 요약
  let summary = ''
  if (score >= 85) {
    summary = '✨ 훌륭한 콘티입니다! Key/BPM/분위기 모두 자연스럽습니다.'
  } else if (score >= 70) {
    summary = '👍 좋은 콘티입니다. 몇 가지 작은 개선이 있다면 더 좋아질 수 있어요.'
  } else if (score >= 50) {
    summary = '⚠️ 몇 가지 개선이 필요합니다. 아래 코치 제안을 참고해보세요.'
  } else {
    summary = '🔧 콘티 흐름에 큰 변화가 필요합니다. AI 추천을 받아보시는 건 어떨까요?'
  }

  // 6) 한 줄 제안
  let suggestion = ''
  if (keyIssues.length > 0) {
    suggestion = '🔑 ' + keyIssues[0]
  } else if (moodIssues.length > 0) {
    suggestion = '🎨 ' + moodIssues[0]
  } else if (bpmIssues.length > 0) {
    suggestion = '🎵 ' + bpmIssues[0]
  } else {
    suggestion = '✅ 모든 분석 항목이 양호합니다. 이대로 진행하세요!'
  }

  return {
    summary,
    overall_score: score,
    key_analysis: { issues: keyIssues, good: keyGood },
    bpm_analysis: {
      flow_pattern: flowPattern,
      flow_label: flowLabel,
      tempo_range: tempoRange,
      issues: bpmIssues,
      good: bpmGood,
    },
    mood_analysis: {
      distribution: moodDistribution,
      top_moods: topMoods,
      issues: moodIssues,
      good: moodGood,
    },
    flow_suggestion: suggestion,
  }
}

function suggestAlternativeKey(from: MusicKey, current: MusicKey): MusicKey {
  // from 의 1도 반전 또는 5도권 추천
  const pitches: Record<string, number> = {
    C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11,
  }
  const fromPitch = pitches[from]
  const alt = fromPitch + 1
  const keyNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  return (keyNames[alt % 12] || from) as MusicKey
}
