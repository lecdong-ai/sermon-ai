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

    // H2 Heading - with decorative accent
    if (line.startsWith('## ')) {
      elements.push(
        <div key={key++} className="mt-14 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-1 h-6 rounded-full bg-gradient-to-b from-accent to-accent/30" />
            <h2 className="font-serif text-xl sm:text-2xl text-foreground font-semibold tracking-tight">
              {line.slice(3)}
            </h2>
          </div>
        </div>
      )
      continue
    }

    // H1 Heading
    if (line.startsWith('# ')) {
      elements.push(
        <div key={key++} className="mt-14 mb-6">
          <h1 className="font-serif text-2xl sm:text-3xl text-foreground font-bold tracking-tight">
            {line.slice(2)}
          </h1>
          <div className="mt-3 w-12 h-[2px] bg-accent/40 rounded-full" />
        </div>
      )
      continue
    }

    // Blockquote - premium styled
    if (line.startsWith('> ')) {
      const quoteLines: string[] = [line.slice(2)]
      while (i + 1 < lines.length && lines[i + 1].startsWith('> ')) {
        i++
        quoteLines.push(lines[i].slice(2))
      }
      elements.push(
        <div key={key++} className="my-8 relative">
          <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-full bg-gradient-to-b from-accent via-accent/60 to-accent/20" />
          <blockquote className="pl-6 sm:pl-8 py-2">
            {quoteLines.map((ql, qi) => (
              <p key={qi} className="font-serif text-base sm:text-lg text-foreground-muted italic leading-relaxed mb-2 last:mb-0">
                {ql}
              </p>
            ))}
          </blockquote>
        </div>
      )
      continue
    }

    // Empty line - paragraph spacing
    if (line.trim() === '') {
      continue
    }

    // Regular paragraph - elegant serif typography
    elements.push(
      <p key={key++} className="font-serif text-base sm:text-[1.125rem] text-foreground/90 leading-[2.0] mb-6 tracking-normal">
        {line}
      </p>
    )
  }

  return (
    <div className="max-w-content mx-auto qt-content font-serif">{elements}</div>
  )
}
