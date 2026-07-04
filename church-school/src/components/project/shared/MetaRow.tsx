export default function MetaRow({ label, value, href, onClick }: {
  label: string
  value: string
  href?: string
  onClick?: () => void
}) {
  const isLink = !!(href || onClick)
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-paper-400 shrink-0 w-14">{label}</span>
      {isLink ? (
        <button
          onClick={onClick}
          className="text-[11px] text-green-600 hover:text-green-500 hover:underline truncate transition-colors"
        >
          {value}
        </button>
      ) : (
        <span className="text-[11px] text-paper-700 truncate">{value}</span>
      )}
    </div>
  )
}
