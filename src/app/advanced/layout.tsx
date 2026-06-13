import AdvancedSidebar from '@/components/advanced/Sidebar'
import AdvancedHeader from '@/components/advanced/Header'

export default function AdvancedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#050814] text-slate-200 -mt-16 relative">
      {/* 백그라운드 빛 효과 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-indigo-500/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full bg-purple-500/5 blur-[120px]" />
      </div>

      <div className="relative z-10 flex w-full h-full">
        <AdvancedSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <AdvancedHeader />
          <main className="flex-1 overflow-y-auto bg-[#080d22]/30 backdrop-blur-sm relative scrollbar-thin">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
