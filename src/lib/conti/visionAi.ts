import OpenAI from 'openai'

let _openai: OpenAI | null = null

function getOpenAI(): OpenAI {
  if (!_openai) {
    const key = process.env.OPENAI_API_KEY
    if (!key) throw new Error('OPENAI_API_KEY is not set')
    _openai = new OpenAI({ apiKey: key })
  }
  return _openai
}

export interface VisionChord {
  chord: string
  index: number
}

export interface VisionExtractionResult {
  title: string
  artist: string | null
  original_key: string | null
  lyrics: string
  chords: VisionChord[]
}

const SYSTEM_PROMPT = `You are analyzing a Korean worship sheet music image.

Extract the following from the image:
1. Song title (곡 제목)
2. Artist or composer (작사/작곡가)
3. Original key (조표 — e.g., C, G, D, A, E, F, Bb, Eb, Ab, Db, or minor keys like Am, Em, Dm, etc.)
4. Full lyrics (가사 전체 — Korean text only, preserve line breaks exactly as shown)
5. All chord symbols with their exact character positions in the lyrics

For chords:
- Identify every chord symbol (C, G, Am, F, Dm7, G/B, C#m7, F#m, Bb, Eb, Ab, etc.)
- For each chord, determine which character in the lyrics it is positioned above
- Index is 0-based character position in the lyrics string (spaces and newlines count as characters)
- Be very precise about alignment: look at the vertical position of each chord relative to the lyrics

Return JSON with this exact structure:
{
  "title": "곡 제목",
  "artist": "작사/작곡가 이름" or null,
  "original_key": "C" or null,
  "lyrics": "가사 전체 (줄바꿈 유지)",
  "chords": [
    { "chord": "C", "index": 0 },
    { "chord": "G", "index": 8 }
  ]
}`

export async function extractFromImage(base64Image: string): Promise<VisionExtractionResult> {
  const response = await getOpenAI().chat.completions.create({
    model: 'gpt-5.4-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: [
          { type: 'text', text: '이 찬양 악보 이미지에서 코드와 가사를 추출해주세요.' },
          { type: 'image_url', image_url: { url: base64Image } },
        ] as any,
      },
    ],
    temperature: 0.1,
    max_completion_tokens: 4000,
    response_format: { type: 'json_object' } as any,
  })

  const raw = response.choices[0]?.message?.content
  if (!raw) throw new Error('Vision API 응답이 비어 있습니다.')

  const cleaned = raw.replace(/^```json\s*|```\s*$/g, '').trim()
  return JSON.parse(cleaned) as VisionExtractionResult
}
