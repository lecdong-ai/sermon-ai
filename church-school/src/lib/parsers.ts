const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB

export interface ParseResult {
  text: string
  fileName: string
  fileSize: number
}

export interface ParseError {
  error: string
  warning?: string
}

export function validateFile(file: File): ParseError | null {
  if (file.size > MAX_FILE_SIZE) {
    return { error: `파일 크기가 20MB를 초과합니다. (${(file.size / 1024 / 1024).toFixed(1)}MB)` }
  }

  const ext = file.name.split('.').pop()?.toLowerCase()

  if (ext === 'doc') {
    return {
      error: '.doc 파일은 호환성 문제로 직접 읽을 수 없습니다.',
      warning: '.docx로 변환 후 업로드해주세요. (MS Word에서 "다른 이름으로 저장" → .docx)',
    }
  }

  if (!ext || !['txt', 'pdf', 'docx'].includes(ext)) {
    return { error: '지원하지 않는 파일 형식입니다. (txt, pdf, docx만 가능)' }
  }

  return null
}

export async function parseFile(file: File): Promise<ParseResult> {
  const ext = file.name.split('.').pop()?.toLowerCase()
  let text = ''

  if (ext === 'txt') {
    text = await file.text()
  } else if (ext === 'pdf') {
    const pdfParse = (await import('pdf-parse')).default
    const buffer = Buffer.from(await file.arrayBuffer())
    const pdf = await pdfParse(buffer)
    text = pdf.text
  } else if (ext === 'docx') {
    const mammoth = await import('mammoth')
    const arrayBuffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer })
    text = result.value
  }

  const trimmed = text.trim()
  if (!trimmed) {
    throw new Error('파일에서 텍스트를 추출할 수 없습니다. 파일이 비어 있거나 읽을 수 없는 형식입니다.')
  }

  return { text: trimmed, fileName: file.name, fileSize: file.size }
}
