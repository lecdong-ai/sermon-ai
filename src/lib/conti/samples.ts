// 콘티 Mock 데이터 — 시스템 곡 12개 + 사용자 곡 3개 + 콘티 4개
// 개발/테스트/미리보기용

import type {
  ContiSong, ContiSongListItem, ContiSet, ContiItem, MusicKey, MoodTag,
} from '@/types/conti'

// ─── 헬퍼 ───
function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

function dateOnly(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

// =========================================================================
// 시스템 곡 (12곡) — 한국 교회/CCM/워십 메인
// =========================================================================
const SYSTEM_SONGS: ContiSong[] = [
  {
    id: 'sys-001',
    user_id: null,
    title: '주님의 은혜',
    artist: '뉴젠 워십',
    original_key: 'C',
    bpm: 76,
    duration_sec: 240,
    lyrics: '주님의 은혜가 나를 감싸네\n그 사랑 영원하리\n\n주의 손이 나를 인도하시니\n두려움 없네',
    chords: 'C - G/B - Am - F\nC - G - F - C\n\nF - G - Em - Am\nDm7 - G - C',
    tags: ['은혜', '경배'],
    category: 'CCM',
    source: 'system',
    youtube_url: null,
    created_at: daysAgo(120),
    updated_at: daysAgo(60),
  },
  {
    id: 'sys-002',
    user_id: null,
    title: '내 영혼의 그늘진 골짜기에',
    artist: '마커스 워십',
    original_key: 'D',
    bpm: 68,
    duration_sec: 280,
    lyrics: '내 영혼의 그늘진 골짜기에\n주의 발자국 따라가리\n\n주의 품이 안전하네\n나의 피난처 되시네',
    chords: 'D - A/C# - Bm - G\nD - A - G - D\n\nG - D - A - Bm\nG - A - D',
    tags: ['은혜', '위로', '경배'],
    category: '워십',
    source: 'system',
    youtube_url: 'https://www.youtube.com/watch?v=demo002',
    created_at: daysAgo(100),
    updated_at: daysAgo(50),
  },
  {
    id: 'sys-003',
    user_id: null,
    title: '예수 나의 첫사랑 되시네',
    artist: '어노인팅',
    original_key: 'G',
    bpm: 84,
    duration_sec: 260,
    lyrics: '예수 나의 첫사랑 되시네\n어떤 것도 대신할 수 없네\n\n주님만이 내 맘에 가득해\n영원토록 변하지 않네',
    chords: 'G - D/F# - Em - C\nG - D - C - G\n\nC - G - D - Em\nC - D - G',
    tags: ['사랑', '찬양', '경배'],
    category: 'CCM',
    source: 'system',
    youtube_url: 'https://www.youtube.com/watch?v=demo003',
    created_at: daysAgo(80),
    updated_at: daysAgo(40),
  },
  {
    id: 'sys-004',
    user_id: null,
    title: '십자가의 길',
    artist: 'T.새뮤얼',
    original_key: 'Eb',
    bpm: 72,
    duration_sec: 320,
    lyrics: '십자가의 길 걸어가네\n주님 따르는 이 길\n\n고개 숙여 경배하네\n그 은혜 감사해',
    chords: 'Eb - Ab - Bb7 - Eb\nEb/G - Ab - Bb - Eb\n\nAb - Eb - Fm7 - Bb7\nEb - Cm - Ab - Bb7 - Eb',
    tags: ['은혜', '경배', '말씀'],
    category: '워십',
    source: 'system',
    youtube_url: null,
    created_at: daysAgo(60),
    updated_at: daysAgo(30),
  },
  {
    id: 'sys-005',
    user_id: null,
    title: '주의 사랑',
    artist: '현대찬양',
    original_key: 'F',
    bpm: 84,
    duration_sec: 270,
    lyrics: '주의 사랑 나를 감싸네\n그 크신 은혜 놀라워\n\n나 주님만 따라가리\n영원히 함께 하리',
    chords: 'F - Bb - C - F\nDm - Am - Bb - C\n\nF - Dm - Bb - C\nBb - C - F',
    tags: ['사랑', '은혜', '찬양'],
    category: 'CCM',
    source: 'system',
    youtube_url: 'https://www.youtube.com/watch?v=demo005',
    created_at: daysAgo(50),
    updated_at: daysAgo(25),
  },
  {
    id: 'sys-006',
    user_id: null,
    title: '주의 음성을 내가 들으니',
    artist: '마커스 워십',
    original_key: 'Bb',
    bpm: 80,
    duration_sec: 290,
    lyrics: '주의 음성을 내가 들으니\n어디로 가는지 알려주소서\n\n주의 발자국 따라가며\n주님과 동행하리라',
    chords: 'Bb - F/A - Gm - Eb\nBb - F - Eb - Bb\n\nEb - Bb - F - Gm\nEb - F - Bb',
    tags: ['말씀', '은혜', '경배'],
    category: '워십',
    source: 'system',
    youtube_url: null,
    created_at: daysAgo(45),
    updated_at: daysAgo(20),
  },
  {
    id: 'sys-007',
    user_id: null,
    title: '할렐루야 우리 예수',
    artist: '어노인팅',
    original_key: 'A',
    bpm: 120,
    duration_sec: 220,
    lyrics: '할렐루야 우리 예수\n할렐루야 우리 왕\n\n다 함께 높이 든다\n주의 이름을 찬양해',
    chords: 'A - E/G# - F#m - D\nA - E - D - A\n\nD - A - E - F#m\nD - E - A',
    tags: ['찬양', '축제'],
    category: 'CCM',
    source: 'system',
    youtube_url: 'https://www.youtube.com/watch?v=demo007',
    created_at: daysAgo(40),
    updated_at: daysAgo(15),
  },
  {
    id: 'sys-008',
    user_id: null,
    title: '나 같은 죄인 살리신',
    artist: '찬송가 279장',
    original_key: 'G',
    bpm: 80,
    duration_sec: 200,
    lyrics: '나 같은 죄인 살리신\n주 은혜 감사해\n\n십자가 피로 씻어주신\n주 은혜 감사해',
    chords: 'G - C - G - D\nG - C - G - D - G',
    tags: ['회개', '고백', '은혜'],
    category: '찬송가',
    source: 'system',
    youtube_url: null,
    created_at: daysAgo(35),
    updated_at: daysAgo(10),
  },
  {
    id: 'sys-009',
    user_id: null,
    title: '주 예수보다 더 귀한 것은 없네',
    artist: '찬송가 137장',
    original_key: 'C',
    bpm: 88,
    duration_sec: 240,
    lyrics: '주 예수보다 더 귀한 것은 없네\n이 세상에 없네\n\n그 사랑 얼마나 큰지\n내가 매일 느끼네',
    chords: 'C - F - C - G\nC - F - G - C',
    tags: ['사랑', '찬양', '고백'],
    category: '찬송가',
    source: 'system',
    youtube_url: null,
    created_at: daysAgo(30),
    updated_at: daysAgo(8),
  },
  {
    id: 'sys-010',
    user_id: null,
    title: '고백합니다',
    artist: '마커스 워십',
    original_key: 'Eb',
    bpm: 70,
    duration_sec: 300,
    lyrics: '주님 앞에서 고백합니다\n내가 부족한 줄 압니다\n\n은혜로 여기까지 오게 하신\n주님의 사랑 감사합니다',
    chords: 'Eb - Bb/D - Cm - Gm\nEb - Bb - Gm - Eb\n\nBb - Eb - Cm - Fm7\nBb - Gm - Eb',
    tags: ['고백', '은혜', '회개'],
    category: '워십',
    source: 'system',
    youtube_url: null,
    created_at: daysAgo(20),
    updated_at: daysAgo(5),
  },
  {
    id: 'sys-011',
    user_id: null,
    title: '빛과 소금이 되리',
    artist: '뉴젠 워십',
    original_key: 'G',
    bpm: 130,
    duration_sec: 210,
    lyrics: '이 세상에 빛과 소금이 되리\n어디에 있든지 주 이름 빛날 때까지\n\n주님이 함께 하시니\n두려워하지 않네',
    chords: 'G - D/F# - Em - C\nG - D - C - G\n\nC - G - D - Em\nC - D - G',
    tags: ['선교', '축제', '찬양'],
    category: 'CCM',
    source: 'system',
    youtube_url: 'https://www.youtube.com/watch?v=demo011',
    created_at: daysAgo(15),
    updated_at: daysAgo(3),
  },
  {
    id: 'sys-012',
    user_id: null,
    title: '찬양의 제사',
    artist: '어노인팅',
    original_key: 'D',
    bpm: 96,
    duration_sec: 280,
    lyrics: '내 입술로 찬양의 제사 드리리\n내 온 몸으로 경배드리리\n\n주님만이 나의 하나님\n영원히 찬양드리리',
    chords: 'D - A/C# - Bm - G\nD - A - G - D\n\nG - D - A - Bm\nG - A - D',
    tags: ['찬양', '경배'],
    category: 'CCM',
    source: 'system',
    youtube_url: null,
    created_at: daysAgo(10),
    updated_at: daysAgo(2),
  },
]

// =========================================================================
// 사용자 추가 곡 (3곡) — image/url/manual source 예시
// =========================================================================
const USER_SONGS: ContiSong[] = [
  {
    id: 'usr-001',
    user_id: 'mock-user',
    title: '주님은 좋은 하나님',
    artist: '커버',
    original_key: 'C',
    bpm: 90,
    duration_sec: 230,
    lyrics: '주님은 좋은 하나님\n나의 주님 찬양해\n\n어디에 있든지\n주님만이 나의 힘',
    chords: 'C - G - Am - F\nC - G - F - C',
    tags: ['찬양', '은혜'],
    category: 'CCM',
    source: 'image',  // 사진에서 추출한 곡 예시
    youtube_url: null,
    created_at: daysAgo(7),
    updated_at: daysAgo(2),
  },
  {
    id: 'usr-002',
    user_id: 'mock-user',
    title: '새 생명',
    artist: '자체 작곡',
    original_key: 'Eb',
    bpm: 76,
    duration_sec: 260,
    lyrics: '주님 안에서 새 생명 얻었네\n오래된 것은 모두 지나갔네\n\n보지 않는 것들을 바라보며\n소망의 하나님 따라가리',
    chords: 'Eb - Ab - Bb - Eb\nCm - Fm7 - Bb7 - Eb',
    tags: ['소망', '은혜', '말씀'],
    category: '워십',
    source: 'url',  // URL에서 가져온 곡 예시
    youtube_url: 'https://www.youtube.com/watch?v=newlife',
    created_at: daysAgo(5),
    updated_at: daysAgo(1),
  },
  {
    id: 'usr-003',
    user_id: 'mock-user',
    title: '거룩 거룩 거룩',
    artist: '찬송가 76장',
    original_key: 'D',
    bpm: 84,
    duration_sec: 180,
    lyrics: '거룩 거룩 거룩\n만군의 주 하나님',
    chords: 'D - A - D - G - D',
    tags: ['경배', '찬양'],
    category: '찬송가',
    source: 'manual',
    youtube_url: null,
    created_at: daysAgo(3),
    updated_at: daysAgo(1),
  },
]

export const ALL_SAMPLE_SONGS: ContiSong[] = [...SYSTEM_SONGS, ...USER_SONGS]
export const ALL_SAMPLE_SONGS_BY_ID: Record<string, ContiSong> =
  ALL_SAMPLE_SONGS.reduce((acc, s) => { acc[s.id] = s; return acc }, {} as Record<string, ContiSong>)

// 사이드바용 요약 변환
export function toSongListItem(song: ContiSong): ContiSongListItem {
  return {
    id: song.id,
    title: song.title,
    artist: song.artist,
    original_key: song.original_key,
    bpm: song.bpm,
    duration_sec: song.duration_sec,
    tags: song.tags,
    category: song.category,
    source: song.source,
    is_system: song.user_id === null,
  }
}

export const ALL_SAMPLE_SONG_LIST: ContiSongListItem[] = ALL_SAMPLE_SONGS.map(toSongListItem)

// =========================================================================
// 콘티 4개 (Phase 1 demo)
// =========================================================================
const contiAItems: ContiItem[] = [
  { id: 'ci-a-1', conti_id: 'conti-001', song_id: 'sys-001', position: 1, key: 'C',  bpm_override: null, transition_memo: '1절 후 컷, 키보드 인트로 4마디', memo: '인도자 김OO', song: SYSTEM_SONGS[0] },
  { id: 'ci-a-2', conti_id: 'conti-001', song_id: 'sys-005', position: 2, key: 'F',  bpm_override: null, transition_memo: 'G→F로 1도 반전', memo: '', song: SYSTEM_SONGS[4] },
  { id: 'ci-a-3', conti_id: 'conti-001', song_id: 'sys-002', position: 3, key: 'D',  bpm_override: 72, transition_memo: 'F→D로 3도 전이, BPM 다운', memo: '템포 다운으로 회개 분위기', song: SYSTEM_SONGS[1] },
  { id: 'ci-a-4', conti_id: 'conti-001', song_id: 'sys-010', position: 4, key: 'Eb', bpm_override: null, transition_memo: 'D→Eb로 1도 반전', memo: '', song: SYSTEM_SONGS[9] },
  { id: 'ci-a-5', conti_id: 'conti-001', song_id: 'sys-007', position: 5, key: 'A',  bpm_override: 124, transition_memo: 'Eb→A로 4도 점프, BPM 업 — 클라이맥스', memo: '축제 분위기', song: SYSTEM_SONGS[6] },
]

const contiBItems: ContiItem[] = [
  { id: 'ci-b-1', conti_id: 'conti-002', song_id: 'sys-002', position: 1, key: 'D',  bpm_override: 68, transition_memo: '인트로 기타 픽킹', memo: '', song: SYSTEM_SONGS[1] },
  { id: 'ci-b-2', conti_id: 'conti-002', song_id: 'sys-006', position: 2, key: 'Bb', bpm_override: null, transition_memo: 'D→Bb로 5도권 전이', memo: '', song: SYSTEM_SONGS[5] },
  { id: 'ci-b-3', conti_id: 'conti-002', song_id: 'sys-010', position: 3, key: 'Eb', bpm_override: null, transition_memo: 'Bb→Eb로 5도권', memo: '고백 파트', song: SYSTEM_SONGS[9] },
  { id: 'ci-b-4', conti_id: 'conti-002', song_id: 'sys-001', position: 4, key: 'C',  bpm_override: null, transition_memo: 'Eb→C로 4도', memo: '', song: SYSTEM_SONGS[0] },
]

const contiCItems: ContiItem[] = [
  { id: 'ci-c-1', conti_id: 'conti-003', song_id: 'sys-008', position: 1, key: 'G',  bpm_override: null, transition_memo: '', memo: '회개 분위기 도입', song: SYSTEM_SONGS[7] },
  { id: 'ci-c-2', conti_id: 'conti-003', song_id: 'sys-010', position: 2, key: 'Eb', bpm_override: 70, transition_memo: 'G→Eb (병행단조)', memo: '단조로 분위기 전환', song: SYSTEM_SONGS[9] },
  { id: 'ci-c-3', conti_id: 'conti-003', song_id: 'sys-009', position: 3, key: 'C',  bpm_override: null, transition_memo: 'Eb→C (병행장조)', memo: '고백 + 감사', song: SYSTEM_SONGS[8] },
  { id: 'ci-c-4', conti_id: 'conti-003', song_id: 'sys-005', position: 4, key: 'F',  bpm_override: null, transition_memo: 'C→F (4도)', memo: '', song: SYSTEM_SONGS[4] },
]

const contiDItems: ContiItem[] = [
  { id: 'ci-d-1', conti_id: 'conti-004', song_id: 'sys-007', position: 1, key: 'A',  bpm_override: null, transition_memo: '축제 분위기 오픈', memo: '밝은 분위기', song: SYSTEM_SONGS[6] },
  { id: 'ci-d-2', conti_id: 'conti-004', song_id: 'sys-011', position: 2, key: 'G',  bpm_override: 132, transition_memo: 'A→G (1도 다운)', memo: '', song: SYSTEM_SONGS[10] },
  { id: 'ci-d-3', conti_id: 'conti-004', song_id: 'sys-012', position: 3, key: 'D',  bpm_override: 96,  transition_memo: 'G→D (5도권)', memo: '', song: SYSTEM_SONGS[11] },
  { id: 'ci-d-4', conti_id: 'conti-004', song_id: 'sys-001', position: 4, key: 'C',  bpm_override: null, transition_memo: 'D→C (1도)', memo: '마무리', song: SYSTEM_SONGS[0] },
  { id: 'ci-d-5', conti_id: 'conti-004', song_id: 'sys-003', position: 5, key: 'G',  bpm_override: 86,  transition_memo: 'C→G (5도권)', memo: '은혜 마무리', song: SYSTEM_SONGS[2] },
]

export const SAMPLE_CONTIS: ContiSet[] = [
  {
    id: 'conti-001',
    user_id: 'mock-user',
    title: '2024-12-08 주일 오전 예배',
    date: dateOnly(7),
    worship_type: 'sunday_am',
    memo: '새신자 3명, 찬양팀 7명. 메시지: 하나님은 사랑이시라.',
    is_public: false,
    share_token: null,
    created_at: daysAgo(7),
    updated_at: daysAgo(2),
  },
  {
    id: 'conti-002',
    user_id: 'mock-user',
    title: '2024-12-11 수요 예배',
    date: dateOnly(4),
    worship_type: 'wednesday',
    memo: '수요 소그룹 모임 후. 조용한 분위기.',
    is_public: false,
    share_token: null,
    created_at: daysAgo(4),
    updated_at: daysAgo(1),
  },
  {
    id: 'conti-003',
    user_id: 'mock-user',
    title: '2024-12-15 주일 오전 - 회개주간',
    date: dateOnly(0),
    worship_type: 'sunday_am',
    memo: '회개주간 2일차. 단조 위주로 분위기 전환. 결단의 시간 길게.',
    is_public: true,
    share_token: 'demo-token-001',
    created_at: daysAgo(0),
    updated_at: daysAgo(0),
  },
  {
    id: 'conti-004',
    user_id: 'mock-user',
    title: '2024-12-25 성탄절 특별 예배',
    date: dateOnly(-17),
    worship_type: 'special',
    memo: '성탄절 특별 예배. 밝고 축제 분위기. 특별 찬양 2곡 추가 예정.',
    is_public: false,
    share_token: null,
    created_at: daysAgo(-5),
    updated_at: daysAgo(-2),
  },
]

export const SAMPLE_CONTI_ITEMS: Record<string, ContiItem[]> = {
  'conti-001': contiAItems,
  'conti-002': contiBItems,
  'conti-003': contiCItems,
  'conti-004': contiDItems,
}

export function getSampleContiList(): ContiSet[] {
  return SAMPLE_CONTIS
}

export function getSampleConti(id: string): { conti: ContiSet; items: ContiItem[] } | null {
  const conti = SAMPLE_CONTIS.find((c) => c.id === id)
  if (!conti) return null
  const items = SAMPLE_CONTI_ITEMS[id] || []
  return { conti, items }
}

export function getSampleSongById(id: string): ContiSong | undefined {
  return ALL_SAMPLE_SONGS_BY_ID[id]
}

// =========================================================================
// 샘플 팀/팀원/배정 (Phase 10 — mock 데이터)
// =========================================================================
import type { ContiTeam, ContiTeamMember, ContiAssignment } from '@/types/conti'

export const SAMPLE_TEAMS: ContiTeam[] = [
  {
    id: 'team-001',
    user_id: 'mock-user',
    name: 'Bunker 찬양팀',
    memo: '주일 오전 1교대 전담. 새싹 멤버 환영 🙏',
    created_at: daysAgo(60),
    updated_at: daysAgo(2),
  },
  {
    id: 'team-002',
    user_id: 'mock-user',
    name: 'Bunker 워십팀',
    memo: '수요 예배 + 새벽 예배 전담. 깊이 있는 경배 추구',
    created_at: daysAgo(40),
    updated_at: daysAgo(5),
  },
]

export const SAMPLE_MEMBERS: ContiTeamMember[] = [
  // Bunker 찬양팀
  { id: 'mem-001', team_id: 'team-001', name: '김은혜', email: 'kim@example.com', primary_role: 'leader',   color: 'amber',   joined_at: daysAgo(60) },
  { id: 'mem-002', team_id: 'team-001', name: '이찬양', email: 'lee@example.com', primary_role: 'keyboard', color: 'indigo',  joined_at: daysAgo(55) },
  { id: 'mem-003', team_id: 'team-001', name: '박드럼', email: null,               primary_role: 'drum',     color: 'rose',    joined_at: daysAgo(50) },
  { id: 'mem-004', team_id: 'team-001', name: '최기타', email: 'choi@example.com', primary_role: 'guitar',   color: 'emerald', joined_at: daysAgo(45) },
  { id: 'mem-005', team_id: 'team-001', name: '정베이', email: null,               primary_role: 'bass',     color: 'orange',  joined_at: daysAgo(40) },
  { id: 'mem-006', team_id: 'team-001', name: '강성음', email: 'kang@example.com', primary_role: 'vocal1',   color: 'sky',     joined_at: daysAgo(35) },
  { id: 'mem-007', team_id: 'team-001', name: '윤소리', email: null,               primary_role: 'vocal2',   color: 'cyan',    joined_at: daysAgo(20) },

  // Bunker 워십팀
  { id: 'mem-101', team_id: 'team-002', name: '정경배', email: 'jw@example.com',  primary_role: 'leader',   color: 'amber',   joined_at: daysAgo(40) },
  { id: 'mem-102', team_id: 'team-002', name: '한음악', email: null,              primary_role: 'keyboard', color: 'indigo',  joined_at: daysAgo(35) },
  { id: 'mem-103', team_id: 'team-002', name: '오드럼', email: null,              primary_role: 'drum',     color: 'rose',    joined_at: daysAgo(30) },
  { id: 'mem-104', team_id: 'team-002', name: '신피아', email: 'shin@example.com',primary_role: 'etc',      color: 'pink',    joined_at: daysAgo(15) },
]

// conti-001 (주일 오전) 배정
export const SAMPLE_ASSIGNMENTS: ContiAssignment[] = [
  // conti-001: Bunker 찬양팀
  { id: 'as-001', conti_id: 'conti-001', member_id: 'mem-001', song_position: 0, role: 'leader', note: '' },
  { id: 'as-002', conti_id: 'conti-001', member_id: 'mem-002', song_position: 0, role: 'keyboard', note: '리허설 8:30' },
  { id: 'as-003', conti_id: 'conti-001', member_id: 'mem-003', song_position: 0, role: 'drum', note: '' },
  { id: 'as-004', conti_id: 'conti-001', member_id: 'mem-004', song_position: 0, role: 'guitar', note: '' },
  { id: 'as-005', conti_id: 'conti-001', member_id: 'mem-005', song_position: 0, role: 'bass', note: '' },
  { id: 'as-006', conti_id: 'conti-001', member_id: 'mem-006', song_position: 0, role: 'vocal1', note: '1번 메인' },
  { id: 'as-007', conti_id: 'conti-001', member_id: 'mem-007', song_position: 0, role: 'vocal2', note: '2~5번 메인' },

  // 곡별 특별 배정 (1번 곡 = 인도자만)
  { id: 'as-101', conti_id: 'conti-001', member_id: 'mem-001', song_position: 1, role: 'leader', note: '1절 후 큐' },
  { id: 'as-102', conti_id: 'conti-001', member_id: 'mem-001', song_position: 2, role: 'leader', note: 'BPM 다운' },
  { id: 'as-103', conti_id: 'conti-001', member_id: 'mem-001', song_position: 5, role: 'leader', note: '클라이맥스' },

  // conti-003: Bunker 워십팀
  { id: 'as-201', conti_id: 'conti-003', member_id: 'mem-101', song_position: 0, role: 'leader', note: '' },
  { id: 'as-202', conti_id: 'conti-003', member_id: 'mem-102', song_position: 0, role: 'keyboard', note: '' },
  { id: 'as-203', conti_id: 'conti-003', member_id: 'mem-103', song_position: 0, role: 'drum', note: '' },
  { id: 'as-204', conti_id: 'conti-003', member_id: 'mem-104', song_position: 0, role: 'etc', note: '팀폰 담당' },
]

export function getSampleTeams(): ContiTeam[] {
  return SAMPLE_TEAMS
}

export function getSampleMembersByTeam(teamId: string): ContiTeamMember[] {
  return SAMPLE_MEMBERS.filter((m) => m.team_id === teamId)
}

export function getSampleMembers(): ContiTeamMember[] {
  return SAMPLE_MEMBERS
}

export function getSampleAssignmentsByConti(contiId: string): ContiAssignment[] {
  return SAMPLE_ASSIGNMENTS.filter((a) => a.conti_id === contiId)
}

export function getSampleMemberById(id: string): ContiTeamMember | undefined {
  return SAMPLE_MEMBERS.find((m) => m.id === id)
}

export function getSampleTeamById(id: string): ContiTeam | undefined {
  return SAMPLE_TEAMS.find((t) => t.id === id)
}
