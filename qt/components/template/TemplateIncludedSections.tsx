import { Check } from 'lucide-react'

interface TemplateIncludedSectionsProps {
  sections: string[]
}

export function TemplateIncludedSections({
  sections,
}: TemplateIncludedSectionsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {sections.map((section, i) => (
        <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-surface-2">
          <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
          <span className="text-sm text-foreground">{section}</span>
        </div>
      ))}
    </div>
  )
}
