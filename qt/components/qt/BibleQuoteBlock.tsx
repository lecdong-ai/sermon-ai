interface BibleQuoteBlockProps {
  text: string
  reference?: string
}

export function BibleQuoteBlock({ text, reference }: BibleQuoteBlockProps) {
  if (!text) return null

  return (
    <div className="my-10 px-6 sm:px-8 py-8 sm:py-10 rounded-xl bg-accent-soft/70 border border-accent-muted/30 shadow-sm">
      <p className="font-serif text-h3-plus leading-relaxed text-foreground">
        &ldquo;{text}&rdquo;
      </p>
      {reference && (
        <p className="font-serif text-meta text-accent mt-4 text-right">
          {reference}
        </p>
      )}
    </div>
  )
}
