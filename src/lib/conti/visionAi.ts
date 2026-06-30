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

export interface ChordPlacement {
  chord: string
  word_index: number
}

export interface VisionExtractionResult {
  title: string
  artist: string | null
  original_key: string | null
  lyrics: string
  chord_data: ChordPlacement[][]
  aligned_preview: string
}

const PROMPT = `You are analyzing a Korean worship sheet music image (찬양 악보).

FIRST: Scan the entire image to find ALL text.

SECOND: Identify the song title, artist, and key signature.

THIRD: Identify the lyrics. Write them EXACTLY as they appear, keeping line breaks. Each line of lyrics is a separate element in the output.

FOURTH: For each line of lyrics, identify every chord symbol that appears ABOVE that line. A chord symbol is a letter like C, G, Am, F, Dm7, G/B, C#m7, F#m, Bb, Eb, Ab, etc.

FIFTH: For each chord, determine which WORD in the lyrics line it is placed above. The word_index is a 0-based index into the words of that lyrics line. Words are separated by spaces.

IMPORTANT RULES:
- Each chord is paired with the word it sits directly above on the sheet music
- If a chord is between two words, assign it to the word it is closest to
- If the line has no chords above it, use an empty array []
- Do NOT include 'NC', 'N.C.', or empty chord markers
- Slash chords like "G/B" are one item
- Sharp/flat chords like "C#", "F#" are one item
- The aligned_preview must use SPACES to align each chord above its word, like:
  D          G           A
  당신은    영광의    왕이십니

Return JSON:
{
  "title": "string",
  "artist": "string or null",
  "original_key": "string or null (e.g. C, G, Am, Dm, F)",
  "lyrics": "string (full lyrics with EXACT line breaks)",
  "chord_data": [
    [
      { "chord": "D", "word_index": 0 },
      { "chord": "G", "word_index": 1 },
      { "chord": "A", "word_index": 2 }
    ],
    [
      { "chord": "Em", "word_index": 0 }
    ],
    []
  ],
  "aligned_preview": "string (monospace-aligned text showing chords above lyrics, for copy-paste)"
}`

export async function extractFromImage(base64Image: string): Promise<VisionExtractionResult> {
  const response = await getOpenAI().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: PROMPT },
      {
        role: 'user',
        content: [
          { type: 'text', text: '이 찬양 악보 이미지를 분석해주세요. 각 코드가 어떤 단어 위에 있는지 word_index로 정확히 알려주세요.' },
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
