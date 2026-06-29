// 사진 한 장 → 곡 메타 추출 (mock 시뮬레이션)
// 실제 구현 시 OpenAI Vision API (gpt-5.4-mini) 사용 예정

import type { ContiSong, MoodTag, MusicKey, SongCategory, SongSource } from '@/types/conti'

export interface VisionExtractionInput {
  file: File
  fileName: string
}

export interface VisionExtractionResult {
  // 추출된 메타
  title: string
  artist: string | null
  original_key: MusicKey
  bpm: number
  duration_sec: number
  lyrics: string
  chords: string
  tags: MoodTag[]
  category: SongCategory
  confidence: number                // 0~1
  // 원본 정보
  source: SongSource
  original_filename: string
}

// 시스템에 시드된 곡들 중 무작위로 골라 "사진에서 추출된 것처럼" 흉내
// (실제로는 파일을 Vision API 에 보내 추출)
const FAKE_SAMPLES: Array<Omit<VisionExtractionResult, 'source' | 'original_filename' | 'confidence'>> = [
  {
    title: '주님만이 나의 길',
    artist: '자체 악보',
    original_key: 'G',
    bpm: 72,
    duration_sec: 250,
    lyrics: '주님만이 나의 길이시네\n어디로 가든지 주님과 함께\n\n고난 중에도 두려움 없네\n주님이 함께 하시니',
    chords: 'G - D/F# - Em - C\nG - D - C - G\n\nC - G - D - Em\nC - D - G',
    tags: ['은혜', '경배'],
    category: 'CCM',
  },
  {
    title: '주의 임재 안에서',
    artist: '큐티 모임',
    original_key: 'Eb',
    bpm: 64,
    duration_sec: 290,
    lyrics: '주의 임재 안에서\n내 영혼 쉬어 가네\n\n모든 짐을 내려놓고\n주님의 품에 안기네',
    chords: 'Eb - Bb/D - Cm - Gm\nEb - Bb - Gm - Eb\n\nBb - Eb - Cm - Fm7\nBb - Gm - Eb',
    tags: ['은혜', '위로', '경배'],
    category: '워십',
  },
  {
    title: '나의 모든 삶의 주인',
    artist: '소그룹 찬양',
    original_key: 'D',
    bpm: 88,
    duration_sec: 230,
    lyrics: '나의 모든 삶의 주인은\n오직 주님이시네\n\n주님의 뜻대로 살아가리\n영원히 주님과 함께',
    chords: 'D - A/C# - Bm - G\nD - A - G - D',
    tags: ['결단', '찬양'],
    category: 'CCM',
  },
  {
    title: '내 주를 가까이',
    artist: '새벽기도 찬양',
    original_key: 'F',
    bpm: 70,
    duration_sec: 270,
    lyrics: '내 주를 가까이 하게 하소서\n주의 음성을 들을 수 있게\n\n세상의 소란 속에서도\n주님의 음성만 들리게',
    chords: 'F - Bb - C - F\nDm - Am - Bb - C\n\nF - Dm - Bb - C\nBb - C - F',
    tags: ['말씀', '은혜', '경배'],
    category: '워십',
  },
]

// mock 추출: 1.5초 후 랜덤 샘플 + 약간의 변형
export async function mockExtractFromImage(
  input: VisionExtractionInput,
): Promise<VisionExtractionResult> {
  await new Promise((resolve) => setTimeout(resolve, 1500))

  const base = FAKE_SAMPLES[Math.floor(Math.random() * FAKE_SAMPLES.length)]
  const confidence = 0.78 + Math.random() * 0.15   // 0.78~0.93

  return {
    ...base,
    source: 'image',
    original_filename: input.fileName,
    confidence: Math.round(confidence * 100) / 100,
  }
}

// mock 사용자 곡 저장 결과 (전체 Song 객체)
export function makeMockSongFromExtraction(
  extraction: VisionExtractionResult,
  userId: string = 'mock-user',
): Omit<ContiSong, 'id'> & { id: string } {
  const now = new Date().toISOString()
  return {
    id: `usr-vision-${Date.now()}`,
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
    youtube_url: null,
    created_at: now,
    updated_at: now,
  }
}
