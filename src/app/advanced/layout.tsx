import AdvancedSidebar from '@/components/advanced/Sidebar'
import AdvancedHeader from '@/components/advanced/Header'

export default function AdvancedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-paper-100 -mt-16">
      <AdvancedSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdvancedHeader />
        <main className="flex-1 overflow-y-auto bg-paper-50">
          {children}
        </main>
      </div>
    </div>
  )
}
