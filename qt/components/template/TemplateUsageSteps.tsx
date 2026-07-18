interface TemplateUsageStepsProps {
  steps: Array<{
    order: number
    title: string
    description: string
  }>
}

export function TemplateUsageSteps({ steps }: TemplateUsageStepsProps) {
  return (
    <div className="space-y-6">
      {steps.map((step) => (
        <div key={step.order} className="flex gap-5">
          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-foreground text-background text-sm font-medium shrink-0 mt-0.5">
            {step.order}
          </span>
          <div className="space-y-1.5 min-w-0">
            <h3 className="font-serif text-h3 text-foreground">{step.title}</h3>
            <p className="text-body text-foreground-muted leading-relaxed">
              {step.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
