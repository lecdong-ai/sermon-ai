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

const COT_PROMPT = `You are an expert at reading Korean worship sheet music (찬양 악보).

Step-by-step process:
1. SCAN: Look at the entire image and identify all text regions — title, artist, key signature, lyrics, chord symbols.
2. LOCATE CHORDS: Find every chord written above the lyrics. Korean worship chords use letters like C, G, Am, F, Dm7, G/B, C#m7, F#m, Bb, Eb, Ab etc. They are positioned ABOVE specific syllables.
3. LOCATE LYRICS: Find all Korean lyrics text. Preserve every line break exactly as it appears in the image.
4. ALIGN: For each chord, determine exactly which character it sits above by looking at the vertical position. The index is 0-based in the lyrics string. Spaces and newlines count as characters.
5. EXTRACT METADATA: Find the song title (usually at top), artist/composer, and key signature (조표).

Rules:
- Every chord symbol MUST have its correct 0-based character index in the full lyrics string
- Do NOT invent chords that don't exist in the image
- Do NOT merge chords that are separate (e.g., "C G" is two chords, not "CG")
- If you see 'NC', 'N.C.', or no chord, skip it
- Korean lyrics must be extracted exactly — do not correct spelling or spacing
- Pay special attention to two-syllable chords: C#, F#, G#, D#, A#, and slash chords like G/B, D/F#, C/E
- For duplicate chords on adjacent syllables, each gets its own index entry

Return JSON with this exact structure:
{
  "title": "곡 제목 (string)",
  "artist": "작사/작곡가 이름" or null,
  "original_key": "key signature like C, G, Am, Dm, etc." or null,
  "lyrics": "가사 전체 (줄바꿈 유지, 띄어쓰기 정확히)",
  "chords": [
    { "chord": "C", "index": 0 },
    { "chord": "G", "index": 8 },
    { "chord": "Am", "index": 14 }
  ]
}`

export async function extractFromImage(base64Image: string): Promise<VisionExtractionResult> {
  const response = await getOpenAI().chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: [
          { type: 'text', text: '이 찬양 악보 이미지를 분석해 코드와 가사를 추출해주세요. 악보의 레이아웃을 주의깊게 보고, 가사 위에 적힌 코드를 정확히 매칭해주세요.' },
          { type: 'image_url', image_url: { url: base64Image, detail: 'high' } },
        ] as any,
      },
    ],
    temperature: 0.1,
    max_tokens: 4096,
    response_format: { type: 'json_object' } as any,
  })

  const raw = response.choices[0]?.message?.content
  if (!raw) throw new Error('Vision API 응답이 비어 있습니다.')

  const cleaned = raw.replace(/^```json\s*|```\s*$/g, '').trim()
  return JSON.parse(cleaned) as VisionExtractionResult
}
