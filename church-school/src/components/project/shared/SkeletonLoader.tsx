export default function SkeletonLoader({ rows = 3, className }: { rows?: number; className?: string }) {
  return (
    <div className={`space-y-3 ${className || ''}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="animate-pulse flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-paper-200 shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 bg-paper-200 rounded w-3/4" />
            <div className="h-2.5 bg-paper-150 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}
