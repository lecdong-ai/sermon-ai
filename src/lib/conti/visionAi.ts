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

export interface VisionExtractionResult {
  title: string
  artist: string | null
  original_key: string | null
  lyrics: string
  aligned_preview: string
}

const PROMPT = `You are analyzing a Korean worship sheet music image (찬양 악보).

FIRST: Scan the entire image to find ALL text.
SECOND: Identify the song title, artist, and key signature.
THIRD: Identify the lyrics exactly as they appear, preserving line breaks.

FOURTH: Create an "aligned_preview" text that shows chord symbols placed ABOVE their corresponding lyrics using SPACES for alignment. This is the most critical output.

RULES for aligned_preview:
- Use a monospace-like alignment with SPACES
- Each line of chords is followed by its corresponding line of lyrics
- Each chord is positioned directly above the word it belongs to
- Use enough spaces so the chord is centered above its word
- Slash chords like "G/B" are one item
- Sharp/flat chords like "C#", "F#" are one item
- If a line has no chords, include it without a chord line above

Example aligned_preview:
  D                    A             G            Em
  당신은          영광의       왕이십니다

  C                G              Am
  주님의        은혜가        나를

Return JSON:
{
  "title": "string",
  "artist": "string or null",
  "original_key": "string or null (e.g. C, G, Am, Dm, F)",
  "lyrics": "string (full lyrics with EXACT line breaks)",
  "aligned_preview": "string (chord lines interleaved with lyrics lines, aligned with spaces)"
}`

export async function extractFromImage(base64Image: string): Promise<VisionExtractionResult> {
  const response = await getOpenAI().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: PROMPT },
      {
        role: 'user',
        content: [
          { type: 'text', text: '이 찬양 악보 이미지에서 가사와 코드를 추출하고 aligned_preview로 정렬해주세요.' },
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
