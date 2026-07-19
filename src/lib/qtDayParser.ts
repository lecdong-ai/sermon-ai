export interface ParsedDay {
  title: string
  passage: string
  passageOverview: string
  slowReading: string
  observation: string
  originalWords: string
  englishWords: string
  understanding: string
  gospel: string
  reflection: string
  application: string
  englishVerse: string
  community: string
  prayer: string
  oneLine: string
  leaderGuide: string
  extras: string
}

export interface DayParseResult {
  days: ParsedDay[]
  rawSections: string[]
}

const SECTION_HEADERS: [RegExp, keyof ParsedDay][] = [
  [/(?:#+|\*{1,2})\s*(?:\d+[\.\)]\s*)?제목\s*[:*]?/i, 'title'],
  [/(?:#+|\*{1,2})\s*(?:\d+[\.\)]\s*)?오늘의\s*본문\s*[:*]?/i, 'passage'],
  [/(?:#+|\*{1,2})\s*(?:\d+[\.\)]\s*)?본문\s*한눈에\s*[:*]?/i, 'passageOverview'],
  [/(?:#+|\*{1,2})\s*(?:\d+[\.\)]\s*)?천천히\s*읽기\s*[:*]?/i, 'slowReading'],
  [/(?:#+|\*{1,2})\s*(?:\d+[\.\)]\s*)?본문\s*관찰하기\s*[:*]?/i, 'observation'],
  [/(?:#+|\*{1,2})\s*(?:\d+[\.\)]\s*)?원어\s*핵심단어\s*[:*]?/i, 'originalWords'],
  [/(?:#+|\*{1,2})\s*(?:\d+[\.\)]\s*)?영어\s*핵심단어\s*[:*]?/i, 'englishWords'],
  [/(?:#+|\*{1,2})\s*(?:\d+[\.\)]\s*)?말씀\s*이해하기\s*[:*]?/i, 'understanding'],
  [/(?:#+|\*{1,2})\s*(?:\d+[\.\)]\s*)?복음으로\s*보기\s*[:*]?/i, 'gospel'],
  [/(?:#+|\*{1,2})\s*(?:\d+[\.\)]\s*)?나를\s*비추어\s*보기(?:\s*\(.*?\))?\s*[:*]?/i, 'reflection'],
  [/(?:#+|\*{1,2})\s*(?:\d+[\.\)]\s*)?오늘의\s*적용(?:\s*\(.*?\))?\s*[:*]?/i, 'application'],
  [/(?:#+|\*{1,2})\s*(?:\d+[\.\)]\s*)?영어로\s*붙드는\s*말씀\s*[:*]?/i, 'englishVerse'],
  [/(?:#+|\*{1,2})\s*(?:\d+[\.\)]\s*)?공동체\s*연결\s*[:*]?/i, 'community'],
  [/(?:#+|\*{1,2})\s*(?:\d+[\.\)]\s*)?오늘의\s*기도\s*[:*]?/i, 'prayer'],
  [/(?:#+|\*{1,2})\s*(?:\d+[\.\)]\s*)?한\s*줄\s*기록\s*[:*]?/i, 'oneLine'],
  [/(?:#+|\*{1,2})\s*(?:\d+[\.\)]\s*)?인도자\s*메모\s*[:*]?/i, 'leaderGuide'],
]

function detectSection(line: string): keyof ParsedDay | null {
  const trimmed = line.trim()
  if (!trimmed) return null
  for (const [pattern, key] of SECTION_HEADERS) {
    if (pattern.test(trimmed)) return key
  }
  return null
}

export function parseDays(fullManuscript: string): DayParseResult {
  const lines = fullManuscript.split('\n')
  const dayBlocks = splitDayBlocks(lines)
  const days: ParsedDay[] = []
  const rawSections: string[] = []

  for (const block of dayBlocks) {
    const day = parseSingleDay(block)
    if (day) {
      days.push(day)
      rawSections.push(block.join('\n'))
    }
  }

  return { days, rawSections }
}

function splitDayBlocks(lines: string[]): string[][] {
  const blockStarts: number[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (/Day\s*\d+/i.test(line) && !detectSection(line)) {
      blockStarts.push(i)
    }
  }

  if (blockStarts.length === 0) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (/^\d+[\.\)]\s*.*[가-힣]/.test(line) && !detectSection(line) && line.length < 50) {
        blockStarts.push(i)
      }
    }
  }

  if (blockStarts.length === 0) {
    return lines.length > 0 && lines.some(l => l.trim()) ? [lines] : []
  }

  const blocks: string[][] = []
  for (let i = 0; i < blockStarts.length; i++) {
    const start = blockStarts[i]
    const end = i + 1 < blockStarts.length ? blockStarts[i + 1] : lines.length
    blocks.push(lines.slice(start, end))
  }
  return blocks
}

function parseSingleDay(lines: string[]): ParsedDay | null {
  if (lines.length === 0) return null

  const day: ParsedDay = {
    title: '', passage: '', passageOverview: '', slowReading: '',
    observation: '', originalWords: '', englishWords: '', understanding: '',
    gospel: '', reflection: '', application: '', englishVerse: '',
    community: '', prayer: '', oneLine: '', leaderGuide: '', extras: '',
  }

  let currentSection: keyof ParsedDay | null = null
  const sectionBuffer: string[] = []

  function flush() {
    if (currentSection && sectionBuffer.length > 0) {
      const content = sectionBuffer.map(l => l.trim()).filter(Boolean).join('\n')
      if (content) (day as any)[currentSection] = content
    }
  }

  for (const line of lines) {
    const section = detectSection(line)
    if (section) {
      flush()
      currentSection = section
      sectionBuffer.length = 0
      const afterHeader = line.replace(SECTION_HEADERS.find(s => s[1] === section)![0], '').trim()
      if (afterHeader) sectionBuffer.push(afterHeader)
    } else if (currentSection) {
      sectionBuffer.push(line)
    } else {
      // '## 기본 정보' 블록의 불릿 항목(- 제목:, - 본문:, - 성경권: 등) 처리
      const titleBullet = line.match(/^\s*[-*·•]\s*제목\s*[:：]\s*(.+)$/)
      if (titleBullet && !day.title) {
        day.title = titleBullet[1].trim()
        continue
      }
      const passageBullet = line.match(/^\s*[-*·•]\s*본문\s*[:：]\s*(.+)$/)
      if (passageBullet && !day.passage) {
        day.passage = passageBullet[1].trim()
        continue
      }
    }
  }

  flush()

  return day
}
