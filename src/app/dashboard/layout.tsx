import Sidebar from '@/components/dashboard/Sidebar'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import { AppProvider } from '@/lib/dashboard/store'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <div className="flex h-screen bg-[#050814]">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto p-6 bg-[#050814] text-slate-200 relative">
            {/* 배경 글로우 효과 */}
            <div className="absolute inset-x-0 top-0 h-[600px] pointer-events-none overflow-hidden z-0 bg-radial-glow opacity-40" />
            <div className="relative z-10">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AppProvider>
  )
}
