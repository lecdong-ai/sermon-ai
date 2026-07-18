interface ShopSpecsProps {
  specs: Array<{ label: string; value: string }>
}

export function ShopSpecs({ specs }: ShopSpecsProps) {
  if (specs.length === 0) return null

  return (
    <dl className="divide-y divide-border">
      {specs.map((spec, i) => (
        <div key={i} className="flex items-baseline gap-4 py-3 sm:py-4">
          <dt className="text-sm text-foreground-muted w-24 shrink-0">
            {spec.label}
          </dt>
          <dd className="text-sm text-foreground">{spec.value}</dd>
        </div>
      ))}
    </dl>
  )
}
