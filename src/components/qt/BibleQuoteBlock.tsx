interface BibleQuoteBlockProps {
  text: string
  reference?: string
}

export function BibleQuoteBlock({ text, reference }: BibleQuoteBlockProps) {
  if (!text) return null

  // Split long bible text into verses for better readability
  const sentences = text.split(/(?<=\.\s)/).filter(s => s.trim())

  return (
    <div className="relative my-14">
      {/* Decorative top border */}
      <div className="absolute -top-px left-1/2 -translate-x-1/2 w-24 h-[3px] rounded-full bg-gradient-to-r from-accent/20 via-accent to-accent/20" />

      <div className="px-6 sm:px-10 py-10 sm:py-12 rounded-2xl bg-gradient-to-br from-accent-soft/60 via-accent-soft/40 to-surface border border-accent-muted/20 shadow-sm">
        {/* Header label */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-5 h-5 rounded-full bg-accent/15 flex items-center justify-center">
            <span className="text-accent text-[10px] font-bold">✦</span>
          </div>
          <p className="text-xs font-medium tracking-[0.15em] uppercase text-accent/80">
            오늘의 본문
          </p>
        </div>

        {/* Bible text - formatted with verse-like line breaks */}
        <div className="space-y-3">
          {sentences.map((sentence, i) => (
            <p key={i} className="font-serif text-base sm:text-lg leading-[1.85] text-foreground/85">
              {sentence.trim()}
            </p>
          ))}
        </div>

        {/* Reference */}
        {reference && (
          <div className="mt-8 flex items-center gap-3">
            <div className="flex-1 h-px bg-accent/15" />
            <p className="font-serif text-sm text-accent font-medium tracking-wide">
              — {reference}
            </p>
          </div>
        )}
      </div>

      {/* Decorative bottom border */}
      <div className="absolute -bottom-px left-1/2 -translate-x-1/2 w-16 h-[2px] rounded-full bg-accent/20" />
    </div>
  )
}
