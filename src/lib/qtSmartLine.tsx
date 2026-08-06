import React from 'react'

/**
 * Split combined inline sections like "의미: ... 묵상: ..." or "[의미] ... [예문] ..." into separate lines.
 */
export function preprocessSmartText(text: string): string[] {
  if (!text) return []

  const rawLines = text.split('\n')
  const processedLines: string[] = []

  for (const line of rawLines) {
    if (!line.trim()) {
      processedLines.push('')
      continue
    }

    // Split inline sub-headers like "묵상:", "예문:", "적용:", "[묵상]", "[예문]", "[적용]" if preceded by text
    const inlineMarkerRegex = /(?<=\S\s*)(?=(?:의미|묵상|예문|적용|기도|질문|참고):\s*|\[(?:의미|묵상|예문|적용|기도|질문|참고)\])/g
    const splitParts = line.split(inlineMarkerRegex)

    for (const part of splitParts) {
      if (part.trim()) {
        processedLines.push(part.trim())
      }
    }
  }

  return processedLines
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
