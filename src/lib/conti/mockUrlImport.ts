// URL → 곡 메타 추출 (mock 시뮬레이션)
// 실제 구현 시 YouTube oEmbed, OpenAI, 또는 직접 스크래핑 사용

import type { ContiSong, MoodTag, MusicKey, SongCategory, SongSource } from '@/types/conti'

export interface UrlExtractionInput {
  url: string
}

export interface UrlExtractionResult {
  title: string
  artist: string | null
  original_key: MusicKey
  bpm: number
  duration_sec: number
  lyrics: string
  chords: string
  tags: MoodTag[]
  category: SongCategory
  youtube_id: string | null
  source: SongSource
  url: string
}

// YouTube URL 패턴에서 video ID 추출
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ]
  for (const pat of patterns) {
    const m = url.match(pat)
    if (m) return m[1]
  }
  return null
}

// YouTube mock 데이터 (실제로는 oEmbed API 호출)
const YT_SAMPLES: Array<Omit<UrlExtractionResult, 'source' | 'url' | 'youtube_id'>> = [
  {
    title: '은혜의 강가',
    artist: '찬양위원회',
    original_key: 'C',
    bpm: 80,
    duration_sec: 260,
    lyrics: '은혜의 강가에 나 서 있다\n주님의 사랑 내가 맛보네\n\n변하지 않으리 영원히\n주님의 사랑 영원토록',
    chords: 'C - G - Am - F\nC - G - F - C\n\nF - C - G - Am\nF - G - C',
    tags: ['은혜', '찬양'],
    category: 'CCM',
  },
  {
    title: '주님의 품에',
    artist: '워십 밴드',
    original_key: 'Ab',
    bpm: 72,
    duration_sec: 290,
    lyrics: '주님의 품에 안기고 싶네\n이 세상 모든 짐을 내려놓고\n\n주님만이 나의 안식\n주님 안에서 쉬리라',
    chords: 'Ab - Eb - Fm - Db\nAb - Eb - Db - Ab\n\nDb - Ab - Eb - Fm\nDb - Eb - Ab',
    tags: ['위로', '은혜', '경배'],
    category: '워십',
  },
  {
    title: '할렐루야 축제',
    artist: '크리스마스 합창',
    original_key: 'G',
    bpm: 124,
    duration_sec: 220,
    lyrics: '할렐루야 할렐루야\n우리 함께 주님 찬양해\n할렐루야 할렐루야\n주님 이름 영광 받으소서',
    chords: 'G - D/F# - Em - C\nG - D - C - G\n\nC - G - D - Em\nC - D - G',
    tags: ['찬양', '축제'],
    category: 'CCM',
  },
]

// 일반 URL mock 데이터
const URL_SAMPLES: Array<Omit<UrlExtractionResult, 'source' | 'url' | 'youtube_id'>> = [
  {
    title: '심판의 날 다가오니',
    artist: '대림절 찬양',
    original_key: 'Em',
    bpm: 76,
    duration_sec: 250,
    lyrics: '심판의 날 다가오니\n우리 무엇으로 맞으리\n\n겸손히 주님 앞에 서리\n은혜로 이 자리에 서리',
    chords: 'Em - Bm - C - G\nEm - Bm - Am - Em\n\nC - G - D - Am\nB7 - Em',
    tags: ['회개', '고백'],
    category: '찬송가',
  },
]

export async function mockExtractFromUrl(
  input: UrlExtractionInput,
): Promise<UrlExtractionResult> {
  await new Promise((resolve) => setTimeout(resolve, 1200))

  const ytId = extractYouTubeId(input.url)
  const isYouTube = !!ytId

  const base = isYouTube
    ? YT_SAMPLES[Math.floor(Math.random() * YT_SAMPLES.length)]
    : URL_SAMPLES[Math.floor(Math.random() * URL_SAMPLES.length)]

  return {
    ...base,
    source: 'url',
    url: input.url,
    youtube_id: ytId,
  }
}

export function makeMockSongFromUrl(
  extraction: UrlExtractionResult,
  userId: string = 'mock-user',
): Omit<ContiSong, 'id'> & { id: string } {
  const now = new Date().toISOString()
  return {
    id: `usr-url-${Date.now()}`,
    user_id: userId,
    title: extraction.title,
    artist: extraction.artist,
    original_key: extraction.original_key,
    bpm: extraction.bpm,
    duration_sec: extraction.duration_sec,
    lyrics: extraction.lyrics,
    chords: extraction.chords,
    tags: extraction.tags,
    category: extraction.category,
    source: extraction.source,
    youtube_url: extraction.youtube_id
      ? `https://www.youtube.com/watch?v=${extraction.youtube_id}`
      : extraction.url,
    created_at: now,
    updated_at: now,
  }
}
