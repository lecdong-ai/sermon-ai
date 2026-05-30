import Sidebar from '@/components/dashboard/Sidebar'
import Header from '@/components/dashboard/Header'
import { AppProvider } from '@/lib/dashboard/store'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 overflow-y-auto p-6 bg-background">
            {children}
          </main>
        </div>
      </div>
    </AppProvider>
  )
}
