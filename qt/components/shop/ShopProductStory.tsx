interface ShopProductStoryProps {
  story: string
}

export function ShopProductStory({ story }: ShopProductStoryProps) {
  if (!story) return null

  const lines = story.split('\n')
  const elements: React.ReactNode[] = []
  let key = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={key++} className="font-serif text-h2 text-foreground mt-8 mb-3">
          {line.slice(3)}
        </h2>
      )
      continue
    }
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={key++} className="font-serif text-h1 text-foreground mt-8 mb-3">
          {line.slice(2)}
        </h1>
      )
      continue
    }
    if (line.trim() === '') continue

    elements.push(
      <p key={key++} className="text-body-lg text-foreground leading-relaxed mb-4">
        {line}
      </p>
    )
  }

  return (
    <div className="max-w-content mx-auto">{elements}</div>
  )
}
