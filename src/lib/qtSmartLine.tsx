import React from 'react'

/**
 * Split combined inline sections, clean legacy labels, reorder 묵상 연결 before 예문,
 * strip leading hyphens from subheaders (묵상, 의미, 예문), and convert duplicate "예문" to "의미".
 */
export function preprocessSmartText(text: string): string[] {
  if (!text) return []

  // 1. Label replacement for legacy text & convert double '예문' to '의미' + '예문'
  let cleaned = text
    .replace(/[-*·•]?\s*본문\s*의미\s*&\s*묵상\s*[:：]/gi, '묵상:')
    .replace(/[-*·•]?\s*본문\s*의미\s*&\s*예문\s*[:：]/gi, '의미:')
    .replace(/예문\s*[:：]\s*(.*?)\s*(?=예문\s*[:：])/gi, '의미: $1 ')
    .replace(/^[-*·•]\s*(묵상|예문|의미)\s*[:：]/gim, '$1:')

  const rawLines = cleaned.split('\n')
  
  // Merge orphaned bullet lines (e.g. line containing only "-") with next line
  const mergedLines: string[] = []
  for (let idx = 0; idx < rawLines.length; idx++) {
    const cur = rawLines[idx]
    if (/^\s*[-*·•]\s*$/.test(cur) && idx + 1 < rawLines.length && rawLines[idx + 1].trim()) {
      mergedLines.push(rawLines[idx + 1].trim())
      idx++
    } else {
      mergedLines.push(cur)
    }
  }

  const intermediateLines: string[] = []

  for (const line of mergedLines) {
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
      const meditationContent = next.replace(/^\s*[-*·•]?\s*묵상\s*연결\s*[:：]\s*/i, '').trim()
      finalLines.push(meditationContent)
      finalLines.push(cur.replace(/^[-*·•]\s*/, ''))
      i += 2
      continue
    }

    // Case B: cur is 묵상 연결 and next is 예문 -> Already in order, just strip label from cur
    if (isCurMeditationConn && isNextExample) {
      const meditationContent = cur.replace(/^\s*[-*·•]?\s*묵상\s*연결\s*[:：]\s*/i, '').trim()
      finalLines.push(meditationContent)
      finalLines.push(next.replace(/^[-*·•]\s*/, ''))
      i += 2
      continue
    }

    // Case C: cur is 묵상 연결 standalone -> strip label
    if (isCurMeditationConn) {
      const meditationContent = cur.replace(/^\s*[-*·•]?\s*묵상\s*연결\s*[:：]\s*/i, '').trim()
      finalLines.push(meditationContent)
      i++
      continue
    }

    // Strip leading hyphens for sub-headers like "- 묵상:", "- 예문:", "- 의미:"
    const cleanCur = cur.replace(/^[-*·•]\s*(묵상|예문|의미)\s*[:：]/i, '$1:')
    finalLines.push(cleanCur)
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

  let trimmed = l.trim()

  // 0. Bracketed Sub-headers like "[의미] 내용...", "[묵상] 내용...", "[예문] 내용..."
  const bracketMatch = trimmed.match(/^(?:[-*·•]\s*)?\[(의미|묵상|예문|적용|기도|질문|핵심|원어|참고)\]\s*(.*)$/)
  if (bracketMatch) {
    const subTitle = `[${bracketMatch[1]}]`
    const body = bracketMatch[2]
    return (
      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginTop: '4px', marginBottom: marginBottomStyle || '4px', ...extraStyle }}>
        <span style={{ fontWeight: 800, color: accentColor || '#4f46e5', flexShrink: 0, whiteSpace: 'nowrap' }}>
          {subTitle}
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          {body}
        </span>
      </div>
    )
  }

  // 1. Colon Prefix Title (e.g. "복음이 다시 보여주는 진실: ...", "묵상: ...", "의미: ...", "예문: ...")
  // Strip leading hyphen for subheaders like "- 묵상:", "- 예문:", "- 의미:"
  trimmed = trimmed.replace(/^[-*·•]\s*(묵상|예문|의미)\s*[:：]/i, '$1:')

  const colonIdx = trimmed.indexOf(':')
  if (
    colonIdx > 0 &&
    colonIdx <= 35 &&
    !trimmed.startsWith('http://') &&
    !trimmed.startsWith('https://') &&
    !/\d:\d/.test(trimmed.slice(Math.max(0, colonIdx - 1), colonIdx + 2)) &&
    !/[.,!?]/.test(trimmed.slice(0, colonIdx))
  ) {
    let prefix = trimmed.slice(0, colonIdx + 1).trim()
    const body = trimmed.slice(colonIdx + 1).trim()
    
    // Replace internal spaces in prefix with non-breaking spaces (\u00A0)
    prefix = prefix.replace(/\s+/g, '\u00A0')

    if (body) {
      return (
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: marginBottomStyle || '4px', ...extraStyle }}>
          <span style={{ fontWeight: 700, color: accentColor || 'inherit', flexShrink: 0, whiteSpace: 'nowrap' }}>
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
        <span style={{ fontWeight: 700, color: accentColor || 'inherit', flexShrink: 0, whiteSpace: 'nowrap' }}>
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
