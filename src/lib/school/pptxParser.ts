import JSZip from 'jszip'

export interface ExtractedTheme {
  primary: string
  accent: string
  background: string
  text: string
  fontTitle: string
  fontBody: string
  gradient?: string
}

function extractHex(xml: string, tag: string): string {
  const re = new RegExp(`<a:${tag}[^>]*>.*?<a:srgbClr\\s+val="([^"]+)"`, 'i')
  const m = re.exec(xml)
  if (m) return m[1].toUpperCase()
  const re2 = new RegExp(`<${tag}[^>]*>.*?<a:srgbClr\\s+val="([^"]+)"`, 'i')
  const m2 = re2.exec(xml)
  if (m2) return m2[1].toUpperCase()
  const re3 = new RegExp(`<a:${tag}[^>]*>.*?<a:sysClr[^>]+lastClr="([^"]+)"`, 'i')
  const m3 = re3.exec(xml)
  if (m3) return m3[1].toUpperCase()
  const re4 = new RegExp(`<${tag}[^>]*>.*?<a:sysClr[^>]+lastClr="([^"]+)"`, 'i')
  const m4 = re4.exec(xml)
  if (m4) return m4[1].toUpperCase()
  return ''
}

function extractFont(xml: string, type: string): string {
  const re = new RegExp(`<a:${type}[^>]*>.*?<a:latin\\s+typeface="([^"]+)"`, 'is')
  const m = re.exec(xml)
  if (m) return m[1]
  const re2 = new RegExp(`<${type}[^>]*>.*?<a:latin\\s+typeface="([^"]+)"`, 'is')
  const m2 = re2.exec(xml)
  if (m2) return m2[1]
  return 'Malgun Gothic'
}

export async function extractThemeFromPptx(buffer: ArrayBuffer): Promise<ExtractedTheme> {
  const zip = await JSZip.loadAsync(buffer)
  const themeFiles = Object.keys(zip.files).filter(f =>
    f.startsWith('ppt/theme/') && f.endsWith('.xml')
  )
  if (themeFiles.length === 0) {
    throw new Error('No theme found in .pptx file')
  }

  const xml = await zip.files[themeFiles[0]].async('text')

  const primary = extractHex(xml, 'accent1') || '1B3A5C'
  const accent = extractHex(xml, 'accent2') || '4A90D9'
  const text = extractHex(xml, 'dk1') || '1A1A2E'
  const background = extractHex(xml, 'lt1') || 'FFFFFF'
  const fontTitle = extractFont(xml, 'majorFont')
  const fontBody = extractFont(xml, 'minorFont')

  return {
    primary,
    accent,
    text,
    background,
    fontTitle,
    fontBody,
    gradient: `from-[#${primary}] to-[#${accent}]`,
  }
}
