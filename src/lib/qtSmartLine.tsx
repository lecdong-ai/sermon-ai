import React from 'react'

/**
 * Split combined inline sections, clean legacy labels, reorder 묵상 연결 before 예문,
 * and strip the "- 묵상 연결:" header label so only its content displays cleanly.
 */
export function preprocessSmartText(text: string): string[] {
  if (!text) return []

  // 1. Label replacement for legacy text
  const cleaned = text
    .replace(/[-*·•]?\s*본문\s*의미\s*&\s*묵상\s*[:：]/gi, '- 묵상:')
    .replace(/[-*·•]?\s*본문\s*의미\s*&\s*예문\s*[:：]/gi, '- 예문:')

  const rawLines = cleaned.split('\n')
  const intermediateLines: string[] = []

  for (const line of rawLines) {
    if (!line.trim()) {
      intermediateLines.push('')
      continue
    }

    // Split inline sub-headers if combined on one line
    const inlineMarkerRegex = /(?<=\S\s*)(?=(?:의미|묵상|예문|적용|기도|질문|참고):\s*|\[(?:의미|묵상|예문|적용|기도|질문|참고)\])/g
    const splitParts = line.split(inlineMarkerRegex)

    for (const part of splitParts) {
      if (part.trim()) {
        intermediateLines.push(part.trim())
      }
    }
  }

  // 2. Reorder (묵상 연결 and 예문) and strip "- 묵상 연결:" label header
  const finalLines: string[] = []
  let i = 0
  while (i < intermediateLines.length) {
    const cur = intermediateLines[i]
    const next = intermediateLines[i + 1]

    const isCurExample = /^\s*[-*·•]?\s*예문\s*[:：]/.test(cur)
    const isCurMeditationConn = /^\s*[-*·•]?\s*묵상\s*연결\s*[:：]/.test(cur)
    const isNextMeditationConn = next && /^\s*[-*·•]?\s*묵상\s*연결\s*[:：]/.test(next)
    const isNextExample = next && /^\s*[-*·•]?\s*예문\s*[:：]/.test(next)

    // Case A: cur is 예문 and next is 묵상 연결 -> Swap!
    if (isCurExample && isNextMeditationConn) {
      const meditationContent = next.replace(/^\s*[-*·•]?\s*묵상\s*연결\s*[:：]\s*/i, '- ').trim()
      finalLines.push(meditationContent)
      finalLines.push(cur)
      i += 2
      continue
    }

    // Case B: cur is 묵상 연결 and next is 예문 -> Already in order, just strip label from cur
    if (isCurMeditationConn && isNextExample) {
      const meditationContent = cur.replace(/^\s*[-*·•]?\s*묵상\s*연결\s*[:：]\s*/i, '- ').trim()
      finalLines.push(meditationContent)
      finalLines.push(next)
      i += 2
      continue
    }

    // Case C: cur is 묵상 연결 standalone -> strip label
    if (isCurMeditationConn) {
      const meditationContent = cur.replace(/^\s*[-*·•]?\s*묵상\s*연결\s*[:：]\s*/i, '- ').trim()
      finalLines.push(meditationContent)
      i++
      continue
    }

    finalLines.push(cur)
    i++
  }

  return finalLines
}

export function renderSmartLine(
  l: string,
  i: number,
  accentColor?: string,
  marginBottomStyle?: string | number,
  extraStyle?: React.CSSProperties
) {
  if (!l || !l.trim()) {
    return <div key={i} style={{ marginBottom: marginBottomStyle || '4px', ...extraStyle }} />
  }

  const trimmed = l.trim()

  // 0. Bracketed Sub-headers like "[의미] 내용...", "[묵상] 내용...", "[예문] 내용..."
  const bracketMatch = trimmed.match(/^\[(의미|묵상|예문|적용|기도|질문|핵심|원어|참고)\]\s*(.*)$/)
  if (bracketMatch) {
    const subTitle = `[${bracketMatch[1]}]`
    const body = bracketMatch[2]
    return (
      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginTop: '4px', marginBottom: marginBottomStyle || '4px', ...extraStyle }}>
        <span style={{ fontWeight: 800, color: accentColor || '#4f46e5', flexShrink: 0 }} className="whitespace-nowrap">
          {subTitle}
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          {body}
        </span>
      </div>
    )
  }

  // 1. Colon Prefix Title (e.g. "복음이 다시 보여주는 진실: ...", "의미: ...", "묵상: ...", "예문: ...")
  const colonIdx = trimmed.indexOf(':')
  if (
    colonIdx > 0 &&
    colonIdx <= 35 &&
    !trimmed.startsWith('http://') &&
    !trimmed.startsWith('https://') &&
    !/\d:\d/.test(trimmed.slice(Math.max(0, colonIdx - 1), colonIdx + 2)) &&
    !/[.,!?]/.test(trimmed.slice(0, colonIdx))
  ) {
    const prefix = trimmed.slice(0, colonIdx + 1).trim()
    const body = trimmed.slice(colonIdx + 1).trim()
    if (body) {
      return (
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: marginBottomStyle || '4px', ...extraStyle }}>
          <span style={{ fontWeight: 700, color: accentColor || 'inherit', flexShrink: 0 }} className="whitespace-nowrap">
            {prefix}
          </span>
          <span style={{ flex: 1, minWidth: 0 }}>
            {body}
          </span>
        </div>
      )
    }
  }

  // 2. Numbered or Bulleted list (e.g. "1. ", "① ", "• ", "- ")
  const listMatch = trimmed.match(/^([0-9]+\.|\([0-9]+\)|[①-⑨]|[•\-*])\s+(.*)$/)
  if (listMatch) {
    const bullet = listMatch[1]
    const body = listMatch[2]
    return (
      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: marginBottomStyle || '4px', ...extraStyle }}>
        <span style={{ fontWeight: 700, color: accentColor || 'inherit', flexShrink: 0 }}>
          {bullet}
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          {body}
        </span>
      </div>
    )
  }

  // 3. Standard line
  return (
    <div key={i} style={{ marginBottom: marginBottomStyle || '4px', ...extraStyle }}>
      {l}
    </div>
  )
}
