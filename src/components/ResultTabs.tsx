'use client'

interface Tab {
  id: string
  label: string
}

interface Props {
  tabs: Tab[]
  activeTab: string
  onChange: (id: string) => void
}

export default function ResultTabs({ tabs, activeTab, onChange }: Props) {
  return (
    <div className="flex gap-1 overflow-x-auto overflow-y-hidden rounded-xl bg-white border border-[#e4e2dd] p-1 -mx-1 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`relative px-3.5 sm:px-4 py-2 text-[13px] sm:text-[14px] font-medium whitespace-nowrap transition-all duration-200 rounded-lg shrink-0 ${
              isActive
                ? 'bg-[#2c2a29] text-white shadow-sm'
                : 'text-[#6b6764] hover:text-[#2c2a29] hover:bg-[#f5f4f0]'
            }`}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
