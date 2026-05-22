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
    <div className="flex gap-1 overflow-x-auto overflow-y-hidden rounded-xl bg-white border border-[#e5e8eb] p-1 -mx-1 shadow-sm">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`relative px-3.5 sm:px-4 py-2.5 text-[14px] sm:text-[15px] font-medium whitespace-nowrap transition-all duration-200 rounded-lg shrink-0 ${
              isActive
                ? 'bg-primary-500 text-white shadow-sm'
                : 'text-[#4e5968] hover:text-primary-600 hover:bg-primary-50'
            }`}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
