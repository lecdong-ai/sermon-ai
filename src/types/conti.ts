// ─── 콘티 (예배 찬양 세트) 관련 타입 ───

// 음악 키 (한국 교회 실용 키)
export type MusicKey =
  | 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B'
  | 'Db' | 'Eb' | 'F#' | 'Ab' | 'Bb' | 'C#'
  | 'Cm' | 'Dm' | 'Em' | 'Fm' | 'Gm' | 'Am' | 'Bm'
  | 'Cmaj' | 'Gmaj' | 'Dmaj' | 'Amaj' | 'Emaj' | 'Bmaj' | 'Fmaj'

// 분위기/장르 태그
export type MoodTag =
  | '은혜'      // grace
  | '경배'      // worship
  | '찬양'      // praise
  | '회개'      // repentance
  | '축제'      // celebration
  | '축복'      // blessing
  | '말씀'      // word
  | '고백'      // confession
  | '선교'      // missions
  | '위로'      // comfort
  | '소망'      // hope
  | '감사'      // thanksgiving
  | '사랑'      // love
  | '결단'      // decision

export type SongCategory = 'CCM' | '워십' | '찬송가' | '기타'

export type SongSource = 'system' | 'manual' | 'image' | 'url' | 'pdf' | 'voice'

// ─── 곡 (Song) ───
export interface ContiSong {
  id: string
  user_id: string | null            // null = 시스템 곡
  title: string
  artist: string | null
  original_key: MusicKey | null
  bpm: number | null
  duration_sec: number | null
  lyrics: string | null             // 줄바꿈 구분
  chords: string | null             // 줄바꿈 구분, 메타만 (저작권 회피)
  tags: MoodTag[]
  category: SongCategory
  source: SongSource
  youtube_url: string | null
  created_at: string
  updated_at: string
}

// 곡 요약 (사이드바/목록용)
export interface ContiSongListItem {
  id: string
  title: string
  artist: string | null
  original_key: MusicKey | null
  bpm: number | null
  duration_sec: number | null
  tags: MoodTag[]
  category: SongCategory
  source: SongSource
  is_system: boolean
}

// ─── 콘티 (Conti Set) ───
export type WorshipType = 'sunday_am' | 'sunday_pm' | 'wednesday' | 'dawn' | 'special'

export interface WorshipTypeMeta {
  key: WorshipType
  label: string
  short: string
  color: string      // tailwind bg/text class
}

export const WORSHIP_TYPE_META: Record<WorshipType, WorshipTypeMeta> = {
  sunday_am:  { key: 'sunday_am',  label: '주일 오전', short: '주오', color: 'amber' },
  sunday_pm:  { key: 'sunday_pm',  label: '주일 오후', short: '주오', color: 'orange' },
  wednesday:  { key: 'wednesday',  label: '수요 예배', short: '수',   color: 'emerald' },
  dawn:       { key: 'dawn',       label: '새벽 예배', short: '새벽', color: 'indigo' },
  special:    { key: 'special',    label: '특별 예배', short: '특별', color: 'rose' },
}

export interface ContiSet {
  id: string
  user_id: string
  title: string
  date: string | null               // YYYY-MM-DD
  worship_type: WorshipType
  memo: string
  is_public: boolean
  share_token: string | null
  created_at: string
  updated_at: string
}

// 콘티에 배치된 곡 (순서, key/BPM 오버라이드, 메모)
export interface ContiItem {
  id: string
  conti_id: string
  song_id: string
  position: number                  // 1부터 시작
  key: MusicKey | null              // null = 곡의 원키 사용
  bpm_override: number | null
  transition_memo: string           // 곡간 전환 메모
  memo: string                      // 곡별 메모
  // 확장용 (join 시 채워짐)
  song?: ContiSong
}

// ─── 콘티 상세 응답 (API/Storage) ───
export interface ContiDetail {
  conti: ContiSet
  items: ContiItem[]
  total_duration_sec: number
  average_bpm: number
  mood_distribution: Record<MoodTag, number>
}

// ─── AI 추천 ───
export interface AIRecommendRequest {
  moods: MoodTag[]
  song_count: number                // 3~7
  main_key: MusicKey | null
  tempo_preference?: 'build' | 'consistent' | 'arc'   // 빌드업/일정/시작빠름→중심→느린
}

export interface AIRecommendResult {
  items: Array<{
    song_id: string
    title: string
    artist: string | null
    recommended_key: MusicKey
    recommended_bpm: number
    reason: string
  }>
  overall_reasoning: string
}

// ─── 워크플로우 상태 ───
export type ContiStage = 'draft' | 'in_progress' | 'ready' | 'shared' | 'archived'

// ─── 인쇄 모드 ───
export type PrintMode = 'team' | 'leader' | 'ppt'

export interface PrintModeMeta {
  key: PrintMode
  label: string
  desc: string
  paperSize: 'A4'
  fontSize: number                  // pt
  showTitle: boolean
  showKey: boolean
  showBpm: boolean
  showMemo: boolean
  showLyrics: boolean
  showTransitionMemo: boolean
}

export const PRINT_MODE_META: Record<PrintMode, PrintModeMeta> = {
  team: {
    key: 'team',
    label: '찬양팀용',
    desc: '곡 정보만 (1장)',
    paperSize: 'A4',
    fontSize: 11,
    showTitle: true,
    showKey: true,
    showBpm: true,
    showMemo: false,
    showLyrics: false,
    showTransitionMemo: true,
  },
  leader: {
    key: 'leader',
    label: '인도자용',
    desc: '곡 정보 + 가사 (곡당 1~2장)',
    paperSize: 'A4',
    fontSize: 13,
    showTitle: true,
    showKey: true,
    showBpm: true,
    showMemo: true,
    showLyrics: true,
    showTransitionMemo: true,
  },
  ppt: {
    key: 'ppt',
    label: 'PPT/송출용',
    desc: '가사만 큰 폰트',
    paperSize: 'A4',
    fontSize: 32,
    showTitle: true,
    showKey: false,
    showBpm: false,
    showMemo: false,
    showLyrics: true,
    showTransitionMemo: false,
  },
}

// ─── 팀 관리 ───

// 곡별 역할 (인도자/드럼/키보드/기타/베이스/싱어)
export type MemberRole = 'leader' | 'drum' | 'keyboard' | 'guitar' | 'bass' | 'vocal1' | 'vocal2' | 'etc'

export const MEMBER_ROLE_META: Record<MemberRole, {
  label: string
  short: string
  color: string
  icon: string                     // emoji
}> = {
  leader:   { label: '인도자',  short: '인도', color: 'amber',   icon: '🎤' },
  drum:     { label: '드럼',    short: '드럼', color: 'rose',    icon: '🥁' },
  keyboard: { label: '키보드',  short: '키보', color: 'indigo',  icon: '🎹' },
  guitar:   { label: '기타',    short: '기타', color: 'emerald', icon: '🎸' },
  bass:     { label: '베이스',  short: '베이', color: 'orange',  icon: '🎵' },
  vocal1:   { label: '싱어 1',  short: 'V1',  color: 'sky',     icon: '🎙️' },
  vocal2:   { label: '싱어 2',  short: 'V2',  color: 'cyan',    icon: '🎙️' },
  etc:      { label: '기타',    short: '기타', color: 'slate',   icon: '👤' },
}

export const ALL_MEMBER_ROLES: MemberRole[] = ['leader', 'keyboard', 'guitar', 'bass', 'drum', 'vocal1', 'vocal2', 'etc']

// 팀 (예: "Bunker 찬양팀")
export interface ContiTeam {
  id: string
  user_id: string
  name: string
  memo: string
  created_at: string
  updated_at: string
}

// 팀원
export interface ContiTeamMember {
  id: string
  team_id: string
  name: string
  email: string | null
  primary_role: MemberRole         // 주 역할
  color: string                    // 프로필 색상 (UI용)
  joined_at: string
}

export const MEMBER_COLORS = ['sky', 'emerald', 'amber', 'rose', 'indigo', 'orange', 'cyan', 'pink', 'lime', 'fuchsia']

// 콘티별 곡 역할 배정
export interface ContiAssignment {
  id: string
  conti_id: string
  member_id: string
  song_position: number            // 1부터 시작, 0 = 전체(곡 무관)
  role: MemberRole
  note: string                     // 추가 메모
  // 확장용
  member?: ContiTeamMember
}

// 콘티별 팀원 view (내가 맡은 역할)
export interface MyAssignment {
  conti: ContiSet
  item?: ContiItem                 // null = 전체(곡 무관)
  role: MemberRole
  song_title: string
  note: string
}

// ─── 악보 편집기 ───
export type SheetOrientation = 'portrait' | 'landscape'

export interface SheetProject {
  orientation: SheetOrientation
  pages: SheetPage[]
  uploadedImages: UploadedImage[]
  marginMm: number
}

export interface SheetPage {
  id: string
  elements: CanvasElementData[]
}

export interface UploadedImage {
  id: string
  name: string
  dataUrl?: string     // session-only (not persisted), replaced by IndexedDB blob + object URL
  naturalWidth: number
  naturalHeight: number
}

export interface CanvasElementData {
  id: string
  type: 'image' | 'text'
  x: number
  y: number
  width: number
  height: number
  rotation: number
  text?: string
  fontSize?: number
  imageId?: string
  songId?: string
  cropTop?: number           // 원본 이미지 상단에서 잘라낼 px (overflow hidden)
  cropBottom?: number        // 하단에서 잘라낼 px
  splitMarkers?: number[]    // 분할 마커 위치들 (0-100, 이미지 기준 %)
}
