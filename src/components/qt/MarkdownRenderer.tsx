interface MarkdownRendererProps {
  content: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) return null

  const lines = content.split('\n')
  const elements: React.ReactNode[] = []
  let key = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Heading
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={key++} className="font-serif text-h2 text-foreground mt-10 mb-4">
          {line.slice(3)}
        </h2>
      )
      continue
    }
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={key++} className="font-serif text-h1 text-foreground mt-10 mb-4">
          {line.slice(2)}
        </h1>
      )
      continue
    }

    // Blockquote
    if (line.startsWith('> ')) {
      const quoteLines: string[] = [line.slice(2)]
      while (i + 1 < lines.length && lines[i + 1].startsWith('> ')) {
        i++
        quoteLines.push(lines[i].slice(2))
      }
      elements.push(
        <blockquote
          key={key++}
          className="border-l-4 border-accent pl-6 my-6 py-2 text-body-lg text-foreground-muted italic font-serif leading-relaxed"
        >
          {quoteLines.map((ql, qi) => (
            <span key={qi}>
              {ql}
              {qi < quoteLines.length - 1 && <br />}
            </span>
          ))}
        </blockquote>
      )
      continue
    }

    // Empty line
    if (line.trim() === '') {
      continue
    }

    // Regular paragraph
    elements.push(
      <p key={key++} className="text-body-lg text-foreground leading-relaxed mb-5">
        {line}
      </p>
    )
  }

  return (
    <div className="max-w-content mx-auto space-y-2">{elements}</div>
  )
}
