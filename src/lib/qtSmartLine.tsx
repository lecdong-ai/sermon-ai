import React from 'react'

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
  const colonIdx = trimmed.indexOf(':')

  // 1. Colon Prefix Title (e.g. "복음이 다시 보여주는 진실: ...", "주요 묵상:", "대지 1:")
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
          <span style={{ fontWeight: 700, color: accentColor || 'inherit', flexShrink: 0 }}>
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
